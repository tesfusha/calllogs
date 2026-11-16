
import type { CallRecord } from '@/types/call';

export type QuietContact = {
  number: string;
  name: string;
  /** Typical gap between calls, in whole days. */
  typicalIntervalDays: number;
  /** Days since the last call. */
  daysSinceLast: number;
  /** How many days overdue relative to the typical interval. */
  overdueDays: number;
  lastTimestamp: number;
  callCount: number;
};

const MS_PER_DAY = 86_400_000;

/** Median of a sorted numeric array. */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/** Typical interval (days) between calls for one contact, or null if < 2 calls. */
export function typicalIntervalDays(calls: CallRecord[]): number | null {
  if (calls.length < 2) return null;
  const sorted = [...calls].sort((a, b) => a.timestamp - b.timestamp);
  const gaps: number[] = [];
  for (let index = 1; index < sorted.length; index += 1) {
    gaps.push((sorted[index].timestamp - sorted[index - 1].timestamp) / MS_PER_DAY);
  }
  const value = median(gaps);
  return value > 0 ? value : null;
}

/**
 * Contacts that have gone quiet relative to their own calling rhythm.
 *
 * A contact qualifies when:
 *  - they have at least 2 calls (so an interval exists),
 *  - their typical interval is at most 30 days (frequent caller),
 *  - it has been at least `interval * 1.5` days since the last call,
 *  - and at least 7 days have passed (avoids nagging on weekly callers).
 */
export function quietContacts(calls: CallRecord[], now: Date = new Date()): QuietContact[] {
  const nowMs = now.getTime();
  const byNumber = new Map<string, CallRecord[]>();
  calls.forEach((call) => {
    const list = byNumber.get(call.number) ?? [];
    list.push(call);
    byNumber.set(call.number, list);
  });

  const result: QuietContact[] = [];
  byNumber.forEach((contactCalls, number) => {
    const interval = typicalIntervalDays(contactCalls);
    if (interval === null || interval > 30) return;

    const lastTimestamp = Math.max(...contactCalls.map((call) => call.timestamp));
    const daysSinceLast = (nowMs - lastTimestamp) / MS_PER_DAY;
    const threshold = Math.max(interval * 1.5, 7);

    if (daysSinceLast >= threshold) {
      result.push({
        number,
        name: contactCalls[0].name?.trim() || number,
        typicalIntervalDays: Math.round(interval),
        daysSinceLast: Math.floor(daysSinceLast),
        overdueDays: Math.max(0, Math.floor(daysSinceLast - interval)),
        lastTimestamp,
        callCount: contactCalls.length,
      });
    }
  });

  return result.sort((a, b) => b.overdueDays - a.overdueDays);
}

/** Format a quiet-contact message for a notification. */
export function quietMessage(contact: QuietContact): string {
  const days = contact.daysSinceLast;
  const usually = contact.typicalIntervalDays;
  return `It's been ${days} day${days === 1 ? '' : 's'} since you called ${contact.name} — you usually call every ${usually} day${usually === 1 ? '' : 's'}.`;
}