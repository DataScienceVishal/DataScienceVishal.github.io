/**
 * Runs `run` once the main thread is idle, or after `timeout` ms at the latest,
 * and returns the function that cancels it. Safari has no requestIdleCallback,
 * whatever the DOM typings say, so there it waits a fixed `fallback` instead.
 */
export function afterIdle(run: () => void, timeout = 2000, fallback = 600): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(run, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(run, fallback);
  return () => window.clearTimeout(id);
}
