"use client";

import { ArrowUpRight } from "@phosphor-icons/react";
import { m, useReducedMotion } from "motion/react";
import { CONTACT, NAV_LINKS } from "../data/content";
import { CUE, HOVER_IN, HOVER_OUT, enter } from "../motion/tokens";

/**
 * A plain text bar. The twin link is a link, not an outlined button: this page
 * is not converting anybody, and a styled CTA in the nav is the marketing
 * register the brief rules out.
 */
export function Nav() {
  const reduce = useReducedMotion();

  return (
    <m.header
      className="sticky top-0 z-50 border-b border-rule bg-void"
      initial={reduce ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={enter(CUE.nav)}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8 lg:h-[4.5rem] lg:px-10"
      >
        <a
          href="#top"
          className="t-brand text-bone"
        >
          {CONTACT.name}
        </a>

        <div className="flex items-center gap-2 lg:gap-5">
          <ul className="hidden items-center gap-5 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <m.a
                  href={link.href}
                  className="t-ui block py-2"
                  initial={false}
                  animate={{ color: "var(--color-graphite)" }}
                  whileHover={{
                    color: "var(--color-bone)",
                    transition: HOVER_IN,
                  }}
                  transition={HOVER_OUT}
                >
                  {link.label}
                </m.a>
              </li>
            ))}
          </ul>

          <m.a
            href={CONTACT.twin}
            target="_blank"
            rel="noopener noreferrer"
            className="t-ui inline-flex items-center gap-1.5 py-2 whitespace-nowrap md:border-l md:border-rule md:pl-5"
            initial={false}
            animate={{ color: "var(--color-brass)" }}
            whileHover={{ color: "var(--color-bone)", transition: HOVER_IN }}
            transition={HOVER_OUT}
          >
            Ask the twin
            <ArrowUpRight size={13} aria-hidden="true" />
          </m.a>
        </div>
      </nav>
    </m.header>
  );
}
