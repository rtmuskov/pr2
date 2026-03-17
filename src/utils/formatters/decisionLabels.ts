import type { DecisionType } from '../../models/decision';

const decisionLabels: Record<DecisionType, string> = {
  approve: 'Допустить',
  reject: 'Отказать',
  rework: 'На доработку',
  'extra-review': 'Доп. проверка',
};

export function formatDecisionLabel(decision: DecisionType): string {
  return decisionLabels[decision];
}
