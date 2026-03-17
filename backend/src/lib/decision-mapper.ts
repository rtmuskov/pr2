import { DecisionType } from '@prisma/client';

export type ApiDecisionType = 'approve' | 'reject' | 'rework' | 'extra-review';

export function toPrismaDecisionType(value: ApiDecisionType): DecisionType {
  switch (value) {
    case 'approve':
      return DecisionType.approve;
    case 'reject':
      return DecisionType.reject;
    case 'rework':
      return DecisionType.rework;
    case 'extra-review':
      return DecisionType.extra_review;
  }
}

export function toApiDecisionType(value: DecisionType): ApiDecisionType {
  switch (value) {
    case DecisionType.approve:
      return 'approve';
    case DecisionType.reject:
      return 'reject';
    case DecisionType.rework:
      return 'rework';
    case DecisionType.extra_review:
      return 'extra-review';
  }
}
