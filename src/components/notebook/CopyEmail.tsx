"use client";

import { Check, Copy, Warning } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

type State = "idle" | "copied" | "blocked";

/**
 * The page's one action, in its working form: the address as a link that opens
 * a mail client, and a button that copies it. Recruiters mostly paste it into
 * something else, which is why the copy is the primary control.
 *
 * Clipboard access fails in some embedded and insecure contexts. When it does,
 * the address is selected instead and the message says so, rather than the
 * button pretending it worked.
 */
export function CopyEmail({ email, id }: { email: string; id: string }) {
  const [state, setState] = useState<State>("idle");
  const address = useRef<HTMLAnchorElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      if (!navigator.clipboard) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      const node = address.current;
      const selection = window.getSelection();
      if (node && selection) {
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setState("blocked");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 2800);
  };

  return (
    <div>
      <div className="flex max-w-[34rem] flex-wrap items-stretch gap-2 sm:flex-nowrap sm:gap-0">
        <a
          ref={address}
          href={`mailto:${email}`}
          className="t-lead w-full min-w-0 border-2 border-ink bg-paper px-4 py-2.5 break-all text-ink no-underline hover:bg-wash sm:w-auto sm:flex-1 sm:break-normal"
        >
          {email}
        </a>
        <button
          type="button"
          onClick={copy}
          aria-describedby={`${id}-status`}
          className="needs-js t-furniture inline-flex items-center justify-center gap-2 border-2 border-ink bg-ink px-5 py-2.5 text-paper transition-[background-color,color] duration-150 hover:bg-ink-soft hover:border-ink-soft active:translate-y-px"
          style={{ fontWeight: 650 }}
        >
          {state === "copied" ? (
            <Check aria-hidden="true" />
          ) : state === "blocked" ? (
            <Warning aria-hidden="true" />
          ) : (
            <Copy aria-hidden="true" />
          )}
          <span>{state === "copied" ? "Copied" : "Copy email"}</span>
        </button>
      </div>
      <p
        id={`${id}-status`}
        aria-live="polite"
        className="t-furniture-sm mt-2 min-h-[1.1rem] text-pencil"
      >
        {state === "copied"
          ? `Copied ${email}.`
          : state === "blocked"
            ? "Copying was blocked here. The address is selected, so copy it by hand."
            : ""}
      </p>
    </div>
  );
}
