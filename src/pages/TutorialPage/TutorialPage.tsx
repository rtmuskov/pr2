import { Link } from 'react-router-dom';

import { appPaths } from '../../app/paths';
import { PageHero } from '../../components/ui/PageHero';

export function TutorialPage() {
  return (
    <section className="stack-layout">
      <PageHero
        eyebrow="Обучение"
        title="Как работать с кейсами"
        description="Перед прохождением сценариев игрок сравнивает документы, проверяет формальные признаки, оценивает полноту тестирования и делает итоговый вывод по качеству продукта."
        actions={
          <Link className="primary-button" to={appPaths.levels}>
            К выбору уровня
          </Link>
        }
      />
      <section className="panel-card info-grid">
        <article className="info-card">
          <h3>1. Изучите продукт</h3>
          <p>Начните с карточки продукта и поймите, какая функция считается для него ключевой.</p>
        </article>
        <article className="info-card">
          <h3>2. Сверьте документы</h3>
          <p>Сопоставьте требования, тесты, дефекты, сертификаты и акты между собой, а не по отдельности.</p>
        </article>
        <article className="info-card">
          <h3>3. Примите решение</h3>
          <p>Оцените, достаточно ли оснований для допуска, отказа, доработки или дополнительной проверки.</p>
        </article>
      </section>
    </section>
  );
}
