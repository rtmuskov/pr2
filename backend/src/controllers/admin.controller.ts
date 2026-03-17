import type { Request, Response } from 'express';

import {
  createAdminCase,
  deleteAdminCase,
  getAdminCaseById,
  getAdminCasesList,
  updateAdminCase,
} from '../services/admin-case.service.js';

function getRouteId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export async function getAdminCases(_request: Request, response: Response) {
  const cases = await getAdminCasesList();
  response.json(cases);
}

export async function getAdminCase(request: Request, response: Response) {
  const gameCase = await getAdminCaseById(getRouteId(request.params.id));

  if (!gameCase) {
    response.status(404).json({
      message: 'Case not found',
    });
    return;
  }

  response.json(gameCase);
}

export async function createCase(request: Request, response: Response) {
  const createdCase = await createAdminCase(request.body);
  response.status(201).json(createdCase);
}

export async function updateCase(request: Request, response: Response) {
  const updatedCase = await updateAdminCase(getRouteId(request.params.id), request.body);

  if (!updatedCase) {
    response.status(404).json({
      message: 'Case not found',
    });
    return;
  }

  response.json(updatedCase);
}

export async function deleteCase(request: Request, response: Response) {
  const result = await deleteAdminCase(getRouteId(request.params.id));

  if (!result) {
    response.status(404).json({
      message: 'Case not found',
    });
    return;
  }

  response.json(result);
}
