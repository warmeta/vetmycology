/**
 * verify-build.mjs
 *
 * Acceptance test for the VetMyc walking-skeleton build output.
 * Run AFTER `npm run build`. Exit codes:
 *   0 — all assertions pass
 *   1 — one or more assertions failed
 *   2 — dist/ directory is entirely missing
 *
 * Uses only Node stdlib: node:fs, node:path, node:process, node:util.TextDecoder
 */

import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { exit } from 'node:process';
import { TextDecoder } from 'node:util';

// ---------------------------------------------------------------------------
// Paths (relative to project root — run this script from the project root)
// ---------------------------------------------------------------------------
const DIST = resolve('dist');
const DIST_INDEX = join(DIST, 'index.html');
const DIST_EN_INDEX = join(DIST, 'en', 'index.html');
const DIST_EN_HTML = join(DIST, 'en.html'); // must NOT exist (confirms format:directory)

// ---------------------------------------------------------------------------
// Expected pages — all 14 content section index.html files + home
// (URL + Slug Map from 02-UI-SPEC.md — authoritative list)
// ---------------------------------------------------------------------------
const EXPECTED_PAGES = [
  'index.html',
  'micologia/generalidades/index.html',
  'micologia/grupo-de-trabajo/index.html',
  'micologia/colreptiles/index.html',
  'patologias/levaduras/index.html',
  'patologias/filamentosos/index.html',
  'patologias/dimorficos/index.html',
  'patologias/micosis-peces/index.html',
  'investigacion/articulos-congresos/index.html',
  'investigacion/articulos-interesantes/index.html',
  'laboratorio/index.html',
  'recursos/archivo-imagenes/index.html',
  'recursos/links-micologia/index.html',
  'recursos/links-revistas/index.html',
  'recursos/bibliografia/index.html',
];

// ---------------------------------------------------------------------------
// Expected content literals (must match exactly what the build produces)
// ---------------------------------------------------------------------------
const SPANISH_LITERAL = 'Micología Veterinaria — ñoño, cándida, pérez';
const ENGLISH_LITERAL = 'Veterinary Mycology — walking skeleton';

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
 * Read a file as strict UTF-8 bytes using TextDecoder with fatal:true.
 * Returns the decoded string, or throws with a descriptive error on corrupt bytes.
 * This is the canonical encoding check — NOT grep, NOT readFileSync(path, 'utf8')
 * (which silently replaces bad bytes with the replacement character U+FFFD).
 */
function readStrictUtf8(filePath) {
  const bytes = readFileSync(filePath); // returns Buffer (Uint8Array)
  const decoder = new TextDecoder('utf-8', { fatal: true });
  return decoder.decode(bytes); // throws TypeError if bytes are invalid UTF-8
}

// ---------------------------------------------------------------------------
// Assertion 0: dist/ directory must exist at all
// ---------------------------------------------------------------------------
if (!existsSync(DIST) || !statSync(DIST).isDirectory()) {
  console.error(`ERROR (exit 2): dist/ directory not found at ${DIST}`);
  console.error(`  dist/index.html not found — dist/ does not exist.`);
  console.error('  Run `npm run build` before running this script.');
  exit(2);
}

// ---------------------------------------------------------------------------
// Assertion 1: dist/index.html must exist and be a readable file
// ---------------------------------------------------------------------------
if (!existsSync(DIST_INDEX) || !statSync(DIST_INDEX).isFile()) {
  fail(`dist/index.html not found — expected at ${DIST_INDEX}`);
} else {
  pass('dist/index.html exists');

  // Assertion 2: dist/index.html must decode as valid strict UTF-8
  let spanishContent;
  try {
    spanishContent = readStrictUtf8(DIST_INDEX);
    pass('dist/index.html decodes as valid UTF-8 (strict, fatal:true)');
  } catch (err) {
    fail(
      `dist/index.html contains invalid UTF-8 bytes: ${err.message}\n  File path: ${DIST_INDEX}`,
    );
    spanishContent = null;
  }

  // Assertion 3: dist/index.html must contain the Spanish test literal
  if (spanishContent !== null) {
    if (spanishContent.includes(SPANISH_LITERAL)) {
      pass(`dist/index.html contains Spanish literal: "${SPANISH_LITERAL}"`);
    } else {
      fail(
        `dist/index.html does NOT contain Spanish literal.\n` +
          `  Expected: "${SPANISH_LITERAL}"\n` +
          `  First 500 chars of file: ${spanishContent.slice(0, 500)}`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Assertion 4: dist/en/index.html must exist and contain the English literal
// ---------------------------------------------------------------------------
if (!existsSync(DIST_EN_INDEX) || !statSync(DIST_EN_INDEX).isFile()) {
  fail(`dist/en/index.html not found — expected at ${DIST_EN_INDEX}`);
} else {
  pass('dist/en/index.html exists');

  let englishContent;
  try {
    englishContent = readStrictUtf8(DIST_EN_INDEX);
    pass('dist/en/index.html decodes as valid UTF-8 (strict, fatal:true)');
  } catch (err) {
    fail(
      `dist/en/index.html contains invalid UTF-8 bytes: ${err.message}\n  File path: ${DIST_EN_INDEX}`,
    );
    englishContent = null;
  }

  if (englishContent !== null) {
    if (englishContent.includes(ENGLISH_LITERAL)) {
      pass(`dist/en/index.html contains English literal: "${ENGLISH_LITERAL}"`);
    } else {
      fail(
        `dist/en/index.html does NOT contain English literal.\n` +
          `  Expected: "${ENGLISH_LITERAL}"\n` +
          `  First 500 chars of file: ${englishContent.slice(0, 500)}`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Assertion 5: dist/en.html must NOT exist (confirms build.format:'directory')
// ---------------------------------------------------------------------------
if (existsSync(DIST_EN_HTML)) {
  fail(
    `dist/en.html exists — this means build.format:'directory' is NOT active.\n` +
      `  Expected: dist/en/index.html (directory format)\n` +
      `  Found: dist/en.html (file format)\n` +
      `  Fix: ensure astro.config.mjs has build: { format: 'directory' }`,
  );
} else {
  pass('dist/en.html does not exist (confirms build.format:directory is active)');
}

// ---------------------------------------------------------------------------
// Assertion 6: All expected content section pages declared in EXPECTED_PAGES
// NOTE: WARN-only in Wave 0; Plan 05 Task 3 upgrades to hard fail
// ---------------------------------------------------------------------------
for (const pagePath of EXPECTED_PAGES) {
  const fullPath = join(DIST, pagePath);
  if (existsSync(fullPath)) {
    pass(`dist/${pagePath} exists`);
  } else {
    console.warn(`WARN: dist/${pagePath} not found (expected content page — not yet built)`);
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log('');
if (failures === 0) {
  console.log('All assertions passed. Walking-skeleton build is GREEN.');
  exit(0);
} else {
  console.error(`${failures} assertion(s) failed. See output above.`);
  exit(1);
}
