/**
 * Motion tokens. Every value here is from DESIGN.md section 8. Components import
 * from this file rather than writing durations or curves inline, so the two
 * cannot drift apart.
 */

/** Cubic bezier control points, in the array form Motion expects. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN = [0.4, 0, 1, 1] as const;
export const EASE_MOVE = [0.65, 0, 0.35, 1] as const;

/** Seconds, because Motion works in seconds and CSS works in milliseconds. */
export const DUR_OUT = 0.14;
export const DUR_IN = 0.22;
export const DUR_MOVE = 0.34;
export const DUR_ENTER = 0.62;

/**
 * The single orchestrated page-load sequence. Delays are absolute seconds from
 * first paint, so the whole composition can be read in one place instead of
 * being spread across six components as a chain of staggers.
 */
export const CUE = {
  nav: 0,
  thesisLine1: 0.1,
  thesisLine2: 0.2,
  subtext: 0.38,
  actions: 0.5,
  actionStagger: 0.06,
  /** The sentinel fades in after the words it sits beside. */
  sentinel: 0.6,
} as const;

/**
 * Entrance transition for a cue. Pass the cue delay.
 */
export function enter(delay: number) {
  return { duration: DUR_ENTER, delay, ease: EASE_OUT };
}

/**
 * Hover and focus, in and out. Exits are faster than entries, which is what
 * makes an interface feel responsive rather than syrupy.
 */
export const HOVER_IN = { duration: DUR_IN, ease: EASE_OUT };
export const HOVER_OUT = { duration: DUR_OUT, ease: EASE_IN };

/** Layout transitions, for content that genuinely changes position. */
export const MOVE = { duration: DUR_MOVE, ease: EASE_MOVE };
