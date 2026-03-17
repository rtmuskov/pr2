import { UserRole } from '@prisma/client';

import { prisma } from '../config/prisma.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { signAccessToken } from '../lib/jwt.js';

type RegisterInput = {
  username: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type AuthUser = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'EMAIL_TAKEN'
      | 'USERNAME_TAKEN'
      | 'INVALID_CREDENTIALS',
  ) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeUsername(username: string): string {
  return username.trim();
}

function toAuthUser(user: {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}): AuthUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

function buildAuthResponse(user: AuthUser): AuthResponse {
  const token = signAccessToken({
    sub: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user,
  };
}

export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  const email = normalizeEmail(input.email);
  const username = normalizeUsername(input.username);
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
    select: {
      email: true,
      username: true,
    },
  });

  if (existingUser?.email === email) {
    throw new AuthServiceError('Email is already in use.', 'EMAIL_TAKEN');
  }

  if (existingUser?.username === username) {
    throw new AuthServiceError('Username is already in use.', 'USERNAME_TAKEN');
  }

  const passwordHash = await hashPassword(input.password);
  const createdUser = await prisma.$transaction(async (transaction) => {
    return transaction.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: UserRole.USER,
        profile: {
          create: {
            displayName: username,
            currentLevel: 1,
          },
        },
        progress: {
          create: {
            completedCaseIds: [],
            unlockedLevels: [1],
          },
        },
      },
    });
  });

  return buildAuthResponse(toAuthUser(createdUser));
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const email = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AuthServiceError('Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await verifyPassword(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AuthServiceError('Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  return buildAuthResponse(toAuthUser(user));
}

export async function getCurrentUser(userId: string): Promise<{ user: AuthUser } | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    user: toAuthUser(user),
  };
}
