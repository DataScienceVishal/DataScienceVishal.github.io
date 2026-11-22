import { useEffect, useReducer } from "react";
import { DEADPAN_API } from "./config";
import { EVENT_TYPES, type Action, type Claim, type GameEvent, type MapInfo, type Mode, type Vote } from "./types";

export type Link = "connecting" | "open" | "retrying" | "off";
export type Phase = "waiting" | "walking" | "meeting" | "over" | "intermission";

export interface Statement {
  name: string;
  claims: Claim[];
  suspect: string | null;
  speech: string;
  fallback: boolean;
}

export interface Meeting {
  number: number;
  calledBy: string;
  cause: "body" | "bell";
  body: string | null;
  bodyRoom: string | null;
  statements: Statement[];
  thinking: { name: string; phase: "speak" | "vote" } | null;
  voted: string[];
  result: { votes: Vote[]; tally: Record<string, number>; ejected: string | null; role: "keeper" | "wrecker" | null } | null;
}

export interface Game {
  id: string;
  mode: Mode;
  map: MapInfo;
  players: string[];
  wrecker: string;
}

export interface LiveView {
  link: Link;
  /** Seconds until the next connection attempt, while retrying. */
  retryIn: number;
  game: Game | null;
  phase: Phase;
  tick: number;
  positions: Record<string, string>;
  bodies: Record<string, string[]>;
  actions: Record<string, Action>;
  strike: { by: string; target: string; room: string; witnesses: string[] } | null;
  found: { by: string; body: string; room: string } | null;
  jobs: Record<string, [number, number]>;
  /** Taken out, as announced by meetings, plus anyone struck since. */
  out: string[];
  ashore: { name: string; role: "keeper" | "wrecker" }[];
  meeting: Meeting | null;
  end: { winner: "keepers" | "wrecker"; reason: string } | null;
  next: { at: number; mode: Mode; left: number } | null;
  notice: string | null;
  /** Plain sentences about what has happened, newest last. The map's text alternative. */
  log: string[];
}

type Msg = { type: "link"; link: Link; retryIn?: number } | GameEvent;

const START: LiveView = {
  link: "connecting",
  retryIn: 0,
  game: null,
  phase: "waiting",
  tick: 0,
  positions: {},
  bodies: {},
  actions: {},
  strike: null,
  found: null,
  jobs: {},
  out: [],
  ashore: [],
  meeting: null,
  end: null,
  next: null,
  notice: null,
  log: [],
};

const list = (names: string[]) =>
  names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

const keep = (log: string[], ...lines: string[]) => [...log, ...lines].slice(-40);

/** Turns one event into what is drawn. Nothing here decides a rule of the game. */
export function reduce(view: LiveView, msg: Msg): LiveView {
  switch (msg.type) {
    case "link":
      return { ...view, link: msg.link, retryIn: msg.retryIn ?? 0 };
    case "game": {
      const positions = Object.fromEntries(msg.players.map((p) => [p, msg.map.start]));
      return {
        ...START,
        link: view.link,
        notice: view.notice,
        game: { id: msg.game_id, mode: msg.mode, map: msg.map, players: msg.players, wrecker: msg.wrecker },
        phase: "walking",
        positions,
        log: [`A new game. Six players start in the ${msg.map.start}. ${msg.wrecker} is the wrecker.`],
      };
    }
    case "tick": {
      const lines: string[] = [];
      const strike = msg.strikes[0] ?? null;
      if (strike) {
        const seen = strike.witnesses.length ? `${list(strike.witnesses)} saw it.` : "Nobody saw it.";
        lines.push(`Tick ${msg.tick}. ${strike.by} took ${strike.target} out in the ${strike.room}. ${seen}`);
      }
      for (const [name, act] of Object.entries(msg.actions)) {
        if (act === "ring") lines.push(`Tick ${msg.tick}. ${name} rang the bell.`);
      }
      if (msg.found) lines.push(`Tick ${msg.tick}. ${msg.found.by} found ${msg.found.body} in the ${msg.found.room}.`);
      const out = strike && !view.out.includes(strike.target) ? [...view.out, strike.target] : view.out;
      return {
        ...view,
        phase: "walking",
        tick: msg.tick,
        positions: msg.positions,
        bodies: msg.bodies,
        actions: msg.actions,
        strike,
        found: msg.found,
        jobs: msg.jobs,
        out,
        meeting: null,
        log: lines.length ? keep(view.log, ...lines) : view.log,
      };
    }
    case "meeting": {
      if (!view.game) return view;
      const start = view.game.map.start;
      const alive = Object.keys(view.positions).filter((p) => !msg.out.includes(p));
      const why =
        msg.cause === "body" && msg.body
          ? `${msg.called_by} reported ${msg.body}'s body in the ${msg.body_room}`
          : `${msg.called_by} rang the bell`;
      return {
        ...view,
        phase: "meeting",
        positions: Object.fromEntries(alive.map((p) => [p, start])),
        bodies: {},
        actions: {},
        strike: null,
        found: null,
        out: msg.out,
        meeting: {
          number: msg.number,
          calledBy: msg.called_by,
          cause: msg.cause,
          body: msg.body,
          bodyRoom: msg.body_room,
          statements: [],
          thinking: null,
          voted: [],
          result: null,
        },
        log: keep(view.log, `Meeting ${msg.number}: ${why}. Everyone gathers in the ${start}.`),
      };
    }
    case "thinking":
      return view.meeting ? { ...view, meeting: { ...view.meeting, thinking: { name: msg.name, phase: msg.phase } } } : view;
    case "statement": {
      if (!view.meeting) return view;
      const { type: _t, game_id: _g, ...said } = msg;
      return {
        ...view,
        meeting: { ...view.meeting, thinking: null, statements: [...view.meeting.statements, said] },
      };
    }
    case "voted":
      return view.meeting
        ? { ...view, meeting: { ...view.meeting, thinking: null, voted: [...view.meeting.voted, msg.name] } }
        : view;
    case "result": {
      if (!view.meeting) return view;
      const positions = { ...view.positions };
      if (msg.ejected) delete positions[msg.ejected];
      const line = msg.ejected
        ? `${msg.ejected} was sent ashore. ${msg.ejected} was ${msg.ejected_role === "wrecker" ? "the wrecker" : "a keeper"}.`
        : "Nobody was sent ashore.";
      return {
        ...view,
        positions,
        ashore: msg.ejected && msg.ejected_role ? [...view.ashore, { name: msg.ejected, role: msg.ejected_role }] : view.ashore,
        meeting: {
          ...view.meeting,
          thinking: null,
          result: { votes: msg.votes, tally: msg.tally, ejected: msg.ejected, role: msg.ejected_role },
        },
        log: keep(view.log, line),
      };
    }
    case "end":
      return {
        ...view,
        phase: "over",
        end: { winner: msg.winner, reason: msg.reason },
        log: keep(view.log, `${msg.winner === "keepers" ? "The keepers win" : "The wrecker wins"}. ${msg.reason}`),
      };
    case "intermission":
      return {
        ...view,
        phase: "intermission",
        next: { at: Date.now() + msg.seconds * 1000, mode: msg.next_mode, left: msg.live_games_left_today },
      };
    case "notice":
      return { ...view, notice: msg.text };
  }
}

/** Plays the made-up sample game on a loop, with the server's pauses. */
function playSample(send: (m: Msg) => void): () => void {
  let stopped = false;
  let timer = 0;
  void import("./sample").then(({ sampleGame }) => {
    const run = () => {
      const steps = sampleGame();
      let i = 0;
      const next = () => {
        if (stopped) return;
        if (i >= steps.length) {
          run();
          return;
        }
        const { event, wait } = steps[i++];
        send(event);
        timer = window.setTimeout(next, wait);
      };
      send({ type: "link", link: "open" });
      next();
    };
    run();
  });
  return () => {
    stopped = true;
    window.clearTimeout(timer);
  };
}

/**
 * Listens to the live stream. EventSource reconnects by itself after a dropped
 * line; when the server is gone altogether it closes, and this tries again
 * with a growing wait, saying so on the page rather than going blank.
 */
function listen(base: string, send: (m: Msg) => void): () => void {
  let source: EventSource | null = null;
  let timer = 0;
  let tick = 0;
  let wait = 2;
  let stopped = false;

  const open = () => {
    send({ type: "link", link: "connecting" });
    source = new EventSource(`${base}/live`);
    source.onopen = () => {
      wait = 2;
      send({ type: "link", link: "open" });
    };
    for (const type of EVENT_TYPES) {
      source.addEventListener(type, (e) => {
        try {
          send({ ...(JSON.parse((e as MessageEvent<string>).data) as object), type } as GameEvent);
        } catch {
          // A malformed event is skipped rather than allowed to stop the stream.
        }
      });
    }
    source.onerror = () => {
      if (!source || source.readyState !== EventSource.CLOSED || stopped) return;
      let left = wait;
      send({ type: "link", link: "retrying", retryIn: left });
      tick = window.setInterval(() => {
        left -= 1;
        if (left > 0) send({ type: "link", link: "retrying", retryIn: left });
      }, 1000);
      timer = window.setTimeout(() => {
        window.clearInterval(tick);
        open();
      }, wait * 1000);
      wait = Math.min(wait * 2, 30);
    };
  };

  open();
  return () => {
    stopped = true;
    source?.close();
    window.clearTimeout(timer);
    window.clearInterval(tick);
  };
}

export function useLiveGame(): LiveView {
  const [view, send] = useReducer(reduce, START);

  useEffect(() => {
    const sample = import.meta.env.DEV && new URLSearchParams(window.location.search).get("feed") === "sample";
    if (sample) return playSample(send);
    if (!DEADPAN_API) {
      send({ type: "link", link: "off" });
      return;
    }
    return listen(DEADPAN_API, send);
  }, []);

  return view;
}
