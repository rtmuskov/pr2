import type { ReactNode } from 'react';

type StatusStateTone = 'neutral' | 'info' | 'warning' | 'danger';

type StatusStateProps = {
  title: string;
  description: string;
  tone?: StatusStateTone;
  actions?: ReactNode;
};

export function StatusState({
  title,
  description,
  tone = 'neutral',
  actions,
}: StatusStateProps) {
  return (
    <section className={`status-state status-state-${tone}`}>
      <div className="status-state-badge" aria-hidden="true" />
      <div className="status-state-content">
        <h3>{title}</h3>
        <p>{description}</p>
        {actions ? <div className="status-state-actions">{actions}</div> : null}
      </div>
    </section>
  );
}
