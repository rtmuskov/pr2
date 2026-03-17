import { Link } from 'react-router-dom';

import { appPaths } from '../../app/paths';
import type { GameCase } from '../../models/case';

type CaseCatalogCardProps = {
  gameCase: GameCase;
  locked?: boolean;
};

export function CaseCatalogCard({ gameCase, locked = false }: CaseCatalogCardProps) {
  return (
    <article className="panel-card case-catalog-card">
      <div className="case-catalog-top">
        <span className="level-badge">Уровень {gameCase.level}</span>
        <span className="case-id-badge">{locked ? 'Заблокирован' : gameCase.id}</span>
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
        {locked ? (
          <span className="secondary-button case-card-locked-action">
            Откроется после прохождения предыдущих уровней
          </span>
        ) : (
          <Link className="primary-button" to={appPaths.case(gameCase.id)}>
            Открыть кейс
          </Link>
        )}
      </div>
    </article>
  );
}
