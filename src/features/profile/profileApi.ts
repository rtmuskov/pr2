import type { PlayerProfileResponse } from '../../models/profile';
import { requestJson } from '../api/apiClient';

export function fetchPlayerProfile() {
  return requestJson<PlayerProfileResponse>('/profile');
}
