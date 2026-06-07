import { getDifficultyProfile } from './difficultyProfiles.js';
import { rivalTemplatesForDifficulty } from './rivalCompanyTemplates.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

export function setCompanyDifficulty(state, difficultyId) {
  const next = clone(state);
  const profile = getDifficultyProfile(difficultyId);
  const rivals = rivalTemplatesForDifficulty(profile.id);

  next.company.difficultyId = profile.id;
  next.company.difficultyName = profile.name;
  next.company.rivalCompanyIds = rivals.map((rival) => rival.id);
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Campaign pressure set to ${profile.name}. Rival roster target: ${profile.rivalCompanyCount}.`);
  return next;
}

export function activeDifficultyId(state) {
  return state.company?.difficultyId ?? 'normal';
}
