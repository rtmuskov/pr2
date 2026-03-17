import type { DecisionType } from '../../models/decision';

type CaseDecisionActionsProps = {
  onDecisionSelect: (decision: DecisionType) => void;
};

const decisionButtons: Array<{
  value: DecisionType;
  label: string;
  hint: string;
  tone: 'approve' | 'reject' | 'rework' | 'extra-review';
}> = [
  { value: 'approve', label: 'Допустить', hint: 'Документы и результаты проверки достаточны.', tone: 'approve' },
  { value: 'reject', label: 'Отказать', hint: 'Обнаружены критичные нарушения или недопустимые риски.', tone: 'reject' },
  { value: 'rework', label: 'На доработку', hint: 'Есть подтвержденные несоответствия, которые нужно исправить.', tone: 'rework' },
  { value: 'extra-review', label: 'Доп. проверка', hint: 'Данных недостаточно, нужны дополнительные подтверждения.', tone: 'extra-review' },
];

export function CaseDecisionActions({ onDecisionSelect }: CaseDecisionActionsProps) {
  return (
    <section className="panel-card case-decision-panel">
      <div className="panel-card-header">
        <p className="page-label">Решение инспектора</p>
        <h3>Выберите действие по кейсу</h3>
      </div>

      <div className="decision-grid">
        {decisionButtons.map((decision) => (
          <button
            key={decision.value}
            type="button"
            className={`decision-button decision-button-${decision.tone}`}
            onClick={() => onDecisionSelect(decision.value)}
          >
            <span className="decision-button-label">{decision.label}</span>
            <span className="decision-button-hint">{decision.hint}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
