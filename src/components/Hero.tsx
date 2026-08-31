"use client";

import { m } from "motion/react";
import { CALL_MAILTO, CONTACT } from "../data/content";
import { CUE, enter } from "../motion/tokens";
import { PrimaryAction, SecondaryAction } from "./Buttons";
import { HeroFigure } from "./HeroFigure";
import { useReduceMotion } from "../motion/reduce";

/** Split so each line can be revealed on its own cue. */
const THESIS: Array<Array<{ text: string; emph?: boolean }>> = [
  [{ text: "A number nobody can" }],
  [{ text: "check", emph: true }, { text: " is not a number." }],
];

export function Hero() {
  const reduce = useReduceMotion();

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
              <m.span
                key={i}
                className="block"
                initial={
                  reduce
                    ? false
                    : { opacity: 0, y: 16, clipPath: "inset(100% 0 0 0)" }
                }
                animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" }}
                transition={enter(i === 0 ? CUE.thesisLine1 : CUE.thesisLine2)}
                style={{ paddingBottom: "0.06em", textWrap: "balance" }}
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
              </m.span>
            ))}
          </h1>

          <m.p
            className="t-body-lg mt-7 max-w-[42ch] text-read"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={enter(CUE.subtext)}
          >
            AI and ML engineer in London. Looking for an AI or ML internship
            now, full time from January 2027.
          </m.p>

          <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            {[
              <PrimaryAction key="twin" href={CONTACT.twin} external>
                Ask the twin
              </PrimaryAction>,
              <SecondaryAction key="call" href={CALL_MAILTO}>
                Book a call
              </SecondaryAction>,
            ].map((action, i) => (
              <m.span
                key={i}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={enter(CUE.actions + CUE.actionStagger * i)}
              >
                {action}
              </m.span>
            ))}
          </div>
        </div>

        <m.div
          className="mt-14 flex justify-center md:mt-0 md:justify-end"
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={enter(CUE.sentinel)}
        >
          <HeroFigure className="max-w-[13rem] sm:max-w-[16rem] lg:max-w-[20rem]" />
        </m.div>
      </div>
    </section>
  );
}
