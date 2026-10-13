import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The scroll effects, in one module that ScrollEffects imports lazily, so GSAP
 * and ScrollTrigger land in their own chunk and never on the first paint.
 *
 * Every effect starts from the finished drawing. The markup ships with the
 * margin rule solid, every figure drawn and every highlight laid down, so a
 * reader without script, with reduced motion, or whose connection has not
 * fetched this chunk yet sees the whole page. What this adds is the drawing of
 * it as the reader arrives, tied to scroll position, so it runs backwards when
 * they scroll back up.
 *
 * Anything already on screen when this starts is left alone. Undrawing a figure
 * the reader is looking at, so that it can be drawn again, would be the page
 * taking something away to give it back.
 */

gsap.registerPlugin(ScrollTrigger);

/** The parts that are scaled into place. The travelling mark moves through --at instead. */
const SCALED = '[data-ink]:not([data-ink="travel"])';

const onScreen = (el: Element) => el.getBoundingClientRect().top < window.innerHeight;

/** A. The red margin rule fills down the page as a reading-progress line. */
function marginProgress(sheet: HTMLElement, line: HTMLElement) {
  gsap.fromTo(
    line,
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: "none",
      scrollTrigger: { trigger: sheet, start: "top top", end: "bottom bottom", scrub: 0.3 },
    },
  );
}

/**
 * B. Ink draws a figure: rules ruled out from the left, ticks dropped, boxes
 * and nodes set down, and only then does a measured mark travel from where the
 * expectation was to where the measurement landed. Transform origins are in
 * index.css, so nothing here has to read one back.
 */
function inkFigure(figure: HTMLElement) {
  // Hands the figure's travelling mark from its CSS scroll timeline to this one.
  figure.dataset.inked = "";
  const tl = gsap.timeline({
    scrollTrigger: { trigger: figure, start: "top 88%", end: "top 45%", scrub: 0.4 },
    defaults: { ease: "power2.out" },
  });

  // Not every figure has every kind of part, and GSAP warns on an empty target.
  const draw = (kind: string, vars: gsap.TweenVars, at: number) => {
    const parts = figure.querySelectorAll<HTMLElement>(`[data-ink="${kind}"]`);
    if (parts.length) tl.from(parts, vars, at);
  };
  draw("rule-x", { scaleX: 0, duration: 1, stagger: 0.08 }, 0);
  draw("rule-y", { scaleY: 0, duration: 1 }, 0);
  draw("box", { scale: 0, duration: 0.35, stagger: 0.025 }, 0.1);
  draw("node", { scale: 0, duration: 0.3, stagger: 0.07 }, 0.2);
  draw("drop", { scaleY: 0, duration: 0.35 }, 0.6);

  // In track widths, the unit the figure's own --from and --to are written in,
  // so the mark lands right at any width without being measured.
  const travel = figure.querySelectorAll<HTMLElement>('[data-ink="travel"]');
  if (travel.length) {
    const read = (name: string) => (_i: number, el: HTMLElement) => Number(el.style.getPropertyValue(name));
    tl.fromTo(travel, { "--at": read("--from") }, { "--at": read("--to"), duration: 1.1, ease: "power3.out" }, 0.9);
  }
}

/** C. A highlighter stroke on the one measured phrase in each entry. */
function highlight(mark: HTMLElement) {
  gsap.fromTo(
    mark,
    { backgroundSize: "0% 62%" },
    {
      backgroundSize: "100% 62%",
      ease: "none",
      scrollTrigger: { trigger: mark, start: "top 78%", end: "top 52%", scrub: true },
    },
  );
}

/**
 * Starts every effect and returns the function that undoes them.
 *
 * Everything is read before anything is written. GSAP reads an element's
 * transform the first time it touches it, and a read that follows another
 * element's write makes the browser lay the page out again first. Part by part
 * that was a fresh layout for each of some fifty parts, a fifth of a second of
 * blocked main thread on a slow phone.
 */
export function startEffects(): () => void {
  const root = document.documentElement;
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const sheet = document.querySelector<HTMLElement>("main.sheet");
    const line = sheet?.querySelector<HTMLElement>(".sheet__progress");
    // Shows the progress line, so that it has a box to measure below.
    root.classList.add("fx");

    const figures = gsap.utils.toArray<HTMLElement>("[data-ink-figure]").filter((f) => !onScreen(f));
    const marks = gsap.utils.toArray<HTMLElement>("mark.hl").filter((m) => !onScreen(m));
    if (line) gsap.getProperty(line, "scaleY");
    for (const figure of figures) {
      for (const part of figure.querySelectorAll(SCALED)) gsap.getProperty(part, "scaleX");
    }

    // Nothing here pins, so the order these are made in cannot shift another's start.
    if (sheet && line) marginProgress(sheet, line);
    figures.forEach(inkFigure);
    marks.forEach(highlight);

    return () => {
      root.classList.remove("fx");
      for (const figure of figures) delete figure.dataset.inked;
    };
  });

  // Faces change line heights, and with them every trigger position. They are
  // preloaded, so by now they have usually arrived, and a refresh would only
  // measure the whole page again for nothing.
  if (document.fonts && document.fonts.status !== "loaded") {
    void document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  return () => mm.revert();
}
