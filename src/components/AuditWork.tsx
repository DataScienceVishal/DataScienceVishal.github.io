import { ArrowUpRight } from "@phosphor-icons/react";
import { TRAIL_JOINT, TWICERUN_STEPS } from "../data/charts";
import { BarChart } from "./Chart";
import { Claim } from "./Claim";
import { Section } from "./Section";

interface EntryProps {
  title: string;
  meta: string;
  href: string;
  hrefLabel: string;
  children: React.ReactNode;
  chart: React.ReactNode;
}

/**
 * The same two-column shape as Other work, with more vertical room and a
 * heading a step larger. These two sit above the coursework because they are a
 * different kind of thing, and the layout should say so without a badge.
 */
function Entry({ title, meta, href, hrefLabel, children, chart }: EntryProps) {
  return (
    <li className="grid gap-x-10 gap-y-7 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <h3 className="t-title">{title}</h3>
        <p className="t-mono-sm mt-2 text-graphite">{meta}</p>
        <div className="t-body-sm mt-5 max-w-[56ch] space-y-4 text-read">
          {children}
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="t-mono-sm mt-6 inline-flex items-center gap-1.5 text-graphite transition-[color] duration-[var(--dur-out)] ease-[var(--ease-in)] hover:text-brass hover:duration-[var(--dur-in)] hover:ease-[var(--ease-out)]"
        >
          {hrefLabel}
          <ArrowUpRight size={13} aria-hidden="true" />
          <span className="sr-only">{`, ${title}, opens in a new tab`}</span>
        </a>
      </div>

      <div className="lg:pt-1">{chart}</div>
    </li>
  );
}

export function AuditWork() {
  return (
    <Section
      id="audits"
      heading="Two things that did not survive checking"
      lede="Neither is on the resume; both were written after it. Both are public, both run their checks in CI, and both exist because a number nobody has tried to break is not evidence yet."
    >
      <ul className="divide-y divide-rule border-y border-rule">
        <Entry
          title="Auditing a published benchmark's scorer"
          meta="trail-scorer-audit, Patronus AI traces, Python, 274 tests in CI"
          href="https://github.com/DataScienceVishal/trail-scorer-audit"
          hrefLabel="Repository"
          chart={<BarChart data={TRAIL_JOINT} />}
        >
          <p>
            TRAIL is a benchmark of human-annotated agent execution traces, MIT
            licensed, whose abstract reports the best model scoring 11 percent.
            I wrote down nine properties a competent scorer should have and
            fixed them before any code existed.{" "}
            <Claim source="trail-conditions">
              Seven came back violated and two latent
            </Claim>
            .
          </p>
          <p>
            The one that matters: a predictor that never opens a span, never
            reads the gold and has no idea what an error is scores{" "}
            <Claim source="trail-repo">0.973 against 0.183</Claim> for the best
            published row, through the benchmark's own unmodified scorer. Both
            headline metrics divide by the number of errors in the answer key
            and never by the number the judge reported, so emitting an error
            everywhere is close to optimal play.
          </p>
          <p>
            Pre-registering is what makes that a finding rather than a story
            told afterwards. Six of the nine had a known direction going in, so
            what pre-registration bought was the magnitude and the contingency,
            not the sign. The audit is only possible because TRAIL's authors
            published their scorer, their gold labels and their traces. A
            benchmark that publishes a table and keeps its scoring code cannot
            be checked from outside at all.
          </p>
        </Entry>

        <Entry
          title="Catching pipeline steps that disagree with themselves"
          meta="twicerun, DuckDB, Python, 331 tests in CI"
          href="https://github.com/DataScienceVishal/twicerun"
          hrefLabel="Repository"
          chart={<BarChart data={TWICERUN_STEPS} />}
        >
          <p>
            Run a batch pipeline several times on one input and report, per
            step, how often it failed to give the same answer. Running it five
            times is the easy half.{" "}
            <Claim source="twicerun-repo">
              Deciding whether two outputs are the same answer
            </Claim>{" "}
            is the project: DuckDB adds the terms of a parallel sum in whatever
            order the threads finish in, float addition is not associative, and
            so a plain two-run diff reports hundreds of findings on correct
            code.
          </p>
          <p>
            On the reference pipeline it separates the five steps that diverged
            from the three that did not, then re-runs each divergent step at one
            thread to say whether the thread count was the explanation or
            whether something else is going on. It stops there rather than
            guessing between a clock read, a data-dependent branch and appended
            state.
          </p>
          <p>
            The part I care about is what it refuses to say. A step that agreed
            with itself every time is reported as stable on this input, not as
            correct, and{" "}
            <Claim source="twicerun-run">
              one such step is a planted bug that only moves once the input is
              stressed
            </Claim>
            . Where four clean comparisons are all the evidence there is, it
            prints the bound they support, a per-comparison divergence rate no
            higher than 53 percent, rather than a green tick.
          </p>
        </Entry>
      </ul>
    </Section>
  );
}
