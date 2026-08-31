"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Warning } from "@phosphor-icons/react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { CONTACT, TWIN_QUESTIONS } from "../data/content";
import { HOVER_IN, HOVER_OUT, MOVE } from "../motion/tokens";
import { PrimaryAction } from "./Buttons";
import { ModelViewport } from "./ModelViewport";

type CopyState = { index: number; ok: boolean } | null;

/**
 * Openers as small, quiet, equal-weight controls rather than a styled CTA block.
 * The confirmation slot is always in the layout, so acknowledging a copy never
 * shoves the grid row below it; the message itself animates in and out.
 */
export function AskTheTwin() {
  const [copied, setCopied] = useState<CopyState>(null);
  const timer = useRef<number | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  const flash = useCallback((index: number, ok: boolean) => {
    setCopied({ index, ok });
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), 2400);
  }, []);

  const handleCopy = useCallback(
    async (question: string, index: number) => {
      try {
        if (!navigator.clipboard) throw new Error("clipboard unavailable");
        await navigator.clipboard.writeText(question);
        flash(index, true);
      } catch {
        // Clipboard is blocked in some embedded and non-secure contexts. Say so
        // rather than pretending the copy worked.
        flash(index, false);
      }
    },
    [flash],
  );

  return (
    <section
      id="ask"
      aria-labelledby="ask-heading"
      className="border-t border-rule bg-slab"
    >
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="lg:grid lg:grid-cols-[var(--spine-gutter)_minmax(0,1fr)]">
          <div className="relative hidden lg:block" aria-hidden="true">
            <span className="absolute top-0 right-0 h-full w-px bg-rule" />
          </div>

          <div className="py-20 lg:py-24 lg:pl-10">
            <span
              className="mb-6 block h-px w-8 bg-brass lg:hidden"
              aria-hidden="true"
            />
            <h2
              id="ask-heading"
              className="t-display-2 relative lg:before:absolute lg:before:top-[0.62em] lg:before:right-full lg:before:h-px lg:before:w-10 lg:before:bg-brass lg:before:content-['']"
            >
              Ask it something
            </h2>

            <p className="t-body mt-4 max-w-[62ch] text-read">
              It answers from the same knowledge base this page cites, and
              declines when the evidence is not there. Pick a question to copy
              it, then open the twin and paste.
            </p>

            <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.62fr)] lg:items-start lg:gap-14">
              <div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {TWIN_QUESTIONS.map((question, index) => {
                    const state = copied?.index === index ? copied : null;
                    return (
                      <li key={question}>
                        <m.button
                          type="button"
                          onClick={() => handleCopy(question, index)}
                          className="flex w-full items-start justify-between gap-4 border bg-void px-4 py-4 text-left"
                          style={{ borderRadius: "var(--radius-md)" }}
                          initial={false}
                          animate={{ borderColor: "var(--color-rule)" }}
                          whileHover={
                            reduce
                              ? undefined
                              : {
                                  y: -1,
                                  borderColor: "var(--color-graphite)",
                                  boxShadow: "var(--shadow-raise)",
                                  transition: HOVER_IN,
                                }
                          }
                          whileTap={reduce ? undefined : { y: 0 }}
                          transition={HOVER_OUT}
                        >
                          <span className="t-body text-bone">{question}</span>
                          <span
                            className="mt-0.5 shrink-0 text-graphite"
                            aria-hidden="true"
                          >
                            {state === null ? (
                              <Copy size={16} />
                            ) : state.ok ? (
                              <Check size={16} />
                            ) : (
                              <Warning size={16} />
                            )}
                          </span>
                        </m.button>

                        {/* Fixed-height slot: the row below never moves. */}
                        <div className="h-4 pt-2">
                          <AnimatePresence mode="wait">
                            {state !== null ? (
                              <m.p
                                key={state.ok ? "ok" : "fail"}
                                className={`t-mono-xs ${state.ok ? "text-brass" : "text-read"}`}
                                initial={reduce ? false : { opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={reduce ? {} : { opacity: 0, y: -4 }}
                                transition={MOVE}
                              >
                                {state.ok
                                  ? "Copied. Paste it in the twin."
                                  : "Copy blocked. Select it instead."}
                              </m.p>
                            ) : null}
                          </AnimatePresence>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <PrimaryAction href={CONTACT.twin} external>
                    Ask the twin
                  </PrimaryAction>
                  <p className="t-mono-sm text-graphite">
                    Opens in a new tab. No signup.
                  </p>
                </div>
              </div>

              <ModelViewport
                scene={{
                  kind: "gltf",
                  url: "/models/brain.glb",
                  spin: {
                    turns: 0.5,
                    tilt: 0.16,
                    baseY: -0.35,
                    baseX: 0.08,
                    scale: 1.1,
                    lift: 0,
                  },
                  tone: "metal",
                }}
                height="clamp(13rem, 30vw, 17rem)"
                alt="White matter tracts of a human brain rendered in three dimensions, turning as the page scrolls and leaning toward the pointer."
                caption="Tractography, not a metaphor. The twin is a retriever over about forty documents, which is nothing like this."
                credit={
                  <>
                    Model: Neural Networks of the Brain, from Sketchfab.
                    Compressed from 1.79 MB to 78 KB with Draco geometry.
                  </>
                }
              />
            </div>

            <p aria-live="polite" className="sr-only">
              {copied === null
                ? ""
                : copied.ok
                  ? "Question copied to the clipboard."
                  : "Copy was blocked. Select the question and copy it by hand."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
