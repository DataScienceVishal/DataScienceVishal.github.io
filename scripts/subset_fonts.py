#!/usr/bin/env python3
"""
Subset the three faces to the characters this page can actually render.

The full latin subsets Fontsource ships carry roughly 330 glyphs plus the
kerning and layout tables for all of them. This page uses ASCII, and the two
preloaded faces were costing 124 kB on the critical path, competing with the
hero image for bandwidth on a throttled connection.

Run from the project root:  python3 scripts/subset_fonts.py
"""

from pathlib import Path
from fontTools.subset import main as subset_main

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "node_modules"
OUT = ROOT / "public" / "fonts"

# ASCII printable, plus the typographic quotes and the arrows the icon-free
# strings use. Everything the copy and any near-future edit of it needs.
UNICODES = "U+0020-007E,U+00A0,U+00A3,U+00B0,U+2018-201D,U+2013,U+2026,U+2192"

FACES = [
    (
        SRC / "@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wdth-normal.woff2",
        OUT / "bricolage-grotesque-latin-wdth-normal.woff2",
        ["--layout-features=kern,liga,calt"],
    ),
    (
        SRC / "@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2",
        OUT / "ibm-plex-sans-latin-wght-normal.woff2",
        ["--layout-features=kern,liga,calt"],
    ),
    (
        SRC / "@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2",
        OUT / "ibm-plex-mono-latin-400-normal.woff2",
        ["--layout-features=kern,liga,calt"],
    ),
    (
        SRC / "@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2",
        OUT / "ibm-plex-mono-latin-500-normal.woff2",
        ["--layout-features=kern,liga,calt"],
    ),
]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for src, dst, extra in FACES:
        if not src.exists():
            raise SystemExit(f"missing source font: {src}")
        before = src.stat().st_size
        subset_main([
            str(src),
            f"--unicodes={UNICODES}",
            "--flavor=woff2",
            "--no-hinting",
            "--desubroutinize",
            "--drop-tables+=DSIG",
            # Variation axes are preserved by default; the page needs wght on all
            # three faces and wdth on Bricolage for display emphasis.
            *extra,
            f"--output-file={dst}",
        ])
        after = dst.stat().st_size
        pct = 100 - round(after / before * 100)
        print(f"{dst.name:48s} {before // 1024:>4} kB -> {after // 1024:>3} kB  ({pct}% smaller)")


if __name__ == "__main__":
    main()
