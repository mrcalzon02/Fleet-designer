const clone = (value) => JSON.parse(JSON.stringify(value));

const expansionOptions = [
  {
    id: 'build-owned-line',
    label: 'Build Owned Production Line',
    mode: 'build',
    description: 'Construct a permanent line. Expensive up front, moderate permanent burn increase.',
    lineDelta: 1,
    capacityDelta: 2,
    baseCost: 1850000,
    burnDelta: 115000,
    maxUses: 99,
  },
  {
    id: 'buy-used-line',
    label: 'Buy Used Production Line',
    mode: 'buy',
    description: 'Purchase a used line from the secondary industrial market. Cheaper, dirtier, higher burn.',
    lineDelta: 1,
    capacityDelta: 1,
    baseCost: 1180000,
    burnDelta: 145000,
    maxUses: 99,
  },
  {
    id: 'lease-yard-space',
    label: 'Lease Yard Space',
    mode: 'lease',
    description: 'Lease outside production capacity. Low upfront cost, ugly recurring burn, can be stacked quickly.',
    lineDelta: 1,
    capacityDelta: 1,
    baseCost: 420000,
    burnDelta: 230000,
    maxUses: 99,
  },
  {
    id: 'research-optimized-line',
    label: 'Research-Optimized Line Upgrade',
    mode: 'research-expanded',
    description: 'Convert completed manufacturing research into a cleaner line expansion. Requires completed manufacturing research.',
    lineDelta: 1,
    capacityDelta: 3,
    baseCost: 1450000,
    burnDelta: 90000,
    requiresCompletedDiscipline: 'manufacturing',
    maxUses: 99,
  },
];

function expansionCount(company, optionId) {
  return (company.factoryExpansionHistory ?? []).filter((entry) => entry.optionId === optionId).length;
}

export function getFactoryExpansionOptions(state) {
  const company = state.company ?? {};
  const completedResearch = state.research ?? [];
  return expansionOptions.map((option) => {
    const count = expansionCount(company, option.id);
    const scaling = 1 + count * 0.22 + Math.max(0, (company.productionLineCapacity ?? 5) - 5) * 0.045;
    const cost = Math.round(option.baseCost * scaling);
    const requiresCompleted = option.requiresCompletedDiscipline;
    const hasResearch = !requiresCompleted || completedResearch.some((project) => project.discipline === requiresCompleted && project.status === 'complete');
    const underUseLimit = count < option.maxUses;
    return {
      ...option,
      cost,
      uses: count,
      available: hasResearch && underUseLimit,
      unavailableReason: !hasResearch ? `Requires completed ${requiresCompleted} research.` : !underUseLimit ? 'Expansion option exhausted.' : null,
    };
  });
}

export function factoryLoadSummary(state) {
  const activeRuns = (state.productionRuns ?? []).filter((run) => ['queued', 'active'].includes(run.status)).length;
  const ownedLines = state.company?.productionLineCapacity ?? 5;
  const ratio = ownedLines <= 0 ? activeRuns : activeRuns / ownedLines;
  let label = 'comfortable owned capacity';
  if (activeRuns === 0) label = 'idle factory capacity';
  else if (ratio <= 1) label = 'within owned capacity';
  else if (ratio <= 1.5) label = 'overbooked factory floor';
  else if (ratio <= 2.25) label = 'severe production overextension';
  else label = 'chaotic line overcommitment';
  return {
    activeRuns,
    ownedLines,
    ratio: Number(ratio.toFixed(2)),
    label,
  };
}

export function purchaseFactoryExpansion(state, optionId) {
  const next = clone(state);
  const option = getFactoryExpansionOptions(next).find((item) => item.id === optionId);
  if (!option) return next;
  if (!option.available) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Factory expansion blocked. ${option.unavailableReason ?? 'Option unavailable.'}`);
    return next;
  }
  if (next.company.cash < option.cost) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Factory expansion blocked. ${option.label} requires ${option.cost.toLocaleString('en-US')} credits.`);
    return next;
  }

  next.company.cash -= option.cost;
  next.company.productionLineCapacity = (next.company.productionLineCapacity ?? 5) + option.lineDelta;
  next.company.factoryCapacity = (next.company.factoryCapacity ?? 6) + option.capacityDelta;
  next.company.burnRate = (next.company.burnRate ?? 0) + option.burnDelta;
  next.company.factoryExpansionHistory = next.company.factoryExpansionHistory ?? [];
  next.company.factoryExpansionHistory.unshift({
    cycle: next.company.cycle,
    optionId: option.id,
    label: option.label,
    mode: option.mode,
    cost: option.cost,
    lineDelta: option.lineDelta,
    capacityDelta: option.capacityDelta,
    burnDelta: option.burnDelta,
  });

  next.eventLog.unshift(`Cycle ${next.company.cycle}: Factory expansion complete - ${option.label}. Lines +${option.lineDelta}, capacity +${option.capacityDelta}, burn +${option.burnDelta.toLocaleString('en-US')}/cycle, cost ${option.cost.toLocaleString('en-US')}.`);
  return next;
}
