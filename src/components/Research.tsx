import { Claim } from "./Claim";
import { Section } from "./Section";

export function Research() {
  return (
    <Section
      id="research"
      heading="Research"
      lede="Two dissertations. One is finished and not online, the other is not finished. Both are here as work in progress rather than as credentials."
    >
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-16">
        <article>
          <p className="t-mono-sm text-graphite">
            Liverpool John Moores University, 2024
          </p>
          <h3 className="t-display-3 mt-3">
            Reinforcement learning for dynamic pricing in e-commerce
          </h3>
          <p className="t-body mt-5 max-w-[60ch]">
            Tested whether reinforcement learning could beat pricing rules in a
            simulated e-commerce environment. Built a Gym-style environment on
            real e-commerce data, then trained DQN, A2C and PPO agents over
            multi-episode simulations.{" "}
            <Claim source="ljmu-thesis">
              DQN produced the most stable profit curve
            </Claim>
            .
          </p>
          <p className="t-body mt-4 max-w-[60ch] text-graphite">
            The dissertation is not published anywhere, which makes that the one
            number on this page you cannot go and check. Ask me and I will send
            the document.
          </p>
        </article>

        <article>
          <p className="t-mono-sm text-graphite">
            Northeastern University London, in progress
          </p>
          <h3 className="t-display-3 mt-3">
            Agentic AI and agent reliability
          </h3>
          <p className="t-body mt-5 max-w-[60ch]">
            <Claim source="nul-dissertation" flip>
              Still being written
            </Claim>
            . The question is what makes an agent's answer trustworthy enough to
            act on: grounding, refusal behaviour, and treating retrieved text as
            untrusted input rather than as instructions.
          </p>
          <p className="t-body mt-4 max-w-[60ch] text-graphite">
            The twin is the test bed, which is why it ships with a test suite and
            a prompt-injection section in its README instead of a demo video.
          </p>
        </article>
      </div>

      <p className="t-mono-sm mt-14 border-t border-rule pt-6 text-graphite">
        Also: MSc Data Science, Liverpool John Moores University, 2023 to 2024.
        Executive PG Program in Data Science, IIIT Bangalore, 2022 to 2023.
        Bachelor of Commerce, University of Delhi, 2018 to 2021.
      </p>
    </Section>
  );
}
