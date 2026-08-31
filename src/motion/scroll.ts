"use client";

import type { RefObject } from "react";
import {
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

/**
 * Smoothing for anything driven by scroll position. DESIGN.md section 9.
 *
 * A mouse wheel does not scroll continuously. It delivers one discrete jump per
 * notch, and the page moves the whole distance in a single frame: measured on
 * this page, 59 of 71 frames sat perfectly still and the other 12 jumped 120px
 * each. A value mapped straight onto scroll position inherits exactly that, so
 * every chart, graph and model on the page was teleporting between five held
 * frames. Nothing was dropping frames; the input itself is a staircase.
 *
 * Passing scroll through a spring turns each notch into a settle. The value
 * chases the scroll position instead of snapping to it, which is what makes the
 * motion read as continuous.
 *
 * Overdamped on purpose. The damping ratio here is about 1.26, so the value
 * eases in and stops without ever crossing its target. A spring that overshoots
 * would send a bar past its own value and back, which on a chart is not a
 * flourish but a wrong number briefly drawn.
 *
 * These settle in a bit under 0.4s. A stiffer pair was tried first and measured
 * barely better than no spring at all: one notch still moved a bar through 59
 * percent of its range in a single frame, because it reached its target inside
 * two frames. The settle has to outlast the notch to smooth anything.
 */
const SCROLL_SPRING = {
  stiffness: 70,
  damping: 21,
  mass: 1,
  // Roughly a thousandth of the 0 to 1 range. Below this the spring stops
  // rather than spending frames on motion no one can see.
  restDelta: 0.0005,
} as const;

/**
 * Smooths a scroll-linked value, unless the reader asked for reduced motion, in
 * which case the raw value is handed straight back.
 *
 * The spring is created either way, because hooks cannot be called
 * conditionally. It costs nothing when its output is not read.
 */
export function useSmoothScroll(
  raw: MotionValue<number>,
  reduce: boolean,
): MotionValue<number> {
  const smooth = useSpring(raw, SCROLL_SPRING);
  return reduce ? raw : smooth;
}

/**
 * Draw progress for a chart or diagram, tied continuously to scroll position.
 *
 * The element's own crossing of the viewport drives it, and the value is mapped
 * so the mark is fully drawn by the time the element is centred and readable,
 * then holds. Because it is a transform of scroll position rather than a
 * one-shot trigger, it plays backwards when the reader scrolls back up, which is
 * the difference between responding to scroll and merely being started by it.
 *
 * `useInView` with `once: true` was used here before. It fired a single
 * animation and then ignored the reader for the rest of the session.
 */
export function useDrawProgress(
  target: RefObject<HTMLElement | null>,
  from = 0.06,
  to = 0.46,
  reduce = false,
): MotionValue<number> {
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start end", "end start"],
  });
  const smooth = useSmoothScroll(scrollYProgress, reduce);
  return useTransform(smooth, [from, to], [0, 1], { clamp: true });
}
