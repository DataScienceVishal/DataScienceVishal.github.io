"use client";

import { useEffect, useState } from "react";

interface Readings {
  lcp?: number;
  cls?: number;
  inp?: number;
}

/**
 * The page measuring itself, in the reader's own browser, on this visit.
 *
 * The README quotes Lighthouse scores, which are a lab run on someone else's
 * machine. This is the field version, and anyone can check it: largest paint,
 * layout shift, and the slowest response to a click or a key so far. The
 * library loads after the page has, in its own small chunk, and nothing is
 * sent anywhere. It only prints.
 */
export function VisitReadout() {
  const [r, setR] = useState<Readings>({});

  useEffect(() => {
    let live = true;
    const start = () => {
      void import("web-vitals").then(({ onCLS, onINP, onLCP }) => {
        if (!live) return;
        onLCP((m) => setR((p) => ({ ...p, lcp: m.value })), { reportAllChanges: true });
        onCLS((m) => setR((p) => ({ ...p, cls: m.value })), { reportAllChanges: true });
        onINP((m) => setR((p) => ({ ...p, inp: m.value })), {
          reportAllChanges: true,
          durationThreshold: 16,
        });
      });
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      live = false;
      window.removeEventListener("load", start);
    };
  }, []);

  const lcp = r.lcp === undefined ? "measuring" : `${(r.lcp / 1000).toFixed(1)} s`;
  const cls = r.cls === undefined ? "measuring" : r.cls.toFixed(2);
  const inp = r.inp === undefined ? "none yet" : `${Math.round(r.inp)} ms`;

  return (
    <div className="t-furniture-sm needs-js mt-6 max-w-[40rem] text-pencil">
      <p className="text-ink-soft">This visit, measured by your browser</p>
      <dl className="mt-1 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-1">
        <dt>Largest paint</dt>
        <dd className="tabular text-ink">{lcp}</dd>
        <dt>Layout shift</dt>
        <dd className="tabular text-ink">{cls}</dd>
        <dt>Slowest response to a click or key</dt>
        <dd className="tabular text-ink">{inp}</dd>
      </dl>
    </div>
  );
}
