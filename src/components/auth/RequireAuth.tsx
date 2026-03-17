import { Navigate, useLocation } from 'react-router-dom';

import { appPaths } from '../../app/paths';
import { useAuth } from '../../app/providers/AuthProvider';
import { StatusState } from '../ui/StatusState';

type RequireAuthProps = {
  children: JSX.Element;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <StatusState
        title="Проверяем доступ"
        description="Загружаем данные авторизации перед открытием приватной страницы."
        tone="info"
      />
    );
  }

  if (!user) {
    return <Navigate to={appPaths.login} replace state={{ from: location.pathname }} />;
  }

  return children;
}
