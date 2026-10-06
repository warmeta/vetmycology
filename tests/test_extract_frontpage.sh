#!/usr/bin/env bash
set -euo pipefail

# Test: FrontPage extraction pipeline round-trip
# Runs extract_frontpage.py on the fixture and diffs against expected output.
# Exits 0 on pass, non-zero on failure.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

FIXTURE_HTM="${REPO_ROOT}/tests/fixtures/sample_frontpage.htm"
EXPECTED_MD="${REPO_ROOT}/tests/fixtures/expected_sample.md"
EXTRACTOR="${REPO_ROOT}/scripts/extract_frontpage.py"
VERIFIER="${REPO_ROOT}/scripts/verify_utf8.py"
OUTPUT_TMP="/tmp/vetmyc_sample_out.md"

echo "=== VetMyc: FrontPage extraction round-trip test ==="

# Step 1: Confirm Python 3 is available
if ! command -v python3 &>/dev/null; then
    echo "ERROR: python3 not found in PATH" >&2
    exit 1
fi
echo "Python 3: $(python3 --version)"

# Step 2: Run the extractor
echo "Running: python3 ${EXTRACTOR} ${FIXTURE_HTM} ${OUTPUT_TMP}"
python3 "${EXTRACTOR}" "${FIXTURE_HTM}" "${OUTPUT_TMP}"

# Step 3: Diff output against expected (diff -u exits non-zero if files differ)
echo "Diffing output against expected..."
if ! diff -u "${OUTPUT_TMP}" "${EXPECTED_MD}"; then
    echo ""
    echo "FAIL: Output does not match expected_sample.md" >&2
    exit 1
fi
echo "Diff: OK (output matches expected)"

# Step 4: Verify strict UTF-8
echo "Running: python3 ${VERIFIER} ${OUTPUT_TMP}"
python3 "${VERIFIER}" "${OUTPUT_TMP}"

echo ""
echo "PASS: extraction round-trip is GREEN"
