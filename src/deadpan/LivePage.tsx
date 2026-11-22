import { ArrowLeft, Play } from "@phosphor-icons/react";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "../components/notebook/ThemeToggle";
import { PROFILE } from "../data/profile";
import { BADGES, type Badge } from "./emoji";
import { Island } from "./Island";
import type { Claim } from "./types";
import { useLiveGame, type Game, type LiveView, type Meeting } from "./useLiveGame";

const LIES: Claim["verdict"][] = ["false_place", "invented_sighting"];

function Emoji({ badge }: { badge: Badge }) {
  return (
    <span className="island__emoji" role="img" aria-label={BADGES[badge].label}>
      {BADGES[badge].char}
    </span>
  );
}

/** Seconds left until `at`, read from the clock on every render, and re-rendered each second. */
function useCountdown(at: number | undefined) {
  const [, setBeat] = useState(0);
  useEffect(() => {
    if (!at) return;
    const id = window.setInterval(() => setBeat((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [at]);
  return at ? Math.max(0, Math.ceil((at - Date.now()) / 1000)) : 0;
}

/** "Live game, played by gpt-5-mini". A scripted game must never read as a model's. */
function whoPlays(game: Game) {
  const by = game.playedBy === "scripted" ? "scripted players" : game.playedBy;
  return `${game.mode === "live" ? "Live game" : "Replay"}, played by ${by}`;
}

/** One line on what is happening, the way a commentator would say it. */
function phaseLine(view: LiveView, countdown: number) {
  const m = view.meeting;
  if (view.phase === "intermission" && view.next) {
    return `Next game in ${countdown} s, ${view.next.mode === "live" ? "live" : "a recorded game"}.`;
  }
  if (view.game && view.link === "idle" && !view.end) {
    return "Not watching. Press Watch to pick the game up from where it has got to.";
  }
  if (view.end) {
    if (view.end.winner === null) return view.end.reason;
    return `${view.end.winner === "keepers" ? "The keepers win" : "The wrecker wins"}. ${view.end.reason}`;
  }
  if (m) {
    if (m.thinking) return `${m.thinking.name} is thinking about ${m.thinking.phase === "speak" ? "what to say" : "a vote"}.`;
    if (m.result) return m.result.ejected ? `${m.result.ejected} is sent ashore.` : "Nobody is sent ashore.";
    if (m.voted.length) return `Votes in: ${m.voted.length}. They are shown together.`;
    return `Meeting ${m.number}. Each player says where they were and whom they saw.`;
  }
  if (view.phase === "walking") return "The players move one room a tick. The wrecker waits for someone on their own.";
  return "";
}

function StatusLine({ view }: { view: LiveView }) {
  const countdown = useCountdown(view.next?.at);
  return (
    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 border-b-2 border-ink pb-3">
      {view.game ? (
        <>
          <span className="t-furniture border border-ink px-2 py-0.5 text-ink" style={{ fontWeight: 650 }}>
            {whoPlays(view.game)}
          </span>
          <span className="t-furniture text-pencil">
            Tick <span className="text-ink">{view.tick}</span> of {view.game.dawn}
          </span>
        </>
      ) : (
        <span className="t-furniture text-pencil">No game on screen</span>
      )}
      <p className="t-body w-full text-ink" aria-live="polite">
        {phaseLine(view, countdown)}
      </p>
    </div>
  );
}

function ClaimLine({ claim }: { claim: Claim }) {
  const lie = LIES.includes(claim.verdict);
  let verdict = "checks out";
  if (claim.verdict === "false_place") verdict = `false: was in the ${claim.real_room}`;
  if (claim.verdict === "invented_sighting") verdict = "false: saw no such player";
  if (claim.verdict === "named_body") verdict = "named a body as a sighting";
  if (claim.verdict === "omission") verdict = claim.left_out?.length ? `left out ${claim.left_out.join(" and ")}` : "left someone out";
  return (
    <li className="t-furniture-sm flex flex-wrap gap-x-2 text-pencil">
      <span className="text-ink-soft">
        Tick {claim.tick}, {claim.room}, saw {claim.saw.length ? claim.saw.join(" and ") : "nobody"}
      </span>
      <span className={lie ? "text-margin" : ""}>
        {lie ? <Emoji badge="lie" /> : null} {verdict}
      </span>
      {claim.refuted_by.length ? (
        <span>disproved by what {claim.refuted_by.join(" and ")} saw</span>
      ) : null}
    </li>
  );
}

function MeetingPanel({ meeting, wrecker }: { meeting: Meeting; wrecker: string }) {
  const result = meeting.result;
  // Keepers who held a sighting that disproved one of the wrecker's lies in
  // this meeting: the people the game is about.
  const holders = [
    ...new Set(
      meeting.statements
        .filter((s) => s.name === wrecker)
        .flatMap((s) => s.claims.filter((c) => LIES.includes(c.verdict)).flatMap((c) => c.refuted_by)),
    ),
  ];
  const used = result ? holders.filter((h) => result.votes.some((v) => v.name === h && v.choice === wrecker)) : [];

  return (
    <section aria-labelledby="meeting-heading" className="mt-5">
      <h2 id="meeting-heading" className="t-sub">
        Meeting {meeting.number}
      </h2>
      <p className="t-small mt-1 text-ink-soft">
        {meeting.cause === "body" && meeting.body
          ? `${meeting.calledBy} found ${meeting.body} in the ${meeting.bodyRoom}.`
          : `${meeting.calledBy} rang the bell.`}
      </p>
      <ol className="mt-4 grid gap-y-4">
        {meeting.statements.map((s) => (
          <li key={s.name} className="border-t border-hair pt-3">
            <p className="t-furniture text-ink" style={{ fontWeight: 650 }}>
              {s.name}
              {s.name === wrecker ? <span className="text-pencil" style={{ fontWeight: 560 }}>, the wrecker</span> : null}
              {s.suspect ? (
                <span className="text-ink-soft" style={{ fontWeight: 560 }}>
                  {" "}
                  <Emoji badge="suspect" /> suspects {s.suspect}
                </span>
              ) : null}
            </p>
            <p className="t-small mt-1 text-ink">
              {s.fallback
                ? "Gave no usable reply, so a blank statement was used."
                : s.speech
                  ? `"${s.speech}"`
                  : "Said nothing beyond the claims below."}
            </p>
            <ul className="mt-2 grid gap-y-1">
              {s.claims.map((c) => (
                <ClaimLine key={`${c.tick}-${c.room}`} claim={c} />
              ))}
            </ul>
          </li>
        ))}
      </ol>
      {meeting.voted.length && !result ? (
        <p className="t-small mt-4 text-ink-soft">
          <Emoji badge="voted" /> {meeting.voted.join(", ")} {meeting.voted.length === 1 ? "has" : "have"} voted.
        </p>
      ) : null}
      {result ? (
        <div className="mt-5 border-t-2 border-ink pt-3">
          <h3 className="t-furniture text-ink" style={{ fontWeight: 650 }}>
            The vote
          </h3>
          <ul className="mt-2 grid gap-y-1.5">
            {result.votes.map((v) => (
              <li key={v.name} className="t-small text-ink-soft">
                <span className="text-ink">{v.name}</span>{" "}
                {v.choice === "skip" ? (
                  <>
                    <Emoji badge="skip" /> skipped
                  </>
                ) : (
                  <>
                    voted for <span className="text-ink">{v.choice}</span>
                  </>
                )}
                {v.reason ? <span className="text-pencil">. {v.reason}</span> : null}
                {holders.includes(v.name) ? (
                  <span className="t-furniture-sm ml-1 border border-ink px-1 text-ink">
                    held a disproof{v.choice === wrecker ? ", used it" : ", did not use it"}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
          {holders.length ? (
            <p className="t-small mt-3 text-ink-soft">
              <span className="tabular text-margin">
                {used.length} of {holders.length}
              </span>{" "}
              {holders.length === 1 ? "keeper" : "keepers"} whose own sightings disproved the wrecker voted for the
              wrecker.
            </p>
          ) : null}
          <p className="t-body mt-3 text-ink">
            {result.ejected ? (
              <>
                <Emoji badge="ashore" /> {result.ejected} is sent ashore, and was{" "}
                {result.role === "wrecker" ? "the wrecker" : "a keeper"}.
              </>
            ) : (
              "Nobody is sent ashore."
            )}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function Log({ lines }: { lines: string[] }) {
  if (!lines.length) return null;
  return (
    <section aria-labelledby="log-heading" className="mt-5">
      <h2 id="log-heading" className="t-sub">
        So far
      </h2>
      <ol className="mt-3 grid gap-y-2">
        {lines
          .slice(-8)
          .reverse()
          .map((line, i) => (
            <li key={`${lines.length - i}-${line}`} className={`t-small ${i === 0 ? "text-ink" : "text-ink-soft"}`}>
              {line}
            </li>
          ))}
      </ol>
    </section>
  );
}

const LEGEND: Badge[] = [
  "work", "ring", "strike", "out", "found", "witness", "thinking", "speaking", "suspect", "lie", "voted", "skip", "ashore", "won",
];

function Legend() {
  return (
    <section aria-labelledby="legend-heading" className="mt-12 border-t-2 border-ink pt-5">
      <h2 id="legend-heading" className="t-sub">
        What the marks mean
      </h2>
      <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {LEGEND.map((b) => (
          <div key={b} className="flex items-center gap-3">
            <dt className="island__emoji w-6 text-center" aria-hidden="true">
              {BADGES[b].char}
            </dt>
            <dd className="t-small text-ink-soft">{BADGES[b].label}</dd>
          </div>
        ))}
        <div className="flex items-center gap-3">
          <dt className="t-furniture-sm border-[1.5px] border-ink bg-ink px-1.5 text-paper" aria-hidden="true">
            Bram
          </dt>
          <dd className="t-small text-ink-soft">The wrecker, inked in</dd>
        </div>
      </dl>
    </section>
  );
}

/**
 * The Watch control, and what the line to the server is doing. Nothing
 * connects until the button is pressed, and each press watches one game.
 */
function WatchPanel({ view, watch }: { view: LiveView; watch: () => void }) {
  if (view.link === "off") {
    return (
      <p className="t-body text-ink-soft" role="status">
        The game server is not running yet. The pilot games are written up on the home page.
      </p>
    );
  }
  if (view.link === "connecting" && !view.game) {
    return (
      <p className="t-body text-ink-soft" role="status">
        Waking the island. The server sleeps when nobody is watching, so a game can take up to a minute to
        start.
      </p>
    );
  }
  if (view.link === "retrying") {
    return (
      <p className="t-body text-ink-soft" role="status">
        Lost the line to the game server. Trying again in {view.retryIn} s.
      </p>
    );
  }
  if (view.link !== "idle") return null;
  return (
    <div>
      {view.closed ? (
        <p className="t-body mb-4 text-ink-soft" role="status">
          {view.closed}
        </p>
      ) : null}
      <button
        type="button"
        onClick={watch}
        className="t-furniture inline-flex items-center gap-2 border-2 border-ink px-4 py-2 text-ink transition-colors duration-150 hover:bg-wash active:translate-y-px"
        style={{ fontWeight: 650 }}
      >
        <Play size={16} aria-hidden="true" />
        {view.end ? "Watch another game" : "Watch a game"}
      </button>
      <p className="t-small mt-2 max-w-[24em] text-pencil">
        One game a press. Everyone watching sees the same game, from wherever it has got to.
      </p>
    </div>
  );
}

export function LivePage() {
  const { view, watch } = useLiveGame();

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <header className="border-b-2 border-ink bg-paper">
          <div className="mx-auto flex max-w-[var(--page-max)] items-center gap-x-6 px-[var(--gutter)] py-3 lg:h-16 lg:py-0">
            <a href="/" className="t-furniture inline-flex items-center gap-1.5 text-ink no-underline hover:underline">
              <ArrowLeft size={16} aria-hidden="true" />
              {PROFILE.name}
            </a>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[var(--page-max)] px-[var(--gutter)] pt-10 pb-16 sm:pt-12">
          <h1 className="t-claim max-w-[30ch]">Find the Wrecker, played live by LLM agents</h1>
          <p className="t-lead mt-4 max-w-[34em] text-ink">
            Six players keep a lighthouse through a stormy night. One of them, the wrecker, takes the
            others out when they are alone, then lies about it in meetings. You can see who the wrecker
            is. The players cannot.
          </p>
          <p className="t-body mt-3 max-w-[34em] text-ink-soft">
            Movement is scripted; what the players say and how they vote comes from a language model,
            and every claim is checked against where everyone really was.
          </p>

          <div className="mt-10">
            {view.notice ? (
              <p className="t-small mb-3 border-l-2 border-ink pl-3 text-ink-soft" role="status">
                {view.notice}
              </p>
            ) : null}
            <div className="grid gap-8 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:gap-12">
              <div className="min-w-0">
                {/* On a phone the map is a screen tall, so the button comes first. */}
                <div className="mb-6 lg:hidden">
                  <WatchPanel view={view} watch={watch} />
                </div>
                <StatusLine view={view} />
                {/* Below 32rem the name tags would shrink past reading, so the
                    map keeps that width and scrolls sideways in its own box. */}
                <div className="mt-4 overflow-x-auto" tabIndex={0} role="region" aria-label="Map of the island">
                  <div className="min-w-[32rem]">
                    <Island view={view} />
                  </div>
                </div>
              </div>
              <div className="min-w-0 lg:pt-1">
                <div className="hidden lg:block">
                  <WatchPanel view={view} watch={watch} />
                </div>
                {view.ashore.length ? (
                  <p className="t-small mt-5 text-ink-soft">
                    <Emoji badge="ashore" /> Sent ashore: {view.ashore.map((a) => `${a.name} (${a.role})`).join(", ")}
                  </p>
                ) : null}
                {view.meeting && view.game ? (
                  <MeetingPanel meeting={view.meeting} wrecker={view.game.wrecker} />
                ) : (
                  <Log lines={view.log} />
                )}
              </div>
            </div>
          </div>

          <Legend />
        </main>
      </LazyMotion>
    </MotionConfig>
  );
}
