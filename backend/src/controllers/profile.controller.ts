import type { Request, Response } from 'express';

import { getProfileInfoPayload, saveGameResult } from '../services/profile.service.js';

export async function getProfileInfo(request: Request, response: Response) {
  const currentUserId = request.user?.id;

  if (!currentUserId) {
    response.status(401).json({
      message: 'Authentication required.',
    });
    return;
  }

  const payload = await getProfileInfoPayload(currentUserId);

  if (!payload) {
    response.status(404).json({
      message: 'Profile not found.',
    });
    return;
  }

  response.json(payload);
}

export async function submitGameResult(request: Request, response: Response) {
  const currentUserId = request.user?.id;

  if (!currentUserId) {
    response.status(401).json({
      message: 'Authentication required.',
    });
    return;
  }

  try {
    const payload = await saveGameResult(currentUserId, request.body);
    response.status(201).json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save game result.';
    const statusCode = message === 'Case not found.' ? 404 : 500;

    response.status(statusCode).json({
      message,
    });
  }
}
