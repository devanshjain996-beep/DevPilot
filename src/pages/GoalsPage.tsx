// ============================================================================
// DevPilot — Goals & Analytics Page
// ============================================================================
import { useState } from 'react';
import {
  Target, Plus, CheckCircle2, TrendingUp, Calendar, Clock, Flame,
  Award, Trash2, Edit2, AlertCircle, BarChart3, Sparkles
} from 'lucide-react';
import {
  Card, PageHeader, ProgressBar, Badge, Button, Modal, Input, Select,
  Textarea, StatCard, EmptyState, Checkbox
} from '../components/ui';
import {
  useGoals, addGoal, updateGoal, deleteGoal,
  useAllTopics, useDSAProblems, useProjects, useStudyLogs
} from '../hooks/useDatabase';
import { formatDate, todayStr, cn, percentage } from '../utils/helpers';
import type { Goal, GoalPeriod } from '../types';

export default function GoalsPage() {
  const goals = useGoals();
  const topics = useAllTopics();
  const dsaProblems = useDSAProblems();
  const projects = useProjects();
  const studyLogs = useStudyLogs();

  const [periodFilter, setPeriodFilter] = useState<'all' | GoalPeriod>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [period, setPeriod] = useState<GoalPeriod>('monthly');
  const [targetDate, setTargetDate] = useState('');
  const [progress, setProgress] = useState('0');

  // Stats
  const completedGoals = goals.filter(g => g.completed).length;
  const totalGoals = goals.length;
  const overallGoalPct = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Real milestones from DB
  const completedTopics = topics.filter(t => t.status === 'completed').length;
  const solvedDSA = dsaProblems.filter(p => p.solved).length;
  const finishedProjects = projects.filter(p => p.status === 'completed').length;

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setTitle('');
    setDescription('');
    setPeriod('monthly');
    setTargetDate('');
    setProgress('0');
    setModalOpen(true);
  };

  const handleOpenEdit = (g: Goal) => {
    setEditingGoal(g);
    setTitle(g.title);
    setDescription(g.description || '');
    setPeriod(g.period);
    setTargetDate(g.targetDate);
    setProgress(String(g.progress));
    setModalOpen(true);
  };

  const handleSaveGoal = async () => {
    if (!title.trim()) return;

    const progNum = Number(progress) || 0;
    const isDone = progNum >= 100;

    if (editingGoal) {
      await updateGoal(editingGoal.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        period,
        targetDate: targetDate || todayStr(),
        progress: progNum,
        completed: isDone,
        completedAt: isDone ? todayStr() : undefined,
      });
    } else {
      await addGoal({
        title: title.trim(),
        description: description.trim() || undefined,
        period,
        targetDate: targetDate || todayStr(),
        progress: progNum,
        completed: isDone,
        completedAt: isDone ? todayStr() : undefined,
      });
    }
    setModalOpen(false);
  };

  const handleSeedSuggestedGoals = async () => {
    const starterGoals: Omit<Goal, 'id' | 'createdAt'>[] = [
      { title: 'Complete Python Fundamentals (1-14)', description: 'Master syntax, loops, lists, dicts, functions and problem solving', period: 'monthly', targetDate: '2026-11-30', progress: 40, completed: false },
      { title: 'Solve 50 C++ & LeetCode DSA Problems', description: 'Focus on Arrays, Strings, Two Pointers and Binary Search', period: 'quarterly', targetDate: '2026-12-31', progress: 15, completed: false },
      { title: 'Finish HTML, CSS & JavaScript Fundamentals', description: 'Build responsive layouts with Flexbox and Grid', period: 'monthly', targetDate: '2026-11-25', progress: 65, completed: false },
      { title: 'Build First Full-Stack Application with REST APIs', description: 'Connect React frontend with FastAPI backend and PostgreSQL', period: 'quarterly', targetDate: '2027-01-15', progress: 10, completed: false },
      { title: 'Build First AI-Powered Application', description: 'Implement RAG with LLM API, embeddings and vector database', period: 'yearly', targetDate: '2027-03-31', progress: 5, completed: false },
    ];

    for (const g of starterGoals) {
      await addGoal(g);
    }
  };

  const filteredGoals = goals.filter(g => {
    if (periodFilter === 'all') return true;
    return g.period === periodFilter;
  });

  return (
    <div className="space-y-6">
      {/* ── 3D GOALS & ANALYTICS CYBER PORTAL BANNER ── */}
      <div className="relative rounded-3xl p-5 sm:p-7 border border-emerald-500/40 bg-gradient-to-r from-[#071c14] via-[#091524] to-[#070b16] shadow-2xl shadow-emerald-950/40 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-emerald-950/80 text-emerald-300 border border-emerald-400/50 shadow-sm shadow-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                DOOR 05 // GOALS & ANALYTICS RADAR
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-slate-300 border border-slate-700">
                <Target size={11} className="text-emerald-400" /> OUTCOME TELEMETRY
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Goals & Productivity Analytics
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-2xl leading-relaxed">
              Define milestone targets, audit engineering velocity, and celebrate real curriculum completions.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {goals.length === 0 && (
              <button
                type="button"
                onClick={handleSeedSuggestedGoals}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                Load Recommended Goals
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Plus size={16} /> New Goal
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Goal Completion" value={`${overallGoalPct}%`} icon={<Target size={20} />} color="blue" sub={`${completedGoals} of ${totalGoals} goals met`} />
        <StatCard label="Curriculum Topics" value={completedTopics} icon={<CheckCircle2 size={20} />} color="emerald" sub="Real topics mastered" />
        <StatCard label="DSA Problems Solved" value={solvedDSA} icon={<Flame size={20} />} color="amber" sub="LeetCode / GFG / CF" />
        <StatCard label="Finished Projects" value={finishedProjects} icon={<Award size={20} />} color="violet" sub="Full-stack & AI apps" />
      </div>

      {/* Productivity Insight Banner */}
      <Card className="bg-gradient-to-r from-emerald-950/30 via-slate-900 to-[#070b14] border-emerald-500/30 p-5 shadow-lg shadow-emerald-500/5">
        <div className="flex items-center gap-2 mb-1.5 text-emerald-400 font-bold text-sm">
          <Sparkles size={18} />
          True Engineering Metric: Outcomes Over Passive Hours
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          DevPilot measures your career momentum through verified curriculum completions, algorithms solved, and deployed applications rather than passive screen time alone. Keep shipping!
        </p>
      </Card>

      {/* Period Filter Tabs */}
      <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-2xl border border-slate-800/80">
        <div className="flex gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: `All Goals (${goals.length})` },
            { id: 'daily', label: 'Daily' },
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'quarterly', label: 'Quarterly' },
            { id: 'yearly', label: 'Yearly' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriodFilter(p.id as any)}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer active:scale-95 hover:-translate-y-0.5',
                periodFilter === p.id
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-500/20 border border-emerald-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <EmptyState
          icon={<Target size={44} />}
          title="No goals found in this timeframe"
          description="Clear goals keep your learning focused every single day."
          action={
            <div className="flex gap-2">
              <Button onClick={handleSeedSuggestedGoals} variant="secondary" size="sm">
                Load Recommended Goals
              </Button>
              <Button onClick={handleOpenAdd} size="sm">
                <Plus size={16} /> Create Goal
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map(goal => (
            <div
              key={goal.id}
              className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1426] via-[#09101f] to-[#070c18] border border-slate-800 border-l-[5px] border-l-emerald-400 shadow-lg flex flex-col justify-between hover:border-emerald-400/80 transition-all duration-200"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={goal.completed}
                      onChange={async (checked) => {
                        await updateGoal(goal.id, {
                          completed: checked,
                          progress: checked ? 100 : goal.progress === 100 ? 50 : goal.progress,
                          completedAt: checked ? todayStr() : undefined,
                        });
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className={cn(
                        'text-base sm:text-lg font-black tracking-tight',
                        goal.completed ? 'text-slate-400 line-through' : 'text-white'
                      )}>
                        {goal.title}
                      </h4>
                      {goal.description && (
                        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 leading-relaxed">
                          {goal.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-500/40 shrink-0">
                    {goal.period}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Milestone Progress</span>
                    <span className="font-black text-emerald-300 text-sm">{goal.progress}%</span>
                  </div>
                  <ProgressBar
                    value={goal.progress}
                    color={goal.completed ? 'emerald' : 'blue'}
                    size="md"
                    showPct={false}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-cyan-400" />
                  <span>Target: <strong className="text-slate-200">{formatDate(goal.targetDate)}</strong></span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(goal)}
                    className="p-2 text-slate-300 hover:text-cyan-300 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                    title="Edit goal"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm(`Delete goal "${goal.title}"?`)) {
                        await deleteGoal(goal.id);
                      }
                    }}
                    className="p-2 text-slate-300 hover:text-red-400 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                    title="Delete goal"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Goal Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingGoal ? 'Edit Milestone Goal' : 'Create New Milestone Goal'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Goal Title"
            placeholder="e.g. Master React Hooks, Solve 30 DP problems"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          <Textarea
            label="Description / Criteria for Success"
            placeholder="What does success look like for this goal?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Goal Horizon"
              value={period}
              onChange={e => setPeriod(e.target.value as GoalPeriod)}
              options={[
                { value: 'daily', label: 'Daily Goal' },
                { value: 'weekly', label: 'Weekly Goal' },
                { value: 'monthly', label: 'Monthly Goal' },
                { value: 'quarterly', label: 'Quarterly Goal' },
                { value: 'yearly', label: 'Yearly Goal' },
              ]}
            />

            <Input
              label="Target Completion Date"
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
            />
          </div>

          <Input
            label="Current Progress Percentage (0 - 100)"
            type="number"
            min="0"
            max="100"
            value={progress}
            onChange={e => setProgress(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveGoal}>{editingGoal ? 'Save Changes' : 'Create Goal'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
