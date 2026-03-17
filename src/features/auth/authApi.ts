import type {
  AuthResponse,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from '../../models/auth';
import { requestJson } from '../api/apiClient';

type AuthMeResponse = {
  user: AuthUser;
};

export function registerRequest(payload: RegisterCredentials) {
  return requestJson<AuthResponse>('/auth/register', {
    method: 'POST',
    body: payload,
    includeAuth: false,
  });
}

export function loginRequest(payload: LoginCredentials) {
  return requestJson<AuthResponse>('/auth/login', {
    method: 'POST',
    body: payload,
    includeAuth: false,
  });
}

export function fetchCurrentUser() {
  return requestJson<AuthMeResponse>('/auth/me');
}
