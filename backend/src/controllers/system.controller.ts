import type { Request, Response } from 'express';

import { getSystemInfoPayload } from '../services/system.service.js';

export function getSystemInfo(_request: Request, response: Response) {
  response.json(getSystemInfoPayload());
}
