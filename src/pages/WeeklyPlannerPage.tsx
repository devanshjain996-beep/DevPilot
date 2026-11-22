// ============================================================================
// DevPilot — Weekly Study Planner Page
// ============================================================================
import { useState } from 'react';
import {
  CalendarDays, Clock, Plus, CheckCircle2, AlertTriangle, ArrowRight,
  RotateCcw, Trash2, Edit2, Sparkles, Filter, Check, ListTodo
} from 'lucide-react';
import {
  Card, PageHeader, ProgressBar, Badge, Button, Modal, Input, Select,
  Textarea, Checkbox, StatCard, EmptyState, Tabs
} from '../components/ui';
import {
  useTasks, addTask, updateTask, deleteTask, useWeeklySlots
} from '../hooks/useDatabase';
import { DEFAULT_WEEKLY_SCHEDULE } from '../data/roadmapData';
import { todayStr, formatDate, priorityColor, cn, generateId } from '../utils/helpers';
import type { Task, Priority, TaskStatus } from '../types';

export default function WeeklyPlannerPage() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'tasks'>('schedule');
  const allTasks = useTasks();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('python');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskDeadline, setTaskDeadline] = useState(todayStr());
  const [taskDesc, setTaskDesc] = useState('');

  // Schedule Customization State (Stored in localStorage or initial defaults)
  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('devpilot_weekly_schedule');
    return saved ? JSON.parse(saved) : DEFAULT_WEEKLY_SCHEDULE;
  });

  const [editSlotModal, setEditSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<{ id: string; day: string; activity: string; category: string } | null>(null);

  // Filter
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const completedTasks = allTasks.filter(t => t.status === 'completed');
  const pendingTasks = allTasks.filter(t => t.status === 'pending');
  const completionPct = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;

  const handleOpenAdd = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskCategory('python');
    setTaskPriority('medium');
    setTaskDeadline(todayStr());
    setTaskDesc('');
    setModalOpen(true);
  };

  const handleSaveTask = async () => {
    if (!taskTitle.trim()) return;

    if (editingTask) {
      await updateTask(editingTask.id, {
        title: taskTitle.trim(),
        category: taskCategory,
        priority: taskPriority,
        deadline: taskDeadline,
        description: taskDesc.trim() || undefined,
      });
    } else {
      await addTask({
        title: taskTitle.trim(),
        category: taskCategory,
        priority: taskPriority,
        status: 'pending',
        date: taskDeadline,
        deadline: taskDeadline,
        description: taskDesc.trim() || undefined,
      });
    }
    setModalOpen(false);
  };

  const handleSaveSlot = () => {
    if (!editingSlot) return;
    const updated = schedule.map((s: any) => s.id === editingSlot.id ? editingSlot : s);
    setSchedule(updated);
    localStorage.setItem('devpilot_weekly_schedule', JSON.stringify(updated));
    setEditSlotModal(false);
  };

  const filteredTasks = allTasks.filter(t => {
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* ── 3D WEEKLY PLANNER CYBER PORTAL BANNER ── */}
      <div className="relative rounded-3xl p-5 sm:p-7 border border-cyan-500/30 bg-gradient-to-r from-[#0b1429] via-[#0d1c3a] to-[#080e1e] shadow-2xl shadow-cyan-950/40 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-cyan-950/80 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                DOOR 01.2 // WEEKLY ROTATION PLANNER
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-500/50">
                <Clock size={11} className="text-cyan-400" /> 8:30 PM FOCUS ROTATION
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Weekly Study & Habit Engine
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-2xl leading-relaxed">
              Maintain daily core invariants and execute your strategic 8:30–9:15 PM evening rotation commitments.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Plus size={15} /> Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Planned vs Actual Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Planned Study Goal" value="25h / wk" icon={<Clock size={20} />} color="blue" sub="~3.5h daily target" />
        <StatCard label="Task Completion" value={`${completionPct}%`} icon={<CheckCircle2 size={20} />} color="emerald" sub={`${completedTasks.length} of ${allTasks.length} done`} />
        <StatCard label="Pending Tasks" value={pendingTasks.length} icon={<ListTodo size={20} />} color="amber" sub="Action items remaining" />
        <StatCard label="Evening Rotation" value="Active" icon={<Sparkles size={20} />} color="violet" sub="8:30–9:15 PM Slot" />
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'schedule', label: '8:30 PM Rotation Schedule', icon: <CalendarDays size={16} /> },
          { id: 'tasks', label: `Weekly Tasks & Backlog (${allTasks.length})`, icon: <ListTodo size={16} /> },
        ]}
        active={activeTab}
        onChange={id => setActiveTab(id as any)}
      />

      {activeTab === 'schedule' ? (
        <div className="space-y-6">
          {/* Permanent Daily Invariants Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0d1428] via-[#091122] to-[#070b16] border border-violet-500/40 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-extrabold text-violet-300 text-xs uppercase tracking-wider block">
                  Daily Habit Foundations (Every Monday – Sunday)
                </span>
                <p className="text-xs sm:text-sm text-slate-200 font-medium mt-1 leading-relaxed">
                  • <strong className="text-emerald-400">4:00 – 5:00 PM:</strong> Python Learning & Practice<br />
                  • <strong className="text-indigo-400">5:00 – 7:00 PM:</strong> Free Time / Personal Break (or custom hours)<br />
                  • <strong className="text-violet-400">7:00 – 8:00 PM:</strong> C++ & DSA Deep Practice
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-violet-950/80 text-violet-300 border border-violet-500/50 shadow-sm shrink-0">
                Daily Invariants
              </span>
            </div>
          </div>

          {/* Weekly 8:30 - 9:15 PM Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>8:30 – 9:15 PM Evening Focus Rotation</span>
              </h3>
              <span className="text-xs text-slate-300 font-semibold">Click any day card to customize topic</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3.5">
              {schedule.map((slot: any) => (
                <div
                  key={slot.id}
                  className="p-4 rounded-2xl bg-gradient-to-b from-[#0c1426] to-[#070c18] border border-slate-800/90 hover:border-cyan-400/80 shadow-lg flex flex-col justify-between cursor-pointer transition-all duration-200 active:scale-95 group hover:-translate-y-1"
                  onClick={() => {
                    setEditingSlot(slot);
                    setEditSlotModal(true);
                  }}
                >
                  <div className="space-y-2.5">
                    <span className="text-xs font-mono font-black text-cyan-400 block uppercase tracking-wider">
                      {slot.day}
                    </span>
                    <span className="inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-slate-950/90 text-slate-200 border border-slate-700">
                      {slot.timeSlot}
                    </span>
                    <p className="text-sm sm:text-base font-extrabold text-white mt-1 leading-snug group-hover:text-cyan-300 transition-colors">
                      {slot.activity}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800 text-xs font-bold text-cyan-400 flex items-center justify-between">
                    <span>Edit focus</span>
                    <Edit2 size={13} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Tasks List View */
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="text-xs font-bold bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="skipped">Skipped / Rescheduled</option>
              </select>

              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="text-xs font-bold bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus size={15} /> Add Task
            </button>
          </div>

          {filteredTasks.length === 0 ? (
            <EmptyState
              icon={<ListTodo size={40} />}
              title="No tasks in this list"
              description="Keep a clear backlog of coding assignments, revision tasks, and project milestones."
              action={<Button onClick={handleOpenAdd} size="sm" className="text-white font-bold bg-blue-600"><Plus size={15} /> Add Task</Button>}
            />
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map(task => (
                <div key={task.id} className="p-4 rounded-2xl bg-gradient-to-r from-[#0c1426] via-[#09101f] to-[#070c18] border border-slate-800/90 shadow-md transition-all">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <Checkbox
                        checked={task.status === 'completed'}
                        onChange={async (checked) => {
                          await updateTask(task.id, {
                            status: checked ? 'completed' : 'pending'
                          });
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={cn(
                          'text-base font-extrabold truncate',
                          task.status === 'completed' ? 'text-slate-400 line-through' : 'text-white'
                        )}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-300 font-medium">
                          <span className="capitalize font-bold text-cyan-300">{task.category}</span>
                          <span>·</span>
                          <span>Due: {formatDate(task.deadline || task.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'default'}>
                        {task.priority.toUpperCase()}
                      </Badge>

                      <button
                        type="button"
                        onClick={async () => {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          const tomorrowStr = tomorrow.toISOString().split('T')[0];
                          await updateTask(task.id, {
                            date: tomorrowStr,
                            deadline: tomorrowStr,
                            status: 'rescheduled'
                          });
                        }}
                        className="p-2 text-xs text-amber-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer"
                        title="Reschedule to tomorrow"
                      >
                        <RotateCcw size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Delete task "${task.title}"?`)) {
                            await deleteTask(task.id);
                          }
                        }}
                        className="p-2 text-xs text-rose-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Add Weekly Task'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Implement Dijkstra's algorithm, Review React Router docs"
            value={taskTitle}
            onChange={e => setTaskTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={taskCategory}
              onChange={e => setTaskCategory(e.target.value)}
              options={[
                { value: 'python', label: 'Python' },
                { value: 'cpp-dsa', label: 'C++ & DSA' },
                { value: 'webdev', label: 'Web Development' },
                { value: 'system-design', label: 'System Design' },
                { value: 'ai-ml', label: 'AI/ML' },
                { value: 'academics', label: 'College Academics' },
                { value: 'personal', label: 'Personal' },
              ]}
            />

            <Select
              label="Priority"
              value={taskPriority}
              onChange={e => setTaskPriority(e.target.value as Priority)}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
          </div>

          <Input
            label="Target Deadline Date"
            type="date"
            value={taskDeadline}
            onChange={e => setTaskDeadline(e.target.value)}
          />

          <Textarea
            label="Description / Context"
            placeholder="Any specific instructions or URLs..."
            value={taskDesc}
            onChange={e => setTaskDesc(e.target.value)}
            rows={2}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="text-white font-bold bg-slate-800 border-slate-700">Cancel</Button>
            <Button onClick={handleSaveTask} className="text-white font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 shadow-md">{editingTask ? 'Save Changes' : 'Create Task'}</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Slot Modal */}
      {editingSlot && (
        <Modal
          open={editSlotModal}
          onClose={() => setEditSlotModal(false)}
          title={`Edit ${editingSlot.day} Focus Topic`}
          size="sm"
        >
          <div className="space-y-4">
            <Input
              label="Focus Activity (8:30 – 9:15 PM)"
              value={editingSlot.activity}
              onChange={e => setEditingSlot({ ...editingSlot, activity: e.target.value })}
            />

            <Select
              label="Category"
              value={editingSlot.category}
              onChange={e => setEditingSlot({ ...editingSlot, category: e.target.value })}
              options={[
                { value: 'webdev', label: 'Web Development' },
                { value: 'system-design', label: 'System Design' },
                { value: 'python', label: 'Python Practice' },
                { value: 'review', label: 'Revision & Planning' },
                { value: 'cpp-dsa', label: 'C++ & DSA' },
              ]}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button variant="secondary" onClick={() => setEditSlotModal(false)} className="text-white font-bold bg-slate-800 border-slate-700">Cancel</Button>
              <Button onClick={handleSaveSlot} className="text-white font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 shadow-md">Save Schedule</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
