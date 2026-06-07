export const contractSources = [
  {
    id: 'src-civic-ports-authority',
    name: 'Civic Ports Authority',
    type: 'public infrastructure',
    alignment: 'civic',
    minReputation: 20,
    reputationKey: 'civic',
    description: 'Municipal and orbital-port clients seeking safe, well-documented, moderately priced industrial equipment.',
    preferredTypes: ['component', 'module', 'vessel'],
    payoutBias: 0.95,
    reliabilityBias: 6,
    qualityBias: 2,
  },
  {
    id: 'src-frontier-logistics-coop',
    name: 'Frontier Logistics Cooperative',
    type: 'frontier cooperative',
    alignment: 'frontier',
    minReputation: 12,
    reputationKey: 'frontier',
    description: 'Remote operators that value rugged serviceability, forgiving terms, and usable delivery more than polished excellence.',
    preferredTypes: ['module', 'vessel'],
    payoutBias: 0.82,
    reliabilityBias: 2,
    qualityBias: -3,
  },
  {
    id: 'src-asterion-survey-bureau',
    name: 'Asterion Survey Bureau',
    type: 'science survey bureau',
    alignment: 'science',
    minReputation: 30,
    reputationKey: 'science',
    description: 'Survey clients needing precise, reliable, and well-instrumented designs for field deployments.',
    preferredTypes: ['component', 'module', 'vessel'],
    payoutBias: 1.12,
    reliabilityBias: 8,
    qualityBias: 8,
  },
  {
    id: 'src-heliofreight-combine',
    name: 'Heliofreight Combine',
    type: 'freight combine',
    alignment: 'industrial',
    minReputation: 18,
    reputationKey: 'industrial',
    description: 'Bulk logistics buyers that reward quantity, turnaround speed, and acceptable industrial reliability.',
    preferredTypes: ['module', 'vessel'],
    payoutBias: 1.0,
    reliabilityBias: 3,
    qualityBias: 0,
  },
  {
    id: 'src-red-dock-salvage-union',
    name: 'Red Dock Salvage Union',
    type: 'salvage syndicate',
    alignment: 'salvage',
    minReputation: 5,
    reputationKey: 'salvage',
    description: 'Rough buyers who accept ugly work, tolerate defects, and pay less for easier, dirtier jobs.',
    preferredTypes: ['component', 'module'],
    payoutBias: 0.68,
    reliabilityBias: -6,
    qualityBias: -8,
  },
  {
    id: 'src-warden-security-procurement',
    name: 'Warden Security Procurement',
    type: 'security procurement office',
    alignment: 'security',
    minReputation: 38,
    reputationKey: 'security',
    description: 'Security and patrol clients demanding high reliability, tight deadlines, and clean production records.',
    preferredTypes: ['module', 'vessel'],
    payoutBias: 1.22,
    reliabilityBias: 10,
    qualityBias: 6,
  },
  {
    id: 'src-orchid-executive-charters',
    name: 'Orchid Executive Charters',
    type: 'premium civilian client',
    alignment: 'premium',
    minReputation: 45,
    reputationKey: 'premium',
    description: 'Prestige buyers who pay well but demand exact results, clean finishes, and higher quality thresholds.',
    preferredTypes: ['module', 'vessel'],
    payoutBias: 1.35,
    reliabilityBias: 7,
    qualityBias: 12,
  },
  {
    id: 'src-free-miners-league',
    name: 'Free Miners League',
    type: 'resource extraction league',
    alignment: 'industrial',
    minReputation: 16,
    reputationKey: 'industrial',
    description: 'Mining operators seeking sturdy, affordable equipment and larger batch quantities.',
    preferredTypes: ['component', 'module', 'vessel'],
    payoutBias: 0.92,
    reliabilityBias: 4,
    qualityBias: -1,
  },
];

export const contractTemplates = [
  {
    id: 'ctpl-component-replacement',
    titleNoun: 'replacement batch',
    category: 'component order',
    requiredType: 'component',
    baseQuantity: 3,
    baseReward: 460000,
    basePenalty: 110000,
    baseDeadline: 6,
    description: 'Routine component replacement work with modest inspection requirements.',
  },
  {
    id: 'ctpl-module-retrofit',
    titleNoun: 'retrofit package',
    category: 'module order',
    requiredType: 'module',
    baseQuantity: 2,
    baseReward: 980000,
    basePenalty: 240000,
    baseDeadline: 7,
    description: 'Module-level refit work for ships, stations, depots, or industrial yards.',
  },
  {
    id: 'ctpl-vessel-tender',
    titleNoun: 'vessel tender',
    category: 'full vessel build',
    requiredType: 'vessel',
    baseQuantity: 1,
    baseReward: 2800000,
    basePenalty: 650000,
    baseDeadline: 8,
    description: 'A complete vessel order with contract acceptance gated by design credibility.',
  },
  {
    id: 'ctpl-urgent-yard-support',
    titleNoun: 'urgent yard support order',
    category: 'rush industrial support',
    requiredType: 'module',
    baseQuantity: 1,
    baseReward: 1200000,
    basePenalty: 420000,
    baseDeadline: 4,
    description: 'Short-deadline work with strong payout but harsher deadline risk.',
  },
  {
    id: 'ctpl-bulk-standardization',
    titleNoun: 'standardization lot',
    category: 'bulk standardization',
    requiredType: 'component',
    baseQuantity: 6,
    baseReward: 620000,
    basePenalty: 160000,
    baseDeadline: 9,
    description: 'Larger quantity standardization work with lower precision requirements and thin margins.',
  },
];

export function skullLabel(skulls = 1) {
  return `${'☠'.repeat(Math.max(1, Math.min(3, skulls)))} ${skulls}-skull`;
}

export function contractSourceById(sourceId) {
  return contractSources.find((source) => source.id === sourceId);
}

function companyAlignmentScore(company, source) {
  const alignments = company.alignmentFactors ?? {};
  const sourceRep = company.sourceReputation?.[source.reputationKey] ?? 0;
  return (alignments[source.alignment] ?? 0) + sourceRep;
}

export function sourceAvailableToCompany(company, source) {
  return (company.reputation ?? 0) + companyAlignmentScore(company, source) >= source.minReputation;
}

function seededPick(items, seed) {
  if (items.length === 0) return null;
  return items[Math.abs(seed) % items.length];
}

function skullsForCompany(company, seed) {
  const reputation = company.reputation ?? 0;
  if (reputation >= 55 && seed % 5 === 0) return 3;
  if (reputation >= 32 && seed % 3 !== 0) return 2;
  return 1;
}

function titleFor(source, template, skulls, cycle) {
  const prefixes = {
    civic: ['Public', 'Portside', 'Municipal'],
    frontier: ['Frontier', 'Remote', 'Field'],
    science: ['Survey', 'Instrumented', 'Expedition'],
    industrial: ['Industrial', 'Bulk', 'Yard'],
    salvage: ['Scrapline', 'Recovered', 'Dockside'],
    security: ['Patrol', 'Hardened', 'Security'],
    premium: ['Executive', 'Prestige', 'Cleanroom'],
  };
  const prefix = seededPick(prefixes[source.alignment] ?? ['Commercial'], cycle + skulls + source.id.length);
  return `${prefix} ${template.titleNoun}`;
}

function difficultyTerms(source, template, skulls) {
  const quantity = Math.max(1, Math.round(template.baseQuantity * (skulls === 1 ? 1 : skulls === 2 ? 1.45 : 2.1)));
  const reward = Math.round(template.baseReward * quantity * source.payoutBias * (skulls === 1 ? 0.85 : skulls === 2 ? 1.22 : 1.75));
  const penalty = Math.round(template.basePenalty * (skulls === 1 ? 0.75 : skulls === 2 ? 1.25 : 1.85));
  const deadline = Math.max(3, Math.round(template.baseDeadline + (skulls === 1 ? 3 : skulls === 2 ? 0 : -2)));
  const minQuality = Math.max(0, Math.round(35 + source.qualityBias + (skulls - 1) * 12));
  const minReliability = Math.max(0, Math.round(38 + source.reliabilityBias + (skulls - 1) * 11));
  const precision = skulls === 1 ? 'loose acceptance' : skulls === 2 ? 'documented acceptance' : 'exacting acceptance';
  return { quantity, reward, penalty, deadline, minQuality, minReliability, precision };
}

export function generateContractForCompany(state, seedOffset = 0) {
  const company = state.company ?? {};
  const cycle = company.cycle ?? 1;
  const seed = cycle * 17 + seedOffset * 31 + (company.reputation ?? 0);
  const eligibleSources = contractSources.filter((source) => sourceAvailableToCompany(company, source));
  const source = seededPick(eligibleSources.length ? eligibleSources : contractSources.slice(0, 3), seed);
  const preferredTemplates = contractTemplates.filter((template) => source.preferredTypes.includes(template.requiredType));
  const template = seededPick(preferredTemplates.length ? preferredTemplates : contractTemplates, seed + source.id.length);
  const skulls = skullsForCompany(company, seed + template.id.length);
  const terms = difficultyTerms(source, template, skulls);
  const deadline = cycle + terms.deadline;
  return {
    id: `ct-gen-${cycle}-${seedOffset}-${source.id}`,
    client: source.name,
    sourceId: source.id,
    sourceType: source.type,
    alignment: source.alignment,
    title: titleFor(source, template, skulls, cycle),
    category: template.category,
    requiredType: template.requiredType,
    quantity: terms.quantity,
    deadline,
    reward: terms.reward,
    penalty: terms.penalty,
    status: 'open',
    assignedDesignId: null,
    productionRunId: null,
    stockLotId: null,
    deliveredQuantity: 0,
    earnedReward: 0,
    skulls,
    precision: terms.precision,
    minCompanyReputation: source.minReputation,
    minQuality: terms.minQuality,
    minReliability: terms.minReliability,
    description: `${source.description} ${template.description}`,
  };
}

export function replenishOpenContracts(next, targetOpenContracts = 5) {
  next.contracts = next.contracts ?? [];
  const openCount = next.contracts.filter((contract) => contract.status === 'open').length;
  const toCreate = Math.max(0, targetOpenContracts - openCount);
  for (let index = 0; index < Math.min(2, toCreate); index += 1) {
    const generated = generateContractForCompany(next, index + next.contracts.length);
    if (!next.contracts.some((contract) => contract.id === generated.id)) {
      next.contracts.push(generated);
      next.eventLog.unshift(`Cycle ${next.company.cycle}: New ${skullLabel(generated.skulls)} contract posted by ${generated.client}: ${generated.title}.`);
    }
  }
}
