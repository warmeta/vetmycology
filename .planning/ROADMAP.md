# Roadmap — VetMyc

**Project:** Veterinary Mycology Group Website Modernization  
**Granularity:** coarse  
**Coverage:** 34/34 requirements mapped

---

## Phases

- [x] **Phase 1: Foundation + Pipeline** — Astro scaffolded, i18n locked, test page live on ULPGC server (completed 2026-10-18)
- [ ] **Phase 2: Spanish Content Migration** — All 14 sections live in Spanish with full layout and media
- [ ] **Phase 3: English + i18n** — Full bilingual site with language switcher and hreflang
- [ ] **Phase 4: Polish + Launch** — Accessibility audit, breadcrumbs, production smoke-test

---

## Phase Details

### Phase 1: Foundation + Pipeline

**Goal:** Developer has a validated, end-to-end pipeline — Astro project initialized, i18n URL structure locked, encoding extraction script written, and one test page confirmed live and correctly served on the ULPGC Apache server
**Mode:** mvp
**Depends on:** Nothing
**Requirements:** FOUND-01, FOUND-02, FOUND-03, FOUND-04
**Success Criteria** (what must be TRUE):

  1. Developer can run `astro build` and get a clean static output with no TypeScript errors
  2. A test page is reachable at the ULPGC server URL with correct UTF-8 rendering (ñ, á, é display correctly in browser)
  3. The i18n routing configuration (`prefixDefaultLocale`, `defaultLocale`, `locales`) is committed and will not require a rebuild after content migration begins
  4. Developer can pass any FrontPage `.htm` file through the extraction script and receive a UTF-8 Markdown file with no encoding artifacts (verified by `grep -rP "[\x80-\xFF]"` returning zero)

**Plans:** 3/3 plans complete
Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Scaffold Astro 7 + lock i18n + Spanish/English test pages build locally (Walking Skeleton core; FOUND-01, FOUND-02)
- [x] 01-03-PLAN.md — FrontPage ISO-8859-1 to UTF-8 Markdown extraction script with strict UTF-8 verifier and fixture round-trip test (FOUND-04)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — Webmaster coordination + deploy test pages to ULPGC Apache + verify UTF-8 live (FOUND-03)

### Phase 2: Spanish Content Migration

**Goal:** All 14 content sections are live in Spanish with a complete, responsive layout — navigation, media, and accessibility baseline all in place
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** NAV-01, NAV-02, NAV-04, NAV-05, CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, CONT-08, CONT-09, CONT-10, CONT-11, CONT-12, CONT-13, CONT-14, CONT-15, MEDIA-01, MEDIA-02, MEDIA-03, MEDIA-04
**Success Criteria** (what must be TRUE):

  1. Every one of the 14 content sections is reachable by clicking through the grouped top navigation on both desktop and mobile viewports (375px, 768px, 1280px)
  2. The image archive page displays thumbnails in a CSS Grid layout and a user can click any thumbnail to view the full image without JavaScript
  3. Long pathology pages (levaduras, filamentosos, dimórficos) display a working table of contents with anchor links to each disease section
  4. All PDF files (CV, protocols) open correctly from their links when served from the ULPGC Apache server

**Plans:** 5 plans
Plans:
**Wave 0**

- [ ] 02-01-PLAN.md — Fix extract_frontpage.py (<font> unwrap bug) + extend verify-build.mjs with EXPECTED_PAGES list (BLOCKING)

**Wave 1** *(blocked on Wave 0)*

- [ ] 02-02-PLAN.md — Design system (global.css tokens) + BaseLayout/ContentPage/TableOfContents + Header/TopNav/MobileNav/Footer + Content Collections schema (NAV-01, NAV-02, NAV-04, NAV-05, MEDIA-03)

**Wave 2** *(parallel; blocked on Wave 1)*

- [ ] 02-03-PLAN.md — Home page + 7 simple content section pages (CONT-01, CONT-02, CONT-03, CONT-04, CONT-11, CONT-12, CONT-13, CONT-15)
- [ ] 02-04-PLAN.md — 4 pathology pages (3 with TOC) + laboratorio + artículos y congresos (CONT-05, CONT-06, CONT-07, CONT-08, CONT-09, CONT-14, MEDIA-03)

**Wave 3** *(blocked on Waves 1 and 2)*

- [ ] 02-05-PLAN.md — Image archive page (CSS Grid + :target lightbox) + logos + PDFs + verify-build.mjs hard-fail upgrade + manual responsive/accessibility verification (CONT-10, MEDIA-01, MEDIA-02, MEDIA-04)

### Phase 3: English + i18n

**Goal:** Every Spanish page has a corresponding English page, the language switcher navigates to the same page in the other locale, and all UI strings display in the correct language
**Mode:** mvp
**Depends on:** Phase 2
**Requirements:** NAV-03, I18N-01, I18N-02, I18N-03, I18N-04
**Success Criteria** (what must be TRUE):

  1. Clicking "EN" from any Spanish page navigates to the English version of that same page (not the home page), and clicking "ES" from any English page returns to the Spanish version
  2. All 14 content sections have English pages at parallel `/en/[slug]/` URLs with complete translated content
  3. Every page `<head>` contains correct `hreflang` link elements for ES, EN, and `x-default` pointing to the Spanish version
  4. All navigation labels, footer text, language switcher aria-labels, and UI strings display in the correct language on each locale

**Plans:** TBD
**UI hint**: yes

### Phase 4: Polish + Launch

**Goal:** The site meets WCAG 2.1 AA baseline, every page shows a breadcrumb trail with structured data, and the full bilingual site passes a production smoke-test before announcement
**Mode:** mvp
**Depends on:** Phase 3
**Requirements:** FOUND-05, I18N-05
**Success Criteria** (what must be TRUE):

  1. Every page has a skip-to-content link, correct `<html lang>` attribute, semantic landmarks (`<main>`, `<nav>`, `<footer>`), and a valid heading hierarchy with no skipped levels
  2. Every page displays a breadcrumb trail in the page locale (e.g., `Inicio > Patologías > Levaduras`) and the breadcrumb renders `BreadcrumbList` structured data in the page source
  3. A full manual smoke-test across all 14 sections in both ES and EN on the live ULPGC server returns no broken links, no encoding artifacts, and no 404s

**Plans:** TBD

---

## Progress

| Phase | Name | Plans Complete | Status | Completed |
|-------|------|----------------|--------|-----------|
| 1 | Foundation + Pipeline | 3/3 | Complete   | 2026-10-18 |
| 2 | Spanish Content Migration | 0/5 | Not started | — |
| 3 | English + i18n | 0/? | Not started | — |
| 4 | Polish + Launch | 0/? | Not started | — |
