/**
 * The badges drawn over a player's head. Written from code points, so no file
 * in the repo holds an emoji character; only the rendered page shows them.
 * Order is the legend's order.
 */
export const BADGES = {
  work: { char: "\u{1F527}", label: "Working on a job" },
  ring: { char: "\u{1F514}", label: "Ringing the bell" },
  strike: { char: "\u{1F4A5}", label: "The wrecker takes someone out" },
  out: { char: "\u{1F635}", label: "Taken out" },
  found: { char: "\u{1F631}", label: "Found a body" },
  witness: { char: "\u{1F440}", label: "Saw it happen" },
  thinking: { char: "\u{1F4AD}", label: "Waiting for the model" },
  speaking: { char: "\u{1F4AC}", label: "Speaking" },
  suspect: { char: "\u{1F914}", label: "Suspects someone" },
  lie: { char: "\u{1F925}", label: "A false claim" },
  voted: { char: "\u{1F5F3}\u{FE0F}", label: "Has voted" },
  skip: { char: "\u{1F937}", label: "Voted to skip" },
  ashore: { char: "\u{26F5}", label: "Sent ashore" },
  won: { char: "\u{1F389}", label: "On the winning side" },
} as const;

export type Badge = keyof typeof BADGES;
