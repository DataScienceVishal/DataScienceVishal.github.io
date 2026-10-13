import { CaretRight } from "@phosphor-icons/react";

/**
 * The second depth of an entry. Closed by default, so the page reads in two
 * minutes, and a native <details>, so it opens from the keyboard, works with no
 * script, and is in the prerendered HTML for anyone who searches the page.
 */
export function Working({
  summary,
  paragraphs,
  command,
}: {
  summary: string;
  paragraphs: readonly string[];
  command?: string;
}) {
  return (
    <details className="working mt-7">
      <summary className="t-furniture text-ink-soft hover:text-ink">
        <CaretRight className="working__caret shrink-0" aria-hidden="true" />
        <span className="underline decoration-hair underline-offset-4">{summary}</span>
      </summary>
      <div className="t-small mt-3 max-w-[32em] space-y-3 border-l border-hair pl-5 text-ink-soft">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 32)}>{p}</p>
        ))}
        {command ? (
          <pre className="bg-wash px-3 py-2 break-all whitespace-pre-wrap">
            <code className="t-code text-ink">{command}</code>
          </pre>
        ) : null}
      </div>
    </details>
  );
}
