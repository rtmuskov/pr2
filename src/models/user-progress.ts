import type { CaseResult } from './result';

export type LevelProgress = {
  level: number;
  unlocked: boolean;
  completedCaseIds: string[];
  bestScore: number;
};

export type UserStats = {
  totalCasesCompleted: number;
  totalCorrectDecisions: number;
  totalScore: number;
  averageScore: number;
};

export type UserProgress = {
  completedCaseIds: string[];
  unlockedLevels: number[];
  results: CaseResult[];
  stats: UserStats;
  levels: LevelProgress[];
  updatedAt: string;
};
