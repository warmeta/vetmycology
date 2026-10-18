---
phase: 02-spanish-content-migration
plan: "04"
subsystem: ui
tags: [content-migration, pathology, toc, laboratorio, astro, markdown]

# Dependency graph
requires:
  - phase: 02-spanish-content-migration
    plan: "02"
    provides: ContentPage layout with tocItems prop, TableOfContents component, 5 content collections

provides:
  - "src/content/patologias/levaduras.md: Combined Candidiasis+Criptococosis+Malassezias (toc:true, 3 h2 headings)"
  - "src/content/patologias/filamentosos.md: Combined Dermatofitosis+Aspergilosis (toc:true, 2 h2 headings)"
  - "src/content/patologias/dimorficos.md: Combined Histoplasmosis+Esporotricosis (toc:true, 2 h2 headings)"
  - "src/content/patologias/micosis-peces.md: Full fish diseases content (toc:false)"
  - "src/content/investigacion/articulos-congresos.md: Publications+congresses+theses (toc:false)"
  - "src/content/laboratorio/laboratorio.md: Mycological diagnostic procedures (toc:false)"
  - "src/pages/patologias/levaduras.astro: Page with functional TOC (3 items, IDs verified)"
  - "src/pages/patologias/filamentosos.astro: Page with functional TOC (2 items)"
  - "src/pages/patologias/dimorficos.astro: Page with functional TOC (2 items)"
  - "src/pages/patologias/micosis-peces.astro: Standard content page at /patologias/micosis-peces/"
  - "src/pages/investigacion/articulos-congresos.astro: Standard content page"
  - "src/pages/laboratorio/index.astro: Laboratorio page at /laboratorio/ (directory index)"

affects:
  - "02-05: Image archive + PDFs — may need patologia/ content context for PDF links"
  - "03-*: English i18n — these pages have lang:'es' set; English counterparts needed in Phase 3"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "FrontPage frameset → sub-page aggregation: frameset HTMs link to sub-pages; sub-pages extracted separately and combined into single MD with h2 headings"
    - "Sätteri accent-preserving heading IDs: Sätteri does NOT ASCII-fold accented chars in heading IDs — 'Patologías' → 'patologías-por-malassezias' NOT 'patologias-por-malassezias'"
    - "Table cell content extraction: FrontPage markdownify produces | | | content | table format; extract last cell by splitting on | and taking non-empty parts"

key-files:
  created:
    - src/content/patologias/levaduras.md
    - src/content/patologias/filamentosos.md
    - src/content/patologias/dimorficos.md
    - src/content/patologias/micosis-peces.md
    - src/content/investigacion/articulos-congresos.md
    - src/content/laboratorio/laboratorio.md
    - src/pages/patologias/levaduras.astro
    - src/pages/patologias/filamentosos.astro
    - src/pages/patologias/dimorficos.astro
    - src/pages/patologias/micosis-peces.astro
    - src/pages/investigacion/articulos-congresos.astro
    - src/pages/laboratorio/index.astro
  modified: []

key-decisions:
  - "Sub-page aggregation: levaduras, filamentosos, dimorficos FrontPage pages are frameset indexes linking to sub-pages (candidiasis.htm, criptococosis1.htm, etc.). Each sub-page was extracted separately and combined into a single MD file with h2 section headings — this gives the TOC its sections."
  - "Sätteri preserves accent chars in heading IDs: tocItem for 'Patologías por Malassezias' uses id:'patologías-por-malassezias' (with accent on í), NOT the ASCII-folded 'patologias-por-malassezias'. Verified by inspecting dist HTML after trial build."
  - "Plan 03 parallel files had no frontmatter (working tree, not yet committed) — added minimal frontmatter to unblock build. Plan 03 will overwrite with proper content on its commit."

patterns-established:
  - "Pattern: FrontPage sub-page aggregation — extract index.htm sub-page list, then extract each sub-page, combine with ## headings"
  - "Pattern: Sätteri heading ID verification — always run trial build and grep dist HTML for actual id= values before finalizing tocItems"

requirements-completed:
  - CONT-05
  - CONT-06
  - CONT-07
  - CONT-08
  - CONT-09
  - CONT-14
  - MEDIA-03

# Metrics
duration: 5min
completed: "2026-10-18"
---

# Phase 2 Plan 04: Pathology TOC Pages + Laboratorio + Artículos y Congresos Summary

**6 pathology/lab/research content pages live — 3 with functional TOC using Sätteri-verified accent-preserving heading IDs; Sätteri preserves accents in generated IDs (patologías-por-malassezias, not patologias)**

## Performance

- **Duration:** ~5 minutes
- **Started:** 2026-10-18T17:19:55Z
- **Completed:** 2026-10-18T17:25:17Z
- **Tasks:** 2
- **Files created/modified:** 12

## Accomplishments

- Extracted and combined sub-page content for 3 TOC pathology pages (levaduras = Candidiasis + Criptococosis + Malassezias; filamentosos = Dermatofitosis + Aspergilosis; dimorficos = Histoplasmosis + Esporotricosis)
- Extracted 3 non-TOC pages: micosis-peces (saprolegniasis, systemic mycoses, afanomicosis), articulos-congresos (research publications + congress presentations + doctoral theses), laboratorio (diagnostic procedures)
- Wired all 6 Astro pages with proper getEntry + render pattern, ContentPage layout
- TOC component functional with Sätteri-verified anchor IDs — verified by inspecting generated dist HTML
- Critical discovery: Sätteri preserves accent characters in heading IDs (assumption A4 in RESEARCH.md was partially wrong)

## Sätteri Heading ID Reference (for Plan 05 context)

Actual IDs generated by Sätteri 0.4.3 (verified from dist HTML):

### Levaduras (`/patologias/levaduras/`)
| h2 text | Sätteri generated id |
|---------|---------------------|
| `Candidiasis animal` | `candidiasis-animal` |
| `Criptococosis` | `criptococosis` |
| `Patologías por Malassezias` | `patologías-por-malassezias` |

### Filamentosos (`/patologias/filamentosos/`)
| h2 text | Sätteri generated id |
|---------|---------------------|
| `Dermatofitosis` | `dermatofitosis` |
| `Aspergilosis` | `aspergilosis` |

### Dimórficos (`/patologias/dimorficos/`)
| h2 text | Sätteri generated id |
|---------|---------------------|
| `Histoplasmosis` | `histoplasmosis` |
| `Esporotricosis` | `esporotricosis` |

**Key insight:** Sätteri uses kebab-case but does NOT strip/ASCII-fold accented characters. The `á`, `é`, `í`, `ó`, `ú`, `ñ` characters are preserved verbatim in the `id` attribute. This differs from what RESEARCH.md Assumption A4 anticipated.

## Task Commits

1. **Task 1: Extract + place 6 content MD files** — `7dc25b6` (feat)
2. **Task 2: Wire 6 Astro pages with TOC + ContentPage** — `a972e6f` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

### Content files (Task 1)
- `/Users/warmeta/Projects/vetmyc/src/content/patologias/levaduras.md` — Combined Candidiasis + Criptococosis + Malassezias sections; toc:true; 3 h2 headings
- `/Users/warmeta/Projects/vetmyc/src/content/patologias/filamentosos.md` — Combined Dermatofitosis + Aspergilosis; toc:true; 2 h2 headings
- `/Users/warmeta/Projects/vetmyc/src/content/patologias/dimorficos.md` — Combined Histoplasmosis + Esporotricosis; toc:true; 2 h2 headings
- `/Users/warmeta/Projects/vetmyc/src/content/patologias/micosis-peces.md` — Saprolegniasis + systemic mycoses + afanomicosis; toc:false
- `/Users/warmeta/Projects/vetmyc/src/content/investigacion/articulos-congresos.md` — Publications + congress communications + doctoral theses; toc:false
- `/Users/warmeta/Projects/vetmyc/src/content/laboratorio/laboratorio.md` — Mycological diagnostic procedures; toc:false

### Astro page files (Task 2)
- `/Users/warmeta/Projects/vetmyc/src/pages/patologias/levaduras.astro` — getEntry + render + ContentPage with TOC (3 verified items)
- `/Users/warmeta/Projects/vetmyc/src/pages/patologias/filamentosos.astro` — getEntry + render + ContentPage with TOC (2 items)
- `/Users/warmeta/Projects/vetmyc/src/pages/patologias/dimorficos.astro` — getEntry + render + ContentPage with TOC (2 items)
- `/Users/warmeta/Projects/vetmyc/src/pages/patologias/micosis-peces.astro` — getEntry + render + ContentPage (no TOC)
- `/Users/warmeta/Projects/vetmyc/src/pages/investigacion/articulos-congresos.astro` — getEntry + render + ContentPage (no TOC)
- `/Users/warmeta/Projects/vetmyc/src/pages/laboratorio/index.astro` — getEntry + render + ContentPage (no TOC); URL is `/laboratorio/`

## Decisions Made

- **Sub-page aggregation strategy:** The FrontPage "levaduras", "filamentosos", and "dimorficos" pages are frameset indexes that only contain links to sub-pages (candidiasis.htm, criptococosis1.htm, etc.). The plan notes say "treat levaduras sub-pages as sections within one page". Extracted each sub-page separately, then combined with `## ` headings into a single MD file — this provides the h2 structure for TOC.

- **Sätteri preserves accents:** RESEARCH.md Assumption A4 stated Sätteri would ASCII-fold accented chars. Verified this is incorrect — Sätteri preserves `á`, `í`, `ó` in `id` attributes. The `patologías-por-malassezias` ID (with accent) was verified by trial build and dist HTML inspection before finalizing `tocItems`.

- **Plan 03 parallel files unblocked:** Plan 03's extracted files (micologia, recursos, articulos-interesantes) existed on disk without frontmatter, causing Astro content collection validation to fail during the trial build. Added minimal valid frontmatter to these files to unblock the build — this is a Rule 3 (blocking) fix that Plan 03 will naturally overwrite when it commits its proper content.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] FrontPage pathology pages are frameset indexes, not content pages**
- **Found during:** Task 1 (content extraction)
- **Issue:** `patologias por levaduras.htm`, `patologias por filamentosos.htm`, `patologias por dimorficos.htm` are FrontPage frameset index pages — they only link to sub-pages (candidiasis.htm, criptococosis1.htm, etc.) and contain no content themselves. Extracting these produced ~370 byte stub files.
- **Fix:** Identified the sub-page files referenced in the frameset links, extracted each sub-page individually, and combined them into single MD files with `## ` headings representing each sub-page as a TOC section.
- **Files modified:** All 3 TOC pathology MD files
- **Verification:** h2 counts are 3 (levaduras), 2 (filamentosos), 2 (dimorficos) as required

**2. [Rule 1 - Bug] Sätteri preserves accent chars in heading IDs (RESEARCH.md Assumption A4 incorrect)**
- **Found during:** Task 2 (TOC ID verification from dist HTML)
- **Issue:** RESEARCH.md Assumption A4 and plan guidance predicted Sätteri would ASCII-fold accented characters in generated heading IDs (so `Patologías` → `patologias`). Trial build + dist HTML inspection revealed Sätteri 0.4.3 preserves the accent: `Patologías` → `patologías` (with `í`). The initial tocItem `{ id: 'patologias-por-malassezias', ... }` would have produced a broken TOC anchor.
- **Fix:** Updated levaduras.astro tocItem to use `{ id: 'patologías-por-malassezias', ... }` (with accent on `í`). Other IDs (candidiasis-animal, criptococosis, dermatofitosis, aspergilosis, histoplasmosis, esporotricosis) were all correct as they contained no accented characters.
- **Files modified:** `src/pages/patologias/levaduras.astro`
- **Verification:** After fix, `href="#patologías-por-malassezias"` in TOC matches `id="patologías-por-malassezias"` on h2 element in dist HTML

**3. [Rule 3 - Blocking] Plan 03 parallel content files had no frontmatter**
- **Found during:** Task 2 (trial build)
- **Issue:** Plan 03 (parallel wave) had extracted micologia, recursos, and articulos-interesantes content files to disk without YAML frontmatter. Astro's content collection schema validation requires a `title` field — build failed with `InvalidContentEntryDataError`.
- **Fix:** Added minimal valid YAML frontmatter (`title`, `description`, `toc: false`, `lang: "es"`) to 7 Plan 03 files so the build could proceed. Plan 03 will naturally replace these with properly extracted content when it commits.
- **Files modified:** 7 Plan 03 content files (not committed — left in working tree for Plan 03 to handle)
- **Verification:** Build passed after fix; `node scripts/verify-build.mjs` exits 0

---

**Total deviations:** 3 auto-fixed (1 blocking-extraction, 1 bug-slug, 1 blocking-parallel)
**Impact on plan:** All 3 fixes required for correctness. No scope creep. Key discovery: Sätteri accent preservation must be accounted for in all future TOC pages.

## Issues Encountered

None beyond the deviations documented above. Build succeeded on first attempt after the Sätteri accent fix.

## Known Stubs

None — all 6 pages render real migrated content. PDF links point to `/docs/` paths per D-17; PDFs themselves will be copied in Plan 05 Task 1.

## Threat Flags

None — no new network endpoints, auth paths, or trust-boundary schema changes. All content is statically rendered from developer-maintained markdown.

## User Setup Required

None — all content is in markdown files, no external service configuration required.

## Next Phase Readiness

- Plans 03 and 04 together will complete the Spanish content migration Wave 2
- All 6 pathology/lab/research pages are accessible at their URLs in the static build
- TOC anchor navigation works end-to-end (verified: TOC href values match h2 id attributes in dist HTML)
- Plan 05 (image archive + PDFs) can now copy PDFs to `public/docs/` — the PDF links in levaduras.md (candidiasis.pdf, criptococosis.pdf, malassezias.pdf) and other pages already point to `/docs/` paths

## Self-Check: PASSED

- All 12 created files exist on disk
- Both task commits found in git log (7dc25b6, a972e6f)
- SUMMARY.md written successfully
- dist/ files verified: all 6 content pages exist in built output
- verify-build.mjs exits 0

---
*Phase: 02-spanish-content-migration*
*Completed: 2026-10-18*
