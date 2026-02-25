const { defineConfig, devices } = require('@playwright/test');

// Reuse the same env variables and behavior as the main Playwright config.
const BACKEND_PORT = Number(process.env.PLAYWRIGHT_BACKEND_PORT || 3001);
const FRONTEND_PORT = Number(process.env.PLAYWRIGHT_FRONTEND_PORT || 3000);
const HOST = '127.0.0.1';

/**
 * Cucumber/Playwright configuration used specifically for BDD runs.
 *
 * This mirrors the previous TypeScript-based `cucumber.config.ts` so that:
 * - webServer spins up the Spring Boot backend and Vite frontend
 * - baseURL and timeouts match the main Playwright config
 * - Chromium is used as the browser with optional executable override
 *
 * The Cucumber CLI will still:
 * - read `.feature` files from `e2e/bdd/features`
 * - execute Playwright step definitions from the required step/support files
 */
module.exports = defineConfig({
  testDir: './dist/e2e/bdd',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  timeout: process.env.CI ? 90_000 : 60_000,
  expect: {
    timeout: process.env.CI ? 15_000 : 10_000,
  },

  reporter: process.env.CI
    ? [
        ['github'],
        [
          'html',
          {
            open: 'never',
            outputFolder: 'playwright-report',
            zip: true,
          },
        ],
      ]
    : [
        ['list'],
        [
          'html',
          {
            open: 'on-failure',
            outputFolder: 'playwright-report',
            zip: true,
          },
        ],
      ],

  reportSlowTests: { max: 10, threshold: 30_000 },

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    actionTimeout: process.env.CI ? 15_000 : 10_000,
    navigationTimeout: process.env.CI ? 30_000 : 20_000,

    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    testIdAttribute: 'data-testid',
  },

  webServer: [
    {
      command:
        `cd ../backend/neurofleetx && ./mvnw -q spring-boot:run -Dspring-boot.run.arguments=--server.port=${BACKEND_PORT}`,
      url: `http://${HOST}:${BACKEND_PORT}/actuator/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 240 * 1000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: `npm run dev -- --host ${HOST} --port ${FRONTEND_PORT} --strictPort`,
      url: `http://${HOST}:${FRONTEND_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
          ? {
              executablePath:
                process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
            }
          : undefined,
      },
    },
  ],
});
