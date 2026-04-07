import type { LeaderboardEntry } from '../../models/profile';

type LeaderboardTableProps = {
  entries: LeaderboardEntry[];
};

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="panel-card progress-list">
      <div className="panel-card-header">
        <h3>Таблица рейтинга</h3>
        <p className="page-description">
          Игроки сортируются по общему числу очков, затем по проценту верных ответов и числу
          завершенных кейсов.
        </p>
      </div>

      {entries.map((entry) => (
        <article
          key={entry.userId}
          className={`progress-item${entry.isCurrentUser ? ' leaderboard-current-user' : ''}`}
        >
          <div>
            <span className="level-badge">#{entry.rank}</span>
            <h3>{entry.displayName || entry.username}</h3>
            <p>
              Уровень {entry.currentLevel} · {entry.casesCompleted} кейсов ·{' '}
              {entry.accuracy.toFixed(1)}% верных ответов
            </p>
          </div>
          <strong>{entry.totalScore} очков</strong>
        </article>
      ))}
    </section>
  );
}
