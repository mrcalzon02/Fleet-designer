import { getDifficultyProfile } from './difficultyProfiles.js';

export function difficultyMultiplier(state, key) {
  return getDifficultyProfile(state.company?.difficultyId ?? 'normal').multipliers[key] ?? 1;
}

export function calculateEngineerPayroll(state) {
  const payroll = (state.engineers ?? []).reduce((sum, engineer) => sum + (engineer.salary ?? 0), 0);
  return Math.round((payroll / 12) * difficultyMultiplier(state, 'engineerLaborCost'));
}

export function calculateEmployeeOperatingCost(state) {
  const baseBurn = state.company?.baseBurnRate ?? state.company?.burnRate ?? 0;
  return Math.round(baseBurn * difficultyMultiplier(state, 'employeeLaborCost'));
}

export function calculateOperatingBurn(state) {
  return calculateEmployeeOperatingCost(state) + calculateEngineerPayroll(state);
}

export function calculateProductionCashCost(state, design, quantity = 1) {
  const baseCashCost = (design?.cost ?? 0) * quantity * 0.35;
  return Math.round(baseCashCost * difficultyMultiplier(state, 'productionOverhead'));
}

export function calculateDefectRisk(state, design) {
  const baseRisk = Math.max(4, 24 - Math.round((design?.reliability ?? 50) / 4));
  const designModifier = design?.defectRiskModifier ?? 0;
  const scaled = (baseRisk + designModifier) * difficultyMultiplier(state, 'defectPressure');
  return Math.max(2, Math.min(85, Math.round(scaled)));
}

export function calculateMaintenancePressure(state, value) {
  return Math.round(value * difficultyMultiplier(state, 'maintenanceBurden'));
}
