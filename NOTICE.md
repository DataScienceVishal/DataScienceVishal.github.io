# Notices

The MIT licence in [LICENSE](LICENSE) covers the source code in this
repository. It does not cover the bundled third-party assets below. Those stay
under their own licences, and anyone reusing them has to keep the attribution
and terms that come with them.

## 3D models, CC BY 4.0

| File | Work, author, source |
| --- | --- |
| `public/models/robot.glb` | [Robot girl with hair wires](https://sketchfab.com/3d-models/robot-girl-with-hair-wires-ccaa2e655374415c84bc1bb1b177681a) by [GR-video](https://sketchfab.com/grvideotv), on Sketchfab. Compressed and retinted here. |
| `public/models/brain.glb` | [Neural Networks of the Brain](https://sketchfab.com/3d-models/neural-networks-of-the-brain-fa48173d4532407c9c2a4ba06a9bcd2d) by [Universal Design for Learning](https://sketchfab.com/UDL), on Sketchfab. Compressed here. |
| `public/models/chess.glb` | [A Beautiful Game](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/ABeautifulGame) by Moeen Sayed and Mujtaba Sayed, glTF conversion by Ed Mackey, from the Khronos glTF sample assets. Compressed here. |
| `public/hero-figure.webp` | A render of `public/models/robot.glb`, so the credit for that model applies to it too. |

All three are modified from the originals: recompressed with Draco and KTX2,
and in the case of the wired head recoloured onto the site palette. Full
licence text: https://creativecommons.org/licenses/by/4.0/

## Fonts, SIL Open Font License 1.1

Bricolage Grotesque, IBM Plex Sans and IBM Plex Mono, subset to ASCII by
`scripts/subset_fonts.py`. Per-family copyright lines and the full licence text
are in [`public/fonts/OFL.txt`](public/fonts/OFL.txt).

## Decoders, Apache License 2.0

The Draco and Basis Universal decoders in `public/decoders/`, redistributed
unmodified. Details in [`public/decoders/NOTICE.txt`](public/decoders/NOTICE.txt).

## Libraries

Runtime and build dependencies are declared in `package.json` and are not
vendored into this repository. Each carries its own licence.
