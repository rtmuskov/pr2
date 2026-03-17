import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { appPaths } from '../../app/paths';
import { PageHero } from '../../components/ui/PageHero';
import { StatusState } from '../../components/ui/StatusState';
import { getAllCases } from '../../features/case-engine/caseService';
import { usePlayerProfile } from '../../features/profile/usePlayerProfile';

function formatLastPlayedAt(value: string | null): string {
  if (!value) {
    return 'Еще не было игровых сессий';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Дата недоступна';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatResultDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Дата недоступна';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function ProfilePage() {
  const { loadState, profileData, error } = usePlayerProfile();

  const caseMap = useMemo(() => {
    return new Map(getAllCases().map((gameCase) => [gameCase.id, gameCase]));
  }, []);

  const averageScore = useMemo(() => {
    if (!profileData?.results.length) {
      return 0;
    }

    const totalScore = profileData.results.reduce((sum, result) => sum + result.scoreEarned, 0);
    return Math.round(totalScore / profileData.results.length);
  }, [profileData]);

  const levelStats = useMemo(() => {
    if (!profileData?.results.length) {
      return [];
    }

    const grouped = new Map<number, { casesCompleted: number; correctAnswers: number }>();

    for (const result of profileData.results) {
      const gameCase = caseMap.get(result.caseId);
      const level = gameCase?.level ?? 1;
      const current = grouped.get(level) ?? { casesCompleted: 0, correctAnswers: 0 };

      current.casesCompleted += 1;
      current.correctAnswers += result.isCorrect ? 1 : 0;
      grouped.set(level, current);
    }

    return Array.from(grouped.entries())
      .map(([level, stats]) => ({
        level,
        casesCompleted: stats.casesCompleted,
        correctAnswers: stats.correctAnswers,
        accuracy:
          stats.casesCompleted === 0
            ? 0
            : Number(((stats.correctAnswers / stats.casesCompleted) * 100).toFixed(1)),
      }))
      .sort((left, right) => left.level - right.level);
  }, [caseMap, profileData]);

  const recentResults = useMemo(() => {
    return (profileData?.results ?? []).slice(0, 6).map((result) => ({
      ...result,
      title: caseMap.get(result.caseId)?.title ?? result.caseId,
      level: caseMap.get(result.caseId)?.level ?? 1,
    }));
  }, [caseMap, profileData]);

  const heroAside = profileData?.profile ? (
    <div className="hero-metrics">
      <div className="hero-metric-card">
        <span className="meta-label">Текущий уровень</span>
        <strong>{profileData.profile.currentLevel}</strong>
      </div>
      <div className="hero-metric-card">
        <span className="meta-label">Всего очков</span>
        <strong>{profileData.profile.totalScore}</strong>
      </div>
      <div className="hero-metric-card">
        <span className="meta-label">Процент верных ответов</span>
        <strong>{profileData.profile.accuracy.toFixed(1)}%</strong>
      </div>
    </div>
  ) : undefined;

  if (loadState === 'loading') {
    return (
      <section className="stack-layout">
        <PageHero
          eyebrow="Профиль"
          title="Прогресс игрока"
          description="Загружаем персональную статистику, историю решений и серверный прогресс аккаунта."
        />
        <StatusState
          title="Загрузка профиля"
          description="Считываем профиль игрока и историю результатов с сервера."
          tone="info"
        />
      </section>
    );
  }

  if (loadState === 'error') {
    return (
      <section className="stack-layout">
        <PageHero
          eyebrow="Профиль"
          title="Прогресс игрока"
          description="Профиль и результаты хранятся отдельно для каждого аккаунта."
        />
        <StatusState
          title="Не удалось загрузить профиль"
          description={error ?? 'Сервер не вернул данные профиля.'}
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

  if (!profileData?.profile || !profileData.progress) {
    return (
      <section className="stack-layout">
        <PageHero
          eyebrow="Профиль"
          title="Прогресс игрока"
          description="Профиль найден, но данные прогресса пока не готовы."
        />
        <StatusState
          title="Прогресс пока недоступен"
          description="Завершите первый кейс после входа, и статистика появится в профиле."
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
        title={profileData.profile.displayName || profileData.user.username}
        description="Профиль показывает процент верных ответов, историю решений и прогресс именно этого аккаунта."
        aside={heroAside}
      />

      <section className="info-grid">
        <article className="info-card">
          <h3>Завершено кейсов</h3>
          <p>{profileData.profile.casesCompleted}</p>
        </article>
        <article className="info-card">
          <h3>Верных ответов</h3>
          <p>
            {profileData.profile.correctAnswers} из {profileData.profile.casesCompleted}
          </p>
        </article>
        <article className="info-card">
          <h3>Средний балл</h3>
          <p>{averageScore}</p>
        </article>
      </section>

      <section className="panel-card">
        <div className="panel-card-header">
          <h3>Точность решений</h3>
          <p className="page-description">
            Процент верных ответов считается по реальным результатам игрока: верные решения делятся
            на общее число завершенных кейсов.
          </p>
        </div>
        <div className="result-status-grid">
          <div className="meta-item">
            <span className="meta-label">Процент верных ответов</span>
            <strong>{profileData.profile.accuracy.toFixed(1)}%</strong>
          </div>
          <div className="meta-item">
            <span className="meta-label">Правильных решений</span>
            <strong>{profileData.profile.correctAnswers}</strong>
          </div>
          <div className="meta-item">
            <span className="meta-label">Всего завершено</span>
            <strong>{profileData.profile.casesCompleted}</strong>
          </div>
          <div className="meta-item">
            <span className="meta-label">Последняя активность</span>
            <strong>{formatLastPlayedAt(profileData.progress.lastPlayedAt)}</strong>
          </div>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-card-header">
          <h3>Открытые уровни</h3>
          <p className="page-description">Уровни, доступные именно для этого профиля игрока.</p>
        </div>
        <div className="topic-list">
          {profileData.progress.unlockedLevels.map((level) => (
            <span key={level} className="level-badge">
              Уровень {level}
            </span>
          ))}
        </div>
      </section>

      {levelStats.length > 0 ? (
        <section className="panel-card progress-list">
          <div className="panel-card-header">
            <h3>Статистика по уровням</h3>
            <p className="page-description">
              Сколько кейсов пройдено на каждом уровне и каков процент верных ответов.
            </p>
          </div>
          {levelStats.map((item) => (
            <article key={item.level} className="progress-item">
              <div>
                <span className="level-badge">Уровень {item.level}</span>
                <h3>{item.correctAnswers} верных из {item.casesCompleted}</h3>
              </div>
              <strong>{item.accuracy.toFixed(1)}%</strong>
            </article>
          ))}
        </section>
      ) : null}

      {recentResults.length === 0 ? (
        <StatusState
          title="Прогресс пока отсутствует"
          description="Для этого профиля еще нет завершенных кейсов. Начните прохождение, и результаты привяжутся к вашему аккаунту."
          tone="info"
          actions={
            <Link className="primary-button" to={appPaths.levels}>
              Перейти к кейсам
            </Link>
          }
        />
      ) : (
        <section className="panel-card progress-list">
          <div className="panel-card-header">
            <h3>Последние результаты</h3>
            <p className="page-description">
              История последних попыток с привязкой к кейсам и набранным баллам.
            </p>
          </div>
          {recentResults.map((result) => (
            <article key={`${result.caseId}-${result.createdAt}`} className="progress-item">
              <div>
                <span className="level-badge">Уровень {result.level}</span>
                <h3>{result.title}</h3>
                <p>
                  {result.isCorrect ? 'Верное решение' : 'Неверное решение'} ·{' '}
                  {formatResultDate(result.createdAt)}
                </p>
              </div>
              <strong>{result.scoreEarned} баллов</strong>
            </article>
          ))}
        </section>
      )}
    </section>
  );
}
