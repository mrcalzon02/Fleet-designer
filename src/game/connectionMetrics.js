import { templateById } from './layoutTemplates.js';
import { componentNodeLibrary } from './nodeLibrary.js';
import { exactPortForNode, portForNode } from './nodePortRules.js';

function nodeById(nodeId) {
  return componentNodeLibrary.find((node) => node.id === nodeId);
}

function placementForNode(blueprint, nodeId) {
  return (blueprint.placements ?? []).find((placement) => placement.nodeId === nodeId);
}

export function placedCellsForBlueprint(blueprint) {
  const cells = [];
  for (const placement of blueprint.placements ?? []) {
    const node = nodeById(placement.nodeId);
    if (!node) continue;
    for (let rowIndex = 0; rowIndex < (node.shape ?? []).length; rowIndex += 1) {
      const row = node.shape[rowIndex];
      for (let colIndex = 0; colIndex < row.length; colIndex += 1) {
        if (row[colIndex] !== 'X') continue;
        cells.push({ nodeId: node.id, x: placement.x + colIndex, y: placement.y + rowIndex });
      }
    }
  }
  return cells;
}

function cellsForNode(blueprint, nodeId) {
  return placedCellsForBlueprint(blueprint).filter((cell) => cell.nodeId === nodeId);
}

function edgeFallbackAnchor(blueprint, nodeId, direction, portIndex = 0) {
  const cells = cellsForNode(blueprint, nodeId);
  if (cells.length === 0) return null;

  const targetX = direction === 'output'
    ? Math.max(...cells.map((cell) => cell.x))
    : Math.min(...cells.map((cell) => cell.x));

  const candidates = cells
    .filter((cell) => cell.x === targetX)
    .sort((a, b) => a.y - b.y || a.x - b.x);

  const selected = candidates[Math.abs(portIndex) % candidates.length] ?? candidates[0];
  return selected ? { ...selected, direction, portId: `${direction}-fallback-${portIndex}`, source: 'edge-fallback' } : null;
}

function pickPortAnchor(blueprint, nodeId, direction, portRef = 0) {
  const node = nodeById(nodeId);
  const placement = placementForNode(blueprint, nodeId);
  if (!node || !placement) return { anchor: null, issue: `missing ${nodeId} placement or node` };
  const kind = direction === 'output' ? 'output' : 'input';
  const facing = placement.facing ?? 'east';
  const exact = exactPortForNode(node, kind, facing, portRef);
  const authoredPort = exact.port ?? portForNode(node, kind, facing, portRef);
  if (!authoredPort) {
    const fallback = edgeFallbackAnchor(blueprint, nodeId, direction, portRef);
    return { anchor: fallback, issue: exact.reason };
  }
  return {
    anchor: {
      nodeId,
      x: placement.x + authoredPort.x,
      y: placement.y + authoredPort.y,
      direction,
      role: kind,
      portId: authoredPort.id,
      side: authoredPort.side,
      facing,
      source: exact.found ? 'authored-port' : 'authored-fallback',
    },
    issue: exact.found ? null : exact.reason,
  };
}

function distanceBetween(fromCell, toCell) {
  if (!fromCell || !toCell) return null;
  return Math.abs(fromCell.x - toCell.x) + Math.abs(fromCell.y - toCell.y);
}

function routeBetweenCells(fromCell, toCell) {
  if (!fromCell || !toCell) return [];
  const route = [];
  let x = fromCell.x;
  let y = fromCell.y;

  while (x !== toCell.x) {
    x += x < toCell.x ? 1 : -1;
    route.push({ x, y });
  }

  while (y !== toCell.y) {
    y += y < toCell.y ? 1 : -1;
    route.push({ x, y });
  }

  return route;
}

function templateAllows(blueprint, x, y) {
  const template = templateById(blueprint.layoutTemplateId, blueprint.type);
  return template?.grid?.[y]?.[x] === 'X';
}

function routeObstructions(blueprint, report) {
  const occupied = new Map(placedCellsForBlueprint(blueprint).map((cell) => [`${cell.x},${cell.y}`, cell.nodeId]));
  const problems = [];
  for (const cell of report.route ?? []) {
    const key = `${cell.x},${cell.y}`;
    if (!templateAllows(blueprint, cell.x, cell.y)) problems.push({ key, kind: 'blocked-cell' });
    const occupant = occupied.get(key);
    if (occupant && occupant !== report.from && occupant !== report.to) problems.push({ key, kind: 'foreign-node', occupant });
  }
  return problems;
}

function sideMismatch(fromAnchor, toAnchor) {
  if (!fromAnchor || !toAnchor) return false;
  const horizontal = Math.abs(fromAnchor.x - toAnchor.x) >= Math.abs(fromAnchor.y - toAnchor.y);
  if (horizontal && fromAnchor.x <= toAnchor.x) return fromAnchor.side !== 'east' || toAnchor.side !== 'west';
  if (horizontal && fromAnchor.x > toAnchor.x) return fromAnchor.side !== 'west' || toAnchor.side !== 'east';
  if (!horizontal && fromAnchor.y <= toAnchor.y) return fromAnchor.side !== 'south' || toAnchor.side !== 'north';
  return fromAnchor.side !== 'north' || toAnchor.side !== 'south';
}

export function classifyConnectionDistance(distance) {
  if (distance === null) return 'unplaced';
  if (distance <= 1) return 'adjacent';
  if (distance <= 3) return 'close';
  if (distance <= 5) return 'extended';
  return 'long';
}

function modifiersForClass(classification) {
  if (classification === 'adjacent') return { reliability: 4, efficiency: 3, heat: -2, defectRisk: -3, cost: -1 };
  if (classification === 'close') return { reliability: 1, efficiency: 1, heat: 0, defectRisk: 0, cost: 0 };
  if (classification === 'extended') return { reliability: -2, efficiency: -1, heat: 3, defectRisk: 2, cost: 2 };
  if (classification === 'long') return { reliability: -5, efficiency: -3, heat: 7, defectRisk: 5, cost: 5 };
  return { reliability: -8, efficiency: -4, heat: 8, defectRisk: 8, cost: 4 };
}

function addModifier(summary, modifier) {
  for (const [key, value] of Object.entries(modifier)) {
    summary[key] = (summary[key] ?? 0) + value;
  }
}

function addPenalty(summary, amount) {
  if (amount <= 0) return;
  summary.reliability -= amount;
  summary.efficiency -= Math.ceil(amount / 2);
  summary.heat += amount * 2;
  summary.defectRisk += amount * 2;
  summary.cost += amount;
}

function addCongestion(summary, reports) {
  const routeUse = new Map();
  for (const report of reports) {
    for (const cell of report.route ?? []) {
      const key = `${cell.x},${cell.y}`;
      routeUse.set(key, (routeUse.get(key) ?? 0) + 1);
    }
  }

  const congestedCells = [...routeUse.entries()].filter(([, count]) => count > 1);
  const congestionPenalty = congestedCells.reduce((sum, [, count]) => sum + count - 1, 0);
  addPenalty(summary, congestionPenalty);

  return {
    routeUse: [...routeUse.entries()].map(([key, count]) => ({ key, count })),
    congestedCells: congestedCells.map(([key, count]) => ({ key, count })),
    congestionPenalty,
  };
}

export function calculateConnectionMetrics(blueprint) {
  const summary = { reliability: 0, efficiency: 0, heat: 0, defectRisk: 0, cost: 0 };
  const portAnchors = [];
  const issues = [];
  const reports = (blueprint.connections ?? []).map((connection) => {
    const from = pickPortAnchor(blueprint, connection.from, 'output', connection.fromPort ?? 0);
    const to = pickPortAnchor(blueprint, connection.to, 'input', connection.toPort ?? 0);
    const fromAnchor = from.anchor;
    const toAnchor = to.anchor;
    if (from.issue) issues.push(`${connection.from}: ${from.issue}`);
    if (to.issue) issues.push(`${connection.to}: ${to.issue}`);
    const distance = distanceBetween(fromAnchor, toAnchor);
    const classification = classifyConnectionDistance(distance);
    const modifier = modifiersForClass(classification);
    const route = routeBetweenCells(fromAnchor, toAnchor);
    const report = { ...connection, distance, classification, modifier, route, fromCell: fromAnchor, toCell: toAnchor, fromAnchor, toAnchor };
    report.obstructions = routeObstructions(blueprint, report);
    report.sideMismatch = sideMismatch(fromAnchor, toAnchor);
    if (report.sideMismatch) issues.push(`${connection.from}->${connection.to}: port side mismatch`);
    addModifier(summary, modifier);
    addPenalty(summary, report.obstructions.length + (report.sideMismatch ? 2 : 0));
    if (fromAnchor) portAnchors.push({ ...fromAnchor, role: 'output', nodeId: connection.from });
    if (toAnchor) portAnchors.push({ ...toAnchor, role: 'input', nodeId: connection.to });
    return report;
  });
  const congestion = addCongestion(summary, reports);
  return { reports, summary, congestion, portAnchors, issues };
}
