import { m } from "motion/react";
import { MarkSvg, type Mark } from "./marks";
import { ISLAND } from "./map";
import { lieNotes } from "./notes";
import type { MapInfo } from "./types";
import type { LiveView } from "./useLiveGame";

/**
 * The island, drawn the way it would be sketched in the notebook: rooms as
 * ruled boxes on bare paper, the sea hatched in pencil around them, corridors
 * as ink lines. Players are name tags that walk between rooms; the wrecker's
 * tag is inked in, so who it is never rests on colour alone.
 */
const CELL_W = 200;
const CELL_H = 134;
const ROOM_W = 172;
const ROOM_H = 112;
const SHORE = 18;
const TAG_W = 50;
const TAG_H = 20;
/** Three tags a row, two rows: six players fit in one room. */
const slot = (i: number, top = 54) => ({ x: 30 + (i % 3) * 56, y: top + Math.floor(i / 3) * 42 });

/** The notes a lie leaves on a room: furniture-small lines under the room's name. */
const NOTE_LINE = 13;
const NOTE_TOP = 36;
/** About this many characters fit across a room at the note's size. */
const NOTE_CHARS = 31;

function wrap(text: string): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && (line + " " + word).length > NOTE_CHARS) {
      out.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) out.push(line);
  return out;
}

/** A room's size on the drawn map, for tests that check what lands inside one. */
export const ROOM = { w: ROOM_W, h: ROOM_H };

/** The top-left corner of a cell's room box, in the map's own units. */
function cellBox(map: MapInfo, c: number, r: number) {
  const cells = Object.values(map.layout);
  const minC = Math.min(...cells.map(([col]) => col));
  const minR = Math.min(...cells.map(([, row]) => row));
  return {
    x: SHORE + (c - minC) * CELL_W + (CELL_W - ROOM_W) / 2,
    y: SHORE + (r - minR) * CELL_H + (CELL_H - ROOM_H) / 2,
  };
}

export function roomBox(map: MapInfo, name: string) {
  const [c, r] = map.layout[name];
  return cellBox(map, c, r);
}

/**
 * Where each room's notes are written. In an empty room they go inside it,
 * under its name. A room with players in it, which in a meeting is always the
 * start room, keeps its tags where they are and has its notes written in a
 * box on the nearest patch of sea beside it, so the notes never push a tag out
 * of the room or sit under one. With no free patch next to it, the notes stay
 * inside and the tags squeeze below them.
 */
export function placeNotes(map: MapInfo, noted: string[], occupied: string[]) {
  const cells = Object.values(map.layout);
  const minC = Math.min(...cells.map(([c]) => c));
  const maxC = Math.max(...cells.map(([c]) => c));
  const minR = Math.min(...cells.map(([, r]) => r));
  const maxR = Math.max(...cells.map(([, r]) => r));
  const taken = new Set(cells.map(([c, r]) => `${c},${r}`));
  const used = new Set<string>();
  const place: Record<string, { x: number; y: number; outside: boolean }> = {};
  for (const name of noted) {
    const [c, r] = map.layout[name];
    if (occupied.includes(name)) {
      const free = [
        [c + 1, r],
        [c - 1, r],
        [c, r + 1],
        [c, r - 1],
      ].find(([nc, nr]) => nc >= minC && nc <= maxC && nr >= minR && nr <= maxR && !taken.has(`${nc},${nr}`) && !used.has(`${nc},${nr}`));
      if (free) {
        used.add(`${free[0]},${free[1]}`);
        place[name] = { ...cellBox(map, free[0], free[1]), outside: true };
        continue;
      }
    }
    place[name] = { ...roomBox(map, name), outside: false };
  }
  return place;
}

function badgeFor(view: LiveView, name: string): Mark | null {
  const { meeting, end, game } = view;
  if (end && game) {
    if (end.winner === null) return null;
    const won = end.winner === "wrecker" ? name === game.wrecker : name !== game.wrecker;
    return won ? "won" : null;
  }
  if (meeting) {
    if (meeting.thinking?.name === name) return "thinking";
    if (meeting.result) {
      const vote = meeting.result.votes.find((v) => v.name === name);
      return vote ? (vote.choice === "skip" ? "skip" : "voted") : null;
    }
    if (meeting.voted.includes(name)) return "voted";
    const last = meeting.statements[meeting.statements.length - 1];
    if (!meeting.thinking && meeting.voted.length === 0 && last?.name === name) {
      return last.suspect ? "suspect" : "speaking";
    }
    return null;
  }
  if (view.strike?.by === name) return "strike";
  if (view.strike?.witnesses.includes(name)) return "witness";
  if (view.found?.by === name) return "found";
  const act = view.actions[name];
  if (act === "ring") return "ring";
  if (act === "work") return "work";
  return null;
}

export function Island({ view }: { view: LiveView }) {
  const map = view.game?.map ?? ISLAND;
  const players = view.game?.players ?? [];
  const wrecker = view.game?.wrecker ?? "";

  const cells = Object.values(map.layout);
  const minC = Math.min(...cells.map(([c]) => c));
  const maxC = Math.max(...cells.map(([c]) => c));
  const minR = Math.min(...cells.map(([, r]) => r));
  const maxR = Math.max(...cells.map(([, r]) => r));
  const width = (maxC - minC + 1) * CELL_W + SHORE * 2;
  const height = (maxR - minR + 1) * CELL_H + SHORE * 2;

  const room = (name: string) => {
    const { x, y } = roomBox(map, name);
    return { x, y, cx: x + ROOM_W / 2, cy: y + ROOM_H / 2 };
  };

  const corridors: [string, string][] = [];
  for (const [a, exits] of Object.entries(map.rooms)) {
    for (const b of exits) if (a < b && map.layout[a] && map.layout[b]) corridors.push([a, b]);
  }

  // While a meeting is open, the wrecker's disproved claims are written on the
  // rooms they are about. The claim lines in the meeting column carry the same
  // facts for assistive technology, so the notes are hidden from it.
  const meetingOpen = view.meeting && !view.meeting.result && view.game;
  const notes = meetingOpen ? lieNotes(view.meeting!.statements, wrecker, view.trail) : [];
  const written: Record<string, { text: string; claim: boolean }[]> = {};
  for (const n of notes) {
    for (const line of n.lines) {
      const claim = line.includes(": ") || line === "False.";
      for (const part of wrap(line)) (written[n.room] ??= []).push({ text: part, claim });
    }
  }
  const claimedFalsely = new Set(
    meetingOpen
      ? view.meeting!.statements
          .filter((s) => s.name === wrecker)
          .flatMap((s) => s.claims.filter((c) => c.verdict === "false_place" && c.refuted_by.length).map((c) => c.room))
      : [],
  );
  const occupied = Object.keys(map.layout).filter(
    (name) => players.some((p) => view.positions[p] === name) || (view.bodies[name] ?? []).length > 0,
  );
  const place = placeNotes(map, Object.keys(written), occupied);
  /**
   * Where a room's tags start: under notes written inside it, when it has any,
   * and never so low that the second row leaves the room.
   */
  const tagTop = (name: string) => {
    if (!written[name] || place[name]?.outside) return 54;
    const below = NOTE_TOP + written[name].length * NOTE_LINE + 22;
    const rows = Math.ceil(
      (players.filter((p) => view.positions[p] === name).length + (view.bodies[name] ?? []).length) / 3,
    );
    return Math.min(below, ROOM_H - TAG_H / 2 - 2 - Math.max(rows - 1, 0) * 42);
  };

  // Who stands where: the living in seat order, then any bodies.
  const spots: Record<string, { x: number; y: number }> = {};
  const bodySpots: { name: string; x: number; y: number }[] = [];
  for (const name of Object.keys(map.layout)) {
    const here = players.filter((p) => view.positions[p] === name);
    const bodies = view.bodies[name] ?? [];
    const box = room(name);
    here.forEach((p, i) => {
      const s = slot(i, tagTop(name));
      spots[p] = { x: box.x + s.x, y: box.y + s.y };
    });
    bodies.forEach((p, i) => {
      const s = slot(here.length + i, tagTop(name));
      bodySpots.push({ name: p, x: box.x + s.x, y: box.y + s.y });
    });
  }

  const meeting = view.meeting;
  const last = meeting?.statements[meeting.statements.length - 1];
  const accusing =
    meeting && !meeting.thinking && meeting.voted.length === 0 && !meeting.result && last?.suspect && spots[last.name] && spots[last.suspect]
      ? { from: spots[last.name], to: spots[last.suspect] }
      : null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="block h-auto w-full"
      role="img"
      aria-labelledby="island-title"
    >
      <title id="island-title">
        {(view.game ? `The island at tick ${view.tick}. ` : "The island, before a game. ") +
          players
            .filter((p) => view.positions[p])
            .map((p) => `${p} in the ${view.positions[p]}`)
            .join(", ") +
          "."}
      </title>
      <defs>
        <pattern id="sea" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="var(--pencil)" strokeWidth="1" opacity="0.55" />
        </pattern>
        <pattern id="lie" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
          <rect width="6" height="6" fill="var(--paper)" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--margin)" strokeWidth="1" opacity="0.5" />
        </pattern>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink)" />
        </marker>
      </defs>

      <rect width={width} height={height} fill="url(#sea)" />
      {Object.keys(map.layout).map((name) => {
        const [c, r] = map.layout[name];
        return (
          <rect
            key={`land-${name}`}
            x={(c - minC) * CELL_W}
            y={(r - minR) * CELL_H}
            width={CELL_W + SHORE * 2}
            height={CELL_H + SHORE * 2}
            fill="var(--paper)"
          />
        );
      })}

      {corridors.map(([a, b]) => {
        const p = room(a);
        const q = room(b);
        return <line key={`${a}-${b}`} x1={p.cx} y1={p.cy} x2={q.cx} y2={q.cy} stroke="var(--ink-soft)" strokeWidth="2" />;
      })}

      {Object.keys(map.layout).map((name) => {
        const box = room(name);
        const start = name === map.start;
        return (
          <g key={name}>
            <rect
              x={box.x}
              y={box.y}
              width={ROOM_W}
              height={ROOM_H}
              fill={claimedFalsely.has(name) ? "url(#lie)" : "var(--paper)"}
              stroke={written[name] ? "var(--margin)" : "var(--ink)"}
              strokeWidth={written[name] ? 2.5 : start ? 2.5 : 1}
            />
            <text x={box.x + 10} y={box.y + 20} className="island__room" fill="var(--ink)">
              {name}
            </text>
            {start ? (
              <text x={box.x + ROOM_W - 10} y={box.y + 20} textAnchor="end" className="island__note" fill="var(--pencil)">
                bell, meetings
              </text>
            ) : null}
          </g>
        );
      })}

      {Object.keys(written).length ? (
        <g aria-hidden="true">
          {Object.entries(written).map(([name, lines]) => {
            if (!map.layout[name] || !place[name]) return null;
            const at = place[name];
            const home = room(name);
            // Inside the room the notes start under its name; in a box of
            // their own they start at the top.
            const top = at.outside ? 20 : NOTE_TOP;
            const width = Math.max(...lines.map((l) => l.text.length)) * 5.6 + 8;
            return (
              <g key={`notes-${name}`}>
                {at.outside ? (
                  <>
                    {/* From the room's edge facing the box, so it never runs under a tag. */}
                    <line
                      x1={at.x > home.x ? home.x + ROOM_W : at.x < home.x ? home.x : home.cx}
                      y1={at.y > home.y ? home.y + ROOM_H : at.y < home.y ? home.y : home.cy}
                      x2={at.x > home.x ? at.x : at.x < home.x ? at.x + ROOM_W : at.x + ROOM_W / 2}
                      y2={at.y > home.y ? at.y : at.y < home.y ? at.y + ROOM_H : at.y + ROOM_H / 4}
                      stroke="var(--margin)"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                    <rect
                      x={at.x}
                      y={at.y}
                      width={ROOM_W}
                      height={Math.max(ROOM_H / 2, lines.length * NOTE_LINE + 20)}
                      fill="var(--paper)"
                      stroke="var(--margin)"
                      strokeWidth="1.5"
                    />
                  </>
                ) : null}
                {/* Writing sits on bare paper, even inside a hatched room. */}
                <rect
                  x={at.x + 6}
                  y={at.y + top - 10}
                  width={Math.min(width, ROOM_W - 12)}
                  height={lines.length * NOTE_LINE + 4}
                  fill="var(--paper)"
                />
                {lines.map((l, i) => (
                  <text
                    key={i}
                    x={at.x + 10}
                    y={at.y + top + i * NOTE_LINE}
                    className="island__note"
                    fill={l.claim ? "var(--margin)" : "var(--ink-soft)"}
                  >
                    {l.text}
                  </text>
                ))}
              </g>
            );
          })}
        </g>
      ) : null}

      {bodySpots.map((b) => (
        <g key={`body-${b.name}`} transform={`translate(${b.x} ${b.y})`}>
          <rect x={-TAG_W / 2} y={-TAG_H / 2} width={TAG_W} height={TAG_H} fill="var(--paper)" stroke="var(--pencil)" strokeDasharray="3 2" />
          <text y="4.5" textAnchor="middle" className="island__tag island__tag--out" fill="var(--pencil)">
            {b.name}
          </text>
          <MarkSvg mark="out" x={0} y={-TAG_H / 2 - 10} />
        </g>
      ))}

      {accusing ? (
        <line
          x1={accusing.from.x}
          y1={accusing.from.y + TAG_H / 2 + 2}
          x2={accusing.to.x}
          y2={accusing.to.y + TAG_H / 2 + 2}
          stroke="var(--ink)"
          strokeWidth="1.5"
          markerEnd="url(#arrow)"
        />
      ) : null}

      {players.map((p) => {
        const at = spots[p];
        if (!at) return null;
        const isWrecker = p === wrecker;
        const badge = badgeFor(view, p);
        return (
          <m.g key={p} initial={false} animate={{ x: at.x, y: at.y }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
            <rect
              x={-TAG_W / 2}
              y={-TAG_H / 2}
              width={TAG_W}
              height={TAG_H}
              fill={isWrecker ? "var(--ink)" : "var(--paper)"}
              stroke="var(--ink)"
              strokeWidth="1.5"
            />
            <text y="4.5" textAnchor="middle" className="island__tag" fill={isWrecker ? "var(--paper)" : "var(--ink)"}>
              {p}
            </text>
            {badge ? (
              <MarkSvg mark={badge} x={0} y={-TAG_H / 2 - 10} />
            ) : null}
          </m.g>
        );
      })}
    </svg>
  );
}
