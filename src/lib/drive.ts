import { backupToJson, parseBackup } from '@/lib/backup';
import type { CallRecord } from '@/types/call';

const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';

export type DriveFile = {
  id: string;
  name: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
};

/** Upload a backup to the appDataFolder. Returns the created file id. */
export async function uploadBackup(accessToken: string, calls: CallRecord[]): Promise<string> {
  const content = backupToJson(calls);
  const metadata = {
    name: `call-log-backup-${new Date().toISOString().slice(0, 10)}.json`,
    parents: ['appDataFolder'],
    mimeType: 'application/json',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([content], { type: 'application/json' }));

  const response = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=multipart`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
  const data = (await response.json()) as { id: string };
  return data.id;
}

/** List backups stored in appDataFolder. */
export async function listBackups(accessToken: string): Promise<DriveFile[]> {
  const query = encodeURIComponent("name contains 'call-log-backup' and trashed = false");
  const url = `${DRIVE_FILES_URL}?spaces=appDataFolder&q=${query}&fields=files(id,name,createdTime,modifiedTime,size)&orderBy=modifiedTime desc`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(`List failed: ${response.status}`);
  const data = (await response.json()) as { files: DriveFile[] };
  return data.files ?? [];
}

/** Download a backup file's content. */
export async function downloadBackupFile(accessToken: string, fileId: string): Promise<string> {
  const response = await fetch(`${DRIVE_FILES_URL}/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);
  return response.text();
}

/** Restore calls from a Drive backup file. */
export async function restoreFromDrive(
  accessToken: string,
  fileId: string,
): Promise<{ calls: CallRecord[]; error: string | null }> {
  try {
    const text = await downloadBackupFile(accessToken, fileId);
    return parseBackup(text);
  } catch (err) {
    return { calls: [], error: String(err) };
  }
}