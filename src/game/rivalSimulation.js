import { difficultyMultiplier } from './difficultyEffects.js';
import { describeRivalBehaviorAtTechLevel, rivalTemplateById, rivalTemplatesForDifficulty } from './rivalCompanyTemplates.js';

function seedFromText(text) {
  return [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function titleCase(value) {
  return `${value ?? 'utility'}`.replace(/(^|\s|-)([a-z])/g, (match) => match.toUpperCase()).replace(/-/g, ' ');
}

function preferredListingType(rival) {
  if ((rival.preferredVehicleClasses ?? []).some((item) => item.includes('vessel') || item.includes('craft') || item.includes('hauler') || item.includes('runner'))) return 'vessel';
  if ((rival.preferredModuleCategories ?? []).length > 0) return 'module';
  return 'component';
}

function listingBasePrice(type, techLevel) {
  const base = type === 'vessel' ? 2600000 : type === 'module' ? 980000 : 420000;
  return Math.round(base * (1 + Math.max(0, techLevel - 1) * 0.18));
}

function pricingMultiplier(strategy) {
  if (`${strategy}`.includes('premium')) return 1.35;
  if (`${strategy}`.includes('underbid')) return 0.82;
  if (`${strategy}`.includes('discount')) return 0.72;
  if (`${strategy}`.includes('value')) return 0.95;
  if (`${strategy}`.includes('performance')) return 1.18;
  return 1;
}

function listingNameForRival(rival) {
  const category = rival.preferredModuleCategories?.[0] ?? 'utility';
  const vehicle = rival.preferredVehicleClasses?.[0] ?? 'utility vessel';
  const type = preferredListingType(rival);
  const mark = `TL-${rival.techLevel}`;
  if (type === 'vessel') return `${rival.name.split(' ')[0]} ${titleCase(vehicle)} ${mark}`;
  if (type === 'module') return `${rival.name.split(' ')[0]} ${titleCase(category)} Module ${mark}`;
  return `${rival.name.split(' ')[0]} ${titleCase(category)} Component ${mark}`;
}

function buildRivalListing(rival, cycle) {
  const type = preferredListingType(rival);
  const quality = Math.max(35, Math.min(92, 44 + (rival.techLevel ?? 1) * 5 + Math.round((rival.researchSpeedIndex ?? 1) * 2)));
  const reliability = Math.max(30, Math.min(90, 46 + (rival.techLevel ?? 1) * 4 - Math.round((rival.aggressionIndex ?? 0.5) * 2)));
  const price = Math.round(listingBasePrice(type, rival.techLevel ?? 1) * pricingMultiplier(rival.pricingStrategy));
  return {
    id: `mk-rival-${rival.id}-${cycle}-${rival.techLevel}`,
    seller: rival.name,
    sellerId: rival.id,
    designName: listingNameForRival(rival),
    type,
    price,
    license: true,
    source: 'rival-generated',
    quality,
    reliability,
    category: rival.preferredModuleCategories?.[0] ?? 'utility',
    expiresCycle: cycle + 6,
  };
}

function hasRecentListing(next, rival) {
  const cycle = next.company?.cycle ?? 0;
  return (next.marketListings ?? []).some((listing) => listing.sellerId === rival.id && (listing.expiresCycle ?? cycle) >= cycle);
}

function pruneExpiredRivalListings(next) {
  const cycle = next.company?.cycle ?? 0;
  next.marketListings = (next.marketListings ?? []).filter((listing) => listing.source !== 'rival-generated' || (listing.expiresCycle ?? cycle) >= cycle);
}

function maybeGenerateRivalListing(next, rival) {
  if (hasRecentListing(next, rival)) return;
  const offerChance = Math.min(0.45, 0.08 + (rival.marketShare ?? 1) / 100 + (rival.contractBidAggression ?? 0.5) * 0.04);
  if (Math.random() > offerChance) return;

  const listing = buildRivalListing(rival, next.company.cycle);
  next.marketListings.unshift(listing);
  next.marketListings = next.marketListings.slice(0, 18);
  rival.lastAction = `Posted license offer: ${listing.designName}.`;
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Rival market - ${rival.name} listed ${listing.designName} license for CR ${listing.price.toLocaleString('en-US')}.`);
}

function contractMatchesRival(contract, rival) {
  if (contract.requiredType === 'module') return (rival.preferredModuleCategories ?? []).length > 0;
  if (contract.requiredType === 'vessel') return (rival.preferredVehicleClasses ?? []).length > 0;
  return true;
}

function contestRequirementsFor(rival, contract, cycle) {
  const pressure = Math.max(0.5, (rival.contractBidAggression ?? 0.5) + (rival.marketShare ?? 1) / 100);
  const minQuality = Math.max(contract.minQuality ?? 0, Math.min(88, Math.round(42 + (rival.techLevel ?? 1) * 4 + pressure * 6)));
  const minReliability = Math.max(contract.minReliability ?? 0, Math.min(90, Math.round(45 + (rival.techLevel ?? 1) * 3 + pressure * 5)));
  const deadlinePressure = Math.max(0, Math.min(3, Math.round(pressure)));
  const effectiveDeadline = Math.max(cycle + 2, (contract.deadline ?? cycle + 4) - deadlinePressure);
  return { minQuality, minReliability, effectiveDeadline, pressure: Number(pressure.toFixed(2)) };
}

function maybeContestContract(next, rival) {
  const openContracts = (next.contracts ?? []).filter((contract) => contract.status === 'open' && !contract.contestedBy && contractMatchesRival(contract, rival));
  if (openContracts.length === 0) return;
  const contestChance = Math.min(0.35, 0.05 + (rival.contractBidAggression ?? 0.5) * 0.08 + (rival.marketShare ?? 1) / 180);
  if (Math.random() > contestChance) return;

  const contract = openContracts[Math.abs((next.company.cycle ?? 0) + rival.id.length) % openContracts.length];
  const requirements = contestRequirementsFor(rival, contract, next.company.cycle ?? 0);
  contract.contestedBy = rival.name;
  contract.contestedById = rival.id;
  contract.contestedCycle = next.company.cycle;
  contract.contestPressure = requirements.pressure;
  contract.minQuality = requirements.minQuality;
  contract.minReliability = requirements.minReliability;
  contract.effectiveDeadline = requirements.effectiveDeadline;
  rival.lastAction = `Contested contract: ${contract.title}.`;
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Rival contract pressure - ${rival.name} contested ${contract.title}. Minimum quality ${contract.minQuality}, reliability ${contract.minReliability}, effective deadline C${contract.effectiveDeadline}.`);
}

export function instantiateRivalCompany(template, index = 0, difficultyId = 'normal') {
  const seed = seedFromText(template.id) + index * 37;
  const aggressionPressure = difficultyMultiplier({ company: { difficultyId } }, 'rivalAggression');
  const marketPressure = difficultyMultiplier({ company: { difficultyId } }, 'rivalMarketPressure');
  const researchPressure = difficultyMultiplier({ company: { difficultyId } }, 'rivalResearchSpeed');
  const marketShare = Math.max(1, Math.round((template.marketShareBias ?? 0.05) * 100 + index + (seed % 4)));

  return {
    id: template.id,
    templateId: template.id,
    name: template.name,
    archetype: template.archetype,
    status: 'active',
    cash: 6000000 + seed * 1200,
    techLevel: 1 + (seed % 3),
    marketShare,
    aggressionIndex: Number(((template.aggressionIndex ?? 0.5) * aggressionPressure).toFixed(2)),
    contractBidAggression: Number(((template.contractBidAggression ?? 0.5) * marketPressure).toFixed(2)),
    researchSpeedIndex: Number(researchPressure.toFixed(2)),
    pricingStrategy: template.pricingStrategy,
    licensingStrategy: template.licensingStrategy,
    preferredModuleCategories: [...(template.preferredModuleCategories ?? [])],
    preferredVehicleClasses: [...(template.preferredVehicleClasses ?? [])],
    researchPreferences: [...(template.researchPreferences ?? [])],
    advantages: [...(template.advantages ?? [])],
    disadvantages: [...(template.disadvantages ?? [])],
    currentBehavior: describeRivalBehaviorAtTechLevel(template, 1 + (seed % 3)),
    lastAction: 'Established market watch profile.',
  };
}

export function instantiateRivalsForDifficulty(difficultyId = 'normal') {
  return rivalTemplatesForDifficulty(difficultyId).map((template, index) => instantiateRivalCompany(template, index, difficultyId));
}

export function refreshRivalCompanyState(state) {
  return instantiateRivalsForDifficulty(state.company?.difficultyId ?? 'normal');
}

export function rivalTemplateForCompany(rival) {
  return rivalTemplateById(rival.templateId ?? rival.id);
}

export function advanceRivalCompanies(next) {
  if (!next.rivalCompanies) {
    next.rivalCompanies = refreshRivalCompanyState(next);
  }

  pruneExpiredRivalListings(next);
  const marketPressure = difficultyMultiplier(next, 'rivalMarketPressure');
  const researchPressure = difficultyMultiplier(next, 'rivalResearchSpeed');

  for (const rival of next.rivalCompanies) {
    const template = rivalTemplateForCompany(rival);
    if (!template || rival.status !== 'active') continue;

    const researchChance = Math.min(0.35, 0.08 * researchPressure + (rival.aggressionIndex ?? 0.5) * 0.02);
    if (Math.random() < researchChance) {
      rival.techLevel = Math.min(10, (rival.techLevel ?? 1) + 1);
      rival.currentBehavior = describeRivalBehaviorAtTechLevel(template, rival.techLevel);
      rival.lastAction = `Advanced research posture to tech level ${rival.techLevel}.`;
      next.eventLog.unshift(`Cycle ${next.company.cycle}: Rival watch - ${rival.name} advanced to tech level ${rival.techLevel}.`);
    } else {
      const shareDelta = ((rival.contractBidAggression ?? 0.5) * marketPressure) > 0.9 ? 1 : 0;
      rival.marketShare = Math.max(1, Math.min(45, (rival.marketShare ?? 1) + shareDelta));
      rival.lastAction = shareDelta ? 'Captured marginal contract visibility.' : 'Maintained current market posture.';
    }

    maybeGenerateRivalListing(next, rival);
    maybeContestContract(next, rival);
  }
}

export function totalRivalMarketPressure(state) {
  return (state.rivalCompanies ?? []).reduce((sum, rival) => sum + (rival.marketShare ?? 0) * (rival.aggressionIndex ?? 0.5), 0);
}
