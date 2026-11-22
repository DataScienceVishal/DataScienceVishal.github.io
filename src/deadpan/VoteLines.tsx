import { useLayoutEffect, useRef, useState } from "react";
import type { Vote } from "./types";

/**
 * The vote, drawn: voters down the left in the order they voted, each choice
 * once down the right with its count, and a line from each voter to their
 * choice. Keepers who held proof that the wrecker lied are ringed in margin
 * red, and their line is red, solid when they voted for the wrecker and
 * dashed when not; everyone else's line is pencil. Each voter's reason sits
 * under the voter. A line runs level along its voter's own row to the edge of
 * the voters' column and only then turns towards the choice, so it never
 * crosses a reason: writing stays on bare paper. The lines are measured off
 * the tags as laid out, because a reason that wraps makes its row taller, and
 * are redrawn when the column changes width. A visually hidden list says the
 * same in words.
 */

interface Line {
  from: string;
  to: string;
  /** The voter's tag, the edge of the voters' column on the same row, the choice's tag. */
  points: string;
}

const said = (choice: string) => (choice === "skip" ? "skipped" : choice);

function Tag({ name, wrecker, ringed }: { name: string; wrecker: boolean; ringed?: boolean }) {
  return (
    <span
      className={`t-furniture-sm inline-block border-[1.5px] border-ink px-1.5 py-px ${
        wrecker ? "bg-ink text-paper" : "bg-paper text-ink"
      } ${ringed ? "outline-2 outline-offset-2 outline-margin outline-solid" : ""}`}
      style={{ fontWeight: 650 }}
    >
      {name}
    </span>
  );
}

export function VoteLines({
  votes,
  tally,
  wrecker,
  holders,
}: {
  votes: Vote[];
  tally: Record<string, number>;
  wrecker: string;
  holders: string[];
}) {
  const box = useRef<HTMLDivElement>(null);
  const voters = useRef<HTMLOListElement>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const targets = [...new Set(votes.map((v) => v.choice))];

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const at = el.getBoundingClientRect();
      const edge = (selector: string, side: "left" | "right") => {
        const tag = el.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
        if (!tag) return null;
        // Holders' tags carry a ring 4px outside the box; start past it.
        const pad = 6;
        return {
          x: (side === "right" ? tag.right + pad : tag.left - pad) - at.left,
          y: tag.top + tag.height / 2 - at.top,
        };
      };
      const turn = (voters.current?.getBoundingClientRect().right ?? at.left) - at.left + 4;
      const drawn: Line[] = [];
      for (const v of votes) {
        const a = edge(`[data-voter="${CSS.escape(v.name)}"] [data-tag]`, "right");
        const b = edge(`[data-target="${CSS.escape(v.choice)}"] [data-tag]`, "left");
        if (a && b) {
          drawn.push({ from: v.name, to: v.choice, points: `${a.x},${a.y} ${Math.max(turn, a.x)},${a.y} ${b.x},${b.y}` });
        }
      }
      setLines(drawn);
    };
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(el);
    return () => watch.disconnect();
  }, [votes]);

  return (
    <div data-vote-lines="" className="relative mt-3">
      <div ref={box} className="relative grid grid-cols-[minmax(0,1fr)_3rem_auto] sm:grid-cols-[minmax(0,1fr)_6rem_auto]">
        <ol ref={voters} className="col-start-1 grid gap-y-3">
          {votes.map((v) => {
            const holder = holders.includes(v.name);
            return (
              <li key={v.name} data-voter={v.name} {...(holder ? { "data-holder": "true" } : {})}>
                <span data-tag="">
                  <Tag name={v.name} wrecker={v.name === wrecker} ringed={holder} />
                </span>
                {v.reason ? <p className="t-small mt-1 text-pencil">{v.reason}</p> : null}
              </li>
            );
          })}
        </ol>
        <ol className="col-start-3 flex flex-col justify-around gap-y-3">
          {targets.map((t) => (
            <li key={t} data-target={t} className="flex items-center gap-2">
              <span data-tag="">
                {t === "skip" ? (
                  <span className="t-furniture-sm inline-block border-[1.5px] border-dashed border-pencil px-1.5 py-px text-ink-soft">
                    skipped
                  </span>
                ) : (
                  <Tag name={t} wrecker={t === wrecker} />
                )}
              </span>
              <span className="t-furniture tabular text-ink">{tally[t] ?? 0}</span>
            </li>
          ))}
        </ol>
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          {lines.map((l) => {
            const holder = holders.includes(l.from);
            const used = l.to === wrecker;
            return (
              <polyline
                key={l.from}
                data-from={l.from}
                data-to={l.to}
                {...(holder ? { "data-used": String(used) } : {})}
                points={l.points}
                fill="none"
                strokeLinejoin="round"
                stroke={holder ? "var(--margin)" : "var(--pencil)"}
                strokeWidth={holder ? 2 : 1.25}
                strokeDasharray={holder && !used ? "5 4" : undefined}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      </div>
      <p className="t-furniture-sm mt-3 text-pencil">
        Red solid: held proof and voted for the wrecker. Red dashed: held proof and did not. Grey: everyone else.
      </p>
      <ul className="sr-only">
        {votes.map((v) => (
          <li key={v.name}>
            {v.choice === "skip" ? `${v.name} skipped.` : `${v.name} voted for ${said(v.choice)}.`}
            {holders.includes(v.name) ? ` ${v.name} held proof that the wrecker lied.` : ""}
            {v.reason ? ` "${v.reason}"` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
