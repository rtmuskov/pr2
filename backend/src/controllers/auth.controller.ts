import type { Request, Response } from 'express';

import {
  AuthServiceError,
  getCurrentUser,
  loginUser,
  registerUser,
} from '../services/auth.service.js';

export async function register(request: Request, response: Response) {
  try {
    const payload = await registerUser(request.body);
    response.status(201).json(payload);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      response.status(409).json({
        message: error.message,
        code: error.code,
      });
      return;
    }

    response.status(500).json({
      message: 'Unable to register user.',
    });
  }
}

export async function login(request: Request, response: Response) {
  try {
    const payload = await loginUser(request.body);
    response.json(payload);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      response.status(401).json({
        message: error.message,
        code: error.code,
      });
      return;
    }

    response.status(500).json({
      message: 'Unable to log in.',
    });
  }
}

export async function getMe(request: Request, response: Response) {
  const currentUserId = request.user?.id;

  if (!currentUserId) {
    response.status(401).json({
      message: 'Authentication required.',
    });
    return;
  }

  const payload = await getCurrentUser(currentUserId);

  if (!payload) {
    response.status(404).json({
      message: 'User not found.',
    });
    return;
  }

  response.json(payload);
}
