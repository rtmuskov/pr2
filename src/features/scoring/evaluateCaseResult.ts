import type { GameCase } from '../../models/case';
import type { CaseResult, ResultRating } from '../../models/result';
import type { PlayerDecision } from '../../models/decision';

const BASE_SCORE = 100;
const ISSUE_BONUS_PER_ITEM = 10;

function getResultRating(score: number, maxScore: number): ResultRating {
  const scoreRatio = maxScore === 0 ? 0 : score / maxScore;

  if (scoreRatio >= 1) {
    return 'excellent';
  }

  if (scoreRatio >= 0.75) {
    return 'good';
  }

  if (scoreRatio >= 0.4) {
    return 'fair';
  }

  return 'poor';
}

function getDurationInSeconds(completedAt: string): number {
  const completedTimestamp = Date.parse(completedAt);

  if (Number.isNaN(completedTimestamp)) {
    return 0;
  }

  return Math.max(0, Math.round((Date.now() - completedTimestamp) / 1000));
}

export function evaluateCaseResult(gameCase: GameCase, playerDecision: PlayerDecision): CaseResult {
  const isCorrect = playerDecision.decision === gameCase.correctDecision;
  const maxScore = BASE_SCORE + gameCase.issues.length * ISSUE_BONUS_PER_ITEM;
  const score = isCorrect ? maxScore : Math.max(0, Math.round(BASE_SCORE * 0.2));

  return {
    caseId: gameCase.id,
    isCorrect,
    expectedDecision: gameCase.correctDecision,
    playerDecision,
    foundIssueCount: playerDecision.selectedIssueIds.length,
    totalIssueCount: gameCase.issues.length,
    score,
    maxScore,
    durationSeconds: getDurationInSeconds(playerDecision.completedAt),
    rating: getResultRating(score, maxScore),
    explanation: gameCase.explanation,
  };
}
