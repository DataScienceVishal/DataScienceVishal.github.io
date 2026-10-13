import { BANDS, ROLES, SPAN, STUDY } from "../../../data/career";

const x = (year: number) => ((year - SPAN.start) / (SPAN.end - SPAN.start)) * 100;
const span = (from: number, to: number) => ({
  left: `${x(from).toFixed(2)}%`,
  width: `${(x(to) - x(from)).toFixed(2)}%`,
});
const YEARS = [2019, 2021, 2023, 2025, 2027];

/** The MSc is where the work became models, so it is drawn on that band too. */
const NOW = STUDY[0];

/**
 * Where the work moved, drawn from the same records the list below prints. The
 * bands are what the work was rather than what the job was called, so there is
 * no numeric axis that would pretend a career is a quantity. Dates are exact.
 */
export function RouteFigure() {
  const top = [...BANDS].reverse();

  return (
    <figure className="mt-10 max-w-[46rem]" data-ink-figure="">
      <div aria-hidden="true">
        {top.map((band) => (
          <div
            key={band}
            className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center border-b border-hair"
          >
            <span className="t-furniture-sm py-1.5 text-pencil">{band}</span>
            <span className="relative block h-7">
              {ROLES.filter((r) => r.band === band).map((r) => (
                <span
                  key={r.org}
                  className="absolute top-2 h-3 bg-ink"
                  style={span(r.from, r.to)}
                  data-ink="rule-x"
                />
              ))}
              {band === "Models" ? (
                <span
                  className="absolute top-2 h-3 bg-margin"
                  style={span(NOW.from, NOW.to)}
                  data-ink="rule-x"
                />
              ) : null}
            </span>
          </div>
        ))}
        <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center">
          <span className="t-furniture-sm py-1.5 text-pencil">Study</span>
          <span className="relative block h-7">
            {STUDY.map((s) => (
              <span
                key={s.where}
                className="absolute top-2.5 h-2 border border-pencil"
                style={span(s.from, s.to)}
                data-ink="rule-x"
              />
            ))}
          </span>
        </div>
        <div className="grid grid-cols-[5.5rem_minmax(0,1fr)]">
          <span />
          <span className="t-furniture-sm relative block h-5 text-pencil">
            {YEARS.map((year) => (
              <span
                key={year}
                className="absolute -translate-x-1/2"
                style={{ left: `${x(year).toFixed(2)}%` }}
              >
                {year}
              </span>
            ))}
          </span>
        </div>
      </div>
      <figcaption className="t-small mt-4 max-w-[30em] text-pencil">
        Where the work moved, 2018 to 2027: filings, then reporting, then pipelines, then
        the MSc in red. Study ran alongside the work, the outlined bars underneath. Every
        span is drawn from the dates listed below.
      </figcaption>
    </figure>
  );
}
