---
phase: 04-polish-launch
plan: "04"
subsystem: a11y
tags: [wcag, contrast, accessibility, verify-build, structural-audit]
dependency_graph:
  requires: [04-02, 04-03]
  provides: [wcag-aa-contrast-compliant, wcag-structural-baseline, a11y-regression-assertions]
  affects: [src/styles/global.css, scripts/verify-build.mjs]
tech_stack:
  added: []
  patterns: [wcag-aa-contrast-token, verify-build-assertion-11]
key_files:
  created: []
  modified:
    - src/styles/global.css
    - scripts/verify-build.mjs
decisions:
  - "--color-accent changed from #52b788 (2.474:1, fail) to #2a7a5c (5.202:1, pass) — WCAG AA 4.5:1 for normal link text on white"
  - "--color-accent-visited also updated from #3d8a68 (4.172:1, borderline) to #1f5c44 (7.858:1) for consistent compliance"
  - "Assertion 11 added to verify-build.mjs as regression guard for WCAG structural baseline (skip-link, tabindex, laboratorio h2)"
metrics:
  duration: "6 minutes"
  completed: "2026-10-19"
  tasks_completed: 2
  files_created: 0
  files_modified: 2
---

# Phase 4 Plan 4: WCAG 2.1 AA Audit Summary

Automated WCAG 2.1 AA audit complete: contrast ratio measured and fixed (2.474:1 → 5.202:1), all 8 structural checks passed, verify-build.mjs extended with Assertion 11 for ongoing regression detection. Human checkpoint (live deploy + smoke test) pending.

## What Was Built

### Task 1: Contrast Audit and Fix (src/styles/global.css)

**Measured contrast ratio (programmatic calculation — WCAG relative luminance formula):**

| Token | Hex | Contrast on #ffffff | WCAG AA 4.5:1 |
|-------|-----|---------------------|----------------|
| `--color-accent` (old) | `#52b788` | 2.474:1 | FAIL |
| `--color-accent` (new) | `#2a7a5c` | 5.202:1 | PASS |
| `--color-accent-visited` (old) | `#3d8a68` | 4.172:1 | FAIL (borderline) |
| `--color-accent-visited` (new) | `#1f5c44` | 7.858:1 | PASS |

The research estimate of ~3.14:1 was an approximation; actual measured value was 2.474:1 — an even larger failure. Both tokens were updated in a single `:root {}` block change. All usages via `var(--color-accent)` in `global.css`, `ContentPage.astro`, `TableOfContents.astro`, and the `:focus-visible` outline are automatically updated by the CSS Custom Property change.

Build after fix: exit 0, 30 pages built.

**Commit:** `fc7a3ee`

### Task 2: WCAG Structural Checklist (scripts/verify-build.mjs)

All 8 structural checks run against `dist/` after `npm run build`:

| Check | Command | Result | Expected |
|-------|---------|--------|----------|
| Skip link — home page | `grep -c "skip-link" dist/index.html` | 1 | 1 |
| Skip link — ES content page | `grep -c "skip-link" dist/micologia/generalidades/index.html` | 1 | 1 |
| Skip link — EN content page | `grep -c "skip-link" dist/en/micologia/generalidades/index.html` | 1 | 1 |
| `lang="es"` on ES page | `grep -c 'lang="es"' dist/micologia/generalidades/index.html` | 1 | 1 |
| `lang="en"` on EN page | `grep -c 'lang="en"' dist/en/micologia/generalidades/index.html` | 1 | 1 |
| `<main id="main-content">` | `grep -c 'id="main-content"'` | 1 | 1 |
| `tabindex="-1"` on main | `grep -c 'tabindex="-1"'` | 1 | 1 |
| `<nav>` landmarks (full count) | `grep -o '<nav' dist/micologia/generalidades/index.html \| wc -l` | **3** | >= 2 |
| laboratorio `<h2>` elements | `grep -c "<h2" dist/laboratorio/index.html` | **3** | >= 3 |
| No `<h3>` without `<h2>` | `grep -c "<h3>" dist/micologia/generalidades/index.html` | 0 | 0 |
| BreadcrumbList count | `grep -rl "BreadcrumbList" dist/ \| wc -l` | **26** | 26 |
| `aria-current="page"` | `grep -c 'aria-current="page"'` | 1 | 1 |

Note: `grep -c '<nav'` initially reported 1 due to minified HTML being on a single line; `grep -o '<nav' | wc -l` confirmed 3 nav elements: desktop top-nav, mobile overlay nav, breadcrumb nav — all with distinct `aria-label` values (no duplicate landmark issue).

**Assertion 11 added to verify-build.mjs:**
- 11a: skip-link present in home + 2 content page samples
- 11b: `<main tabindex="-1">` present
- 11c: laboratorio `<h2>` count >= 3

Full suite result: `node scripts/verify-build.mjs` → exit 0, all assertions passed (64 assertions from Plans 04-01/02/03 + 5 new WCAG assertions = 69 total).

**Commit:** `71caec5`

## Verification Results

```
# Build
npm run build → exit 0, 30 pages built

# Full verify-build.mjs
node scripts/verify-build.mjs → All assertions passed. Walking-skeleton build is GREEN.

# Contrast (programmatic)
#52b788 on #ffffff → 2.474:1 (FAIL)
#2a7a5c on #ffffff → 5.202:1 (PASS)
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] --color-accent-visited also updated**
- **Found during:** Task 1 contrast audit
- **Issue:** The research only flagged `--color-accent`, but `--color-accent-visited: #3d8a68` measured 4.172:1 — also below WCAG AA 4.5:1. The old visited color would still fail the accessibility requirement.
- **Fix:** Updated to `#1f5c44` (7.858:1), a proportionally darker shade of the same green family.
- **Files modified:** `src/styles/global.css`
- **Commit:** `fc7a3ee`

**2. [Rule 1 - Observation] Contrast ratio worse than research estimate**
- **Issue:** Research estimated ~3.14:1 based on approximation. Actual measured WCAG relative luminance formula: 2.474:1 — significantly worse.
- **Impact:** None to fix approach — same fix applies. Documented here for accuracy.

## Status

**Automated tasks: COMPLETE**
- Task 1 (contrast audit + fix): DONE — `fc7a3ee`
- Task 2 (WCAG structural checklist + verify-build Assertion 11): DONE — `71caec5`

**Human checkpoint: PENDING**
Task 3 (`checkpoint:human-verify`) requires human action before it can proceed:
1. Create GitHub Actions secrets (FTP_SERVER, FTP_USERNAME, FTP_PASSWORD) in repo settings
2. Push to trigger CI deploy to ULPGC server
3. Smoke test the live site (4 representative pages in ES + EN)
4. Validate BreadcrumbList structured data via Google Rich Results Test

## Known Stubs

None — both automated tasks are fully complete.

## Threat Flags

None — only CSS token and test script modified. No new network endpoints or trust boundaries.

## Self-Check: PASSED

- [x] `src/styles/global.css` `--color-accent` updated to `#2a7a5c`
- [x] `src/styles/global.css` `--color-accent-visited` updated to `#1f5c44`
- [x] Build exits 0 after contrast fix
- [x] All 8 WCAG structural checks passed
- [x] `node scripts/verify-build.mjs` exits 0
- [x] Commits exist: `fc7a3ee` (contrast fix), `71caec5` (WCAG assertions)
