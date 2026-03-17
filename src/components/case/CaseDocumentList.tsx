import type { CaseDocument } from '../../models/document';

type CaseDocumentListProps = {
  documents: CaseDocument[];
  selectedDocumentId: string | null;
  onSelect: (documentId: string) => void;
};

export function CaseDocumentList({
  documents,
  selectedDocumentId,
  onSelect,
}: CaseDocumentListProps) {
  if (documents.length === 0) {
    return (
      <aside className="panel-card case-sidebar">
        <div className="panel-card-header">
          <p className="page-label">Документы</p>
          <h3>Пакет проверки пуст</h3>
        </div>
        <p className="page-description">
          Для этого кейса пока не загружены документы. Выберите другой кейс или проверьте исходные данные.
        </p>
      </aside>
    );
  }

  return (
    <aside className="panel-card case-sidebar">
      <div className="panel-card-header">
        <p className="page-label">Документы</p>
        <h3>Пакет проверки</h3>
      </div>

      <div className="document-list">
        {documents.map((document) => {
          const isActive = document.id === selectedDocumentId;

          return (
            <button
              key={document.id}
              type="button"
              className={isActive ? 'document-list-item document-list-item-active' : 'document-list-item'}
              onClick={() => onSelect(document.id)}
            >
              <span className="document-list-type">{document.type}</span>
              <strong>{document.title}</strong>
              <span className="document-list-summary">{document.summary}</span>
              <span className="document-list-open">Открыть документ</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
