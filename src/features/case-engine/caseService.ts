import { rawCases } from '../../data/cases';
import type { GameCase } from '../../models/case';
import { validateGameCaseList } from '../../utils/validators/caseValidators';

const caseDataset = validateGameCaseList(rawCases);

function getSortedCases(): GameCase[] {
  return [...caseDataset].sort((leftCase, rightCase) => {
    if (leftCase.level !== rightCase.level) {
      return leftCase.level - rightCase.level;
    }

    return leftCase.id.localeCompare(rightCase.id);
  });
}

export function getAllCases(): GameCase[] {
  return getSortedCases();
}

export function getCaseById(caseId: string): GameCase | undefined {
  return caseDataset.find((gameCase) => gameCase.id === caseId);
}

export function getCasesByLevel(level: number): GameCase[] {
  return getSortedCases().filter((gameCase) => gameCase.level === level);
}

export function getNextCase(caseId: string): GameCase | undefined {
  const sortedCases = getSortedCases();
  const currentCaseIndex = sortedCases.findIndex((gameCase) => gameCase.id === caseId);

  if (currentCaseIndex === -1) {
    return undefined;
  }

  return sortedCases[currentCaseIndex + 1];
}
