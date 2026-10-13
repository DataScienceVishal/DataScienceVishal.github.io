# Vishal Khan, portfolio

The source of [vishalkhan.me](https://vishalkhan.me/). One static page, written
as a lab notebook: each project is a dated entry that says what was expected
before the work, what was measured, and where the work stops. React 19, Vite 7,
Tailwind v4, prerendered at build time and served from GitHub Pages.

```bash
npm install
npm run dev                      # http://localhost:5173
npm run build && npm run preview # the production page
npm run test:e2e                 # Playwright and axe, against the production build
npm run check:claims             # re-reads every cited source over the network
npm run fonts                    # re-subsets the three faces (needs Python and fontTools)
```

`npm run lint` is `tsc -b`, which typechecks the app and the Node configs.

## Where the numbers live

Every measured figure on the page is in [src/data/figures.ts](src/data/figures.ts),
once, with the file it was read from and the day it was read. The entries in
[src/data/entries.ts](src/data/entries.ts) interpolate from it, and so do the
scales drawn beside them, so a sentence and its drawing cannot disagree.

[src/data/sources.ts](src/data/sources.ts) says where each figure came from and
which strings that source has to keep containing. `npm run check:claims`
fetches every source and fails if one has stopped saying what the page says. A
scheduled workflow runs it every Monday, alongside a lychee check of every link
on the built page.

That check exists because this page drifted. On 12 October 2026 the live site
still said the twin had 370 tests, 87 documents and a Railway backend, and that
the Graduate route lasts two years. The twin's CI said 390, its readiness
endpoint said 89, its rewrite pointed at Azure Container Apps, and GOV.UK says
18 months for anyone applying from 1 January 2027. Nothing on the page was
wrong when it was written. Nothing noticed when it became wrong.

## Build

`npm run build` runs four steps:

1. `tsc -b`.
2. `vite build`, the client bundle.
3. `vite build --ssr src/entry-server.tsx`, a server bundle used once.
4. `node scripts/prerender.mjs`, which renders the app to HTML, puts it in
   `dist/index.html`, inlines the stylesheet and deletes the server bundle.

The page ships as real markup, so it paints before any JavaScript runs and
crawlers see the content. The prerender step also fails the build when an
in-page link has no target, when a link opens a new tab without
`rel=noopener`, or when the copy uses a character the font subset does not
contain. The last one is also how an en or em dash gets caught.

## The design

The design system, with every token and the reasons behind it, is written up in
[DESIGN.md](DESIGN.md).

- **Paper.** Cool white ruled in a fine blue square, a red margin rule down the
  whole page carrying the dates, blue-black ink. The dark page is the same
  notebook on black paper in white ink. It follows the OS until the reader
  presses the toggle, and an inline script in `<head>` applies the choice
  before first paint, so there is no flash.
- **Type.** Archivo, narrowed on its width axis, for headings and the notebook's
  printed furniture. Atkinson Hyperlegible Next for everything read as prose:
  it was drawn so that 1, l and I, and 0 and O, cannot be mistaken for each
  other, which matters on a page of figures. Its slashed zero is 0.649em wide
  against a 0.45em average letter, so measures are set in em rather than ch,
  which was letting 92 characters onto a line.
- **Motion.** The page ships drawn. Every figure, every highlight and the whole
  margin rule are in the prerendered HTML, so a reader without script, or who
  asked for less motion, gets the finished notebook, and for them the effects
  code is never fetched. For everyone else, once the page is idle, a lazy chunk
  with GSAP and its ScrollTrigger plugin (45 KiB over the wire) draws what the
  reader has not reached yet, tied to scroll position, so it runs backwards
  when they scroll up. The red margin rule fills down the page as they read.
  Each figure is ruled, ticked and filled in as it arrives, and then its red
  measured mark travels from where the expectation was to where the
  measurement landed. The one measured phrase in each entry gets a highlighter
  stroke. Anything already on screen when the effects start is left alone, and
  in those figures the mark keeps travelling on a CSS scroll-driven animation
  instead. On wide screens an entry's date and name stay in the margin while
  it is read, which is `position: sticky` and not motion. Behind page one,
  specks of ink drift over the paper, joined by faint lines where two come
  close, and part around the pointer; they are erased from every line of
  text, so the writing always sits on bare paper. Once a 3D model is live, it
  turns with its plate's scroll position, leans a little toward the pointer,
  and moves on its own: the head looks slowly around, the brain and the board
  turn like objects on a turntable, and each gives off particles from its own
  surface. Nothing on the page fades in.

Starting the effects takes one task of about 80 ms on a phone-speed CPU
(Chromium throttled to a quarter speed). It took about 200 ms until every read
was moved ahead of every write in
[src/motion/effects.ts](src/motion/effects.ts): GSAP reads a part's transform
the first time it touches it, and reading one part straight after drawing
another made the browser lay the page out again, once for each of some fifty
parts.

## The 3D plates

The three models are taped into the notebook as dark prints. Each plate always
has a still: a render of the live model from the same stage, framing and
lights, flattened onto the print's own colour. The live model only replaces it
when it can do so cheaply:

| Device | What happens |
| --- | --- |
| Mouse and a normal connection | The model mounts after the first mouse movement, wheel or key press, once the plate is within a screen |
| Phone, tablet, Save-Data or 2g | The still stays, with a button that names the file size before anyone pays it |
| Reduced motion, or no WebGL | The still is the whole plate |

A live plate draws continuously only while it is on screen and the tab is in
front, because that is the only time its own motion and its particles change
anything. Everywhere else it draws on demand, when scroll or the pointer asks.
The particles are scattered over the model's real surface once the page is
idle, and from then on the GPU moves them: the only work on the CPU each frame
is handing it the time.

This is what moved mobile Lighthouse off 43. Before it, the hero model mounted
during the window Lighthouse scores, and one throttled run spent 7.2 s of main
thread in the 3D chunk. three.js, the loaders and the scroll machinery now sit
in their own lazy chunk that most phone visitors never download.

The stills are made by rendering the stage in Playwright with a transparent
background, then compositing onto `#151c27`. With the alpha channel kept, the
head was 118 kB because of hundreds of thin wires; flat, it is 34 kB.
Regenerate all three whenever a model, the grade, the lights or a base pose
change, or the hand-off from still to canvas will jump.

| Plate | Model | Credit |
| --- | --- | --- |
| 1, page one | `robot.glb`, 0.98 MB | [Robot girl with hair wires](https://sketchfab.com/3d-models/robot-girl-with-hair-wires-ccaa2e655374415c84bc1bb1b177681a) by [GR-video](https://sketchfab.com/grvideotv), CC BY 4.0 |
| 2, the twin | `brain.glb`, 78 kB | [Neural Networks of the Brain](https://sketchfab.com/3d-models/neural-networks-of-the-brain-fa48173d4532407c9c2a4ba06a9bcd2d) by [Universal Design for Learning](https://sketchfab.com/UDL), CC BY 4.0 |
| 3, earlier work | `chess.glb`, 12.1 MB | [A Beautiful Game](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/ABeautifulGame) by Moeen Sayed and Mujtaba Sayed, glTF conversion by Ed Mackey, CC BY 4.0 |

Draco and KTX2 decoders are self hosted under `public/decoders`, so the page
depends on no third party at runtime. `src/components/three/EndoStage.tsx` is
an earlier hero made from primitives. Nothing imports it.

## Quality checks

- `tests/e2e/` runs in CI before every deploy: axe with the WCAG 2.2 AA rules in
  both themes at phone and desktop widths, keyboard focus, reduced motion,
  sideways scroll at six widths, the theme toggle, the copy button, the 3D
  loading policy above, a live plate changing between two frames with no
  input and going still once scrolled away, page one's specks (nothing
  painted under the text, nothing drawn off screen), and the scroll effects. Those are checked against the
  same page with reduced motion, where the markup is the drawing: nothing on
  screen is undrawn when they start, every figure is drawn in full once read
  past, and with reduced motion their chunk is never requested. It needs no
  network.
- Lighthouse CI runs on every push to main against the built `dist/`, with the
  playbook's thresholds in [lighthouserc.json](lighthouserc.json).
- The page measures itself in the footer: largest paint, layout shift and the
  slowest response to a click or key, read by the visitor's own browser with
  `web-vitals`. Nothing is sent anywhere.

## Measured

Lighthouse 13.5.0 in Brave's headless Chromium 155, on 12 October 2026. This
build was measured as a production build served locally by `vite preview`, five
mobile runs and two desktop runs. The before rows are the live site, measured
the same way that morning, before any of this.

| | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mobile, live site before | 43, 43 | 100 | 100 | 100 | 9.3 s | 1,870 to 7,890 ms | 0 |
| Mobile, this build | 64, 98, 98, 98, 99 | 100 | 100 | 100 | 2.1 to 2.3 s | 0 to 100 ms | 0 |
| Desktop, live site before | 90 | 100 | 100 | 100 | 1.6 s | 180 ms | 0 |
| Desktop, this build | 100, 100 | 100 | 100 | 100 | 0.5 s | 0 ms | 0 |

The 64 was the first run after the server restarted: 922 ms of blocking time
and the largest paint at 3.8 s, nearly all of it React taking over the
prerendered page. The four runs after it did not repeat that, and the ranges in
the row are theirs. On a phone the largest paint is the first paragraph of the
bio. Before the bio moved onto page one and the effects went in, three mobile
runs measured the same way gave 99 each, with the largest paint at 1.9 to 2.1 s.
Page one's specks keep drawing while the page is scored, and on a throttled
phone their frames add up to as much as half a second of main thread, spread
across the run in pieces too short to count as blocking.

The first load is 251 KiB, down from 1,568 KiB, because the 3D layer is no
longer on it. 47 KiB of that is the scroll effects and page one's specks,
fetched once the page is idle and never with reduced motion. A localhost server has almost no time to
first byte, so the live numbers will come out a little worse than these and
should be re-measured after the deploy.

Lighthouse CI's own runner (Lighthouse 12.6.1) gave 99, 99 and 99 on three
mobile runs of this build, with the largest paint at 2.1 s, at most 8 ms of
blocking time and no layout shift. Earlier builds of this redesign gave 86 and
37 on a cold first run there, which is why the CI job reports rather than
blocks. One earlier run measured a layout shift of 0.018, the bio moving when
the two web fonts arrived after the first paint; none of these did.

axe, through the test suite, finds no violations with the WCAG 2.2 AA and best
practice rules in either theme, at 390 and 1440 wide, with the working panels
open and closed. Every text colour clears 4.5:1 on its paper in both themes;
the ratios are in [DESIGN.md](DESIGN.md).

## What this does not do

- It has not been tested on a real phone, only in device emulation. That is
  the one item on the quality list that needs a person.
- The bio on page one is drafted from facts on the CV. It should be rewritten
  in my own words.
- The photo is my GitHub avatar, cropped and duotoned. A better one is wanted.
- No MSc modules or certificates are listed, because the CV names most of the
  certificates without an issuer or a date.
- No analytics, no server and no paid service of any kind.

## Licence

Code under MIT, see [LICENSE](LICENSE). The CV, the photograph and the written
copy are not covered, and the bundled models, fonts and decoders keep their own
licences: see [NOTICE.md](NOTICE.md).
