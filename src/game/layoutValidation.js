import { componentNodeLibrary } from './nodeLibrary.js';

const layoutRules = {
  component: {
    maxNodes: 4,
    maxArea: 9,
    maxWidth: 4,
    maxHeight: 4,
    minOutputs: 1,
  },
  module: {
    maxNodes: 5,
    maxArea: 14,
    maxWidth: 5,
    maxHeight: 5,
    minInputs: 1,
    minOutputs: 1,
  },
  vessel: {
    maxNodes: 6,
    maxArea: 22,
    maxWidth: 7,
    maxHeight: 6,
    minInputs: 2,
    minOutputs: 2,
  },
};

function nodesForBlueprint(blueprint) {
  const ids = new Set(blueprint.nodeIds ?? []);
  return componentNodeLibrary.filter((node) => ids.has(node.id));
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

export function calculateBlueprintFootprint(blueprint) {
  const nodes = nodesForBlueprint(blueprint);
  return nodes.reduce((footprint, node) => {
    footprint.area += nodeArea(node);
    footprint.width = Math.max(footprint.width, nodeWidth(node));
    footprint.height += nodeHeight(node);
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
  });
}

export function validateBlueprintLayout(blueprint) {
  const rule = layoutRules[blueprint.type] ?? layoutRules.component;
  const footprint = calculateBlueprintFootprint(blueprint);
  const issues = [];

  if (footprint.nodeCount > rule.maxNodes) issues.push(`too many nodes for ${blueprint.type} layout`);
  if (footprint.area > rule.maxArea) issues.push(`node footprint area ${footprint.area} exceeds ${rule.maxArea}`);
  if (footprint.width > rule.maxWidth) issues.push(`widest node span ${footprint.width} exceeds ${rule.maxWidth}`);
  if (footprint.height > rule.maxHeight) issues.push(`stacked node height ${footprint.height} exceeds ${rule.maxHeight}`);
  if ((rule.minInputs ?? 0) > footprint.inputs) issues.push(`requires at least ${rule.minInputs} total input ports`);
  if ((rule.minOutputs ?? 0) > footprint.outputs) issues.push(`requires at least ${rule.minOutputs} total output ports`);
  if (footprint.outputs < Math.max(1, Math.floor(footprint.inputs / 2))) issues.push('output port count is too low for the input chain');

  return {
    valid: issues.length === 0,
    issues,
    footprint,
    rule,
  };
}
