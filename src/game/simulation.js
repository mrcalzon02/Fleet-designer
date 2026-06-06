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
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Accepted ${contract.title} for ${contract.client}.`);
  return next;
}

export function queueProduction(state, designId, quantity = 1, purpose = 'market') {
  const next = clone(state);
  const design = next.designs.find((item) => item.id === designId);
  if (!design) return next;

  if (!canAffordBill(next.inventory, design.bill, quantity)) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Production blocked. Materials unavailable for ${design.name}.`);
    return next;
  }

  spendBill(next.inventory, design.bill, quantity);
  const complexity = design.type === 'vessel' ? 4 : design.type === 'module' ? 3 : 2;
  next.productionRuns.push({
    id: `run-${Date.now()}-${Math.round(Math.random() * 10000)}`,
    designId,
    designName: design.name,
    type: design.type,
    quantity,
    purpose,
    progress: 0,
    required: complexity * quantity,
    unitCost: design.cost,
    unitSalePrice: design.salePrice,
    defectRisk: Math.max(4, 24 - Math.round(design.reliability / 4)),
    status: 'queued',
  });

  next.company.cash -= Math.round(design.cost * quantity * 0.35);
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Queued ${quantity} × ${design.name} for ${purpose}.`);
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

function completeProduction(next, run) {
  const gross = run.unitSalePrice * run.quantity;
  const defective = Math.random() * 100 < run.defectRisk;
  const revenue = defective ? Math.round(gross * 0.55) : gross;
  next.company.cash += revenue;
  next.company.reputation += defective ? -2 : 1;
  next.eventLog.unshift(
    `Cycle ${next.company.cycle}: Completed ${run.quantity} × ${run.designName}. ${defective ? 'Defects reduced payout.' : 'Batch passed QA.'} Revenue ${currency(revenue)}.`
  );
}

function resolveContracts(next) {
  for (const contract of next.contracts) {
    if (contract.status !== 'accepted') continue;
    const design = next.designs.find((item) => item.id === contract.assignedDesignId);
    const matchingRun = next.productionRuns.find((run) => run.designId === contract.assignedDesignId && run.status === 'complete' && run.quantity >= contract.quantity);
    if (matchingRun && design) {
      contract.status = 'fulfilled';
      next.company.cash += contract.reward;
      next.company.reputation += 4;
      next.eventLog.unshift(`Cycle ${next.company.cycle}: Fulfilled ${contract.title}. Contract payout ${currency(contract.reward)}.`);
    } else if (next.company.cycle > contract.deadline) {
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
      next.eventLog.unshift(`Cycle ${next.company.cycle}: Research complete — ${project.name}. ${project.effect}.`);
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
  resolveContracts(next);
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
