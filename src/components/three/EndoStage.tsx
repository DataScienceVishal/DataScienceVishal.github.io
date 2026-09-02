"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  MeshStandardMaterial,
  type Group,
  type Mesh,
} from "three";
import type { MotionValue } from "motion/react";

/**
 * A chrome endoskeleton bust, generated rather than downloaded.
 *
 * Every surface here is a three primitive. That is a licence decision before it
 * is an aesthetic one: a machined skull is exactly the kind of asset that does
 * not exist licence-clear in any public glTF collection, and a recognisable film
 * prop would be someone else's design. Boxes, spheres and tori owe nobody
 * anything, and the whole object costs no network request at all, which is the
 * opposite trade to the 11.5 MB chess set in ModelStage.
 *
 * The build is a two layer skull, which is the single decision that stops it
 * reading as a moulded toy. The braincase is a near black anodised ellipsoid,
 * and the bright work is a set of curved armour plates bolted over it, each one
 * a patch of a slightly larger sphere so it hugs the core exactly. Everywhere
 * the plates stop, the dark core shows through: that is what the panel gaps,
 * the temporal hollows and the cranial base are made of. Depth is subtraction
 * here rather than addition, which is how the real thing reads.
 *
 * Proportions are measured off a human skull rather than eyeballed, because
 * every toy-like read comes from the same three errors: a cranium too round and
 * too wide, a jaw too broad and too short, and teeth too big. See the landmark
 * table below for what was actually used.
 *
 * Lighting follows ModelStage: an Environment built from Lightformers rather
 * than a downloaded HDR, so the metal has something real to reflect without the
 * page depending on a third party at runtime. Chrome with nothing to reflect
 * renders as flat grey, so on this object the environment is the material.
 *
 * Nothing here loops. The bust turns because the reader scrolled, the head turns
 * because the pointer moved, and the optics dim because the caller said to.
 */

/* -------------------------------------------------------------------------- */
/* Motion constants                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Radians of yaw swept across the scrolled range, about 60 degrees, starting
 * turned away to the reader's left. Wide enough to read as a solid, never far
 * enough to lose both optics behind the cheek.
 */
const YAW_START = -0.52;
const YAW_SWEEP = 1.05;

/**
 * Pitch stays level to very slightly nose up across the whole range. A positive
 * pitch tips the face down and shows the reader the crown, which is the least
 * interesting surface on the object, and it also puts the brow ridge straight
 * over the optics. The arc is negative so the most upward point lands mid
 * crossing, which is where the reader spends the most time looking at it.
 */
const PITCH_BASE = -0.04;
const PITCH_ARC = -0.035;

/**
 * The pose held under reduced motion. Not 0, because at 0 the bust is turned
 * away, and a still frame has to be the frame worth holding.
 */
const STILL_P = 0.4;

/**
 * The head turns independently of the body, and further than the chess set's
 * lean does, because a head tracking you is the whole point of the object. Capped
 * so it stays inside the range a neck could plausibly reach.
 */
const HEAD_CAP = 0.3;

/** Per frame approach to the pointer target, so the turn eases in and out. */
const HEAD_EASE = 0.07;

/* -------------------------------------------------------------------------- */
/* Proportions                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Head landmarks, in head local space, with the pivot at the top of the neck.
 * Taken off human skull ratios and then held to, because the previous pass was
 * 0.81 wide against 0.92 tall, which is 1.14, and a head that close to round is
 * a toy however much hardware you bolt to it.
 *
 *   vertex (crest top)          y  0.855
 *   crown plate top             y  0.820
 *   brow ridge, top             y  0.522
 *   brow ridge, lower edge      y  0.440   also the top of each orbit
 *   optic centre                y  0.355   44 percent of head height, up from chin
 *   nasion, between the orbits  y  0.420   52 percent
 *   zygomatic arch              y  0.295
 *   jaw hinge                   y  0.285
 *   upper occlusal plane        y  0.075
 *   chin, lowest point          y -0.055
 *
 * Which gives: height 0.91 vertex to chin, width 0.684 across the parietal
 * plates, so 1.33 tall for its width. Depth is 0.84 front of optic to back of
 * the occipital plate, so 1.23 deep for its width: long, narrow and tall, which
 * is the shape a sphere with plates on it never gets to.
 *
 * The mandible is deliberately narrower than the cheeks. Gonion sits at 0.215
 * against a bizygomatic half width of 0.30, so the jaw tapers inside the face
 * rather than hanging outside it, and the arches have air behind them.
 */
const CORE_R = 0.3;
const CORE_Y = 0.5;
const CORE_Z = -0.05;
/** The braincase is scaled off round: wider than tall, and longer than wide. */
const CORE_SX = 1.04;
const CORE_SZ = 1.25;

/** Optic centre, in head local space. Mirrored on X. */
const EYE_X = 0.145;
const EYE_Y = 0.355;

/**
 * The lens sits proud of its own bezel rather than down inside the recess. Deep
 * set was the honest reading of the anatomy and it made the one thing the object
 * exists for invisible: the socket walls and the brow occluded it from every
 * angle a reader actually sees. The recess is still behind the lens doing the
 * work of framing it, but the emitter itself is out in the open, and every part
 * near it is checked against the sight line from the camera, which sits below
 * the optics and looks up at them.
 */
const LENS_Z = 0.3;
const LENS_R = 0.07;

/**
 * The lid is a shutter that grows downward from under the brow hood. At rest it
 * is a hairline parked inside the hood block, so there is nothing to see.
 */
const LID_H = 0.18;
const LID_TOP = 0.445;
const LID_Z = 0.385;

/**
 * Emissive intensity at full open, and at full shut. Well past 1, because
 * toneMapped is off and the point is a lamp rather than a red surface. Not
 * higher than this: the red channel is already clipped at 4.2, so more intensity
 * only bleeds the other two channels up and turns the optics pink.
 */
const OPTIC_HOT = 4.2;
/**
 * Not zero. A dead optic is still a lens catching the key light, and a true zero
 * reads as a hole punched in the skull.
 */
const OPTIC_COLD = 0.06;

/** The optic's own colour is lerped as well, so shut reads as cold metal. */
const OPTIC_LIT = new Color("#e0453c");
const OPTIC_DEAD = new Color("#212a3d");

/** Mirrored parts are built once and mapped over both sides. */
const SIDES = [-1, 1] as const;

/**
 * Teeth per row. Odd, so one tooth sits on the centre line, and nine rather
 * than seven because the previous row read as dentures: small repeated hardware
 * gives scale, large repeated hardware takes it away.
 */
const TEETH = 9;

/** Head pivot height, which is also the top of the neck column. */
const NECK_TOP = 0.62;

/** Jaw hinge, which the mandible group rotates about. */
const HINGE_Y = 0.285;
const HINGE_Z = -0.05;

/**
 * Hex head positions, in head local space, grouped by which way the fastener
 * points. All four sets share one geometry. These are the cheapest detail on
 * the object and the most valuable: a bolt is a known size, so a surface with
 * bolts on it has a scale, and a surface without one is just a shape.
 */
const HEX_UP: [number, number, number][] = [
  [0.1, 0.783, -0.2],
  [0.1, 0.783, 0.08],
];
const HEX_OUT: [number, number, number][] = [
  [0.328, 0.6, -0.05],
  [0.302, 0.46, -0.24],
  [0.3, 0.29, 0.19],
  [0.3, 0.285, -0.05],
  [0.255, 0.18, 0.01],
];
const HEX_FWD: [number, number, number][] = [[0.185, 0.5, 0.32]];
const HEX_AFT: [number, number, number][] = [[0.08, 0.44, -0.452]];

/** Neck vertebrae, top down, with a taper so the column is not a dowel. */
const VERTEBRAE = [
  { y: 0.575, s: 0.86 },
  { y: 0.505, s: 0.9 },
  { y: 0.435, s: 0.94 },
  { y: 0.365, s: 0.98 },
  { y: 0.295, s: 1.02 },
];

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/* -------------------------------------------------------------------------- */
/* Armour plates                                                              */
/* -------------------------------------------------------------------------- */

/**
 * One curved plate over the braincase: a patch of a sphere, offset outward from
 * the core radius and carrying the core's own scaling, so it lies on the core
 * exactly however far off round the core is. Phi is measured round the Y axis
 * with PI/2 pointing at the reader; theta is measured down from the crown.
 *
 * Plates are single sided, which is correct rather than a compromise. Endo
 * armour is thin plate over structure, and where a grazing angle looks past the
 * edge of one, what it finds is the dark core two centimetres beneath, which is
 * the reading we want anyway.
 */
function Plate({
  off,
  phi,
  span,
  t0,
  t1,
  material,
  seg = 22,
}: {
  off: number;
  phi: number;
  span: number;
  t0: number;
  t1: number;
  material: MeshStandardMaterial;
  seg?: number;
}) {
  return (
    <mesh
      position={[0, CORE_Y, CORE_Z]}
      scale={[CORE_SX, 1, CORE_SZ]}
      material={material}
    >
      <sphereGeometry
        args={[CORE_R + off, seg, 12, phi - span, span * 2, t0, t1 - t0]}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/* The bust                                                                   */
/* -------------------------------------------------------------------------- */

function Bust({
  progress,
  reduce,
  blink,
}: {
  progress: MotionValue<number>;
  reduce: boolean;
  blink: MotionValue<number>;
}) {
  const root = useRef<Group>(null);
  const head = useRef<Group>(null);
  const lids = useRef<(Mesh | null)[]>([]);

  /**
   * Materials are shared across every mesh rather than declared per mesh. There
   * are a hundred and eighty odd meshes in here and seven surfaces, so this is
   * seven compiled programs instead of a hundred and eighty, and the optic
   * material is a single object both eyes read from, which is why one write per
   * frame dims both.
   *
   * Four metal grades, not one. Film chrome is polished where it is exposed and
   * filthy where it is not, and a single mirror finish over everything is most
   * of why generated metal looks moulded: with no value separation between plate
   * and structure the eye cannot tell which surface is on top.
   */
  const mats = useMemo(
    () => ({
      // Grade one. Polished, for exposed plate and anything meant to catch the
      // key light. Sits high on the read to bone ramp, not in the middle of it:
      // a metal at 0.97 metalness has almost no diffuse term, so its albedo is
      // barely a colour and its apparent brightness is whatever the environment
      // hands it. Started nearer read and rendered as near black.
      polish: new MeshStandardMaterial({
        color: "#9aa6bc",
        metalness: 0.99,
        roughness: 0.08,
      }),
      // Grade two. Brushed, for structure and for the second layer of plate, so
      // the skull is not one uniform mirror. Rougher spreads the highlight into
      // a sheen across the facet rather than a point.
      brushed: new MeshStandardMaterial({
        color: "#7c88a0",
        metalness: 0.96,
        roughness: 0.26,
      }),
      // Grade three. Near black anodised, for the braincase core, the facial
      // mass and the interiors. This is the material that does the work: it is
      // what every panel gap, every temporal hollow and every socket is made
      // of, and without it the plates have nothing to be plates over.
      anod: new MeshStandardMaterial({
        color: "#131a28",
        metalness: 0.9,
        roughness: 0.42,
      }),
      // Voids proper. rule is the page's non-text hairline, and it is the right
      // value for anything that should read as a slot cut into metal.
      recess: new MeshStandardMaterial({
        color: "#212a3d",
        metalness: 0.7,
        roughness: 0.58,
      }),
      // Cable looms and conduit. The only near dielectric on the object, which
      // is the point: it stops reflecting and so reads as rubber rather than as
      // another chrome rod.
      cable: new MeshStandardMaterial({
        color: "#0b0f19",
        metalness: 0.18,
        roughness: 0.86,
      }),
      // Bone, for the teeth. Slightly rougher, so they read as a set rather
      // than as a chrome smear.
      tooth: new MeshStandardMaterial({
        color: "#c8ced9",
        metalness: 0.6,
        roughness: 0.3,
      }),
      // The optics. toneMapped false so the emissive survives the renderer's
      // tone curve and reads as lit rather than as painted red.
      optic: new MeshStandardMaterial({
        color: OPTIC_LIT,
        emissive: OPTIC_LIT,
        emissiveIntensity: OPTIC_HOT,
        toneMapped: false,
        // A lens, not a mirror. Metalness here would let the dark environment
        // eat the base colour on the parts of the sphere facing away from the
        // key, and the lens has to be uniformly hot to read at 256px.
        metalness: 0,
        roughness: 0.35,
      }),
    }),
    [],
  );

  /**
   * Anything repeated gets one geometry. Eighteen teeth, twenty four fasteners,
   * five vertebrae and four spacers between them, four spine discs: that is
   * fifty five meshes off five buffers.
   */
  const geos = useMemo(
    () => ({
      tooth: new BoxGeometry(0.024, 0.038, 0.026),
      // Six sided, so it reads as a hex head at a glance and as a cylinder
      // never. Slightly tapered, which is the chamfer under a real bolt head.
      hex: new CylinderGeometry(0.013, 0.016, 0.013, 6),
      disc: new CylinderGeometry(0.1, 0.1, 0.032, 20),
      spacer: new CylinderGeometry(0.072, 0.072, 0.026, 12),
      spine: new BoxGeometry(0.16, 0.042, 0.11),
    }),
    [],
  );

  useEffect(() => {
    return () => {
      for (const m of Object.values(mats)) m.dispose();
      for (const g of Object.values(geos)) g.dispose();
    };
  }, [mats, geos]);

  /**
   * Tooth positions, on a shallow parabola, so the row follows a dental arch
   * instead of sitting on a ruler. Computed once because it never changes.
   */
  const toothRow = useMemo(() => {
    const half = (TEETH - 1) / 2;
    return Array.from({ length: TEETH }, (_, i) => {
      const x = (i - half) * 0.03;
      return { x, dz: -x * x * 2 };
    });
  }, []);

  // The head's turn lives in a ref, not in state. It changes every frame and the
  // damping needs the previous frame's value to ease from.
  const turn = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    const g = root.current;
    const h = head.current;
    if (!g || !h) return;

    // Body rotation is a pure function of scroll position, so it tracks the
    // reader in both directions rather than playing once and stopping.
    const p = reduce ? STILL_P : progress.get();
    g.rotation.y = YAW_START + p * YAW_SWEEP;
    g.rotation.x = PITCH_BASE + Math.sin(p * Math.PI) * PITCH_ARC;

    // state.pointer is R3F's own canvas relative pointer, normalised to -1..1.
    // Reading it here rather than from a DOM listener keeps the interaction
    // inside the render loop and costs no re-renders.
    const targetY = reduce ? 0 : state.pointer.x * HEAD_CAP;
    const targetX = reduce ? 0 : -state.pointer.y * HEAD_CAP;

    // Approach rather than assign, so crossing the canvas edge does not snap.
    const t = turn.current;
    t.y += (targetY - t.y) * HEAD_EASE;
    t.x += (targetX - t.x) * HEAD_EASE;
    h.rotation.y = t.y;
    h.rotation.x = t.x;

    // The blink is read, never generated. The caller animates this value on
    // click, so there is no timer in here and nothing to loop.
    const open = reduce ? 1 : clamp01(blink.get());
    // Squared, so the optics hold near full brightness through most of the
    // travel and then drop away fast, which is how a lamp behind a shutter
    // behaves rather than how a dimmer does.
    const lit = open * open;
    mats.optic.emissiveIntensity = OPTIC_COLD + lit * (OPTIC_HOT - OPTIC_COLD);
    mats.optic.color.copy(OPTIC_DEAD).lerp(OPTIC_LIT, lit);

    const shut = 1 - open;
    for (const lid of lids.current) {
      if (!lid) continue;
      // Scaled from a hairline rather than moved, so at full open the shutter
      // has no height to show and cannot peek out from under the brow.
      lid.scale.y = Math.max(0.02, shut);
      lid.position.y = LID_TOP - (LID_H * shut) / 2;
    }
  });

  return (
    // Dropped so the bust straddles the camera axis. The object is built from
    // the neck up, so its own origin is down in the chest.
    <group ref={root} position={[0, -0.52, 0]}>
      {/* ---------------------------------------------------------------- */}
      {/* Head. Its own pivot at the top of the neck, so it turns alone.   */}
      {/* ---------------------------------------------------------------- */}
      <group ref={head} position={[0, NECK_TOP, 0]}>
        {/* Braincase core. Near black, and everything bright is a plate over
            it. Off round in all three axes: 0.62 wide, 0.60 tall, 0.75 long. */}
        <mesh
          position={[0, CORE_Y, CORE_Z]}
          scale={[CORE_SX, 1, CORE_SZ]}
          material={mats.anod}
        >
          <sphereGeometry args={[CORE_R, 30, 22]} />
        </mesh>

        {/* Cranial plates. Four round the vault plus a crown cap, and their phi
            ranges deliberately stop a few hundredths short of each other, so
            there is a dark seam running down each diagonal of the skull rather
            than a continuous shell. Each sits at a different offset, so where
            they do meet one is visibly on top of the other. */}
        <Plate
          off={0.02}
          phi={Math.PI}
          span={Math.PI}
          t0={0}
          t1={0.72}
          material={mats.brushed}
          seg={28}
        />
        <Plate
          off={0.024}
          phi={Math.PI / 2}
          span={0.82}
          t0={0.68}
          t1={1.72}
          material={mats.polish}
        />
        <Plate
          off={0.028}
          phi={Math.PI}
          span={0.72}
          t0={0.66}
          t1={1.95}
          material={mats.polish}
        />
        <Plate
          off={0.028}
          phi={0}
          span={0.72}
          t0={0.66}
          t1={1.95}
          material={mats.polish}
        />
        <Plate
          off={0.024}
          phi={(3 * Math.PI) / 2}
          span={0.78}
          t0={0.64}
          t1={2.05}
          material={mats.brushed}
        />

        {/* Panel lines, laid over the plates rather than cut into them. A dark
            hairline at a plate edge reads as a gap, which is the cheapest depth
            cue on the object: one round the crown cap, one across the middle of
            the vault, and one straight down the centre of the forehead. */}
        <Plate
          off={0.033}
          phi={Math.PI}
          span={Math.PI}
          t0={0.715}
          t1={0.742}
          material={mats.recess}
          seg={26}
        />
        <Plate
          off={0.033}
          phi={Math.PI}
          span={Math.PI}
          t0={1.3}
          t1={1.324}
          material={mats.recess}
          seg={26}
        />
        <Plate
          off={0.033}
          phi={Math.PI / 2}
          span={0.014}
          t0={0.7}
          t1={1.72}
          material={mats.recess}
          seg={4}
        />

        {/* Sagittal crest, in three segments that follow the dome down front and
            back. One straight bar across a curved skull floats at both ends,
            and a floating crest is the single most toy-like thing a generated
            skull can do. */}
        <mesh position={[0, 0.835, -0.05]} material={mats.polish}>
          <boxGeometry args={[0.055, 0.05, 0.26]} />
        </mesh>
        <mesh
          position={[0, 0.795, 0.12]}
          rotation={[0.4, 0, 0]}
          material={mats.polish}
        >
          <boxGeometry args={[0.05, 0.045, 0.2]} />
        </mesh>
        <mesh
          position={[0, 0.785, -0.24]}
          rotation={[-0.42, 0, 0]}
          material={mats.polish}
        >
          <boxGeometry args={[0.05, 0.045, 0.22]} />
        </mesh>

        {/* Occipital mass. A skull seen from anywhere but dead on is read off
            the back of the head as much as the front, and a sphere has no back
            of the head. This plate stands 0.03 clear of the core and the nuchal
            ridge under it gives the base of the skull an edge. */}
        <mesh
          position={[0, 0.44, -0.38]}
          rotation={[0.12, 0, 0]}
          material={mats.brushed}
        >
          <boxGeometry args={[0.28, 0.26, 0.14]} />
        </mesh>
        <mesh position={[0, 0.33, -0.315]} material={mats.polish}>
          <boxGeometry args={[0.22, 0.05, 0.08]} />
        </mesh>

        {/* Temporal region. The plates stop at theta 1.95, which is y 0.39, so
            everything below that on the sides is bare dark core: the deep
            hollow the brief asked for, made by leaving metal off rather than by
            adding a dark box. The strut is the one bright thing crossing it and
            it stands proud on purpose, so the hollow has something to be behind. */}
        {SIDES.map((s) => (
          <mesh
            key={`temporal-strut-${s}`}
            position={[s * 0.256, 0.32, -0.02]}
            rotation={[0, 0, s * 0.06]}
            material={mats.polish}
          >
            <boxGeometry args={[0.045, 0.032, 0.2]} />
          </mesh>
        ))}
        {/* Audio port, roughly where an ear canal is, sunk flush into the core. */}
        {SIDES.map((s) => (
          <mesh
            key={`port-${s}`}
            position={[s * 0.238, 0.325, -0.06]}
            rotation={[0, 0, (s * -Math.PI) / 2]}
            material={mats.recess}
          >
            <cylinderGeometry args={[0.042, 0.03, 0.05, 12]} />
          </mesh>
        ))}
        {SIDES.map((s) => (
          <mesh
            key={`port-ring-${s}`}
            position={[s * 0.252, 0.325, -0.06]}
            rotation={[0, Math.PI / 2, 0]}
            material={mats.polish}
          >
            <torusGeometry args={[0.048, 0.011, 6, 16]} />
          </mesh>
        ))}
        {/* Mastoid processes, hanging below and behind the port. */}
        {SIDES.map((s) => (
          <mesh
            key={`mastoid-${s}`}
            position={[s * 0.175, 0.155, -0.1]}
            rotation={[0, 0, s * -0.12]}
            material={mats.brushed}
          >
            <cylinderGeometry args={[0.032, 0.016, 0.09, 10]} />
          </mesh>
        ))}
        {/* Cranial base, which closes the underside of the vault. */}
        <mesh position={[0, 0.175, -0.09]} material={mats.anod}>
          <boxGeometry args={[0.32, 0.13, 0.34]} />
        </mesh>

        {/* Brow. The single feature that makes the difference between a mask and
            a threat, so it gets four parts rather than one: a bar across the
            whole width, a chamfer along its lower front edge, a hood over each
            orbit, and a wing running back to the temple. The hood clears the top
            of the lens by 0.015 and only overhangs it by 0.005, which is the
            constraint the whole brow is shaped around. */}
        <mesh
          position={[0, 0.495, 0.26]}
          rotation={[-0.09, 0, 0]}
          material={mats.polish}
        >
          <boxGeometry args={[0.52, 0.055, 0.14]} />
        </mesh>
        <mesh
          position={[0, 0.466, 0.322]}
          rotation={[0.3, 0, 0]}
          material={mats.brushed}
        >
          <boxGeometry args={[0.5, 0.022, 0.05]} />
        </mesh>
        {SIDES.map((s) => (
          <mesh
            key={`hood-${s}`}
            position={[s * EYE_X, 0.465, 0.3]}
            material={mats.polish}
          >
            <boxGeometry args={[0.21, 0.05, 0.15]} />
          </mesh>
        ))}
        {SIDES.map((s) => (
          <mesh
            key={`brow-wing-${s}`}
            position={[s * 0.245, 0.455, 0.2]}
            rotation={[0, s * 0.35, s * -0.2]}
            material={mats.polish}
          >
            <boxGeometry args={[0.1, 0.06, 0.13]} />
          </mesh>
        ))}

        {/* Optics. Five parts each: a dark cup, a wide chrome rim on its mouth,
            a machined bezel inside that, the lens standing 0.058 proud of both,
            and a hot ring hugging the lens equator so the emitter reads as more
            than one small sphere at a 256px render. Every radius here was
            checked against the sight line from the camera, which is below the
            optics: nothing lands in front of the lens and above its lower edge. */}
        {SIDES.map((s) => (
          <group key={`optic-${s}`} position={[s * EYE_X, EYE_Y, 0]}>
            <mesh
              position={[0, 0, 0.215]}
              rotation={[Math.PI / 2, 0, 0]}
              material={mats.anod}
            >
              <cylinderGeometry args={[0.105, 0.075, 0.17, 16]} />
            </mesh>
            <mesh position={[0, 0, 0.29]} material={mats.polish}>
              <torusGeometry args={[0.098, 0.022, 8, 24]} />
            </mesh>
            <mesh position={[0, 0, 0.3]} material={mats.brushed}>
              <torusGeometry args={[0.084, 0.011, 6, 20]} />
            </mesh>
            <mesh position={[0, 0, LENS_Z]} material={mats.optic}>
              <sphereGeometry args={[LENS_R, 20, 16]} />
            </mesh>
            <mesh position={[0, 0, 0.315]} material={mats.optic}>
              <torusGeometry args={[0.073, 0.01, 6, 20]} />
            </mesh>
          </group>
        ))}

        {/* Lids. Positioned and scaled per frame by the blink, and parked as a
            hairline inside the hood above at rest. */}
        {SIDES.map((s, i) => (
          <mesh
            key={`lid-${s}`}
            ref={(m) => {
              lids.current[i] = m;
            }}
            position={[s * EYE_X, LID_TOP, LID_Z]}
            scale={[1, 0.02, 1]}
            material={mats.brushed}
          >
            <boxGeometry args={[0.2, LID_H, 0.026]} />
          </mesh>
        ))}

        {/* Lateral orbital wall, joining the brow wing down to the cheekbone.
            It sits outboard of the lens, never in front of it. */}
        {SIDES.map((s) => (
          <mesh
            key={`orbit-post-${s}`}
            position={[s * 0.235, 0.37, 0.15]}
            rotation={[0, 0, s * 0.08]}
            material={mats.brushed}
          >
            <boxGeometry args={[0.05, 0.16, 0.09]} />
          </mesh>
        ))}

        {/* Facial mass. Dark, like the braincase, and for the same reason: the
            bright work on the face is a set of plates over it, and the gaps
            between those plates need something to be gaps into. */}
        <mesh position={[0, 0.19, 0.16]} material={mats.anod}>
          <boxGeometry args={[0.36, 0.26, 0.28]} />
        </mesh>

        {/* Nasal bridge, between the orbits, and the aperture as a recess rather
            than a modelled nose. The flanking plates stand 0.01 in front of the
            recess, which is what makes it read as cut in. */}
        <mesh position={[0, 0.39, 0.26]} material={mats.polish}>
          <boxGeometry args={[0.1, 0.14, 0.12]} />
        </mesh>
        <mesh position={[0, 0.27, 0.275]} material={mats.recess}>
          <boxGeometry args={[0.075, 0.13, 0.06]} />
        </mesh>
        {SIDES.map((s) => (
          <mesh
            key={`nasal-flange-${s}`}
            position={[s * 0.065, 0.275, 0.27]}
            rotation={[0, s * 0.1, 0]}
            material={mats.polish}
          >
            <boxGeometry args={[0.055, 0.15, 0.09]} />
          </mesh>
        ))}
        {/* Infraorbital plate, under each socket. */}
        {SIDES.map((s) => (
          <mesh
            key={`infra-${s}`}
            position={[s * 0.125, 0.225, 0.275]}
            material={mats.polish}
          >
            <boxGeometry args={[0.15, 0.11, 0.07]} />
          </mesh>
        ))}
        {/* Panel gap between the two, so the midface is assembled rather than
            carved. */}
        {SIDES.map((s) => (
          <mesh
            key={`face-seam-${s}`}
            position={[s * 0.115, 0.225, 0.313]}
            material={mats.recess}
          >
            <boxGeometry args={[0.012, 0.1, 0.012]} />
          </mesh>
        ))}

        {/* Cheekbones, high and outboard. Their inner edge stops at x 0.19,
            outside the lens, so a sharp cheek never eats the optic. */}
        {SIDES.map((s) => (
          <mesh
            key={`cheek-${s}`}
            position={[s * 0.245, 0.29, 0.185]}
            rotation={[0, s * -0.15, s * 0.12]}
            material={mats.polish}
          >
            <boxGeometry args={[0.11, 0.12, 0.13]} />
          </mesh>
        ))}
        {SIDES.map((s) => (
          <mesh
            key={`cheek-chamfer-${s}`}
            position={[s * 0.235, 0.235, 0.205]}
            rotation={[0, s * -0.15, s * 0.5]}
            material={mats.brushed}
          >
            <boxGeometry args={[0.03, 0.11, 0.11]} />
          </mesh>
        ))}
        {/* Zygomatic arches. At this height the core is only 0.19 wide, so an
            arch at 0.26 stands nearly 0.08 clear of the skull with daylight
            behind it, which is the line that makes the whole thing read as
            assembled rather than moulded. */}
        {SIDES.map((s) => (
          <mesh
            key={`arch-${s}`}
            position={[s * 0.2625, 0.295, 0.02]}
            rotation={[Math.PI / 2, 0, s * -0.14]}
            material={mats.polish}
          >
            <capsuleGeometry args={[0.021, 0.2, 4, 10]} />
          </mesh>
        ))}

        {/* Jaw hinge: the boss, its cap, and the bolt through it. */}
        {SIDES.map((s) => (
          <mesh
            key={`condyle-${s}`}
            position={[s * 0.245, HINGE_Y, HINGE_Z]}
            rotation={[0, 0, Math.PI / 2]}
            material={mats.polish}
          >
            <cylinderGeometry args={[0.05, 0.05, 0.07, 16]} />
          </mesh>
        ))}
        {SIDES.map((s) => (
          <mesh
            key={`hinge-cap-${s}`}
            position={[s * 0.285, HINGE_Y, HINGE_Z]}
            rotation={[0, 0, Math.PI / 2]}
            material={mats.brushed}
          >
            <cylinderGeometry args={[0.032, 0.032, 0.02, 12]} />
          </mesh>
        ))}

        {/* Maxilla rail and the upper row. Teeth are 0.024 across rather than
            0.026, and there are nine rather than seven, because oversized teeth
            are the other half of a toy read. */}
        <mesh position={[0, 0.145, 0.215]} material={mats.brushed}>
          <boxGeometry args={[0.3, 0.06, 0.24]} />
        </mesh>
        {toothRow.map((t, i) => (
          <mesh
            key={`upper-${i}`}
            geometry={geos.tooth}
            material={mats.tooth}
            position={[t.x, 0.094, 0.255 + t.dz]}
          />
        ))}

        {/* Mandible. Hinged at the boss above and held slightly open, because a
            closed jaw hides the one row of teeth that carries the read. Gonion
            sits at 0.215 against cheeks at 0.30, so the jaw tapers inward and
            the face is not a box. */}
        <group position={[0, HINGE_Y, HINGE_Z]} rotation={[0.07, 0, 0]}>
          <mesh position={[0, -0.24, 0.16]} material={mats.anod}>
            <boxGeometry args={[0.34, 0.16, 0.3]} />
          </mesh>
          {SIDES.map((s) => (
            <mesh
              key={`ramus-${s}`}
              position={[s * 0.215, -0.115, 0.06]}
              rotation={[0, 0, s * -0.05]}
              material={mats.polish}
            >
              <boxGeometry args={[0.05, 0.21, 0.09]} />
            </mesh>
          ))}
          {SIDES.map((s) => (
            <mesh
              key={`ramus-plate-${s}`}
              position={[s * 0.238, -0.1, 0.07]}
              rotation={[0, 0, s * -0.05]}
              material={mats.brushed}
            >
              <boxGeometry args={[0.03, 0.15, 0.1]} />
            </mesh>
          ))}
          {SIDES.map((s) => (
            <mesh
              key={`jawbar-${s}`}
              position={[s * 0.145, -0.245, 0.2]}
              rotation={[0, s * -0.4, 0]}
              material={mats.polish}
            >
              <boxGeometry args={[0.055, 0.075, 0.29]} />
            </mesh>
          ))}
          <mesh position={[0, -0.29, 0.315]} material={mats.polish}>
            <boxGeometry args={[0.19, 0.075, 0.085]} />
          </mesh>
          <mesh
            position={[0, -0.315, 0.335]}
            rotation={[0.22, 0, 0]}
            material={mats.brushed}
          >
            <boxGeometry args={[0.15, 0.07, 0.055]} />
          </mesh>
          <mesh
            position={[0, -0.262, 0.352]}
            rotation={[-0.3, 0, 0]}
            material={mats.polish}
          >
            <boxGeometry args={[0.13, 0.035, 0.05]} />
          </mesh>
          <mesh position={[0, -0.268, 0.28]} material={mats.brushed}>
            <boxGeometry args={[0.26, 0.05, 0.22]} />
          </mesh>
          {toothRow.map((t, i) => (
            <mesh
              key={`lower-${i}`}
              geometry={geos.tooth}
              material={mats.tooth}
              position={[t.x, -0.225, 0.3 + t.dz]}
            />
          ))}
        </group>

        {/* Jaw actuators. A hydraulic behind each ramus, sleeve and rod and
            anchor, which is the detail that says the jaw is driven rather than
            hinged. */}
        {SIDES.map((s) => (
          <mesh
            key={`jaw-sleeve-${s}`}
            position={[s * 0.2, 0.2, -0.11]}
            rotation={[0.34, 0, s * -0.1]}
            material={mats.brushed}
          >
            <cylinderGeometry args={[0.03, 0.03, 0.13, 12]} />
          </mesh>
        ))}
        {SIDES.map((s) => (
          <mesh
            key={`jaw-rod-${s}`}
            position={[s * 0.21, 0.27, -0.135]}
            rotation={[0.34, 0, s * -0.1]}
            material={mats.polish}
          >
            <cylinderGeometry args={[0.014, 0.014, 0.14, 10]} />
          </mesh>
        ))}
        {SIDES.map((s) => (
          <mesh
            key={`jaw-anchor-${s}`}
            position={[s * 0.19, 0.145, -0.09]}
            material={mats.anod}
          >
            <boxGeometry args={[0.06, 0.05, 0.06]} />
          </mesh>
        ))}

        {/* Head to neck joint, so it reads as a joint and not as a cut. */}
        <mesh position={[0, 0.07, -0.06]} material={mats.brushed}>
          <cylinderGeometry args={[0.135, 0.115, 0.08, 18]} />
        </mesh>
        <mesh
          position={[0, 0.045, -0.06]}
          rotation={[Math.PI / 2, 0, 0]}
          material={mats.polish}
        >
          <torusGeometry args={[0.14, 0.018, 8, 20]} />
        </mesh>

        {/* Cable run up the back of the skull, and the clamp holding it. */}
        {SIDES.map((s) => (
          <mesh
            key={`head-cable-${s}`}
            position={[s * 0.175, 0.235, -0.245]}
            rotation={[0.28, 0, s * 0.14]}
            material={mats.cable}
          >
            <capsuleGeometry args={[0.016, 0.15, 4, 8]} />
          </mesh>
        ))}
        {SIDES.map((s) => (
          <mesh
            key={`cable-clamp-${s}`}
            position={[s * 0.175, 0.165, -0.275]}
            rotation={[0, 0, Math.PI / 2]}
            material={mats.brushed}
          >
            <cylinderGeometry args={[0.026, 0.026, 0.022, 10]} />
          </mesh>
        ))}

        {/* Fasteners. One shared hex geometry, four orientations, twenty across
            the skull. Individually invisible, collectively the difference
            between a machined part and a moulded one. */}
        {HEX_UP.map((p) =>
          SIDES.map((s) => (
            <mesh
              key={`hex-up-${s}-${p[0]}-${p[2]}`}
              geometry={geos.hex}
              material={mats.brushed}
              position={[s * p[0], p[1], p[2]]}
            />
          )),
        )}
        {HEX_OUT.map((p) =>
          SIDES.map((s) => (
            <mesh
              key={`hex-out-${s}-${p[1]}-${p[2]}`}
              geometry={geos.hex}
              material={mats.brushed}
              position={[s * p[0], p[1], p[2]]}
              rotation={[0, 0, (s * -Math.PI) / 2]}
            />
          )),
        )}
        {HEX_FWD.map((p) =>
          SIDES.map((s) => (
            <mesh
              key={`hex-fwd-${s}-${p[1]}`}
              geometry={geos.hex}
              material={mats.brushed}
              position={[s * p[0], p[1], p[2]]}
              rotation={[Math.PI / 2, 0, 0]}
            />
          )),
        )}
        {HEX_AFT.map((p) =>
          SIDES.map((s) => (
            <mesh
              key={`hex-aft-${s}-${p[1]}`}
              geometry={geos.hex}
              material={mats.brushed}
              position={[s * p[0], p[1], p[2]]}
              rotation={[-Math.PI / 2, 0, 0]}
            />
          )),
        )}
      </group>

      {/* ---------------------------------------------------------------- */}
      {/* Neck. Stacked vertebrae on a dark column, with hydraulics.       */}
      {/* ---------------------------------------------------------------- */}
      <mesh position={[0, 0.6, -0.06]} material={mats.polish}>
        <sphereGeometry args={[0.085, 18, 14]} />
      </mesh>
      <mesh position={[0, 0.43, -0.05]} material={mats.anod}>
        <cylinderGeometry args={[0.085, 0.1, 0.34, 16]} />
      </mesh>
      {/* Five discs off one geometry, scaled to taper down into the chest, with
          a dark spacer between each pair so the stack reads as a stack. */}
      {VERTEBRAE.map((v) => (
        <mesh
          key={`vert-${v.y}`}
          geometry={geos.disc}
          material={mats.polish}
          position={[0, v.y, -0.05]}
          scale={[v.s, 1, v.s]}
        />
      ))}
      {[0.54, 0.47, 0.4, 0.33].map((y) => (
        <mesh
          key={`spacer-${y}`}
          geometry={geos.spacer}
          material={mats.recess}
          position={[0, y, -0.05]}
        />
      ))}
      {SIDES.map((s) => (
        <mesh
          key={`neck-sleeve-${s}`}
          position={[s * 0.155, 0.36, -0.12]}
          material={mats.brushed}
        >
          <cylinderGeometry args={[0.036, 0.036, 0.16, 14]} />
        </mesh>
      ))}
      {SIDES.map((s) => (
        <mesh
          key={`neck-rod-${s}`}
          position={[s * 0.155, 0.47, -0.12]}
          rotation={[0, 0, s * -0.02]}
          material={mats.polish}
        >
          <cylinderGeometry args={[0.019, 0.019, 0.3, 12]} />
        </mesh>
      ))}
      {SIDES.map((s) => (
        <mesh
          key={`neck-cap-${s}`}
          position={[s * 0.155, 0.605, -0.118]}
          material={mats.polish}
        >
          <cylinderGeometry args={[0.042, 0.042, 0.022, 12]} />
        </mesh>
      ))}
      {/* Conduit down the back, which is what stops the neck reading as a dowel,
          and two clamps holding it to the column. */}
      {SIDES.map((s) => (
        <mesh
          key={`neck-conduit-${s}`}
          position={[s * 0.05, 0.44, -0.175]}
          material={mats.cable}
        >
          <cylinderGeometry args={[0.024, 0.024, 0.32, 10]} />
        </mesh>
      ))}
      {[0.52, 0.36].map((y) => (
        <mesh
          key={`neck-clamp-${y}`}
          position={[0, y, -0.14]}
          rotation={[Math.PI / 2, 0, 0]}
          material={mats.brushed}
        >
          <torusGeometry args={[0.075, 0.012, 6, 16]} />
        </mesh>
      ))}

      {/* ---------------------------------------------------------------- */}
      {/* Chest, clavicles, shoulders.                                     */}
      {/* ---------------------------------------------------------------- */}
      {/* Yoke across the top of the chest, the piece the collar bones meet,
          with a chamfer along its front edge and a panel line across the top. */}
      <mesh
        position={[0, 0.2, 0]}
        rotation={[0.06, 0, 0]}
        material={mats.brushed}
      >
        <boxGeometry args={[0.62, 0.14, 0.28]} />
      </mesh>
      <mesh
        position={[0, 0.137, 0.135]}
        rotation={[0.5, 0, 0]}
        material={mats.polish}
      >
        <boxGeometry args={[0.6, 0.03, 0.05]} />
      </mesh>
      <mesh position={[0, 0.245, 0.09]} material={mats.recess}>
        <boxGeometry args={[0.58, 0.012, 0.016]} />
      </mesh>
      {/* Sternum, and a plate over it. */}
      <mesh
        position={[0, -0.02, 0.03]}
        rotation={[0.04, 0, 0]}
        material={mats.polish}
      >
        <boxGeometry args={[0.21, 0.44, 0.17]} />
      </mesh>
      <mesh position={[0, -0.02, 0.125]} material={mats.brushed}>
        <boxGeometry args={[0.15, 0.3, 0.04]} />
      </mesh>
      {/* Ribs. Half tori, flattened in depth, so they arc across the front and
          stop rather than wrapping into a barrel. */}
      {[
        { y: -0.06, r: 0.28 },
        { y: -0.18, r: 0.265 },
        { y: -0.3, r: 0.235 },
        { y: -0.4, r: 0.19 },
      ].map((rib) => (
        <mesh
          key={`rib-${rib.y}`}
          position={[0, rib.y, -0.02]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1, 0.6, 1]}
          material={mats.polish}
        >
          <torusGeometry args={[rib.r, 0.021, 8, 24, Math.PI]} />
        </mesh>
      ))}
      {/* Spine, behind: a dark column with bright discs stacked on it, off the
          same geometry each time. */}
      <mesh position={[0, -0.14, -0.16]} material={mats.anod}>
        <boxGeometry args={[0.12, 0.52, 0.09]} />
      </mesh>
      {[0.02, -0.1, -0.22, -0.34].map((y) => (
        <mesh
          key={`spine-${y}`}
          geometry={geos.spine}
          material={mats.polish}
          position={[0, y, -0.16]}
        />
      ))}
      {SIDES.map((s) => (
        <mesh
          key={`scapula-${s}`}
          position={[s * 0.28, 0.02, -0.13]}
          rotation={[0, s * -0.4, s * 0.1]}
          material={mats.brushed}
        >
          <boxGeometry args={[0.16, 0.22, 0.05]} />
        </mesh>
      ))}

      {/* Clavicle struts, out to the shoulder joints, and a second lower strut
          bracing each shoulder back to the sternum. */}
      {SIDES.map((s) => (
        <mesh
          key={`clav-${s}`}
          position={[s * 0.24, 0.2, 0.04]}
          rotation={[0, s * 0.3, s * -1.35]}
          material={mats.polish}
        >
          <capsuleGeometry args={[0.026, 0.3, 4, 10]} />
        </mesh>
      ))}
      {SIDES.map((s) => (
        <mesh
          key={`brace-${s}`}
          position={[s * 0.3, 0.09, 0.02]}
          rotation={[0, s * 0.3, s * -1.05]}
          material={mats.brushed}
        >
          <capsuleGeometry args={[0.02, 0.24, 4, 8]} />
        </mesh>
      ))}
      {SIDES.map((s) => (
        <mesh
          key={`chest-loom-${s}`}
          position={[s * 0.135, -0.02, -0.11]}
          rotation={[0.08, 0, s * 0.06]}
          material={mats.cable}
        >
          <capsuleGeometry args={[0.018, 0.26, 4, 8]} />
        </mesh>
      ))}
      {/* Fasteners on the yoke and the sternum plate. */}
      {SIDES.map((s) => (
        <mesh
          key={`yoke-hex-${s}`}
          geometry={geos.hex}
          material={mats.brushed}
          position={[s * 0.21, 0.268, 0.02]}
        />
      ))}
      {SIDES.map((s) => (
        <mesh
          key={`stern-hex-${s}`}
          geometry={geos.hex}
          material={mats.brushed}
          position={[s * 0.055, 0.08, 0.145]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      ))}

      {/* Shoulders: a ball joint, a retaining ring around it, a plate over it,
          a cut off upper arm so the bust ends as a bust rather than as an
          amputation, and an actuator driving the whole assembly. */}
      {SIDES.map((s) => (
        <group key={`shoulder-${s}`} position={[s * 0.44, 0.14, 0]}>
          <mesh material={mats.polish}>
            <sphereGeometry args={[0.115, 20, 14]} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]} material={mats.brushed}>
            <torusGeometry args={[0.126, 0.02, 8, 20]} />
          </mesh>
          <mesh
            position={[s * 0.02, 0.12, 0]}
            rotation={[0, 0, s * -0.34]}
            material={mats.brushed}
          >
            <boxGeometry args={[0.18, 0.08, 0.25]} />
          </mesh>
          <mesh
            geometry={geos.hex}
            material={mats.brushed}
            position={[s * 0.02, 0.163, 0.06]}
          />
          <mesh
            position={[s * 0.03, -0.15, 0]}
            rotation={[0, 0, s * 0.12]}
            material={mats.polish}
          >
            <cylinderGeometry args={[0.072, 0.062, 0.2, 16]} />
          </mesh>
          <mesh
            position={[s * 0.035, -0.245, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            material={mats.brushed}
          >
            <torusGeometry args={[0.066, 0.014, 8, 18]} />
          </mesh>
          <mesh
            position={[s * -0.05, -0.05, -0.09]}
            rotation={[0, 0, s * 0.24]}
            material={mats.brushed}
          >
            <cylinderGeometry args={[0.028, 0.028, 0.12, 12]} />
          </mesh>
          <mesh
            position={[s * -0.035, 0.05, -0.08]}
            rotation={[0, 0, s * 0.24]}
            material={mats.polish}
          >
            <cylinderGeometry args={[0.014, 0.014, 0.16, 10]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Stage                                                                      */
/* -------------------------------------------------------------------------- */

export default function EndoStage({
  progress,
  reduce,
  blink,
}: {
  progress: MotionValue<number>;
  reduce: boolean;
  /** 1 open, 0 shut. Driven by the caller on click, never from in here. */
  blink: MotionValue<number>;
}) {
  return (
    <Canvas
      // Capped so a 3x phone does not render nine times the pixels.
      dpr={[1, 1.5]}
      // Closer than ModelStage's 4.2. The bust is 1.86 units tall, and at 3.65
      // the frame is 2.23 units high, so it fills about 83 percent of a portrait
      // container. The remaining margin is sized for the yaw sweep: at full turn
      // the silhouette is 1.37 wide against 1.68 of frame width at 3:4, so
      // nothing clips at either extreme of the scroll.
      camera={{ position: [0, 0, 3.65], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      // Under reduced motion the scene renders once and then stops entirely.
      frameloop={reduce ? "demand" : "always"}
      style={{ background: "transparent" }}
    >
      {/* Everything here is high, and deliberately higher than ModelStage. The
          chess set is a textured dielectric that reads under almost any light;
          polished metal has no diffuse response at all, so it is literally
          nothing but reflections, and an underlit chrome object does not look
          dim, it looks black. The ambient is the floor that keeps the machined
          facets legible when the object turns away from the key, and it matters
          more now that a third of the surface area is near black anodised. */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 4, 3]} intensity={4.2} color="#fff4e2" />
      <directionalLight
        position={[-4, 1, -2]}
        intensity={1.9}
        color="#9aa6bc"
      />
      {/* Rim from behind, so the skull keeps a bright edge against the dark
          panel instead of dissolving into it. */}
      <directionalLight position={[0, 2, -5]} intensity={2.6} color="#e9e7e2" />
      {/* Straight down the lens axis, so the brow hoods do not leave the whole
          mid face in shadow now that the pitch is level. */}
      <directionalLight
        position={[0, 0.4, 5]}
        intensity={1.6}
        color="#e9e7e2"
      />

      <Suspense fallback={null}>
        <Environment resolution={64}>
          {/* A brass key light, so the metal picks up the page's accent. */}
          <Lightformer
            form="rect"
            intensity={9}
            color="#d99a4e"
            position={[2.5, 2.5, 2]}
            scale={[4, 4, 1]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={4.2}
            color="#9aa6bc"
            position={[-3, 0.5, -1.5]}
            scale={[4, 3, 1]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="circle"
            intensity={3.4}
            color="#e9e7e2"
            position={[0, 4, 0]}
            scale={[3, 3, 1]}
            target={[0, 0, 0]}
          />
          {/* Two narrow strips down the sides. Chrome needs long bright shapes
              to streak, and this is what turns the cranium from grey into
              polished metal. */}
          {SIDES.map((s) => (
            <Lightformer
              key={`strip-${s}`}
              form="rect"
              intensity={6.5}
              color="#9aa6bc"
              position={[s * 3, 0.5, 1.5]}
              scale={[0.4, 5, 1]}
              target={[0, 0, 0]}
            />
          ))}
          {/* Floor bounce in the ground colour, so the underside of the jaw is
              dark without being a black hole. */}
          <Lightformer
            form="rect"
            intensity={1.8}
            color="#131a28"
            position={[0, -3, 1]}
            scale={[5, 3, 1]}
            target={[0, 0, 0]}
          />
        </Environment>

        <Bust progress={progress} reduce={reduce} blink={blink} />
      </Suspense>
    </Canvas>
  );
}
