// ============================================================================
// DevPilot — Settings Page
// ============================================================================
import { useState, useRef } from 'react';
import {
  Settings, Sun, Moon, Shield, Download, Upload, Trash2, User,
  Clock, CheckCircle2, AlertTriangle, Sparkles, Database, Eye, EyeOff
} from 'lucide-react';
import {
  Card, PageHeader, Badge, Button, Input, Select, Textarea, Modal
} from '../components/ui';
import { useSettings, useProfile, useTheme } from '../store/useStore';
import { exportAllData, importAllData, clearAllData } from '../hooks/useDatabase';
import { exportData, todayStr } from '../utils/helpers';

export default function SettingsPage() {
  const { settings, setSettings } = useSettings();
  const { profile, setProfile } = useProfile();
  const { theme, toggleTheme } = useTheme();

  // Clear modal
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        } catch (parseErr) {
          setImportMessage('Error: Invalid JSON backup file.');
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setImportMessage('Failed to read file.');
    }
  };

  const handleClearAll = async () => {
    if (clearConfirmText !== 'DELETE') return;
    await clearAllData();
    window.location.reload();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="Settings & System Preferences"
        subtitle="Manage your profile, theme, study routine, and full local backup/restore."
      />

      {/* Theme & Display */}
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

      {/* Developer Profile Information */}
      <Card className="p-5 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <User size={18} className="text-blue-500" />
          Developer Profile & Career Goal
        </h3>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Your Name"
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
            />
            <Input
              label="College / Institution"
              placeholder="e.g. State Engineering College"
              value={profile.college || ''}
              onChange={e => setProfile(p => ({ ...p, college: e.target.value }))}
            />
          </div>

          <Input
            label="Primary Career Objective"
            value={profile.careerGoal}
            onChange={e => setProfile(p => ({ ...p, careerGoal: e.target.value }))}
          />

          <Textarea
            label="Bio (Visible on Public Portfolio)"
            placeholder="Introduce yourself and your programming journey..."
            value={profile.bio}
            onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="GitHub URL"
              placeholder="https://github.com/..."
              value={profile.github || ''}
              onChange={e => setProfile(p => ({ ...p, github: e.target.value }))}
            />
            <Input
              label="LinkedIn URL"
              placeholder="https://linkedin.com/in/..."
              value={profile.linkedin || ''}
              onChange={e => setProfile(p => ({ ...p, linkedin: e.target.value }))}
            />
            <Input
              label="Contact Email"
              placeholder="name@email.com"
              value={profile.email || ''}
              onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Public Portfolio Page Visibility</p>
              <p className="text-slate-500">Enable or disable your portfolio page presentation.</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setProfile(p => ({ ...p, portfolioVisible: !p.portfolioVisible }))}
            >
              {profile.portfolioVisible ? <><Eye size={14} /> Visible</> : <><EyeOff size={14} /> Hidden</>}
            </Button>
          </div>
        </div>
      </Card>

      {/* Routine & Timetable Invariants */}
      <Card className="p-5 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Clock size={18} className="text-amber-500" />
          Routine Invariants & Timetable Rules
        </h3>

        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 flex items-start gap-3">
            <Shield className="text-red-400 shrink-0 mt-0.5" size={18} />
            <div className="space-y-1">
              <span className="font-bold text-red-300">Strict Rule: 5:00 PM – 7:00 PM Unavailable Block</span>
              <p className="text-slate-300 leading-relaxed">
                As per your profile instructions, the 5:00 PM to 7:00 PM window is permanently enforced as strictly unavailable. No study tasks or coding sessions will ever be automatically assigned into this window.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Daily Target Study Hours"
              type="number"
              value={String(settings.studyPreferences?.dailyStudyGoalHours || 5)}
              onChange={e => setSettings(s => ({
                ...s,
                studyPreferences: {
                  ...s.studyPreferences,
                  dailyStudyGoalHours: Number(e.target.value) || 5
                }
              }))}
            />

            <Select
              label="Primary Coding Language Focus"
              value={settings.studyPreferences?.preferredLanguage || 'python'}
              onChange={e => setSettings(s => ({
                ...s,
                studyPreferences: {
                  ...s.studyPreferences,
                  preferredLanguage: e.target.value
                }
              }))}
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

      {/* Data Management, Backup & Restore */}
      <Card className="p-5 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Database size={18} className="text-emerald-500" />
          Data Persistence, Backup & Export
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed">
          Your DevPilot command center stores all roadmap progress, timetable logs, DSA problems, and academic data in local IndexedDB. You can export complete backups anytime or restore on another browser or machine.
        </p>

        {importMessage && (
          <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-lg text-xs text-blue-300">
            {importMessage}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button size="sm" onClick={handleExportBackup} className="text-xs">
            <Download size={14} />
            {backupSuccess ? 'Backup Downloaded!' : 'Export Complete Backup (JSON)'}
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
            <Trash2 size={14} /> Reset / Clear All Data
          </Button>
        </div>
      </Card>

      {/* Clear Confirmation Modal */}
      <Modal
        open={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Confirm Reset All DevPilot Data"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-red-950/30 border border-red-500/40 rounded-lg text-red-200 space-y-1">
            <span className="font-bold block">Danger Zone Action:</span>
            <p>
              This will permanently delete all completed topics, solved DSA problems, college subjects, and timetable logs.
            </p>
          </div>

          <p className="text-slate-600 dark:text-slate-300">
            To proceed, type <strong>DELETE</strong> in all caps below:
          </p>

          <Input
            value={clearConfirmText}
            onChange={e => setClearConfirmText(e.target.value)}
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
    </div>
  );
}
