import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { appPaths } from '../../app/paths';
import { useAuth } from '../../app/providers/AuthProvider';

const guestNavigationItems = [
  { to: appPaths.home, label: 'Главная' },
  { to: appPaths.tutorial, label: 'Обучение' },
];

export function AppLayout() {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const navigationItems = [
    ...(user
      ? [
          { to: appPaths.home, label: 'Главная' },
          { to: appPaths.tutorial, label: 'Обучение' },
          { to: appPaths.levels, label: 'Уровни' },
          { to: appPaths.leaderboard, label: 'Рейтинг' },
        ]
      : guestNavigationItems),
    ...(user ? [{ to: appPaths.profile, label: 'Профиль' }] : []),
    ...(isAdmin ? [{ to: appPaths.admin, label: 'Админ-панель' }] : []),
  ];

  function handleLogout() {
    logout();
    navigate(appPaths.home);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-main">
          <p className="app-eyebrow">Учебная веб-игра</p>
          <h1 className="app-title">Инспектор качества ПО</h1>
          <p className="app-subtitle">
            Анализируйте документацию, находите несоответствия и принимайте обоснованные
            решения по качеству программных продуктов.
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
            {user ? (
              <button className="nav-link nav-link-button" type="button" onClick={handleLogout}>
                Выйти
              </button>
            ) : (
              <>
                <NavLink
                  to={appPaths.login}
                  className={({ isActive }) =>
                    isActive ? 'nav-link nav-link-active' : 'nav-link'
                  }
                >
                  Вход
                </NavLink>
                <NavLink
                  to={appPaths.register}
                  className={({ isActive }) =>
                    isActive ? 'nav-link nav-link-active' : 'nav-link'
                  }
                >
                  Регистрация
                </NavLink>
              </>
            )}
          </nav>
          <div className="app-header-note">
            <span className="app-header-note-label">Режим</span>
            <strong>{user ? `${user.username} · ${user.role}` : 'Гостевой доступ'}</strong>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
