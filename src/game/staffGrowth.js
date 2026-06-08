export const seniorityOrder = ['junior', 'associate', 'senior', 'principal'];

export function normalizeSeniority(value, skill = 1) {
  if (seniorityOrder.includes(value)) return value;
  if (skill >= 4) return 'principal';
  if (skill >= 3) return 'senior';
  if (skill >= 2) return 'associate';
  return 'junior';
}

export function xpNeededForNextSeniority(seniority = 'junior') {
  if (seniority === 'junior') return 60;
  if (seniority === 'associate') return 140;
  if (seniority === 'senior') return 280;
  return null;
}

export function senioritySalaryMultiplier(seniority = 'junior') {
  if (seniority === 'principal') return 1.28;
  if (seniority === 'senior') return 1.2;
  if (seniority === 'associate') return 1.13;
  return 1.08;
}

export function ensureStaffGrowthFields(engineer) {
  engineer.seniority = normalizeSeniority(engineer.seniority, engineer.skill ?? 1);
  engineer.experience = engineer.experience ?? 0;
  engineer.completedProjects = engineer.completedProjects ?? 0;
  engineer.specialtyExperience = engineer.specialtyExperience ?? {};
  engineer.promotionHistory = engineer.promotionHistory ?? [];
}

export function staffProgressLabel(engineer) {
  ensureStaffGrowthFields(engineer);
  const needed = xpNeededForNextSeniority(engineer.seniority);
  if (!needed) return 'maximum seniority';
  return `${engineer.experience}/${needed} XP to ${seniorityOrder[seniorityOrder.indexOf(engineer.seniority) + 1]}`;
}

export function grantStaffExperience(engineer, amount, discipline, reason = 'project work') {
  ensureStaffGrowthFields(engineer);
  const xp = Math.max(0, Math.round(amount));
  engineer.experience += xp;
  if (discipline) {
    engineer.specialtyExperience[discipline] = (engineer.specialtyExperience[discipline] ?? 0) + xp;
  }
  engineer.lastExperienceGain = { amount: xp, discipline, reason };
  return xp;
}

export function maybePromoteStaff(engineer, cycle = 0) {
  ensureStaffGrowthFields(engineer);
  const currentIndex = seniorityOrder.indexOf(engineer.seniority);
  if (currentIndex < 0 || currentIndex >= seniorityOrder.length - 1) return null;
  const required = xpNeededForNextSeniority(engineer.seniority);
  if (required === null || engineer.experience < required) return null;

  const previous = engineer.seniority;
  const nextSeniority = seniorityOrder[currentIndex + 1];
  engineer.experience -= required;
  engineer.seniority = nextSeniority;
  engineer.skill = Math.min(5, (engineer.skill ?? 1) + 1);
  engineer.salary = Math.round((engineer.salary ?? 60000) * senioritySalaryMultiplier(nextSeniority));
  engineer.morale = Math.min(100, (engineer.morale ?? 70) + 8);
  engineer.promotionHistory.push({ cycle, from: previous, to: nextSeniority, salary: engineer.salary });
  return { from: previous, to: nextSeniority, skill: engineer.skill, salary: engineer.salary };
}

export function grantResearchCycleExperience(engineer, project) {
  const specialtyMatch = engineer.specialty === project.discipline;
  const amount = specialtyMatch ? 5 : 3;
  return grantStaffExperience(engineer, amount, project.discipline, 'research cycle');
}

export function grantProjectCompletionExperience(engineer, project) {
  const specialtyMatch = engineer.specialty === project.discipline;
  const amount = specialtyMatch ? 24 : 14;
  engineer.completedProjects = (engineer.completedProjects ?? 0) + 1;
  return grantStaffExperience(engineer, amount, project.discipline, 'completed project');
}
