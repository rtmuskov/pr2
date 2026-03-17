import { useEffect, useMemo, useState } from 'react';

import type { GameCase } from '../../models/case';
import { getCaseById } from './caseService';

type CaseResolverState =
  | { status: 'loading'; gameCase: null }
  | { status: 'missing-id'; gameCase: null }
  | { status: 'not-found'; gameCase: null }
  | { status: 'ready'; gameCase: GameCase };

export function useCaseResolver(caseId?: string, loadingDelayMs = 180): CaseResolverState {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const timeoutId = window.setTimeout(() => {
      setIsLoading(false);
    }, loadingDelayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [caseId, loadingDelayMs]);

  const gameCase = useMemo(() => {
    if (!caseId) {
      return undefined;
    }

    return getCaseById(caseId);
  }, [caseId]);

  if (isLoading) {
    return { status: 'loading', gameCase: null };
  }

  if (!caseId) {
    return { status: 'missing-id', gameCase: null };
  }

  if (!gameCase) {
    return { status: 'not-found', gameCase: null };
  }

  return { status: 'ready', gameCase };
}
