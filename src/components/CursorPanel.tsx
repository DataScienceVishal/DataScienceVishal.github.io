"use client";

import type { ReactNode } from "react";
import { m } from "motion/react";
import { usePointerField, useSpotlight, useTilt } from "../motion/pointer";

interface CursorPanelProps {
  children: ReactNode;
  /** Degrees of tilt at the panel edge. Kept shallow on purpose. */
  depth?: number;
  /** Radius of the pointer highlight, in pixels. */
  radius?: number;
  className?: string;
}

/**
 * A bordered panel that responds to the pointer: a shallow perspective tilt
 * toward the cursor and a brass highlight that follows it across the surface.
 *
 * The tilt is 4 degrees at the edge, which is enough to say "this is a plane in
 * space" and not enough to become a novelty. Both effects read from motion
 * values, so moving the pointer never re-renders the React tree, and both pin
 * to neutral under prefers-reduced-motion.
 */
export function CursorPanel({
  children,
  depth = 4,
  radius = 260,
  className = "",
}: CursorPanelProps) {
  const field = usePointerField();
  const { rotateX, rotateY } = useTilt(field, depth);
  const spotlight = useSpotlight(field, radius);

  return (
    <m.div
      onPointerMove={field.onPointerMove}
      onPointerLeave={field.onPointerLeave}
      className={`relative border border-rule bg-slab ${className}`}
      style={{
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-artifact), var(--highlight-top)",
        transformPerspective: 900,
        rotateX: field.reduce ? 0 : rotateX,
        rotateY: field.reduce ? 0 : rotateY,
        transformStyle: "preserve-3d",
      }}
    >
      {/* The highlight sits above the fill and below the content. */}
      <m.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: "var(--radius-lg)",
          background: field.reduce ? "none" : spotlight,
        }}
      />
      <div className="relative">{children}</div>
    </m.div>
  );
}
