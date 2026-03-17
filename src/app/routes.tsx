import { Navigate, Route, Routes } from 'react-router-dom';

import { appPaths } from './paths';
import { AppLayout } from '../components/layout/AppLayout';
import { CasePage } from '../pages/CasePage/CasePage';
import { HomePage } from '../pages/HomePage/HomePage';
import { LevelSelectPage } from '../pages/LevelSelectPage/LevelSelectPage';
import { ProfilePage } from '../pages/ProfilePage/ProfilePage';
import { ResultPage } from '../pages/ResultPage/ResultPage';
import { TutorialPage } from '../pages/TutorialPage/TutorialPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={appPaths.home} element={<HomePage />} />
        <Route path={appPaths.tutorial} element={<TutorialPage />} />
        <Route path={appPaths.levels} element={<LevelSelectPage />} />
        <Route path="/case/:caseId" element={<CasePage />} />
        <Route path="/result/:caseId" element={<ResultPage />} />
        <Route path={appPaths.profile} element={<ProfilePage />} />
        <Route path="*" element={<Navigate to={appPaths.home} replace />} />
      </Route>
    </Routes>
  );
}
