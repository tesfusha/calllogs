import { parseCsv } from '@/lib/csv';
import type { CallDirection, CallRecord, SimSlot } from '@/types/call';

export type ImportResult = {
  /** Rows that became valid records, ready to merge into the store. */
  calls: CallRecord[];
  /** Rows that could not be understood. */
  invalid: number;
  /** Human-readable reasons, capped so a bad file cannot flood the UI. */
  problems: string[];
};

const MAX_PROBLEMS = 5;

type Column =
  | 'number'
  | 'name'
  | 'direction'
  | 'sim'
  | 'timestamp'
  | 'duration'
  | 'note'
  | 'tag';

/** Header spellings we accept, normalised to lowercase alphanumerics. */
const COLUMN_ALIASES: Record<Column, string[]> = {
  number: ['number', 'phone', 'phonenumber', 'mobile', 'msisdn', 'to', 'address', 'callee'],
  name: ['name', 'contact', 'contactname', 'caller', 'callername', 'displayname'],
  direction: ['direction', 'type', 'calltype', 'inout'],
  sim: ['sim', 'slot', 'simslot', 'subscription'],
  timestamp: ['timestamp', 'date', 'datetime', 'time', 'calledat', 'createdat'],
  duration: ['duration', 'durationseconds', 'seconds', 'length'],
  note: ['note', 'notes', 'comment', 'comments'],
  tag: ['tag', 'tags', 'label', 'category'],
};

const normaliseHeader = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

function mapColumns(header: string[]): Partial<Record<Column, number>> {
  const columns: Partial<Record<Column, number>> = {};
  header.forEach((raw, index) => {
    const key = normaliseHeader(raw);
    (Object.keys(COLUMN_ALIASES) as Column[]).forEach((column) => {
      if (columns[column] === undefined && COLUMN_ALIASES[column].includes(key)) {
        columns[column] = index;
      }
    });
  });
  return columns;
}

/**
 * Excel rewrites long digit strings as scientific notation ("2.51912E+11")
 * when a CSV is saved from a spreadsheet — expand it so rows don't display
 * as exponents. Precision already lost by Excel cannot be recovered here.
 */
function normaliseNumber(value: string): string {
  const trimmed = value.trim();
  if (!/^\d+(?:\.\d+)?[eE][+-]?\d+$/.test(trimmed)) return trimmed;
  const expanded = Number(trimmed);
  return Number.isFinite(expanded) ? expanded.toFixed(0) : trimmed;
}

function parseDirection(value: string): CallDirection | null {
  const key = value.trim().toLowerCase();
  if (key === 'missed' || key === 'miss') return 'missed';
  if (key === 'outgoing' || key === 'out' || key === 'placed' || key === 'dialed') {
    return 'outgoing';
  }
  if (key === 'incoming' || key === 'in' || key === 'received') return 'incoming';
  return null;
}

function parseSim(value: string): SimSlot {
  const digit = value.match(/\d/);
  if (!digit) return null;
  if (digit[0] === '1') return 'SIM 1';
  if (digit[0] === '2') return 'SIM 2';
  return null;
}

/** Accepts epoch seconds, epoch milliseconds, or anything `Date.parse` reads. */
function parseTimestamp(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) {
    const numeric = Number(trimmed);
    if (numeric <= 0 || numeric > 1e14) return null;
    return numeric < 1e12 ? numeric * 1000 : numeric;
  }
  const parsed = Date.parse(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

/** Seconds ("31"), or clock form ("1:05" / "1:02:05"). */
function parseDuration(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':').map((part) => Number(part.trim()));
    if (parts.some((part) => !Number.isFinite(part) || part < 0)) return null;
    return Math.round(parts.reduce((total, part) => total * 60 + part, 0));
  }
  const seconds = Number(trimmed);
  return Number.isFinite(seconds) && seconds >= 0 ? Math.round(seconds) : null;
}

function fnv1a(input: string, seed: number): number {
  let hash = seed >>> 0;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** Stable id from call content — re-importing a file de-duplicates itself. */
export function makeCallId(call: {
  number: string;
  timestamp: number;
  direction: CallDirection;
  duration: number;
}): string {
  const raw = `${call.number.trim()}|${call.timestamp}|${call.direction}|${call.duration}`;
  return `c${fnv1a(raw, 0x811c9dc5).toString(16)}${fnv1a(raw, 0x9e3779b9).toString(16)}`;
}

type Table = { header: string[]; rows: string[][] };

/** JSON arrives as an array of objects, or `{ "calls": [...] }`. */
function tableFromJson(text: string): Table | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  const list = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && Array.isArray((parsed as { calls?: unknown[] }).calls)
      ? (parsed as { calls: unknown[] }).calls
      : null;
  if (!list) return null;

  const objects = list.filter(
    (entry): entry is Record<string, unknown> =>
      typeof entry === 'object' && entry !== null && !Array.isArray(entry),
  );
  const header: string[] = [];
  objects.forEach((entry) => {
    Object.keys(entry).forEach((key) => {
      if (!header.includes(key)) header.push(key);
    });
  });
  if (header.length === 0) return null;

  const rows = objects.map((entry) =>
    header.map((key) => {
      const value = entry[key];
      return value === undefined || value === null ? '' : String(value);
    }),
  );
  return { header, rows };
}

/**
 * Turn an uploaded CSV or JSON export into `CallRecord`s.
 * Column names are matched leniently (phone/msisdn/callnumber all work) so
 * exports from different dialers and Google Voice all land in one shape.
 */
export function parseCallImport(text: string, filename = ''): ImportResult {
  const source = text.replace(/^\uFEFF/, '').trim();
  if (!source) {
    return { calls: [], invalid: 0, problems: ['That file is empty.'] };
  }

  const looksJson =
    filename.toLowerCase().endsWith('.json') ||
    source.startsWith('[') ||
    source.startsWith('{');

  let table: Table | null;
  if (looksJson) {
    table = tableFromJson(source);
    if (!table) {
      return { calls: [], invalid: 0, problems: ['Could not read that JSON file.'] };
    }
  } else {
    const rows = parseCsv(source);
    if (rows.length < 2) {
      return {
        calls: [],
        invalid: 0,
        problems: ['That CSV has no data rows below its header.'],
      };
    }
    table = { header: rows[0], rows: rows.slice(1) };
  }

  const columns = mapColumns(table.header);
  if (columns.number === undefined) {
    return {
      calls: [],
      invalid: table.rows.length,
      problems: ['No phone number column found — expected “number”, “phone” or similar.'],
    };
  }

  const calls: CallRecord[] = [];
  const problems: string[] = [];
  let invalid = 0;

  const read = (row: string[], column: Column): string => {
    const index = columns[column];
    return index === undefined ? '' : (row[index] ?? '').trim();
  };

  table.rows.forEach((row, rowIndex) => {
    const number = normaliseNumber(read(row, 'number'));
    if (!number) {
      invalid += 1;
      if (problems.length < MAX_PROBLEMS) {
        problems.push(`Row ${rowIndex + 2}: missing phone number.`);
      }
      return;
    }

    const timestamp = parseTimestamp(read(row, 'timestamp'));
    if (timestamp === null) {
      invalid += 1;
      if (problems.length < MAX_PROBLEMS) {
        problems.push(`Row ${rowIndex + 2}: unreadable date “${read(row, 'timestamp')}”.`);
      }
      return;
    }

    const duration = parseDuration(read(row, 'duration'));
    if (duration === null) {
      invalid += 1;
      if (problems.length < MAX_PROBLEMS) {
        problems.push(`Row ${rowIndex + 2}: unreadable duration “${read(row, 'duration')}”.`);
      }
      return;
    }

    const directionValue = read(row, 'direction');
    const direction = parseDirection(directionValue) ?? 'outgoing';
    const name = read(row, 'name') || null;
    const note = read(row, 'note') || null;
    const tag = read(row, 'tag') || null;

    calls.push({
      id: makeCallId({ number, timestamp, direction, duration }),
      number,
      name,
      direction,
      sim: parseSim(read(row, 'sim')),
      timestamp,
      duration,
      note,
      tag,
    });
  });

  if (problems.length > 0 && invalid > problems.length) {
    problems.push(`…and ${invalid - problems.length} more skipped rows.`);
  }

  return { calls, invalid, problems };
}
