import { useEffect, useState } from 'react';

import { PageHero } from '../../components/ui/PageHero';
import { StatusState } from '../../components/ui/StatusState';
import { AdminCaseEditor } from '../../components/admin/AdminCaseEditor';
import { AdminCaseList } from '../../components/admin/AdminCaseList';
import {
  createAdminCase,
  deleteAdminCase,
  fetchAdminCaseById,
  fetchAdminCases,
  updateAdminCase,
} from '../../features/admin-cases/adminCasesApi';
import type { AdminCase, AdminCasePayload } from '../../models/admin-case';

type EditorMode =
  | { type: 'closed' }
  | { type: 'create' }
  | { type: 'edit'; gameCase: AdminCase };

export function AdminPage() {
  const [cases, setCases] = useState<AdminCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>({ type: 'closed' });

  async function loadCases() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchAdminCases();
      setCases(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить кейсы');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCases();
  }, []);

  async function handleEdit(gameCase: AdminCase) {
    setError(null);

    try {
      const detailedCase = await fetchAdminCaseById(gameCase.id);
      setEditorMode({ type: 'edit', gameCase: detailedCase });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить кейс');
    }
  }

  async function handleDelete(gameCase: AdminCase) {
    const isConfirmed = window.confirm(`Удалить кейс "${gameCase.title}"?`);

    if (!isConfirmed) {
      return;
    }

    try {
      await deleteAdminCase(gameCase.id);
      setCases((previousCases) => previousCases.filter((item) => item.id !== gameCase.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Не удалось удалить кейс');
    }
  }

  async function handleSubmit(
    payload: AdminCase | AdminCasePayload,
    mode: 'create' | 'edit',
  ) {
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'create') {
        const createdCase = await createAdminCase(payload as AdminCase);
        setCases((previousCases) => [...previousCases, createdCase].sort((left, right) => left.level - right.level));
      } else {
        const updatedPayload = payload as AdminCase;
        const updatedCase = await updateAdminCase(updatedPayload.id, updatedPayload);
        setCases((previousCases) =>
          previousCases.map((item) => (item.id === updatedCase.id ? updatedCase : item)),
        );
      }

      setEditorMode({ type: 'closed' });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Не удалось сохранить кейс');
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedCase = editorMode.type === 'edit' ? editorMode.gameCase : null;

  return (
    <section className="stack-layout">
      <PageHero
        eyebrow="Админ-панель"
        title="Управление игровыми кейсами"
        description="Здесь администратор может просматривать, создавать, редактировать и удалять кейсы, которые используются в учебной игре."
        actions={
          <button type="button" className="primary-button" onClick={() => setEditorMode({ type: 'create' })}>
            Создать новый кейс
          </button>
        }
      />

      {error ? (
        <StatusState
          title="Ошибка работы с кейсами"
          description={error}
          tone="danger"
          actions={
            <button type="button" className="primary-button" onClick={() => void loadCases()}>
              Повторить загрузку
            </button>
          }
        />
      ) : null}

      {editorMode.type !== 'closed' ? (
        <AdminCaseEditor
          initialCase={selectedCase}
          isSubmitting={isSubmitting}
          onCancel={() => setEditorMode({ type: 'closed' })}
          onSubmit={handleSubmit}
        />
      ) : null}

      {isLoading ? (
        <StatusState
          title="Загрузка списка кейсов"
          description="Получаем данные из admin API и подготавливаем список для управления."
          tone="info"
        />
      ) : cases.length === 0 ? (
        <StatusState
          title="Список кейсов пуст"
          description="В базе пока нет кейсов. Можно создать первый сценарий прямо из админ-панели."
          tone="warning"
        />
      ) : (
        <AdminCaseList cases={cases} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </section>
  );
}
