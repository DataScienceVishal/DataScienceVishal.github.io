import { DEADPAN } from "../../../data/figures";

/**
 * The pilot's twelve re-voted meetings, three ways. Every meeting is voted by
 * the LLM players as recorded, then again by rule-based detectives and by
 * random voters given the same views, with the wrecker's own vote kept. Each
 * count sits on a 0 to 12 track of meetings, so the six marks share one scale.
 * All six are measured, so all six marks are red; which table a mark belongs
 * to is carried by its row label, never by its colour.
 */
const OF = DEADPAN.revoted;
const COLUMNS = [
  { key: "wrecker", label: "Wrecker sent ashore" },
  { key: "keeper", label: "Innocent keeper sent ashore" },
] as const;

const say = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

function Track({ value }: { value: number }) {
  return (
    <span className="grid w-full grid-cols-[minmax(0,1fr)_2.25rem] items-center gap-2" aria-hidden="true">
      <span className="relative mx-1.5 h-5">
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink" data-ink="rule-x" />
        {Array.from({ length: OF + 1 }, (_, i) => (
          <span
            key={i}
            className={`absolute top-1/2 w-px -translate-x-1/2 bg-pencil ${i % 6 === 0 ? "h-3 -translate-y-1/2" : "h-1.5 -translate-y-1/2"}`}
            style={{ left: `${(i / OF) * 100}%` }}
            data-ink="drop"
          />
        ))}
        <span
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-margin ring-[3px] ring-paper"
          style={{ left: `${(value / OF) * 100}%` }}
          data-ink="node"
        />
      </span>
      <span className="t-furniture text-right text-margin" style={{ fontWeight: 650 }}>
        {say(value)}
      </span>
    </span>
  );
}

export function RevoteTable() {
  return (
    <figure className="mt-7 max-w-[46rem]" data-ink-figure="">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Who each table sent ashore in the {OF} re-voted pilot meetings.
        </caption>
        <thead className="hidden sm:table-header-group">
          <tr className="t-furniture-sm border-b-2 border-ink text-pencil">
            <th scope="col" className="py-2 pr-3 font-normal">
              <span className="sr-only">Who voted</span>
            </th>
            {COLUMNS.map((c) => (
              <th key={c.key} scope="col" className="py-2 pr-3 font-normal">
                {c.label}, of {OF}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DEADPAN.tables.map((row, r) => (
            <tr
              key={row.name}
              className="grid grid-cols-1 border-b border-hair py-2.5 first:border-t-2 first:border-t-ink sm:table-row sm:py-0 sm:first:border-t-0"
            >
              <th scope="row" className="block pr-3 text-left font-normal sm:table-cell sm:w-[12rem] sm:py-2.5">
                <span className="t-sub block text-ink" style={r === 0 ? undefined : { fontWeight: 560 }}>
                  {row.name}
                </span>
                <span className="t-furniture-sm block text-pencil">{row.detail}</span>
              </th>
              {COLUMNS.map((c) => (
                <td key={c.key} className="block pt-1.5 pr-1 sm:table-cell sm:py-2.5 sm:pr-3">
                  <span className="t-furniture-sm block text-pencil sm:hidden">{c.label}</span>
                  <span className="sr-only">
                    {say(row[c.key])} of {OF}
                  </span>
                  <Track value={row[c.key]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption className="t-small mt-4 max-w-[30em] text-pencil">
        The {OF} pilot meetings that kept their recorded turns, each voted three ways
        on the same evidence. The wrecker&apos;s own vote is kept in all three. Random
        voters are their exact expectation, so they land between whole meetings.
      </figcaption>
    </figure>
  );
}
