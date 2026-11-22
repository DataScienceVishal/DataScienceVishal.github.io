import { useCallback, useEffect, useReducer, useRef } from "react";
import { DEADPAN_API } from "./config";
import type { Trail } from "./notes";
import { EVENT_TYPES, type Action, type Claim, type GameEvent, type MapInfo, type Mode, type Vote } from "./types";

/**
 * idle: not connected, the Watch button is offered. off: no server address
 * yet, so there is nothing to watch.
 */
export type Link = "idle" | "connecting" | "open" | "retrying" | "off";
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
  playedBy: string;
  dawn: number;
  map: MapInfo;
  players: string[];
  wrecker: string;
}

export interface LiveView {
  link: Link;
  /** Seconds until the next connection attempt, while retrying. */
  retryIn: number;
  /** Why the line was closed, said on the page: the server's closed text, or the tab going to the background. */
  closed: string | null;
  game: Game | null;
  phase: Phase;
  tick: number;
  positions: Record<string, string>;
  bodies: Record<string, string[]>;
  actions: Record<string, Action>;
  strike: { by: string; target: string; room: string; witnesses: string[] } | null;
  found: { by: string; body: string; room: string } | null;
  jobs: Record<string, [number, number]>;
  /** Where everyone stood after each tick this game, for the notes a lie leaves on the map. */
  trail: Trail;
  /** Taken out, as announced by meetings, plus anyone struck since. */
  out: string[];
  ashore: { name: string; role: "keeper" | "wrecker" }[];
  meeting: Meeting | null;
  end: { winner: "keepers" | "wrecker" | null; reason: string } | null;
  next: { at: number; mode: Mode; left: number } | null;
  notice: string | null;
  /** Plain sentences about what has happened, newest last. The map's text alternative. */
  log: string[];
}

type Msg = { type: "link"; link: Link; retryIn?: number; closed?: string | null } | GameEvent;

export const START: LiveView = {
  link: "idle",
  retryIn: 0,
  closed: null,
  game: null,
  phase: "waiting",
  tick: 0,
  positions: {},
  bodies: {},
  actions: {},
  strike: null,
  found: null,
  jobs: {},
  trail: {},
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

/** The engine's end reasons, said as sentences. */
const WHY: Record<string, string> = {
  "sent ashore": "The wrecker was sent ashore.",
  jobs: "The keepers finished every job.",
  dawn: "Dawn came with the light still burning.",
  parity: "Only one keeper was left.",
  stopped: "The game stopped early.",
};

const keep = (log: string[], ...lines: string[]) => [...log, ...lines].slice(-40);

/** Turns one event into what is drawn. Nothing here decides a rule of the game. */
export function reduce(view: LiveView, msg: Msg): LiveView {
  switch (msg.type) {
    case "link":
      return {
        ...view,
        link: msg.link,
        retryIn: msg.retryIn ?? 0,
        closed: msg.closed === undefined ? view.closed : msg.closed,
      };
    case "game": {
      const positions = Object.fromEntries(msg.players.map((p) => [p, msg.map.start]));
      return {
        ...START,
        link: view.link,
        game: {
          id: msg.game_id,
          mode: msg.mode,
          playedBy: msg.played_by,
          dawn: msg.dawn,
          map: msg.map,
          players: msg.players,
          wrecker: msg.wrecker,
        },
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
        trail: { ...view.trail, [msg.tick]: msg.positions },
        out,
        meeting: null,
        log: lines.length ? keep(view.log, ...lines) : view.log,
      };
    }
    case "meeting": {
      if (!view.game) return view;
      const start = view.game.map.start;
      const gone = Object.keys(msg.out);
      const alive = Object.keys(view.positions).filter((p) => !gone.includes(p));
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
        out: gone.filter((p) => msg.out[p] === "taken"),
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
    case "end": {
      const reason = WHY[msg.reason] ?? "";
      const said =
        msg.winner === null
          ? reason
          : `${msg.winner === "keepers" ? "The keepers win" : "The wrecker wins"}. ${reason}`;
      return { ...view, phase: "over", end: { winner: msg.winner, reason }, log: keep(view.log, said) };
    }
    case "intermission":
      return {
        ...view,
        phase: "intermission",
        next: { at: Date.now() + msg.seconds * 1000, mode: msg.next_mode, left: msg.live_games_left_today },
      };
    case "notice":
      return { ...view, notice: msg.text };
    case "closed":
      return { ...view, link: "idle", closed: msg.text };
  }
}

type Send = (m: Msg) => void;
type Stop = () => void;

/**
 * Plays the made-up sample game once, with the server's pauses. Dev server
 * only. ?fast=1 divides every pause by 20, so a browser test sees the whole
 * game in a few seconds.
 */
function playSample(send: Send, done: () => void): Stop {
  let stopped = false;
  let timer = 0;
  const pace = devParam("fast") === "1" ? 20 : 1;
  send({ type: "link", link: "connecting", closed: null });
  void import("./sample").then(({ sampleGame }) => {
    if (stopped) return;
    const steps = sampleGame();
    let i = 0;
    const next = () => {
      if (stopped || i >= steps.length) return;
      const { event, wait } = steps[i++];
      send(event);
      if (event.type === "end") {
        done();
        return;
      }
      timer = window.setTimeout(next, wait / pace);
    };
    send({ type: "link", link: "open" });
    next();
  });
  return () => {
    stopped = true;
    window.clearTimeout(timer);
  };
}

/**
 * Listens to the live stream for one game. EventSource reconnects by itself
 * after a dropped line and sends Last-Event-ID, and the server resumes; when
 * the server is gone altogether it closes, and this tries again with a growing
 * wait, saying so on the page rather than going blank. The line is closed by
 * the caller after `end` or `closed`.
 */
function listen(base: string, send: Send, done: () => void): Stop {
  let source: EventSource | null = null;
  let timer = 0;
  let tick = 0;
  let wait = 2;
  let stopped = false;

  const open = () => {
    send({ type: "link", link: "connecting", closed: null });
    source = new EventSource(`${base}/live`);
    source.onopen = () => {
      wait = 2;
      send({ type: "link", link: "open" });
    };
    for (const type of EVENT_TYPES) {
      source.addEventListener(type, (e) => {
        let event: GameEvent;
        try {
          event = { ...(JSON.parse((e as MessageEvent<string>).data) as object), type } as GameEvent;
        } catch {
          // A malformed event is skipped rather than allowed to stop the stream.
          return;
        }
        send(event);
        if (event.type === "end" || event.type === "closed") done();
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

/**
 * Nothing connects until the reader presses Watch, so a tab left open
 * overnight, or a crawler that runs script, never starts a game. One game per
 * press: the line closes after `end`, and when the tab goes to the background.
 */
export function useLiveGame(): { view: LiveView; watch: () => void } {
  const [view, send] = useReducer(reduce, { ...START, link: canWatch() ? "idle" : "off" });
  const stop = useRef<Stop | null>(null);

  const hangUp = useCallback((closed?: string) => {
    stop.current?.();
    stop.current = null;
    send({ type: "link", link: "idle", ...(closed ? { closed } : {}) });
  }, []);

  const watch = useCallback(() => {
    stop.current?.();
    const done = () => {
      stop.current?.();
      stop.current = null;
      send({ type: "link", link: "idle" });
    };
    const api = serverUrl();
    if (devParam("feed") === "sample") stop.current = playSample(send, done);
    else if (api) stop.current = listen(api, send, done);
  }, []);

  useEffect(() => {
    const away = () => {
      if (document.visibilityState === "hidden" && stop.current) {
        hangUp("Stopped watching while this tab was in the background.");
      }
    };
    document.addEventListener("visibilitychange", away);
    return () => {
      document.removeEventListener("visibilitychange", away);
      stop.current?.();
    };
  }, [hangUp]);

  return { view, watch };
}

/**
 * The server to watch. On the dev server only, ?api=http://localhost:8000
 * points the page at a local `uv run serve`, and ?feed=sample at the
 * hand-written game; the built page uses config.ts and nothing else.
 */
function devParam(name: string): string | null {
  if (!import.meta.env.DEV || typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

const serverUrl = () => devParam("api") || DEADPAN_API;

/** Whether the Watch button can do anything here: a server address, or the dev sample. */
export function canWatch(): boolean {
  return Boolean(serverUrl()) || devParam("feed") === "sample";
}
