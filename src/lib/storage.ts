import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CallRecord } from '@/types/call';

const CALLS_KEY = 'calllog.calls.v1';

function isCallRecord(value: unknown): value is CallRecord {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<CallRecord>;
  return (
    typeof v.id === 'string' &&
    typeof v.number === 'string' &&
    typeof v.timestamp === 'number' &&
    typeof v.duration === 'number' &&
    (v.direction === 'incoming' || v.direction === 'outgoing' || v.direction === 'missed')
  );
}

/**
 * Read the persisted call list. Hydrate-safe by contract: a brand-new user
 * gets `[]`, a corrupt entry gets `[]`, and it never throws — the app must
 * boot even when storage is unavailable (private mode, SSR prerender).
 */
export async function readCalls(): Promise<CallRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(CALLS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCallRecord) : [];
  } catch {
    return [];
  }
}

/**
 * Persist the whole list. Best-effort: a full disk or blocked storage must
 * not break the UI, so failures are swallowed rather than surfaced.
 */
export async function writeCalls(calls: CallRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CALLS_KEY, JSON.stringify(calls));
  } catch {
    // Intentionally empty — losing a write is better than crashing a call log.
  }
}
