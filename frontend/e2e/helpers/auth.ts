import { expect, Page } from '@playwright/test';

type Role = 'ADMIN' | 'DRIVER';

function uniqueEmail(prefix: string): string {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  return `${prefix}.${stamp}@example.com`;
}

/**
 * PUBLIC_INTERFACE
 */
export async function registerViaUI(page: Page, opts: { role: Role; name?: string; password?: string }) {
  /** Register a new user via the UI and return the created credentials. */
  const email = uniqueEmail(opts.role.toLowerCase());
  const password = opts.password ?? 'Passw0rd!123';
  const name = opts.name ?? (opts.role === 'ADMIN' ? 'E2E Admin' : 'E2E Driver');

  await page.goto('/register');
  await expect(page.getByTestId('auth-register-title')).toBeVisible();

  await page.getByTestId('register-name').fill(name);
  await page.getByTestId('register-email').fill(email);
  await page.getByTestId('register-password').fill(password);
  await page.getByTestId('register-role').selectOption(opts.role);
  await page.getByTestId('register-submit').click();

  // Post-register, the app should route to role dashboard.
  await expect(page.getByTestId('dashboard-layout')).toBeVisible();

  return { email, password, name, role: opts.role };
}

/**
 * PUBLIC_INTERFACE
 */
export async function loginViaUI(page: Page, opts: { email: string; password: string; role: Role }) {
  /** Log in via UI and verify we land in the correct role dashboard. */
  await page.goto('/login');
  await expect(page.getByTestId('auth-login-title')).toBeVisible();

  await page.getByTestId('login-email').fill(opts.email);
  await page.getByTestId('login-password').fill(opts.password);
  await page.getByTestId('login-submit').click();

  await expect(page.getByTestId('dashboard-layout')).toBeVisible();
  await expect(page.getByTestId('sidebar')).toBeVisible();

  // Role-specific nav item should exist.
  if (opts.role === 'ADMIN') {
    await expect(page.getByTestId('nav-admin-dashboard')).toBeVisible();
  } else {
    await expect(page.getByTestId('nav-driver-dashboard')).toBeVisible();
  }
}
