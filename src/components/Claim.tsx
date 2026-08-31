import type { ReactNode } from "react";
import { SOURCES, type SourceId } from "../data/sources";

interface ClaimProps {
  source: SourceId;
  children: ReactNode;
  /**
   * Flip the source label to the right edge. Used for claims that sit in a
   * narrow right hand column, where a left aligned label would run off screen.
   */
  flip?: boolean;
}

/**
 * A claim is set text with a dotted rule under it and a marker after it. The
 * marker links to the source: straight to the repository, the deployment or the
 * PDF when one exists, and to the reference list when nothing is public, so a
 * marker never resolves to a dead page.
 */
export function Claim({ source, children, flip = false }: ClaimProps) {
  const src = SOURCES[source];
  const href = src.href ?? `#ref-${src.n}`;
  const external = src.href !== null && src.href.startsWith("http");

  return (
    <a
      className={flip ? "claim claim--flip" : "claim"}
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      <span className="claim__marker" aria-hidden="true">
        {src.n}
      </span>
      <span className="sr-only">{` (source ${src.n}: ${src.full})`}</span>
      <span className="claim__source" aria-hidden="true">
        {src.label}
      </span>
    </a>
  );
}
