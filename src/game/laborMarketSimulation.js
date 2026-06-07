import { difficultyMultiplier } from './difficultyEffects.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

const staffNames = [
  'Ari Vale', 'Jun Tamsin', 'Pavel Korr', 'Mika Soren', 'Etta Nox', 'Sable Renn', 'Cass Orvin', 'Nara Pell',
  'Tovin Hale', 'Iris Vox', 'Rook Seld', 'Vela Tor', 'Ember Quill', 'Dax Marrow', 'Lio Fen', 'Nyra Sol',
];

const specialties = ['supply chain', 'manufacturing', 'propulsion', 'materials', 'reactor', 'automation', 'contracts'];
const seniorityBands = ['junior', 'associate', 'senior', 'principal'];

function pickIndex(seed, length) {
  return Math.abs(seed) % length;
}

function skillForSeniority(seniority) {
  if (seniority === 'principal') return 4;
  if (seniority === 'senior') return 3;
  if (seniority === 'associate') return 2;
  return 1;
}

function normalizeSpecialty(value) {
  if (`${value}`.includes('power')) return 'reactor';
  if (`${value}`.includes('automation')) return 'automation';
  if (`${value}`.includes('supply')) return 'supply chain';
  if (`${value}`.includes('structure') || `${value}`.includes('thermal')) return 'materials';
  if (`${value}`.includes('manufacturing')) return 'manufacturing';
  if (`${value}`.includes('propulsion')) return 'propulsion';
  return specialties.includes(value) ? value : 'manufacturing';
}

function salaryForCandidate(state, specialty, skill) {
  const premium = specialty === 'reactor' || specialty === 'automation' ? 1.18 : specialty === 'contracts' ? 1.08 : 1;
  const pressure = difficultyMultiplier(state, 'engineerLaborCost');
  return Math.round((52000 + skill * 26000) * premium * pressure);
}

function signingBonus(candidate) {
  return Math.round((candidate.salary ?? 80000) * (candidate.skill >= 4 ? 1.8 : candidate.skill >= 3 ? 1.25 : 0.75));
}

function generateApplicant(state, offset = 0) {
  const cycle = state.company?.cycle ?? 1;
  const seed = cycle * 41 + (state.company?.reputation ?? 0) * 7 + offset * 19;
  const seniority = seniorityBands[pickIndex(seed, seniorityBands.length)];
  const specialty = specialties[pickIndex(seed + 3, specialties.length)];
  const skill = skillForSeniority(seniority);
  const salary = salaryForCandidate(state, specialty, skill);
  const name = staffNames[pickIndex(seed + 11, staffNames.length)];
  return {
    id: `app-${cycle}-${offset}-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    specialty,
    skill,
    salary,
    seniority,
    morale: 68 + pickIndex(seed, 24),
    fatigue: pickIndex(seed + 5, 12),
    signingBonus: signingBonus({ salary, skill }),
    postedCycle: cycle,
    expiresCycle: cycle + 3 + pickIndex(seed, 3),
    profile: `${seniority} ${specialty} operator seeking a stable industrial yard and credible project pipeline.`,
  };
}

function generateRivalStaffMember(rival, index = 0) {
  const seed = rival.id.length * 29 + index * 17 + (rival.techLevel ?? 1) * 13;
  const preferred = rival.researchPreferences?.[index % Math.max(1, rival.researchPreferences.length)] ?? specialties[pickIndex(seed, specialties.length)];
  const specialty = normalizeSpecialty(preferred);
  const seniority = seniorityBands[pickIndex(seed + 5, seniorityBands.length)];
  const skill = Math.min(5, skillForSeniority(seniority) + ((rival.techLevel ?? 1) >= 5 ? 1 : 0));
  const salary = Math.round((64000 + skill * 32000) * (1 + (rival.marketShare ?? 4) / 120));
  const loyalty = Math.max(25, Math.min(95, 52 + pickIndex(seed + 9, 38) + Math.round((rival.marketShare ?? 4) / 2)));
  return {
    id: `rst-${rival.id}-${index}`,
    name: staffNames[pickIndex(seed + 7, staffNames.length)],
    specialty,
    seniority,
    skill,
    salary,
    morale: 58 + pickIndex(seed + 2, 28),
    fatigue: pickIndex(seed + 6, 32),
    loyalty,
    visible: true,
    profile: `${seniority} ${specialty} specialist employed by ${rival.name}. Loyalty ${loyalty}; counteroffer cost rises with loyalty and rival market share.`,
  };
}

function ensureStaffMarket(next) {
  next.staffMarket = next.staffMarket ?? {
    applicants: [],
    lastRefreshCycle: 0,
    marketNote: 'No active hiring scan has been performed yet.',
  };
}

function ensureRivalStaff(next) {
  if (!next.rivalCompanies) return;
  for (const rival of next.rivalCompanies) {
    if (Array.isArray(rival.staff) && rival.staff.length > 0) continue;
    const count = Math.max(2, Math.min(5, 2 + Math.round((rival.marketShare ?? 4) / 8)));
    rival.staff = Array.from({ length: count }, (_, index) => generateRivalStaffMember(rival, index));
  }
}

function pruneExpiredApplicants(next) {
  const cycle = next.company?.cycle ?? 0;
  const before = next.staffMarket.applicants.length;
  next.staffMarket.applicants = next.staffMarket.applicants.filter((candidate) => (candidate.expiresCycle ?? cycle) >= cycle);
  const expired = before - next.staffMarket.applicants.length;
  if (expired > 0) next.eventLog.unshift(`Cycle ${cycle}: ${expired} open staff candidate${expired === 1 ? '' : 's'} left the market.`);
}

function rivalRecruitApplicant(next) {
  const applicants = next.staffMarket?.applicants ?? [];
  const rivals = next.rivalCompanies ?? [];
  if (applicants.length === 0 || rivals.length === 0) return;
  const chance = Math.min(0.45, 0.08 * difficultyMultiplier(next, 'rivalMarketPressure') + rivals.length * 0.025);
  if (Math.random() > chance) return;

  const candidate = applicants[0];
  const rival = rivals[Math.abs((next.company?.cycle ?? 1) + candidate.id.length) % rivals.length];
  rival.staff = rival.staff ?? [];
  rival.staff.push({
    id: `rst-${rival.id}-market-${candidate.id}`,
    name: candidate.name,
    specialty: candidate.specialty,
    seniority: candidate.seniority,
    skill: candidate.skill,
    salary: Math.round(candidate.salary * 1.08),
    morale: candidate.morale,
    fatigue: candidate.fatigue,
    loyalty: 58,
    visible: true,
    profile: `${candidate.name} joined ${rival.name} from the open staff market.`,
  });
  next.staffMarket.applicants = applicants.filter((item) => item.id !== candidate.id);
  rival.lastAction = `Recruited staff candidate ${candidate.name}.`;
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Staff market - ${rival.name} recruited ${candidate.name} before we moved.`);
}

function refreshSparseStaffMarket(next) {
  const cycle = next.company?.cycle ?? 1;
  const shouldRefresh = cycle === 1 || cycle - (next.staffMarket.lastRefreshCycle ?? 0) >= 12;
  if (!shouldRefresh) return;
  const openings = 1 + (cycle % 3 === 0 ? 1 : 0);
  next.staffMarket.applicants = Array.from({ length: openings }, (_, index) => generateApplicant(next, index));
  next.staffMarket.lastRefreshCycle = cycle;
  next.staffMarket.marketNote = `${openings} loose candidate${openings === 1 ? '' : 's'} surfaced. The market is thin and rivals may move first.`;
  next.eventLog.unshift(`Cycle ${cycle}: Space LinkedIn pulse found ${openings} loose staff candidate${openings === 1 ? '' : 's'}.`);
}

export function processStaffMarket(next) {
  ensureStaffMarket(next);
  ensureRivalStaff(next);
  pruneExpiredApplicants(next);
  rivalRecruitApplicant(next);
  refreshSparseStaffMarket(next);
}

export function hireApplicant(state, candidateId) {
  const next = clone(state);
  ensureStaffMarket(next);
  const candidate = next.staffMarket.applicants.find((item) => item.id === candidateId);
  if (!candidate) return next;
  const cost = candidate.signingBonus ?? signingBonus(candidate);
  if (next.company.cash < cost) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Hiring failed. Insufficient cash for ${candidate.name}'s signing bonus.`);
    return next;
  }
  next.company.cash -= cost;
  next.engineers.push({
    id: `eng-hired-${candidate.id}`,
    name: candidate.name,
    specialty: candidate.specialty,
    skill: candidate.skill,
    salary: candidate.salary,
    fatigue: candidate.fatigue,
    morale: candidate.morale,
    seniority: candidate.seniority,
    hiredCycle: next.company.cycle,
    assignedProjectId: null,
  });
  next.staffMarket.applicants = next.staffMarket.applicants.filter((item) => item.id !== candidateId);
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Hired ${candidate.name} for CR ${cost.toLocaleString('en-US')} signing bonus.`);
  return next;
}

export function releaseEngineer(state, engineerId) {
  const next = clone(state);
  const engineer = next.engineers.find((item) => item.id === engineerId);
  if (!engineer) return next;
  const severance = Math.round((engineer.salary ?? 60000) / 6);
  if (next.company.cash < severance) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Staff release blocked. Severance reserve unavailable for ${engineer.name}.`);
    return next;
  }
  next.company.cash -= severance;
  next.engineers = next.engineers.filter((item) => item.id !== engineerId);
  for (const project of next.research ?? []) {
    if (!next.engineers.some((item) => item.assignedProjectId === project.id)) project.stalled = project.status !== 'complete';
  }
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Released ${engineer.name}. Severance paid: CR ${severance.toLocaleString('en-US')}.`);
  return next;
}

export function rivalRecruitCost(staff, rival) {
  const loyalty = staff?.loyalty ?? 50;
  const marketShare = rival?.marketShare ?? 5;
  return Math.round((staff?.salary ?? 90000) * (2.6 + loyalty / 35 + marketShare / 35));
}

export function recruitFromRival(state, rivalId, staffId) {
  const next = clone(state);
  ensureStaffMarket(next);
  ensureRivalStaff(next);
  const rival = next.rivalCompanies?.find((item) => item.id === rivalId);
  const staff = rival?.staff?.find((item) => item.id === staffId);
  if (!rival || !staff) return next;
  const cost = rivalRecruitCost(staff, rival);
  if (next.company.cash < cost) {
    next.eventLog.unshift(`Cycle ${next.company.cycle}: Rival recruitment failed. ${staff.name} requires CR ${cost.toLocaleString('en-US')} compensation.`);
    return next;
  }
  next.company.cash -= cost;
  rival.staff = rival.staff.filter((item) => item.id !== staffId);
  rival.lastAction = `Lost ${staff.name} to Orbital Works recruitment.`;
  next.engineers.push({
    id: `eng-rival-${staff.id}`,
    name: staff.name,
    specialty: staff.specialty,
    skill: staff.skill,
    salary: Math.round((staff.salary ?? 90000) * 1.22),
    fatigue: staff.fatigue ?? 10,
    morale: Math.max(45, staff.morale ?? 65),
    seniority: staff.seniority,
    hiredCycle: next.company.cycle,
    recruitedFrom: rival.name,
    assignedProjectId: null,
  });
  next.eventLog.unshift(`Cycle ${next.company.cycle}: Recruited ${staff.name} away from ${rival.name} for CR ${cost.toLocaleString('en-US')}.`);
  return next;
}
