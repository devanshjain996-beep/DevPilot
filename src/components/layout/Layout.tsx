// ============================================================================
// DevPilot — 3D-Only Master Universe Layout (No Classic Sidebar)
// ============================================================================
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Sparkles, Clock, Compass, FolderKanban,
  Briefcase, Target, Bell, LogIn, Settings, ShieldCheck
} from 'lucide-react';
import DevPilotAIAssistant from '../ai/DevPilotAIAssistant';
import SaveStatusIndicator from './SaveStatusIndicator';
import AuthModal from '../auth/AuthModal';
import DataMigrationModal from '../auth/DataMigrationModal';
import NotificationPromptModal from '../notifications/NotificationPromptModal';
import { useAuth } from '../../context/AuthContext';
import { hasAnsweredNotificationPrompt } from '../../services/notifications';

function getPortalBadge(pathname: string): { label: string; color: string } {
  if (pathname.startsWith('/timetable') || pathname.startsWith('/weekly-planner')) {
    return { label: 'TIMETABLE PORTAL', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40' };
  }
  if (pathname.startsWith('/roadmap')) {
    return { label: 'ROADMAP MATRIX', color: 'text-violet-400 border-violet-500/30 bg-violet-950/40' };
  }
  if (pathname.startsWith('/python')) {
    return { label: 'PYTHON MASTERY', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40' };
  }
  if (pathname.startsWith('/cpp-dsa')) {
    return { label: 'C++ & DSA PORTAL', color: 'text-purple-400 border-purple-500/30 bg-purple-950/40' };
  }
  if (pathname.startsWith('/system-design')) {
    return { label: 'SYSTEM DESIGN PORTAL', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40' };
  }
  if (pathname.startsWith('/webdev')) {
    return { label: 'WEB DEV PORTAL', color: 'text-sky-400 border-sky-500/30 bg-sky-950/40' };
  }
  if (pathname.startsWith('/ai-ml')) {
    return { label: 'AI/ML PORTAL', color: 'text-rose-400 border-rose-500/30 bg-rose-950/40' };
  }
  if (pathname.startsWith('/academics')) {
    return { label: 'ACADEMICS PORTAL', color: 'text-amber-400 border-amber-500/30 bg-amber-950/40' };
  }
  if (pathname.startsWith('/projects')) {
    return { label: 'PROJECTS CHAMBER', color: 'text-orange-400 border-orange-500/30 bg-orange-950/40' };
  }
  if (pathname.startsWith('/portfolio')) {
    return { label: 'PORTFOLIO VAULT', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-950/40' };
  }
  if (pathname.startsWith('/goals') || pathname.startsWith('/weekly-review')) {
    return { label: 'GOALS & ANALYTICS', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40' };
  }
  if (pathname.startsWith('/copilot')) {
    return { label: 'AI COPILOT', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40' };
  }
  if (pathname.startsWith('/settings')) {
    return { label: 'SYSTEM SETTINGS', color: 'text-slate-400 border-slate-700 bg-slate-900/60' };
  }
  if (pathname.startsWith('/notifications')) {
    return { label: 'COMMUNICATIONS', color: 'text-blue-400 border-blue-500/30 bg-blue-950/40' };
  }
  if (pathname.startsWith('/admin')) {
    return { label: 'ADMINISTRATOR HUB', color: 'text-red-400 border-red-500/30 bg-red-950/40' };
  }
  return { label: 'DEVPILOT UNIVERSE', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40' };
}

export default function Layout() {
  const [notificationPromptOpen, setNotificationPromptOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  const {
    user,
    authModalOpen,
    setAuthModalOpen,
    migrationModalOpen,
    setMigrationModalOpen,
  } = useAuth();

  // Polite first-visit notification prompt check after 3 seconds
  useEffect(() => {
    if (!hasAnsweredNotificationPrompt()) {
      const timer = setTimeout(() => {
        setNotificationPromptOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const portalInfo = getPortalBadge(location.pathname);

  // If on the root 3D Dashboard, render full-bleed viewport without outer framing
  if (isDashboard) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#070b14] text-slate-100 flex flex-col relative select-none">
        <main className="flex-1 overflow-hidden relative">
          <Outlet />
        </main>

        {/* Floating AI Assistant with 3D Neural Core */}
        <DevPilotAIAssistant />

        {/* Modals */}
        <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        <DataMigrationModal
          open={migrationModalOpen}
          onClose={() => setMigrationModalOpen(false)}
        />
        <NotificationPromptModal
          open={notificationPromptOpen}
          onClose={() => setNotificationPromptOpen(false)}
        />
      </div>
    );
  }

  // Destination pages: Minimal futuristic floating top bar + seamless cosmic theme (NO SIDEBAR)
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* ── MINIMAL FLOATING DESTINATION HUD BAR ── */}
      <header className="sticky top-0 z-30 h-14 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Back to 3D Universe + Portal Identity */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            title="Return to 3D Universe Hub"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/50 hover:bg-cyan-500/20 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white transition-all text-xs font-bold tracking-wide shadow-sm shadow-cyan-500/20 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform text-cyan-400" />
            <span>3D Universe</span>
          </Link>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          {/* Active Portal Label */}
          <div className="flex items-center gap-2">
            <span className={`font-mono text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md border ${portalInfo.color}`}>
              {portalInfo.label}
            </span>
          </div>
        </div>

        {/* Center: Quick Five-Portal Jump Icons (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800 text-xs">
          <Link
            to="/timetable"
            title="Door 01 — Timetable"
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              location.pathname.startsWith('/timetable')
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock size={13} className="text-cyan-400" />
            <span>Timetable</span>
          </Link>

          <Link
            to="/roadmap"
            title="Door 02 — Learning Roadmaps"
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              location.pathname.startsWith('/roadmap') ||
              ['/python', '/cpp-dsa', '/webdev', '/system-design', '/ai-ml', '/academics'].includes(location.pathname)
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass size={13} className="text-violet-400" />
            <span>Roadmaps</span>
          </Link>

          <Link
            to="/projects"
            title="Door 03 — Projects"
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              location.pathname.startsWith('/projects')
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FolderKanban size={13} className="text-orange-400" />
            <span>Projects</span>
          </Link>

          <Link
            to="/portfolio"
            title="Door 04 — Portfolio"
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              location.pathname.startsWith('/portfolio')
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Briefcase size={13} className="text-yellow-400" />
            <span>Portfolio</span>
          </Link>

          <Link
            to="/goals"
            title="Door 05 — Goals & Analytics"
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              location.pathname.startsWith('/goals')
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Target size={13} className="text-emerald-400" />
            <span>Goals</span>
          </Link>
        </nav>

        {/* Right: Telemetry, Notifications, and Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <SaveStatusIndicator />
          </div>

          <Link
            to="/notifications"
            title="Notifications & Reminders"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Bell size={18} />
          </Link>

          {user ? (
            <Link
              to="/settings"
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800 transition-colors group"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden lg:inline text-xs font-semibold text-slate-300 group-hover:text-cyan-400 max-w-[110px] truncate">
                {user.displayName}
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* ── DESTINATION PAGE MAIN BODY ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {/* Persistent Floating AI Copilot with 3D Neural Core */}
      <DevPilotAIAssistant />

      {/* Authentication and Setup Modals */}
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <DataMigrationModal
        open={migrationModalOpen}
        onClose={() => setMigrationModalOpen(false)}
      />
      <NotificationPromptModal
        open={notificationPromptOpen}
        onClose={() => setNotificationPromptOpen(false)}
      />
    </div>
  );
}
