---
phase: 04-polish-launch
plan: "02"
subsystem: breadcrumb
tags: [breadcrumb, json-ld, structured-data, i18n, a11y, slot-forwarding]
dependency_graph:
  requires: [04-01]
  provides: [breadcrumb-component, slot-forwarding, breadcrumb-i18n-keys, breadcrumb-schema-field]
  affects: [all-content-pages]
tech_stack:
  added: []
  patterns: [slot-forwarding, json-ld-set:html, wai-aria-breadcrumb, conditional-component-render]
key_files:
  created:
    - src/components/Breadcrumb.astro
  modified:
    - src/content.config.ts
    - src/i18n/ui.ts
    - src/layouts/ContentPage.astro
decisions:
  - "Breadcrumb component owns both visible nav and JSON-LD; ContentPage forwards slot to BaseLayout"
  - "slot=\"head\" on script tag + <slot name=\"head\" slot=\"head\" /> in ContentPage routes JSON-LD to <head>"
  - "parentMap keyed by Spanish label; EN locale resolved at render time via label[lang]"
  - "breadcrumb_parent optional in schema — pages without field build cleanly, no breadcrumb rendered"
  - "tabindex=\"-1\" added to <main> for skip link focus compatibility (older Safari/Firefox)"
metrics:
  duration: "8 minutes"
  completed: "2026-10-19"
  tasks_completed: 3
  files_created: 1
  files_modified: 3
---

# Phase 4 Plan 2: Breadcrumb Component + ContentPage Slot Forwarding Summary

Bilingual breadcrumb component (visible nav + BreadcrumbList JSON-LD) wired into ContentPage; slot forwarding gap fixed; contentSchema extended with optional breadcrumb_parent field; breadcrumb i18n keys added to both locales.

## What Was Built

### src/content.config.ts
Added `breadcrumb_parent: z.string().optional()` as the last field of `contentSchema`. Non-breaking — all existing markdown files without the field continue to build cleanly with `entry.data.breadcrumb_parent === undefined`.

### src/i18n/ui.ts
Added 4 new keys (2 per locale):
- `breadcrumb.home`: `'Inicio'` (es) / `'Home'` (en)
- `breadcrumb.aria-label`: `'Ruta de navegación'` (es) / `'Breadcrumb navigation'` (en)

### src/components/Breadcrumb.astro
New component with:
- `parentMap` with 5 section keys: Micología, Patologías, Investigación, Laboratorio, Recursos — each has `esPath`, `enPath`, and bilingual `label`
- BreadcrumbList JSON-LD built as a JS object, serialized with `JSON.stringify`, rendered via `set:html` (prevents HTML escaping) with `slot="head"` for head injection
- Absolute URLs constructed from `Astro.site?.origin`
- WAI-ARIA APG breadcrumb pattern: `<nav aria-label>`, `<ol>`, `aria-hidden="true"` on separator `<li>` elements, `aria-current="page"` on leaf `<span>` (not a link)
- Scoped CSS using existing CSS Custom Property tokens; muted opacity (0.65) per "subordinate to page title" styling decision

### src/layouts/ContentPage.astro
Three changes:
1. `<slot name="head" slot="head" />` as first child of `<BaseLayout>` — fixes the slot forwarding gap; without this, Astro silently drops JSON-LD from `<head>`
2. `breadcrumbParent?: string` added to Props interface and destructuring; `Breadcrumb` imported
3. `{breadcrumbParent && <Breadcrumb breadcrumbParent={breadcrumbParent} title={title} lang={lang} />}` above `<h1>`
4. `tabindex="-1"` on `<main id="main-content">` for skip link focus fix (WCAG best practice)

## Verification Results

```
# Schema field
grep -c "breadcrumb_parent: z.string().optional()" src/content.config.ts → 1 ✓

# Translation keys (2 per locale)
grep -c "breadcrumb.home" src/i18n/ui.ts → 2 ✓
grep -c "Ruta de navegación" src/i18n/ui.ts → 1 ✓
grep -c "Breadcrumb navigation" src/i18n/ui.ts → 1 ✓

# Breadcrumb component signals
grep -c "BreadcrumbList" src/components/Breadcrumb.astro → 2 ✓
grep -c "set:html" src/components/Breadcrumb.astro → 1 ✓
grep -c "aria-current=\"page\"" src/components/Breadcrumb.astro → 2 ✓
grep -c "slot=\"head\"" src/components/Breadcrumb.astro → 3 ✓
grep -c "aria-hidden=\"true\"" src/components/Breadcrumb.astro → 2 ✓

# ContentPage slot forwarding
grep -c "slot name=\"head\" slot=\"head\"" src/layouts/ContentPage.astro → 1 ✓
grep -c "breadcrumbParent" src/layouts/ContentPage.astro → 3 ✓
grep -c "tabindex=\"-1\"" src/layouts/ContentPage.astro → 1 ✓

# Build
npm run build → exit 0, 30 pages built ✓

# Spot check — no breadcrumb in generalidades yet (breadcrumb_parent not in frontmatter)
grep -c "BreadcrumbList" dist/micologia/generalidades/index.html → 0 ✓
```

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — component is fully wired. Pages without `breadcrumb_parent` in frontmatter correctly render no breadcrumb. Frontmatter population for all 26 content files is Plan 04-03.

## Next Step

Run Plan 04-03: populate `breadcrumb_parent` frontmatter in all 26 content markdown files (13 ES + 13 EN) and fix laboratorio heading hierarchy.

## Self-Check: PASSED

- [x] `src/components/Breadcrumb.astro` exists
- [x] `src/content.config.ts` has breadcrumb_parent optional field
- [x] `src/i18n/ui.ts` has 4 breadcrumb keys
- [x] `src/layouts/ContentPage.astro` has slot forwarding, breadcrumbParent prop, conditional render
- [x] Commit `e13d23e` exists (Task 1)
- [x] Commit `0ae2ff2` exists (Task 2)
- [x] Commit `02a3783` exists (Task 3)
- [x] Build passes — 30 pages, exit 0
- [x] Spot check — 0 BreadcrumbList in generalidades output (correct — no frontmatter yet)
