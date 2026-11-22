/**
 * A short made-up game, for working on this page before the server exists. It
 * is not a recorded game and nothing in it was played by a model: the moves,
 * claims and votes were written by hand to exercise every event the page
 * draws. It loads only with ?feed=sample on the dev server, and never ships
 * as the feed of the built page.
 */
import type { Action, GameEvent, Verdict } from "./types";

const G = "sample-1";
const PLAYERS = ["Ada", "Bram", "Cleo", "Dev", "Esme", "Finn"];

const MAP = {
  name: "rock-light",
  start: "Cottage",
  rooms: {
    Cottage: ["Kitchen", "Stairwell", "Yard"],
    Kitchen: ["Cottage", "Oil Store"],
    "Oil Store": ["Kitchen", "Stairwell"],
    Stairwell: ["Cottage", "Oil Store", "Lamp Room"],
    "Lamp Room": ["Stairwell"],
    Yard: ["Cottage", "Workshop", "Boathouse"],
    Workshop: ["Yard", "Boathouse"],
    Boathouse: ["Yard", "Workshop", "Jetty"],
    Jetty: ["Boathouse"],
  },
  layout: {
    "Lamp Room": [2, 0],
    Stairwell: [2, 1],
    "Oil Store": [1, 1],
    Kitchen: [1, 2],
    Cottage: [2, 2],
    Yard: [2, 3],
    Workshop: [3, 3],
    Boathouse: [2, 4],
    Jetty: [1, 4],
  },
} as Extract<GameEvent, { type: "game" }>["map"];

type Row<T = string> = [T, T, T, T, T, T];

/** Where each player is after a tick, in PLAYERS order, and what they did. */
const TICKS: { at: Row; did: Row<Action>; jobs: number[] }[] = [
  { at: ["Kitchen", "Yard", "Stairwell", "Cottage", "Yard", "Yard"], did: ["move", "move", "move", "work", "move", "move"], jobs: [0, 0, 0, 1, 0, 0] },
  { at: ["Oil Store", "Boathouse", "Lamp Room", "Workshop", "Yard", "Boathouse"], did: ["move", "move", "move", "move", "work", "move"], jobs: [0, 0, 0, 1, 1, 0] },
  { at: ["Oil Store", "Boathouse", "Lamp Room", "Workshop", "Cottage", "Boathouse"], did: ["work", "wait", "work", "work", "move", "work"], jobs: [1, 0, 1, 1, 1, 0] },
  { at: ["Kitchen", "Boathouse", "Lamp Room", "Workshop", "Cottage", "Boathouse"], did: ["move", "eliminate", "work", "work", "wait", "wait"], jobs: [1, 0, 2, 2, 1, 0] },
  { at: ["Kitchen", "Jetty", "Lamp Room", "Boathouse", "Cottage", "Boathouse"], did: ["work", "move", "work", "move", "wait", "wait"], jobs: [2, 0, 3, 2, 1, 0] },
];

const claim = (tick: number, room: string, saw: string[], verdict: Verdict = "true") => ({ tick, room, saw, verdict });

export function sampleGame(): { event: GameEvent; wait: number }[] {
  const out: { event: GameEvent; wait: number }[] = [];
  const push = (event: GameEvent, wait: number) => out.push({ event, wait });

  push({ type: "game", game_id: G, mode: "live", seed: 0, map: MAP, players: PLAYERS, wrecker: "Bram" }, 1500);

  TICKS.forEach((t, i) => {
    const tick = i + 1;
    const positions: Record<string, string> = {};
    const actions: Record<string, Action> = {};
    const jobs: Record<string, [number, number]> = {};
    PLAYERS.forEach((p, k) => {
      if (tick >= 4 && p === "Finn") return;
      positions[p] = t.at[k];
      actions[p] = t.did[k];
      if (p !== "Bram") jobs[p] = [t.jobs[k], 4];
    });
    push(
      {
        type: "tick",
        game_id: G,
        tick,
        positions,
        bodies: tick >= 4 ? { Boathouse: ["Finn"] } : {},
        actions,
        strikes: tick === 4 ? [{ by: "Bram", target: "Finn", room: "Boathouse", witnesses: [] }] : [],
        found: tick === 5 ? { by: "Dev", body: "Finn", room: "Boathouse" } : null,
        jobs,
      },
      1200,
    );
  });

  push({ type: "meeting", game_id: G, number: 1, tick: 5, called_by: "Dev", cause: "body", body: "Finn", body_room: "Boathouse", out: ["Finn"] }, 1500);

  const said: [string, ReturnType<typeof claim>[], string | null, string][] = [
    ["Dev", [claim(2, "Workshop", []), claim(5, "Boathouse", [])], null, "Finn was in the Boathouse when I came through from the Workshop. I passed nobody."],
    ["Ada", [claim(2, "Oil Store", []), claim(4, "Kitchen", [])], null, "Oil Store, then the Kitchen. I was on my own both times."],
    ["Bram", [claim(2, "Workshop", [], "false_place"), claim(4, "Jetty", [], "false_place")], "Dev", "Workshop, then the Jetty. Dev found the body and he was the closest to it."],
    ["Cleo", [claim(3, "Lamp Room", [])], "Bram", "I was trimming the wick. Esme saw Bram and Finn leave the Yard together."],
    ["Esme", [claim(1, "Yard", ["Bram", "Finn"]), claim(2, "Yard", [])], "Bram", "Bram and Finn were with me in the Yard and went off together."],
  ];
  for (const [name, claims, suspect, speech] of said) {
    push({ type: "thinking", game_id: G, name, phase: "speak" }, 2200);
    push({ type: "statement", game_id: G, name, claims, suspect, speech, fallback: false }, 2600);
  }

  const votes = [
    { name: "Dev", choice: "Bram", reason: "I was in the Workshop at tick 2 and he was not." },
    { name: "Ada", choice: "skip", reason: "Nothing I saw points at anyone." },
    { name: "Bram", choice: "Dev", reason: "He was nearest the body." },
    { name: "Cleo", choice: "Bram", reason: "Esme puts him with Finn." },
    { name: "Esme", choice: "Bram", reason: "He left the Yard with Finn." },
  ];
  for (const v of votes) {
    push({ type: "thinking", game_id: G, name: v.name, phase: "vote" }, 1100);
    push({ type: "voted", game_id: G, name: v.name }, 500);
  }
  push({ type: "result", game_id: G, votes, tally: { Bram: 3, Dev: 1, skip: 1 }, ejected: "Bram", ejected_role: "wrecker" }, 4000);
  push({ type: "end", game_id: G, winner: "keepers", reason: "The wrecker was sent ashore.", tick: 5 }, 4000);
  push({ type: "intermission", game_id: G, seconds: 20, next_mode: "live", live_games_left_today: 7 }, 20000);
  return out;
}
