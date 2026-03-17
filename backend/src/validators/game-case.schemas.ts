import { z } from 'zod';

const decisionSchema = z.enum(['approve', 'reject', 'rework', 'extra-review']);

const documentSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
});

const issueSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  description: z.string().min(1),
});

export const gameCasePayloadSchema = z.object({
  id: z.string().min(1),
  level: z.number().int().min(1),
  title: z.string().min(1),
  productName: z.string().min(1),
  productVersion: z.string().min(1),
  productType: z.string().min(1),
  productDescription: z.string().min(1),
  documents: z.array(documentSchema),
  issues: z.array(issueSchema),
  correctDecision: decisionSchema,
  explanation: z.string().min(1),
  topics: z.array(z.string().min(1)),
});

export const createGameCaseRequestSchema = z.object({
  body: gameCasePayloadSchema,
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const updateGameCaseRequestSchema = z.object({
  body: gameCasePayloadSchema.omit({ id: true }).partial(),
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({}).default({}),
});

export const gameCaseIdParamsSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({}).default({}),
});

export type CreateGameCaseInput = z.infer<typeof gameCasePayloadSchema>;
export type UpdateGameCaseInput = z.infer<typeof updateGameCaseRequestSchema>['body'];
