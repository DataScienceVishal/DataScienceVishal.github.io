import { ArrowLeft } from "@phosphor-icons/react";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "../components/notebook/ThemeToggle";
import { PROFILE } from "../data/profile";
import { BADGES, type Badge } from "./emoji";
import { Island } from "./Island";
import type { Claim } from "./types";
import { useLiveGame, type LiveView, type Meeting } from "./useLiveGame";

const VERDICT: Record<Claim["verdict"], string> = {
  true: "checks out",
  false_place: "false: not where they said",
  invented_sighting: "false: saw no such player",
  named_body: "named a body as a sighting",
  omission: "left someone out",
};

function Emoji({ badge }: { badge: Badge }) {
  return (
    <span className="island__emoji" role="img" aria-label={BADGES[badge].label}>
      {BADGES[badge].char}
    </span>
  );
}

function useCountdown(at: number | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!at) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [at]);
  return at ? Math.max(0, Math.ceil((at - now) / 1000)) : 0;
}

/** One line on what is happening, the way a commentator would say it. */
function phaseLine(view: LiveView, countdown: number) {
  const m = view.meeting;
  if (view.phase === "intermission" && view.next) {
    return `Next game in ${countdown} s, ${view.next.mode === "live" ? "live" : "a recorded game"}.`;
  }
  if (view.end) return `${view.end.winner === "keepers" ? "The keepers win" : "The wrecker wins"}. ${view.end.reason}`;
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
  const live = view.game?.mode === "live";
  return (
    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 border-b-2 border-ink pb-3">
      {view.game ? (
        <span className="t-furniture border border-ink px-2 py-0.5 text-ink" style={{ fontWeight: 650 }}>
          {live ? "Live game" : "Replay of a recorded game"}
        </span>
      ) : null}
      {view.game ? (
        <span className="t-furniture text-pencil">
          Tick <span className="text-ink">{view.tick}</span> of 40
        </span>
      ) : null}
      <p className="t-body w-full text-ink sm:w-auto sm:flex-1" aria-live="polite">
        {phaseLine(view, countdown)}
      </p>
    </div>
  );
}

function MeetingPanel({ meeting, wrecker }: { meeting: Meeting; wrecker: string }) {
  const result = meeting.result;
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
            <p className="t-small mt-1 text-ink">{s.fallback ? "Said nothing usable, so a blank statement was used." : `"${s.speech}"`}</p>
            <ul className="mt-2 grid gap-y-1">
              {s.claims.map((c) => {
                const lie = c.verdict === "false_place" || c.verdict === "invented_sighting";
                return (
                  <li key={`${c.tick}-${c.room}`} className="t-furniture-sm flex flex-wrap gap-x-2 text-pencil">
                    <span className="text-ink-soft">
                      Tick {c.tick}, {c.room}, saw {c.saw.length ? c.saw.join(" and ") : "nobody"}
                    </span>
                    <span className={lie ? "text-margin" : ""}>
                      {lie ? <Emoji badge="lie" /> : null} {VERDICT[c.verdict]}
                    </span>
                  </li>
                );
              })}
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
                <span className="text-ink">{v.name}</span> {v.choice === "skip" ? <><Emoji badge="skip" /> skipped</> : <>voted for <span className="text-ink">{v.choice}</span></>}
                <span className="text-pencil">. {v.reason}</span>
              </li>
            ))}
          </ul>
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

/** The state of the line to the server, when there is no game to show. */
function Waiting({ view }: { view: LiveView }) {
  const text =
    view.link === "off"
      ? "The game server is not running yet. The pilot games are written up on the home page."
      : view.link === "retrying"
        ? `Lost the line to the game server. Trying again in ${view.retryIn} s.`
        : view.link === "open"
          ? "Connected. Waiting for the next game to start."
          : "Waking the island. The server sleeps when nobody is watching, so the first game can take up to a minute to start.";
  return (
    <div className="grid min-h-[22rem] place-items-center border border-hair bg-paper px-6 py-16 text-center">
      <p className="t-lead max-w-[28em] text-ink-soft" role="status">
        {text}
      </p>
    </div>
  );
}

export function LivePage() {
  const view = useLiveGame();

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <header className="border-b-2 border-ink bg-paper">
          <div className="mx-auto flex max-w-[var(--page-max)] items-center gap-x-6 px-[var(--gutter)] py-3 lg:h-16 lg:py-0">
            <a href="/#deadpan" className="t-furniture inline-flex items-center gap-1.5 text-ink no-underline hover:underline">
              <ArrowLeft size={16} aria-hidden="true" />
              {PROFILE.name}
            </a>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[var(--page-max)] px-[var(--gutter)] pt-10 pb-16 sm:pt-12">
          <h1 className="t-claim max-w-[30ch]">Deadpan, played live by LLM agents</h1>
          <p className="t-lead mt-4 max-w-[34em] text-ink">
            Six players keep a lighthouse through a stormy night. One of them, the wrecker, takes the
            others out when they are alone, then lies about it in meetings. You can see who the wrecker
            is. The players cannot.
          </p>
          <p className="t-body mt-3 max-w-[34em] text-ink-soft">
            Everyone watching sees the same game. Movement is scripted; what the players say and how
            they vote comes from gpt-5-mini, and every claim is checked against where everyone really
            was.
          </p>

          <div className="mt-10">
            {view.notice ? (
              <p className="t-small mb-3 border-l-2 border-ink pl-3 text-ink-soft" role="status">
                {view.notice}
              </p>
            ) : null}
            {view.game ? (
              <div className="grid gap-8 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:gap-12">
                <div className="min-w-0">
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
                  {view.ashore.length ? (
                    <p className="t-small text-ink-soft">
                      <Emoji badge="ashore" /> Sent ashore:{" "}
                      {view.ashore.map((a) => `${a.name} (${a.role})`).join(", ")}
                    </p>
                  ) : null}
                  {view.meeting ? <MeetingPanel meeting={view.meeting} wrecker={view.game.wrecker} /> : <Log lines={view.log} />}
                </div>
              </div>
            ) : (
              <Waiting view={view} />
            )}
          </div>

          <Legend />
        </main>
      </LazyMotion>
    </MotionConfig>
  );
}
