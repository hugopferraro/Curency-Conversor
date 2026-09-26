import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    extraHTTPHeaders: { "x-forwarded-for": "127.0.0.2" },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 5"] } },
  ],
  webServer: [
    {
      command: "tsx scripts/mock-freecurrency-api.mts",
      url: "http://127.0.0.1:4010/health",
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: "npm run dev -- -p 3100",
      url: "http://localhost:3100",
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        BETTER_AUTH_SECRET: "e2e-secret-with-at-least-32-characters",
        BETTER_AUTH_URL: "http://localhost:3100",
        BETTER_AUTH_TRUSTED_ORIGINS: "http://localhost:3100",
        FREECURRENCY_API_KEY: "e2e-api-key",
        FREECURRENCY_API_BASE_URL: "http://127.0.0.1:4010",
      },
    },
  ],
});
