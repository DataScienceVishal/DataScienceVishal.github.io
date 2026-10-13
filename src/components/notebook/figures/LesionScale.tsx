import type { CSSProperties } from "react";
import { LESION, signed } from "../../../data/figures";

/** The axis, in accuracy points lost by splitting correctly. */
const MIN = -1;
const MAX = 5;
const share = (v: number) => ((v - MIN) / (MAX - MIN)) * 100;
const at = (v: number) => `${share(v).toFixed(1)}%`;
/** Inside a moving mark, positions are in units of the track's width. */
const cq = (n: number) => `calc(${n.toFixed(2)} * 1cqw)`;

/**
 * The cost of the correct split, with its interval, for all three metrics.
 *
 * The expectation from the literature is "several points", which is a word and
 * not a value, so it gets no mark of its own: it is written at the right of the
 * axis, and on a browser that ties animation to scroll each measurement starts
 * there and settles at its true position. The zero line is the one that
 * matters, because two of the three intervals cross it.
 */
export function LesionScale() {
  return (
    <figure className="mt-7 max-w-[46rem]" data-ink-figure="">
      <div aria-hidden="true">
        <div className="t-furniture-sm mb-2 flex items-end justify-between gap-6 text-pencil">
          <span>Points lost by splitting by lesion</span>
          <span className="text-right">
            Expected, from published audits:
            <span className="block text-ink">several points</span>
          </span>
        </div>

        <div>
          <ul className="space-y-3">
            {LESION.gaps.map((row) => {
              const travel = {
                "--from": (share(MAX) - share(row.gap)).toFixed(1),
                "--to": "0",
              } as CSSProperties;
              return (
                <li key={row.metric} className="relative">
                  <span className="t-furniture-sm block pb-1 text-ink-soft">
                    {row.metric}
                    <span className="tabular ml-2 text-margin">
                      {signed(row.gap)} ({signed(row.low)} to {signed(row.high)})
                    </span>
                  </span>
                  <span className="scale__track block h-5">
                    <span className="absolute inset-x-0 top-1/2 h-px bg-hair" data-ink="rule-x" />
                    <span
                      className="absolute inset-y-0 w-0.5 bg-ink"
                      style={{ left: at(0) }}
                      data-ink="drop"
                    />
                    <span
                      className="scale__travel"
                      style={travel}
                      data-ink="travel"
                    >
                      <span
                        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-margin"
                        style={{
                          left: cq(share(row.low)),
                          width: cq(share(row.high) - share(row.low)),
                        }}
                      />
                      <span
                        className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-margin ring-4 ring-paper"
                        style={{ left: cq(share(row.gap)) }}
                      />
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="t-furniture-sm relative mt-2 h-4 text-pencil">
          {[-1, 0, 1, 2, 3, 4, 5].map((tick) => (
            <span
              key={tick}
              className="absolute -translate-x-1/2"
              style={{ left: at(tick) }}
            >
              {tick}
            </span>
          ))}
        </div>
      </div>

      <figcaption className="t-small mt-5 max-w-[30em] text-pencil">
        <span className="sr-only">
          {LESION.gaps
            .map((g) => `${g.metric}: ${signed(g.gap)}, interval ${signed(g.low)} to ${signed(g.high)}.`)
            .join(" ")}{" "}
        </span>
        Image split minus lesion split, paired within seed over {LESION.seeds} seeds,
        with 95% intervals. Only accuracy clears zero.
      </figcaption>
    </figure>
  );
}
