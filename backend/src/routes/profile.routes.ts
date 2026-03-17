import { Router } from 'express';

import { getProfileInfo, submitGameResult } from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { submitGameResultSchema } from '../validators/profile.schemas.js';

export const profileRouter = Router();

profileRouter.get('/', authenticate, getProfileInfo);
profileRouter.post('/results', authenticate, validateRequest(submitGameResultSchema), submitGameResult);
