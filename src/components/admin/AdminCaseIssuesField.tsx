import type { AdminCaseIssue } from '../../models/admin-case';

type AdminCaseIssuesFieldProps = {
  issues: AdminCaseIssue[];
  onChange: (issues: AdminCaseIssue[]) => void;
};

function createEmptyIssue(): AdminCaseIssue {
  return {
    id: '',
    type: '',
    description: '',
  };
}

export function AdminCaseIssuesField({ issues, onChange }: AdminCaseIssuesFieldProps) {
  function handleIssueChange(index: number, field: keyof AdminCaseIssue, value: string) {
    onChange(
      issues.map((issue, issueIndex) =>
        issueIndex === index
          ? {
              ...issue,
              [field]: value,
            }
          : issue,
      ),
    );
  }

  function handleAddIssue() {
    onChange([...issues, createEmptyIssue()]);
  }

  function handleRemoveIssue(index: number) {
    onChange(issues.filter((_, issueIndex) => issueIndex !== index));
  }

  return (
    <section className="stack-layout">
      <div className="panel-card-header">
        <p className="page-label">Несоответствия</p>
        <h4>Анализ проблем</h4>
      </div>

      {issues.length === 0 ? (
        <p className="page-description">Несоответствия пока не добавлены.</p>
      ) : (
        <div className="stack-layout">
          {issues.map((issue, index) => (
            <article key={`${issue.id}-${index}`} className="form-section-card">
              <div className="form-grid">
                <label className="form-field">
                  <span>ID несоответствия</span>
                  <input
                    value={issue.id}
                    onChange={(event) => handleIssueChange(index, 'id', event.target.value)}
                  />
                </label>
                <label className="form-field">
                  <span>Тип</span>
                  <input
                    value={issue.type}
                    onChange={(event) => handleIssueChange(index, 'type', event.target.value)}
                  />
                </label>
                <label className="form-field form-field-wide">
                  <span>Описание</span>
                  <textarea
                    rows={4}
                    value={issue.description}
                    onChange={(event) =>
                      handleIssueChange(index, 'description', event.target.value)
                    }
                  />
                </label>
              </div>

              <div className="page-actions">
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => handleRemoveIssue(index)}
                >
                  Удалить несоответствие
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="page-actions">
        <button type="button" className="secondary-button" onClick={handleAddIssue}>
          Добавить несоответствие
        </button>
      </div>
    </section>
  );
}
