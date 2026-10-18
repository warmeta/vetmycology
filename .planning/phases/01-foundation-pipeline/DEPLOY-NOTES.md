# DEPLOY-NOTES — VetMyc ULPGC Deployment

This file records the webmaster-confirmed deployment constraints, deploy commands,
and live verification evidence for the VetMyc Astro migration. It is safe to commit
to the repository because it contains NO credentials — only non-sensitive configuration.

Credentials (ULPGC_SSH_PASS) are stored in the developer's local secret store and
exported as an environment variable before running the deploy script.

---

## Webmaster Answers

Answers received from the ULPGC webmaster before Plan 02 execution. These were provided
as part of the checkpoint resolution before this plan was executed.

### (a) Public URL — root domain or subdirectory?

**Answer:** Root domain. The site is hosted at `https://micologiaveterinaria.ulpgc.es/`.
No subdirectory base path is needed. Astro `base` was intentionally omitted.

### (b) AllowOverride status — can we use .htaccess?

**Answer:** `.htaccess` is assumed active (AllowOverride is at least FileInfo).
A minimal `.htaccess` is included in `public/` for DirectoryIndex, charset, and
clean URL support.

### (c) DirectoryIndex — configured globally or must we provide it?

**Answer:** We provide `DirectoryIndex index.html` in `.htaccess` as a safety measure.
This ensures the Apache server serves `index.html` from Astro's `build.format: 'directory'`
output even if the global vhost does not set it.

### (d) HTTPS — enforced or HTTP-only?

**Answer:** HTTPS is confirmed available at `https://micologiaveterinaria.ulpgc.es`.
HTTP redirect to HTTPS is handled at the vhost level by the university infrastructure.
The `.htaccess` includes an HTTPS redirect as a belt-and-suspenders measure.

### (e) SFTP/rsync credentials and server path

**Answer (non-sensitive parts only — credentials are in developer env vars, NOT in this file):**
- SSH Host: `217.116.2.102`
- SSH User: `micologiavet`
- Server document root: `/httpdocs`
- File permissions expected: 644 for files, 755 for directories (enforced via rsync `--chmod=D755,F644`)

### (f) Default UTF-8 charset header — provided by server or must we add it?

**Answer:** Not confirmed at the vhost level. We send `AddDefaultCharset UTF-8` via
`.htaccess` so all HTML responses carry the correct charset header regardless of vhost
configuration. This prevents mojibake for Spanish content (ñ, á, é, etc.).

---

## Deploy Script

The deploy script is at `scripts/deploy-to-ulpgc.sh`.

Required environment variables (set before running):
```bash
export ULPGC_SSH_HOST=217.116.2.102
export ULPGC_SSH_USER=micologiavet
export ULPGC_SITE_PATH=/httpdocs
export ULPGC_SITE_URL=https://micologiaveterinaria.ulpgc.es
export ULPGC_SSH_PASS=...   # from developer local secret store — DO NOT commit
```

Run:
```bash
npm run build
node scripts/verify-build.mjs
bash scripts/deploy-to-ulpgc.sh
```

---

## Deploy Evidence

**Status:** BLOCKED — deploy script is written and ready but NOT yet executed.

The actual deploy cannot be performed in this automated session because:
- Live SSH access to the ULPGC server requires `ULPGC_SSH_PASS` from the developer's
  local secret store, which is not available to the automated executor.
- The developer must run `scripts/deploy-to-ulpgc.sh` manually from a terminal with
  `ULPGC_SSH_PASS` set.

**astro.config.mjs finalized fields:**
```js
site: 'https://micologiaveterinaria.ulpgc.es',  // confirmed root domain
output: 'static',
// NOTE: No `base:` — confirmed root deploy
// NOTE: No `trailingSlash:` — only needed when base is set
```

**rsync command used (with secrets redacted):**
```bash
rsync -av --delete --chmod=D755,F644 \
  --exclude='.DS_Store' --exclude='*.swp' --exclude='.gitkeep' \
  dist/ ${ULPGC_SSH_USER}@${ULPGC_SSH_HOST}:${ULPGC_SITE_PATH}/
```

**Deploy timestamp:** To be recorded by the developer after first successful deploy.

---

## Live Verification

**Status:** BLOCKED — cannot run live verification until the deploy is completed.

Live verification is automated via `scripts/verify-live.mjs`. After a successful deploy, run:
```bash
ULPGC_SITE_URL=https://micologiaveterinaria.ulpgc.es node scripts/verify-live.mjs
```

The script checks:
- HTTP 200 for `/` (Spanish root)
- HTTP 200 for `/en/` (English)
- Both bodies decode cleanly as strict UTF-8
- Spanish body contains: `Micología Veterinaria — ñoño, cándida, pérez`
- English body contains: `Veterinary Mycology — walking skeleton`
- Spanish response includes UTF-8 charset declaration (header or meta tag)

**Expected live URL:** `https://micologiaveterinaria.ulpgc.es`
**Expected status codes:** 200 for both `/` and `/en/`
**Charset declaration method:** `AddDefaultCharset UTF-8` via `.htaccess` (header)
**Spanish h1 excerpt (expected):** `Micología Veterinaria — ñoño, cándida, pérez`

To be updated by the developer with actual evidence after running the deploy and verification.
