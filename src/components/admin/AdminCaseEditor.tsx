import { useEffect, useState } from 'react';

import type { AdminCase, AdminCasePayload } from '../../models/admin-case';
import { AdminCaseDocumentsField } from './AdminCaseDocumentsField';
import { AdminCaseIssuesField } from './AdminCaseIssuesField';

type AdminCaseEditorProps = {
  initialCase: AdminCase | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: AdminCase | AdminCasePayload, mode: 'create' | 'edit') => void;
};

type EditorErrors = {
  form: string | null;
};

function createEmptyCase(): AdminCasePayload {
  return {
    id: '',
    level: 1,
    title: '',
    productName: '',
    productVersion: '',
    productType: '',
    productDescription: '',
    documents: [],
    issues: [],
    correctDecision: 'approve',
    explanation: '',
    topics: [],
  };
}

type EditorState = AdminCasePayload & {
  topicsValue: string;
};

function toEditorState(gameCase: AdminCase | null): EditorState {
  const fallback = createEmptyCase();
  const source = gameCase ?? fallback;

  return {
    ...source,
    topicsValue: source.topics.join(', '),
  };
}

function validateCaseForm(state: EditorState, mode: 'create' | 'edit'): string | null {
  if (mode === 'create' && state.id.trim().length === 0) {
    return 'Для нового кейса обязателен id.';
  }

  if (state.level < 1) {
    return 'Уровень должен быть не меньше 1.';
  }

  if (
    !state.title.trim() ||
    !state.productName.trim() ||
    !state.productVersion.trim() ||
    !state.productType.trim() ||
    !state.productDescription.trim() ||
    !state.explanation.trim()
  ) {
    return 'Заполните все обязательные поля кейса.';
  }

  if (state.documents.length === 0) {
    return 'Добавьте хотя бы один документ.';
  }

  if (state.documents.some((document) => !document.id.trim() || !document.type.trim() || !document.title.trim() || !document.content.trim())) {
    return 'У каждого документа должны быть заполнены id, тип, название и содержимое.';
  }

  if (state.issues.some((issue) => !issue.id.trim() || !issue.type.trim() || !issue.description.trim())) {
    return 'У каждого несоответствия должны быть заполнены id, тип и описание.';
  }

  return null;
}

export function AdminCaseEditor({
  initialCase,
  isSubmitting,
  onCancel,
  onSubmit,
}: AdminCaseEditorProps) {
  const [state, setState] = useState<EditorState>(() => toEditorState(initialCase));
  const [errors, setErrors] = useState<EditorErrors>({ form: null });

  useEffect(() => {
    setState(toEditorState(initialCase));
    setErrors({ form: null });
  }, [initialCase]);

  const mode = initialCase ? 'edit' : 'create';

  function updateField<Key extends keyof EditorState>(key: Key, value: EditorState[Key]) {
    setState((previousState) => ({
      ...previousState,
      [key]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const topics = state.topicsValue
      .split(',')
      .map((topic) => topic.trim())
      .filter(Boolean);

    const payload: AdminCasePayload = {
      id: state.id.trim(),
      level: Number(state.level),
      title: state.title.trim(),
      productName: state.productName.trim(),
      productVersion: state.productVersion.trim(),
      productType: state.productType.trim(),
      productDescription: state.productDescription.trim(),
      documents: state.documents.map((document) => ({
        id: document.id.trim(),
        type: document.type.trim(),
        title: document.title.trim(),
        content: document.content.trim(),
      })),
      issues: state.issues.map((issue) => ({
        id: issue.id.trim(),
        type: issue.type.trim(),
        description: issue.description.trim(),
      })),
      correctDecision: state.correctDecision,
      explanation: state.explanation.trim(),
      topics,
    };

    const formError = validateCaseForm({ ...state, ...payload, topicsValue: state.topicsValue }, mode);

    if (formError) {
      setErrors({ form: formError });
      return;
    }

    setErrors({ form: null });

    if (mode === 'edit' && initialCase) {
      onSubmit({ ...initialCase, ...payload }, 'edit');
      return;
    }

    onSubmit(payload, 'create');
  }

  return (
    <section className="panel-card">
      <div className="panel-card-header">
        <p className="page-label">Управление кейсом</p>
        <h3>{mode === 'edit' ? 'Редактирование кейса' : 'Создание нового кейса'}</h3>
      </div>

      <form className="form-stack" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>ID</span>
            <input
              value={state.id}
              onChange={(event) => updateField('id', event.target.value)}
              disabled={mode === 'edit'}
            />
          </label>
          <label className="form-field">
            <span>Уровень</span>
            <input
              type="number"
              min={1}
              value={state.level}
              onChange={(event) => updateField('level', Number(event.target.value))}
            />
          </label>
          <label className="form-field form-field-wide">
            <span>Название</span>
            <input
              value={state.title}
              onChange={(event) => updateField('title', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>Название продукта</span>
            <input
              value={state.productName}
              onChange={(event) => updateField('productName', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>Версия</span>
            <input
              value={state.productVersion}
              onChange={(event) => updateField('productVersion', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>Тип продукта</span>
            <input
              value={state.productType}
              onChange={(event) => updateField('productType', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>Решение</span>
            <select
              value={state.correctDecision}
              onChange={(event) =>
                updateField('correctDecision', event.target.value as AdminCasePayload['correctDecision'])
              }
            >
              <option value="approve">Допустить</option>
              <option value="reject">Отказать</option>
              <option value="rework">На доработку</option>
              <option value="extra-review">Доп. проверка</option>
            </select>
          </label>
          <label className="form-field form-field-wide">
            <span>Описание продукта</span>
            <textarea
              rows={4}
              value={state.productDescription}
              onChange={(event) => updateField('productDescription', event.target.value)}
            />
          </label>
          <label className="form-field form-field-wide">
            <span>Пояснение</span>
            <textarea
              rows={4}
              value={state.explanation}
              onChange={(event) => updateField('explanation', event.target.value)}
            />
          </label>
          <label className="form-field form-field-wide">
            <span>Темы через запятую</span>
            <input
              value={state.topicsValue}
              onChange={(event) => updateField('topicsValue', event.target.value)}
            />
          </label>
        </div>

        <div className="stack-layout">
          <AdminCaseDocumentsField
            documents={state.documents}
            onChange={(documents) => updateField('documents', documents)}
          />
          <AdminCaseIssuesField
            issues={state.issues}
            onChange={(issues) => updateField('issues', issues)}
          />
        </div>

        {errors.form ? <p className="form-error-text">{errors.form}</p> : null}

        <div className="page-actions">
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : mode === 'edit' ? 'Сохранить изменения' : 'Создать кейс'}
          </button>
          <button type="button" className="secondary-button" onClick={onCancel}>
            Отменить
          </button>
        </div>
      </form>
    </section>
  );
}
