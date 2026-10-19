---
plan: 03-02
phase: 03-english-i18n
status: complete
completed: 2026-10-19
---

# Summary — Plan 03-02: EN Non-TOC Pages

## What was built

10 English-language markdown content files in the parallel `-en` collections plus 11 EN Astro pages under `src/pages/en/` — including replacing the walking skeleton at `/en/` with a real BaseLayout home page — bringing 11 of 15 EN pages live at their `/en/*` URLs in the built `dist/en/`.

## Files created

**Task 1 — 10 EN markdown files:**
- `src/content/micologia-en/generalidades.md` — Generalities of Pathogenic Fungi (full translation)
- `src/content/micologia-en/grupo-de-trabajo.md` — Research Group members
- `src/content/micologia-en/colreptiles.md` — Reptile collaboration publications
- `src/content/patologias-en/micosis-peces.md` — Fish mycoses, saprolegniasis, aphanomycosis
- `src/content/investigacion-en/articulos-congresos.md` — Articles, congresses, theses, projects
- `src/content/investigacion-en/articulos-interesantes.md` — Interesting article links
- `src/content/laboratorio-en/laboratorio.md` — Mycological Diagnostic Laboratory
- `src/content/recursos-en/links-micologia.md` — Mycology external links
- `src/content/recursos-en/links-revistas.md` — Mycology journal links
- `src/content/recursos-en/bibliografia.md` — Reference bibliography

**Task 2 — 11 EN Astro pages (1 replaced, 10 new):**
- `src/pages/en/index.astro` — Real EN home page (REPLACED walking skeleton)
- `src/pages/en/micologia/generalidades.astro`
- `src/pages/en/micologia/grupo-de-trabajo.astro`
- `src/pages/en/micologia/colreptiles.astro`
- `src/pages/en/patologias/micosis-peces.astro`
- `src/pages/en/investigacion/articulos-congresos.astro`
- `src/pages/en/investigacion/articulos-interesantes.astro`
- `src/pages/en/laboratorio/index.astro`
- `src/pages/en/recursos/links-micologia.astro`
- `src/pages/en/recursos/links-revistas.astro`
- `src/pages/en/recursos/bibliografia.astro`

## Verification

**`npx astro check`**: 0 errors, 0 warnings, 0 hints (35 files checked)

**`npm run build`**: 30 pages built in 558ms — 0 errors

**dist/en/ structure confirmed:**
- `dist/en/index.html` — contains `<html lang="en">`, `VETERINARY MYCOLOGY GROUP`, hreflang tags, visually-hidden `Veterinary Mycology Group — ULPGC` literal
- `dist/en/micologia/generalidades/index.html` — present, contains hreflang, EN nav labels
- `dist/en/laboratorio/index.html` — present
- `dist/en/investigacion/articulos-congresos/index.html` — present
- `dist/en/recursos/bibliografia/index.html` — present
- LangSwitcher on EN pages: ES links to Spanish equivalent, EN marked `aria-current="page"`

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] 10 EN markdown files created with `lang: "en"` frontmatter and non-empty bodies
- [x] No EN markdown file has `toc: true`
- [x] `src/pages/en/index.astro` is replaced; contains `BaseLayout` and `lang="en"`; does NOT contain "walking skeleton" in HTML body
- [x] All 10 EN content pages exist under `src/pages/en/`
- [x] Each uses `getEntry('[collection]-en', '[slug]')` pattern
- [x] `dist/en/index.html` contains `VETERINARY MYCOLOGY GROUP`
- [x] `dist/en/micologia/generalidades/index.html` exists
- [x] `dist/en/laboratorio/index.html` exists
- [x] `dist/en/investigacion/articulos-congresos/index.html` exists
- [x] `dist/en/recursos/bibliografia/index.html` exists
- [x] Commits: `cd6d208` (Task 1), `cdc6796` (Task 2)

## Self-Check: PASSED
