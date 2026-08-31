import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  heading: string;
  /** One line under the heading. Optional, and most sections do without one. */
  lede?: ReactNode;
  children: ReactNode;
  /** The featured project gets roughly twice the room of anything else. */
  size?: "default" | "feature";
}

/**
 * DESIGN.md section 4, layout. The page has one spine: a hairline running down the left of the content
 * column, with a short accent tick connecting it to each section heading. The
 * tick hangs off the heading itself rather than off the gutter, so it stays
 * aligned at any type scale. Below 1024px the gutter collapses and the tick
 * moves above the heading.
 */
export function Section({
  id,
  heading,
  lede,
  children,
  size = "default",
}: SectionProps) {
  const pad =
    size === "feature" ? "py-16 sm:py-20 lg:py-24" : "py-14 sm:py-16 lg:py-20";

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="border-t border-rule"
    >
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="lg:grid lg:grid-cols-[var(--spine-gutter)_minmax(0,1fr)]">
          <div className="relative hidden lg:block" aria-hidden="true">
            <span className="absolute top-0 right-0 h-full w-px bg-rule" />
          </div>

          <div className={`lg:pl-10 ${pad}`}>
            <span
              className="mb-6 block h-px w-8 bg-brass lg:hidden"
              aria-hidden="true"
            />
            <h2
              id={`${id}-heading`}
              className="t-display-2 relative lg:before:absolute lg:before:top-[0.62em] lg:before:right-full lg:before:h-px lg:before:w-10 lg:before:bg-brass lg:before:content-['']"
            >
              {heading}
            </h2>
            {lede ? (
              <p className="t-body mt-4 max-w-[62ch] text-read">{lede}</p>
            ) : null}
            <div className="mt-10 sm:mt-12">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
