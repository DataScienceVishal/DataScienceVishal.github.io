"use client";

import { useEffect } from "react";
import { afterIdle } from "../../motion/idle";

/**
 * Loads the scroll effects once the page is up and the main thread is idle,
 * and never for a reader who asked for reduced motion: for them the module is
 * not even fetched. Renders nothing; everything it adds is in motion/effects.
 */
export function ScrollEffects() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let stopped = false;
    let undo: (() => void) | undefined;
    const cancel = afterIdle(() => {
      void import("../../motion/effects").then(({ startEffects }) => {
        if (!stopped) undo = startEffects();
      });
    });

    return () => {
      stopped = true;
      cancel();
      undo?.();
    };
  }, []);

  return null;
}
