import { Router } from 'express';

import { getMe, login, register } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { loginSchema, registerSchema } from '../validators/auth.schemas.js';

export const authRouter = Router();

authRouter.post('/register', validateRequest(registerSchema), register);
authRouter.post('/login', validateRequest(loginSchema), login);
authRouter.get('/me', authenticate, getMe);
