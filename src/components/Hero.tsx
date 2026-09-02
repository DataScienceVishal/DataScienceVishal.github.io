"use client";

import { CALL_MAILTO, CONTACT } from "../data/content";
import { CUE } from "../motion/tokens";
import { PrimaryAction, SecondaryAction } from "./Buttons";
import { HeroFigure } from "./HeroFigure";

/** Cue delay as a CSS custom property. See the cue block in index.css. */
const cue = (seconds: number) =>
  ({ "--cue-delay": `${Math.round(seconds * 1000)}ms` }) as React.CSSProperties;

/** Split so each line can be revealed on its own cue. */
const THESIS: Array<Array<{ text: string; emph?: boolean }>> = [
  [{ text: "A number nobody can" }],
  [{ text: "check", emph: true }, { text: " is not a number." }],
];

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="mx-auto max-w-[1320px] px-5 pt-12 pb-16 sm:px-8 sm:pt-14 sm:pb-20 lg:px-10 lg:pt-20 lg:pb-24"
    >
      <div className="md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,0.55fr)] md:items-center md:gap-10 lg:gap-14">
        <div>
          <h1 id="hero-heading" className="t-display-1 max-w-[17ch] text-bone">
            {THESIS.map((line, i) => (
              <span
                key={i}
                className="cue cue--reveal block"
                style={{
                  paddingBottom: "0.06em",
                  textWrap: "balance",
                  ...cue(i === 0 ? CUE.thesisLine1 : CUE.thesisLine2),
                }}
              >
                {line.map((part, j) =>
                  part.emph ? (
                    <span key={j} className="t-emph">
                      {part.text}
                    </span>
                  ) : (
                    <span key={j}>{part.text}</span>
                  ),
                )}
              </span>
            ))}
          </h1>

          <p
            className="cue t-body-lg mt-7 max-w-[42ch] text-read"
            style={cue(CUE.subtext)}
          >
            AI and ML engineer in London. Looking for an AI or ML internship
            now, full time from early 2027. No visa sponsorship needed for
            either.
          </p>

          <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            {[
              <PrimaryAction key="twin" href={CONTACT.twin} external>
                Ask the twin
              </PrimaryAction>,
              <SecondaryAction key="call" href={CALL_MAILTO}>
                Book a call
              </SecondaryAction>,
            ].map((action, i) => (
              <span
                key={i}
                className="cue"
                style={cue(CUE.actions + CUE.actionStagger * i)}
              >
                {action}
              </span>
            ))}
          </div>
        </div>

        <div
          className="cue cue--scale mt-14 flex justify-center md:mt-0 md:justify-end"
          style={cue(CUE.sentinel)}
        >
          <HeroFigure className="max-w-[13rem] sm:max-w-[16rem] lg:max-w-[20rem]" />
        </div>
      </div>
    </section>
  );
}
