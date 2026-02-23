import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for NeuroFleetX frontend (React/Vite).
 *
 * Key requirement for CI environments:
 * - Use a system-installed Chromium (via OS packages) instead of downloading Playwright browsers.
 * - Generate an HTML report (single-file in CI) that CI can archive easily.
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

  // In CI, emit a single-file HTML report for easy artifact upload.
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list'], ['html', { open: 'on-failure', outputFolder: 'playwright-report' }]],

  // Single-file HTML (inline all assets) is supported by Playwright's HTML reporter.
  // We enable it in CI to make the report portable.
  // Ref: https://playwright.dev/docs/test-reporters#html-reporter
  reportSlowTests: { max: 10, threshold: 30_000 },

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // We add data-testid across the app; this makes tests resilient.
    testIdAttribute: 'data-testid',
  },

  // Start required servers for E2E (Playwright will wait for them).
  // Frontend depends on backend at http://localhost:3001 (see src/api/axios.js).
  //
  // We intentionally:
  // - force backend to port 3001
  // - force frontend to port 3000
  // - bind Vite to 127.0.0.1 so the readiness URL (localhost) is consistent in CI
  // - pipe stdout/stderr so CI logs show startup failures instead of "hanging"
  webServer: [
    {
      // Spring Boot backend (force port 3001)
      // Note: use mvnw to avoid requiring a globally-installed Maven.
      command:
        'cd ../backend/neurofleetx && ./mvnw -q spring-boot:run -Dspring-boot.run.arguments=--server.port=3001',
      // Use a deterministic readiness endpoint (actuator health)
      url: 'http://127.0.0.1:3001/actuator/health',
      reuseExistingServer: !process.env.CI,
      timeout: 240 * 1000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      // Vite frontend (force port 3000)
      // Use 127.0.0.1 to avoid interface binding surprises in CI.
      command: 'npm run dev -- --host 127.0.0.1 --port 3000 --strictPort',
      url: 'http://127.0.0.1:3000',
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

        // Point Playwright at a system Chromium/Chrome binary to avoid Playwright's browser downloads.
        // When this is set, the 'chromium' browser project will launch this executable instead.
        //
        // NOTE: The environment must install Chromium via OS packages and set:
        //   PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
        // (path may vary by distro)
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
          ? {
              executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
            }
          : undefined,
      },
    },
  ],
});
