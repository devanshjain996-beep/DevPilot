// ============================================================================
// DevPilot — Sidebar Navigation with Multi-User & Admin Access
// ============================================================================
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, CalendarDays, Map, Code2, Binary, Globe, Server,
  Brain, GraduationCap, FolderKanban, Briefcase, Target, CalendarCheck,
  Settings, X, Sun, Moon, Rocket, Bell, ShieldCheck, LogIn, LogOut
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import { useTheme } from '../../store/useStore';
import { useAuth } from '../../context/AuthContext';

const BASE_NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/timetable', label: 'My Timetable', icon: Calendar },
  { path: '/weekly-planner', label: 'Weekly Planner', icon: CalendarDays },
  { path: '/roadmap', label: 'Learning Roadmap', icon: Map },
  { path: '/python', label: 'Python Mastery', icon: Code2 },
  { path: '/cpp-dsa', label: 'C++ and DSA', icon: Binary },
  { path: '/webdev', label: 'Web Development', icon: Globe },
  { path: '/system-design', label: 'System Design', icon: Server },
  { path: '/ai-ml', label: 'AI/ML Development', icon: Brain },
  { path: '/academics', label: 'College Academics', icon: GraduationCap },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/portfolio', label: 'My Portfolio', icon: Briefcase },
  { path: '/goals', label: 'Goals and Analytics', icon: Target },
  { path: '/weekly-review', label: 'Weekly Review', icon: CalendarCheck },
  { path: '/notifications', label: 'Reminders & Alerts', icon: Bell },
  { path: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, setAuthModalOpen, logout } = useAuth();

  const isAdmin = user?.role === 'admin' || profile?.role === 'admin';

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full w-[260px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300',
        'lg:translate-x-0 lg:static lg:z-auto',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Rocket size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">DevPilot</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">Your Goals. Your Code.</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {/* Admin Dashboard Pill (Only for authorized owner / admin) */}
          {isAdmin && (
            <div className="mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all border',
                  isActive
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-xs'
                    : 'text-purple-600 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/10'
                )}
              >
                <ShieldCheck size={18} className="text-purple-500" />
                <span>Admin Dashboard</span>
              </NavLink>
            </div>
          )}

          {BASE_NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Card & Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0 space-y-2">
          {user ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {user.displayName}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {user.email || user.phone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Log out"
                className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer transition-all shadow-xs"
            >
              <LogIn size={14} />
              <span>Sign In / Register</span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
