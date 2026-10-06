# Walking Skeleton — VetMyc

**Phase:** 1 — Foundation + Pipeline
**Generated:** 2026-10-06

## Capability Proven End-to-End

A developer-maintained Astro 7 static site builds locally and deploys a Spanish test page (`/`) and English test page (`/en/`) to the ULPGC Apache server, where both pages render Spanish characters (ñ, á, é) correctly as UTF-8 — proving the full scaffold → i18n routing → build → rsync/sftp deploy → Apache DirectoryIndex pipeline works end-to-end.

In parallel, a Python 3 extraction script converts a FrontPage ISO-8859-1 `.htm` fixture to clean UTF-8 Markdown with WebBot artifacts stripped — proving the content migration pipeline will work for Phase 2.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Astro 7.3.5 (static output) | Content-first SSG; zero runtime JS by default; ULPGC Apache cannot host Node.js runtime. **Note:** Astro 7, not v4 documented in CLAUDE.md. |
| TypeScript | strict (`astro/tsconfigs/strict`) | Catches schema errors at build time; required for Content Collections type inference |
| Build output | `output: 'static'` + `build.format: 'directory'` | Produces `dist/<page>/index.html`; served directly by Apache DirectoryIndex with no `.htaccess` rewrites |
| i18n routing | `defaultLocale: 'es'`, `locales: ['es', 'en']`, `prefixDefaultLocale: false`, `redirectToDefaultLocale` left at default (false) | Spanish at root (`/`), English under `/en/`; locked before any content pages are committed (per STATE.md decision) |
| Content Collections | `src/content.config.ts` (Astro 7 location) + `glob()` loader + `z` from `astro/zod` | Astro 7 API — the Astro 4 path/syntax is removed |
| Styling | Plain scoped CSS in `.astro` files + CSS Custom Properties | No build-tool overhead; no utility-class noise in markdown-heavy templates |
| Formatting | Prettier 3.9.9 + `prettier-plugin-astro` 1.1.0 | Official Astro-team plugin for `.astro` file formatting |
| Deployment target | ULPGC Apache (`micologiaveterinaria.ulpgc.es`) via rsync/sftp | University-managed server; no CI/CD pipeline for v1; webmaster must confirm root vs subdirectory before `site`/`base` are finalized |
| Content migration tooling | Python 3 + `beautifulsoup4` 4.15.0 + `markdownify` 1.2.3 + stdlib `html.unescape` | One-time ISO-8859-1 → UTF-8 Markdown extraction; parse-then-strip-then-convert pipeline (WebBot regex pre-pass before BeautifulSoup) |
| UTF-8 verification | Python strict codec (`open(path, encoding='utf-8', errors='strict').read()`) | `grep -rP "[\x80-\xFF]"` as written in ROADMAP is semantically wrong for Spanish — valid UTF-8 multi-byte chars match that range |
| Directory layout | `src/pages/` for Spanish, `src/pages/en/` for English, `src/content/pages/` for markdown bodies, `scripts/` for Python tooling, `public/` for PDFs/images | Astro 7 file-system routing; Spanish-slug strategy (`/en/patologias/` not `/en/pathologies/`) locked in STATE.md |

## Stack Touched in Phase 1

- [x] Project scaffold — Astro 7 install, TypeScript strict, Prettier config, `package.json` engines
- [x] Routing — real `/` (Spanish test page) and `/en/` (English test page) routes
- [x] Content Collections — `src/content.config.ts` scaffolded (no entries yet; wiring validated at build)
- [x] UI — one `.astro` page per locale with Spanish special characters rendered in the markup
- [x] Deployment — test page deployed and reachable on ULPGC Apache at the webmaster-confirmed URL with UTF-8 served correctly
- [x] Build-tooling pipeline — Python extraction script converts a FrontPage fixture to UTF-8 Markdown (one-time build-time tooling, not deployed)

## Out of Scope (Deferred to Later Slices)

- Base layout component with header/footer/nav (NAV-01) — Phase 2
- Grouped top navigation with 5-6 clusters and mobile hamburger (NAV-02) — Phase 2
- Any of the 14 content section pages — Phase 2
- Image archive thumbnail grid and CSS `:target` lightbox (MEDIA-01, MEDIA-02) — Phase 2
- Language switcher UI (ES/EN button that preserves slug) (NAV-03) — Phase 3
- `hreflang` tags and `x-default` (I18N-03) — Phase 3
- Breadcrumbs with `BreadcrumbList` structured data (I18N-05) — Phase 4
- WCAG 2.1 AA audit, skip-link, landmarks (FOUND-05) — Phase 4
- Translation JSON files for UI strings (I18N-04) — Phase 3
- CI/CD pipeline — manual rsync/sftp deploys for v1 (locked in STATE.md)
- MDX, image optimization pipeline, PDF `public/docs/` population — pulled in only when needed

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions (framework, i18n routing, build output format, deployment target):

- **Phase 2 — Spanish Content Migration:** All 14 content sections live in Spanish with base layout, grouped nav, image archive CSS Grid + lightbox, long-page TOCs. Uses the Phase 1 extraction script to produce the Markdown bodies.
- **Phase 3 — English + i18n:** Every Spanish page gains a parallel `/en/` page, language switcher wired via `getRelativeLocaleUrl`, `hreflang` links added, UI strings translated.
- **Phase 4 — Polish + Launch:** WCAG 2.1 AA baseline (skip-link, landmarks, heading hierarchy), breadcrumbs with structured data, full bilingual smoke-test on live server.
