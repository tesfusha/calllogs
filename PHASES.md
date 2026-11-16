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
- [ ] Published test link — **pending hosting choice**

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

- [ ] `CallRecord` model: id, number, name, direction, SIM, timestamp, duration, note/tag
- [ ] Local persistence (hydrate-safe, no seed data)
- [ ] Import call data (CSV / JSON) — required for the web test build
- [ ] Dialer: date-grouped history, contact initials/avatars, direction arrows, duration, SIM
- [ ] Search, call-back action, notes/tags on a call
- [ ] Web export verified and published test link

**Exit criteria:** importing `sample-calls.csv` shows grouped history; search, call-back
and note/tag editing all work; no seed data in the shipped bundle.

## Phase 3 — Analytics & Calls Usage

Theme: "See where your time goes."

- [ ] Analytics: total calls + total duration, incoming/outgoing pie, frequency bar chart
- [ ] Time-range filter and Overview / Summary / Contacts / Calls sub-tabs
- [ ] Calls Usage: SIM 1 / SIM 2, date range, direction filter, per-contact duration bars
- [ ] Web export verified and published test link

## Phase 4 — Reminders & Reports

Theme: "Don't let friendships go quiet."

- [ ] Per-contact typical call interval derived from history
- [ ] Quiet-period detection → notification "It's been a while since you called X"
- [ ] Weekly report generated every Sunday
- [ ] Monthly report generated at month end
- [ ] Web export verified and published test link

## Phase 5 — Backup & Export (free)

Theme: "Free for everyone — means everything."

- [ ] Google Drive backup (account, weekly schedule, Wi-Fi only)
- [ ] Export to CSV / XLS / JSON — free for every user
- [ ] Restore from backup
- [ ] Web export verified and published test link

### Platform note

Reading the device call log requires `READ_CALL_LOG` and a native Android module. The
phased web test build uses imported data; native packaging is a separate delivery step.
