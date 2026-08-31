"use client";

import {
  EnvelopeSimple,
  GithubLogo,
  LinkedinLogo,
} from "@phosphor-icons/react";
import { m, useReducedMotion } from "motion/react";
import { CALL_MAILTO, CONTACT, STATUS } from "../data/content";
import { usePointerField, useSpotlight } from "../motion/pointer";
import { HOVER_IN, HOVER_OUT } from "../motion/tokens";
import { PrimaryAction } from "./Buttons";
import { Section } from "./Section";

const CHANNELS = [
  {
    Icon: EnvelopeSimple,
    label: "Email",
    value: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
    external: false,
  },
  {
    Icon: GithubLogo,
    label: "GitHub",
    value: CONTACT.githubHandle,
    href: CONTACT.github,
    external: true,
  },
  {
    Icon: LinkedinLogo,
    label: "LinkedIn",
    value: CONTACT.linkedinHandle,
    href: CONTACT.linkedin,
    external: true,
  },
] as const;

/** One row, with a brass highlight that follows the pointer along it. */
function Channel({
  Icon,
  label,
  value,
  href,
  external,
  reduce,
}: {
  Icon: typeof EnvelopeSimple;
  label: string;
  value: string;
  href: string;
  external: boolean;
  reduce: boolean;
}) {
  const field = usePointerField();
  const spotlight = useSpotlight(field, 200);

  return (
    <li className="relative">
      <m.a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        onPointerMove={field.onPointerMove}
        onPointerLeave={field.onPointerLeave}
        className="relative flex items-center gap-4 py-5"
        initial={false}
        animate={{ color: "var(--color-bone)" }}
        whileHover={
          reduce
            ? undefined
            : { color: "var(--color-brass)", transition: HOVER_IN }
        }
        transition={HOVER_OUT}
      >
        <m.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[-0.5rem] inset-y-0"
          style={{
            borderRadius: "var(--radius-md)",
            background: field.reduce ? "none" : spotlight,
          }}
        />
        <Icon size={18} className="relative shrink-0" aria-hidden="true" />
        <span className="t-mono-sm relative min-w-[4rem] text-graphite sm:min-w-[5.5rem]">
          {label}
        </span>
        <span className="t-body relative">{value}</span>
      </m.a>
    </li>
  );
}

export function Contact() {
  const reduce = useReducedMotion();

  return (
    <Section
      id="contact"
      heading="Contact"
      lede="Email gets read the same day. A call is fifteen minutes, and I will have the repository open while we talk."
    >
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <div className="self-start">
          <img
            src="/portrait.webp"
            alt="Vishal Khan, head and shoulders portrait."
            width={112}
            height={112}
            loading="lazy"
            decoding="async"
            className="mb-8 w-24 sm:w-28"
          />

          <ul className="divide-y divide-rule border-y border-rule">
            {CHANNELS.map((c) => (
              <Channel key={c.label} {...c} reduce={Boolean(reduce)} />
            ))}
          </ul>
        </div>

        <dl className="grid gap-6 self-start">
          <div>
            <dt className="t-mono-sm text-graphite">Location</dt>
            <dd className="t-body mt-1.5 text-bone">{CONTACT.location}</dd>
          </div>
          {STATUS.map((row) => (
            <div key={row.term}>
              <dt className="t-mono-sm text-graphite">{row.term}</dt>
              <dd className="t-body mt-1.5 max-w-[46ch] text-bone">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-14">
        <PrimaryAction href={CALL_MAILTO}>Book a call</PrimaryAction>
      </div>
    </Section>
  );
}
