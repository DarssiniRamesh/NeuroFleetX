import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for NeuroFleetX frontend (React/Vite).
 *
 * Uses a Vite dev server for local/CI runs and relies on stable data-testid locators
 * added to key UI elements (auth, navigation, and primary pages).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html']],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // We add data-testid across the app; this makes tests resilient.
    testIdAttribute: 'data-testid',
  },

  // Start the Vite dev server for E2E (Playwright will wait for it).
  webServer: {
    command: 'npm run dev -- --host 0.0.0.0 --port 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
