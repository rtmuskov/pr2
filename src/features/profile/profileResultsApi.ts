import { requestJson } from '../api/apiClient';
import type { DecisionType } from '../../models/decision';
import type { PlayerProfile, PlayerProgress } from '../../models/profile';

type SaveResultPayload = {
  caseId: string;
  level: number;
  selectedDecision: DecisionType;
  expectedDecision: DecisionType;
  isCorrect: boolean;
  scoreEarned: number;
};

type SaveResultResponse = {
  caseId: string;
  selectedDecision: DecisionType;
  expectedDecision: DecisionType;
  isCorrect: boolean;
  scoreEarned: number;
  profile: PlayerProfile | null;
  progress: PlayerProgress | null;
};

export function saveProfileResult(payload: SaveResultPayload) {
  return requestJson<SaveResultResponse>('/profile/results', {
    method: 'POST',
    body: payload,
  });
}
