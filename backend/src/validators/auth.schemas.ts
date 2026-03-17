import { z } from 'zod';

const emailSchema = z.string().trim().email('Invalid email address');
const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters long')
  .max(72, 'Password must be at most 72 characters long');

export const registerSchema = z.object({
  body: z.object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters long')
      .max(32, 'Username must be at most 32 characters long'),
    email: emailSchema,
    password: passwordSchema,
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});
