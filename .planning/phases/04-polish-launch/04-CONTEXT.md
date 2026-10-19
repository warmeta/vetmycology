# Phase 4: Polish + Launch - Context

**Gathered:** 2026-10-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver three things: (1) a verified WCAG 2.1 AA accessibility baseline across all pages in both locales, (2) a bilingual breadcrumb trail component with BreadcrumbList structured data on all 28 content pages, and (3) an automated GitHub Actions deploy pipeline that ships `dist/` to the ULPGC server on every push to main.

This phase does not add new content, restructure navigation, or change any existing page layouts beyond inserting the breadcrumb component.

</domain>

<decisions>
## Implementation Decisions

### Breadcrumb Data Source
- **D-01:** Add `breadcrumb_parent` field to markdown frontmatter (parent section label only — e.g., `breadcrumb_parent: "Micología"`). The breadcrumb component infers the parent href from the nav structure; the current page label comes from `entry.data.title`.
- **D-02:** Trail format: `Inicio › [parent] › [current page]` — always three levels. Separator is `›` (U+203A). No deeper nesting needed for this site's two-level hierarchy.
- **D-03:** Current page (leaf) IS shown as a non-linked last item — required for valid `BreadcrumbList` structured data.
- **D-04:** `breadcrumb_parent` must be added to the content schema (`contentSchema` in `src/content.config.ts`) as an optional string field. All 28 content markdown files (14 ES + 14 EN) need this field populated.

### Breadcrumb Placement
- **D-05:** Breadcrumb shows on **ContentPage layout only** — 14 ES pages + 14 EN pages. Home page and ImageArchive layout are excluded (home has no parent; image archive is a special-purpose layout).
- **D-06:** Breadcrumb renders **above the `<h1>`** in ContentPage — location context before the user reads the title.
- **D-07:** BreadcrumbList structured data uses `<script type="application/ld+json">` JSON-LD injected into `<head>` via a `<slot name="head">` in BaseLayout. The Breadcrumb component emits both the visible `<nav>` element and the JSON-LD.

### Deploy Pipeline
- **D-08:** GitHub Actions workflow at `.github/workflows/deploy.yml` triggers on push to `main`. Steps: checkout → setup Node 20 → `npm ci` → `npm run build` → deploy with `SamKirkland/FTP-Deploy-Action`.
- **D-09:** FTP target: `217.116.2.102`, server directory `/httpdocs/`, username `micologiavet`. Password stored as GitHub Actions secret `FTP_PASSWORD`. Host stored as secret `FTP_SERVER` (value `217.116.2.102`), username as `FTP_USERNAME`.
- **D-10:** The workflow deploys the contents of `dist/` (not `dist/` itself) to `/httpdocs/` so that `dist/index.html` maps to `https://micologiaveterinaria.ulpgc.es/`.

### Claude's Discretion
- **A11y audit approach**: Run Lighthouse audit (local or CI) and manually verify FOUND-05 checklist: skip link, `<html lang>`, semantic landmarks, `<h1>→<h2>→<h3>` hierarchy on all pages. Fix any issues found. No need for a full professional audit for v1.
- **Breadcrumb styling**: Plain CSS, consistent with existing design system tokens (CSS Custom Properties from `global.css`). Small, muted text above the h1 — subordinate to the page title visually.
- **Parent href inference**: Build a static map of `breadcrumb_parent` label → href (e.g., `"Micología" → "/micologia/generalidades/"`) inside the Breadcrumb component. This keeps the frontmatter field simple while producing correct links.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope + requirements
- `.planning/ROADMAP.md` §Phase 4 — goal, success criteria, requirements (FOUND-05, I18N-05)
- `.planning/REQUIREMENTS.md` — FOUND-05 (a11y), I18N-05 (breadcrumbs with BreadcrumbList)

### Existing layout components to modify
- `src/layouts/ContentPage.astro` — breadcrumb renders here (above h1); add `breadcrumb_parent` prop
- `src/layouts/BaseLayout.astro` — JSON-LD injected via `<slot name="head" />`; check if slot exists
- `src/content.config.ts` — extend `contentSchema` with `breadcrumb_parent: z.string().optional()`

### Prior phase decisions
- `.planning/phases/03-english-i18n/03-01-SUMMARY.md` — ui.ts translation dictionary; `toc.label` and `toc.nav-label` keys; the breadcrumb `aria-label` and "Inicio" label will need ES/EN keys added
- `.planning/STATE.md` — accumulated key decisions (no-JS constraint, plain CSS, Spanish slugs in both locales)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/i18n/ui.ts` — `useTranslations()` helper; breadcrumb needs new keys: `breadcrumb.home` ("Inicio"/"Home") and `breadcrumb.aria-label` ("Ruta de navegación"/"Breadcrumb navigation")
- `src/components/TableOfContents.astro` — pattern for a small nav component with `lang` prop + `useTranslations` → Breadcrumb follows same structure
- `src/layouts/ContentPage.astro` — already accepts `lang` prop; renders `<main id="main-content">` and `<h1>{title}</h1>`; breadcrumb inserts between BaseLayout opening and h1

### Established Patterns
- No JS shipped — breadcrumb must be pure HTML/CSS (no client-side component hydration)
- Plain CSS scoped `<style>` blocks — no Tailwind, no utility classes
- `lang` prop flows BaseLayout → ContentPage → child components
- `useTranslations(lang)` for all UI strings

### Integration Points
- `src/content.config.ts` `contentSchema` needs `breadcrumb_parent: z.string().optional()` — affects all 10 existing ES collections + 5 EN collections
- All 28 content markdown files need `breadcrumb_parent` populated in frontmatter
- `src/layouts/BaseLayout.astro` — verify `<slot name="head" />` exists for JSON-LD injection; add if missing

</code_context>

<specifics>
## Specific Ideas

- Separator: `›` (U+203A `&rsaquo;`) — not `>` or `/`
- Trail depth: always Inicio › [Section] › [Page] — three levels (site structure is never deeper)
- JSON-LD in `<head>` via script tag, not microdata attributes — cleaner HTML
- GitHub Actions secret names: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`
- FTP server dir: `/httpdocs/` (contents of dist/ land directly in httpdocs)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-polish-launch*
*Context gathered: 2026-10-19*
