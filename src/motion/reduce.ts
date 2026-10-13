"use client";

import { useEffect, useState } from "react";

/**
 * `prefers-reduced-motion`, read in a way that survives hydration.
 *
 * The page is prerendered in Node, where there is no media query to read, so
 * the markup on disk is always the full-motion markup. Reporting the real
 * preference on the very first client render would make that render differ from
 * the server's, and React would throw the prerendered page away and render it
 * again from nothing: error #418, on every load, for exactly the readers who
 * most need a page to appear at once. So the first render reports false and the
 * effect applies the real value straight after, a difference of one frame
 * nobody can see.
 *
 * Read with matchMedia directly rather than through Motion, so that a component
 * asking this question does not pull an animation library into the main bundle.
 */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduce;
}
