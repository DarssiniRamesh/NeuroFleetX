import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

/**
 * PUBLIC_INTERFACE
 * Ensures there is a single-file Playwright HTML report artifact at `playwright-report.zip`.
 *
 * Contract:
 * - Inputs: none (operates on well-known paths in the frontend workspace)
 * - Outputs: writes `playwright-report.zip` in the current working directory if possible
 * - Errors: exits non-zero only if report folder exists but zipping fails unexpectedly
 * - Side effects: filesystem read/write; invokes system `zip` if available
 *
 * Behavior:
 * - If Playwright already created `playwright-report.zip` or `playwright-report/playwright-report.zip`, do nothing.
 * - Else if `playwright-report/` exists, zip it into `playwright-report.zip`.
 * - Else do nothing.
 */
export function ensureZippedPlaywrightReport() {
  const cwd = process.cwd();
  const reportDir = path.join(cwd, 'playwright-report');
  const zipAtRoot = path.join(cwd, 'playwright-report.zip');
  const zipInsideFolder = path.join(reportDir, 'playwright-report.zip');

  if (fs.existsSync(zipAtRoot) || fs.existsSync(zipInsideFolder)) {
    return;
  }

  if (!fs.existsSync(reportDir)) {
    return;
  }

  // Prefer system zip (commonly available in CI images).
  // Non-interactive; overwrite if present (we already checked, but safe).
  execFileSync('zip', ['-r', '-q', 'playwright-report.zip', 'playwright-report'], {
    cwd,
    stdio: 'inherit',
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ensureZippedPlaywrightReport();
}
