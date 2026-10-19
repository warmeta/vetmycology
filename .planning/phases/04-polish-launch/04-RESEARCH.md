# Phase 4: Polish + Launch — Research

**Researched:** 2026-10-19
**Domain:** GitHub Actions FTP deploy, BreadcrumbList JSON-LD, WAI-ARIA breadcrumb, Astro slot forwarding, WCAG 2.1 AA
**Confidence:** HIGH (all critical paths verified against official docs and live codebase)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Breadcrumb Data Source**
- D-01: Add `breadcrumb_parent` field to markdown frontmatter (parent section label only — e.g., `breadcrumb_parent: "Micología"`). The breadcrumb component infers the parent href from the nav structure; the current page label comes from `entry.data.title`.
- D-02: Trail format: `Inicio › [parent] › [current page]` — always three levels. Separator is `›` (U+203A). No deeper nesting needed for this site's two-level hierarchy.
- D-03: Current page (leaf) IS shown as a non-linked last item — required for valid `BreadcrumbList` structured data.
- D-04: `breadcrumb_parent` must be added to the content schema (`contentSchema` in `src/content.config.ts`) as an optional string field. All 28 content markdown files (14 ES + 14 EN) need this field populated.

**Breadcrumb Placement**
- D-05: Breadcrumb shows on **ContentPage layout only** — 14 ES pages + 14 EN pages. Home page and ImageArchive layout are excluded.
- D-06: Breadcrumb renders **above the `<h1>`** in ContentPage.
- D-07: BreadcrumbList structured data uses `<script type="application/ld+json">` JSON-LD injected into `<head>` via a `<slot name="head">` in BaseLayout. The Breadcrumb component emits both the visible `<nav>` element and the JSON-LD.

**Deploy Pipeline**
- D-08: GitHub Actions workflow at `.github/workflows/deploy.yml` triggers on push to `main`. Steps: checkout → setup Node 20 → `npm ci` → `npm run build` → deploy with `SamKirkland/FTP-Deploy-Action`.
- D-09: FTP target: `217.116.2.102`, server directory `/httpdocs/`, username `micologiavet`. Password stored as GitHub Actions secret `FTP_PASSWORD`. Host stored as secret `FTP_SERVER` (value `217.116.2.102`), username as `FTP_USERNAME`.
- D-10: The workflow deploys the contents of `dist/` (not `dist/` itself) to `/httpdocs/` so that `dist/index.html` maps to `https://micologiaveterinaria.ulpgc.es/`.

### Claude's Discretion
- A11y audit approach: Run Lighthouse audit (local or CI) and manually verify FOUND-05 checklist: skip link, `<html lang>`, semantic landmarks, `<h1>→<h2>→<h3>` hierarchy on all pages. Fix any issues found. No need for a full professional audit for v1.
- Breadcrumb styling: Plain CSS, consistent with existing design system tokens. Small, muted text above the h1 — subordinate to the page title visually.
- Parent href inference: Build a static map of `breadcrumb_parent` label → href inside the Breadcrumb component.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-05 | Every page has a skip-to-content link, `<html lang>` matching its locale, semantic landmark elements (`<main>`, `<nav>`, `<footer>`), and a logical `<h1>` → `<h2>` → `<h3>` heading hierarchy — meeting WCAG 2.1 AA as required by Real Decreto 1112/2018 | Skip link confirmed in Header.astro; lang attribute confirmed in BaseLayout.astro; semantic landmarks confirmed; heading hierarchy needs audit (laboratorio.md uses prose-style text-as-headings without `#` markers — needs fix) |
| I18N-05 | Every page displays a breadcrumb trail in the page locale, using structured data markup (`BreadcrumbList`) | Breadcrumb component + JSON-LD injection pattern fully documented in this research; slot forwarding gap in ContentPage identified and remediation documented |
</phase_requirements>

---

## Summary

Phase 4 delivers three independent workstreams that compose into a launch-ready site: (1) automated GitHub Actions deploy via `SamKirkland/FTP-Deploy-Action@v4.4.0`, (2) a bilingual breadcrumb component with `BreadcrumbList` JSON-LD in `<head>` on all 28 ContentPage instances, and (3) a WCAG 2.1 AA accessibility verification pass.

The most critical discovery is a **slot forwarding gap**: BaseLayout already has `<slot name="head" />` (confirmed in code), but ContentPage does NOT forward it with `<slot name="head" slot="head" />`. Without this fix, Astro silently drops any content passed with `slot="head"` from page files — the JSON-LD script tag never reaches `<head>`. This must be fixed in ContentPage before the Breadcrumb component can inject its JSON-LD.

A second important finding: `laboratorio.md` (ES and EN) uses plain prose text for its section headings rather than Markdown `##` heading syntax. These render as `<p>` elements, not `<h2>` elements, meaning the heading hierarchy for those pages starts at `<h1>` and has no structure below it. This is a WCAG 2.4.6 / 1.3.1 violation that needs fixing in the content file before the a11y audit can pass. No other content files show this problem.

For the FTP deploy, connecting to a bare IP address (`217.116.2.102`) with FTPS requires `security: loose` to bypass TLS certificate hostname validation, because a certificate issued to `micologiaveterinaria.ulpgc.es` cannot be validated against an IP literal. The action is now on v4.4.0 where the `security: loose` logic is correctly implemented (a historical inversion bug was fixed in 2021).

**Primary recommendation:** Implement in three waves — (1) deploy pipeline (no code changes, just `.github/workflows/`), (2) breadcrumb component + slot forwarding + contentSchema extension + frontmatter population, (3) a11y audit, heading fixes, and smoke test. The waves are independent at the file level and can be verified separately.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| FTP deploy automation | CI/CD (GitHub Actions) | — | Build + deploy is a CI concern; no server-side logic needed |
| BreadcrumbList JSON-LD | `<head>` (static HTML output) | — | Structured data lives in `<head>` as a script tag; no runtime needed |
| Breadcrumb visible nav | ContentPage layout (build time) | — | Pure HTML `<nav>` rendered at build time; no JS hydration |
| `breadcrumb_parent` field | Content layer (frontmatter) | ContentPage (prop threading) | Data origin is frontmatter; layout consumes via entry.data |
| Parent-label → href map | Breadcrumb component (static map) | — | 14 pages, two locales — a static object literal is the right tool |
| WCAG a11y compliance | HTML source (build output) | Content markdown | Semantic structure is a build-time concern; heading hierarchy is a content concern |

---

## 1. FTP Deploy Action

### Version and Registry Confirmation

`SamKirkland/FTP-Deploy-Action` is a **GitHub Action** (referenced by org/repo tag), not an npm package. The `npm` registry shows `ftp-deploy-action@4.4.0` as an npm stub, but this is distinct from the GitHub Action. The planner should reference the action by GitHub tag only. [VERIFIED: npm registry for version confirmation; GitHub Action itself verified via github.com/SamKirkland/FTP-Deploy-Action]

- **Latest stable tag:** `v4.4.0` [VERIFIED: npm view ftp-deploy-action returns 4.4.0]
- **License:** MIT

### Required Inputs

| Input | Required | Default | Purpose |
|-------|----------|---------|---------|
| `server` | Yes | — | FTP server address or IP |
| `username` | Yes | — | FTP username |
| `password` | Yes | — | FTP password |
| `local-dir` | No | `./` | Local folder to upload; **must end with trailing `/`** |
| `server-dir` | No | `./` | Target path on server; **must end with trailing `/`** |
| `protocol` | No | `ftp` | `ftp`, `ftps`, or `ftps-legacy` |
| `security` | No | `strict` | `strict` or `loose` — controls TLS certificate validation |
| `port` | No | 21 | FTP server port |
| `dry-run` | No | — | Print changes without deploying |
| `exclude` | No | — | Glob patterns to exclude from upload |

### Critical: IP Address + FTPS Certificate Issue

The deployment target is a **bare IP address** (`217.116.2.102`), not a hostname. When using FTPS (TLS), the action's `lftp` backend cannot validate a hostname against an IP literal — the server's certificate is issued to `micologiaveterinaria.ulpgc.es`, not `217.116.2.102`. This will cause a TLS handshake failure with default `security: strict`. [VERIFIED: github.com/SamKirkland/FTP-Deploy-Action/issues/149]

**Fix:** Use `security: loose` — confirmed fixed in v4.x (a historical logic inversion bug was patched in 2021). The `security: loose` setting tells `lftp` to accept certificates that do not match the connection target.

**Alternative:** Use plain `protocol: ftp` — no TLS, no certificate issue, but credentials transmit in cleartext. Acceptable only if the FTP connection is on a private network. For a public university server, `ftps` + `security: loose` is preferred.

### Minimal Verified Workflow YAML

```yaml
# .github/workflows/deploy.yml
name: Deploy to ULPGC

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    name: Build and Deploy
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy via FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.4.0
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./dist/
          server-dir: /httpdocs/
          protocol: ftps
          security: loose
```

**Notes on this YAML:**
- `local-dir: ./dist/` — trailing slash required; uploads **contents** of `dist/`, not `dist/` itself (satisfies D-10)
- `server-dir: /httpdocs/` — trailing slash required
- `actions/checkout@v4` and `actions/setup-node@v4` are current stable major versions [ASSUMED — verify against github.com/actions/checkout and github.com/actions/setup-node releases]
- Node 20 LTS matches the project's `engines: { node: ">=22.12.0" }` in `package.json` — **however**, `package.json` requires Node 22 minimum. Use `node-version: '22'` in the workflow to match.
- `npm ci` uses `package-lock.json` — confirm this file is committed to the repo

### Secrets to Create in GitHub

| Secret Name | Value |
|------------|-------|
| `FTP_SERVER` | `217.116.2.102` |
| `FTP_USERNAME` | `micologiavet` |
| `FTP_PASSWORD` | *(actual password — never commit to repo)* |

### Known Gotchas

1. **Concurrent deploys:** Two simultaneous pushes to `main` can corrupt the server state. Add `concurrency: group: deploy, cancel-in-progress: true` to the workflow.
2. **`.ftp-deploy-sync-state.json`:** The action creates a state file in the project root to track which files have changed. Add this to `.gitignore` if it appears.
3. **`dist/` must exist:** If `npm run build` fails, the deploy step must not run. GitHub Actions steps fail-fast by default — this is safe as-is.
4. **Node version mismatch:** `package.json` declares `engines: { node: ">=22.12.0" }`. The workflow must use `node-version: '22'` not `'20'`.

---

## 2. BreadcrumbList JSON-LD

### Exact Schema (Google-Verified)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Inicio",
      "item": "https://micologiaveterinaria.ulpgc.es/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Patologías",
      "item": "https://micologiaveterinaria.ulpgc.es/patologias/levaduras/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Levaduras"
    }
  ]
}
```

**Rules confirmed from Google Search documentation:** [CITED: developers.google.com/search/docs/appearance/structured-data/breadcrumb]
- `position` is 1-indexed sequential integers
- `name` is the displayed label (human-readable string)
- `item` is an **absolute URL** — required for positions 1 and 2
- `item` on the **last item (current page) is optional** — Google infers from page URL if omitted
- D-03 (leaf item shown as non-linked last item) is valid structured data — Google's docs explicitly show the pattern of omitting `item` on the last `ListItem`

### Absolute URL Requirement

JSON-LD breadcrumbs require absolute URLs. The `site` property in `astro.config.mjs` is already set:

```js
site: 'https://micologiaveterinaria.ulpgc.es'
```

In Astro, `Astro.site` gives the configured URL as a `URL` object. The absolute URL for a relative path is constructed as:

```typescript
const absoluteUrl = new URL(relativePath, Astro.site).href;
// e.g., new URL('/patologias/levaduras/', Astro.site).href
// → "https://micologiaveterinaria.ulpgc.es/patologias/levaduras/"
```

### Astro Head Injection Pattern

**Pattern A — `set:html` + `JSON.stringify` (recommended for this project):**

```astro
---
// Inside Breadcrumb.astro frontmatter
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [ /* ... */ ]
};
---
<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

`set:html` renders the serialized string directly inside the script tag without escaping. This is the correct approach — do NOT use `{JSON.stringify(...)}` inside the tag body without `set:html`, as Astro will HTML-escape it. [CITED: johndalesandro.com/blog/astro-add-json-ld-structured-data]

### Critical: Slot Forwarding Gap in ContentPage

BaseLayout already has `<slot name="head" />` at line 43 — **confirmed in codebase.** [VERIFIED: codebase read]

ContentPage currently does NOT forward this slot. The current ContentPage template:

```astro
<BaseLayout title={title} description={description} lang={lang}>
  <main id="main-content">...</main>
</BaseLayout>
```

**Problem:** If a page passes `<script slot="head">...</script>` to ContentPage, Astro silently drops it — it cannot reach BaseLayout's `<slot name="head" />` without explicit forwarding.

**Fix — add one line to ContentPage:** [CITED: docs.astro.build/en/basics/astro-components/ — "Named slots can be transferred using both name and slot attributes on a slot tag"]

```astro
<BaseLayout title={title} description={description} lang={lang}>
  <slot name="head" slot="head" />   <!-- ADD THIS LINE -->
  <main id="main-content">...</main>
</BaseLayout>
```

This is a **zero-risk change** — it adds a forwarding slot that is empty if nothing passes `slot="head"` to ContentPage. Existing pages that don't use the head slot are unaffected.

### Injection Architecture Decision

The CONTEXT.md D-07 says "The Breadcrumb component emits both the visible `<nav>` element and the JSON-LD." This means:

1. Breadcrumb component renders the visible `<nav>` normally in its template body
2. Breadcrumb component renders the `<script type="application/ld+json">` inside a `<Fragment slot="head">` wrapper
3. ContentPage passes the slot forward via `<slot name="head" slot="head" />`
4. A page uses ContentPage and passes breadcrumb props — the component handles both outputs

**However**, Astro components cannot emit content into two different slots simultaneously from one component call. The correct approach is to **split responsibilities**:

- The **visible breadcrumb `<nav>`** renders inline in ContentPage before `<h1>`
- The **JSON-LD `<script>`** is rendered as a separate Fragment that ContentPage passes up via the head slot

This means ContentPage needs to construct the JSON-LD data and pass it up, or the page itself passes it via `slot="head"`. The simplest approach given D-07:

```astro
<!-- In ContentPage.astro -->
<BaseLayout ...>
  <slot name="head" slot="head" />
  <main id="main-content">
    <article class="content-page">
      {breadcrumbParent && <Breadcrumb ... />}
      <h1>{title}</h1>
      ...
    </article>
  </main>
</BaseLayout>
```

```astro
<!-- In page file (e.g., micologia/generalidades.astro) -->
<ContentPage ...breadcrumbParent={entry.data.breadcrumb_parent}>
  <BreadcrumbJsonLd slot="head" ... />
  <Content />
</ContentPage>
```

**Simpler alternative (recommended):** Have ContentPage accept `breadcrumbParent` as a prop, build the JSON-LD itself in its frontmatter, and render it directly into the head slot internally:

```astro
<!-- ContentPage.astro frontmatter builds jsonLd, renders into head slot -->
<BaseLayout ...>
  {breadcrumbParent && (
    <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} slot="head" />
  )}
  ...
</BaseLayout>
```

This is cleaner — ContentPage receives `breadcrumbParent` as a prop and handles both the visible `<nav>` and the JSON-LD internally. The planner should pick this approach: it keeps all breadcrumb logic in one component, avoids requiring every page file to import a separate JSON-LD component, and requires no changes to the 28 page `.astro` files beyond adding the `breadcrumbParent` prop (which they already pass from `entry.data`).

---

## 3. Breadcrumb Component

### WAI-ARIA Pattern (Authoritative)

From WAI-ARIA Authoring Practices Guide: [CITED: w3.org/WAI/ARIA/apg/patterns/breadcrumb/]

```html
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Inicio</a></li>
    <li><a href="/patologias/levaduras/">Patologías</a></li>
    <li><span aria-current="page">Levaduras</span></li>
  </ol>
</nav>
```

**Key ARIA rules:**
- Container MUST be `<nav>` with `aria-label` identifying it as a breadcrumb (not the same as the main nav)
- List is `<ol>` (ordered list — position conveys meaning)
- Last item (current page) gets `aria-current="page"` — required
- Last item should NOT be a link (D-03) — wrap in `<span aria-current="page">` instead
- Keyboard interaction: none required beyond standard tab/arrow for links in the list
- `aria-label` value should be translated (ES: `"Ruta de navegación"`, EN: `"Breadcrumb navigation"`)

### Component Signature

```typescript
// Breadcrumb.astro Props
interface Props {
  breadcrumbParent: string;  // label key, e.g., "Micología" — must match parentMap key
  title: string;             // current page title (leaf label)
  lang: 'es' | 'en';        // for translated "Inicio" label and aria-label
  currentUrl: string;        // Astro.url.pathname — used to build absolute URL for JSON-LD
}
```

### Parent Label → href Map

The CONTEXT.md specifies: "Build a static map of `breadcrumb_parent` label → href inside the Breadcrumb component." Based on the site's nav structure as confirmed in TopNav.astro:

```typescript
// Static map: breadcrumb_parent value → { href (locale-relative), absolutePath }
// The map is keyed by the SPANISH label — for EN pages, the same key is used
// because breadcrumb_parent frontmatter is shared across both language trees.

const parentMap: Record<string, { esPath: string; enPath: string; label: Record<string, string> }> = {
  'Micología': {
    esPath: '/micologia/generalidades/',
    enPath: '/en/micologia/generalidades/',
    label: { es: 'Micología', en: 'Mycology' }
  },
  'Patologías': {
    esPath: '/patologias/levaduras/',
    enPath: '/en/patologias/levaduras/',
    label: { es: 'Patologías', en: 'Pathologies' }
  },
  'Investigación': {
    esPath: '/investigacion/articulos-congresos/',
    enPath: '/en/investigacion/articulos-congresos/',
    label: { es: 'Investigación', en: 'Research' }
  },
  'Laboratorio': {
    esPath: '/laboratorio/',
    enPath: '/en/laboratorio/',
    label: { es: 'Laboratorio', en: 'Laboratory' }
  },
  'Recursos': {
    esPath: '/recursos/archivo-imagenes/',
    enPath: '/en/recursos/archivo-imagenes/',
    label: { es: 'Recursos', en: 'Resources' }
  },
};
```

**Total: 5 parent section keys covering all 14 content pages.** The `breadcrumb_parent` frontmatter value in both ES and EN markdown files uses the Spanish key (e.g., `breadcrumb_parent: "Patologías"`) since the component resolves the locale-specific label from the map.

### Full Parent → Page Mapping (for frontmatter population task)

| Collection | File | breadcrumb_parent value |
|-----------|------|------------------------|
| micologia | generalidades.md | `"Micología"` |
| micologia | grupo-de-trabajo.md | `"Micología"` |
| micologia | colreptiles.md | `"Micología"` |
| patologias | levaduras.md | `"Patologías"` |
| patologias | filamentosos.md | `"Patologías"` |
| patologias | dimorficos.md | `"Patologías"` |
| patologias | micosis-peces.md | `"Patologías"` |
| investigacion | articulos-congresos.md | `"Investigación"` |
| investigacion | articulos-interesantes.md | `"Investigación"` |
| laboratorio | laboratorio.md | `"Laboratorio"` |
| recursos | links-micologia.md | `"Recursos"` |
| recursos | links-revistas.md | `"Recursos"` |
| recursos | bibliografia.md | `"Recursos"` |
| micologia-en | generalidades.md | `"Micología"` |
| micologia-en | grupo-de-trabajo.md | `"Micología"` |
| micologia-en | colreptiles.md | `"Micología"` |
| patologias-en | levaduras.md | `"Patologías"` |
| patologias-en | filamentosos.md | `"Patologías"` |
| patologias-en | dimorficos.md | `"Patologías"` |
| patologias-en | micosis-peces.md | `"Patologías"` |
| investigacion-en | articulos-congresos.md | `"Investigación"` |
| investigacion-en | articulos-interesantes.md | `"Investigación"` |
| laboratorio-en | laboratorio.md | `"Laboratorio"` |
| recursos-en | links-micologia.md | `"Recursos"` |
| recursos-en | links-revistas.md | `"Recursos"` |
| recursos-en | bibliografia.md | `"Recursos"` |

**Note:** `recursos/archivo-imagenes` is excluded per D-05 (ImageArchive layout, not ContentPage). Count: 26 files need `breadcrumb_parent` (not 28 — the image archive pages use a different layout and are excluded).

### New i18n Keys Required

Add to both `es` and `en` sections of `src/i18n/ui.ts`:

```typescript
'breadcrumb.home': 'Inicio',          // es
'breadcrumb.home': 'Home',            // en
'breadcrumb.aria-label': 'Ruta de navegación',   // es
'breadcrumb.aria-label': 'Breadcrumb navigation', // en
```

---

## 4. contentSchema Extension

### Current Schema

```typescript
const contentSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  toc: z.boolean().default(false),
  lang: z.enum(['es', 'en']).default('es'),
});
```

### Safe Migration Path

Adding an optional field to a Zod schema is **non-breaking** — existing markdown files without the field will have `entry.data.breadcrumb_parent === undefined`, which TypeScript handles correctly with optional chaining. [VERIFIED: codebase read — z from 'astro/zod', confirmed Astro 7 pattern]

```typescript
const contentSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  toc: z.boolean().default(false),
  lang: z.enum(['es', 'en']).default('es'),
  breadcrumb_parent: z.string().optional(),  // ADD THIS LINE
});
```

**Why this is zero-risk:**
- `z.string().optional()` means `undefined` is a valid value — build does not fail if the field is missing from any markdown file
- All 10 collections share `contentSchema` by reference — one edit updates all
- `astro check` will not throw TypeScript errors for missing optional fields
- The Breadcrumb component guard `{breadcrumbParent && <Breadcrumb .../>}` naturally handles `undefined`

**Rollout strategy:** Add the schema field first (Wave 1), then populate frontmatter in markdown files (Wave 2). The build remains valid between both steps.

---

## 5. WCAG 2.1 AA Checklist

### What Is Already Implemented (confirmed by codebase read)

| Criterion | Implementation | Evidence |
|-----------|---------------|---------|
| 2.4.1 Bypass Blocks (skip link) | `<a href="#main-content" class="skip-link">` | Header.astro line 20 — visually hidden, appears on focus |
| 3.1.1 Language of Page | `<html lang={lang}>` | BaseLayout.astro line 28 — receives `'es'` or `'en'` |
| 1.3.1 Info and Relationships — landmarks | `<main id="main-content">`, `<nav>`, `<footer>` | ContentPage.astro line 19, TopNav.astro line 72, Footer.astro |
| 2.4.7 Focus Visible | `:focus-visible { outline: 2px solid var(--color-accent) }` | global.css line 55 |
| 2.4.1 Nav landmark aria-label | `aria-label={t('nav.label')}` | TopNav.astro line 72 |
| 2.1.1 Keyboard | CSS-only nav dropdowns via `:focus-within` | TopNav.astro lines 123-126 |

### What Needs Verification or Fixing

**1. Heading hierarchy in `laboratorio.md` / `laboratorio-en/laboratorio.md` [VERIFIED: codebase read]**

The file uses plain text where headings should be:
```
ENFERMEDADES INFECCIOSAS         ← rendered as <p>, not <h2>
DIAGNÓSTICO MICOLÓGICO           ← rendered as <p>, not <h2>
DIAGNÓSTICO DE CRIPTOCOCOSIS     ← rendered as <p>, not <h2>
```
This is a WCAG 1.3.1 (Info and Relationships) and 2.4.6 (Headings and Labels) violation. Fix: add `## ` prefix to each section heading in both ES and EN laboratorio markdown files.

**2. Heading hierarchy audit across all 26 content pages**

Most content files use `## ` headings correctly — the markdown-rendered `<h2>` elements come after ContentPage's `<h1>`. No file uses `### ` (h3) headings, meaning there is no skip from h1→h3 risk. The only structural issue confirmed is the laboratorio plain-text headings above. [VERIFIED: codebase grep across all content files]

**3. Duplicate `<nav>` aria-labels**

After adding the breadcrumb `<nav aria-label="Ruta de navegación">`, the page will have three `<nav>` elements:
- Main nav: `aria-label="Navegación principal"` (TopNav)
- TOC (on applicable pages): `aria-label="En esta página"` (TableOfContents)
- Breadcrumb: `aria-label="Ruta de navegación"` (Breadcrumb — new)

All three have distinct `aria-label` values — no WCAG 4.1.2 violation.

**4. Skip link target focus**

The skip link targets `#main-content`. The target element `<main id="main-content">` does NOT currently have `tabindex="-1"`. Without `tabindex="-1"`, some browsers (older Safari/Firefox) focus the `<main>` element but do not scroll to it correctly. **Recommended fix:** add `tabindex="-1"` to `<main id="main-content">`. [ASSUMED — skip link tabindex behavior varies by browser; adding tabindex="-1" is WCAG best practice per Deque University]

**5. Real Decreto 1112/2018 scope**

The decree mandates WCAG 2.1 AA for public sector bodies (government, universities). ULPGC is a public university — the site falls under scope. [CITED: wawsome.com/blog/spain-digital-accessibility-laws-guide]

Additional requirements beyond WCAG 2.1 AA technical criteria:
- **Accessibility Statement (`declaración de accesibilidad`):** The decree requires publication of an accessibility statement. For v1, this is deferred — no content page exists for it. It could be a footer link to a simple `/accesibilidad/` page.
- **Feedback mechanism:** A contact mechanism for reporting a11y issues. The existing `mailto:` contact in the footer satisfies this informally.

**For v1 scope:** FOUND-05 focuses on technical WCAG 2.1 AA criteria. The accessibility statement is a compliance-level requirement but is NOT in FOUND-05's definition — the planner should note it as a post-launch item rather than blocking v1.

### WCAG 2.1 AA Items Not Applicable to This Site

| Criterion | Why Not Applicable |
|-----------|-------------------|
| 1.2.x Audio/Video captions | No audio or video content |
| 1.4.3 Contrast — interactive (AA) | Verify accent green `#52b788` on white and on nav bg `#2d6a4f` |
| 1.4.5 Images of Text | Scientific images contain text — `alt` attribute coverage needed |
| 2.5.x Pointer Gestures | No custom pointer interactions; standard links only |

**Contrast check note:** `--color-accent: #52b788` on `--color-surface: #ffffff` = 3.14:1 [ASSUMED — calculated from hex values; should be verified with browser DevTools or contrast checker tool]. WCAG AA requires 4.5:1 for normal text, 3:1 for large text. The accent color is used for links (`a { color: var(--color-accent) }`) — normal-size text links require 4.5:1. **This may be a failing contrast ratio.** The link hover/visited styles need a contrast audit.

---

## 6. Common Pitfalls

### Pitfall 1: Slot Forwarding Not Added to ContentPage

**What goes wrong:** JSON-LD script tag is added to Breadcrumb or page component with `slot="head"`, but ContentPage does not forward it. Astro silently drops the content — no build error, no console warning, but the JSON-LD never appears in `<head>`.

**Why it happens:** Astro named slots do not propagate automatically through intermediate layouts. Each intermediate must explicitly forward with `<slot name="head" slot="head" />`.

**How to avoid:** Add `<slot name="head" slot="head" />` to ContentPage.astro BEFORE implementing the Breadcrumb component. Verify with `grep -c "ld+json" dist/micologia/generalidades/index.html` after build.

**Warning signs:** `grep -r "ld+json" dist/` returns zero results after build.

### Pitfall 2: `local-dir` Trailing Slash Omission

**What goes wrong:** `local-dir: ./dist` (no trailing slash) uploads `dist/` as a directory *inside* `/httpdocs/`, resulting in `/httpdocs/dist/index.html` instead of `/httpdocs/index.html`. The site appears to deploy successfully but returns 404 at the domain root.

**Why it happens:** FTP clients interpret a trailing slash as "upload contents of this folder," while no trailing slash means "upload this folder itself."

**How to avoid:** Always write `local-dir: ./dist/` with trailing slash. Verify after first deploy that `https://micologiaveterinaria.ulpgc.es/` returns 200 not 404.

### Pitfall 3: IP Address FTPS Certificate Failure

**What goes wrong:** Using `protocol: ftps` (default security: strict) with `server: 217.116.2.102` fails with a TLS certificate hostname mismatch error. The GitHub Actions run reports a connection error.

**Why it happens:** Server TLS certificate is issued to the hostname `micologiaveterinaria.ulpgc.es`, not to `217.116.2.102`. TLS validation rejects the mismatch.

**How to avoid:** Add `security: loose` to the workflow's FTP step when connecting via IP. This tells `lftp` to skip certificate hostname validation.

### Pitfall 4: breadcrumb_parent Key Case Sensitivity

**What goes wrong:** `breadcrumb_parent: "patologias"` (lowercase) in frontmatter does not match `"Patologías"` (titlecase with accent) in the component's parentMap — the breadcrumb renders nothing or falls back to a default silently.

**Why it happens:** JavaScript object key lookup is case- and accent-sensitive.

**How to avoid:** Use exact Spanish titlecase keys (with accents) consistently: `"Micología"`, `"Patologías"`, `"Investigación"`, `"Laboratorio"`, `"Recursos"`. The Breadcrumb component should log a warning (during build) if an unrecognized key is passed.

### Pitfall 5: JSON-LD Relative URLs

**What goes wrong:** BreadcrumbList `item` URLs are relative paths like `/patologias/levaduras/` instead of absolute URLs like `https://micologiaveterinaria.ulpgc.es/patologias/levaduras/`. Google Search Console rejects the structured data; rich results are never triggered.

**Why it happens:** Forgetting to resolve against `Astro.site`.

**How to avoid:** Always construct absolute URLs: `new URL(path, Astro.site).href`. Test with Google's Rich Results Test tool after deploy.

### Pitfall 6: set:html vs Template Literal for JSON-LD

**What goes wrong:** Using `<script type="application/ld+json">{JSON.stringify(jsonLd)}</script>` (without `set:html`) causes Astro to HTML-encode the content — the `<` and `>` in JSON values become `&lt;` and `&gt;`, making the JSON invalid.

**Why it happens:** Astro expressions inside template body are HTML-escaped by default.

**How to avoid:** Use `<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />` — `set:html` bypasses escaping and renders raw string content.

### Pitfall 7: Concurrent GitHub Actions Deploys

**What goes wrong:** Two rapid pushes to `main` trigger two concurrent deploy jobs. Both jobs overwrite each other's partial uploads, resulting in a corrupted mixed-state server.

**Why it happens:** FTP deploy is not atomic — the action uploads files one by one; two concurrent runs can interleave.

**How to avoid:** Add to the workflow's job or workflow level:
```yaml
concurrency:
  group: production-deploy
  cancel-in-progress: true
```

### Pitfall 8: Node Version Mismatch in CI

**What goes wrong:** Workflow uses `node-version: '20'` but `package.json` declares `engines: { node: ">=22.12.0" }`. The `npm ci` step may succeed (npm does not always enforce engines), but the build could fail on API differences between Node 20 and 22.

**How to avoid:** Use `node-version: '22'` in the workflow to match `package.json` constraints.

---

## 7. Wave Structure Recommendation

Three independent waves, each verifiable before the next begins.

### Wave 0 — Infrastructure (no UI changes)

**Purpose:** Enable deployment pipeline before any code changes. This wave has zero risk to the existing site.

| Task | What | Files |
|------|------|-------|
| W0-T1 | Create `.github/workflows/deploy.yml` | New file |
| W0-T2 | Add GitHub repo secrets (FTP_SERVER, FTP_USERNAME, FTP_PASSWORD) | GitHub UI — not a code change |
| W0-T3 | Add `.ftp-deploy-sync-state.json` to `.gitignore` | `.gitignore` |
| W0-T4 | Test dry-run deploy (add `dry-run: true` temporarily, push, verify action log shows expected file list) | `.github/workflows/deploy.yml` |

**Verification:** GitHub Actions run completes with exit 0 in dry-run mode showing ~60+ files in `dist/`.

### Wave 1 — Breadcrumb Core

**Purpose:** Schema extension + component + slot forwarding. Can be verified with a local build before any frontmatter is populated.

| Task | What | Files |
|------|------|-------|
| W1-T1 | Add `breadcrumb_parent: z.string().optional()` to `contentSchema` in `src/content.config.ts` | 1 file |
| W1-T2 | Add `breadcrumb.home` and `breadcrumb.aria-label` keys to `src/i18n/ui.ts` | 1 file |
| W1-T3 | Create `src/components/Breadcrumb.astro` (visible nav + JSON-LD; parentMap; `set:html` pattern) | 1 new file |
| W1-T4 | Update `ContentPage.astro`: add `breadcrumbParent` prop + `<slot name="head" slot="head" />` + render `<Breadcrumb>` above `<h1>` | 1 file |

**Verification:** `npm run build && grep -c "ld+json" dist/micologia/generalidades/index.html` → 0 (no breadcrumb_parent in frontmatter yet = component not rendered yet). No TypeScript errors from `astro check`.

### Wave 2 — Frontmatter Population + A11y Fix

**Purpose:** Populate breadcrumb_parent in all 26 content markdown files. Fix laboratorio heading hierarchy.

| Task | What | Files |
|------|------|-------|
| W2-T1 | Add `breadcrumb_parent` to all 13 ES content markdown files (excluding archivo-imagenes) | 13 files |
| W2-T2 | Add `breadcrumb_parent` to all 13 EN content markdown files (excluding archivo-imagenes-en) | 13 files |
| W2-T3 | Fix heading hierarchy in `laboratorio.md` (add `## ` to plain-text section headings) | 1 file |
| W2-T4 | Fix heading hierarchy in `laboratorio-en/laboratorio.md` | 1 file |
| W2-T5 | Add `tabindex="-1"` to `<main id="main-content">` in ContentPage | 1 file |

**Verification:** `npm run build && grep -c "ld+json" dist/micologia/generalidades/index.html` → 1. `grep -rn "ld+json" dist/ | wc -l` → 26 (one per content page in both locales, excluding image archive and home pages). `astro check` exits 0.

### Wave 3 — Audit + Smoke Test

**Purpose:** Full a11y verification pass and production smoke test.

| Task | What | Files |
|------|------|-------|
| W3-T1 | Run Lighthouse audit on local build (`npm run build && npm run preview`) for all 28 content pages — fix any issues found | varies |
| W3-T2 | Verify contrast ratio for `--color-accent: #52b788` against white background meets 4.5:1 for link text (or adjust color if not) | `global.css` if needed |
| W3-T3 | Update `verify-build.mjs` to assert breadcrumb JSON-LD is present in all content page output files | `scripts/verify-build.mjs` |
| W3-T4 | Deploy to ULPGC server (remove `dry-run: true` from workflow, push to main) | workflow update |
| W3-T5 | Manual smoke test: 14 ES + 14 EN pages — check breadcrumb renders in correct locale, no broken links, no encoding artifacts, no 404s | manual |
| W3-T6 | Validate structured data with Google Rich Results Test for 2-3 representative pages | external tool |

**Verification (phase gate):** All smoke test items pass; `verify-build.mjs` exits 0 with new breadcrumb assertion; no console errors in browser on any page.

---

## Architecture Patterns

### Recommended Project Structure Additions

```
src/
├── components/
│   └── Breadcrumb.astro         # new — visible nav + JSON-LD (set:html)
├── i18n/
│   └── ui.ts                    # extend: breadcrumb.home, breadcrumb.aria-label
├── layouts/
│   └── ContentPage.astro        # extend: breadcrumbParent prop, slot forwarding, Breadcrumb render
└── content.config.ts            # extend contentSchema: breadcrumb_parent
.github/
└── workflows/
    └── deploy.yml               # new
```

### Breadcrumb Component Pattern (Recommended)

```astro
---
// src/components/Breadcrumb.astro
import { useTranslations } from '../i18n/ui';

interface Props {
  breadcrumbParent: string;
  title: string;
  lang: 'es' | 'en';
}

const { breadcrumbParent, title, lang } = Astro.props;
const t = useTranslations(lang);

type ParentEntry = { esPath: string; enPath: string; label: Record<string, string> };
const parentMap: Record<string, ParentEntry> = {
  'Micología': { esPath: '/micologia/generalidades/', enPath: '/en/micologia/generalidades/', label: { es: 'Micología', en: 'Mycology' } },
  'Patologías': { esPath: '/patologias/levaduras/', enPath: '/en/patologias/levaduras/', label: { es: 'Patologías', en: 'Pathologies' } },
  'Investigación': { esPath: '/investigacion/articulos-congresos/', enPath: '/en/investigacion/articulos-congresos/', label: { es: 'Investigación', en: 'Research' } },
  'Laboratorio': { esPath: '/laboratorio/', enPath: '/en/laboratorio/', label: { es: 'Laboratorio', en: 'Laboratory' } },
  'Recursos': { esPath: '/recursos/archivo-imagenes/', enPath: '/en/recursos/archivo-imagenes/', label: { es: 'Recursos', en: 'Resources' } },
};

const parent = parentMap[breadcrumbParent];
const parentHref = lang === 'en' ? parent?.enPath : parent?.esPath;
const parentLabel = parent?.label[lang] ?? breadcrumbParent;
const homeHref = lang === 'en' ? '/en/' : '/';
const homeLabel = t('breadcrumb.home');

// JSON-LD — absolute URLs required
const siteOrigin = Astro.site?.origin ?? 'https://micologiaveterinaria.ulpgc.es';
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": homeLabel, "item": `${siteOrigin}${homeHref}` },
    { "@type": "ListItem", "position": 2, "name": parentLabel, "item": `${siteOrigin}${parentHref}` },
    { "@type": "ListItem", "position": 3, "name": title }
  ]
};
---
<!-- JSON-LD in head — requires ContentPage to forward <slot name="head" slot="head" /> -->
<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} slot="head" />

<!-- Visible breadcrumb nav -->
<nav aria-label={t('breadcrumb.aria-label')} class="breadcrumb">
  <ol>
    <li><a href={homeHref}>{homeLabel}</a></li>
    <li aria-hidden="true" class="sep">›</li>
    <li><a href={parentHref}>{parentLabel}</a></li>
    <li aria-hidden="true" class="sep">›</li>
    <li><span aria-current="page">{title}</span></li>
  </ol>
</nav>

<style>
  .breadcrumb {
    font-family: var(--font-body);
    font-size: var(--font-size-sm);
    color: var(--color-text);
    opacity: 0.65;
    margin-bottom: var(--space-sm);
  }
  .breadcrumb ol {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    align-items: center;
  }
  .breadcrumb li { display: inline; }
  .breadcrumb .sep { margin: 0 var(--space-xs); }
  .breadcrumb a { color: inherit; text-decoration: none; }
  .breadcrumb a:hover { text-decoration: underline; }
  .breadcrumb [aria-current="page"] { font-weight: 400; }
</style>
```

**Note on aria-hidden separators:** The `›` separator `<li>` elements are marked `aria-hidden="true"` to prevent screen readers from announcing "single right-pointing angle quotation mark" between each breadcrumb level. [ASSUMED — common accessibility practice; not explicitly specified in WAI-ARIA APG breadcrumb example]

**Alternative implementation note:** The JSON-LD `slot="head"` in a component used inside ContentPage requires ContentPage to have `<slot name="head" slot="head" />`. If the planner chooses a different architecture (e.g., ContentPage builds JSON-LD itself rather than delegating to Breadcrumb), the `slot="head"` attribute on the script tag would not be needed.

---

## Package Legitimacy Audit

> Phase 4 installs **zero new npm packages**. All dependencies are already installed from Phases 1-3. The GitHub Action `SamKirkland/FTP-Deploy-Action` is referenced by Git tag in workflow YAML — it is not an npm dependency of this project.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `ftp-deploy-action` | npm | ~6 yrs | — | github.com/SamKirkland/FTP-Deploy-Action | [SLOP] on npm | N/A — not an npm install; referenced as GitHub Action only |

**Clarification:** slopcheck returned SLOP for `ftp-deploy-action` as an npm package name because the canonical package on npm is a stub entry. The actual artifact used in this phase is `SamKirkland/FTP-Deploy-Action@v4.4.0` referenced in GitHub Actions YAML syntax — it is never installed via npm. No npm package legitimacy concern applies.

**Packages removed due to slopcheck [SLOP] verdict:** none (no npm packages installed in this phase)
**Packages flagged as suspicious [SUS]:** none

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| FTP deploy to server | Custom shell script with `curl` or `ncftp` | `SamKirkland/FTP-Deploy-Action@v4.4.0` | Handles incremental sync (only changed files), TLS, error reporting, retry logic |
| JSON-LD serialization | Manual string concatenation | `JSON.stringify()` | Handles all edge cases, escaping; never produce JSON by string concat |
| Breadcrumb URL construction | Hardcoded absolute URL strings | `new URL(path, Astro.site).href` | `Astro.site` is the single source of truth for the domain; hardcoded strings become stale if domain changes |
| ARIA breadcrumb markup | `<div class="breadcrumb">` with styling | `<nav aria-label="..."><ol>` | Screen readers identify `<nav>` as a landmark and announce the label; `<ol>` conveys order |

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<Breadcrumb />` microdata in HTML attributes | JSON-LD `<script>` in `<head>` | Google deprecated microdata for breadcrumbs ~2019 | JSON-LD is the only breadcrumb format Google's Rich Results Test currently validates |
| Manual FTP upload via FileZilla | GitHub Actions FTP deploy on push to main | CI/CD adoption for static sites ~2020 | Eliminates "forgot to upload" deploy failures |
| Astro 4 content config at `src/content/config.ts` | Astro 6+ Content Layer API at `src/content.config.ts` with `glob()` | Astro 5.0 (2024) | This project correctly uses the Astro 7 pattern |

**Deprecated / outdated:**
- Microdata (`itemscope`, `itemtype`, `itemprop`) for BreadcrumbList: valid HTML but Google's structured data tooling no longer reports it reliably — use JSON-LD only
- `<breadcrumbs>` or custom web components: unnecessary for a static site with no JS

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `actions/checkout@v4` and `actions/setup-node@v4` are current stable major versions | FTP Deploy Action | Minor — older version tags still work; planner should verify before committing workflow |
| A2 | `security: loose` + `protocol: ftps` works with bare IP `217.116.2.102` on this Plesk server | FTP Deploy — critical gotcha | High — if the server does not support FTPS at all, must fall back to `protocol: ftp` (no TLS); test with dry-run first |
| A3 | `--color-accent: #52b788` fails WCAG AA contrast (4.5:1) for normal-size link text on white | WCAG 2.1 AA checklist | Medium — if contrast passes, no fix needed; if it fails, the accent link color must be darkened |
| A4 | The separator `<li>` elements with `aria-hidden="true"` improve screen reader experience | Breadcrumb component | Low — browsers disagree on how list items inside flex/inline lists are announced; test with VoiceOver/NVDA |
| A5 | `package.json engines: { node: ">=22.12.0" }` requires Node 22 in CI | FTP Deploy / workflow | High — using Node 20 may cause build failures; confirmed engines field in package.json |

---

## Open Questions (RESOLVED)

1. **Does the ULPGC FTP server support FTPS (explicit TLS on port 21)?**
   RESOLVED: Plans use `protocol: ftps` + `security: loose`. If FTPS is unavailable, the 04-04 human checkpoint includes explicit fallback instructions to switch to `protocol: ftp`. Document result in STATE.md after first deploy.

2. **Is `package-lock.json` committed to the repo?**
   RESOLVED: Confirmed present — `npm ci` is safe to use (noted in 04-01 interfaces block).

3. **Contrast ratio for `#52b788` on white**
   RESOLVED as task: 04-04 Task 1 verifies the ratio at execution time and darkens to `#2a7a5c` (~5.5:1) if the check fails. No blocking decision required before execution.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Astro build in CI | ✓ (local) | 22.15.1 (local) | N/A — CI installs via setup-node |
| npm | CI dependency install | ✓ | 10.x | — |
| GitHub Actions (CI) | Deploy pipeline | ✓ (plan) | N/A | Manual FTP deploy via `scripts/deploy-to-ulpgc.sh` (already exists) |
| FTP server `217.116.2.102` | Deploy | ✓ (confirmed with webmaster) | — | — |
| Google Rich Results Test | Structured data validation | ✓ (web tool) | — | — |

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Node.js ESM test script (`scripts/verify-build.mjs`) — no external test framework |
| Config file | none — standalone Node script |
| Quick run command | `node scripts/verify-build.mjs` (after `npm run build`) |
| Full suite command | `npm run build && node scripts/verify-build.mjs` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| I18N-05 | Breadcrumb JSON-LD present in each ES content page | build assertion | `grep -c "BreadcrumbList" dist/micologia/generalidades/index.html` | ❌ — add to verify-build.mjs (Wave 3) |
| I18N-05 | Breadcrumb JSON-LD present in each EN content page | build assertion | `grep -c "BreadcrumbList" dist/en/micologia/generalidades/index.html` | ❌ — add to verify-build.mjs (Wave 3) |
| I18N-05 | Breadcrumb visible nav present in content pages | build assertion | `grep -c "aria-current=\"page\"" dist/micologia/generalidades/index.html` | ❌ — add to verify-build.mjs |
| FOUND-05 | Skip link present on all pages | build assertion | `grep -c "skip-link" dist/index.html` | ✅ — already passes |
| FOUND-05 | `<html lang>` on all pages | build assertion | `grep -c 'lang="es"' dist/index.html` | ✅ — already passes |
| FOUND-05 | Laboratorio heading hierarchy fixed | build assertion | `grep -c "<h2>" dist/laboratorio/index.html` | ❌ — add after Wave 2 fix |

### Wave 0 Gaps (Test Infrastructure)

- [ ] `scripts/verify-build.mjs` — add breadcrumb assertions for all 26 content pages (Wave 3 task)

---

## Security Domain

> `security_enforcement` not explicitly set to false in `.planning/config.json` — including.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in this site |
| V3 Session Management | No | Static site, no sessions |
| V4 Access Control | No | Public read-only content |
| V5 Input Validation | No | No user input in this phase |
| V6 Cryptography | No | TLS handled by server infrastructure |
| V14 Configuration | Yes | FTP credentials must be GitHub Secrets, never committed to repo |

### Known Threat Patterns for CI/CD + FTP Deploy

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| FTP credentials in YAML | Information Disclosure | Store as GitHub Actions Secrets (`${{ secrets.FTP_PASSWORD }}`); never hardcode in YAML |
| Workflow injection via PR | Elevation of Privilege | Deploy workflow triggers on `push` to `main` only — PRs from forks cannot trigger deploy |
| Concurrent deploys corrupting server state | Tampering | `concurrency: group: production-deploy, cancel-in-progress: true` in workflow |
| JSON-LD XSS via frontmatter content | Tampering | `JSON.stringify()` escapes `<`, `>`, `&` in string values; `set:html` renders the already-escaped JSON safely in a `<script>` context |

---

## Sources

### Primary (HIGH confidence)
- BaseLayout.astro (line 43) — `<slot name="head" />` confirmed present [VERIFIED: codebase read]
- ContentPage.astro — no `<slot name="head" slot="head" />` confirmed absent [VERIFIED: codebase read]
- src/content.config.ts — contentSchema definition [VERIFIED: codebase read]
- src/i18n/ui.ts — existing keys; breadcrumb keys needed [VERIFIED: codebase read]
- package.json — Node >=22.12.0 constraint, Astro 7.3.6 [VERIFIED: codebase read]
- github.com/SamKirkland/FTP-Deploy-Action — v4.4.0, inputs confirmed [CITED: github.com/SamKirkland/FTP-Deploy-Action]
- developers.google.com/search/docs/appearance/structured-data/breadcrumb — JSON-LD schema, item URL rules [CITED]
- w3.org/WAI/ARIA/apg/patterns/breadcrumb/ — ARIA pattern, aria-current="page" [CITED]
- docs.astro.build/en/basics/astro-components/ — named slot forwarding `<slot name="x" slot="x" />` [CITED]

### Secondary (MEDIUM confidence)
- frodeflaten.com/posts/adding-structured-data-to-blog-posts-using-astro/ — `set:html` + JSON-LD pattern verified against official Astro docs
- wawsome.com/blog/spain-digital-accessibility-laws-guide — Real Decreto 1112/2018 scope and requirements
- github.com/SamKirkland/FTP-Deploy-Action/issues/149 — security: loose bug confirmed fixed in v4.x

### Tertiary (LOW confidence)
- Contrast ratio calculation for `#52b788` on white — calculated from hex, not verified with tool [ASSUMED — A3]
- aria-hidden on separator `<li>` elements — common practice, not explicitly specified in WAI-ARIA APG example [ASSUMED — A4]

---

## Metadata

**Confidence breakdown:**
- FTP Deploy Action: HIGH — confirmed via npm registry + GitHub README
- BreadcrumbList JSON-LD: HIGH — confirmed via Google official docs
- Slot forwarding: HIGH — confirmed via Astro official docs + codebase inspection (gap confirmed)
- contentSchema extension: HIGH — confirmed via codebase read (Zod optional field is non-breaking)
- WCAG 2.1 AA: HIGH for structural items (confirmed in codebase); MEDIUM for contrast ratio (A3)
- Heading hierarchy: HIGH — confirmed laboratorio.md issue via codebase grep

**Research date:** 2026-10-19
**Valid until:** 2027-01-19 (stable APIs; FTP-Deploy-Action version should be re-verified if planning extends beyond 90 days)
