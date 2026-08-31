import { IconContext } from "@phosphor-icons/react";
import { LazyMotion, domAnimation } from "motion/react";
import { AskTheTwin } from "./components/AskTheTwin";
import { AuditWork } from "./components/AuditWork";
import { Contact } from "./components/Contact";
import { FeaturedWork } from "./components/FeaturedWork";
import { Hero } from "./components/Hero";
import { Nav } from "./components/Nav";
import { OtherWork } from "./components/OtherWork";
import { References } from "./components/References";
import { Research } from "./components/Research";
import { Stack } from "./components/Stack";
import { Trajectory } from "./components/Trajectory";

/**
 * `domAnimation` is the feature set this page actually uses: animations,
 * variants, exit animations, and hover and tap gestures. It is roughly a third
 * of the full bundle. `strict` makes the build fail loudly if a `motion.*`
 * component sneaks back in, since that would pull the whole engine along.
 */
export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <IconContext.Provider value={{ weight: "regular", size: 16 }}>
        <a
          href="#twin"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-[60] focus-visible:bg-brass focus-visible:px-4 focus-visible:py-2 focus-visible:font-sans focus-visible:text-sm focus-visible:font-medium focus-visible:text-void"
        >
          Skip to the work
        </a>

        <Nav />

        <main>
          <Hero />
          <FeaturedWork />
          <AuditWork />
          <Trajectory />
          <Research />
          <OtherWork />
          <Stack />
          <AskTheTwin />
          <Contact />
        </main>

        <References />
      </IconContext.Provider>
    </LazyMotion>
  );
}
