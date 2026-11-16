import { dayKey, dayLabel } from '@/lib/format';
import type { CallRecord } from '@/types/call';

export type RangeKey = 'all' | '7d' | '30d' | '90d' | 'year';

/** Start of the selected window (0 = everything). */
export function rangeStart(range: RangeKey, now: Date = new Date()): number {
  if (range === 'all') return 0;
  const copy = new Date(now);
  copy.setHours(0, 0, 0, 0);
  if (range === '7d') copy.setDate(copy.getDate() - 6);
  else if (range === '30d') copy.setDate(copy.getDate() - 29);
  else if (range === '90d') copy.setDate(copy.getDate() - 89);
  else if (range === 'year') copy.setMonth(0, 1);
  return copy.getTime();
}

export function inRange(call: CallRecord, range: RangeKey, now?: Date): boolean {
  return call.timestamp >= rangeStart(range, now);
}

export type CallTotals = {
  count: number;
  incoming: number;
  outgoing: number;
  missed: number;
  totalDuration: number;
  incomingDuration: number;
  outgoingDuration: number;
  missedDuration: number;
  avgDuration: number;
};

export function totals(calls: CallRecord[]): CallTotals {
  let incoming = 0;
  let outgoing = 0;
  let missed = 0;
  let incomingDuration = 0;
  let outgoingDuration = 0;
  let missedDuration = 0;
  let totalDuration = 0;

  calls.forEach((call) => {
    if (call.direction === 'incoming') {
      incoming += 1;
      incomingDuration += call.duration;
    } else if (call.direction === 'outgoing') {
      outgoing += 1;
      outgoingDuration += call.duration;
    } else {
      missed += 1;
      missedDuration += call.duration;
    }
    totalDuration += call.duration;
  });

  return {
    count: calls.length,
    incoming,
    outgoing,
    missed,
    totalDuration,
    incomingDuration,
    outgoingDuration,
    missedDuration,
    avgDuration: calls.length > 0 ? Math.round(totalDuration / calls.length) : 0,
  };
}

export type DailyBucket = {
  key: string;
  label: string;
  count: number;
  incoming: number;
  outgoing: number;
  missed: number;
  duration: number;
};

/** One bucket per calendar day that has at least one call, oldest first. */
export function dailyBuckets(calls: CallRecord[]): DailyBucket[] {
  const map = new Map<string, DailyBucket>();
  calls.forEach((call) => {
    const key = dayKey(call.timestamp);
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      existing.duration += call.duration;
      if (call.direction === 'incoming') existing.incoming += 1;
      else if (call.direction === 'outgoing') existing.outgoing += 1;
      else existing.missed += 1;
    } else {
      map.set(key, {
        key,
        label: dayLabel(call.timestamp),
        count: 1,
        incoming: call.direction === 'incoming' ? 1 : 0,
        outgoing: call.direction === 'outgoing' ? 1 : 0,
        missed: call.direction === 'missed' ? 1 : 0,
        duration: call.duration,
      });
    }
  });

  return [...map.values()].sort((a, b) => (a.key < b.key ? -1 : 1));
}

export type ContactStat = {
  key: string;
  name: string;
  number: string;
  count: number;
  incoming: number;
  outgoing: number;
  missed: number;
  duration: number;
  incomingDuration: number;
  outgoingDuration: number;
  lastTimestamp: number;
};

/** Per-contact aggregation, sorted by count desc then duration desc. */
export function contactStats(calls: CallRecord[]): ContactStat[] {
  const map = new Map<string, ContactStat>();
  const nameCounts = new Map<string, Map<string, number>>();

  calls.forEach((call) => {
    const key = call.number;
    const trimmedName = call.name?.trim();
    if (trimmedName) {
      if (!nameCounts.has(key)) nameCounts.set(key, new Map());
      const counts = nameCounts.get(key)!;
      counts.set(trimmedName, (counts.get(trimmedName) ?? 0) + 1);
    }

    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      existing.duration += call.duration;
      existing.lastTimestamp = Math.max(existing.lastTimestamp, call.timestamp);
      if (call.direction === 'incoming') {
        existing.incoming += 1;
        existing.incomingDuration += call.duration;
      } else if (call.direction === 'outgoing') {
        existing.outgoing += 1;
        existing.outgoingDuration += call.duration;
      } else {
        existing.missed += 1;
      }
    } else {
      map.set(key, {
        key,
        name: trimmedName || call.number,
        number: call.number,
        count: 1,
        incoming: call.direction === 'incoming' ? 1 : 0,
        outgoing: call.direction === 'outgoing' ? 1 : 0,
        missed: call.direction === 'missed' ? 1 : 0,
        duration: call.duration,
        incomingDuration: call.direction === 'incoming' ? call.duration : 0,
        outgoingDuration: call.direction === 'outgoing' ? call.duration : 0,
        lastTimestamp: call.timestamp,
      });
    }
  });

  // Merge names: pick the most common non-empty name per contact.
  map.forEach((stat, key) => {
    const counts = nameCounts.get(key);
    if (!counts || counts.size === 0) return;
    let bestName = stat.name;
    let bestCount = 0;
    counts.forEach((count, name) => {
      if (count > bestCount) {
        bestCount = count;
        bestName = name;
      }
    });
    stat.name = bestName;
  });

  return [...map.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.duration - a.duration;
  });
}

export type SimStat = {
  sim: 'SIM 1' | 'SIM 2' | 'Unknown';
  count: number;
  duration: number;
  incoming: number;
  outgoing: number;
  missed: number;
};

export function simStats(calls: CallRecord[]): SimStat[] {
  const map = new Map<string, SimStat>();
  const ensure = (sim: string) => {
    if (!map.has(sim)) {
      map.set(sim, {
        sim: sim === 'SIM 1' || sim === 'SIM 2' ? sim : 'Unknown',
        count: 0,
        duration: 0,
        incoming: 0,
        outgoing: 0,
        missed: 0,
      });
    }
    return map.get(sim)!;
  };

  calls.forEach((call) => {
    const key = call.sim ?? 'Unknown';
    const stat = ensure(key);
    stat.count += 1;
    stat.duration += call.duration;
    if (call.direction === 'incoming') stat.incoming += 1;
    else if (call.direction === 'outgoing') stat.outgoing += 1;
    else stat.missed += 1;
  });

  // Always show both SIMs for dual-SIM clarity, even at zero.
  if (!map.has('SIM 1')) ensure('SIM 1');
  if (!map.has('SIM 2')) ensure('SIM 2');

  return ['SIM 1', 'SIM 2', 'Unknown']
    .filter((sim) => map.has(sim) && (sim !== 'Unknown' || map.get(sim)!.count > 0))
    .map((sim) => map.get(sim)!);
}

/** Busiest day (by count) within the filtered set. */
export function busiestDay(calls: CallRecord[]): DailyBucket | null {
  const buckets = dailyBuckets(calls);
  if (buckets.length === 0) return null;
  return buckets.reduce((best, bucket) =>
    bucket.count > best.count ? bucket : best,
  );
}

/** Top contact by duration. */
export function topByDuration(calls: CallRecord[]): ContactStat | null {
  const stats = contactStats(calls);
  if (stats.length === 0) return null;
  return stats.reduce((best, stat) =>
    stat.duration > best.duration ? stat : best,
  );
}

export type DurationTrends = {
  avgAll: number;
  avg7d: number;
  avg30d: number;
  longest: { name: string; duration: number; timestamp: number } | null;
  shortest: { name: string; duration: number; timestamp: number } | null;
  totalCallsWithDuration: number;
};

/** Rolling duration averages and longest/shortest calls. */
export function durationTrends(calls: CallRecord[], now: Date = new Date()): DurationTrends {
  const nowMs = now.getTime();
  const sevenDaysAgo = nowMs - 7 * 86_400_000;
  const thirtyDaysAgo = nowMs - 30 * 86_400_000;

  const withDuration = calls.filter((call) => call.duration > 0);
  const avg = (subset: CallRecord[]) =>
    subset.length > 0
      ? Math.round(subset.reduce((sum, call) => sum + call.duration, 0) / subset.length)
      : 0;

  const longest =
    withDuration.length > 0
      ? withDuration.reduce((best, call) =>
          call.duration > best.duration ? call : best,
        )
      : null;
  const shortest =
    withDuration.length > 0
      ? withDuration.reduce((best, call) =>
          call.duration < best.duration ? call : best,
        )
      : null;

  return {
    avgAll: avg(calls),
    avg7d: avg(calls.filter((call) => call.timestamp >= sevenDaysAgo)),
    avg30d: avg(calls.filter((call) => call.timestamp >= thirtyDaysAgo)),
    longest: longest
      ? { name: longest.name?.trim() || longest.number, duration: longest.duration, timestamp: longest.timestamp }
      : null,
    shortest: shortest
      ? { name: shortest.name?.trim() || shortest.number, duration: shortest.duration, timestamp: shortest.timestamp }
      : null,
    totalCallsWithDuration: withDuration.length,
  };
}