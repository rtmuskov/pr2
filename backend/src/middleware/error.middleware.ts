import type { NextFunction, Request, Response } from 'express';

export function errorMiddleware(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  const statusCode =
    typeof (error as Error & { statusCode?: number }).statusCode === 'number'
      ? (error as Error & { statusCode: number }).statusCode
      : 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    message: statusCode >= 500 ? 'Internal server error' : error.message,
  });
}
