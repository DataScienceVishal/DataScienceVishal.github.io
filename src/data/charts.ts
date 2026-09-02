/**
 * Real measurements, with provenance. Nothing here is illustrative.
 *
 * The CIFAR series is the Keras history printed in the notebook's own training
 * output, and its final epoch is 0.7212 train / 0.7406 validation, which is
 * exactly what the resume claims. The churn series is the cutoff table the
 * notebook prints while choosing a threshold. The UK higher education figures
 * are the test-set scores tabulated in that repository's README.
 *
 * If a number here cannot be pointed at in a public file, it does not belong in
 * this file.
 */

import type { SourceId } from "./sources";

export interface Series {
  label: string;
  /** Accent carries the series that matters; the rest take neutral ink. */
  tone: "accent" | "bone" | "graphite";
  marker: "circle" | "square" | "diamond";
  points: number[];
}

export interface LineChartData {
  kind: "line";
  caption: string;
  source: SourceId;
  xLabel: string;
  /** Axis ticks. May be sparser than the data. */
  xTicks: string[];
  /**
   * One label per data point, when the ticks are sparser than the points.
   * Without it a readout can only name the index, which is not a value.
   */
  xValues?: string[];
  yLabel: string;
  yMin: number;
  yMax: number;
  yTicks: number[];
  /** Formats a value for labels, the table and the hover title. */
  format: (v: number) => string;
  series: Series[];
}

export interface BarChartData {
  kind: "bar";
  /**
   * What a row is, and what the chart is of. Both were hardcoded as "model",
   * which made twicerun's pipeline steps and TRAIL's predictor/benchmark pairs
   * read as models to anyone using the text alternative.
   */
  rowLabel?: string;
  title?: string;
  /**
   * What a highlighted bar means, in words. The highlight is carried by colour
   * alone in the drawing, so without this the caption's reference to "the two
   * highlighted rows" is unresolvable for a screen reader, in greyscale, or in
   * print.
   */
  highlightMeans?: string;
  caption: string;
  source: SourceId;
  valueLabel: string;
  xMax: number;
  format: (v: number) => string;
  bars: Array<{ label: string; value: number; highlight?: boolean }>;
}

const pct = (v: number) => `${(v * 100).toFixed(2)}%`;
const pct1 = (v: number) => `${(v * 100).toFixed(1)}%`;
const dp3 = (v: number) => v.toFixed(3);

/** CIFAR-10 CNN, five epochs, from the notebook's training log. */
export const CIFAR_ACCURACY: LineChartData = {
  kind: "line",
  caption:
    "Five epochs. Validation accuracy stayed above training throughout, which is what dropout and L2 are for.",
  source: "cifar-repo",
  xLabel: "epoch",
  xTicks: ["1", "2", "3", "4", "5"],
  yLabel: "accuracy",
  yMin: 0.3,
  yMax: 0.8,
  yTicks: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
  format: pct,
  series: [
    {
      label: "validation",
      tone: "accent",
      marker: "circle",
      points: [0.5188, 0.6106, 0.6988, 0.7026, 0.7406],
    },
    {
      label: "training",
      tone: "graphite",
      marker: "square",
      points: [0.3468, 0.5454, 0.6354, 0.6838, 0.7212],
    },
  ],
};

/**
 * Telecom churn, the cutoff table. The crossover near 0.3 is the whole point:
 * past it you buy accuracy by missing churners.
 */
export const CHURN_CUTOFF: LineChartData = {
  kind: "line",
  caption:
    "Accuracy peaks at a cutoff of 0.5, but sensitivity has collapsed to 0.54 by then. The three curves cross at about 0.3, which is where the model still catches the churners it is for.",
  source: "churn-repo",
  xLabel: "probability cutoff",
  xTicks: ["0.0", "0.2", "0.4", "0.6", "0.8"],
  xValues: [
    "0.0",
    "0.1",
    "0.2",
    "0.3",
    "0.4",
    "0.5",
    "0.6",
    "0.7",
    "0.8",
    "0.9",
  ],
  yLabel: "rate",
  yMin: 0,
  yMax: 1,
  yTicks: [0, 0.25, 0.5, 0.75, 1],
  format: dp3,
  series: [
    {
      label: "accuracy",
      tone: "accent",
      marker: "circle",
      points: [
        0.2615, 0.6184, 0.7223, 0.7722, 0.7934, 0.8064, 0.8019, 0.7785, 0.7501,
        0.7385,
      ],
    },
    {
      label: "sensitivity",
      tone: "bone",
      marker: "diamond",
      points: [
        1.0, 0.9425, 0.8493, 0.77, 0.6511, 0.5369, 0.3947, 0.2059, 0.0521, 0.0,
      ],
    },
    {
      label: "specificity",
      tone: "graphite",
      marker: "square",
      points: [
        0.0, 0.5037, 0.6773, 0.773, 0.8437, 0.9018, 0.9461, 0.9813, 0.9972, 1.0,
      ],
    },
  ],
};

/** UK higher education completion risk, test-set macro F1 across five classifiers. */
export const UKHE_MODELS: BarChartData = {
  kind: "bar",
  caption:
    "Macro F1 on the test set, not accuracy. A majority-class predictor scores 74.8% accuracy here while catching no at-risk provider at all. Random Forest is the one that shipped.",
  source: "ukhe-repo",
  rowLabel: "classifier",
  title: "Test macro F1 by classifier",
  highlightMeans: "the one that shipped",
  valueLabel: "test macro F1",
  xMax: 0.8,
  format: pct1,
  bars: [
    { label: "Random Forest", value: 0.659, highlight: true },
    { label: "XGBoost", value: 0.634 },
    { label: "Gradient Boosting", value: 0.622 },
    { label: "SVM, RBF", value: 0.594 },
    { label: "Logistic Regression", value: 0.583 },
  ],
};

/**
 * The finding the audit exists for, in TRAIL's own units.
 *
 * `all-spans-all-categories` is a predictor that never opens a span, never
 * reads the gold and has no representation of what an error is. It is run
 * through the benchmark's own unmodified scorer. Both headline metrics divide
 * by the number of errors in the answer key and never by the number the judge
 * reported, so emitting an error everywhere scores near the ceiling.
 */
export const TRAIL_JOINT: BarChartData = {
  kind: "bar",
  caption:
    "Joint accuracy through TRAIL's unmodified scorer. The two gold-blind rows are one program that cannot read: it emits 129.1x as many errors as the answer key holds on GAIA, and scores above every published model on both splits. 0.974 is the highest joint accuracy anything can reach on GAIA, so the gold-blind predictor is within 0.001 of the ceiling.",
  source: "trail-repo",
  rowLabel: "predictor and split",
  title: "Joint accuracy through TRAIL's own scorer",
  highlightMeans: "gold-blind predictor, reads nothing",
  valueLabel: "joint accuracy",
  xMax: 1,
  format: pct1,
  bars: [
    { label: "Gold-blind predictor, GAIA", value: 0.973, highlight: true },
    { label: "Best published, GAIA", value: 0.183 },
    { label: "Gold-blind predictor, SWE Bench", value: 0.958, highlight: true },
    { label: "Best published, SWE Bench", value: 0.05 },
  ],
};

/**
 * Per-step divergence on twicerun's reference pipeline: how many of the four
 * comparisons against run 1 failed to give the same answer.
 *
 * The three zero-length rows are the point of the chart rather than padding.
 * Step 6 is a planted bug that agreed with itself every time on this input and
 * only moved once the input was stressed, which is exactly the case a plain
 * five-run loop reports as a clean pass.
 */
export const TWICERUN_STEPS: BarChartData = {
  kind: "bar",
  caption:
    "Comparisons that diverged, out of four, on the reference pipeline. Four of the five that fired are planted bugs; mean_basket is correct code whose float average moves in the last few bits, which is why a two-run diff is not enough on its own. sparse_customer_keys reads as zero here and is the fifth bug: it broke under a stressed input, so the tool reports it as stable on this input rather than as passing.",
  source: "twicerun-run",
  rowLabel: "pipeline step",
  title: "Comparisons that diverged, out of four, per pipeline step",
  highlightMeans: "planted bug, only diverges once the input is stressed",
  valueLabel: "of 4 comparisons",
  xMax: 4,
  format: (v: number) => `${v} of 4`,
  bars: [
    { label: "generate_inputs", value: 0 },
    { label: "daily_revenue", value: 4 },
    { label: "customer_keys", value: 4 },
    { label: "apply_price_updates", value: 2 },
    { label: "append_audit_log", value: 4 },
    { label: "mean_basket", value: 4 },
    { label: "sparse_customer_keys", value: 0, highlight: true },
    { label: "roll_up_keys", value: 0 },
  ],
};
