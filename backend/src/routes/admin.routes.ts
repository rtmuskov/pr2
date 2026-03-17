import { Router } from 'express';
import { UserRole } from '@prisma/client';

import {
  createCase,
  deleteCase,
  getAdminCase,
  getAdminCases,
  updateCase,
} from '../controllers/admin.controller.js';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorizeRole } from '../middleware/authorize-role.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  createGameCaseRequestSchema,
  gameCaseIdParamsSchema,
  updateGameCaseRequestSchema,
} from '../validators/game-case.schemas.js';

export const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(authorizeRole(UserRole.ADMIN));

adminRouter.get('/cases', asyncHandler(getAdminCases));
adminRouter.get('/cases/:id', validateRequest(gameCaseIdParamsSchema), asyncHandler(getAdminCase));
adminRouter.post('/cases', validateRequest(createGameCaseRequestSchema), asyncHandler(createCase));
adminRouter.patch('/cases/:id', validateRequest(updateGameCaseRequestSchema), asyncHandler(updateCase));
adminRouter.delete('/cases/:id', validateRequest(gameCaseIdParamsSchema), asyncHandler(deleteCase));
