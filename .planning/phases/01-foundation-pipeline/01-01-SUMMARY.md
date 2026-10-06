---
phase: 01-foundation-pipeline
plan: 01
subsystem: infra
tags: [astro, astro7, typescript, prettier, i18n, content-collections, utf-8, static-site]

# Dependency graph
requires: []
provides:
  - Astro 7 project scaffold with TypeScript strict mode and Prettier
  - Locked i18n routing (es at /, en under /en/, prefixDefaultLocale:false) in astro.config.mjs
  - Content Collections scaffold at src/content.config.ts with glob() loader (Astro 7 API)
  - Spanish test page at / and English test page at /en/ — both UTF-8 clean
  - scripts/verify-build.mjs acceptance test that exits 0 after build
  - FOUND-01 and FOUND-02 satisfied at build-pipeline level
affects: [02-foundation-pipeline, 03-english-i18n, 04-polish-launch]

# Tech tracking
tech-stack:
  added:
    - astro@^7.3.6
    - "@astrojs/check"
    - typescript@^6
    - prettier@^3
    - prettier-plugin-astro@^1
  patterns:
    - "i18n locked in astro.config.mjs before any content pages — prevents re-linking later"
    - "Content Collections at src/content.config.ts (Astro 7 path) with glob() loader"
    - "UTF-8 validation via TextDecoder('utf-8', { fatal: true }) — NOT grep"
    - "build.format:directory produces dist/<page>/index.html for Apache DirectoryIndex"

key-files:
  created:
    - astro.config.mjs
    - package.json
    - package-lock.json
    - tsconfig.json
    - .prettierrc.mjs
    - .gitignore
    - src/content.config.ts
    - src/content/pages/.gitkeep
    - src/pages/index.astro
    - src/pages/en/index.astro
    - scripts/verify-build.mjs
  modified: []

key-decisions:
  - "Astro 7.3.6 installed (not Astro 4 documented in CLAUDE.md) — CLAUDE.md stack section is legacy"
  - "i18n block locked: defaultLocale:'es', locales:['es','en'], routing.prefixDefaultLocale:false — Spanish at root, English under /en/"
  - "redirectToDefaultLocale NOT set — defaults to false in Astro 6+; setting true with prefixDefaultLocale:false causes redirect loops"
  - "base NOT set in astro.config.mjs — webmaster confirmation pending (handled in Plan 02)"
  - "src/content.config.ts at src/ root — NOT src/content/config.ts (Astro 4 path silently fails)"
  - "z imported from astro/zod — NOT astro:content (deprecated in Astro 6)"
  - "UTF-8 verification uses TextDecoder({fatal:true}) — not grep -rP [\x80-\xFF] which false-positives on valid Spanish UTF-8"
  - "@astrojs/check dev dep added (not auto-installed by scaffold) to enable npx astro check"

patterns-established:
  - "Pattern: Astro 7 project scaffold — npm create astro@latest creates subdirectory when cwd is non-empty; files must be manually relocated"
  - "Pattern: Content Collections glob loader — loader: glob({ pattern: '**/*.md', base: './src/content/pages' })"
  - "Pattern: i18n-safe page structure — src/pages/ for Spanish (default locale), src/pages/en/ for English"

requirements-completed: [FOUND-01, FOUND-02]

# Metrics
duration: 4min
completed: 2026-10-06
---

# Phase 01 Plan 01: Walking Skeleton — Astro 7 Scaffold + i18n + UTF-8 Build Pipeline

**Astro 7 static site scaffolded with TypeScript strict, locked i18n routing (es at /, en at /en/), Content Collections glob() API, and a walking-skeleton acceptance test that verifies UTF-8 Spanish characters render cleanly from build to dist/**

## Performance

- **Duration:** 4 min
- **Started:** 2026-10-06T16:01:24Z
- **Completed:** 2026-10-06T16:05:39Z
- **Tasks:** 3 (TDD: RED + GREEN flow)
- **Files modified:** 11

## Accomplishments

- Scaffolded Astro 7.3.6 project with TypeScript strict preset, Prettier + prettier-plugin-astro, and correct `engines.node >= 22.12.0`
- Locked i18n routing in astro.config.mjs before any content pages — Spanish at `/`, English under `/en/`, `prefixDefaultLocale:false`, no `redirectToDefaultLocale`
- Created `src/content.config.ts` with Astro 7 Content Layer API (`glob()` loader, `z` from `astro/zod`) — NOT the Astro 4 path/syntax that silently fails
- Walking-skeleton acceptance test (`scripts/verify-build.mjs`) written first as RED step, then turned GREEN with Spanish + English test pages
- `node scripts/verify-build.mjs` exits 0: all 5 assertions pass — dist/index.html and dist/en/index.html exist, both are valid strict UTF-8, Spanish literal with ñ/á/é is present, `build.format:directory` confirmed

## Task Commits

Each task was committed atomically:

1. **Task 1: Write failing acceptance test for the walking-skeleton build output** - `02b3ea3` (test)
2. **Task 2: Scaffold Astro 7 project with TypeScript strict, Prettier, and locked i18n config** - `4689697` (feat)
3. **Task 3: Create Spanish + English test pages and run the walking-skeleton build to green** - `4e32e2e` (feat)

_Note: TDD tasks — Task 1 is the RED commit, Tasks 2+3 together bring GREEN._

## Files Created/Modified

- `astro.config.mjs` — i18n locked, output:static, build.format:directory, site URL, no base, no redirectToDefaultLocale
- `package.json` — Astro ^7.3.6, engines.node >=22.12.0, type:module, build/dev/preview scripts
- `package-lock.json` — lockfile for reproducible installs
- `tsconfig.json` — extends astro/tsconfigs/strict
- `.prettierrc.mjs` — prettier-plugin-astro for .astro file formatting
- `.gitignore` — dist/, .astro/, node_modules/, .env, .DS_Store
- `src/content.config.ts` — Astro 7 Content Collections with glob() loader at src/ root
- `src/content/pages/.gitkeep` — empty directory so glob base exists at build time
- `src/pages/index.astro` — Spanish root page, lang=es, title + body with Spanish special chars
- `src/pages/en/index.astro` — English page at /en/, lang=en, walking skeleton title + body
- `scripts/verify-build.mjs` — acceptance test: 5 assertions on dist/ output, exits 0 on GREEN

## Decisions Made

- **Astro 7 not 4:** CLAUDE.md documents Astro 4; actual installed version is 7.3.6. CLAUDE.md stack section is outdated — Astro 7 API patterns documented in 01-RESEARCH.md govern all future phases.
- **`redirectToDefaultLocale` NOT written:** Defaults to false in Astro 6+. Writing it would not cause issues but adds confusion; omitting it is cleaner.
- **`base` NOT set:** ULPGC webmaster has not confirmed root vs subdirectory deployment. Handled in Plan 02 Task 1 (webmaster coordination checkpoint). Setting it now would require a rebuild after confirmation.
- **`@astrojs/check` added as dev dep:** The scaffold does not install it; `npx astro check` prompts interactively to install. Added explicitly to package.json so future clean installs work without prompts.
- **scaffold went to subdirectory:** `npm create astro@latest .` created `civil-conjunction/` subdirectory because cwd was non-empty (had `.planning/` and `CLAUDE.md`). Files were relocated manually to the project root. This is expected Astro scaffold behavior when the target directory is non-empty.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed `@astrojs/check` and `typescript` explicitly**
- **Found during:** Task 2 (scaffold + astro check)
- **Issue:** `npx astro check` presented interactive prompt to install `@astrojs/check` — could not be auto-confirmed in non-interactive shell
- **Fix:** Added `npm install --save-dev @astrojs/check typescript` to make `npx astro check` non-interactive; added both to `devDependencies` in package.json
- **Files modified:** package.json, package-lock.json
- **Verification:** `npx astro check` exits 0 with 0 errors after explicit install
- **Committed in:** `4689697` (Task 2 commit)

**2. [Rule 3 - Blocking] Scaffold created subdirectory instead of populating cwd**
- **Found during:** Task 2 (npm create astro@latest)
- **Issue:** `npm create astro@latest . -- ...` created `civil-conjunction/` subdirectory because cwd was non-empty; scaffold only works in empty directories
- **Fix:** Copied all scaffold files from `civil-conjunction/` to project root, then removed the subdirectory; created `src/` structure manually
- **Files modified:** (files were relocated, not modified)
- **Verification:** All scaffold files at project root, no `civil-conjunction/` dir in git
- **Committed in:** `4689697` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 3 — blocking issues)
**Impact on plan:** Both auto-fixes essential for build pipeline to function non-interactively. No scope creep. All plan outcomes achieved.

## Issues Encountered

- `npm create astro@latest` interactive scaffold behavior in non-empty directories — workaround applied (see Deviations above)
- `undici@8.11.2` EBADENGINE warning during install (requires Node >= 22.19.0, machine has 22.15.1) — this is a transitive dep warning only; does not affect build or runtime

## User Setup Required

None — no external service configuration required for Plan 01. ULPGC webmaster coordination (for deployment URL confirmation) is handled in Plan 02.

## Next Phase Readiness

**Ready for:** Plan 02 (ULPGC deploy — webmaster coordination + live server test)

**What Plan 02 gets:**
- Working build pipeline that exits 0
- Spanish + English test pages with UTF-8-clean Spanish characters in dist/
- i18n routing locked in astro.config.mjs — no changes needed when adding content in Plans beyond 02
- `scripts/verify-build.mjs` acceptance test to validate each future build

**Open item for Plan 02:**
- ULPGC webmaster must confirm: deployment URL (root vs subdirectory), AllowOverride status, HTTPS enforcement — then `base:` in astro.config.mjs can be finalized (or confirmed absent)

---
*Phase: 01-foundation-pipeline*
*Completed: 2026-10-06*
