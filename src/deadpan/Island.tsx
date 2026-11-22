import { m } from "motion/react";
import { BADGES, type Badge } from "./emoji";
import { ISLAND } from "./map";
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
const slot = (i: number) => ({ x: 30 + (i % 3) * 56, y: 54 + Math.floor(i / 3) * 42 });

const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

function badgeFor(view: LiveView, name: string): Badge | null {
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
    const [c, r] = map.layout[name];
    const x = SHORE + (c - minC) * CELL_W + (CELL_W - ROOM_W) / 2;
    const y = SHORE + (r - minR) * CELL_H + (CELL_H - ROOM_H) / 2;
    return { x, y, cx: x + ROOM_W / 2, cy: y + ROOM_H / 2 };
  };

  const corridors: [string, string][] = [];
  for (const [a, exits] of Object.entries(map.rooms)) {
    for (const b of exits) if (a < b && map.layout[a] && map.layout[b]) corridors.push([a, b]);
  }

  // Who stands where: the living in seat order, then any bodies.
  const spots: Record<string, { x: number; y: number }> = {};
  const bodySpots: { name: string; x: number; y: number }[] = [];
  for (const name of Object.keys(map.layout)) {
    const here = players.filter((p) => view.positions[p] === name);
    const bodies = view.bodies[name] ?? [];
    const box = room(name);
    here.forEach((p, i) => {
      const s = slot(i);
      spots[p] = { x: box.x + s.x, y: box.y + s.y };
    });
    bodies.forEach((p, i) => {
      const s = slot(here.length + i);
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
              fill="var(--paper)"
              stroke="var(--ink)"
              strokeWidth={start ? 2.5 : 1}
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

      {bodySpots.map((b) => (
        <g key={`body-${b.name}`} transform={`translate(${b.x} ${b.y})`}>
          <rect x={-TAG_W / 2} y={-TAG_H / 2} width={TAG_W} height={TAG_H} fill="var(--paper)" stroke="var(--pencil)" strokeDasharray="3 2" />
          <text y="4.5" textAnchor="middle" className="island__tag island__tag--out" fill="var(--pencil)">
            {b.name}
          </text>
          <text y={-TAG_H / 2 - 5} textAnchor="middle" fontSize="16" fontFamily={EMOJI_FONT}>
            {BADGES.out.char}
          </text>
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
              <text y={-TAG_H / 2 - 5} textAnchor="middle" fontSize="17" fontFamily={EMOJI_FONT}>
                <title>{BADGES[badge].label}</title>
                {BADGES[badge].char}
              </text>
            ) : null}
          </m.g>
        );
      })}
    </svg>
  );
}
