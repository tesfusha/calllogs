# Call Log — Phased Build Plan

Minimalist call-log companion. Free for everyone.

## Scope (from the brief)

- Simple, minimalist dark UI with four tabs: Dialer / Analytics / Calls Usage / Backup
- Free Google Drive backup and data export — no paywall
- Call-back reminder: "It's been a while since you called X" — fires when a contact who
  used to call frequently has gone quiet, judged against that contact's own history
- Weekly analysis report every Sunday, and a monthly report at month end

## Phases

| Phase | Theme | Outcome |
| --- | --- | --- |
| 1 | Foundation & Design System | Scaffold, one dark colour source, 4-tab shell, empty states, docs, published test link |
| 2 | Call Log & Dialer | Call record model, local persistence, import, date-grouped history, search, call-back action |
| 3 | Analytics & Calls Usage | Totals, incoming/outgoing duration split, frequency chart, time ranges; SIM / date / direction usage bars |
| 4 | Reminders & Reports | Quiet-period detection, "been a while" notification, Sunday weekly report, month-end monthly report |
| 5 | Backup & Export (free) | Google Drive backup, CSV / XLS / JSON export, backup settings (account, schedule, Wi-Fi only) |
| 6 | Native Packaging | EAS builds, device call-log import (READ_CALL_LOG), real Google Drive OAuth backup |

Dependency order: 1 → 2 → 3 → 4 → 5. Reports consume the metrics built in Phase 3;
backup/export serialises the Phase 2 data model.

Each phase ends with a published, clickable test link and a checked-off list here.
**No phase starts before the previous one is confirmed.**

---

## Phase 1 — Foundation & Design System

Theme: "Clean, dark, consistent."

### Checklist

- [x] Expo Router + TypeScript scaffold (strict, `@/` path alias)
- [x] `src/constants/Colors.ts` — one semantic colour source, zero stray hex/rgba literals in `src/`
- [x] Tabler outline icons — `src/components/TablerIcons.tsx` (generated, MIT), one size convention (24 default / 20 compact), stroke 2
- [x] Four-tab shell: Dialer / Analytics / Calls Usage / Backup (`src/app/(tabs)/_layout.tsx`)
- [x] Empty-by-default state on every tab — no demo data
- [x] README.md + this roadmap
- [x] Web export verified (`npx expo export -p web`, 10 static routes)
- [x] Published test link — https://call-log-tesfu-tilahun-s-projects.vercel.app/ (GitHub + Vercel, free)

### Exit criteria

App boots with zero data, all four tabs navigable, one colour source, no stray hex
literals, test link opens on any device.

### Verification (2026-11-16)

- `npx tsc --noEmit` → clean; `npx expo lint` → clean
- `npx expo export -p web` → 10 static routes (`/`, `/analytics`, `/usage`, `/backup`,
  `/_sitemap`, `/+not-found`, `/(tabs)`, `/(tabs)/analytics`, `/(tabs)/usage`, `/(tabs)/backup`)
- Local check of the production build (`npx serve dist`): all four tabs render their
  empty states, SPA tab navigation works without reloads, per-route `<title>` tags present
  (`Dialer · Call Log`, …), zero console errors
- Colour audit: the only hex/rgba literals in `src/` are inside `constants/Colors.ts`

---

## Phase 2 — Call Log & Dialer

Theme: "History you can actually use."

- [x] `CallRecord` model: id, number, name, direction, SIM, timestamp, duration, note/tag
- [x] Local persistence (hydrate-safe, no seed data; `@react-native-async-storage/async-storage`)
- [x] Import call data (CSV / JSON) — header aliases, Excel scientific-notation normalised, content-derived ids de-duplicate
- [x] Dialer: date-grouped history, contact initials/avatars, direction arrows, duration, SIM
- [x] Search (name/number/note/tag + digit-aware), call-back action, notes/tags on a call
- [x] Web export verified and published test link — https://call-log-tesfu-tilahun-s-projects.vercel.app/

**Exit criteria:** importing `sample-calls.csv` shows grouped history; search, call-back
and note/tag editing all work; no seed data in the shipped bundle.

### Verification (2026-11-16)

- `npx tsc --noEmit` → clean; `npx expo lint` → clean
- `npx expo export -p web` → 10 static routes; colour audit clean (no stray hex/rgba in `src/`)
- Local static build (`npx serve dist`) exercised end to end: empty state → import
  (CSV + JSON, incl. bad-file error) → grouped rows → search (note/digit/no-match) →
  detail modal note/tag save → call-back → delete → reload persistence (13 calls survived)
- Excel scientific-notation numbers (`2.51942E+11`) normalised to `251942000000`
- Web test link: https://call-log-tesfu-tilahun-s-projects.vercel.app/ (GitHub + Vercel, free; SSO protection off)
- Storage keys: `calllog.calls.v1` (AsyncStorage); ids are content-derived (`makeCallId`)

## Phase 3 - Analytics & Calls Usage

Theme: "See where your time goes."

- [x] Analytics: total calls + total duration, incoming/outgoing pie, frequency bar chart
- [x] Time-range filter (All / 7d / 30d / 90d / year) and Overview / Summary / Contacts / Calls sub-tabs
- [x] Calls Usage: SIM 1 / SIM 2, date range, direction filter, per-contact duration bars
- [x] Web export verified and published test link - https://call-log-tesfu-tilahun-s-projects.vercel.app/

### Verification (2026-11-16)

- `npx tsc --noEmit` -> clean; `npx expo lint` -> clean (0 warnings)
- `npx expo export -p web` -> 10 static routes; colour audit clean
- Local static build exercised: Analytics Overview (totals, pie, per-day bars), Summary
  (avg duration, missed, duration-by-direction, busiest day, longest talker, unique
  contacts, SIM breakdown), Contacts (top by calls + by duration), Calls (filtered
  list with direction chips); Calls Usage (SIM/direction/range filters, SIM bars,
  direction bars, top contacts by duration and by calls)
- Test link: https://call-log-tesfu-tilahun-s-projects.vercel.app/ (GitHub + Vercel, free)

## Phase 4 — Reminders & Reports

Theme: "Don't let friendships go quiet."

- [x] Per-contact typical call interval derived from history (median gap)
- [x] Quiet-period detection -> notification "It's been a while since you called X" (browser Notification API on web)
- [x] Weekly report generated every Sunday (auto + manual)
- [x] Monthly report generated at month end (auto + manual)
- [x] Web export verified and published test link - https://call-log-tesfu-tilahun-s-projects.vercel.app/

### Verification (2026-11-16)
- `npx tsc --noEmit` -> clean; `npx expo lint` -> clean (0 warnings)
- `npx expo export -p web` -> 10 static routes; colour audit clean
- Local static build exercised: Reminders modal (permission status, quiet contacts,
  run check, weekly/monthly report generation), auto-check on load + data change
- Test link: https://call-log-tesfu-tilahun-s-projects.vercel.app/ (GitHub + Vercel, free)


## Phase 5 - Backup & Export (free)

Theme: "Free for everyone - means everything."

- [x] Google Drive backup UI (account placeholder, weekly schedule toggle, Wi-Fi only) - file backup/restore works offline in web build
- [x] Export to CSV / XLS / JSON - free for every user (client-side download)
- [x] Restore from backup (file picker + parseBackup + importCalls de-dupe)
- [x] Web export verified and published test link - https://call-log-tesfu-tilahun-s-projects.vercel.app/

### Verification (2026-11-16)

- `npx tsc --noEmit` -> clean; `npx expo lint` -> clean (0 warnings)
- `npx expo export -p web` -> 10 static routes; colour audit clean
- Local static build exercised: Backup tab (status, export CSV/JSON/XLS, back up now,
  restore, Google Drive connect placeholder, settings toggles persist), free banner
- parseBackup unit-tested via tsx (valid/invalid/wrong-app)
- Test link: https://call-log-tesfu-tilahun-s-projects.vercel.app/ (GitHub + Vercel, free)

### Platform note

Reading the device call log requires `READ_CALL_LOG` and a native Android module. The
phased web test build uses imported data; native packaging is a separate delivery step.

---

## Phase 6 - Native Packaging

Theme: "Ship it to a phone."

- [x] EAS build configuration (`eas.json`) with development / preview / production profiles
- [x] Android permissions declared (`READ_CALL_LOG`, `READ_PHONE_STATE`) in `app.json`
- [x] Google Drive OAuth scaffold (`expo-auth-session` + `expo-secure-store`): sign-in,
      upload backup to appDataFolder, list & restore backups (configurable client ID via
      `expo.extra.googleClientId`)
- [x] Native call-log reader stub (`src/lib/nativeCallLog.ts`) — gracefully falls back to
      imported data when no native module is installed
- [ ] Custom native module for Android call-log reading (requires EAS build + device testing)
- [ ] EAS development build verified on a physical device
- [x] Web export verified and published test link - https://call-log-tesfu-tilahun-s-projects.vercel.app/

### Verification (2026-11-16)

- `npx tsc --noEmit` -> clean; `npx expo lint` -> clean (0 warnings)
- `npx expo export -p web` -> 10 static routes; colour audit clean
- Backup tab shows Google Drive "Not configured" until a client ID is set; file
  backup/restore and CSV/JSON/XLS export work offline
- Test link: https://call-log-tesfu-tilahun-s-projects.vercel.app/ (GitHub + Vercel, free)
