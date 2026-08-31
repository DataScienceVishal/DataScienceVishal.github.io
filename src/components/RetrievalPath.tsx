"use client";

import { useRef } from "react";
import { m, useReducedMotion, useTransform } from "motion/react";
import { useDrawProgress } from "../motion/scroll";
import { Claim } from "./Claim";
import { CursorPanel } from "./CursorPanel";

/**
 * The twin's real retrieval path, from its own README. Every label and every
 * number is a value in that repository, not an illustration.
 *
 * It sits inside the twin's own case study rather than in the hero, so the
 * diagram is next to the project it documents. Because it is below the fold it
 * runs on first view rather than on page load: a signal that had already
 * finished before anyone scrolled to it would be a wasted one.
 *
 * Built as an ordered list rather than one flat SVG, so the text is selectable,
 * responsive and read in order by a screen reader. The only drawn parts are the
 * spine and the nodes.
 *
 * A brass signal runs the spine once on load and each stage resolves as it
 * passes. This is the page's one orchestrated moment and it carries meaning: it
 * shows how a question becomes a cited answer. Nothing loops.
 */

interface Stage {
  op: string;
  detail: string;
  terminal?: boolean;
}

const STAGES: Stage[] = [
  { op: "Question", detail: "plus the last 2 user turns" },
  { op: "Embed", detail: "text-embedding-3-small" },
  { op: "Search", detail: "87 documents in ChromaDB" },
  { op: "Cut", detail: "drop past 0.75 cosine distance" },
  { op: "Boost", detail: "intent, 0.12 off the distance" },
  { op: "Ground", detail: "best 5 chunks into the prompt" },
  { op: "Answer", detail: "streamed, with its sources", terminal: true },
];

/** Seconds for the signal to run the whole spine, once it is in view. */
/**
 * Where each stage sits along the spine, as a fraction of the run. Compressed to
 * 0.82 so the last stage still has room to resolve before the progress tops out;
 * at a flat 1.0 the Answer node never finished lighting.
 */
const stageAt = (i: number) => (i / (STAGES.length - 1)) * 0.82;
/** Resting dimness before the signal reaches a stage. */
const DIM = 0.26;

export function RetrievalPath() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // The signal position is a function of scroll, so it runs with the reader and
  // runs backwards if they scroll back up. It used to fire once on first view,
  // which meant a reader who scrolled past and returned saw nothing happen.
  const draw = useDrawProgress(ref, 0.05, 0.5);
  const signal = useTransform(draw, [0, 1], [0, 1], { clamp: true });
  const caption = useTransform(draw, [0.82, 1], [0, 1], { clamp: true });

  /**
   * One value per stage, resolving as the signal reaches its point on the spine.
   * Declared at a fixed count rather than inside the render map, so the hook
   * order cannot shift if a stage is ever added.
   */
  const stageOpacity = [
    useTransform(draw, [stageAt(0), stageAt(0) + 0.1], [DIM, 1], { clamp: true }),
    useTransform(draw, [stageAt(1), stageAt(1) + 0.1], [DIM, 1], { clamp: true }),
    useTransform(draw, [stageAt(2), stageAt(2) + 0.1], [DIM, 1], { clamp: true }),
    useTransform(draw, [stageAt(3), stageAt(3) + 0.1], [DIM, 1], { clamp: true }),
    useTransform(draw, [stageAt(4), stageAt(4) + 0.1], [DIM, 1], { clamp: true }),
    useTransform(draw, [stageAt(5), stageAt(5) + 0.1], [DIM, 1], { clamp: true }),
    useTransform(draw, [stageAt(6), stageAt(6) + 0.1], [DIM, 1], { clamp: true }),
  ];

  return (
    <figure ref={ref} className="m-0 w-full max-w-[32rem]">
      <CursorPanel className="p-6 sm:p-8">
        <p className="t-mono-sm text-graphite">Retrieval path</p>
        <hr className="mt-4 mb-7 border-0 border-t border-rule" />

        <div className="relative">
          {/* The spine, and the signal that travels it. */}
          <span
            aria-hidden="true"
            className="absolute top-3 bottom-3 left-[6px] w-px bg-rule"
          />
          <m.span
            aria-hidden="true"
            className="absolute top-3 bottom-3 left-[6px] w-px origin-top bg-brass"
            style={reduce ? { scaleY: 1 } : { scaleY: signal }}
          />

          <ol className="relative flex flex-col gap-5">
            {STAGES.map((stage, i) => (
              <m.li
                key={stage.op}
                className="grid grid-cols-[13px_minmax(0,1fr)] items-baseline gap-x-4 sm:grid-cols-[13px_5.25rem_minmax(0,1fr)]"
                style={
                  reduce ? { opacity: 1 } : { opacity: stageOpacity[i] }
                }
              >
                <m.span
                  aria-hidden="true"
                  className="relative z-10 mt-[5px] block size-[13px] shrink-0 rounded-full border"
                  style={{
                    borderColor: stage.terminal
                      ? "var(--color-brass)"
                      : "var(--color-graphite)",
                    backgroundColor: stage.terminal
                      ? "var(--color-brass)"
                      : "var(--color-slab)",
                  }}
                />
                <span
                  className={`t-title ${stage.terminal ? "text-brass" : "text-bone"}`}
                >
                  {stage.op}
                </span>
                <span className="t-mono-xs col-start-2 text-graphite sm:col-start-3">
                  {stage.detail}
                </span>
              </m.li>
            ))}
          </ol>
        </div>
      </CursorPanel>

      <m.figcaption
        className="t-mono-xs mt-6 max-w-[44ch] border-l border-brass pl-4 text-graphite"
        style={reduce ? undefined : { opacity: caption }}
      >
        <span className="text-read">
          How a question about me becomes an answer with a citation.
        </span>{" "}
        Every value on this path is{" "}
        <Claim source="twin-repo">a setting in the repository</Claim>.
      </m.figcaption>
    </figure>
  );
}
