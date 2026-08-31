"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * `prefers-reduced-motion`, read in a way that survives hydration.
 *
 * The page is prerendered at build time in Node, where there is no media query
 * to read, so the markup on disk is always the full-motion markup. A reader who
 * has reduced motion turned on would then produce different markup on their
 * very first client render, React would find the two do not match, and it would
 * throw the entire prerendered page away and re-render from scratch. That was
 * happening: React error #418 on every load with the preference set, and no
 * error without it.
 *
 * Being the one group who most needs a page to paint immediately and least
 * wants it to move, they were getting the slowest possible start.
 *
 * So the first client render deliberately reports false, matching the server,
 * and the real preference is applied on the effect immediately after. The cost
 * is that a reduced-motion reader gets one frame of the full-motion markup
 * before it settles, which is a frame nobody can see. The alternative is
 * discarding the prerender, which they can very much see.
 */
export function useReduceMotion(): boolean {
  const preference = Boolean(useReducedMotion());
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated && preference;
}
