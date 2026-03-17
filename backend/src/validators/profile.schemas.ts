import { z } from 'zod';

const apiDecisionSchema = z.enum(['approve', 'reject', 'rework', 'extra-review']);

export const submitGameResultSchema = z.object({
  body: z.object({
    caseId: z.string().trim().min(1, 'Case id is required'),
    level: z.number().int().min(1).max(5),
    selectedDecision: apiDecisionSchema,
    expectedDecision: apiDecisionSchema,
    isCorrect: z.boolean(),
    scoreEarned: z.number().int().min(0),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export type SubmitGameResultInput = z.infer<typeof submitGameResultSchema>['body'];
