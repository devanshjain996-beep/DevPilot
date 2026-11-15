// ============================================================================
// DevPilot — Main Layout with Header, Save Status & Modals
// ============================================================================
import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, User, ShieldCheck, Bell, LogIn, LogOut } from 'lucide-react';
import DevPilotAIAssistant from '../ai/DevPilotAIAssistant';
import SaveStatusIndicator from './SaveStatusIndicator';
import AuthModal from '../auth/AuthModal';
import DataMigrationModal from '../auth/DataMigrationModal';
import NotificationPromptModal from '../notifications/NotificationPromptModal';
import { useAuth } from '../../context/AuthContext';
import { hasAnsweredNotificationPrompt } from '../../services/notifications';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationPromptOpen, setNotificationPromptOpen] = useState(false);

  const {
    user,
    authModalOpen,
    setAuthModalOpen,
    migrationModalOpen,
    setMigrationModalOpen,
    logout,
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

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Header Bar */}
        <header className="flex items-center justify-between px-4 sm:px-6 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <Menu size={20} />
            </button>
            <span className="lg:hidden text-lg font-bold text-slate-900 dark:text-white">DevPilot</span>
            <div className="hidden lg:block">
              <SaveStatusIndicator />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <SaveStatusIndicator />
            </div>

            <Link
              to="/notifications"
              title="Notifications & Reminders"
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 relative transition-colors"
            >
              <Bell size={18} />
            </Link>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <Link
                  to="/settings"
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-500 max-w-[120px] truncate">
                    {user.displayName}
                  </span>
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Persistent AI Learning Assistant Pill & Drawer */}
      <DevPilotAIAssistant />

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Data Migration Modal */}
      <DataMigrationModal
        open={migrationModalOpen}
        onClose={() => setMigrationModalOpen(false)}
      />

      {/* Notification Opt-in Prompt Modal */}
      <NotificationPromptModal
        open={notificationPromptOpen}
        onClose={() => setNotificationPromptOpen(false)}
      />
    </div>
  );
}
