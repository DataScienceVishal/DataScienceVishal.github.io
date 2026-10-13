import { CONTENTS, PROFILE } from "../../data/profile";
import { ThemeToggle } from "./ThemeToggle";

/**
 * The notebook's contents row, which is also the navigation. Sticky from lg up,
 * where it is one line; on a phone it wraps under the name and scrolls away,
 * because a two-line bar pinned to a small screen costs more than it saves.
 */
export function Contents() {
  return (
    <header className="z-40 border-b-2 border-ink bg-paper lg:sticky lg:top-0">
      <div className="mx-auto flex max-w-[var(--page-max)] flex-wrap items-center gap-x-6 gap-y-3 px-[var(--gutter)] py-3 lg:h-16 lg:flex-nowrap lg:py-0">
        <a
          href="#top"
          className="t-sub text-ink no-underline"
          style={{ fontWeight: 720 }}
        >
          {PROFILE.name}
        </a>

        <div className="ml-auto lg:order-last lg:ml-0">
          <ThemeToggle />
        </div>

        <nav aria-label="Contents" className="w-full lg:ml-auto lg:w-auto">
          <ol className="t-furniture flex flex-wrap gap-x-5 gap-y-1.5">
            {CONTENTS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-ink-soft no-underline hover:text-ink hover:underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </header>
  );
}
