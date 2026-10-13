# Notices

The MIT licence in [LICENSE](LICENSE) covers the source code in this
repository. It does not cover the bundled third-party assets below. Those stay
under their own licences, and anyone reusing them has to keep the attribution
and terms that come with them.

## 3D models, CC BY 4.0

| File | Work, author, source |
| --- | --- |
| `public/models/robot.glb` | [Robot girl with hair wires](https://sketchfab.com/3d-models/robot-girl-with-hair-wires-ccaa2e655374415c84bc1bb1b177681a) by [GR-video](https://sketchfab.com/grvideotv), on Sketchfab. Compressed and recoloured here. |
| `public/models/brain.glb` | [Neural Networks of the Brain](https://sketchfab.com/3d-models/neural-networks-of-the-brain-fa48173d4532407c9c2a4ba06a9bcd2d) by [Universal Design for Learning](https://sketchfab.com/UDL), on Sketchfab. Compressed and recoloured here. |
| `public/models/chess.glb` | [A Beautiful Game](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/ABeautifulGame) by Moeen Sayed and Mujtaba Sayed, glTF conversion by Ed Mackey, from the Khronos glTF sample assets. Compressed here. |
| `public/plates/head.webp`, `brain.webp`, `chess.webp` | Renders of the three models above, made from this site's own 3D stage, so each model's credit applies to its still. |

All three models are modified from the originals: recompressed with Draco and
KTX2, and the head and the brain recoloured onto the site's palette. Full
licence text: https://creativecommons.org/licenses/by/4.0/

## Fonts, SIL Open Font License 1.1

Archivo, Atkinson Hyperlegible Next and Atkinson Hyperlegible Mono, subset by
`scripts/subset_fonts.py`. Per-family copyright lines and the full licence text
are in [`public/fonts/OFL.txt`](public/fonts/OFL.txt).

## Decoders, Apache License 2.0

The Draco and Basis Universal decoders in `public/decoders/`, redistributed
unmodified. Details in [`public/decoders/NOTICE.txt`](public/decoders/NOTICE.txt).

## Libraries

Runtime and build dependencies are declared in `package.json` and are not
vendored into this repository. Each carries its own licence.

One runtime dependency is not under an open-source licence. GSAP 3.15.0 and
its ScrollTrigger plugin, which the built page bundles into its scroll-effects
chunk, are under GreenSock's standard "no charge" licence:
https://gsap.com/standard-license. The other runtime dependencies are under
MIT, except `web-vitals`, which is under the Apache License 2.0.

## Content the MIT licence does not cover

MIT covers the code in this repository. It does not grant any licence over the
following, which are personal to Vishal Khan and reserved:

- `public/vishal-khan-resume.pdf` and any other CV or resume file
- `public/portrait.webp` and any other photograph of the author
- The written copy on the page: biography, project write-ups and career history

You are welcome to read, fork and learn from the code. Please do not reuse the
resume, the photograph or the biographical text.
