import { ArrowUpRight } from "@phosphor-icons/react";
import type { Entry, FigureKind } from "../../data/entries";
import { SOURCES } from "../../data/sources";
import { LesionScale } from "./figures/LesionScale";
import { RetrievalPath } from "./figures/RetrievalPath";
import { TrailScale } from "./figures/TrailScale";
import { TwicerunSteps } from "./figures/TwicerunSteps";
import { Plate } from "./Plate";
import { Working } from "./Working";

const FIGURES: Record<FigureKind, () => React.ReactElement> = {
  trail: TrailScale,
  twicerun: TwicerunSteps,
  lesion: LesionScale,
  retrieval: RetrievalPath,
};

const out = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Wraps a field's marked phrase in a highlighter stroke. See Field.mark. */
function marked(detail: string, mark?: string) {
  if (!mark) return detail;
  const at = detail.indexOf(mark);
  if (at < 0) throw new Error(`entries.ts: the mark "${mark}" is not in its field`);
  return (
    <>
      {detail.slice(0, at)}
      <mark className="hl">{mark}</mark>
      {detail.slice(at + mark.length)}
    </>
  );
}

/**
 * One notebook entry. The claim is the heading; the date and the project's
 * name sit in the margin beside it from lg up, and under it on a phone, where
 * putting them above would make them an eyebrow.
 */
export function EntryLeaf({ entry }: { entry: Entry }) {
  const Figure = FIGURES[entry.figure];
  const external = (href: string) => href.startsWith("http");

  return (
    <article
      id={entry.id}
      aria-labelledby={`${entry.id}-claim`}
      className={`leaf page-break scroll-mt-20 pt-12 pb-14 sm:pt-14 sm:pb-16 lg:pt-9 lg:pb-20 ${entry.plate ? "leaf--plate" : ""}`}
    >
      <h2 id={`${entry.id}-claim`} className="t-claim max-w-[30ch]">
        {entry.claim}
      </h2>

      <p className="leaf__margin leaf__margin--follow t-furniture mt-3 text-pencil lg:mt-1.5">
        <time dateTime={entry.started.iso} className="text-margin lg:block">
          {entry.started.label}
        </time>
        <span className="lg:hidden">, </span>
        <span className="lg:mt-1 lg:block">{entry.name}</span>
      </p>

      <Figure />

      <dl className="mt-9 grid max-w-[32em] gap-y-5">
        {entry.fields.map((field) => (
          <div key={field.term}>
            <dt className="t-furniture text-pencil">{field.term}</dt>
            <dd className="t-body mt-1 text-ink">{marked(field.detail, field.mark)}</dd>
          </div>
        ))}
      </dl>

      <p className="t-body mt-8 max-w-[32em] text-ink-soft">{entry.context}</p>

      <Working {...entry.working} />

      <div className="t-furniture mt-7 flex flex-wrap items-center gap-x-6 gap-y-2">
        {entry.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            {...(external(link.href) ? out : {})}
            className="inline-flex items-center gap-1 text-ink"
          >
            {link.label}
            {external(link.href) ? <ArrowUpRight size={14} aria-hidden="true" /> : null}
            {external(link.href) ? (
              <span className="sr-only">, {entry.name}, opens in a new tab</span>
            ) : null}
          </a>
        ))}
      </div>

      <p className="t-furniture-sm mt-4 max-w-[32em] text-pencil">
        Figures read from{" "}
        {entry.sources.map((id, i) => (
          <span key={id}>
            {i > 0 ? (i === entry.sources.length - 1 ? " and " : ", ") : null}
            <a href={SOURCES[id].href} {...(external(SOURCES[id].href) ? out : {})} className="text-pencil">
              {SOURCES[id].label}
            </a>
          </span>
        ))}
        .
      </p>

      {entry.plate ? (
        <div className="leaf__plate mt-12 max-w-[21rem] xl:mt-1">
          <Plate id={entry.plate} tilt="left" />
        </div>
      ) : null}
    </article>
  );
}
