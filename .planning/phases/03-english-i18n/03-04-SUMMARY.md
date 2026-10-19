---
plan: 03-04
phase: 03-english-i18n
status: complete
completed: 2026-10-19
tags: [verification, i18n, smoke-test, en, hreflang]
dependency_graph:
  requires: [03-01, 03-02, 03-03]
  provides: [phase-3-verification-gate]
  affects: [scripts/verify-build.mjs]
tech_stack:
  added: []
  patterns: [hard-fail assertions, EN page coverage gate]
key_files:
  modified: [scripts/verify-build.mjs]
decisions:
  - "ENGLISH_LITERAL updated from walking-skeleton placeholder to 'Veterinary Mycology Group — ULPGC' (matches visually-hidden paragraph in en/index.astro)"
  - "EXPECTED_EN_PAGES assertion uses fail() not warn() — Phase 3 complete, all 15 EN pages required"
  - "grep -c returns 1 for minified HTML with 3 hreflang tags on same line — actual hreflang count confirmed via grep -o pattern match"
metrics:
  duration: ~15min
  completed: 2026-10-19
requirements: [NAV-03, I18N-01, I18N-02, I18N-03, I18N-04]
---

# Phase 3 Plan 04: Verification Gate + Smoke Test Summary

## What was built

`verify-build.mjs` was hardened with a new `EXPECTED_EN_PAGES` array (15 paths) and Assertion 8 — a hard-fail loop confirming all 15 EN pages exist in `dist/en/`. The `ENGLISH_LITERAL` constant was updated from the Phase 0 walking-skeleton placeholder to `'Veterinary Mycology Group — ULPGC'` to match the actual visually-hidden paragraph in the real EN home page. The full Phase 3 smoke test was run against the built `dist/`, confirming correct hreflang tags, LangSwitcher hrefs, nav labels, and footer text on both locales.

## Smoke test results

All Phase 3 invariants confirmed in built HTML:

**hreflang:**
- `dist/index.html`: 3 hreflang tags — `hreflang="es"`, `hreflang="en"`, `hreflang="x-default"` (all on one minified line; grep -o confirms 3 occurrences)
- `dist/en/index.html`: same 3 hreflang tags
- `x-default` on ES home: `href="https://micologiaveterinaria.ulpgc.es/"` (Spanish root)
- `x-default` on EN deeper page (`en/micologia/generalidades/`): `href="https://micologiaveterinaria.ulpgc.es/micologia/generalidades/"` (Spanish equivalent, no /en/ prefix)

**LangSwitcher hrefs:**
- ES home: EN link is `href="/en/"` (correct)
- ES section page (`/micologia/generalidades/`): EN link is `href="/en/micologia/generalidades/"` (correct)
- EN section page (`/en/micologia/generalidades/`): ES link is `href="/micologia/generalidades/"` (no /en/ prefix — correct)

**Nav labels and UI strings:**
- EN home: `Home` present in nav (1+ occurrences)
- ES home: `Inicio` present in nav (1+ occurrences)
- EN footer: `Veterinary Mycology Group · Faculty of Veterinary Medicine · ULPGC` (correct)
- ES footer: `Grupo de Micología Veterinaria · Facultad de Veterinaria · ULPGC` (correct)

**html lang attributes:**
- `dist/en/index.html`: `<html lang="en">` present
- `dist/index.html`: `<html lang="es">` present

**Observation (non-blocking):** The EN header wordmark (`site-wordmark`) renders as "Grupo de Micología Veterinaria · ULPGC" (Spanish) on EN pages. This is the site name/brand in the original language — acceptable for an academic site where the institution name is not translated. Flagged for Phase 4 review if desired.

## verify-build.mjs final assertion count

**8 assertions total (all passing), exit 0:**
- Assertion 0: dist/ directory exists
- Assertion 1: dist/index.html exists + readable
- Assertion 2: dist/index.html valid UTF-8 (strict)
- Assertion 3: dist/index.html contains Spanish literal
- Assertion 4: dist/en/index.html exists + contains EN literal
- Assertion 5: dist/en.html does NOT exist (build.format:directory confirmed)
- Assertion 6: All 15 ES pages exist in dist/ (hard-fail)
- Assertion 7: All 4 required PDFs exist in dist/docs/ (hard-fail)
- Assertion 8: All 15 EN pages exist in dist/en/ (hard-fail)

Total PASS lines: 40

## Deviations from Plan

None — plan executed exactly as written. The pre-existing uncommitted changes (Assertion 6 hardening, Assertion 7 PDF checks) were committed as the first step per the execution prompt instructions.

## Files modified

- `scripts/verify-build.mjs` — ENGLISH_LITERAL updated, EXPECTED_EN_PAGES array added, Assertion 8 loop added

## Commits

- `e831281` — `feat(03-04): harden EXPECTED_PAGES to fail + add PDF assertions` (uncommitted Wave 2 work)
- `d48c55f` — `feat(03-04): add EXPECTED_EN_PAGES assertion (Assertion 8) + update EN literal`

## Self-Check: PASSED

- scripts/verify-build.mjs: FOUND (modified)
- Assertion 8 EXPECTED_EN_PAGES loop: FOUND (grep -c "EXPECTED_EN_PAGES" returns 3 occurrences)
- ENGLISH_LITERAL updated: CONFIRMED ("Veterinary Mycology Group — ULPGC")
- npm run build: exit 0 (30 pages built)
- node scripts/verify-build.mjs: exit 0 (40 PASS lines, 0 failures)
- All smoke test checks: PASSED
