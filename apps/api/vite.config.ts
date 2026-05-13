/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    ssr: true,
    rollupOptions: {
      input: "src/index.ts",
      output: {
        dir: "dist",
        format: "esm",
        entryFileNames: "index.js",
      },
    },
  },
  test: {
    globals: true,
    environment: "node",
  },
});
