import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");
if (!container) throw new Error("#root is missing from index.html");

const tree = (
  <StrictMode>
    <App />
  </StrictMode>
);

// The build prerenders the page, so the normal path is hydration. createRoot is
// the fallback for a dev server, where #root is empty.
if (container.hasChildNodes()) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
