import { NavLink, Outlet } from 'react-router-dom';

import { appPaths } from '../../app/paths';

const navigationItems = [
  { to: appPaths.home, label: 'Главная' },
  { to: appPaths.tutorial, label: 'Обучение' },
  { to: appPaths.levels, label: 'Уровни' },
  { to: appPaths.profile, label: 'Профиль' },
];

export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-main">
          <p className="app-eyebrow">Учебная веб-игра</p>
          <h1 className="app-title">Инспектор качества ПО</h1>
          <p className="app-subtitle">
            Анализируйте документацию, находите несоответствия и принимайте обоснованные решения по качеству программных продуктов.
          </p>
        </div>
        <div className="app-header-side">
          <nav className="app-nav" aria-label="Основная навигация">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'nav-link nav-link-active' : 'nav-link'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="app-header-note">
            <span className="app-header-note-label">Режим</span>
            <strong>Учебная проверка кейсов</strong>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
