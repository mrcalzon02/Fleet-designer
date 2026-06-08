import { getDifficultyProfile } from './difficultyProfiles.js';
import { technologyTree } from './nodeLibrary.js';
import { ensureStaffGrowthFields, grantProjectCompletionExperience, grantResearchCycleExperience, maybePromoteStaff, staffProgressLabel } from './staffGrowth.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

function projectEngineers(state, projectId) {
  return state.engineers.filter((engineer) => engineer.assignedProjectId === projectId);
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

function logPromotion(next, engineer, promotion) {
  if (!promotion) return;
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Staff promotion - ${engineer.name} advanced from ${promotion.from} to ${promotion.to}. Skill ${promotion.skill}, salary CR ${promotion.salary.toLocaleString('en-US')}.`);
}

export function calculateResearchProgress(state, project) {
  const assigned = projectEngineers(state, project.id);
  if (assigned.length === 0) return 0;

  const rawProgress = assigned.reduce((sum, engineer) => {
    ensureStaffGrowthFields(engineer);
    const specialtyMatch = engineer.specialty === project.discipline ? 4 : 0;
    const moraleBonus = engineer.morale >= 80 ? 2 : engineer.morale < 50 ? -1 : 0;
    const fatiguePenalty = engineer.fatigue >= 75 ? 4 : engineer.fatigue >= 50 ? 2 : 0;
    return sum + Math.max(1, engineer.skill * 5 + specialtyMatch + moraleBonus - fatiguePenalty);
  }, 0);

  return Math.max(1, Math.round(rawProgress / researchTimeMultiplier(state)));
}

export function researchStaffSummary(state, projectId) {
  const assigned = projectEngineers(state, projectId);
  for (const engineer of assigned) ensureStaffGrowthFields(engineer);
  return {
    assigned,
    progressPerCycle: calculateResearchProgress(state, state.research.find((project) => project.id === projectId) ?? {}),
    difficultyTimeMultiplier: researchTimeMultiplier(state),
  };
}

export function assignEngineerToProject(state, engineerId, projectId) {
  const next = clone(state);
  const engineer = next.engineers.find((item) => item.id === engineerId);
  const project = next.research.find((item) => item.id === projectId);
  if (!engineer || !project || project.status === 'complete') return next;

  ensureStaffGrowthFields(engineer);
  engineer.assignedProjectId = projectId;
  project.stalled = false;
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Assigned ${engineer.name} to ${project.name}. ${staffProgressLabel(engineer)}.`);
  return next;
}

export function unassignEngineer(state, engineerId) {
  const next = clone(state);
  const engineer = next.engineers.find((item) => item.id === engineerId);
  if (!engineer) return next;

  const project = next.research.find((item) => item.id === engineer.assignedProjectId);
  engineer.assignedProjectId = null;
  if (project && !next.engineers.some((item) => item.assignedProjectId === project.id)) {
    project.stalled = project.status !== 'complete';
  }
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Unassigned ${engineer.name} from R&D work.`);
  return next;
}

export function progressResearchProjects(next) {
  for (const engineer of next.engineers) ensureStaffGrowthFields(engineer);

  for (const project of next.research) {
    if (project.status !== 'active') continue;

    const gain = calculateResearchProgress(next, project);
    project.lastProgress = gain;
    project.stalled = gain <= 0;
    if (gain <= 0) continue;

    project.progress += gain;
    for (const engineer of next.engineers.filter((item) => item.assignedProjectId === project.id)) {
      grantResearchCycleExperience(engineer, project);
      logPromotion(next, engineer, maybePromoteStaff(engineer, next.company.cycle));
      engineer.fatigue = Math.min(100, engineer.fatigue + 4);
      engineer.morale = Math.max(0, engineer.morale - (engineer.fatigue > 70 ? 2 : 0));
    }

    if (project.progress >= project.required) {
      project.progress = project.required;
      project.status = 'complete';
      project.stalled = false;
      for (const engineer of next.engineers.filter((item) => item.assignedProjectId === project.id)) {
        grantProjectCompletionExperience(engineer, project);
        logPromotion(next, engineer, maybePromoteStaff(engineer, next.company.cycle));
        engineer.assignedProjectId = null;
        engineer.morale = Math.min(100, engineer.morale + 6);
      }
      if (project.discipline === 'supply chain') next.company.burnRate = Math.round(next.company.burnRate * 0.94);
      if (project.discipline === 'manufacturing') next.company.factoryCapacity += 1;
      unlockTechnology(next, project.unlockTechId);
      next.eventLog.unshift(`Cycle ${next.company.cycle}: Research complete - ${project.name}. ${project.effect}.`);
    }
  }

  for (const engineer of next.engineers.filter((item) => !item.assignedProjectId)) {
    engineer.fatigue = Math.max(0, engineer.fatigue - 5);
    engineer.morale = Math.min(100, engineer.morale + 1);
  }
}
