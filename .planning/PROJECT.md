# VetMyc — Veterinary Mycology Website Modernization

## What This Is

A full migration of the Veterinary Mycology Group website at ULPGC ([micologiaveterinaria.ulpgc.es](https://micologiaveterinaria.ulpgc.es/)) from a 2000s-era Microsoft FrontPage frameset site into a modern, responsive Astro-based static website. The project preserves all existing academic content (14 content sections) while replacing the outdated HTML/frameset shell with a clean, modern UI. The site is bilingual (Spanish + English) and is deployed as static files to the ULPGC university server.

The site belongs to **Dr. Begoña Acosta Hernández** and the Veterinary Mycology Group, Faculty of Veterinary Medicine, ULPGC. Its audience is researchers, students, and academics in veterinary mycology.

## Core Value

All existing content — pathology descriptions, diagnostic procedures, image archive, bibliography, links — accessible through a clean, modern, navigable interface that works on any device and browser.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Migrate all 14 content sections from the existing site as-is
- [ ] Replace HTML frameset + FrontPage layout with modern responsive Astro site
- [ ] Clean, modern UI design (no inline font tags, no table layouts, no FrontPage themes)
- [ ] Spanish + English bilingual support (AI-assisted English translations)
- [ ] Static output deployable to ULPGC server (no Node.js runtime required on server)
- [ ] Developer-maintained via markdown files in git (no CMS)
- [ ] All existing images and PDFs served from the new site

### Out of Scope

- CMS or admin UI — developer updates via git/markdown
- Dynamic features (forms, login, database) — static site only for v1
- Design system / component library — standard Astro + CSS, no heavy dependencies
- Server-side rendering — static output (`astro build`) only

## Context

**Current site tech:** HTML framesets (`<frameset cols="201,*">`), Microsoft FrontPage themes, ISO-8859-1 encoding, table-based layouts, inline `<font>` tags. Last updated 2013-05-23. Practically non-functional on mobile.

**Content inventory (14 sections from navigation):**
1. Home — group intro, logos (ULPGC + IUSA), Dr. Acosta CV link, scientific photos
2. Micología — general introduction to pathogenic fungi and mycological techniques
3. Grupo de trabajo — research group members and roles
4. Colaboración con grupo de reptiles — collaboration with reptile research group
5. Artículos y congresos — articles and conference communications
6. Patologías por levaduras — yeast pathologies (Candidiasis, Cryptococcosis, Malassezia)
7. Patologías por hongos filamentosos — filamentous fungi pathologies
8. Patologías por hongos dimórficos — dimorphic fungi pathologies
9. Principales micosis de los peces — fish mycoses
10. Archivo de imágenes propias — own image archive
11. Artículos interesantes — curated interesting articles
12. Links de micología — mycology links
13. Links revistas de micología — mycology journal links
14. Laboratorio de diagnóstico — diagnostic lab procedures
15. Bibliografía — bibliography

**Bilingual:** Spanish is primary. English provided via AI-assisted first-pass translation, reviewed and committed to the repo. Language switcher in UI.

**Deployment:** Static files (`dist/`) deployed to the ULPGC university server hosting `micologiaveterinaria.ulpgc.es`. Astro's default `output: 'static'` mode.

## Constraints

- **Tech stack:** Astro (static output) — fits content-first, zero-runtime requirement
- **Deployment:** Must produce static HTML/CSS/JS deployable to standard university Apache/Nginx server — no Node.js runtime needed
- **Encoding:** Source content is ISO-8859-1 Spanish — must handle special characters (á, é, ñ, ü) correctly
- **Content fidelity:** Migrate existing content as-is for v1 — no editorial changes
- **Maintenance:** Git-based markdown files, no CMS, updated by developer

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Astro over Next.js/Nuxt | Content-only site, no dynamic features needed, Astro ships zero JS by default | — Pending |
| Static output over SSR | ULPGC server is a standard web host, no Node.js runtime available | — Pending |
| Markdown + git over CMS | Developer-maintained project; simpler, version-controlled content | — Pending |
| AI-assisted English translations | Faster than manual translation; developer reviews before committing | — Pending |
| Migrate content as-is for v1 | Keeps scope tight; editorial updates are a separate concern | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-01 after initialization*
