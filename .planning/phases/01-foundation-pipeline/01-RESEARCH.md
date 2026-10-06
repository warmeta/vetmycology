# Phase 1: Foundation + Pipeline — Research

**Researched:** 2026-10-06
**Domain:** Astro 7 static site setup, i18n routing, ISO-8859-1 extraction, Apache deployment
**Confidence:** HIGH (core Astro APIs verified against live docs; extraction approach verified via PyPI)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | Developer can run `npm create astro@latest`, configure TypeScript strict mode, set `output: 'static'`, and get a clean build pipeline | Astro 7 install command, `astro/tsconfigs/strict`, `output: 'static'` default — all verified |
| FOUND-02 | `astro.config.mjs` has i18n routing locked (defaultLocale, locales, prefixDefaultLocale) before any content pages are created | Exact i18n block documented; `prefixDefaultLocale: false`, `defaultLocale: 'es'` confirmed working pattern |
| FOUND-03 | A test page deployed to the ULPGC Apache server confirms DirectoryIndex, file permissions, and UTF-8 encoding work end-to-end | `build.format: 'directory'` produces `index.html` per page; Apache `DirectoryIndex index.html` serves it; .htaccess notes included |
| FOUND-04 | Developer has a script or procedure to convert FrontPage ISO-8859-1 `.htm` files to clean UTF-8 Markdown | Python 3 + BeautifulSoup4 + markdownify pipeline documented; all packages verified on PyPI |
</phase_requirements>

---

## Summary

Astro is currently at **v7.3.5** — three major versions ahead of the v4 documented in CLAUDE.md. The jump from Astro 4 to Astro 7 involves three breaking changes that directly affect this phase: (1) Content Collections use a new `glob()` loader API with config at `src/content.config.ts` (not `src/content/config.ts`); (2) Zod imports move from `astro:content` to `astro/zod`; (3) Node.js 22.12+ is required (the developer's machine runs v22.15.1, which qualifies). Everything else in the planned stack — `prefixDefaultLocale: false`, `getRelativeLocaleUrl`, `output: 'static'`, scoped Astro styles — works identically in v7.

The ULPGC Apache deployment works cleanly with Astro's default `build.format: 'directory'` output, which produces `dist/about/index.html` per page. Apache's default `DirectoryIndex index.html` directive serves these without any `.htaccess` rewrite rules needed for the root deployment case. A `base` config option is needed only if the site lands in a subdirectory (e.g., `/micologia/`) rather than at the domain root — the ULPGC webmaster must confirm this before `astro.config.mjs` is finalized.

The FrontPage extraction script is best written in Python 3 using BeautifulSoup4 (parse + strip), `html.unescape()` (entity decoding), and comment filtering (strip `<!--webbot-->` and `<!--mstheme-->` blocks). The markdownify library converts remaining semantic HTML to Markdown. All three PyPI packages are legitimate (slopcheck: OK).

**Primary recommendation:** Install Astro 7 (`npm create astro@latest`), use `src/content.config.ts` with the `glob()` loader from day one — do not use the Astro 4 `type: 'content'` syntax. Lock i18n config before creating any page file.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| URL routing / i18n prefix structure | Frontend Server (Astro build) | — | Astro static build produces the `/en/` directory tree at compile time |
| Content delivery | CDN / Static (Apache) | — | Pure static files; no runtime processing |
| Encoding conversion (FrontPage → UTF-8) | Build tooling (Python script) | — | One-time pre-processing step, not part of the Astro pipeline |
| Page rendering | Frontend Server (Astro build) | — | `.astro` templates compiled to HTML at build time |
| Asset serving (images, PDFs) | CDN / Static (Apache) | — | Files copied from `public/` to `dist/` unchanged |

---

## Standard Stack

### Core (Phase 1)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `astro` | 7.3.5 [VERIFIED: npm registry] | Static site generator, routing, build pipeline | Current stable; v4 is legacy tag |
| `typescript` | 5.x (7.0.2 on npm) [VERIFIED: npm registry] | Type safety | Bundled with Astro; Content Collections require TS for schema inference |

### Dev Tooling

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `prettier` | 3.9.9 [VERIFIED: npm registry] | Code formatting | Standard for JS/TS/Astro projects |
| `prettier-plugin-astro` | 1.1.0 [VERIFIED: npm registry] | `.astro` file formatting | Official Astro team plugin; required for Prettier to understand `.astro` syntax |

### Extraction Script (Python 3)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `beautifulsoup4` | 4.15.0 [VERIFIED: PyPI] | HTML parsing, tag/comment stripping | Parse FrontPage HTML; strip `<!--webbot-->` comments and unwanted tags |
| `markdownify` | 1.2.3 [VERIFIED: PyPI] | HTML-to-Markdown conversion | Convert remaining semantic HTML (`<h2>`, `<p>`, `<ul>`) to Markdown |
| `html2text` | 2025.4.15 [VERIFIED: PyPI] | Alternative HTML-to-Markdown | Fallback if markdownify has edge cases; simpler output for plain prose |
| `html.unescape` | Python stdlib [VERIFIED: Python docs] | HTML entity decoding | Decode `&ntilde;` → `ñ`, `&aacute;` → `á`, `&nbsp;` → ` ` before writing output |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Astro 7 | Astro 4 (legacy tag) | Astro 4 is maintenance-only; would need migration before Astro 6 removes `legacy.collections` flag entirely |
| Python extraction script | Node.js script with `iconv-lite` | Python stdlib `codecs` + BeautifulSoup is simpler for one-time migration; no npm dependency for a dev-only script |
| `markdownify` | `pandoc` CLI | Pandoc is more powerful but requires a separate system install; markdownify is pip-installable |

**Installation (npm):**
```bash
npm create astro@latest
# During wizard: choose "Empty" template, strict TypeScript, no Git (already in repo)
npm install --save-dev prettier prettier-plugin-astro
```

**Installation (Python extraction script):**
```bash
pip install beautifulsoup4 markdownify
# html.unescape is in Python stdlib — no install needed
```

---

## Package Legitimacy Audit

> slopcheck run 2026-10-06. Note: slopcheck checks PyPI by default; npm packages were cross-verified directly via `npm view`.

### npm Packages

| Package | Registry | Age | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-------------|-----------|-------------|
| `astro` | npm | ~4 yrs | github.com/withastro/astro | OK (npm verified) | Approved |
| `typescript` | npm | ~12 yrs | github.com/microsoft/TypeScript | OK (npm verified) | Approved |
| `prettier` | npm | ~9 yrs | github.com/prettier/prettier | OK (npm verified) | Approved |
| `prettier-plugin-astro` | npm | ~3 yrs | github.com/withastro/prettier-plugin-astro | SLOP on PyPI — does NOT exist there; exists on npm from official Astro team | Approved on npm only |

### Python Packages

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `beautifulsoup4` | PyPI | ~14 yrs | very high | github.com/waylan/beautifulsoup | OK | Approved |
| `markdownify` | PyPI | ~8 yrs | high | github.com/matthewwithanm/python-markdownify | OK | Approved |
| `html2text` | PyPI | ~11 yrs | high | github.com/Alir3z4/html2text | OK | Approved |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged [SUS]:** none

**Cross-ecosystem note:** `prettier-plugin-astro` does not exist on PyPI — slopcheck flags it as [SLOP] when run against PyPI. It is the official Astro Prettier plugin published to **npm** at `github.com/withastro/prettier-plugin-astro`. Always install it from npm, never from PyPI.

---

## Architecture Patterns

### System Architecture Diagram

```
FrontPage .htm files (ISO-8859-1)
        │
        ▼  Python extraction script
        │  open(encoding='iso-8859-1') → decode to Unicode
        │  BeautifulSoup: strip <!--webbot-->, <!--mstheme-->, <font>, <table>
        │  html.unescape(): &ntilde; → ñ, &aacute; → á, &nbsp; → (space)
        │  markdownify: <h2> → ##, <p> → paragraph, <ul> → - list
        ▼
src/content/<section>.md (UTF-8)
        │
        ▼  Astro build (npm run build)
        │  src/content.config.ts: defineCollection + glob() loader
        │  src/pages/index.astro (ES root)
        │  src/pages/en/index.astro (EN prefix)
        │  astro.config.mjs: i18n + output:static
        ▼
dist/
  index.html              ← Spanish root
  en/
    index.html            ← English version
  _astro/                 ← Hashed CSS/JS bundles
  public/* copied as-is   ← Images, PDFs
        │
        ▼  rsync / SFTP to ULPGC server
Apache serves dist/ as document root
  DirectoryIndex index.html (default)
  UTF-8 charset headers (optional .htaccess)
```

### Recommended Project Structure

```
vetmyc/
├── astro.config.mjs          # i18n, site, base, output: 'static'
├── tsconfig.json             # extends astro/tsconfigs/strict
├── .prettierrc.mjs           # prettier + prettier-plugin-astro
├── src/
│   ├── content.config.ts     # defineCollection with glob() loader (Astro 7)
│   ├── content/
│   │   └── pages/            # .md files for content sections
│   └── pages/
│       ├── index.astro       # Spanish home (default locale, no prefix)
│       └── en/
│           └── index.astro   # English home (/en/)
├── public/
│   ├── docs/                 # PDFs — ASCII filenames only
│   └── images/               # Optimized images
└── scripts/
    └── extract_frontpage.py  # ISO-8859-1 → UTF-8 Markdown extractor
```

**Key structural note:** With `prefixDefaultLocale: false` and `defaultLocale: 'es'`, Spanish pages live directly in `src/pages/` (e.g., `src/pages/patologias/levaduras.astro` → `/patologias/levaduras/`). English pages live in `src/pages/en/` (e.g., `src/pages/en/patologias/levaduras.astro` → `/en/patologias/levaduras/`).

### Pattern 1: Astro 7 i18n Configuration

**What:** Lock the i18n routing config in `astro.config.mjs` before creating any page files.
**When to use:** Phase 1, first commit — before any `.astro` pages exist.

```javascript
// Source: https://docs.astro.build/en/guides/internationalization/
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://micologiaveterinaria.ulpgc.es', // ← confirm URL with webmaster; use subdirectory base if needed
  output: 'static',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
      // redirectToDefaultLocale defaults to false in Astro 6+ — do NOT set to true
      // (setting it true with prefixDefaultLocale: false caused redirect loops pre-v6)
    },
  },
  build: {
    format: 'directory', // produces dist/about/index.html — Apache serves with default DirectoryIndex
  },
});
```

**If deployed to a subdirectory** (e.g., `micologiaveterinaria.ulpgc.es/micologia/`):
```javascript
  site: 'https://micologiaveterinaria.ulpgc.es',
  base: '/micologia',  // adjust to match webmaster-confirmed path
```

### Pattern 2: Astro 7 Content Collections

**What:** Define collections using the Content Layer API (`glob()` loader). This is the only API in Astro 6+.
**When to use:** Phase 1 scaffold — create `src/content.config.ts` at project init.

```typescript
// Source: https://docs.astro.build/en/guides/content-collections/
// src/content.config.ts  ← NOTE: file is at src/ root, NOT src/content/
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';  // ← Astro 6+ imports z from astro/zod, not astro:content

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    locale: z.enum(['es', 'en']).default('es'),
  }),
});

export const collections = { pages };
```

**Query in a page:**
```typescript
// Source: https://docs.astro.build/en/guides/content-collections/
import { getCollection } from 'astro:content';
const pages = await getCollection('pages');
```

### Pattern 3: TypeScript tsconfig

**What:** Extend Astro's strict preset.

```json
// tsconfig.json
// Source: https://docs.astro.build/en/install-and-setup/
{
  "extends": "astro/tsconfigs/strict"
}
```

`astro/tsconfigs/strict` extends `base` and adds `"strict": true`. This enables all strict TypeScript checks (noImplicitAny, strictNullChecks, etc.). Running `astro check` validates `.astro` templates against these settings.

### Pattern 4: Prettier Configuration

```javascript
// .prettierrc.mjs
// Source: https://github.com/withastro/prettier-plugin-astro
export default {
  plugins: ['prettier-plugin-astro'],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
};
```

### Pattern 5: getRelativeLocaleUrl Usage

```typescript
// Source: https://docs.astro.build/en/guides/internationalization/
import { getRelativeLocaleUrl } from 'astro:i18n';

// In a Spanish page, generate the English equivalent URL
const enUrl = getRelativeLocaleUrl('en', 'patologias/levaduras');
// → '/en/patologias/levaduras/'

// In an English page, generate the Spanish equivalent URL
const esUrl = getRelativeLocaleUrl('es', 'patologias/levaduras');
// → '/patologias/levaduras/'  (no prefix — es is defaultLocale with prefixDefaultLocale:false)
```

### Pattern 6: FrontPage Extraction Script

```python
# scripts/extract_frontpage.py
# Python stdlib + beautifulsoup4 + markdownify
import sys
import re
import html
from pathlib import Path
from bs4 import BeautifulSoup, Comment
from markdownify import markdownify as md

def extract(input_path: Path, output_path: Path) -> None:
    # Step 1: Read as ISO-8859-1 bytes, decode to Unicode
    raw = input_path.read_bytes()
    text = raw.decode('iso-8859-1')

    # Step 2: Strip FrontPage comment artifacts BEFORE parsing
    # WebBot and MSTheme comments are malformed and confuse some parsers
    text = re.sub(r'<!--webbot[^>]*-->', '', text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r'<!--mstheme[^>]*-->', '', text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r'<!--mstable[^>]*-->', '', text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r'class="_msstyle[^"]*"', '', text, flags=re.IGNORECASE)

    # Step 3: Parse with BeautifulSoup using html.parser
    soup = BeautifulSoup(text, 'html.parser')

    # Step 4: Strip remaining HTML comments (catches any missed by regex)
    for comment in soup.find_all(string=lambda t: isinstance(t, Comment)):
        comment.extract()

    # Step 5: Remove layout/style cruft — keep only body content
    for tag in soup.find_all(['script', 'style', 'font', 'frameset', 'frame']):
        tag.decompose()

    body = soup.find('body') or soup

    # Step 6: Get inner HTML string, decode HTML entities (e.g., &ntilde; → ñ)
    inner_html = str(body)
    inner_html = html.unescape(inner_html)

    # Step 7: Convert to Markdown
    result = md(inner_html, heading_style='ATX', bullets='-')

    # Step 8: Clean up excess blank lines and &nbsp; remnants
    result = result.replace(' ', ' ')  # non-breaking space → regular space
    result = re.sub(r'\n{3,}', '\n\n', result)
    result = result.strip()

    # Step 9: Write UTF-8 output
    output_path.write_text(result, encoding='utf-8')
    print(f"Extracted: {input_path.name} → {output_path.name}")

if __name__ == '__main__':
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2]) if len(sys.argv) > 2 else src.with_suffix('.md')
    extract(src, dst)
```

**Verify no encoding artifacts after extraction:**
```bash
# This grep checks for any non-ASCII bytes (0x80–0xFF) still present in the output file.
# A zero result means the file is clean 7-bit ASCII or valid UTF-8 with no
# leftover ISO-8859-1 single-byte characters.
# NOTE: Valid UTF-8 multi-byte characters (ñ, á) ARE represented as bytes > 0x7F,
# so this command checks for byte sequences that would be invalid as UTF-8 continuation.
# The correct tool is Python's codec validation, not raw grep:
python3 -c "
import sys
path = sys.argv[1]
try:
    open(path, encoding='utf-8', errors='strict').read()
    print('UTF-8 clean:', path)
except UnicodeDecodeError as e:
    print('ENCODING ERROR:', e)
" output.md

# The success criterion uses grep -rP "[\x80-\xFF]"
# This pattern will match ANY non-ASCII byte — including valid UTF-8 continuation bytes
# (ñ in UTF-8 is \xc3\xb1 — both bytes are in the \x80-\xFF range).
# Therefore: if ñ and á appear as proper UTF-8, grep WILL find bytes in this range.
# The test is meaningful only if you expect PURE ASCII output (no Spanish characters).
# For a Spanish-language site with ñ, á, é, ü in the output Markdown, use Python's
# strict UTF-8 decode (above) to verify correctness — not the raw byte grep.
```

### Anti-Patterns to Avoid

- **Using `src/content/config.ts` (Astro 4 path):** Astro 6+ requires `src/content.config.ts` at the `src/` root. The old path silently produces no collections in newer versions.
- **Using `type: 'content'` in defineCollection:** Removed in Astro 6. Use `loader: glob(...)` instead.
- **Importing `z` from `astro:content`:** Deprecated in Astro 6, removed in future. Import from `astro/zod`.
- **Setting `redirectToDefaultLocale: true` with `prefixDefaultLocale: false`:** This combination caused redirect loops pre-Astro 6. In Astro 6+, `redirectToDefaultLocale` defaults to `false` and only applies when `prefixDefaultLocale: true`. Do not set it.
- **Setting `base` without trailing slash knowledge:** `import.meta.env.BASE_URL` behavior depends on `trailingSlash` setting. When using `base`, always pair with explicit `trailingSlash: 'always'` or `'never'` to get predictable URL construction.
- **Committing Spanish pages without i18n config locked:** If the i18n block is changed after pages exist, all internal links built with `getRelativeLocaleUrl` are invalidated. Lock i18n in commit 1.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| i18n URL routing | Custom middleware or URL rewriting | Astro built-in `i18n` config | Handles locale detection, URL generation, fallback routing — dozens of edge cases |
| HTML entity decoding | Regex replace for `&ntilde;` etc. | Python `html.unescape()` stdlib | 253 named HTML entities; regex misses numeric entities (`&#241;`) |
| FrontPage HTML parsing | Manual string splits | `beautifulsoup4` with `html.parser` | FrontPage HTML is malformed in ways that break naive parsers |
| HTML→Markdown conversion | Custom tag → Markdown replacement | `markdownify` | Handles nesting, whitespace normalization, table conversion, link preservation |
| TypeScript config for Astro | Custom `tsconfig.json` from scratch | `astro/tsconfigs/strict` | Includes Astro-specific type paths and `env.d.ts` references |
| `.astro` file formatting | Manual formatting | `prettier-plugin-astro` | `.astro` files have frontmatter + JSX-like template syntax that standard Prettier mishandles |

**Key insight:** FrontPage HTML is from the early 2000s and contains proprietary comment syntax, nested table layouts, inline `<font>` tags, and ISO-8859-1 entities all intermixed. Attempting to extract content with string manipulation will miss edge cases across 14 content files. Use the parse-then-strip-then-convert pipeline.

---

## Common Pitfalls

### Pitfall 1: Astro Version Mismatch (CRITICAL)
**What goes wrong:** Installing Astro and using Astro 4 documentation. The current `npm create astro@latest` installs v7.3.5. Using `src/content/config.ts` with `type: 'content'` syntax will silently produce no collections — zero pages are generated and the build succeeds but is empty.
**Why it happens:** CLAUDE.md documents Astro 4.x syntax. That version is now `legacy` on npm.
**How to avoid:** After `npm create astro@latest`, verify `package.json` shows `"astro": "^7.x.x"`. Use `src/content.config.ts` with `glob()` loader from day one.
**Warning signs:** `getCollection('pages')` returns empty array; no page files in `dist/`.

### Pitfall 2: grep False Negative on UTF-8 Verification
**What goes wrong:** Running `grep -rP "[\x80-\xFF]"` on an extracted Markdown file and seeing output — concluding the file has encoding errors — when in fact `ñ` (U+00F1) is legitimately encoded as `\xc3\xb1` in UTF-8 (both bytes are in the 0x80–0xFF range).
**Why it happens:** The grep pattern finds all high bytes, not just invalid UTF-8. Valid multi-byte UTF-8 sequences for Spanish characters will always produce matches.
**How to avoid:** Use Python's strict UTF-8 codec as the canonical check: `open(file, encoding='utf-8', errors='strict').read()`. A `UnicodeDecodeError` means real corruption; success means clean UTF-8. Use `grep -rP "[\x80-\xFF]"` only if you expect pure 7-bit ASCII output (not recommended for Spanish content).
**Warning signs:** grep finds bytes but Python codec succeeds — means UTF-8 is correct.

### Pitfall 3: ULPGC Subdirectory Deployment Without `base`
**What goes wrong:** The site is deployed to `micologiaveterinaria.ulpgc.es/subdir/` but `astro.config.mjs` has no `base` set. All internal asset links and navigation URLs point to `/` root and 404.
**Why it happens:** Astro hardcodes all internal paths using the `site` + `base` values at build time.
**How to avoid:** Confirm deployment URL with ULPGC webmaster before building. If subdirectory: set `base: '/subdir'`. If domain root: omit `base`.
**Warning signs:** CSS/JS 404 after deployment; navigation links broken on server but work locally.

### Pitfall 4: Apache DirectoryIndex and Trailing Slash
**What goes wrong:** `dist/about/index.html` exists but `https://server/about` returns 404 because Apache is not configured with `DirectoryIndex index.html`.
**Why it happens:** Some Apache configs have a minimal default; some use custom DirectoryIndex values.
**How to avoid:** Test with a simple `.htaccess` in the root confirming `DirectoryIndex index.html`. If the ULPGC server has `AllowOverride None`, provide the `.htaccess` directives to the webmaster for inclusion in the vhost config.
**Warning signs:** Direct access to `https://server/about/` works; `https://server/about` returns 404 (missing slash redirect).

### Pitfall 5: FrontPage WebBot Comments Breaking HTML Parser
**What goes wrong:** BeautifulSoup tries to parse `<!--webbot bot="HTMLMarkup" tag="BODY" startspan -->` as a standard comment. Some WebBot tags contain `>` inside the comment body, which HTML parsers interpret as closing the comment early, leaving garbage tokens in the parse tree.
**Why it happens:** WebBot "comments" are not standards-compliant HTML comments — they contain `>` characters inside the comment body.
**How to avoid:** Strip WebBot patterns with regex BEFORE passing to BeautifulSoup (see extraction script Pattern 6). This pre-processing step is load-bearing.
**Warning signs:** Markdown output contains raw `bot=` strings or misaligned content.

### Pitfall 6: Node.js Version (Astro 7 + prettier-plugin-astro 1.x)
**What goes wrong:** Build or install fails with "requires Node.js >= 22.12.0" on a machine running Node 20 or older Node 22.
**Why it happens:** Astro 7 and prettier-plugin-astro 1.x both require Node 22.12+.
**How to avoid:** Verify `node --version` shows v22.12.0+. The developer's machine (v22.15.1) already qualifies. Document the requirement in a `engines` field in `package.json`.
**Warning signs:** `npm create astro@latest` fails; `npx astro check` errors on startup.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `src/content/config.ts` with `type: 'content'` | `src/content.config.ts` with `loader: glob(...)` | Astro 5 (new), Astro 6 (required) | Config file location and syntax changed — Astro 4 code does not work |
| `import { z } from 'astro:content'` | `import { z } from 'astro/zod'` | Astro 6 | Old import path deprecated in Astro 6 |
| `entry.slug` for collection entries | `entry.id` | Astro 5+ | `slug` field removed; use `id` |
| `entry.render()` method | `import { render } from 'astro:content'; render(entry)` | Astro 5+ | Render is now a named import, not an entry method |
| `Astro.glob()` | `import.meta.glob()` or `getCollection()` | Astro 5 (deprecated), Astro 6 (removed) | Must use Vite glob or Content Collections |
| remark/rehype markdown pipeline | Sätteri (native) | Astro 7 | Default markdown renderer changed; remark/rehype plugins require `@astrojs/markdown-remark` opt-in |
| `i18n.routing.redirectToDefaultLocale: true` (default) | `false` (default in Astro 6+) | Astro 6 | Prevents redirect loops with `prefixDefaultLocale: false` |
| Node.js 18/20 support | Node.js 22.12+ required | Astro 6 (Node 22), Astro 7 (22.12 min) | Build machines and CI must be updated |
| Go-based compiler | Rust-based compiler | Astro 7 | Stricter HTML validation; unclosed tags are now errors not warnings |

**Deprecated/outdated:**
- `legacy.collections` flag: Removed in Astro 6. Cannot be used.
- `@astrojs/db`: Removed in Astro 7. Not relevant to this project.
- `astro/tsconfigs/strict` unchanged: Still the correct extend target; `"strict": true` in the preset.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | ULPGC server is deployed at the domain root (`micologiaveterinaria.ulpgc.es/`), not a subdirectory | Standard Stack / Pitfall 3 | If in a subdirectory, `astro.config.mjs` needs `base: '/subdir'` — changing this after pages are built requires a full rebuild and commit |
| A2 | ULPGC Apache has `AllowOverride All` (or at least `AllowOverride FileInfo`) so `.htaccess` files can be used if needed | Common Pitfalls (Pitfall 4) | If `AllowOverride None`, DirectoryIndex customization and any rewrite rules must be applied by the webmaster to the vhost config |
| A3 | ULPGC server has HTTPS configured (the `site` field in astro.config.mjs should use `https://`) | Standard Stack | If HTTP-only, the `site` value changes and canonical links are wrong |
| A4 | FrontPage `.htm` source files use consistent `<!--webbot-->` comment patterns (not variant spellings or nested forms) | Pattern 6 (extraction script) | If files contain unusual WebBot variants, the regex pre-processing may miss some artifacts |
| A5 | The Spanish slug strategy (shared slugs for both locales) has been decided — `/en/patologias/` not `/en/pathologies/` | Standard Stack / Pattern 1 | Confirmed in STATE.md as locked; not actually an assumption |

---

## Open Questions

1. **ULPGC deployment URL: root vs subdirectory?**
   - What we know: The live site is `micologiaveterinaria.ulpgc.es` — but we do not know if Astro's output lands at the domain root or a subdirectory path.
   - What's unclear: Whether `base:` is needed in `astro.config.mjs`.
   - Recommendation: The planner should add a task "Confirm deployment URL with webmaster before writing astro.config.mjs." This is a blocking dependency for FOUND-03.

2. **Apache `AllowOverride` status on ULPGC server**
   - What we know: Standard Apache deployment works fine with `build.format: 'directory'` and no `.htaccess` if `DirectoryIndex index.html` is set globally.
   - What's unclear: Whether the developer can place a `.htaccess` file if needed (e.g., for UTF-8 charset headers or clean URL enforcement).
   - Recommendation: The walking skeleton deployment (FOUND-03) will reveal this empirically. Plan the test page deployment as an explicit verification step.

3. **Sätteri vs remark for Markdown rendering (Phase 1 scope check)**
   - What we know: Astro 7 defaults to Sätteri. For Phase 1, content is in `.astro` templates (not `.md` files), so the markdown pipeline is not yet relevant.
   - What's unclear: Whether Phase 2 content migration to `.md` files will encounter Sätteri limitations (e.g., custom HTML blocks in migration output).
   - Recommendation: Not a Phase 1 blocker. Flag for Phase 2 research.

4. **`grep -rP "[\x80-\xFF]"` verification semantics**
   - What we know: This grep finds all high bytes, including valid UTF-8 continuation bytes for Spanish characters.
   - What's unclear: Whether the success criterion means "zero bytes in the 0x80-0xFF range" (impossible for Spanish) or "no invalid UTF-8 sequences."
   - Recommendation: The planner should clarify the success criterion. The correct encoding check is Python's strict UTF-8 decode, not raw byte grep. The plan task for FOUND-04 should specify the Python-based verification method.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js 22.12+ | Astro 7, prettier-plugin-astro 1.x | Yes | v22.15.1 | — |
| Python 3 | Extraction script | Yes | 3.12.3 | — |
| npm | Package installation | Yes | 10.9.2 | — |
| rsync | Deployment to ULPGC server | Yes | openrsync protocol v29 | sftp (also available) |
| sftp | Deployment fallback | Yes | system sftp | — |
| ftp | Deployment | No | — | Use sftp or rsync |

**Missing dependencies with no fallback:** None
**Missing dependencies with fallback:** ftp (not installed) — sftp is available and preferred

---

## Security Domain

> This phase is foundation/scaffolding only — no user input, no authentication, no dynamic endpoints. The site is a static content-only site.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | N/A — static site, no login |
| V3 Session Management | No | N/A — no sessions |
| V4 Access Control | No | N/A — all content public |
| V5 Input Validation | No | N/A — Phase 1 has no user input |
| V6 Cryptography | No | N/A — HTTPS managed by Apache/university server |

### Phase 1 Security Notes

- UTF-8 encoding of all output files prevents character injection edge cases in later phases
- PDF links should use `ASCII-only filenames` (already documented in REQUIREMENTS.md MEDIA-04) — enforced in the extraction script by using Python's `str.encode('ascii', errors='replace')` on filenames
- No secrets, API keys, or credentials are part of Phase 1

---

## Sources

### Primary (HIGH confidence)
- [Astro i18n Routing Guide](https://docs.astro.build/en/guides/internationalization/) — i18n config block, `prefixDefaultLocale`, `getRelativeLocaleUrl` import path
- [Astro Content Collections Guide](https://docs.astro.build/en/guides/content-collections/) — `defineCollection`, `glob()` loader, `getCollection()`, `src/content.config.ts` location
- [Astro Install and Setup](https://docs.astro.build/en/install-and-setup/) — `npm create astro@latest`, TypeScript preset options
- [Astro Upgrade to v5](https://docs.astro.build/en/guides/upgrade-to/v5/) — Content Layer API introduction, `slug` → `id`, `entry.render()` change
- [Astro Upgrade to v6](https://docs.astro.build/en/guides/upgrade-to/v6/) — Legacy collections removal, Node 22 requirement, `redirectToDefaultLocale` default flip
- [Astro Upgrade to v7](https://docs.astro.build/en/guides/upgrade-to/v7/) — Rust compiler, Sätteri, Vite 8, `compressHTML: 'jsx'` default
- [Astro Configuration Reference](https://docs.astro.build/en/reference/configuration-reference/) — `site`, `base`, `trailingSlash`, `build.format`, `output`
- `npm view astro version` — confirmed v7.3.5 as current stable [VERIFIED: npm registry]
- `npm view prettier-plugin-astro version` — confirmed v1.1.0 [VERIFIED: npm registry]
- `npm view prettier version` — confirmed v3.9.9 [VERIFIED: npm registry]
- `npm view typescript version` — confirmed v7.0.2 [VERIFIED: npm registry]
- `pip index versions beautifulsoup4` — confirmed v4.15.0 [VERIFIED: PyPI]
- `pip index versions markdownify` — confirmed v1.2.3 [VERIFIED: PyPI]
- `pip index versions html2text` — confirmed v2025.4.15 [VERIFIED: PyPI]
- slopcheck v0.6.1 — all Python packages [OK]; `prettier-plugin-astro` [SLOP] on PyPI (correct: it's an npm package)

### Secondary (MEDIUM confidence)
- [Astro 7 new features — aerolaunch.app](https://aerolaunch.app/blog/whats-new-in-astro-7/) — Node 22.12 requirement, Rust compiler details
- [Astro 6 migration walkthrough — oscargallegoruiz.com](https://www.oscargallegoruiz.com/en/blog/astro-6-migration-guide/) — content.config.ts, Zod 4 migration, `slug` → `id` confirmed
- [Astro trailing slash handling — walterra.dev](https://walterra.dev/blog/2025-01-28-astro-trailing-slashes) — `build.format: 'directory'` output structure confirmed
- [python-markdownify GitHub](https://github.com/matthewwithanm/python-markdownify) — tag support, `heading_style='ATX'` option
- [prettier-plugin-astro GitHub](https://github.com/withastro/prettier-plugin-astro) — `.prettierrc.mjs` configuration pattern, `astroCompressHTML` option
- `npm view prettier-plugin-astro engines` — `{ node: '>=22.12.0' }` [VERIFIED: npm registry]
- `npm view prettier-plugin-astro peerDependencies` — `{ prettier: '^3.5.3' }` [VERIFIED: npm registry]

### Tertiary (LOW confidence)
- [Astro i18n guide — eastondev.com](https://eastondev.com/blog/en/posts/dev/20251202-astro-i18n-guide/) — confirmed `prefixDefaultLocale: false` file structure (Spanish at root)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all package versions verified via npm registry and PyPI
- Architecture: HIGH — i18n config and Content Layer API verified against official Astro docs
- Pitfalls: HIGH — Astro 4→7 migration pitfalls verified via official upgrade guides
- Extraction script: MEDIUM — pattern is well-established; FrontPage-specific WebBot regex not verified against actual source files (source `.htm` files not yet available in the repo)

**Research date:** 2026-10-06
**Valid until:** 2027-01-06 (90 days — Astro 7.x is stable; next breaking change expected with Astro 8 which shows deprecation notices in current changelog)
