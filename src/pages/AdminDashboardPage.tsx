// ============================================================================
// DevPilot — Website Owner / Admin Dashboard (Secure Operational Monitoring)
// ============================================================================
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Activity,
  CheckCircle2,
  Clock,
  Calendar,
  Lock,
  Search,
  RefreshCw,
  Phone,
  Mail,
  ShieldCheck,
  Filter,
  BarChart3,
  ListFilter,
  TrendingUp,
  AlertCircle,
  Eye,
  Laptop,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { subscribeToOnlineUsers } from '../services/presence';
import { Card, PageHeader, Badge, Button, Input, EmptyState } from '../components/ui';
import { formatDate, cn } from '../utils/helpers';
import type { UserPresence, OnlineStatus } from '../types';

interface RegisteredUserRow {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  phoneVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt: string;
}

export default function AdminDashboardPage() {
  const { user, profile, isConfigured } = useAuth();
  const navigate = useNavigate();

  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserRow[]>([]);
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    googleVerified: 0,
    phoneVerified: 0,
    totalTasks: 0,
    totalTimetableSlots: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'away' | 'offline'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Authorization check: Only user with role === 'admin' can view
  const isAdmin = user?.role === 'admin' || profile?.role === 'admin';

  // 1. Subscribe to online presence
  useEffect(() => {
    if (!isAdmin) return;
    const unsubscribe = subscribeToOnlineUsers((presences) => {
      setOnlineUsers(presences);
    });
    return unsubscribe;
  }, [isAdmin]);

  // 2. Fetch registered user list & platform stats
  const fetchAdminData = async () => {
    setIsLoading(true);

    if (!isSupabaseConfigured()) {
      // Mock data for preview when Supabase credentials are not yet deployed
      const mockList: RegisteredUserRow[] = [
        {
          id: user?.id || 'dev-owner-001',
          name: user?.displayName || 'Devansh Jain (You)',
          email: user?.email || 'devanshjain996@gmail.com',
          phone: user?.phone || '+91 9876543210',
          role: 'admin',
          emailVerified: true,
          phoneVerified: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        },
        {
          id: 'user-002',
          name: 'Priya Sharma',
          email: 'priya.sharma@example.com',
          role: 'user',
          emailVerified: true,
          phoneVerified: false,
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          lastLoginAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: 'user-003',
          name: 'Rahul Verma',
          phone: '+91 9123456780',
          role: 'user',
          emailVerified: false,
          phoneVerified: true,
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];

      setRegisteredUsers(mockList);
      setPlatformStats({
        totalUsers: 3,
        googleVerified: 2,
        phoneVerified: 2,
        totalTasks: 42,
        totalTimetableSlots: 78,
      });
      setIsLoading(false);
      return;
    }

    try {
      // Query profiles table
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, name, email, phone, role, email_verified, phone_verified, avatar_url, created_at, last_login_at')
        .order('last_login_at', { ascending: false });

      if (!error && profiles) {
        const formatted: RegisteredUserRow[] = profiles.map((p: any) => ({
          id: p.id,
          name: p.name || 'User',
          email: p.email,
          phone: p.phone,
          role: p.role || 'user',
          emailVerified: Boolean(p.email_verified),
          phoneVerified: Boolean(p.phone_verified),
          avatarUrl: p.avatar_url,
          createdAt: p.created_at || new Date().toISOString(),
          lastLoginAt: p.last_login_at || new Date().toISOString(),
        }));

        setRegisteredUsers(formatted);

        // Aggregate counts without querying private notes
        const gVerified = formatted.filter((u) => u.emailVerified).length;
        const pVerified = formatted.filter((u) => u.phoneVerified).length;

        // Query total counts using head count queries
        const { count: taskCount } = await supabase.from('tasks').select('*', { count: 'exact', head: true });
        const { count: timetableCount } = await supabase.from('timetable').select('*', { count: 'exact', head: true });

        setPlatformStats({
          totalUsers: formatted.length,
          googleVerified: gVerified,
          phoneVerified: pVerified,
          totalTasks: taskCount || 0,
          totalTimetableSlots: timetableCount || 0,
        });
      }
    } catch (err) {
      console.warn('Admin fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  // Merge presence state with registered user list
  const usersWithPresence = useMemo(() => {
    const presenceMap = new Map<string, UserPresence>();
    onlineUsers.forEach((p) => presenceMap.set(p.userId, p));

    return registeredUsers.map((reg) => {
      const pres = presenceMap.get(reg.id);
      let calculatedStatus: OnlineStatus = 'offline';

      if (pres) {
        calculatedStatus = pres.status;
      } else {
        const diffMinutes = (Date.now() - new Date(reg.lastLoginAt).getTime()) / 60000;
        if (diffMinutes < 5) calculatedStatus = 'away';
      }

      return {
        ...reg,
        status: calculatedStatus,
        currentPage: pres?.currentPage,
      };
    });
  }, [registeredUsers, onlineUsers]);

  // Filtered list
  const filteredUsers = useMemo(() => {
    return usersWithPresence.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.phone && u.phone.includes(searchQuery));

      if (!matchesSearch) return false;
      if (statusFilter === 'all') return true;
      return u.status === statusFilter;
    });
  }, [usersWithPresence, searchQuery, statusFilter]);

  // Unauthorized access block
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
          <Lock size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Administrator Access Required
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          This dashboard is strictly reserved for the website owner. You must be signed in with an authorized administrator account to view platform metrics and online user tracking.
        </p>
        <div className="pt-2">
          <Button onClick={() => navigate('/')} size="sm">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const onlineCount = usersWithPresence.filter((u) => u.status === 'online').length;
  const awayCount = usersWithPresence.filter((u) => u.status === 'away').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website Owner · Admin Dashboard"
        subtitle="Live platform metrics, online session presence, and verified user accounts."
        action={
          <Button variant="secondary" size="sm" onClick={fetchAdminData}>
            <RefreshCw size={14} className={cn(isLoading && 'animate-spin')} /> Refresh Data
          </Button>
        }
      />

      {/* ── Privacy Guarantee Notice ── */}
      <div className="p-3.5 bg-slate-900/40 border border-slate-800 rounded-xl text-xs flex items-start gap-3">
        <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-200">Strict Privacy Boundary Active</p>
          <p className="text-slate-400 text-[11px] mt-0.5">
            As the platform administrator, you can view operational connection statuses, verified authentication providers, and aggregated activity counts. Individual users' personal timetables, private study notes, passwords, and OTP tokens are isolated by Row-Level Security and are never exposed here.
          </p>
        </div>
      </div>

      {/* ── Key Metrics Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Registered Users</span>
            <Users size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {platformStats.totalUsers}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Accounts created on DevPilot
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Currently Active / Online</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-2xl font-bold text-emerald-500 mt-1">
            {onlineCount}{' '}
            <span className="text-xs font-normal text-slate-400">({awayCount} away)</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Live heartbeat within last 2 mins
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-violet-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Verified Google Accounts</span>
            <Mail size={16} className="text-violet-500" />
          </div>
          <p className="text-2xl font-bold text-violet-500 mt-1">
            {platformStats.googleVerified}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Authenticated with Gmail OAuth
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Verified Phone Accounts</span>
            <Phone size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-500 mt-1">
            {platformStats.phoneVerified}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Verified via SMS OTP
          </p>
        </Card>
      </div>

      {/* ── User List & Session Presence Table ── */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Connected Accounts & Presence
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time monitoring of registered users, verification badges, and last active sessions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-48">
              <Input
                type="text"
                placeholder="Search user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
              {(['all', 'online', 'away', 'offline'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={cn(
                    'px-2.5 py-1 rounded-md capitalize font-medium transition-all cursor-pointer',
                    statusFilter === filter
                      ? 'bg-white dark:bg-slate-900 text-blue-500 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={<Users size={36} />}
            title="No users match this filter"
            description="Adjust your search query or status filter to see registered accounts."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2.5 px-3 font-semibold">User</th>
                  <th className="py-2.5 px-3 font-semibold">Verification Status</th>
                  <th className="py-2.5 px-3 font-semibold">Presence</th>
                  <th className="py-2.5 px-3 font-semibold">Role</th>
                  <th className="py-2.5 px-3 font-semibold">Registered</th>
                  <th className="py-2.5 px-3 font-semibold">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {u.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {u.email || u.phone || 'No direct identifier'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {u.emailVerified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            <Mail size={10} /> Google Verified
                          </span>
                        )}
                        {u.phoneVerified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <Phone size={10} /> Phone OTP Verified
                          </span>
                        )}
                        {!u.emailVerified && !u.phoneVerified && (
                          <span className="text-slate-400 text-[11px]">Unverified</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full shrink-0',
                            u.status === 'online' && 'bg-emerald-500 animate-pulse',
                            u.status === 'away' && 'bg-amber-500',
                            u.status === 'offline' && 'bg-slate-400'
                          )}
                        />
                        <span
                          className={cn(
                            'font-medium capitalize text-[11px]',
                            u.status === 'online' && 'text-emerald-500 font-semibold',
                            u.status === 'away' && 'text-amber-500',
                            u.status === 'offline' && 'text-slate-400'
                          )}
                        >
                          {u.status}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <Badge variant={u.role === 'admin' ? 'purple' : 'default'} className="text-[10px]">
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {formatDate(u.createdAt.slice(0, 10))}
                    </td>

                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(u.lastLoginAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
