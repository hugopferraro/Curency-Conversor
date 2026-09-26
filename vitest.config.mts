import { fileURLToPath } from "node:url";

import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    exclude: [...configDefaults.exclude, "e2e/**"],
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
