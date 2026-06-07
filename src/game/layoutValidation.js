import { templateArea, templateById, templateHeight, templateWidth } from './layoutTemplates.js';
import { componentNodeLibrary } from './nodeLibrary.js';

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
  const template = templateById(blueprint.layoutTemplateId, blueprint.type);
  const footprint = calculateBlueprintFootprint(blueprint);
  const issues = [];
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

  return {
    valid: issues.length === 0,
    issues,
    footprint,
    template,
    rule: template,
  };
}
