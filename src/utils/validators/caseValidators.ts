import { decisionTypes } from '../../models/decision';
import { documentTypes, type CaseDocument, type DocumentSection } from '../../models/document';
import type { CaseIssue, GameCase, ProductInfo } from '../../models/case';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isDocumentType(value: unknown): value is CaseDocument['type'] {
  return typeof value === 'string' && documentTypes.some((item) => item === value);
}

function isDecisionType(value: unknown): value is GameCase['correctDecision'] {
  return typeof value === 'string' && decisionTypes.some((item) => item === value);
}

function validateDocumentSection(value: unknown): value is DocumentSection {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.content)
  );
}

function validateCaseDocument(value: unknown): value is CaseDocument {
  if (!isRecord(value) || !Array.isArray(value.sections)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.summary) &&
    isDocumentType(value.type) &&
    value.sections.every(validateDocumentSection)
  );
}

function validateProduct(value: unknown): value is ProductInfo {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.version) &&
    isNonEmptyString(value.type) &&
    isNonEmptyString(value.description)
  );
}

function validateCaseIssue(value: unknown, documentIds: string[]): value is CaseIssue {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.description) &&
    isNonEmptyString(value.relatedDocumentId) &&
    documentIds.includes(value.relatedDocumentId) &&
    typeof value.severity === 'string' &&
    ['low', 'medium', 'high', 'critical'].includes(value.severity)
  );
}

export function isGameCase(value: unknown): value is GameCase {
  if (!isRecord(value) || !Array.isArray(value.documents) || !Array.isArray(value.issues)) {
    return false;
  }

  const documentIds = value.documents
    .filter(validateCaseDocument)
    .map((document) => document.id);

  if (documentIds.length !== value.documents.length) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    typeof value.level === 'number' &&
    Number.isInteger(value.level) &&
    value.level > 0 &&
    isNonEmptyString(value.title) &&
    validateProduct(value.product) &&
    isDecisionType(value.correctDecision) &&
    isNonEmptyString(value.explanation) &&
    isStringArray(value.topics) &&
    value.issues.every((issue) => validateCaseIssue(issue, documentIds))
  );
}

export function validateGameCase(value: unknown): GameCase {
  if (!isGameCase(value)) {
    throw new Error('Invalid case data received.');
  }

  return value;
}

export function validateGameCaseList(value: unknown): GameCase[] {
  if (!Array.isArray(value)) {
    throw new Error('Case collection must be an array.');
  }

  const cases = value.map(validateGameCase);
  const caseIds = cases.map((gameCase) => gameCase.id);

  if (!isStringArray(caseIds) || new Set(caseIds).size !== caseIds.length) {
    throw new Error('Case ids must be unique.');
  }

  return cases;
}
