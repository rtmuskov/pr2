import type { DecisionType } from './decision';
import type { CaseDocument } from './document';

export type CaseMismatchSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ProductInfo = {
  name: string;
  version: string;
  type: string;
  description: string;
};

export type CaseIssue = {
  id: string;
  title: string;
  description: string;
  relatedDocumentId: string;
  severity: CaseMismatchSeverity;
};

export type GameCase = {
  id: string;
  level: number;
  title: string;
  product: ProductInfo;
  documents: CaseDocument[];
  issues: CaseIssue[];
  correctDecision: DecisionType;
  explanation: string;
  topics: string[];
};
