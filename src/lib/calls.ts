import { dayKey, dayLabel } from '@/lib/format';
import type { CallRecord } from '@/types/call';

export type CallSection = {
  title: string;
  data: CallRecord[];
};

/** Levenshtein distance, capped so long strings stay cheap. */
function editDistance(a: string, b: string, cap = 3): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  if (Math.abs(a.length - b.length) > cap) return cap + 1;

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let current = [i];
    let minInRow = current[0];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      current.push(value);
      if (value < minInRow) minInRow = value;
    }
    if (minInRow > cap) return cap + 1;
    previous = current;
  }
  return previous[b.length];
}

/**
 * Search across name, number, note and tag. A digits-only query also matches
 * the number with spaces/dashes stripped, so "941 505 775" and "+251941505775"
 * both find the same contact. Short queries also fuzzy-match the name/number
 * (edit distance <= 2) so typos like "melek" vs "meleek" still resolve.
 */
export function filterCalls(calls: CallRecord[], query: string): CallRecord[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return calls;

  const digits = needle.replace(/[^0-9+]/g, '');

  return calls.filter((call) => {
    const name = (call.name ?? '').toLowerCase();
    const haystack = [call.name ?? '', call.number, call.note ?? '', call.tag ?? '']
      .join(' ')
      .toLowerCase();

    if (haystack.includes(needle)) return true;

    if (digits.length >= 3) {
      if (call.number.replace(/[\s()-]/g, '').includes(digits)) return true;
    }

    // Fuzzy name match for short queries.
    if (needle.length >= 3 && needle.length <= 24 && !digits) {
      if (editDistance(name, needle) <= 2) return true;
      // Token prefix match: every query word is a prefix of some name word.
      const queryWords = needle.split(/\s+/).filter(Boolean);
      const nameWords = name.split(/\s+/).filter(Boolean);
      if (queryWords.length > 0 && queryWords.every((qw) => nameWords.some((nw) => nw.startsWith(qw)))) {
        return true;
      }
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