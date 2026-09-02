import { ArrowUpRight } from "@phosphor-icons/react";
import { SOURCES, SOURCE_ORDER } from "../data/sources";
import { CONTACT } from "../data/content";

/**
 * The reference list the markers point into. Sources without a public URL are
 * listed with the reason, which is the whole point of numbering them.
 */
/**
 * One model credit. CC BY 4.0 asks for the creator, the title, a link to the
 * material and a link to the licence, so all four are here and all four are
 * links. The page previously credited "Sketchfab", which is where the files
 * were downloaded from rather than who made them; the authors were sitting in
 * each file's own glTF `asset.extras` the whole time.
 */
function Credit({
  href,
  title,
  by,
  byHref,
}: {
  href: string;
  title: string;
  by: string;
  byHref?: string;
}) {
  const out = { target: "_blank", rel: "noopener noreferrer" } as const;
  return (
    <>
      <a href={href} className="credit-link" {...out}>
        {title}
      </a>{" "}
      by{" "}
      {byHref ? (
        <a href={byHref} className="credit-link" {...out}>
          {by}
        </a>
      ) : (
        by
      )}
      ,{" "}
      <a
        href="https://creativecommons.org/licenses/by/4.0/"
        className="credit-link"
        {...out}
      >
        CC BY 4.0
      </a>
      .
    </>
  );
}

export function References() {
  return (
    <footer id="references" className="border-t border-rule">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="lg:grid lg:grid-cols-[var(--spine-gutter)_minmax(0,1fr)]">
          <div className="relative hidden lg:block" aria-hidden="true">
            <span className="absolute top-0 right-0 h-full w-px bg-rule" />
          </div>

          <div className="py-16 lg:py-20 lg:pl-10">
            <h2 id="references-heading" className="t-display-3">
              Sources
            </h2>
            <p className="t-body-sm mt-3 max-w-[62ch] text-graphite">
              Every marked claim above points at one of these. Two of them are
              not public, and say so.
            </p>

            <ol className="mt-8 divide-y divide-rule border-t border-rule">
              {SOURCE_ORDER.map((id) => {
                const source = SOURCES[id];
                const external =
                  source.href !== null && source.href.startsWith("http");
                return (
                  <li
                    key={id}
                    id={`ref-${source.n}`}
                    className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4 py-4 scroll-mt-28"
                  >
                    <span className="t-mono-sm text-graphite">{source.n}</span>
                    <div>
                      {source.href !== null ? (
                        <a
                          href={source.href}
                          {...(external
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                          className="t-body-sm inline-flex items-baseline gap-1.5 text-bone underline decoration-rule decoration-1 underline-offset-4 transition-[color,text-decoration-color] duration-[var(--dur-out)] ease-[var(--ease-in)] hover:text-brass hover:decoration-brass hover:duration-[var(--dur-in)] hover:ease-[var(--ease-out)]"
                        >
                          {source.full}
                          {external ? (
                            <ArrowUpRight
                              size={12}
                              className="shrink-0"
                              aria-hidden="true"
                            />
                          ) : null}
                        </a>
                      ) : (
                        <p className="t-body-sm text-bone">{source.full}</p>
                      )}
                      {source.note ? (
                        <p className="t-mono-xs mt-1 text-graphite">
                          {source.note}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>

            {/*
              The hero figure has no caption to carry its credit, so the credit
              lives here. Worth keeping honest: none of the three models are
              his, and two of them are only on the page because someone else
              sculpted them.
            */}
            <p className="t-mono-sm mt-12 max-w-[62ch] text-graphite">
              Models, all three CC BY 4.0 and all three recompressed and
              retinted for this page.{" "}
              <Credit
                href="https://sketchfab.com/3d-models/robot-girl-with-hair-wires-ccaa2e655374415c84bc1bb1b177681a"
                title="Robot girl with hair wires"
                by="GR-video"
                byHref="https://sketchfab.com/grvideotv"
              />{" "}
              <Credit
                href="https://sketchfab.com/3d-models/neural-networks-of-the-brain-fa48173d4532407c9c2a4ba06a9bcd2d"
                title="Neural Networks of the Brain"
                by="Universal Design for Learning"
                byHref="https://sketchfab.com/UDL"
              />{" "}
              <Credit
                href="https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/ABeautifulGame"
                title="A Beautiful Game"
                by="Moeen Sayed and Mujtaba Sayed, glTF conversion by Ed Mackey"
              />
            </p>

            <p className="t-mono-sm mt-4 text-graphite">
              {CONTACT.name}, London. Static site, built with React and Vite,
              deployed on GitHub Pages.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
