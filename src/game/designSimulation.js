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
      { nodeId: 'node-crude-power-bus', x: 0, y: 0 },
      { nodeId: 'node-jury-rigged-control-loop', x: 2, y: 0 },
      { nodeId: 'node-slagged-heat-sink', x: 2, y: 1 },
    ],
    connections: [
      { from: 'node-crude-power-bus', to: 'node-jury-rigged-control-loop' },
      { from: 'node-jury-rigged-control-loop', to: 'node-slagged-heat-sink' },
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
      { nodeId: 'node-riveted-frame-joint', x: 1, y: 0 },
      { nodeId: 'node-basic-capacitor-bank', x: 2, y: 1 },
      { nodeId: 'node-redundant-control-core', x: 2, y: 2 },
    ],
    connections: [
      { from: 'node-riveted-frame-joint', to: 'node-basic-capacitor-bank' },
      { from: 'node-basic-capacitor-bank', to: 'node-redundant-control-core' },
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
      { nodeId: 'node-vector-plasma-drive', x: 1, y: 1 },
      { nodeId: 'node-microchannel-cooler', x: 2, y: 2 },
      { nodeId: 'node-basic-capacitor-bank', x: 0, y: 3 },
    ],
    connections: [
      { from: 'node-basic-capacitor-bank', to: 'node-vector-plasma-drive' },
      { from: 'node-vector-plasma-drive', to: 'node-microchannel-cooler' },
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
      { nodeId: 'node-compact-reactor-spine', x: 2, y: 1 },
      { nodeId: 'node-lattice-frame-joint', x: 1, y: 2 },
      { nodeId: 'node-redundant-control-core', x: 3, y: 3 },
      { nodeId: 'node-microchannel-cooler', x: 4, y: 4 },
    ],
    connections: [
      { from: 'node-compact-reactor-spine', to: 'node-redundant-control-core' },
      { from: 'node-lattice-frame-joint', to: 'node-redundant-control-core' },
      { from: 'node-redundant-control-core', to: 'node-microchannel-cooler' },
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
  const stats = summarizeNodeStats(nodes);
  const tierWeight = sumNodeTier(nodes);
  const layout = validateBlueprintLayout(blueprint);
  const typeBaseCost = blueprint.type === 'vessel' ? 1250000 : blueprint.type === 'module' ? 460000 : 190000;
  const typeBaseSale = blueprint.type === 'vessel' ? 2300000 : blueprint.type === 'module' ? 820000 : 360000;

  const positivePerformance = (stats.efficiency ?? 0)
    + (stats.automation ?? 0)
    + (stats.durability ?? 0) * 0.45
    + (stats.thrust ?? 0) * 0.35
    + (stats.powerOutput ?? 0) * 0.28
    + (stats.powerStability ?? 0) * 0.6;
  const riskLoad = (stats.defectRisk ?? 0) + Math.max(0, stats.heat ?? 0) * 0.35 + (stats.maintenance ?? 0) * 0.3;

  const quality = clamp(Math.round(38 + tierWeight * 4 + positivePerformance * 0.18 - riskLoad * 0.08), 5, 98);
  const reliability = clamp(Math.round(42 + (stats.reliability ?? 0) + (stats.powerStability ?? 0) * 0.35 - (stats.defectRisk ?? 0) * 0.6 - Math.max(0, stats.heat ?? 0) * 0.18 - (stats.maintenance ?? 0) * 0.25), 4, 96);
  const costMultiplier = clamp(1 + ((stats.cost ?? 0) + tierWeight * 6 + Math.max(0, stats.mass ?? 0) * 0.25) / 100, 0.55, 2.6);
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
    layoutFootprint: layout.footprint,
    layoutTemplateId: blueprint.layoutTemplateId,
    placements: blueprint.placements ?? [],
    connections: blueprint.connections ?? [],
    nodeIds: blueprint.nodeIds,
    description: blueprint.description,
    defectRiskModifier: Math.round((stats.defectRisk ?? 0) - (stats.reliability ?? 0) * 0.15 + Math.max(0, stats.maintenance ?? 0) * 0.12),
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
