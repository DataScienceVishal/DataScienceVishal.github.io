"use client";

import type { RefObject } from "react";
import { useScroll } from "motion/react";
import ModelStage from "../three/ModelStage";
import type { Plate } from "../../data/plates";
import { useSmoothScroll } from "../../motion/scroll";

/**
 * The live half of a plate. Imported lazily with ModelStage, so three.js, the
 * loaders and the scroll machinery that turns the model all stay out of the
 * main bundle until a plate actually asks for them.
 */
export default function LiveModel({
  host,
  plate,
  maxDpr,
  reduce,
  onReady,
}: {
  host: RefObject<HTMLDivElement | null>;
  plate: Plate;
  maxDpr: number;
  reduce: boolean;
  onReady: () => void;
}) {
  const { scrollYProgress } = useScroll({
    target: host,
    offset: ["start end", "end start"],
  });
  const progress = useSmoothScroll(scrollYProgress, reduce);

  return (
    <ModelStage
      url={plate.model}
      progress={progress}
      spin={plate.spin}
      reduce={reduce}
      grade={plate.grade ?? 0}
      tone={plate.tone}
      maxDpr={maxDpr}
      drift={plate.drift}
      particles={plate.particles}
      onReady={onReady}
    />
  );
}
