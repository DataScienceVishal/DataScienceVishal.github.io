import { TWICERUN } from "../../../data/figures";

/**
 * Planted against observed, step by step. Which steps carry a bug was known
 * before the run, because they were put there, so this is the one figure on
 * the page where the expectation is exact. The two rows where the run
 * disagreed with it are the result, and they carry the margin red.
 */
const SURPRISE: Record<string, string> = {
  mean_basket: "correct code, float noise",
  sparse_customer_keys: "real bug, held still",
};

export function TwicerunSteps() {
  return (
    <figure className="mt-7 max-w-[46rem]" data-ink-figure="">
      <div className="overflow-x-auto">
        <table className="t-small w-full min-w-[18rem] border-collapse text-left">
          <caption className="sr-only">
            Each step of the reference pipeline: whether a bug was planted in it, and how
            many of {TWICERUN.comparisons} comparisons diverged.
          </caption>
          <thead>
            <tr className="t-furniture-sm border-b-2 border-ink text-pencil">
              <th scope="col" className="py-2 pr-2 font-normal sm:pr-3">
                Step
              </th>
              <th scope="col" className="py-2 pr-2 font-normal sm:pr-3">
                Planted
              </th>
              <th scope="col" className="py-2 pr-3 font-normal">
                Diverged
              </th>
              <th scope="col" className="hidden py-2 font-normal sm:table-cell">
                <span className="sr-only">Note</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {TWICERUN.steps.map((step) => {
              const note = SURPRISE[step.name];
              return (
                <tr key={step.name} className="border-b border-hair">
                  <th scope="row" className="py-2 pr-2 font-normal sm:pr-3">
                    <code className="t-code text-[0.75rem] text-ink sm:text-[0.875rem]">{step.name}</code>
                    {note ? (
                      <span className="t-furniture-sm block text-margin sm:hidden">{note}</span>
                    ) : null}
                  </th>
                  <td className="py-2 pr-2 text-ink-soft sm:pr-3">{step.bug ? "Yes" : "No"}</td>
                  <td className="py-2 whitespace-nowrap sm:pr-3">
                    <span className="mr-1.5 inline-flex gap-0.5 align-[-2px] sm:mr-2 sm:gap-1" aria-hidden="true">
                      {Array.from({ length: TWICERUN.comparisons }, (_, i) => (
                        <span
                          key={i}
                          className={`inline-block size-3 border border-ink ${i < step.fired ? "bg-ink" : ""}`}
                          {...(i < step.fired ? { "data-ink": "box" } : {})}
                        />
                      ))}
                    </span>
                    <span className={`tabular ${note ? "text-margin" : "text-ink-soft"}`}>
                      {step.fired} of {TWICERUN.comparisons}
                    </span>
                  </td>
                  <td className="t-furniture-sm hidden py-2 text-margin sm:table-cell">
                    {note ?? ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <figcaption className="t-small mt-4 max-w-[30em] text-pencil">
        One run of five on <code className="t-code">pipelines/reference.py</code>, so four
        comparisons against the first run per step. The counts in red are where the
        result disagreed with what was planted.
      </figcaption>
    </figure>
  );
}
