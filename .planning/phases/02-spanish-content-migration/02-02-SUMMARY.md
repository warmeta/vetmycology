---
phase: 02-spanish-content-migration
plan: "02"
subsystem: ui
tags: [astro, css, navigation, layout, design-system, content-collections]

# Dependency graph
requires:
  - phase: 01-foundation-pipeline
    provides: Astro 7.3.6 scaffold, content.config.ts location, z from astro/zod pattern

provides:
  - "src/styles/global.css: full :root CSS Custom Properties design token set"
  - "src/layouts/BaseLayout.astro: HTML shell with Google Fonts, Header + slot + Footer"
  - "src/layouts/ContentPage.astro: 740px prose column with :global() prose styles"
  - "src/components/Header.astro: sticky nav header with skip link"
  - "src/components/TopNav.astro: 6-group CSS :hover/:focus-within dropdown nav (desktop)"
  - "src/components/MobileNav.astro: CSS :checked overlay + <details>/<summary> accordions (mobile)"
  - "src/components/Footer.astro: ULPGC/IUSA logos + affiliation text + contact"
  - "src/components/TableOfContents.astro: <nav aria-label> TOC component"
  - "src/content.config.ts: 5 content collections (micologia, patologias, investigacion, laboratorio, recursos)"

affects:
  - "02-03: Home page + 7 content pages — all use BaseLayout/ContentPage"
  - "02-04: Pathology/lab pages — use ContentPage + TableOfContents"
  - "02-05: Image archive + polish — uses ImageArchive layout extending BaseLayout"
  - "03-*: English i18n — extends Header lang switcher, BaseLayout lang prop"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSS-only dropdown nav: :hover + :focus-within on .nav-group shows .nav-dropdown (no JS)"
    - "CSS-only hamburger: hidden checkbox + :checked ~ .mobile-nav-overlay sibling combinator"
    - "<details>/<summary> mobile accordions: native browser toggle, keyboard accessible, no JS"
    - "Astro scoped style :global() for markdown-rendered prose children (Pitfall 3 mitigation)"
    - "CSS Custom Properties via :root in global.css, imported in BaseLayout frontmatter"

key-files:
  created:
    - src/styles/global.css
    - src/layouts/BaseLayout.astro
    - src/layouts/ContentPage.astro
    - src/components/Header.astro
    - src/components/TopNav.astro
    - src/components/MobileNav.astro
    - src/components/Footer.astro
    - src/components/TableOfContents.astro
    - src/content/micologia/.gitkeep
    - src/content/patologias/.gitkeep
    - src/content/investigacion/.gitkeep
    - src/content/laboratorio/.gitkeep
    - src/content/recursos/.gitkeep
    - public/images/logos/.gitkeep
  modified:
    - src/content.config.ts
    - src/pages/index.astro

key-decisions:
  - "CSS-only nav: :hover + :focus-within for desktop dropdowns, :checked for mobile overlay — no JavaScript shipped"
  - "MobileNav duplicates navGroups array inline (vs shared nav-data.ts) — simpler for Phase 2, refactor deferred to Phase 4"
  - "<details>/<summary> used for mobile group accordions — native browser accordion, keyboard accessible, zero JS"
  - "Header stub replaced by full implementation in Task 2 (both committed cleanly)"
  - ":global() required in ContentPage scoped style for markdown-rendered prose (Pitfall 3 confirmed necessary)"
  - "Pitfall 5 (checkbox :checked persists on resize) documented as known limitation in MobileNav comment"

patterns-established:
  - "Pattern: CSS-only dropdown — .nav-group:hover .nav-dropdown, .nav-group:focus-within .nav-dropdown { display: block }"
  - "Pattern: CSS-only hamburger — #nav-toggle:checked ~ .mobile-nav-overlay { display: flex }"
  - "Pattern: Prose :global() — .content-page :global(h1) {} for markdown slot children"
  - "Pattern: Font import — import '../styles/global.css' in layout frontmatter (Vite pipeline)"

requirements-completed:
  - NAV-01
  - NAV-02
  - NAV-04
  - NAV-05
  - MEDIA-03

# Metrics
duration: 3min
completed: "2026-10-18"
---

# Phase 2 Plan 02: Design System + Layout Shell + CSS-Only Nav Summary

**Green-field layout foundation: design tokens, BaseLayout/ContentPage shell, sticky header with 6-group CSS-only dropdown/hamburger nav, TOC component, and 5 content collections — all zero JavaScript.**

## Performance

- **Duration:** ~3 minutes
- **Started:** 2026-10-18T17:13:20Z
- **Completed:** 2026-10-18T17:16:30Z
- **Tasks:** 2
- **Files modified/created:** 16

## Accomplishments

- Complete CSS Custom Properties design token system (8 colors, 2 font stacks, 4 font sizes, 7 spacing tokens) from UI-SPEC verbatim
- Full HTML shell (BaseLayout) with Google Fonts Inter 400 + Source Serif 4 700, proper head structure, and `<slot />`
- 740px prose column layout (ContentPage) with :global() prose styles for markdown-rendered children
- Sticky header (56px, z-index 100) with 6-group desktop dropdown nav (:hover + :focus-within, keyboard accessible) and mobile overlay nav (CSS :checked + `<details>` accordions, zero JS)
- Footer with logo placeholders, Facultad de Veterinaria affiliation text, and contact email
- TableOfContents component with `aria-label="En esta página"` and decimal-ordered anchor links
- 5 content collections replacing the stub `pages` collection; Wave 2 `.md` files can be placed immediately

## Task Commits

1. **Task 1: Global CSS + BaseLayout + ContentPage + TableOfContents + content collections** - `516a014` (feat)
2. **Task 2: Header + TopNav + MobileNav + Footer (CSS-only nav)** - `e6c77c6` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `/Users/warmeta/Projects/vetmyc/src/styles/global.css` — Complete :root design token set + CSS reset + :focus-visible
- `/Users/warmeta/Projects/vetmyc/src/layouts/BaseLayout.astro` — HTML shell, Google Fonts preconnect, Header+slot+Footer
- `/Users/warmeta/Projects/vetmyc/src/layouts/ContentPage.astro` — 740px prose column, :global() prose styles, TOC injection
- `/Users/warmeta/Projects/vetmyc/src/components/Header.astro` — Sticky header, skip link, wordmark, TopNav+MobileNav composition
- `/Users/warmeta/Projects/vetmyc/src/components/TopNav.astro` — 6-group desktop nav with CSS dropdown, hides at <1024px
- `/Users/warmeta/Projects/vetmyc/src/components/MobileNav.astro` — :checked hamburger overlay, details/summary accordions
- `/Users/warmeta/Projects/vetmyc/src/components/Footer.astro` — ULPGC/IUSA logos, faculty affiliation, mailto contact
- `/Users/warmeta/Projects/vetmyc/src/components/TableOfContents.astro` — TOC nav with decimal list + scoped styles
- `/Users/warmeta/Projects/vetmyc/src/content.config.ts` — 5 collections (micologia, patologias, investigacion, laboratorio, recursos)
- `/Users/warmeta/Projects/vetmyc/src/pages/index.astro` — Updated to use BaseLayout, retains Spanish test literal
- `src/content/*/gitkeep` — 5 collection directories tracked for Wave 2
- `public/images/logos/.gitkeep` — Logo directory tracked (real logos added in Plan 05)

## Decisions Made

- CSS-only navigation throughout: :hover + :focus-within for desktop dropdowns, :checked hidden checkbox for mobile hamburger overlay, `<details>`/`<summary>` for mobile group accordions. No JavaScript shipped — meets D-06 and D-08 constraints absolutely.
- NavGroups array duplicated inline in TopNav.astro and MobileNav.astro (not extracted to shared nav-data.ts). This is simpler for Phase 2 and the array is small. Phase 4 can refactor if needed.
- Header stub (created in Task 1 for BaseLayout import) was fully replaced by Task 2 implementation — both tasks committed cleanly with no leftover stubs.
- Pitfall 5 (MobileNav :checked state persists after viewport resize) documented with an inline CSS comment as a known limitation. Phase 4 can add a small JS reset if needed.

## Deviations from Plan

None — plan executed exactly as written. The Header and Footer stub strategy (create minimal stubs in Task 1 so BaseLayout could be type-checked, replace with full implementation in Task 2) was a natural execution pattern not explicitly called out in the plan but fully consistent with it.

## Issues Encountered

None. `astro check` passed 0 errors on first run for both Task 1 and Task 2. Build succeeded on first run. `verify-build.mjs` exited 0.

## Known Stubs

- `public/images/logos/ulpgc.png` and `public/images/logos/iusa.png` do not exist yet (images 404 in build preview). Footer renders with broken images but alt text degrades gracefully. Real logos must be copied from `~/Downloads/backup/LOGO.jpg` and `~/Downloads/backup/iusalogodoctorado2012.jpg` in Plan 05 Task 1.

## Threat Flags

None — no new network endpoints, auth paths, or trust-boundary schema changes. Google Fonts CDN usage is covered by T-02-02-01 (accept) in the plan's threat model.

## User Setup Required

None — no external service configuration required beyond the logo images noted under Known Stubs.

## Next Phase Readiness

- Plans 03 and 04 can now `import ContentPage from '../../layouts/ContentPage.astro'` and render markdown content inside the shell.
- All 5 content collection directories are created and tracked. Wave 2 `.md` files can be placed immediately.
- Keyboard-only navigation is functional: Tab reaches nav group labels, :focus-within keeps dropdown open while tabbing through links.
- Mobile hamburger + `<details>` accordions work without JavaScript at all viewport sizes.
- The Spanish test literal `Micología Veterinaria — ñoño, cándida, pérez` is preserved in `index.astro` — verify-build.mjs Assertion 3 continues to pass.

---
*Phase: 02-spanish-content-migration*
*Completed: 2026-10-18*
