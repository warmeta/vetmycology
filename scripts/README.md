# Scripts — VetMyc Extraction Tooling

Python 3 scripts for converting FrontPage ISO-8859-1 `.htm` files to clean UTF-8 Markdown.
These are **build-time tools only** — they run on the developer's machine and are never deployed.

## Installation

Install the required Python packages into a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate   # macOS/Linux
pip install -r scripts/requirements.txt
```

Or install globally (if `--break-system-packages` is needed on your system):

```bash
pip install -r scripts/requirements.txt
```

Requirements:
- `beautifulsoup4 >= 4.15.0` — HTML parsing and tag stripping
- `markdownify >= 1.2.3` — Semantic HTML to Markdown conversion
- `html.unescape` — HTML entity decoding (Python stdlib, no install needed)

## Usage

### Extract a single FrontPage htm file to Markdown

```bash
python3 scripts/extract_frontpage.py INPUT.htm OUTPUT.md
```

If `OUTPUT.md` is omitted, the output file is written alongside `INPUT.htm` with a `.md` suffix:

```bash
python3 scripts/extract_frontpage.py source/patologias.htm
# writes: source/patologias.md
```

The script converts a FrontPage ISO-8859-1 `.htm` file to clean UTF-8 Markdown by:

1. Reading the file as raw bytes and decoding with `iso-8859-1`
2. Stripping FrontPage WebBot, MSTheme, and MStable comment artifacts (regex pre-pass, BEFORE HTML parsing — required by Pitfall 5)
3. Parsing with BeautifulSoup (`html.parser`)
4. Stripping remaining HTML comment nodes
5. Decomposing `<script>`, `<style>`, `<font>`, `<frameset>`, and `<frame>` tags
6. Extracting body content and decoding all HTML entities with `html.unescape()`
7. Converting to Markdown using markdownify (`heading_style='ATX'`, `bullets='-'`)
8. Replacing U+00A0 (non-breaking space) with regular space; collapsing 3+ blank lines to 2
9. Writing UTF-8 output

### Verify a file is strict UTF-8

```bash
python3 scripts/verify_utf8.py OUTPUT.md
```

Exits 0 on success, 1 on encoding error, 2 if the file does not exist.

## Why verify_utf8.py replaces the ROADMAP's byte-range grep

The ROADMAP's original success criterion for FOUND-04 was:

```bash
grep -rP "[\x80-\xFF]" output.md
```

This check is wrong for Spanish content. Valid UTF-8 encodes Spanish characters as multi-byte
sequences where every byte is in the `0x80`–`0xFF` range:

- `ñ` (U+00F1) → `\xc3\xb1` — both bytes are in `0x80`–`0xFF`
- `á` (U+00E1) → `\xc3\xa1` — both bytes are in `0x80`–`0xFF`
- `ü` (U+00FC) → `\xc3\xbc` — both bytes are in `0x80`–`0xFF`

Running `grep -rP "[\x80-\xFF]"` on a correct UTF-8 Spanish file **will always find matches**,
making it a false-positive machine for this project. The grep is meaningful only if you expect
pure 7-bit ASCII output — which this site explicitly does not produce.

The canonical correct check is Python's strict UTF-8 codec:

```python
open(path, encoding='utf-8', errors='strict').read()
```

A `UnicodeDecodeError` means real encoding corruption (a leftover ISO-8859-1 byte sequence that
is invalid UTF-8). Successful completion means the file is clean UTF-8, regardless of which
bytes are present. `verify_utf8.py` implements exactly this check.

## Running the fixture test

The round-trip fixture test proves the extraction pipeline is deterministic:

```bash
bash tests/test_extract_frontpage.sh
```

The test:
1. Runs `extract_frontpage.py` on `tests/fixtures/sample_frontpage.htm`
2. Diffs the output against `tests/fixtures/expected_sample.md`
3. Runs `verify_utf8.py` on the output to confirm strict UTF-8

The fixture covers every FrontPage artifact class: WebBot comments (including comments with `>`
inside the body — the Pitfall 5 case), MSTheme comments, MStable comments, `_msstyle` class
attributes, `<font>` tags, `<frameset>`/`<frame>` tags, `&nbsp;` entities, named Spanish
entities (`&ntilde;`, `&aacute;`, etc.), and numeric entities (`&#241;`).
