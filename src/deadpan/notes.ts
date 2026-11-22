/**
 * What a meeting's statements prove, worked out in the page from the events
 * the server already sends. Every claim arrives with refuted_by, the claim
 * checker's own list of keepers whose sightings disprove it, so nothing here
 * repeats the checker's rule; it only gathers its answers.
 */
import type { Statement } from "./useLiveGame";

/**
 * Keepers holding proof that the wrecker lied in this meeting: everyone in
 * refuted_by on any of the wrecker's claims, whatever its verdict, in the
 * order they first appear. An omission of a player still in the game counts,
 * as it does for the checker.
 */
export function holdersOf(statements: Statement[], wrecker: string): string[] {
  const seen: string[] = [];
  for (const s of statements) {
    if (s.name !== wrecker) continue;
    for (const c of s.claims) {
      for (const name of c.refuted_by) if (!seen.includes(name)) seen.push(name);
    }
  }
  return seen;
}

/** Where each player stood after each tick: tick to player to room. */
export type Trail = Record<number, Record<string, string>>;

/** A note written on one room of the map, for one tick. */
export interface RoomNote {
  room: string;
  tick: number;
  lines: string[];
}

/** "Ada", "Ada and Dev", "Ada, Dev and Esme", as the page's log joins names. */
const list = (names: string[]) =>
  names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

/**
 * The wrecker's disproved claims, written as notes on the rooms they are
 * about, in the claim's own terms. Only claims with someone in refuted_by
 * are written, so a meeting where the wrecker says nothing disprovable
 * writes nothing. Where a line needs to know where someone stood and the
 * trail lacks that tick (a viewer who joined part way through), only that
 * line is left out. Notes for one room and tick are merged, and the notes
 * come back in tick order.
 */
export function lieNotes(statements: Statement[], wrecker: string, trail: Trail): RoomNote[] {
  const notes: RoomNote[] = [];
  const write = (room: string, tick: number, lines: string[]) => {
    if (!lines.length) return;
    const same = notes.find((n) => n.room === room && n.tick === tick);
    if (same) same.lines.push(...lines);
    else notes.push({ room, tick, lines: [...lines] });
  };

  for (const s of statements) {
    if (s.name !== wrecker) continue;
    for (const c of s.claims) {
      if (!c.refuted_by.length) continue;
      const at = trail[c.tick];
      const said = c.saw.length ? `saw ${list(c.saw)}` : "alone";

      if (c.verdict === "false_place") {
        const lines = [`${wrecker}: here, ${said}, tick ${c.tick}.`, "False."];
        if (at) {
          for (const h of c.refuted_by) {
            if (at[h] !== c.room) continue;
            const others = Object.keys(at).filter((p) => p !== h && at[p] === c.room);
            lines.push(others.length ? `${h} was here.` : `${h} was here alone.`);
          }
        }
        write(c.room, c.tick, lines);
        const real = [`${wrecker} was here at tick ${c.tick}.`];
        const saw = at ? c.refuted_by.filter((h) => at[h] === c.real_room) : [];
        if (saw.length) real.push(`${list(saw)} saw ${wrecker}.`);
        write(c.real_room, c.tick, real);
      } else if (c.verdict === "invented_sighting") {
        const named = c.saw.filter((p) => c.refuted_by.includes(p));
        write(c.room, c.tick, [`${wrecker}: saw ${list(named.length ? named : c.saw)} here, tick ${c.tick}.`, "False."]);
        for (const p of named) {
          if (at?.[p]) write(at[p], c.tick, [`${p} was here at tick ${c.tick}.`]);
        }
      } else if (c.left_out.length) {
        const seen = c.saw.length ? `saw ${list(c.saw)}` : "saw nobody";
        write(c.room, c.tick, [
          `${wrecker}: here, ${seen}, tick ${c.tick}.`,
          `${list(c.left_out)} ${c.left_out.length > 1 ? "were" : "was"} here too.`,
        ]);
      }
    }
  }
  return notes
    .map((n, i) => ({ n, i }))
    .sort((a, b) => a.n.tick - b.n.tick || a.i - b.i)
    .map(({ n }) => n);
}
