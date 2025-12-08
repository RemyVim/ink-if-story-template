import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e/",

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "html",

  use: {
    baseURL: "http://localhost:8000",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },

  webServer: {
    command: "python3 -m http.server 8000 --directory build",
    url: "http://localhost:8000",
    reuseExistingServer: !process.env.CI,
  },

  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
