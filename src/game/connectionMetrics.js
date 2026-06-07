import { componentNodeLibrary } from './nodeLibrary.js';

function nodeById(nodeId) {
  return componentNodeLibrary.find((node) => node.id === nodeId);
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

function bestCellPair(fromCells, toCells) {
  if (fromCells.length === 0 || toCells.length === 0) return { fromCell: null, toCell: null, distance: null };
  let best = { fromCell: null, toCell: null, distance: Number.POSITIVE_INFINITY };
  for (const fromCell of fromCells) {
    for (const toCell of toCells) {
      const distance = Math.abs(fromCell.x - toCell.x) + Math.abs(fromCell.y - toCell.y);
      if (distance < best.distance) best = { fromCell, toCell, distance };
    }
  }
  return best;
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
  if (congestionPenalty > 0) {
    summary.reliability -= congestionPenalty;
    summary.efficiency -= congestionPenalty;
    summary.heat += congestionPenalty * 2;
    summary.defectRisk += congestionPenalty * 2;
    summary.cost += congestionPenalty;
  }

  return {
    routeUse: [...routeUse.entries()].map(([key, count]) => ({ key, count })),
    congestedCells: congestedCells.map(([key, count]) => ({ key, count })),
    congestionPenalty,
  };
}

export function calculateConnectionMetrics(blueprint) {
  const summary = { reliability: 0, efficiency: 0, heat: 0, defectRisk: 0, cost: 0 };
  const reports = (blueprint.connections ?? []).map((connection) => {
    const pair = bestCellPair(cellsForNode(blueprint, connection.from), cellsForNode(blueprint, connection.to));
    const classification = classifyConnectionDistance(pair.distance);
    const modifier = modifiersForClass(classification);
    const route = routeBetweenCells(pair.fromCell, pair.toCell);
    addModifier(summary, modifier);
    return { ...connection, distance: pair.distance, classification, modifier, route, fromCell: pair.fromCell, toCell: pair.toCell };
  });
  const congestion = addCongestion(summary, reports);
  return { reports, summary, congestion };
}
