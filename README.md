# Study Planner BD — স্টাডি প্ল্যানার বিডি

Turn a syllabus into a day-by-day battle plan. A fully offline, bilingual
(English/বাংলা) exam study planner: subjects with exam countdowns, topics with
3 revision passes, per-subject progress, an auto-generated "today's focus", and
an exam schedule view. All data stays in your browser.

## Problem

Students juggle several subjects and exams but plan in their heads — topics get
forgotten, revision never happens, and panic arrives the night before. Existing
planners need accounts and internet; this one works offline in one static page.

## Features

- **Subjects** with color tags and optional exam dates → live countdowns
  (plenty of time / this week / tomorrow / today / passed).
- **Topics** per subject with estimated minutes and **3 revision passes**:
  Not started → 1st pass → 2nd pass → Done (click cycles the state).
- **Progress**: per-subject % and overall readiness %, weighted by passes.
- **🎯 Today's focus**: auto-suggests the nearest upcoming exam's
  least-completed topic, with one-click "mark one pass done".
- **🗓 Exam schedule**: chronological upcoming exams with days-left and
  readiness; past exams shown muted.
- **localStorage persistence**, JSON export/import, realistic sample data,
  clear-all with confirm.
- **Full EN/বাংলা UI toggle** (Bengali digits in countdowns), responsive
  mobile/desktop layout, empty states everywhere.
- Test hook: `?asof=YYYY-MM-DD` freezes "today" for deterministic checks.

## Stack

Vanilla HTML/CSS/JS. No build step, no dependencies, no backend, zero network
requests. Pure functions (`js/planner.js`) are separated from UI wiring
(`js/app.js`) so the math is unit-testable.

## Prerequisites

Any modern browser (Chrome, Edge, Firefox, Safari). Nothing to install.

## Install

```bash
# serve the folder (any static server works)
cd study-planner-bd
python3 -m http.server 8123
# open http://localhost:8123/
```

Or open `index.html` directly — the app also runs from `file://`
(no `fetch` calls, so no CORS issues).

## Dev commands

No build, no package manager. Edit files, reload the browser.

```bash
python3 -m http.server 8123   # local dev server
```

## Environment

None. No API keys, no `.env`, no backend — the app is 100% client-side.

## Testing

Headless-Chromium suite (puppeteer-core + system Chromium), 23 checks:

```bash
cd /tmp/sp-test && node test.js   # needs the dev server on :8123, or file:// URL in test.js
```

Covers: zero console/page errors; empty states; 7-day countdown; overdue-exam
"passed" state; topic pass cycling (0→1→2→3→0); exact progress math
(`(3+1+0)/9 = 44.4%`, `(0+1+0)/9 = 11.1%`, `(1+1+0)/9 = 22.2%`); today's-focus
picking logic; mark-done updates; export → clear → import round-trip;
reload persistence; sample data; validation (empty/duplicate names, 0 minutes,
>5-year date warning); BN/EN toggle with Bengali digits; 390px mobile overflow.

Deterministic dates via `index.html?asof=YYYY-MM-DD`.

## Deployment

GitHub Pages compatible: static files only, no server. Publish the folder as-is
(branch `main`, root `/`).

## Limitations

- **Revision weighting is a convention, not science**: each of the 3 passes
  counts ⅓ of a topic. Real mastery isn't linear — treat % as motivation,
  not measurement.
- **Countdowns use calendar days** from device-local midnight; hours shown
  only implicitly via "today/tomorrow" states.
- **>5-year exam dates** are accepted with a warning (assumed typo, not blocked).
- Data is **per-browser localStorage** — no sync; JSON export is the backup path.
- Timers/`?asof` are test-only; the live app always uses the real date.
- No notifications/reminders — the browser tab must be opened.

## Status

Built and tested 2026-10-10 — **23/23 headless-Chrome checks pass, zero
console errors**. Ready to publish.
