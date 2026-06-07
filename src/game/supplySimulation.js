const clone = (value) => JSON.parse(JSON.stringify(value));

export const defaultRefineryRecipes = [
  {
    id: 'refine-hull-plate',
    name: 'Smelt Hull Plate',
    input: { rawOre: 2 },
    output: { hullPlate: 1 },
    cashCost: 25000,
    workRequired: 2,
  },
  {
    id: 'reclaim-electronics',
    name: 'Reclaim Electronics',
    input: { rawOre: 1, volatiles: 1 },
    output: { electronics: 1 },
    cashCost: 42000,
    workRequired: 3,
  },
  {
    id: 'calibrate-drive-core',
    name: 'Calibrate Drive Core',
    input: { electronics: 3, volatiles: 1 },
    output: { driveCores: 1 },
    cashCost: 180000,
    workRequired: 5,
  },
];

function normalizeQuantity(value, fallback = 1) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(1, parsed);
}

function materialLabel(state, material) {
  return state.commodities?.[material]?.label ?? material;
}

function formatCredits(amount) {
  return `CR ${Math.round(amount).toLocaleString('en-US')}`;
}

function recipes(state) {
  return state.refineryRecipes ?? defaultRefineryRecipes;
}

function hasMaterials(inventory, bill, quantity) {
  return Object.entries(bill).every(([material, amount]) => (inventory[material] ?? 0) >= amount * quantity);
}

function spendMaterials(inventory, bill, quantity) {
  for (const [material, amount] of Object.entries(bill)) {
    inventory[material] = (inventory[material] ?? 0) - amount * quantity;
  }
}

function addMaterials(inventory, bill, quantity) {
  for (const [material, amount] of Object.entries(bill)) {
    inventory[material] = (inventory[material] ?? 0) + amount * quantity;
  }
}

export function buySpotMaterial(state, material, quantity = 1) {
  const next = clone(state);
  const commodity = next.commodities?.[material];
  const purchaseQuantity = normalizeQuantity(quantity);
  if (!commodity) return next;

  const cost = commodity.spotPrice * purchaseQuantity;
  if (next.company.cash < cost) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Spot purchase failed. Insufficient capital for ${materialLabel(next, material)}.`);
    return next;
  }

  next.company.cash -= cost;
  next.inventory[material] = (next.inventory[material] ?? 0) + purchaseQuantity;
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Bought ${purchaseQuantity} x ${materialLabel(next, material)} on the spot market for ${formatCredits(cost)}.`);
  return next;
}

export function toggleSupplyContract(state, contractId) {
  const next = clone(state);
  const contract = next.supplyContracts.find((item) => item.id === contractId);
  if (!contract) return next;

  contract.active = !contract.active;
  contract.remainingCycles = contract.active ? contract.lockedCycles : 0;
  next.eventLog.unshift(`Cycle ${next.company.cycle}: ${contract.active ? 'Activated' : 'Suspended'} supply contract with ${contract.supplier}.`);
  return next;
}

export function queueRefineryJob(state, recipeId, quantity = 1) {
  const next = clone(state);
  const recipe = recipes(next).find((item) => item.id === recipeId);
  const jobQuantity = normalizeQuantity(quantity);
  if (!recipe) return next;

  const totalCost = recipe.cashCost * jobQuantity;
  if (next.company.cash < totalCost) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Refinery job blocked. Insufficient capital for ${recipe.name}.`);
    return next;
  }

  if (!hasMaterials(next.inventory, recipe.input, jobQuantity)) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Refinery job blocked. Missing input materials for ${recipe.name}.`);
    return next;
  }

  spendMaterials(next.inventory, recipe.input, jobQuantity);
  next.company.cash -= totalCost;
  next.refineryJobs = next.refineryJobs ?? [];
  next.refineryJobs.push({
    id: `refjob-${Date.now()}-${Math.round(Math.random() * 10000)}`,
    recipeId: recipe.id,
    recipeName: recipe.name,
    quantity: jobQuantity,
    progress: 0,
    required: recipe.workRequired * jobQuantity,
    input: { ...recipe.input },
    output: { ...recipe.output },
    cashCost: recipe.cashCost,
    status: 'queued',
  });
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Queued refinery job ${recipe.name} x ${jobQuantity}.`);
  return next;
}

function processRefineryJobs(next) {
  let capacity = next.company.refineryCapacity ?? 4;
  next.refineryJobs = next.refineryJobs ?? [];

  for (const job of next.refineryJobs.filter((item) => ['queued', 'active'].includes(item.status))) {
    if (capacity <= 0) break;
    job.status = 'active';
    const remaining = Math.max(0, job.required - job.progress);
    const applied = Math.min(remaining, capacity);
    job.progress += applied;
    capacity -= applied;

    if (job.progress >= job.required) {
      job.progress = job.required;
      job.status = 'complete';
      job.completedCycle = next.company.cycle;
      addMaterials(next.inventory, job.output, job.quantity);
      next.eventLog.unshift(`Cycle ${next.company.cycle}: Refinery completed ${job.recipeName} x ${job.quantity}.`);
    }
  }
}

export function processSupplyContracts(next) {
  for (const contract of next.supplyContracts) {
    if (!contract.active) continue;

    const cost = contract.contractPrice * contract.quantityPerCycle;
    if (next.company.cash < cost) {
      contract.active = false;
      contract.remainingCycles = 0;
      next.eventLog.unshift(`Cycle ${next.company.cycle}: Supply contract with ${contract.supplier} suspended for nonpayment.`);
      continue;
    }

    const delivered = Math.random() * 100 <= contract.reliability;
    next.company.cash -= cost;
    contract.remainingCycles = Math.max(0, (contract.remainingCycles ?? contract.lockedCycles) - 1);

    if (delivered) {
      next.inventory[contract.material] = (next.inventory[contract.material] ?? 0) + contract.quantityPerCycle;
      next.eventLog.unshift(`Cycle ${next.company.cycle}: ${contract.supplier} delivered ${contract.quantityPerCycle} x ${materialLabel(next, contract.material)}.`);
    } else {
      next.eventLog.unshift(`Cycle ${next.company.cycle}: ${contract.supplier} missed delivery for ${materialLabel(next, contract.material)}.`);
    }

    if (contract.remainingCycles <= 0) {
      contract.active = false;
      next.eventLog.unshift(`Cycle ${next.company.cycle}: Supply contract with ${contract.supplier} expired.`);
    }
  }

  processRefineryJobs(next);
}

export function updateCommodityPrices(next) {
  for (const [material, commodity] of Object.entries(next.commodities ?? {})) {
    const volatility = commodity.volatility ?? 0.1;
    const drift = commodity.trend === 'scarce' ? 0.04 : commodity.trend === 'tight' ? 0.02 : commodity.trend === 'volatile' ? 0.0 : -0.005;
    const swing = (Math.random() - 0.5) * volatility;
    const nextPrice = Math.round(commodity.spotPrice * (1 + drift + swing));
    commodity.spotPrice = Math.max(5000, nextPrice);
    commodity.lastUpdatedCycle = next.company.cycle;
    commodity.label = commodity.label ?? material;
  }
}
