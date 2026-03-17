import type { AdminCase } from '../../models/admin-case';

type AdminCaseListProps = {
  cases: AdminCase[];
  onEdit: (gameCase: AdminCase) => void;
  onDelete: (gameCase: AdminCase) => void;
};

export function AdminCaseList({ cases, onEdit, onDelete }: AdminCaseListProps) {
  return (
    <section className="stack-layout">
      {cases.map((gameCase) => (
        <article key={gameCase.id} className="panel-card">
          <div className="panel-card-header">
            <p className="page-label">Кейс</p>
            <h3>{gameCase.title}</h3>
          </div>

          <div className="case-product-meta">
            <div className="meta-item">
              <span className="meta-label">Уровень</span>
              <strong>{gameCase.level}</strong>
            </div>
            <div className="meta-item">
              <span className="meta-label">Тип продукта</span>
              <strong>{gameCase.productType}</strong>
            </div>
            <div className="meta-item">
              <span className="meta-label">ID</span>
              <strong>{gameCase.id}</strong>
            </div>
          </div>

          <p className="page-description">{gameCase.productDescription}</p>

          <div className="page-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => onEdit(gameCase)}
            >
              Редактировать
            </button>
            <button
              type="button"
              className="danger-button"
              onClick={() => onDelete(gameCase)}
            >
              Удалить
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
