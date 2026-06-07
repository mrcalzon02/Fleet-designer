import { calculateConnectionMetrics } from './connectionMetrics.js';
import { templateArea, templateById, templateHeight, templateWidth } from './layoutTemplates.js';
import { componentNodeLibrary } from './nodeLibrary.js';

function nodesForBlueprint(blueprint) {
  const ids = new Set(blueprint.nodeIds ?? []);
  return componentNodeLibrary.filter((node) => ids.has(node.id));
}

function nodeById(nodeId) {
  return componentNodeLibrary.find((node) => node.id === nodeId);
}

function nodeArea(node) {
  return (node.shape ?? []).reduce((sum, row) => sum + [...row].filter((cell) => cell === 'X').length, 0);
}

function nodeWidth(node) {
  return Math.max(...(node.shape ?? ['']).map((row) => row.length));
}

function nodeHeight(node) {
  return (node.shape ?? []).length;
}

function templateAllows(template, x, y) {
  return template?.grid?.[y]?.[x] === 'X';
}

function placedCells(blueprint) {
  const cells = [];
  for (const placement of blueprint.placements ?? []) {
    const node = nodeById(placement.nodeId);
    if (!node) continue;
    for (let rowIndex = 0; rowIndex < (node.shape ?? []).length; rowIndex += 1) {
      const row = node.shape[rowIndex];
      for (let colIndex = 0; colIndex < row.length; colIndex += 1) {
        if (row[colIndex] !== 'X') continue;
        cells.push({
          nodeId: node.id,
          x: placement.x + colIndex,
          y: placement.y + rowIndex,
        });
      }
    }
  }
  return cells;
}

export function calculateBlueprintFootprint(blueprint) {
  const nodes = nodesForBlueprint(blueprint);
  const placementCells = placedCells(blueprint);
  const measuredWidth = placementCells.length ? Math.max(...placementCells.map((cell) => cell.x)) + 1 : 0;
  const measuredHeight = placementCells.length ? Math.max(...placementCells.map((cell) => cell.y)) + 1 : 0;

  return nodes.reduce((footprint, node) => {
    footprint.area += nodeArea(node);
    footprint.width = Math.max(footprint.width, nodeWidth(node), measuredWidth);
    footprint.height = Math.max(footprint.height, measuredHeight);
    if (!placementCells.length) footprint.height += nodeHeight(node);
    footprint.inputs += node.ports?.inputs ?? 0;
    footprint.outputs += node.ports?.outputs ?? 0;
    return footprint;
  }, {
    area: 0,
    width: 0,
    height: 0,
    inputs: 0,
    outputs: 0,
    nodeCount: nodes.length,
    placedCells: placementCells.length,
  });
}

function validatePlacementCells(template, blueprint, issues) {
  const placements = blueprint.placements ?? [];
  if (placements.length === 0) {
    issues.push('no node placements defined');
    return;
  }

  const placementIds = new Set(placements.map((placement) => placement.nodeId));
  for (const nodeId of blueprint.nodeIds ?? []) {
    if (!placementIds.has(nodeId)) issues.push(`node ${nodeId} has no placement`);
  }

  const occupied = new Map();
  for (const cell of placedCells(blueprint)) {
    const key = `${cell.x},${cell.y}`;
    if (!templateAllows(template, cell.x, cell.y)) {
      issues.push(`node ${cell.nodeId} occupies blocked or out-of-bounds cell ${key}`);
    }
    if (occupied.has(key)) {
      issues.push(`cell ${key} overlaps ${occupied.get(key)} and ${cell.nodeId}`);
    }
    occupied.set(key, cell.nodeId);
  }
}

function validateConnections(blueprint, issues) {
  const nodeIds = new Set(blueprint.nodeIds ?? []);
  const outgoing = {};
  const incoming = {};

  for (const connection of blueprint.connections ?? []) {
    if (!nodeIds.has(connection.from)) issues.push(`connection references unknown source ${connection.from}`);
    if (!nodeIds.has(connection.to)) issues.push(`connection references unknown target ${connection.to}`);
    outgoing[connection.from] = (outgoing[connection.from] ?? 0) + 1;
    incoming[connection.to] = (incoming[connection.to] ?? 0) + 1;
  }

  for (const nodeId of nodeIds) {
    const node = nodeById(nodeId);
    if (!node) {
      issues.push(`unknown node ${nodeId}`);
      continue;
    }
    if ((outgoing[nodeId] ?? 0) > (node.ports?.outputs ?? 0)) issues.push(`${node.name} exceeds output port capacity`);
    if ((incoming[nodeId] ?? 0) > (node.ports?.inputs ?? 0)) issues.push(`${node.name} exceeds input port capacity`);
  }

  if ((blueprint.nodeIds ?? []).length > 1 && (blueprint.connections ?? []).length === 0) {
    issues.push('multi-node blueprint has no connections');
  }
}

export function validateBlueprintLayout(blueprint) {
  const template = templateById(blueprint.layoutTemplateId, blueprint.type);
  const footprint = calculateBlueprintFootprint(blueprint);
  const connectionMetrics = calculateConnectionMetrics(blueprint);
  const issues = [...(connectionMetrics.issues ?? [])];
  const allowedArea = templateArea(template);
  const allowedWidth = templateWidth(template);
  const allowedHeight = templateHeight(template);

  if (!template) issues.push(`no layout template for ${blueprint.type}`);
  if (footprint.nodeCount > (template?.maxNodes ?? 0)) issues.push(`too many nodes for ${template?.name ?? blueprint.type}`);
  if (footprint.area > allowedArea) issues.push(`node footprint area ${footprint.area} exceeds template area ${allowedArea}`);
  if (footprint.width > allowedWidth) issues.push(`widest node span ${footprint.width} exceeds template width ${allowedWidth}`);
  if (footprint.height > allowedHeight) issues.push(`stacked node height ${footprint.height} exceeds template height ${allowedHeight}`);
  if ((template?.minInputs ?? 0) > footprint.inputs) issues.push(`requires at least ${template.minInputs} total input ports`);
  if ((template?.minOutputs ?? 0) > footprint.outputs) issues.push(`requires at least ${template.minOutputs} total output ports`);
  if (footprint.outputs < Math.max(1, Math.floor(footprint.inputs / 2))) issues.push('output port count is too low for the input chain');

  validatePlacementCells(template, blueprint, issues);
  validateConnections(blueprint, issues);

  return {
    valid: issues.length === 0,
    issues,
    footprint,
    template,
    rule: template,
    placedCells: placedCells(blueprint),
    connectionMetrics,
  };
}
