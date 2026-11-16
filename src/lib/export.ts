import { Platform } from 'react-native';

import type { CallRecord } from '@/types/call';

const CSV_COLUMNS: (keyof CallRecord)[] = [
  'number',
  'name',
  'direction',
  'sim',
  'timestamp',
  'duration',
  'note',
  'tag',
];

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function callsToCsv(calls: CallRecord[]): string {
  const header = CSV_COLUMNS.join(',');
  const rows = calls.map((call) =>
    CSV_COLUMNS.map((column) => escapeCsv(call[column])).join(','),
  );
  return [header, ...rows].join('\r\n');
}

export function callsToJson(calls: CallRecord[]): string {
  return JSON.stringify(calls, null, 2);
}

/** Excel-friendly HTML table saved with an .xls extension. */
export function callsToXls(calls: CallRecord[]): string {
  const header = CSV_COLUMNS.map((column) => `<th>${column}</th>`).join('');
  const rows = calls
    .map(
      (call) =>
        `<tr>${CSV_COLUMNS.map((column) => `<td>${escapeHtml(String(call[column] ?? ''))}</td>`).join('')}</tr>`,
    )
    .join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></body></html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export type ExportFormat = 'csv' | 'json' | 'xls';

export function exportCalls(calls: CallRecord[], format: ExportFormat, filenameBase = 'call-log'): void {
  const now = new Date().toISOString().slice(0, 10);
  const filename = `${filenameBase}-${now}.${format === 'xls' ? 'xls' : format}`;

  let content: string;
  let mime: string;
  if (format === 'csv') {
    content = callsToCsv(calls);
    mime = 'text/csv;charset=utf-8';
  } else if (format === 'json') {
    content = callsToJson(calls);
    mime = 'application/json;charset=utf-8';
  } else {
    content = callsToXls(calls);
    mime = 'application/vnd.ms-excel';
  }

  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    // Native packaging is a separate delivery step; on native the caller handles sharing.
    return;
  }

  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}