# Phase 2: Spanish Content Migration - Context

**Gathered:** 2026-10-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver all 14 Spanish content sections with a complete, responsive layout — base layout component, grouped top navigation, styled content pages, image archive with CSS Grid, TOC for pathology pages, and PDF links. Source content extracted from FrontPage HTM backup at `~/Downloads/backup/`. GIFs excluded; all text and JPG/PNG images preserved.

</domain>

<decisions>
## Implementation Decisions

### Visual Identity
- **D-01:** Primary color — verde bosque oscuro `#2D6A4F` for header, nav background, and primary interactive elements.
- **D-02:** Accent color — verde menta `#52B788` for hover states, links, active indicators, and decorative accents.
- **D-03:** Text color — `#1A1A1A` on white `#FFFFFF` background. WCAG AA contrast maintained throughout.
- **D-04:** Typography — Inter (400/600) for navigation, UI labels, and body text; Source Serif 4 (400/700) for `<h1>`/`<h2>` headings in content sections. Both loaded from Google Fonts with `display=swap` and `<link rel="preconnect">`.
- **D-05:** Aesthetic — modern, clean, academic-scientific tone. No decorative borders, no gradients, no shadows on text. White background, generous whitespace.

### Navigation Architecture
- **D-06:** Desktop behavior — CSS hover dropdown using `:hover` + `:focus-within` (no JavaScript). Groups display sub-pages on hover; keyboard users can navigate with Tab/Enter.
- **D-07:** Navigation clusters (6 groups):
  - **Inicio** — Home page (no dropdown)
  - **Micología** → Generalidades de los hongos, Grupo de trabajo, Colaboración con reptiles
  - **Patologías** → Levaduras (Candidiasis, Criptococosis, Malassezias), Filamentosos, Dimórficos, Micosis peces
  - **Investigación** → Artículos y congresos, Artículos interesantes
  - **Laboratorio** — Diagnóstico de laboratorio (no dropdown — single page)
  - **Recursos** → Archivo de imágenes, Links micología, Links revistas, Bibliografía
- **D-08:** Mobile behavior — hamburger button opens a full-screen overlay. Groups expand as accordions (CSS `:checked` on hidden checkbox or `<details>`/`<summary>` for zero-JS). Close button (✕) in top-right. No JavaScript required.
- **D-09:** Header layout — logo/group name left, nav right (desktop); logo + hamburger icon on same row (mobile). Header is sticky (`position: sticky; top: 0`).

### Content Page Layout
- **D-10:** All content pages use a single centered column with `max-width: 740px; margin: 0 auto` for prose. No sidebar on content pages.
- **D-11:** Table of contents on pathology pages (levaduras, filamentosos, dimórficos) — rendered as a bordered `<nav aria-label="En esta página">` box at the TOP of the content, before the first section heading. Links are in-page anchors. Implemented via Astro component injected into the MDX/Markdown layout when `toc: true` in frontmatter.
- **D-12:** Image archive page uses CSS Grid: `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))` on desktop, `minmax(140px, 1fr)` on mobile. CSS-only lightbox via `:target` pseudo-class (no JavaScript).

### Content Source & Migration
- **D-13:** Source files location — `~/Downloads/backup/` (NOT committed to repo). Contains 31 `.htm` files in ISO-8859-1 encoding and associated image directories.
- **D-14:** Extraction tool — `scripts/extract_frontpage.py` (built in Phase 1) converts `.htm` → UTF-8 Markdown. Run manually per-file during migration.
- **D-15:** GIFs — excluded from migration (decorative FrontPage-era graphics). Only `.jpg` and `.png` images are migrated.
- **D-16:** Images committed to `public/images/[section-slug]/` with filenames lowercased and spaces replaced by hyphens (ASCII-safe for Apache).
- **D-17:** PDFs committed to `public/docs/` with ASCII-only filenames.

### Claude's Discretion
- Exact CSS Custom Property names and token structure (colors, spacing, font sizes)
- Specific Inter/Source Serif 4 font weight combinations beyond Inter 400/600 and Serif 400/700
- Footer layout details (ULPGC + IUSA logos placement, affiliation text wrapping)
- Breadcrumb component implementation details (deferred to Phase 4)
- Card or list presentation for bibliography and links pages

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase requirements
- `.planning/REQUIREMENTS.md` — Full requirement list: NAV-01 to NAV-05, CONT-01 to CONT-15, MEDIA-01 to MEDIA-04 (all Phase 2 targets)
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, and mode (mvp)

### Phase 1 decisions (carry forward)
- `.planning/phases/01-foundation-pipeline/01-01-SUMMARY.md` — Astro 7 API decisions: content config path, glob() loader, z from astro/zod, build.format:directory
- `.planning/phases/01-foundation-pipeline/01-RESEARCH.md` — Astro 7 pitfalls and patterns (Spanish-slug strategy, i18n routing, Content Collections)
- `.planning/phases/01-foundation-pipeline/SKELETON.md` — Walking skeleton architectural decisions (locked)

### Project config
- `astro.config.mjs` — i18n config (locked: defaultLocale:'es', prefixDefaultLocale:false, no base)
- `src/content.config.ts` — existing Content Collections scaffold

### Content source
- `~/Downloads/backup/` — 31 .htm source files + images (NOT in repo — local path only)
- `scripts/extract_frontpage.py` — extraction tool to convert .htm → UTF-8 Markdown

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/pages/index.astro` — walking skeleton page: shows existing `<html lang="es">`, charset meta, scoped style pattern. Replace content, keep structure.
- `src/pages/en/index.astro` — English counterpart pattern.
- `public/.htaccess` — Apache config already in place (DirectoryIndex, UTF-8, HTTPS redirect, cache headers).

### Established Patterns
- **Scoped styles in `.astro` files** — no global CSS frameworks; all styles are `<style>` blocks scoped to their component.
- **CSS Custom Properties for theming** — decided in CLAUDE.md tech stack. Define all colors/spacing/fonts in a global `:root` block (e.g., in a `src/styles/global.css` imported in the base layout).
- **Content Collections with glob() loader** — `src/content.config.ts` already scaffolded; add collections per content group.
- **Spanish-slug URLs** — `/patologias/levaduras/`, NOT `/pathologies/yeasts/`. English mirrors: `/en/patologias/levaduras/`.

### Integration Points
- Base layout component (`src/layouts/BaseLayout.astro`) — new file; will wrap all pages. Imports header, nav, footer.
- All existing `src/pages/*.astro` test pages will be REPLACED by real content pages in this phase.

</code_context>

<specifics>
## Specific Ideas

- **Green palette origin:** User specifically requested green. Chosen shade #2D6A4F (forest green) + #52B788 (mint accent) gives WCAG AA contrast while feeling scientific/natural — appropriate for mycology.
- **Font pairing intent:** Source Serif 4 headings give academic credibility to section titles; Inter body text keeps long prose legible at small sizes on screen.
- **Mobile menu:** Full-screen overlay preferred over drawer — easier to tap on small screens, no content obscured behind a partial panel.
- **TOC placement:** Top of page (not sticky sidebar) — chosen for simplicity and mobile-first compatibility. Works without JavaScript.
- **Image archive lightbox:** CSS `:target` pattern — confirmed in MEDIA-02 requirement. No JavaScript library.

</specifics>

<deferred>
## Deferred Ideas

- **Breadcrumbs** — mentioned in NAV requirements but scoped to Phase 4 (Polish + Launch, I18N-05). Do not implement in Phase 2.
- **Language switcher** — Phase 3 (English + i18n). Header placeholder "ES | EN" can be static text in Phase 2.
- **hreflang tags** — Phase 3.
- **Print stylesheet** — v2 requirement, out of scope entirely for v1.
- **Dark mode** — explicitly out of scope (CLAUDE.md).

</deferred>

---

*Phase: 2-spanish-content-migration*
*Context gathered: 2026-10-18*
