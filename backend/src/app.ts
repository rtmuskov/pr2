import cors from 'cors';
import express from 'express';

import { env } from './config/env.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { notFoundMiddleware } from './middleware/not-found.middleware.js';
import { apiRouter } from './routes/index.js';

export const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.get('/', (_request, response) => {
  response.json({
    message: 'Backend server is running. Use /health or /api/* endpoints.',
  });
});

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/favicon.ico', (_request, response) => {
  response.status(204).end();
});

app.use('/api', apiRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
