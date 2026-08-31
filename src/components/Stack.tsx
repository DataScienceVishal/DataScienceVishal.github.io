import { STACK } from "../data/content";
import { Section } from "./Section";

/** Depth of use is encoded in the ink, not in a percentage bar. */
const TONE = ["text-bone", "text-read", "text-graphite"];

export function Stack() {
  return (
    <Section
      id="stack"
      heading="Stack"
      lede="Grouped by how much of it I have actually shipped, which is not the same as the order it appears on a CV."
    >
      <div className="divide-y divide-rule border-y border-rule">
        {STACK.map((group, i) => (
          <div
            key={group.heading}
            className="grid gap-x-10 gap-y-4 py-9 lg:grid-cols-[16rem_minmax(0,1fr)]"
          >
            <div>
              <h3 className="t-title">{group.heading}</h3>
              <p className="t-body-sm mt-1.5 max-w-[34ch] text-graphite">
                {group.qualifier}
              </p>
            </div>

            <ul
              className={`t-mono-md flex flex-wrap gap-x-5 gap-y-2 ${TONE[i]}`}
            >
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
