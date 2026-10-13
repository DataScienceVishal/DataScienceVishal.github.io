/**
 * The notebook entries. Numbers come from figures.ts and are interpolated, so a
 * sentence and the scale drawn beside it read the same value.
 *
 * Every entry opens on one plain sentence of result, then the two fields a lab
 * notebook keeps: what was expected before the work, and what was measured.
 * "Written down first" is used only where the expectation really was fixed in
 * advance. lesion-split's came from the literature and is labelled as such.
 */

import { CHESS, CHURN, CIFAR, LESION, TRAIL, TWICERUN, TWIN, UKHE, dp3, signed } from "./figures";
import type { SourceId } from "./sources";
import type { PlateId } from "./plates";

export type FigureKind = "trail" | "twicerun" | "lesion" | "retrieval";

export interface Field {
  term: string;
  detail: string;
  /**
   * The one phrase in the field a skimming reader should land on, drawn with a
   * highlighter. Must appear in `detail` exactly; the render throws otherwise,
   * which fails the prerender rather than shipping a highlight on nothing.
   */
  mark?: string;
}

export interface Link {
  label: string;
  href: string;
}

export interface Entry {
  id: "scorer-audit" | "twicerun" | "lesion-split" | "twin";
  /** The repository or product name, carried in the margin beside the date. */
  name: string;
  started: { iso: string; label: string };
  claim: string;
  fields: Field[];
  figure: FigureKind;
  context: string;
  /** The second depth. Opens in place; nothing here is needed to follow the claim. */
  working: { summary: string; paragraphs: string[]; command?: string };
  links: Link[];
  sources: SourceId[];
  plate?: PlateId;
}

const gap = LESION.gaps[0];

export const ENTRIES: Entry[] = [
  {
    id: "scorer-audit",
    name: "trail-scorer-audit",
    started: { iso: "2026-08-27", label: "27 Aug 2026" },
    claim: "A program that cannot read scores higher than every model in a published benchmark's own results table.",
    fields: [
      {
        term: "Written down first",
        detail:
          "At 10:16 on 27 August, before the repository existed: a predictor that emits every span with every error category should score no better than the best real judge.",
      },
      {
        term: "Measured",
        detail: `${dp3(TRAIL.blind)} joint accuracy on GAIA through TRAIL's own unmodified scorer, against ${dp3(TRAIL.best)} for the best row in the paper's Table 1. It gets there by emitting ${TRAIL.perGold} as many errors as the answer key holds.`,
        mark: `${dp3(TRAIL.blind)} joint accuracy on GAIA`,
      },
    ],
    figure: "trail",
    context: `Both headline metrics divide by the number of errors in the answer key and never by the number the judge reported, so flagging everything is close to optimal play. Of the ${TRAIL.properties} properties I wrote down, ${TRAIL.violated} came back violated and ${TRAIL.latent} latent: real defects in the code that move no number on this data.`,
    working: {
      summary: "How it was checked, and what it does not claim",
      paragraphs: [
        "TRAIL is Patronus AI's benchmark of human-annotated agent traces, published under MIT. Its scorer is fetched at a pinned commit, checked against a SHA-256 and run exactly as published. The predictor's whole input is a list of span identifiers, so it never sees a trace's contents or the answer key.",
        "It does not re-score the paper's table, because TRAIL publishes no raw model outputs to re-score, and it says nothing about whether the human annotators marked the right errors. There is no replacement metric and no fork: auditing one benchmark is the project.",
        "The audit is only possible because the authors published the scorer, the gold labels and the traces. A benchmark that publishes a table and keeps its scoring code cannot be checked from outside at all.",
      ],
      command: "uv run trailaudit report --check",
    },
    links: [
      { label: "Repository", href: "https://github.com/DataScienceVishal/trail-scorer-audit" },
      {
        label: "The pre-registration",
        href: "https://github.com/DataScienceVishal/trail-scorer-audit/blob/HEAD/docs/pre-registration.md",
      },
    ],
    sources: ["trail-readme", "trail-prereg"],
  },
  {
    id: "twicerun",
    name: "twicerun",
    started: { iso: "2026-08-26", label: "26 Aug 2026" },
    claim: "Rerunning a pipeline five times caught four planted bugs, flagged one correct float step, and missed a bug that held still.",
    fields: [
      {
        term: "Planted beforehand",
        detail: "Real bugs in five of the eight steps, four distinct ones, with the other three steps left correct.",
      },
      {
        term: "Measured",
        detail: `${TWICERUN.diverged} of ${TWICERUN.stepCount} steps diverged in ${TWICERUN.seconds} s. mean_basket is correct code whose float average moves in the last few bits. sparse_customer_keys carries a real bug and agreed with itself on all ${TWICERUN.comparisons} comparisons.`,
        mark: `${TWICERUN.diverged} of ${TWICERUN.stepCount} steps diverged`,
      },
    ],
    figure: "twicerun",
    context:
      "DuckDB adds the terms of a parallel sum in whatever order its threads finish, and float addition is not associative, so a plain two-run diff reports hundreds of differences on correct code. Running the pipeline is the easy half. Deciding whether two outputs are the same answer is the project.",
    working: {
      summary: "How it decides, and where it is blind",
      paragraphs: [
        "Each divergent step is re-run at one thread. Four of the five stop diverging, which names thread order as the cause; the audit-log append keeps diverging, because its answer depends on having run before.",
        "The sharpest limit: a backfill that silently drops a column the same way on every run gets a clean zero. A rerun checker is blind to a deterministic wrong answer by construction, and the README shows the case on real NYC taxi data.",
        "The README also says plainly that bit-exact multiset equality matched the oracle on every step it was scored on, so those tables hold no evidence for the oracle over the cheap comparison. What the oracle adds is the divergence class, its size and its cause.",
      ],
      command: "uv run twicerun run pipelines/reference.py",
    },
    links: [{ label: "Repository", href: "https://github.com/DataScienceVishal/twicerun" }],
    sources: ["twicerun-readme"],
  },
  {
    id: "lesion-split",
    name: "lesion-split",
    started: { iso: "2026-09-03", label: "3 Sep 2026" },
    claim: `Splitting HAM10000 by image leaks ${Math.round(LESION.leaked)}% of the test set, and fixing it cost this model about one and a half points.`,
    fields: [
      {
        term: "Expected, from published audits",
        detail: "The correction costs several points of accuracy.",
      },
      {
        term: "Measured",
        detail: `${signed(gap.gap)} points of accuracy, 95% interval ${signed(gap.low)} to ${signed(gap.high)}, paired over ${LESION.seeds} seeds. On balanced accuracy and macro F1 the interval crosses zero.`,
        mark: `${signed(gap.gap)} points of accuracy`,
      },
    ],
    figure: "lesion",
    context:
      "The leak is real and reproducible from a 690 KB metadata file: 4,501 of the 10,015 images repeat a lesion already in the set. What it is worth to a model is a separate question, and for this one the answer was smaller than I expected.",
    working: {
      summary: "Why the gap might be small, and what was not tried",
      paragraphs: [
        "The same small CNN is trained twice and only the split changes: 390,695 parameters at 64 pixels, ten epochs, on a CPU. Both arms land within a handful of images of the same train and test sizes.",
        "Three explanations the evidence cannot separate: the model is too small to memorise a lesion, 64 pixels destroys the cue, or ten epochs is not enough to overfit. All three predict a gap that grows with capacity, and that run is not done here because each arm at 224 pixels is hours on a CPU.",
        "Accuracy is the least useful column. Answering the majority class every time scores 0.667, so balanced accuracy, against a chance floor near 0.14, is the one to read. No transfer learning, no tuning, and no clinical claim.",
      ],
      command: "uv run lesion-split leakage",
    },
    links: [{ label: "Repository", href: "https://github.com/DataScienceVishal/lesion-split" }],
    sources: ["lesion-readme"],
  },
  {
    id: "twin",
    name: "ai-professional-twin",
    started: { iso: "2026-06-12", label: "12 Jun 2026" },
    claim: `A live assistant that answers questions about me from ${TWIN.documents} documents, cites what it used, and says so when they do not cover the question.`,
    fields: [
      {
        term: "Built",
        detail: `FastAPI and ChromaDB with Azure OpenAI, intent-boosted retrieval, and answers streamed over SSE to a React 19 front end. ${TWIN.tests} tests run in CI, ${TWIN.backendTests} backend and ${TWIN.frontendTests} frontend.`,
      },
      {
        term: "Running",
        detail: "Front end on Vercel, backend on Azure Container Apps, behind per-IP rate limits and a daily spend cap.",
      },
      {
        term: "What I would change",
        detail:
          "Its defence against instructions planted in a retrieved README is a paragraph of the system prompt, and the test for it only asserts the paragraph is present. Nothing measures whether it works. untrusted-rows is where I am measuring that kind of defence.",
      },
    ],
    figure: "retrieval",
    context: `The ${TWIN.documents} documents are YAML knowledge files, the CV and live READMEs from public GitHub, read from the running deployment on ${TWIN.readOn}. The number moves as repositories are added.`,
    working: {
      summary: "Why those settings, and what the README admits",
      paragraphs: [
        "Follow-up questions such as \"what tools did he use?\" embed to almost nothing on their own, so the last two user turns are folded into the retrieval query. That is cheaper and more predictable than an extra model call to rewrite the question.",
        "Intent never filters the search. It nudges preferred sources 0.12 closer, so a question about skills still finds the project where the skill was used.",
        "Ingestion runs in the background and keys every document on a content hash, so a cold start answers health checks at once instead of restart-looping while it embeds.",
      ],
    },
    links: [
      { label: "Ask the twin", href: "https://ai-professional-twin.vercel.app/" },
      { label: "Repository", href: "https://github.com/DataScienceVishal/ai-professional-twin" },
    ],
    sources: ["twin-ready", "twin-repo", "twin-readme", "untrusted-readme"],
    plate: "brain",
  },
];

export interface Brief {
  name: string;
  started: { iso: string; label: string };
  line: string;
  href: string;
  source: SourceId;
}

/** Open work, one honest line each. Neither has a result yet, and neither claims one. */
export const IN_PROGRESS: Brief[] = [
  {
    name: "untrusted-rows",
    started: { iso: "2026-09-21", label: "21 Sep 2026" },
    line: "A DuckDB MCP server that treats the rows it returns as untrusted input, with its false-positive rate on real database text still unmeasured.",
    href: "https://github.com/DataScienceVishal/untrusted-rows",
    source: "untrusted-readme",
  },
  {
    name: "cannot-read",
    started: { iso: "2026-09-25", label: "25 Sep 2026" },
    line: "Whether recall-only benchmark metrics have a floor their papers do not report, written down before any code and not yet measured.",
    href: "https://github.com/DataScienceVishal/cannot-read",
    source: "cannot-read-readme",
  },
];

export interface Earlier {
  title: string;
  year: string;
  line: string;
  href: string;
  source: SourceId;
  plate?: PlateId;
}

/** Older work, shorter than the entries above and honest about it. */
export const EARLIER: Earlier[] = [
  {
    title: "UK higher education completion risk",
    year: "2026",
    line: `${UKHE.providers} English providers, five classifiers. Dropping the cutoff from 0.50 to 0.30 took minority recall from ${UKHE.recallBefore} to ${UKHE.recallAfter}: ${UKHE.caught} of ${UKHE.atRisk} at-risk providers caught, for 18 false positives instead of 12.`,
    href: "https://github.com/DataScienceVishal/UK-HE-Completion-Risk-Classifier",
    source: "ukhe-readme",
  },
  {
    title: "Women in chess, twelve queries",
    year: "2026",
    line: `${CHESS.fideRows} FIDE player-month rows joined to ${CHESS.games} chess.com games for ${CHESS.players} players. Only ${CHESS.federationChange} of female players ever change federation, and the age hypothesis came out at p around 0.44 with n = 12, so it is written up as not significant.`,
    href: "https://github.com/DataScienceVishal/Queens-Gambit-Female-Chess-Analytics",
    source: "chess-readme",
    plate: "chess",
  },
  {
    title: "CIFAR-10 image classification",
    year: "2024",
    line: `A CNN in Keras with dropout and L2, ${CIFAR.epochs} epochs: ${CIFAR.train} training accuracy, ${CIFAR.validation} validation.`,
    href: "https://github.com/DataScienceVishal/CIFAR-10-CNN",
    source: "cifar-repo",
  },
  {
    title: "Telecom churn prediction",
    year: "2024",
    line: `${CHURN.customers} customers and ${CHURN.predictors} predictors. About 80% accuracy, with tenure the strongest predictor, and choosing the cutoff mattered more than choosing the model.`,
    href: "https://github.com/DataScienceVishal/Telecom_Churn",
    source: "churn-repo",
  },
];
