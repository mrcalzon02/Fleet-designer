import { calculateMaintenancePressure, difficultyMultiplier } from './difficultyEffects.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

function activeLots(state) {
  return (state.finishedGoods ?? []).filter((lot) => lot.availableQuantity > 0 && !['sold', 'delivered', 'scrapped'].includes(lot.status));
}

function maintenanceMultiplier(state) {
  return difficultyMultiplier(state, 'maintenanceBurden');
}

function staleAgeThreshold(state) {
  const multiplier = maintenanceMultiplier(state);
  return Math.max(3, Math.round(6 / Math.sqrt(multiplier)));
}

function lotStorageCost(state, lot) {
  const base = state.company.storageCostPerUnit ?? 4500;
  const typeMultiplier = lot.type === 'vessel' ? 5 : lot.type === 'module' ? 2 : 1;
  return calculateMaintenancePressure(state, base * typeMultiplier * (lot.availableQuantity ?? 0));
}

export function calculateWarehouseCost(state) {
  return activeLots(state).reduce((sum, lot) => sum + lotStorageCost(state, lot), 0);
}

export function processWarehouseAging(next) {
  const cost = calculateWarehouseCost(next);
  const threshold = staleAgeThreshold(next);
  next.company.lastWarehouseStaleThreshold = threshold;
  if (cost > 0) {
    next.company.cash -= cost;
    next.company.lastWarehouseCost = cost;
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Warehouse storage cost CR ${cost.toLocaleString('en-US')} paid for active stock at ${next.company.difficultyName ?? 'Normal'} maintenance pressure.`);
  } else {
    next.company.lastWarehouseCost = 0;
  }

  for (const lot of activeLots(next)) {
    lot.age = (lot.age ?? 0) + 1;
    if (lot.age >= threshold && lot.status === 'available-market') {
      lot.status = 'stale-market';
      next.eventLog.unshift(`Cycle ${next.company.cycle}: ${lot.designName} lot aged into stale market stock after ${threshold} cycles under current maintenance pressure.`);
    }
  }
}

export function inspectFinishedGood(state, lotId) {
  const next = clone(state);
  const lot = next.finishedGoods.find((item) => item.id === lotId);
  if (!lot || lot.availableQuantity <= 0 || ['sold', 'delivered', 'scrapped'].includes(lot.status)) return next;

  const baseInspectionCost = (next.company.storageCostPerUnit ?? 4500) * lot.availableQuantity * 0.75;
  const inspectionCost = calculateMaintenancePressure(next, baseInspectionCost);
  if (next.company.cash < inspectionCost) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Inspection blocked. Insufficient capital for ${lot.designName}.`);
    return next;
  }

  next.company.cash -= inspectionCost;
  lot.inspected = true;
  lot.inspectedCycle = next.company.cycle;
  if (lot.qaResult === 'defective') {
    lot.marketDiscount = 0.45;
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Inspection confirmed defects in ${lot.designName}. Market discount deepened. Inspection cost CR ${inspectionCost.toLocaleString('en-US')}.`);
  } else {
    lot.marketBonus = 0.08;
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Inspection certified ${lot.designName}. Market confidence improved. Inspection cost CR ${inspectionCost.toLocaleString('en-US')}.`);
  }
  return next;
}

export function scrapFinishedGood(state, lotId) {
  const next = clone(state);
  const lot = next.finishedGoods.find((item) => item.id === lotId);
  if (!lot || lot.availableQuantity <= 0 || ['sold', 'delivered', 'scrapped'].includes(lot.status)) return next;

  const quantity = lot.availableQuantity;
  const salvageRate = Math.max(0.05, 0.12 / Math.sqrt(maintenanceMultiplier(next)));
  const scrapValue = Math.round((lot.unitSalePrice ?? 0) * quantity * salvageRate);
  const materialRecovery = lot.type === 'vessel'
    ? { rawOre: 2 * quantity, hullPlate: 2 * quantity, electronics: quantity }
    : lot.type === 'module'
      ? { rawOre: quantity, hullPlate: quantity }
      : { electronics: quantity };

  for (const [material, amount] of Object.entries(materialRecovery)) {
    next.inventory[material] = (next.inventory[material] ?? 0) + amount;
  }

  next.company.cash += scrapValue;
  lot.scrappedQuantity = (lot.scrappedQuantity ?? 0) + quantity;
  lot.availableQuantity = 0;
  lot.status = 'scrapped';
  lot.scrappedCycle = next.company.cycle;
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Scrapped ${quantity} x ${lot.designName}. Salvage returned CR ${scrapValue.toLocaleString('en-US')} plus materials at ${(salvageRate * 100).toFixed(1)}% cash recovery.`);
  return next;
}
