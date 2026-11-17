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
  bg: '#041240',
  surface: '#08246B',
  surfaceElevated: '#0C2D85',
  border: '#163B96',
  overlay: 'rgba(0, 0, 0, 0.65)',

  // Text
  text: '#FFFFFF',
  textSecondary: '#B0C4DE',
  textMuted: '#7A8BA8',

  // Brand / interactive
  accent: '#FF6A00',
  accentPressed: '#E65F00',
  accentSoft: 'rgba(255, 106, 0, 0.15)',

  // Call directions
  incoming: '#4FA3F7',
  outgoing: '#FF6A00',
  missed: '#FF4D4D',

  // Status
  success: '#7ED492',
  warning: '#FF6A00',
  danger: '#F28B82',

  // Contact avatars
  avatar: [
    '#08246B',
    '#FF6A00',
    '#4FA3F7',
    '#F2C14E',
    '#5BC6B6',
    '#E37BC0',
    '#9ACD5F',
    '#7F8FA6',
  ],
};

const LIGHT: Palette = {
  // Surfaces
  bg: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceElevated: '#EEF2F6',
  border: '#DDE4EA',
  overlay: 'rgba(8, 36, 107, 0.35)',

  // Text
  text: '#08246B',
  textSecondary: '#4B5563',
  textMuted: '#8A93A0',

  // Brand / interactive
  accent: '#FF6A00',
  accentPressed: '#E65F00',
  accentSoft: '#FFF0E6',

  // Call directions
  incoming: '#08246B',
  outgoing: '#FF6A00',
  missed: '#DC2626',

  // Status
  success: '#15803D',
  warning: '#FF6A00',
  danger: '#DC2626',

  // Contact avatars
  avatar: [
    '#08246B',
    '#FF6A00',
    '#2F7FDB',
    '#D49A1F',
    '#D96B3F',
    '#2F9E8F',
    '#C15BA5',
    '#6FA832',
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
