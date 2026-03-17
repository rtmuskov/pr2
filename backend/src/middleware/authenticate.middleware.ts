import type { NextFunction, Request, Response } from 'express';

import { verifyAccessToken } from '../lib/jwt.js';

function getBearerToken(authorizationHeader?: string): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

export function authenticate(request: Request, response: Response, next: NextFunction) {
  const token = getBearerToken(request.headers.authorization);

  if (!token) {
    response.status(401).json({
      message: 'Authentication required',
    });
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    request.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    response.status(401).json({
      message: 'Invalid or expired token',
    });
  }
}
