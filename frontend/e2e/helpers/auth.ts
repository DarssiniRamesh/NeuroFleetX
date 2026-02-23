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

  const expectedPath = opts.role === 'ADMIN' ? '/admin/dashboard' : '/driver/dashboard';

  await page.goto('/register', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('auth-register-title')).toBeVisible();

  await page.getByTestId('register-name').fill(name);
  await page.getByTestId('register-email').fill(email);
  await page.getByTestId('register-password').fill(password);
  await page.getByTestId('register-role').selectOption(opts.role);

  // Make post-submit navigation deterministic: wait for the URL change explicitly.
  // IMPORTANT: Do not wait for the full "load" event: SPAs may keep long-lived connections open,
  // and Playwright's default waitUntil="load" can become flaky even after URL change.
  await Promise.all([
    page.waitForURL(new RegExp(`${expectedPath.replaceAll('/', '\\\\\\\\/')}$`), {
      timeout: 30_000,
      waitUntil: 'domcontentloaded',
    }),
    page.getByTestId('register-submit').click(),
  ]);

  // Optional: wait for network to settle, but do not hang if the app keeps long-lived connections open.
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {
    // Intentionally ignore; we rely on UI assertions below for determinism.
  });

  await expect(page.getByTestId('dashboard-layout')).toBeVisible({ timeout: 20_000 });

  return { email, password, name, role: opts.role };
}

/**
 * PUBLIC_INTERFACE
 */
export async function loginViaUI(page: Page, opts: { email: string; password: string; role: Role }) {
  /** Log in via UI and verify we land in the correct role dashboard. */
  const expectedPath = opts.role === 'ADMIN' ? '/admin/dashboard' : '/driver/dashboard';

  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('auth-login-title')).toBeVisible();

  await page.getByTestId('login-email').fill(opts.email);
  await page.getByTestId('login-password').fill(opts.password);

  await Promise.all([
    page.waitForURL(new RegExp(`${expectedPath.replaceAll('/', '\\\\\\\\/')}$`), {
      timeout: 30_000,
      waitUntil: 'domcontentloaded',
    }),
    page.getByTestId('login-submit').click(),
  ]);

  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {
    // Intentionally ignore; we rely on UI assertions below for determinism.
  });

  await expect(page.getByTestId('dashboard-layout')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 20_000 });

  // Role-specific nav item should exist.
  if (opts.role === 'ADMIN') {
    await expect(page.getByTestId('nav-admin-dashboard')).toBeVisible();
  } else {
    await expect(page.getByTestId('nav-driver-dashboard')).toBeVisible();
  }
}
