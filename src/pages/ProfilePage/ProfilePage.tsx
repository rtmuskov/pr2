import { Link } from 'react-router-dom';

import { appPaths } from '../../app/paths';
import { PageHero } from '../../components/ui/PageHero';
import { StatusState } from '../../components/ui/StatusState';
import { getAllCases } from '../../features/case-engine/caseService';
import { getStoredCaseDecision } from '../../utils/storage/caseDecisionStorage';

export function ProfilePage() {
  const cases = getAllCases();
  const completedCases = cases.filter((gameCase) => getStoredCaseDecision(gameCase.id));

  if (completedCases.length === 0) {
    return (
      <section className="stack-layout">
        <PageHero
          eyebrow="Профиль"
          title="Прогресс игрока"
          description="Здесь будет отображаться статистика прохождения, когда вы завершите хотя бы один кейс."
        />
        <StatusState
        title="Прогресс пока отсутствует"
        description="Вы еще не завершили ни одного кейса. Начните с первого сценария и после принятия решения результат появится в профиле."
        tone="info"
        actions={
            <Link className="primary-button" to={appPaths.levels}>
              Перейти к кейсам
            </Link>
        }
        />
      </section>
    );
  }

  return (
    <section className="stack-layout">
      <PageHero
        eyebrow="Профиль"
        title="Прогресс игрока"
        description="Краткий обзор уже завершенных кейсов. На следующем этапе сюда можно будет добавить очки, рейтинг и развернутую статистику."
      />
      <section className="panel-card progress-list">
        {completedCases.map((gameCase) => (
          <article key={gameCase.id} className="progress-item">
            <div>
              <span className="level-badge">Уровень {gameCase.level}</span>
              <h3>{gameCase.title}</h3>
            </div>
            <Link className="secondary-button" to={appPaths.result(gameCase.id)}>
              Открыть результат
            </Link>
          </article>
        ))}
      </section>
    </section>
  );
}
