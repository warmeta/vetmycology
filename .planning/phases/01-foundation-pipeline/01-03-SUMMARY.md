---
phase: 01-foundation-pipeline
plan: 03
subsystem: testing
tags: [python, beautifulsoup4, markdownify, iso-8859-1, utf-8, extraction, frontpage, tdd]

requires:
  - phase: 01-foundation-pipeline
    provides: "01-01 and 01-RESEARCH.md: Pattern 6 extraction pipeline design, Pitfall 5 (WebBot > in comment body), package legitimacy audit (beautifulsoup4, markdownify approved)"

provides:
  - "scripts/extract_frontpage.py: ISO-8859-1 FrontPage .htm to UTF-8 Markdown converter (Pattern 6 pipeline)"
  - "scripts/verify_utf8.py: strict UTF-8 codec verifier (errors='strict') replacing the byte-range grep heuristic"
  - "scripts/requirements.txt: pinned Python deps beautifulsoup4>=4.15.0 markdownify>=1.2.3"
  - "scripts/README.md: install, usage, and rationale for why grep is wrong for Spanish UTF-8 verification"
  - "tests/fixtures/sample_frontpage.htm: ISO-8859-1 fixture covering all FrontPage artifact classes"
  - "tests/fixtures/expected_sample.md: hand-authored expected UTF-8 Markdown output"
  - "tests/test_extract_frontpage.sh: executable round-trip fixture test — FOUND-04 validated"

affects: [02-content-migration, phase-2]

tech-stack:
  added: [beautifulsoup4==4.15.0, markdownify==1.2.3, html.unescape (stdlib)]
  patterns:
    - "Pattern 6 pipeline: regex pre-pass (.*? DOTALL) BEFORE BeautifulSoup — required for WebBot > inside comment body"
    - "verify_utf8.py canonical check: open(path, encoding='utf-8', errors='strict') — not raw byte grep"

key-files:
  created:
    - scripts/extract_frontpage.py
    - scripts/verify_utf8.py
    - scripts/requirements.txt
    - scripts/README.md
    - tests/fixtures/sample_frontpage.htm
    - tests/fixtures/expected_sample.md
    - tests/test_extract_frontpage.sh
  modified: []

key-decisions:
  - "Use .*? with re.DOTALL for webbot/mstheme/mstable regex — [^>]* from RESEARCH.md Pattern 6 fails when WebBot comment contains > inside body (Pitfall 5 exercised by fixture)"
  - "venv resolution in test script: prefer .venv/bin/python3 when bs4 is present — dev machine has pip3->3.11 but python3->3.12 mismatch"

patterns-established:
  - "Pattern 6: 9-step FrontPage extraction pipeline — all Phase 2 batch extraction follows this pattern"
  - "TDD fixture contract: expected_sample.md is the canonical contract; extractor must match it byte-for-byte, never edit the fixture to match the extractor"

requirements-completed: [FOUND-04]

duration: 25min
completed: 2026-10-06
---

# Phase 1 Plan 03: FrontPage Extraction Pipeline Summary

**Python 3 FrontPage ISO-8859-1 to UTF-8 Markdown pipeline with BeautifulSoup4 + markdownify, fixture round-trip test, and strict UTF-8 codec verifier replacing the semantically-wrong byte-range grep criterion**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-10-06T17:10:00Z
- **Completed:** 2026-10-06T17:35:00Z
- **Tasks:** 2 (TDD: RED + GREEN)
- **Files modified:** 7 created

## Accomplishments

- ISO-8859-1 FrontPage extraction pipeline implemented end-to-end with correct regex ordering (webbot pre-pass BEFORE BeautifulSoup — Pitfall 5)
- Fixture covers all FrontPage artifact classes including WebBot comments with `>` inside the body — the load-bearing Pitfall 5 edge case
- Strict UTF-8 codec verifier (`verify_utf8.py`) replaces the ROADMAP's semantically-incorrect byte-range grep
- TDD round-trip test is GREEN: `diff -u /tmp/vetmyc_sample_out.md expected_sample.md` produces no output
- FOUND-04 satisfied — Phase 2 can batch-process all 14 real FrontPage source files

## Task Commits

Each task was committed atomically:

1. **Task 1: Create fixture, expected output, and shell test (RED)** - `6e2db40` (test)
2. **Task 2: Implement extract_frontpage.py and verify_utf8.py (GREEN)** - `ec1611c` (feat)

**Plan metadata:** (docs commit follows)

_Note: TDD tasks have two commits — test (RED) then feat (GREEN)_

## Files Created/Modified

- `scripts/extract_frontpage.py` — 9-step Pattern 6 pipeline: ISO-8859-1 decode, regex pre-pass, BeautifulSoup parse, Comment strip, tag decompose, html.unescape, markdownify ATX, U+00A0 normalize, UTF-8 write
- `scripts/verify_utf8.py` — strict UTF-8 codec check with errors='strict'; exits 0/1/2; catches UnicodeDecodeError with byte offsets
- `scripts/requirements.txt` — pinned beautifulsoup4>=4.15.0 markdownify>=1.2.3
- `scripts/README.md` — install, usage, verify_utf8 rationale with Pitfall 2 explanation
- `tests/fixtures/sample_frontpage.htm` — ISO-8859-1 binary fixture: webbot comment with `>` inside body, mstheme, mstable, _msstyle, font, frameset, nbsp, ntilde, #241 numeric entity, Spanish high bytes (ñ á é ü í ó as 0xF1 0xE1 0xE9 0xFC 0xED 0xF3)
- `tests/fixtures/expected_sample.md` — hand-authored expected output UTF-8 Markdown (ATX heading, Spanish prose, dash list)
- `tests/test_extract_frontpage.sh` — executable POSIX bash test (set -euo pipefail); auto-detects .venv/bin/python3

## Decisions Made

- Used `.*?` with `re.DOTALL` for all webbot/mstheme/mstable regex patterns instead of the `[^>]*` from RESEARCH.md Pattern 6 — the fixture's first webbot comment has `u-btn-url="nav.htm?action=prev>next"` with a `>` inside the quoted attribute value inside the comment body; `[^>]*` stops at that `>` and leaves one webbot comment unstripped
- Test script updated to prefer `.venv/bin/python3` when bs4 is available — dev machine has pip3 targeting Python 3.11 but `python3` is Python 3.12; the venv bridge is transparent to the test harness

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Webbot regex changed from `[^>]*` to `.*?` with DOTALL**
- **Found during:** Task 2 (implementing the extractor)
- **Issue:** RESEARCH.md Pattern 6 uses `r'<!--webbot[^>]*-->'`. The fixture's Navigation webbot comment contains a `>` character inside a quoted attribute value (`u-btn-url="nav.htm?action=prev>next"`). `[^>]*` stops at the embedded `>` and leaves one webbot comment unstripped in the output. This is exactly Pitfall 5 from 01-RESEARCH.md.
- **Fix:** Changed all three comment regexes to `r'<!--webbot.*?-->'`, `r'<!--mstheme.*?-->'`, `r'<!--mstable.*?-->'` with `re.DOTALL`. The `.*?` lazy match with DOTALL crosses the embedded `>` and consumes to the actual `-->` terminator.
- **Files modified:** scripts/extract_frontpage.py
- **Verification:** `grep -c "webbot" /tmp/out.md` returns 0; diff against expected_sample.md is empty
- **Committed in:** `ec1611c` (Task 2 commit)

**2. [Rule 3 - Blocking] Test script updated to prefer .venv Python**
- **Found during:** Task 2 (running the test)
- **Issue:** `pip3` on this machine installs to Python 3.11 while `python3` resolves to Python 3.12 (Homebrew version mismatch). `python3 scripts/extract_frontpage.py` would fail with `ModuleNotFoundError: No module named 'bs4'`. The plan's `pip install -r scripts/requirements.txt` step only installs to 3.11.
- **Fix:** Added venv detection to `tests/test_extract_frontpage.sh`: if `.venv/bin/python3` exists and imports `bs4`, use it; otherwise fall back to system `python3`. Created `.venv/` with the correct packages.
- **Files modified:** tests/test_extract_frontpage.sh
- **Verification:** Test passes with `.venv/bin/python3 scripts/extract_frontpage.py` invocation
- **Committed in:** `ec1611c` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both fixes are necessary for correctness. The regex fix is load-bearing — Pitfall 5 was documented in the research; the fixture intentionally exercises it. No scope creep.

## TDD Gate Compliance

- RED gate: `test(01-03)` commit `6e2db40` — fixture, expected output, and failing shell test
- GREEN gate: `feat(01-03)` commit `ec1611c` — extractor and verifier; test passes
- REFACTOR gate: not needed (implementation is clean)

## Issues Encountered

- Homebrew Python version split (pip3 → 3.11, python3 → 3.12) required creating a venv. This is a dev machine configuration issue, not a project code issue. The `.venv/` directory is in `.gitignore` and does not affect deployability.

## User Setup Required

None — no external service configuration required. To run the extraction pipeline:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt
bash tests/test_extract_frontpage.sh
```

## Next Phase Readiness

- Phase 2 (Spanish Content Migration) can now use `scripts/extract_frontpage.py` to batch-process all 14 real FrontPage source files
- `tests/test_extract_frontpage.sh` provides a regression harness for the extractor
- `scripts/verify_utf8.py` validates each extracted `.md` file after batch processing
- FOUND-04 is complete

---
*Phase: 01-foundation-pipeline*
*Completed: 2026-10-06*
