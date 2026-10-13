import { TWIN } from "../../../data/figures";

/**
 * The twin's retrieval path, from the knob table and diagram in its README.
 * Every label is a setting in that repository rather than an illustration of
 * one, which is why the source check for this entry looks for 0.75 and 0.12.
 */
const STAGES = [
  { op: "Question", detail: "plus the last 2 user turns" },
  { op: "Embed", detail: "text-embedding-3-small" },
  { op: "Search", detail: `20 candidates from ${TWIN.documents} documents in ChromaDB` },
  { op: "Cut", detail: "anything past 0.75 cosine distance" },
  { op: "Boost", detail: "preferred sources 0.12 closer, by intent" },
  { op: "Ground", detail: "best 5 chunks, delimited as untrusted data" },
  { op: "Answer", detail: "gpt-5-mini, streamed over SSE with its sources" },
] as const;

export function RetrievalPath() {
  return (
    <figure className="mt-7 max-w-[40rem]" data-ink-figure="">
      <ol className="relative">
        <span
          className="absolute top-2 bottom-2 left-[5px] w-0.5 bg-ink"
          aria-hidden="true"
          data-ink="rule-y"
        />
        {STAGES.map((stage, i) => (
          <li
            key={stage.op}
            className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] items-baseline gap-x-2 py-1.5 sm:grid-cols-[1.5rem_6rem_minmax(0,1fr)]"
          >
            <span
              className={`relative top-[1px] size-3 rounded-full border-2 border-ink ${i === STAGES.length - 1 ? "bg-margin border-margin" : "bg-paper"}`}
              aria-hidden="true"
              data-ink="node"
            />
            <span className="t-furniture text-ink" style={{ fontWeight: 650 }}>
              {stage.op}
            </span>
            <span className="t-small col-start-2 text-ink-soft sm:col-start-3">
              {stage.detail}
            </span>
          </li>
        ))}
      </ol>
      <figcaption className="t-small mt-4 max-w-[30em] text-pencil">
        How a question becomes an answer, with the settings the repository ships. If
        every match scores badly the single best one is kept, so the refusal comes from
        the prompt rules rather than from an empty context.
      </figcaption>
    </figure>
  );
}
