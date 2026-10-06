#!/usr/bin/env python3
"""Strict UTF-8 codec verifier for extracted Markdown files.

Usage:
    python3 scripts/verify_utf8.py PATH

Exits:
    0 — file is valid strict UTF-8
    1 — file contains invalid UTF-8 byte sequences (UnicodeDecodeError)
    2 — file does not exist

This replaces the semantically-wrong byte-range grep heuristic from the ROADMAP.
See scripts/README.md for the full rationale.
"""

import sys
from pathlib import Path


def verify_utf8(path: Path) -> int:
    """Return exit code: 0 for clean, 1 for encoding error, 2 for missing file."""
    if not path.exists():
        print(f"ERROR: file not found: {path}", file=sys.stderr)
        return 2

    try:
        path.open(encoding='utf-8', errors='strict').read()
        print(f"UTF-8 clean: {path}")
        return 0
    except UnicodeDecodeError as e:
        print(
            f"ENCODING ERROR in {path}: {e}\n"
            f"  byte offset: {e.start}-{e.end}\n"
            f"  reason: {e.reason}",
            file=sys.stderr,
        )
        return 1


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} PATH", file=sys.stderr)
        sys.exit(2)

    exit_code = verify_utf8(Path(sys.argv[1]))
    sys.exit(exit_code)
