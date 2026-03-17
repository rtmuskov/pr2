import type { CaseDocument } from '../../models/document';

type CaseDocumentViewerProps = {
  document: CaseDocument | undefined;
};

export function CaseDocumentViewer({ document }: CaseDocumentViewerProps) {
  if (!document) {
    return (
      <section className="panel-card case-document-viewer">
        <div className="panel-card-header">
          <p className="page-label">Просмотр документа</p>
          <h3>Документ не выбран</h3>
        </div>
      </section>
    );
  }

  return (
    <section className="panel-card case-document-viewer">
      <div className="panel-card-header">
        <p className="page-label">Просмотр документа</p>
        <h3>{document.title}</h3>
      </div>

      <div className="document-viewer-meta">
        <span className="document-viewer-badge">{document.type}</span>
        <span className="document-viewer-badge">{document.sections.length} секций</span>
      </div>

      <p className="case-document-summary">{document.summary}</p>

      <div className="document-section-list">
        {document.sections.map((section) => (
          <article key={section.id} className="document-section-card">
            <h4>{section.title}</h4>
            <p>{section.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
