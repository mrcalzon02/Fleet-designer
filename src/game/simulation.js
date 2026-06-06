const clone = (value) => JSON.parse(JSON.stringify(value));

const currency = (amount) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}).format(amount).replace('$', 'CR ');

export function formatCredits(amount) {
  return currency(amount);
}

function canAffordBill(inventory, bill, quantity = 1) {
  return Object.entries(bill).every(([key, value]) => (inventory[key] ?? 0) >= value * quantity);
}

function spendBill(inventory, bill, quantity = 1) {
  for (const [key, value] of Object.entries(bill)) {
    inventory[key] = (inventory[key] ?? 0) - value * quantity;
  }
}

function buildProductionRun(design, quantity, purpose, options = {}) {
  const complexity = design.type === 'vessel' ? 4 : design.type === 'module' ? 3 : 2;
  return {
    id: `run-${Date.now()}-${Math.round(Math.random() * 10000)}`,
    designId: design.id,
    designName: design.name,
    type: design.type,
    quantity,
    purpose,
    revenueMode: options.revenueMode ?? 'market',
    contractId: options.contractId ?? null,
    progress: 0,
    required: complexity * quantity,
    unitCost: design.cost,
    unitSalePrice: design.salePrice,
    defectRisk: Math.max(4, 24 - Math.round(design.reliability / 4)),
    qaResult: null,
    stockLotId: null,
    status: 'queued',
  };
}

function warehouseUsed(next) {
  return next.finishedGoods.reduce((sum, lot) => sum + lot.quantity, 0);
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
    revenueMode: run.revenueMode,
    contractId: run.contractId,
    unitSalePrice: run.unitSalePrice,
    qaResult: run.qaResult,
    status: run.revenueMode === 'contract' ? 'reserved-contract' : 'available-market',
    createdCycle: next.company.cycle,
  };
  next.finishedGoods.push(lot);
  run.stockLotId = lot.id;
  return lot;
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
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Accepted ${contract.title} for ${contract.client}. Production still must be queued.`);
  return next;
}

export function queueProduction(state, designId, quantity = 1, purpose = 'market sale', options = {}) {
  const next = clone(state);
  const design = next.designs.find((item) => item.id === designId);
  if (!design) return next;

  if (warehouseUsed(next) + quantity > next.company.warehouseCapacity) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Production blocked. Finished goods warehouse is at capacity.`);
    return next;
  }

  if (!canAffordBill(next.inventory, design.bill, quantity)) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Production blocked. Materials unavailable for ${design.name}.`);
    return next;
  }

  spendBill(next.inventory, design.bill, quantity);
  next.productionRuns.push(buildProductionRun(design, quantity, purpose, options));

  next.company.cash -= Math.round(design.cost * quantity * 0.35);
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Queued ${quantity} x ${design.name} for ${purpose}.`);
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

  const existingRun = next.productionRuns.find((run) => run.contractId === contract.id && run.status !== 'complete');
  if (existingRun) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Contract production already active for ${contract.title}.`);
    return next;
  }

  if (contract.stockLotId) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Contract stock already exists for ${contract.title}.`);
    return next;
  }

  if (warehouseUsed(next) + contract.quantity > next.company.warehouseCapacity) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Contract production blocked. Finished goods warehouse is at capacity.`);
    return next;
  }

  if (!canAffordBill(next.inventory, design.bill, contract.quantity)) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Contract production blocked. Materials unavailable for ${contract.title}.`);
    return next;
  }

  spendBill(next.inventory, design.bill, contract.quantity);
  const run = buildProductionRun(design, contract.quantity, 'contract fulfillment', {
    contractId: contract.id,
    revenueMode: 'contract',
  });
  next.productionRuns.push(run);
  contract.productionRunId = run.id;
  next.company.cash -= Math.round(design.cost * contract.quantity * 0.35);
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Queued contract run for ${contract.title}. Payout reserved until delivery.`);
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

export function sellFinishedGood(state, lotId) {
  const next = clone(state);
  const lot = next.finishedGoods.find((item) => item.id === lotId);
  if (!lot || lot.status !== 'available-market' || lot.availableQuantity <= 0) return next;

  const gross = lot.unitSalePrice * lot.availableQuantity;
  const revenue = lot.qaResult === 'defective' ? Math.round(gross * 0.55) : gross;
  next.company.cash += revenue;
  next.company.reputation += lot.qaResult === 'defective' ? -2 : 1;
  lot.availableQuantity = 0;
  lot.status = 'sold';
  lot.soldCycle = next.company.cycle;
  next.eventLog.unshift(
    `Cycle ${next.company.cycle}: Sold ${lot.quantity} x ${lot.designName}. ${lot.qaResult === 'defective' ? 'Defects reduced payout.' : 'Batch passed market acceptance.'} Revenue ${currency(revenue)}.`
  );
  return next;
}

export function deliverContractStock(state, contractId) {
  const next = clone(state);
  const contract = next.contracts.find((item) => item.id === contractId);
  if (!contract || contract.status !== 'accepted') return next;

  const lot = next.finishedGoods.find((item) => (
    item.contractId === contract.id
    && item.status === 'reserved-contract'
    && item.availableQuantity >= contract.quantity
  ));

  if (!lot) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Delivery blocked. No finished contract stock ready for ${contract.title}.`);
    return next;
  }

  const defective = lot.qaResult === 'defective';
  const payout = defective ? Math.round(contract.reward * 0.72) : contract.reward;
  lot.availableQuantity -= contract.quantity;
  lot.status = 'delivered';
  lot.deliveredCycle = next.company.cycle;
  contract.status = 'fulfilled';
  contract.deliveredCycle = next.company.cycle;
  contract.stockLotId = lot.id;
  next.company.cash += payout;
  next.company.reputation += defective ? 1 : 4;
  next.eventLog.unshift(
    `Cycle ${next.company.cycle}: Delivered ${contract.title}. ${defective ? 'Client accepted at reduced payout.' : 'Contract fully satisfied.'} Contract payout ${currency(payout)}.`
  );
  return next;
}

function completeProduction(next, run) {
  const defective = Math.random() * 100 < run.defectRisk;
  run.qaResult = defective ? 'defective' : 'passed';
  const lot = addFinishedGoods(next, run);

  if (run.revenueMode === 'market') {
    next.eventLog.unshift(
      `Cycle ${next.company.cycle}: Completed ${run.quantity} x ${run.designName}. Stock lot ${lot.id} moved to finished goods for market sale. QA: ${run.qaResult}.`
    );
    return;
  }

  if (run.revenueMode === 'contract') {
    const contract = next.contracts.find((item) => item.id === run.contractId);
    if (contract) contract.stockLotId = lot.id;
    next.eventLog.unshift(
      `Cycle ${next.company.cycle}: Contract batch completed for ${run.designName}. Stock lot ${lot.id} reserved for delivery. QA: ${run.qaResult}.`
    );
    return;
  }

  next.eventLog.unshift(`Cycle ${next.company.cycle}: Completed internal production for ${run.designName}. Stock lot ${lot.id} stored.`);
}

function resolveContractDeadlines(next) {
  for (const contract of next.contracts) {
    if (contract.status !== 'accepted') continue;
    if (next.company.cycle > contract.deadline) {
      contract.status = 'failed';
      next.company.cash -= contract.penalty;
      next.company.reputation -= 5;
      next.eventLog.unshift(`Cycle ${next.company.cycle}: Failed ${contract.title}. Penalty ${currency(contract.penalty)}.`);
    }
  }
}

function progressResearch(next) {
  for (const project of next.research) {
    if (project.status !== 'active') continue;
    project.progress += 8 + project.engineers * 6;
    if (project.progress >= project.required) {
      project.progress = project.required;
      project.status = 'complete';
      if (project.discipline === 'supply chain') next.company.burnRate = Math.round(next.company.burnRate * 0.94);
      if (project.discipline === 'manufacturing') next.company.factoryCapacity += 1;
      next.eventLog.unshift(`Cycle ${next.company.cycle}: Research complete - ${project.name}. ${project.effect}.`);
    }
  }
}

function restockSpotMarket(next) {
  next.inventory.rawOre += 4;
  next.inventory.volatiles += 2;
  next.inventory.electronics += 2;
  next.inventory.hullPlate += 3;
  if (next.company.cycle % 3 === 0) next.inventory.driveCores += 1;
}

export function advanceCycle(state) {
  const next = clone(state);
  next.company.cycle += 1;
  next.company.cash -= next.company.burnRate;

  for (const run of next.productionRuns) {
    if (run.status === 'complete') continue;
    run.status = 'active';
    run.progress += next.company.factoryCapacity;
    if (run.progress >= run.required) {
      run.progress = run.required;
      run.status = 'complete';
      completeProduction(next, run);
    }
  }

  progressResearch(next);
  resolveContractDeadlines(next);
  restockSpotMarket(next);

  if (next.company.cash <= 0) {
    next.company.status = 'bankrupt';
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Bankruptcy triggered. Welcome to the intergalactic breadline.`);
  } else {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Cycle advanced. Burn paid, factories updated, markets shifted.`);
  }

  next.eventLog = next.eventLog.slice(0, 18);
  return next;
}
