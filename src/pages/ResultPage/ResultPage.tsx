import { Link, Navigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

import { appPaths } from '../../app/paths';
import { useAuth } from '../../app/providers/AuthProvider';
import { ResultSummary } from '../../components/results/ResultSummary';
import { StatusState } from '../../components/ui/StatusState';
import { getCaseById, getNextCase } from '../../features/case-engine/caseService';
import { saveProfileResult } from '../../features/profile/profileResultsApi';
import { evaluateCaseResult } from '../../features/scoring/evaluateCaseResult';
import { getStoredCaseDecision } from '../../utils/storage/caseDecisionStorage';

export function ResultPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const { user } = useAuth();
  const [syncError, setSyncError] = useState<string | null>(null);
  const syncedCaseRef = useRef<string | null>(null);

  if (!caseId) {
    return <Navigate to={appPaths.levels} replace />;
  }

  const gameCase = getCaseById(caseId);

  if (!gameCase) {
    return <Navigate to={appPaths.levels} replace />;
  }

  const savedDecision = getStoredCaseDecision(caseId);

  if (!savedDecision) {
    return (
      <StatusState
        title="Результат еще не сформирован"
        description="Сначала нужно открыть кейс и принять решение, после этого на экране результата появится разбор."
        tone="warning"
        actions={
          <Link className="primary-button" to={appPaths.case(caseId)}>
            Вернуться к кейсу
          </Link>
        }
      />
    );
  }

  const resolvedCaseId = caseId;
  const resolvedDecision = savedDecision;
  const resolvedGameCase = gameCase;
  const result = evaluateCaseResult(resolvedGameCase, resolvedDecision);
  const nextCase = getNextCase(resolvedCaseId);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (syncedCaseRef.current === resolvedCaseId) {
      return;
    }

    let isMounted = true;

    async function syncResult() {
      try {
        await saveProfileResult({
          caseId: resolvedCaseId,
          level: resolvedGameCase.level,
          selectedDecision: resolvedDecision.decision,
          expectedDecision: result.expectedDecision,
          isCorrect: result.isCorrect,
          scoreEarned: result.score,
        });

        if (!isMounted) {
          return;
        }

        syncedCaseRef.current = resolvedCaseId;
        setSyncError(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setSyncError(
          error instanceof Error
            ? error.message
            : 'Не удалось сохранить результат в профиль игрока.',
        );
      }
    }

    void syncResult();

    return () => {
      isMounted = false;
    };
  }, [resolvedCaseId, resolvedDecision.decision, resolvedGameCase.level, result.expectedDecision, result.isCorrect, result.score, user]);

  return (
    <section className="result-page">
      <ResultSummary result={result} />

      {syncError ? (
        <StatusState
          title="Результат не синхронизирован"
          description={syncError}
          tone="warning"
        />
      ) : null}

      <section className="panel-card result-actions-card">
        <div className="panel-card-header">
          <p className="page-label">Следующий шаг</p>
          <h3>Продолжить обучение</h3>
        </div>

        <p className="page-description">
          {nextCase
            ? `Следующим доступен кейс "${nextCase.title}". Можно перейти к новой проверке сразу.`
            : 'В наборе больше нет кейсов. Можно вернуться к выбору уровня или открыть профиль игрока.'}
        </p>

        <div className="page-actions">
          {nextCase ? (
            <Link className="primary-button" to={appPaths.case(nextCase.id)}>
              Следующий кейс
            </Link>
          ) : (
            <Link className="primary-button" to={appPaths.levels}>
              К выбору уровня
            </Link>
          )}

          {!nextCase ? (
            <Link className="secondary-button" to={appPaths.profile}>
              Открыть профиль
            </Link>
          ) : (
            <Link className="secondary-button" to={appPaths.levels}>
              Все кейсы
            </Link>
          )}
        </div>
      </section>
    </section>
  );
}
