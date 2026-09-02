import { ArrowRight } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { CareerGraph } from "./CareerGraph";
import { Claim } from "./Claim";
import { Section } from "./Section";

interface Entry {
  n: string;
  employer: string;
  role: string;
  dates: string;
  movement: ReactNode;
  /** What the next role inherited. Ledger language, because the structure is one. */
  carried?: string;
}

const ENTRIES: Entry[] = [
  {
    n: "01",
    employer: "PJRJ Associates",
    role: "Finance, accounts and taxation",
    dates: "Jul 2018 to Sep 2020",
    movement: (
      <>
        Two years of GST filings, income tax returns and audits. Every figure
        had to survive somebody checking it months later, which is a useful
        thing to learn before you learn anything else.
      </>
    ),
    carried: "a low tolerance for figures nobody can trace",
  },
  {
    n: "02",
    employer: "Aryan Care Pvt. Ltd.",
    role: "E-commerce and finance executive",
    dates: "Jan 2021 to Aug 2021",
    movement: (
      <>
        Still filings, now sitting beside an e-commerce operation. First time I
        was looking at sales data rather than a tax return, and the first time
        the question was what the data meant rather than whether it balanced.
      </>
    ),
    carried: "data as something to interrogate, not just to file",
  },
  {
    n: "03",
    employer: "Avant Garde Clean Room and Engg. Solutions",
    role: "Executive",
    dates: "Aug 2021 to Dec 2023",
    movement: (
      <>
        Built ML sales forecasting models reaching{" "}
        <Claim source="resume">80 to 90% accuracy</Claim> on monthly revenue
        projections, used daily for commercial planning. Rebuilt revenue and
        collections reporting in Excel with formulas, macros and VBA, cutting{" "}
        <Claim source="resume">
          monthly reporting from about two hours to about thirty minutes
        </Claim>
        . The forecasting was harder. The reporting rebuild was what people
        noticed.
      </>
    ),
    carried:
      "a model is only as useful as the reporting that survives around it",
  },
  {
    n: "04",
    employer: "Teleperformance Global Business",
    role: "Data Engineer",
    dates: "Jun 2024 to Jan 2026",
    movement: (
      <>
        Databricks pipelines over{" "}
        <Claim source="resume">millions of telecom records</Claim>, call detail,
        billing and agent performance, feeding a data engineering team of 50 or
        more across regions. Migrated on-prem SQL Server schemas to Databricks,{" "}
        <Claim source="resume">
          improving query performance by about 20% and cutting infrastructure
          cost by about 20%
        </Claim>
        . A year and a half of pipelines before I got near a model. That turned
        out to be the part that mattered.
      </>
    ),
  },
];

function Row({ entry }: { entry: Entry }) {
  return (
    <>
      <div className="py-8 lg:grid lg:grid-cols-[2.5rem_minmax(0,0.9fr)_minmax(0,1.6fr)_9.5rem] lg:gap-x-6">
        {/* Phone: the entry number and its dates sit on one line, the way a
            statement row is headed. Both are repeated as grid cells from lg up. */}
        <div
          className="flex items-baseline justify-between gap-4 lg:hidden"
          aria-hidden="true"
        >
          <span className="t-mono-md text-graphite">{entry.n}</span>
          <span className="t-mono-sm whitespace-nowrap text-graphite">
            {entry.dates}
          </span>
        </div>

        <div
          className="t-mono-md hidden text-graphite lg:block lg:pt-1"
          aria-hidden="true"
        >
          {entry.n}
        </div>

        <div className="mt-5 lg:mt-0 lg:pt-0.5">
          <h3 className="t-title">
            <span className="sr-only">{`Entry ${entry.n}, ${entry.dates}. `}</span>
            {entry.employer}
          </h3>
          <p className="t-body mt-1.5 text-read">{entry.role}</p>
        </div>

        <p className="t-body mt-5 max-w-[62ch] text-read lg:mt-0 lg:border-l lg:border-rule lg:pl-6">
          {entry.movement}
        </p>

        <p className="t-mono-sm hidden whitespace-nowrap text-graphite lg:block lg:pt-1 lg:text-right">
          {entry.dates}
        </p>
      </div>

      {entry.carried ? (
        <p className="t-mono-xs border-t border-rule py-4 text-graphite lg:pl-[3.4rem]">
          carried forward{" "}
          {/*
            Drawn, not typed. U+2192 is outside the font subset and is not in
            the source families either, so the character rendered in whatever
            system mono the browser fell back to: a different face, mid-line,
            in the accent colour, three times on the page.
          */}
          <ArrowRight
            size={11}
            weight="bold"
            aria-hidden="true"
            className="mx-1.5 inline-block shrink-0 align-[-0.05em] text-brass"
          />
          <span className="text-read">{entry.carried}</span>
        </p>
      ) : null}
    </>
  );
}

export function Trajectory() {
  return (
    <Section
      id="trajectory"
      heading="Trajectory"
      lede="A Bachelor of Commerce, four jobs, and no computer science degree until 2027 at the earliest. The transitions are what this section is about."
    >
      <div className="mb-16 lg:mb-20">
        <CareerGraph />
      </div>

      <div className="divide-y divide-rule border-y border-rule">
        {ENTRIES.map((entry) => (
          <Row key={entry.n} entry={entry} />
        ))}

        <div className="py-8 lg:grid lg:grid-cols-[2.5rem_minmax(0,0.9fr)_minmax(0,1.6fr)_9.5rem] lg:gap-x-6">
          <div
            className="flex items-baseline justify-between gap-4 lg:hidden"
            aria-hidden="true"
          >
            <span className="mt-2 block h-px w-4 bg-brass" />
            <span className="t-mono-sm whitespace-nowrap text-graphite">
              Jan 2026 to Jan 2027
            </span>
          </div>

          <div className="hidden lg:block lg:pt-1.5" aria-hidden="true">
            <span className="block h-px w-4 bg-brass" />
          </div>

          <div className="mt-5 lg:mt-0 lg:pt-0.5">
            <h3 className="t-title">Northeastern University London</h3>
            <p className="t-body mt-1.5 text-read">
              MSc, AI and Computer Science
            </p>
          </div>

          <p className="t-body mt-5 max-w-[62ch] text-read lg:mt-0 lg:border-l lg:border-rule lg:pl-6">
            Agent reliability, mostly. Grounding, refusal behaviour, and what
            happens when retrieved text cannot be trusted. The twin is where the
            ideas get tested before they are written up.
          </p>

          <p className="t-mono-sm hidden whitespace-nowrap text-graphite lg:block lg:pt-1 lg:text-right">
            Jan 2026 to Jan 2027
          </p>
        </div>
      </div>
    </Section>
  );
}
