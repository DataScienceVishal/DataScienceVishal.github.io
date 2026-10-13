/**
 * The three taped-in plates. None of the models is mine; all three are CC BY
 * 4.0, which asks for the creator, the title, a link to the material and a link
 * to the licence. Each caption carries all four.
 *
 * `still` is a render of the live model at the same framing and grade, on the
 * print's own ground, so the hand-off from still to canvas does not jump.
 * Rendered from the dev server with Playwright: transparent capture, then
 * flattened onto #151c27, because an alpha channel around hundreds of thin
 * wires cost 118 kB where the flat print costs 34. Regenerate the stills
 * whenever the model, the grade, the lights or the spin base pose change.
 */

import type { Drift, Spin } from "../components/three/ModelStage";
import type { Particles } from "../components/three/particles";
import { TWIN } from "./figures";

export type PlateId = "head" | "brain" | "chess";

export interface Plate {
  n: number;
  model: string;
  /** Size of the model file, in decimal units, said on the button before anyone pays it. */
  size: string;
  still: { src: string; width: number; height: number };
  title: string;
  titleHref: string;
  by: string;
  byHref?: string;
  alt: string;
  note?: string;
  grade?: number;
  tone?: "metal";
  spin: Spin;
  /** How it moves on its own once live, so a reader who stops scrolling still sees an object. */
  drift: Drift;
  /** What it gives off once live. Most of the head's surface is hair wire outside the frame, so it needs the most. */
  particles: Particles;
}

export const PLATES: Record<PlateId, Plate> = {
  head: {
    n: 1,
    model: "/models/robot.glb",
    size: "0.98 MB",
    still: { src: "/plates/head.webp", width: 512, height: 640 },
    title: "Robot girl with hair wires",
    titleHref:
      "https://sketchfab.com/3d-models/robot-girl-with-hair-wires-ccaa2e655374415c84bc1bb1b177681a",
    by: "GR-video",
    byHref: "https://sketchfab.com/grvideotv",
    alt: "A robot head with wires for hair, rendered in grey metal.",
    note: "Retinted for this page, and here because I like it.",
    grade: 1,
    spin: { turns: 0.32, tilt: 0.12, baseY: -0.4, baseX: 0.04, scale: 1.62, lift: 0.14 },
    drift: { look: 0.24 },
    particles: { count: 3200, reach: 0.1, glow: 1 },
  },
  brain: {
    n: 2,
    model: "/models/brain.glb",
    size: "78 kB",
    still: { src: "/plates/brain.webp", width: 640, height: 480 },
    title: "Neural Networks of the Brain",
    titleHref:
      "https://sketchfab.com/3d-models/neural-networks-of-the-brain-fa48173d4532407c9c2a4ba06a9bcd2d",
    by: "Universal Design for Learning",
    byHref: "https://sketchfab.com/UDL",
    alt: "White matter tracts of a human brain, rendered in pale grey.",
    note: `Tractography, not a metaphor. The twin is a retriever over ${TWIN.documents} documents and looks nothing like this.`,
    tone: "metal",
    spin: { turns: 0.5, tilt: 0.16, baseY: -0.35, baseX: 0.08, scale: 1.1, lift: 0 },
    drift: { turnSeconds: 60 },
    particles: { count: 1000, reach: 0.1, glow: 0.85 },
  },
  chess: {
    n: 3,
    model: "/models/chess.glb",
    size: "12.1 MB",
    still: { src: "/plates/chess.webp", width: 640, height: 480 },
    title: "A Beautiful Game",
    titleHref:
      "https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/ABeautifulGame",
    by: "Moeen Sayed and Mujtaba Sayed, glTF conversion by Ed Mackey",
    alt: "A chess set mid-game, rendered in three dimensions.",
    spin: { turns: 0.85, tilt: 0.22, baseY: -0.5, baseX: 0.16, scale: 1.32, lift: 0 },
    drift: { turnSeconds: 90 },
    particles: { count: 900, reach: 0.18, glow: 1 },
  },
};
