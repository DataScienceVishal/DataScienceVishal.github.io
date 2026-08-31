import { renderToString } from "react-dom/server";
import App from "./App";

/**
 * Build-time render. The page is static apart from one clipboard button, so the
 * markup is generated once at build and shipped as real HTML. That takes first
 * paint off the JavaScript critical path, which is what a client-rendered SPA
 * cannot do.
 */
export function render(): string {
  return renderToString(<App />);
}
