# Technology Stack

**Project:** VetMyc — Veterinary Mycology Website Modernization
**Researched:** 2026-10-01
**Confidence:** HIGH for framework choices (well-established Astro static site pattern); MEDIUM for exact versions (verify before install)

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Astro | ^4.x (verify) | Static site generator, page routing, content collections | Zero JS by default, built-in i18n routing, markdown-native, produces pure static HTML/CSS/JS — perfect fit for a content-only academic site with no dynamic features |
| Node.js | 20 LTS (verify) | Build-time only — not deployed | Required to run Astro build tooling locally; never touches the ULPGC server |

**Why Astro over alternatives:**
- Ships zero client-side JavaScript unless you explicitly add it — academic content site needs none
- Content Collections API gives typed, file-system markdown with frontmatter validation
- Built-in i18n routing (`/es/`, `/en/`) without a third-party library
- `output: 'static'` produces a pure `dist/` folder deployable to any Apache/Nginx host
- Vite underneath for fast local dev

**Why not Next.js / Nuxt / SvelteKit:** All require a Node.js runtime on the server or a serverless platform. ULPGC runs a standard university web server. Static export modes in those frameworks are bolted on; in Astro it is the default and first-class.

**Why not Hugo / Eleventy:** Astro has better built-in i18n routing and a component model that makes a bilingual nav/layout easier to reason about than Hugo templates. Eleventy is viable but has less opinionated i18n support.

---

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Plain CSS (scoped Astro styles) | N/A | Layout, typography, responsive design | No build overhead, no class-name mental tax, scoped styles prevent bleed between components, zero runtime |
| CSS Custom Properties | N/A | Theme tokens (colors, spacing, fonts) | Native browser feature, no dependency, easy to maintain |

**Why not Tailwind CSS:** For a 14-section academic content site maintained by a developer (not a design team), utility-class HTML becomes harder to read when the content itself is in markdown. Scoped `<style>` blocks in Astro components are cleaner and easier to hand off. Tailwind is not wrong — just unnecessary complexity here.

**Why not CSS Modules / CSS-in-JS:** Astro's scoped `<style>` tags compile to the same output as CSS Modules with less boilerplate. CSS-in-JS has runtime cost by definition — ruled out.

---

### Internationalization (i18n)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Astro built-in i18n routing | ^4.x (included) | `/es/` and `/en/` URL prefixes, locale detection, routing helpers | Astro 4.x shipped first-class i18n with `i18n.locales`, `i18n.defaultLocale`, and `getRelativeLocaleUrl()` — no extra library needed |
| JSON translation files | N/A | UI strings (nav labels, footer text, meta descriptions) | Simple key-value files per locale for the ~30 UI strings that are not in content markdown |

**i18n architecture decision:** Content lives in separate markdown files per locale (`/src/content/es/` and `/src/content/en/`). This is simpler than a single file with translated fields — each file is the authoritative content for its language, easier for the developer to edit, and avoids coupling Spanish and English edits together.

**Why not `astro-i18next` or similar:** The built-in routing in Astro 4 handles the URL structure. A translation library adds abstraction on top of what JSON files already solve cleanly for ~30 strings.

---

### Content Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Astro Content Collections | ^4.x (included) | Typed markdown content, frontmatter validation | Provides a schema per collection (`zod`-based), file-system routing, type-safe content queries — catches missing fields at build time |
| Markdown | N/A | All 14 content section bodies | Human-readable, git-diffable, no CMS required, developer-editable |
| MDX | optional | Rich content sections with embedded image grids or tables | MDX lets you use Astro components inside markdown — useful for the image archive section; add only if needed |

**Content Collections structure recommendation:**
```
src/content/
  config.ts          ← Zod schemas per collection
  pages/
    es/
      home.md
      micologia.md
      ... (14 files)
    en/
      home.md
      micologia.md
      ... (14 files)
```

---

### Assets

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Astro built-in image optimization | ^4.x (included) | `<Image>` component, WebP conversion, lazy loading | Zero-config image pipeline; the image archive section has many photos — WebP conversion cuts page weight significantly |
| Static `public/` directory | N/A | PDFs, original images not needing optimization | Files in `public/` copy to `dist/` unchanged — PDFs and legacy images go here |

---

### Development Tooling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| TypeScript | ^5.x (verify) | Type safety for content schemas and component props | Astro projects default to TypeScript; Content Collections require it for schema inference |
| Prettier | ^3.x (verify) | Code formatting | Standard; Astro has an official Prettier plugin (`prettier-plugin-astro`) |
| `prettier-plugin-astro` | latest (verify) | `.astro` file formatting in Prettier | Official plugin from the Astro team |
| `astro check` | included with Astro | TypeScript type-checking for `.astro` files | Catches type errors in templates at build time |

**No linter (ESLint) recommendation:** ESLint adds meaningful value in large JS codebases with teams. For a solo-developer static content migration, the overhead (config, plugin versions, false positives) outweighs benefit. `astro check` + TypeScript strict mode catches real errors. Revisit if the project grows.

---

### Deployment

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `astro build` output | N/A | Static `dist/` folder | Produces self-contained HTML/CSS/JS deployable via FTP or `rsync` |
| `rsync` or FTP client | system | Deploy `dist/` to ULPGC server | Standard for university servers; no CI/CD pipeline needed for a 14-page academic site |

**No CI/CD recommendation for v1:** The site is maintained by one developer. A GitHub Actions pipeline for a university FTP deploy adds maintenance burden with little gain. Build locally, verify, deploy manually. Revisit if multiple contributors join.

---

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

---

## Installation

```bash
# Create new Astro project (verify exact version before running)
npm create astro@latest vetmyc -- --template minimal --typescript strict --no-git --install

# Add official Prettier plugin for Astro formatting
npm install -D prettier prettier-plugin-astro

# Optional: MDX support (add only if image archive section needs it)
npx astro add mdx
```

**Verify before install:**
- Check `npm create astro@latest` for current Astro major version
- Confirm `prettier-plugin-astro` supports the Astro version you install
- Node.js 20 LTS is the recommended build runtime; confirm it is available locally

---

## Key Version Flags

The following must be verified at install time — versions noted are based on training data through August 2025 and may have advanced:

| Package | Training-era version | Verify at |
|---------|---------------------|-----------|
| `astro` | 4.x | https://github.com/withastro/astro/releases |
| `typescript` | 5.x | https://www.typescriptlang.org/docs/handbook/release-notes/ |
| `prettier` | 3.x | https://prettier.io/blog/ |
| `prettier-plugin-astro` | 0.13.x | https://github.com/withastro/prettier-plugin-astro |
| Node.js LTS | 20.x | https://nodejs.org/en/about/previous-releases |

---

## Sources

- Astro documentation (training data, August 2025): https://docs.astro.build
- Astro i18n routing guide: https://docs.astro.build/en/guides/internationalization/
- Astro Content Collections: https://docs.astro.build/en/guides/content-collections/
- Astro static output: https://docs.astro.build/en/guides/deploy/
- Confidence: HIGH for architectural choices (stable, well-established pattern); MEDIUM for exact version numbers (verify before install)
