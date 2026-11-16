# Call Log

A minimalist call-log companion. Free for everyone — no ads, no paywall.

## What it does

| Tab | Purpose |
| --- | --- |
| Dialer | Call history, grouped by date, with search and call-back |
| Analytics | Totals, incoming/outgoing duration split, frequency over time |
| Calls Usage | Per-contact duration and call counts, filterable by SIM / date / direction |
| Backup | Free Google Drive backup and data export |

Planned features: a reminder that says "It's been a while since you called X" when a
frequent contact has gone quiet, plus a weekly report every Sunday and a monthly report at
month end. See [PHASES.md](PHASES.md) for the build order and current progress.

## Setup

```sh
npm install
npm start              # Expo dev server
npm run web            # open in a browser
npm run typecheck      # tsc --noEmit
npm run lint           # expo lint
```

## Web test build

```sh
npx expo export -p web # emits dist/
npx serve dist         # preview the production build locally
```

`dist/` is a static site (10 static routes) and can be served by any static host. Each
completed phase is published to a clickable test link — see [PHASES.md](PHASES.md).

## Import format (Phase 2)

The Import button on the Dialer tab (web build) accepts `.csv` or `.json`. A header row is
optional for CSV; columns are:

```
number,name,direction,sim,timestamp,duration,note,tag
```

| Column | Values |
| --- | --- |
| direction | incoming / outgoing / missed |
| sim | SIM 1 / SIM 2 |
| timestamp | ISO 8601, or epoch seconds / milliseconds |
| duration | seconds |
| note, tag | optional free text |

```csv
number,name,direction,sim,timestamp,duration,note,tag
+251941505775,Melek,outgoing,SIM 1,2026-11-15T17:38:00,31,,
```

A ready-to-use file is included at `sample-calls.csv`.

JSON is an array of call objects, or `{ "calls": [...] }`, using the keys in `types.ts`.

Importing replaces the current history. Data is stored locally (localStorage on web,
AsyncStorage on native) — nothing is uploaded.

## Architecture

- **Expo Router** file-based routing (TypeScript strict, `@/*` → `src/*`); the bottom tab
  bar lives in `src/app/(tabs)/_layout.tsx`.
- **`src/constants/Colors.ts` is the only place colours are defined** — components use
  semantic tokens (`bg`, `surface`, `text`, `accent`, `incoming`, `outgoing`, …). The app is
  dark-only; there are zero stray hex/rgba literals elsewhere in `src/`.
- `src/constants/theme.ts` holds non-colour tokens (spacing, insets, fonts).
- **`src/components/TablerIcons.tsx`** — Tabler outline icons (MIT) rendered with
  `react-native-svg`. The file is generated from `icons-src/*.svg` by
  `scripts/generate-tabler-icons.mjs` (`npm run generate:icons`). Size convention: 24
  default / 20 compact, stroke 2.
- `src/components/Screen.tsx` / `EmptyState.tsx` — shared screen frame and empty-by-default
  placeholder.
- Static page metadata: `src/constants/meta.ts` + `generateMetadata()` on each route
  (SDK 58 static rendering), with `<Head>` keeping titles in sync during in-app navigation.
- **Empty-by-default: the app ships with zero demo data.**

## Platform note

Reading the device call log on Android requires `READ_CALL_LOG` and a native module. The
phased web test build works with imported call data; native packaging is a separate
delivery step.

## Roadmap

See [PHASES.md](PHASES.md).
