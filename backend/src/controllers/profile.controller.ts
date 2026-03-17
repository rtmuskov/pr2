import type { Request, Response } from 'express';

import { getProfileInfoPayload } from '../services/profile.service.js';

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
