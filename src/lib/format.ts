import { Colors } from '@/constants/Colors';

const pad2 = (value: number) => (value < 10 ? `0${value}` : String(value));

/** 31 → "0:31", 293 → "4:53", 3725 → "1:02:05". Zero/invalid → "—". */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '—';
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours > 0
    ? `${hours}:${pad2(minutes)}:${pad2(secs)}`
    : `${minutes}:${pad2(secs)}`;
}

/** "5:38 PM" — the time column of every call row. */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** "Tue, Nov 15, 5:38 PM" — used in the call detail sheet. */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const startOfDay = (value: Date) => {
  const copy = new Date(value);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

/** Local calendar day, e.g. "2026-11-15" — the grouping key. */
export function dayKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/**
 * Section header text: Today / Yesterday / weekday / date.
 * Comparing local midnight boundaries keeps this correct across DST shifts.
 */
export function dayLabel(timestamp: number, now: Date = new Date()): string {
  const date = new Date(timestamp);
  const days = Math.round(
    (startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000,
  );
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString(undefined, { weekday: 'long' });
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  }
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Two-letter avatar label. A saved name wins ("Ma Mamy" → "MM"); an unnamed
 * number falls back to its last two digits so rows stay recognisable.
 */
export function initials(name: string | null, number: string): string {
  const trimmed = name?.trim();
  if (!trimmed) {
    const digits = number.replace(/\D/g, '');
    return digits.length >= 2 ? digits.slice(-2) : '#';
  }
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/** Deterministic avatar colour — the same contact always gets the same hue. */
export function avatarColor(seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (Math.imul(hash, 31) + seed.charCodeAt(index)) >>> 0;
  }
  return Colors.avatar[hash % Colors.avatar.length];
}
