import type { GameCase } from '../../models/case';

type CaseProductCardProps = {
  gameCase: GameCase;
};

export function CaseProductCard({ gameCase }: CaseProductCardProps) {
  return (
    <section className="panel-card case-product-card">
      <div className="panel-card-header">
        <p className="page-label">Карточка продукта</p>
        <h2>{gameCase.product.name}</h2>
      </div>

      <div className="case-product-meta">
        <div className="meta-item">
          <span className="meta-label">Версия</span>
          <strong>{gameCase.product.version}</strong>
        </div>
        <div className="meta-item">
          <span className="meta-label">Тип</span>
          <strong>{gameCase.product.type}</strong>
        </div>
        <div className="meta-item">
          <span className="meta-label">Уровень</span>
          <strong>{gameCase.level}</strong>
        </div>
      </div>

      <p className="case-product-description">{gameCase.product.description}</p>
    </section>
  );
}
