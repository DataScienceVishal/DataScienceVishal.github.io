/**
 * Page one's specks: ink drifting over the paper behind the name and the bio,
 * joined by a faint line wherever two come close, and parting around the
 * pointer. A 2D canvas laid under everything on page one, made here at run
 * time, so the prerendered page and a reader without script never have it.
 *
 * Nothing is left under the writing. Every line of text on page one is erased
 * from the canvas after each frame, so the text always sits on bare paper and
 * keeps exactly the contrast it has without the specks. Dimming them instead did not work:
 * lines meet at the specks they join, and at night a speck where two lines meet
 * took white text down to 4.0:1, under the 4.5:1 floor.
 *
 * It costs nothing on the first paint: it is loaded once the page is idle,
 * never with reduced motion, and it stops whenever page one is off screen or
 * the reader turns reduced motion on. On a touch screen there is no pointer to
 * part around, so it has fewer specks and draws every other frame.
 */

const MAX_SPECK = 0.55;
const MAX_LINE = 0.18;
/** Clear space kept around each line of text, in CSS pixels. */
const MARGIN = 3;
/** One speck per this many square pixels of page, within the bounds below. */
const DENSITY = 9000;
const FEWEST = 40;
const MOST = 140;
/** Radius in CSS pixels that the pointer clears, and how hard it pushes, in px/s. */
const PART = 110;
const PUSH = 144;

interface Speck {
  /** Position as a share of the page's width and height, so a resize keeps the spread. */
  x: number;
  y: number;
  /** Drift in CSS pixels per second, the same in both directions on any shape of page. */
  vx: number;
  vy: number;
  r: number;
  /** Opacity as a share of MAX_SPECK. */
  a: number;
  phase: number;
  /** Pixels pushed aside by the pointer, settling back to zero. */
  ox: number;
  oy: number;
}

function speck(): Speck {
  return {
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 60,
    // A little more up than down, as dust in warm air goes.
    vy: (Math.random() - 0.5) * 60 - 6,
    r: 0.7 + Math.random() * 1.5,
    a: 0.4 + Math.random() * 0.6,
    phase: Math.random() * Math.PI * 2,
    ox: 0,
    oy: 0,
  };
}

const wrap = (v: number) => ((v % 1) + 1) % 1;

export function startSpecks(page: HTMLElement): () => void {
  const canvas = document.createElement("canvas");
  canvas.className = "specks";
  canvas.setAttribute("aria-hidden", "true");
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  page.prepend(canvas);

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const join = coarse ? 72 : 96;
  const root = document.documentElement;
  let ink = "";
  const readInk = () => {
    ink = getComputedStyle(root).getPropertyValue("--ink").trim() || "#1b2a4a";
  };
  readInk();

  let w = 0;
  let h = 0;
  let specks: Speck[] = [];
  /*
    Every line box of text on page one, in canvas pixels, erased after each
    frame is drawn. Erased rather than clipped: an even-odd clip treats the
    overlap of two neighbouring boxes as outside again, and specks were being
    drawn in exactly those overlaps.
  */
  let writing: [number, number, number, number][] = [];
  const outline = () => {
    const box = canvas.getBoundingClientRect();
    const walk = document.createTreeWalker(page, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    const lines: [number, number, number, number][] = [];
    for (let node = walk.nextNode(); node; node = walk.nextNode()) {
      if (!node.textContent?.trim()) continue;
      range.selectNodeContents(node);
      for (const line of range.getClientRects()) {
        lines.push([
          line.left - box.left - MARGIN,
          line.top - box.top - MARGIN,
          line.width + MARGIN * 2,
          line.height + MARGIN * 2,
        ]);
      }
    }
    writing = lines;
  };
  const size = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const want = Math.round(Math.min(MOST, Math.max(FEWEST, (w * h) / DENSITY)) * (coarse ? 0.6 : 1));
    while (specks.length < want) specks.push(speck());
    specks = specks.slice(0, want);
    outline();
  };
  size();
  // Faces that arrive late move every line, and with them the cut-outs.
  void document.fonts?.ready.then(outline);

  const pointer = { x: -1e4, y: -1e4 };
  const move = (event: PointerEvent) => {
    const box = canvas.getBoundingClientRect();
    pointer.x = event.clientX - box.left;
    pointer.y = event.clientY - box.top;
  };
  const leave = () => {
    pointer.x = pointer.y = -1e4;
  };

  const draw = (dt: number, now: number) => {
    // Back to rest over about a second once the pointer has gone.
    const settle = Math.exp(-3.7 * dt);
    for (const s of specks) {
      s.x = wrap(s.x + (s.vx * dt) / (w || 1));
      s.y = wrap(s.y + (s.vy * dt) / (h || 1));
      const dx = s.x * w + s.ox - pointer.x;
      const dy = s.y * h + s.oy - pointer.y;
      const d = Math.hypot(dx, dy);
      if (d < PART && d > 0) {
        const push = (1 - d / PART) * PUSH * dt;
        s.ox += (dx / d) * push;
        s.oy += (dy / d) * push;
      }
      s.ox *= settle;
      s.oy *= settle;
    }

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = ink;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 0.6;
    const join2 = join * join;
    for (let i = 0; i < specks.length; i++) {
      const a = specks[i];
      const ax = a.x * w + a.ox;
      const ay = a.y * h + a.oy;
      for (let j = i + 1; j < specks.length; j++) {
        const b = specks[j];
        const dx = ax - (b.x * w + b.ox);
        const dy = ay - (b.y * h + b.oy);
        const d2 = dx * dx + dy * dy;
        if (d2 >= join2) continue;
        ctx.globalAlpha = (1 - Math.sqrt(d2) / join) * MAX_LINE;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - dx, ay - dy);
        ctx.stroke();
      }
    }
    for (const s of specks) {
      ctx.globalAlpha = s.a * MAX_SPECK * (0.75 + 0.25 * Math.sin(now / 900 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x * w + s.ox, s.y * h + s.oy, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const [x, y, bw, bh] of writing) ctx.clearRect(x, y, bw, bh);
  };

  let frame = 0;
  let last = 0;
  let odd = false;
  let shown = false;
  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    if (coarse && (odd = !odd)) return;
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
    last = now;
    draw(dt, now);
    if (!shown) {
      // Fades in over CSS's transition rather than popping in with the first frame.
      canvas.classList.add("is-on");
      shown = true;
    }
  };
  const start = () => {
    if (frame) return;
    last = 0;
    frame = requestAnimationFrame(tick);
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const seen = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
  seen.observe(page);
  const resize = new ResizeObserver(size);
  resize.observe(canvas);
  // The theme is a data attribute set by the toggle, or the OS when there is none.
  const theme = new MutationObserver(readInk);
  theme.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  const dark = window.matchMedia("(prefers-color-scheme: dark)");
  dark.addEventListener("change", readInk);
  if (!coarse) {
    page.addEventListener("pointermove", move, { passive: true });
    page.addEventListener("pointerleave", leave, { passive: true });
  }
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  const end = () => {
    stop();
    seen.disconnect();
    resize.disconnect();
    theme.disconnect();
    dark.removeEventListener("change", readInk);
    calm.removeEventListener("change", onCalm);
    page.removeEventListener("pointermove", move);
    page.removeEventListener("pointerleave", leave);
    canvas.remove();
  };
  function onCalm() {
    if (calm.matches) end();
  }
  calm.addEventListener("change", onCalm);

  return end;
}
