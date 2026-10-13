import { PROFILE } from "../../data/profile";
import { VisitReadout } from "./VisitReadout";

const out = { target: "_blank", rel: "noopener noreferrer" } as const;

/** How the page keeps itself honest, and what it is made of. */
export function Colophon() {
  return (
    <footer>
      <div className="sheet">
        <div className="leaf page-break py-12 sm:py-14">
          <h2 className="t-sub">How this page stays true</h2>
          <p className="t-small mt-3 max-w-[32em] text-ink-soft">
            Every figure above links to the file it was read from. A scheduled job in this
            site&apos;s repository re-reads those files every Monday and fails if one stops
            saying what the page says. The facts were last checked by hand on{" "}
            <time dateTime={PROFILE.checked.iso}>{PROFILE.checked.label}</time>.
          </p>

          <VisitReadout />

          <p className="t-furniture-sm mt-8 max-w-[32em] text-pencil">
            Set in Archivo and Atkinson Hyperlegible Next, both under the SIL Open Font
            License. Built with React and Vite, prerendered, and served from GitHub Pages.{" "}
            <a href={PROFILE.repo} {...out} className="text-pencil">
              Source on GitHub
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
