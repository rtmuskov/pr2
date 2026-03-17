import type { CaseResult } from '../../models/result';
import { formatDecisionLabel } from '../../utils/formatters/decisionLabels';

type ResultSummaryProps = {
  result: CaseResult;
};

export function ResultSummary({ result }: ResultSummaryProps) {
  return (
    <section className="panel-card result-summary-card">
      <div className="panel-card-header">
        <p className="page-label">Итог проверки</p>
        <h2>{result.isCorrect ? 'Решение принято верно' : 'Решение принято неверно'}</h2>
      </div>

      <div className="result-status-grid">
        <div className="meta-item">
          <span className="meta-label">Ваше решение</span>
          <strong>{formatDecisionLabel(result.playerDecision.decision)}</strong>
        </div>
        <div className="meta-item">
          <span className="meta-label">Правильное решение</span>
          <strong>{formatDecisionLabel(result.expectedDecision)}</strong>
        </div>
        <div className="meta-item">
          <span className="meta-label">Статус</span>
          <strong>{result.isCorrect ? 'Верно' : 'Неверно'}</strong>
        </div>
        <div className="meta-item">
          <span className="meta-label">Баллы</span>
          <strong>
            {result.score} / {result.maxScore}
          </strong>
        </div>
      </div>

      <div className="result-explanation-card">
        <h3>Пояснение</h3>
        <p>{result.explanation}</p>
      </div>
    </section>
  );
}
