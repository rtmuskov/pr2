export type AdminCaseDocument = {
  id: string;
  type: string;
  title: string;
  content: string;
};

export type AdminCaseIssue = {
  id: string;
  type: string;
  description: string;
};

export type AdminCase = {
  id: string;
  level: number;
  title: string;
  productName: string;
  productVersion: string;
  productType: string;
  productDescription: string;
  documents: AdminCaseDocument[];
  issues: AdminCaseIssue[];
  correctDecision: 'approve' | 'reject' | 'rework' | 'extra-review';
  explanation: string;
  topics: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type AdminCasePayload = Omit<AdminCase, 'createdAt' | 'updatedAt'>;
