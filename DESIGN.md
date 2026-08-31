# DESIGN.md

The token file. Every colour, size, space, radius, duration and curve used in the
build is defined here. Nothing is introduced in a component that is not in this
file. If something genuinely needs a new token, it is added here first.

This exists because long builds drift. Around section five an agent starts
inventing hex codes and the page reverts to generic. Read this at the start of
every session.

Implemented in `src/index.css` under `@theme` and `:root`. The names below are
the CSS variable names, minus the Tailwind `--color-` prefix.

---

## 1. Reference analysis

Four recordings in `./references/`. What each does well, what principle came
across, and what stayed behind.

### DayNight Studio, daynight.co.uk

**The one thing:** the type scale jumps violently, roughly 14px body straight to
64px display with tracking pulled to about -0.03em, and exactly one word in the
headline is set in italic of the same family and the accent colour. No second
family, no gradient text, no outline text. The emphasis is done with slope and
hue inside one typeface.

**Taken:** the hard scale jump and single-family italic emphasis. The page has no
intermediate display sizes between the section heading and body, so headings
land instead of easing in. The accent-on-one-word move is used once, on the hero
thesis.

**Left behind:** the generative halftone sphere, the amber CTA on a dark input
field, the bottom stat strip (`SINCE 2023 / FOCUS / AVG. LIFT 312% conversion`),
and the sticky `£500 live website in 48 hours` claim pill. Those are conversion
furniture for an agency selling a service. This page is not selling a service,
and the stat strip is the big-number-with-small-label pattern the brief bans.

### Locomotive, lisa.locomotive.ca

**The one thing:** the type is deliberately tiny and low contrast, roughly 15px
at maybe 60 percent opacity, and it never competes with the subject. The nav is
three items. The calls to action are four small unemphasised pills reading
`Start a project`, `Join the team`, `Drop a quick word`, `Discover our culture`.
The restraint is the craft: it trusts the visual completely and refuses to shout
anywhere.

**Taken:** suggested openers as small, quiet, equal-weight pills rather than as a
styled CTA block, and the discipline of letting the subject carry the page while
the type stays small. The `Ask it something` section uses that grammar directly.

**Left behind:** the cursor-tracked 3D head, the block caret in the greeting, the
first-person assistant voice, and the near-white background. The caret is a
typewriter tell the brief bans, and a portfolio that talks in the voice of a bot
is the failure mode the acceptance test is checking for.

### Porsche Motorsport, racing.porsche.com

**The one thing:** annotation. Small dark cards sit on the car reading
`Cockpit / Mission Control.` and `Brakes / Built to brake late.`, each a title
plus one short line plus an expand affordance. The page labels its own artifact
in place, so a reader learns what they are looking at without leaving the image.

**Taken:** the annotation principle, and it is the reason the hero exists in the
form it does. The hero artifact is a real answer from the twin, and a single
callout points at the source chips inside it. One callout, not three, and the
card sits outside the image bounds with a hairline connector rather than on top
of it.

**Left behind:** the scroll-driven camera on a single subject, the tab selectors
that swap the hero object, the enormous ghosted decade numerals behind the
gallery, the sponsor logo wall, and the six-column footer. All of it needs a
budget and an asset library this build does not have, and the logo wall is banned
by the brief anyway.

### SiteAssist, siteassist.com

**The one thing:** the mono readout. A small `51.5682°N 0.1116°W` sits to the
right of the hero copy and changes as the drone footage pans. It is real data
tied to the real visual, and it makes the hero read as instrumented rather than
decorated. The headline is also set in a wide-tracked technical face at display
size rather than being demoted to an eyebrow.

**Taken:** factual mono annotation tied to the artifact, used for the artifact
caption and the callout body. Also the soft-focus vignette at the frame edge,
translated into a layered shadow and a 1px inner top highlight so the light
screenshot seats into the dark page instead of floating on it.

**Left behind:** fake or fabricated telemetry, the violet CTA, the floating pill
nav over media, and the client logo strip. There is no live coordinate to print
here, and inventing a changing number would be the exact dishonesty the whole
page argues against.

### What none of them get to give this page

All four heroes are carried by a filmed or rendered subject. There is no such
subject here, and substituting a particle field would trip the brief's own ban.

The substitute is the twin's real retrieval path, drawn rather than
photographed: seven stages, every label and number a setting in that
repository, with a brass signal running the spine once on load. It takes the
annotation instinct from Porsche and the instrumented feel from SiteAssist, and
it is the one thing that is simultaneously real, on concept, in palette, and
persuasive to the reader the page is for. A cropped screenshot of the twin was
tried first and removed: a light-mode web app sitting in a dark page is a
picture of the work rather than a piece of design.

The rest of the page's visuals are charts redrawn from real measurements. See
section 11.

---

## 2. Colour

Anchor is `#0b0f19`, the `theme-color` of the live AI twin, so the portfolio and
the twin read as one identity. Six neutrals give a real mid-tone ramp
(`rule` to `graphite` to `read` to `bone`), plus one accent.

| Token | Hex | Role | On `void` | On `slab` |
| --- | --- | --- | --- | --- |
| `void` | `#0B0F19` | Page ground. The only page background. | ground | |
| `slab` | `#131A28` | Raised surface: the ask panel, callout cards, the citation label, question buttons at rest. | 1.10 | ground |
| `rule` | `#212A3D` | Hairlines, the spine, ledger rules, frame borders. **Never text.** | non-text | non-text |
| `graphite` | `#7C88A0` | Metadata, dates, captions, citation markers at rest. | 5.37 | 4.88 |
| `read` | `#9AA6BC` | Body prose. | 7.80 | 7.09 |
| `bone` | `#E9E7E2` | Display type, claim text, primary values. | 15.50 | 14.09 |
| `brass` | `#D99A4E` | The single accent. | 7.92 | 7.20 |
| `optic` | `#E0453C` | **Retired.** Was the authored endoskeleton's optics. That figure has been replaced by a supplied model and nothing on the page uses this value now. Kept here as a record, not as a token to reach for. | non-text | non-text |

`void` on `brass` measures 7.92:1, so filled controls take dark ink and one
accent value serves links, markers, ticks and buttons.

The `optic` red existed because the client asked for a figure with red eyes and
the accent lock would otherwise have made them brass, which is not what red eyes
are. The client later replaced that figure with a supplied model, so the value
now has no surface. It is not a spare accent: the page has one accent, and it is
`brass`.

**Accent discipline.** `brass` appears on: the two calls to action, the spine
ticks, the italic emphasis word in the hero thesis, a claim's marker and rule
while hovered or focused, the left edge of the citation label and the callout
card, the callout connector line, and the `carried forward` arrows. Nowhere
else. No gradients anywhere, no glows, no second accent.

Why brass and not a red: two of the four references carry a warm saturated
accent, the colour reads as instrument brass and ledger gilt rather than as an
error state, and a dev audience reads red small text as a warning. It also sits
well against the yellow in the real screenshot instead of fighting it.

Shadows are tinted to the ground, never pure black. See section 6.

---

## 3. Type

| Face | Weight axis used | Role |
| --- | --- | --- |
| Bricolage Grotesque (variable) | `wght` 500, 600 and `wdth` 80, 100 | Display. Hero thesis, section headings, research titles. The `wdth` axis carries emphasis inside display type, because the face ships no true italic and a synthetic oblique at 60px is a browser fake. |
| IBM Plex Sans (variable) | 400, 500, 600 | Body. Prose, entry titles, contact values, button labels. |
| IBM Plex Mono | 400, 500 | The apparatus. Citation markers and labels, dates, entry numbers, stack rows, captions, `carried forward`. |

Self hosted, `font-display: swap`, Bricolage and Plex Sans preloaded. The twin
uses Inter, so the shared identity is carried by colour, not type.

The three faces are subset to ASCII plus a handful of typographic marks by
`scripts/subset_fonts.py`, which takes them from 154 kB to 76 kB and the
preloaded pair from 124 kB to 66 kB. On a throttled connection the fonts were
competing with the hero image for bandwidth, and the hero image is the largest
paint. Both variable axes survive the subset: `wght` on all three, and `wdth` on
Bricolage, which display emphasis depends on. Re-run the script after changing
the font packages.

### Type scale

Tracking tightens as size grows. Line height drops as size grows. Sizes are
`375px / 768px / 1440px` where they change, except `display-1`, which takes its
last step at 1280 because that is where the hero splits into two columns and the
measure stops growing.

| Token | Size | Line height | Tracking | Face, weight | Used for |
| --- | --- | --- | --- | --- | --- |
| `display-1` | 2 / 3.25 / 3.5rem at `375 / 768 / 1280` | 1.04 | -0.035em | Bricolage 600, `wdth` 100 | Hero thesis, once per page |
| `display-1` emphasis | as above | as above | as above | Bricolage 600, `wdth` 80, `brass` | One word in the hero thesis, once per page |
| `display-2` | 1.75 / 2.125 / 2.5rem | 1.12 | -0.025em | Bricolage 600 | Section headings |
| `display-3` | 1.1875 / 1.1875 / 1.3125rem | 1.25 | -0.015em | Bricolage 600 | Research titles |
| `title` | 1.0625 / 1.0625 / 1.125rem | 1.35 | -0.005em | Plex Sans 600 | Ledger entries, project names, stack groups |
| `body-lg` | 1.0625 / 1.125 / 1.125rem | 1.6 | 0 | Plex Sans 400 | Hero subtext |
| `body` | 0.9375 / 1 / 1rem | 1.65 | 0 | Plex Sans 400 | Section prose, ledger movement |
| `body-sm` | 0.875rem | 1.6 | 0 | Plex Sans 400 | Compressed rows, ledes in tight columns |
| `mono-md` | 0.8125rem | 1.5 | 0.01em | Plex Mono 400 | Register labels, stack items, entry numbers |
| `mono-sm` | 0.75rem | 1.5 | 0.02em | Plex Mono 400 | Dates, captions, reference rows, contact labels |
| `mono-xs` | 0.6875rem | 1.45 | 0.06em | Plex Mono 400 | Citation label, callout body, `carried forward`, contact terms |
| `ui` | 0.875rem | 1.4 | 0.01em | Plex Sans 500 | Nav links, button labels, inline notes |
| `brand` | 0.95 / 0.95 / 1rem | 1.2 | -0.01em | Bricolage 600 | The wordmark, nav only |
| `marker` | 0.625rem | 1 | 0.02em | Plex Mono 500 | The superscript citation marker only |

Measure caps: prose `max-w-[68ch]`, ledes `max-w-[62ch]`, tight columns
`max-w-[58ch]`, hero subtext `max-w-[42ch]`, hero thesis `max-w-[17ch]`.

---

## 4. Layout

Asymmetric with one spine: a hairline down the left of the content column, with a
short accent tick connecting it to each section heading. The tick hangs off the
heading rather than off the gutter, so it stays aligned at any type scale. Below
1024px the gutter collapses and the tick moves above the heading.

The hero splits into two columns at `xl` (1280) and is stacked below that.

### 1440px

```
+--------------------------------------------------------------------------+
| Vishal Khan          Work Trajectory Research Stack Contact  Ask the twin |  72px, one line
+--------------------------------------------------------------------------+
|                                                                          |
|                                                                          |
|  A number nobody can                          .--.                    |
|  CHECK is not a number.                     .'   __   '.                 |
|  ^ wdth 80, brass                          /   .'  '.   \                |  sentinel: tracks
|                                           |   |  ()  |   |               |  the pointer, blinks
|  AI and ML engineer in London.            |   '.__.'    |               |  once on any click
|  Looking for an AI or ML                   \           /                |
|  internship now, full time                  '.       .'                 |
|  from January 2027.                           '-....-'                  |
|                                                                          |
|  [ Ask the twin > ] [ Book a call ]                                      |
+==========================================================================+
|       |                                                                  |
| spine |                                                                  |
|       +-- AI Digital Twin                                                |  tick joins spine
|       |   It answers questions about me from evidence ...                |  to the heading
|       |   [ Retrieval path panel, seven stages, signal runs on view ]     |
|       |                                                                  |
|       |   | prompt-injection paragraph, accent left rule                 |
|       |                                                                  |
|       |   Objective   Rebuild a vanilla JavaScript prototype ...         |
|       |   Approach    ... 87 indexed documents(1) ...                    |
|       |   Result      ... about 20 ms(4) ... 370 tests in CI(2)          |
|       |                                                                  |
|       |   [ Ask the twin > ]  [ Read the code > ]                        |
|       +------------------------------------------------------------------+
|       +-- Trajectory                                                     |
|       |   01 | PJRJ Associates      | Two years of GST filings | Jul 2018 |
|       |      | Finance and taxation |                          | to Sep 2020
|       |   ---+----------------------+--------------------------+---------
|       |      carried forward -> a low tolerance for figures nobody can trace
|       |   02 | ...                                                       |
|       |   -- | Northeastern University London | Agent reliability | 2026-27
|       +------------------------------------------------------------------+
|       +-- Research     two articles side by side                         |
|       +-- Other work   three rows, each with a chart redrawn from real    |
|       |                data: bars for the five UK HE classifiers, lines   |
|       |                for the CIFAR epochs and the churn cutoff          |
|       +-- Stack        three groups, ink encodes depth                    |
|       +-- Ask it       slab band, four question buttons, one CTA          |
|       +-- Contact      portrait + ruled channels | availability register   |
|       +-- Sources      numbered reference list, 9 rows                    |
+--------------------------------------------------------------------------+
```

### 375px

```
+-----------------------------+
| Vishal Khan   Ask the twin  |  56px, brand plus one text link
+-----------------------------+
|                             |
|  A number nobody can        |  2rem, two lines
|  CHECK is not a number.     |
|                             |
|  AI and ML engineer in      |
|  London. Looking for an AI  |
|  or ML internship now,      |
|  full time from Jan 2027.   |
|                             |
|  [ Ask the twin > ]         |  intrinsic width, not edge to edge
|  [ Book a call ]            |
|                             |
|  +-----------------------+  |
|  | Retrieval path        |  |  the op and detail columns stack
|  | --------------------- |  |  under sm, so the panel stays
|  | o Question            |  |  readable at 335px
|  |   last 2 user turns   |  |
|  | o Embed               |  |
|  |   text-embedding-3    |  |
|  | o Search              |  |
|  |   87 documents        |  |
|  | ...                   |  |
|  | * Answer              |  |
|  +-----------------------+  |
|  | How a question about  |  |
|  | me becomes an answer  |  |
+=============================+
|  --                         |  accent tick replaces the spine
|  AI Digital Twin            |
|  Objective / Approach /     |
|  Result                     |
|  [ Ask the twin > ]         |
+-----------------------------+
|  --                         |
|  Trajectory                 |
|  01          Jul 2018 to    |  number and dates share one line,
|              Sep 2020       |  the way a statement row is headed
|  PJRJ Associates            |
|  Finance, accounts and tax  |
|  Two years of GST filings.. |
|  ------------------------   |
|  carried forward -> ...     |
+-----------------------------+
|  --                         |
|  Other work                 |
|  UK higher education ...    |  copy first, then the chart beneath
|  ....                       |  it, full column width
|  +-----------------------+  |
|  |  bars, 5 classifiers  |  |
|  +-----------------------+  |
+-----------------------------+
```

Everything asymmetric above 1024px collapses to a single column below it. The
ledger's date column moves up beside the entry number, because a statement row
reads with its date at the top rather than the bottom.

## 5. Space

4px base. Only these steps are used.

| Token | Value | Typical use |
| --- | --- | --- |
| `space-1` | 0.25rem, 4px | Icon to label gaps |
| `space-2` | 0.5rem, 8px | Label to value |
| `space-3` | 0.75rem, 12px | Button gaps, chip gaps |
| `space-4` | 1rem, 16px | Paragraph rhythm |
| `space-5` | 1.5rem, 24px | Ledger column gap, list row padding |
| `space-6` | 2rem, 32px | Heading to body, callout offsets |
| `space-7` | 2.5rem, 40px | Spine gutter to content, hero column gap |
| `space-8` | 3.5rem, 56px | Block to block inside a section |
| `space-9` | 5rem, 80px | Section padding, mobile and tablet |
| `space-10` | 6rem, 96px | Section padding, desktop |

Layout constants: page container `max-w-[1320px]`, inline padding
`1.25rem / 2rem / 2.5rem`, spine gutter `9rem` from `lg` up, breakpoints
`sm 640 / md 768 / lg 1024 / xl 1280`.

Section padding: `space-9` vertical at all widths, `space-10` from `lg`. The
featured section adds `space-6`.

---

## 6. Radius

One scale. A nested element always takes the step below its parent. Hairlines,
rules and the spine are never rounded.

| Token | Value | Applied to |
| --- | --- | --- |
| `radius-lg` | 10px | The hero artifact frame. Full bleed section bands are never rounded. |
| `radius-md` | 6px | Buttons, callout cards, question buttons, images inside a frame |
| `radius-sm` | 3px | The citation label, focus ring corners, the marker hit area |

---

## 7. Shadow

Layered, two or three stops at different blurs, tinted to the ground. No single
flat drop shadow, no pure black, no glows.

| Token | Value | Used on |
| --- | --- | --- |
| `shadow-raise` | `0 1px 2px rgb(4 7 13 / .40), 0 4px 10px rgb(4 7 13 / .32)` | Buttons on hover |
| `shadow-float` | `0 2px 6px rgb(4 7 13 / .45), 0 10px 26px rgb(4 7 13 / .38)` | Citation label, callout card |
| `shadow-artifact` | `0 2px 8px rgb(4 7 13 / .50), 0 14px 34px rgb(4 7 13 / .42), 0 40px 90px rgb(4 7 13 / .30)` | The hero artifact frame |
| `highlight-top` | `inset 0 1px 0 rgb(233 231 226 / .07)` | Stacked with `shadow-artifact` on the hero frame, for a physical top edge |

---

## 8. Motion

Library is Motion, `import { motion } from "motion/react"`. No GSAP, no second
animation library. Every animation is gated on `useReducedMotion()` and collapses
to its final state.

### Curves

| Token | Value | Used for |
| --- | --- | --- |
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances, the load sequence, hover in |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Hover out, dismissals |
| `ease-move` | `cubic-bezier(0.65, 0, 0.35, 1)` | Layout transitions |

No `linear` anywhere.

### Durations

| Token | Value | Used for |
| --- | --- | --- |
| `dur-out` | 140ms | Hover and focus exit. Exits are faster than entries. |
| `dur-in` | 220ms | Hover and focus enter |
| `dur-move` | 340ms | Layout transitions, the copy confirmation |
| `dur-enter` | 620ms | Items in the hero load sequence |

### The one orchestrated moment

A single page-load sequence in the hero. The hero visual is the twin's retrieval
path, and a brass signal runs its spine once, resolving each stage as it passes.
It carries meaning rather than decoration: it shows how a question becomes a
cited answer.

| At | Element | From |
| --- | --- | --- |
| 0.00s | Nav | `opacity 0`, `y -8` |
| 0.10s | Thesis line 1 | `opacity 0`, `y 16`, `clipPath inset(100% 0 0 0)` |
| 0.20s | Thesis line 2 | same |
| 0.38s | Subtext | `opacity 0`, `y 12` |
| 0.50s | CTAs | `opacity 0`, `y 12`, 60ms stagger |
| 0.60s | Sentinel | `opacity 0`, `scale 0.96` |

The retrieval path is no longer in the hero. It sits inside the twin's own case
study, and because that is below the fold it runs on first view rather than on
page load: a signal that had already finished before anyone scrolled to it would
be a wasted one. Its spine still uses `linear`, which is the one place that curve
is correct, because a travelling signal at a constant rate is what it depicts.

Under reduced motion every item renders at its final state with no transform and
no delay.

### Everything else

- Hover and focus on every interactive element, `dur-in` with `ease-out` on
  enter and `dur-out` with `ease-in` on exit.
- Buttons lift `y -1px` and gain `shadow-raise` on hover, return to `y 0` on
  press.
- Layout transitions only where content genuinely changes position: the copy
  confirmation in the ask section.
- **Every graph is bound to scroll position, not triggered by it.** The two line
  charts, the bar chart, the career graph and the retrieval path all derive their
  drawn state from `useDrawProgress` in `src/motion/scroll.ts`, which is a
  transform of the element's own crossing of the viewport. They draw as the
  reader arrives and undraw if the reader scrolls back up.
- The mapping completes by the time the element is centred, so a chart is always
  fully drawn while it is being read. `useInView` with `once: true` was used here
  first; it fired one animation and then ignored the reader for the rest of the
  session, which is not the same thing as responding to scroll.
- **Scroll position is smoothed before anything is derived from it**, through
  `useSmoothScroll` in `src/motion/scroll.ts`. A mouse wheel is not a continuous
  input: measured on this page, one notch moved the document 120px in a single
  frame, and 59 of 71 frames sat perfectly still between notches. Anything mapped
  straight onto scroll position inherits that staircase and teleports, at a
  perfect 60fps, with nothing in the profiler to show for it.

| Token | Value | Notes |
| --- | --- | --- |
| `scroll-spring` | `stiffness 500, damping 45, mass 1, restDelta 0.0005` | Damping ratio just over 1, settling in about 0.18s |

  Overdamped deliberately. A spring that overshoots would carry a bar past its
  own value and back, which on a chart is a wrong number briefly drawn, not a
  flourish.

  **The settle length is a compromise between two inputs that want opposite
  things.** A wheel wants a long one: it delivers a single 120px jump, and the
  spring is all that stands between that jump and a teleport. A trackpad wants
  none at all, because it already delivers a smooth stream of small deltas, and
  any settle on top of that is just the page trailing the reader's fingers.

  Three values were measured on the first bar of the audit chart, counting only
  frames where the value was live rather than pinned at either end:

  | Spring | Frames moving | Worst single-frame advance |
  | --- | --- | --- |
  | none | 20% | 0.797 of the bar's range |
  | `150 / 28` | 100% | 0.545 |
  | `70 / 21`, 0.4s settle | 100% | 0.099 |
  | `500 / 45`, 0.18s settle | 100% | 0.148 |

  Frames moving is the wrong number to choose on once any spring is present:
  all three move on every live frame. The worst single-frame advance is the one
  that separates them, because it says how far the mark can lurch in one frame,
  and that is the thing the eye reads as a jump. `150 / 28` spreads a notch over
  about half as many frames as the other two and still lurches more than a third
  of the bar at once.

  `70 / 21` smooths a wheel beautifully and was shipped, then reported as lag,
  because on a trackpad it makes the page feel like it is dragging something
  heavy. The 0.18s pair is roughly eleven frames: enough to spread a notch
  across a visible arc, short enough that a trackpad reader cannot feel it.

  Under `prefers-reduced-motion` the raw value is returned and no spring runs.
- This is not the banned fade-and-rise on section entry. That is applied to whole
  sections regardless of content; this is a mark drawing along its own axis,
  which is what the mark means.
- **The 3D layer renders on demand, never on a loop.** `frameloop="demand"`,
  with every source of change asking for a frame explicitly: scroll through a
  subscription to the progress value, the pointer through a listener on the
  canvas, and the lean easing by re-arming itself until it settles.

  This was `"always"` whenever motion was allowed, which meant three canvases
  each rendering 60 times a second for the entire life of the page: while the
  reader was reading, while a model was off screen, while nothing moved at all.
  Two seconds parked on the hero, touching nothing, issued 1,200 WebGL draw
  calls. It is now zero, and the frames that do happen are the ones that differ
  from the last.

  That idle work was competing with scroll for the main thread, and it is what
  made the page feel heavy under a trackpad. Across a trackpad-style scroll the
  99th percentile frame went from 166.7ms to 17.7ms, the worst from 233.2ms to
  33.7ms, and frames over 33ms from 17 to 1.
- `cursor: pointer` on every clickable element, including `button`.

---

## 9. The citation apparatus

The signature element. There is no second one.

**What gets a claim.** A metric, a result, or a named technology that a skeptical
engineer would want to verify. Nothing else. Maximum four per section, zero in
the hero copy. Twelve on the page.

**Marker.** `marker` token, Plex Mono 500, `vertical-align: super`,
`margin-left: 0.15em`, `graphite` at rest, `brass` on hover or focus.

**Claim.** The claim text is `bone` with a 1px dotted bottom border in
`color-mix(in oklab, graphite 55%, transparent)`, going to `brass` on hover or
focus. Transition `dur-in` / `ease-out` in, `dur-out` / `ease-in` out.

**Label.** `slab` fill, 1px `rule` border, 1px `brass` left border, `radius-sm`,
`mono-xs` in `read`, `shadow-float`, absolutely positioned above the claim so
nothing reflows, `display: none` until hover or focus, and only from `md` up. A
hidden label must never contribute to document scroll width.

**Registry.** Sources are declared once in `src/data/sources.ts`. Marker numbers,
each link's accessible name, and the reference list at the foot of the page are
all derived from that record, so they cannot drift apart.

**Missing sources are visible.** A source either has a URL, and the marker links
straight to the repository, deployment or PDF, or it has none, and the marker
links to its own row in the reference list where the reason is written down. A
marker never resolves to a dead page.

**The hero's version.** The hero artifact is a real answer from the twin with its
own source chips in it, and one callout card points at them. That is the same
idea in the artifact's register rather than a second signature. The callout sits
outside the image bounds with a hairline connector, so no label is pasted over
the image.

---

## 10. Media slots

There is one photographic asset. Everything else on the page is drawn from data.

| Slot | Current asset | Wanted |
| --- | --- | --- |
| Portrait, in Contact | `public/portrait.webp`, a 460x460 GitHub avatar duotoned between `#0D121E` and `#8E9AB0` to keep it inside the palette | A headshot 1200px or wider, graded the same way |

Rules: explicit `width` and `height`, modern format, `loading="lazy"` below the
fold, `radius-md` inside a `radius-lg` frame.

The hero previously held a cropped screenshot of the twin. It was removed in
favour of the drawn retrieval path, which is the same subject expressed as
designed structure rather than as a picture of a light-mode web app sitting in a
dark page.

## 11. Data visuals

Three charts, all redrawn from real measurements rather than screenshotted from
the notebooks. Data and provenance live in `src/data/charts.ts`; if a number
cannot be pointed at in a public file it does not go in that file.

| Chart | Form | Why that form | Source |
| --- | --- | --- | --- |
| UK HE model comparison | Horizontal bars, one measure | Magnitude across five named models, no time axis | Repository README |
| CIFAR-10 accuracy | Two-series line | Change over epochs | Notebook training log |
| Churn cutoff | Three-series line | Change over a threshold parameter, and the crossover is the point | Notebook cutoff table |

**These charts do not ship a categorical palette, deliberately.** The page has
one chromatic value, so a proper categorical set is not available from it, and
inventing a second hue would break the accent lock in section 2. The palette
validator confirms this: on accent plus neutrals it FAILs the categorical
lightness-band and chroma-floor checks, correctly, because near-greys are not
categorical hues.

What actually governs legibility passes comfortably:

| Check | Result |
| --- | --- |
| Adjacent separation, normal vision | ΔE 19 to 21 (OKLab x100), target is 8 |
| Adjacent separation, protanopia | ΔE 16 to 20 |
| Adjacent separation, tritanopia | ΔE 19 to 21 |
| Contrast against the ground | all marks clear 3:1 |

Identity is therefore never carried by colour alone. Every chart has a legend, a
distinct marker shape per series (circle, diamond, square), and selective
endpoint labels.

Mark rules: 2px lines, markers about 7px, solid hairline gridlines in `rule` one
shade off the ground, never dashed. Axis ticks and all chart text in `graphite`
mono, never in a series colour. Bars start at zero and take `radius-sm`.

Labelling: the endpoint only, and where two endpoints would land within 14px of
each other, only the accent series is labelled. Never a number on every point.
Every value is also reachable without hovering, through a visually hidden data
table per chart and a `<title>` on a 24px hit area per point.

## 12. The 3D layer

Two objects, both bound to scroll position rather than to a timeline, so they
move whenever the reader moves and stop when the reader stops. Neither loops.

| Object | Where | Source | Why it is there |
| --- | --- | --- | --- |
| Wired robot head | Hero, right column | `Robot Girl With Hair Wires` from Sketchfab. 29 MB export, welded, simplified to 28% of its triangles, Draco geometry and WebP textures: 0.93 MB, 241k triangles. Retinted at load onto `#8D99B0` with the brass light supplying the warm on the wires | The client asked for it by name, in the hero. It replaced an authored endoskeleton bust, which is recorded below. A still of it at `public/hero-figure.webp` holds the frame from first paint. |
| Brain tractography | Ask it something, right column | `Neural Networks of the Brain` from Sketchfab. 1.79 MB to 76 kB with Draco. Flattened onto `#AAB4C6` outright rather than ramped | The client asked for a neural network object. The caption is careful that it is not a metaphor for the twin, because the twin is a retriever over about forty documents and looks nothing like this. |
| Chess set | Other work, beside the chess analytics entry | `ABeautifulGame` from the Khronos glTF sample assets, CC BY 4.0, Ed Mackey and ASWF | It sits next to the FIDE and chess.com analysis, so the object is the subject of the row rather than decoration. |

Two objects were tried in the head of Trajectory and cut.

A **chronograph watch** went first. It was a metaphor about precision rather than
a fact about his career, and a stock model of an unrelated object is exactly the
thing a skeptical reader notices.

A **soroban** replaced it and was better: the instrument of hand-checked
arithmetic, with beads that counted 2018 to 2027 as the section scrolled. It was
cut in favour of the career graph in section 14, which tells the same story with
his actual dates instead of by analogy. The lesson is worth keeping: no
licence-clear model of a counting frame, ledger, adding machine or balance exists
in any library reachable from here. The public glTF collections are PBR test
suites, so anything of that kind has to be generated.

### Motion

| Property | Mapping |
| --- | --- |
| Rotation about Y | `-0.34 + p * 0.4π`, about 72 degrees. Wide enough to read as three dimensional, never far enough to turn edge on. |
| Rotation about X | `0.08 + sin(pπ) * 0.1`, so the tilt peaks mid-crossing and returns. |
| Bead position | The digits of `2018 + round(p * 9)`, eased toward the target at 0.14 per frame so a changing digit shows the bead travel. |

`p` is the object's own crossing of the viewport, from `start end` to
`end start`. Binding it to the whole section was tried and reverted: the object
leaves the screen long before the section ends, so most of the range was spent
where nobody could see it.

Under reduced motion both scenes render one frame at a fixed pose and the render
loop is switched off entirely with `frameloop="demand"`.

### Cost, and how it is contained

Three, R3F, drei and the two decoders are roughly 300 kB gzip, and the chess set
is 11.5 MB. None of it is on the critical path:

- Both scenes are `React.lazy` imports, so they land in their own chunks.
- A scene mounts only when its viewport is within one screen of the reader, so a
  reader who stops before Trajectory downloads none of it.
- Draco and KTX2 decoders are self hosted under `/decoders`. drei points Draco at
  a Google CDN by default, which would make the page depend on a third party at
  runtime.
- KTX2 needs `detectSupport(renderer)` before it can transcode. Without it the
  chess set's ETC1S textures fail with 33 console errors and the model renders
  untextured.
- On a metered connection, or an effective type of 2g, the scene never mounts and
  the reserved frame stays empty. That is a decision, not a fallback.
- `dpr` is capped at 1.75, so a 3x phone does not render nine times the pixels.

The reserved frame is sized in CSS before anything loads, so mounting a canvas
shifts nothing.

## 13. The cursor layer

Six surfaces respond to the pointer. All of them read from Motion values through
`src/motion/pointer.ts`, so moving the pointer never re-renders the React tree
and none of it collapses on a phone. Continuous pointer input never goes through
`useState`.

| Surface | Response | Why |
| --- | --- | --- |
| Career graph | The move nearest the pointer highlights and its readout surfaces | Reading a career graph means asking "what was that one", and this answers it without a click |
| Line charts, both | Crosshair at the nearest index, every series' value in one readout | The dataviz rules ask for a hover layer on any line chart |
| Bar chart | The bar nearest the pointer brightens, with its value | Same, for the categorical form |
| Hero pipeline panel | 4 degrees of tilt toward the pointer, plus a brass highlight tracking across it | Says the panel is a plane in space. The highlight makes the surface feel lit rather than printed |
| Both calls to action | Magnetic lean of up to 4px toward the pointer | Weight. The control acknowledges the pointer before it is clicked |
| Contact rows | A brass highlight follows the pointer along the row | Shows which of three links is live without a colour change doing all the work |
| Wired robot head, in the hero | The head turns with the scroll and leans up to 0.18 radians toward the pointer | It fills the hero's right column, which was empty below 1280, and it is the one piece of the page that is frankly for pleasure. The click blink went with the authored bust: that drove materials by name, and a supplied model has none this can address |
| Chess set | Adds up to 0.18 radians of lean on top of its scroll rotation | Confirms it is a solid being looked at, not a video |

### Numbers

| Property | Value |
| --- | --- |
| Pointer spring | `stiffness 140, damping 18, mass 0.5` |
| Active spring | `stiffness 180, damping 22` |
| Panel tilt at the edge | 4 degrees |
| Magnetic offset | 4px |
| Spotlight radius | 200 to 260px, brass at 12% at full strength |
| 3D pointer lean | 0.18 radians maximum, lerped at 0.06 per frame |
| Head yaw and pitch toward the pointer | 0.3 radians maximum, lerped at 0.07 per frame |
| Blink | 280ms, keyframes `[1, 0, 1]` at times `[0, 0.4, 1]`, driven by the caller on `pointerdown` |

### Rules

- Every effect pins to its neutral value under `prefers-reduced-motion`. Nothing
  merely slows down.
- No custom cursor, ever. The pointer stays the system pointer.
- No effect may move a hit target far enough to make it hard to click, which is
  why the magnet is 4px and not 40.
- A pointer effect may never be the only way to reach information. The charts
  keep their `<title>` hit areas and their hidden data tables; the graph keeps
  its table. Hover enhances, it does not gate.
- Nothing here is on a loop. Every one of these responds to input and then rests.

## 14. The career graph

The head of Trajectory, and the page's answer to "what is the story". Data lives
in `src/data/career.ts`, taken from the resume; nothing there is inferred.

**Axes.** Time runs left to right from 2018.3 to 2027.3, as decimal years so a
July start lands in July. The vertical axis is ordinal, not numeric: four bands
rising from Filings through Reporting and Pipelines to Models. The bands are what
he was working on rather than what the job was called, which is the part the
brief says is interesting. A career is not a quantity, so nothing here pretends
to be measured.

**Marks.** One continuous path steps along each role at its band and rises
between them, so a move is visible as a rise rather than as a label. A marker
opens each role, and the last one is filled because it is where he is now. Study
runs as a second, lighter track underneath, overlapping the work in time, because
it did.

**Motion.** The path draws with scroll across its own crossing of the viewport
and tracks in both directions, so it is never a one-shot reveal. The pointer
picks the nearest move and surfaces its readout. Both pin to their finished state
under reduced motion.

**Honesty.** The four bands are a reading of the resume, not a figure from it, so
the graph is labelled as a path and carries no numeric y axis that would imply
otherwise. The dates and titles are exact.

This replaced a generated soroban, which replaced a downloaded wristwatch. The
graph wins because it is the story itself rather than an object standing in for
it.

### The limit of primitives, recorded

Three passes were spent trying to make the authored bust read as the film
endoskeleton. It does not, and it will not. Boxes, spheres and tori give correct
proportions and a plausible silhouette, but they cannot give rolled chamfers on
plate edges, normal or roughness maps for micro-scratch and grime, plate
thickness at a grazing silhouette, or cusped teeth. Those four things are most of
why film chrome reads as used metal rather than as moulded plastic, and all four
need a sculpted asset with baked maps.

The pass history, so nobody repeats it: v1 optics invisible behind a maxilla
block; v2 lighting raised and optics moved proud, readable but flat; v3
proportions corrected to skull ratios with 185 meshes of hardware, which read
brighter but more toy-like, so the albedo was pulled from `#e2e4e9` down onto the
graphite end of the ramp. Still a toy.

`HERO_MODEL` in `src/data/content.ts` exists for this reason, and it is now in
use: the client supplied a sculpted head, and it replaced the bust outright. A
`.glb` set there inherits the scroll rotation, the cursor lean, the bounding-box
fit and the lazy mount. `src/components/three/EndoStage.tsx` is left on disk,
imported by nothing and bundled into nothing, as the record of the attempt.

### Retinting a bought model, and the four ways it goes wrong

A supplied model arrives in whatever palette its author liked. `gradeToPalette`
in `ModelStage.tsx` remaps it. Every rule in it was written after seeing the
failure it prevents, so they are recorded here rather than rediscovered:

1. **Grading the albedo does nothing where a texture exists.** A base colour
   texture multiplies the albedo, so retinting a mapped material leaves the
   texture's hue in charge. The first attempt left this model's face skin toned
   while its untextured wires went brass: the worst of both.
2. **Dropping the texture destroys the alpha with it.** These wires are alpha
   shaped cards. With the map gone each became a full opaque quad, and dozens
   blending over each other stacked into a white haze that erased the eyes. So
   the map is only dropped where the material is not transparent.
3. **A luminance ramp has no signal on an untextured export.** glTF
   overwhelmingly ships a white `baseColorFactor` with all the colour in the
   texture, so every material tops the ramp out and the whole model reads as one
   gold statue. Mapped materials therefore get the mid metal outright.
4. **A low roughness factor clips.** All six of this model's materials carry a
   metallicRoughness map. Clamping the factor near 0.2 made the fine strands
   across the face catch the key light from every angle at once and blow to
   white. 0.52 broadens the highlight and the face reads.

`tone: "metal"` skips the ramp entirely and flattens a model onto one value. Use
it when a model has no usable colour signal, which is what the brain needed.

### The hero still

`public/hero-figure.webp` is a render of the hero model, 491x656, 71 kB. It holds
the frame from the first paint and cross-fades out when the live canvas reports
that it has painted.

It is 491x656 because that is the live canvas's own ceiling: the box is 307pt
wide at its largest and the renderer caps its pixel ratio at 1.6. The poster is
exactly as sharp as the thing it hands over to and not one byte sharper.

**Regenerate it whenever the model, the grade or the framing changes**, or the
hand-off will visibly jump. A `srcset` pair was tried and reverted: it saved a
phone 20 kB and cost a double download at 375pt and 2x, because React sets
`srcset` before `sizes` and in that gap the browser resolves against 100vw and
takes the largest candidate.
