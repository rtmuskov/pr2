import type { ReactNode } from 'react';

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  aside,
}: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="page-hero-main">
        <p className="page-label">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="page-description">{description}</p>
        {actions ? <div className="page-actions">{actions}</div> : null}
      </div>
      {aside ? <aside className="page-hero-aside">{aside}</aside> : null}
    </section>
  );
}
