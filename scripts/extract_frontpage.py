#!/usr/bin/env python3
"""Extract FrontPage ISO-8859-1 .htm files to clean UTF-8 Markdown.

Usage:
    python3 scripts/extract_frontpage.py INPUT.htm OUTPUT.md
    python3 scripts/extract_frontpage.py INPUT.htm   # writes INPUT.md alongside input

Pipeline (Pattern 6 from 01-RESEARCH.md):
  1. Read bytes, decode iso-8859-1
  2. Regex-strip webbot/mstheme/mstable comments and _msstyle attrs BEFORE parsing
     (load-bearing ordering — Pitfall 5: WebBot comments can contain > inside body)
  2.5. Regex-strip OOXML/VML conditional blocks (<![if ...]>...</![endif]>) BEFORE parsing
     (Pitfall 6: these survive BeautifulSoup and pollute extracted text)
  3. BeautifulSoup parse with html.parser
  4. Strip remaining Comment nodes
  5a. Decompose script, style, frameset, frame tags (removes element AND content — safe,
      these tags contain no visible content worth preserving)
  5b. Unwrap font tags (removes wrapper element, PRESERVES text children — critical fix for
      Pitfall 1: FrontPage wraps nearly all visible text in <font color="..." face="...">;
      decompose() would silently delete all content)
  6. Extract body content, html.unescape() entities
  7. markdownify with heading_style='ATX', bullets='-'
  8. Replace U+00A0 with regular space, collapse 3+ blank lines
  9. Write UTF-8 output
"""

import sys
import re
import html
from pathlib import Path

from bs4 import BeautifulSoup, Comment
from markdownify import markdownify as md


def extract(input_path: Path, output_path: Path) -> None:
    """Convert a FrontPage ISO-8859-1 htm file to clean UTF-8 Markdown."""

    # Step 1: Read as ISO-8859-1 bytes, decode to Unicode
    raw = input_path.read_bytes()
    text = raw.decode('iso-8859-1')

    # Step 2: Strip FrontPage comment artifacts BEFORE parsing (Pitfall 5 — load-bearing).
    # WebBot comments can contain > inside the comment body, so [^>]* fails.
    # Use .*? with re.DOTALL so we match across lines and through embedded > characters.
    text = re.sub(r'<!--webbot.*?-->', '', text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r'<!--mstheme.*?-->', '', text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r'<!--mstable.*?-->', '', text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r'class="_msstyle[^"]*"', '', text, flags=re.IGNORECASE)

    # Step 2.5: Strip OOXML/VML conditional blocks BEFORE parsing (Pitfall 6).
    # FrontPage/Word HTML uses <![if !mso]>...</![endif]> constructs for Office-specific
    # formatting that BeautifulSoup cannot reliably parse out later.
    text = re.sub(r'<!\[if[^\]]*\]>(.*?)<!\[endif\]>', '', text, flags=re.IGNORECASE | re.DOTALL)

    # Step 3: Parse with BeautifulSoup using html.parser (stdlib — no lxml dependency)
    soup = BeautifulSoup(text, 'html.parser')

    # Step 4: Strip remaining HTML comment nodes
    for comment in soup.find_all(string=lambda t: isinstance(t, Comment)):
        comment.extract()

    # Step 5a: Decompose layout/style cruft tags (removes element AND content — safe because
    # these tags contain no visible text worth preserving).
    for tag in soup.find_all(['script', 'style', 'frameset', 'frame']):
        tag.decompose()

    # Step 5b: Unwrap <font> tags — removes the wrapper element but PRESERVES text children.
    # FrontPage wraps nearly all visible text in <font color="..." face="..."> elements.
    # Using decompose() here (the old bug) silently deleted all content (Pitfall 1).
    for tag in soup.find_all('font'):
        tag.unwrap()

    # Step 6: Extract body (fall back to full soup if no body element)
    body = soup.find('body') or soup

    # Convert to HTML string, then decode all HTML entities (e.g., &ntilde; → ñ, &#241; → ñ)
    inner_html = str(body)
    inner_html = html.unescape(inner_html)

    # Step 7: Convert to Markdown (ATX headings, dash bullets)
    result = md(inner_html, heading_style='ATX', bullets='-')

    # Step 8: Post-process — replace non-breaking space (U+00A0), collapse excess blank lines
    result = result.replace(' ', ' ')
    result = re.sub(r'\n{3,}', '\n\n', result)
    result = result.strip()

    # Step 9: Write UTF-8 output
    output_path.write_text(result, encoding='utf-8')
    print(f"Extracted: {input_path.name} -> {output_path.name}")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} INPUT.htm [OUTPUT.md]", file=sys.stderr)
        sys.exit(1)

    src = Path(sys.argv[1])
    dst = Path(sys.argv[2]) if len(sys.argv) > 2 else src.with_suffix('.md')
    extract(src, dst)
