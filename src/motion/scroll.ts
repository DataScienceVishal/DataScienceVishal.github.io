"use client";

import type { RefObject } from "react";
import { useScroll, useTransform, type MotionValue } from "motion/react";

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
): MotionValue<number> {
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start end", "end start"],
  });
  return useTransform(scrollYProgress, [from, to], [0, 1], { clamp: true });
}
