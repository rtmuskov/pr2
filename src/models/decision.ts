export const decisionTypes = [
  'approve',
  'reject',
  'rework',
  'extra-review',
] as const;

export type DecisionType = (typeof decisionTypes)[number];

export type PlayerDecision = {
  caseId: string;
  decision: DecisionType;
  selectedIssueIds: string[];
  notes?: string;
  completedAt: string;
};
