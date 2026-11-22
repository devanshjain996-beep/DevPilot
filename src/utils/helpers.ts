// ============================================================================
// DevPilot - Utility functions
// ============================================================================
import { format, startOfWeek, endOfWeek, isToday, parseISO, differenceInDays } from 'date-fns';

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDate(d: string | Date): string {
  const date = typeof d === 'string' ? parseISO(d) : d;
  return format(date, 'MMM dd, yyyy');
}

export function formatDay(d: string | Date): string {
  const date = typeof d === 'string' ? parseISO(d) : d;
  return format(date, 'EEEE');
}

export function isTodayStr(d: string): boolean {
  try { return isToday(parseISO(d)); } catch { return false; }
}

export function weekRange(): { start: string; end: string } {
  const now = new Date();
  return {
    start: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    end: format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  };
}

export function daysUntil(dateStr: string): number {
  try { return differenceInDays(parseISO(dateStr), new Date()); } catch { return 0; }
}

export function percentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function statusColor(status: string): string {
  switch (status) {
    case 'completed': return 'text-emerald-300 font-bold';
    case 'learning': return 'text-blue-300 font-bold';
    case 'practising': return 'text-amber-300 font-bold';
    case 'not-started': return 'text-slate-200 font-bold';
    case 'in-progress': return 'text-cyan-300 font-bold';
    case 'planning': return 'text-violet-300 font-bold';
    case 'idea': return 'text-indigo-300 font-bold';
    default: return 'text-slate-200 font-bold';
  }
}

export function statusBg(status: string): string {
  switch (status) {
    case 'completed': return 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 font-bold shadow-sm shadow-emerald-500/20';
    case 'learning': return 'bg-blue-950/90 text-blue-300 border border-blue-500/50 font-bold shadow-sm shadow-blue-500/20';
    case 'practising': return 'bg-amber-950/90 text-amber-300 border border-amber-500/50 font-bold shadow-sm shadow-amber-500/20';
    case 'not-started': return 'bg-slate-900/95 text-slate-200 border border-slate-700 font-bold';
    case 'in-progress': return 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/50 font-bold shadow-sm shadow-cyan-500/20';
    case 'planning': return 'bg-violet-950/90 text-violet-300 border border-violet-500/50 font-bold shadow-sm shadow-violet-500/20';
    case 'idea': return 'bg-indigo-950/90 text-indigo-300 border border-indigo-500/50 font-bold';
    case 'pending': return 'bg-amber-950/90 text-amber-300 border border-amber-500/50 font-bold';
    case 'skipped': return 'bg-rose-950/90 text-rose-300 border border-rose-500/50 font-bold';
    default: return 'bg-slate-900/95 text-slate-200 border border-slate-700 font-bold';
  }
}

export function priorityColor(p: string): string {
  switch (p) {
    case 'urgent': return 'text-red-400';
    case 'high': return 'text-orange-400';
    case 'medium': return 'text-amber-400';
    case 'low': return 'text-slate-400';
    default: return 'text-slate-400';
  }
}

export function exportData(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
