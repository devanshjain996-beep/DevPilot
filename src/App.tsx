// ============================================================================
// DevPilot — App Entry & Routing (Multi-User & Secure Auth Enabled)
// ============================================================================
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';

// Pages
import DashboardPage from './pages/DashboardPage';
import TimetablePage from './pages/TimetablePage';
import WeeklyPlannerPage from './pages/WeeklyPlannerPage';
import LearningRoadmapPage from './pages/LearningRoadmapPage';
import PythonPage from './pages/PythonPage';
import CppDsaPage from './pages/CppDsaPage';
import WebDevPage from './pages/WebDevPage';
import SystemDesignPage from './pages/SystemDesignPage';
import AiMlPage from './pages/AiMlPage';
import AcademicsPage from './pages/AcademicsPage';
import ProjectsPage from './pages/ProjectsPage';
import PortfolioPage from './pages/PortfolioPage';
import GoalsPage from './pages/GoalsPage';
import WeeklyReviewPage from './pages/WeeklyReviewPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Data Initialization & Services
import { initTopicsIfEmpty, initTimetableForDate } from './hooks/useDatabase';
import { DEFAULT_TIMETABLE } from './data/roadmapData';
import { todayStr } from './utils/helpers';
import { useTheme } from './store/useStore';
import { registerServiceWorker } from './services/notifications';

export default function App() {
  useTheme(); // Synchronize dark/light theme class on documentElement

  useEffect(() => {
    // Seed initial roadmaps and today's schedule into IndexedDB if first run
    initTopicsIfEmpty();
    initTimetableForDate(todayStr(), DEFAULT_TIMETABLE);
    registerServiceWorker();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="timetable" element={<TimetablePage />} />
            <Route path="weekly-planner" element={<WeeklyPlannerPage />} />
            <Route path="roadmap" element={<LearningRoadmapPage />} />
            <Route path="python" element={<PythonPage />} />
            <Route path="cpp-dsa" element={<CppDsaPage />} />
            <Route path="webdev" element={<WebDevPage />} />
            <Route path="system-design" element={<SystemDesignPage />} />
            <Route path="ai-ml" element={<AiMlPage />} />
            <Route path="academics" element={<AcademicsPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="weekly-review" element={<WeeklyReviewPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="admin" element={<AdminDashboardPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
