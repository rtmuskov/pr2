import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchCurrentUser, loginRequest, registerRequest } from '../../features/auth/authApi';
import {
  clearStoredAccessToken,
  getCurrentAuthUser,
  storeAccessToken,
} from '../../features/auth/authStorage';
import type {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from '../../models/auth';

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (payload: LoginCredentials) => Promise<void>;
  register: (payload: RegisterCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentAuthUser());
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(getCurrentAuthUser()));

  useEffect(() => {
    async function syncAuthState() {
      const tokenUser = getCurrentAuthUser();

      if (!tokenUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetchCurrentUser();

        startTransition(() => {
          setUser(response.user);
        });
      } catch {
        clearStoredAccessToken();

        startTransition(() => {
          setUser(null);
        });
      } finally {
        setIsLoading(false);
      }
    }

    void syncAuthState();

    window.addEventListener('storage', syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
    };
  }, []);

  async function login(payload: LoginCredentials) {
    const response = await loginRequest(payload);
    storeAccessToken(response.token);
    setUser(response.user);
  }

  async function register(payload: RegisterCredentials) {
    const response = await registerRequest(payload);
    storeAccessToken(response.token);
    setUser(response.user);
  }

  function logout() {
    clearStoredAccessToken();
    setUser(null);
  }

  async function refreshUser() {
    const tokenUser = getCurrentAuthUser();

    if (!tokenUser) {
      setUser(null);
      return;
    }

    const response = await fetchCurrentUser();
    setUser(response.user);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'ADMIN',
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
