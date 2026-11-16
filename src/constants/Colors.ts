/**
 * The single colour source for the whole app — Call Log is a dark-only app.
 *
 * Rule: no hex/rgba literals anywhere else in src/. Components import semantic
 * tokens from here (bg, surface, text, accent, incoming, outgoing, …).
 */
export const Colors = {
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

  // Contact avatars — picked deterministically from the contact name/number
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
} as const;

export type ColorToken = keyof typeof Colors;
