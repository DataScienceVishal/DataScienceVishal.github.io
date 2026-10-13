"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const read = (): Theme =>
  document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";

function stored(): Theme | null {
  try {
    const t = localStorage.getItem("theme");
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
}

/** Sets the theme and keeps the browser chrome on the same ground as the page. */
function apply(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  const ground = getComputedStyle(root).getPropertyValue("--paper").trim();
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    meta.setAttribute("content", ground);
  }
}

/**
 * Day page or night page. The head script has already picked one before first
 * paint, from a stored choice or the OS, so this only has to read it.
 *
 * The prerendered button cannot know the theme, so it renders unpressed and
 * corrects itself after hydration rather than mismatching the server markup.
 * Until the reader chooses, an OS change is followed live.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(read());
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const follow = () => {
      if (stored()) return;
      const next: Theme = media.matches ? "dark" : "light";
      apply(next);
      setTheme(next);
    };
    media.addEventListener("change", follow);
    return () => media.removeEventListener("change", follow);
  }, []);

  const dark = theme === "dark";

  const toggle = () => {
    const next: Theme = dark ? "light" : "dark";
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode or blocked storage: the choice holds for this visit only.
    }
    const swap = () => {
      apply(next);
      setTheme(next);
    };
    const doc = document as Document & {
      startViewTransition?: (update: () => void) => unknown;
    };
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (doc.startViewTransition && !still) doc.startViewTransition(swap);
    else swap();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      className="needs-js t-furniture inline-flex items-center gap-2 border border-hair px-3 py-1.5 text-ink-soft transition-colors duration-150 hover:border-ink hover:text-ink aria-pressed:border-ink aria-pressed:text-ink"
    >
      {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      <span>Dark page</span>
    </button>
  );
}
