import { IconContext } from "@phosphor-icons/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import { LivePage } from "./LivePage";

/**
 * The live game page, /deadpan/. Unlike the home page it is not prerendered:
 * everything on it comes from the stream, so there is nothing to render ahead
 * of time beyond the frame.
 */
const container = document.getElementById("root");
if (!container) throw new Error("#root is missing from deadpan/index.html");

createRoot(container).render(
  <StrictMode>
    <IconContext.Provider value={{ weight: "regular", size: 18 }}>
      <LivePage />
    </IconContext.Provider>
  </StrictMode>,
);
