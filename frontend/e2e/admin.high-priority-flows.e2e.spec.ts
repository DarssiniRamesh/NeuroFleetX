import { test, expect } from '@playwright/test';
import { registerViaUI } from './helpers/auth';

/**
 * Admin high-priority E2E flows.
 *
 * Contract:
 * - Inputs: Uses UI registration to create a unique ADMIN user per run.
 * - Outputs: Verifies key admin flows render and key interactions work.
 * - Errors: Test fails with deterministic locator assertions.
 * - Side-effects: Creates a user in backend DB (via /api/auth/register) and writes Playwright artifacts (trace/video on failure).
 */
test.describe('Admin high-priority flows', () => {
  test('Fleet management list renders with stable cards', async ({ page }) => {
    await registerViaUI(page, { role: 'ADMIN' });

    await page.getByTestId('nav-admin-fleet').click();
    await expect(page).toHaveURL(/\/admin\/fleet(?:\/)?(?:[?#].*)?$/);

    await expect(page.getByTestId('admin-fleet-page')).toBeVisible();
    await expect(page.getByTestId('admin-fleet-title')).toBeVisible();

    // Deterministic list & at least one card from placeholder data.
    const cards = page.getByTestId('admin-fleet-vehicle-card');
    await expect(cards.first()).toBeVisible();
  });

  test('Driver management list renders with stable cards', async ({ page }) => {
    await registerViaUI(page, { role: 'ADMIN' });

    await page.getByTestId('nav-admin-drivers').click();
    await expect(page).toHaveURL(/\/admin\/drivers(?:\/)?(?:[?#].*)?$/);

    await expect(page.getByTestId('admin-drivers-page')).toBeVisible();
    await expect(page.getByTestId('admin-drivers-title')).toBeVisible();

    const driverCards = page.getByTestId('admin-driver-card');
    await expect(driverCards.first()).toBeVisible();
    await expect(page.getByTestId('admin-drivers-list')).toBeVisible();
  });

  test('Predictive maintenance health adjustment works locally (non-patchy deterministic assertions)', async ({
    page,
  }) => {
    await registerViaUI(page, { role: 'ADMIN' });

    await page.getByTestId('nav-admin-predictive').click();
    await expect(page).toHaveURL(/\/admin\/predictive(?:\/)?(?:[?#].*)?$/);

    await expect(page.getByTestId('admin-predictive-page')).toBeVisible();
    await expect(page.getByTestId('predictive-vehicle-grid')).toBeVisible();

    // Use the first vehicle card and click +10 then assert badge text changes.
    const firstCard = page.getByTestId('predictive-vehicle-card').first();
    await expect(firstCard).toBeVisible();

    const badge = firstCard.getByTestId('predictive-health-badge');
    const inc = firstCard.getByTestId('predictive-health-inc');

    const before = (await badge.textContent()) ?? '';
    await inc.click();
    await expect(badge).not.toHaveText(before);
  });

  test('Route optimization returns a result (happy path)', async ({ page }) => {
    await registerViaUI(page, { role: 'ADMIN' });

    await page.getByTestId('nav-admin-route').click();
    await expect(page).toHaveURL(/\/admin\/route(?:\/)?(?:[?#].*)?$/);

    await expect(page.getByTestId('admin-route-page')).toBeVisible();
    await expect(page.getByTestId('route-form')).toBeVisible();

    // Provide valid floats.
    await page.getByTestId('route-start-lat').fill('28.6139');
    await page.getByTestId('route-start-lng').fill('77.2090');
    await page.getByTestId('route-end-lat').fill('28.7041');
    await page.getByTestId('route-end-lng').fill('77.1025');

    await page.getByTestId('route-optimize-button').click();

    // Backend should respond (depends on backend implementation). If backend fails,
    // the UI uses alert() and test will fail on missing route result.
    await expect(page.getByTestId('route-result')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('route-result')).toContainText('Distance');
    await expect(page.getByTestId('route-result')).toContainText('Duration');
  });
});
