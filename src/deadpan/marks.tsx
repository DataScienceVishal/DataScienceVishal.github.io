/**
 * The marks drawn over a player's tag and beside the meeting's text, in the
 * notebook's own ink: a few strokes each in a 16 by 16 box, coloured only
 * through the theme's tokens. They replace emoji, which the standing rules
 * keep off the rendered page. Each keeps its label as its accessible name,
 * and the legend shows every one. Order is the legend's order.
 */
import type { ReactElement } from "react";

export const MARKS = {
  work: { label: "Working on a job" },
  ring: { label: "Ringing the bell" },
  strike: { label: "The wrecker takes someone out" },
  out: { label: "Taken out" },
  found: { label: "Found a body" },
  witness: { label: "Saw it happen" },
  thinking: { label: "Waiting for the model" },
  speaking: { label: "Speaking" },
  suspect: { label: "Suspects someone" },
  lie: { label: "A false claim" },
  voted: { label: "Has voted" },
  skip: { label: "Voted to skip" },
  ashore: { label: "Sent ashore" },
  won: { label: "On the winning side" },
} as const;

export type Mark = keyof typeof MARKS;

const INK = "var(--ink)";
const PENCIL = "var(--pencil)";
const RED = "var(--margin)";

/** Shared stroke settings: round ends, so two-pixel lines read as pen. */
const pen = (colour: string, width = 1.6) => ({
  fill: "none",
  stroke: colour,
  strokeWidth: width,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

const DRAW: Record<Mark, ReactElement> = {
  // A spanner: a shaft with an open jaw at the top.
  work: (
    <g {...pen(INK)}>
      <path d="M4 13 L10 7" />
      <path d="M9 4.5 A3 3 0 1 0 12.5 8 L10.5 7 L9.6 6.4 Z" />
    </g>
  ),
  // A bell with its clapper.
  ring: (
    <g {...pen(INK)}>
      <path d="M4 11.5 C4.5 10 5 9 5 6.5 A3 3 0 0 1 11 6.5 C11 9 11.5 10 12 11.5 Z" />
      <path d="M7 13.5 L9 13.5" />
    </g>
  ),
  // A burst: eight short strokes out from the centre.
  strike: (
    <g {...pen(RED, 1.8)}>
      <path d="M8 2 L8 5 M8 11 L8 14 M2 8 L5 8 M11 8 L14 8 M3.8 3.8 L5.9 5.9 M10.1 10.1 L12.2 12.2 M12.2 3.8 L10.1 5.9 M5.9 10.1 L3.8 12.2" />
    </g>
  ),
  // A cross, as a name struck out. Ink, not red: red marks only the strike
  // and the lie, which are what the page measures.
  out: (
    <g {...pen(INK, 2)}>
      <path d="M4 4 L12 12 M12 4 L4 12" />
    </g>
  ),
  // An exclamation mark.
  found: (
    <g {...pen(INK, 2)}>
      <path d="M8 2.5 L8 10" />
      <path d="M8 13.4 L8 13.6" />
    </g>
  ),
  // An open eye.
  witness: (
    <g {...pen(INK)}>
      <path d="M1.8 8 C4 4 12 4 14.2 8 C12 12 4 12 1.8 8 Z" />
      <circle cx="8" cy="8" r="1.8" fill={INK} />
    </g>
  ),
  // Three dots, the way a pause is written.
  thinking: (
    <g fill={PENCIL}>
      <circle cx="3.5" cy="8" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="12.5" cy="8" r="1.5" />
    </g>
  ),
  // A speech balloon with a tail.
  speaking: (
    <g {...pen(INK)}>
      <path d="M2.5 3.5 L13.5 3.5 L13.5 10.5 L7 10.5 L4 13.5 L4 10.5 L2.5 10.5 Z" />
    </g>
  ),
  // A question mark.
  suspect: (
    <g {...pen(INK, 1.8)}>
      <path d="M5.2 5.4 A2.8 2.8 0 1 1 9.4 7.8 C8.4 8.4 8 9 8 10.4" />
      <path d="M8 13.4 L8 13.6" />
    </g>
  ),
  // An equals sign struck through: said, and not so.
  lie: (
    <g {...pen(RED, 1.8)}>
      <path d="M3 6 L13 6 M3 10 L13 10" />
      <path d="M11 2.5 L5 13.5" />
    </g>
  ),
  // A tick in a box.
  voted: (
    <g {...pen(INK)}>
      <path d="M2.5 2.5 L13.5 2.5 L13.5 13.5 L2.5 13.5 Z" />
      <path d="M5 8.2 L7.2 10.5 L11 5.5" />
    </g>
  ),
  // An empty box with a dash: a ballot left blank.
  skip: (
    <g {...pen(PENCIL)}>
      <path d="M2.5 2.5 L13.5 2.5 L13.5 13.5 L2.5 13.5 Z" />
      <path d="M5.5 8 L10.5 8" />
    </g>
  ),
  // A boat: a hull and a sail.
  ashore: (
    <g {...pen(INK)}>
      <path d="M2 10.5 L14 10.5 L12 13.5 L4 13.5 Z" />
      <path d="M8 10.5 L8 2.5 L12.5 9 L8 9" />
    </g>
  ),
  // A five-pointed star.
  won: (
    <g {...pen(INK, 1.4)}>
      <path d="M8 1.8 L9.8 6 L14.2 6.3 L10.8 9.2 L11.9 13.6 L8 11.2 L4.1 13.6 L5.2 9.2 L1.8 6.3 L6.2 6 Z" />
    </g>
  ),
};

/** A mark inside the island's SVG, centred on x and y, with its label as a tooltip. */
export function MarkSvg({ mark, x, y, size = 16 }: { mark: Mark; x: number; y: number; size?: number }) {
  const scale = size / 16;
  return (
    <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${scale})`}>
      <title>{MARKS[mark].label}</title>
      {DRAW[mark]}
    </g>
  );
}

/** A mark set inline with text, sized to the line, named by its label. */
export function MarkIcon({ mark }: { mark: Mark }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="1.05em"
      height="1.05em"
      role="img"
      aria-label={MARKS[mark].label}
      className="inline-block shrink-0 align-[-0.15em]"
    >
      {DRAW[mark]}
    </svg>
  );
}
