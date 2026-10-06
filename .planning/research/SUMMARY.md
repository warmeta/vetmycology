# Project Research Summary

**Project:** VetMyc — ULPGC Veterinary Mycology Website Modernization
**Domain:** Academic static site, FrontPage frameset migration, bilingual (ES/EN)
**Researched:** 2026-10-01
**Confidence:** HIGH for approach and feature set; MEDIUM for exact Astro API syntax (verify against live docs)

---

## Executive Summary

This is a content migration, not a product build. The source is a 2000s Microsoft FrontPage frameset site — ISO-8859-1 encoded, frameset-based navigation, no semantic HTML, last updated 2013. The target is a modern Astro static site deployable to an unchanged university Apache server. The migration pattern (FrontPage to Astro static) is well-established. The technical decisions are straightforward: Astro with `output: 'static'`, built-in i18n routing, Content Collections for typed markdown, plain CSS scoped styles, and rsync/FTP deployment. Zero server-side runtime is required or desired.

The biggest risks are not architectural — they are in the content extraction phase. ISO-8859-1 corruption, FrontPage WebBot artifacts, frameset topology mapping, and spaces in source filenames are all silent failures that compound if not caught before content is committed. The second highest risk is locking the wrong i18n URL structure early (`prefixDefaultLocale: false` puts Spanish at root; `prefixDefaultLocale: true` puts it at `/es/`), since changing it after content migration requires a full rebuild and redirect chain. Both risks are fully preventable with upfront audits in Phase 1 before a single line of content is migrated.

The English translation layer is a tertiary concern. Spanish is the site's primary deliverable and source of truth. The recommended build order is: (1) pipeline validated against the live server, (2) all 14 sections in Spanish, (3) English layer added to finalized Spanish, (4) polish and SEO. Treating English as a parallel track during Phase 2 is the primary scheduling trap.

---

## Key Findings

### Recommended Stack

Astro 4.x with `output: 'static'` is the clear choice. It is the only major framework where static-file output is the first-class mode, not a bolted-on export. It ships built-in i18n routing (no third-party library needed), Content Collections with Zod schema validation, and an integrated image optimization pipeline. Node.js 20 LTS is build-time only — nothing runs on the university server. Styling is plain CSS with scoped Astro `<style>` blocks and CSS Custom Properties for theming; Tailwind is unnecessary complexity for a content-heavy site maintained by one developer. No CI/CD pipeline is recommended for v1; build locally and deploy via rsync or FTP.

**Core technologies:**
- **Astro 4.x** — framework, routing, i18n, Content Collections — only framework with static-first output and native i18n
- **TypeScript (strict)** — type-safe content schemas and component props — required by Content Collections
- **Plain CSS + CSS Custom Properties** — scoped `<style>` blocks, theming tokens — no runtime cost, no preprocessor dependency
- **Astro built-in i18n** — `/es/` root and `/en/` prefix routing — replaces any third-party i18n library
- **Markdown + Content Collections** — all 14 content sections — typed frontmatter, build-time Zod validation
- **Prettier + prettier-plugin-astro** — code formatting — official Astro team plugin
- **rsync or FTP** — deployment to ULPGC Apache server — no CI/CD needed for single-developer project

**Verify at install time:** Astro 5 introduced a "Content Layer" API that may change `defineCollection` syntax. Check https://docs.astro.build/en/guides/content-collections/ before coding the schema.

---

### Expected Features

**Must have (table stakes):**
- All 14 content sections present and reachable — missing pages break links in published papers
- Bilingual ES/EN with persistent language switcher — text codes `ES / EN` in top-right header, links to same page in other language
- Grouped top navigation (5-6 clusters, not 14 flat items) — replaces frameset's persistent sidebar with a sticky top nav
- Responsive layout — the existing site is broken on mobile
- UTF-8 encoded output — ISO-8859-1 source must be converted cleanly
- Accessible image display with captions and alt text — image archive is primary content type
- PDF links that open correctly — CVs, protocols, articles
- Readable body typography — academic prose; contrast, line length, font size matter
- Per-page `<title>` and meta descriptions — academic bookmarking and search indexing
- Footer with ULPGC/IUSA affiliation — omitting it looks unofficial
- `<html lang="es/en">` per page — WCAG 2.1 AA and Spanish law (Real Decreto 1112/2018)
- Skip-to-content link — keyboard accessibility baseline

**Should have (do if schedule allows):**
- Open Graph meta tags — link previews for researchers sharing via email/Slack
- Print stylesheet for pathology and lab pages — veterinarians print diagnostic protocols; `@media print` is low effort
- Image lightbox via CSS `:target` — avoids full-size inline images; low effort
- Breadcrumbs — useful for search-engine landing pages; shows nav context
- Anchor links / same-page TOC on long pathology pages — multiple disease entries per page
- `localStorage` language preference persistence — 5 lines JS; avoids re-selecting locale on every page

**Defer to v2+:**
- Site search — 14 sections is small; browser Ctrl+F is sufficient
- Contact form — requires form backend; static server; use `mailto:` instead
- Dark mode toggle — no validated user need; adds CSS variable complexity
- Analytics with consent banner — GDPR/AEPD cookie consent complexity exceeds benefit for v1
- RSS feed — not a blog; no regular publication cadence
- Separate researcher profile pages — the grupo page covers ~5 researchers adequately
- CI/CD pipeline — single developer; build locally and deploy manually

---

### Architecture Overview

The architecture is a pure static pipeline: markdown files in `src/content/{es,en}/` are validated by Zod schemas, rendered by thin `.astro` page wrappers, passed through a two-level layout system (`BaseLayout` → `ContentLayout`), and output as a self-contained `dist/` folder for rsync deployment. Zero client-side JavaScript components are needed — every component is a server-render-only `.astro` file. Language switcher is a plain `<a>` tag.

**Major components:**
1. **`astro.config.mjs`** — `output: 'static'`, `site`, i18n block; `prefixDefaultLocale: false` (Spanish at root, English under `/en/`)
2. **`src/content/config.ts`** — Zod schemas for `es` and `en` collections; catches missing frontmatter at build time
3. **`BaseLayout.astro`** — `<html lang>`, `<head>`, global CSS, meta tags; accepts `lang` prop
4. **`ContentLayout.astro`** — wraps BaseLayout; responsive content area with slot
5. **`Nav.astro`** — grouped top nav (5-6 clusters), dropdown desktop / accordion mobile, sticky
6. **`LangSwitcher.astro`** — single `<a>` that swaps path between `/[slug]` and `/en/[slug]`
7. **`src/i18n/es.ts` + `en.ts`** — ~30 UI strings (nav labels, footer text, switcher labels); loaded at build time
8. **`ImageGallery.astro`** — CSS Grid thumbnail grid with captions; lightbox via CSS `:target` or minimal vanilla JS
9. **`BibEntry.astro`** — single citation renderer; no external citation library
10. **`public/`** — PDFs and images copied verbatim to `dist/`; Astro `<Image>` component handles resizing and lazy loading

**Slug strategy (load-bearing decision):** Keep all URL path segments in Spanish across both language trees (e.g., `/en/patologias/levaduras/` not `/en/pathologies/yeasts/`). Eliminates a slug translation table and makes the LangSwitcher a one-liner path replace.

---

### Critical Pitfalls

1. **ISO-8859-1 encoding corruption** — Source `.htm` files declare `charset=iso-8859-1`. Any tool opening them as UTF-8 silently mangles `ñ`, `á`, `é` into garbage (`patÃ³geno`). Rule: read with `latin-1`, write as UTF-8. Run `grep -rP "[\x80-\xFF]" src/content/` — must return zero before committing any content. Address in Phase 1 before migration begins.

2. **Frameset topology: no self-contained pages** — `index.htm` is `<frameset>` only with no body. Content lives in inner frame body fragments without `<title>` tags. Parse every `<frame src="">` attribute recursively before counting pages; treat the left sidebar frame as the sitemap; assign all titles and slugs manually.

3. **FrontPage WebBot and theme artifacts** — Source HTML contains `<!--webbot bot="Navigation"-->`, `<!--mstheme-->`, `_msstyle` class hooks. These survive into markdown as visible garbage. Grep source before extraction; strip at extraction time, not afterward.

4. **Wrong `prefixDefaultLocale` bakes in the wrong URL structure permanently** — `prefixDefaultLocale: false` puts Spanish at root; `prefixDefaultLocale: true` adds `/es/` prefix. Changing this after content migration requires a full rebuild and redirect chain. Decide before writing any content. For this site: `false`.

5. **`base` path misconfiguration silently unstyled** — If the site deploys to a subdirectory, all `/_astro/*.css` paths 404. Confirm the exact deployment URL with the ULPGC webmaster before writing `astro.config.mjs`. Test with `npx serve dist` before every deployment.

6. **Apache `.htaccess` silently ignored** — University servers often set `AllowOverride None`. All `.htaccess` redirect rules are silently ignored with no error logged. Ask the webmaster explicitly before relying on `.htaccess` for redirects or language detection.

7. **Filename spaces break Linux routing** — `patologias por levaduras.htm` works on macOS; the ULPGC Linux server serves it as a 404. Normalize all output filenames at extraction time: spaces to hyphens, lowercase. Run `find dist/ -name "* *"` after every build.

---

## Implications for Roadmap

### Phase 1: Source Audit and Project Setup

**Rationale:** The two most expensive failure categories — encoding corruption and wrong configuration — both happen before content migration. Discovering them after 14 sections are migrated is very costly. This phase validates the full pipeline against the live server before any content investment.

**Delivers:** Locked i18n URL structure, confirmed deployment path, working encoding extraction pipeline, one test page live on the university server.

**Must do before moving on:**
- Parse frameset topology; produce a page inventory with filenames, titles, and slugs
- Grep source files for `webbot`, `mstheme`, `_msstyle`, accented filenames, spaces in filenames
- Confirm deployment URL (root vs subdirectory) and `.htaccess` AllowOverride status with ULPGC webmaster
- Init Astro project; lock `prefixDefaultLocale` setting; verify one test page builds and deploys correctly
- Write extraction script: `latin-1` read → entity decode → tag strip → UTF-8 write; byte-check output

**Avoids:** Pitfalls 1–7 above.

---

### Phase 2: Spanish Content Migration

**Rationale:** Spanish is the primary deliverable and source of truth for English translation. Finalize all 14 sections and all components against Spanish content before duplicating the page tree for English. Changing component APIs after the EN tree exists means double work.

**Delivers:** All 14 sections in Spanish, fully styled, responsive, accessible, live on server.

**Must do:**
- Migrate all 14 sections to `src/content/es/` markdown with validated frontmatter
- Consolidate all images into `public/images/`; rename all PDFs to ASCII slugs in `public/docs/`
- Build `BaseLayout`, `ContentLayout`, `Nav` (5-6 grouped clusters), `Footer`, `ImageGallery`, `BibEntry`, `LinkList`
- Full accessibility baseline: skip link, alt text, `<html lang>`, heading hierarchy, keyboard nav
- Full CSS: responsive layout, typography, optional `@media print` for lab/pathology pages

**Avoids:** Content drift (Spanish frozen before EN begins); missing images (audit all `<img src>` at extraction time); accented PDF filename pitfall.

---

### Phase 3: English Translation and i18n Layer

**Rationale:** English translates finalized Spanish, not a moving target. Building the i18n layer on stable Spanish content means no rework. Component architecture must be complete before threading `lang` props throughout.

**Delivers:** Full bilingual site with working language switcher, `hreflang` tags, both locales building and deploying correctly.

**Must do:**
- Build `src/i18n/es.ts` and `en.ts` (UI strings); thread `lang` prop through all layouts and components
- Build `LangSwitcher.astro` using `getRelativeLocaleUrl()` [verify import path in live docs]
- Mirror `src/pages/en/` from `src/pages/es/`
- Add `translationKey` frontmatter to link ES and EN counterparts
- AI-assisted English translations into `src/content/en/`
- Add `hreflang` link tags in `<head>` with `x-default` pointing to Spanish

**Avoids:** Hardcoded Spanish in shared components; language switcher 404s on untranslated pages; content drift (`lastUpdated` frontmatter mismatch as warning sign).

---

### Phase 4: Polish, SEO, and Launch

**Rationale:** SEO and accessibility items need finalized content to be meaningful. Meta descriptions, sitemap, heading audit, and OG tags are fast but depend on stable URLs and content.

**Delivers:** Production-ready site: sitemap, Open Graph tags, 404 page, breadcrumbs, canonical URLs, accessibility audit.

**Must do:**
- Add `@astrojs/sitemap` (verify multilingual config against live docs — LOW confidence area)
- Add Open Graph meta tags to `BaseLayout`
- Add breadcrumbs component
- WCAG 2.1 AA contrast check on final color scheme
- Manual link-rot audit on external links sections
- Full smoke-test across ES and EN before announcing

---

### Phase Ordering Rationale

- Phase 1 must precede everything: configuration errors and encoding pipeline issues discovered here cannot be fixed cheaply post-migration
- Phase 2 (Spanish only) must precede Phase 3 (English): English translates finalized source; running them in parallel is the primary scheduling trap
- Phase 4 items (sitemap, OG, breadcrumbs) require stable content and URLs; adding them to earlier phases wastes time if structure changes

### Research Flags

**Phases needing live doc verification during implementation:**
- **Phase 1 / Phase 3 (Astro i18n API):** `routing:` block keys, `getRelativeLocaleUrl` import path, and `@astrojs/sitemap` multilingual config are MEDIUM/LOW confidence — verify against https://docs.astro.build before implementing
- **Phase 1 (server setup):** ULPGC Apache configuration (AllowOverride, subdirectory path, HTTPS) is unknown — requires webmaster confirmation; no research substitutes

**Phases with standard, well-documented patterns:**
- **Phase 2 (content migration):** Markdown-to-Astro Content Collections is a stable, well-documented pattern; encoding extraction pipeline is fully specified in PITFALLS.md
- **Phase 4 (polish):** Open Graph, print stylesheets, breadcrumbs, accessibility checklist are all standard patterns

---

## Contradictions and Open Questions

**One contradiction between research files:**

STACK.md recommends using Astro's built-in WebP conversion via `<Image>` for the image archive. FEATURES.md recommends against it, noting the university server has no image CDN and suggesting JPEG be served as-is. Resolution: use Astro `<Image>` for resizing and lazy loading, but test WebP conversion on a sample against the actual Apache server before committing to it for the full archive.

**Open questions research could not resolve:**

- Is `.htaccess` `AllowOverride` enabled on the ULPGC server? Must confirm with webmaster — silent failure if not.
- Is the site deployed at domain root or a subdirectory? Determines whether `base:` config is needed. Must confirm before writing `astro.config.mjs`.
- Are English translations drafted, partially drafted, or starting from scratch? Determines Phase 3 scope.
- Does ULPGC have a mandatory brand or style guide for faculty sites?
- What citation format does the mycology group use — Vancouver, APA, or a specific journal style?
- Do the old FrontPage `.htm` URLs need Apache redirect rules, or is breakage acceptable? (Research recommends no preservation needed given near-zero SEO value, but confirm with Dr. Acosta.)
- Which Astro major version will be installed? Astro 5 Content Layer API may differ from Astro 4 Content Collections.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Astro static-site pattern is stable; architectural choices are well-supported |
| Features | HIGH | Academic site feature set is a well-understood domain; legal accessibility requirements confirmed |
| Architecture | MEDIUM | Project structure and component design are HIGH; exact Astro i18n and Content Collections API syntax needs live verification |
| Pitfalls | HIGH (encoding/Apache) / LOW (Astro API names, ULPGC server config) | Encoding and FrontPage migration pitfalls are well-documented; server config requires webmaster confirmation |

**Overall confidence:** MEDIUM-HIGH. The approach is correct and well-researched. Remaining uncertainty is in Astro version-specific API syntax and ULPGC server configuration — both resolvable in Phase 1 before any content is committed.

### Gaps to Address

- **Astro 4 vs 5 API:** Verify `defineCollection` syntax, `getRelativeLocaleUrl` import path, and `@astrojs/sitemap` multilingual config against live docs before coding Phase 2 schema and Phase 3 i18n layer
- **ULPGC server config:** Confirm `AllowOverride`, deployment URL, HTTPS enforcement, and file permission requirements with the webmaster before finalizing `astro.config.mjs` in Phase 1
- **English translation scope:** Assess whether translations are available or require AI-assisted drafting to size Phase 3 accurately

---

## Sources

### Primary (HIGH confidence)
- Astro documentation (training data, August 2025): https://docs.astro.build
- Astro i18n routing guide: https://docs.astro.build/en/guides/internationalization/
- Astro Content Collections: https://docs.astro.build/en/guides/content-collections/
- Astro static output and deployment: https://docs.astro.build/en/guides/deploy/

### Secondary (MEDIUM confidence)
- Astro built-in i18n routing API: `routing:` block keys and helper import paths — MEDIUM; verify live
- Component architecture patterns: HIGH — standard Astro conventions

### Tertiary (LOW confidence / needs validation)
- `@astrojs/sitemap` multilingual config: LOW — needs live doc check before Phase 4
- ULPGC Apache server configuration: unknown — requires direct confirmation with university webmaster
- Astro 5 Content Layer API differences: unknown — verify if Astro 5 is installed

---

*Research completed: 2026-10-01*
*Ready for roadmap: yes*
