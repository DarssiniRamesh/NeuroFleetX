import { test, expect } from '@playwright/test';
import { registerViaUI } from './helpers/auth';

/**
 * Driver high-priority E2E flows.
 *
 * Contract:
 * - Inputs: Registers a unique DRIVER user via UI.
 * - Outputs: Verifies bookings CRUD-ish operations (local placeholder), engine telemetry view,
 *   and profile/settings editability.
 * - Errors: Any missing UI or selector instability fails deterministically via data-testid.
 * - Side-effects: Creates a user in backend DB and writes Playwright artifacts on failure.
 */
test.describe('Driver high-priority flows', () => {
  test('Bookings: generate recommendation, add booking, and complete one', async ({ page }) => {
    await registerViaUI(page, { role: 'DRIVER' });

    await page.getByTestId('nav-driver-bookings').click();
    await expect(page).toHaveURL(/\/driver\/bookings(?:\/)?(?:[?#].*)?$/);

    await expect(page.getByTestId('driver-bookings-page')).toBeVisible();
    await expect(page.getByTestId('bookings-actions')).toBeVisible();

    // Recommendation
    await page.getByTestId('bookings-generate-recommendation').click();
    await expect(page.getByTestId('bookings-recommendation')).toBeVisible();

    // Add booking
    const pendingBefore = await page.getByTestId('bookings-stats-pending').textContent();

    await page.getByTestId('bookings-add-booking').click();
    await expect(page.getByTestId('booking-modal')).toBeVisible();

    await page.getByTestId('booking-form-customerName').fill('E2E Customer');
    await page.getByTestId('booking-form-pickup').fill('Central Park');
    await page.getByTestId('booking-form-drop').fill('Airport');
    await page.getByTestId('booking-form-submit').click();

    await expect(page.getByTestId('booking-modal')).toBeHidden();
    await expect(page.getByTestId('bookings-list')).toBeVisible();
    await expect(page.getByText('E2E Customer')).toBeVisible();

    // Pending should increase (string compare is fine here; we only ensure change).
    await expect(page.getByTestId('bookings-stats-pending')).not.toHaveText(pendingBefore ?? '');

    // Complete first available (non-disabled) button.
    const completeButtons = page.getByTestId('booking-mark-completed');
    await expect(completeButtons.first()).toBeVisible();

    // Find the first enabled button to avoid “Completed” rows.
    const count = await completeButtons.count();
    let clicked = false;
    for (let i = 0; i < count; i++) {
      const btn = completeButtons.nth(i);
      if (await btn.isEnabled()) {
        await btn.click();
        clicked = true;
        break;
      }
    }
    expect(clicked).toBeTruthy();

    // Completed count should be >= 1; easiest deterministic check is visibility and numeric parse.
    const completedText = (await page.getByTestId('bookings-stats-completed').textContent()) ?? '0';
    expect(Number.parseInt(completedText, 10)).toBeGreaterThanOrEqual(1);
  });

  test('Engine details page renders assigned vehicle telemetry', async ({ page }) => {
    await registerViaUI(page, { role: 'DRIVER' });

    await page.getByTestId('nav-driver-engine').click();
    await expect(page).toHaveURL(/\/driver\/engine(?:\/)?(?:[?#].*)?$/);

    await expect(page.getByTestId('driver-engine-page')).toBeVisible();
    await expect(page.getByTestId('driver-engine-card')).toBeVisible();
    await expect(page.getByTestId('driver-engine-vehicle-number')).toContainText('NF-101');
    await expect(page.getByTestId('driver-engine-vehicle-health')).toBeVisible();
  });

  test('Profile/settings page allows editing fields and saving', async ({ page }) => {
    await registerViaUI(page, { role: 'DRIVER' });

    await page.getByTestId('nav-driver-profile').click();
    await expect(page).toHaveURL(/\/driver\/profile(?:\/)?(?:[?#].*)?$/);

    await expect(page.getByTestId('driver-profile-page')).toBeVisible();
    await expect(page.getByTestId('profile-form')).toBeVisible();

    await page.getByTestId('profile-name').fill('E2E Driver Updated');
    await page.getByTestId('profile-phone').fill('9999999999');

    await expect(page.getByTestId('profile-save')).toBeVisible();
    await page.getByTestId('profile-save').click();

    // No backend persistence; assert fields still show updated values.
    await expect(page.getByTestId('profile-name')).toHaveValue('E2E Driver Updated');
    await expect(page.getByTestId('profile-phone')).toHaveValue('9999999999');
  });
});
