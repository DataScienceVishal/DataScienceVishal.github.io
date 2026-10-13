"use client";

import { useEffect, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
// three's own sampler, not three-stdlib's: that copy converts every indexed
// geometry to a non-indexed duplicate and warns once per mesh, which on the
// chess set was dozens of warnings and a second copy of every piece.
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Matrix4,
  ShaderMaterial,
  Vector3,
} from "three";
import type { Group, Mesh } from "three";
import { afterIdle } from "../../motion/idle";

export interface Particles {
  /** Points scattered over the model's surface. Halved on a touch screen. */
  count: number;
  /** How far one travels before it has faded, as a share of the model's largest dimension. */
  reach: number;
  /** Brightness from 0 to 1. The brain is pale and see-through, and at full strength it glittered. */
  glow: number;
}

/*
  The night page's white ink and the light rig's cool fill. Never the margin
  red: on this page red means a measured value.
*/
const INK = new Color("#eeede8");
const FILL = new Color("#9db8d9");

/** Seconds for the particles to fade in once they exist, so they never pop in. */
const FADE_IN = 1.4;

/*
  Each point starts on the surface, drifts out along its own normal and a
  little upward, wanders as it goes, and fades; then it starts again from the
  surface. The whole life is a function of time and a per-point seed, so the
  only work on the CPU each frame is writing uTime.
*/
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uDist;
  attribute vec3 aNormal;
  attribute float aSeed;
  varying float vAlpha;
  varying float vMix;
  void main() {
    float life = fract(uTime * (0.07 + aSeed * 0.1) + aSeed * 13.0);
    vec3 p = position + aNormal * life * uDist + vec3(0.0, life * uDist * 0.7, 0.0);
    p += vec3(
      sin(uTime * 0.9 + aSeed * 31.0),
      cos(uTime * 0.7 + aSeed * 17.0),
      sin(uTime * 0.5 + aSeed * 11.0)
    ) * uDist * 0.12 * life;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vAlpha = smoothstep(0.0, 0.1, life) * (1.0 - smoothstep(0.45, 1.0, life));
    vMix = fract(aSeed * 5.17);
    gl_PointSize = uSize * uPixelRatio * (1.0 - life * 0.55) / -mv.z;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vMix;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    gl_FragColor = vec4(mix(uColorA, uColorB, vMix), a * vAlpha * uOpacity);
  }
`;

/**
 * Scatters `count` points over every mesh in `scene`, weighted by area, in the
 * space of the group the scene hangs from, which is where the points are drawn.
 * Returns the geometry and the model's largest dimension in that space.
 */
function scatter(scene: Group, count: number) {
  const frame = scene.parent ?? scene;
  frame.updateMatrixWorld(true);
  const toScene = new Matrix4().copy(frame.matrixWorld).invert();
  const parts: { sampler: MeshSurfaceSampler; rel: Matrix4; area: number }[] = [];
  scene.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh || !mesh.geometry?.attributes.position) return;
    const sampler = new MeshSurfaceSampler(mesh).build();
    const rel = new Matrix4().multiplyMatrices(toScene, mesh.matrixWorld);
    // The sampler's areas are in the mesh's own units; scale them into the scene's.
    const scale = Math.cbrt(Math.abs(rel.determinant())) || 1;
    const sums = sampler.distribution;
    const area = sums && sums.length ? sums[sums.length - 1] * scale * scale : 0;
    if (area > 0) parts.push({ sampler, rel, area });
  });

  const total = parts.reduce((sum, part) => sum + part.area, 0);
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const p = new Vector3();
  const n = new Vector3();
  const min = new Vector3(Infinity, Infinity, Infinity);
  const max = new Vector3(-Infinity, -Infinity, -Infinity);
  for (let i = 0; i < count && parts.length; i++) {
    let pick = Math.random() * total;
    let part = parts[0];
    for (const candidate of parts) {
      part = candidate;
      if ((pick -= candidate.area) <= 0) break;
    }
    part.sampler.sample(p, n);
    p.applyMatrix4(part.rel);
    n.transformDirection(part.rel);
    min.min(p);
    max.max(p);
    positions.set([p.x, p.y, p.z], i * 3);
    normals.set([n.x, n.y, n.z], i * 3);
    seeds[i] = Math.random();
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aNormal", new BufferAttribute(normals, 3));
  geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  const extent = max.sub(min);
  return { geometry, size: Math.max(extent.x, extent.y, extent.z) || 1 };
}

/**
 * Particles given off by a model: sparks off the head's wires, flecks off the
 * brain, dust off the chessmen. A child of the model, so it turns with it.
 *
 * Sampling a surface means visiting every triangle, and the chess set has a
 * lot of them, so it waits for an idle moment after the model has painted
 * rather than holding up the hand-off from the still.
 */
export function GivenOff({ scene, count, reach, glow }: { scene: Group } & Particles) {
  const dpr = useThree((state) => state.viewport.dpr);
  const [cloud, setCloud] = useState<ReturnType<typeof scatter> | null>(null);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const n = coarse ? Math.round(count / 2) : count;
    return afterIdle(() => setCloud(scatter(scene, n)), 1500, 300);
  }, [scene, count]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 26 },
          uPixelRatio: { value: 1 },
          uDist: { value: 0 },
          uOpacity: { value: 0 },
          uColorA: { value: INK },
          uColorB: { value: FILL },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [],
  );

  useEffect(() => {
    material.uniforms.uPixelRatio.value = Math.min(dpr, 2);
  }, [material, dpr]);

  useEffect(() => {
    if (cloud) material.uniforms.uDist.value = cloud.size * reach;
  }, [material, cloud, reach]);

  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => () => cloud?.geometry.dispose(), [cloud]);

  useFrame((state, delta) => {
    const u = material.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    // Fades in on frames that are drawn anyway; never asks for one itself.
    u.uOpacity.value = Math.min(glow, u.uOpacity.value + (Math.min(delta, 0.1) / FADE_IN) * glow);
  });

  if (!cloud) return null;
  // The shader moves every point off its stored position, so the stored bounds are wrong.
  return <points geometry={cloud.geometry} material={material} frustumCulled={false} />;
}
