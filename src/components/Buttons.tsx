"use client";

import { ArrowUpRight } from "@phosphor-icons/react";
import { m } from "motion/react";
import type { ReactNode } from "react";
import { useMagnet, usePointerField } from "../motion/pointer";
import { HOVER_IN, HOVER_OUT } from "../motion/tokens";
import { useReduceMotion } from "../motion/reduce";

interface ActionProps {
  href: string;
  children: ReactNode;
  /** Opens in a new tab and shows the outbound arrow. */
  external?: boolean;
  className?: string;
}

const BASE =
  "t-ui inline-flex items-center justify-center gap-2 px-5 py-3 whitespace-nowrap";

/**
 * Enter and exit are deliberately different lengths: 220ms in, 140ms out. The
 * transition on the variant governs the way in, the transition on the component
 * governs the way back, which is how Motion expresses an asymmetric hover. A
 * control that leaves faster than it arrives feels answerable rather than
 * syrupy.
 */
export function PrimaryAction({
  href,
  children,
  external = false,
  className = "",
}: ActionProps) {
  const reduce = useReduceMotion();
  // The control leans toward the pointer by up to 4px. Small enough to feel
  // like weight rather than like a game.
  const field = usePointerField();
  const { mx, my } = useMagnet(field, 4);

  return (
    <m.a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onPointerMove={field.onPointerMove}
      onPointerLeave={field.onPointerLeave}
      className={`${BASE} bg-brass text-void ${className}`}
      style={{
        borderRadius: "var(--radius-md)",
        x: reduce ? 0 : mx,
        y: reduce ? 0 : my,
      }}
      initial={false}
      whileHover={
        reduce
          ? undefined
          : {
              boxShadow: "var(--shadow-raise)",
              transition: HOVER_IN,
            }
      }
      whileTap={reduce ? undefined : { scale: 0.985, transition: HOVER_OUT }}
      transition={HOVER_OUT}
    >
      {children}
      {external ? <ArrowUpRight size={15} aria-hidden="true" /> : null}
    </m.a>
  );
}

export function SecondaryAction({
  href,
  children,
  external = false,
  className = "",
}: ActionProps) {
  const reduce = useReduceMotion();
  const field = usePointerField();
  const { mx, my } = useMagnet(field, 4);

  return (
    <m.a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onPointerMove={field.onPointerMove}
      onPointerLeave={field.onPointerLeave}
      className={`${BASE} border text-bone ${className}`}
      style={{
        borderRadius: "var(--radius-md)",
        x: reduce ? 0 : mx,
        y: reduce ? 0 : my,
      }}
      initial={false}
      animate={{ borderColor: "var(--color-rule)" }}
      whileHover={
        reduce
          ? undefined
          : {
              borderColor: "var(--color-graphite)",
              boxShadow: "var(--shadow-raise)",
              transition: HOVER_IN,
            }
      }
      whileTap={reduce ? undefined : { scale: 0.985, transition: HOVER_OUT }}
      transition={HOVER_OUT}
    >
      {children}
      {external ? <ArrowUpRight size={15} aria-hidden="true" /> : null}
    </m.a>
  );
}
