import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { appPaths } from '../../app/paths';
import { CaseDecisionActions } from '../../components/case/CaseDecisionActions';
import { CaseDocumentList } from '../../components/case/CaseDocumentList';
import { CaseDocumentViewer } from '../../components/case/CaseDocumentViewer';
import { CaseProductCard } from '../../components/case/CaseProductCard';
import { StatusState } from '../../components/ui/StatusState';
import { useCaseResolver } from '../../features/case-engine/useCaseResolver';
import type { DecisionType } from '../../models/decision';
import { saveCaseDecision } from '../../utils/storage/caseDecisionStorage';

export function CasePage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const caseState = useCaseResolver(caseId);
  const gameCase = caseState.status === 'ready' ? caseState.gameCase : undefined;
  const initialDocumentId = gameCase?.documents[0]?.id ?? null;
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(initialDocumentId);

  useEffect(() => {
    setSelectedDocumentId(gameCase?.documents[0]?.id ?? null);
  }, [gameCase]);

  const selectedDocument = useMemo(() => {
    if (!gameCase || !selectedDocumentId) {
      return undefined;
    }

    return gameCase.documents.find((document) => document.id === selectedDocumentId);
  }, [gameCase, selectedDocumentId]);

  if (caseState.status === 'loading') {
    return (
      <StatusState
        title="Загрузка кейса"
        description="Подготавливаем карточку продукта, комплект документов и панель решений."
        tone="info"
      />
    );
  }

  if (caseState.status === 'missing-id') {
    return (
      <StatusState
        title="Кейс не выбран"
        description="Откройте каталог уровней и выберите сценарий проверки, чтобы начать работу."
        tone="warning"
        actions={
          <Link className="primary-button" to={appPaths.levels}>
            К выбору кейса
          </Link>
        }
      />
    );
  }

  if (caseState.status === 'not-found') {
    return (
      <StatusState
        title="Ошибка загрузки кейса"
        description="Не удалось найти запрошенный кейс. Возможно, он был удален или указан неверный идентификатор."
        tone="danger"
        actions={
          <Link className="primary-button" to={appPaths.levels}>
            Вернуться к списку кейсов
          </Link>
        }
      />
    );
  }

  const resolvedCase = caseState.gameCase;

  function handleDecision(decision: DecisionType) {
    saveCaseDecision({
      caseId: resolvedCase.id,
      decision,
      selectedIssueIds: [],
      completedAt: new Date().toISOString(),
    });

    navigate(appPaths.result(resolvedCase.id));
  }

  return (
    <section className="case-page">
      <CaseProductCard gameCase={resolvedCase} />

      <div className="case-workspace">
        <CaseDocumentList
          documents={resolvedCase.documents}
          selectedDocumentId={selectedDocumentId}
          onSelect={setSelectedDocumentId}
        />
        <CaseDocumentViewer document={selectedDocument} />
      </div>

      <CaseDecisionActions onDecisionSelect={handleDecision} />
    </section>
  );
}
