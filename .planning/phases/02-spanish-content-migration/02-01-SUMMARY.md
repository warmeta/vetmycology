---
phase: 02-spanish-content-migration
plan: 01
subsystem: extraction
tags: [python, beautifulsoup, frontpage, html-extraction, build-verification]

# Dependency graph
requires:
  - phase: 01-foundation-pipeline
    provides: "extract_frontpage.py initial script with markdownify pipeline; venv with bs4 + markdownify; verify-build.mjs walking-skeleton harness"
provides:
  - "Fixed FrontPage HTML->Markdown converter: <font> tags unwrapped (not decomposed), OOXML <![if]> blocks stripped at raw-text stage"
  - "verify-build.mjs extended with 15-entry EXPECTED_PAGES list (WARN-only, hardens in Plan 05)"
affects: [02-02, 02-03, 02-04, 02-05, 05-verify]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Split decompose/unwrap loops for HTML cleanup: decompose() for script/style/frameset/frame, unwrap() for font tags"
    - "OOXML conditional strip as pre-parse regex pass (must run before BeautifulSoup to handle malformed conditionals)"
    - "WARN-only assertions in verify-build.mjs for future-wave content pages (flipped to hard fail in Plan 05)"

key-files:
  created: []
  modified:
    - scripts/extract_frontpage.py
    - scripts/verify-build.mjs

key-decisions:
  - "unwrap() not decompose() for <font> tags — FrontPage wraps nearly all visible text in <font> elements; decompose() silently deleted content (Pitfall 1)"
  - "OOXML <![if]> strip at raw-text stage (Step 2.5) not via BeautifulSoup — these conditional blocks are malformed SGML that html.parser cannot reliably identify"
  - "EXPECTED_PAGES uses WARN not fail() in Wave 0 — content pages do not exist yet; harness is declared for later waves"

patterns-established:
  - "Pattern: Two-loop HTML cleanup — decompose for content-free structural tags, unwrap for layout wrappers with content"
  - "Pattern: Raw-text regex pre-pass before BeautifulSoup for malformed/legacy HTML constructs (OOXML, WebBot)"

requirements-completed: []

# Metrics
duration: 15min
completed: 2026-10-18
---

# Phase 2 Plan 01: Extraction Bug Fix + Build Harness Extension Summary

**Fixed <font>-decompose bug (was silently deleting all FrontPage prose) and declared 15-page EXPECTED_PAGES list in verify-build.mjs (WARN-only for Wave 0)**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-10-18T18:05:00Z
- **Completed:** 2026-10-18T18:10:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Fixed the critical Pitfall 1 bug: `tag.decompose()` on `<font>` tags was deleting all FrontPage visible text; replaced with `tag.unwrap()` which preserves text children
- Added OOXML/VML conditional block strip (`<![if !mso]>...<![endif]>`) at the raw-text stage (Step 2.5), before BeautifulSoup parsing
- Verified on real source file (`generalidades_1.htm`): extraction now produces 13,248 bytes of clean UTF-8 Spanish prose (vs. near-empty output before fix)
- Extended `verify-build.mjs` with `EXPECTED_PAGES` array of 15 entries (home + 14 content sections), with WARN-only behavior for Wave 0; walk-skeleton build stays GREEN

## Task Commits

1. **Task 1: Fix extraction script** - `d905ac8` (fix)
2. **Task 2: Extend verify-build.mjs** - `6528471` (feat)

**Plan metadata:** (see below — docs commit)

## Files Created/Modified

- `/Users/warmeta/Projects/vetmyc/scripts/extract_frontpage.py` - Split Step 5 into decompose loop (script/style/frameset/frame) + unwrap loop (font); added Step 2.5 OOXML regex; updated docstring
- `/Users/warmeta/Projects/vetmyc/scripts/verify-build.mjs` - Added `const EXPECTED_PAGES` array (15 entries) after `DIST_EN_HTML` declaration; added Assertion 6 loop (WARN-only) before Summary section

## Decisions Made

- `unwrap()` for `<font>` tags: FrontPage HTML wraps virtually all body text in `<font color="..." face="...">` elements. `decompose()` removes the element AND its children — destroying all content. `unwrap()` removes only the element tag itself, leaving text nodes intact. This is the critical fix for Plans 03/04 to produce non-empty markdown.
- OOXML strip before parsing: `<![if !mso]>...</![endif]>` constructs are valid in IE's extension of HTML but are not proper SGML. BeautifulSoup's `html.parser` treats them as text nodes with garbage surrounding angle brackets. Stripping with regex before soup parse is cleaner and guaranteed to work regardless of nesting.
- WARN not fail in EXPECTED_PAGES loop: The walking skeleton only builds `index.html` and `en/index.html`. Content pages are built in Plans 02-04. Making the loop emit `fail()` would break the harness before content exists. Plan 05 Task 3 upgrades to hard fail.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- Test 4 in the plan's behavior section (`grep -rP "[\x80-\xFF]"` returning exit code 0) appears to describe the WRONG success condition — a properly UTF-8 encoded file with accented characters WILL contain bytes in the \x80-\xFF range as valid multi-byte UTF-8 sequences. The automated verify command in the plan prompt does NOT include this grep check; the file was confirmed as valid UTF-8 via Python's strict decode. This is a documentation ambiguity in the plan, not a script issue. The critical tests (file size > 2000 chars, no OOXML artifacts, Spanish prose present) all pass.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Plans 02-03 (content layout components) and 02-04 (FrontPage content extraction runs) are now unblocked
- `scripts/extract_frontpage.py` is ready for batch use across all 14 source .htm files
- `scripts/verify-build.mjs` will progressively turn WARN lines into PASS lines as content pages are built

---
*Phase: 02-spanish-content-migration*
*Completed: 2026-10-18*
