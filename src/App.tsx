import { IconContext } from "@phosphor-icons/react";
import { ENTRIES } from "./data/entries";
import { Background } from "./components/notebook/Background";
import { Colophon } from "./components/notebook/Colophon";
import { Contact } from "./components/notebook/Contact";
import { Contents } from "./components/notebook/Contents";
import { EntryLeaf } from "./components/notebook/EntryLeaf";
import { Earlier, InProgress } from "./components/notebook/LaterPages";
import { PageOne } from "./components/notebook/PageOne";
import { PaperSpecks } from "./components/notebook/PaperSpecks";
import { ScrollEffects } from "./components/notebook/ScrollEffects";

/**
 * The page, in reading order. Page one, the four entries, the open work, the
 * older work, the background a CV would carry, and the back page.
 */
export default function App() {
  return (
    <IconContext.Provider value={{ weight: "regular", size: 18 }}>
      <a
        href="#scorer-audit"
        className="t-furniture sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-[60] focus-visible:bg-ink focus-visible:px-4 focus-visible:py-2 focus-visible:text-paper"
      >
        Skip to the entries
      </a>

      <Contents />

      <main className="sheet">
        <span className="sheet__progress" aria-hidden="true" />
        <PageOne />
        {ENTRIES.map((entry) => (
          <EntryLeaf key={entry.id} entry={entry} />
        ))}
        <InProgress />
        <Earlier />
        <Background />
        <Contact />
      </main>

      <Colophon />
      <ScrollEffects />
      <PaperSpecks />
    </IconContext.Provider>
  );
}
