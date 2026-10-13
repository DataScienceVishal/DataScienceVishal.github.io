import { ArrowUpRight } from "@phosphor-icons/react";
import { EARLIER, IN_PROGRESS } from "../../data/entries";
import { Plate } from "./Plate";

const out = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Open work. A start date and one line each, and no result, because there is none yet. */
export function InProgress() {
  return (
    <section
      id="in-progress"
      aria-labelledby="in-progress-heading"
      className="leaf page-break py-14 sm:py-16"
    >
      <h2 id="in-progress-heading" className="t-claim">
        In progress
      </h2>
      <ul className="mt-8 grid max-w-[32em] gap-y-7">
        {IN_PROGRESS.map((item) => (
          <li key={item.name} className="margin-item">
            <div className="margin-item__body">
              <h3 className="t-sub">
                <a href={item.href} {...out} className="inline-flex items-center gap-1 text-ink">
                  {item.name}
                  <ArrowUpRight size={14} aria-hidden="true" />
                  <span className="sr-only">, opens in a new tab</span>
                </a>
              </h3>
              <p className="margin-item__inline t-furniture-sm mt-1 text-pencil">
                Started{" "}
                <time dateTime={item.started.iso} className="text-margin">
                  {item.started.label}
                </time>
              </p>
              <p className="t-body mt-2 text-ink-soft">{item.line}</p>
            </div>
            <p className="margin-item__aside t-furniture pt-0.5 text-pencil">
              <span className="block">Started</span>
              <span className="block text-margin">{item.started.label}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Older and smaller work, shorter than the entries and honest about it. */
export function Earlier() {
  return (
    <section
      id="earlier"
      aria-labelledby="earlier-heading"
      className="leaf leaf--plate page-break py-14 sm:py-16"
    >
      <h2 id="earlier-heading" className="t-claim">
        Earlier work
      </h2>
      <ul className="mt-8 grid max-w-[32em] border-b border-hair">
        {EARLIER.map((item) => (
          <li key={item.title} className="margin-item">
            <div className="margin-item__body border-t border-hair py-5">
              <h3 className="t-sub">
                <a href={item.href} {...out} className="inline-flex items-center gap-1 text-ink">
                  {item.title}
                  <ArrowUpRight size={14} aria-hidden="true" />
                  <span className="sr-only">, opens in a new tab</span>
                </a>
              </h3>
              <p className="margin-item__inline t-furniture-sm mt-1 text-margin">{item.year}</p>
              <p className="t-small mt-2 text-ink-soft">{item.line}</p>
            </div>
            <p className="margin-item__aside t-furniture pt-5.5 text-margin">
              {item.year}
            </p>
          </li>
        ))}
      </ul>
      <div className="leaf__plate mt-12 max-w-[21rem] xl:mt-1">
        <Plate id="chess" />
      </div>
    </section>
  );
}
