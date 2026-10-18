#!/usr/bin/env bash
# deploy-to-ulpgc.sh
#
# Deploys the Astro build output (dist/) to the ULPGC server via rsync over SSH.
# Reads credentials and target from environment variables — NEVER hardcodes them.
#
# Required environment variables:
#   ULPGC_SSH_HOST   — SSH/SFTP hostname or IP (e.g. 217.116.2.102)
#   ULPGC_SSH_USER   — SSH username (e.g. micologiavet)
#   ULPGC_SITE_PATH  — Absolute path on the server (e.g. /httpdocs)
#   ULPGC_SITE_URL   — Public URL for post-deploy verification (e.g. https://micologiaveterinaria.ulpgc.es)
#
# Optional environment variable:
#   ULPGC_SSH_PASS   — SSH password. If set, sshpass is used. If unset, the script
#                      prompts interactively (standard SSH key or password prompt).
#
# Usage:
#   export ULPGC_SSH_HOST=217.116.2.102
#   export ULPGC_SSH_USER=micologiavet
#   export ULPGC_SITE_PATH=/httpdocs
#   export ULPGC_SITE_URL=https://micologiaveterinaria.ulpgc.es
#   export ULPGC_SSH_PASS=...   # optional — omit to be prompted interactively
#   bash scripts/deploy-to-ulpgc.sh
#
# Security:
#   - Never commit ULPGC_SSH_PASS to the repository.
#   - Store the password in a developer-local secret store (e.g. macOS Keychain,
#     1Password CLI, pass(1)) and export it to the shell before running this script.
#   - rsync uses --chmod=D755,F644 to ensure uploaded files are not world-writable.

set -euo pipefail

# ---------------------------------------------------------------------------
# 1. Validate required env vars
# ---------------------------------------------------------------------------
MISSING=()
for var in ULPGC_SSH_HOST ULPGC_SSH_USER ULPGC_SITE_PATH ULPGC_SITE_URL; do
  if [[ -z "${!var:-}" ]]; then
    MISSING+=("$var")
  fi
done

if [[ ${#MISSING[@]} -gt 0 ]]; then
  echo "ERROR: Missing required environment variable(s):" >&2
  for v in "${MISSING[@]}"; do
    echo "  $v" >&2
  done
  echo "" >&2
  echo "Set these variables before running this script. Example:" >&2
  echo "  export ULPGC_SSH_HOST=217.116.2.102" >&2
  echo "  export ULPGC_SSH_USER=micologiavet" >&2
  echo "  export ULPGC_SITE_PATH=/httpdocs" >&2
  echo "  export ULPGC_SITE_URL=https://micologiaveterinaria.ulpgc.es" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# 2. Confirm dist/ was built
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DIST_DIR="${PROJECT_ROOT}/dist"

if [[ ! -d "${DIST_DIR}" ]]; then
  echo "ERROR: dist/ directory not found at ${DIST_DIR}" >&2
  echo "  Run: npm run build" >&2
  exit 1
fi

if [[ ! -f "${DIST_DIR}/index.html" ]]; then
  echo "ERROR: dist/index.html not found — build may be incomplete." >&2
  echo "  Run: npm run build && node scripts/verify-build.mjs" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# 3. Build rsync command
#    --chmod=D755,F644 ensures safe file permissions regardless of server umask.
#    --delete removes stale files from the server that were removed locally.
#    --exclude='.DS_Store' and '*.swp' avoid committing editor/macOS artifacts.
# ---------------------------------------------------------------------------
RSYNC_OPTS=(
  -av
  --delete
  --chmod=D755,F644
  --exclude='.DS_Store'
  --exclude='*.swp'
  --exclude='.gitkeep'
)

# If ULPGC_SSH_PASS is set, use sshpass; otherwise fall back to normal SSH auth.
if [[ -n "${ULPGC_SSH_PASS:-}" ]]; then
  if ! command -v sshpass &>/dev/null; then
    echo "ERROR: ULPGC_SSH_PASS is set but sshpass is not installed." >&2
    echo "  Install: brew install hudochenkov/sshpass/sshpass" >&2
    echo "  Or leave ULPGC_SSH_PASS unset and authenticate interactively." >&2
    exit 1
  fi
  RSYNC_CMD=(sshpass -e rsync "${RSYNC_OPTS[@]}")
else
  # Interactive / SSH-key auth
  RSYNC_CMD=(rsync "${RSYNC_OPTS[@]}")
fi

# ---------------------------------------------------------------------------
# 4. Deploy
# ---------------------------------------------------------------------------
TARGET="${ULPGC_SSH_USER}@${ULPGC_SSH_HOST}:${ULPGC_SITE_PATH}/"

echo "========================================================"
echo " VetMyc Deploy to ULPGC"
echo "========================================================"
echo " Source : ${DIST_DIR}/"
echo " Target : ${TARGET}"
echo " Site   : ${ULPGC_SITE_URL}"
echo "========================================================"
echo ""

"${RSYNC_CMD[@]}" "${DIST_DIR}/" "${TARGET}"

echo ""
echo "========================================================"
echo " Deploy complete."
echo " Live URL: ${ULPGC_SITE_URL}"
echo "========================================================"
echo ""
echo "Run the live verification script to confirm:"
echo "  ULPGC_SITE_URL=${ULPGC_SITE_URL} node scripts/verify-live.mjs"

# NOTE: sftp fallback (if rsync is unavailable):
#   If rsync is not available on the server, use sftp batch mode instead:
#     sftp -b /dev/stdin "${ULPGC_SSH_USER}@${ULPGC_SSH_HOST}" << EOF
#       cd ${ULPGC_SITE_PATH}
#       put -r dist/* .
#     EOF
#   rsync is strongly preferred — it is idempotent and supports --delete.
