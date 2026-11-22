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
