"use client";

import { Cube } from "@phosphor-icons/react";
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { PLATES, type PlateId } from "../../data/plates";
import { hasWebGL } from "../../lib/webgl";
import { useReduceMotion } from "../../motion/reduce";
import { Boundary } from "../Boundary";

const LiveModel = lazy(() => import("./LiveModel"));

/**
 * How this device gets offered the live model.
 *
 * - none: no WebGL, or the reader asked for reduced motion. The live model
 *   would only ever sit at the still's pose, so the still is the whole plate.
 * - auto: a mouse and room to spare. Mounts once the reader has touched the
 *   page and the plate is within a screen of them.
 * - button: a phone, or a metered or 2g connection. Nothing heavy loads until
 *   they ask, and the button says how heavy before they do.
 *
 * Before this existed, Lighthouse 13.5 put the live site's mobile performance at
 * 43 on two runs, and one of them spent 7.2 s of throttled main thread in the
 * 3D chunk, inside the window it scores. Phones pay the most for WebGL, so on a
 * phone it is the reader's choice.
 */
type Offer = "none" | "auto" | "button";

function decideOffer(): Offer {
  if (!hasWebGL()) return "none";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "none";
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  const stingy =
    connection?.saveData === true ||
    (connection?.effectiveType ? /(^|-)2g$/.test(connection.effectiveType) : false);
  const mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  return mouse && !stingy ? "auto" : "button";
}

/*
 * The first input of any kind, shared by every plate. Scroll is deliberately
 * not on the list: restoring a scroll position or following an anchor fires it
 * with nobody at the keyboard, and that is exactly the load this waits out.
 */
const INPUTS = ["pointermove", "wheel", "keydown", "touchstart"] as const;
let touched = false;
const waiting = new Set<() => void>();

function fire() {
  touched = true;
  for (const type of INPUTS) window.removeEventListener(type, fire);
  const pending = [...waiting];
  waiting.clear();
  for (const run of pending) run();
}

function onFirstInput(run: () => void): () => void {
  if (touched) {
    run();
    return () => {};
  }
  if (waiting.size === 0) {
    for (const type of INPUTS) window.addEventListener(type, fire, { passive: true });
  }
  waiting.add(run);
  return () => {
    waiting.delete(run);
    if (waiting.size === 0 && !touched) {
      for (const type of INPUTS) window.removeEventListener(type, fire);
    }
  };
}

const LICENCE = "https://creativecommons.org/licenses/by/4.0/";
const out = { target: "_blank", rel: "noopener noreferrer" } as const;

export function Plate({
  id,
  eager = false,
  tilt = "right",
  className = "",
}: {
  id: PlateId;
  /** Plate 1 is on the first screen: its still loads first and its canvas stays light. */
  eager?: boolean;
  tilt?: "left" | "right";
  className?: string;
}) {
  const plate = PLATES[id];
  const reduce = useReduceMotion();
  const host = useRef<HTMLDivElement>(null);
  const [offer, setOffer] = useState<Offer>("none");
  const [wanted, setWanted] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => setOffer(decideOffer()), []);

  useEffect(() => {
    if (offer !== "auto" || wanted) return;
    const el = host.current;
    if (!el) return;
    let near = false;
    let input = false;
    let idle: number | undefined;
    /*
     * Not on the input itself. The first mouse move is often the start of a
     * click, and on a machine rendering WebGL in software the model's parse and
     * shader compile held the main thread for seconds: the click it arrived
     * with was answered late. Waiting for idle lets that interaction finish.
     */
    // Safari has no requestIdleCallback, whatever the DOM typings say.
    const hasIdle = typeof window.requestIdleCallback === "function";
    const go = () => {
      if (!near || !input || idle !== undefined) return;
      idle = hasIdle
        ? window.requestIdleCallback(() => setWanted(true), { timeout: 1500 })
        : window.setTimeout(() => setWanted(true), 300);
    };
    const watch = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          near = true;
          watch.disconnect();
          go();
        }
      },
      { rootMargin: "100% 0px 100% 0px" },
    );
    watch.observe(el);
    const stop = onFirstInput(() => {
      input = true;
      go();
    });
    return () => {
      watch.disconnect();
      stop();
      if (idle === undefined) return;
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [offer, wanted]);

  const onReady = useCallback(() => setLive(true), []);
  const { width, height, src } = plate.still;

  return (
    <figure className={`m-0 ${className}`}>
      <div
        className={`plate__print ${tilt === "left" ? "plate__print--tilt-left" : ""}`}
      >
        <span className="plate__tape plate__tape--a" aria-hidden="true" />
        <div
          ref={host}
          className="plate__image"
          style={{ aspectRatio: `${width} / ${height}` }}
        >
          <img
            src={src}
            width={width}
            height={height}
            alt={plate.alt}
            // Eager for plate 1, but not high priority: on a phone it sits below
            // the fold, and a preload of it was taking bandwidth from the two
            // fonts the first screen's text is waiting on.
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            data-gone={live}
            className="plate__still absolute inset-0 h-full w-full object-contain"
          />
          {wanted && offer !== "none" ? (
            <Boundary>
              <Suspense fallback={null}>
                <div className="absolute inset-0" aria-hidden="true">
                  <LiveModel
                    host={host}
                    plate={plate}
                    maxDpr={eager ? 1.6 : 2}
                    reduce={reduce}
                    onReady={onReady}
                  />
                </div>
              </Suspense>
            </Boundary>
          ) : null}
        </div>
        <span className="plate__tape plate__tape--b" aria-hidden="true" />
      </div>

      <figcaption className="t-furniture-sm mt-5 max-w-[24em] text-pencil">
        <span className="text-ink-soft">Plate {plate.n}.</span>{" "}
        <a href={plate.titleHref} {...out} className="text-ink-soft">
          {plate.title}
        </a>
        , by{" "}
        {plate.byHref ? (
          <a href={plate.byHref} {...out} className="text-ink-soft">
            {plate.by}
          </a>
        ) : (
          plate.by
        )}
        .{" "}
        <a href={LICENCE} {...out} className="text-ink-soft">
          CC BY 4.0
        </a>
        .{plate.note ? ` ${plate.note}` : ""}
        {offer === "button" && !wanted ? (
          <button
            type="button"
            onClick={() => setWanted(true)}
            className="t-furniture mt-3 flex items-center gap-2 border border-ink px-3 py-1.5 text-ink transition-colors duration-150 hover:bg-wash"
          >
            <Cube aria-hidden="true" />
            <span>
              Load the 3D model, <span className="tabular">{plate.size}</span>
            </span>
          </button>
        ) : null}
      </figcaption>
    </figure>
  );
}
