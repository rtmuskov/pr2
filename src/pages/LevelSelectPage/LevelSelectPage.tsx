import { Link } from 'react-router-dom';

import { appPaths } from '../../app/paths';
import { CaseCatalogCard } from '../../components/case/CaseCatalogCard';
import { PageHero } from '../../components/ui/PageHero';
import { StatusState } from '../../components/ui/StatusState';
import { getAllCases } from '../../features/case-engine/caseService';

export function LevelSelectPage() {
  const cases = getAllCases();

  if (cases.length === 0) {
    return (
      <StatusState
        title="Кейсы пока не загружены"
        description="В каталоге нет доступных сценариев проверки. Проверьте данные или вернитесь позже."
        tone="warning"
        actions={
          <Link className="primary-button" to={appPaths.home}>
            На главную
          </Link>
        }
      />
    );
  }

  return (
    <section className="stack-layout">
      <PageHero
        eyebrow="Выбор кейса"
        title="Каталог учебных проверок"
        description="Выберите кейс по уровню сложности. Чем выше уровень, тем больше нужно сопоставлять документы, требования, дефекты и основания для решения."
      />

      <section className="case-catalog">
        {cases.map((gameCase) => (
          <CaseCatalogCard key={gameCase.id} gameCase={gameCase} />
        ))}
      </section>
    </section>
  );
}
