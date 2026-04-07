import { Link } from 'react-router-dom';

import { appPaths } from '../../app/paths';
import { LeaderboardTable } from '../../components/results/LeaderboardTable';
import { PageHero } from '../../components/ui/PageHero';
import { StatusState } from '../../components/ui/StatusState';
import { usePlayerProfile } from '../../features/profile/usePlayerProfile';

export function LeaderboardPage() {
  const { loadState, profileData, error } = usePlayerProfile();

  if (loadState === 'loading') {
    return (
      <section className="stack-layout">
        <PageHero
          eyebrow="Рейтинг"
          title="Таблица лидеров"
          description="Загружаем общий рейтинг игроков по очкам, проценту верных ответов и количеству завершенных кейсов."
        />
        <StatusState
          title="Загрузка рейтинга"
          description="Считываем актуальные позиции игроков с сервера."
          tone="info"
        />
      </section>
    );
  }

  if (loadState === 'error') {
    return (
      <section className="stack-layout">
        <PageHero
          eyebrow="Рейтинг"
          title="Таблица лидеров"
          description="Рейтинг строится по прогрессу игроков и обновляется на основе серверных результатов."
        />
        <StatusState
          title="Не удалось загрузить рейтинг"
          description={error ?? 'Сервер не вернул данные рейтинга.'}
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

  if (!profileData || profileData.leaderboard.length === 0) {
    return (
      <section className="stack-layout">
        <PageHero
          eyebrow="Рейтинг"
          title="Таблица лидеров"
          description="Когда у игроков появятся результаты, здесь сформируется общий рейтинг."
        />
        <StatusState
          title="Рейтинг пока пуст"
          description="Пройдите хотя бы один кейс, чтобы начать формировать таблицу лидеров."
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
        eyebrow="Рейтинг"
        title="Таблица лидеров"
        description="Игроки сортируются по сумме очков, затем по проценту верных ответов и числу завершенных кейсов."
      />

      <LeaderboardTable entries={profileData.leaderboard} />
    </section>
  );
}
