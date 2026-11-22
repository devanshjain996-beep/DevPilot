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
      <PageHeader
        title="Weekly Study Planner"
        subtitle="Your structured 8:30–9:15 PM topic rotation and weekly task commitments."
        action={
          <div className="flex gap-2">
            <Button onClick={handleOpenAdd} size="sm">
              <Plus size={16} /> Add Task
            </Button>
          </div>
        }
      />

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
          <Card className="bg-slate-900 border-violet-500/30 p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-violet-300 text-xs uppercase tracking-wider block">
                  Daily Habit Foundations (Every Monday – Sunday)
                </span>
                <p className="text-xs text-slate-300 mt-0.5">
                  • <strong>4:00 – 5:00 PM:</strong> Python Learning & Practice<br />
                  • <strong>5:00 – 7:00 PM:</strong> Free Time / Break (or your custom hours)<br />
                  • <strong>7:00 – 8:00 PM:</strong> C++ & DSA Practice
                </p>
              </div>
              <Badge variant="purple" className="shrink-0">Daily Invariants</Badge>
            </div>
          </Card>

          {/* Weekly 8:30 - 9:15 PM Table */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>8:30 – 9:15 PM Evening Focus Rotation</span>
              <span className="text-xs text-slate-500 font-normal">Click any day to customize topic</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {schedule.map((slot: any) => (
                <Card
                  key={slot.id}
                  className="p-3.5 flex flex-col justify-between hover:border-blue-500/50 cursor-pointer transition-all"
                  onClick={() => {
                    setEditingSlot(slot);
                    setEditSlotModal(true);
                  }}
                >
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wide">
                      {slot.day}
                    </span>
                    <Badge variant={slot.category === 'webdev' ? 'info' : slot.category === 'system-design' ? 'warning' : slot.category === 'python' ? 'success' : 'purple'}>
                      {slot.timeSlot}
                    </Badge>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                      {slot.activity}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-blue-500 flex items-center justify-between">
                    <span>Edit focus</span>
                    <Edit2 size={12} />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Tasks List View */
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="skipped">Skipped / Rescheduled</option>
              </select>

              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <Button onClick={handleOpenAdd} size="sm">
              <Plus size={15} /> Add Task
            </Button>
          </div>

          {filteredTasks.length === 0 ? (
            <EmptyState
              icon={<ListTodo size={40} />}
              title="No tasks in this list"
              description="Keep a clear backlog of coding assignments, revision tasks, and project milestones."
              action={<Button onClick={handleOpenAdd} size="sm"><Plus size={15} /> Add Task</Button>}
            />
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map(task => (
                <Card key={task.id} className="p-3.5 transition-all">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
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
                          'text-sm font-semibold truncate',
                          task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'
                        )}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <span className="capitalize">{task.category}</span>
                          <span>·</span>
                          <span>Due: {formatDate(task.deadline || task.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'default'}>
                        {task.priority}
                      </Badge>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          // Reschedule task to tomorrow without overloading
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          const tomorrowStr = tomorrow.toISOString().split('T')[0];
                          await updateTask(task.id, {
                            date: tomorrowStr,
                            deadline: tomorrowStr,
                            status: 'rescheduled'
                          });
                        }}
                        className="p-1.5 text-xs text-amber-500"
                        title="Reschedule to tomorrow"
                      >
                        <RotateCcw size={14} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (confirm(`Delete task "${task.title}"?`)) {
                            await deleteTask(task.id);
                          }
                        }}
                        className="p-1.5 text-xs text-red-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
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

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTask}>{editingTask ? 'Save Changes' : 'Create Task'}</Button>
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

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
              <Button variant="ghost" onClick={() => setEditSlotModal(false)}>Cancel</Button>
              <Button onClick={handleSaveSlot}>Save Schedule</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
