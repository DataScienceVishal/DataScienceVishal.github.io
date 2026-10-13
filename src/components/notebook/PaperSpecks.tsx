"use client";

import { useEffect } from "react";
import { afterIdle } from "../../motion/idle";

/**
 * Starts page one's specks once the page is idle. Like the scroll effects, the
 * module is never fetched for a reader who asked for reduced motion. Renders
 * nothing; the canvas is made by motion/specks.
 */
export function PaperSpecks() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let stopped = false;
    let end: (() => void) | undefined;
    const cancel = afterIdle(() => {
      void import("../../motion/specks").then(({ startSpecks }) => {
        const page = document.getElementById("top");
        if (!stopped && page) end = startSpecks(page);
      });
    });

    return () => {
      stopped = true;
      cancel();
      end?.();
    };
  }, []);

  return null;
}
