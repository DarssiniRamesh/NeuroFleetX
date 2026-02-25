import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { IWorldOptions, World } from '@cucumber/cucumber';
import type { Page, Browser, BrowserContext } from '@playwright/test';
import { chromium } from '@playwright/test';
import { loginViaUI, registerViaUI } from '../../helpers/auth';

// Extend default timeout a bit for end-to-end flows running through Cucumber.
setDefaultTimeout(60_000);

/**
 * Simple custom World to share Playwright browser/page across steps.
 */
interface PlaywrightWorldState {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  adminEmail?: string;
  adminPassword?: string;
}

class PlaywrightWorld extends World implements PlaywrightWorldState {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  adminEmail?: string;
  adminPassword?: string;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch();
      this.context = await this.browser.newContext({
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
      });
      this.page = await this.context.newPage();
    }
  }

  async dispose() {
    await this.context?.close();
    await this.browser?.close();
  }
}

// Cucumber will construct this world per scenario.
let world: PlaywrightWorld;

// PUBLIC_INTERFACE
export function getWorld(): PlaywrightWorld {
  /** Get the shared PlaywrightWorld instance for the current scenario. */
  return world;
}

// Hooks are defined via Cucumber programmatic API in the runner; here we only declare steps.
// However, to keep this file self-contained for this single scenario, we simulate
// basic before/after behavior using lazy init/dispose in steps.

Given('an admin user exists', async function () {
  if (!world) {
    world = new PlaywrightWorld({});
  }

  await world.initBrowser();
  const page = world.page!;
  const creds = await registerViaUI(page, { role: 'ADMIN' });

  world.adminEmail = creds.email;
  world.adminPassword = creds.password;

  // After registration we should be on the admin dashboard.
  await expect(page).toHaveURL(/\/admin\/dashboard(?:\/)?(?:[?#].*)?$/);
});

When('the admin logs in via the login page', async function () {
  // Start a fresh login session to reflect a real-world login flow.
  const browserWorld = world ?? new PlaywrightWorld({});
  world = browserWorld;
  await world.initBrowser();
  const page = world.page!;

  // Log out first if already logged in.
  await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' }).catch(() => {
    // ignore navigation issues, we'll still attempt the login flow below
  });
  const logoutButton = page.getByTestId('topbar-logout');
  if (await logoutButton.isVisible().catch(() => false)) {
    await logoutButton.click();
  }

  await loginViaUI(page, {
    email: world.adminEmail!,
    password: world.adminPassword!,
    role: 'ADMIN',
  });
});

Then('the admin should see the Fleet Management page', async function () {
  const page = world.page!;
  // Navigate to Fleet using the same stable data-testid locators as the existing E2E tests.
  await page.getByTestId('nav-admin-fleet').click();
  await expect(page).toHaveURL(/\/admin\/fleet(?:\/)?(?:[?#].*)?$/);

  await expect(page.getByTestId('admin-fleet-page')).toBeVisible();
  await expect(page.getByTestId('admin-fleet-title')).toBeVisible();
  await expect(page.getByTestId('admin-fleet-vehicle-card').first()).toBeVisible();

  // Dispose browser for this scenario.
  await world.dispose();
});
