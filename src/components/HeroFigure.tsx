"use client";

import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, m, useScroll } from "motion/react";
import { HERO_MODEL } from "../data/content";
import { hasWebGL } from "../lib/webgl";
import { useSmoothScroll } from "../motion/scroll";
import { useReduceMotion } from "../motion/reduce";

const ModelStage = lazy(() => import("./three/ModelStage"));

/**
 * The hero figure: the supplied model, retinted onto the page palette, turning
 * with scroll and leaning toward the pointer.
 *
 * It is 3D above the fold, which is the one place three.js can genuinely hurt.
 * Three things keep it honest: the frame is sized in CSS so nothing shifts, a
 * still image holds the frame from the first paint, and the canvas only mounts
 * once the main thread has gone quiet. The reader sees the thesis and the figure
 * immediately, and the live model takes over a beat later, rather than the hero
 * waiting on a 250 kB library and a 0.93 MB model.
 *
 * The click blink went with the authored bust. It drove materials by name, and a
 * supplied model has none this can address.
 */
export function HeroFigure({ className = "" }: { className?: string }) {
  const reduce = useReduceMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  /**
   * The poster stays until the live model has actually painted. It is the
   * hero's largest element, so before it existed the browser's largest
   * contentful paint was the canvas, which meant waiting on a 0.93 MB model
   * over whatever connection the reader has: 9.7 s on a throttled phone. The
   * poster is 71 kB and is the same framing, so the figure is there
   * immediately and the model takes over when it can.
   */
  const [live, setLive] = useState(false);
  const onReady = useCallback(() => setLive(true), []);

  const { scrollYProgress: rawProgress } = useScroll({
    target: hostRef,
    offset: ["start end", "end start"],
  });
  // A wheel notch is one discrete jump. Smoothed, the figure turns through it
  // instead of snapping. See useSmoothScroll.
  const scrollYProgress = useSmoothScroll(rawProgress, reduce);

  // Mount only once the page has finished loading and the main thread has gone
  // quiet. A WebGL scene above the fold competes with the hero text for the
  // main thread, and the text is what the reader came for.
  useEffect(() => {
    if (!hasWebGL()) return;
    const show = () => setReady(true);
    const ric = (
      window as Window & {
        requestIdleCallback?: (
          cb: () => void,
          o?: { timeout: number },
        ) => number;
        cancelIdleCallback?: (id: number) => void;
      }
    ).requestIdleCallback;

    if (ric) {
      const id = ric(show, { timeout: 2400 });
      return () => {
        (
          window as Window & { cancelIdleCallback?: (id: number) => void }
        ).cancelIdleCallback?.(id);
      };
    }
    const id = window.setTimeout(show, 900);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label="A wired robot head rendered in three dimensions. It turns as the page scrolls and leans toward the pointer."
      className={`relative w-full ${className}`}
      // Reserved before anything loads, so mounting the canvas shifts nothing.
      style={{ aspectRatio: "3 / 4" }}
    >
      <AnimatePresence initial={false}>
        {live ? null : (
          <m.img
            key="poster"
            src="/hero-figure.webp"
            /*
             * One file, deliberately. A srcset pair saved a phone 20 kB and
             * cost a double download at 375pt and 2x: React sets srcset before
             * sizes, and in that gap the browser resolves against 100vw and
             * picks the largest candidate, so the cheapest device fetched both.
             *
             * 491x656 is the live canvas's own ceiling: the box is 307pt wide
             * at its largest and the renderer caps its pixel ratio at 1.6.
             * Matching that exactly means the poster is precisely as sharp as
             * the thing it hands over to, and not one byte sharper.
             */
            width={491}
            height={656}
            alt=""
            aria-hidden="true"
            decoding="async"
            // Above the fold and the largest element in the hero, so it is the
            // one image on the page that should not wait its turn.
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-contain"
            exit={reduce ? {} : { opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          />
        )}
      </AnimatePresence>

      {ready ? (
        <Suspense fallback={null}>
          <ModelStage
            url={HERO_MODEL.model}
            progress={scrollYProgress}
            spin={HERO_MODEL.spin}
            reduce={reduce}
            grade={HERO_MODEL.grade}
            // Above the fold, so the pixel count stays modest.
            maxDpr={1.6}
            onReady={onReady}
          />
        </Suspense>
      ) : null}
    </div>
  );
}
