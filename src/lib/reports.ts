import { dayKey, dayLabel, formatDuration } from '@/lib/format';
import type { CallRecord } from '@/types/call';
import { totals } from '@/lib/stats';

export type PeriodReport = {
  generatedAt: number;
  periodStart: number;
  periodEnd: number;
  label: string;
  totalCalls: number;
  totalDuration: number;
  incoming: number;
  outgoing: number;
  missed: number;
  incomingDuration: number;
  outgoingDuration: number;
  topContact: { name: string; count: number; duration: number } | null;
  busiestDay: string | null;
};

function periodBounds(now: Date, kind: 'week' | 'month'): { start: number; end: number; label: string } {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (kind === 'week') {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start: start.getTime(), end: end.getTime(), label: 'Last 7 days' };
  }

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  const monthName = now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  return { start: start.getTime(), end: end.getTime(), label: monthName };
}

export function generateReport(calls: CallRecord[], kind: 'week' | 'month', now: Date = new Date()): PeriodReport {
  const { start, end, label } = periodBounds(now, kind);
  const inPeriod = calls.filter((call) => call.timestamp >= start && call.timestamp <= end);
  const t = totals(inPeriod);

  // Top contact by call count.
  const byNumber = new Map<string, { name: string; count: number; duration: number }>();
  inPeriod.forEach((call) => {
    const existing = byNumber.get(call.number);
    if (existing) {
      existing.count += 1;
      existing.duration += call.duration;
    } else {
      byNumber.set(call.number, {
        name: call.name?.trim() || call.number,
        count: 1,
        duration: call.duration,
      });
    }
  });
  const topContact =
    byNumber.size > 0
      ? [...byNumber.values()].sort((a, b) => b.count - a.count || b.duration - a.duration)[0]
      : null;

  // Busiest day.
  const dayCounts = new Map<string, number>();
  inPeriod.forEach((call) => {
    const key = dayKey(call.timestamp);
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
  });
  let busiestDay: string | null = null;
  let busiestCount = 0;
  dayCounts.forEach((count, key) => {
    if (count > busiestCount) {
      busiestCount = count;
      busiestDay = dayLabel(Number(key) ? new Date(key).getTime() : Date.now());
    }
  });
  // dayLabel needs a timestamp; recompute from key properly.
  if (dayCounts.size > 0) {
    const busiestKey = [...dayCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    const [y, m, d] = busiestKey.split('-').map(Number);
    busiestDay = dayLabel(new Date(y, m - 1, d).getTime());
  }

  return {
    generatedAt: now.getTime(),
    periodStart: start,
    periodEnd: end,
    label,
    totalCalls: t.count,
    totalDuration: t.totalDuration,
    incoming: t.incoming,
    outgoing: t.outgoing,
    missed: t.missed,
    incomingDuration: t.incomingDuration,
    outgoingDuration: t.outgoingDuration,
    topContact,
    busiestDay: busiestDay && busiestCount > 0 ? `${busiestDay} (${busiestCount} calls)` : null,
  };
}

export function isSunday(now: Date = new Date()): boolean {
  return now.getDay() === 0;
}

export function isMonthEnd(now: Date = new Date()): boolean {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.getMonth() !== now.getMonth();
}

/** Human-readable summary line for a report notification. */
export function reportSummary(report: PeriodReport): string {
  const parts = [`${report.totalCalls} calls`, formatDuration(report.totalDuration)];
  if (report.topContact) parts.push(`top: ${report.topContact.name}`);
  return parts.join(' · ');
}