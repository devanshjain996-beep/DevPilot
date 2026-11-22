// ============================================================================
// DevPilot — 3D Universe UI Component System
// ============================================================================
import React, { useState } from 'react';
import { cn } from '../../utils/helpers';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

// -- Card --
export function Card({ children, className, onClick }: {
  children: React.ReactNode; className?: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative bg-[#0c1222]/90 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl shadow-black/40 backdrop-blur-md transition-all duration-300 text-slate-100',
        onClick && 'cursor-pointer hover:border-cyan-500/50 hover:shadow-cyan-500/10 hover:-translate-y-1 active:translate-y-0',
        className
      )}
    >
      {children}
    </div>
  );
}

// -- StatCard --
export function StatCard({ label, value, icon, color = 'blue', sub }: {
  label: string; value: string | number; icon: React.ReactNode; color?: string; sub?: string;
}) {
  const colors: Record<string, { gradient: string; border: string; glow: string; text: string }> = {
    blue: {
      gradient: 'from-blue-950/40 via-slate-900/60 to-slate-950/80',
      border: 'border-blue-500/30 hover:border-blue-500/50',
      glow: 'shadow-blue-500/5',
      text: 'text-blue-400',
    },
    violet: {
      gradient: 'from-violet-950/40 via-slate-900/60 to-slate-950/80',
      border: 'border-violet-500/30 hover:border-violet-500/50',
      glow: 'shadow-violet-500/5',
      text: 'text-violet-400',
    },
    emerald: {
      gradient: 'from-emerald-950/40 via-slate-900/60 to-slate-950/80',
      border: 'border-emerald-500/30 hover:border-emerald-500/50',
      glow: 'shadow-emerald-500/5',
      text: 'text-emerald-400',
    },
    amber: {
      gradient: 'from-amber-950/40 via-slate-900/60 to-slate-950/80',
      border: 'border-amber-500/30 hover:border-amber-500/50',
      glow: 'shadow-amber-500/5',
      text: 'text-amber-400',
    },
    rose: {
      gradient: 'from-rose-950/40 via-slate-900/60 to-slate-950/80',
      border: 'border-rose-500/30 hover:border-rose-500/50',
      glow: 'shadow-rose-500/5',
      text: 'text-rose-400',
    },
    cyan: {
      gradient: 'from-cyan-950/40 via-slate-900/60 to-slate-950/80',
      border: 'border-cyan-500/30 hover:border-cyan-500/50',
      glow: 'shadow-cyan-500/5',
      text: 'text-cyan-400',
    },
  };

  const c = colors[color] || colors.blue;

  return (
    <div
      className={cn(
        'relative bg-gradient-to-br rounded-2xl border p-5 transition-all duration-300 shadow-lg hover:-translate-y-0.5',
        c.gradient,
        c.border,
        c.glow
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">{label}</span>
        <span className={cn('p-2 rounded-xl bg-slate-900/80 border border-slate-800', c.text)}>
          {icon}
        </span>
      </div>
      <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">{value}</div>
      {sub && <div className="text-xs text-slate-300 mt-1 font-semibold">{sub}</div>}
    </div>
  );
}

// -- ProgressBar --
export function ProgressBar({ value, max = 100, color = 'blue', label, showPct = true, size = 'md' }: {
  value: number; max?: number; color?: string; label?: string; showPct?: boolean; size?: 'sm' | 'md' | 'lg';
}) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' };
  const colors: Record<string, string> = {
    blue: 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]',
    violet: 'bg-gradient-to-r from-purple-500 to-violet-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
    amber: 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
    rose: 'bg-gradient-to-r from-rose-500 to-pink-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]',
    cyan: 'bg-gradient-to-r from-cyan-500 to-blue-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]',
  };

  return (
    <div className="w-full">
      {(label || showPct) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-bold text-slate-200">{label}</span>}
          {showPct && <span className="text-xs font-mono font-black text-slate-200">{pct}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-slate-900 border border-slate-800/80 rounded-full overflow-hidden p-0.5', heights[size])}>
        <div
          className={cn('rounded-full transition-all duration-700 ease-out h-full', colors[color] || colors.blue)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// -- Badge --
export function Badge({ children, variant = 'default', className }: {
  children: React.ReactNode; variant?: string; className?: string;
}) {
  const variants: Record<string, string> = {
    default: 'bg-slate-800/95 border border-slate-700 text-slate-200 font-bold',
    success: 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold shadow-xs shadow-emerald-500/10',
    warning: 'bg-amber-950/80 border border-amber-500/50 text-amber-300 font-bold shadow-xs shadow-amber-500/10',
    danger: 'bg-red-950/80 border border-red-500/50 text-red-300 font-bold shadow-xs shadow-red-500/10',
    info: 'bg-blue-950/80 border border-blue-500/50 text-blue-300 font-bold shadow-xs shadow-blue-500/10',
    purple: 'bg-violet-950/80 border border-violet-500/50 text-violet-300 font-bold shadow-xs shadow-violet-500/10',
  };

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide', variants[variant] || variants.default, className)}>
      {children}
    </span>
  );
}

// -- Button (Human-made feel with smooth micro-interactions & tactile transitions) --
export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, className, type = 'button', title }: {
  children: React.ReactNode; onClick?: () => void; variant?: string; size?: string;
  disabled?: boolean; className?: string; type?: 'button' | 'submit'; title?: string;
}) {
  const variants: Record<string, string> = {
    primary: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold shadow-md shadow-blue-500/25 border border-cyan-400/40 hover:border-cyan-300',
    secondary: 'bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-cyan-400 text-white font-semibold shadow-sm',
    ghost: 'hover:bg-slate-800/80 text-slate-200 hover:text-white font-medium',
    danger: 'bg-red-600/90 hover:bg-red-500 text-white font-bold shadow-md shadow-red-500/20 border border-red-400/30',
    success: 'bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20 border border-emerald-400/30',
  };

  const sizes: Record<string, string> = {
    xs: 'px-2.5 py-1 text-xs font-semibold rounded-lg',
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg',
    md: 'px-4 py-2 text-sm font-semibold rounded-xl',
    lg: 'px-6 py-3 text-base font-bold rounded-xl',
  };

  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-200 ease-out cursor-pointer select-none',
        'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
        'focus:outline-none focus:ring-2 focus:ring-cyan-500/40',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
    >
      {children}
    </button>
  );
}

// -- Input --
export function Input({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string; error?: string;
}) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-bold text-slate-200 tracking-wider uppercase mb-1.5">{label}</label>}
      <input
        {...props}
        className={cn(
          'w-full px-3.5 py-2.5 bg-[#0b101e] border rounded-xl text-white font-medium placeholder-slate-400 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500',
          error ? 'border-red-500' : 'border-slate-800 hover:border-slate-700',
          props.className
        )}
      />
      {error && <p className="mt-1 text-xs text-red-400 font-semibold">{error}</p>}
    </div>
  );
}

// -- Textarea --
export function Textarea({ label, error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string; error?: string;
}) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-bold text-slate-200 tracking-wider uppercase mb-1.5">{label}</label>}
      <textarea
        {...props}
        className={cn(
          'w-full px-3.5 py-2.5 bg-[#0b101e] border rounded-xl text-white font-medium placeholder-slate-400 transition-all duration-200 resize-y min-h-[80px]',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500',
          error ? 'border-red-500' : 'border-slate-800 hover:border-slate-700',
          props.className
        )}
      />
      {error && <p className="mt-1 text-xs text-red-400 font-semibold">{error}</p>}
    </div>
  );
}

// -- Select --
export function Select({ label, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string; options: { value: string; label: string }[];
}) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-bold text-slate-200 tracking-wider uppercase mb-1.5">{label}</label>}
      <select
        {...props}
        className={cn(
          'w-full px-3.5 py-2.5 bg-[#0b101e] border border-slate-800 hover:border-slate-700 rounded-xl text-white font-semibold transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500',
          props.className
        )}
      >
        {options.map(o => <option key={o.value} value={o.value} className="bg-slate-900 text-white font-medium">{o.label}</option>)}
      </select>
    </div>
  );
}

// -- Modal --
export function Modal({ open, onClose, title, children, size = 'md' }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className={cn('relative bg-[#0d1424] rounded-3xl shadow-2xl shadow-black/80 border border-slate-800/90 text-slate-100 w-full p-6 max-h-[90vh] overflow-y-auto z-10', sizes[size])}>
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
          <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// -- Tabs --
export function Tabs({ tabs, active, onChange }: {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  active: string; onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1.5 p-1 bg-slate-950/80 border border-slate-800/80 rounded-xl overflow-x-auto">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95',
            active === t.id
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
          )}
        >
          {t.icon}{t.label}
        </button>
      ))}
    </div>
  );
}

// -- EmptyState --
export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode; title: string; description: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-cyan-400 mb-4 shadow-inner">
        {icon}
      </div>
      <h3 className="text-lg font-black text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-300 max-w-sm mb-5 leading-relaxed font-medium">{description}</p>
      {action}
    </div>
  );
}

// -- Accordion --
export function Accordion({ title, children, defaultOpen = false, badge }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean; badge?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/60">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-900/40 hover:bg-slate-900/80 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="font-bold text-white">{title}</span>
          {badge}
        </div>
        {open ? <ChevronUp size={18} className="text-slate-300" /> : <ChevronDown size={18} className="text-slate-300" />}
      </button>
      {open && <div className="px-5 py-4 border-t border-slate-800/60 bg-[#0a0f1d]/40">{children}</div>}
    </div>
  );
}

// -- Checkbox --
export function Checkbox({ checked, onChange, label, className }: {
  checked: boolean; onChange: (v: boolean) => void; label?: string; className?: string;
}) {
  return (
    <label className={cn('flex items-center gap-2.5 cursor-pointer group select-none', className)}>
      <div className={cn(
        'w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200',
        checked
          ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
          : 'border-slate-600 bg-slate-900 group-hover:border-cyan-400/60'
      )}>
        {checked && (
          <svg className="w-3.5 h-3.5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      {label && <span className={cn('text-sm font-semibold transition-colors', checked ? 'text-slate-400 line-through' : 'text-slate-100')}>{label}</span>}
    </label>
  );
}

// -- PageHeader --
export function PageHeader({ title, subtitle, action }: {
  title: string; subtitle?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          {title}
        </h1>
        {subtitle && <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
}
