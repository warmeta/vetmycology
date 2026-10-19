---
phase: 04-polish-launch
plan: "03"
subsystem: breadcrumb
tags: [breadcrumb, json-ld, structured-data, i18n, a11y, slot-forwarding, wcag]
dependency_graph:
  requires: [04-02]
  provides: [breadcrumb-frontmatter, breadcrumb-active-26-pages, laboratorio-heading-fix, breadcrumb-verify-assertions]
  affects: [all-content-pages]
tech_stack:
  added: []
  patterns: [json-ld-in-layout-not-component, breadcrumb-prop-forwarding]
key_files:
  created: []
  modified:
    - src/content/micologia/generalidades.md
    - src/content/micologia/grupo-de-trabajo.md
    - src/content/micologia/colreptiles.md
    - src/content/patologias/levaduras.md
    - src/content/patologias/filamentosos.md
    - src/content/patologias/dimorficos.md
    - src/content/patologias/micosis-peces.md
    - src/content/investigacion/articulos-congresos.md
    - src/content/investigacion/articulos-interesantes.md
    - src/content/laboratorio/laboratorio.md
    - src/content/recursos/links-micologia.md
    - src/content/recursos/links-revistas.md
    - src/content/recursos/bibliografia.md
    - src/content/micologia-en/generalidades.md
    - src/content/micologia-en/grupo-de-trabajo.md
    - src/content/micologia-en/colreptiles.md
    - src/content/patologias-en/levaduras.md
    - src/content/patologias-en/filamentosos.md
    - src/content/patologias-en/dimorficos.md
    - src/content/patologias-en/micosis-peces.md
    - src/content/investigacion-en/articulos-congresos.md
    - src/content/investigacion-en/articulos-interesantes.md
    - src/content/laboratorio-en/laboratorio.md
    - src/content/recursos-en/links-micologia.md
    - src/content/recursos-en/links-revistas.md
    - src/content/recursos-en/bibliografia.md
    - src/layouts/ContentPage.astro
    - src/components/Breadcrumb.astro
    - scripts/verify-build.mjs
    - src/pages/micologia/generalidades.astro
    - src/pages/micologia/grupo-de-trabajo.astro
    - src/pages/micologia/colreptiles.astro
    - src/pages/patologias/levaduras.astro
    - src/pages/patologias/filamentosos.astro
    - src/pages/patologias/dimorficos.astro
    - src/pages/patologias/micosis-peces.astro
    - src/pages/investigacion/articulos-congresos.astro
    - src/pages/investigacion/articulos-interesantes.astro
    - src/pages/laboratorio/index.astro
    - src/pages/recursos/links-micologia.astro
    - src/pages/recursos/links-revistas.astro
    - src/pages/recursos/bibliografia.astro
    - src/pages/en/micologia/generalidades.astro
    - src/pages/en/micologia/grupo-de-trabajo.astro
    - src/pages/en/micologia/colreptiles.astro
    - src/pages/en/patologias/levaduras.astro
    - src/pages/en/patologias/filamentosos.astro
    - src/pages/en/patologias/dimorficos.astro
    - src/pages/en/patologias/micosis-peces.astro
    - src/pages/en/investigacion/articulos-congresos.astro
    - src/pages/en/investigacion/articulos-interesantes.astro
    - src/pages/en/laboratorio/index.astro
    - src/pages/en/recursos/links-micologia.astro
    - src/pages/en/recursos/links-revistas.astro
    - src/pages/en/recursos/bibliografia.astro
decisions:
  - "JSON-LD must be generated at ContentPage layout level — Astro does not propagate slot='head' from grandchild components (Breadcrumb inside ContentPage inside BaseLayout loses the slot attribute)"
  - "Breadcrumb component now renders visible nav only; ContentPage owns JSON-LD generation with its own parentMap copy"
  - "breadcrumbParent prop must be explicitly passed in every page .astro file — frontmatter field is not auto-forwarded"
metrics:
  duration: "18 minutes"
  completed: "2026-10-19"
  tasks_completed: 3
  files_created: 0
  files_modified: 55
---

# Phase 4 Plan 3: Breadcrumb Frontmatter Population + Laboratorio Heading Fix Summary

Activated bilingual breadcrumb on all 26 content pages (13 ES + 13 EN) by adding `breadcrumb_parent` to markdown frontmatter and wiring the prop through page files and ContentPage; fixed a JSON-LD slot-forwarding bug discovered during execution; fixed WCAG 1.3.1 heading hierarchy violation in both laboratorio files.

## What Was Built

### Content Markdown Files (26 files)

Added `breadcrumb_parent: "VALUE"` to YAML frontmatter in all 26 content files:
- 13 ES files: micologia (3), patologias (4), investigacion (2), laboratorio (1), recursos (3)
- 13 EN files: same sections, same Spanish key values (Breadcrumb component resolves locale labels from parentMap)

### Laboratorio Heading Fix (2 files)

`src/content/laboratorio/laboratorio.md`: 3 plain-text lines converted to `## ENFERMEDADES INFECCIOSAS`, `## DIAGNÓSTICO MICOLÓGICO`, `## DIAGNÓSTICO DE CRIPTOCOCOSIS`.

`src/content/laboratorio-en/laboratorio.md`: Same fix for `## INFECTIOUS DISEASES`, `## MYCOLOGICAL DIAGNOSIS`, `## DIAGNOSIS OF CRYPTOCOCCOSIS`.

Result: `dist/laboratorio/index.html` now has 3 `<h2 id="...">` elements (was 0 before).

### Page .astro Files (26 files)

Added `breadcrumbParent={entry.data.breadcrumb_parent}` to the `<ContentPage>` call in all 26 page route files. This was the missing wire between frontmatter data and the layout component.

### src/layouts/ContentPage.astro

Moved BreadcrumbList JSON-LD computation from Breadcrumb.astro into ContentPage (see Deviations). JSON-LD is now generated in the layout and emitted via `<script slot="head">` which correctly reaches `<head>` through the BaseLayout slot.

### src/components/Breadcrumb.astro

Removed JSON-LD generation (moved to ContentPage). Component now renders the visible `<nav>` breadcrumb only.

### scripts/verify-build.mjs

Added Assertions 9 and 10:
- Assertion 9: BreadcrumbList JSON-LD present in all 13 ES content pages
- Assertion 10: BreadcrumbList JSON-LD present in all 13 EN content pages
- Both exclude home pages and archivo-imagenes pages (per D-05)

## Verification Results

```
# Build
npm run build → exit 0, 30 pages built

# BreadcrumbList count
grep -rl "BreadcrumbList" dist/ | wc -l → 26

# ES sample
grep -c "BreadcrumbList" dist/micologia/generalidades/index.html → 1

# EN sample
grep -c "BreadcrumbList" dist/en/micologia/generalidades/index.html → 1

# Visible breadcrumb in ES sample
grep -c "aria-current=\"page\"" dist/micologia/generalidades/index.html → 1

# Laboratorio headings
grep -c "<h2 " dist/laboratorio/index.html → 3

# archivo-imagenes excluded
grep -c "BreadcrumbList" dist/recursos/archivo-imagenes/index.html → 0

# Home page excluded
grep -c "BreadcrumbList" dist/index.html → 0

# JSON-LD location
node verify → JSON-LD in head: true, JSON-LD in body: false

# Full verify-build.mjs (64 assertions)
node scripts/verify-build.mjs → All assertions passed. Walking-skeleton build is GREEN.
```

### verify-build.mjs last 10 lines:
```
PASS: BreadcrumbList JSON-LD in dist/en/recursos/links-micologia/index.html
PASS: BreadcrumbList JSON-LD in dist/en/recursos/links-revistas/index.html
PASS: BreadcrumbList JSON-LD in dist/en/recursos/bibliografia/index.html

All assertions passed. Walking-skeleton build is GREEN.
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] BreadcrumbList JSON-LD not reaching `<head>` (slot forwarding limitation)**
- **Found during:** Task 3 verification (grep -rl "BreadcrumbList" dist/ returned 0)
- **Issue:** Astro does not propagate `slot="head"` from grandchild components. The Breadcrumb component's `<script slot="head">` was silently dropped because Astro's slot mechanism only works one level deep. ContentPage forwarded its own `<slot name="head" slot="head">` for external callers, but the Breadcrumb component rendered inside ContentPage's template body had no path to reach BaseLayout's `<slot name="head">`.
- **Fix:** Moved JSON-LD generation from `Breadcrumb.astro` into `ContentPage.astro`. ContentPage now computes the JSON-LD from `breadcrumbParent` prop and emits `<script type="application/ld+json" set:html={...} slot="head">` directly — which works because it is one level from BaseLayout.
- **Files modified:** `src/layouts/ContentPage.astro`, `src/components/Breadcrumb.astro`
- **Commits:** `faaa5aa`

**2. [Rule 1 - Bug] breadcrumbParent prop not forwarded in any page file**
- **Found during:** Task 3 verification (breadcrumb CSS rendered but `BreadcrumbList` count was 0)
- **Issue:** All 26 page `.astro` files called `<ContentPage>` without `breadcrumbParent` prop. The plan focused on frontmatter addition but did not specify page file edits. Without this prop, ContentPage always received `undefined` and never rendered the breadcrumb.
- **Fix:** Added `breadcrumbParent={entry.data.breadcrumb_parent}` to all 26 page files.
- **Files modified:** 26 `src/pages/**/*.astro` files
- **Commit:** `f61aa54`

## Known Stubs

None — breadcrumb is fully functional on all 26 content pages.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundaries introduced.

## Next Step

Run Plan 04-04: a11y audit + contrast check + production deploy pipeline.

## Self-Check: PASSED

- [x] 26 markdown files have `breadcrumb_parent` in frontmatter
- [x] `recursos/archivo-imagenes.md` and `recursos-en/archivo-imagenes.md` do NOT have `breadcrumb_parent`
- [x] `grep -rl "BreadcrumbList" dist/ | wc -l` returns 26
- [x] `dist/laboratorio/index.html` has 3 `<h2 id="...">` elements
- [x] `node scripts/verify-build.mjs` exits 0 — all 64 assertions pass
- [x] Build exits 0
- [x] JSON-LD is in `<head>` not body
- [x] Commits exist: `0811d55` (ES frontmatter + laboratorio ES fix), `1e55ba6` (EN frontmatter + laboratorio EN fix), `faaa5aa` (slot forwarding fix), `f61aa54` (page prop wiring), `be6b63d` (verify-build assertions)
