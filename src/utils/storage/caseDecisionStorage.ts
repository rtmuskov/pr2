import type { PlayerDecision } from '../../models/decision';
import { validateStoredDecisionMap } from '../validators/decisionValidators';

const CASE_DECISION_STORAGE_KEY = 'qa-inspector:last-case-decision';

type StoredCaseDecisionMap = Record<string, PlayerDecision>;

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStoredDecisions(): StoredCaseDecisionMap {
  if (!canUseStorage()) {
    return {};
  }

  const rawValue = window.localStorage.getItem(CASE_DECISION_STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;
    return validateStoredDecisionMap(parsedValue);
  } catch {
    return {};
  }
}

export function saveCaseDecision(decision: PlayerDecision): void {
  if (!canUseStorage()) {
    return;
  }

  const savedDecisions = readStoredDecisions();

  savedDecisions[decision.caseId] = decision;
  window.localStorage.setItem(CASE_DECISION_STORAGE_KEY, JSON.stringify(savedDecisions));
}

export function getStoredCaseDecision(caseId: string): PlayerDecision | null {
  const savedDecisions = readStoredDecisions();

  return savedDecisions[caseId] ?? null;
}
