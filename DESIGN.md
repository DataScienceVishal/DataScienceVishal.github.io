---
name: Vishal Khan, lab notebook
description: A single page written as a pre-registered lab notebook, each project a dated entry with what was expected and what was measured on one scale.
colors:
  paper: "#f6f7f4"
  wash: "#eceee9"
  grid: "#dce6f1"
  hair: "#c5cfdb"
  ink: "#1b2a4a"
  ink-soft: "#3a4560"
  pencil: "#5b6270"
  margin: "#b53d35"
  plate: "#151c27"
  plate-edge: "#ffffff"
  paper-night: "#141413"
  wash-night: "#1c1c1a"
  grid-night: "#262624"
  hair-night: "#33332f"
  ink-night: "#eeede8"
  ink-soft-night: "#c6c5be"
  pencil-night: "#9a9992"
  margin-night: "#ea7468"
  plate-edge-night: "#2e2e2b"
typography:
  display:
    fontFamily: "Archivo, Arial Narrow, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.375rem, 1.55rem + 3.3vw, 4.25rem)"
    fontWeight: 720
    lineHeight: 1.02
    letterSpacing: "-0.03em"
    fontVariation: "\"wdth\" 84"
  headline:
    fontFamily: "Archivo, Arial Narrow, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.5rem, 1.2rem + 1.25vw, 2.25rem)"
    fontWeight: 680
    lineHeight: 1.12
    letterSpacing: "-0.02em"
    fontVariation: "\"wdth\" 88"
  title:
    fontFamily: "Archivo, Arial Narrow, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.01em"
    fontVariation: "\"wdth\" 92"
  lead:
    fontFamily: "Atkinson Hyperlegible Next, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.125rem, 1.05rem + 0.35vw, 1.3125rem)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Atkinson Hyperlegible Next, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Atkinson Hyperlegible Next, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Archivo, Arial Narrow, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 560
    lineHeight: 1.35
    letterSpacing: "0.01em"
    fontFeature: "tnum"
    fontVariation: "\"wdth\" 80"
  label-sm:
    fontFamily: "Archivo, Arial Narrow, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 540
    lineHeight: 1.35
    letterSpacing: "0.015em"
    fontFeature: "tnum"
    fontVariation: "\"wdth\" 80"
  code:
    fontFamily: "Atkinson Hyperlegible Mono, ui-monospace, Menlo, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: "0px"
  focus: "2px"
  mark: "9999px"
spacing:
  gutter-sm: "1.25rem"
  gutter-md: "2rem"
  gutter-lg: "2.5rem"
  margin-column: "8.5rem"
  column-gap: "2.5rem"
  grid-square: "24px"
  page-max: "77.5rem"
components:
  button-copy:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "10px 20px"
  button-copy-hover:
    backgroundColor: "{colors.ink-soft}"
    textColor: "{colors.paper}"
  email-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.lead}"
    rounded: "{rounded.none}"
    padding: "10px 16px"
  email-field-hover:
    backgroundColor: "{colors.wash}"
  button-outline:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "6px 12px"
  button-outline-hover:
    backgroundColor: "{colors.wash}"
  theme-toggle:
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "6px 12px"
  contents-link:
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
  contents-link-hover:
    textColor: "{colors.ink}"
  plate-print:
    backgroundColor: "{colors.plate-edge}"
    rounded: "{rounded.none}"
    padding: "8px"
---

# Design System: Vishal Khan, lab notebook

## Overview

**Creative North Star: "The Pre-registered Lab Notebook"**

The page is one continuous sheet of ruled notebook paper. Each project is a dated entry whose heading is its claim, followed by a small figure that sets what was written down beforehand against what was measured, on the same scale. Dates live in a red margin rule that runs the full length of the sheet. Notebook furniture (the contents row, margin dates, field labels, captions) is set in a narrow grotesk; everything read as prose is set in a text face drawn so that 1, l and I, and 0 and O, cannot be confused.

Density is that of a working notebook: one measure of prose (32em), generous space between entries, and a second depth of detail folded away in each entry until the reader opens it. Depth comes from paper and ink, not from cards: entries are separated by full-width ink rules, and the only lifted objects are the dark prints taped onto the page that hold the three 3D models.

There are two pages. The day page is cool white paper with a fine blue square grid and blue-black ink. The night page is the same notebook on near-neutral black paper in white ink, deliberately not the blue-black slate most dark modes use. The page refuses the developer-portfolio card grid and the marketing hero.

**Key Characteristics:**
- Whose notebook it is comes first: the name at display size with his photo taped beside it, then the claim and the bio.
- One sheet, one red margin rule, every date on it.
- Every entry: claim as heading, figure directly under the claim, then fields, context, working, links and sources.
- Expected against measured on one shared scale; the measured mark is always red.
- Three taped-in prints are the only lifted surfaces.
- Square corners everywhere except the round scale marks.
- Tabular figures on every piece of furniture.

## Colors

A cool ruled-paper palette with one red, used only for dates and measured values.

Every text role clears 4.5:1 against paper in both themes. Measured contrast against paper:

| Role | Day page | Night page |
|---|---|---|
| Ink | 13.23 | 15.73 |
| Ink soft | 8.88 | 10.65 |
| Pencil | 5.70 | 6.45 |
| Margin red | 5.30 | 6.32 |

Against the wash ground, the lowest text role is margin red at 4.88 (day) and pencil at 5.97 (night).

### Primary
- **Blue-black Ink** (day #1b2a4a, night #eeede8): headings, body copy, the primary button fill, page-break rules, the contents row's lower rule, scale axes and the expectation tick, focus ring and text selection.

### Secondary
- **Margin Red** (day #b53d35, night #ea7468): the margin rule down the sheet (2px), every date, and every measured value on a figure (the red mark on a scale, divergence notes in the step table). While the scroll effects run, the rule fades to 30% and refills at full strength as the reader goes down the page. It is never used for headings, fills or decoration.
- **Highlighter** (day rgb(255 222 110 / 0.62), night rgb(255 214 90 / 0.24)): the stroke under the one measured phrase in each entry. It is a flat colour drawn as a gradient over the lower 62% of the line, only so that it can sweep in. Ink on it measures 10.87 (day) and 6.80 (night) where a grid line runs underneath, its worst case.

### Neutral
- **Ruled Paper** (day #f6f7f4, night #141413): the page ground, also written to the browser's theme-color meta so the chrome matches.
- **Wash** (day #eceee9, night #1c1c1a): hover ground for the email field and outline buttons, and the ground of command blocks inside a working.
- **Grid Blue** (day #dce6f1, night #262624): the 24px ruled square on the body. Decoration only: no text relies on it.
- **Hairline** (day #c5cfdb, night #33332f): list dividers, the working's left rule, resting underline colour, the theme toggle's resting border, and the lesion scale's track.
- **Ink Soft** (day #3a4560, night #c6c5be): secondary prose, the lead paragraph, contents links at rest, caption titles.
- **Pencil** (day #5b6270, night #9a9992): working notes, field labels, figure captions, scale tick labels, the scrollbar thumb, and the hatching that marks an expectation span.
- **Print Ground** (#151c27, both themes): the inside of every plate. It stays blue-black at night because each plate's still was rendered on this ground and the live model must hand off without a jump.
- **Print Edge** (day #ffffff, night #2e2e2b): the border of the photographic print around each plate.
- **Tape** (day rgb(224 213 170 / 0.78), night rgb(234 229 208 / 0.24)): the two strips holding each print.

### Named Rules
**The Red Means Measured Rule.** Margin red marks a date or a measured result, nothing else. If a red element is neither, it is wrong.

**The Neutral Night Rule.** The night page is near-neutral black (#141413) with white ink. Do not tint it blue; only the print ground inside the plates stays blue-black.

**The One Stroke Rule.** An entry highlights one phrase, and that phrase is its measured result. A second highlight in the same entry is wrong.

**The Bare Paper Rule.** Writing always sits on bare paper. Nothing decorative is drawn under a line of text, which is why page one's specks are erased from every line box rather than dimmed: dimmed, a speck where two lines met took white text at night to 4.0:1.

## Typography

**Display Font:** Archivo on its width axis (fallback Arial Narrow, Helvetica Neue, Arial)
**Body Font:** Atkinson Hyperlegible Next (fallback Helvetica Neue, Arial)
**Label/Mono Font:** Atkinson Hyperlegible Mono, for code only (fallback ui-monospace, Menlo, Consolas)

**Character:** Archivo, narrowed between 80% and 92% width, reads like the printed labels on a lab pad. Atkinson Hyperlegible Next carries every sentence because a page of figures needs characters that cannot be misread.

All three faces are self-hosted, subset to Latin, and served as variable woff2 with font-display swap. Archivo and Atkinson Hyperlegible Next are preloaded. Font synthesis is off.

### Hierarchy
- **Display** (720, width 84%, clamp 2.375rem to 4.25rem, 1.02): the name on page one only, which is the page's h1.
- **Headline** (680, width 88%, clamp 1.5rem to 2.25rem, 1.12): the page-one claim (capped at 26ch), each entry's claim and each later page's heading (capped at 30ch).
- **Title** (650, width 92%, 1.1875rem, 1.3): item titles in lists, subheads in Background, and the name in the contents row (set at 720).
- **Lead** (400, clamp 1.125rem to 1.3125rem, 1.5): the bio on page one (30em) and the email address.
- **Body** (400, 1.0625rem, 1.6): entry fields and context, and the availability line on page one, capped at 32em.
- **Small** (400, 0.9375rem, 1.55): figure captions, working notes, list lines, the step table.
- **Furniture** (560, width 80%, 0.9375rem, 1.35, 0.01em tracking, tabular figures): contents links, margin dates, field labels, buttons, link rows, and the role line under the name.
- **Furniture small** (540, width 80%, 0.8125rem, 1.35, 0.015em tracking, tabular figures): plate captions, scale labels, source lines, status messages.
- **Code** (400, 0.875rem, 1.5): file paths, step names and commands.

Headings balance their lines; paragraphs use pretty wrapping. No role is set in capitals.

### Named Rules
**The Two Faces Rule.** Archivo is for headings and furniture; Atkinson Hyperlegible Next is for anything read as a sentence. The mono face appears only inside code.

**The Tabular Rule.** Every furniture role uses tabular figures, and any number inside prose that sits in a column or a comparison takes the tabular utility.

## Layout

The sheet is centred with a maximum width of 77.5rem and a gutter of 1.25rem, rising to 2rem at 640px and 2.5rem at 1024px. A 2px red rule runs down the full height of the sheet.

- **Below 1024px** the rule sits in the gutter (0.75rem from the sheet edge, 1.125rem from 640px) and all content is padded to its right. Dates and project names sit under the heading, never above it.
- **From 1024px** an 8.5rem margin column opens on the left with a 2.5rem gap. Dates and entry names sit in it, right-aligned, beside the heading, and an entry's stay there, held 5.5rem from the top of the screen, until the entry ends. Dated list items (in-progress work, earlier work, roles, study) reach back across the gap so their dates land in the same column. Background's own date range does not follow the reader, because every role and degree under it already has a date in that column.
- **From 1280px** entries with a plate gain a third 21rem column on the right for the print.

The contents row is sticky and 4rem tall from 1024px; on a phone it wraps under the name and scrolls away. Anchors leave 5.5rem of scroll padding. Vertical rhythm between entries is 3rem to 5rem of padding, with each entry opened by a 2px ink rule.

### Named Rules
**The Margin Carries Dates Rule.** Every dated thing on the page puts its date in the margin column from 1024px, and directly under its title on a phone.

**The Figure Under The Claim Rule.** An entry's figure follows its claim directly, before any fields or prose.

## Elevation & Depth

The page is flat. Paper, ink and rules make all structure. The one exception is the taped-in print, which is lifted by a soft two-layer shadow, a slight rotation and two strips of tape.

### Shadow Vocabulary
- **Print** (`box-shadow: 0 1px 2px rgb(27 42 74 / 0.18), 0 6px 16px rgb(27 42 74 / 0.12)`; night `0 1px 2px rgb(0 0 0 / 0.4), 0 6px 16px rgb(0 0 0 / 0.35)`): plates and the page-one portrait only.

### Named Rules
**The Only Prints Lift Rule.** Nothing but a taped-in print casts a shadow. Buttons, fields and lists stay on the paper.

## Shapes

Corners are square. Buttons, the email field, plates, tables and command blocks have no radius. The focus ring takes a 2px radius. The only round forms are the measured marks on the scales, which are full circles (16px on the scorer scale, 14px on the lesion scale) with a 4px paper-coloured ring so they read cleanly against the axis. Borders are 1px hairline or ink, and 2px ink for the primary action, page breaks and the contents row.

Prints are rotated a little off square: 0.8deg clockwise by default, 0.7deg anticlockwise for the left-tilt variant. Tape strips are 5.5rem by 1.5rem (3rem by 1rem on the portrait), set at -24deg top left and -18deg bottom right.

## Components

### Page one
The owner page, with ink specks drifting over its paper. The name sits at display size with the portrait taped beside it: 5rem wide on a phone, 6rem from 640px and 7rem from 1024px, in a 6px print edge, tilted left, under one strip of tape. The role and city sit under the name in furniture type. Then come the claim at headline size, two paragraphs of bio in lead type, the availability and sponsorship line in body type, the email bar, and a link row for the CV, GitHub, LinkedIn and the twin. The robot-head plate takes the third column from 1280px; on narrower screens it comes after the links. The margin carries the date the facts were last checked.

The specks are a canvas under everything on page one, made after the page is idle and never with reduced motion: one speck per 9,000 square pixels (40 to 140, and 60% of that on a touch screen), each at most 55% ink, joined by a line of at most 18% ink wherever two are within 96px (72px on a touch screen). They drift at up to about 35px a second, a little more often up than down, and part around the pointer within 110px. Every line box of text is erased from the canvas after each frame, so no speck or line is ever under the writing. They stop while page one is off screen, and on a touch screen they draw every other frame.

### Buttons
Plain, square and ink-ruled, like the printed boxes on a form.
- **Shape:** square corners (0px).
- **Primary (Copy email):** ink fill with paper text and a 2px ink border, furniture type at 650, 10px by 20px padding, with an SVG icon that changes for idle, copied and blocked. It joins the email field into one bar from 640px.
- **Hover / Focus:** the fill and border move to ink soft over 150ms; pressing nudges it down 1px. Focus is the global 2px ink outline at a 3px offset.
- **Outline (Load the 3D model):** 1px ink border, ink text, wash ground on hover. It states the model's download size in tabular figures before the reader asks for it.
- **Theme toggle:** 1px hairline border with ink-soft text, moving to ink on hover and when pressed. It is labelled "Dark page" and exposes its state with aria-pressed. The swap cross-fades over 220ms where view transitions exist.

Controls that only work with script hide themselves when script is absent.

### Inputs / Fields
- **Email field:** the address as a mailto link styled as a field: 2px ink border, paper ground, lead type, 10px by 16px padding, wash on hover. A polite live region under it reports copied or blocked; when clipboard access fails the address is selected instead.

### Navigation
- **Contents row:** the name in title type at 720 on the left, the page names in furniture type, and the theme toggle at the end, on a paper ground with a 2px ink rule beneath. Links sit in ink soft without underline and move to ink with an underline on hover. A skip link to the first entry appears on focus as ink on paper.

### Links
Underlined at 1px in hairline with a 0.22em offset; the underline takes the text colour on hover. Colour changes leave over 140ms ease-in and arrive over 220ms ease-out. External links carry an arrow icon and announce that they open a new tab.

### Plates
A dark print taped onto the page holding one of three 3D models (robot head, brain, chess set). The print is an 8px edge around a blue-black image area at the still's own aspect ratio, captioned in furniture small with title, author and licence.

A still image is always present. The live model loads only when it is offered:
- **None:** no WebGL, or the reader prefers reduced motion. The still is the whole plate.
- **Automatic:** a fine pointer that can hover and no data-saver or 2g connection. The model mounts after the first real input (pointer move, wheel, key or touch; never scroll) once the plate is within one screen.
- **On request:** phones and constrained connections get the outline button with the download size.

The still fades out over 450ms once the canvas reports ready. The canvas renders at a device pixel ratio capped at 1.6 for the first plate and 2 elsewhere, with a self-hosted Draco decoder. Once live, a model turns with the plate's scroll position (smoothed), leans slightly toward the pointer, and moves on its own: the head looks around on two slow sines, up to 0.32rad either way when they line up, the brain turns once a minute and the board once every ninety seconds. Its own motion starts from the still's pose, so the hand-off cannot jump. Each model also gives off particles: points scattered over its real surface (3,200 on the head, whose surface is mostly hair wire outside the frame, 1,000 on the brain, 900 on the chess set, halved on a touch screen) that lift off along their normals, drift and fade, drawn additively in white ink and the cool fill, never margin red, and faded in over 1.4s. The canvas draws continuously only while it is on screen and the tab is in front, and on demand otherwise; with reduced motion the still is the whole plate.

### The Working
The second depth of an entry, a native disclosure closed by default. Its summary is furniture type in ink soft with a right caret that rotates 90deg over 220ms, and an underlined label offset 4px. The body sits behind a 1px hairline left rule in small type at 32em, with commands in code type on a wash ground. Where the browser can animate to auto height it unrolls over 340ms; elsewhere it simply opens. It is in the prerendered HTML and works without script.

### Scales
The page's memorable figure: what was written down first against what was measured, on the measure's own axis. The axis is ink, the expected region is pencil hatching (1px lines every 6px at 135deg), the expectation is a 2px ink tick, and the measured value is a round red mark. The upper label pair reads "Written down first" in pencil and "Measured" in margin red.

The measured mark is drawn at its true position by default, with or without script. Where scroll-driven animation is supported and motion is allowed, it travels from the expectation to the measurement as the entry crosses the screen (from 35% into entry to 45% cover), and travels back when the reader scrolls up. Once the scroll effects start, they move the mark instead in every figure they draw, as the drawing's last stroke; a figure that was already on screen keeps the CSS timeline, so its mark never jumps. The track is a size container clipped with a 0.75rem margin so the mark never widens the page. This is the only CSS scroll-driven animation on the page.

### Scroll effects
Loaded once the page is idle, in a chunk of their own (GSAP 3.15 with ScrollTrigger), and never where the reader prefers reduced motion. Every value they animate is a transform, a background size, or a custom property that feeds a transform. Every one is tied to scroll position, so it runs backwards on the way up, and anything on screen when they start is left as drawn. Nothing pins and nothing takes over the scroll.

A solid 2px margin-red rule scales down over the faded margin rule, from the top of the sheet to its foot, scrubbed at 0.3s. Each figure draws while its top moves from 88% to 45% of the screen, scrubbed at 0.4s: rules scale out from their left end, the retrieval path's spine from its top, step boxes and path nodes grow from nothing, the ticks for an expectation, a ceiling or zero drop from their foot, and the measured mark travels last. Transform origins are set in CSS, so that no value is read back between writes. The highlighter stroke under an entry's measured phrase widens from nothing to its full length as its line moves from 78% to 52% of the screen.

From 1024px an entry's margin date and name are sticky, 5.5rem from the top. That part is plain CSS and holds under reduced motion.

### Step Table
Used for the step-by-step result: furniture-small headers in pencil over a 2px ink rule, hairline row dividers, step names in code type, and small 12px squares filled in ink for each run that fired. Divergence notes are in margin red. No row striping.

### Browser surfaces
- **Selection:** ink ground with paper text.
- **Focus ring:** 2px solid ink, 3px offset, 2px radius, on every focusable element.
- **Scrollbar:** pencil thumb on a paper track.
- **Underline offset:** 0.22em for prose links.
- **Colour scheme:** declared light or dark so form controls and scrollbars follow the page.
- **Theme colour:** paper hex for each scheme, updated when the reader switches.
- **Reduced motion:** smooth scrolling is turned off, every transition and animation collapses to effectively zero, and the scroll effects are not fetched at all.

## Do's and Don'ts

### Do:
- **Do** put every date in margin red, in the margin column from 1024px and under the title on a phone.
- **Do** set every expected-against-measured figure on one shared axis, with the measured mark in red and the expectation in ink and pencil hatching.
- **Do** place each entry's figure directly under its claim.
- **Do** keep a still image in every plate and load WebGL only after input or on request.
- **Do** draw any animated value at its true final position first, so nothing is hidden when motion is off or unsupported.
- **Do** animate only what the reader has not reached yet; whatever is on screen when an effect starts stays as drawn.
- **Do** keep text roles at or above their measured contrast; check any new role against both paper colours.

### Don't:
- **Don't** use cards, tinted panels or shadows to group content; use ink rules and hairlines.
- **Don't** put a label, date or category above a heading.
- **Don't** use margin red for anything other than dates and measured values.
- **Don't** tint the night page blue.
- **Don't** round corners on controls, fields or prints.
- **Don't** set prose in Archivo, or anything other than code in the mono face.
- **Don't** fade content in on load; the first-screen heading ships visible.
- **Don't** stripe table rows.
- **Don't** highlight more than an entry's measured phrase.
- **Don't** pin a section or take over the scroll; every effect follows the reader's own scrolling.
- **Don't** draw decoration under text, and don't let a canvas run while it is off screen.
