<!-- GSD:project-start source:PROJECT.md -->
## Project

**VetMyc — Veterinary Mycology Website Modernization**

A full migration of the Veterinary Mycology Group website at ULPGC ([micologiaveterinaria.ulpgc.es](https://micologiaveterinaria.ulpgc.es/)) from a 2000s-era Microsoft FrontPage frameset site into a modern, responsive Astro-based static website. The project preserves all existing academic content (14 content sections) while replacing the outdated HTML/frameset shell with a clean, modern UI. The site is bilingual (Spanish + English) and is deployed as static files to the ULPGC university server.

The site belongs to **Dr. Begoña Acosta Hernández** and the Veterinary Mycology Group, Faculty of Veterinary Medicine, ULPGC. Its audience is researchers, students, and academics in veterinary mycology.

**Core Value:** All existing content — pathology descriptions, diagnostic procedures, image archive, bibliography, links — accessible through a clean, modern, navigable interface that works on any device and browser.

### Constraints

- **Tech stack:** Astro (static output) — fits content-first, zero-runtime requirement
- **Deployment:** Must produce static HTML/CSS/JS deployable to standard university Apache/Nginx server — no Node.js runtime needed
- **Encoding:** Source content is ISO-8859-1 Spanish — must handle special characters (á, é, ñ, ü) correctly
- **Content fidelity:** Migrate existing content as-is for v1 — no editorial changes
- **Maintenance:** Git-based markdown files, no CMS, updated by developer
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Astro | ^4.x (verify) | Static site generator, page routing, content collections | Zero JS by default, built-in i18n routing, markdown-native, produces pure static HTML/CSS/JS — perfect fit for a content-only academic site with no dynamic features |
| Node.js | 20 LTS (verify) | Build-time only — not deployed | Required to run Astro build tooling locally; never touches the ULPGC server |
- Ships zero client-side JavaScript unless you explicitly add it — academic content site needs none
- Content Collections API gives typed, file-system markdown with frontmatter validation
- Built-in i18n routing (`/es/`, `/en/`) without a third-party library
- `output: 'static'` produces a pure `dist/` folder deployable to any Apache/Nginx host
- Vite underneath for fast local dev
### Styling
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Plain CSS (scoped Astro styles) | N/A | Layout, typography, responsive design | No build overhead, no class-name mental tax, scoped styles prevent bleed between components, zero runtime |
| CSS Custom Properties | N/A | Theme tokens (colors, spacing, fonts) | Native browser feature, no dependency, easy to maintain |
### Internationalization (i18n)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Astro built-in i18n routing | ^4.x (included) | `/es/` and `/en/` URL prefixes, locale detection, routing helpers | Astro 4.x shipped first-class i18n with `i18n.locales`, `i18n.defaultLocale`, and `getRelativeLocaleUrl()` — no extra library needed |
| JSON translation files | N/A | UI strings (nav labels, footer text, meta descriptions) | Simple key-value files per locale for the ~30 UI strings that are not in content markdown |
### Content Management
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Astro Content Collections | ^4.x (included) | Typed markdown content, frontmatter validation | Provides a schema per collection (`zod`-based), file-system routing, type-safe content queries — catches missing fields at build time |
| Markdown | N/A | All 14 content section bodies | Human-readable, git-diffable, no CMS required, developer-editable |
| MDX | optional | Rich content sections with embedded image grids or tables | MDX lets you use Astro components inside markdown — useful for the image archive section; add only if needed |
### Assets
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Astro built-in image optimization | ^4.x (included) | `<Image>` component, WebP conversion, lazy loading | Zero-config image pipeline; the image archive section has many photos — WebP conversion cuts page weight significantly |
| Static `public/` directory | N/A | PDFs, original images not needing optimization | Files in `public/` copy to `dist/` unchanged — PDFs and legacy images go here |
### Development Tooling
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| TypeScript | ^5.x (verify) | Type safety for content schemas and component props | Astro projects default to TypeScript; Content Collections require it for schema inference |
| Prettier | ^3.x (verify) | Code formatting | Standard; Astro has an official Prettier plugin (`prettier-plugin-astro`) |
| `prettier-plugin-astro` | latest (verify) | `.astro` file formatting in Prettier | Official plugin from the Astro team |
| `astro check` | included with Astro | TypeScript type-checking for `.astro` files | Catches type errors in templates at build time |
### Deployment
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `astro build` output | N/A | Static `dist/` folder | Produces self-contained HTML/CSS/JS deployable via FTP or `rsync` |
| `rsync` or FTP client | system | Deploy `dist/` to ULPGC server | Standard for university servers; no CI/CD pipeline needed for a 14-page academic site |
## Alternatives Considered
| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Astro | Next.js | Requires Node.js runtime on server |
| Framework | Astro | Hugo | Less ergonomic i18n, Go template syntax harder to maintain |
| Framework | Astro | Eleventy | Viable, but Astro's Content Collections and built-in i18n are a better fit |
| Styling | Plain CSS | Tailwind CSS | Adds utility-class noise to content-heavy markdown-driven files |
| Styling | Plain CSS | Sass/SCSS | CSS Custom Properties handle theming without a preprocessor; Sass is a build-time dependency with no runtime benefit for this scope |
| i18n | Astro built-in | `astro-i18next` | Unnecessary; Astro 4 built-in routing handles URL structure; JSON files handle strings |
| Content | Markdown | Contentful / Sanity | Out of scope — CMS explicitly excluded; developer maintains via git |
| Deployment | rsync/FTP | Netlify / Vercel | ULPGC server is a fixed constraint; DNS and hosting is university-managed |
## Installation
# Create new Astro project (verify exact version before running)
# Add official Prettier plugin for Astro formatting
# Optional: MDX support (add only if image archive section needs it)
- Check `npm create astro@latest` for current Astro major version
- Confirm `prettier-plugin-astro` supports the Astro version you install
- Node.js 20 LTS is the recommended build runtime; confirm it is available locally
## Key Version Flags
| Package | Training-era version | Verify at |
|---------|---------------------|-----------|
| `astro` | 4.x | https://github.com/withastro/astro/releases |
| `typescript` | 5.x | https://www.typescriptlang.org/docs/handbook/release-notes/ |
| `prettier` | 3.x | https://prettier.io/blog/ |
| `prettier-plugin-astro` | 0.13.x | https://github.com/withastro/prettier-plugin-astro |
| Node.js LTS | 20.x | https://nodejs.org/en/about/previous-releases |
## Sources
- Astro documentation (training data, August 2025): https://docs.astro.build
- Astro i18n routing guide: https://docs.astro.build/en/guides/internationalization/
- Astro Content Collections: https://docs.astro.build/en/guides/content-collections/
- Astro static output: https://docs.astro.build/en/guides/deploy/
- Confidence: HIGH for architectural choices (stable, well-established pattern); MEDIUM for exact version numbers (verify before install)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
