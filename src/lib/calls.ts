import { dayKey, dayLabel } from '@/lib/format';
import type { CallRecord } from '@/types/call';

export type CallSection = {
  title: string;
  data: CallRecord[];
};

/**
 * Search across name, number, note and tag. A digits-only query also matches
 * the number with spaces/dashes stripped, so "941 505 775" and "+251941505775"
 * both find the same contact.
 */
export function filterCalls(calls: CallRecord[], query: string): CallRecord[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return calls;

  const digits = needle.replace(/[^0-9+]/g, '');

  return calls.filter((call) => {
    const haystack = [
      call.name ?? '',
      call.number,
      call.note ?? '',
      call.tag ?? '',
    ]
      .join(' ')
      .toLowerCase();
    if (haystack.includes(needle)) return true;
    if (digits.length >= 3) {
      return call.number.replace(/[\s()-]/g, '').includes(digits);
    }
    return false;
  });
}

/**
 * Newest first, then bucketed into local calendar days. The input order of a
 * same-second batch is preserved so re-renders stay stable.
 */
export function groupCalls(calls: CallRecord[]): CallSection[] {
  if (calls.length === 0) return [];

  const sorted = [...calls].sort((a, b) => b.timestamp - a.timestamp);
  const sections: CallSection[] = [];
  let currentKey = '';
  let current: CallSection | undefined;

  sorted.forEach((call) => {
    const key = dayKey(call.timestamp);
    if (key !== currentKey) {
      current = { title: dayLabel(call.timestamp), data: [] };
      sections.push(current);
      currentKey = key;
    }
    current?.data.push(call);
  });

  return sections;
}
