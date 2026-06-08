import { getDifficultyProfile } from './difficultyProfiles.js';
import { technologyTree } from './nodeLibrary.js';
import { ensureStaffGrowthFields, grantProjectCompletionExperience, grantResearchCycleExperience, maybePromoteStaff, staffProgressLabel } from './staffGrowth.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

function researchPool(state) {
  return state.researchers ?? [];
}

function projectResearchers(state, projectId) {
  return researchPool(state).filter((researcher) => researcher.assignedProjectId === projectId);
}

function researchTimeMultiplier(state) {
  return getDifficultyProfile(state.company?.difficultyId ?? 'normal').multipliers.researchTime ?? 1;
}

function unlockTechnology(next, techId) {
  if (!techId) return;
  const tech = technologyTree.find((item) => item.id === techId);
  if (!tech) return;

  next.company.unlockedTechIds = next.company.unlockedTechIds ?? [];
  next.company.unlockedNodeIds = next.company.unlockedNodeIds ?? [];

  if (!next.company.unlockedTechIds.includes(tech.id)) {
    next.company.unlockedTechIds.push(tech.id);
  }

  const unlocked = [];
  for (const nodeId of tech.unlocks ?? []) {
    if (!next.company.unlockedNodeIds.includes(nodeId)) {
      next.company.unlockedNodeIds.push(nodeId);
      unlocked.push(nodeId);
    }
  }

  if (unlocked.length > 0) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Technology unlocked - ${tech.name}. New component nodes available: ${unlocked.join(', ')}.`);
  }
}

function logPromotion(next, researcher, promotion) {
  if (!promotion) return;
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Research promotion - ${researcher.name} advanced from ${promotion.from} to ${promotion.to}. Skill ${promotion.skill}, salary CR ${promotion.salary.toLocaleString('en-US')}.`);
}

export function calculateResearchProgress(state, project) {
  const assigned = projectResearchers(state, project.id);
  if (assigned.length === 0) return 0;

  const rawProgress = assigned.reduce((sum, researcher) => {
    ensureStaffGrowthFields(researcher);
    const specialtyMatch = researcher.specialty === project.discipline ? 4 : 0;
    const moraleBonus = researcher.morale >= 80 ? 2 : researcher.morale < 50 ? -1 : 0;
    const fatiguePenalty = researcher.fatigue >= 75 ? 4 : researcher.fatigue >= 50 ? 2 : 0;
    return sum + Math.max(1, researcher.skill * 5 + specialtyMatch + moraleBonus - fatiguePenalty);
  }, 0);

  return Math.max(1, Math.round(rawProgress / researchTimeMultiplier(state)));
}

export function researchStaffSummary(state, projectId) {
  const assigned = projectResearchers(state, projectId);
  for (const researcher of assigned) ensureStaffGrowthFields(researcher);
  return {
    assigned,
    progressPerCycle: calculateResearchProgress(state, state.research.find((project) => project.id === projectId) ?? {}),
    difficultyTimeMultiplier: researchTimeMultiplier(state),
  };
}

export function assignResearcherToProject(state, researcherId, projectId) {
  const next = clone(state);
  next.researchers = next.researchers ?? [];
  const researcher = next.researchers.find((item) => item.id === researcherId);
  const project = next.research.find((item) => item.id === projectId);
  if (!researcher || !project || project.status === 'complete') return next;

  ensureStaffGrowthFields(researcher);
  researcher.assignedProjectId = projectId;
  project.stalled = false;
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Assigned researcher ${researcher.name} to ${project.name}. ${staffProgressLabel(researcher)}.`);
  return next;
}

export function unassignResearcher(state, researcherId) {
  const next = clone(state);
  next.researchers = next.researchers ?? [];
  const researcher = next.researchers.find((item) => item.id === researcherId);
  if (!researcher) return next;

  const project = next.research.find((item) => item.id === researcher.assignedProjectId);
  researcher.assignedProjectId = null;
  if (project && !next.researchers.some((item) => item.assignedProjectId === project.id)) {
    project.stalled = project.status !== 'complete';
  }
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Unassigned researcher ${researcher.name} from R&D work.`);
  return next;
}

// Backward-compatible aliases used by older UI wiring.
export const assignEngineerToProject = assignResearcherToProject;
export const unassignEngineer = unassignResearcher;

export function progressResearchProjects(next) {
  next.researchers = next.researchers ?? [];
  for (const researcher of next.researchers) ensureStaffGrowthFields(researcher);

  for (const project of next.research) {
    if (project.status !== 'active') continue;

    const gain = calculateResearchProgress(next, project);
    project.lastProgress = gain;
    project.stalled = gain <= 0;
    if (gain <= 0) continue;

    project.progress += gain;
    for (const researcher of next.researchers.filter((item) => item.assignedProjectId === project.id)) {
      grantResearchCycleExperience(researcher, project);
      logPromotion(next, researcher, maybePromoteStaff(researcher, next.company.cycle));
      researcher.fatigue = Math.min(100, researcher.fatigue + 4);
      researcher.morale = Math.max(0, researcher.morale - (researcher.fatigue > 70 ? 2 : 0));
    }

    if (project.progress >= project.required) {
      project.progress = project.required;
      project.status = 'complete';
      project.stalled = false;
      for (const researcher of next.researchers.filter((item) => item.assignedProjectId === project.id)) {
        grantProjectCompletionExperience(researcher, project);
        logPromotion(next, researcher, maybePromoteStaff(researcher, next.company.cycle));
        researcher.assignedProjectId = null;
        researcher.morale = Math.min(100, researcher.morale + 6);
      }
      if (project.discipline === 'supply chain') next.company.burnRate = Math.round(next.company.burnRate * 0.94);
      if (project.discipline === 'manufacturing') next.company.factoryCapacity += 1;
      unlockTechnology(next, project.unlockTechId);
      next.eventLog.unshift(`Cycle ${next.company.cycle}: Research complete - ${project.name}. ${project.effect}.`);
    }
  }

  for (const researcher of next.researchers.filter((item) => !item.assignedProjectId)) {
    researcher.fatigue = Math.max(0, researcher.fatigue - 5);
    researcher.morale = Math.min(100, researcher.morale + 1);
  }
}
