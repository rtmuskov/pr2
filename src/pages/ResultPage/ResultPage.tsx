import { Link, Navigate, useParams } from 'react-router-dom';

import { appPaths } from '../../app/paths';
import { ResultSummary } from '../../components/results/ResultSummary';
import { StatusState } from '../../components/ui/StatusState';
import { getCaseById, getNextCase } from '../../features/case-engine/caseService';
import { evaluateCaseResult } from '../../features/scoring/evaluateCaseResult';
import { getStoredCaseDecision } from '../../utils/storage/caseDecisionStorage';

export function ResultPage() {
  const { caseId } = useParams<{ caseId: string }>();

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

  const result = evaluateCaseResult(gameCase, savedDecision);
  const nextCase = getNextCase(caseId);

  return (
    <section className="result-page">
      <ResultSummary result={result} />

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
