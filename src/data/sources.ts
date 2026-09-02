/**
 * The reference list.
 *
 * Every material claim on the page points at one of these. A source either has
 * a URL a visitor can open, or it does not and says so. Nothing here is a
 * placeholder: if a dissertation is not published, the entry says it is not
 * published and the marker links to this list instead of to a dead page.
 */

export type SourceId =
  | "twin-repo"
  | "twin-tests"
  | "twin-live"
  | "resume"
  | "cifar-repo"
  | "churn-repo"
  | "ukhe-repo"
  | "chess-repo"
  | "trail-repo"
  | "trail-conditions"
  | "twicerun-repo"
  | "twicerun-run"
  | "ljmu-thesis"
  | "nul-dissertation";

export interface Source {
  /** Marker printed after the claim, and the key in the reference list. */
  n: number;
  /** Short label shown in the hover and focus label. */
  label: string;
  /** Longer form used in the reference list and as the accessible name. */
  full: string;
  /** External target, or null when there is nothing public to link to. */
  href: string | null;
  /** Printed in the reference list when there is no href. */
  note?: string;
}

/**
 * Reference list order: the order in which each source is first cited going
 * down the page. Markers are numbered from this, so they ascend as the reader
 * descends, which is the whole point of numbering them.
 *
 * Numbering by hand is what this replaces. Two sources were briefly both
 * marker 10, because adding a section in the middle of the page means
 * renumbering every source below it and nothing enforced that. Insert an id
 * here at the position it is first cited and every marker follows.
 */
const ORDER: SourceId[] = [
  "twin-repo",
  "twin-live",
  "resume",
  "twin-tests",
  "trail-conditions",
  "trail-repo",
  "twicerun-repo",
  "twicerun-run",
  "ljmu-thesis",
  "nul-dissertation",
  "ukhe-repo",
  "chess-repo",
  "cifar-repo",
  "churn-repo",
];

const ENTRIES: Record<SourceId, Omit<Source, "n">> = {
  "twin-repo": {
    label: "ai-professional-twin, README",
    full: "ai-professional-twin, repository README on GitHub",
    href: "https://github.com/DataScienceVishal/ai-professional-twin#readme",
  },
  "twin-tests": {
    label: "ai-professional-twin, testing and quality",
    full: "ai-professional-twin, the testing and quality section of the README",
    href: "https://github.com/DataScienceVishal/ai-professional-twin#testing-and-quality",
  },
  "twin-live": {
    label: "AI Digital Twin, live deployment",
    full: "AI Digital Twin, the running deployment at ai-professional-twin.vercel.app",
    href: "https://ai-professional-twin.vercel.app/",
  },
  resume: {
    label: "Vishal Khan, resume",
    full: "Vishal Khan, resume (PDF)",
    href: "/vishal-khan-resume.pdf",
  },
  "cifar-repo": {
    label: "CIFAR-10-CNN, repository",
    full: "CIFAR-10-CNN, repository and notebook on GitHub",
    href: "https://github.com/DataScienceVishal/CIFAR-10-CNN",
  },
  "churn-repo": {
    label: "Telecom_Churn, repository",
    full: "Telecom_Churn, repository and notebook on GitHub",
    href: "https://github.com/DataScienceVishal/Telecom_Churn",
  },
  "ukhe-repo": {
    label: "UK-HE-Completion-Risk-Classifier, README",
    full: "UK-HE-Completion-Risk-Classifier, repository README and figures on GitHub",
    href: "https://github.com/DataScienceVishal/UK-HE-Completion-Risk-Classifier#readme",
    note: "Not on the resume. Published after it was written.",
  },
  "chess-repo": {
    label: "Queens-Gambit-Female-Chess-Analytics, README",
    full: "Queens-Gambit-Female-Chess-Analytics, repository README on GitHub",
    href: "https://github.com/DataScienceVishal/Queens-Gambit-Female-Chess-Analytics#readme",
    note: "Not on the resume. Published after it was written.",
  },
  "trail-repo": {
    label: "trail-scorer-audit, README",
    full: "trail-scorer-audit, repository README on GitHub",
    href: "https://github.com/DataScienceVishal/trail-scorer-audit#readme",
    note: "Not on the resume. Written after it.",
  },
  "trail-conditions": {
    label: "trail-scorer-audit, the nine properties",
    full: "trail-scorer-audit, the nine pre-registered properties and their verdicts",
    href: "https://github.com/DataScienceVishal/trail-scorer-audit#the-nine-pre-registered-properties",
  },
  "twicerun-repo": {
    label: "twicerun, README",
    full: "twicerun, repository README on GitHub",
    href: "https://github.com/DataScienceVishal/twicerun#readme",
    note: "Not on the resume. Written after it.",
  },
  "twicerun-run": {
    label: "twicerun, the reference run in full",
    full: "twicerun, the annotated run on the reference pipeline, in the README",
    href: "https://github.com/DataScienceVishal/twicerun#readme",
  },
  "ljmu-thesis": {
    label: "MSc dissertation, LJMU, 2024. Not published online.",
    full: "MSc dissertation, Liverpool John Moores University, 2024",
    href: null,
    note: "Not published online. Available on request.",
  },
  "nul-dissertation": {
    label: "MSc dissertation, Northeastern University London. In progress.",
    full: "MSc dissertation, Northeastern University London",
    href: null,
    note: "In progress, due 2027. Nothing to read yet.",
  },
};

// ENTRIES is a Record<SourceId, ...>, so the compiler already requires it to be
// exhaustive. ORDER is a plain array and nothing checks it, so this does: a
// source left out of it would otherwise be missing from SOURCES entirely and
// surface as an undefined read at render. Module scope, so it fails the
// prerender rather than a visitor's page.
if (ORDER.length !== Object.keys(ENTRIES).length) {
  const missing = (Object.keys(ENTRIES) as SourceId[]).filter(
    (id) => !ORDER.includes(id),
  );
  throw new Error(
    `sources.ts: every source must appear in ORDER. Missing: ${missing.join(", ")}`,
  );
}

export const SOURCES: Record<SourceId, Source> = Object.fromEntries(
  ORDER.map((id, i) => [id, { ...ENTRIES[id], n: i + 1 }]),
) as Record<SourceId, Source>;

/** Reference list order, by marker number. */
export const SOURCE_ORDER: SourceId[] = ORDER;
