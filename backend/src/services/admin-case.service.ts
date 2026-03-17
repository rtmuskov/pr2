import { prisma } from '../config/prisma.js';
import { toApiDecisionType, toPrismaDecisionType } from '../lib/decision-mapper.js';
import type { CreateGameCaseInput, UpdateGameCaseInput } from '../validators/game-case.schemas.js';

const caseDelegate = prisma['case'];

type AdminCaseRecord = {
  id: string;
  level: number;
  title: string;
  productName: string;
  productVersion: string;
  productType: string;
  productDescription: string;
  correctDecision: Parameters<typeof toApiDecisionType>[0];
  explanation: string;
  topics: string[];
  createdAt: Date;
  updatedAt: Date;
  documents: Array<{
    id: string;
    type: string;
    title: string;
    content: string;
  }>;
  issues: Array<{
    id: string;
    type: string;
    description: string;
  }>;
};

function mapGameCase(record: NonNullable<AdminCaseRecord>) {
  return {
    id: record.id,
    level: record.level,
    title: record.title,
    productName: record.productName,
    productVersion: record.productVersion,
    productType: record.productType,
    productDescription: record.productDescription,
    documents: record.documents,
    issues: record.issues,
    correctDecision: toApiDecisionType(record.correctDecision),
    explanation: record.explanation,
    topics: record.topics,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function buildUpdateData(input: UpdateGameCaseInput) {
  const data: Record<string, unknown> = {};

  if (input.level !== undefined) data.level = input.level;
  if (input.title !== undefined) data.title = input.title;
  if (input.productName !== undefined) data.productName = input.productName;
  if (input.productVersion !== undefined) data.productVersion = input.productVersion;
  if (input.productType !== undefined) data.productType = input.productType;
  if (input.productDescription !== undefined) data.productDescription = input.productDescription;
  if (input.documents !== undefined) {
    data.documents = {
      deleteMany: {},
      create: input.documents.map((document) => ({
        id: document.id,
        type: document.type,
        title: document.title,
        content: document.content,
      })),
    };
  }
  if (input.issues !== undefined) {
    data.issues = {
      deleteMany: {},
      create: input.issues.map((issue) => ({
        id: issue.id,
        type: issue.type,
        description: issue.description,
      })),
    };
  }
  if (input.correctDecision !== undefined) {
    data.correctDecision = toPrismaDecisionType(input.correctDecision);
  }
  if (input.explanation !== undefined) data.explanation = input.explanation;
  if (input.topics !== undefined) data.topics = input.topics;

  return data;
}

export async function getAdminCasesList() {
  const cases = await caseDelegate.findMany({
    include: {
      documents: true,
      issues: true,
    },
    orderBy: [{ level: 'asc' }, { id: 'asc' }],
  });

  return cases.map((gameCase) => mapGameCase(gameCase));
}

export async function getAdminCaseById(id: string) {
  const gameCase = await caseDelegate.findUnique({
    where: { id },
    include: {
      documents: true,
      issues: true,
    },
  });

  if (!gameCase) {
    return null;
  }

  return mapGameCase(gameCase);
}

export async function createAdminCase(input: CreateGameCaseInput) {
  const createdCase = await caseDelegate.create({
    data: {
      id: input.id,
      level: input.level,
      title: input.title,
      productName: input.productName,
      productVersion: input.productVersion,
      productType: input.productType,
      productDescription: input.productDescription,
      correctDecision: toPrismaDecisionType(input.correctDecision),
      explanation: input.explanation,
      topics: input.topics,
      documents: {
        create: input.documents.map((document) => ({
          id: document.id,
          type: document.type,
          title: document.title,
          content: document.content,
        })),
      },
      issues: {
        create: input.issues.map((issue) => ({
          id: issue.id,
          type: issue.type,
          description: issue.description,
        })),
      },
    },
    include: {
      documents: true,
      issues: true,
    },
  });

  return mapGameCase(createdCase);
}

export async function updateAdminCase(id: string, input: UpdateGameCaseInput) {
  const existingCase = await caseDelegate.findUnique({
    where: { id },
  });

  if (!existingCase) {
    return null;
  }

  const updatedCase = await caseDelegate.update({
    where: { id },
    data: buildUpdateData(input),
    include: {
      documents: true,
      issues: true,
    },
  });

  return mapGameCase(updatedCase);
}

export async function deleteAdminCase(id: string) {
  const existingCase = await caseDelegate.findUnique({
    where: { id },
  });

  if (!existingCase) {
    return null;
  }

  await caseDelegate.delete({
    where: { id },
  });

  return {
    id,
    deleted: true,
  };
}
