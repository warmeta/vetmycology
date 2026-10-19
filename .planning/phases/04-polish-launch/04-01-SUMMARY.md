---
phase: 04-polish-launch
plan: "01"
subsystem: ci-cd
tags: [github-actions, deploy, prod-branch, plesk, htaccess]
dependency_graph:
  requires: []
  provides: [deploy-pipeline]
  affects: [prod-branch, ulpgc-server]
tech_stack:
  added: [JamesIves/github-pages-deploy-action@v4]
  patterns: [prod-branch-deploy, deploy-staging-structure]
key_files:
  created:
    - .github/workflows/deploy.yml
  modified: []
decisions:
  - "Prod branch deploy via JamesIves action (no FTP, no server credentials in CI)"
  - "deploy-staging/public/ structure lets Plesk document root stay at /httpdocs/public/"
  - ".htaccess at /httpdocs/ root blocks /.git/ as second layer of protection"
  - "concurrency: production-deploy with cancel-in-progress serializes deploys"
metrics:
  duration: "3 minutes"
  completed: "2026-10-19"
  tasks_completed: 2
  files_created: 1
  files_modified: 0
---

# Phase 4 Plan 1: GitHub Actions Deploy Workflow Summary

GitHub Actions CI/CD pipeline that builds the Astro site on push to main and force-pushes `deploy-staging/` (containing `public/` with all built files plus a root `.htaccess`) to the `prod` branch for Plesk Git extension to pull into `/httpdocs/`.

## What Was Built

`.github/workflows/deploy.yml` — a single GitHub Actions workflow that:

1. Triggers on push to `main` with `concurrency: production-deploy` (serializes deploys, cancels in-progress)
2. Checks out, sets up Node 22 (matching `package.json engines >=22.12.0`), runs `npm ci` then `npm run build`
3. Assembles `deploy-staging/`:
   - `deploy-staging/public/` — all `dist/` contents (the built Astro site)
   - `deploy-staging/.htaccess` — `RedirectMatch 404 /\.git` (blocks `.git/` directory access)
4. `JamesIves/github-pages-deploy-action@v4` force-pushes `deploy-staging/` contents to the `prod` branch
5. GitHub fires the configured webhook; Plesk Git extension pulls `prod` into `/httpdocs/`

No FTP credentials, no server IP, no server secrets appear anywhere in the committed file. Only `GITHUB_TOKEN` (automatic) is used.

## Deploy Flow Diagram

```
push to main
     │
     ▼
GitHub Actions
  checkout → Node 22 → npm ci → npm run build
     │
     ▼
Assemble deploy-staging/
  deploy-staging/
    public/          ← dist/ contents
    .htaccess        ← blocks /.git/ access
     │
     ▼
JamesIves action → force-push → prod branch
     │
     ▼
GitHub webhook → Plesk Git extension
     │
     ▼
Plesk pulls prod into /httpdocs/
  /httpdocs/
    .git/            ← git metadata (NOT served)
    .htaccess        ← from prod branch root
    public/          ← Plesk document root → LIVE SITE
```

---

## One-Time Plesk Setup (Required Before First Deploy)

These steps must be completed manually in the Plesk control panel **before** the GitHub Actions workflow will result in a live site. They are one-time only.

### Step 1 — Change Document Root

- Plesk panel → **Domains** → `micologiaveterinaria.ulpgc.es` → **Hosting Settings**
- Change **Document root** from `/httpdocs` to `/httpdocs/public`
- Click **Save**

This ensures the served site is `public/` (built Astro output), not `/httpdocs/` root (which would expose `.git/`).

### Step 2 — Add GitHub Repo to Plesk Git Extension

- Plesk panel → **Domains** → `micologiaveterinaria.ulpgc.es` → **Git**
- Click **Add repository**
- **Repository URL:** `https://github.com/[your-username]/vetmyc`
  - Note: the repo must be **public**, OR you must configure a Plesk deploy key for a private repo (see note below)
- **Branch:** `prod`
- **Deploy path:** `/httpdocs/`
- Enable **"Automatic deployment"** (pull on webhook)
- Click **Save**
- Copy the **webhook URL** shown by Plesk after saving

### Step 3 — Add Plesk Webhook to GitHub

- GitHub repo → **Settings** → **Webhooks** → **Add webhook**
- **Payload URL:** paste the webhook URL copied from Plesk in Step 2
- **Content type:** `application/json`
- **Events:** "Just the push event"
- (Optional) Under "Branch filter" or "Ref filter": restrict to `prod` branch
- Click **Add webhook**

### Step 4 — Trigger First Deploy

- Push any commit to `main` (or push an empty commit: `git commit --allow-empty -m "trigger first deploy"`)
- Watch the **Actions** tab in GitHub — the `Deploy to ULPGC` workflow should run and complete
- Plesk receives the webhook and pulls `prod` into `/httpdocs/`
- Visit `https://micologiaveterinaria.ulpgc.es/` — should serve the live site

**If the site shows a directory listing or 404:** Double-check Step 1 (document root must be `/httpdocs/public`, not `/httpdocs`).

---

## Private Repo Note

If the GitHub repository is private, Plesk cannot clone over HTTPS without credentials. Options:

1. **Make the repo public** — simplest for a public academic site with no secrets in the repo
2. **Deploy key:** In Plesk Git → repository settings, generate an SSH deploy key. Add it to GitHub repo → Settings → Deploy keys (read-only). Change the Plesk repository URL to the SSH form: `git@github.com:[your-username]/vetmyc.git`

---

## Deviations from Plan

None — plan executed exactly as written.

The RESEARCH.md noted outdated FTP-based approach in some sections (D-08 in CONTEXT.md mentioned FTP, RESEARCH.md §1 described `SamKirkland/FTP-Deploy-Action`). The PLAN.md explicitly supersedes these with the `JamesIves/github-pages-deploy-action` + prod branch approach. The workflow was implemented per PLAN.md, not the older RESEARCH/CONTEXT FTP references.

---

## Threat Flags

None — no new network endpoints, auth paths, or trust boundaries introduced beyond what the plan's threat model covers.

| Threat | Mitigation in workflow |
|--------|----------------------|
| T-04-01-01: `.git/` exposure | Document root `/httpdocs/public/` + `.htaccess` blocks `/.git/` |
| T-04-01-02: Fork PR triggers prod push | `on: push: branches: [main]` only; fork PRs cannot merge to main without review |
| T-04-01-03: Concurrent deploy race | `concurrency: production-deploy, cancel-in-progress: true` |

---

## Self-Check

- [x] `.github/workflows/deploy.yml` exists
- [x] Contains `JamesIves/github-pages-deploy-action@v4` (1 occurrence)
- [x] Contains `node-version: '22'` (1 occurrence)
- [x] Contains `deploy-staging/public` (2 occurrences — mkdir and cp steps)
- [x] Contains `production-deploy` concurrency group (1 occurrence)
- [x] Contains `permissions: contents: write` (1 occurrence)
- [x] No IP addresses or server credentials in the file
- [x] No FTP, SamKirkland, or FTP action references (comment line mentioning "No FTP" does not count)
- [x] Commit `dda2568` exists in git log
