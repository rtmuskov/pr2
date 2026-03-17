import { useEffect, useState } from 'react';

import { useAuth } from '../../app/providers/AuthProvider';
import type { PlayerProfileResponse } from '../../models/profile';
import { fetchPlayerProfile } from './profileApi';

export type PlayerProfileLoadState = 'idle' | 'loading' | 'success' | 'error';

export function usePlayerProfile() {
  const { user } = useAuth();
  const [loadState, setLoadState] = useState<PlayerProfileLoadState>(user ? 'loading' : 'idle');
  const [profileData, setProfileData] = useState<PlayerProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoadState('idle');
      setProfileData(null);
      setError(null);
      return;
    }

    let isMounted = true;

    async function loadProfile() {
      setLoadState('loading');
      setError(null);

      try {
        const response = await fetchPlayerProfile();

        if (!isMounted) {
          return;
        }

        setProfileData(response);
        setLoadState('success');
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить профиль.');
        setLoadState('error');
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return {
    loadState,
    profileData,
    error,
  };
}
