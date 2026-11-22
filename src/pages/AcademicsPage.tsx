// ============================================================================
// DevPilot — College Academics Management Page
// ============================================================================
import { useState } from 'react';
import {
  GraduationCap, Plus, BookOpen, Calendar, Clock, CheckCircle2,
  Trash2, Edit2, AlertCircle, FileText, Award, Layers, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  Card, PageHeader, ProgressBar, Badge, Button, Modal, Input, Select,
  Textarea, Checkbox, StatCard, EmptyState
} from '../components/ui';
import {
  useSubjects, addSubject, updateSubject, deleteSubject, useTopics
} from '../hooks/useDatabase';
import { formatDate, generateId, cn, todayStr, daysUntil } from '../utils/helpers';
import type { Subject, Chapter, Assignment, Exam, Practical } from '../types';

export default function AcademicsPage() {
  const subjects = useSubjects();
  const cTopics = useTopics('c');

  // Modals
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [activeTab, setActiveTab] = useState<'chapters' | 'assignments' | 'exams' | 'practicals'>('chapters');

  // Item Modals
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemType, setItemType] = useState<'chapter' | 'assignment' | 'exam' | 'practical'>('assignment');
  const [itemTitle, setItemTitle] = useState('');
  const [itemDate, setItemDate] = useState('');
  const [itemMarks, setItemMarks] = useState('');
  const [itemMaxMarks, setItemMaxMarks] = useState('100');
  const [itemNotes, setItemNotes] = useState('');

  // Overall Stats
  const totalSubjects = subjects.length;
  const allAssignments = subjects.flatMap(s => s.assignments || []);
  const pendingAssignments = allAssignments.filter(a => !a.completed);
  const allExams = subjects.flatMap(s => s.exams || []).sort((a, b) => a.date.localeCompare(b.date));
  const upcomingExams = allExams.filter(e => daysUntil(e.date) >= 0);

  const cCompleted = cTopics.filter(t => t.status === 'completed').length;
  const cPct = cTopics.length > 0 ? Math.round((cCompleted / cTopics.length) * 100) : 0;

  // Add Subject
  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return;
    await addSubject({
      name: newSubjectName.trim(),
      chapters: [],
      assignments: [],
      exams: [],
      practicals: [],
      progress: 0,
    });
    setNewSubjectName('');
    setSubjectModalOpen(false);
  };

  // Seed Default Subjects if empty
  const handleSeedDefaults = async () => {
    const defaults = [
      {
        name: 'C Programming & Data Structures (Lab + Theory)',
        chapters: [
          { id: generateId(), subjectId: '', name: 'C Language Fundamentals & Control Flow', topics: ['Syntax', 'Conditionals', 'Loops'], completed: true, notes: 'College Unit 1' },
          { id: generateId(), subjectId: '', name: 'Functions, Arrays & Strings', topics: ['Recursion', '2D Arrays', 'String library'], completed: false, notes: 'College Unit 2' },
          { id: generateId(), subjectId: '', name: 'Pointers & Dynamic Memory', topics: ['Pointer arithmetic', 'malloc/calloc'], completed: false, notes: 'College Unit 3' },
          { id: generateId(), subjectId: '', name: 'Structures & File Handling', topics: ['struct', 'FILE pointers'], completed: false, notes: 'College Unit 4' },
        ],
        assignments: [
          { id: generateId(), subjectId: '', title: 'Lab Assignment 1: Matrix Multiplication in C', dueDate: todayStr(), completed: true, marks: 10, maxMarks: 10, notes: 'Checked by prof' },
          { id: generateId(), subjectId: '', title: 'Practical Record: 15 Core Programs', dueDate: '2026-12-05', completed: false, marks: undefined, maxMarks: 20, notes: 'Must write in lab manual' },
        ],
        exams: [
          { id: generateId(), subjectId: '', title: 'Mid-Term Theory Exam', date: '2026-11-28', prepared: false },
          { id: generateId(), subjectId: '', title: 'Final Practical Exam & Viva', date: '2026-12-18', prepared: false },
        ],
        practicals: [
          { id: generateId(), subjectId: '', title: 'Experiment 1: Implement Bubble & Insertion Sort in C', completed: true, marks: 10, maxMarks: 10 },
          { id: generateId(), subjectId: '', title: 'Experiment 2: Linked List Creation and Traversal', completed: false },
        ],
        progress: 25,
      },
      {
        name: 'Engineering Mathematics & Discrete Structures',
        chapters: [
          { id: generateId(), subjectId: '', name: 'Linear Algebra & Matrices', topics: ['Eigenvalues', 'Rank of Matrix'], completed: true, notes: '' },
          { id: generateId(), subjectId: '', name: 'Calculus & Differential Equations', topics: ['Partial derivatives'], completed: false, notes: '' },
        ],
        assignments: [
          { id: generateId(), subjectId: '', title: 'Problem Set 2: Discrete Probability & Graph Theory', dueDate: '2026-11-25', completed: false, maxMarks: 15, notes: '' },
        ],
        exams: [
          { id: generateId(), subjectId: '', title: 'Semester Mathematics Exam', date: '2026-12-10', prepared: false },
        ],
        practicals: [],
        progress: 30,
      },
      {
        name: 'Digital Logic & Computer Organization',
        chapters: [
          { id: generateId(), subjectId: '', name: 'Boolean Algebra & Logic Gates', topics: ['K-Maps', 'Combinational circuits'], completed: true, notes: '' },
          { id: generateId(), subjectId: '', name: 'CPU Architecture & Instruction Set', topics: ['ALU', 'Registers'], completed: false, notes: '' },
        ],
        assignments: [
          { id: generateId(), subjectId: '', title: 'Assignment: K-Map Simplification & Counter Design', dueDate: '2026-11-30', completed: false, maxMarks: 10, notes: '' },
        ],
        exams: [],
        practicals: [],
        progress: 20,
      }
    ];

    for (const def of defaults) {
      await addSubject(def);
    }
  };

  // Add Item (Chapter, Assignment, Exam, Practical)
  const handleSaveItem = async () => {
    if (!activeSubject || !itemTitle.trim()) return;

    const sub = { ...activeSubject };

    if (itemType === 'chapter') {
      const chapter: Chapter = {
        id: generateId(),
        subjectId: sub.id,
        name: itemTitle.trim(),
        topics: itemNotes ? itemNotes.split(',').map(s => s.trim()) : [],
        completed: false,
        notes: '',
      };
      sub.chapters = [...(sub.chapters || []), chapter];
    } else if (itemType === 'assignment') {
      const assignment: Assignment = {
        id: generateId(),
        subjectId: sub.id,
        title: itemTitle.trim(),
        dueDate: itemDate || todayStr(),
        completed: false,
        marks: itemMarks ? Number(itemMarks) : undefined,
        maxMarks: itemMaxMarks ? Number(itemMaxMarks) : 100,
        notes: itemNotes,
      };
      sub.assignments = [...(sub.assignments || []), assignment];
    } else if (itemType === 'exam') {
      const exam: Exam = {
        id: generateId(),
        subjectId: sub.id,
        title: itemTitle.trim(),
        date: itemDate || todayStr(),
        prepared: false,
        marks: itemMarks ? Number(itemMarks) : undefined,
        maxMarks: itemMaxMarks ? Number(itemMaxMarks) : 100,
      };
      sub.exams = [...(sub.exams || []), exam];
    } else if (itemType === 'practical') {
      const practical: Practical = {
        id: generateId(),
        subjectId: sub.id,
        title: itemTitle.trim(),
        completed: false,
        marks: itemMarks ? Number(itemMarks) : undefined,
        maxMarks: itemMaxMarks ? Number(itemMaxMarks) : 10,
      };
      sub.practicals = [...(sub.practicals || []), practical];
    }

    // Recalculate progress
    const totalItems = (sub.chapters?.length || 0);
    const doneItems = (sub.chapters?.filter(c => c.completed).length || 0);
    sub.progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

    await updateSubject(sub.id, sub);
    setActiveSubject(sub);
    setItemModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* ── 3D COLLEGE ACADEMICS CYBER PORTAL BANNER ── */}
      <div className="relative rounded-3xl p-5 sm:p-7 border border-amber-500/40 bg-gradient-to-r from-[#211606] via-[#161220] to-[#070b16] shadow-2xl shadow-amber-950/40 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-amber-950/80 text-amber-300 border border-amber-400/50 shadow-sm shadow-amber-500/20">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                PORTAL 02.6 // COLLEGE ACADEMICS CHAMBER
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-slate-300 border border-slate-700">
                <GraduationCap size={11} className="text-amber-400" /> DEGREE CURRICULUM
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              College Academics Management
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-2xl leading-relaxed">
              Maintain academic excellence across semester subjects, internal exams, assignments, and practical laboratory records.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {subjects.length === 0 && (
              <button
                type="button"
                onClick={handleSeedDefaults}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-300 hover:text-white bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                Load Starter Subjects
              </button>
            )}
            <button
              type="button"
              onClick={() => setSubjectModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/25 flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Plus size={16} /> Add Subject
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Enrolled Subjects" value={totalSubjects} icon={<BookOpen size={20} />} color="blue" />
        <StatCard label="Pending Assignments" value={pendingAssignments.length} icon={<FileText size={20} />} color={pendingAssignments.length > 0 ? 'rose' : 'emerald'} sub="Don't miss due dates" />
        <StatCard label="Upcoming Exams" value={upcomingExams.length} icon={<Calendar size={20} />} color="amber" sub={upcomingExams[0] ? `Next in ${daysUntil(upcomingExams[0].date)}d` : 'None scheduled'} />
        <StatCard label="College C Programming" value={`${cPct}%`} icon={<GraduationCap size={20} />} color="cyan" sub={`${cCompleted}/${cTopics.length} topics done`} />
      </div>

      {/* Critical Reminders Card */}
      {(pendingAssignments.length > 0 || upcomingExams.length > 0) && (
        <Card className="bg-amber-950/20 border-amber-500/30 p-4">
          <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-sm">
            <AlertCircle size={18} />
            Academic Priority Watch: Keep your grades strong
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {pendingAssignments.length > 0 && (
              <div className="space-y-1">
                <span className="font-semibold text-slate-300 block">Pending Assignments:</span>
                {pendingAssignments.slice(0, 3).map((a, i) => (
                  <div key={i} className="flex justify-between items-center text-slate-300 bg-slate-900/40 p-2 rounded">
                    <span className="truncate">{a.title}</span>
                    <Badge variant={daysUntil(a.dueDate) <= 2 ? 'danger' : 'warning'}>
                      Due {formatDate(a.dueDate)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {upcomingExams.length > 0 && (
              <div className="space-y-1">
                <span className="font-semibold text-slate-300 block">Upcoming Exams:</span>
                {upcomingExams.slice(0, 3).map((e, i) => (
                  <div key={i} className="flex justify-between items-center text-slate-300 bg-slate-900/40 p-2 rounded">
                    <span className="truncate">{e.title}</span>
                    <Badge variant="purple">
                      {formatDate(e.date)} ({daysUntil(e.date)}d left)
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Subjects Grid */}
      {subjects.length === 0 ? (
        <EmptyState
          icon={<GraduationCap size={44} />}
          title="No college subjects added yet"
          description="DevPilot keeps your college grades high while you learn programming. Add your semester subjects now!"
          action={
            <div className="flex gap-2">
              <Button onClick={handleSeedDefaults} variant="secondary" size="sm">
                Load Starter Subjects
              </Button>
              <Button onClick={() => setSubjectModalOpen(true)} size="sm">
                <Plus size={16} /> Add Subject
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map(subject => {
            const chapDone = subject.chapters?.filter(c => c.completed).length || 0;
            const chapTotal = subject.chapters?.length || 0;
            const assignDone = subject.assignments?.filter(a => a.completed).length || 0;
            const assignTotal = subject.assignments?.length || 0;

            return (
              <Card
                key={subject.id}
                className={cn(
                  'cursor-pointer transition-all hover:border-blue-500/50 flex flex-col justify-between',
                  activeSubject?.id === subject.id && 'border-blue-500 ring-1 ring-blue-500'
                )}
                onClick={() => setActiveSubject(subject)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                      {subject.name}
                    </h3>
                    <Badge variant={subject.progress > 60 ? 'success' : 'default'}>
                      {subject.progress}%
                    </Badge>
                  </div>

                  <ProgressBar value={subject.progress} color="blue" size="sm" showPct={false} />

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>Chapters: <span className="text-slate-900 dark:text-white font-semibold">{chapDone}/{chapTotal}</span></div>
                    <div>Assignments: <span className="text-slate-900 dark:text-white font-semibold">{assignDone}/{assignTotal}</span></div>
                    <div>Exams: <span className="text-slate-900 dark:text-white font-semibold">{subject.exams?.length || 0}</span></div>
                    <div>Practicals: <span className="text-slate-900 dark:text-white font-semibold">{subject.practicals?.length || 0}</span></div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-blue-500 font-semibold hover:underline">
                    Manage Subject Details →
                  </span>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm(`Delete subject "${subject.name}"?`)) {
                        await deleteSubject(subject.id);
                        if (activeSubject?.id === subject.id) setActiveSubject(null);
                      }
                    }}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Active Subject Workspace Detail Drawer/Section */}
      {activeSubject && (
        <Card className="mt-6 border-blue-500/30 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="text-xs text-blue-500 font-semibold uppercase tracking-wider block">Subject Workspace</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{activeSubject.name}</h2>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setItemType(activeTab === 'chapters' ? 'chapter' : activeTab === 'assignments' ? 'assignment' : activeTab === 'exams' ? 'exam' : 'practical');
                  setItemTitle('');
                  setItemDate(todayStr());
                  setItemMarks('');
                  setItemMaxMarks(activeTab === 'assignments' ? '20' : '100');
                  setItemNotes('');
                  setItemModalOpen(true);
                }}
              >
                <Plus size={15} /> Add {activeTab.slice(0, -1)}
              </Button>
            </div>
          </div>

          {/* Subject Tabs */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            {[
              { id: 'chapters', label: `Chapters (${activeSubject.chapters?.length || 0})` },
              { id: 'assignments', label: `Assignments (${activeSubject.assignments?.length || 0})` },
              { id: 'exams', label: `Exams (${activeSubject.exams?.length || 0})` },
              { id: 'practicals', label: `Practicals (${activeSubject.practicals?.length || 0})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chapters View */}
          {activeTab === 'chapters' && (
            <div className="space-y-2">
              {(!activeSubject.chapters || activeSubject.chapters.length === 0) ? (
                <p className="text-sm text-slate-500 py-4">No chapters added yet.</p>
              ) : (
                activeSubject.chapters.map(chap => (
                  <div key={chap.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={chap.completed}
                        onChange={async (checked) => {
                          const updated = {
                            ...activeSubject,
                            chapters: activeSubject.chapters.map(c => c.id === chap.id ? { ...c, completed: checked } : c)
                          };
                          const total = updated.chapters.length;
                          const done = updated.chapters.filter(c => c.completed).length;
                          updated.progress = total > 0 ? Math.round((done / total) * 100) : 0;
                          await updateSubject(updated.id, updated);
                          setActiveSubject(updated);
                        }}
                      />
                      <div>
                        <p className={cn('text-sm font-semibold', chap.completed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white')}>
                          {chap.name}
                        </p>
                        {chap.topics && chap.topics.length > 0 && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Subtopics: {chap.topics.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={chap.completed ? 'success' : 'default'}>
                      {chap.completed ? 'Covered' : 'Pending'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Assignments View */}
          {activeTab === 'assignments' && (
            <div className="space-y-2">
              {(!activeSubject.assignments || activeSubject.assignments.length === 0) ? (
                <p className="text-sm text-slate-500 py-4">No assignments tracked for this subject.</p>
              ) : (
                activeSubject.assignments.map(ass => (
                  <div key={ass.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={ass.completed}
                        onChange={async (checked) => {
                          const updated = {
                            ...activeSubject,
                            assignments: activeSubject.assignments.map(a => a.id === ass.id ? { ...a, completed: checked } : a)
                          };
                          await updateSubject(updated.id, updated);
                          setActiveSubject(updated);
                        }}
                      />
                      <div>
                        <p className={cn('text-sm font-semibold', ass.completed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white')}>
                          {ass.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Due Date: {formatDate(ass.dueDate)} {ass.maxMarks ? `· Max Marks: ${ass.maxMarks}` : ''}
                        </p>
                      </div>
                    </div>
                    <Badge variant={ass.completed ? 'success' : daysUntil(ass.dueDate) <= 2 ? 'danger' : 'warning'}>
                      {ass.completed ? 'Submitted' : `Due in ${daysUntil(ass.dueDate)}d`}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Exams View */}
          {activeTab === 'exams' && (
            <div className="space-y-2">
              {(!activeSubject.exams || activeSubject.exams.length === 0) ? (
                <p className="text-sm text-slate-500 py-4">No exams scheduled.</p>
              ) : (
                activeSubject.exams.map(exam => (
                  <div key={exam.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{exam.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Date: {formatDate(exam.date)} · ({daysUntil(exam.date)} days remaining)
                      </p>
                    </div>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exam.prepared}
                        onChange={async (e) => {
                          const updated = {
                            ...activeSubject,
                            exams: activeSubject.exams.map(ex => ex.id === exam.id ? { ...ex, prepared: e.target.checked } : ex)
                          };
                          await updateSubject(updated.id, updated);
                          setActiveSubject(updated);
                        }}
                        className="rounded text-blue-600"
                      />
                      Prepared
                    </label>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Practicals View */}
          {activeTab === 'practicals' && (
            <div className="space-y-2">
              {(!activeSubject.practicals || activeSubject.practicals.length === 0) ? (
                <p className="text-sm text-slate-500 py-4">No lab practicals added.</p>
              ) : (
                activeSubject.practicals.map(prac => (
                  <div key={prac.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={prac.completed}
                        onChange={async (checked) => {
                          const updated = {
                            ...activeSubject,
                            practicals: activeSubject.practicals.map(p => p.id === prac.id ? { ...p, completed: checked } : p)
                          };
                          await updateSubject(updated.id, updated);
                          setActiveSubject(updated);
                        }}
                      />
                      <span className={cn('text-sm font-semibold', prac.completed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white')}>
                        {prac.title}
                      </span>
                    </div>
                    <Badge variant={prac.completed ? 'success' : 'default'}>
                      {prac.completed ? 'Performed' : 'Pending'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          )}
        </Card>
      )}

      {/* Add Subject Modal */}
      <Modal
        open={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        title="Add College Semester Subject"
      >
        <div className="space-y-4">
          <Input
            label="Subject Name"
            placeholder="e.g. Database Management Systems, Operating Systems"
            value={newSubjectName}
            onChange={e => setNewSubjectName(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" onClick={() => setSubjectModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubject}>Create Subject</Button>
          </div>
        </div>
      </Modal>

      {/* Add Item Modal */}
      <Modal
        open={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title={`Add ${itemType.toUpperCase()} to ${activeSubject?.name}`}
      >
        <div className="space-y-4">
          <Input
            label="Title / Name"
            placeholder={`Enter ${itemType} title...`}
            value={itemTitle}
            onChange={e => setItemTitle(e.target.value)}
          />

          {(itemType === 'assignment' || itemType === 'exam') && (
            <Input
              label="Date / Due Date"
              type="date"
              value={itemDate}
              onChange={e => setItemDate(e.target.value)}
            />
          )}

          {itemType === 'assignment' && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Max Marks"
                type="number"
                value={itemMaxMarks}
                onChange={e => setItemMaxMarks(e.target.value)}
              />
              <Input
                label="Scored Marks (Optional)"
                type="number"
                value={itemMarks}
                onChange={e => setItemMarks(e.target.value)}
              />
            </div>
          )}

          <Textarea
            label="Notes / Subtopics"
            placeholder={itemType === 'chapter' ? 'Comma separated subtopics...' : 'Any professor notes or submission details...'}
            value={itemNotes}
            onChange={e => setItemNotes(e.target.value)}
            rows={2}
          />

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" onClick={() => setItemModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveItem}>Save {itemType}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
