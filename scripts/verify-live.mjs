/**
 * verify-live.mjs
 *
 * Live deployment verification for the VetMyc walking-skeleton pages.
 *
 * Reads ULPGC_SITE_URL from the environment, fetches the Spanish root and
 * English /en/ pages, and asserts:
 *   (a) Both responses are HTTP 200
 *   (b) Both response bodies decode cleanly as strict UTF-8 (TextDecoder fatal:true)
 *   (c) Spanish body contains the exact test literal
 *   (d) English body contains the exact test literal
 *   (e) Spanish response declares UTF-8 charset (Content-Type header or <meta charset>)
 *
 * Uses only Node stdlib: node:process, built-in fetch (Node 18+ stable).
 * No external packages required.
 *
 * Exit codes:
 *   0 — all assertions pass
 *   1 — one or more assertions failed
 *   2 — ULPGC_SITE_URL is not set
 *   3 — network error (cannot reach the server at all)
 *
 * Usage:
 *   ULPGC_SITE_URL=https://micologiaveterinaria.ulpgc.es node scripts/verify-live.mjs
 */

import { exit } from 'node:process';

// ---------------------------------------------------------------------------
// Expected content literals (must match exactly what the build produces)
// ---------------------------------------------------------------------------
const SPANISH_LITERAL = 'Micología Veterinaria — ñoño, cándida, pérez';
const ENGLISH_LITERAL = 'Veterinary Mycology — walking skeleton';

// ---------------------------------------------------------------------------
// Read and validate ULPGC_SITE_URL
// ---------------------------------------------------------------------------
const SITE_URL = process.env.ULPGC_SITE_URL;

if (!SITE_URL) {
  console.error('ERROR (exit 2): ULPGC_SITE_URL environment variable is not set.');
  console.error('  Set it before running this script. Example:');
  console.error('    ULPGC_SITE_URL=https://micologiaveterinaria.ulpgc.es node scripts/verify-live.mjs');
  exit(2);
}

// Warn (but do not fail) if URL is HTTP-only — per plan behavior spec
if (SITE_URL.startsWith('http://')) {
  console.warn('WARNING: ULPGC_SITE_URL uses http:// (not https://).');
  console.warn('  The ULPGC server is expected to serve HTTPS. If HTTPS is confirmed');
  console.warn('  unavailable, this warning is expected. Otherwise, check the URL.');
}

// Normalise: strip trailing slash
const BASE_URL = SITE_URL.replace(/\/$/, '');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
let failures = 0;

function fail(message) {
  console.error(`FAIL: ${message}`);
  failures++;
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

/**
 * Decode an ArrayBuffer as strict UTF-8.
 * Returns the decoded string, or throws TypeError on corrupt bytes.
 * This is the canonical encoding check — TextDecoder with fatal:true.
 * Node's default fs/response text() silently replaces bad bytes with U+FFFD;
 * this does not.
 */
function strictDecode(buffer) {
  return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
}

/**
 * Fetch a URL and return { status, buffer, headers }.
 * Follows redirects by default.
 */
async function fetchPage(url) {
  const response = await fetch(url, { redirect: 'follow' });
  const buffer = await response.arrayBuffer();
  return {
    status: response.status,
    buffer,
    headers: response.headers,
    url: response.url,
  };
}

/**
 * Check whether a response declares UTF-8 charset.
 * First checks Content-Type header; falls back to <meta charset> in the body.
 * Returns { found: boolean, method: 'header'|'meta'|'none' }.
 */
function detectCharsetDeclaration(headers, bodyText) {
  const contentType = headers.get('content-type') || '';
  if (/charset=utf-8/i.test(contentType)) {
    return { found: true, method: 'header' };
  }
  // Fallback: look for <meta charset="utf-8"> or <meta charset=utf-8> in body
  if (/<meta[^>]+charset="?utf-8"?/i.test(bodyText)) {
    return { found: true, method: 'meta' };
  }
  return { found: false, method: 'none' };
}

// ---------------------------------------------------------------------------
// Main verification
// ---------------------------------------------------------------------------
async function verify() {
  console.log('');
  console.log('======================================================');
  console.log(' VetMyc Live Verification');
  console.log('======================================================');
  console.log(` Base URL: ${BASE_URL}`);
  console.log('');

  // -------------------------------------------------------------------------
  // Fetch both pages (in parallel for speed)
  // -------------------------------------------------------------------------
  let spanishResult, englishResult;

  try {
    [spanishResult, englishResult] = await Promise.all([
      fetchPage(`${BASE_URL}/`),
      fetchPage(`${BASE_URL}/en/`),
    ]);
  } catch (err) {
    console.error(`ERROR (exit 3): Network error — cannot reach ${BASE_URL}`);
    console.error(`  ${err.message}`);
    console.error('  Is the server up? Is the URL correct?');
    exit(3);
  }

  // -------------------------------------------------------------------------
  // Spanish root page assertions
  // -------------------------------------------------------------------------
  console.log(`--- Checking ${BASE_URL}/ (Spanish root) ---`);

  // (a) HTTP 200
  if (spanishResult.status === 200) {
    pass(`${BASE_URL}/ returned HTTP 200`);
  } else {
    fail(`${BASE_URL}/ returned HTTP ${spanishResult.status} (expected 200)`);
  }

  // (b) Strict UTF-8 decode
  let spanishBody = null;
  try {
    spanishBody = strictDecode(spanishResult.buffer);
    pass(`${BASE_URL}/ decodes as valid UTF-8 (TextDecoder fatal:true)`);
  } catch (err) {
    fail(`${BASE_URL}/ contains invalid UTF-8 bytes: ${err.message}`);
  }

  // (c) Spanish literal
  if (spanishBody !== null) {
    if (spanishBody.includes(SPANISH_LITERAL)) {
      pass(`Spanish root contains expected literal: "${SPANISH_LITERAL}"`);
    } else {
      fail(
        `Spanish root does NOT contain expected literal.\n` +
          `  Expected: "${SPANISH_LITERAL}"\n` +
          `  First 500 chars of body: ${spanishBody.slice(0, 500)}`,
      );
    }
  }

  // (e) UTF-8 charset declaration
  if (spanishBody !== null) {
    const charset = detectCharsetDeclaration(spanishResult.headers, spanishBody);
    if (charset.found) {
      pass(`Spanish root declares UTF-8 charset via ${charset.method}`);
    } else {
      fail(
        `Spanish root does NOT declare UTF-8 charset.\n` +
          `  Content-Type header: ${spanishResult.headers.get('content-type') || '(not set)'}\n` +
          `  No <meta charset="utf-8"> found in body.\n` +
          `  Action: ensure .htaccess AddDefaultCharset UTF-8 is in effect, or ask webmaster to add it to the vhost.`,
      );
    }
  }

  console.log('');

  // -------------------------------------------------------------------------
  // English /en/ page assertions
  // -------------------------------------------------------------------------
  console.log(`--- Checking ${BASE_URL}/en/ (English) ---`);

  // (a) HTTP 200
  if (englishResult.status === 200) {
    pass(`${BASE_URL}/en/ returned HTTP 200`);
  } else {
    fail(`${BASE_URL}/en/ returned HTTP ${englishResult.status} (expected 200)`);
  }

  // (b) Strict UTF-8 decode
  let englishBody = null;
  try {
    englishBody = strictDecode(englishResult.buffer);
    pass(`${BASE_URL}/en/ decodes as valid UTF-8 (TextDecoder fatal:true)`);
  } catch (err) {
    fail(`${BASE_URL}/en/ contains invalid UTF-8 bytes: ${err.message}`);
  }

  // (d) English literal
  if (englishBody !== null) {
    if (englishBody.includes(ENGLISH_LITERAL)) {
      pass(`English /en/ contains expected literal: "${ENGLISH_LITERAL}"`);
    } else {
      fail(
        `English /en/ does NOT contain expected literal.\n` +
          `  Expected: "${ENGLISH_LITERAL}"\n` +
          `  First 500 chars of body: ${englishBody.slice(0, 500)}`,
      );
    }
  }

  console.log('');

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log('======================================================');
  if (failures === 0) {
    console.log(' All assertions passed — Walking Skeleton is live and verified.');
    console.log(` Spanish root: ${BASE_URL}/`);
    console.log(` English:      ${BASE_URL}/en/`);
    console.log('======================================================');
    exit(0);
  } else {
    console.error(` ${failures} assertion(s) FAILED — see output above.`);
    console.error('======================================================');
    exit(1);
  }
}

verify().catch((err) => {
  console.error('Unexpected error:', err);
  exit(1);
});
