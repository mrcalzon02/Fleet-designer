export const moduleCategories = [
  { id: 'cargo', name: 'Cargo Handling', description: 'Storage volume, transfer rate, loading automation, and freight stability.' },
  { id: 'propulsion', name: 'Propulsion', description: 'Thrust, maneuvering, transit performance, and drive-side heat.' },
  { id: 'power', name: 'Power Systems', description: 'Power generation, distribution stability, and electrical reserve.' },
  { id: 'control', name: 'Control Systems', description: 'Automation, command response, sensor integration, and defect detection.' },
  { id: 'thermal', name: 'Thermal Management', description: 'Heat shedding, thermal reserve, and hot-zone control.' },
  { id: 'structure', name: 'Structure', description: 'Frame strength, armor support, mass tolerance, and durability.' },
  { id: 'utility', name: 'Utility', description: 'General-purpose support modules, field service, and flexible auxiliary equipment.' },
];

export const openMarketModuleDesigns = [
  {
    id: 'om-cargo-rack-standard',
    name: 'Open Market Standard Cargo Rack',
    type: 'module',
    moduleCategory: 'cargo',
    quality: 42,
    reliability: 48,
    cost: 410000,
    salePrice: 0,
    bill: { hullPlate: 3, electronics: 1 },
    rights: 'external-purchase',
    supplier: 'General Exchange Parts Board',
    description: 'A purchasable generic cargo module. It is available early, but expensive for its performance and not optimized for your production stack.',
  },
  {
    id: 'om-propulsion-chemical-pack',
    name: 'Open Market Chemical Drive Pack',
    type: 'module',
    moduleCategory: 'propulsion',
    quality: 40,
    reliability: 44,
    cost: 620000,
    salePrice: 0,
    bill: { hullPlate: 3, volatiles: 3, driveCores: 1 },
    rights: 'external-purchase',
    supplier: 'Redline Commercial Thrust Concern',
    description: 'A rough but available drive pack. It enables early hull completion but brings heat, maintenance, and supplier dependency.',
  },
  {
    id: 'om-power-reactor-brick',
    name: 'Open Market Reactor Brick',
    type: 'module',
    moduleCategory: 'power',
    quality: 43,
    reliability: 42,
    cost: 700000,
    salePrice: 0,
    bill: { electronics: 3, volatiles: 4, driveCores: 1 },
    rights: 'external-purchase',
    supplier: 'Tharsis Industrial Current',
    description: 'A bulky external reactor unit. Useful when internal power systems are missing, but expensive and maintenance-heavy.',
  },
  {
    id: 'om-control-cabinet-basic',
    name: 'Open Market Control Cabinet',
    type: 'module',
    moduleCategory: 'control',
    quality: 45,
    reliability: 50,
    cost: 390000,
    salePrice: 0,
    bill: { electronics: 4, hullPlate: 1 },
    rights: 'external-purchase',
    supplier: 'Signalwell Avionics Brokerage',
    description: 'A general control cabinet with acceptable documentation and limited integration support.',
  },
  {
    id: 'om-thermal-loop-kit',
    name: 'Open Market Thermal Loop Kit',
    type: 'module',
    moduleCategory: 'thermal',
    quality: 44,
    reliability: 47,
    cost: 360000,
    salePrice: 0,
    bill: { electronics: 1, hullPlate: 2, volatiles: 1 },
    rights: 'external-purchase',
    supplier: 'Bluepipe Radiator Syndicate',
    description: 'A modular thermal control kit. It helps complete early builds, but its fittings and performance are merely adequate.',
  },
  {
    id: 'om-structure-truss-pack',
    name: 'Open Market Truss Reinforcement Pack',
    type: 'module',
    moduleCategory: 'structure',
    quality: 46,
    reliability: 52,
    cost: 340000,
    salePrice: 0,
    bill: { hullPlate: 5 },
    rights: 'external-purchase',
    supplier: 'Foundry Row Commodity Structures',
    description: 'A reliable but heavy structural reinforcement pack from a common industrial supplier.',
  },
  {
    id: 'om-utility-service-skid',
    name: 'Open Market Utility Service Skid',
    type: 'module',
    moduleCategory: 'utility',
    quality: 41,
    reliability: 46,
    cost: 300000,
    salePrice: 0,
    bill: { electronics: 1, hullPlate: 2 },
    rights: 'external-purchase',
    supplier: 'Dockside General Systems',
    description: 'A generic utility skid for filling awkward hull slots before the company has a proper internal module catalog.',
  },
];

export const hullSlotTemplates = [
  {
    id: 'hull-yard-utility',
    name: 'Yard Utility Hull',
    description: 'A compact utility hull with a central work bay, aft engineering space, and limited forward systems room.',
    baseStats: {
      mass: 42,
      structure: 55,
      cargo: 8,
      thrust: 4,
      powerDraw: 8,
      powerGeneration: 0,
      heat: 6,
      reliability: 54,
      maintenance: 20,
      cost: 900000,
    },
    grid: [
      '..CCC..',
      '.CCCCC.',
      'SSUUUSS',
      '.EUEUE.',
      '..EEE..',
    ],
    slotTypes: {
      C: { label: 'Cargo Bay', allowedCategories: ['cargo', 'utility', 'control'] },
      S: { label: 'Structural Wing', allowedCategories: ['structure', 'thermal', 'utility'] },
      U: { label: 'Utility Core', allowedCategories: ['utility', 'control', 'cargo', 'thermal'] },
      E: { label: 'Engineering Bay', allowedCategories: ['power', 'propulsion', 'thermal', 'control'] },
    },
  },
  {
    id: 'hull-needle-runner',
    name: 'Needle Runner Hull',
    description: 'A narrow fast hull with very limited cargo space and strict engineering concentration aft.',
    baseStats: {
      mass: 30,
      structure: 38,
      cargo: 2,
      thrust: 9,
      powerDraw: 10,
      powerGeneration: 0,
      heat: 8,
      reliability: 50,
      maintenance: 24,
      cost: 1100000,
    },
    grid: [
      '...C...',
      '..CUC..',
      '.SSUSS.',
      '..EUE..',
      '...E...',
    ],
    slotTypes: {
      C: { label: 'Forward Bay', allowedCategories: ['control', 'cargo', 'utility'] },
      S: { label: 'Narrow Structure', allowedCategories: ['structure', 'thermal', 'utility'] },
      U: { label: 'Utility Trunk', allowedCategories: ['utility', 'control', 'thermal'] },
      E: { label: 'Drive Bay', allowedCategories: ['propulsion', 'power', 'thermal'] },
    },
  },
];

function blankStats() {
  return {
    mass: 0,
    structure: 0,
    cargo: 0,
    thrust: 0,
    powerDraw: 0,
    powerGeneration: 0,
    heat: 0,
    reliability: 0,
    maintenance: 0,
    cost: 0,
  };
}

function addStats(target, stats) {
  for (const [key, value] of Object.entries(stats ?? {})) {
    target[key] = (target[key] ?? 0) + value;
  }
}

export function availableModuleDesigns(designs, includeOpenMarket = true) {
  const ownedModules = designs.filter((design) => design.type === 'module');
  return includeOpenMarket ? [...ownedModules, ...openMarketModuleDesigns] : ownedModules;
}

export function inferModuleCategory(design) {
  const text = `${design?.name ?? ''} ${design?.description ?? ''} ${design?.sourceBlueprintId ?? ''}`.toLowerCase();
  if (design?.moduleCategory) return design.moduleCategory;
  if (text.includes('cargo') || text.includes('freight')) return 'cargo';
  if (text.includes('drive') || text.includes('thruster') || text.includes('propulsion') || text.includes('plasma')) return 'propulsion';
  if (text.includes('power') || text.includes('reactor') || text.includes('capacitor')) return 'power';
  if (text.includes('control') || text.includes('sensor') || text.includes('telemetry')) return 'control';
  if (text.includes('thermal') || text.includes('cooler') || text.includes('heat')) return 'thermal';
  if (text.includes('frame') || text.includes('hull') || text.includes('structure')) return 'structure';
  return 'utility';
}

export function moduleStatsFromDesign(design) {
  const category = inferModuleCategory(design);
  const quality = design?.quality ?? 50;
  const reliability = design?.reliability ?? 50;
  const cost = design?.cost ?? 0;
  const externalMarkup = design?.rights === 'external-purchase' ? 1.18 : 1;
  const stats = blankStats();

  stats.mass = Math.max(1, Math.round(cost / 220000));
  stats.reliability = Math.round((reliability - 50) / 5);
  stats.maintenance = Math.max(0, Math.round((65 - reliability) / 4));
  stats.cost = Math.round(cost * externalMarkup);
  stats.powerDraw = Math.max(1, Math.round((quality + stats.mass) / 18));
  stats.heat = Math.max(0, Math.round((stats.powerDraw + Math.max(0, 55 - reliability)) / 3));

  if (design?.rights === 'external-purchase') {
    stats.reliability -= 1;
    stats.maintenance += 2;
    stats.cost += 50000;
  }

  if (category === 'cargo') {
    stats.cargo += Math.round(quality / 7);
    stats.structure += 2;
  }
  if (category === 'propulsion') {
    stats.thrust += Math.round(quality / 8);
    stats.heat += 4;
    stats.powerDraw += 3;
  }
  if (category === 'power') {
    stats.powerGeneration += Math.round(quality / 6);
    stats.heat += 3;
  }
  if (category === 'control') {
    stats.reliability += Math.round(quality / 18);
    stats.powerDraw += 1;
  }
  if (category === 'thermal') {
    stats.heat -= Math.round(quality / 8);
    stats.powerDraw += 1;
  }
  if (category === 'structure') {
    stats.structure += Math.round(quality / 4);
    stats.mass += 2;
  }
  if (category === 'utility') {
    stats.cargo += 2;
    stats.structure += 2;
    stats.reliability += 1;
  }

  return stats;
}

export function slotCellsForTemplate(template) {
  const cells = [];
  for (let y = 0; y < template.grid.length; y += 1) {
    for (let x = 0; x < template.grid[y].length; x += 1) {
      const code = template.grid[y][x];
      if (code === '.') continue;
      cells.push({ id: `${template.id}-${x}-${y}`, x, y, code, ...template.slotTypes[code] });
    }
  }
  return cells;
}

export function compatibleModulesForSlot(designs, slot, includeOpenMarket = true) {
  return availableModuleDesigns(designs, includeOpenMarket)
    .map((design) => ({ design, category: inferModuleCategory(design), external: design.rights === 'external-purchase' }))
    .filter(({ category }) => slot.allowedCategories.includes(category));
}

export function autoFillHullTemplate(designs, templateId, includeOpenMarket = true) {
  const template = hullSlotTemplates.find((item) => item.id === templateId) ?? hullSlotTemplates[0];
  const usedOwned = new Set();
  return slotCellsForTemplate(template).map((slot) => {
    const compatible = compatibleModulesForSlot(designs, slot, includeOpenMarket);
    const ownedMatch = compatible.find(({ design }) => design.rights !== 'external-purchase' && !usedOwned.has(design.id));
    const marketMatch = compatible.find(({ design }) => design.rights === 'external-purchase');
    const match = ownedMatch ?? marketMatch;
    if (match && match.design.rights !== 'external-purchase') usedOwned.add(match.design.id);
    return {
      slotId: slot.id,
      designId: match?.design.id ?? null,
      source: match?.design.rights === 'external-purchase' ? 'open-market' : 'owned',
    };
  });
}

export function calculateVehicleAssembly(designs, templateId, assignments = [], includeOpenMarket = true) {
  const template = hullSlotTemplates.find((item) => item.id === templateId) ?? hullSlotTemplates[0];
  const modules = availableModuleDesigns(designs, includeOpenMarket);
  const slots = slotCellsForTemplate(template);
  const bySlot = new Map(assignments.map((assignment) => [assignment.slotId, assignment.designId]));
  const totals = { ...blankStats(), ...template.baseStats };
  const issues = [];
  const filledSlots = [];

  for (const slot of slots) {
    const designId = bySlot.get(slot.id);
    if (!designId) continue;
    const design = modules.find((item) => item.id === designId);
    if (!design) {
      issues.push(`${slot.label} ${slot.x},${slot.y}: missing module design ${designId}`);
      continue;
    }
    const category = inferModuleCategory(design);
    const compatible = design.type === 'module' && slot.allowedCategories.includes(category);
    if (!compatible) issues.push(`${design.name} cannot fit ${slot.label} ${slot.x},${slot.y}`);
    addStats(totals, moduleStatsFromDesign(design));
    filledSlots.push({ slot, design, category, compatible, external: design.rights === 'external-purchase' });
  }

  const externalCount = filledSlots.filter((slot) => slot.external).length;
  const powerBalance = totals.powerGeneration - totals.powerDraw;
  const heatBalance = totals.heat;
  const reliability = Math.max(1, Math.min(98, totals.reliability - Math.max(0, -powerBalance) - Math.max(0, heatBalance - 20) - externalCount));
  const salePrice = Math.round((totals.cost + template.baseStats.cost) * (1.25 + Math.max(0, reliability - 45) / 120));

  return {
    template,
    slots,
    filledSlots,
    issues,
    totals,
    derived: {
      powerBalance,
      heatBalance,
      reliability,
      salePrice,
      filledCount: filledSlots.length,
      openSlots: slots.length - filledSlots.length,
      externalCount,
    },
  };
}
