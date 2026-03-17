import { Link } from 'react-router-dom';

import { appPaths } from '../../app/paths';
import { useAuth } from '../../app/providers/AuthProvider';
import { CaseCatalogCard } from '../../components/case/CaseCatalogCard';
import { PageHero } from '../../components/ui/PageHero';
import { StatusState } from '../../components/ui/StatusState';
import { getAllCases } from '../../features/case-engine/caseService';
import { usePlayerProfile } from '../../features/profile/usePlayerProfile';

export function LevelSelectPage() {
  const { user } = useAuth();
  const { loadState, profileData, error } = usePlayerProfile();
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

  if (user && loadState === 'loading') {
    return (
      <section className="stack-layout">
        <PageHero
          eyebrow="Выбор кейса"
          title="Каталог учебных проверок"
          description="Загружаем уровни, доступные именно для вашего профиля игрока."
        />
        <StatusState
          title="Загрузка прогресса"
          description="Проверяем, какие уровни уже открыты для текущего аккаунта."
          tone="info"
        />
      </section>
    );
  }

  if (user && loadState === 'error') {
    return (
      <section className="stack-layout">
        <PageHero
          eyebrow="Выбор кейса"
          title="Каталог учебных проверок"
          description="Доступ к уровням зависит от персонального прогресса игрока."
        />
        <StatusState
          title="Не удалось загрузить прогресс"
          description={error ?? 'Сервер не вернул данные об открытых уровнях.'}
          tone="danger"
          actions={
            <button className="primary-button" type="button" onClick={() => window.location.reload()}>
              Повторить
            </button>
          }
        />
      </section>
    );
  }

  const unlockedLevels = new Set(profileData?.progress?.unlockedLevels ?? []);
  const visibleCases = user ? cases : cases.filter((gameCase) => gameCase.level === 1);

  return (
    <section className="stack-layout">
      <PageHero
        eyebrow="Выбор кейса"
        title="Каталог учебных проверок"
        description={
          user
            ? 'Выберите кейс из уровней, открытых для вашего профиля. Следующие сценарии станут доступны по мере прохождения.'
            : 'В гостевом режиме доступен только первый уровень. Войдите в аккаунт, чтобы сохранять прогресс и открывать новые уровни.'
        }
      />

      {!user ? (
        <StatusState
          title="Гостевой режим"
          description="Без авторизации доступен только ознакомительный набор первого уровня. Для персонального прогресса войдите в аккаунт."
          tone="info"
          actions={
            <>
              <Link className="primary-button" to={appPaths.login}>
                Войти
              </Link>
              <Link className="secondary-button" to={appPaths.register}>
                Регистрация
              </Link>
            </>
          }
        />
      ) : null}

      <section className="case-catalog">
        {visibleCases.map((gameCase) => (
          <CaseCatalogCard
            key={gameCase.id}
            gameCase={gameCase}
            locked={user ? !unlockedLevels.has(gameCase.level) : false}
          />
        ))}
      </section>
    </section>
  );
}
