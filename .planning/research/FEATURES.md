# Features Research — VetMyc Academic Site

**Domain:** Academic research group website (veterinary mycology)
**Researched:** 2026-10-01
**Overall confidence:** HIGH — academic research sites are a well-established pattern; Astro i18n is stable and well-documented

---

## Table Stakes (must have)

| Feature | Why Users Expect It | Complexity |
|---------|---------------------|------------|
| Responsive layout | The existing site is broken on mobile; any modern site must work on phones and tablets | Low |
| Top navigation with grouped sections | Users arrive from Google on a specific topic and need to orient themselves across 14 sections | Med |
| Bilingual ES/EN with persistent language switcher | Site serves international researchers; ULPGC's official sites are bilingual; a flag/code toggle in the header is standard on Spanish university sites | Med |
| All 14 content sections present | Migration must preserve every existing page at a reachable URL; missing content breaks links from published papers and external sites | Low (per page) |
| UTF-8 encoded output | ISO-8859-1 source content must be converted; accented characters (á, é, ñ, ü) must render correctly without entity escapes | Low |
| Accessible image display with captions | The image archive is a primary content type; alt text is required for accessibility and image search indexing | Low |
| PDF links that open correctly | CVs, lab protocols, articles are served as PDFs; users expect them to open in-browser or download cleanly | Low |
| Readable typography at body text sizes | Academic content is dense prose; line length, font size, and contrast must support sustained reading | Low |
| Page titles and meta descriptions per page | Academic users bookmark pages; search engines index individual pages; each page needs a meaningful `<title>` | Low |
| Footer with institution affiliation | All ULPGC sites show faculty, department, contact info; omitting it looks unofficial | Low |
| `<html lang="es/en">` per page | Required by WCAG 2.1 AA (and Spanish law) so screen readers use the correct language voice | Low |
| Skip-to-content link | Required for keyboard users and WCAG 2.1 AA; one line in the layout template | Low |

---

## Differentiators (nice to have)

| Feature | Value | Complexity |
|---------|-------|------------|
| Section grouping in navigation (5-6 clusters) | Reduces 14 flat items to a two-level nav; dramatically improves orientation for first-time visitors | Low |
| Anchor links / same-page TOC on long pathology pages | Pathology pages each cover multiple diseases; a same-page TOC makes them scannable without extra pages | Low |
| Image lightbox on archive pages | Clicking a thumbnail to see full-res is expected behavior; avoids layout-breaking large inline images | Low (CSS-only) |
| Stable, clean URL structure | `/es/patologias/levaduras/` preserves external links and makes the site citable in new papers | Low |
| Open Graph meta tags | When researchers share a link in email or Slack, a preview card with title and description improves credibility | Low |
| Print stylesheet for pathology and lab pages | Veterinarians print diagnostic protocols; `@media print` is low effort and high value for this audience | Low |
| Language preference persistence via localStorage | Remembers chosen language across pages; user does not re-select on every navigation | Low (5 lines JS) |
| Breadcrumbs | Shows `Home > Pathologies > Yeast Pathologies`; helps users who land from search know where they are in the site | Low |

---

## Anti-Features (deliberately NOT build in v1)

| Feature | Why to Skip |
|---------|-------------|
| CMS or admin UI | Explicitly out of scope; static-only deployment to university Apache server; developer maintains via git/markdown |
| Search | Adds JS bundle weight; 14 sections is small enough that nav + browser Ctrl+F covers the need; defer to v2 if users request it |
| Contact form | Requires a form backend; university server is static-only; use a mailto link instead |
| Comments / discussion threads | Academic discussion happens in email and conferences; adds moderation burden with no validated need |
| Publication import from ORCID/PubMed API | Dynamic API calls are incompatible with static output; existing articles list is manually curated in markdown |
| Dark mode toggle | Adds CSS variable complexity and testing surface for no validated user need |
| Analytics with consent banner | Google Analytics in Spain (AEPD/GDPR) requires a cookie consent banner; university server logs are sufficient for v1; the banner complexity exceeds the benefit |
| Social sharing buttons | Privacy cost (third-party scripts/iframes) outweighs benefit; Open Graph tags already enable sharing by pasting a URL |
| Automatic JS translation | Content is statically translated by the developer; runtime translation creates inconsistent quality |
| RSS feed | The site is not a blog; no regular publication cadence; no audience need |
| Separate member profile pages | The grupo de trabajo section is one page; separate profile URLs are over-engineering for ~5 researchers |
| Link checker automation | Premature for v1; document a manual audit before launch instead |

---

## Navigation Patterns

### The 14-section problem

14 top-level nav items overflows on desktop, collapses into a hamburger on mobile that users never discover, and puts unrelated content at equal visual hierarchy. The original FrontPage frameset kept the sidebar persistent because frames solved the "persistent nav without JavaScript" problem — that solution no longer applies.

**Recommended: grouped top nav with two-level structure**

Organize 14 sections into 5-6 nav groups:

| Nav Group | Sections Included |
|-----------|------------------|
| Home | Home |
| Mycology (Micología) | Micología general, Grupo de trabajo, Colaboración reptiles |
| Pathologies (Patologías) | Levaduras, Filamentosos, Dimórficos, Micosis peces |
| Research (Investigación) | Artículos y congresos, Artículos interesantes, Bibliografía |
| Laboratory (Laboratorio) | Laboratorio de diagnóstico |
| Resources (Recursos) | Archivo de imágenes, Links micología, Links revistas |

- Desktop: 6 groups in the top bar with dropdown submenus on hover/focus
- Mobile: hamburger collapses to group names; tap expands to show sections within that group
- Sticky header: nav stays visible on scroll — replaces the frameset's persistent sidebar behavior

**Why not sidebar?**
Sidebar is appropriate for deeply hierarchical content (documentation sites, wikis). This site has flat sections, at most two levels deep. A sidebar consumes ~200px of content width on desktop, mirrors the FrontPage aesthetic users are escaping, and has awkward mobile behavior. Top nav is the standard for this content type.

**Breadcrumbs**
Each page shows: `Home > Pathologies > Yeast Pathologies`. Cheap to implement in Astro, high value for users arriving from search engines.

---

## Image Archive Patterns

The "Archivo de imágenes propias" section is a scientific photograph archive — clinical and histological images.

**Recommended pattern:**
- CSS Grid thumbnail grid: 3-4 columns desktop, 2 mobile
- Lightbox: pure CSS (`:target` selector trick) or a small vanilla JS implementation — no jQuery or gallery plugins
- Captions: mandatory per image (species, condition, magnification if applicable)
- Alt text: mandatory (accessibility and image SEO)
- Image format: serve JPEG as-is; do not require WebP conversion for a static university server without an image CDN

**What not to do:**
- Do not render all images at full size inline (the existing FrontPage approach)
- Do not use a JavaScript-heavy gallery library (Fancybox, Swiper, PhotoSwipe) — adds bundle weight and maintenance

---

## Bibliography and References Patterns

**Recommended: Formatted HTML list, no dynamic library**
- Markdown list in Vancouver or APA format (standard in veterinary/medical literature — confirm with Dr. Acosta)
- DOI links where available: `https://doi.org/10.xxxx/...` — these are stable and require no API
- No citation rendering library (Citation.js, citeproc-js) for a static list that changes rarely

---

## External Links Section Patterns

Two sections are curated external links (mycology links, journal links).

**Recommended pattern:**
- Simple two-column grid on desktop, one column mobile
- Organized by category within each section (e.g., "Databases", "Societies", "Journals by discipline")
- Each link: name, one-line description, URL
- Links open in a new tab with `rel="noopener noreferrer"`
- Document that a manual link-rot audit is needed before launch (no automated checker in v1)

---

## Bilingual Language Switcher Patterns

**Astro i18n (static output compatible):**

Astro 4.x built-in i18n routing generates separate page trees at build time:
- `/es/micologia/` for Spanish
- `/en/mycology/` for English

`getRelativeLocaleUrl()` and `getAbsoluteLocaleUrl()` helpers build language-switch links at build time with zero runtime JS. Confidence: HIGH.

**Switcher UI:**
- Position: top-right corner of header (universal convention on bilingual sites)
- Display: text codes "ES / EN" — not flag icons. Flags carry political ambiguity (which Spanish-speaking country? which English-speaking country?). Text codes are unambiguous and accessible.
- Behavior: link to the same page in the other language, not to the other language's home
- Persistence: optional `localStorage` write on click (~5 lines JS); all pages can read it to redirect automatically

**URL strategy:**
- `/es/` and `/en/` prefixes on all pages — matches Astro's built-in i18n routing convention
- Spanish as the default locale can optionally omit the prefix — simpler existing-URL continuity, but needs a redirect rule for `/en/` inbound links

---

## Accessibility Requirements

Spanish public universities are subject to **Real Decreto 1112/2018**, which transposes EU Directive 2016/2102 on accessibility of public sector websites. The target is WCAG 2.1 Level AA.

| Requirement | What It Means | Implementation |
|-------------|---------------|----------------|
| WCAG 2.1 AA contrast | Body text ≥ 4.5:1, large text ≥ 3:1 contrast ratio | Check chosen color scheme with a contrast checker before shipping |
| Alt text for all images | Every `<img>` needs descriptive `alt` | Required during content migration |
| Keyboard navigability | All nav, links, lightbox operable without mouse | Semantic HTML elements only; no `div` click handlers |
| Skip navigation link | "Skip to main content" link visible on keyboard focus | One line in the layout template |
| Language declaration | `<html lang="es">` / `<html lang="en">` per page | Set in Astro layout from locale context |
| Logical heading hierarchy | `<h1>` once per page; no skipped levels | Enforce during content migration |
| Descriptive link text | No "click here" or raw URLs as link text — especially for PDFs | Enforce during content migration |

---

## Dependencies Between Features

```
Astro i18n routing config
  └── Language switcher UI (URL structure must be decided before switcher is coded)
  └── Per-page lang attribute (locale available in layout context)
  └── All content pages (each needs both /es/ and /en/ markdown files)

Base layout template (header, nav, footer)
  └── Navigation grouping (nav markup lives in layout)
  └── Skip link (lives in layout)
  └── Accessibility baseline (lang attr, skip link, semantic landmarks)
  └── Responsive CSS (layout breakpoints set here)

Content migration (all 14 sections in markdown)
  └── Bibliography formatting (content must exist before formatting applies)
  └── Image archive (images must be in /public before gallery renders)
  └── PDF links (PDFs must be in /public before links resolve)

Image archive
  └── Lightbox (needs thumbnail grid to exist first)
```

**Hard implementation order:**
1. Decide URL/i18n routing structure first — changing it later breaks all internal links
2. Build base layout template (header, nav, footer, lang attr, skip link)
3. Migrate content section by section into the layout
4. Add image gallery and lightbox once layout is stable

---

## MVP Recommendation

**Build in v1:**
1. All 14 content sections in both ES and EN
2. Grouped top navigation (5-6 clusters, dropdown desktop / accordion mobile)
3. Language switcher (ES/EN text codes, same-page links)
4. Responsive layout
5. Image thumbnail grid (CSS Grid, minimal or no lightbox required for launch)
6. Accessibility baseline (skip link, alt text, lang attr, heading hierarchy, keyboard nav)
7. Footer with ULPGC/IUSA affiliation

**Defer to v2:**
- Lightbox (CSS `:target` is low effort — do it if schedule allows)
- Print stylesheet
- localStorage language persistence
- Breadcrumbs
- Open Graph tags

---

## Open Questions

- Do current FrontPage URLs need to be preserved via Apache `Redirect` rules, or are external links minimal enough to accept breakage?
- Does ULPGC have a mandatory brand/style guide for faculty department sites?
- What citation format does the group use — Vancouver, APA, or a specific journal style?
- Are the English translations fully drafted, partially drafted, or starting from scratch?
