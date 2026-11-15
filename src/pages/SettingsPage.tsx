// ============================================================================
// DevPilot — Settings & User Account Management Page
// ============================================================================
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings, Sun, Moon, Shield, Download, Upload, Trash2, User,
  Clock, CheckCircle2, AlertTriangle, Sparkles, Database, Eye, EyeOff,
  LogOut, Phone, Mail, ShieldCheck, KeyRound, Globe, Bell, Smartphone,
  Check, Lock, AlertCircle, RefreshCw
} from 'lucide-react';
import {
  Card, PageHeader, Badge, Button, Input, Select, Textarea, Modal
} from '../components/ui';
import { useSettings, useProfile, useTheme } from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, deleteUserAccount } from '../services/auth';
import { exportAllData, importAllData, clearAllData } from '../hooks/useDatabase';
import { exportData, todayStr } from '../utils/helpers';

export default function SettingsPage() {
  const { settings, setSettings } = useSettings();
  const { profile: localProfile, setProfile: setLocalProfile } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const {
    user,
    profile: cloudProfile,
    setAuthModalOpen,
    logout,
    refreshProfile,
    isConfigured
  } = useAuth();

  // Active profile values (cloud profile if logged in, local fallback otherwise)
  const activeProfile = cloudProfile || localProfile;

  // Clear modal
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [deleteAccountConfirmText, setDeleteAccountConfirmText] = useState('');
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Profile form state
  const [displayName, setDisplayName] = useState(activeProfile.name);
  const [careerGoal, setCareerGoal] = useState(activeProfile.careerGoal);
  const [bio, setBio] = useState(activeProfile.bio);
  const [college, setCollege] = useState(activeProfile.college || '');
  const [github, setGithub] = useState(activeProfile.github || '');
  const [linkedin, setLinkedin] = useState(activeProfile.linkedin || '');
  const [timezone, setTimezone] = useState(
    activeProfile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  useEffect(() => {
    if (activeProfile) {
      setDisplayName(activeProfile.name);
      setCareerGoal(activeProfile.careerGoal);
      setBio(activeProfile.bio);
      setCollege(activeProfile.college || '');
      setGithub(activeProfile.github || '');
      setLinkedin(activeProfile.linkedin || '');
      if (activeProfile.timezone) setTimezone(activeProfile.timezone);
    }
  }, [activeProfile]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccessMsg(null);

    const updates = {
      name: displayName,
      careerGoal,
      bio,
      college,
      github,
      linkedin,
      timezone,
    };

    // Save to local store
    setLocalProfile((p) => ({ ...p, ...updates }));

    // Save to Supabase if authenticated
    if (user) {
      await updateUserProfile(user.id, updates);
      await refreshProfile();
    }

    setIsSavingProfile(false);
    setProfileSuccessMsg('Profile updated successfully!');
    setTimeout(() => setProfileSuccessMsg(null), 3000);
  };

  const handleExportBackup = async () => {
    try {
      const data = await exportAllData();
      exportData(data, `DevPilot_Backup_${todayStr()}.json`);
      setBackupSuccess(true);
      setTimeout(() => setBackupSuccess(false), 3000);
    } catch (err) {
      alert('Failed to export backup: ' + err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const json = JSON.parse(evt.target?.result as string);
          await importAllData(json);
          setImportMessage('Data restored successfully! Refreshing...');
          setTimeout(() => window.location.reload(), 1500);
        } catch {
          setImportMessage('Error: Invalid JSON backup file.');
        }
      };
      reader.readAsText(file);
    } catch {
      setImportMessage('Failed to read file.');
    }
  };

  const handleClearAll = async () => {
    if (clearConfirmText !== 'DELETE') return;
    await clearAllData();
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    if (deleteAccountConfirmText !== 'PERMANENTLY DELETE' || !user) return;
    await deleteUserAccount(user.id);
    await clearAllData();
    window.location.reload();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="Settings & Account Management"
        subtitle="Manage your authentication credentials, cloud profile, theme, and full data export."
      />

      {/* ── 1. User Account & Authentication Status ── */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {user ? user.displayName : 'Guest Account'}
                </h3>
                <Badge variant={user ? 'success' : 'default'}>
                  {user ? 'Authenticated User' : 'Local Guest Mode'}
                </Badge>
                {user?.role === 'admin' && (
                  <Badge variant="purple" className="font-bold">
                    OWNER / ADMIN
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {user?.email || (user?.phone ? `Phone: ${user.phone}` : 'Stored locally in browser')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <Button variant="secondary" size="sm" onClick={logout} className="text-xs text-red-500 hover:text-red-600">
                <LogOut size={14} /> Log Out
              </Button>
            ) : (
              <Button size="sm" onClick={() => setAuthModalOpen(true)} className="text-xs">
                <ShieldCheck size={14} /> Sign In / Register
              </Button>
            )}
          </div>
        </div>

        {/* Verification Status Badges Row */}
        {user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            {/* Google Status */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-blue-500 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Google OAuth Account</p>
                  <p className="text-[11px] text-slate-400">{user.email || 'No Google account linked'}</p>
                </div>
              </div>
              {user.isGoogleVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-semibold">
                  <CheckCircle2 size={13} /> Verified
                </span>
              ) : (
                <Button size="xs" variant="secondary" onClick={() => setAuthModalOpen(true)}>
                  Link
                </Button>
              )}
            </div>

            {/* Phone Status */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-emerald-500 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Mobile Phone Number</p>
                  <p className="text-[11px] text-slate-400">{user.phone || 'No phone number verified'}</p>
                </div>
              </div>
              {user.isPhoneVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-semibold">
                  <CheckCircle2 size={13} /> Verified
                </span>
              ) : (
                <Button size="xs" variant="secondary" onClick={() => setAuthModalOpen(true)}>
                  Verify OTP
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* ── 2. Theme & Display ── */}
      <Card className="p-5 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          {theme === 'dark' ? <Moon size={18} className="text-violet-400" /> : <Sun size={18} className="text-amber-500" />}
          Appearance & Theme
        </h3>
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Active Theme Mode</p>
            <p className="text-xs text-slate-500">Currently in {theme === 'dark' ? 'Dark Mode (Navy/Charcoal)' : 'Light Mode'}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={toggleTheme}>
            {theme === 'dark' ? <><Sun size={15} /> Switch to Light Mode</> : <><Moon size={15} /> Switch to Dark Mode</>}
          </Button>
        </div>
      </Card>

      {/* ── 3. Developer Profile Information ── */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <User size={18} className="text-blue-500" />
            Developer Profile & Timezone
          </h3>
          {profileSuccessMsg && (
            <span className="text-xs text-emerald-500 flex items-center gap-1">
              <CheckCircle2 size={13} /> {profileSuccessMsg}
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Your Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <Input
              label="College / Institution"
              placeholder="e.g. State Engineering College"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Career Objective"
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
            />

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Local Timezone
              </label>
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g. Asia/Kolkata"
              />
            </div>
          </div>

          <Textarea
            label="Bio (Visible on Public Portfolio)"
            placeholder="Introduce yourself and your programming journey..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="GitHub URL"
              placeholder="https://github.com/..."
              value={github}
              onChange={(e) => setGithub(e.target.value)}
            />
            <Input
              label="LinkedIn URL"
              placeholder="https://linkedin.com/in/..."
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Public Portfolio Visibility</p>
              <p className="text-slate-500">Enable or disable your portfolio page presentation.</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setLocalProfile((p) => ({ ...p, portfolioVisible: !p.portfolioVisible }))}
            >
              {localProfile.portfolioVisible ? <><Eye size={14} /> Visible</> : <><EyeOff size={14} /> Hidden</>}
            </Button>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" disabled={isSavingProfile}>
              {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      </Card>

      {/* ── 4. Notifications & Reminders Shortcut ── */}
      <Card className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
            <Bell size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Notification & Alert Preferences
            </h4>
            <p className="text-xs text-slate-500">
              Configure activity reminder times, quiet hours, and inspection history.
            </p>
          </div>
        </div>

        <Link to="/notifications">
          <Button variant="secondary" size="sm" className="text-xs">
            Open Reminders Center
          </Button>
        </Link>
      </Card>

      {/* ── 5. Routine & Timetable Invariants ── */}
      <Card className="p-5 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Clock size={18} className="text-amber-500" />
          Routine Invariants & Timetable Rules
        </h3>

        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 flex items-start gap-3">
            <Shield className="text-blue-400 shrink-0 mt-0.5" size={18} />
            <div className="space-y-1">
              <span className="font-bold text-blue-300">Customizable Schedule & Study Routine</span>
              <p className="text-slate-300 leading-relaxed">
                Your daily schedule automatically locks expired study slots, adapts morning hours from 6 AM to 2 PM on holidays, and lets you customize your breaks and focused study sessions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Daily Target Study Hours"
              type="number"
              value={String(settings.studyPreferences?.dailyStudyGoalHours || 5)}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  studyPreferences: {
                    ...s.studyPreferences,
                    dailyStudyGoalHours: Number(e.target.value) || 5,
                  },
                }))
              }
            />

            <Select
              label="Primary Coding Language Focus"
              value={settings.studyPreferences?.preferredLanguage || 'python'}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  studyPreferences: {
                    ...s.studyPreferences,
                    preferredLanguage: e.target.value,
                  },
                }))
              }
              options={[
                { value: 'python', label: 'Python (Primary Focus)' },
                { value: 'cpp', label: 'C++ (DSA Focus)' },
                { value: 'c', label: 'C (College Academics)' },
                { value: 'typescript', label: 'TypeScript (Web Dev)' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* ── 6. Data Persistence, Backup & Export ── */}
      <Card className="p-5 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Database size={18} className="text-emerald-500" />
          Data Persistence, Export & Account Deletion
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed">
          Your DevPilot command center synchronizes with your secure cloud database and caches in local IndexedDB. You can export complete personal data backups anytime or request account deletion.
        </p>

        {importMessage && (
          <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-lg text-xs text-blue-300">
            {importMessage}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button size="sm" onClick={handleExportBackup} className="text-xs">
            <Download size={14} />
            {backupSuccess ? 'Data Exported!' : 'Export All Personal Data (JSON)'}
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs"
          >
            <Upload size={14} /> Restore from Backup
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setClearModalOpen(true)}
            className="text-xs ml-auto"
          >
            <Trash2 size={14} /> Reset Local Data
          </Button>
        </div>

        {user && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-500">Permanent Account Deletion</p>
              <p className="text-[11px] text-slate-400">
                Permanently delete your cloud account, profile, timetable, and study records.
              </p>
            </div>
            <Button
              variant="danger"
              size="xs"
              onClick={() => setDeleteAccountModalOpen(true)}
            >
              Delete Cloud Account
            </Button>
          </div>
        )}
      </Card>

      {/* Reset Local Data Modal */}
      <Modal
        open={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Confirm Reset Local DevPilot Data"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-red-950/30 border border-red-500/40 rounded-lg text-red-200 space-y-1">
            <span className="font-bold block">Danger Zone Action:</span>
            <p>
              This will permanently clear local cached topics, solved DSA problems, and timetable records in this browser.
            </p>
          </div>

          <p className="text-slate-600 dark:text-slate-300">
            To proceed, type <strong>DELETE</strong> below:
          </p>

          <Input
            value={clearConfirmText}
            onChange={(e) => setClearConfirmText(e.target.value)}
            placeholder="Type DELETE..."
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setClearModalOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              disabled={clearConfirmText !== 'DELETE'}
              onClick={handleClearAll}
            >
              Permanently Clear Data
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Cloud Account Modal */}
      <Modal
        open={deleteAccountModalOpen}
        onClose={() => setDeleteAccountModalOpen(false)}
        title="Confirm Cloud Account Deletion"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-red-950/30 border border-red-500/40 rounded-lg text-red-200 space-y-1">
            <span className="font-bold block">Irreversible Action:</span>
            <p>
              This will delete your cloud user profile and remove all your timetable entries, tasks, and learning logs from the server.
            </p>
          </div>

          <p className="text-slate-600 dark:text-slate-300">
            To confirm permanent deletion, type <strong>PERMANENTLY DELETE</strong> below:
          </p>

          <Input
            value={deleteAccountConfirmText}
            onChange={(e) => setDeleteAccountConfirmText(e.target.value)}
            placeholder="Type PERMANENTLY DELETE..."
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setDeleteAccountModalOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              disabled={deleteAccountConfirmText !== 'PERMANENTLY DELETE'}
              onClick={handleDeleteAccount}
            >
              Delete Account Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
