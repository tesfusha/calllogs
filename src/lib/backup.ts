import type { CallRecord } from '@/types/call';

export type BackupPayload = {
  version: 1;
  createdAt: number;
  app: 'call-log';
  calls: CallRecord[];
};

export function createBackup(calls: CallRecord[]): BackupPayload {
  return {
    version: 1,
    createdAt: Date.now(),
    app: 'call-log',
    calls,
  };
}

export function backupToJson(calls: CallRecord[]): string {
  return JSON.stringify(createBackup(calls), null, 2);
}

export function parseBackup(text: string): { calls: CallRecord[]; error: string | null } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { calls: [], error: 'That file is not valid JSON.' };
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return { calls: [], error: 'Backup file is empty.' };
  }
  const payload = parsed as Partial<BackupPayload>;
  if (payload.app !== 'call-log') {
    return { calls: [], error: 'That file is not a Call Log backup.' };
  }
  if (!Array.isArray(payload.calls)) {
    return { calls: [], error: 'Backup has no calls.' };
  }
  const calls = payload.calls.filter(
    (entry): entry is CallRecord =>
      typeof entry === 'object' && entry !== null && typeof (entry as CallRecord).id === 'string',
  );
  if (calls.length === 0) {
    return { calls: [], error: 'Backup contained no valid calls.' };
  }
  return { calls, error: null };
}

export function downloadBackup(calls: CallRecord[]): void {
  if (typeof document === 'undefined') return;
  const content = backupToJson(calls);
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `call-log-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}