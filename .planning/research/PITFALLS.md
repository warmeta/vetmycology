# Pitfalls Research — VetMyc Migration

**Domain:** FrontPage-to-Astro migration, bilingual academic static site
**Researched:** 2026-10-01
**Overall confidence:** HIGH for encoding, Apache, and Astro core behaviour. LOW for exact Astro i18n API option names (verify live) and ULPGC-specific server config (must confirm with webmaster).

---

## Critical Pitfalls

### 1. Encoding corruption during content extraction

**What goes wrong:** The `.htm` files declare `charset=iso-8859-1`. Any tool that opens them assuming UTF-8 silently mangles every Spanish special character. `patógeno` becomes `patÃ³geno`. You may not notice until after deployment.

**Warning signs:**
- Source files have `<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">`
- Multi-byte artifacts (`Ã³`, `Ã±`, `Ã¡`) appear in extracted text
- `grep -rP "[\x80-\xFF]" src/content/` returns hits after conversion (should return zero)

**Prevention:**
- Read every source file explicitly as `latin-1` (Python: `open(f, encoding='latin-1')`)
- Decode HTML entities (`&ntilde;` → `ñ`, `&aacute;` → `á`) **before** stripping tags
- Strip all `&nbsp;` layout spacers — FrontPage used them prolifically; they survive as non-breaking space bytes and break word-wrap
- Run a post-conversion byte check before committing any content

**Phase to address:** Phase 1 — content extraction, before any markdown is committed

---

### 2. Spaces in source filenames break routing on Linux

**What goes wrong:** `patologias por levaduras.htm` exists on macOS (case-insensitive, space-tolerant). The ULPGC Apache server runs Linux (case-sensitive, space-literal). Build passes locally but 404s on deployment.

**Warning signs:**
- `find . -name "* *"` in the source tree returns results
- `href` attributes contain literal spaces rather than `%20`

**Prevention:**
- Normalize all output filenames at extraction time: spaces → hyphens, lowercase everything
- Lock a slug convention before migration begins: `patologias-por-levaduras`
- Apply same normalization to image files and PDFs
- Final `find dist/ -name "* *"` check after every build

**Phase to address:** Phase 1 — immediately at extraction/normalization

---

### 3. Frameset architecture means no self-contained page to extract

**What goes wrong:** `index.htm` is `<frameset>` only — no body content. Content lives in inner frame files that are body fragments without `<title>` tags or metadata. Extracting `index.htm` gives nothing.

**Warning signs:**
- `index.htm` has `<frameset cols="201,*">` and no `<body>`
- Content files have no `<title>` or all share the same generic title
- Some content files are raw body fragments without `<html>` and `<head>`

**Prevention:**
- Map the frameset topology first: parse every `<frame src="">` attribute recursively
- Treat the navigation frame (left sidebar) as the sitemap — it defines the 14 sections
- Assign page titles, slugs, and metadata manually during migration
- Expect some frame files to contain sub-frames; audit depth before counting total pages

**Phase to address:** Phase 1 — audit before extraction begins

---

### 4. FrontPage WebBot comments and theme artifacts survive into markdown

**What goes wrong:** FrontPage embeds proprietary comments: `<!--webbot bot="Navigation" ...-->`, `<!--mstheme-->`, `_msstyle` class hooks. If these survive into markdown, they render as visible artifacts or inject unstyled class names.

**Warning signs:**
- Source HTML contains strings `webbot`, `mstheme`, `_msstyle`, `msnormal`

**Prevention:**
- `grep -r "webbot\|mstheme\|_msstyle\|msnormal"` across all source files before extraction
- Strip these during HTML-to-markdown conversion, not as a cleanup pass afterward
- The FrontPage `Timestamp` WebBot contains the last-modification date — capture manually as `lastUpdated` frontmatter

**Phase to address:** Phase 1 — during extraction, not after

---

### 5. Astro `base` and `site` misconfiguration silently breaks all assets

**What goes wrong:** If the site is hosted under a subdirectory path rather than the domain root, all Astro-generated asset paths (`/_astro/...`) break. The symptom is an HTML page that loads but is completely unstyled.

**Warning signs:**
- Site renders locally but shows unstyled on the server
- DevTools Network tab shows `/_astro/*.css` returning 404

**Prevention:**
- Confirm the exact deployment URL with the ULPGC webmaster before writing `astro.config.mjs`
- Set `site: 'https://micologiaveterinaria.ulpgc.es'` from the start
- If deployed under a path: set `base: '/vetmyc'`
- Verify built `dist/` output with a local static server (`npx serve dist`) before every deployment

**Phase to address:** Phase 1 — project setup, before any page is built

---

### 6. i18n `prefixDefaultLocale` wrong direction bakes in the wrong URL structure permanently

**What goes wrong:** Astro i18n routing offers two shapes:
- `prefixDefaultLocale: false` → Spanish at `/micologia/`, English at `/en/mycology/`
- `prefixDefaultLocale: true` → Spanish at `/es/micologia/`, English at `/en/mycology/`

Choosing wrong and deploying creates a URL structure you cannot change without a full rebuild and 301 redirect chain.

**Prevention:**
- Decide the URL shape before writing any content
- For a primarily-Spanish site: `prefixDefaultLocale: false` (Spanish at root)
- Verify i18n routing with a production build (`astro build`), not just `astro dev`
- Lock this config before content migration begins

**Phase to address:** Phase 1 — project setup

---

### 7. Missing images discovered only after deployment

**What goes wrong:** FrontPage content files reference images with relative paths like `../imagenes/foto1.jpg`. Relative depth was correct inside the frameset; it's not correct when the file is treated as standalone. Some images may no longer exist in the source tree. Astro's build does not validate image paths inside markdown prose.

**Warning signs:**
- `<img src="../imagenes/...">` patterns in content HTML
- Built site passes `astro build` with no errors but shows broken image tiles on server

**Prevention:**
- Before extraction: resolve every `<img src>` path to an absolute filesystem path and verify it exists
- Catalog every referenced image; note any that are missing in source
- Consolidate all images into `public/images/` — eliminates relative-path depth errors
- After building `dist/`, run a link-checker before every deployment

**Phase to address:** Phase 1 — asset audit; Phase 3 — post-build verification

---

### 8. PDF filename with accented characters breaks download headers

**What goes wrong:** A PDF with an accented filename (e.g., `currículum.pdf`) may garble the filename in the Apache `Content-Disposition` header or fail during rsync to Linux server.

**Prevention:**
- Rename all PDFs to ASCII-only slugs at migration time: `curriculum-vitae.pdf`
- Place all PDFs in `public/docs/`
- Test PDF download on the live server before announcing the site

**Phase to address:** Phase 2 — asset migration

---

## Encoding & Content Extraction

### ISO-8859-1 to UTF-8 Migration Specifics

**The core rule:** Read with `latin-1`, write as UTF-8. No tool should ever see the source file under an encoding it was not declared as.

**Python pattern:**
```python
with open('source.htm', encoding='latin-1') as f:
    content = f.read()
with open('output.md', encoding='utf-8', mode='w') as f:
    f.write(converted_content)
```

**Node.js pattern:** `fs.readFileSync('source.htm', { encoding: 'latin1' })` → process → `fs.writeFileSync('output.md', result, { encoding: 'utf8' })`.

**HTML entity pipeline order matters:**
1. Read bytes as `latin-1`
2. Decode HTML entities (`&ntilde;` → `ñ`) — do this **before** stripping tags
3. Strip HTML tags
4. Strip/replace `&nbsp;` layout spacers
5. Write result as UTF-8

If you strip tags before decoding entities, entity strings survive as literal prose text.

**Verification:** `grep -rP "[\x80-\xFF]" src/content/` must return zero results after conversion.

---

## URL Strategy

### Old URLs vs New — Recommendation

The old site's URL structure has near-zero SEO value. The frameset architecture made deep-linking practically impossible (browser URL never updated past `index.htm`). Last updated 2013. No significant external backlinks to preserve.

**Recommendation: use clean semantic Spanish slugs, do not attempt URL preservation.**

Slug conventions:
- Spanish: lowercase, hyphens, no accents in URL path segments
  - `/micologia/`, `/patologias-levaduras/`, `/laboratorio-diagnostico/`
- English mirrors under `/en/`: `/en/mycology/`, `/en/yeast-pathologies/`
- Slugs are ASCII-safe — accents in URL paths cause inconsistencies across browsers

**Minimal redirects worth adding:**
```apache
Redirect 301 /index.htm /
Redirect 301 /micologia.htm /micologia/
```
Covers cached bookmarks. Costs nothing. Requires confirming `.htaccess` is honoured.

---

## Deployment Gotchas

### University Apache Server Specifics

**1. `.htaccess` may be silently disabled.** University servers frequently set `AllowOverride None`. All `.htaccess` directives are silently ignored — no error, no log entry. Ask the ULPGC webmaster explicitly: "Is `AllowOverride All` enabled for `micologiaveterinaria.ulpgc.es`?"

**2. `mod_dir` trailing slash behaviour.** Astro generates `dist/micologia/index.html`. Apache's `mod_dir` must be active to serve this at `/micologia/`. Test: `curl -I https://micologiaveterinaria.ulpgc.es/micologia/` should return 200.

**3. File permissions after upload.** SSH/rsync often results in files with mode `600` (owner-read only), not readable by Apache. After deployment: `chmod -R 644 dist/` and `chmod -R 755 dist/*/`.

**4. HTTPS in `site` config.** If the server enforces HTTPS (likely for ULPGC), `site` must be `https://...` not `http://`. An `http://` mismatch produces duplicate-content signals and mixed-content warnings.

**5. Avoid server-side language detection if `.htaccess` may be disabled.** `Accept-Language`-based redirects require `mod_rewrite` and `AllowOverride`. A safer approach: implement language choice in a small client-side script on the root landing page.

---

## i18n Pitfalls

### Common Mistakes in Bilingual Astro Sites

**1. No explicit link between ES and EN versions of the same page.** Without a `translationKey` frontmatter field, the language switcher cannot resolve which EN page to navigate to from the current ES page.

Pattern that works:
```
src/content/es/patologias-levaduras.md   # translationKey: yeast-pathogens
src/content/en/yeast-pathologies.md       # translationKey: yeast-pathogens
```

**2. Language switcher links to 404 on untranslated pages.** During phased migration, some Spanish pages won't have English counterparts yet. The switcher must check for translation existence and fall back to the EN homepage.

**3. Hardcoded Spanish copy in shared components.** Navigation labels, button text, and UI chrome hardcoded in Spanish appear in Spanish on EN pages. Create a translation dictionary (`t('nav.home')`) before writing any UI text.

**4. Missing `hreflang` or wrong `x-default`.** For an academic site indexed by Google Scholar, `hreflang` matters. `x-default` should point to the Spanish URL.

**5. Testing only the default locale during development.** `astro dev` shows the default locale. EN routing and EN switching go untested unless you explicitly navigate to `/en/` routes.

**6. Content drift between ES and EN.** Spanish is the source of truth; English is AI-translated. Every Spanish edit without a corresponding EN update creates drift.
- Store `lastUpdated` frontmatter in every file
- Mismatch between ES and EN `lastUpdated` is a visible warning sign
- Freeze ES per phase before translating, commit ES + EN together

---

## Phase-Specific Warning Summary

| Phase | Likely Pitfall | Mitigation |
|-------|---------------|------------|
| Source audit | Frameset depth; sub-frames | Recurse all `<frame src="">` before counting pages |
| Content extraction | ISO-8859-1 corruption | Enforce `latin-1` read + UTF-8 write; byte-check output |
| Filename normalization | Spaces break Linux | `find . -name "* *"` before migration; normalize at extraction |
| Project setup | `base` path wrong | Confirm server deployment path with admin before config |
| i18n routing setup | Wrong `prefixDefaultLocale` | Decide URL shape, test build output, lock before content migration |
| Content extraction | WebBot / `&nbsp;` artifacts | Strip at extraction time; grep output before committing |
| Asset migration | Missing source images | Audit all `<img src>` before extraction; link-check build |
| EN translation | AI translations drift from ES | Freeze ES per phase; use `translationKey` + `lastUpdated` |
| Apache deployment | `.htaccess` ignored silently | Confirm `AllowOverride` with admin; test with trivial rule first |
| Apache deployment | Old `.htm` coexists with new `.html` | Remove old files on deploy |
| PDF serving | Accented filename garbled | Rename all PDFs to ASCII slugs before migration |
| Language switcher | 404 when EN translation doesn't exist | Check translation existence; fall back to EN homepage |
| Component copy | Spanish hardcoded in shared UI | Create translation dictionary before writing any UI text |
