"use client";

import { useId, useRef, useState } from "react";
import {
  AnimatePresence,
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { BANDS, MOVES, SPAN, STUDY, type BandKey } from "../data/career";
import { HOVER_IN, HOVER_OUT } from "../motion/tokens";
import { useNearestIndex, usePointerField } from "../motion/pointer";

/**
 * The career as a graph rather than as a list. The ledger in Trajectory says
 * what happened; this says what it was rising through, which is the part that
 * only reads as a shape.
 *
 * Two motions, both bound to the reader rather than to a timeline:
 *
 * - The story line draws itself against this element's own crossing of the
 *   viewport, so it tracks scroll in both directions and stops when the reader
 *   stops. DESIGN.md section 12 makes the same argument for the 3D layer: a
 *   thing bound to a timeline plays to nobody.
 * - The nearest move to the pointer resolves into a readout. The panel is
 *   absolutely positioned and clamped inside the frame, so nothing reflows and
 *   nothing hangs off the edge.
 *
 * Under reduced motion the line renders drawn and the cursor layer is not
 * mounted at all.
 */

/* Geometry. Units are viewBox units; at 335px wide one unit is about 0.99px. */
const W = 340;
const H = 200;
const PAD = { left: 56, right: 14, top: 14 };
const PLOT_W = W - PAD.left - PAD.right;
const BAND_ROW = 28;
const AXIS_Y = 116;
const STUDY_TOP = 134;
const STUDY_ROW = 17;
const YEARS = [2018, 2020, 2022, 2024, 2026];

/** Plex Mono advances 0.6em, plus the 0.06em tracking of the mono-xs token. */
const FS = 8.5;
const ADVANCE = FS * 0.66;

const xOf = (year: number) =>
  PAD.left + ((year - SPAN.start) / (SPAN.end - SPAN.start)) * PLOT_W;

/** BANDS is ordinal and reads bottom up: Filings at index 0, Models at the top. */
const yOf = (band: BandKey) => {
  const i = BANDS.findIndex((b) => b.key === band);
  return PAD.top + (BANDS.length - 1 - i) * BAND_ROW;
};

/**
 * One continuous line: a horizontal run for each move at its band, and the rise
 * between two moves as the diagonal that joins them. The fractions are where
 * each move's marker sits along the total length, so a marker resolves exactly
 * as the line reaches it rather than on a guessed delay.
 */
const LINE = (() => {
  const pts: { x: number; y: number }[] = [];
  for (const move of MOVES) {
    const y = yOf(move.band);
    pts.push({ x: xOf(move.from), y });
    pts.push({ x: xOf(move.to), y });
  }

  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");

  const cum = [0];
  let total = 0;
  for (let i = 1; i < pts.length; i += 1) {
    total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    cum.push(total);
  }

  return {
    d,
    marks: MOVES.map((move, i) => ({
      x: pts[i * 2].x,
      y: pts[i * 2].y,
      /** 0 to 1 along the line, for the reveal. */
      at: cum[i * 2] / total,
      /** Centre of the run, for the readout panel. */
      mid: (pts[i * 2].x + pts[i * 2 + 1].x) / 2 / W,
      last: i === MOVES.length - 1,
      move,
    })),
  };
})();

/** The study track. Labels flip to the far end of the bar rather than clip. */
const STUDY_ROWS = STUDY.map((entry, i) => {
  const x1 = xOf(entry.from);
  const x2 = xOf(entry.to);
  const base = STUDY_TOP + i * STUDY_ROW;
  return {
    ...entry,
    x1,
    x2,
    base,
    flip: x1 + entry.label.length * ADVANCE > W - 2,
  };
});

function MoveMarker({
  mark,
  reveal,
  highlighted,
  reduce,
}: {
  mark: (typeof LINE.marks)[number];
  reveal: MotionValue<number>;
  highlighted: boolean;
  reduce: boolean;
}) {
  const from = Math.min(mark.at, 0.94);
  const opacity = useTransform(reveal, [from, from + 0.05], [0, 1]);

  return (
    <m.circle
      cx={mark.x}
      cy={mark.y}
      r={3.6}
      fill={mark.last ? "var(--color-brass)" : "var(--color-void)"}
      stroke="var(--color-brass)"
      strokeWidth={1.5}
      style={reduce ? { opacity: 1 } : { opacity }}
      initial={false}
      animate={reduce ? undefined : { r: highlighted ? 5.6 : 3.6 }}
      transition={highlighted ? HOVER_IN : HOVER_OUT}
    />
  );
}

export function CareerGraph() {
  const frameRef = useRef<HTMLDivElement>(null);
  const reduce = Boolean(useReducedMotion());
  const titleId = useId();

  /**
   * The element's own crossing of the viewport, the same range the 3D layer
   * uses. Bound to scroll position, so it runs backwards when the reader
   * scrolls back up instead of firing once and being spent.
   */
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start end", "end start"],
  });
  // The line completes before the graph leaves, so the finished shape is
  // readable rather than only existing at the moment it exits the screen.
  const drawn = useTransform(scrollYProgress, [0.12, 0.62], [0, 1]);

  const field = usePointerField();
  const nearest = useNearestIndex(MOVES.length);
  const [active, setActive] = useState(-1);
  useMotionValueEvent(nearest.index, "change", (v) => setActive(v));

  const guideX = useTransform(field.px, (v) => `${v * 100}%`);
  const shown = active >= 0 ? LINE.marks[active] : null;

  return (
    <figure className="m-0 w-full max-w-[48rem]">
      <div ref={frameRef} className="relative w-full">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-labelledby={titleId}
        >
          <title id={titleId}>
            Nine years, from GST filings in 2018 to agent reliability in 2027.
            The work rises through four bands, Filings to Reporting to Pipelines
            to Models, while four periods of study run underneath and overlap it.
          </title>

          {/* Bands. Hairlines in rule, labels in graphite: rule is never text. */}
          {BANDS.map((band) => {
            const y = yOf(band.key);
            return (
              <g key={band.key}>
                <line
                  x1={PAD.left}
                  x2={PAD.left + PLOT_W}
                  y1={y}
                  y2={y}
                  stroke="var(--color-rule)"
                  strokeWidth={1}
                />
                <text
                  x={1}
                  y={y + 3}
                  className="t-mono-xs"
                  fill="var(--color-graphite)"
                  style={{ fontSize: FS }}
                >
                  {band.label}
                </text>
              </g>
            );
          })}

          {/* Time. */}
          {YEARS.map((year) => (
            <text
              key={year}
              x={xOf(year)}
              y={AXIS_Y}
              textAnchor="middle"
              className="t-mono-xs"
              fill="var(--color-graphite)"
              style={{ fontSize: FS }}
            >
              {year}
            </text>
          ))}

          {/* The story line. */}
          <m.path
            d={LINE.d}
            fill="none"
            stroke="var(--color-brass)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={reduce ? undefined : { pathLength: drawn }}
          />

          {LINE.marks.map((mark, i) => (
            <MoveMarker
              key={mark.move.org}
              mark={mark}
              reveal={drawn}
              highlighted={active === i}
              reduce={reduce}
            />
          ))}

          {/* The second track. It overlaps the work, which is the point. */}
          <text
            x={1}
            y={STUDY_TOP + STUDY_ROW + 6}
            className="t-mono-xs"
            fill="var(--color-graphite)"
            style={{ fontSize: FS }}
          >
            Study
          </text>

          {STUDY_ROWS.map((row) => (
            <g key={row.label}>
              <text
                x={row.flip ? row.x2 : row.x1}
                y={row.base}
                textAnchor={row.flip ? "end" : "start"}
                className="t-mono-xs"
                fill="var(--color-graphite)"
                style={{ fontSize: FS }}
              >
                {row.label}
              </text>
              <rect
                x={row.x1}
                y={row.base + 5}
                width={Math.max(row.x2 - row.x1, 1)}
                height={2.5}
                rx={1.25}
                fill="var(--color-graphite)"
              />
            </g>
          ))}
        </svg>

        {/* The cursor layer. Not mounted under reduced motion, and pointer only
            from md up, the same rule the citation label follows. */}
        {reduce ? null : (
          <div className="absolute inset-0 hidden md:block">
            <div
              aria-hidden="true"
              className="absolute top-0 bottom-0"
              style={{
                left: `${(PAD.left / W) * 100}%`,
                right: `${(PAD.right / W) * 100}%`,
              }}
              onPointerMove={(event) => {
                field.onPointerMove(event);
                nearest.track(event);
              }}
              onPointerLeave={() => {
                field.onPointerLeave();
                nearest.clear();
              }}
            >
              <m.div
                className="pointer-events-none absolute top-0 w-px"
                style={{
                  left: guideX,
                  opacity: field.active,
                  height: `${(AXIS_Y / H) * 100}%`,
                  backgroundColor: "var(--color-rule)",
                }}
              />
            </div>

            <AnimatePresence>
              {shown ? (
                <m.div
                  key={shown.move.org}
                  aria-hidden="true"
                  className="t-mono-xs pointer-events-none absolute top-0 z-10 w-[18rem] max-w-full p-2 text-read"
                  style={{
                    // Centred on the move, then clamped inside the frame, so it
                    // can never hang off either edge and never reflows. Top
                    // anchored, and 18rem wide rather than 14 so the longest
                    // note wraps to three lines instead of four: the panel then
                    // ends around 60 viewBox units, well clear of the year
                    // labels at 116 and the study track below them, and only
                    // ever sits over the two top band hairlines.
                    left: `calc(max(0px, min(${(shown.mid * 100).toFixed(
                      2,
                    )}% - 9rem, 100% - 18rem)))`,
                    // Four longhands, never `border` plus `borderLeft`. React
                    // clears the shorthand a longhand conflicts with and then
                    // skips re-setting unchanged longhands, so the mixed form
                    // loses edges on re-render.
                    borderTop: "1px solid var(--color-rule)",
                    borderRight: "1px solid var(--color-rule)",
                    borderBottom: "1px solid var(--color-rule)",
                    borderLeft: "1px solid var(--color-brass)",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--color-slab)",
                    boxShadow: "var(--shadow-float)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: HOVER_OUT }}
                  transition={HOVER_IN}
                >
                  <span className="block text-bone">{shown.move.org}</span>
                  <span className="block text-graphite">{shown.move.role}</span>
                  <span className="block text-graphite">{shown.move.dates}</span>
                  <span className="mt-2 block">{shown.move.note}</span>
                </m.div>
              ) : null}
            </AnimatePresence>
          </div>
        )}
      </div>

      <figcaption className="t-mono-xs mt-4 max-w-[52ch] text-graphite">
        The work track rises through what he was actually doing rather than
        through job titles. The study track underneath runs alongside it for six
        of the nine years.
      </figcaption>

      <div className="sr-only">
        <table>
        <caption>Career moves, by band</caption>
        <thead>
          <tr>
            <th scope="col">Dates</th>
            <th scope="col">Organisation</th>
            <th scope="col">Role</th>
            <th scope="col">Band</th>
          </tr>
        </thead>
        <tbody>
          {MOVES.map((move) => (
            <tr key={move.org}>
              <th scope="row">{move.dates}</th>
              <td>{move.org}</td>
              <td>{move.role}</td>
              <td>
                {BANDS.find((b) => b.key === move.band)?.label ?? move.band}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  );
}
