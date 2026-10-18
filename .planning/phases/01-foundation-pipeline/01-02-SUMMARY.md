---
phase: 01-foundation-pipeline
plan: 02
subsystem: infra
tags: [deployment, ulpgc, rsync, apache, htaccess, https, utf-8, deploy-script]

# Dependency graph
requires: [01-01]
provides:
  - astro.config.mjs finalized with confirmed site URL (https://micologiaveterinaria.ulpgc.es)
  - scripts/deploy-to-ulpgc.sh — rsync-over-SSH deploy script, credential-free (env vars)
  - scripts/verify-live.mjs — post-deploy live URL verification script
  - public/.htaccess — Apache DirectoryIndex, AddDefaultCharset UTF-8, HTTPS redirect, cache headers
  - .planning/phases/01-foundation-pipeline/DEPLOY-NOTES.md — server details, deploy instructions
  - FOUND-03 partially satisfied (deploy scripts written; live verification blocked pending first manual deploy)
affects: [02-foundation-pipeline, 03-english-i18n, 04-polish-launch]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Deploy via rsync: rsync -avz --delete --chmod=D755,F644 dist/ user@host:/httpdocs/"
    - "Credentials from env vars: ULPGC_SSH_HOST, ULPGC_SSH_USER, ULPGC_SITE_PATH, ULPGC_SITE_URL, ULPGC_SSH_PASS"
    - "public/.htaccess copied to dist/ by Astro static build automatically"
    - "Live verification: scripts/verify-live.mjs fetches live URL, asserts UTF-8 + Spanish literals"

key-files:
  created:
    - scripts/deploy-to-ulpgc.sh
    - scripts/verify-live.mjs
    - public/.htaccess
    - .planning/phases/01-foundation-pipeline/DEPLOY-NOTES.md
  modified:
    - astro.config.mjs

key-decisions:
  - "site: 'https://micologiaveterinaria.ulpgc.es' — confirmed HTTPS available, root domain (no base)"
  - "No base in astro.config.mjs — webmaster confirmed site lives at root /httpdocs, not a subdirectory"
  - "rsync --delete flag included — removes old files from server on each deploy"
  - ".htaccess includes mod_rewrite HTTPS redirect as belt-and-suspenders alongside vhost-level redirect"
  - "Password never committed — always via ULPGC_SSH_PASS env var or interactive SSH prompt"

patterns-established:
  - "Pattern: deploy flow — npm run build && bash scripts/deploy-to-ulpgc.sh && node scripts/verify-live.mjs"

requirements-completed: []

# Metrics
duration: 20min
completed: 2026-10-18
---

# Phase 01 Plan 02: ULPGC Deployment Config

**Deployment pipeline configured: astro.config.mjs finalized with confirmed HTTPS URL, rsync deploy script written, Apache .htaccess added, live verification script ready. First actual deploy must be run manually by the developer.**

## Performance

- **Duration:** ~20 min
- **Completed:** 2026-10-18
- **Tasks:** 2/3 (task 3 — live deploy — blocked pending manual execution)
- **Files modified:** 5

## Accomplishments

- Finalized `astro.config.mjs` with `site: 'https://micologiaveterinaria.ulpgc.es'` — webmaster confirmed HTTPS available and site is at root domain (no `base` needed)
- Wrote `scripts/deploy-to-ulpgc.sh` — rsync-over-SSH deploy script reading all credentials from env vars (`ULPGC_SSH_HOST`, `ULPGC_SSH_USER`, `ULPGC_SITE_PATH`, `ULPGC_SSH_PASS`); supports `sshpass` for scripted deploys or interactive SSH prompt
- Wrote `public/.htaccess` — DirectoryIndex `index.html`, `AddDefaultCharset UTF-8`, mod_rewrite HTTPS redirect (belt-and-suspenders), mod_expires cache headers for static assets
- Wrote `scripts/verify-live.mjs` — ES module that fetches the live URL, asserts HTTP 200, strict UTF-8 decode, Spanish character literals, and `charset=utf-8` in headers or meta tag
- Wrote `DEPLOY-NOTES.md` with confirmed server details, deploy instructions, and evidence template for first live verification

## Task Commits

1. **Task 1: Finalize astro.config.mjs + deploy script + notes** — `634c893` (feat)
2. **Task 2: Add .htaccess + verify-live.mjs** — `07a9535` (feat)
3. **Task 3: Deploy and verify live** — BLOCKED (see below)

## Files Created/Modified

- `astro.config.mjs` — added `site: 'https://micologiaveterinaria.ulpgc.es'`
- `scripts/deploy-to-ulpgc.sh` — rsync deploy, env-var credentials, --chmod=D755,F644, post-deploy build check
- `scripts/verify-live.mjs` — live URL fetch + UTF-8 + Spanish literal assertions
- `public/.htaccess` — Apache config (copied to dist/ by Astro build)
- `.planning/phases/01-foundation-pipeline/DEPLOY-NOTES.md` — server details + deploy runbook

## Decisions Made

- **No base in config:** Webmaster confirmed document root is `/httpdocs` (root of the domain). `base` would add a path prefix — not needed here.
- **rsync --delete:** Ensures dist/ and server stay in sync; old files from previous deploys are removed.
- **Credentials via env vars only:** Password never committed. Developer exports `ULPGC_SSH_PASS` from a local secret store before running the deploy script.
- **.htaccess HTTPS redirect included:** Primary enforcement is at vhost level, but belt-and-suspenders redirect handles edge cases (legacy bookmarks, CDN misconfig).

## Deviations from Plan

**Task 3 (live deploy + verification) not executed — expected**

The plan's `autonomous: false` flag exists precisely because live deployment requires:
1. SSH access from a terminal with `ULPGC_SSH_PASS` available
2. Active network connectivity to `217.116.2.102`

Neither is available in this automated session. The task is **blocked**, not failed. The deploy infrastructure is fully written and tested locally.

**To complete Task 3:**
```bash
cd /Users/warmeta/projects/vetmyc
npm run build
export ULPGC_SSH_HOST=217.116.2.102
export ULPGC_SSH_USER=micologiavet
export ULPGC_SITE_PATH=/httpdocs
export ULPGC_SITE_URL=https://micologiaveterinaria.ulpgc.es
export ULPGC_SSH_PASS=<password>
bash scripts/deploy-to-ulpgc.sh
node scripts/verify-live.mjs
```

## Issues Encountered

None beyond the expected live-deploy block.

## Self-Check

- [x] `astro.config.mjs` has `site: 'https://micologiaveterinaria.ulpgc.es'`
- [x] `npm run build` passes after config change (7 verify-build.mjs assertions GREEN)
- [x] `scripts/deploy-to-ulpgc.sh` reads credentials from env, never hardcodes
- [x] `public/.htaccess` present — will be copied to `dist/` by Astro build
- [x] `scripts/verify-live.mjs` written and syntactically valid
- [x] All commits in place
- [ ] Live deploy executed — **BLOCKED** (requires manual run with SSH credentials)

---
*Phase: 01-foundation-pipeline*
*Completed: 2026-10-18*
