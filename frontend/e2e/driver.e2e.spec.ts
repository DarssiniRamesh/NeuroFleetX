import { test, expect } from '@playwright/test';
import { registerViaUI } from './helpers/auth';

test.describe('Driver E2E', () => {
  test('Driver can register, manage bookings, and open profile', async ({ page }) => {
    await registerViaUI(page, { role: 'DRIVER' });

    await expect(page.getByTestId('driver-dashboard')).toBeVisible();

    // Go to Bookings
    await page.getByTestId('nav-driver-bookings').click();
    await expect(page).toHaveURL(/\/driver\/bookings$/);
    await expect(page.getByTestId('driver-bookings-page')).toBeVisible();

    // Generate recommendation
    await page.getByTestId('bookings-generate-recommendation').click();
    await expect(page.getByTestId('bookings-recommendation')).toBeVisible();

    // Add booking (modal)
    await page.getByTestId('bookings-add-booking').click();
    await expect(page.getByTestId('booking-modal')).toBeVisible();

    await page.getByTestId('booking-form-customerName').fill('E2E Customer');
    await page.getByTestId('booking-form-pickup').fill('Central Park');
    await page.getByTestId('booking-form-drop').fill('Airport');
    await page.getByTestId('booking-form-submit').click();

    // New booking appears in list
    await expect(page.getByTestId('bookings-list')).toBeVisible();
    await expect(page.getByText('E2E Customer')).toBeVisible();

    // Mark first non-completed booking completed (using first matching button)
    const completeButtons = page.getByTestId('booking-mark-completed');
    await expect(completeButtons.first()).toBeVisible();
    await completeButtons.first().click();

    // Profile
    await page.getByTestId('nav-driver-profile').click();
    await expect(page).toHaveURL(/\/driver\/profile$/);
    await expect(page.getByTestId('driver-profile-page')).toBeVisible();
    await expect(page.getByTestId('profile-save')).toBeVisible();
  });
});
