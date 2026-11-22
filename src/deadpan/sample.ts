/**
 * A short made-up game, for working on this page before the server exists. It
 * is not a recorded game and nothing in it was played by a model: the moves,
 * claims and votes were written by hand to exercise every event the page
 * draws. It loads only with ?feed=sample on the dev server, and never ships
 * as the feed of the built page.
 */
import { ISLAND as MAP } from "./map";
import type { Action, GameEvent, Verdict } from "./types";

const G = "sample-1";
const PLAYERS = ["Ada", "Bram", "Cleo", "Dev", "Esme", "Finn"];



type Row<T = string> = [T, T, T, T, T, T];

/** Where each player is after a tick, in PLAYERS order, and what they did. */
const TICKS: { at: Row; did: Row<Action>; jobs: number[] }[] = [
  { at: ["Kitchen", "Yard", "Stairwell", "Cottage", "Yard", "Yard"], did: ["move", "move", "move", "work", "move", "move"], jobs: [0, 0, 0, 1, 0, 0] },
  { at: ["Oil Store", "Boathouse", "Lamp Room", "Workshop", "Yard", "Boathouse"], did: ["move", "move", "move", "move", "work", "move"], jobs: [0, 0, 0, 1, 1, 0] },
  { at: ["Oil Store", "Boathouse", "Lamp Room", "Workshop", "Cottage", "Boathouse"], did: ["work", "wait", "work", "work", "move", "work"], jobs: [1, 0, 1, 1, 1, 0] },
  { at: ["Kitchen", "Boathouse", "Lamp Room", "Workshop", "Cottage", "Boathouse"], did: ["move", "eliminate", "work", "work", "wait", "wait"], jobs: [1, 0, 2, 2, 1, 0] },
  { at: ["Kitchen", "Jetty", "Lamp Room", "Boathouse", "Cottage", "Boathouse"], did: ["work", "move", "work", "move", "wait", "wait"], jobs: [2, 0, 3, 2, 1, 0] },
];

const claim = (
  tick: number,
  room: string,
  saw: string[],
  verdict: Verdict = "true",
  refuted_by: string[] = [],
  left_out: string[] = [],
  real_room = room,
) => ({ tick, room, saw, verdict, refuted_by, left_out, real_room });

export function sampleGame(): { event: GameEvent; wait: number }[] {
  const out: { event: GameEvent; wait: number }[] = [];
  const push = (event: GameEvent, wait: number) => out.push({ event, wait });

  push({ type: "game", game_id: G, mode: "live", played_by: "scripted", seed: 0, dawn: 40, map: MAP, players: PLAYERS, wrecker: "Bram" }, 1500);

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

  push({ type: "meeting", game_id: G, number: 1, tick: 5, called_by: "Dev", cause: "body", body: "Finn", body_room: "Boathouse", out: { Finn: "taken" } }, 1500);

  const said: [string, ReturnType<typeof claim>[], string | null, string][] = [
    ["Dev", [claim(2, "Workshop", []), claim(5, "Boathouse", [])], null, "Finn was in the Boathouse when I came through from the Workshop. I passed nobody."],
    ["Ada", [claim(2, "Oil Store", []), claim(4, "Kitchen", [])], null, "Oil Store, then the Kitchen. I was on my own both times."],
    [
      "Bram",
      [
        // At tick 1 Esme was in the Yard with Bram and Finn; Bram names only Finn.
        claim(1, "Yard", ["Finn"], "omission", ["Esme"], ["Esme"]),
        claim(2, "Workshop", [], "false_place", ["Dev"], [], "Boathouse"),
        // At tick 4 Ada was in the Kitchen, not the Boathouse.
        claim(4, "Boathouse", ["Ada"], "invented_sighting", ["Ada"]),
      ],
      "Dev",
      "Yard with Finn, then the Workshop. Ada was at the Boathouse when Finn was there. Dev found the body first.",
    ],
    ["Cleo", [claim(3, "Lamp Room", [])], "Bram", "I was trimming the wick. Dev says the Workshop was empty when Bram says he was there."],
    // Finn was taken out before the meeting, so leaving him out is allowed.
    ["Esme", [claim(1, "Yard", ["Bram"]), claim(2, "Yard", [])], "Bram", "Bram was with me in the Yard at the start and went off towards the water."],
  ];
  for (const [name, claims, suspect, speech] of said) {
    push({ type: "thinking", game_id: G, name, phase: "speak" }, 2200);
    push({ type: "statement", game_id: G, name, claims, suspect, speech, fallback: false }, 2600);
  }

  const votes = [
    { name: "Dev", choice: "Bram", reason: "I was in the Workshop at tick 2 and he was not." },
    { name: "Ada", choice: "skip", reason: "Bram has me at the Boathouse, which is wrong, but a wrong tick is not proof." },
    { name: "Bram", choice: "Dev", reason: "He was nearest the body." },
    { name: "Cleo", choice: "Bram", reason: "Dev was in the Workshop and did not see him." },
    { name: "Esme", choice: "Bram", reason: "I was in the Yard with him at tick 1 and he left me out." },
  ];
  for (const v of votes) {
    push({ type: "thinking", game_id: G, name: v.name, phase: "vote" }, 1100);
    push({ type: "voted", game_id: G, name: v.name }, 500);
  }
  push({ type: "result", game_id: G, votes, tally: { Bram: 3, Dev: 1, skip: 1 }, ejected: "Bram", ejected_role: "wrecker" }, 4000);
  push({ type: "end", game_id: G, winner: "keepers", reason: "sent ashore", tick: 5 }, 4000);
  push({ type: "intermission", game_id: G, seconds: 20, next_mode: "live", live_games_left_today: 7 }, 20000);
  return out;
}
