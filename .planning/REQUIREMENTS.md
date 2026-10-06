# Requirements — VetMyc

**Version:** v1  
**Project:** Veterinary Mycology Group Website Modernization  
**Last updated:** 2026-10-02 after requirements definition

---

## v1 Requirements

### Foundation

- [ ] **FOUND-01**: Developer can run `npm create astro@latest`, configure TypeScript strict mode, set `output: 'static'`, and get a clean build pipeline
- [ ] **FOUND-02**: `astro.config.mjs` has i18n routing locked (defaultLocale, locales, prefixDefaultLocale) before any content pages are created
- [ ] **FOUND-03**: A test page deployed to the ULPGC Apache server confirms DirectoryIndex, file permissions, and UTF-8 encoding all work correctly end-to-end
- [ ] **FOUND-04**: Developer has a script or documented procedure to convert FrontPage ISO-8859-1 `.htm` files to clean UTF-8 Markdown (handles entity decoding, tag stripping, `&nbsp;` removal, WebBot comment stripping)
- [ ] **FOUND-05**: Every page has a skip-to-content link, `<html lang>` matching its locale, semantic landmark elements (`<main>`, `<nav>`, `<footer>`), and a logical `<h1>` → `<h2>` → `<h3>` heading hierarchy — meeting WCAG 2.1 AA as required by Real Decreto 1112/2018

### Navigation & Layout

- [ ] **NAV-01**: A base layout component wraps every page with a consistent header, top navigation, main content slot, and footer
- [ ] **NAV-02**: User can navigate all 14 content sections through a grouped top navigation bar with 5-6 clusters (Inicio, Micología, Patologías, Investigación, Laboratorio, Recursos); desktop shows dropdowns on hover/focus, mobile shows an accordion behind a hamburger
- [ ] **NAV-03**: User can switch between Spanish and English by clicking "ES" or "EN" text codes in the header; the link navigates to the same page in the other language (not the home page)
- [ ] **NAV-04**: Site renders correctly and is usable at all common viewport widths (mobile 375px, tablet 768px, desktop 1280px)
- [ ] **NAV-05**: Footer displays ULPGC and IUSA institutional logos, faculty name (Facultad de Veterinaria), and correct affiliation text in the page locale

### Content Migration — Spanish

- [ ] **CONT-01**: Home page displays group title (GRUPO DE MICOLOGÍA VETERINARIA), ULPGC and IUSA logos, Dr. Begoña Acosta Hernández name with link to CV PDF, and at least 3 representative scientific photographs
- [ ] **CONT-02**: Micología page contains the complete "Generalidades de los hongos patógenos" content migrated from `generalidades_1.htm`, rendered as clean prose with correct headings
- [ ] **CONT-03**: Grupo de trabajo page displays research group members and roles, migrated from `grupo_de_trabajo.htm`
- [ ] **CONT-04**: Colaboración con reptiles page contains content migrated from `colreptiles.htm`
- [ ] **CONT-05**: Artículos y congresos page contains the complete articles and conference communications list, migrated from `comunicaciones en revistas y congresos.htm`
- [ ] **CONT-06**: Patologías por levaduras section contains pages for Candidiasis animal, Criptococosis, and Patologías por Malassezias, migrated from `patologias por levaduras.htm` sub-pages
- [ ] **CONT-07**: Patologías por hongos filamentosos page contains migrated content from `patologias por filamentosos.htm`
- [ ] **CONT-08**: Patologías por hongos dimórficos page contains migrated content from `patologias por dimorficos.htm`
- [ ] **CONT-09**: Principales micosis de los peces page contains migrated content from `principales_enfermedades_pecesi.htm`
- [ ] **CONT-10**: Archivo de imágenes page displays scientific photographs in a responsive CSS Grid thumbnail layout (migrated from `archivo_de_imagenes_propias..htm`)
- [ ] **CONT-11**: Artículos interesantes page contains curated article links, migrated from `articulos_1.htm`
- [ ] **CONT-12**: Links de micología page contains categorized external mycology links, migrated from `links_de_micologia..htm`
- [ ] **CONT-13**: Links revistas de micología page contains journal links, migrated from `links_revistas_de_micologia..htm`
- [ ] **CONT-14**: Laboratorio de diagnóstico page contains diagnostic procedures content (Diagnóstico Micológico, Diagnóstico de Criptococosis, etc.), migrated from `enfermedades_infecciosas..htm`
- [ ] **CONT-15**: Bibliografía page contains the complete bibliography, migrated from `bibliografia_1.htm`, with DOI links where available

### Media & Interactivity

- [ ] **MEDIA-01**: Image archive renders as a CSS Grid thumbnail grid (3-4 columns desktop, 2 columns mobile); images do not overflow the layout
- [ ] **MEDIA-02**: User can click any thumbnail in the image archive to view the full-resolution image in a CSS-only lightbox (`:target` selector pattern, no JavaScript library)
- [ ] **MEDIA-03**: Long pathology pages (levaduras, filamentosos, dimórficos) have a same-page table of contents with anchor links to each disease section
- [ ] **MEDIA-04**: All PDF files (CV, protocols) are served from `public/docs/` with ASCII-only filenames; PDF links open the file in-browser or trigger download correctly on the university server

### Bilingual (English)

- [ ] **I18N-01**: Every Spanish page has a corresponding English page at the parallel `/en/[slug]/` URL; the EN page tree mirrors the ES structure completely
- [ ] **I18N-02**: All 14 content sections have English translations (AI-assisted first pass, reviewed and committed by developer)
- [ ] **I18N-03**: Every page includes correct `hreflang` link elements pointing to the ES and EN versions (including `x-default` pointing to the Spanish version)
- [ ] **I18N-04**: All UI strings (navigation labels, footer text, language switcher aria-labels, breadcrumb labels) are translated and display in the correct language on each page
- [ ] **I18N-05**: Every page displays a breadcrumb trail (e.g., `Inicio > Patologías > Levaduras`) in the page locale, using structured data markup (`BreadcrumbList`)

---

## v2 Requirements (deferred)

- Print stylesheet for pathology and diagnostic lab pages
- Open Graph / social preview meta tags
- Language preference persistence via localStorage
- Link-rot checker for external links sections (automated)
- Sitemap submitted to Google Search Console
- `@astrojs/sitemap` integration

---

## Out of Scope

- **CMS or admin UI** — developer updates via git/markdown; no editorial UI needed
- **Search** — 14 sections is navigable without search; defer to v2 if users request it
- **Contact form** — university server is static-only; use `mailto:` link in footer
- **Analytics with consent banner** — GDPR/AEPD cookie banner complexity exceeds v1 benefit; server logs are sufficient
- **Dark mode** — no validated user need; adds CSS variable complexity
- **RSS feed** — site is not a blog; no publication cadence
- **Per-member profile pages** — grupo de trabajo is one page; separate profile URLs are over-engineering for a ~5-person group
- **Social sharing buttons** — privacy cost (third-party scripts) exceeds benefit; Open Graph covers social sharing via URL paste
- **Publication import from ORCID/PubMed API** — incompatible with static output; articles are manually curated in markdown

---

## Traceability

| Req ID | Phase | Status |
|--------|-------|--------|
| FOUND-01 | Phase 1 | Pending |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Pending |
| FOUND-04 | Phase 1 | Pending |
| FOUND-05 | Phase 4 | Pending |
| NAV-01 | Phase 2 | Pending |
| NAV-02 | Phase 2 | Pending |
| NAV-03 | Phase 3 | Pending |
| NAV-04 | Phase 2 | Pending |
| NAV-05 | Phase 2 | Pending |
| CONT-01 | Phase 2 | Pending |
| CONT-02 | Phase 2 | Pending |
| CONT-03 | Phase 2 | Pending |
| CONT-04 | Phase 2 | Pending |
| CONT-05 | Phase 2 | Pending |
| CONT-06 | Phase 2 | Pending |
| CONT-07 | Phase 2 | Pending |
| CONT-08 | Phase 2 | Pending |
| CONT-09 | Phase 2 | Pending |
| CONT-10 | Phase 2 | Pending |
| CONT-11 | Phase 2 | Pending |
| CONT-12 | Phase 2 | Pending |
| CONT-13 | Phase 2 | Pending |
| CONT-14 | Phase 2 | Pending |
| CONT-15 | Phase 2 | Pending |
| MEDIA-01 | Phase 2 | Pending |
| MEDIA-02 | Phase 2 | Pending |
| MEDIA-03 | Phase 2 | Pending |
| MEDIA-04 | Phase 2 | Pending |
| I18N-01 | Phase 3 | Pending |
| I18N-02 | Phase 3 | Pending |
| I18N-03 | Phase 3 | Pending |
| I18N-04 | Phase 3 | Pending |
| I18N-05 | Phase 4 | Pending |
