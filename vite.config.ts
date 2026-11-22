import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2022",
    cssMinify: "lightningcss",
    rollupOptions: {
      // The home page, prerendered after the build, and the live Deadpan page,
      // which renders on the client because all of it comes from a stream.
      // Paths are relative to the project root, where every build runs.
      input: {
        main: "index.html",
        deadpan: "deadpan/index.html",
      },
    },
  },
});
