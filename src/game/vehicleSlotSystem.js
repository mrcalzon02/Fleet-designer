export const moduleCategories = [
  { id: 'cargo', name: 'Cargo Handling', description: 'Storage volume, transfer rate, loading automation, and freight stability.' },
  { id: 'propulsion', name: 'Propulsion', description: 'Thrust, maneuvering, transit performance, and drive-side heat.' },
  { id: 'power', name: 'Power Systems', description: 'Power generation, distribution stability, and electrical reserve.' },
  { id: 'control', name: 'Control Systems', description: 'Automation, command response, sensor integration, and defect detection.' },
  { id: 'thermal', name: 'Thermal Management', description: 'Heat shedding, thermal reserve, and hot-zone control.' },
  { id: 'structure', name: 'Structure', description: 'Frame strength, armor support, mass tolerance, and durability.' },
  { id: 'utility', name: 'Utility', description: 'General-purpose support modules, field service, and flexible auxiliary equipment.' },
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
  const stats = blankStats();

  stats.mass = Math.max(1, Math.round(cost / 220000));
  stats.reliability = Math.round((reliability - 50) / 5);
  stats.maintenance = Math.max(0, Math.round((65 - reliability) / 4));
  stats.cost = cost;
  stats.powerDraw = Math.max(1, Math.round((quality + stats.mass) / 18));
  stats.heat = Math.max(0, Math.round((stats.powerDraw + Math.max(0, 55 - reliability)) / 3));

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

export function compatibleModulesForSlot(designs, slot) {
  return designs
    .filter((design) => design.type === 'module')
    .map((design) => ({ design, category: inferModuleCategory(design) }))
    .filter(({ category }) => slot.allowedCategories.includes(category));
}

export function autoFillHullTemplate(designs, templateId) {
  const template = hullSlotTemplates.find((item) => item.id === templateId) ?? hullSlotTemplates[0];
  const used = new Set();
  return slotCellsForTemplate(template).map((slot) => {
    const match = compatibleModulesForSlot(designs, slot).find(({ design }) => !used.has(design.id));
    if (match) used.add(match.design.id);
    return {
      slotId: slot.id,
      designId: match?.design.id ?? null,
    };
  });
}

export function calculateVehicleAssembly(designs, templateId, assignments = []) {
  const template = hullSlotTemplates.find((item) => item.id === templateId) ?? hullSlotTemplates[0];
  const slots = slotCellsForTemplate(template);
  const bySlot = new Map(assignments.map((assignment) => [assignment.slotId, assignment.designId]));
  const totals = { ...blankStats(), ...template.baseStats };
  const issues = [];
  const filledSlots = [];

  for (const slot of slots) {
    const designId = bySlot.get(slot.id);
    if (!designId) continue;
    const design = designs.find((item) => item.id === designId);
    if (!design) {
      issues.push(`${slot.label} ${slot.x},${slot.y}: missing module design ${designId}`);
      continue;
    }
    const category = inferModuleCategory(design);
    const compatible = design.type === 'module' && slot.allowedCategories.includes(category);
    if (!compatible) issues.push(`${design.name} cannot fit ${slot.label} ${slot.x},${slot.y}`);
    addStats(totals, moduleStatsFromDesign(design));
    filledSlots.push({ slot, design, category, compatible });
  }

  const powerBalance = totals.powerGeneration - totals.powerDraw;
  const heatBalance = totals.heat;
  const reliability = Math.max(1, Math.min(98, totals.reliability - Math.max(0, -powerBalance) - Math.max(0, heatBalance - 20)));
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
    },
  };
}
