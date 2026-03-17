import type { DecisionType, PlayerDecision } from './decision';

export type ResultRating = 'excellent' | 'good' | 'fair' | 'poor';

export type CaseResult = {
  caseId: string;
  isCorrect: boolean;
  expectedDecision: DecisionType;
  playerDecision: PlayerDecision;
  foundIssueCount: number;
  totalIssueCount: number;
  score: number;
  maxScore: number;
  durationSeconds: number;
  rating: ResultRating;
  explanation: string;
};
