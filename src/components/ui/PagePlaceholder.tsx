import { ReactNode } from 'react';

type PagePlaceholderProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function PagePlaceholder({
  title,
  description,
  children,
}: PagePlaceholderProps) {
  return (
    <section className="page-card">
      <div className="page-card-header">
        <p className="page-label">Стартовый каркас</p>
        <h2>{title}</h2>
      </div>
      <p className="page-description">{description}</p>
      {children ? <div className="page-actions">{children}</div> : null}
    </section>
  );
}
