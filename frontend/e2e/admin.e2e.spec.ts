import { test, expect } from '@playwright/test';
import { registerViaUI } from './helpers/auth';

test.describe('Admin E2E', () => {
  test('Admin can register and navigate across admin console pages', async ({ page }) => {
    await registerViaUI(page, { role: 'ADMIN' });

    // Sidebar + topbar
    await expect(page.getByTestId('topbar')).toBeVisible();
    await expect(page.getByTestId('topbar-logout')).toBeVisible();

    // Dashboard visible (admin stats cards)
    await expect(page.getByTestId('admin-dashboard')).toBeVisible();
    await expect(page.getByTestId('admin-stats-vehicles')).toBeVisible();
    await expect(page.getByTestId('admin-stats-drivers')).toBeVisible();
    await expect(page.getByTestId('admin-stats-active-rides')).toBeVisible();

    // Fleet
    await page.getByTestId('nav-admin-fleet').click();
    await expect(page).toHaveURL(/\/admin\/fleet$/);
    await expect(page.getByTestId('admin-fleet-page')).toBeVisible();
    await expect(page.getByTestId('admin-fleet-vehicle-list')).toBeVisible();

    // AI Route optimization
    await page.getByTestId('nav-admin-route').click();
    await expect(page).toHaveURL(/\/admin\/route$/);
    await expect(page.getByTestId('admin-route-page')).toBeVisible();
    await expect(page.getByTestId('route-optimize-button')).toBeVisible();

    // Predictive maintenance
    await page.getByTestId('nav-admin-predictive').click();
    await expect(page).toHaveURL(/\/admin\/predictive$/);
    await expect(page.getByTestId('admin-predictive-page')).toBeVisible();
    await expect(page.getByTestId('predictive-vehicle-grid')).toBeVisible();

    // Driver management
    await page.getByTestId('nav-admin-drivers').click();
    await expect(page).toHaveURL(/\/admin\/drivers$/);
    await expect(page.getByTestId('admin-drivers-page')).toBeVisible();

    // Logout returns to login
    await page.getByTestId('topbar-logout').click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId('auth-login-title')).toBeVisible();
  });
});
