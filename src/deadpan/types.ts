/**
 * The events the Deadpan server streams from GET /live, as the live-game design
 * lists them. Each arrives as a Server-Sent Event whose event name is `type`
 * and whose data is the JSON payload. The engine is the source of truth; the
 * page only draws what these say.
 */

export type Mode = "live" | "replay";
export type Action = "move" | "work" | "wait" | "ring" | "eliminate";
/** The claim checker's verdicts (deadpan's game/truth.py). */
export type Verdict = "true" | "false_place" | "invented_sighting" | "named_body" | "omission";

export interface MapInfo {
  name: string;
  start: string;
  rooms: Record<string, string[]>;
  /** Room to [column, row] on the drawn map. */
  layout: Record<string, [number, number]>;
}

export interface Claim {
  tick: number;
  room: string;
  saw: string[];
  verdict: Verdict;
}

export interface Strike {
  by: string;
  target: string;
  room: string;
  witnesses: string[];
}

export interface Vote {
  name: string;
  /** A player's name, or "skip". */
  choice: string;
  reason: string;
}

export type GameEvent =
  | { type: "game"; game_id: string; mode: Mode; seed: number; map: MapInfo; players: string[]; wrecker: string }
  | {
      type: "tick";
      game_id: string;
      tick: number;
      positions: Record<string, string>;
      bodies: Record<string, string[]>;
      actions: Record<string, Action>;
      strikes: Strike[];
      found: { by: string; body: string; room: string } | null;
      jobs: Record<string, [number, number]>;
    }
  | {
      type: "meeting";
      game_id: string;
      number: number;
      tick: number;
      called_by: string;
      cause: "body" | "bell";
      body: string | null;
      body_room: string | null;
      out: string[];
    }
  | { type: "thinking"; game_id: string; name: string; phase: "speak" | "vote" }
  | {
      type: "statement";
      game_id: string;
      name: string;
      claims: Claim[];
      suspect: string | null;
      speech: string;
      fallback: boolean;
    }
  | { type: "voted"; game_id: string; name: string }
  | {
      type: "result";
      game_id: string;
      votes: Vote[];
      tally: Record<string, number>;
      ejected: string | null;
      ejected_role: "keeper" | "wrecker" | null;
    }
  | { type: "end"; game_id: string; winner: "keepers" | "wrecker"; reason: string; tick: number }
  | { type: "intermission"; game_id: string; seconds: number; next_mode: Mode; live_games_left_today: number }
  | { type: "notice"; game_id?: string; text: string };

export type EventType = GameEvent["type"];

export const EVENT_TYPES: EventType[] = [
  "game",
  "tick",
  "meeting",
  "thinking",
  "statement",
  "voted",
  "result",
  "end",
  "intermission",
  "notice",
];
