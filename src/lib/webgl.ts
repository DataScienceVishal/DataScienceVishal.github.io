/**
 * Whether this browser can actually give us a WebGL context.
 *
 * Worth probing rather than assuming. A machine can fail this for reasons that
 * have nothing to do with the browser being old: a blocklisted GPU, a headless
 * or virtualised environment, a hardened privacy profile that turns WebGL off.
 * Without the probe three.js throws while constructing its renderer, which on
 * this page meant an uncaught error and a hole in the layout where the figure
 * should be. The figures are decoration; none is worth a broken section.
 *
 * The result is cached because the probe allocates a context, and asking twice
 * on a machine with few context slots can itself be what fails.
 */
let cached: boolean | null = null;

export function hasWebGL(): boolean {
  if (cached !== null) return cached;
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    cached = Boolean(
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl"),
    );
  } catch {
    cached = false;
  }
  return cached;
}
