import dotenv from 'dotenv';

dotenv.config();

function getEnvValue(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  NODE_ENV: getEnvValue('NODE_ENV', 'development'),
  PORT: Number(getEnvValue('PORT', '4000')),
  CLIENT_URL: getEnvValue('CLIENT_URL', 'http://localhost:5173'),
  JWT_SECRET: getEnvValue('JWT_SECRET', 'dev_jwt_secret_change_me'),
  JWT_EXPIRES_IN: getEnvValue('JWT_EXPIRES_IN', '7d'),
  DATABASE_URL: getEnvValue('DATABASE_URL'),
} as const;
