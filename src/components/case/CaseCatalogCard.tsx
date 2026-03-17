import { Link } from 'react-router-dom';

import { appPaths } from '../../app/paths';
import type { GameCase } from '../../models/case';

type CaseCatalogCardProps = {
  gameCase: GameCase;
};

export function CaseCatalogCard({ gameCase }: CaseCatalogCardProps) {
  return (
    <article className="panel-card case-catalog-card">
      <div className="case-catalog-top">
        <span className="level-badge">Уровень {gameCase.level}</span>
        <span className="case-id-badge">{gameCase.id}</span>
      </div>
      <h3>{gameCase.title}</h3>
      <p className="page-description">{gameCase.product.description}</p>
      <div className="topic-list">
        {gameCase.topics.map((topic) => (
          <span key={topic} className="topic-chip">
            {topic}
          </span>
        ))}
      </div>
      <div className="page-actions">
        <Link className="primary-button" to={appPaths.case(gameCase.id)}>
          Открыть кейс
        </Link>
      </div>
    </article>
  );
}
