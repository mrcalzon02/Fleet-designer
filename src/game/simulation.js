import { calculateDefectRisk, calculateOperatingBurn, calculateProductionCashCost } from './difficultyEffects.js';
import { progressResearchProjects } from './researchSimulation.js';
import { processSupplyContracts, updateCommodityPrices } from './supplySimulation.js';
import { processWarehouseAging } from './warehouseSimulation.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

const PRIORITY_ORDER = { high: 0, normal: 1, low: 2 };
const ACTIVE_RUN_STATUSES = new Set(['queued', 'active']);

const currency = (amount) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}).format(amount).replace('$', 'CR ');

export function formatCredits(amount) {
  return currency(amount);
}

function normalizeQuantity(value, fallback = 1) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(1, parsed);
}

function normalizePriority(priority) {
  return Object.hasOwn(PRIORITY_ORDER, priority) ? priority : 'normal';
}

function canAffordBill(inventory, bill, quantity = 1) {
  return Object.entries(bill).every(([key, value]) => (inventory[key] ?? 0) >= value * quantity);
}

function spendBill(inventory, bill, quantity = 1) {
  for (const [key, value] of Object.entries(bill)) {
    inventory[key] = (inventory[key] ?? 0) - value * quantity;
  }
}

function restoreBill(inventory, bill, quantity = 1, ratio = 1) {
  for (const [key, value] of Object.entries(bill ?? {})) {
    inventory[key] = (inventory[key] ?? 0) + Math.floor(value * quantity * ratio);
  }
}

function buildProductionRun(state, design, quantity, purpose, options = {}) {
  const normalizedQuantity = normalizeQuantity(quantity);
  const complexity = design.type === 'vessel' ? 4 : design.type === 'module' ? 3 : 2;
  return {
    id: `run-${Date.now()}-${Math.round(Math.random() * 10000)}`,
    designId: design.id,
    designName: design.name,
    type: design.type,
    quantity: normalizedQuantity,
    purpose,
    revenueMode: options.revenueMode ?? 'market',
    contractId: options.contractId ?? null,
    progress: 0,
    required: complexity * normalizedQuantity,
    unitCost: design.cost,
    unitSalePrice: design.salePrice,
    materialBill: { ...design.bill },
    priority: normalizePriority(options.priority),
    queuedCycle: options.queuedCycle ?? null,
    defectRisk: calculateDefectRisk(state, design),
    qaResult: null,
    stockLotId: null,
    status: 'queued',
  };
}

function warehouseUsed(next) {
  return next.finishedGoods.reduce((sum, lot) => sum + lot.availableQuantity, 0);
}

function addFinishedGoods(next, run) {
  const lot = {
    id: `lot-${run.id}`,
    sourceRunId: run.id,
    designId: run.designId,
    designName: run.designName,
    type: run.type,
    quantity: run.quantity,
    availableQuantity: run.quantity,
    soldQuantity: 0,
    deliveredQuantity: 0,
    revenueMode: run.revenueMode,
    contractId: run.contractId,
    unitSalePrice: run.unitSalePrice,
    qaResult: run.qaResult,
    status: run.revenueMode === 'contract' ? 'reserved-contract' : 'available-market',
    createdCycle: next.company.cycle,
    age: 0,
    inspected: false,
  };
  next.finishedGoods.push(lot);
  run.stockLotId = lot.id;
  return lot;
}

function calculateMarketRevenue(lot, quantity) {
  const gross = lot.unitSalePrice * quantity;
  let multiplier = lot.qaResult === 'defective' ? 0.55 : 1;
  if (lot.status === 'stale-market') multiplier -= 0.18;
  if (lot.marketDiscount) multiplier -= lot.marketDiscount;
  if (lot.marketBonus) multiplier += lot.marketBonus;
  return Math.round(gross * Math.max(0.2, multiplier));
}

function calculateContractPayout(contract, lot, quantity) {
  const unitReward = contract.reward / contract.quantity;
  const gross = Math.round(unitReward * quantity);
  return lot.qaResult === 'defective' ? Math.round(gross * 0.72) : gross;
}

export function acceptContract(state, contractId, designId) {
  const next = clone(state);
  const contract = next.contracts.find((item) => item.id === contractId);
  const design = next.designs.find((item) => item.id === designId);

  if (!contract || !design) return next;
  if (contract.status !== 'open') return next;
  if (design.type !== contract.requiredType) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: ${design.name} cannot satisfy ${contract.title}.`);
    return next;
  }

  contract.status = 'accepted';
  contract.assignedDesignId = designId;
  contract.productionRunId = null;
  contract.stockLotId = null;
  contract.deliveredQuantity = 0;
  contract.earnedReward = 0;
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Accepted ${contract.title} for ${contract.client}. Production still must be queued.`);
  return next;
}

export function queueProduction(state, designId, quantity = 1, purpose = 'market sale', options = {}) {
  const next = clone(state);
  const design = next.designs.find((item) => item.id === designId);
  const normalizedQuantity = normalizeQuantity(quantity);
  if (!design) return next;

  if (warehouseUsed(next) + normalizedQuantity > next.company.warehouseCapacity) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Production blocked. Finished goods warehouse is at capacity.`);
    return next;
  }

  if (!canAffordBill(next.inventory, design.bill, normalizedQuantity)) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Production blocked. Materials unavailable for ${design.name}.`);
    return next;
  }

  const cashCost = calculateProductionCashCost(next, design, normalizedQuantity);
  if (next.company.cash < cashCost) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Production blocked. Insufficient cash overhead for ${design.name}.`);
    return next;
  }

  spendBill(next.inventory, design.bill, normalizedQuantity);
  next.productionRuns.push(buildProductionRun(next, design, normalizedQuantity, purpose, {
    ...options,
    queuedCycle: next.company.cycle,
  }));

  next.company.cash -= cashCost;
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Queued ${normalizedQuantity} x ${design.name} for ${purpose}. Cash overhead ${currency(cashCost)}.`);
  return next;
}

export function queueContractProduction(state, contractId) {
  const next = clone(state);
  const contract = next.contracts.find((item) => item.id === contractId);
  if (!contract || contract.status !== 'accepted') return next;

  const design = next.designs.find((item) => item.id === contract.assignedDesignId);
  if (!design) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Contract production blocked. No assigned design found for ${contract.title}.`);
    return next;
  }

  const remainingQuantity = Math.max(0, contract.quantity - (contract.deliveredQuantity ?? 0));
  const existingRun = next.productionRuns.find((run) => run.contractId === contract.id && !['complete', 'canceled'].includes(run.status));
  if (existingRun) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Contract production already active for ${contract.title}.`);
    return next;
  }

  const reservedStock = next.finishedGoods
    .filter((lot) => lot.contractId === contract.id && lot.status === 'reserved-contract')
    .reduce((sum, lot) => sum + lot.availableQuantity, 0);

  const quantityToBuild = Math.max(0, remainingQuantity - reservedStock);
  if (quantityToBuild <= 0) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Contract stock already covers remaining delivery for ${contract.title}.`);
    return next;
  }

  if (warehouseUsed(next) + quantityToBuild > next.company.warehouseCapacity) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Contract production blocked. Finished goods warehouse is at capacity.`);
    return next;
  }

  if (!canAffordBill(next.inventory, design.bill, quantityToBuild)) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Contract production blocked. Materials unavailable for ${contract.title}.`);
    return next;
  }

  const cashCost = calculateProductionCashCost(next, design, quantityToBuild);
  if (next.company.cash < cashCost) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Contract production blocked. Insufficient cash overhead for ${contract.title}.`);
    return next;
  }

  spendBill(next.inventory, design.bill, quantityToBuild);
  const run = buildProductionRun(next, design, quantityToBuild, 'contract fulfillment', {
    contractId: contract.id,
    revenueMode: 'contract',
    priority: 'high',
    queuedCycle: next.company.cycle,
  });
  next.productionRuns.push(run);
  contract.productionRunId = run.id;
  next.company.cash -= cashCost;
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Queued ${quantityToBuild} x ${design.name} for ${contract.title}. Cash overhead ${currency(cashCost)}. Payout reserved until delivery.`);
  return next;
}

export function setProductionPriority(state, runId, priority) {
  const next = clone(state);
  const run = next.productionRuns.find((item) => item.id === runId);
  if (!run || ['complete', 'canceled'].includes(run.status)) return next;
  run.priority = normalizePriority(priority);
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Set ${run.designName} run priority to ${run.priority}.`);
  return next;
}

export function toggleProductionPause(state, runId) {
  const next = clone(state);
  const run = next.productionRuns.find((item) => item.id === runId);
  if (!run || ['complete', 'canceled'].includes(run.status)) return next;

  if (run.status === 'paused') {
    run.status = run.progress > 0 ? 'active' : 'queued';
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Resumed production run for ${run.designName}.`);
  } else {
    run.status = 'paused';
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Paused production run for ${run.designName}.`);
  }
  return next;
}

export function cancelProductionRun(state, runId) {
  const next = clone(state);
  const run = next.productionRuns.find((item) => item.id === runId);
  if (!run || ['complete', 'canceled'].includes(run.status)) return next;

  const progressRatio = run.required > 0 ? run.progress / run.required : 0;
  const salvageRatio = progressRatio === 0 ? 1 : 0.35;
  const cashSalvage = Math.round(run.unitCost * run.quantity * (progressRatio === 0 ? 0.2 : 0.08));
  restoreBill(next.inventory, run.materialBill, run.quantity, salvageRatio);
  next.company.cash += cashSalvage;
  run.status = 'canceled';
  run.canceledCycle = next.company.cycle;

  const contract = next.contracts.find((item) => item.productionRunId === run.id);
  if (contract) contract.productionRunId = null;

  next.eventLog.unshift(`Cycle ${next.company.cycle}: Canceled ${run.designName} run. Salvage recovered ${currency(cashSalvage)} plus reusable materials.`);
  return next;
}

export function listDesignRights(state, designId) {
  const next = clone(state);
  const design = next.designs.find((item) => item.id === designId);
  if (!design || design.marketListed) return next;
  design.marketListed = true;
  next.marketListings.unshift({
    id: `mk-own-${design.id}`,
    seller: next.company.name,
    designName: design.name,
    type: design.type,
    price: design.licensePrice,
    license: true,
  });
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Listed design rights for ${design.name}.`);
  return next;
}

export function buyLicense(state, listingId) {
  const next = clone(state);
  const listing = next.marketListings.find((item) => item.id === listingId);
  if (!listing || !listing.license) return next;
  if (listing.seller === next.company.name) return next;
  if (next.company.cash < listing.price) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: License purchase failed. Insufficient capital.`);
    return next;
  }

  next.company.cash -= listing.price;
  next.designs.push({
    id: `lic-${listing.id}`,
    name: `${listing.designName} Licensed Pattern`,
    type: listing.type,
    quality: 66,
    reliability: 70,
    cost: listing.type === 'vessel' ? 1600000 : listing.type === 'module' ? 520000 : 240000,
    salePrice: listing.type === 'vessel' ? 3000000 : listing.type === 'module' ? 880000 : 420000,
    licensePrice: 0,
    bill: listing.type === 'vessel'
      ? { rawOre: 8, electronics: 5, hullPlate: 9, driveCores: 1 }
      : listing.type === 'module'
        ? { rawOre: 4, electronics: 2, hullPlate: 3 }
        : { electronics: 3, hullPlate: 1 },
    rights: 'licensed',
    marketListed: false,
  });
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Purchased production license for ${listing.designName}.`);
  return next;
}

export function sellFinishedGood(state, lotId, quantity = 1) {
  const next = clone(state);
  const lot = next.finishedGoods.find((item) => item.id === lotId);
  if (!lot || !['available-market', 'stale-market'].includes(lot.status) || lot.availableQuantity <= 0) return next;

  const sellQuantity = Math.min(normalizeQuantity(quantity), lot.availableQuantity);
  const revenue = calculateMarketRevenue(lot, sellQuantity);
  next.company.cash += revenue;
  next.company.reputation += lot.qaResult === 'defective' ? -1 : 1;
  lot.availableQuantity -= sellQuantity;
  lot.soldQuantity = (lot.soldQuantity ?? 0) + sellQuantity;
  if (lot.availableQuantity <= 0) {
    lot.availableQuantity = 0;
    lot.status = 'sold';
    lot.soldCycle = next.company.cycle;
  }
  next.eventLog.unshift(
    `Cycle ${next.company.cycle}: Sold ${sellQuantity} x ${lot.designName}. ${lot.qaResult === 'defective' ? 'Defects reduced payout.' : 'Batch passed market acceptance.'} Revenue ${currency(revenue)}.`
  );
  return next;
}

export function deliverContractStock(state, contractId, quantity = 1) {
  const next = clone(state);
  const contract = next.contracts.find((item) => item.id === contractId);
  if (!contract || contract.status !== 'accepted') return next;

  const lot = next.finishedGoods.find((item) => (
    item.contractId === contract.id
    && item.status === 'reserved-contract'
    && item.availableQuantity > 0
  ));

  if (!lot) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Delivery blocked. No finished contract stock ready for ${contract.title}.`);
    return next;
  }

  const remainingContractQuantity = Math.max(0, contract.quantity - (contract.deliveredQuantity ?? 0));
  const deliverQuantity = Math.min(normalizeQuantity(quantity), lot.availableQuantity, remainingContractQuantity);
  if (deliverQuantity <= 0) return next;

  const payout = calculateContractPayout(contract, lot, deliverQuantity);
  lot.availableQuantity -= deliverQuantity;
  lot.deliveredQuantity = (lot.deliveredQuantity ?? 0) + deliverQuantity;
  contract.deliveredQuantity = (contract.deliveredQuantity ?? 0) + deliverQuantity;
  contract.earnedReward = (contract.earnedReward ?? 0) + payout;
  next.company.cash += payout;
  next.company.reputation += lot.qaResult === 'defective' ? 0 : 1;

  if (lot.availableQuantity <= 0) {
    lot.availableQuantity = 0;
    lot.status = 'delivered';
    lot.deliveredCycle = next.company.cycle;
  }

  if (contract.deliveredQuantity >= contract.quantity) {
    contract.status = 'fulfilled';
    contract.deliveredCycle = next.company.cycle;
    contract.stockLotId = lot.id;
    next.company.reputation += lot.qaResult === 'defective' ? 1 : 3;
  }

  next.eventLog.unshift(
    `Cycle ${next.company.cycle}: Delivered ${deliverQuantity} x ${lot.designName} for ${contract.title}. ${lot.qaResult === 'defective' ? 'Client accepted at reduced payout.' : 'Delivery accepted.'} Payout ${currency(payout)}.`
  );
  return next;
}

function completeProduction(next, run) {
  const defective = Math.random() * 100 < run.defectRisk;
  run.qaResult = defective ? 'defective' : 'passed';
  const lot = addFinishedGoods(next, run);

  if (run.revenueMode === 'market') {
    next.eventLog.unshift(
      `Cycle ${next.company.cycle}: Completed ${run.quantity} x ${run.designName}. Stock lot ${lot.id} moved to finished goods for market sale. QA: ${run.qaResult}. Defect risk ${run.defectRisk}%.`
    );
    return;
  }

  if (run.revenueMode === 'contract') {
    const contract = next.contracts.find((item) => item.id === run.contractId);
    if (contract) contract.stockLotId = lot.id;
    next.eventLog.unshift(
      `Cycle ${next.company.cycle}: Contract batch completed for ${run.designName}. Stock lot ${lot.id} reserved for delivery. QA: ${run.qaResult}. Defect risk ${run.defectRisk}%.`
    );
    return;
  }

  next.eventLog.unshift(`Cycle ${next.company.cycle}: Completed internal production for ${run.designName}. Stock lot ${lot.id} stored. Defect risk ${run.defectRisk}%.`);
}

function resolveContractDeadlines(next) {
  for (const contract of next.contracts) {
    if (contract.status !== 'accepted') continue;
    if (next.company.cycle > contract.deadline) {
      const completionRatio = Math.min(1, (contract.deliveredQuantity ?? 0) / contract.quantity);
      const adjustedPenalty = Math.round(contract.penalty * (1 - completionRatio));
      contract.status = 'failed';
      next.company.cash -= adjustedPenalty;
      next.company.reputation -= adjustedPenalty > 0 ? 5 : 1;
      next.eventLog.unshift(`Cycle ${next.company.cycle}: Failed ${contract.title}. Delivered ${contract.deliveredQuantity ?? 0}/${contract.quantity}. Penalty ${currency(adjustedPenalty)}.`);
    }
  }
}

function allocateFactoryCapacity(next) {
  let capacity = next.company.factoryCapacity;
  let capacityUsed = 0;
  const activeRuns = next.productionRuns
    .filter((run) => ACTIVE_RUN_STATUSES.has(run.status))
    .sort((a, b) => {
      const priorityDelta = PRIORITY_ORDER[normalizePriority(a.priority)] - PRIORITY_ORDER[normalizePriority(b.priority)];
      if (priorityDelta !== 0) return priorityDelta;
      return (a.queuedCycle ?? 0) - (b.queuedCycle ?? 0);
    });

  for (const run of activeRuns) {
    if (capacity <= 0) break;
    run.status = 'active';
    const remaining = Math.max(0, run.required - run.progress);
    const applied = Math.min(remaining, capacity);
    run.progress += applied;
    capacity -= applied;
    capacityUsed += applied;

    if (run.progress >= run.required) {
      run.progress = run.required;
      run.status = 'complete';
      completeProduction(next, run);
    }
  }

  return capacityUsed;
}

export function advanceCycle(state) {
  const next = clone(state);
  next.company.cycle += 1;
  const operatingBurn = calculateOperatingBurn(next);
  next.company.effectiveBurnRate = operatingBurn;
  next.company.cash -= operatingBurn;

  const capacityUsed = allocateFactoryCapacity(next);
  progressResearchProjects(next);
  processSupplyContracts(next);
  processWarehouseAging(next);
  updateCommodityPrices(next);
  resolveContractDeadlines(next);

  if (next.company.cash <= 0) {
    next.company.status = 'bankrupt';
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Bankruptcy triggered. Welcome to the intergalactic breadline.`);
  } else {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Cycle advanced. Operating burn ${currency(operatingBurn)}, ${capacityUsed}/${next.company.factoryCapacity} factory capacity allocated, supply and warehouse costs processed.`);
  }

  next.eventLog = next.eventLog.slice(0, 18);
  return next;
}
