# Architecture Research — VetMyc Astro Site

**Domain:** Astro static site architecture for bilingual academic content site
**Researched:** 2026-10-01
**Overall confidence:** MEDIUM — training knowledge through August 2025; verify Astro 4/5 i18n API specifics against live docs before implementation

---

## Project Structure

```
vetmyc/
├── astro.config.mjs              # i18n config, output: 'static'
├── package.json
├── tsconfig.json
├── public/
│   ├── images/
│   │   ├── patologias/
│   │   ├── archivo/
│   │   └── logos/
│   ├── pdfs/
│   └── favicon.ico
└── src/
    ├── content/
    │   ├── config.ts             # Collection schemas (zod)
    │   ├── es/                   # Spanish content (primary)
    │   │   ├── home.md
    │   │   ├── micologia.md
    │   │   ├── grupo.md
    │   │   ├── colaboracion-reptiles.md
    │   │   ├── articulos-congresos.md
    │   │   ├── patologias-levaduras/
    │   │   │   ├── candidiasis.md
    │   │   │   ├── cryptococcosis.md
    │   │   │   └── malassezia.md
    │   │   ├── patologias-filamentosos/
    │   │   ├── patologias-dimorfi cos/
    │   │   ├── micosis-peces.md
    │   │   ├── archivo-imagenes.md
    │   │   ├── articulos-interesantes.md
    │   │   ├── links-micologia.md
    │   │   ├── links-revistas.md
    │   │   ├── laboratorio.md
    │   │   └── bibliografia.md
    │   └── en/                   # English translations (mirrors es/)
    │       └── ... (same filenames as es/)
    ├── i18n/
    │   ├── es.ts                 # UI strings: nav labels, footer, lang switcher
    │   └── en.ts
    ├── layouts/
    │   ├── BaseLayout.astro      # <html>, <head>, meta, CSS, global scripts
    │   └── ContentLayout.astro   # BaseLayout + sidebar nav + main content area
    ├── components/
    │   ├── Nav.astro             # Top navigation bar
    │   ├── LangSwitcher.astro    # ES / EN toggle
    │   ├── Footer.astro          # Institution logos, contact
    │   ├── BibEntry.astro        # Single bibliography citation renderer
    │   ├── ImageGallery.astro    # Image archive grid
    │   └── LinkList.astro        # Categorized external links list
    └── pages/
        ├── index.astro           # Redirects to /es/
        ├── es/
        │   ├── index.astro
        │   ├── micologia.astro
        │   ├── grupo.astro
        │   ├── colaboracion-reptiles.astro
        │   ├── articulos-congresos.astro
        │   ├── patologias/
        │   │   ├── levaduras/
        │   │   │   ├── index.astro
        │   │   │   ├── candidiasis.astro
        │   │   │   ├── cryptococcosis.astro
        │   │   │   └── malassezia.astro
        │   │   ├── filamentosos/
        │   │   └── dimorfi cos/
        │   ├── micosis-peces.astro
        │   ├── archivo-imagenes.astro
        │   ├── articulos-interesantes.astro
        │   ├── links-micologia.astro
        │   ├── links-revistas.astro
        │   ├── laboratorio.astro
        │   └── bibliografia.astro
        └── en/
            └── ... (mirrors es/ exactly)
```

---

## Content Strategy

**Recommendation: Content Collections for content sections; file-based `.astro` pages as thin wrappers.**

Content Collections (Astro 2+, matured in Astro 3/4) are the right tool here because:

- Zod schema validation catches missing frontmatter fields at build time, not runtime
- `getCollection()` and `getEntry()` APIs give type-safe access to content
- Markdown bodies render via `await entry.render()` returning a `<Content />` component
- Content updates (adding a new pathology, updating bibliography) are pure Markdown file edits with no page logic changes

**Collection structure — two options:**

Option A (recommended): Language-keyed collections — `src/content/es/` and `src/content/en/` as separate collections. Query as `getCollection('es')` and `getCollection('en')`. Mirrors URL structure cleanly.

Option B: Single `pages` collection with `lang` in frontmatter — simpler config, slightly more query boilerplate (`entries.filter(e => e.data.lang === 'es')`).

Choose Option A. For a site with a strict ES/EN split and parallel URL trees, having the language be the collection boundary is cleaner than filtering at query time.

**Schema example:**

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const pageSchema = z.object({
  title: z.string(),
  lang: z.enum(['es', 'en']),
  description: z.string().optional(),
  section: z.string(),
  lastUpdated: z.date().optional(),
  translationKey: z.string().optional(),
});

export const collections = {
  es: defineCollection({ type: 'content', schema: pageSchema }),
  en: defineCollection({ type: 'content', schema: pageSchema }),
};
```

**[VERIFY]:** Astro 5 introduced a "Content Layer" API that may replace `defineCollection` syntax. Check https://docs.astro.build/en/guides/content-collections/ for current approach.

---

## i18n Architecture

**Recommendation: Astro 4's built-in i18n routing with `prefixDefaultLocale: false`.**

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://micologiaveterinaria.ulpgc.es',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,  // Spanish at /micologia/, English at /en/mycology/
    },
  },
});
```

**Slug strategy:** Keep all slugs in Spanish across both language trees (e.g., `/en/patologias/levaduras/candidiasis`, not `/en/pathologies/yeasts/candidiasis`). This eliminates a slug translation table and means the LangSwitcher is a one-liner: `currentPath.replace('/es/', '/en/')`.

**UI string translation files:**

```typescript
// src/i18n/es.ts
export default {
  nav: { home: 'Inicio', micologia: 'Micología', patologias: 'Patologías' },
  langSwitcher: { label: 'English', aria: 'Cambiar a inglés' },
  footer: { university: 'Universidad de Las Palmas de Gran Canaria' },
};

// src/i18n/en.ts
export default {
  nav: { home: 'Home', micologia: 'Mycology', patologias: 'Pathologies' },
  langSwitcher: { label: 'Español', aria: 'Switch to Spanish' },
  footer: { university: 'University of Las Palmas de Gran Canaria' },
};
```

**[VERIFY]:** `getRelativeLocaleUrl` import path from `astro:i18n` in current docs.

---

## Component Boundaries

| Component | Responsibility | Props |
|-----------|---------------|-------|
| `BaseLayout.astro` | `<html lang>`, `<head>`, global CSS, meta tags | `title`, `description`, `lang` |
| `ContentLayout.astro` | Wraps BaseLayout; responsive content area | `title`, `description`, `lang`, `section` |
| `Nav.astro` | Top bar: site name, grouped nav, lang switcher | `lang`, `currentPath` |
| `LangSwitcher.astro` | Single `<a>` toggling between `/[slug]` and `/en/[slug]` | `lang`, `currentPath` |
| `Footer.astro` | ULPGC + IUSA logos, copyright | `lang` |
| `BibEntry.astro` | Renders one citation entry | `entry` object |
| `ImageGallery.astro` | CSS Grid of images with captions | `images[]` (src, alt, caption) |
| `LinkList.astro` | Grouped list of external links | `links[]`, `lang` |

No client-side JavaScript components needed. Every component is a `.astro` file (zero client JS output). Language switcher is a plain `<a>` tag.

---

## Data Flow

```
src/content/es/*.md  (Markdown + frontmatter)
    |
    | Zod validates frontmatter schema at build time
    v
Content Collection entries (.data = frontmatter, .body = Markdown string)
    |
    | getEntry('es', 'micologia') called inside src/pages/es/micologia.astro
    v
const { Content } = await entry.render()   // Markdown → HTML
    |
    | Props: { lang: 'es', title, description, Content }
    v
ContentLayout.astro
    |
    | renders: BaseLayout > Nav > <main><Content /></main> > Footer
    v
HTML serialized to: dist/es/micologia/index.html  (or dist/micologia/index.html)
    |
    | rsync to university server
    v
Browser — zero JS runtime
```

Static assets bypass collections: everything in `public/` is copied verbatim to `dist/` by `astro build`.

---

## Build Order

### 1. Foundation Layer — Pipeline confidence before content investment

- Init project: `npm create astro@latest` with "empty" template, TypeScript strict
- `astro.config.mjs`: `output: 'static'`, `site`, `i18n` block
- `src/content/config.ts` with stub schema
- `BaseLayout.astro` with `<html lang={lang}>` and `<head>`
- `ContentLayout.astro` as pass-through slot wrapper
- Stub Nav, LangSwitcher, Footer components
- `src/pages/index.astro` redirecting to `/`
- One test page to verify the build pipeline end-to-end
- `astro build` → verify `dist/` output
- Deploy `dist/` to test subdirectory on university server — confirm Apache serves it, DirectoryIndex works, special characters render correctly

**Why first:** University server constraints (Apache config, file permissions, encoding) are discovered here, not after all content is migrated.

### 2. Content Layer — All 14 sections in Spanish

- Convert FrontPage HTML from ISO-8859-1 to UTF-8 during extraction
- Migrate all 14 sections to `src/content/es/` Markdown files
- Migrate images to `public/images/` with organized subdirectories
- Migrate PDFs to `public/pdfs/`
- Build BibEntry, ImageGallery, LinkList components
- Wire each `src/pages/es/*.astro` to its collection entry
- `astro build` + `astro preview` — verify all 14 Spanish sections

**Why second:** Spanish is the primary deliverable. Finalize component API before duplicating for EN.

### 3. i18n Layer — English translations + language switcher

- Build `src/i18n/es.ts` and `src/i18n/en.ts`
- Thread `lang` prop through all layouts and components
- Build `LangSwitcher.astro`
- Create `src/pages/en/` mirroring `src/pages/es/`
- AI-assisted English translations into `src/content/en/`
- Verify both Spanish and English build and switcher works

**Why third:** English translates finalized Spanish, not a moving target.

### 4. Polish Layer — Design, SEO, accessibility, sitemap

- CSS: clean system fonts, CSS Grid/Flexbox, responsive breakpoints
- `<head>` metadata: `<meta description>`, canonical URLs, `hreflang`
- Accessibility: `<main>`, `<nav>`, `<aside>` landmarks; skip-to-content; heading audit
- 404 page
- Sitemap via `@astrojs/sitemap` [VERIFY i18n locale handling]
- Final build + production deploy
- Smoke-test across both languages

---

## Build Pipeline

**Local development:**
```bash
npm install
npm run dev       # astro dev → localhost:4321
npm run build     # astro build → dist/
npm run preview   # serve dist/ locally before deploy
```

**Production deploy:**
```bash
npm run build
rsync -avz --delete dist/ user@server:/path/to/webroot/
# Or: FTP upload dist/ contents
```

**dist/ structure:**
```
dist/
├── index.html          # Redirect or Spanish home
├── micologia/          # Spanish at root (prefixDefaultLocale: false)
│   └── index.html
├── en/
│   ├── mycology/
│   │   └── index.html
├── images/             # Copied from public/
├── pdfs/
└── _astro/             # Hashed CSS/JS chunks
```

**Deployment notes:**
1. Apache must have `DirectoryIndex index.html` — standard but verify in Layer 1
2. If site lives at a subdirectory: add `base: '/subpath'` to astro config
3. UTF-8 output overrides any server-level ISO-8859-1 defaults from FrontPage era
4. Use `--delete` flag on rsync carefully — preview `dist/` locally first
5. Confirm `AllowOverride` with ULPGC admin if `.htaccess` redirects are needed

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Directory/project structure | HIGH | Standard Astro convention |
| Content Collections API | MEDIUM | Verify config.ts syntax — Astro 5 Content Layer may differ |
| Astro i18n built-in routing | MEDIUM | Verify exact `routing:` block keys and helper imports |
| Component architecture | HIGH | Pure Astro component patterns |
| Static build + rsync pipeline | HIGH | `output: 'static'` is foundational |
| `@astrojs/sitemap` i18n support | LOW | Needs live doc check |

**[VERIFY] before implementation:**
- `astro.config.mjs` i18n block: https://docs.astro.build/en/guides/internationalization/
- `getRelativeLocaleUrl` import from `astro:i18n`
- Content Collections vs Content Layer (Astro 5): https://docs.astro.build/en/guides/content-collections/
- `base` + `i18n` routing interaction in current version
- `@astrojs/sitemap` multilingual config
