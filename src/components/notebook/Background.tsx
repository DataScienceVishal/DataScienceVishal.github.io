import { ROLES, STUDY } from "../../data/career";
import { SKILLS } from "../../data/skills";
import { RouteFigure } from "./figures/RouteFigure";

/**
 * The page a CV would be: where the work moved, the roles with one outcome
 * each rather than a list of duties, the degrees, and the skills tied to where
 * they were used. Who he is, in his own words, is on page one.
 */
export function Background() {
  return (
    <section
      id="background"
      aria-labelledby="background-heading"
      className="leaf page-break scroll-mt-20 py-14 sm:py-16 lg:py-20"
    >
      <h2 id="background-heading" className="t-claim">
        Background
      </h2>

      {/* Not a following date: each role below carries its own in this margin. */}
      <p className="leaf__margin t-furniture mt-3 text-pencil lg:mt-1.5">
        <time dateTime="2018-07" className="text-margin">
          2018
        </time>{" "}
        to now
      </p>

      <RouteFigure />

      <h3 className="t-sub mt-14">Work</h3>
      <ol className="mt-4 max-w-[32em] border-b border-hair">
        {ROLES.map((role) => (
          <li key={role.org} className="margin-item">
            <div className="margin-item__body border-t border-hair py-5">
              <p>
                <span className="t-sub text-ink">{role.org}</span>
                <span className="t-small text-ink-soft">, {role.role}</span>
              </p>
              <p className="margin-item__inline t-furniture-sm mt-1 text-margin">{role.dates}</p>
              <p className="t-small mt-2 text-ink-soft">{role.outcome}</p>
            </div>
            <p className="margin-item__aside t-furniture-sm pt-6 text-margin">
              {role.dates}
            </p>
          </li>
        ))}
      </ol>

      <h3 className="t-sub mt-12">Study</h3>
      <ol className="mt-4 max-w-[32em] border-b border-hair">
        {STUDY.map((s) => (
          <li key={s.where} className="margin-item">
            <div className="margin-item__body border-t border-hair py-5">
              <p>
                <span className="t-sub text-ink">{s.degree}</span>
                <span className="t-small text-ink-soft">, {s.where}</span>
              </p>
              <p className="margin-item__inline t-furniture-sm mt-1 text-margin">{s.dates}</p>
              {s.note ? <p className="t-small mt-2 text-ink-soft">{s.note}</p> : null}
            </div>
            <p className="margin-item__aside t-furniture-sm pt-6 text-margin">
              {s.dates}
            </p>
          </li>
        ))}
      </ol>

      <h3 className="t-sub mt-12">Skills, and where each was used</h3>
      <div className="mt-5 grid max-w-[32em] gap-x-10 gap-y-7 sm:grid-cols-2">
        {SKILLS.map((group) => (
          <div key={group.area}>
            <p className="t-furniture text-pencil">{group.area}</p>
            <ul className="mt-2 space-y-1.5">
              {group.items.map((item) => (
                <li key={item.name} className="t-small">
                  <span className="text-ink">{item.name}</span>
                  <span className="text-pencil">: {item.where}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
