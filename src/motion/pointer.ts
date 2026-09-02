"use client";

import { useCallback, useRef } from "react";
import {
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useReduceMotion } from "./reduce";

/**
 * Pointer tracking for the cursor-reactive layer.
 *
 * Everything here returns motion values. Continuous pointer input never goes
 * through useState: that would re-render the tree on every mouse move and fall
 * over on a phone. See DESIGN.md section 13.
 *
 * Every hook honours prefers-reduced-motion by pinning its output to the
 * neutral value, so the elements simply sit still.
 */

export interface PointerField {
  /** -1 to 1 across the element, 0 at the centre. Springed. */
  x: MotionValue<number>;
  y: MotionValue<number>;
  /** Raw 0 to 1 within the element, for spotlight positions. */
  px: MotionValue<number>;
  py: MotionValue<number>;
  /** 1 while the pointer is inside, 0 when it leaves. */
  active: MotionValue<number>;
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
  reduce: boolean;
}

const SPRING = { stiffness: 140, damping: 18, mass: 0.5 } as const;

/**
 * Tracks the pointer within one element. Attach the two handlers to the element
 * you want to be sensitive; read the values in style props.
 */
export function usePointerField(): PointerField {
  /*
   * The hydration-safe reading, not Motion's raw hook. Motion resolves the
   * media query during the first client render, so on a reduced-motion reader
   * this value differed between the prerender and hydration. It reaches the
   * DOM through `background: field.reduce ? "none" : spotlight` in CursorPanel
   * and Contact, which made it a mismatched style prop on four elements: React
   * keeps the server value and never patches it.
   */
  const reduce = useReduceMotion();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const active = useSpring(0, { stiffness: 180, damping: 22 });

  const x = useSpring(rawX, SPRING);
  const y = useSpring(rawY, SPRING);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      /*
       * Touch is not a pointer that hovers. Without this, a finger scrolling
       * past the retrieval-path panel tilts it in 3D mid-scroll and a tap on a
       * call to action makes it lean, because every one of these surfaces was
       * written for a cursor that can rest somewhere without pressing.
       */
      if (reduce || event.pointerType === "touch") return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = (event.clientY - rect.top) / rect.height;
      px.set(nx);
      py.set(ny);
      rawX.set(nx * 2 - 1);
      rawY.set(ny * 2 - 1);
      active.set(1);
    },
    [reduce, px, py, rawX, rawY, active],
  );

  const onPointerLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
    px.set(0.5);
    py.set(0.5);
    active.set(0);
  }, [rawX, rawY, px, py, active]);

  return { x, y, px, py, active, onPointerMove, onPointerLeave, reduce };
}

/**
 * A small perspective tilt toward the pointer. `depth` is degrees at the edge.
 * Deliberately shallow: this is a hint that the surface is a plane in space, not
 * a novelty.
 */
export function useTilt(field: PointerField, depth = 4) {
  const rotateY = useTransform(field.x, [-1, 1], [-depth, depth]);
  const rotateX = useTransform(field.y, [-1, 1], [depth, -depth]);
  return { rotateX, rotateY };
}

/**
 * Magnetic offset: the element leans toward the pointer by up to `strength`
 * pixels. Used on the two calls to action.
 */
export function useMagnet(field: PointerField, strength = 4) {
  const mx = useTransform(field.x, [-1, 1], [-strength, strength]);
  const my = useTransform(field.y, [-1, 1], [-strength, strength]);
  return { mx, my };
}

/**
 * A radial highlight that follows the pointer across a surface. Returns a
 * background string for a motion element's style.
 */
export function useSpotlight(field: PointerField, radius = 240) {
  return useTransform(
    [field.px, field.py, field.active],
    ([x, y, a]: number[]) =>
      `radial-gradient(${radius}px circle at ${x * 100}% ${y * 100}%, color-mix(in oklab, var(--color-brass) ${(
        a * 12
      ).toFixed(2)}%, transparent), transparent 70%)`,
  );
}

/**
 * Nearest-point tracking for charts and graphs: reports which index of `count`
 * the pointer is closest to along the x axis, or null when it is outside.
 * Uses a ref plus a callback rather than state, so the caller decides how often
 * to re-render.
 */
export function useNearestIndex(count: number) {
  const index = useMotionValue(-1);
  const last = useRef(-1);

  const track = useCallback(
    (event: React.PointerEvent<HTMLElement>, inset = 0) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const usable = rect.width - inset * 2;
      if (usable <= 0 || count < 2) return;
      const t = (event.clientX - rect.left - inset) / usable;
      const i = Math.round(Math.min(1, Math.max(0, t)) * (count - 1));
      if (i !== last.current) {
        last.current = i;
        index.set(i);
      }
    },
    [count, index],
  );

  const clear = useCallback(() => {
    last.current = -1;
    index.set(-1);
  }, [index]);

  return { index, track, clear };
}
