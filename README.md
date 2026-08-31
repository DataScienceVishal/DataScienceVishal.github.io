# Vishal Khan, portfolio

Static single page. React 19, Vite, Tailwind v4, Motion. Prerendered at build
time and deployed to Vercel as static files.

The stack matches the AI twin (`ai-professional-twin`), and the page is anchored
on the same `#0b0f19` so the two properties read as one identity.

**[DESIGN.md](DESIGN.md) is the token file.** Every colour, size, space, radius,
duration and curve on the page is defined there, along with the reference
analysis and the citation apparatus rules. Read it before changing anything, and
add a token there before using one.

## Running it

```bash
npm install
npm run dev
```

```bash
npm run build && npm run preview
```

`npm run lint` is a type check. `npm run fonts` re-subsets the three faces and
needs Python with fontTools.

## Build pipeline

`npm run build` does four things:

1. `tsc -b`, type check.
2. `vite build`, the client bundle.
3. `vite build --ssr src/entry-server.tsx`, a server bundle used once.
4. `node scripts/prerender.mjs`, which renders the app to HTML, injects it into
   `dist/index.html`, inlines the stylesheet, and deletes the server bundle.

The page ships as real markup rather than an empty `#root`. That takes first
paint off the JavaScript critical path, which is the one thing a client-rendered
SPA cannot do, and it means crawlers see the content. The client hydrates.

## How the citation apparatus works

Every material claim is wrapped in `<Claim source="...">`
([src/components/Claim.tsx](src/components/Claim.tsx)): the claim text gets a
dotted rule and a mono superscript marker. Hover or keyboard focus turns both to
the accent and surfaces the source name in an absolutely positioned label, so
nothing reflows. Under 768px the label is suppressed and the marker is a tap
target, because hover does not exist there.

Sources live in one registry, [src/data/sources.ts](src/data/sources.ts), keyed
by marker number. A source either has a URL or it does not:

- With a URL, the marker links straight to the repository, deployment or PDF.
- Without one, the marker links to that source's row in `Sources` at the foot of
  the page, where the reason it has no URL is written down.

So a marker never resolves to a dead page, and the two unpublished dissertations
are visibly unpublished rather than quietly linkless. To add a claim, add the
source to the registry and wrap the text; marker numbers, accessible names and
the reference list all follow.

Twelve claims on the page: four in the twin case study, four in the trajectory,
two in research, two in other work, none in the hero.

## The career graph

The head of Trajectory: a graph of the actual story, in
[CareerGraph.tsx](src/components/CareerGraph.tsx) from
[career.ts](src/data/career.ts). Time runs 2018 to 2027 across four ordinal bands,
Filings to Reporting to Pipelines to Models, so a job change reads as a rise. One
path steps through the roles, study runs as a lighter second track underneath,
and the path draws with scroll in both directions. The pointer picks the nearest
move and surfaces its readout.

The bands are a reading of the resume rather than a figure from it, so the graph
carries no numeric y axis that would imply otherwise. Dates and titles are exact.
It replaced a generated soroban, which replaced a downloaded wristwatch: the graph
wins because it is the story rather than an object standing in for it. See
[DESIGN.md](DESIGN.md) section 14.

## The cursor layer

Seven surfaces respond to the pointer, all through motion values in
[pointer.ts](src/motion/pointer.ts) so a mouse move never re-renders the tree:
the sentinel in the hero, the career graph, both line charts, the bar chart, both
calls to action, the contact rows, and the 3D chess set.

The **endoskeleton bust** ([EndoStage.tsx](src/components/three/EndoStage.tsx))
fills the hero's right column, which was empty at any width below 1280. About 75
meshes from primitives sharing 5 materials: cranium plates, brow, hinged jaw with
teeth, neck vertebrae with hydraulic rods, ribs, clavicles and shoulder joints,
with two emissive red optics. The head turns toward the pointer independently of
the body, and the optics blink once on any click.

It is authored geometry rather than a downloaded model, and not by preference: a
film endoskeleton is trademarked, every model of one online is an unlicensed
derivative, and Sketchfab requires OAuth for downloads. Authoring it also means it
sits exactly on the palette and owes no attribution.

**Primitives cannot reach film quality.** A photoreal endoskeleton is a sculpted
asset, and boxes and spheres will not get there however well they are tuned. If
you obtain a real one, drop the `.glb` in `public/models/` and set `model` in
`HERO_MODEL` in [content.ts](src/data/content.ts). It then gets the same scroll
rotation and cursor lean as the chess set, with the fit measured from its own
bounding box so any export scale frames correctly, and Draco and KTX2 both work
because the decoders are already self hosted. Keep it under about 8 MB, since it
sits above the fold. The click blink stays exclusive to the authored bust, because
it drives named materials.

Because it is 3D above the fold, [HeroFigure.tsx](src/components/HeroFigure.tsx)
reserves the frame in CSS and only mounts the canvas after first paint, so the
hero text is the largest paint and the 250 kB library never lands on the critical
path.

The retrieval path panel moved out of the hero and into the twin's own case
study, where it sits beside the project it documents, and now runs on first view
rather than on page load. Numbers and rules in
[DESIGN.md](DESIGN.md) section 13. Every effect pins to neutral under reduced
motion, and none of them is the only route to any information.

## The 3D layer

One object, bound to scroll position rather than to a timeline, so it moves
whenever the reader moves and stops when the reader stops. It does not loop. Full
rationale in [DESIGN.md](DESIGN.md) section 12.

| Object | Where | Source |
| --- | --- | --- |
| Endoskeleton bust | Hero | Authored from primitives |
| Wired head | Ask it something | Sketchfab, compressed 29 MB to 1.5 MB, retinted onto the palette |
| Chess set | Other work, beside the chess analytics entry | `ABeautifulGame`, Khronos glTF sample assets, CC BY 4.0, Ed Mackey and ASWF |

## Compressing a model, and where to put it

The pipeline that matters is one command:

```bash
npx @gltf-transform/cli optimize in.glb out.glb --compress draco --texture-compress webp --simplify true
```

Measured on the two models supplied: 29.06 MB to 1.51 MB, and 1.79 MB to 77 kB.
Inspect first with `gltf-transform inspect`, because the lever depends on where
the bytes are; the robot was 98 percent geometry, so texture compression would
have saved nothing. Use `webp` rather than `ktx2` unless you have the external
`ktx` binary installed, which is not a default.

**Size is not the constraint, position is.** A 1.5 MB Draco model in the hero
measured Performance 59 desktop and 49 mobile with a 12.5 s mobile LCP, because
unpacking 345,000 vertices is main-thread work that lands while the reader is
waiting. The same file below the fold, lazy-mounted, measured 100 desktop. Put
models below the fold.

Models arrive in their author's colours. `grade` on `ModelStage` remaps each
material's albedo along the page's own ramp by luminance, preserving metalness,
roughness and every texture map, so a bought asset belongs here instead of
importing two foreign hues.

None of this is on the critical path. Both scenes are `React.lazy` imports and a
scene mounts only when its frame is within one screen of the reader, so initial
load is **207 KiB** while the 3D layer and the chess model are **12.6 MB** that
most readers never request. Draco and KTX2 decoders are self hosted under
`/decoders`, because drei points Draco at a Google CDN by default. On a metered
connection or a 2g effective type the scene never mounts at all.

## Motion

Every graph is **bound to scroll position, not triggered by it**: both line
charts, the bar chart, the career graph and the retrieval path derive their drawn
state from `useDrawProgress` in [scroll.ts](src/motion/scroll.ts), a transform of
the element's own crossing of the viewport. They draw as you arrive and undraw if
you scroll back up, and are always fully drawn by the time the element is centred
and readable.

One orchestrated page-load sequence in the hero. Timings and curves are in [src/motion/tokens.ts](src/motion/tokens.ts),
mirroring DESIGN.md section 8.

The hero artifact deliberately does **not** animate in. It is the largest paint
on every viewport, so starting it at `opacity: 0` would put first paint behind
the animation clock. The evidence is simply there and the argument assembles
around it.

`LazyMotion` loads only the `domAnimation` feature set, and `strict` mode makes
the build fail if a full `motion.*` component reappears.

## Content rules

Facts come from `public/vishal-khan-resume.pdf` and the public repositories it
cites. Where the resume hedges with a tilde, the page keeps the hedge ("about
20%", not "20%").

Two deliberate departures:

- **370 tests, not 178.** The twin's README reports 370 (257 backend, 113
  frontend); the resume PDF still says 178. The page cites the README section
  that shows the current count. Update the resume and the two will agree.
- **No "four years in finance".** The resume supports Jul 2018 to Sep 2020 at
  PJRJ plus Jan to Aug 2021 at Aryan Care, which is under three years. The page
  uses date ranges instead of a year count.

## Assets

| File | What it is |
| --- | --- |
| `public/models/chess.glb` | 11.5 MB, Draco plus KTX2 ETC1S. CC BY 4.0, credited on the page. Lazy. |
| `public/decoders/` | Self hosted Draco and Basis decoders, 1.3 MB. Lazy. |
| `public/portrait.webp` | GitHub avatar, 460x460, duotoned into the palette. |
| `public/og-image.jpg` | Generated share card, same spine, palette and width-axis emphasis as the page. |
| `public/vishal-khan-resume.pdf` | Cited as source 4. |
| `public/fonts/*.woff2` | Subset to ASCII by `scripts/subset_fonts.py`. |

The hero is not an image. It is the twin's real retrieval path drawn as an
ordered list, in [HeroPipeline.tsx](src/components/HeroPipeline.tsx), with a
brass signal running its spine once on load. Every label and number on it is a
setting in that repository.

The three charts in Other work are redrawn from real measurements held in
[src/data/charts.ts](src/data/charts.ts): the CIFAR-10 training log, the churn
cutoff table, and the UK higher education test scores. Nothing there is
illustrative, and if a number cannot be pointed at in a public file it does not
go in that file.

## Before going live

1. Set the site origin in `index.html`, near the top, and make the canonical and
   `og:image` URLs absolute.
2. Replace `public/portrait.webp` with a headshot 1200px or wider. It is the only
   photographic asset on the page.
3. Decide whether the resume PDF should be served from this origin. It carries a
   phone number, and it is already public from the twin's `/resume/download`.
4. Add UK-HE-Completion-Risk-Classifier to the resume. The page carries it and
   cites the repository, and source 7 says plainly that it postdates the resume.

## Measured

Lighthouse against the production build, Chrome 149 headless. Mobile is the
throttled 4G profile.

| | Performance | Accessibility | Best practices | SEO | LCP | FCP |
| --- | --- | --- | --- | --- | --- | --- |
| Desktop | 75 to 79 | 100 | 100 | 100 | 0.7 s | 0.4 s |
| Mobile, throttled | 80 | 100 | 100 | 100 | 3.8 s | 1.7 s |

CLS is 0 on both. TBT is 330 to 620 ms and initial transfer is 474 KiB.

**Performance dropped from 100 and 97 to the high seventies when the endoskeleton
moved into the hero, and that is not recoverable while it stays there.** A WebGL
scene above the fold has to parse a 260 kB library and initialise a scene inside
exactly the window Lighthouse measures. Deferring the mount to `requestIdleCallback`
with a 2.4 s timeout, dropping the environment cube from 192 to 64 and capping
`dpr` at 1.5 were all tried and none of them moved the number.

The remedy, if the score matters more than the placement, is to move the figure
below the fold so it lazy-mounts on approach like the chess set. That configuration
measured 97 and 100. It is a one-line change of where `HeroFigure` is rendered.
axe-core reports zero violations across wcag2a, wcag2aa, wcag21a, wcag21aa and
best-practice rules at 375, 768, 1024 and 1440, with the 3D scene mounted, the
graph drawn and every chart drawn: 51 passes at each width. `scrollWidth` equals
the viewport at all four widths.

Best practices reached 100 on mobile when the hero screenshot was replaced by the
drawn pipeline: the `image-size-responsive` flag it was costing went with it,
because the page no longer ships a raster hero at all.
