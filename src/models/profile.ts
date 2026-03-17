import type { AuthUser } from './auth';

export type PlayerProfile = {
  displayName: string;
  avatarUrl: string | null;
  totalScore: number;
  accuracy: number;
  casesCompleted: number;
  correctAnswers: number;
  currentLevel: number;
};

export type PlayerProgress = {
  completedCaseIds: string[];
  unlockedLevels: number[];
  lastPlayedAt: string | null;
};

export type PlayerGameResult = {
  caseId: string;
  isCorrect: boolean;
  scoreEarned: number;
  createdAt: string;
};

export type PlayerProfileResponse = {
  user: AuthUser;
  profile: PlayerProfile | null;
  progress: PlayerProgress | null;
  results: PlayerGameResult[];
};
