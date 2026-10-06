---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 01
status: executing
stopped_at: Plan 01-03 complete
last_updated: "2026-10-06T17:40:00.000Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 3
  completed_plans: 3
  percent: 67
---

# State — VetMyc

## Project Reference

See: .planning/PROJECT.md

**Core value:** All existing content accessible through a clean, modern, navigable interface
**Current phase:** 01
**Status:** Plan 01-03 complete — FOUND-04 satisfied

---

## Phase Progress

| Phase | Name | Status |
|-------|------|--------|
| 1 | Foundation + Pipeline | Executing (3/3 plans complete — awaiting Plan 02 checkpoint) |
| 2 | Spanish Content Migration | Not started |
| 3 | English + i18n | Not started |
| 4 | Polish + Launch | Not started |

**Progress:** [███████░░░] 67%

---

## Current Position

Phase: 01 (foundation-pipeline) — EXECUTING
Plan: 3 of 3
**Active phase:** 1 — Foundation + Pipeline  
**Active plan:** None  
**Active task:** None  
**Last completed:** —

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases complete | 0 / 4 |
| Requirements complete | 0 / 34 |
| Plans written | 0 |
| Plans complete | 0 |

---
| Phase 01-foundation-pipeline P01 | 4 | 3 tasks | 11 files |
| Phase 01-foundation-pipeline P03 | 25 | - tasks | - files |

## Accumulated Context

### Key Decisions

- Astro `prefixDefaultLocale: false` — Spanish at root, English under `/en/` (locked in Plan 01 before any content committed)
- Spanish-slug strategy for both language trees — `/en/patologias/levaduras/` not `/en/pathologies/yeasts/`; makes LangSwitcher a one-liner path replace
- No CI/CD for v1 — build locally, deploy via rsync or FTP to ULPGC Apache server
- No Tailwind — plain CSS with scoped Astro `<style>` blocks and CSS Custom Properties
- Astro 7.3.6 installed (not Astro 4 documented in CLAUDE.md) — 01-RESEARCH.md Astro 7 patterns govern all future phases
- `redirectToDefaultLocale` NOT written in astro.config.mjs — defaults to false in Astro 6+; omitted to prevent confusion
- `base` NOT set in astro.config.mjs — pending ULPGC webmaster confirmation of root vs subdirectory (handled in Plan 02)
- `src/content.config.ts` at src/ root (NOT src/content/config.ts) — Astro 7 Content Layer API with glob() loader
- `z` imported from `astro/zod` (NOT `astro:content`) — Astro 6+ requirement
- Use `.*?` with `re.DOTALL` for webbot/mstheme/mstable regex in extract_frontpage.py — `[^>]*` from RESEARCH.md Pattern 6 fails when WebBot comment contains `>` inside body (Pitfall 5 confirmed by fixture)
- venv resolution in test_extract_frontpage.sh: prefer `.venv/bin/python3` when bs4 is present — dev machine pip3→Python 3.11 but python3→Python 3.12 (Homebrew version split)

### Open Blockers

- ULPGC webmaster must confirm: `AllowOverride` status, deployment URL (root vs subdirectory), HTTPS enforcement, file permissions — required before finalizing `base:` in astro.config.mjs (Plan 02 Task 1 checkpoint)

### Todos (carry forward)

- Confirm deployment URL with ULPGC webmaster — Plan 02 Task 1 handles this as a human checkpoint
- ~~Audit source `.htm` files for FrontPage WebBot artifacts before extraction script is written (Plan 03)~~ — DONE: extraction script written and tested, FOUND-04 complete

---

## Session Continuity

**Last session:** 2026-10-06T17:40:00.000Z
**Stopped at:** Plan 01-03 complete — FOUND-04 extraction pipeline GREEN
**Next action:** Execute Plan 01-02 (ULPGC deploy — webmaster coordination checkpoint)
