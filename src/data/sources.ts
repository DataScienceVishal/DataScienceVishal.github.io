/**
 * Where each figure on the page came from, and what that place has to keep
 * saying for the page to stay true.
 *
 * `expect` is read by scripts/check-claims.mjs, which a weekly workflow runs
 * against the live sources. Each string must appear in what the source returns.
 * When a README moves on and stops saying "0.973", the check fails and the page
 * gets corrected, rather than the page quietly outliving its evidence. That is
 * how this page ended up saying 370 tests, 87 documents and Railway long after
 * all three had changed.
 */

import { LESION, TRAIL, TWICERUN, TWIN, UKHE, dp3 } from "./figures";

export type SourceId =
  | "trail-readme"
  | "trail-prereg"
  | "twicerun-readme"
  | "lesion-readme"
  | "twin-repo"
  | "twin-ready"
  | "twin-readme"
  | "untrusted-readme"
  | "cannot-read-readme"
  | "ukhe-readme"
  | "chess-readme"
  | "cifar-repo"
  | "churn-repo"
  | "cv";

export interface Source {
  label: string;
  href: string;
  /**
   * What the checker fetches, when it differs from the link a reader follows.
   * A README link opens the rendered page; the check reads the raw file.
   */
  check?: string;
  expect?: string[];
}

const raw = (repo: string, path = "README.md") =>
  `https://raw.githubusercontent.com/DataScienceVishal/${repo}/HEAD/${path}`;

export const SOURCES: Record<SourceId, Source> = {
  "trail-readme": {
    label: "the trail-scorer-audit README",
    href: "https://github.com/DataScienceVishal/trail-scorer-audit#readme",
    check: raw("trail-scorer-audit"),
    expect: [dp3(TRAIL.blind), dp3(TRAIL.best), dp3(TRAIL.ceiling), TRAIL.perGold],
  },
  "trail-prereg": {
    label: "its pre-registration",
    href: "https://github.com/DataScienceVishal/trail-scorer-audit/blob/HEAD/docs/pre-registration.md",
    check: raw("trail-scorer-audit", "docs/pre-registration.md"),
    expect: ["scores no better than the best real judge", "2026-08-27 at 10:16"],
  },
  "twicerun-readme": {
    label: "the twicerun README",
    href: "https://github.com/DataScienceVishal/twicerun#readme",
    check: raw("twicerun"),
    expect: [
      `${TWICERUN.diverged} of ${TWICERUN.stepCount} steps diverged`,
      ...TWICERUN.steps.map((s) => s.name),
    ],
  },
  "lesion-readme": {
    label: "the lesion-split README",
    href: "https://github.com/DataScienceVishal/lesion-split#readme",
    check: raw("lesion-split"),
    expect: [
      `${LESION.leaked}%`,
      ...LESION.gaps.map((g) => `${g.gap >= 0 ? "+" : "-"}${g.gap.toFixed(2)} points`),
    ],
  },
  "twin-repo": {
    label: "its repository description",
    href: "https://github.com/DataScienceVishal/ai-professional-twin",
    check: "https://api.github.com/repos/DataScienceVishal/ai-professional-twin",
    expect: [`${TWIN.tests} tests in CI`],
  },
  "twin-ready": {
    label: "the live twin's readiness endpoint",
    href: "https://ai-professional-twin.vercel.app/api/ready",
    expect: [`"document_count":${TWIN.documents}`],
  },
  "twin-readme": {
    label: "the twin's README",
    href: "https://github.com/DataScienceVishal/ai-professional-twin#readme",
    check: raw("ai-professional-twin"),
    expect: ["0.75", "0.12", "SSE"],
  },
  "untrusted-readme": {
    label: "the untrusted-rows README",
    href: "https://github.com/DataScienceVishal/untrusted-rows#readme",
    check: raw("untrusted-rows"),
    expect: ["It does not exist yet", "It does not assert that it works"],
  },
  "cannot-read-readme": {
    label: "the cannot-read README",
    href: "https://github.com/DataScienceVishal/cannot-read#readme",
    check: raw("cannot-read"),
    expect: ["Nothing below has been measured in this repository yet"],
  },
  "ukhe-readme": {
    label: "the UK-HE-Completion-Risk-Classifier README",
    href: "https://github.com/DataScienceVishal/UK-HE-Completion-Risk-Classifier#readme",
    check: raw("UK-HE-Completion-Risk-Classifier"),
    expect: [String(UKHE.providers), String(UKHE.recallAfter)],
  },
  "chess-readme": {
    label: "the Queens-Gambit-Female-Chess-Analytics README",
    href: "https://github.com/DataScienceVishal/Queens-Gambit-Female-Chess-Analytics#readme",
    check: raw("Queens-Gambit-Female-Chess-Analytics"),
    expect: ["304,767"],
  },
  "cifar-repo": {
    label: "the CIFAR-10-CNN repository",
    href: "https://github.com/DataScienceVishal/CIFAR-10-CNN",
  },
  "churn-repo": {
    label: "the Telecom_Churn repository",
    href: "https://github.com/DataScienceVishal/Telecom_Churn",
  },
  cv: {
    label: "the CV",
    href: "/vishal-khan-resume.pdf",
  },
};
