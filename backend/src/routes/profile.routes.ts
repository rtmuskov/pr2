import { Router } from 'express';

import { getProfileInfo } from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';

export const profileRouter = Router();

profileRouter.get('/', authenticate, getProfileInfo);
