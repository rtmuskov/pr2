import jwt, { type SignOptions } from 'jsonwebtoken';
import type { UserRole } from '@prisma/client';

import { env } from '../config/env.js';

export type AuthTokenPayload = {
  sub: string;
  username?: string;
  email: string;
  role: UserRole;
};

export function signAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
}
