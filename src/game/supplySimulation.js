const clone = (value) => JSON.parse(JSON.stringify(value));

function normalizeQuantity(value, fallback = 1) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(1, parsed);
}

function materialLabel(state, material) {
  return state.commodities?.[material]?.label ?? material;
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
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Bought ${purchaseQuantity} x ${materialLabel(next, material)} on the spot market for CR ${cost.toLocaleString('en-US')}.`);
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
