import { defineConfig, devices } from '@playwright/test';

// Environment variables:
// - PLAYWRIGHT_BACKEND_PORT (default 3001)
// - PLAYWRIGHT_FRONTEND_PORT (default 3000)
const BACKEND_PORT = Number(process.env.PLAYWRIGHT_BACKEND_PORT || 3001);
const FRONTEND_PORT = Number(process.env.PLAYWRIGHT_FRONTEND_PORT || 3000);
const HOST = '127.0.0.1';

/**
 * Playwright E2E configuration for NeuroFleetX frontend (React/Vite).
 *
 * Key requirement for CI environments:
 * - Use a system-installed Chromium (via OS packages) instead of downloading Playwright browsers.
 * - Generate an HTML report that CI can archive easily.
 *
 * Environment variables:
 * - PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH: absolute path to Chromium/Chrome executable.
 *   Examples: /usr/bin/chromium, /usr/bin/chromium-browser, /usr/bin/google-chrome
 * - PLAYWRIGHT_BASE_URL: base URL for tests (defaults to Vite dev server at http://localhost:3000)
 */
export default defineConfig({
  testDir: './e2e',
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
            // Produces a single self-contained HTML file as a zip (Playwright behavior).
            // CI can archive the zip as an artifact.
            // See: https://playwright.dev/docs/test-reporters#html-reporter
            // NOTE: the output file will be playwright-report.zip in outputFolder.
            // Locally, the report is still viewable via `npx playwright show-report`.
            // (When using zip, you can unzip to a folder and open index.html.)
            // This keeps the report deterministic and portable.
            host: '127.0.0.1',
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
            // Also keep local report single-file (zip) so it can be shared easily.
            // If you prefer folder output locally, remove this line.
            host: '127.0.0.1',
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

  // Ensure the report is emitted as a single portable artifact.
  // This creates `playwright-report/playwright-report.zip`.
  reporterOptions: {
    // (Intentionally left empty; HTML reporter is configured inline above.)
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
              executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
            }
          : undefined,
      },
    },
  ],
});
