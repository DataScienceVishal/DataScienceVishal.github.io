import { ArrowUpRight, FilePdf } from "@phosphor-icons/react";
import { CALL_MAILTO, PROFILE, STATUS } from "../../data/profile";
import { CopyEmail } from "./CopyEmail";

const out = { target: "_blank", rel: "noopener noreferrer" } as const;

/** The back page: the address again, every other channel, and the terms. */
export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="leaf page-break scroll-mt-20 py-14 sm:py-16 lg:py-20"
    >
      <h2 id="contact-heading" className="t-claim">
        Contact
      </h2>

      <p className="t-lead mt-6 max-w-[25em] text-ink-soft">
        Email gets read the same day. A call is fifteen minutes, and I will have the
        repository open while we talk.
      </p>

      <div className="mt-8">
        <CopyEmail email={PROFILE.email} id="contact-email" />
      </div>

      <ul className="t-furniture mt-3 flex flex-wrap gap-x-6 gap-y-2">
        <li>
          <a href={CALL_MAILTO} className="text-ink">
            Ask for a call
          </a>
        </li>
        <li>
          <a href={PROFILE.cv} className="inline-flex items-center gap-1.5 text-ink">
            <FilePdf aria-hidden="true" />
            CV, PDF
          </a>
        </li>
        <li>
          <a href={PROFILE.linkedin} {...out} className="inline-flex items-center gap-1 text-ink">
            LinkedIn, {PROFILE.linkedinHandle}
            <ArrowUpRight size={14} aria-hidden="true" />
            <span className="sr-only">, opens in a new tab</span>
          </a>
        </li>
        <li>
          <a href={PROFILE.github} {...out} className="inline-flex items-center gap-1 text-ink">
            GitHub, {PROFILE.githubHandle}
            <ArrowUpRight size={14} aria-hidden="true" />
            <span className="sr-only">, opens in a new tab</span>
          </a>
        </li>
      </ul>

      <dl className="mt-12 grid max-w-[32em] gap-y-5">
        <div>
          <dt className="t-furniture text-pencil">Location</dt>
          <dd className="t-body mt-1 text-ink">{PROFILE.location}</dd>
        </div>
        {STATUS.map((row) => (
          <div key={row.term}>
            <dt className="t-furniture text-pencil">{row.term}</dt>
            <dd className="t-body mt-1 text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
