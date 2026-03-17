import { decisionTypes, type PlayerDecision } from '../../models/decision';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isDecisionType(value: unknown): value is PlayerDecision['decision'] {
  return typeof value === 'string' && decisionTypes.some((item) => item === value);
}

export function isPlayerDecision(value: unknown): value is PlayerDecision {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.caseId) &&
    isDecisionType(value.decision) &&
    isStringArray(value.selectedIssueIds) &&
    isNonEmptyString(value.completedAt) &&
    (value.notes === undefined || typeof value.notes === 'string')
  );
}

export function validateStoredDecisionMap(value: unknown): Record<string, PlayerDecision> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, PlayerDecision>>((accumulator, [key, item]) => {
    if (isPlayerDecision(item)) {
      accumulator[key] = item;
    }

    return accumulator;
  }, {});
}
