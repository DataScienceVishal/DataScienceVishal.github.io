"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, Environment, Lightformer, useGLTF } from "@react-three/drei";
// From three-stdlib rather than three/examples, because that is the loader
// implementation drei's own types are written against.
import { KTX2Loader } from "three-stdlib";
import {
  Box3,
  Color,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  type Group,
} from "three";
import type { MotionValue } from "motion/react";

/**
 * The lazily imported half of the 3D layer. Nothing in here is referenced until
 * a viewport decides to mount it, so three, the loaders and the decoders all
 * land in their own chunk.
 *
 * Decoders are self hosted under /decoders, so the page depends on no third
 * party at runtime.
 *
 * Draco's path has to go in as drei's second argument rather than being set on
 * the loader here. drei runs extendLoader first and then, if useDraco is `true`,
 * builds its own DRACOLoader pointed at a Google CDN and overwrites whatever
 * extendLoader just attached. Passing `true` therefore silently undoes the self
 * hosting: it shipped that way, and every visitor fetched 750kB of decoder from
 * gstatic.com, which is both a third party watching the page load and an extra
 * origin to resolve on the critical path. Passing the path as a string is the
 * documented way to keep it local. KTX2 is unaffected, because drei does not
 * touch it, which is why it stays below.
 *
 * Lighting is procedural: an Environment built from Lightformers rather than a
 * downloaded HDR, so there is no extra network request and the key light can sit
 * on the page's own accent.
 */

/**
 * Retints a loaded model onto the page palette.
 *
 * A model bought or downloaded arrives with its author's colours. This one came
 * in lavender and skin tones, which are two hues the page does not have and
 * cannot absorb. Rather than drop it, each material's albedo is converted to its
 * luminance and then remapped along the page's own neutral-to-accent ramp, the
 * same treatment the portrait gets. Metalness, roughness and every texture map
 * survive, so the form and the shading detail are untouched; only the hue moves.
 *
 * Bright surfaces go warm toward brass and dark ones go cool toward the ground,
 * which is what a single warm key light over a cool fill actually does to metal.
 */
const DARK = new Color("#131a28");
const MID = new Color("#7c88a0");
const WARM = new Color("#d99a4e");
/** Where a mapped material lands once its colour map is dropped. */
const METAL = new Color("#8d99b0");
/** The flat tone, a stop lighter than METAL so it holds up unlit. */
const PEWTER = new Color("#aab4c6");

/**
 * Forces every material onto one metal. Use this when the luminance ramp has
 * nothing to work with: an untextured export whose albedo is a single bright
 * value has no signal to remap, and it lands wherever the ramp's top happens
 * to be, which is not a decision anyone made.
 */
function toneToMetal(root: Group) {
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const raw of mats) {
      const mat = raw as MeshStandardMaterial;
      if (!mat || !mat.color) continue;
      /*
       * Once per material, ever. useGLTF caches the scene graph globally and
       * these edits are mutations of it, so a remount, or StrictMode's double
       * render in development, would re-ramp a colour that has already been
       * ramped. The comment on the caller claimed "once per loaded scene",
       * which useMemo does not actually promise.
       */
      if (mat.userData.graded) continue;
      mat.userData.graded = true;
      if (mat.userData.graded) continue;
      mat.userData.graded = true;
      mat.map = null;
      mat.emissiveMap = null;
      mat.color.copy(PEWTER);
      // Mostly diffuse. At high metalness a dark scene gives a metal almost
      // nothing to reflect and the model reads as a grey smudge; this keeps
      // enough diffuse response for the facets to describe the form.
      mat.metalness = 0.22;
      mat.roughness = 0.42;
      if (mat.emissive) mat.emissive.setScalar(0);
      mat.needsUpdate = true;
    }
  });
}

function gradeToPalette(root: Group, strength: number) {
  const tmp = new Color();
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const raw of mats) {
      const mat = raw as MeshStandardMaterial;
      if (!mat || !mat.color) continue;
      /*
       * Once per material, ever. useGLTF caches the scene graph globally and
       * these edits are mutations of it, so a remount, or StrictMode's double
       * render in development, would re-ramp a colour that has already been
       * ramped. The comment on the caller claimed "once per loaded scene",
       * which useMemo does not actually promise.
       */
      if (mat.userData.graded) continue;
      mat.userData.graded = true;
      // A mapped material carries its colour in the texture, not in the albedo,
      // so retinting the albedo does nothing: this model's face stayed skin
      // toned while its untextured wires went amber, the worst of both. The map
      // has to go. Once it does there is no luminance signal left to ramp
      // against either, because glTF exports overwhelmingly ship a white
      // baseColorFactor with all the colour in the texture, so every material
      // would land at the top of the ramp and the whole model reads as one gold
      // statue. Mapped materials therefore get the mid-tone metal outright and
      // let the light rig supply the variation and the warm highlights. Normal,
      // roughness, metalness and AO maps carry no colour, so they stay and keep
      // the surface detail that makes it worth loading.
      if (mat.map && strength > 0.99) {
        // Only drop the map where nothing depends on its alpha. On a blended
        // material the base colour texture is also the cutout: these wire
        // strands are alpha-shaped cards, so removing the map turned each one
        // into a full opaque quad, and dozens of them blending on top of each
        // other stacked into a white haze that erased the eyes. Keeping the map
        // keeps the cutout, and the graded colour still tints it, because a
        // base colour texture multiplies the albedo rather than replacing it.
        if (!mat.transparent) {
          mat.map = null;
          mat.emissiveMap = null;
        }
        mat.color.copy(METAL);
        mat.metalness = 0.58;
        // Not a mirror, and not clamped near 0.2 as this was. Every material on
        // this model ships a metallicRoughness map, so a low factor made the
        // fine wire strands across the face catch the key light from every
        // angle at once and clip to white, which erased the eyes. Broadening
        // the highlight fixes the face and still reads as metal on the heavy
        // wires, which take their colour from the brass light rather than from
        // any albedo.
        mat.roughness = 0.52;
      } else {
        // Rec. 709 luminance, so the remap preserves how light each surface
        // reads.
        const l =
          0.2126 * mat.color.r + 0.7152 * mat.color.g + 0.0722 * mat.color.b;
        // A gamma above 1 pushes midtones down the ramp, keeping the accent for
        // the genuine highlights.
        const t = Math.pow(l, 1.9);
        if (t < 0.62) {
          tmp.copy(DARK).lerp(MID, t / 0.62);
        } else {
          // Stops short of the accent at full strength. A white albedo, which
          // is most of a glTF export, tops the ramp out, and a whole mesh at
          // the accent is a much larger field of it than the page spends
          // anywhere else. Bronze reads as the same family without shouting.
          tmp.copy(MID).lerp(WARM, ((t - 0.62) / 0.38) * 0.62);
        }
        mat.color.lerp(tmp, strength);
      }
      if (mat.emissive) {
        const el =
          0.2126 * mat.emissive.r +
          0.7152 * mat.emissive.g +
          0.0722 * mat.emissive.b;
        if (el > 0.01) mat.emissive.lerp(WARM, strength);
      }
      mat.needsUpdate = true;
    }
  });
}

export interface Spin {
  /** Full turns about Y across the scrolled range. */
  turns: number;
  /** Radians of X tilt added across the range. */
  tilt: number;
  /** Starting pose, so the object is never facing away at rest. */
  baseY: number;
  baseX: number;
  /**
   * Relative to the auto fit, so 1 fills the frame. These models arrive in
   * wildly different units, which is why the fit is measured rather than
   * guessed.
   */
  scale: number;
  lift: number;
}

/**
 * Self hosted Draco. Passed to useGLTF as a string on purpose: see the note at
 * the top of this file for what `true` does instead.
 */
const DRACO_PATH = "/decoders/draco/";

/** Largest dimension the frame can take at the camera set up below. */
const FIT = 2.05;

/**
 * Radians the pointer may add on each axis. Deliberately small: the lean is
 * there to say the object is a solid sitting in space, and anything larger
 * starts competing with the scroll rotation, which is the motion that carries
 * the meaning.
 */
const LEAN = 0.18;

/** Per frame approach to the pointer target, so the lean eases in and out. */
const LEAN_EASE = 0.06;

type ExtendLoader = NonNullable<Parameters<typeof useGLTF>[3]>;

function Model({
  url,
  progress,
  spin,
  reduce,
  grade = 0,
  tone,
  lean = LEAN,
  onReady,
}: {
  url: string;
  progress: MotionValue<number>;
  spin: Spin;
  reduce: boolean;
  /** 0 leaves the author's colours alone, 1 fully retints onto the palette. */
  grade?: number;
  tone?: "metal";
  lean?: number;
  /** Fires once the scene is loaded, graded and about to paint. */
  onReady?: () => void;
}) {
  // KTX2 has to be told which compressed texture formats this GPU supports
  // before it can transcode, and that needs the live renderer. Without the
  // detectSupport call the chess set's ETC1S textures fail to decode.
  const gl = useThree((state) => state.gl);
  const configureLoader = useCallback<ExtendLoader>(
    (loader) => {
      const ktx2 = new KTX2Loader();
      ktx2.setTranscoderPath("/decoders/basis/");
      ktx2.detectSupport(gl);
      loader.setKTX2Loader(ktx2);
    },
    [gl],
  );

  const { scene } = useGLTF(url, DRACO_PATH, true, configureLoader);
  const ref = useRef<Group>(null);

  // Measure the model and normalise it, rather than hardcoding a scale per file.
  const fit = useMemo(() => {
    const size = new Box3().setFromObject(scene).getSize(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return FIT / maxDim;
  }, [scene]);

  // Once per loaded scene. useGLTF caches the scene graph, so this mutates the
  // shared materials, which is what we want: the grade should not be reapplied
  // on every render and it should survive a remount.
  useMemo(() => {
    if (tone === "metal") toneToMetal(scene);
    else if (grade > 0) gradeToPalette(scene, Math.min(1, grade));
  }, [scene, grade, tone]);

  // useGLTF suspends until the file is parsed, so reaching this point means the
  // scene exists. One frame later it has actually painted, which is when the
  // poster underneath can safely go.
  useEffect(() => {
    if (!onReady) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(onReady));
    return () => cancelAnimationFrame(id);
  }, [onReady]);

  // The pointer lean lives in a ref, not in state. A frame loop value that
  // changes every frame must never re-render React, and the damping needs the
  // previous frame's value to ease from.
  const leanRef = useRef({ x: 0, y: 0 });

  // With the loop on demand, nothing renders unless something asks. Scroll is
  // one of the two things that can move this scene, so a change in progress
  // buys exactly one frame.
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => progress.on("change", invalidate), [progress, invalidate]);

  // The pointer is the other. R3F's own pointer state only updates while it is
  // rendering, so the listener has to sit on the canvas itself: without this
  // the lean would wait for a scroll to notice the pointer had moved.
  useEffect(() => {
    const el = gl.domElement;
    const ask = () => invalidate();
    el.addEventListener("pointermove", ask, { passive: true });
    el.addEventListener("pointerleave", ask, { passive: true });
    return () => {
      el.removeEventListener("pointermove", ask);
      el.removeEventListener("pointerleave", ask);
    };
  }, [gl, invalidate]);

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    // Rotation is a pure function of scroll position, so it tracks the reader
    // in both directions rather than playing once and stopping.
    const p = reduce ? 0.18 : progress.get();

    // state.pointer is R3F's own canvas relative pointer, normalised to -1..1.
    // Reading it here rather than from a DOM listener keeps the whole
    // interaction inside the render loop and costs no re-renders.
    const cap = Math.max(0, Math.min(lean, LEAN));
    const targetY = reduce ? 0 : state.pointer.x * cap;
    const targetX = reduce ? 0 : -state.pointer.y * cap;

    // Approach rather than assign, so crossing the canvas edge does not snap.
    const l = leanRef.current;
    l.y += (targetY - l.y) * LEAN_EASE;
    l.x += (targetX - l.x) * LEAN_EASE;

    g.rotation.y = spin.baseY + p * spin.turns * Math.PI * 2 + l.y;
    g.rotation.x = spin.baseX + p * spin.tilt + l.x;
    g.position.y = spin.lift + Math.sin(p * Math.PI) * spin.lift * 0.5;

    // The lean eases toward the pointer over several frames, so it has to
    // re-arm the loop until it arrives. The threshold is a rotation too small
    // to see, which is where stopping costs nothing.
    if (Math.abs(targetY - l.y) > 0.0002 || Math.abs(targetX - l.x) > 0.0002) {
      invalidate();
    }
  });

  return (
    <Center>
      <group ref={ref} scale={fit * spin.scale}>
        <primitive object={scene} />
      </group>
    </Center>
  );
}

export default function ModelStage({
  url,
  progress,
  spin,
  reduce,
  grade = 0,
  tone,
  maxDpr = 1.75,
  onReady,
  /**
   * Optional override for the pointer lean, in radians per axis. Clamped to
   * LEAN, so a caller can quieten the lean but cannot turn the object into a
   * toy that swings with the mouse.
   */
  lean,
}: {
  url: string;
  progress: MotionValue<number>;
  spin: Spin;
  reduce: boolean;
  /** Retint strength onto the page palette. See gradeToPalette. */
  grade?: number;
  /**
   * Skips the ramp and puts the whole model on one metal. For exports the ramp
   * cannot read: see toneToMetal.
   */
  tone?: "metal";
  /** Forwarded to Model. Fires once the scene has painted. */
  onReady?: () => void;
  /**
   * Pixel ratio ceiling. Scenes below the fold can afford 2 for a genuinely
   * sharp render on a retina display; anything above the fold should stay low,
   * because those pixels are drawn while the reader is still waiting.
   */
  maxDpr?: number;
  lean?: number;
}) {
  return (
    <Canvas
      // Capped so a 3x phone does not render nine times the pixels.
      dpr={[1, maxDpr]}
      camera={{ position: [0, 0, 4.2], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      /*
        On demand, always. This used to be "always" whenever motion was
        allowed, which meant three canvases each rendering 60 times a second
        for the whole life of the page: while the reader was reading, while the
        model was off screen, while nothing on the page was moving at all. The
        frames were indistinguishable from each other and cost a full render
        apiece, and they were competing with scroll for the main thread.

        Every source of change now asks for a frame explicitly: scroll through
        the progress subscription, the pointer through a listener on the
        canvas, and the lean easing by re-arming itself until it settles.
      */
      frameloop="demand"
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 3]} intensity={1.7} color="#fff4e2" />
      <directionalLight
        position={[-4, 1, -2]}
        intensity={0.8}
        color="#9aa6bc"
      />

      <Suspense fallback={null}>
        {/*
          frames={1} matters more than it looks. drei defaults to Infinity,
          which re-renders this cubemap and re-runs the PMREM convolution on
          every single frame. Nothing in here ever moves, so all of that is
          waste, and on a cold profile it was the bulk of a one second block on
          the main thread while the shaders compiled. Rendering it once cuts
          that to a fraction and looks identical.

          192 was also more than a frame this size can show. 96 halves the
          convolution work with no visible difference at the sizes this canvas
          is ever given.
        */}
        <Environment frames={1} resolution={96}>
          {/* A brass key light, so the metal picks up the page's accent. */}
          <Lightformer
            form="rect"
            intensity={2.6}
            color="#d99a4e"
            position={[2.5, 2.5, 2]}
            scale={[4, 4, 1]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={1.1}
            color="#9aa6bc"
            position={[-3, 0.5, -1.5]}
            scale={[4, 3, 1]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="circle"
            intensity={0.7}
            color="#e9e7e2"
            position={[0, 4, 0]}
            scale={[3, 3, 1]}
            target={[0, 0, 0]}
          />
        </Environment>
        <Model
          url={url}
          progress={progress}
          spin={spin}
          reduce={reduce}
          grade={grade}
          tone={tone}
          lean={lean}
          onReady={onReady}
        />
      </Suspense>
    </Canvas>
  );
}
