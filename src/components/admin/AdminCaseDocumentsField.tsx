import type { AdminCaseDocument } from '../../models/admin-case';

type AdminCaseDocumentsFieldProps = {
  documents: AdminCaseDocument[];
  onChange: (documents: AdminCaseDocument[]) => void;
};

function createEmptyDocument(): AdminCaseDocument {
  return {
    id: '',
    type: '',
    title: '',
    content: '',
  };
}

export function AdminCaseDocumentsField({
  documents,
  onChange,
}: AdminCaseDocumentsFieldProps) {
  function handleDocumentChange(
    index: number,
    field: keyof AdminCaseDocument,
    value: string,
  ) {
    onChange(
      documents.map((document, documentIndex) =>
        documentIndex === index
          ? {
              ...document,
              [field]: value,
            }
          : document,
      ),
    );
  }

  function handleAddDocument() {
    onChange([...documents, createEmptyDocument()]);
  }

  function handleRemoveDocument(index: number) {
    onChange(documents.filter((_, documentIndex) => documentIndex !== index));
  }

  return (
    <section className="stack-layout">
      <div className="panel-card-header">
        <p className="page-label">Документы</p>
        <h4>Состав кейса</h4>
      </div>

      {documents.length === 0 ? (
        <p className="page-description">Документы пока не добавлены.</p>
      ) : (
        <div className="stack-layout">
          {documents.map((document, index) => (
            <article key={`${document.id}-${index}`} className="form-section-card">
              <div className="form-grid">
                <label className="form-field">
                  <span>ID документа</span>
                  <input
                    value={document.id}
                    onChange={(event) =>
                      handleDocumentChange(index, 'id', event.target.value)
                    }
                  />
                </label>
                <label className="form-field">
                  <span>Тип</span>
                  <input
                    value={document.type}
                    onChange={(event) =>
                      handleDocumentChange(index, 'type', event.target.value)
                    }
                  />
                </label>
                <label className="form-field form-field-wide">
                  <span>Название</span>
                  <input
                    value={document.title}
                    onChange={(event) =>
                      handleDocumentChange(index, 'title', event.target.value)
                    }
                  />
                </label>
                <label className="form-field form-field-wide">
                  <span>Содержимое</span>
                  <textarea
                    rows={5}
                    value={document.content}
                    onChange={(event) =>
                      handleDocumentChange(index, 'content', event.target.value)
                    }
                  />
                </label>
              </div>

              <div className="page-actions">
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => handleRemoveDocument(index)}
                >
                  Удалить документ
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="page-actions">
        <button type="button" className="secondary-button" onClick={handleAddDocument}>
          Добавить документ
        </button>
      </div>
    </section>
  );
}
