import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          include: ["tests/**/*.test.ts"],
          exclude: ["tests/**/*.browser.test.ts"],
        },
      },
      {
        test: {
          name: "browser",
          include: ["tests/**/*.browser.test.ts"],
          browser: {
            enabled: true,
            provider: playwright(), // swap for preview() from @vitest/browser-preview to just watch it
            headless: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
