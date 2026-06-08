import { grantStaffExperience, maybePromoteStaff } from './staffGrowth.js';

const ACTIVE_RUN_STATUSES = new Set(['queued', 'active']);

export function availableProductionEngineers(state) {
  return state.engineers ?? [];
}

export function activeProductionLines(state) {
  return (state.productionRuns ?? []).filter((run) => ACTIVE_RUN_STATUSES.has(run.status));
}

export function calculateEngineeringCoverage(state, lineCount = activeProductionLines(state).length) {
  const availableEngineers = availableProductionEngineers(state);
  const engineerCount = availableEngineers.length;
  const ratio = lineCount <= 0 ? engineerCount : engineerCount / lineCount;

  let label = 'idle engineering reserve';
  let defectMultiplier = 0.9;
  let throughputMultiplier = 1;

  if (lineCount <= 0) {
    label = 'no active production lines';
  } else if (engineerCount === 0) {
    label = 'uncovered production disaster';
    defectMultiplier = 3.5;
    throughputMultiplier = 0.25;
  } else if (ratio < 0.5) {
    label = 'catastrophic engineering overload';
    defectMultiplier = 2.8;
    throughputMultiplier = 0.42;
  } else if (ratio < 1) {
    label = 'severe engineering overload';
    defectMultiplier = 2.1;
    throughputMultiplier = 0.62;
  } else if (ratio < 1.5) {
    label = 'thin one-to-one line coverage';
    defectMultiplier = 1.35;
    throughputMultiplier = 0.82;
  } else if (ratio < 2) {
    label = 'supported line coverage';
    defectMultiplier = 1;
    throughputMultiplier = 1;
  } else if (ratio < 3) {
    label = 'strong engineering oversight';
    defectMultiplier = 0.82;
    throughputMultiplier = 1.08;
  } else {
    label = 'heavy engineering oversight';
    defectMultiplier = 0.68;
    throughputMultiplier = 1.15;
  }

  return {
    lineCount,
    engineerCount,
    ratio: Number(ratio.toFixed(2)),
    label,
    defectMultiplier,
    throughputMultiplier,
    availableEngineers,
  };
}

export function applyEngineeringCoverageToDefectRisk(baseRisk, coverage) {
  return Math.max(2, Math.min(95, Math.round(baseRisk * (coverage?.defectMultiplier ?? 1))));
}

export function applyEngineeringCoverageToThroughput(capacity, coverage) {
  if ((coverage?.lineCount ?? 0) <= 0) return capacity;
  return Math.max(1, Math.round(capacity * (coverage?.throughputMultiplier ?? 1)));
}

export function grantProductionOversightExperience(next, coverage) {
  if ((coverage?.lineCount ?? 0) <= 0) return [];
  const promotions = [];
  for (const engineer of coverage.availableEngineers ?? []) {
    const matched = ['manufacturing', 'automation'].includes(engineer.specialty);
    grantStaffExperience(engineer, matched ? 4 : 2, 'manufacturing', 'production oversight');
    const promotion = maybePromoteStaff(engineer, next.company?.cycle ?? 0);
    if (promotion) promotions.push({ engineer, promotion });
    engineer.fatigue = Math.min(100, (engineer.fatigue ?? 0) + (coverage.ratio < 1 ? 5 : 2));
    if (coverage.ratio < 1) engineer.morale = Math.max(0, (engineer.morale ?? 70) - 1);
  }
  return promotions;
}
