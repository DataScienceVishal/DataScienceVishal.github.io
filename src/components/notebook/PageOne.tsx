import { ArrowUpRight, FilePdf } from "@phosphor-icons/react";
import { ABOUT, PROFILE } from "../../data/profile";
import { CopyEmail } from "./CopyEmail";
import { Plate } from "./Plate";

const out = { target: "_blank", rel: "noopener noreferrer" } as const;

/**
 * Page one is the notebook's owner page: whose it is first, with the photo
 * taped beside the name, then what he does, who he is, when he is free and the
 * address. Nothing here fades in. Text that starts at opacity 0 holds back the
 * paint it is part of, and this is the first screen.
 */
export function PageOne() {
  return (
    <section
      id="top"
      aria-labelledby="page-one-heading"
      className="leaf leaf--plate page-one pt-10 pb-14 sm:pt-14 lg:pt-12 lg:pb-16"
    >
      <div className="flex items-center gap-5 sm:gap-7">
        <figure className="m-0 w-20 shrink-0 sm:w-24 lg:w-28">
          <div className="plate__print plate__print--tilt-left p-1.5">
            <span className="plate__tape plate__tape--a !h-4 !w-12" aria-hidden="true" />
            <img
              src="/portrait.webp"
              width={240}
              height={240}
              alt="Vishal Khan, head and shoulders."
              decoding="async"
              className="block w-full"
            />
          </div>
        </figure>
        <div className="min-w-0">
          <h1 id="page-one-heading" className="t-display">
            {PROFILE.name}
          </h1>
          <p className="t-furniture mt-2 text-ink-soft">
            {PROFILE.role}, London
          </p>
        </div>
      </div>

      <p className="leaf__margin t-furniture mt-6 text-pencil lg:mt-3">
        <span className="lg:block">Facts checked</span>{" "}
        <time dateTime={PROFILE.checked.iso} className="text-margin lg:block">
          {PROFILE.checked.label}
        </time>
      </p>

      <p className="t-claim mt-8 max-w-[26ch] text-ink sm:mt-10">
        I build AI systems, and I check the numbers before I believe them.
      </p>

      <div className="t-lead mt-6 max-w-[30em] space-y-4 text-ink">
        {ABOUT.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>

      <p className="t-body mt-6 max-w-[32em] text-ink-soft">
        Looking for an AI or ML internship now and full-time roles from early 2027. No
        sponsorship needed for the internship, or for 18 months of full-time work.
      </p>

      <div className="mt-8">
        <CopyEmail email={PROFILE.email} id="page-one-email" />
      </div>

      <p className="t-furniture mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <a href={PROFILE.cv} className="inline-flex items-center gap-1.5 text-ink">
          <FilePdf aria-hidden="true" />
          CV, PDF
        </a>
        <a href={PROFILE.github} {...out} className="inline-flex items-center gap-1 text-ink">
          GitHub
          <ArrowUpRight size={14} aria-hidden="true" />
          <span className="sr-only">, opens in a new tab</span>
        </a>
        <a href={PROFILE.linkedin} {...out} className="inline-flex items-center gap-1 text-ink">
          LinkedIn
          <ArrowUpRight size={14} aria-hidden="true" />
          <span className="sr-only">, opens in a new tab</span>
        </a>
        <a href={PROFILE.twin} {...out} className="inline-flex items-center gap-1 text-ink">
          Ask my AI twin
          <ArrowUpRight size={14} aria-hidden="true" />
          <span className="sr-only">, opens in a new tab</span>
        </a>
      </p>

      <div className="leaf__plate mt-12 max-w-[14rem] sm:max-w-[19rem] xl:mt-0 xl:max-w-[21rem]">
        <Plate id="head" eager />
      </div>
    </section>
  );
}
