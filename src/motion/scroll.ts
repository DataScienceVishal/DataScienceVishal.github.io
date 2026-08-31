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
 * Overdamped, just. The damping ratio is a shade over 1, so the value eases in
 * and stops without ever crossing its target. A spring that overshoots would
 * send a bar past its own value and back, which on a chart is not a flourish
 * but a wrong number briefly drawn.
 *
 * The settle is about 0.18s, and the number is a compromise between two inputs
 * that want opposite things. A wheel wants a long settle, because it delivers
 * one 120px jump and the spring is the only thing standing between that jump
 * and a teleport. A trackpad wants none, because it already delivers a smooth
 * stream of small deltas, and any settle on top of that is just the page
 * trailing behind the reader's fingers.
 *
 * 0.4s was tried and is too slow: it smooths a wheel beautifully and makes a
 * trackpad feel like it is dragging something heavy. 0.18s is roughly eleven
 * frames, which is enough to spread a notch across a visible arc while staying
 * under the point where a trackpad reader can feel the page lagging them.
 */
const SCROLL_SPRING = {
  stiffness: 500,
  damping: 45,
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
