import { Link } from 'react-router-dom';

import { appPaths } from '../../app/paths';
import { PageHero } from '../../components/ui/PageHero';

export function HomePage() {
  return (
    <section className="stack-layout">
      <PageHero
        eyebrow="Главная"
        title="Тренажер для инспектора качества ПО"
        description="Игра помогает отрабатывать экспертизу качества программного обеспечения через анализ требований, тестовой документации, дефектов и сертификационных материалов."
        actions={
          <>
            <Link className="primary-button" to={appPaths.tutorial}>
              Начать с обучения
            </Link>
            <Link className="secondary-button" to={appPaths.levels}>
              Перейти к кейсам
            </Link>
          </>
        }
        aside={
          <div className="hero-metrics">
            <div className="hero-metric-card">
              <span className="meta-label">Формат</span>
              <strong>10 учебных кейсов</strong>
            </div>
            <div className="hero-metric-card">
              <span className="meta-label">Фокус</span>
              <strong>Качество, стандарты, сертификация</strong>
            </div>
          </div>
        }
      />

      <section className="panel-card info-grid">
        <article className="info-card">
          <h3>Что делает игрок</h3>
          <p>Проверяет пакет документов, оценивает несоответствия и выбирает итоговое решение по продукту.</p>
        </article>
        <article className="info-card">
          <h3>Чему учит игра</h3>
          <p>Связывать требования, тестирование и дефекты с реальным допуском программного продукта к эксплуатации.</p>
        </article>
        <article className="info-card">
          <h3>Как идти по игре</h3>
          <p>От формальных проверок документов на первых уровнях к смешанным экспертным кейсам на финальном уровне.</p>
        </article>
      </section>
    </section>
  );
}
