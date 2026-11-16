/**
 * Tabler Icons — outline set. MIT License © Tabler (https://tabler.io/icons).
 *
 * GENERATED FILE — do not edit by hand.
 * Regenerate from icons-src/*.svg:  node scripts/generate-tabler-icons.mjs
 *
 * Size convention: 24 default / 20 compact, stroke 2 (Tabler default).
 */
import { createElement, type ElementType } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

import { Colors } from '@/constants/Colors';

export const ICON_SIZE = 24;
export const ICON_SIZE_COMPACT = 20;
export const ICON_STROKE = 2;

export type TablerIconName =
  | 'alert-circle' | 'arrow-down-left' | 'arrow-left' | 'arrow-up-right' | 'bell-ringing' | 'bell' | 'calendar-month' | 'calendar-week' | 'calendar' | 'chart-bar' | 'chart-donut' | 'chart-line' | 'chart-pie' | 'check' | 'chevron-down' | 'chevron-right' | 'circle-check' | 'clock' | 'cloud-download' | 'cloud-off' | 'cloud-upload' | 'cloud' | 'database' | 'device-floppy' | 'dots-vertical' | 'download' | 'edit' | 'external-link' | 'file-spreadsheet' | 'filter' | 'history' | 'inbox' | 'info-circle' | 'menu-2' | 'menu' | 'note' | 'phone-call' | 'phone-incoming' | 'phone-off' | 'phone-outgoing' | 'phone' | 'plus' | 'refresh' | 'report-analytics' | 'search' | 'settings' | 'share' | 'sort-ascending' | 'star' | 'tag' | 'trash' | 'trending-up' | 'upload' | 'user' | 'users' | 'wifi' | 'x';

type SvgElement = {
  tag: 'path' | 'circle' | 'line' | 'polyline' | 'polygon' | 'rect' | 'ellipse';
  attrs: Record<string, string | number>;
};

const TAGS = {
  path: Path,
  circle: Circle,
  line: Line,
  polyline: Polyline,
  polygon: Polygon,
  rect: Rect,
  ellipse: Ellipse,
} as const;

const ICONS: Record<TablerIconName, readonly SvgElement[]> = {
  'alert-circle': [
    { tag: 'path', attrs: { d: "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" } },
    { tag: 'path', attrs: { d: "M12 8v4" } },
    { tag: 'path', attrs: { d: "M12 16h.01" } },
  ],
  'arrow-down-left': [
    { tag: 'path', attrs: { d: "M17 7l-10 10" } },
    { tag: 'path', attrs: { d: "M16 17l-9 0l0 -9" } },
  ],
  'arrow-left': [
    { tag: 'path', attrs: { d: "M5 12l14 0" } },
    { tag: 'path', attrs: { d: "M5 12l6 6" } },
    { tag: 'path', attrs: { d: "M5 12l6 -6" } },
  ],
  'arrow-up-right': [
    { tag: 'path', attrs: { d: "M17 7l-10 10" } },
    { tag: 'path', attrs: { d: "M8 7l9 0l0 9" } },
  ],
  'bell-ringing': [
    { tag: 'path', attrs: { d: "M10 5a2 2 0 0 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" } },
    { tag: 'path', attrs: { d: "M9 17v1a3 3 0 0 0 6 0v-1" } },
    { tag: 'path', attrs: { d: "M21 6.727a11.05 11.05 0 0 0 -2.794 -3.727" } },
    { tag: 'path', attrs: { d: "M3 6.727a11.05 11.05 0 0 1 2.792 -3.727" } },
  ],
  'bell': [
    { tag: 'path', attrs: { d: "M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" } },
    { tag: 'path', attrs: { d: "M9 17v1a3 3 0 0 0 6 0v-1" } },
  ],
  'calendar-month': [
    { tag: 'path', attrs: { d: "M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12" } },
    { tag: 'path', attrs: { d: "M16 3v4" } },
    { tag: 'path', attrs: { d: "M8 3v4" } },
    { tag: 'path', attrs: { d: "M4 11h16" } },
    { tag: 'path', attrs: { d: "M8 14v4" } },
    { tag: 'path', attrs: { d: "M12 14v4" } },
    { tag: 'path', attrs: { d: "M16 14v4" } },
  ],
  'calendar-week': [
    { tag: 'path', attrs: { d: "M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12" } },
    { tag: 'path', attrs: { d: "M16 3v4" } },
    { tag: 'path', attrs: { d: "M8 3v4" } },
    { tag: 'path', attrs: { d: "M4 11h16" } },
    { tag: 'path', attrs: { d: "M7 14h.013" } },
    { tag: 'path', attrs: { d: "M10.01 14h.005" } },
    { tag: 'path', attrs: { d: "M13.01 14h.005" } },
    { tag: 'path', attrs: { d: "M16.015 14h.005" } },
    { tag: 'path', attrs: { d: "M13.015 17h.005" } },
    { tag: 'path', attrs: { d: "M7.01 17h.005" } },
    { tag: 'path', attrs: { d: "M10.01 17h.005" } },
  ],
  'calendar': [
    { tag: 'path', attrs: { d: "M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12" } },
    { tag: 'path', attrs: { d: "M16 3v4" } },
    { tag: 'path', attrs: { d: "M8 3v4" } },
    { tag: 'path', attrs: { d: "M4 11h16" } },
  ],
  'chart-bar': [
    { tag: 'path', attrs: { d: "M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -6" } },
    { tag: 'path', attrs: { d: "M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -10" } },
    { tag: 'path', attrs: { d: "M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -14" } },
    { tag: 'path', attrs: { d: "M4 20h14" } },
  ],
  'chart-donut': [
    { tag: 'path', attrs: { d: "M10 3.2a9 9 0 1 0 10.8 10.8a1 1 0 0 0 -1 -1h-3.8a4.1 4.1 0 1 1 -5 -5v-4a.9 .9 0 0 0 -1 -.8" } },
    { tag: 'path', attrs: { d: "M15 3.5a9 9 0 0 1 5.5 5.5h-4.5a9 9 0 0 0 -1 -1v-4.5" } },
  ],
  'chart-line': [
    { tag: 'path', attrs: { d: "M4 19l16 0" } },
    { tag: 'path', attrs: { d: "M4 15l4 -6l4 2l4 -5l4 4" } },
  ],
  'chart-pie': [
    { tag: 'path', attrs: { d: "M10 3.2a9 9 0 1 0 10.8 10.8a1 1 0 0 0 -1 -1h-6.8a2 2 0 0 1 -2 -2v-7a.9 .9 0 0 0 -1 -.8" } },
    { tag: 'path', attrs: { d: "M15 3.5a9 9 0 0 1 5.5 5.5h-4.5a1 1 0 0 1 -1 -1v-4.5" } },
  ],
  'check': [
    { tag: 'path', attrs: { d: "M5 12l5 5l10 -10" } },
  ],
  'chevron-down': [
    { tag: 'path', attrs: { d: "M6 9l6 6l6 -6" } },
  ],
  'chevron-right': [
    { tag: 'path', attrs: { d: "M9 6l6 6l-6 6" } },
  ],
  'circle-check': [
    { tag: 'path', attrs: { d: "M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" } },
    { tag: 'path', attrs: { d: "M9 12l2 2l4 -4" } },
  ],
  'clock': [
    { tag: 'path', attrs: { d: "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" } },
    { tag: 'path', attrs: { d: "M12 7v5l3 3" } },
  ],
  'cloud-download': [
    { tag: 'path', attrs: { d: "M19 18a3.5 3.5 0 0 0 0 -7h-1a5 4.5 0 0 0 -11 -2a4.6 4.4 0 0 0 -2.1 8.4" } },
    { tag: 'path', attrs: { d: "M12 13l0 9" } },
    { tag: 'path', attrs: { d: "M9 19l3 3l3 -3" } },
  ],
  'cloud-off': [
    { tag: 'path', attrs: { d: "M9.58 5.548c.24 -.11 .492 -.207 .752 -.286c1.88 -.572 3.956 -.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769h.99c1.913 0 3.464 1.56 3.464 3.486c0 .957 -.383 1.824 -1.003 2.454m-2.997 1.033h-11.343c-2.572 -.004 -4.657 -2.011 -4.657 -4.487c0 -2.475 2.085 -4.482 4.657 -4.482c.13 -.582 .37 -1.128 .7 -1.62" } },
    { tag: 'path', attrs: { d: "M3 3l18 18" } },
  ],
  'cloud-upload': [
    { tag: 'path', attrs: { d: "M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-1" } },
    { tag: 'path', attrs: { d: "M9 15l3 -3l3 3" } },
    { tag: 'path', attrs: { d: "M12 12l0 9" } },
  ],
  'cloud': [
    { tag: 'path', attrs: { d: "M6.657 18c-2.572 0 -4.657 -2.007 -4.657 -4.483c0 -2.475 2.085 -4.482 4.657 -4.482c.393 -1.762 1.794 -3.2 3.675 -3.773c1.88 -.572 3.956 -.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769h.99c1.913 0 3.464 1.56 3.464 3.486c0 1.927 -1.551 3.487 -3.465 3.487h-11.878" } },
  ],
  'database': [
    { tag: 'path', attrs: { d: "M4 6a8 3 0 1 0 16 0a8 3 0 1 0 -16 0" } },
    { tag: 'path', attrs: { d: "M4 6v6a8 3 0 0 0 16 0v-6" } },
    { tag: 'path', attrs: { d: "M4 12v6a8 3 0 0 0 16 0v-6" } },
  ],
  'device-floppy': [
    { tag: 'path', attrs: { d: "M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2" } },
    { tag: 'path', attrs: { d: "M10 14a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" } },
    { tag: 'path', attrs: { d: "M14 4l0 4l-6 0l0 -4" } },
  ],
  'dots-vertical': [
    { tag: 'path', attrs: { d: "M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" } },
    { tag: 'path', attrs: { d: "M11 19a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" } },
    { tag: 'path', attrs: { d: "M11 5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" } },
  ],
  'download': [
    { tag: 'path', attrs: { d: "M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" } },
    { tag: 'path', attrs: { d: "M7 11l5 5l5 -5" } },
    { tag: 'path', attrs: { d: "M12 4l0 12" } },
  ],
  'edit': [
    { tag: 'path', attrs: { d: "M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" } },
    { tag: 'path', attrs: { d: "M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" } },
    { tag: 'path', attrs: { d: "M16 5l3 3" } },
  ],
  'external-link': [
    { tag: 'path', attrs: { d: "M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" } },
    { tag: 'path', attrs: { d: "M11 13l9 -9" } },
    { tag: 'path', attrs: { d: "M15 4h5v5" } },
  ],
  'file-spreadsheet': [
    { tag: 'path', attrs: { d: "M14 3v4a1 1 0 0 0 1 1h4" } },
    { tag: 'path', attrs: { d: "M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" } },
    { tag: 'path', attrs: { d: "M8 11h8v7h-8l0 -7" } },
    { tag: 'path', attrs: { d: "M8 15h8" } },
    { tag: 'path', attrs: { d: "M11 11v7" } },
  ],
  'filter': [
    { tag: 'path', attrs: { d: "M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227" } },
  ],
  'history': [
    { tag: 'path', attrs: { d: "M12 8l0 4l2 2" } },
    { tag: 'path', attrs: { d: "M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" } },
  ],
  'inbox': [
    { tag: 'path', attrs: { d: "M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12" } },
    { tag: 'path', attrs: { d: "M4 13h3l3 3h4l3 -3h3" } },
  ],
  'info-circle': [
    { tag: 'path', attrs: { d: "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" } },
    { tag: 'path', attrs: { d: "M12 9h.01" } },
    { tag: 'path', attrs: { d: "M11 12h1v4h1" } },
  ],
  'menu-2': [
    { tag: 'path', attrs: { d: "M4 6l16 0" } },
    { tag: 'path', attrs: { d: "M4 12l16 0" } },
    { tag: 'path', attrs: { d: "M4 18l16 0" } },
  ],
  'menu': [
    { tag: 'path', attrs: { d: "M4 8l16 0" } },
    { tag: 'path', attrs: { d: "M4 16l16 0" } },
  ],
  'note': [
    { tag: 'path', attrs: { d: "M13 20l7 -7" } },
    { tag: 'path', attrs: { d: "M13 20v-6a1 1 0 0 1 1 -1h6v-7a2 2 0 0 0 -2 -2h-12a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7" } },
  ],
  'phone-call': [
    { tag: 'path', attrs: { d: "M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" } },
    { tag: 'path', attrs: { d: "M15 7a2 2 0 0 1 2 2" } },
    { tag: 'path', attrs: { d: "M15 3a6 6 0 0 1 6 6" } },
  ],
  'phone-incoming': [
    { tag: 'path', attrs: { d: "M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" } },
    { tag: 'path', attrs: { d: "M15 9l5 -5" } },
    { tag: 'path', attrs: { d: "M15 5l0 4l4 0" } },
  ],
  'phone-off': [
    { tag: 'path', attrs: { d: "M3 21l18 -18" } },
    { tag: 'path', attrs: { d: "M5.831 14.161a15.946 15.946 0 0 1 -2.831 -8.161a2 2 0 0 1 2 -2h4l2 5l-2.5 1.5c.108 .22 .223 .435 .345 .645m1.751 2.277c.843 .84 1.822 1.544 2.904 2.078l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a15.963 15.963 0 0 1 -10.344 -4.657" } },
  ],
  'phone-outgoing': [
    { tag: 'path', attrs: { d: "M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2c-8.072 -.49 -14.51 -6.928 -15 -15a2 2 0 0 1 2 -2" } },
    { tag: 'path', attrs: { d: "M15 5h6" } },
    { tag: 'path', attrs: { d: "M18.5 7.5l2.5 -2.5l-2.5 -2.5" } },
  ],
  'phone': [
    { tag: 'path', attrs: { d: "M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" } },
  ],
  'plus': [
    { tag: 'path', attrs: { d: "M12 5l0 14" } },
    { tag: 'path', attrs: { d: "M5 12l14 0" } },
  ],
  'refresh': [
    { tag: 'path', attrs: { d: "M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" } },
    { tag: 'path', attrs: { d: "M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" } },
  ],
  'report-analytics': [
    { tag: 'path', attrs: { d: "M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" } },
    { tag: 'path', attrs: { d: "M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2" } },
    { tag: 'path', attrs: { d: "M9 17v-5" } },
    { tag: 'path', attrs: { d: "M12 17v-1" } },
    { tag: 'path', attrs: { d: "M15 17v-3" } },
  ],
  'search': [
    { tag: 'path', attrs: { d: "M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" } },
    { tag: 'path', attrs: { d: "M21 21l-6 -6" } },
  ],
  'settings': [
    { tag: 'path', attrs: { d: "M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065" } },
    { tag: 'path', attrs: { d: "M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" } },
  ],
  'share': [
    { tag: 'path', attrs: { d: "M3 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" } },
    { tag: 'path', attrs: { d: "M15 6a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" } },
    { tag: 'path', attrs: { d: "M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" } },
    { tag: 'path', attrs: { d: "M8.7 10.7l6.6 -3.4" } },
    { tag: 'path', attrs: { d: "M8.7 13.3l6.6 3.4" } },
  ],
  'sort-ascending': [
    { tag: 'path', attrs: { d: "M4 6l7 0" } },
    { tag: 'path', attrs: { d: "M4 12l7 0" } },
    { tag: 'path', attrs: { d: "M4 18l9 0" } },
    { tag: 'path', attrs: { d: "M15 9l3 -3l3 3" } },
    { tag: 'path', attrs: { d: "M18 6l0 12" } },
  ],
  'star': [
    { tag: 'path', attrs: { d: "M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245" } },
  ],
  'tag': [
    { tag: 'path', attrs: { d: "M6.5 7.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" } },
    { tag: 'path', attrs: { d: "M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3" } },
  ],
  'trash': [
    { tag: 'path', attrs: { d: "M4 7l16 0" } },
    { tag: 'path', attrs: { d: "M10 11l0 6" } },
    { tag: 'path', attrs: { d: "M14 11l0 6" } },
    { tag: 'path', attrs: { d: "M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" } },
    { tag: 'path', attrs: { d: "M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" } },
  ],
  'trending-up': [
    { tag: 'path', attrs: { d: "M3 17l6 -6l4 4l8 -8" } },
    { tag: 'path', attrs: { d: "M14 7l7 0l0 7" } },
  ],
  'upload': [
    { tag: 'path', attrs: { d: "M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" } },
    { tag: 'path', attrs: { d: "M7 9l5 -5l5 5" } },
    { tag: 'path', attrs: { d: "M12 4l0 12" } },
  ],
  'user': [
    { tag: 'path', attrs: { d: "M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" } },
    { tag: 'path', attrs: { d: "M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" } },
  ],
  'users': [
    { tag: 'path', attrs: { d: "M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" } },
    { tag: 'path', attrs: { d: "M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" } },
    { tag: 'path', attrs: { d: "M16 3.13a4 4 0 0 1 0 7.75" } },
    { tag: 'path', attrs: { d: "M21 21v-2a4 4 0 0 0 -3 -3.85" } },
  ],
  'wifi': [
    { tag: 'path', attrs: { d: "M12 18l.01 0" } },
    { tag: 'path', attrs: { d: "M9.172 15.172a4 4 0 0 1 5.656 0" } },
    { tag: 'path', attrs: { d: "M6.343 12.343a8 8 0 0 1 11.314 0" } },
    { tag: 'path', attrs: { d: "M3.515 9.515c4.686 -4.687 12.284 -4.687 17 0" } },
  ],
  'x': [
    { tag: 'path', attrs: { d: "M18 6l-12 12" } },
    { tag: 'path', attrs: { d: "M6 6l12 12" } },
  ],
};

export type TablerIconProps = {
  name: TablerIconName;
  /** 24 default / 20 compact. */
  size?: number;
  color?: string;
  /** Tabler uses stroke 2 at size 24. */
  strokeWidth?: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function TablerIcon({
  name,
  size = ICON_SIZE,
  color = Colors.text,
  strokeWidth = ICON_STROKE,
  accessibilityLabel,
  style,
}: TablerIconProps) {
  const elements = ICONS[name];
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
      accessibilityLabel={accessibilityLabel}
      aria-hidden={accessibilityLabel === undefined ? true : undefined}>
      {elements.map((el, index) =>
        createElement(TAGS[el.tag] as ElementType, {
          key: index,
          stroke: color,
          strokeWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          fill: 'none',
          ...el.attrs,
        }),
      )}
    </Svg>
  );
}
