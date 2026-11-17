/**
 * The single colour source for the whole app — Call Analyzer.
 *
 * Rule: no hex/rgba literals anywhere else in src/. Components import semantic
 * tokens from here (bg, surface, text, accent, incoming, outgoing, …).
 *
 * The palette is runtime-swappable: `applyPalette('dark' | 'light')` copies a
 * theme's values into the exported `Colors` object in place. Because every
 * component imports `Colors` by reference, a full subtree remount (keyed on
 * the mode in ThemeProvider) repaints with the new values.
 */

export type ThemeMode = 'dark' | 'light';

type Palette = {
  // Surfaces
  bg: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  overlay: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;

  // Brand / interactive
  accent: string;
  accentPressed: string;
  accentSoft: string;

  // Call directions
  incoming: string;
  outgoing: string;
  missed: string;

  // Status
  success: string;
  warning: string;
  danger: string;

  // Contact avatars — picked deterministically from the contact name/number
  avatar: string[];
};

const DARK: Palette = {
  // Surfaces
  bg: '#0B0C0E',
  surface: '#141619',
  surfaceElevated: '#1C1F23',
  border: '#2A2E34',
  overlay: 'rgba(0, 0, 0, 0.65)',

  // Text
  text: '#F2F4F7',
  textSecondary: '#A3AAB5',
  textMuted: '#6B7280',

  // Brand / interactive
  accent: '#8AB4F8',
  accentPressed: '#6E9BE4',
  accentSoft: '#1F2E45',

  // Call directions
  incoming: '#8AB4F8',
  outgoing: '#B2EE63',
  missed: '#FF8A80',

  // Status
  success: '#7ED492',
  warning: '#F5C563',
  danger: '#F28B82',

  // Contact avatars
  avatar: [
    '#8C7BE8',
    '#4FA3F7',
    '#F2C14E',
    '#F0876B',
    '#5BC6B6',
    '#E37BC0',
    '#9ACD5F',
    '#7F8FA6',
  ],
};

const LIGHT: Palette = {
  // Surfaces
  bg: '#F5F6F8',
  surface: '#FFFFFF',
  surfaceElevated: '#EEF0F4',
  border: '#DDE1E7',
  overlay: 'rgba(0, 0, 0, 0.35)',

  // Text
  text: '#14181D',
  textSecondary: '#4B5563',
  textMuted: '#8A93A0',

  // Brand / interactive
  accent: '#2563EB',
  accentPressed: '#1D4ED8',
  accentSoft: '#DBEAFE',

  // Call directions
  incoming: '#2563EB',
  outgoing: '#3F9142',
  missed: '#DC2626',

  // Status
  success: '#15803D',
  warning: '#B45309',
  danger: '#DC2626',

  // Contact avatars
  avatar: [
    '#6D5BD0',
    '#2F7FDB',
    '#D49A1F',
    '#D96B3F',
    '#2F9E8F',
    '#C15BA5',
    '#6FA832',
    '#5F7188',
  ],
};

const PALETTES: Record<ThemeMode, Palette> = { dark: DARK, light: LIGHT };

/**
 * Mutable live palette. Components import this object and read tokens during
 * render; `applyPalette` overwrites its properties before a remount.
 */
export const Colors: Palette = { ...DARK };

/** Overwrite the live palette with the chosen theme. Call before re-render. */
export function applyPalette(mode: ThemeMode): void {
  const src = PALETTES[mode];
  (Object.keys(Colors) as (keyof Palette)[]).forEach((key) => {
    const value = src[key];
    if (Array.isArray(value)) {
      (Colors as Record<string, unknown>)[key] = [...value];
    } else {
      (Colors as Record<string, unknown>)[key] = value;
    }
  });
}

export function paletteFor(mode: ThemeMode): Palette {
  return PALETTES[mode];
}

export type ColorToken = keyof Palette;
