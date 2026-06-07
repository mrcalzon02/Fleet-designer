import { difficultyMultiplier } from './difficultyEffects.js';
import { describeRivalBehaviorAtTechLevel, rivalTemplateById, rivalTemplatesForDifficulty } from './rivalCompanyTemplates.js';

function seedFromText(text) {
  return [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0);
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
  }
}

export function totalRivalMarketPressure(state) {
  return (state.rivalCompanies ?? []).reduce((sum, rival) => sum + (rival.marketShare ?? 0) * (rival.aggressionIndex ?? 0.5), 0);
}
