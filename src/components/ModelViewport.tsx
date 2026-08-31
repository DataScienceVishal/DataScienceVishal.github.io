"use client";

import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion, useScroll } from "motion/react";
import { hasWebGL } from "../lib/webgl";
import type { Spin } from "./three/ModelStage";

const ModelStage = lazy(() => import("./three/ModelStage"));

/** A downloaded glTF, with its own spin settings. */
type Scene = {
  kind: "gltf";
  url: string;
  spin: Spin;
  /**
   * Retint strength onto the page palette, 0 to 1. A model that arrives in its
   * author's colours needs this; one that is already neutral does not.
   */
  grade?: number;
  tone?: "metal";
};

interface ModelViewportProps {
  scene: Scene;
  /** Reserved height, so nothing shifts before or after the canvas mounts. */
  height: string;
  /** What the object is and why it is here. */
  caption: React.ReactNode;
  /** CC-BY requires naming the author. Omitted for generated geometry. */
  credit?: React.ReactNode;
  /** Described for anyone who will never see it. */
  alt: string;
  /**
   * Scroll range that drives the rotation. Defaults to the whole element
   * crossing the viewport; pass a taller ancestor to keep it turning for longer.
   */
  scrollTarget?: React.RefObject<HTMLElement | null>;
}

/**
 * Reserves the space, then decides whether to pay for the 3D layer at all.
 *
 * The models are megabytes. They are code split into their own chunk and only
 * mounted once the viewport is within a screen of the reader, so the hero and
 * first paint never wait on them, and a reader who stops before this section
 * never downloads them. On a metered or very slow connection the static frame is
 * all anyone gets, which is a deliberate choice rather than a fallback.
 */
export function ModelViewport({
  scene,
  height,
  caption,
  credit,
  alt,
  scrollTarget,
}: ModelViewportProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // A screen of margin, so the chunk and the model are in flight before the
  // reader arrives rather than popping in under them.
  const near = useInView(hostRef, { once: true, margin: "100% 0px 100% 0px" });
  const [allowed, setAllowed] = useState(false);
  /**
   * Distinct from `allowed`. A stingy connection still gets the panel and its
   * caption, because the caption says what would have been there. A browser
   * with no WebGL gets nothing at all: an empty bordered box captioned as a
   * turning model is worse than no figure.
   */
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const conn = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    const stingy =
      conn?.saveData === true ||
      (conn?.effectiveType ? /(^|-)2g$/.test(conn.effectiveType) : false);
    setAllowed(!stingy);
    setSupported(hasWebGL());
  }, []);

  const { scrollYProgress } = useScroll({
    target: scrollTarget ?? hostRef,
    offset: ["start end", "end start"],
  });

  const mounted = near && allowed && supported;

  if (!supported) return null;

  return (
    <figure className="m-0">
      <div
        ref={hostRef}
        role="img"
        aria-label={alt}
        className="relative w-full overflow-hidden border border-rule bg-slab"
        style={{
          height,
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-artifact), var(--highlight-top)",
        }}
      >
        {mounted ? (
          <Suspense fallback={null}>
            <ModelStage
              url={scene.url}
              progress={scrollYProgress}
              spin={scene.spin}
              reduce={Boolean(reduce)}
              grade={scene.grade ?? 0}
              tone={scene.tone}
              // Below the fold, so it can afford real retina pixels.
              maxDpr={2}
            />
          </Suspense>
        ) : null}
      </div>

      <figcaption className="t-mono-xs mt-4 max-w-[64ch] text-graphite">
        {caption}
        {credit ? (
          <span className="mt-2 block text-graphite">{credit}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}
