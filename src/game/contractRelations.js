import { contractSourceById } from './contractContent.js';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function ensureRelationState(company) {
  company.sourceReputation = company.sourceReputation ?? {
    civic: 4,
    frontier: 3,
    science: 1,
    industrial: 5,
    salvage: 2,
    security: 0,
    premium: 0,
  };
  company.alignmentFactors = company.alignmentFactors ?? {
    civic: 2,
    frontier: 2,
    science: 0,
    industrial: 4,
    salvage: 1,
    security: 0,
    premium: 0,
  };
  company.relationHistory = company.relationHistory ?? [];
}

function relationKeysForContract(contract) {
  const source = contractSourceById(contract.sourceId);
  return {
    sourceName: source?.name ?? contract.client ?? 'Unknown Client',
    sourceKey: source?.reputationKey ?? contract.alignment ?? 'commercial',
    alignment: source?.alignment ?? contract.alignment ?? 'commercial',
  };
}

function recordRelationEvent(company, event) {
  company.relationHistory = company.relationHistory ?? [];
  company.relationHistory.unshift(event);
  company.relationHistory = company.relationHistory.slice(0, 24);
}

export function previewContractRelationDelta(contract, qaResult = 'passed', outcome = 'fulfilled') {
  const skulls = Math.max(1, Math.min(3, contract?.skulls ?? 1));
  if (outcome === 'failed') {
    return {
      companyRepDelta: -(2 + skulls * 2),
      sourceRepDelta: -(2 + skulls * 3),
      alignmentDelta: -(1 + skulls),
    };
  }

  const defective = qaResult === 'defective';
  return {
    companyRepDelta: defective ? Math.max(0, skulls - 1) : 1 + skulls,
    sourceRepDelta: defective ? Math.max(1, skulls) : 2 + skulls * 2,
    alignmentDelta: defective ? 0 : Math.max(1, skulls),
  };
}

export function applyContractFulfillmentRelations(next, contract, lot) {
  if (!contract?.sourceId && !contract?.alignment) return null;
  ensureRelationState(next.company);
  const keys = relationKeysForContract(contract);
  const delta = previewContractRelationDelta(contract, lot?.qaResult ?? 'passed', 'fulfilled');

  next.company.reputation = clamp((next.company.reputation ?? 0) + delta.companyRepDelta, -100, 100);
  next.company.sourceReputation[keys.sourceKey] = clamp((next.company.sourceReputation[keys.sourceKey] ?? 0) + delta.sourceRepDelta, -50, 100);
  next.company.alignmentFactors[keys.alignment] = clamp((next.company.alignmentFactors[keys.alignment] ?? 0) + delta.alignmentDelta, -50, 100);

  const event = {
    cycle: next.company.cycle,
    sourceName: keys.sourceName,
    sourceKey: keys.sourceKey,
    alignment: keys.alignment,
    outcome: lot?.qaResult === 'defective' ? 'defective accepted delivery' : 'clean fulfillment',
    companyRepDelta: delta.companyRepDelta,
    sourceRepDelta: delta.sourceRepDelta,
    alignmentDelta: delta.alignmentDelta,
  };
  recordRelationEvent(next.company, event);
  return event;
}

export function applyContractFailureRelations(next, contract) {
  if (!contract?.sourceId && !contract?.alignment) return null;
  ensureRelationState(next.company);
  const keys = relationKeysForContract(contract);
  const delta = previewContractRelationDelta(contract, 'failed', 'failed');

  next.company.reputation = clamp((next.company.reputation ?? 0) + delta.companyRepDelta, -100, 100);
  next.company.sourceReputation[keys.sourceKey] = clamp((next.company.sourceReputation[keys.sourceKey] ?? 0) + delta.sourceRepDelta, -50, 100);
  next.company.alignmentFactors[keys.alignment] = clamp((next.company.alignmentFactors[keys.alignment] ?? 0) + delta.alignmentDelta, -50, 100);

  const event = {
    cycle: next.company.cycle,
    sourceName: keys.sourceName,
    sourceKey: keys.sourceKey,
    alignment: keys.alignment,
    outcome: 'failed contract',
    companyRepDelta: delta.companyRepDelta,
    sourceRepDelta: delta.sourceRepDelta,
    alignmentDelta: delta.alignmentDelta,
  };
  recordRelationEvent(next.company, event);
  return event;
}

export function relationSummary(company) {
  ensureRelationState(company);
  return {
    sourceReputation: company.sourceReputation,
    alignmentFactors: company.alignmentFactors,
    relationHistory: company.relationHistory ?? [],
  };
}
