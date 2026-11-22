/**
 * Every measured number on the page, once.
 *
 * The prose, the scales and the source checks all read from here, so a figure
 * cannot be right in a sentence and wrong in the drawing beside it. Each block
 * names the file it was read from and the day it was read. If a number cannot
 * be pointed at in a public file, it does not go in this file.
 */

/**
 * trail-scorer-audit README, the teaser table and the P1 row of the
 * pre-registered properties. Read 2026-10-12.
 */
export const TRAIL = {
  /** `all-spans-all-categories`, joint accuracy on GAIA through TRAIL's own scorer. */
  blind: 0.973,
  /** Best row in the paper's Table 1, same split, same metric. */
  best: 0.183,
  /** The highest joint accuracy anything can reach on GAIA. */
  ceiling: 0.974,
  /** Errors emitted per error in the answer key. */
  perGold: "129.1x",
  violated: 7,
  latent: 2,
  properties: 9,
} as const;

/**
 * twicerun README, the annotated run of pipelines/reference.py at the top of
 * the file. One run of five, so four comparisons per step. Read 2026-10-12.
 */
export const TWICERUN = {
  diverged: 5,
  stepCount: 8,
  comparisons: 4,
  seconds: 13.4,
  steps: [
    { name: "generate_inputs", bug: false, fired: 0 },
    { name: "daily_revenue", bug: true, fired: 4 },
    { name: "customer_keys", bug: true, fired: 4 },
    { name: "apply_price_updates", bug: true, fired: 2 },
    { name: "append_audit_log", bug: true, fired: 4 },
    { name: "mean_basket", bug: false, fired: 4 },
    { name: "sparse_customer_keys", bug: true, fired: 0 },
    { name: "roll_up_keys", bug: false, fired: 0 },
  ],
} as const;

/**
 * lesion-split README, the leakage and gap tables. Paired within seed over
 * 8 seeds, 95% intervals. Read 2026-10-12.
 */
export const LESION = {
  leaked: 38.3,
  leakedLow: 36.5,
  leakedHigh: 40.0,
  seeds: 8,
  gaps: [
    { metric: "accuracy", gap: 1.54, low: 0.44, high: 2.64 },
    { metric: "balanced accuracy", gap: 1.94, low: -0.84, high: 4.73 },
    { metric: "macro F1", gap: 1.31, low: -0.97, high: 3.59 },
  ],
} as const;

/**
 * The live twin's /api/ready, its repository description, and the latest CI
 * run on main (276 backend tests, 114 frontend). Read 2026-10-12.
 */
export const TWIN = {
  documents: 89,
  tests: 390,
  backendTests: 276,
  frontendTests: 114,
  readOn: "12 Oct 2026",
} as const;

/**
 * Find the Wrecker's 11-game pilot, as the find-the-wrecker README states it,
 * read 2026-11-22: "The pilot" section and its re-vote table, after the
 * checker fix in deadpan 814ea9a. Pilot games, not results.
 */
export const DEADPAN = {
  games: 11,
  usd: "0.123",
  meetings: 13,
  /** Meetings where a keeper's own sightings disproved a wrecker claim. */
  knowable: 5,
  /** Times a keeper held such a disproof, once per meeting, and voted for the wrecker. */
  holders: 9,
  holdersForWrecker: 6,
  /** Other keepers in those meetings, and keepers in meetings with no disproof. */
  besideHolders: { voters: 9, forWrecker: 2 },
  noDisproof: { voters: 26, forWrecker: 19 },
  keeperClaims: 126,
  /** Meetings that kept their recorded turns, so could be re-voted offline. */
  revoted: 12,
  /** Of the LLM table's 7, how many came in meetings where nobody held a disproof. */
  llmWithoutDisproof: 5,
  tables: [
    // `readme` is how the README's re-vote table names the row, and the two
    // middle counts are its other columns, so the source check can pin each
    // whole row rather than single cells that other rows share.
    { name: "LLM players", readme: "The LLM players, as recorded", detail: "as recorded", wrecker: 7, withDisproof: 2, withoutDisproof: 5, keeper: 3 },
    { name: "Rule-based detective", readme: "A rule-based detective", detail: "a ceiling for using proof", wrecker: 2, withDisproof: 1, withoutDisproof: 1, keeper: 0 },
    { name: "Random voters", readme: "Random voters, exact expectation", detail: "exact expectation", wrecker: 1.3, withDisproof: 0.5, withoutDisproof: 0.8, keeper: 5.3 },
  ],
} as const;

/** UK-HE-Completion-Risk-Classifier README. */
export const UKHE = {
  providers: 312,
  recallBefore: 0.62,
  recallAfter: 0.94,
  caught: 15,
  atRisk: 16,
} as const;

/** Queens-Gambit-Female-Chess-Analytics README. */
export const CHESS = {
  fideRows: "4.8 million",
  games: "304,767",
  players: 12,
  federationChange: "1.4%",
} as const;

/** The CIFAR-10-CNN notebook's training log, final epoch. */
export const CIFAR = { train: "72.12%", validation: "74.06%", epochs: 5 } as const;

/** The Telecom_Churn notebook. */
export const CHURN = { customers: "7,032", predictors: 21 } as const;

/** Formats a fraction the way the source tables print it: three places. */
export const dp3 = (v: number) => v.toFixed(3);

/** Signed, two places, for the interval tables. */
export const signed = (v: number) => `${v >= 0 ? "+" : "-"}${Math.abs(v).toFixed(2)}`;
