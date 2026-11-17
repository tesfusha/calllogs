import { Platform, PermissionsAndroid } from 'react-native';
import type { Permission } from 'react-native';

import { makeCallId } from '@/lib/import';
import type { CallDirection, CallRecord, SimSlot } from '@/types/call';

type NativeEntry = {
  phoneNumber: string;
  name: string | null;
  type: 'INCOMING' | 'OUTGOING' | 'MISSED';
  timestamp: number;
  duration: number;
  sim: string | null;
};

export type PermissionResult = 'granted' | 'denied' | 'unavailable';

/**
 * Request READ_CALL_LOG + READ_CONTACTS on Android. On web/iOS these are
 * unavailable, so the caller can fall back to imported data.
 */
export async function requestCallLogPermissions(): Promise<PermissionResult> {
  if (Platform.OS !== 'android') return 'unavailable';

  const wanted: Permission[] = [];
  if (PermissionsAndroid.PERMISSIONS.READ_CALL_LOG) wanted.push(PermissionsAndroid.PERMISSIONS.READ_CALL_LOG);
  if (PermissionsAndroid.PERMISSIONS.READ_CONTACTS) wanted.push(PermissionsAndroid.PERMISSIONS.READ_CONTACTS);

  try {
    const results = await PermissionsAndroid.requestMultiple(wanted);
    const callLog = results[PermissionsAndroid.PERMISSIONS.READ_CALL_LOG];
    return callLog === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}

function mapDirection(type: NativeEntry['type']): CallDirection {
  switch (type) {
    case 'INCOMING':
      return 'incoming';
    case 'OUTGOING':
      return 'outgoing';
    default:
      return 'missed';
  }
}

function mapSim(sim: string | null): SimSlot {
  if (sim === '1') return 'SIM 1';
  if (sim === '2') return 'SIM 2';
  return null;
}

/**
 * Read the device call log via the native `call-log-native` module (Android).
 *
 * Returns `null` on web / when the native module isn't installed, so callers
 * can fall back to imported data. Records use `makeCallId`, so re-reading the
 * log never duplicates rows — the store de-duplicates on id.
 */
export async function readDeviceCallLog(): Promise<CallRecord[] | null> {
  if (Platform.OS === 'web') return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('call-log-native');
    const native = mod?.default ?? mod;
    if (native && typeof native.load === 'function') {
      const rows = (await native.load(1000)) as NativeEntry[];
      return rows.map((row) => {
        const number = String(row.phoneNumber ?? '');
        const timestamp = Number(row.timestamp) || Date.now();
        const direction = mapDirection(row.type);
        const duration = Number(row.duration) || 0;
        return {
          id: makeCallId({ number, timestamp, direction, duration }),
          number,
          name: row.name ? String(row.name) : null,
          direction,
          sim: mapSim(row.sim ?? null),
          timestamp,
          duration,
          note: null,
          tag: null,
        };
      });
    }
  } catch {
    // Native module not installed — fall back to imported data.
  }

  return null;
}
