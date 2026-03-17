export type UserRole = 'USER' | 'ADMIN';

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  username: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};
