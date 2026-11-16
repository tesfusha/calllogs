import { Platform } from 'react-native';

import type { CallRecord } from '@/types/call';

/**
 * Native device-call-log reader.
 *
 * Reading the device call log requires a native module (Android: `READ_CALL_LOG`
 * + a `ContentResolver` query against `CallLog.Calls`). Expo has no built-in
 * module for this, so on native this returns `null` unless a custom native
 * module is installed (see the Phase 6 notes). The web test build always uses
 * imported data, so this is a no-op there.
 */
export async function readDeviceCallLog(): Promise<CallRecord[] | null> {
  if (Platform.OS === 'web') return null;

  // Attempt to load the local Expo native module if installed.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('call-log-native');
    const native = mod?.default ?? mod;
    if (native && typeof native.load === 'function') {
      const rows = await native.load(500);
      return rows.map((row: Record<string, unknown>, index: number) => ({
        id: `native-${index}-${row.timestamp}`,
        number: String(row.phoneNumber ?? ''),
        name: row.name ? String(row.name) : null,
        direction:
          row.type === 'INCOMING'
            ? 'incoming'
            : row.type === 'OUTGOING'
              ? 'outgoing'
              : 'missed',
        sim: null,
        timestamp: Number(row.timestamp) || Date.now(),
        duration: Number(row.duration) || 0,
        note: null,
        tag: null,
      }));
    }
  } catch {
    // Native module not installed — fall back to imported data.
  }

  return null;
}