// ============================================================================
// DevPilot - Reusable UI Components
// ============================================================================
import React, { useState } from 'react';
import { cn } from '../../utils/helpers';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

// -- Card --
export function Card({ children, className, onClick }: {
  children: React.ReactNode; className?: string; onClick?: () => void;
}) {
  return (
    <div onClick={onClick} className={cn(
      'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm transition-all',
      onClick && 'cursor-pointer hover:border-blue-500/50 hover:shadow-md',
      className
    )}>
      {children}
    </div>
  );
}

// -- StatCard --
export function StatCard({ label, value, icon, color = 'blue', sub }: {
  label: string; value: string | number; icon: React.ReactNode; color?: string; sub?: string;
}) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    violet: 'from-violet-500/20 to-violet-600/10 border-violet-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
    rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/30',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
  };
  return (
    <div className={cn('bg-gradient-to-br rounded-xl border p-5', colors[color] || colors.blue)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-slate-400">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

// -- ProgressBar --
export function ProgressBar({ value, max = 100, color = 'blue', label, showPct = true, size = 'md' }: {
  value: number; max?: number; color?: string; label?: string; showPct?: boolean; size?: 'sm' | 'md' | 'lg';
}) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const colors: Record<string, string> = {
    blue: 'bg-blue-500', violet: 'bg-violet-500', emerald: 'bg-emerald-500',
    amber: 'bg-amber-500', rose: 'bg-rose-500', cyan: 'bg-cyan-500',
  };
  return (
    <div className="w-full">
      {(label || showPct) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>}
          {showPct && <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{pct}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('rounded-full transition-all duration-700 ease-out', heights[size], colors[color] || colors.blue)}
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
    default: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
    success: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    warning: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
    danger: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
    info: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
    purple: 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400',
  };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant] || variants.default, className)}>
      {children}
    </span>
  );
}

// -- Button --
export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, className, type = 'button', title }: {
  children: React.ReactNode; onClick?: () => void; variant?: string; size?: string;
  disabled?: boolean; className?: string; type?: 'button' | 'submit'; title?: string;
}) {
  const variants: Record<string, string> = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    secondary: 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  };
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
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
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
      <input
        {...props}
        className={cn(
          'w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white placeholder-slate-400 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500',
          error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600',
          props.className
        )}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

// -- Textarea --
export function Textarea({ label, error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string; error?: string;
}) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
      <textarea
        {...props}
        className={cn(
          'w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white placeholder-slate-400 transition-colors resize-y min-h-[80px]',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500',
          error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600',
          props.className
        )}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

// -- Select --
export function Select({ label, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string; options: { value: string; label: string }[];
}) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
      <select
        {...props}
        className={cn(
          'w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500',
          props.className
        )}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full p-6 max-h-[90vh] overflow-y-auto', sizes[size])}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
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
    <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors',
            active === t.id
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-slate-300 dark:text-slate-600 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">{description}</p>
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
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-medium text-slate-900 dark:text-white">{title}</span>
          {badge}
        </div>
        {open ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>
      {open && <div className="px-5 py-4 bg-white dark:bg-slate-800">{children}</div>}
    </div>
  );
}

// -- Checkbox --
export function Checkbox({ checked, onChange, label, className }: {
  checked: boolean; onChange: (v: boolean) => void; label?: string; className?: string;
}) {
  return (
    <label className={cn('flex items-center gap-2.5 cursor-pointer group', className)}>
      <div className={cn(
        'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
        checked
          ? 'bg-blue-600 border-blue-600'
          : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-400'
      )}>
        {checked && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      {label && <span className={cn('text-sm', checked ? 'text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300')}>{label}</span>}
    </label>
  );
}

// -- PageHeader --
export function PageHeader({ title, subtitle, action }: {
  title: string; subtitle?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
