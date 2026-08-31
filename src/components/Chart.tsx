"use client";

import { useId, useRef, useState } from "react";
import { m, useMotionValueEvent, useTransform } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import type { BarChartData, LineChartData, Series } from "../data/charts";
import { HOVER_IN, HOVER_OUT } from "../motion/tokens";
import { useNearestIndex, usePointerField } from "../motion/pointer";
import { useDrawProgress } from "../motion/scroll";
import { Claim } from "./Claim";
import { useReduceMotion } from "../motion/reduce";

const TONE: Record<Series["tone"], string> = {
  accent: "var(--color-brass)",
  bone: "var(--color-bone)",
  graphite: "var(--color-graphite)",
};

/** Reduced motion keeps the hover layer, it just arrives without a fade. */
const INSTANT = { duration: 0 } as const;

/**
 * A motion token written as a CSS transition. Used for the two SVG fills that
 * change on hover, so the colour change is timed by the same tokens as
 * everything else and CSS picks the direction: whichever timing is in the
 * style at the moment of the change is the one that runs. Reduced motion is
 * handled by the global rule in index.css, which flattens transitions.
 */
function timing(token: { duration: number; ease: readonly number[] }) {
  return `${token.duration}s cubic-bezier(${token.ease.join(", ")})`;
}

/**
 * These charts do not ship a categorical palette. The page has one chromatic
 * value, so identity is carried by accent-against-neutral plus a legend, a
 * distinct marker per series and selective endpoint labels. The palette
 * validator fails the categorical lightness-band and chroma-floor checks on
 * accent plus neutrals, correctly, because near-greys are not categorical hues.
 * What matters here passes: adjacent separation is 16 to 21 in OKLab against
 * both normal vision and simulated protanopia and tritanopia, and every mark
 * clears 3:1 on the ground. See DESIGN.md section 11.
 */

/** Marker shapes, so a series is never identified by colour alone. */
function Marker({
  kind,
  cx,
  cy,
  fill,
  scale = 1,
}: {
  kind: Series["marker"];
  cx: number;
  cy: number;
  fill: string;
  /** The hovered index draws the same shape larger. Geometry only, no colour change. */
  scale?: number;
}) {
  if (kind === "square") {
    const h = 3.2 * scale;
    return (
      <rect x={cx - h} y={cy - h} width={h * 2} height={h * 2} fill={fill} />
    );
  }
  if (kind === "diamond") {
    const h = 3.4 * scale;
    return (
      <rect
        x={cx - h}
        y={cy - h}
        width={h * 2}
        height={h * 2}
        fill={fill}
        transform={`rotate(45 ${cx} ${cy})`}
      />
    );
  }
  return <circle cx={cx} cy={cy} r={3.6 * scale} fill={fill} />;
}

/**
 * The hover readout. Built exactly like the citation label in DESIGN.md section
 * 9: slab fill, 1px rule border, 1px brass on the anchored edge, radius-sm,
 * shadow-float, mono-xs in read. Absolutely positioned and pointer-events none,
 * so it can never reflow the chart, never adds scroll width and never swallows
 * the hit areas under it. Values inside stay in bone, read or graphite: no text
 * anywhere in these charts takes a series colour.
 */
function Readout({
  shown,
  flip,
  reduce,
  style,
  children,
}: {
  shown: boolean;
  /** Anchored from the right, when a left anchor would run off the edge. */
  flip: boolean;
  reduce: boolean;
  style: CSSProperties;
  children: ReactNode;
}) {
  return (
    <m.div
      aria-hidden="true"
      className="t-mono-xs pointer-events-none absolute z-30 w-[8.5rem] text-read sm:w-[10rem]"
      style={{
        padding: "0.35rem 0.5rem",
        // Four longhands rather than the border shorthand plus an override:
        // React drops a shorthand that a longhand in the same object conflicts
        // with, which silently loses three of the four edges on re-render.
        borderTop: "1px solid var(--color-rule)",
        borderBottom: "1px solid var(--color-rule)",
        borderLeft: `1px solid var(--color-${flip ? "rule" : "brass"})`,
        borderRight: `1px solid var(--color-${flip ? "brass" : "rule"})`,
        borderRadius: "var(--radius-sm)",
        backgroundColor: "var(--color-slab)",
        boxShadow: "var(--shadow-float)",
        ...style,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: shown ? 1 : 0 }}
      transition={reduce ? INSTANT : shown ? HOVER_IN : HOVER_OUT}
    >
      {children}
    </m.div>
  );
}

/** Screen readers and anyone who wants the numbers get the table, not a tooltip. */
/**
 * Visually hidden, but wrapped in a div rather than carrying `sr-only` itself.
 * A table treats `width: 1px` as a minimum and auto-layout expands it to fit its
 * content, so `sr-only` on the table leaves a 700px box overflowing the page. The
 * wrapper is a real 1px clipping box; the table keeps its semantics inside it.
 */
function DataTable({
  caption,
  head,
  rows,
}: {
  caption: string;
  head: string[];
  rows: string[][];
}) {
  return (
    <div className="sr-only">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              <th scope="row">{r[0]}</th>
              {r.slice(1).map((c, i) => (
                <td key={i}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Legend({ series }: { series: Series[] }) {
  return (
    <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-1.5">
      {series.map((s) => (
        <li
          key={s.label}
          className="t-mono-xs flex items-center gap-2 text-graphite"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            aria-hidden="true"
            className="shrink-0"
          >
            <Marker kind={s.marker} cx={5} cy={5} fill={TONE[s.tone]} />
          </svg>
          {s.label}
        </li>
      ))}
    </ul>
  );
}

const W = 340;
const H = 200;
const PAD = { left: 40, right: 62, top: 10, bottom: 28 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

export function LineChart({ data }: { data: LineChartData }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduceMotion();
  const titleId = useId();

  // Tied to scroll position, so the marks draw and undraw with the reader
  // rather than firing once and then ignoring them for the rest of the session.
  const draw = useDrawProgress(ref, undefined, undefined, reduce);
  // The accent series leads by a hair; the others trail it.
  const drawA = useTransform(draw, [0, 0.82], [0, 1], { clamp: true });
  const drawB = useTransform(draw, [0.1, 0.92], [0, 1], { clamp: true });
  const drawC = useTransform(draw, [0.2, 1], [0, 1], { clamp: true });
  const seriesDraw = [drawA, drawB, drawC];
  // Markers and the endpoint label arrive once the line has reached them.
  const dots = useTransform(draw, [0.55, 0.82], [0, 1], { clamp: true });
  const tailOpacity = useTransform(draw, [0.86, 1], [0, 1], { clamp: true });

  const n = data.series[0].points.length;
  const x = (i: number) => PAD.left + (n === 1 ? 0 : (i / (n - 1)) * PLOT_W);
  const y = (v: number) =>
    PAD.top + PLOT_H - ((v - data.yMin) / (data.yMax - data.yMin)) * PLOT_H;
  /** One definition of the x value, shared by the title, the table and the readout. */
  // Prefer a per-point label. Falling back to the index would print
  // "probability cutoff 5", which is a position and not a value.
  const xValue = (i: number) =>
    data.xValues?.[i] ??
    (data.xTicks.length === n ? data.xTicks[i] : String(i));

  /**
   * The pointer position is a motion value throughout. Only the quantised
   * index crosses into React state, which is what useNearestIndex is for: it
   * writes its motion value once per index change, not once per mouse move.
   */
  const nearest = useNearestIndex(n);
  const [active, setActive] = useState(-1);
  useMotionValueEvent(nearest.index, "change", (v) => setActive(v));

  /**
   * The last index that was hovered, so the crosshair and the readout fade out
   * where they were instead of snapping back to index 0 mid fade.
   */
  const held = useRef(0);
  if (active >= 0) held.current = active;
  const at = held.current;
  const shown = active >= 0;

  /**
   * Past the midpoint the readout is anchored from the right instead, so it
   * cannot run off the right edge. The panel is 10rem at most and the plot is
   * 70% of a container that is 26rem at most, so half a plot plus the right
   * padding always has room for it at every width.
   */
  const flip = at > (n - 1) / 2;
  const anchor = (((x(at) - PAD.left) / PLOT_W) * 100).toFixed(3);
  const anchorFlipped = (((PAD.left + PLOT_W - x(at)) / PLOT_W) * 100).toFixed(
    3,
  );

  return (
    <div ref={ref} className="max-w-[26rem]">
      <Legend series={data.series} />

      {/*
        The pointer layer is an ancestor of the svg rather than a sheet laid on
        top of it. Two things fall out of that: this div's box coincides with
        the plot exactly, so useNearestIndex needs no inset and the asymmetric
        left and right padding cannot skew the nearest index, and every pointer
        event over the 24px hit areas inside the svg still bubbles up here while
        those hit areas keep showing their own native titles. The svg is scaled
        back up by the same ratio and pulled left by the padding, so it still
        paints across the full width of the container.
      */}
      <div
        className="relative"
        style={{
          marginLeft: `${((PAD.left / W) * 100).toFixed(3)}%`,
          width: `${((PLOT_W / W) * 100).toFixed(3)}%`,
        }}
        onPointerMove={(event) => nearest.track(event)}
        onPointerLeave={nearest.clear}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-labelledby={titleId}
          style={{
            overflow: "visible",
            width: `${((W / PLOT_W) * 100).toFixed(3)}%`,
            marginLeft: `${((-PAD.left / PLOT_W) * 100).toFixed(3)}%`,
          }}
        >
          <title id={titleId}>
            {`${data.yLabel} against ${data.xLabel}. ${data.series
              .map((s) => `${s.label} ends at ${data.format(s.points[n - 1])}`)
              .join(". ")}.`}
          </title>

          {/* Solid hairline grid, one shade off the ground. Never dashed. */}
          {data.yTicks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={PAD.left + PLOT_W}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--color-rule)"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={y(t) + 3}
                textAnchor="end"
                className="t-mono-xs"
                fill="var(--color-graphite)"
                style={{ fontSize: 9, letterSpacing: 0 }}
              >
                {t}
              </text>
            </g>
          ))}

          {data.xTicks.map((t, i) => {
            const step = (n - 1) / (data.xTicks.length - 1);
            return (
              <text
                key={t}
                x={x(i * step)}
                y={PAD.top + PLOT_H + 16}
                textAnchor="middle"
                fill="var(--color-graphite)"
                style={{ fontSize: 9, fontFamily: "var(--font-mono)" }}
              >
                {t}
              </text>
            );
          })}

          <text
            x={PAD.left + PLOT_W / 2}
            y={H - 2}
            textAnchor="middle"
            fill="var(--color-graphite)"
            style={{ fontSize: 9, fontFamily: "var(--font-mono)" }}
          >
            {data.xLabel}
          </text>

          {/*
            The crosshair. Snapped to the nearest index rather than trailing the
            cursor, drawn in rule like the gridlines it belongs to, and held
            inside the plot so it cannot cross the viewBox. It still appears
            under reduced motion; it simply does not fade.
          */}
          <m.line
            x1={x(at)}
            x2={x(at)}
            y1={PAD.top}
            y2={PAD.top + PLOT_H}
            stroke="var(--color-rule)"
            strokeWidth={1}
            style={{ pointerEvents: "none" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: shown ? 1 : 0 }}
            transition={reduce ? INSTANT : shown ? HOVER_IN : HOVER_OUT}
          />

          {data.series.map((s, si) => {
            const d = s.points
              .map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p)}`)
              .join(" ");
            const last = s.points[n - 1];
            // Only the series that matters gets an endpoint label when two
            // endpoints would sit within a few pixels of each other.
            const crowded =
              data.series.length === 2 &&
              Math.abs(
                y(data.series[0].points[n - 1]) -
                  y(data.series[1].points[n - 1]),
              ) < 14;
            const labelled = !crowded || s.tone === "accent";

            return (
              <g key={s.label}>
                <m.path
                  d={d}
                  fill="none"
                  stroke={TONE[s.tone]}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={
                    reduce
                      ? { pathLength: 1 }
                      : { pathLength: seriesDraw[si] ?? drawA }
                  }
                />
                {s.points.map((p, i) => (
                  <g key={i}>
                    <m.g style={reduce ? undefined : { opacity: dots }}>
                      <Marker
                        kind={s.marker}
                        cx={x(i)}
                        cy={y(p)}
                        fill={TONE[s.tone]}
                      />
                    </m.g>
                    {/* A 24px hit area, so the value is reachable by pointer too. */}
                    <rect
                      x={x(i) - 12}
                      y={y(p) - 12}
                      width={24}
                      height={24}
                      fill="transparent"
                    >
                      <title>{`${s.label}, ${data.xLabel} ${xValue(i)}: ${data.format(p)}`}</title>
                    </rect>
                  </g>
                ))}
                {labelled ? (
                  <m.text
                    x={x(n - 1) + 10}
                    y={y(last) + 3}
                    fill={TONE[s.tone]}
                    style={{
                      fontSize: 9.5,
                      fontFamily: "var(--font-mono)",
                      ...(reduce ? {} : { opacity: tailOpacity }),
                    }}
                  >
                    {data.format(last)}
                  </m.text>
                ) : null}
              </g>
            );
          })}

          {/*
            Every series reads larger at the hovered index, in one group painted
            over the lines. The largest marker is 5.6 units across from its
            centre, which at the top gridline leaves 4 units of the viewBox and
            at the bottom one leaves 22, so nothing crosses the edge.
          */}
          <m.g
            style={{ pointerEvents: "none" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: shown ? 1 : 0 }}
            transition={reduce ? INSTANT : shown ? HOVER_IN : HOVER_OUT}
          >
            {data.series.map((s) => (
              <Marker
                key={s.label}
                kind={s.marker}
                cx={x(at)}
                cy={y(s.points[at])}
                fill={TONE[s.tone]}
                scale={1.55}
              />
            ))}
          </m.g>
        </svg>

        {/* One readout for the whole crosshair, not one per series. */}
        <Readout
          shown={shown}
          flip={flip}
          reduce={reduce}
          style={{
            top: `${((PAD.top / H) * 100).toFixed(3)}%`,
            left: flip ? undefined : `calc(${anchor}% + 8px)`,
            right: flip ? `calc(${anchorFlipped}% + 8px)` : undefined,
          }}
        >
          <span className="block text-bone">{`${data.xLabel} ${xValue(at)}`}</span>
          <ul className="mt-1">
            {data.series.map((s) => (
              <li
                key={s.label}
                className="flex flex-wrap items-baseline justify-between gap-x-2"
              >
                <span className="flex items-center gap-1.5">
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 10 10"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <Marker kind={s.marker} cx={5} cy={5} fill={TONE[s.tone]} />
                  </svg>
                  {s.label}
                </span>
                <span className="text-bone">{data.format(s.points[at])}</span>
              </li>
            ))}
          </ul>
        </Readout>
      </div>

      <p className="t-mono-xs mt-4 max-w-[52ch] text-graphite">
        {data.caption}{" "}
        <Claim source={data.source} flip>
          Source
        </Claim>
      </p>

      <DataTable
        caption={`${data.yLabel} against ${data.xLabel}`}
        head={[data.xLabel, ...data.series.map((s) => s.label)]}
        rows={Array.from({ length: n }, (_, i) => [
          xValue(i),
          ...data.series.map((s) => data.format(s.points[i])),
        ])}
      />
    </div>
  );
}

const BAR_H = 14;
const BAR_GAP = 12;
/**
 * Label gutter, in viewBox units. 132 fits the model names it was written for.
 * Longer labels are anchored at its right edge and run off the left of the
 * viewBox, where the SVG clips them, so the width is measured from the data
 * instead: the labels are monospace at 9.5, which is a hair under 5.8 units a
 * character, and the widest label sets the gutter.
 */
const LABEL_MIN_W = 132;
const LABEL_CH = 5.8;
const LABEL_PAD = 12;

function labelWidth(bars: readonly { label: string }[]) {
  const longest = bars.reduce((n, b) => Math.max(n, b.label.length), 0);
  return Math.max(LABEL_MIN_W, Math.ceil(longest * LABEL_CH) + LABEL_PAD);
}

/**
 * Bar track length. Fixed rather than derived, so a bar of a given value is the
 * same length in every bar chart on the page and two charts can be read
 * against each other. The gutter varies, the track does not.
 */
const TRACK_W = 156;

export function BarChart({ data }: { data: BarChartData }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduceMotion();
  const titleId = useId();

  // Same contract as the line charts: bar length is a function of scroll
  // position, so the rows grow and shrink with the reader.
  const draw = useDrawProgress(ref, undefined, undefined, reduce);
  const grow = useTransform(draw, [0, 0.78], [0, 1], { clamp: true });
  const labels = useTransform(draw, [0.62, 0.9], [0, 1], { clamp: true });
  /**
   * Each row opens over its own slice of the progress, so the set fills top to
   * bottom as the reader arrives rather than all at once.
   *
   * These are declared one per slot at a fixed count rather than inside the row
   * map: a hook called from a loop breaks the hook order the moment the data
   * length changes, even when it happens not to today.
   */
  const rowOpen = [
    useTransform(grow, [0.0, 0.34], [0, 1], { clamp: true }),
    useTransform(grow, [0.09, 0.43], [0, 1], { clamp: true }),
    useTransform(grow, [0.18, 0.52], [0, 1], { clamp: true }),
    useTransform(grow, [0.27, 0.61], [0, 1], { clamp: true }),
    useTransform(grow, [0.36, 0.7], [0, 1], { clamp: true }),
    useTransform(grow, [0.45, 0.79], [0, 1], { clamp: true }),
    useTransform(grow, [0.54, 0.88], [0, 1], { clamp: true }),
    useTransform(grow, [0.63, 1.0], [0, 1], { clamp: true }),
  ];

  const rowH = BAR_H + BAR_GAP;
  const LABEL_W = labelWidth(data.bars);
  const height = data.bars.length * rowH;
  const svgH = height + 18;
  const chartW = LABEL_W + TRACK_W + 52;
  const trackW = TRACK_W;

  /**
   * Rows are found from the pointer's own motion value rather than from a hit
   * test, so the whole row width is live and nothing needs a per row rect. The
   * field pins itself under reduced motion, which means the hover layer never
   * engages there: every bar already prints its value beside it, and the hidden
   * table carries all five, so no value is behind a hover.
   */
  const field = usePointerField();
  const [active, setActive] = useState(-1);
  useMotionValueEvent(field.py, "change", (p) => {
    if (p < 0 || p > 1) {
      setActive(-1);
      return;
    }
    const row = Math.floor((p * svgH) / rowH);
    setActive(Math.min(data.bars.length - 1, Math.max(0, row)));
  });

  const held = useRef(0);
  if (active >= 0) held.current = active;
  const at = held.current;
  const shown = active >= 0;
  const bar = data.bars[at];
  const barEnd = LABEL_W + (bar.value / data.xMax) * trackW;
  // Past the midpoint the readout anchors from the right, so a long bar cannot
  // push it off the edge. Rows below the middle anchor from the bottom for the
  // same reason on the other axis.
  const flip = barEnd > chartW / 2;
  const vFlip = at > (data.bars.length - 1) / 2;
  const rowTop = ((at * rowH) / svgH) * 100;
  const rowBottom = ((svgH - (at * rowH + BAR_H)) / svgH) * 100;

  return (
    <div ref={ref} className="max-w-[26rem]">
      <div
        className="relative"
        onPointerMove={field.onPointerMove}
        onPointerLeave={() => {
          field.onPointerLeave();
          setActive(-1);
        }}
      >
        <svg
          viewBox={`0 0 ${chartW} ${svgH}`}
          className="w-full"
          role="img"
          aria-labelledby={titleId}
        >
          <title id={titleId}>
            {`${data.valueLabel} by model. ${data.bars
              .map((b) => `${b.label} ${data.format(b.value)}`)
              .join(", ")}.`}
          </title>

          {data.bars.map((b, i) => {
            const yTop = i * rowH;
            const w = (b.value / data.xMax) * trackW;
            const fill = b.highlight
              ? "var(--color-brass)"
              : "var(--color-graphite)";
            // The hovered bar brightens one step up the same ramp. The accent
            // bar brightens by mixing the two tokens it already sits between,
            // so no new colour enters the palette and the accent stays brass.
            const hot = b.highlight
              ? "color-mix(in oklab, var(--color-brass) 84%, var(--color-bone))"
              : "var(--color-read)";
            const live = active === i;

            return (
              <g key={b.label}>
                <text
                  x={LABEL_W - 10}
                  y={yTop + BAR_H - 3}
                  textAnchor="end"
                  style={{
                    fontSize: 9.5,
                    fontFamily: "var(--font-mono)",
                    fill:
                      live || b.highlight
                        ? "var(--color-bone)"
                        : "var(--color-read)",
                    transition: `fill ${timing(live ? HOVER_IN : HOVER_OUT)}`,
                  }}
                >
                  {b.label}
                </text>
                <m.rect
                  x={LABEL_W}
                  y={yTop}
                  height={BAR_H}
                  rx={2}
                  fill={fill}
                  style={
                    reduce
                      ? { width: w }
                      : { scaleX: rowOpen[i] ?? rowOpen[0], originX: 0 }
                  }
                  width={w}
                />
                {/* The brightened state, faded over the bar rather than
                    interpolated through it, so the colour is never a mid tone
                    that is in neither token. */}
                <m.rect
                  x={LABEL_W}
                  y={yTop}
                  height={BAR_H}
                  rx={2}
                  fill={hot}
                  width={w}
                  style={{
                    pointerEvents: "none",
                    ...(reduce
                      ? {}
                      : { scaleX: rowOpen[i] ?? rowOpen[0], originX: 0 }),
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: live ? 1 : 0 }}
                  transition={{
                    opacity: reduce ? INSTANT : live ? HOVER_IN : HOVER_OUT,
                  }}
                />
                {/*
                  The fill sits on a plain wrapper rather than on the motion
                  element. Motion writes an SVG element's style in its own
                  frame, React writes an ordinary element's immediately, and the
                  hover colour and the entrance fade are better off in separate
                  lanes. Fill inherits, so the text still takes it.
                */}
                <g
                  style={{
                    fill: b.highlight
                      ? "var(--color-brass)"
                      : live
                        ? "var(--color-bone)"
                        : "var(--color-graphite)",
                    transition: `fill ${timing(live ? HOVER_IN : HOVER_OUT)}`,
                  }}
                >
                  <m.text
                    x={LABEL_W + w + 8}
                    y={yTop + BAR_H - 3}
                    style={{
                      fontSize: 9.5,
                      fontFamily: "var(--font-mono)",
                      ...(reduce ? {} : { opacity: labels }),
                    }}
                  >
                    {data.format(b.value)}
                  </m.text>
                </g>
              </g>
            );
          })}
        </svg>

        <Readout
          shown={shown}
          flip={flip}
          reduce={reduce}
          style={{
            top: vFlip ? undefined : `${rowTop.toFixed(3)}%`,
            bottom: vFlip ? `${rowBottom.toFixed(3)}%` : undefined,
            left: flip
              ? undefined
              : `calc(${((barEnd / chartW) * 100).toFixed(3)}% + 8px)`,
            right: flip
              ? `calc(${(((chartW - barEnd) / chartW) * 100).toFixed(3)}% + 8px)`
              : undefined,
          }}
        >
          <span className="block text-bone">{bar.label}</span>
          <span className="mt-1 flex flex-wrap items-baseline justify-between gap-x-2">
            <span className="text-graphite">{data.valueLabel}</span>
            <span className="text-bone">{data.format(bar.value)}</span>
          </span>
        </Readout>
      </div>

      <p className="t-mono-xs mt-3 max-w-[52ch] text-graphite">
        {data.caption}{" "}
        <Claim source={data.source} flip>
          Source
        </Claim>
      </p>

      <DataTable
        caption={data.valueLabel}
        head={["model", data.valueLabel]}
        rows={data.bars.map((b) => [b.label, data.format(b.value)])}
      />
    </div>
  );
}
