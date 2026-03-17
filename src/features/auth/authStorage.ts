import type { AuthUser, UserRole } from '../../models/auth';

const ACCESS_TOKEN_STORAGE_KEY = 'qa_inspector_access_token';

type JwtPayload = {
  sub?: string;
  username?: string;
  email?: string;
  role?: UserRole;
};

function safeDecodeBase64(value: string): string | null {
  try {
    return window.atob(value);
  } catch {
    return null;
  }
}

function parseJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.');

  if (parts.length < 2) {
    return null;
  }

  const normalizedPayload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const decoded = safeDecodeBase64(normalizedPayload);

  if (!decoded) {
    return null;
  }

  try {
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function getStoredAccessToken(): string | null {
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function storeAccessToken(token: string) {
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

export function clearStoredAccessToken() {
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function getCurrentAuthUser(): AuthUser | null {
  const token = getStoredAccessToken();

  if (token) {
    const payload = parseJwtPayload(token);

    if (payload?.sub && payload.email && payload.role) {
      return {
        id: payload.sub,
        username: payload.username ?? payload.email,
        email: payload.email,
        role: payload.role,
      };
    }
  }

  return null;
}
