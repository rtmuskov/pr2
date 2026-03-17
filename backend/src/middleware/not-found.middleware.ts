import type { NextFunction, Request, Response } from 'express';

export function notFoundMiddleware(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  const error = new Error(`Route not found: ${request.method} ${request.originalUrl}`);
  next(error);
}
