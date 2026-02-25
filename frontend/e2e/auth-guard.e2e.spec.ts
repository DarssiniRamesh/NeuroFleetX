import { test, expect } from '@playwright/test';
import { loginViaUI, registerViaUI } from './helpers/auth';

test.describe('Auth & Route Guard E2E', () => {
  test('Unauthenticated deep link to admin route redirects to login', async ({ page }) => {
    // Ensure we start in a logged-out state.
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.removeItem('nf_user'));

    // Deep link into a protected route.
    await page.goto('/admin/fleet', { waitUntil: 'domcontentloaded' });

    // The layout should redirect to login when nf_user is missing.
    await expect(page).toHaveURL(/\/login(?:\/)?(?:[?#].*)?$/);
    await expect(page.getByTestId('auth-login-title')).toBeVisible();
    await expect(page.getByTestId('auth-login-page')).toBeVisible();
  });

  test('Unauthenticated deep link to driver route redirects to login', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.removeItem('nf_user'));

    await page.goto('/driver/bookings', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/login(?:\/)?(?:[?#].*)?$/);
    await expect(page.getByTestId('auth-login-title')).toBeVisible();
    await expect(page.getByTestId('auth-login-page')).toBeVisible();
  });

  test('Registered driver can login and access Engine Details via navigation', async ({ page }) => {
    const creds = await registerViaUI(page, { role: 'DRIVER' });

    // Logout so we can explicitly test the login flow.
    await page.getByTestId('topbar-logout').click();
    await expect(page).toHaveURL(/\/login(?:\/)?(?:[?#].*)?$/);

    await loginViaUI(page, { email: creds.email, password: creds.password, role: 'DRIVER' });
    await expect(page).toHaveURL(/\/driver\/dashboard(?:\/)?(?:[?#].*)?$/);

    // Go to Engine Details via sidebar and assert the page renders with stable locators.
    await page.getByTestId('nav-driver-engine').click();
    await expect(page).toHaveURL(/\/driver\/engine(?:\/)?(?:[?#].*)?$/);

    await expect(page.getByTestId('driver-engine-page')).toBeVisible();
    await expect(page.getByTestId('driver-engine-title')).toBeVisible();
    await expect(page.getByTestId('driver-engine-card')).toBeVisible();
    await expect(page.getByTestId('driver-engine-vehicle-number')).toContainText('NF-101');
  });
});
