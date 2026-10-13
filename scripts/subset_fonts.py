#!/usr/bin/env python3
"""
Subset the three faces to the characters this page can actually render.

The full latin subsets Fontsource ships carry a few hundred glyphs plus the
layout tables for all of them. This page uses ASCII and a handful of
typographic marks, and the two preloaded faces sit on the critical path, where
every kilobyte competes with the first paint on a throttled connection.

Run from the project root:  python3 scripts/subset_fonts.py
"""

from pathlib import Path
from fontTools.subset import main as subset_main
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "node_modules"
OUT = ROOT / "public" / "fonts"

# ASCII printable, the no-break space, the pound and degree signs, curly quotes
# and the ellipsis. No dashes beyond the hyphen: the writing rules ban them.
# Keep this in step with SUBSET in scripts/prerender.mjs, which fails the build
# when the page uses a character that is not in this list.
UNICODES = "U+0020-007E,U+00A0,U+00A3,U+00B0,U+2018-201D,U+2026"

FACES = [
    (
        SRC / "@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2",
        OUT / "archivo-latin-wdth-normal.woff2",
        # tnum, because the notebook's dates and figures are set in tabular
        # numerals; Archivo carries the wght and wdth axes in this one file.
        ["--layout-features=kern,liga,tnum,pnum"],
    ),
    (
        SRC / "@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2",
        OUT / "atkinson-hyperlegible-next-latin-wght-normal.woff2",
        ["--layout-features=kern,tnum,pnum"],
    ),
    (
        SRC / "@fontsource-variable/atkinson-hyperlegible-mono/files/atkinson-hyperlegible-mono-latin-wght-normal.woff2",
        OUT / "atkinson-hyperlegible-mono-latin-wght-normal.woff2",
        ["--layout-features=kern"],
    ),
]


# Archivo ships wght 100 to 900 and wdth 62 to 125, and the page uses weights
# 540 to 720 and widths 80 to 92. Cutting the axes to just past those cut the
# preloaded file from 46 kB to 26 kB. Keep src/index.css's @font-face ranges in
# step, and widen these before using a weight or width outside them.
AXIS_LIMITS = {
    "archivo-latin-wdth-normal.woff2": {"wght": (520, 740), "wdth": (78, 94)},
}


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
            # Variation axes are preserved by default: wght on all three faces,
            # and wdth on Archivo, which the headings and furniture narrow on.
            *extra,
            f"--output-file={dst}",
        ])
        limits = AXIS_LIMITS.get(dst.name)
        if limits:
            font = TTFont(dst)
            instancer.instantiateVariableFont(font, limits, inplace=True)
            font.flavor = "woff2"
            font.save(dst)
        after = dst.stat().st_size
        pct = 100 - round(after / before * 100)
        print(f"{dst.name:48s} {before // 1024:>4} kB -> {after // 1024:>3} kB  ({pct}% smaller)")


if __name__ == "__main__":
    main()
