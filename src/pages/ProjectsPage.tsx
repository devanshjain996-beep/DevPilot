// ============================================================================
// DevPilot — Project Management Page
// ============================================================================
import { useState } from 'react';
import {
  FolderKanban, Plus, ExternalLink, Trash2, Edit2, Calendar,
  CheckCircle2, Clock, Sparkles, Lightbulb, Tag, ArrowRight, Eye
} from 'lucide-react';
import { GithubIcon } from '../components/ui/SocialIcons';
import {
  Card, PageHeader, ProgressBar, Badge, Button, Modal, Input, Select,
  Textarea, Checkbox, StatCard, EmptyState
} from '../components/ui';
import { useProjects, addProject, updateProject, deleteProject } from '../hooks/useDatabase';
import { DEFAULT_PROJECTS } from '../data/roadmapData';
import { formatDate, statusBg, cn, todayStr } from '../utils/helpers';
import type { Project, ProjectStatus } from '../types';

export default function ProjectsPage() {
  const projects = useProjects();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTech, setFormTech] = useState('');
  const [formGithub, setFormGithub] = useState('');
  const [formLive, setFormLive] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formStatus, setFormStatus] = useState<ProjectStatus>('idea');
  const [formNotes, setFormNotes] = useState('');
  const [formLessons, setFormLessons] = useState('');
  const [formPortfolio, setFormPortfolio] = useState(true);

  // Filter
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const ideasCount = projects.filter(p => p.status === 'idea').length;
  const planningCount = projects.filter(p => p.status === 'planning').length;
  const inProgressCount = projects.filter(p => p.status === 'in-progress').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;

  const handleOpenAdd = (starter?: { title: string; description: string; technologies: string[] }) => {
    setEditingProject(null);
    setFormTitle(starter ? starter.title : '');
    setFormDesc(starter ? starter.description : '');
    setFormTech(starter ? starter.technologies.join(', ') : 'Python, React, TypeScript');
    setFormGithub('');
    setFormLive('');
    setFormStartDate(todayStr());
    setFormDeadline('');
    setFormStatus(starter ? 'planning' : 'idea');
    setFormNotes('');
    setFormLessons('');
    setFormPortfolio(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p);
    setFormTitle(p.title);
    setFormDesc(p.description);
    setFormTech(p.technologies.join(', '));
    setFormGithub(p.githubUrl || '');
    setFormLive(p.liveUrl || '');
    setFormStartDate(p.startDate || '');
    setFormDeadline(p.deadline || '');
    setFormStatus(p.status);
    setFormNotes(p.notes || '');
    setFormLessons(p.lessonsLearned || '');
    setFormPortfolio(p.showInPortfolio);
    setModalOpen(true);
  };

  const handleSaveProject = async () => {
    if (!formTitle.trim()) return;

    const techArray = formTech.split(',').map(s => s.trim()).filter(Boolean);

    if (editingProject) {
      await updateProject(editingProject.id, {
        title: formTitle.trim(),
        description: formDesc.trim(),
        technologies: techArray,
        githubUrl: formGithub.trim() || undefined,
        liveUrl: formLive.trim() || undefined,
        startDate: formStartDate || undefined,
        deadline: formDeadline || undefined,
        completionDate: formStatus === 'completed' ? (editingProject.completionDate || todayStr()) : undefined,
        status: formStatus,
        notes: formNotes,
        lessonsLearned: formLessons,
        showInPortfolio: formPortfolio,
      });
    } else {
      await addProject({
        title: formTitle.trim(),
        description: formDesc.trim(),
        technologies: techArray,
        githubUrl: formGithub.trim() || undefined,
        liveUrl: formLive.trim() || undefined,
        startDate: formStartDate || todayStr(),
        deadline: formDeadline || undefined,
        completionDate: formStatus === 'completed' ? todayStr() : undefined,
        status: formStatus,
        notes: formNotes,
        lessonsLearned: formLessons,
        showInPortfolio: formPortfolio,
      });
    }
    setModalOpen(false);
  };

  const filteredProjects = projects.filter(p => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Developer Project Tracker"
        subtitle="Build real-world full-stack and AI applications. Practice software architecture, version control and deployment."
        action={
          <Button onClick={() => handleOpenAdd()} size="sm">
            <Plus size={16} /> New Project
          </Button>
        }
      />

      {/* Status Breakdown Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Ideas" value={ideasCount} icon={<Lightbulb size={20} />} color="cyan" />
        <StatCard label="Planning" value={planningCount} icon={<Clock size={20} />} color="violet" />
        <StatCard label="In Progress" value={inProgressCount} icon={<FolderKanban size={20} />} color="blue" sub="Active Focus" />
        <StatCard label="Completed" value={completedCount} icon={<CheckCircle2 size={20} />} color="emerald" sub="Portfolio Ready" />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-2xl border border-slate-800/80">
        <div className="flex gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: `All (${projects.length})` },
            { id: 'in-progress', label: `In Progress (${inProgressCount})` },
            { id: 'completed', label: `Completed (${completedCount})` },
            { id: 'planning', label: `Planning (${planningCount})` },
            { id: 'idea', label: `Ideas (${ideasCount})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer active:scale-95 hover:-translate-y-0.5',
                statusFilter === f.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold shadow-md shadow-orange-500/20 border border-orange-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={44} />}
          title="No projects in this category"
          description="Projects are how you prove your coding skills to employers. Pick a recommended idea below to start!"
          action={
            <Button onClick={() => handleOpenAdd()} size="sm">
              <Plus size={16} /> Create Custom Project
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map(project => (
            <Card
              key={project.id}
              className="p-5 flex flex-col justify-between hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-white group-hover:text-orange-300 transition-colors">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={statusBg(project.status)}>
                        {project.status.toUpperCase()}
                      </Badge>
                      {project.showInPortfolio && (
                        <Badge variant="purple" className="flex items-center gap-1 text-[10px]">
                          <Eye size={10} /> Public Portfolio
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(project)}
                      className="p-1.5 text-xs hover:text-cyan-400"
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (confirm(`Delete project "${project.title}"?`)) {
                          await deleteProject(project.id);
                        }
                      }}
                      className="p-1.5 text-xs text-red-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {project.description}
                </p>

                {/* Tech Stack Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-lg text-[11px] font-mono bg-cyan-950/40 border border-cyan-800/40 text-cyan-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Dates & Links */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex flex-wrap gap-3 items-center">
                  {project.startDate && <span>Started: {formatDate(project.startDate)}</span>}
                  {project.deadline && <span>Deadline: {formatDate(project.deadline)}</span>}
                  {project.completionDate && <span className="text-emerald-500 font-semibold">Done: {formatDate(project.completionDate)}</span>}
                </div>

                {/* Notes & Lessons */}
                {project.lessonsLearned && (
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 text-xs">
                    <span className="font-semibold text-slate-400 block mb-0.5">Lessons Learned:</span>
                    <p className="text-slate-600 dark:text-slate-300">{project.lessonsLearned}</p>
                  </div>
                )}
              </div>

              {/* Links Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <GithubIcon size={13} /> Repo
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1"
                    >
                      <ExternalLink size={13} /> Live Demo
                    </a>
                  )}
                </div>

                <select
                  value={project.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value as ProjectStatus;
                    await updateProject(project.id, {
                      status: newStatus,
                      completionDate: newStatus === 'completed' ? todayStr() : undefined,
                    });
                  }}
                  className="text-xs bg-slate-100 dark:bg-slate-700 rounded px-2 py-1 text-slate-800 dark:text-slate-200 font-medium"
                >
                  <option value="idea">Idea</option>
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Recommended Starter Project Ideas Section */}
      <div className="mt-8 space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-amber-400" size={18} />
            Recommended Full-Stack & AI Project Ideas
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click "Start Project" to adopt any of these curriculum-recommended projects into your planner.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEFAULT_PROJECTS.map((item, idx) => (
            <Card key={idx} className="p-4 flex flex-col justify-between bg-slate-900/60 border-slate-800">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-blue-400 font-bold">
                  Recommended Idea #{idx + 1}
                </span>
                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.technologies.map((t, i) => (
                    <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full text-xs"
                  onClick={() => handleOpenAdd(item)}
                >
                  <Plus size={14} /> Start This Project
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Project Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Project Title"
            placeholder="e.g. AI-Powered PDF Assistant, Full-Stack Task Manager"
            value={formTitle}
            onChange={e => setFormTitle(e.target.value)}
          />

          <Textarea
            label="Description & Problem Solved"
            placeholder="What does this project do? Who is it for?"
            value={formDesc}
            onChange={e => setFormDesc(e.target.value)}
            rows={2}
          />

          <Input
            label="Technologies & Frameworks (comma separated)"
            placeholder="e.g. React, TypeScript, FastAPI, PostgreSQL, ChromaDB"
            value={formTech}
            onChange={e => setFormTech(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="GitHub Repository URL"
              placeholder="https://github.com/username/repo"
              value={formGithub}
              onChange={e => setFormGithub(e.target.value)}
            />
            <Input
              label="Live Demo URL (Optional)"
              placeholder="https://myproject.vercel.app"
              value={formLive}
              onChange={e => setFormLive(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={formStartDate}
              onChange={e => setFormStartDate(e.target.value)}
            />
            <Input
              label="Target Deadline"
              type="date"
              value={formDeadline}
              onChange={e => setFormDeadline(e.target.value)}
            />
            <Select
              label="Current Status"
              value={formStatus}
              onChange={e => setFormStatus(e.target.value as ProjectStatus)}
              options={[
                { value: 'idea', label: 'Idea' },
                { value: 'planning', label: 'Planning' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
              ]}
            />
          </div>

          <Textarea
            label="Lessons Learned & Engineering Challenges"
            placeholder="What architecture decisions did you make? What was tough to debug?"
            value={formLessons}
            onChange={e => setFormLessons(e.target.value)}
            rows={2}
          />

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formPortfolio}
                onChange={e => setFormPortfolio(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Feature this project on My Public Developer Portfolio
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProject}>{editingProject ? 'Save Changes' : 'Create Project'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
