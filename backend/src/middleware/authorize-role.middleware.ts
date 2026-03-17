import type { UserRole } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';

export function authorizeRole(...allowedRoles: UserRole[]) {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!request.user) {
      response.status(401).json({
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(request.user.role)) {
      response.status(403).json({
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
}
