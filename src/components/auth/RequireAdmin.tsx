import { Navigate, useLocation } from 'react-router-dom';

import { appPaths } from '../../app/paths';
import { useAuth } from '../../app/providers/AuthProvider';
import { StatusState } from '../ui/StatusState';

type RequireAdminProps = {
  children: JSX.Element;
};

export function RequireAdmin({ children }: RequireAdminProps) {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <StatusState
        title="Проверяем права доступа"
        description="Загружаем данные пользователя перед входом в админ-панель."
        tone="info"
      />
    );
  }

  if (!user) {
    return <Navigate to={appPaths.login} replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return (
      <StatusState
        title="Доступ ограничен"
        description="Эта страница доступна только пользователю с ролью ADMIN."
        tone="warning"
      />
    );
  }

  return children;
}
