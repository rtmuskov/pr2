import { Navigate, Route, Routes } from 'react-router-dom';

import { appPaths } from './paths';
import { RequireAdmin } from '../components/auth/RequireAdmin';
import { RequireAuth } from '../components/auth/RequireAuth';
import { AppLayout } from '../components/layout/AppLayout';
import { AdminPage } from '../pages/AdminPage/AdminPage';
import { CasePage } from '../pages/CasePage/CasePage';
import { HomePage } from '../pages/HomePage/HomePage';
import { LeaderboardPage } from '../pages/LeaderboardPage/LeaderboardPage';
import { LevelSelectPage } from '../pages/LevelSelectPage/LevelSelectPage';
import { LoginPage } from '../pages/LoginPage/LoginPage';
import { ProfilePage } from '../pages/ProfilePage/ProfilePage';
import { RegisterPage } from '../pages/RegisterPage/RegisterPage';
import { ResultPage } from '../pages/ResultPage/ResultPage';
import { TutorialPage } from '../pages/TutorialPage/TutorialPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={appPaths.home} element={<HomePage />} />
        <Route path={appPaths.login} element={<LoginPage />} />
        <Route path={appPaths.register} element={<RegisterPage />} />
        <Route path={appPaths.tutorial} element={<TutorialPage />} />
        <Route path={appPaths.levels} element={<LevelSelectPage />} />
        <Route
          path={appPaths.leaderboard}
          element={
            <RequireAuth>
              <LeaderboardPage />
            </RequireAuth>
          }
        />
        <Route path="/case/:caseId" element={<CasePage />} />
        <Route path="/result/:caseId" element={<ResultPage />} />
        <Route
          path={appPaths.profile}
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path={appPaths.admin}
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to={appPaths.home} replace />} />
      </Route>
    </Routes>
  );
}
