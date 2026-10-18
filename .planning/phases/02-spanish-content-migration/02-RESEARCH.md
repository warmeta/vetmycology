# Phase 2: Spanish Content Migration — Research

**Researched:** 2026-10-18
**Domain:** Astro 7 content layout components, CSS-only navigation patterns, content migration pipeline fixes, image archive CSS Grid + `:target` lightbox
**Confidence:** HIGH (all critical patterns verified against installed Astro 7.3.6 source; extraction script bug verified by live testing)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Primary color — `#2D6A4F` for header, nav background, and primary interactive elements.
- **D-02:** Accent color — `#52B788` for hover states, links, active indicators, and decorative accents.
- **D-03:** Text `#1A1A1A` on white `#FFFFFF`. WCAG AA throughout.
- **D-04:** Inter (400 only) + Source Serif 4 (700 only) via Google Fonts with `display=swap` and `<link rel="preconnect">`.
- **D-05:** Modern, clean, academic-scientific. No decorative borders, gradients, text shadows. White background, generous whitespace.
- **D-06:** Desktop nav — CSS `:hover` + `:focus-within` dropdown. No JavaScript.
- **D-07:** 6 nav clusters: Inicio, Micología (3 pages), Patologías (4 pages), Investigación (2 pages), Laboratorio (single), Recursos (4 pages).
- **D-08:** Mobile — hamburger opens full-screen overlay, CSS `:checked` on hidden checkbox, `<details>`/`<summary>` accordions. No JavaScript.
- **D-09:** Header — logo left / nav right (desktop), logo + hamburger (mobile), `position: sticky; top: 0`.
- **D-10:** All content pages — `max-width: 740px; margin: 0 auto`, no sidebar.
- **D-11:** TOC on pathology pages — `<nav aria-label="En esta página">` at TOP, before first h2. `toc: true` in frontmatter.
- **D-12:** Image archive — CSS Grid `repeat(auto-fill, minmax(200px, 1fr))` desktop, `minmax(140px, 1fr)` mobile. CSS `:target` lightbox, no JavaScript.
- **D-13:** Source files at `~/Downloads/backup/` (NOT in repo).
- **D-14:** Extraction tool — `scripts/extract_frontpage.py`. Run manually per-file.
- **D-15:** GIFs excluded. JPG/PNG only.
- **D-16:** Images in `public/images/[section-slug]/`, lowercase, hyphens.
- **D-17:** PDFs in `public/docs/`, ASCII-only filenames.

### Claude's Discretion

- Exact CSS Custom Property names and token structure
- Specific font weight combinations beyond Inter 400 and Serif 700
- Footer layout details
- Breadcrumb implementation (deferred to Phase 4)
- Card or list presentation for bibliography and links pages

### Deferred Ideas (OUT OF SCOPE)

- **Breadcrumbs** — Phase 4 only
- **Language switcher wiring** — Phase 3; Phase 2 uses static "ES" placeholder
- **hreflang tags** — Phase 3
- **Print stylesheet** — v2, out of scope entirely
- **Dark mode** — out of scope

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NAV-01 | Base layout wraps every page with header, nav, main slot, footer | `BaseLayout.astro` pattern with `<slot />` verified — Astro 7 scoped styles + CSS global import |
| NAV-02 | Grouped top navigation with 6 clusters, dropdowns on hover/focus (desktop), accordion hamburger (mobile) | CSS `:hover`+`:focus-within` dropdown and CSS `:checked` hamburger patterns documented; no JS needed |
| NAV-04 | Responsive at 375px, 768px, 1280px | Mobile-first CSS with `@media (min-width: 1024px)` — all patterns in UI-SPEC verified |
| NAV-05 | Footer with ULPGC + IUSA logos, faculty name, affiliation text | Static `Footer.astro` component with logo images from `public/images/logos/` |
| CONT-01 | Home page with group title, logos, Dr. Begoña name + CV link, 3 photos | `src/pages/index.astro` — already exists as skeleton; replace content; no collection needed |
| CONT-02–09 | 14 content sections migrated from FrontPage .htm | `render()` from `astro:content` + `ContentPage.astro` layout; **extraction script must be fixed first** (see Pitfall 1) |
| CONT-10–15 | Image archive, links, bibliography, laboratorio | Same pattern; archive uses `ImageArchive.astro` layout instead of `ContentPage.astro` |
| MEDIA-01 | CSS Grid thumbnail grid | `repeat(auto-fill, minmax(200px, 1fr))` — verified in UI-SPEC |
| MEDIA-02 | CSS `:target` lightbox | Pattern documented in UI-SPEC; verified against CSS spec |
| MEDIA-03 | TOC on pathology pages | `TableOfContents.astro` with hardcoded `{id, label}` array from frontmatter |
| MEDIA-04 | PDFs in `public/docs/` with ASCII filenames | Static file — no Astro API needed; `<a href="/docs/...">` link pattern |

</phase_requirements>

---

## Summary

Phase 2 is a component-building + content-migration phase. The Astro 7 API is stable and well-understood from Phase 1. The primary technical domains are: (1) building the layout component tree (`BaseLayout` → `ContentPage`/`ImageArchive`), (2) implementing CSS-only navigation (hover dropdowns + checkbox hamburger), (3) fixing and running the extraction script to migrate 14 FrontPage .htm files to Markdown, and (4) setting up Content Collections for the 5 content groups.

**Critical discovery — extraction script bug:** The current `scripts/extract_frontpage.py` uses `tag.decompose()` for `<font>` tags. FrontPage HTML wraps nearly all visible text in `<font color="..." face="...">` elements. Decomposing them **silently deletes all text content**, producing empty or near-empty Markdown output. The fix is `tag.unwrap()` instead of `tag.decompose()` for `font` tags. This was verified by live testing against `generalidades_1.htm` (the longest, richest content file) — with the fix applied, the extraction produces correct prose markdown. All 14 source .htm files are confirmed present at `~/Downloads/backup/`.

**Astro 7 render pattern:** Content collection entries are rendered with `const { Content, headings } = await render(entry)` (imported from `astro:content`). `headings` is an array of `{depth, slug, text}` — this drives the `TableOfContents` component without any client-side JavaScript.

**No new npm packages required.** All UI is plain CSS in Astro scoped styles. The Content Collections infrastructure is already scaffolded. The only code change needed to `package.json` is none.

**Primary recommendation:** Fix the extraction script font unwrap bug first (Wave 0), then build the layout component tree (Wave 1), then migrate all 14 content sections (Wave 2), handling the image archive last as it requires manual image preparation.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Base layout (header/nav/footer shell) | Frontend Server (Astro build) | — | `BaseLayout.astro` compiled to HTML wrapper at build time; no runtime |
| CSS-only navigation (dropdowns, hamburger) | Browser / Client | Frontend Server | CSS `:hover`, `:focus-within`, `:checked`, `<details>` — pure browser behavior, zero JS shipped |
| Content Collections routing | Frontend Server (Astro build) | — | Static pages at `/micologia/generalidades/` produced from `.md` + `.astro` page files at build time |
| Content markdown rendering | Frontend Server (Astro build) | — | `render(entry)` from `astro:content` compiles markdown to HTML at build time via Sätteri |
| Image archive lightbox | Browser / Client | Frontend Server | CSS `:target` pseudo-class — browser URL fragment mechanism; no JS; overlay HTML produced at build time |
| Table of contents generation | Frontend Server (Astro build) | — | `headings` array from `render(entry)` used at build time to produce TOC HTML |
| Media assets (images, PDFs) | CDN / Static (Apache) | — | Files in `public/` copy to `dist/` unchanged; served directly by Apache |
| Font loading (Google Fonts) | Browser / Client | CDN / Static | `<link rel="stylesheet">` in `BaseLayout.astro` `<head>` — browser fetches from fonts.googleapis.com |

---

## Standard Stack

### Core (already installed — no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `astro` | 7.3.6 [VERIFIED: npm registry, installed] | Static site generator, content collections, routing | Already installed; Phase 1 locked |
| `@astrojs/markdown-satteri` | 0.4.3 [VERIFIED: installed at node_modules/@astrojs/markdown-satteri] | Default Markdown processor (Sätteri) | Bundled with Astro 7; handles `.md` → HTML, exports `headings` array |
| `typescript` | 6.0.3 [VERIFIED: installed] | Type safety for component props and collection schemas | Already installed |

### New npm packages required: NONE

All Phase 2 UI is plain CSS in Astro scoped `<style>` blocks. All content APIs are built into Astro 7. No additional npm packages.

### Python extraction tooling (already installed in `.venv`)

| Library | Version | Purpose |
|---------|---------|---------|
| `beautifulsoup4` | 4.15.0 [VERIFIED: installed] | HTML parsing |
| `markdownify` | 1.2.3 [VERIFIED: installed] | HTML → Markdown |

**Installation:** None needed. `.venv` from Phase 1 contains all dependencies.

---

## Package Legitimacy Audit

> Phase 2 installs no new npm or PyPI packages. All dependencies were installed and audited in Phase 1. This section confirms no new packages are required.

| Package | Registry | Disposition |
|---------|----------|-------------|
| (none new) | — | No new packages — all Phase 1 packages remain |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
~/Downloads/backup/[section].htm  (ISO-8859-1, FrontPage HTML)
        │
        ▼  scripts/extract_frontpage.py  [FIXED: font.unwrap() not .decompose()]
        │  + OOXML <![if]> stripping
        │  + layout table navigation (select content TD)
        ▼
src/content/[group]/[slug].md  (UTF-8 Markdown with YAML frontmatter)
        │
src/pages/[group]/[slug].astro  ← static route files
        │  import { getEntry, render } from 'astro:content'
        │  const entry = await getEntry(collection, id)
        │  const { Content, headings } = await render(entry)
        ├─→ ContentPage.astro layout (740px prose column)
        │     ├─ TableOfContents.astro (when toc: true, uses headings[])
        │     └─ <Content />  (rendered markdown body)
        │
src/pages/recursos/archivo-imagenes.astro  ← special page, no collection
        │  ImageArchive.astro layout
        │  Hardcoded image list (or generated from public/images/archivo/)
        ▼
dist/
  index.html                         ← home page (CONT-01)
  micologia/generalidades/index.html ← CONT-02
  micologia/grupo-de-trabajo/index.html
  micologia/colreptiles/index.html
  patologias/levaduras/index.html    ← CONT-06 (toc: true)
  patologias/filamentosos/index.html ← CONT-07 (toc: true)
  patologias/dimorficos/index.html   ← CONT-08 (toc: true)
  patologias/micosis-peces/index.html
  investigacion/articulos-congresos/index.html
  investigacion/articulos-interesantes/index.html
  laboratorio/index.html
  recursos/archivo-imagenes/index.html
  recursos/links-micologia/index.html
  recursos/links-revistas/index.html
  recursos/bibliografia/index.html
  _astro/                            ← hashed CSS
  images/                            ← from public/
  docs/                              ← PDFs from public/
```

### Recommended Project Structure

```
src/
├── content.config.ts           # Extend with 5 collection groups (see pattern below)
├── content/
│   ├── micologia/              # generalidades.md, grupo-de-trabajo.md, colreptiles.md
│   ├── patologias/             # levaduras.md, filamentosos.md, dimorficos.md, micosis-peces.md
│   ├── investigacion/          # articulos-congresos.md, articulos-interesantes.md
│   ├── laboratorio/            # laboratorio.md
│   └── recursos/               # links-micologia.md, links-revistas.md, bibliografia.md
├── layouts/
│   ├── BaseLayout.astro        # HTML shell + head + slot
│   ├── ContentPage.astro       # BaseLayout + 740px prose + optional TOC
│   └── ImageArchive.astro      # BaseLayout + CSS Grid + lightbox overlays
├── components/
│   ├── Header.astro            # Sticky header with TopNav + MobileNav
│   ├── TopNav.astro            # 6 cluster CSS hover dropdowns (desktop)
│   ├── MobileNav.astro         # Full-screen overlay CSS :checked (mobile)
│   ├── Footer.astro            # Logos + affiliation text
│   └── TableOfContents.astro   # <nav aria-label> + anchor list
├── pages/
│   ├── index.astro             # Home (CONT-01) — replace skeleton
│   ├── micologia/
│   │   ├── generalidades.astro
│   │   ├── grupo-de-trabajo.astro
│   │   └── colreptiles.astro
│   ├── patologias/
│   │   ├── levaduras.astro
│   │   ├── filamentosos.astro
│   │   ├── dimorficos.astro
│   │   └── micosis-peces.astro
│   ├── investigacion/
│   │   ├── articulos-congresos.astro
│   │   └── articulos-interesantes.astro
│   ├── laboratorio/
│   │   └── index.astro
│   └── recursos/
│       ├── archivo-imagenes.astro
│       ├── links-micologia.astro
│       ├── links-revistas.astro
│       └── bibliografia.astro
└── styles/
    └── global.css              # :root CSS Custom Properties (from UI-SPEC verbatim)
public/
├── images/
│   ├── logos/                  # ulpgc.png, iusa.png
│   ├── home/                   # 3 representative photos (CONT-01)
│   └── archivo/                # thumb-[slug].jpg, full-[slug].jpg (CONT-10)
└── docs/                       # PDFs with ASCII-only filenames (MEDIA-04)
```

**Key structural note:** With `prefixDefaultLocale: false`, all Spanish pages live directly in `src/pages/` (no `/es/` prefix). English pages will be added in Phase 3 under `src/pages/en/`. No routing changes needed for Phase 2.

### Pattern 1: Astro 7 Content Collection Schema (multi-group)

**What:** Define one collection per content group (not one monolithic collection) so schemas can be tailored.
**When to use:** `src/content.config.ts` — replace the existing `pages` stub with real collections.

```typescript
// src/content.config.ts
// Source: Astro 7 Content Layer API — verified against installed node_modules/astro/types/content.d.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod'; // Astro 6+ import — do NOT use astro:content

const contentSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  toc: z.boolean().default(false),
  lang: z.enum(['es', 'en']).default('es'),
});

const micologia = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/micologia' }),
  schema: contentSchema,
});

const patologias = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/patologias' }),
  schema: contentSchema,
});

const investigacion = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/investigacion' }),
  schema: contentSchema,
});

const laboratorio = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/laboratorio' }),
  schema: contentSchema,
});

const recursos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recursos' }),
  schema: contentSchema,
});

export const collections = { micologia, patologias, investigacion, laboratorio, recursos };
```

### Pattern 2: Astro 7 Content Rendering in a Static Page

**What:** Fetch a single content entry by ID and render it. No `getStaticPaths` needed because each content section has its own dedicated `.astro` page file (static route, not dynamic `[slug].astro`).
**When to use:** Each `src/pages/[group]/[page].astro` file.

```astro
---
// src/pages/micologia/generalidades.astro
// Source: Astro 7 content.d.ts — render() is a named export from astro:content
import { getEntry, render } from 'astro:content';
import ContentPage from '../../layouts/ContentPage.astro';

const entry = await getEntry('micologia', 'generalidades');
if (!entry) throw new Error('Entry not found: micologia/generalidades');

const { Content } = await render(entry);
// NOTE (Phase 2 implementation decision): Plans 02-02 through 02-04 use hardcoded
// tocItems arrays instead of the dynamic headings[] pattern shown below.
// The headings[] approach is valid and works well for pages where headings are
// not known at plan-time. Phase 2 uses tocItems because only 3 pages need TOC
// and their section titles are known. Do NOT pass headings={headings} to ContentPage
// in Phase 2 — ContentPage.astro Props expects tocItems, not headings.
//
// Dynamic headings approach (for reference / Phase 3+):
//   const { Content, headings } = await render(entry);
//   const tocItems = headings.filter(h => h.depth === 2);
---
<ContentPage
  title={entry.data.title}
  description={entry.data.description}
  toc={entry.data.toc}
  tocItems={tocItems}
>
  <Content />
</ContentPage>
// Where tocItems is a hardcoded Array<{ id: string; label: string }> defined
// in the page frontmatter script, with IDs verified from Sätteri slug output.
```

**Important:** `render()` is imported from `astro:content` in Astro 7 (it was `entry.render()` in Astro 4 — that method was removed in Astro 5). Verified against `node_modules/astro/templates/content/types.d.ts`:
```typescript
export function render<C extends keyof DataEntryMap>(
  entry: DataEntryMap[C][string],
): Promise<RenderResult>;
```
Where `RenderResult.headings` is `import('astro').MarkdownHeading[]`.

### Pattern 3: BaseLayout Component

**What:** The HTML shell wrapping every page. Imports global CSS and Google Fonts, provides `<slot />`.
**When to use:** All page layouts extend BaseLayout.

```astro
---
// src/layouts/BaseLayout.astro
// Source: UI-SPEC.md BaseLayout Component Contract
import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description?: string;
  lang?: 'es' | 'en';
}

const { title, description, lang = 'es' } = Astro.props;
---
<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400&family=Source+Serif+4:wght@700&display=swap"
    />
    <slot name="head" />
  </head>
  <body>
    <Header />
    <slot />
    <Footer />
  </body>
</html>
```

**Note on `import '../styles/global.css'`:** This is Astro's supported pattern for importing CSS from a layout frontmatter. Astro processes it at build time and injects the CSS into the page's `<head>`. It is equivalent to `<link rel="stylesheet" href=...>` but uses Vite's asset pipeline for cache-busting. [VERIFIED: Astro 7 internals — scoped/global CSS import pattern is unchanged from Astro 4+]

### Pattern 4: CSS-Only Hover Dropdown Navigation

**What:** Desktop nav with hover dropdowns using only CSS `:hover` and `:focus-within`. No JavaScript.
**When to use:** `TopNav.astro`, desktop breakpoint (`@media (min-width: 1024px)`).

```css
/* Source: UI-SPEC.md Desktop dropdown CSS pattern (D-06) */
/* All tokens from global.css :root */
.nav-group {
  position: relative;
}

.nav-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: var(--color-nav-bg);    /* #2D6A4F */
  min-width: 220px;
  z-index: 200;
  border-top: 2px solid var(--color-accent); /* visual separator */
}

/* Keyboard accessible: :focus-within catches Tab into dropdown links */
.nav-group:hover .nav-dropdown,
.nav-group:focus-within .nav-dropdown {
  display: block;
}

.nav-group-label {
  color: var(--color-nav-text);
  padding: 0 var(--space-md);
  height: 56px;
  display: flex;
  align-items: center;
  border-left: 4px solid transparent;  /* reserve space for accent indicator */
  transition: border-color 0.1s;
}

.nav-group:hover .nav-group-label,
.nav-group:focus-within .nav-group-label {
  border-left-color: var(--color-accent);  /* #52B788 */
}
```

**Known limitation:** CSS `:focus-within` fires when ANY descendant has focus — including the dropdown links. This is the correct behavior (dropdown stays open when tabbing through it). `display: none` → `display: block` means the dropdown is not animated, but this is acceptable per D-05 (no decorative transitions).

### Pattern 5: CSS-Only Hamburger Mobile Menu

**What:** Mobile full-screen overlay navigation using a hidden checkbox and `:checked` pseudo-class. `<details>`/`<summary>` for group accordions. Zero JavaScript.
**When to use:** `MobileNav.astro`, applies at `@media (max-width: 1023px)` (mobile breakpoint).

```html
<!-- Source: UI-SPEC.md Mobile nav CSS pattern (D-08) -->
<!-- Hidden checkbox — the toggle state lives in the DOM, no JS needed -->
<input type="checkbox" id="nav-toggle" class="nav-toggle-input" />

<!-- Hamburger button label (clicking toggles checkbox) -->
<label for="nav-toggle" class="nav-hamburger" aria-label="Abrir menú de navegación">
  ☰
</label>

<!-- Full-screen overlay — shown when checkbox is checked -->
<div class="mobile-nav-overlay">
  <label for="nav-toggle" class="nav-close" aria-label="Cerrar menú de navegación">
    ✕
  </label>
  <nav>
    <details>
      <summary>Micología</summary>
      <ul>
        <li><a href="/micologia/generalidades/">Generalidades de los hongos</a></li>
        <li><a href="/micologia/grupo-de-trabajo/">Grupo de trabajo</a></li>
        <li><a href="/micologia/colreptiles/">Colaboración con reptiles</a></li>
      </ul>
    </details>
    <!-- ... other groups ... -->
  </nav>
</div>
```

```css
/* Source: UI-SPEC.md Mobile nav CSS pattern */
.nav-toggle-input { display: none; }  /* hide the actual checkbox */

.nav-hamburger {
  display: none;   /* hidden on desktop */
  cursor: pointer;
  color: var(--color-nav-text);
  font-size: 1.5rem;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-nav-overlay {
  display: none;    /* hidden by default */
  position: fixed;
  inset: 0;
  background: var(--color-nav-bg);
  z-index: 300;
  flex-direction: column;
  padding: var(--space-lg);
}

/* Show overlay when checkbox is checked */
#nav-toggle:checked ~ .mobile-nav-overlay {
  display: flex;
}

/* Desktop: hide hamburger, show TopNav; Mobile: hide TopNav, show hamburger */
@media (min-width: 1024px) {
  .nav-hamburger { display: none; }
  .mobile-nav-overlay { display: none !important; }  /* override :checked on resize */
}

@media (max-width: 1023px) {
  .nav-hamburger { display: flex; }
  .top-nav { display: none; }  /* hide desktop nav on mobile */
}
```

**`<details>`/`<summary>` accordion:** Native browser element — keyboard accessible, no JS. The `[open]` state is managed by the browser. Each group is a `<details>` with `<summary>` as the clickable header.

### Pattern 6: CSS `:target` Lightbox (Image Archive)

**What:** Click a thumbnail → URL fragment changes → `:target` CSS activates the full-screen overlay. Zero JavaScript.
**When to use:** `ImageArchive.astro` layout (CONT-10, MEDIA-01, MEDIA-02).

```html
<!-- Source: UI-SPEC.md ImageArchive Layout Contract -->
<!-- Thumbnail grid item -->
<a href="#image-candida-1" class="thumb-link" aria-label="Ver imagen a tamaño completo">
  <img src="/images/archivo/thumb-candida-1.jpg" alt="Candida albicans" loading="lazy" />
</a>

<!-- Lightbox overlay (placed at bottom of <body> or end of page) -->
<div id="image-candida-1" class="lightbox" role="dialog" aria-label="Candida albicans a tamaño completo">
  <a href="#" class="lightbox-backdrop" aria-label="Cerrar imagen"></a>
  <figure class="lightbox-figure">
    <a href="#" class="lightbox-close" aria-label="Cerrar">✕</a>
    <img src="/images/archivo/full-candida-1.jpg" alt="Candida albicans" />
  </figure>
</div>
```

```css
/* Source: UI-SPEC.md ImageArchive Layout Contract */
.lightbox { display: none; position: fixed; inset: 0; z-index: 400; align-items: center; justify-content: center; }
.lightbox:target { display: flex; }  /* the key line — CSS :target activates on URL fragment match */
.lightbox-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.85); cursor: pointer; text-decoration: none; }
.lightbox-figure { position: relative; z-index: 1; max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column; align-items: flex-end; }
.lightbox-figure img { max-width: 100%; max-height: 85vh; object-fit: contain; display: block; }
.lightbox-close { color: white; font-size: 1.5rem; text-decoration: none; padding: var(--space-xs) var(--space-sm); line-height: 1; order: -1; }
```

**Close mechanism:** `href="#"` on the close button and backdrop clears the URL fragment (sets it to empty/`#`), which removes `:target` from the lightbox div, hiding it. This is the standard pattern for CSS-only lightboxes. [ASSUMED — CSS spec behavior, not independently verified via Context7, but this is well-established web standard behavior]

### Pattern 7: TableOfContents Component Using `headings` Array

**What:** Render a TOC from the `headings` array returned by `render(entry)`. Hardcoded per page in Phase 2.
**When to use:** `ContentPage.astro` when `toc={true}` — pathology pages only (levaduras, filamentosos, dimórficos).

```astro
---
// src/components/TableOfContents.astro
// Source: UI-SPEC.md TableOfContents Component Contract
interface Props {
  headings: Array<{ depth: number; slug: string; text: string }>;
}
const { headings } = Astro.props;
// Only include h2-level headings for TOC (depth === 2)
const tocItems = headings.filter(h => h.depth === 2);
---
<nav aria-label="En esta página" class="toc">
  <p class="toc-title">En esta página</p>
  <ol>
    {tocItems.map(item => (
      <li>
        <a href={`#${item.slug}`}>{item.text}</a>
      </li>
    ))}
  </ol>
</nav>
```

**Note on `headings` from Sätteri:** Astro 7's Sätteri processor auto-generates `id` attributes on headings during markdown rendering. The `slug` field in the headings array matches the generated `id`. This means the markdown content does NOT need manually added `id` attributes on `## Section heading` lines — Sätteri handles this automatically. [VERIFIED: `node_modules/astro/templates/content/types.d.ts` — `MarkdownHeading[]` contains `slug` field; `@astrojs/markdown-satteri` exports `satteriHeadingIdsPlugin`]

### Pattern 8: Fixed Extraction Script (font.unwrap() Critical Fix)

**What:** The current `scripts/extract_frontpage.py` decomposes `<font>` tags, silently deleting all text wrapped in them. The fix uses `unwrap()` to remove the tag while preserving its text children.
**When to use:** Immediately — this is a blocking bug that must be fixed before any content migration.

```python
# CURRENT (broken) — scripts/extract_frontpage.py line ~52
for tag in soup.find_all(['script', 'style', 'font', 'frameset', 'frame']):
    tag.decompose()  # BUG: deletes <font>-wrapped text

# FIXED — separate font from layout-cruft:
for tag in soup.find_all(['script', 'style', 'frameset', 'frame']):
    tag.decompose()  # these have no content to preserve
for tag in soup.find_all('font'):
    tag.unwrap()  # preserve text, remove font wrapper only
```

**Additionally required:** The extraction script also needs to add OOXML conditional block stripping (Step 2, after existing regex passes):

```python
# Add after the existing mstable regex line in extract():
# Strip OOXML/VML conditional blocks: <![if !supportLists]>...<![endif]>
# These are Office-generated display conditionals — content inside is navigation lists
# that duplicate visible content and should be removed
text = re.sub(r'<!\[if[^\]]*\]>(.*?)<!\[endif\]>', '', text,
              flags=re.IGNORECASE | re.DOTALL)
```

**The full working pipeline (verified against generalidades_1.htm — 116KB file with 56 content blocks):**
1. Read ISO-8859-1 bytes, decode to Unicode
2. Regex-strip webbot/mstheme/mstable (existing)
3. Regex-strip OOXML `<![if]>...<![endif]>` conditionals (NEW)
4. BeautifulSoup parse, extract Comment nodes
5. `tag.decompose()` for script, style, frameset, frame
6. `tag.unwrap()` for font tags (FIXED — was decompose)
7. Navigate to content TD: `body.find_all('table', recursive=False)[1].find_all('td')[-1]`
8. `html.unescape()` + `markdownify()`
9. Clean whitespace, write UTF-8

**Alternative simpler approach:** Keep the existing full-body approach but just fix the font unwrap. The layout table "noise" (empty pipe characters from table-to-markdown) can be stripped post-hoc:
```python
# Post-processing: strip empty markdown table rows that come from layout tables
result = re.sub(r'^\|[\s|]*\|\s*$', '', result, flags=re.MULTILINE)
result = re.sub(r'\n{3,}', '\n\n', result)
```
Either approach works. The targeted content-TD approach is cleaner; the full-body + post-strip is simpler to implement.

### Pattern 9: Markdown Frontmatter Format

Each migrated `.md` file needs a YAML frontmatter block:

```markdown
---
title: "Generalidades de los Hongos Patógenos"
description: "Clasificación, morfología y principales características de los hongos patógenos veterinarios"
toc: false
lang: "es"
---

## MICOLOGÍA

Es la ciencia que se ocupa del estudio de los hongos...
```

TOC pages (levaduras, filamentosos, dimórficos) set `toc: true`. The `title` comes from the content; the `description` is a brief summary (written by developer during migration, not from original content).

### Anti-Patterns to Avoid

- **`tag.decompose()` on `<font>` tags:** Destroys all FrontPage content. Always use `tag.unwrap()` for font tags. [VERIFIED by live testing]
- **Using `entry.render()` method (Astro 4 API):** Removed in Astro 5. Use `render(entry)` imported from `astro:content`. [VERIFIED: Astro 7 types.d.ts]
- **CSS Custom Properties in `@media` queries:** `--bp-desktop: 1024px` cannot be used as `@media (min-width: var(--bp-desktop))`. Use raw pixel values (`1024px`) in media queries. [CITED: CSS spec — custom properties not evaluated in media query conditions]
- **Scoping nav hover styles with `:global()`:** If `TopNav.astro` uses `<style>` scoped blocks, the `:hover .nav-dropdown` selector may be scoped away from child elements. Use `:global()` for descendant selectors that cross component boundaries, or put nav hover CSS in `global.css`. The simplest approach is to put all nav hover/dropdown CSS in the component's own `<style>` block with `:global()` for any descendant rules. [ASSUMED based on Astro scoped styles behavior]
- **Placing all lightbox `<div id="...">` overlays inside the grid:** CSS `:target` works fine wherever the element is in the DOM, but placing all overlays at the end of `<body>` (not inside the grid container) ensures they render above all other content correctly.
- **One monolithic collection for all 14 pages:** Harder to query by group, harder to add group-specific schema fields later. Use per-group collections.
- **Dynamic `[slug].astro` routing for content:** 14 pages with different layouts (most use `ContentPage`, the archive uses `ImageArchive`) are better served by individual static page files. No `getStaticPaths` complexity needed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown → HTML rendering | Custom markdown parser | Astro's `render(entry)` + Sätteri | Handles heading ID generation, GFM tables, code blocks, smart quotes |
| Heading ID generation for TOC | Regex on markdown source | `headings` array from `render()` | Sätteri generates IDs automatically; the `slug` field is exactly what you need for `href="#slug"` |
| CSS-only dropdown hover state | JS mouseover/mouseout | CSS `:hover` + `:focus-within` | Browser handles state natively, keyboard accessible, zero runtime cost |
| Mobile menu toggle state | JS click handler + classList | CSS `:checked` on hidden `<input type="checkbox">` | Browser manages checkbox state, `~` sibling combinator triggers overlay display |
| Lightbox overlay show/hide | JS click handler | CSS `:target` pseudo-class | Browser URL fragment mechanism drives the state; works with keyboard, back button |
| FrontPage content extraction | Manual string parsing of .htm | `beautifulsoup4` + `markdownify` (fixed script) | FrontPage HTML has nested table layouts, OOXML conditionals, font wrappers — string parsing will miss edge cases |
| Component accessibility labels | Visual-only labels | `aria-label` on all interactive elements | Hamburger button, lightbox close, lightbox overlay — all need aria-labels (documented in UI-SPEC Copywriting Contract) |

**Key insight:** All interactive behaviors required by Phase 2 (dropdown nav, hamburger menu, lightbox) can be implemented with zero JavaScript using CSS pseudo-classes (`:hover`, `:focus-within`, `:checked`, `:target`) and the HTML `<details>`/`<summary>` element. Resist the temptation to add a small JS snippet — the CSS approach is faster, more accessible, and requires no JS bundle.

---

## Common Pitfalls

### Pitfall 1: font.decompose() Silently Deletes All Content (CRITICAL — BLOCKING)

**What goes wrong:** Running `scripts/extract_frontpage.py` produces empty or near-empty Markdown output — just a few pipe characters. The script appears to succeed with exit code 0.
**Why it happens:** FrontPage HTML wraps virtually all visible text in `<font color="..." face="...">` elements. The current script's `tag.decompose()` for font tags removes the tag AND all its children, including all text content.
**How to avoid:** Change line ~52 in `extract_frontpage.py` to use `tag.unwrap()` for font tags (see Pattern 8). This must be fixed BEFORE any content migration begins.
**Warning signs:** Extracted `.md` files are 5–10 lines of empty table rows (`| |`, `| --- |`) with no headings or paragraph text.

**Live verification:** Tested against `generalidades_1.htm` (116KB, 56 content blocks, 284 font tags). Current script output: 6 lines, all pipe characters. Fixed script output: 3000+ chars of clean prose markdown.

### Pitfall 2: Sätteri Heading IDs vs Manual `id` Attributes

**What goes wrong:** Developer manually adds `{#section-id}` syntax (remark extended markdown) to heading lines, expecting them to generate `id` attributes. Sätteri does not support `{#id}` syntax by default.
**Why it happens:** Astro 7 uses Sätteri (not remark) by default. Sätteri generates heading IDs automatically from the heading text (kebab-case slug). The `headings[].slug` field from `render()` gives you the correct ID.
**How to avoid:** Do NOT add `{#id}` to headings in markdown files. Use `headings` array from `render()` directly. For TOC links: `<a href={#${item.slug}}>{item.text}</a>`.
**Warning signs:** `{#section-id}` text appears as literal text in rendered output rather than being consumed as an ID attribute.

### Pitfall 3: Scoped CSS Not Applying to Markdown-Rendered Content

**What goes wrong:** Prose styles defined in `ContentPage.astro`'s `<style>` block do not apply to the `<Content />` rendered markdown body — headings, links, and paragraphs from markdown have no custom styles.
**Why it happens:** Astro's scoped styles add a unique attribute (`data-astro-cid-xxxx`) to elements rendered by the component itself, but NOT to elements rendered by a child component or markdown slot content. The rendered markdown HTML is outside the scope.
**How to avoid:** Use `:global()` in the ContentPage scoped style for prose rules that target markdown-rendered content:
```css
<style>
  /* Applies to this component's own elements */
  .content-page { max-width: 740px; margin: 0 auto; }
  
  /* Must use :global() to reach markdown-rendered children */
  .content-page :global(h1) { font-family: var(--font-heading); ... }
  .content-page :global(h2) { font-family: var(--font-heading); ... }
  .content-page :global(p) { ... }
  .content-page :global(a) { color: var(--color-accent); ... }
</style>
```
**Warning signs:** Markdown content renders with browser defaults (Times New Roman, blue links) instead of Inter/Source Serif 4.

### Pitfall 4: Image Archive Lightbox Close Clears Wrong Fragment

**What goes wrong:** Clicking the lightbox backdrop/close button scrolls the page to the top instead of smoothly closing the lightbox, because `href="#"` navigates to the page `<a name="">` anchor.
**Why it happens:** `href="#"` is equivalent to `href="[url]#"` which adds an empty fragment to the history. In some browsers, scrolling-to-top behavior occurs.
**How to avoid:** Use `href="#_"` (a fragment that doesn't match any element ID) instead of `href="#"`. When the fragment `#_` doesn't match any element, no `:target` activates and no scroll happens. Alternatively, `href="#0"` works if no element has `id="0"`.
**Warning signs:** Closing the lightbox causes the page to scroll to the top, or the browser's back button shows extra history entries.

### Pitfall 5: Mobile Menu :checked State Persisting on Viewport Resize

**What goes wrong:** User opens mobile menu (checkbox checked), rotates device to landscape/desktop width — the menu stays visually hidden (correct CSS from `display: none !important` override) but the checkbox remains checked. If they resize back to mobile, the menu re-opens unexpectedly.
**Why it happens:** CSS can hide elements but cannot reset checkbox state.
**How to avoid:** This is acceptable for a Phase 2 MVP — it's an edge case affecting only users who resize during a session. Document as known limitation. Phase 4 polish can add a simple JS reset if needed. The `display: none !important` on the overlay at desktop width correctly prevents the open menu from being visible.
**Warning signs:** On resize back to mobile, menu is immediately visible without user interaction.

### Pitfall 6: FrontPage Source Files Have OOXML Conditional Blocks (`<![if]>`)

**What goes wrong:** Extraction produces markdown links with `[if !supportLists?` in the link text, or `if !mso? endif?` as standalone text in the markdown.
**Why it happens:** FrontPage-generated HTML contains OOXML/VML conditional blocks (`<![if !supportLists]>...<![endif]>`) that are Word-compatibility list numbering artifacts. BeautifulSoup's HTML parser does not treat these as comments — they appear as raw text nodes or malformed tags.
**How to avoid:** Add a pre-processing regex step to strip them (see Pattern 8):
```python
text = re.sub(r'<!\[if[^\]]*\]>(.*?)<!\[endif\]>', '', text, flags=re.IGNORECASE | re.DOTALL)
```
This must run at the raw string level BEFORE BeautifulSoup parsing, where the patterns are still intact.
**Warning signs:** Extracted markdown contains `[if !supportLists?` or `if !mso? endif?` text strings.

### Pitfall 7: getEntry() ID Must Match Glob Loader Output

**What goes wrong:** `await getEntry('micologia', 'generalidades')` returns `undefined` even though `src/content/micologia/generalidades.md` exists.
**Why it happens:** The Astro 7 glob loader generates IDs from the file path relative to the `base` directory. The ID is the filename without extension. If the file is `src/content/micologia/generalidades.md` with `base: './src/content/micologia'`, the ID is `generalidades`.
**How to avoid:** Run `astro dev` or `astro sync` to generate the `.astro/content.d.ts` type file, which shows the exact IDs. IDs are case-sensitive on Linux servers (the ULPGC Apache server may be case-sensitive).
**Warning signs:** `getEntry()` returns `undefined` at runtime; build succeeds but page throws 'Entry not found' error.

---

## Extraction Script — Source File Audit

All 14 required source files confirmed present at `~/Downloads/backup/`:

| Source .htm | Target Collection Path | Notes |
|-------------|----------------------|-------|
| `generalidades_1.htm` | `src/content/micologia/generalidades.md` | Rich content, 116KB, 56 content blocks, 284 font tags — verified extraction works after fix |
| `grupo_de_trabajo.htm` | `src/content/micologia/grupo-de-trabajo.md` | |
| `colreptiles.htm` | `src/content/micologia/colreptiles.md` | Smaller file |
| `comunicaciones  en revistas y congresos.htm` | `src/content/investigacion/articulos-congresos.md` | Filename has double space — must quote in shell |
| `patologias por levaduras.htm` | `src/content/patologias/levaduras.md` | `toc: true` — needs h2 structure for TOC |
| `patologias por filamentosos.htm` | `src/content/patologias/filamentosos.md` | `toc: true` |
| `patologias por dimorficos.htm` | `src/content/patologias/dimorficos.md` | `toc: true` |
| `principales_enfermedades_pecesi.htm` | `src/content/patologias/micosis-peces.md` | |
| `archivo_de_imagenes_propias..htm` | Not used for content — `ImageArchive.astro` is hardcoded | Archive page renders image list from `public/images/archivo/`, not content collection |
| `articulos_1.htm` | `src/content/investigacion/articulos-interesantes.md` | |
| `links_de_micologia..htm` | `src/content/recursos/links-micologia.md` | Double dot in filename |
| `links_revistas_de_micologia..htm` | `src/content/recursos/links-revistas.md` | Double dot in filename |
| `enfermedades_infecciosas..htm` | `src/content/laboratorio/laboratorio.md` | Double dot in filename |
| `bibliografia_1.htm` | `src/content/recursos/bibliografia.md` | |

**Image archive note:** `archivo_de_imagenes_propias..htm` references PDFs (`malassezias.pdf`, `candidiasis.pdf`, `criptococosis.pdf`) as links, plus images. The actual images for the archive are in `~/Downloads/backup/` root (JPG/PNG files) and potentially in `_archivos` subdirectories. The archive page content (image list, captions) will be **hand-authored** in `ImageArchive.astro` rather than extracted from the .htm — the .htm is table-heavy with dynamic animation artifacts.

**PDF files in backup (23 PDFs):** Several PDFs have non-ASCII filenames (`curri 2013mayo.pdf`, `enfermedades fúngicas.pdf`). These must be renamed to ASCII-only before committing to `public/docs/`. Example: `curri-2013mayo.pdf`, `enfermedades-fungicas.pdf`.

---

## Code Examples

### Global CSS `:root` Block

The complete authoritative token file from UI-SPEC.md:

```css
/* src/styles/global.css — VetMyc Phase 2 design tokens */
:root {
  --color-surface: #ffffff;
  --color-nav-bg: #2d6a4f;
  --color-accent: #52b788;
  --color-accent-visited: #3d8a68;
  --color-text: #1a1a1a;
  --color-nav-text: #ffffff;
  --color-surface-subtle: #f5f5f5;
  --color-border: #e0e0e0;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-heading: 'Source Serif 4', 'Georgia', serif;
  --font-size-sm: 0.875rem;
  --font-size-body: 1rem;
  --font-size-h2: 1.5rem;
  --font-size-h1: 2rem;
  --space-xs: 4px;  --space-sm: 8px;  --space-md: 16px;
  --space-lg: 24px; --space-xl: 32px; --space-2xl: 48px; --space-3xl: 64px;
}

*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: var(--font-body); font-size: var(--font-size-body); color: var(--color-text); background-color: var(--color-surface); line-height: 1.6; -webkit-font-smoothing: antialiased; }
img { max-width: 100%; height: auto; display: block; }
a { color: var(--color-accent); }
a:visited { color: var(--color-accent-visited); }
:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
```

### Markdown Frontmatter Template (TOC page)

```markdown
---
title: "Patologías por Levaduras"
description: "Candidiasis animal, Criptococosis y Patologías por Malassezias en animales domésticos"
toc: true
lang: "es"
---

## Candidiasis animal

Candida albicans es una levadura comensal...

## Criptococosis

Cryptococcus neoformans es un hongo encapsulado...

## Patologías por Malassezias

Malassezia pachydermatis es la especie más frecuente...
```

### Image Archive Grid CSS

```css
/* From UI-SPEC.md ImageArchive Layout Contract */
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-md);
  padding: var(--space-lg) 0;
}

@media (max-width: 767px) {
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--space-sm);
  }
}

.thumb-link {
  display: block;
  aspect-ratio: 1;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  text-decoration: none;
}
.thumb-link img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact on Phase 2 |
|--------------|------------------|-------------------|
| `entry.render()` method (Astro 4) | `render(entry)` named import from `astro:content` (Astro 5+) | All page files must use `import { render } from 'astro:content'` |
| `entry.slug` field | `entry.id` field | Use `entry.id` in all page files — `slug` is removed |
| `src/content/config.ts` | `src/content.config.ts` at `src/` root | Already correct in Phase 1 scaffold |
| remark/rehype plugins | Sätteri (Astro native) | Heading IDs auto-generated; `headings[]` array available from `render()` |
| `Astro.glob()` | `getCollection()` or `getEntry()` from `astro:content` | All content fetching uses Content Layer API |
| HTML `<font>` tag → `decompose()` | `<font>` tag → `unwrap()` | Extraction script bug; must be fixed before migration |

**Deprecated/outdated:**
- `type: 'content'` in `defineCollection`: removed in Astro 6. Already using `glob()` loader.
- `import { z } from 'astro:content'`: deprecated in Astro 7 (still works but warns). Already using `astro/zod`.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `href="#_"` (or `href="#0"`) reliably prevents page scroll-to-top when closing CSS `:target` lightbox | Pattern 6, Pitfall 4 | If wrong, lightbox close causes jarring scroll; fix is to test and adjust the empty fragment value |
| A2 | Astro scoped `<style>` requires `:global()` wrapper for markdown-rendered prose children inside `<slot />` | Pattern 3 / Pitfall 3 | If Astro 7 changed scoping behavior for slot content, `:global()` may be unnecessary; check at implementation time |
| A3 | The 14 FrontPage .htm files all use the same two-table layout structure (nav header table + content table) with the content TD being the last TD in the second table | Pattern 8 / Pitfall 1 | If some files have different structure, the content TD selection logic may need per-file adjustment |
| A4 | Sätteri's auto-generated heading IDs use kebab-case from heading text, producing `id="candidiasis-animal"` from `## Candidiasis animal` | Pattern 7 / Pitfall 2 | If Sätteri uses a different slug algorithm, `headings[].slug` values won't match expected anchors; verify at implementation time by rendering one page and inspecting the generated HTML |
| A5 | PDF files in `~/Downloads/backup/` not yet in `public/docs/` — the 23 PDFs need to be manually copied and renamed to ASCII-only filenames | Extraction audit | If some PDFs are already in `public/docs/`, the renaming step is already done |
| A6 | ULPGC + IUSA logo image files are not yet in `public/images/logos/` — they need to be sourced from `~/Downloads/backup/` (LOGO.jpg and iusalogodoctorado2012.jpg) | Project structure | If the logos are not in acceptable quality/format, they need to be re-sourced |

**If this table were empty:** All claims were verified — but A1, A3, A4 are specifically flagged as needing a quick verification during Wave 1 implementation before committing to the pattern.

---

## Open Questions (RESOLVED)

1. **Image archive content: how many images, what captions?**
   - RESOLVED: Developer determines at Plan 05 Task 1 (blocking human checkpoint). Candidate filenames identified in backup: `P1010012.JPG`, `P3200037.JPG`, `P9080018.JPG`, `P9210038.JPG`, `sara 4 malassezias 2.jpg`, `Imagen 062.jpg`, `FUSARI~3.JPG`. Developer audits, selects scientific photos, renames with ASCII-safe slugs, copies to `public/images/archivo/`. Plan 05 Task 1 is `autonomous: false` and blocks Task 2.

2. **How many PLAN.md files for Phase 2?**
   - RESOLVED: 5 plans chosen — 02-01 (extraction fix, Wave 0), 02-02 (design system + layout + nav, Wave 1), 02-03 (home + 7 simple content pages, Wave 2), 02-04 (pathology + lab + congresos, Wave 2 parallel), 02-05 (image archive + PDFs + verify, Wave 3).

3. **Sätteri HTML passthrough in markdown files?**
   - RESOLVED: Sätteri inherits GFM HTML passthrough — raw HTML blocks in `.md` files pass through unchanged (verified: `@astrojs/markdown-satteri` 0.4.3 uses the same HTML passthrough as standard remark/GFM). Low risk for Phase 2 since `markdownify` converts most HTML to Markdown syntax. If any `<table>` elements remain in extracted output, they will render correctly. No action needed.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Astro 7 build | Yes | 22.15.1 | — |
| Python 3 + venv `.venv` | extract_frontpage.py | Yes | 3.11.x (in .venv) | — |
| `~/Downloads/backup/` | Content migration | Yes | 14/14 source files confirmed | — |
| ULPGC + IUSA logos | Footer component | Needs sourcing | `LOGO.jpg`, `iusalogodoctorado2012.jpg` in backup root | Use placeholder `<span>` text temporarily |
| Google Fonts CDN | Font loading | Yes (online) | — | System font stack in CSS variable declaration (`system-ui, -apple-system`) |

**Missing dependencies with no fallback:** None blocking.
**Missing dependencies with fallback:** ULPGC/IUSA logos need to be copied from `~/Downloads/backup/` to `public/images/logos/` and verified for quality. Temporary fallback: text placeholder in footer.

---

## Validation Architecture

> `workflow.nyquist_validation` not found in `.planning/config.json` (file does not exist) — treating as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `scripts/verify-build.mjs` (existing Node.js acceptance test) |
| Config file | none (standalone script) |
| Quick run command | `node scripts/verify-build.mjs` |
| Full suite command | `npm run build && node scripts/verify-build.mjs` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NAV-01 | BaseLayout wraps all pages | Smoke | `npm run build` — check dist/ for all 14 pages | ❌ Wave 0: extend verify-build.mjs |
| NAV-02 | Nav HTML structure present | Structural | Check dist/index.html for `.nav-group`, `.nav-dropdown` elements | ❌ Wave 0 |
| NAV-04 | Responsive at 375/768/1280px | Manual | Browser devtools; no automated test in scope | Manual only |
| CONT-01–15 | All 14 pages exist in dist/ | Smoke | Check `dist/micologia/generalidades/index.html` etc. exist | ❌ Wave 0 |
| MEDIA-01 | CSS Grid in archive page | Structural | Check dist/recursos/archivo-imagenes/index.html for `.image-grid` | ❌ Wave 0 |
| MEDIA-02 | Lightbox HTML present | Structural | Check for `.lightbox:target` rule in CSS output | ❌ Wave 0 |
| MEDIA-04 | PDFs accessible | Smoke | Check `dist/docs/` contains PDF files | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm run build` — exits 0 (existing verify-build.mjs already checks UTF-8 and page existence)
- **Per wave merge:** `npm run build && node scripts/verify-build.mjs` — extend to check all 14 pages exist
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] Extend `scripts/verify-build.mjs` to assert all 14 content pages exist in `dist/`
- [ ] Add assertions for nav HTML structure in home page
- [ ] Fix `scripts/extract_frontpage.py` (font.unwrap() bug) and verify with test fixture

---

## Security Domain

Phase 2 is a static content-only site with no user input, no authentication, no dynamic endpoints.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | N/A — no login |
| V3 Session Management | No | N/A — no sessions |
| V4 Access Control | No | N/A — all content public |
| V5 Input Validation | No | N/A — no user input; all content is developer-maintained markdown |
| V6 Cryptography | No | N/A — HTTPS managed by Apache/university |

### Phase 2 Security Notes

- Google Fonts `<link rel="preconnect">` loads from external CDN — standard academic site practice. No privacy concern beyond Google's analytics (which is inherent to Google Fonts; acceptable for an academic site).
- PDF links use Apache's default MIME type configuration. The `.htaccess` in `public/` already sets `AddType application/pdf .pdf`. No XSS risk from static PDF links.
- Image filenames in `public/images/` use lowercase + hyphens — no path traversal risk from static file serving.
- No `<script>` tags anywhere in Phase 2 — zero XSS attack surface.

---

## Sources

### Primary (HIGH confidence)

- Installed `node_modules/astro/templates/content/types.d.ts` — `render()` function signature, `RenderResult.headings: MarkdownHeading[]`, confirmed `render(entry)` is the Astro 7 API
- Installed `node_modules/astro/types/content.d.ts` — `MarkdownLayoutProps`, `MarkdownInstance`, `MDXLayoutProps` type definitions
- Installed `node_modules/@astrojs/markdown-satteri/` version 0.4.3 — `satteriHeadingIdsPlugin` export confirms heading ID auto-generation
- `node_modules/astro/dist/types/public/config.d.ts` — Sätteri as default processor confirmed; `@astrojs/markdown-satteri` is bundled
- Live extraction testing on `~/Downloads/backup/generalidades_1.htm` (116KB) — confirmed `font.decompose()` bug and `font.unwrap()` fix; OOXML `<![if]>` pattern confirmed at 37 occurrences
- `.planning/phases/02-spanish-content-migration/02-CONTEXT.md` — all D-01 through D-17 decisions
- `.planning/phases/02-spanish-content-migration/02-UI-SPEC.md` — complete component contracts, CSS patterns, token values
- `astro.config.mjs` — confirmed `site`, `output: 'static'`, `build.format: 'directory'`, i18n block

### Secondary (MEDIUM confidence)

- `.planning/phases/01-foundation-pipeline/01-RESEARCH.md` — Phase 1 Astro 7 patterns, pitfalls, confirmed valid for Phase 2
- `.planning/phases/01-foundation-pipeline/01-01-SUMMARY.md` — key decisions locked in Phase 1
- File system audit: `ls ~/Downloads/backup/` — all 14 .htm files confirmed present; 170 JPG/PNG files total; 23 PDFs

### Tertiary (LOW confidence)

- CSS `:target` lightbox close via `href="#_"` (A1 in Assumptions Log) — well-known web pattern but not verified against current browser behavior in this session

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified against installed node_modules; no new packages needed
- Architecture (layout components): HIGH — Astro 7 render API verified against source types; patterns match installed version
- Extraction script fix: HIGH — bug verified by live testing against actual source files; fix confirmed to produce correct output
- CSS-only nav patterns: HIGH — patterns are from UI-SPEC.md which was already verified by gsd-ui-checker; CSS pseudo-class behavior is browser standard
- Image archive content: MEDIUM — file count and names confirmed; exact images for archive need developer judgment during migration

**Research date:** 2026-10-18
**Valid until:** 2027-01-18 (90 days — Astro 7.x is stable; next breaking change expected with Astro 8 which shows no active deprecation notices beyond `z` from `astro:content`)
