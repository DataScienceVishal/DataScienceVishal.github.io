import { Component, type ReactNode } from "react";

/**
 * Keeps one broken decoration from taking the page with it.
 *
 * React 19 unmounts the whole root on an uncaught render error, so before this
 * existed a rejected `lazy()` import, a 404 on a .glb, a Draco decode failure
 * or a lost WebGL context would replace the entire portfolio with a blank dark
 * screen. Suspense does not help: it catches the pending state, not the thrown
 * one. Everything it wraps here is ornamental, and the page reads fine without
 * any of it, so the correct behaviour on failure is to render nothing and keep
 * going.
 *
 * `fallback` exists for the cases where the surrounding layout reserves space
 * and an empty hole would be worse than a caption: see ModelViewport.
 */
export class Boundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // Not swallowed silently. Nobody is watching a console on a portfolio, but
    // the one person who might is the author, and a silent failure here is the
    // kind that survives a deploy.
    console.error("A decorative subtree failed and was dropped:", error);
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
