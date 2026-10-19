# Phase 3: English + i18n — Research

**Researched:** 2026-10-18
**Domain:** Astro 7 i18n routing, bilingual content strategy, UI string translation, hreflang
**Confidence:** HIGH

---

## Summary

Phase 3 adds the English language layer to a site whose i18n URL structure is already locked and working. The Spanish site is fully built at root (`/`), the English skeleton page exists at `/en/index.html` (the walking-skeleton from Phase 1), and the Astro config already has `defaultLocale: 'es'`, `locales: ['es', 'en']`, and `prefixDefaultLocale: false`. Phase 3 is entirely additive — it does not touch existing Spanish pages.

The work has four separable concerns: (1) content translation — creating 14 English markdown files and their 14 `.astro` pages under `src/pages/en/`; (2) language switcher — wiring `Header.astro` to display a live `EN` or `ES` link that keeps the user on the current page; (3) hreflang — injecting canonical alternates into every page's `<head>` via the existing `<slot name="head" />`; and (4) UI strings — replacing hardcoded Spanish labels in nav, footer, TOC, and ARIA attributes with a locale-aware translation lookup.

The Spanish-slug-for-both-locales decision (locked in STATE.md) is the key architectural advantage for Phase 3: the language switcher URL swap is a single path-prefix toggle (`/en/` prefix = EN, no prefix = ES), and English content markdown uses the same slug names as Spanish (`generalidades.md`, `levaduras.md`, etc.).

**Primary recommendation:** Use parallel `src/content/{collection}-en/` collections alongside the existing `{collection}` collections, mirroring the existing 5-collection schema but with `lang: 'en'`. Pages live under `src/pages/en/`. UI strings go in `src/i18n/ui.ts`. The language switcher is a LangSwitcher component using `getRelativeLocaleUrl` + `Astro.currentLocale`. hreflang is injected via `<slot name="head" />` in every page.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| English content (14 pages) | Frontend Server (static) | — | Static pages at `/en/*`, served as pre-built HTML from `dist/en/` |
| Language switcher UI | Frontend Server (static) | Browser/Client | Rendered at build time; href targets pre-built pages; no JS required |
| Locale detection (current locale) | Frontend Server (static) | — | `Astro.currentLocale` available at build time for all static pages |
| hreflang link elements | Frontend Server (static) | — | Injected into `<head>` via `<slot name="head" />` at build time |
| UI string translation | Frontend Server (static) | — | `useTranslations()` utility resolves strings at build time; zero runtime |
| Nav label translation | Frontend Server (static) | — | TopNav and MobileNav receive `lang` prop, render from translated labels |
| Footer text translation | Frontend Server (static) | — | Footer receives `lang` prop from BaseLayout |

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NAV-03 | Language switcher in header — clicking "ES" or "EN" navigates to the same page in the other locale | LangSwitcher component using `getRelativeLocaleUrl` + `Astro.currentLocale`; URL swap via path-prefix toggle |
| I18N-01 | Every Spanish page has a corresponding English page at the parallel `/en/[slug]/` URL | 14 Astro pages under `src/pages/en/` + 14 markdown files in EN content collections |
| I18N-02 | All 14 content sections have English translations (AI-assisted first pass) | Translate 13 content markdown files (index.astro home page is inline, not markdown) |
| I18N-03 | Every page includes correct hreflang link elements (ES, EN, x-default → ES) | `getAbsoluteLocaleUrl` + `<slot name="head" />` in BaseLayout; manual implementation per I18N-03 spec |
| I18N-04 | All UI strings (nav labels, footer text, lang switcher aria-labels, etc.) display in the correct language | `src/i18n/ui.ts` + `useTranslations()` helper; inject `lang` prop into Header, TopNav, MobileNav, Footer, TableOfContents |
</phase_requirements>

---

## Standard Stack

### Core (all already installed — no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `astro:i18n` | 7.3.6 (built-in) | `getRelativeLocaleUrl`, `getAbsoluteLocaleUrl`, `getRelativeLocaleUrlList`, `Astro.currentLocale` | Official Astro i18n module; all URL helpers and locale detection are built-in [VERIFIED: installed in project] |
| `astro:content` | 7.3.6 (built-in) | `getEntry`, `render` for EN content collections | Same pattern already used for all ES pages [VERIFIED: installed in project] |

**No new npm packages required.** Phase 3 is zero-dependency — everything needed is in Astro 7's built-in i18n and content APIs.

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| TypeScript `as const` | 6.0.3 (project) | Type-safe `ui.ts` translation dictionary | Use on the `ui` object to get key autocomplete and exhaustive locale checking |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `src/i18n/ui.ts` string dictionary | `astro-i18next` npm package | Unnecessary dependency; the ~30 UI strings in this project do not require a full i18n library |
| Parallel EN collections (`micologia-en`) | Frontmatter `lang` field on shared collection | Parallel collections are simpler: each page does `getEntry('micologia-en', 'generalidades')` — no filter queries needed. Frontmatter lang field would require `getCollection` + filter on every page |
| Parallel EN collections | Single collection with `[lang]/` subdirectory glob | The current schema uses one glob per collection (`./src/content/micologia`). Adding `en/` subdirs inside existing collections breaks the current `getEntry('micologia', 'generalidades')` call pattern used on every ES page |

**Installation:** None required.

---

## Package Legitimacy Audit

No external packages are being added in this phase. All functionality uses Astro 7's built-in `astro:i18n` and `astro:content` modules.

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
Browser request:
  /micologia/generalidades/           → ES page (src/pages/micologia/generalidades.astro)
  /en/micologia/generalidades/        → EN page (src/pages/en/micologia/generalidades.astro)

Build-time data flow:
  src/content/micologia/generalidades.md          (ES, lang:"es")
    → getEntry('micologia', 'generalidades')
    → ContentPage[lang="es"] → BaseLayout[lang="es"] → <html lang="es">
    → LangSwitcher renders: ES(current) | EN→/en/micologia/generalidades/
    → <slot name="head"> → hreflang ES + EN + x-default

  src/content/micologia-en/generalidades.md       (EN, lang:"en")
    → getEntry('micologia-en', 'generalidades')
    → ContentPage[lang="en"] → BaseLayout[lang="en"] → <html lang="en">
    → LangSwitcher renders: EN(current) | ES→/micologia/generalidades/
    → <slot name="head"> → hreflang ES + EN + x-default

Translation layer:
  src/i18n/ui.ts (useTranslations helper)
    ↓ injected as t('nav.inicio') etc.
    TopNav (receives lang prop, renders translated labels)
    MobileNav (receives lang prop)
    Footer (receives lang prop: "Veterinary Mycology Group · Faculty of Veterinary Medicine · ULPGC")
    TableOfContents (receives lang prop: "On this page" vs "En esta página")
    LangSwitcher (aria-label)
    Header (skip link text)
```

### Recommended Project Structure

```
src/
├── i18n/
│   └── ui.ts                    # Translation dictionary + useTranslations helper
├── content/
│   ├── micologia/               # ES content (existing)
│   │   ├── generalidades.md
│   │   ├── grupo-de-trabajo.md
│   │   └── colreptiles.md
│   ├── micologia-en/            # EN content (new)
│   │   ├── generalidades.md
│   │   ├── grupo-de-trabajo.md
│   │   └── colreptiles.md
│   ├── patologias/              # ES (existing)
│   ├── patologias-en/           # EN (new)
│   ├── investigacion/           # ES (existing)
│   ├── investigacion-en/        # EN (new)
│   ├── laboratorio/             # ES (existing)
│   ├── laboratorio-en/          # EN (new)
│   ├── recursos/                # ES (existing)
│   └── recursos-en/             # EN (new)
├── pages/
│   ├── index.astro              # ES home (existing)
│   ├── micologia/               # ES pages (existing)
│   ├── patologias/              # ES pages (existing)
│   ├── investigacion/           # ES pages (existing)
│   ├── laboratorio/             # ES pages (existing)
│   ├── recursos/                # ES pages (existing)
│   └── en/                      # EN pages (new)
│       ├── index.astro          # Replace walking-skeleton with real home
│       ├── micologia/
│       │   ├── generalidades.astro
│       │   ├── grupo-de-trabajo.astro
│       │   └── colreptiles.astro
│       ├── patologias/
│       │   ├── levaduras.astro
│       │   ├── filamentosos.astro
│       │   ├── dimorficos.astro
│       │   └── micosis-peces.astro
│       ├── investigacion/
│       │   ├── articulos-congresos.astro
│       │   └── articulos-interesantes.astro
│       ├── laboratorio/
│       │   └── index.astro
│       └── recursos/
│           ├── archivo-imagenes.astro
│           ├── links-micologia.astro
│           ├── links-revistas.astro
│           └── bibliografia.astro
└── components/
    └── LangSwitcher.astro       # New component
```

### Pattern 1: Translation Dictionary (`src/i18n/ui.ts`)

**What:** Typed key-value map per locale for all ~30 UI strings that are not in content markdown.
**When to use:** Any component that contains hardcoded Spanish strings.

```typescript
// Source: Official Astro i18n guide + community pattern confirmed by multiple sources
// src/i18n/ui.ts
export const ui = {
  es: {
    'skip.link': 'Ir al contenido principal',
    'nav.label': 'Navegación principal',
    'nav.inicio': 'Inicio',
    'nav.micologia': 'Micología',
    'nav.generalidades': 'Generalidades de los hongos',
    'nav.grupo': 'Grupo de trabajo',
    'nav.colreptiles': 'Colaboración con reptiles',
    'nav.patologias': 'Patologías',
    'nav.levaduras': 'Levaduras',
    'nav.filamentosos': 'Filamentosos',
    'nav.dimorficos': 'Dimórficos',
    'nav.micosis-peces': 'Micosis peces',
    'nav.investigacion': 'Investigación',
    'nav.articulos-congresos': 'Artículos y congresos',
    'nav.articulos-interesantes': 'Artículos interesantes',
    'nav.laboratorio': 'Laboratorio',
    'nav.recursos': 'Recursos',
    'nav.archivo-imagenes': 'Archivo de imágenes',
    'nav.links-micologia': 'Links micología',
    'nav.links-revistas': 'Links revistas',
    'nav.bibliografia': 'Bibliografía',
    'nav.hamburger.open': 'Abrir menú de navegación',
    'nav.hamburger.close': 'Cerrar menú de navegación',
    'toc.label': 'En esta página',
    'toc.nav-label': 'En esta página',
    'footer.affiliation': 'Grupo de Micología Veterinaria · Facultad de Veterinaria · ULPGC',
    'footer.contact': 'Contacto',
    'lang.current': 'Idioma: Español',
    'lang.switch.en': 'Switch to English',
    'lang.switch.es': 'Cambiar a español',
    'lightbox.close': 'Cerrar imagen',
    'lightbox.view': 'Ver {alt} a tamaño completo',
  },
  en: {
    'skip.link': 'Skip to main content',
    'nav.label': 'Main navigation',
    'nav.inicio': 'Home',
    'nav.micologia': 'Mycology',
    'nav.generalidades': 'Fungal generalities',
    'nav.grupo': 'Research group',
    'nav.colreptiles': 'Reptile collaboration',
    'nav.patologias': 'Pathologies',
    'nav.levaduras': 'Yeasts',
    'nav.filamentosos': 'Filamentous fungi',
    'nav.dimorficos': 'Dimorphic fungi',
    'nav.micosis-peces': 'Fish mycoses',
    'nav.investigacion': 'Research',
    'nav.articulos-congresos': 'Articles & congresses',
    'nav.articulos-interesantes': 'Interesting articles',
    'nav.laboratorio': 'Laboratory',
    'nav.recursos': 'Resources',
    'nav.archivo-imagenes': 'Image archive',
    'nav.links-micologia': 'Mycology links',
    'nav.links-revistas': 'Journal links',
    'nav.bibliografia': 'Bibliography',
    'nav.hamburger.open': 'Open navigation menu',
    'nav.hamburger.close': 'Close navigation menu',
    'toc.label': 'On this page',
    'toc.nav-label': 'On this page',
    'footer.affiliation': 'Veterinary Mycology Group · Faculty of Veterinary Medicine · ULPGC',
    'footer.contact': 'Contact',
    'lang.current': 'Language: English',
    'lang.switch.en': 'Switch to English',
    'lang.switch.es': 'Cambiar a español',
    'lightbox.close': 'Close image',
    'lightbox.view': 'View {alt} full size',
  },
} as const;

export type UiKey = keyof typeof ui.es;

export function useTranslations(lang: 'es' | 'en') {
  return function t(key: UiKey): string {
    return ui[lang][key] ?? ui.es[key];
  };
}
```

### Pattern 2: Language Switcher Component

**What:** `LangSwitcher.astro` — renders "ES" and "EN" with the current locale highlighted and the other as a link to the same page in the other locale.
**When to use:** Placed in `Header.astro` replacing the current static `<span class="lang-switcher">ES</span>`.

```astro
---
// Source: Astro i18n docs (getRelativeLocaleUrl) + confirmed pattern from eastondev.com + dev.to guide
// src/components/LangSwitcher.astro
import { getRelativeLocaleUrl } from 'astro:i18n';

const currentLocale = Astro.currentLocale ?? 'es';

// Strip the locale prefix to get the clean path for use with getRelativeLocaleUrl.
// With prefixDefaultLocale: false:
//   ES page: Astro.url.pathname = '/micologia/generalidades/'  → clean = 'micologia/generalidades/'
//   EN page: Astro.url.pathname = '/en/micologia/generalidades/' → strip '/en/' → clean = 'micologia/generalidades/'
const rawPath = Astro.url.pathname;
const cleanPath = rawPath.replace(/^\/en\//, '/').replace(/^\//, '') || '';

const esUrl = getRelativeLocaleUrl('es', cleanPath);   // → /micologia/generalidades/
const enUrl = getRelativeLocaleUrl('en', cleanPath);   // → /en/micologia/generalidades/
---

<div class="lang-switcher">
  {currentLocale === 'es' ? (
    <span aria-current="page" aria-label="Idioma: Español">ES</span>
  ) : (
    <a href={esUrl} aria-label="Cambiar a español">ES</a>
  )}
  <span aria-hidden="true">|</span>
  {currentLocale === 'en' ? (
    <span aria-current="page" aria-label="Language: English">EN</span>
  ) : (
    <a href={enUrl} aria-label="Switch to English">EN</a>
  )}
</div>
```

**Key insight:** `getRelativeLocaleUrl('es', 'micologia/generalidades/')` with `prefixDefaultLocale: false` returns `/micologia/generalidades/` (no prefix, because `es` is the default locale). `getRelativeLocaleUrl('en', 'micologia/generalidades/')` returns `/en/micologia/generalidades/`. [VERIFIED: confirmed from Astro 7.3.6 `astro:i18n` type definitions in node_modules]

### Pattern 3: hreflang in BaseLayout head slot

**What:** Each page injects its own hreflang set via `<slot name="head" />`. BaseLayout already has this slot.
**When to use:** Every page (both ES and EN) needs hreflang. Two approaches: (A) inject per-page via the head slot, or (B) compute in BaseLayout directly using `Astro.url.pathname`.

**Recommended approach (B) — compute in BaseLayout:**

BaseLayout already receives `lang` prop and has `Astro.url`. Add hreflang computation directly there, so every page gets it automatically without any change to page files.

```astro
---
// Addition to src/layouts/BaseLayout.astro
import { getAbsoluteLocaleUrl } from 'astro:i18n';

// Clean path: strip /en/ prefix to get locale-neutral path
const rawPath = Astro.url.pathname;
const cleanPath = rawPath.replace(/^\/en\//, '/').replace(/^\//, '') || '';

const esAbsolute = getAbsoluteLocaleUrl('es', cleanPath);  // https://micologiaveterinaria.ulpgc.es/micologia/generalidades/
const enAbsolute = getAbsoluteLocaleUrl('en', cleanPath);  // https://micologiaveterinaria.ulpgc.es/en/micologia/generalidades/
// x-default points to Spanish (the default locale per I18N-03)
---
<!-- In <head>, after existing meta tags, before <slot name="head" /> -->
<link rel="alternate" hreflang="es" href={esAbsolute} />
<link rel="alternate" hreflang="en" href={enAbsolute} />
<link rel="alternate" hreflang="x-default" href={esAbsolute} />
```

`getAbsoluteLocaleUrl` requires `site` to be set in `astro.config.mjs`. The project already has `site: 'https://micologiaveterinaria.ulpgc.es'` in astro.config.mjs. [VERIFIED: read from astro.config.mjs in this project]

### Pattern 4: English Content Collection Registration

**What:** Five new content collections (`micologia-en`, `patologias-en`, `investigacion-en`, `laboratorio-en`, `recursos-en`) registered in `src/content.config.ts`.
**When to use:** Required before any EN content markdown files are added.

```typescript
// Addition to src/content.config.ts
const micologiaEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/micologia-en' }),
  schema: contentSchema,  // same shared schema
});
// ... repeat for patologias-en, investigacion-en, laboratorio-en, recursos-en
export const collections = {
  micologia, patologias, investigacion, laboratorio, recursos,
  'micologia-en': micologiaEn,
  // etc.
};
```

**Important:** Collection names containing `-` must be quoted in the export object. [ASSUMED — standard JS object key quoting requirement, low risk]

### Pattern 5: English Page Pattern

**What:** EN `.astro` pages mirror ES pages exactly, swapping collection name and setting `lang="en"`.
**When to use:** Each of the 14 English pages.

```astro
---
// src/pages/en/micologia/generalidades.astro — mirrors src/pages/micologia/generalidades.astro
import { getEntry, render } from 'astro:content';
import ContentPage from '../../../layouts/ContentPage.astro';

const entry = await getEntry('micologia-en', 'generalidades');
if (!entry) throw new Error('Entry not found: micologia-en/generalidades');
const { Content } = await render(entry);
---
<ContentPage title={entry.data.title} description={entry.data.description} lang="en">
  <Content />
</ContentPage>
```

**TOC pages** (levaduras, filamentosos, dimorficos) also pass `toc={true}` and `tocItems`. The English markdown will generate EN heading IDs — Sätteri preserves the exact characters in the `id` attribute. English headings like "Yeast infections" → `id="yeast-infections"`. Verify tocItem IDs against the built dist HTML after the EN markdown is committed (same verification procedure as Phase 2 Plan 04).

### Pattern 6: Propagating `lang` Through the Component Tree

**What:** `lang` must flow from each page through `ContentPage` → `BaseLayout` → `Header` → `TopNav`/`MobileNav` and `Footer`, so all components render the correct locale strings.
**When to use:** Any component that contains locale-specific strings.

Current component tree (Phase 2):
```
Page → ContentPage(lang) → BaseLayout(lang) → Header / Footer
```

Phase 3 additions:
- `BaseLayout` passes `lang` to `<Header lang={lang} />` and `<Footer lang={lang} />`
- `Header` passes `lang` to `<TopNav lang={lang} />`, `<MobileNav lang={lang} />`, and `<LangSwitcher />`
- `TopNav` receives `lang`, calls `useTranslations(lang)` to resolve nav labels
- `MobileNav` receives `lang`, calls `useTranslations(lang)` to resolve nav labels
- `Footer` receives `lang`, calls `useTranslations(lang)` for affiliation text
- `TableOfContents` receives `lang`, calls `useTranslations(lang)` for "En esta página"/"On this page"

**Important:** Header must also pass its current `Astro.url` context to `LangSwitcher` for the path-stripping logic. Since `LangSwitcher` uses `Astro.currentLocale` and `Astro.url.pathname` directly as an Astro component (not a framework component), it has access to these globals automatically — no prop passing needed.

### Anti-Patterns to Avoid

- **Translating URL slugs:** Spanish slugs are used for both locales (`/en/patologias/levaduras/` not `/en/pathologies/yeasts/`). Do not translate path segments — this is a locked decision in STATE.md.
- **Inline ternary for translation:** `{lang === 'es' ? 'Inicio' : 'Home'}` is fragile and unscalable. Use `useTranslations(lang)('nav.inicio')` from `ui.ts` instead.
- **Adding `lang` field to existing ES markdown:** The existing content schema already has `lang: z.enum(['es', 'en']).default('es')`. Do not add EN entries to ES collections — use dedicated `*-en` collections to keep `getEntry('micologia', 'generalidades')` working unchanged on all ES pages.
- **Hardcoding hreflang in each page:** Do it in `BaseLayout` once using `Astro.url.pathname` — automatically applies to every page.
- **Using `getRelativeLocaleUrlList()`:** This function returns URLs for all locales including the current one, in an undetermined order. Prefer explicit `getRelativeLocaleUrl('es', cleanPath)` and `getRelativeLocaleUrl('en', cleanPath)` calls for clarity.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Locale URL generation | Custom path-prefix manipulation | `getRelativeLocaleUrl` / `getAbsoluteLocaleUrl` from `astro:i18n` | Handles `prefixDefaultLocale:false`, trailing slash, `build.format`, `site` base — edge cases easy to miss |
| Absolute hreflang URLs | String concatenation with `Astro.site` | `getAbsoluteLocaleUrl` | Already integrates `site` from config; trailing slash consistent |
| Translation fallback | Custom null-check chains | `ui[lang][key] ?? ui['es'][key]` pattern in `useTranslations` | One-liner fallback to default locale if key missing in translation |

**Key insight:** All URL helpers (`getRelativeLocaleUrl`, `getAbsoluteLocaleUrl`) are already available in Astro 7.3.6 — verified in `node_modules/astro/dist/virtual-modules/i18n.d.ts`.

---

## Complete UI String Inventory

All strings that must be translated (29 total):

| # | Component | Key | ES | EN |
|---|-----------|----|----|----|
| 1 | Header | `skip.link` | Ir al contenido principal | Skip to main content |
| 2 | Header/TopNav | `nav.label` | Navegación principal | Main navigation |
| 3 | TopNav/MobileNav | `nav.inicio` | Inicio | Home |
| 4 | TopNav/MobileNav | `nav.micologia` | Micología | Mycology |
| 5 | TopNav/MobileNav | `nav.generalidades` | Generalidades de los hongos | Fungal generalities |
| 6 | TopNav/MobileNav | `nav.grupo` | Grupo de trabajo | Research group |
| 7 | TopNav/MobileNav | `nav.colreptiles` | Colaboración con reptiles | Reptile collaboration |
| 8 | TopNav/MobileNav | `nav.patologias` | Patologías | Pathologies |
| 9 | TopNav/MobileNav | `nav.levaduras` | Levaduras | Yeasts |
| 10 | TopNav/MobileNav | `nav.filamentosos` | Filamentosos | Filamentous fungi |
| 11 | TopNav/MobileNav | `nav.dimorficos` | Dimórficos | Dimorphic fungi |
| 12 | TopNav/MobileNav | `nav.micosis-peces` | Micosis peces | Fish mycoses |
| 13 | TopNav/MobileNav | `nav.investigacion` | Investigación | Research |
| 14 | TopNav/MobileNav | `nav.articulos-congresos` | Artículos y congresos | Articles & congresses |
| 15 | TopNav/MobileNav | `nav.articulos-interesantes` | Artículos interesantes | Interesting articles |
| 16 | TopNav/MobileNav | `nav.laboratorio` | Laboratorio | Laboratory |
| 17 | TopNav/MobileNav | `nav.recursos` | Recursos | Resources |
| 18 | TopNav/MobileNav | `nav.archivo-imagenes` | Archivo de imágenes | Image archive |
| 19 | TopNav/MobileNav | `nav.links-micologia` | Links micología | Mycology links |
| 20 | TopNav/MobileNav | `nav.links-revistas` | Links revistas | Journal links |
| 21 | TopNav/MobileNav | `nav.bibliografia` | Bibliografía | Bibliography |
| 22 | MobileNav | `nav.hamburger.open` | Abrir menú de navegación | Open navigation menu |
| 23 | MobileNav | `nav.hamburger.close` | Cerrar menú de navegación | Close navigation menu |
| 24 | TableOfContents | `toc.label` | En esta página | On this page |
| 25 | Footer | `footer.affiliation` | Grupo de Micología Veterinaria · Facultad de Veterinaria · ULPGC | Veterinary Mycology Group · Faculty of Veterinary Medicine · ULPGC |
| 26 | Footer | `footer.contact` | Contacto | Contact |
| 27 | LangSwitcher | `lang.current.es` | Idioma: Español | Language: Spanish |
| 28 | LangSwitcher | `lang.current.en` | Idioma: Inglés | Language: English |
| 29 | LangSwitcher | `lang.switch.es` | Cambiar a español | Cambiar a español |
| 30 | LangSwitcher | `lang.switch.en` | Switch to English | Switch to English |

**Note on nav href values:** TopNav and MobileNav have hardcoded Spanish-slug hrefs (e.g., `/micologia/generalidades/`). On EN pages, these hrefs must include the `/en/` prefix (e.g., `/en/micologia/generalidades/`). The nav `href` values are therefore also locale-dependent. Strategy: compute hrefs using `getRelativeLocaleUrl(lang, 'micologia/generalidades/')` within the nav components, or pass locale-prefixed href values to both components. Simplest approach: construct hrefs inline using `getRelativeLocaleUrl` since it handles the prefix automatically.

---

## Common Pitfalls

### Pitfall 1: Astro.currentLocale is `undefined` on the default locale root page

**What goes wrong:** On the Spanish home page (`/`), `Astro.currentLocale` returns `undefined` (not `'es'`) when `prefixDefaultLocale: false`, because the URL `/` contains no locale segment. The `useTranslations(Astro.currentLocale)` call would fail.
**Why it happens:** Astro derives `currentLocale` from the URL path. With no prefix on default locale pages, there is no segment to parse.
**How to avoid:** Always default: `const lang = (Astro.currentLocale ?? 'es') as 'es' | 'en'`. Apply this default at the top of every component/layout that calls `useTranslations`. [VERIFIED: `currentLocale: string | undefined` in Astro 7.3.6 type definitions]
**Warning signs:** TypeScript errors on `useTranslations(Astro.currentLocale)` because the param type is `'es' | 'en'` but `Astro.currentLocale` is `string | undefined`.

### Pitfall 2: Nav href values still point to Spanish root on English pages

**What goes wrong:** TopNav and MobileNav currently have hardcoded hrefs like `href: '/micologia/generalidades/'`. On EN pages, clicking these links goes to the Spanish page instead of the EN equivalent.
**Why it happens:** The nav is inside `Header`, which is rendered by `BaseLayout`, which is shared. The hrefs are static arrays.
**How to avoid:** Refactor nav data arrays to compute hrefs using `getRelativeLocaleUrl(lang, 'micologia/generalidades/')` — or pass `lang` to the nav arrays and map hrefs at render time. Since this is a static site (no JS), the hrefs must be computed at build time in Astro component frontmatter.

### Pitfall 3: LangSwitcher path-strip logic fails for the root `/` page

**What goes wrong:** On the ES home page, `Astro.url.pathname = '/'`. After `.replace(/^\/en\//, '/')`, the result is still `'/'`. Then `.replace(/^\//, '')` gives `''` (empty string). `getRelativeLocaleUrl('en', '')` returns `/en/` — correct. `getRelativeLocaleUrl('es', '')` returns `/` — correct. This works, but edge-case: verify the exact return value of `getRelativeLocaleUrl('es', '')` vs `getRelativeLocaleUrl('es', '/')`.
**Why it happens:** Empty string vs `/` as path argument may produce different trailing-slash behavior.
**How to avoid:** Test the home page LangSwitcher output specifically during verification. If `getRelativeLocaleUrl('es', '')` returns `//`, use `cleanPath || '/'` as the path argument.

### Pitfall 4: English TOC pages — heading ID verification required

**What goes wrong:** English markdown headings generate IDs via Sätteri. The tocItems array in each EN TOC page (levaduras-en, filamentosos-en, dimorficos-en) must match the Sätteri-generated IDs in the built HTML.
**Why it happens:** Sätteri is the Astro 7 markdown processor that generates heading IDs. English heading text like "Yeast Infections (Candidiasis)" would generate `id="yeast-infections-candidiasis"` — must be verified from built HTML.
**How to avoid:** After placing EN markdown content, run `astro build` and inspect `dist/en/patologias/levaduras/index.html` to verify heading `id` attributes before finalizing tocItems. Same procedure used in Phase 2 Plan 04. [VERIFIED: this exact procedure was used successfully in Phase 2]

### Pitfall 5: Walking-skeleton `/en/index.astro` must be replaced, not extended

**What goes wrong:** `src/pages/en/index.astro` currently has its own minimal `<!doctype html>` with no BaseLayout or Header. It must be entirely replaced with the real EN home page.
**Why it happens:** It was built as a Phase 1 walking-skeleton test page — bare HTML, no components.
**How to avoid:** Replace `src/pages/en/index.astro` entirely. Do not try to add BaseLayout on top of the existing markup.

### Pitfall 6: Sätteri heading IDs preserve Spanish accents — English headings may not match Spanish TOC IDs

**What goes wrong:** The ES levaduras page uses `id="patologías-por-malassezias"` (with accent). The EN page is a separate page with English headings — so TOC IDs will be completely different English strings. This is correct and expected. The pitfall is accidentally copying the ES tocItems into the EN page.
**How to avoid:** Verify EN tocItems from the EN dist HTML, not by copying ES tocItems.

### Pitfall 7: `getAbsoluteLocaleUrl` requires `site` to be set

**What goes wrong:** If `site` is not set in `astro.config.mjs`, `getAbsoluteLocaleUrl` returns a relative path, not an absolute URL. hreflang requires absolute URLs.
**Why it happens:** `site` is optional in Astro config.
**How to avoid:** The project already has `site: 'https://micologiaveterinaria.ulpgc.es'` in `astro.config.mjs`. [VERIFIED: read from astro.config.mjs] No action needed.

### Pitfall 8: `getRelativeLocaleUrl` throws if locale is not in config

**What goes wrong:** `getRelativeLocaleUrl('fr', path)` throws a runtime error if `'fr'` is not in the `locales` array.
**Why it happens:** The function validates the locale against the config.
**How to avoid:** Only use `'es'` and `'en'` — both are in the config. Not a real risk for this project, but relevant for copy-paste from templates.

---

## Code Examples

### LangSwitcher integration in Header.astro

```astro
---
// Updated src/components/Header.astro
import TopNav from './TopNav.astro';
import MobileNav from './MobileNav.astro';
import LangSwitcher from './LangSwitcher.astro';
import { useTranslations } from '../i18n/ui';

interface Props {
  lang?: 'es' | 'en';
}
const { lang = 'es' } = Astro.props;
const t = useTranslations(lang);
---

<a href="#main-content" class="skip-link">{t('skip.link')}</a>
<header class="site-header">
  <div class="header-inner">
    <a href={lang === 'en' ? '/en/' : '/'} class="site-wordmark">
      Grupo de Micología Veterinaria · ULPGC
    </a>
    <div class="header-right">
      <TopNav lang={lang} />
      <MobileNav lang={lang} />
      <LangSwitcher />
    </div>
  </div>
</header>
```

### hreflang in BaseLayout.astro

```astro
---
// Addition to src/layouts/BaseLayout.astro
import { getAbsoluteLocaleUrl } from 'astro:i18n';
// ... existing imports

const { title, description, lang = 'es' } = Astro.props;

// Strip /en/ prefix to get locale-neutral path for hreflang URL generation
const rawPath = Astro.url.pathname;
const cleanPath = rawPath.replace(/^\/en\//, '/').replace(/^\//, '') || '';

const esHref = getAbsoluteLocaleUrl('es', cleanPath);
const enHref = getAbsoluteLocaleUrl('en', cleanPath);
---
<!doctype html>
<html lang={lang}>
  <head>
    ...existing head...
    <link rel="alternate" hreflang="es" href={esHref} />
    <link rel="alternate" hreflang="en" href={enHref} />
    <link rel="alternate" hreflang="x-default" href={esHref} />
    <slot name="head" />
  </head>
```

### TopNav with locale-aware hrefs

```astro
---
// Updated src/components/TopNav.astro
import { getRelativeLocaleUrl } from 'astro:i18n';
import { useTranslations } from '../i18n/ui';

interface Props {
  lang?: 'es' | 'en';
}
const { lang = 'es' } = Astro.props;
const t = useTranslations(lang);
const r = (path: string) => getRelativeLocaleUrl(lang, path);

const navGroups = [
  { label: t('nav.inicio'), href: r('') },
  {
    label: t('nav.micologia'),
    children: [
      { label: t('nav.generalidades'), href: r('micologia/generalidades/') },
      { label: t('nav.grupo'), href: r('micologia/grupo-de-trabajo/') },
      { label: t('nav.colreptiles'), href: r('micologia/colreptiles/') },
    ],
  },
  // ... etc.
];
---
```

### content.config.ts addition for EN collections

```typescript
// Addition to src/content.config.ts
const micologiaEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/micologia-en' }),
  schema: contentSchema,
});
const patologiasEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/patologias-en' }),
  schema: contentSchema,
});
const investigacionEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/investigacion-en' }),
  schema: contentSchema,
});
const laboratorioEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/laboratorio-en' }),
  schema: contentSchema,
});
const recursosEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recursos-en' }),
  schema: contentSchema,
});

export const collections = {
  micologia, patologias, investigacion, laboratorio, recursos,
  'micologia-en': micologiaEn,
  'patologias-en': patologiasEn,
  'investigacion-en': investigacionEn,
  'laboratorio-en': laboratorioEn,
  'recursos-en': recursosEn,
};
```

---

## Content Translation Scope (I18N-02)

### 14 content items to translate

| Content ID | ES collection/slug | Content type | Notes |
|-----------|--------------------|-------------|-------|
| Home page | `src/pages/index.astro` (inline) | Inline Astro, not markdown | Translate inline strings in `en/index.astro` |
| Generalidades | `micologia/generalidades` | Long prose | Longest article (~4000 words) |
| Grupo de trabajo | `micologia/grupo-de-trabajo` | Short list | Short — 4 members + context |
| Colaboración reptiles | `micologia/colreptiles` | Medium prose | |
| Levaduras | `patologias/levaduras` | Long, 3-section TOC | Has TOC — EN heading IDs must be verified |
| Filamentosos | `patologias/filamentosos` | Medium, 2-section TOC | Has TOC — EN heading IDs must be verified |
| Dimórficos | `patologias/dimorficos` | Medium, 2-section TOC | Has TOC — EN heading IDs must be verified |
| Micosis peces | `patologias/micosis-peces` | Medium prose | |
| Artículos y congresos | `investigacion/articulos-congresos` | Long list | Titles in Spanish — may keep as-is or add EN context |
| Artículos interesantes | `investigacion/articulos-interesantes` | Link list | Link titles may stay in original language |
| Laboratorio | `laboratorio/laboratorio` | Technical prose | Medical/diagnostic vocabulary |
| Archivo imágenes | `src/pages/recursos/archivo-imagenes.astro` (inline) | Inline, image alt texts | Translate title, description, alt texts for EN page |
| Links micología | `recursos/links-micologia` | Link list | External site names may stay in original |
| Links revistas | `recursos/links-revistas` | Link list | Journal names stay in original |
| Bibliografía | `recursos/bibliografia` | Bibliography list | Author/title stay in original; UI context translated |

**Translation approach for I18N-02:** AI-assisted first pass on each markdown file. The developer reviews and commits. For content with preserved scientific names (Candida albicans, Cryptococcus, etc.), the proper nouns stay unchanged. Recommended AI prompt pattern: "Translate this Spanish veterinary mycology article to English. Preserve: (1) scientific species names in italics, (2) proper nouns, (3) markdown formatting, (4) frontmatter YAML (update title and description only)."

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `astro-i18next` npm package | Astro built-in i18n routing | Astro 4.0 (2023) | No extra dependency; built-in routing and URL helpers |
| Manual `getStaticPaths` for locale routing | File-based routing under `src/pages/[locale]/` | Astro 4.0+ | Pages at `src/pages/en/` automatically route to `/en/*` |
| Custom URL manipulation for language switcher | `getRelativeLocaleUrl` from `astro:i18n` | Astro 4.0+ | Handles prefixDefaultLocale, trailing slash, build.format correctly |
| `src/content/config.ts` (Astro 4) | `src/content.config.ts` (Astro 6+) | Astro 6.0 | Already correct in this project |
| `import { z } from 'astro:content'` | `import { z } from 'astro/zod'` | Astro 6.0 | Already correct in this project |

**Deprecated/outdated:**
- `astro-i18next` npm package: Not needed for Astro 6+ — built-in routing handles URL structure; JSON/TS files handle strings
- `entry.render()`: Now `render(entry)` imported from `astro:content` — already correct in this project

---

## Suggested Wave Structure

Based on dependency analysis, the optimal wave structure for Phase 3:

**Wave 0 (Infrastructure — blocks all waves):**
- Create `src/i18n/ui.ts` with full translation dictionary
- Update `src/content.config.ts` to add 5 EN collections
- Create 5 EN collection directories with `.gitkeep`
- Create `src/components/LangSwitcher.astro`
- Update `BaseLayout.astro` to add hreflang + pass `lang` to Header/Footer
- Update `Header.astro` to accept `lang` prop + wire LangSwitcher
- Update `Footer.astro` to accept `lang` prop + use translations
- Update `TableOfContents.astro` to accept `lang` prop + use translations

**Wave 1 (Nav translation — blocks Wave 2 because pages depend on nav):**
- Update `TopNav.astro` to accept `lang` prop + use translations + locale-aware hrefs
- Update `MobileNav.astro` to accept `lang` prop + use translations + locale-aware hrefs
- Update `ContentPage.astro` to pass `lang` to `BaseLayout`

**Wave 2 (Content translation + EN pages — parallelizable across content domains):**
- Translate and place 13 EN markdown files (all non-home, non-image-archive content)
- Create 14 EN Astro pages under `src/pages/en/`
- Replace `src/pages/en/index.astro` (walking-skeleton) with real EN home page
- Create `src/pages/en/recursos/archivo-imagenes.astro` with translated alt texts

**Wave 3 (Verification):**
- Update `verify-build.mjs` to assert EN pages exist at `dist/en/` URLs
- Manual smoke-test: language switcher works on every page type
- Verify hreflang in built HTML
- Verify EN TOC anchor IDs match heading IDs in dist HTML

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Collection names with `-` in export object must be quoted (e.g., `'micologia-en'`) | Pattern 4 (content.config.ts) | Build error if unquoted in some TS configs; low risk, standard JS |
| A2 | English nav label translations (e.g., "Levaduras" → "Yeasts", "Dimórficos" → "Dimorphic fungi") are acceptable English equivalents | UI String Inventory | User/academic reviewer may prefer different English terms; developer reviews before commit |
| A3 | `getRelativeLocaleUrl('es', '')` with empty string path returns `/` (home) | Pitfall 3 | LangSwitcher may produce `//` or malformed URL on home page; easily verified by inspection |
| A4 | TopNav href refactor using `getRelativeLocaleUrl` within component frontmatter works for static build | Pattern 5 (TopNav) | Astro static build should support all imports from `astro:i18n` in component frontmatter; no evidence to contrary |

---

## Open Questions

1. **Image archive EN alt texts**
   - What we know: `archivo-imagenes.astro` has 20 images with Spanish `alt` strings hardcoded inline (not from a content collection)
   - What's unclear: Whether the EN page needs translated `alt` texts or if the Spanish alt texts are acceptable for EN (since the images are scientific photographs)
   - Recommendation: Translate alt texts for WCAG compliance — at minimum provide EN strings for the page title and description. Alt text language should match `html[lang]`.

2. **Artículos y congresos — to translate or not**
   - What we know: This page is a list of academic publications. Most publication titles are in Spanish or contain mixed language (Spanish/English scientific terms).
   - What's unclear: Whether I18N-02 requires translating publication list content or just the UI wrapper
   - Recommendation: Translate the section headings and contextual prose; keep publication titles in their original language (standard academic practice).

3. **verify-build.mjs EN pages coverage**
   - What we know: The current `EXPECTED_PAGES` list only covers Spanish pages. Phase 3 should extend it with EN equivalents.
   - Recommendation: Add an `EXPECTED_EN_PAGES` array with all 15 EN dist paths to verify-build.mjs as part of Wave 3.

---

## Environment Availability

No external dependencies beyond the project's existing Astro 7 installation. All required APIs (`astro:i18n`, `astro:content`) are built-in.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `astro:i18n` module | LangSwitcher, hreflang, TopNav/MobileNav hrefs | ✓ | Astro 7.3.6 | — |
| `astro:content` (getEntry, render) | All EN content pages | ✓ | Astro 7.3.6 | — |
| `site` config in astro.config.mjs | `getAbsoluteLocaleUrl` (hreflang) | ✓ | `https://micologiaveterinaria.ulpgc.es` | — |

**Missing dependencies with no fallback:** None.

---

## Security Domain

> `security_enforcement` not set in config.json — treated as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth in this site |
| V3 Session Management | no | Static site, no sessions |
| V4 Access Control | no | All content is public |
| V5 Input Validation | no | No user input; all content is build-time static |
| V6 Cryptography | no | No secrets, no encryption |

### Threat Assessment for Phase 3

Phase 3 introduces no new security surface. All changes are:
- Build-time static file generation
- New static pages at `/en/*` URLs (same security posture as existing pages)
- New TypeScript utility (`ui.ts`) with string literals
- No new network endpoints, forms, or dynamic features

**No ASVS controls required for Phase 3.**

---

## Sources

### Primary (HIGH confidence)

- Astro 7.3.6 `astro:i18n` module type definitions — `node_modules/astro/dist/virtual-modules/i18n.d.ts` — confirmed `getRelativeLocaleUrl`, `getAbsoluteLocaleUrl`, `getRelativeLocaleUrlList` signatures and JSDoc examples [VERIFIED]
- Astro 7.3.6 context type definitions — `node_modules/astro/dist/types/public/context.d.ts` — confirmed `currentLocale: string | undefined` [VERIFIED]
- `astro.config.mjs` in project — confirmed `site`, `prefixDefaultLocale: false`, `defaultLocale: 'es'` [VERIFIED]
- `src/content.config.ts` in project — confirmed existing schema pattern, `z` from `astro/zod`, `glob` from `astro/loaders` [VERIFIED]
- Official Astro i18n guide — `https://docs.astro.build/en/guides/internationalization/` — `getRelativeLocaleUrl` usage pattern, `prefixDefaultLocale: false` behavior [CITED]
- Official Astro i18n module reference — `https://docs.astro.build/en/reference/modules/astro-i18n/` — function signatures [CITED]

### Secondary (MEDIUM confidence)

- eastondev.com Astro i18n guide — language switcher pattern using `getRelativeLocaleUrl` + `Astro.currentLocale` + path strip logic [CITED: eastondev.com/blog/en/posts/dev/20251202-astro-i18n-guide/]
- dev.to Astro i18n 2026 guide — `ui.ts` + `useTranslations` helper pattern + `getRelativeLocaleUrlList` usage [CITED: dev.to/garyedgekits/astro-i18n-in-2026-the-complete-guide-from-uits-to-edge-native-kv-1gla]
- maviklabs.com i18n guide — parallel locale subdirectory vs frontmatter lang field tradeoff [CITED: maviklabs.com/blog/internationalization-astro-2026/]

### Tertiary (LOW confidence)

- None — all key claims verified or cited from official sources.

---

## Metadata

**Confidence breakdown:**
- Astro i18n API (`getRelativeLocaleUrl`, `getAbsoluteLocaleUrl`, `Astro.currentLocale`): HIGH — verified from installed Astro 7.3.6 type definitions
- Content collection parallel pattern: HIGH — consistent with existing project pattern + official docs
- UI string count and keys: HIGH — verified by grepping all components
- `Astro.currentLocale` is `undefined` on default locale root pages: HIGH — confirmed from type definition + official docs
- English translation values for nav labels: MEDIUM — reasonable academic English equivalents, but subject to reviewer preference (logged as A2)
- Wave structure: MEDIUM — dependency analysis is correct but exact plan splits depend on planner discretion

**Research date:** 2026-10-18
**Valid until:** 60 days (Astro stable, no fast-moving dependencies)
