import { CONTACT } from "../data/content";
import { PrimaryAction, SecondaryAction } from "./Buttons";
import { Claim } from "./Claim";
import { RetrievalPath } from "./RetrievalPath";
import { Section } from "./Section";

/** Objective, approach, result. The same three headings the resume uses. */
function Register() {
  return (
    <dl className="mt-14 sm:mt-16 lg:grid lg:grid-cols-[7rem_minmax(0,1fr)] lg:gap-x-10 lg:gap-y-10">
      <dt className="t-mono-md mt-9 text-graphite first:mt-0 lg:mt-0 lg:pt-1">
        Objective
      </dt>
      <dd className="t-body mt-2 max-w-[68ch] lg:mt-0">
        Rebuild a vanilla JavaScript prototype into something that answers
        recruiter and interview questions about me from evidence, and shows what
        the evidence was.
      </dd>

      <dt className="t-mono-md mt-9 text-graphite first:mt-0 lg:mt-0 lg:pt-1">
        Approach
      </dt>
      <dd className="t-body mt-2 max-w-[68ch] lg:mt-0">
        A FastAPI service with ChromaDB retrieval over{" "}
        <Claim source="twin-repo">87 indexed documents</Claim> built from YAML
        knowledge files, the resume PDF and live GitHub ingestion, embedded and
        generated with Azure OpenAI. Intent-boosted retrieval, conversation-aware
        follow-ups, eight function-calling tools, answers streamed over SSE, and
        a React 19 front end.
      </dd>

      <dt className="t-mono-md mt-9 text-graphite first:mt-0 lg:mt-0 lg:pt-1">
        Result
      </dt>
      <dd className="t-body mt-2 max-w-[68ch] lg:mt-0">
        Running on Railway and Vercel. Ingestion is a background task keyed on
        content hashes, so{" "}
        <Claim source="resume">health checks answer in about 20 ms</Claim> during
        a cold start instead of restart-looping. Per-IP rate limiting and a daily
        spend cap keep it cheap.{" "}
        <Claim source="twin-tests">370 tests run in CI</Claim> alongside mypy.
      </dd>
    </dl>
  );
}

export function FeaturedWork() {
  return (
    <Section
      id="twin"
      heading="AI Digital Twin"
      size="feature"
      lede="It answers questions about me from evidence, cites what it used, and says when it does not know. That last part took the longest."
    >
      <div className="mb-14 lg:mb-16">
        <RetrievalPath />
      </div>

      <p className="t-body max-w-[68ch] border-l border-brass pl-5 text-read">
        Part of that knowledge base is pulled from public GitHub READMEs, which
        is a live prompt-injection surface. Retrieved text is delimited, the
        prompt states that everything inside it is data rather than instructions,
        and{" "}
        <Claim source="twin-repo">
          the response rules forbid echoing an injected instruction back
        </Claim>
        . That is not a guarantee. Pasting third-party markdown straight into a
        system prompt is worse.
      </p>

      <Register />

      <div className="mt-14 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <PrimaryAction href={CONTACT.twin} external>
          Ask the twin
        </PrimaryAction>
        <SecondaryAction href={CONTACT.twinRepo} external>
          Read the code
        </SecondaryAction>
      </div>
    </Section>
  );
}
