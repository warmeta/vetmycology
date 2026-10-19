---
plan: 03-01
phase: 03-english-i18n
status: complete
completed: 2026-10-19
---

# Summary — Plan 03-01: i18n Infrastructure

## What was built

Complete i18n infrastructure layer wiring the translation dictionary, language switcher, hreflang link injection, and locale-aware nav hrefs across all shared layout components. Every subsequent English page in Plans 03-02 and 03-03 can now use this infrastructure without any further shared-component changes.

## Files created/modified

**Created:**
- `src/i18n/ui.ts` — 30-key ES+EN typed translation dictionary with `useTranslations()` helper
- `src/components/LangSwitcher.astro` — ES | EN switcher using `getRelativeLocaleUrl` + `Astro.currentLocale ?? 'es'`
- `src/content/micologia-en/.gitkeep` — EN content directory placeholder
- `src/content/patologias-en/.gitkeep` — EN content directory placeholder
- `src/content/investigacion-en/.gitkeep` — EN content directory placeholder
- `src/content/laboratorio-en/.gitkeep` — EN content directory placeholder
- `src/content/recursos-en/.gitkeep` — EN content directory placeholder

**Modified:**
- `src/content.config.ts` — added 5 EN collection definitions; export object now has 10 collections
- `src/layouts/BaseLayout.astro` — added `getAbsoluteLocaleUrl` hreflang link tags (es/en/x-default); passes `lang` to `<Header>` and `<Footer>`
- `src/components/Header.astro` — added `lang` prop, `useTranslations`, `LangSwitcher`, locale-aware wordmark href
- `src/components/Footer.astro` — added `lang` prop and `useTranslations` for affiliation and contact label
- `src/components/TableOfContents.astro` — added `lang` prop and `useTranslations` for TOC title and aria-label
- `src/components/TopNav.astro` — added `lang` prop, `getRelativeLocaleUrl`, `useTranslations` for all nav labels and hrefs
- `src/components/MobileNav.astro` — same as TopNav plus translated hamburger open/close aria-labels
- `src/layouts/ContentPage.astro` — passes `lang` prop through to `<TableOfContents>`

## Key decisions

1. **30 keys vs RESEARCH.md Pattern 1 key mismatch**: The RESEARCH.md Pattern 1 code block uses `lang.current` (singular), but the UI String Inventory table (rows 27-28) specifies `lang.current.es` and `lang.current.en` as separate keys. The inventory table was used as the authoritative source per plan instructions. `lang.switch.es` and `lang.switch.en` keys are also included for the LangSwitcher component to use directly as aria-labels.

2. **LangSwitcher uses literal aria-label strings**: Since LangSwitcher derives its current locale from `Astro.currentLocale` rather than a prop, it does not have a `lang` prop and therefore cannot call `useTranslations()`. Literal aria-label strings ("Idioma: Español", "Language: English", etc.) are used directly — consistent with the RESEARCH.md Pattern 2 code example.

3. **TopNav Micología group-label href**: The group-label for nav groups with children links to `group.children[0].href` — preserved from the existing Phase 2 implementation. With locale-aware hrefs, this now correctly points to the first child's locale-prefixed URL.

4. **Pre-existing changes not staged**: `scripts/verify-build.mjs` and an earlier minor `TopNav.astro` change (`.top-nav ul` → `.top-nav > ul`) were already modified before this plan ran. Only plan-scoped files were committed; those pre-existing changes remain unstaged as they are out of scope.

## Verification

**`npx astro check`**: 0 errors, 0 warnings, 0 hints (31 files checked)

**`npm run build`**: ✓ Completed — 16 pages built in 544ms

**`node scripts/verify-build.mjs`**: All 25 assertions passed

**hreflang in dist/index.html**: Confirmed — three `<link rel="alternate">` elements present:
- `hreflang="es"` → `https://micologiaveterinaria.ulpgc.es/`
- `hreflang="en"` → `https://micologiaveterinaria.ulpgc.es/en/`
- `hreflang="x-default"` → `https://micologiaveterinaria.ulpgc.es/`

## Self-Check

- [x] `src/i18n/ui.ts` exists with 30 ES + 30 EN keys and `export function useTranslations`
- [x] `src/components/LangSwitcher.astro` exists with `getRelativeLocaleUrl`
- [x] `src/layouts/BaseLayout.astro` contains `hreflang` link tags and passes `lang` to Header/Footer
- [x] `src/content.config.ts` exports 10 collections including `'micologia-en'`
- [x] All 5 EN content directories exist
- [x] Commits: `083989a`, `6d90d46`, `17ee036`
- [x] Build and verify-build pass

## Self-Check: PASSED
