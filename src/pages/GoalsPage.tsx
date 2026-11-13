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
      <PageHeader
        title="Goals & Productivity Analytics"
        subtitle="Set milestone targets and track real tangible progress across topics, exercises, DSA problems and projects."
        action={
          <div className="flex gap-2">
            {goals.length === 0 && (
              <Button variant="secondary" onClick={handleSeedSuggestedGoals} size="sm">
                Load Recommended Goals
              </Button>
            )}
            <Button onClick={handleOpenAdd} size="sm">
              <Plus size={16} /> New Goal
            </Button>
          </div>
        }
      />

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Goal Completion" value={`${overallGoalPct}%`} icon={<Target size={20} />} color="blue" sub={`${completedGoals} of ${totalGoals} goals met`} />
        <StatCard label="Curriculum Topics" value={completedTopics} icon={<CheckCircle2 size={20} />} color="emerald" sub="Real topics mastered" />
        <StatCard label="DSA Problems Solved" value={solvedDSA} icon={<Flame size={20} />} color="amber" sub="LeetCode / GFG / CF" />
        <StatCard label="Finished Projects" value={finishedProjects} icon={<Award size={20} />} color="violet" sub="Full-stack & AI apps" />
      </div>

      {/* Productivity Insight Banner */}
      <Card className="bg-slate-900 border-blue-500/30 p-4">
        <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold text-sm">
          <Sparkles size={18} />
          True Developer Metric: Outcomes Over Hours
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          DevPilot measures your growth through verified topic completions, algorithms solved, and deployed applications rather than passive screen time alone. Keep shipping!
        </p>
      </Card>

      {/* Period Filter Tabs */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex gap-1 overflow-x-auto">
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
                'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap',
                periodFilter === p.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
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
            <Card key={goal.id} className="p-4 flex flex-col justify-between hover:border-blue-500/40 transition-all">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
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
                        'text-sm font-bold truncate',
                        goal.completed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'
                      )}>
                        {goal.title}
                      </h4>
                      {goal.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {goal.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <Badge variant={goal.completed ? 'success' : 'purple'} className="capitalize shrink-0">
                    {goal.period}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{goal.progress}%</span>
                  </div>
                  <ProgressBar
                    value={goal.progress}
                    color={goal.completed ? 'emerald' : 'blue'}
                    size="sm"
                    showPct={false}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar size={13} />
                  <span>Target: {formatDate(goal.targetDate)}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(goal)}
                    className="p-1 text-xs"
                  >
                    <Edit2 size={13} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      if (confirm(`Delete goal "${goal.title}"?`)) {
                        await deleteGoal(goal.id);
                      }
                    }}
                    className="p-1 text-xs text-red-400 hover:text-red-500"
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            </Card>
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
