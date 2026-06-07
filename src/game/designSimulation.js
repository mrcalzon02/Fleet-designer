import { calculateConnectionMetrics } from './connectionMetrics.js';
import { validateBlueprintLayout } from './layoutValidation.js';
import { componentNodeLibrary, summarizeNodeStats } from './nodeLibrary.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

export const prototypeBlueprints = [
  {
    id: 'bp-junk-power-module',
    name: 'Junkyard Power Regulation Module',
    type: 'component',
    layoutTemplateId: 'tpl-component-bench-small',
    nodeIds: ['node-crude-power-bus', 'node-jury-rigged-control-loop', 'node-slagged-heat-sink'],
    placements: [
      { nodeId: 'node-crude-power-bus', x: 0, y: 0, facing: 'east' },
      { nodeId: 'node-jury-rigged-control-loop', x: 2, y: 0, facing: 'east' },
      { nodeId: 'node-slagged-heat-sink', x: 2, y: 1, facing: 'south' },
    ],
    connections: [
      { from: 'node-crude-power-bus', fromPort: 'power-out-a', to: 'node-jury-rigged-control-loop', toPort: 'signal-in-a' },
      { from: 'node-jury-rigged-control-loop', fromPort: 'signal-out-b', to: 'node-slagged-heat-sink', toPort: 'thermal-in' },
    ],
    description: 'A cheap early component chain that technically regulates power, while producing heat, defect risk, and maintenance misery.',
    baseBill: { electronics: 2, hullPlate: 2 },
  },
  {
    id: 'bp-baseline-cargo-module',
    name: 'Baseline Cargo Handling Module',
    type: 'module',
    layoutTemplateId: 'tpl-module-crate-frame',
    nodeIds: ['node-riveted-frame-joint', 'node-basic-capacitor-bank', 'node-redundant-control-core'],
    placements: [
      { nodeId: 'node-riveted-frame-joint', x: 1, y: 0, facing: 'south' },
      { nodeId: 'node-basic-capacitor-bank', x: 2, y: 1, facing: 'east' },
      { nodeId: 'node-redundant-control-core', x: 2, y: 2, facing: 'east' },
    ],
    connections: [
      { from: 'node-riveted-frame-joint', fromPort: 'frame-out-b', to: 'node-basic-capacitor-bank', toPort: 'charge-in' },
      { from: 'node-basic-capacitor-bank', fromPort: 'buffer-out-a', to: 'node-redundant-control-core', toPort: 'logic-in-a' },
    ],
    description: 'A mid-grade module chain that stabilizes structure and automation enough to support practical cargo work.',
    baseBill: { rawOre: 3, electronics: 3, hullPlate: 4 },
  },
  {
    id: 'bp-hotrod-drive-module',
    name: 'Hotrod Plasma Drive Module',
    type: 'module',
    layoutTemplateId: 'tpl-module-drive-wedge',
    nodeIds: ['node-vector-plasma-drive', 'node-microchannel-cooler', 'node-basic-capacitor-bank'],
    placements: [
      { nodeId: 'node-vector-plasma-drive', x: 1, y: 1, facing: 'south' },
      { nodeId: 'node-microchannel-cooler', x: 2, y: 2, facing: 'east' },
      { nodeId: 'node-basic-capacitor-bank', x: 0, y: 3, facing: 'east' },
    ],
    connections: [
      { from: 'node-basic-capacitor-bank', fromPort: 'buffer-out-a', to: 'node-vector-plasma-drive', toPort: 'plasma-in-b' },
      { from: 'node-vector-plasma-drive', fromPort: 'vector-out', to: 'node-microchannel-cooler', toPort: 'coolant-in-a' },
    ],
    description: 'A compact high-thrust propulsion chain with serious power and heat demands. Fast, expensive, and hungry.',
    baseBill: { volatiles: 3, electronics: 5, hullPlate: 3, driveCores: 1 },
  },
  {
    id: 'bp-compact-yard-vessel',
    name: 'Compact Yard Utility Vessel',
    type: 'vessel',
    layoutTemplateId: 'tpl-vessel-yard-hauler',
    nodeIds: ['node-compact-reactor-spine', 'node-lattice-frame-joint', 'node-redundant-control-core', 'node-microchannel-cooler'],
    placements: [
      { nodeId: 'node-compact-reactor-spine', x: 2, y: 1, facing: 'east' },
      { nodeId: 'node-lattice-frame-joint', x: 1, y: 2, facing: 'east' },
      { nodeId: 'node-redundant-control-core', x: 3, y: 3, facing: 'east' },
      { nodeId: 'node-microchannel-cooler', x: 4, y: 4, facing: 'north' },
    ],
    connections: [
      { from: 'node-compact-reactor-spine', fromPort: 'spine-out-a', to: 'node-redundant-control-core', toPort: 'logic-in-a' },
      { from: 'node-lattice-frame-joint', fromPort: 'lattice-out-d', to: 'node-redundant-control-core', toPort: 'logic-in-b' },
      { from: 'node-redundant-control-core', fromPort: 'logic-out-c', to: 'node-microchannel-cooler', toPort: 'coolant-in-a' },
    ],
    description: 'A late starter vessel chain built around compact power, better thermal control, and lighter structure.',
    baseBill: { rawOre: 8, volatiles: 3, electronics: 7, hullPlate: 8, driveCores: 2 },
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function nodesForBlueprint(blueprint) {
  const ids = new Set(blueprint.nodeIds ?? []);
  return componentNodeLibrary.filter((node) => ids.has(node.id));
}

function sumNodeTier(nodes) {
  return nodes.reduce((sum, node) => sum + (node.tier ?? 0), 0);
}

function mergedStats(baseStats, connectionSummary) {
  return { ...baseStats, layout: connectionSummary };
}

function billWithNodePressure(baseBill, stats, type) {
  const bill = { ...baseBill };
  const electronicsPressure = Math.max(0, Math.round(((stats.automation ?? 0) + (stats.powerStability ?? 0) + (stats.electronicsDemand ?? 0)) / 18));
  const hullPressure = Math.max(0, Math.round(((stats.durability ?? 0) + Math.max(0, stats.mass ?? 0)) / 30));
  const volatilePressure = Math.max(0, Math.round(((stats.thrust ?? 0) + (stats.heat ?? 0)) / 45));

  if (electronicsPressure) bill.electronics = (bill.electronics ?? 0) + electronicsPressure;
  if (hullPressure) bill.hullPlate = (bill.hullPlate ?? 0) + hullPressure;
  if (volatilePressure) bill.volatiles = (bill.volatiles ?? 0) + volatilePressure;
  if (type === 'vessel' && (stats.powerOutput ?? 0) > 50) bill.driveCores = (bill.driveCores ?? 0) + 1;
  return bill;
}

export function blueprintAvailability(state, blueprint) {
  const unlocked = new Set(state.company?.unlockedNodeIds ?? []);
  const missingNodeIds = (blueprint.nodeIds ?? []).filter((nodeId) => !unlocked.has(nodeId));
  const missingNodes = componentNodeLibrary.filter((node) => missingNodeIds.includes(node.id));
  const layout = validateBlueprintLayout(blueprint);
  return {
    available: missingNodeIds.length === 0 && layout.valid,
    nodeAccess: missingNodeIds.length === 0,
    layoutValid: layout.valid,
    missingNodeIds,
    missingNodes,
    layout,
  };
}

export function calculateBlueprintDesign(blueprint) {
  const nodes = nodesForBlueprint(blueprint);
  const nodeStats = summarizeNodeStats(nodes);
  const connectionMetrics = calculateConnectionMetrics(blueprint);
  const stats = mergedStats(nodeStats, connectionMetrics.summary);
  const tierWeight = sumNodeTier(nodes);
  const layout = validateBlueprintLayout(blueprint);
  const typeBaseCost = blueprint.type === 'vessel' ? 1250000 : blueprint.type === 'module' ? 460000 : 190000;
  const typeBaseSale = blueprint.type === 'vessel' ? 2300000 : blueprint.type === 'module' ? 820000 : 360000;

  const positivePerformance = (nodeStats.efficiency ?? 0)
    + (connectionMetrics.summary.efficiency ?? 0) * 1.5
    + (nodeStats.automation ?? 0)
    + (nodeStats.durability ?? 0) * 0.45
    + (nodeStats.thrust ?? 0) * 0.35
    + (nodeStats.powerOutput ?? 0) * 0.28
    + (nodeStats.powerStability ?? 0) * 0.6;
  const riskLoad = (nodeStats.defectRisk ?? 0)
    + (connectionMetrics.summary.defectRisk ?? 0)
    + Math.max(0, (nodeStats.heat ?? 0) + (connectionMetrics.summary.heat ?? 0)) * 0.35
    + (nodeStats.maintenance ?? 0) * 0.3;

  const quality = clamp(Math.round(38 + tierWeight * 4 + positivePerformance * 0.18 - riskLoad * 0.08), 5, 98);
  const reliability = clamp(Math.round(42 + (nodeStats.reliability ?? 0) + (connectionMetrics.summary.reliability ?? 0) + (nodeStats.powerStability ?? 0) * 0.35 - (nodeStats.defectRisk ?? 0) * 0.6 - Math.max(0, nodeStats.heat ?? 0) * 0.18 - (nodeStats.maintenance ?? 0) * 0.25), 4, 96);
  const costMultiplier = clamp(1 + ((nodeStats.cost ?? 0) + (connectionMetrics.summary.cost ?? 0) + tierWeight * 6 + Math.max(0, nodeStats.mass ?? 0) * 0.25) / 100, 0.55, 2.6);
  const saleMultiplier = clamp(1 + (quality - 50) / 110 + tierWeight / 35, 0.5, 2.8);

  return {
    name: blueprint.name,
    type: blueprint.type,
    quality,
    reliability,
    cost: Math.round(typeBaseCost * costMultiplier),
    salePrice: Math.round(typeBaseSale * saleMultiplier),
    licensePrice: Math.round(typeBaseSale * saleMultiplier * 2.8),
    bill: billWithNodePressure(blueprint.baseBill, stats, blueprint.type),
    chainStats: stats,
    connectionMetrics,
    layoutFootprint: layout.footprint,
    layoutTemplateId: blueprint.layoutTemplateId,
    placements: blueprint.placements ?? [],
    connections: blueprint.connections ?? [],
    nodeIds: blueprint.nodeIds,
    description: blueprint.description,
    defectRiskModifier: Math.round((nodeStats.defectRisk ?? 0) + (connectionMetrics.summary.defectRisk ?? 0) - ((nodeStats.reliability ?? 0) + (connectionMetrics.summary.reliability ?? 0)) * 0.15 + Math.max(0, (nodeStats.maintenance ?? 0)) * 0.12),
  };
}

export function createDesignFromBlueprint(state, blueprintId) {
  const next = clone(state);
  const blueprint = prototypeBlueprints.find((item) => item.id === blueprintId);
  if (!blueprint) return next;

  const availability = blueprintAvailability(next, blueprint);
  if (!availability.nodeAccess) {
    const missing = availability.missingNodes.map((node) => node.name).join(', ');
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Prototype blocked. Missing node access for ${blueprint.name}: ${missing}.`);
    return next;
  }

  if (!availability.layoutValid) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Prototype blocked. Layout invalid for ${blueprint.name}: ${availability.layout.issues.join('; ')}.`);
    return next;
  }

  const design = calculateBlueprintDesign(blueprint);
  const existingCount = next.designs.filter((item) => item.sourceBlueprintId === blueprint.id).length;
  next.designs.push({
    id: `des-${blueprint.id}-${Date.now()}-${existingCount + 1}`,
    ...design,
    sourceBlueprintId: blueprint.id,
    rights: 'owned',
    marketListed: false,
  });
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Created prototype design from ${blueprint.name}. Quality ${design.quality}, reliability ${design.reliability}.`);
  return next;
}
