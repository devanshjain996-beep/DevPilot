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
    case 'completed': return 'text-emerald-400';
    case 'learning': return 'text-blue-400';
    case 'practising': return 'text-amber-400';
    case 'not-started': return 'text-slate-400';
    case 'in-progress': return 'text-blue-400';
    case 'planning': return 'text-violet-400';
    case 'idea': return 'text-slate-400';
    default: return 'text-slate-400';
  }
}

export function statusBg(status: string): string {
  switch (status) {
    case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'learning': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'practising': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'not-started': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'planning': return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
    case 'idea': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'skipped': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
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
