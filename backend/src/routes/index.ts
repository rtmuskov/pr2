import { Router } from 'express';

import { adminRouter } from './admin.routes.js';
import { authRouter } from './auth.routes.js';
import { profileRouter } from './profile.routes.js';
import { systemRouter } from './system.routes.js';

export const apiRouter = Router();

apiRouter.use('/system', systemRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/profile', profileRouter);
apiRouter.use('/admin', adminRouter);
