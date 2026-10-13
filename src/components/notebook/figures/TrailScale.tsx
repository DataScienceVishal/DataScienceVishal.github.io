import type { CSSProperties } from "react";
import { TRAIL, dp3 } from "../../../data/figures";

const at = (v: number) => `${(v * 100).toFixed(1)}%`;
/** The same position as a bare number, for the mark that moves in cqw. */
const pct = (v: number) => (v * 100).toFixed(1);

/**
 * P1 against its result, on TRAIL's own 0 to 1 scale.
 *
 * The hatched span is the region the pre-registration allowed: no better than
 * the best real judge. The red mark is where the predictor that reads nothing
 * landed. It sits at its true position in the markup, and only where the
 * browser can tie an animation to scroll does it travel there from the edge of
 * the hatching as the entry arrives. See `.scale__travel` in index.css.
 */
export function TrailScale() {
  const travel = { "--from": pct(TRAIL.best), "--to": pct(TRAIL.blind) } as CSSProperties;

  return (
    <figure className="mt-5 max-w-[46rem]" data-ink-figure="">
      <div aria-hidden="true">
        <div className="t-furniture-sm relative h-10">
          <span className="absolute bottom-1.5 left-0 text-pencil">
            <span className="block">Written down first</span>
            <span className="block text-ink">no better than {dp3(TRAIL.best)}</span>
          </span>
          <span className="absolute right-0 bottom-1.5 text-right text-margin">
            <span className="block">Measured</span>
            <span className="block" style={{ fontWeight: 700 }}>
              {dp3(TRAIL.blind)}
            </span>
          </span>
        </div>

        <div className="scale__track h-7">
          <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-ink" data-ink="rule-x" />
          <span
            className="hatch absolute top-1/2 left-0 h-4 -translate-y-1/2"
            style={{ width: at(TRAIL.best) }}
            data-ink="rule-x"
          />
          <span
            className="absolute top-0 h-7 w-0.5 bg-ink"
            style={{ left: at(TRAIL.best) }}
            data-ink="drop"
          />
          <span
            className="absolute top-1 h-5 w-px bg-pencil"
            style={{ left: at(TRAIL.ceiling) }}
            data-ink="drop"
          />
          <span
            className="scale__travel"
            style={travel}
            data-ink="travel"
          >
            <span className="absolute top-1/2 left-0 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-margin ring-4 ring-paper" />
          </span>
        </div>

        <div className="t-furniture-sm relative mt-1.5 flex justify-between text-pencil">
          <span>0</span>
          <span>0.5</span>
          <span>1</span>
        </div>
        <p className="t-furniture-sm mt-1 text-right text-pencil">
          a program that reads nothing
        </p>
      </div>

      <figcaption className="t-small mt-4 max-w-[30em] text-pencil">
        <span className="sr-only">
          Expected no better than {dp3(TRAIL.best)}; measured {dp3(TRAIL.blind)}.{" "}
        </span>
        Joint accuracy on GAIA through TRAIL&apos;s own scorer. The hatched span is
        where a program that reads nothing should have landed, and the red mark
        is where it did. {dp3(TRAIL.ceiling)}, the thin tick, is the most anything
        can score.
      </figcaption>
    </figure>
  );
}
