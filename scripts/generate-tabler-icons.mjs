/**
 * Generates src/components/TablerIcons.tsx from icons-src/*.svg (Tabler Icons, outline set, MIT).
 *
 * Usage: node scripts/generate-tabler-icons.mjs
 *
 * The generated file stores raw SVG element data and renders it with react-native-svg,
 * so icon geometry is always exactly what ships in the official Tabler package.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'icons-src');
const outFile = join(root, 'src', 'components', 'TablerIcons.tsx');

/** SVG element tags Tabler uses in the outline set. */
const ALLOWED_TAGS = new Set(['path', 'circle', 'line', 'polyline', 'polygon', 'rect', 'ellipse']);

const ELEMENT_RE = /<([a-zA-Z]+)((?:\s+[\w:-]+\s*=\s*"[^"]*")*)\s*\/>/g;
const ATTR_RE = /([\w:-]+)\s*=\s*"([^"]*)"/g;
const NUMERIC_RE = /^-?\d+(\.\d+)?$/;

const toCamel = (key) => key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

function parseAttrs(raw) {
  const attrs = {};
  let m;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(raw)) !== null) {
    const key = toCamel(m[1]);
    if (key === 'class' || key === 'xmlns') continue; // render-time props replace these
    const value = NUMERIC_RE.test(m[2]) ? Number(m[2]) : m[2];
    attrs[key] = value;
  }
  return attrs;
}

const files = readdirSync(srcDir).filter((f) => f.endsWith('.svg')).sort();
if (files.length === 0) {
  console.error(`No SVG files found in ${srcDir}`);
  process.exit(1);
}

const icons = [];
const problems = [];

for (const file of files) {
  const name = file.replace(/\.svg$/, '');
  const svg = readFileSync(join(srcDir, file), 'utf8');
  const inner = svg
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .trim();

  const elements = [];
  let consumed = inner;
  let m;
  ELEMENT_RE.lastIndex = 0;
  while ((m = ELEMENT_RE.exec(inner)) !== null) {
    const tag = m[1].toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      problems.push(`${name}: unsupported element <${tag}>`);
      continue;
    }
    const attrs = parseAttrs(m[2]);
    consumed = consumed.replace(m[0], '');
    // Tabler ships a full-canvas bounding box on every icon; it is not visible and not needed.
    if (tag === 'path' && attrs.d === 'M0 0h24v24H0z') continue;
    elements.push({ tag, attrs });
  }

  if (/<[a-zA-Z]/.test(consumed)) {
    problems.push(`${name}: unparsed markup remains (element is not self-closing?)`);
  }
  if (elements.length === 0) {
    problems.push(`${name}: no drawable elements`);
    continue;
  }
  icons.push({ name, elements });
}

if (problems.length > 0) {
  console.error('Problems:\n  ' + problems.join('\n  '));
  process.exit(1);
}

const iconNames = icons.map((i) => `'${i.name}'`).join(' | ');

const body = icons
  .map(({ name, elements }) => {
    const elems = elements
      .map((el) => {
        const attrs = Object.entries(el.attrs)
          .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
          .join(', ');
        return `    { tag: '${el.tag}', attrs: { ${attrs} } },`;
      })
      .join('\n');
    return `  '${name}': [\n${elems}\n  ],`;
  })
  .join('\n');

const output = `/**
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
  | ${iconNames};

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
${body}
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
`;

writeFileSync(outFile, output, 'utf8');
console.log(`Wrote ${outFile} (${icons.length} icons).`);
