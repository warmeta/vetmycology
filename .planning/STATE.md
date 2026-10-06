# State — VetMyc

## Project Reference
See: .planning/PROJECT.md

**Core value:** All existing content accessible through a clean, modern, navigable interface
**Current phase:** 1 — Foundation + Pipeline
**Status:** Not started

---

## Phase Progress

| Phase | Name | Status |
|-------|------|--------|
| 1 | Foundation + Pipeline | Not started |
| 2 | Spanish Content Migration | Not started |
| 3 | English + i18n | Not started |
| 4 | Polish + Launch | Not started |

**Progress:** Phase 0/4 complete `[ ][ ][ ][ ]`

---

## Current Position

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

## Accumulated Context

### Key Decisions
- Astro `prefixDefaultLocale: false` — Spanish at root, English under `/en/` (must be locked in Phase 1 before any content is committed)
- Spanish-slug strategy for both language trees — `/en/patologias/levaduras/` not `/en/pathologies/yeasts/`; makes LangSwitcher a one-liner path replace
- No CI/CD for v1 — build locally, deploy via rsync or FTP to ULPGC Apache server
- No Tailwind — plain CSS with scoped Astro `<style>` blocks and CSS Custom Properties

### Open Blockers
- ULPGC webmaster must confirm: `AllowOverride` status, deployment URL (root vs subdirectory), HTTPS enforcement, file permissions — required before finalizing `astro.config.mjs`
- Astro 4 vs 5 API differences — verify `defineCollection` syntax and `getRelativeLocaleUrl` import path against live docs before coding Phase 1 schemas

### Todos (carry forward)
- Confirm deployment URL with ULPGC webmaster before writing `astro.config.mjs`
- Check Astro version at install time; verify Content Collections API (Astro 4) vs Content Layer API (Astro 5)
- Audit source `.htm` files for FrontPage WebBot artifacts (`<!--webbot-->`, `<!--mstheme-->`, `_msstyle`) before extraction script is written

---

## Session Continuity

**Last session:** Project initialized — roadmap and state created  
**Next action:** Begin Phase 1 — run `/gsd:plan-phase 1`
