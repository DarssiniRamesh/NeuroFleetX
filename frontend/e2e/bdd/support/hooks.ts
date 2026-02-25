import { After, Before, setDefaultTimeout } from '@cucumber/cucumber';
import { getWorld } from '../steps/admin-fleet-dashboard.steps';

// Extend default timeout slightly for BDD scenarios.
setDefaultTimeout(60_000);

Before(async function () {
  // Lazily initialize the shared Playwright world, if needed.
  try {
    const world = getWorld();
    if (world && typeof (world as any).initBrowser === 'function') {
      await (world as any).initBrowser();
    }
  } catch {
    // If getWorld or initBrowser are not ready yet, ignore – steps will handle init.
  }
});

After(async function () {
  // Ensure browser resources are cleaned up after each scenario.
  try {
    const world = getWorld();
    if (world && typeof (world as any).dispose === 'function') {
      await (world as any).dispose();
    }
  } catch {
    // Swallow errors to avoid failing scenarios due to cleanup issues.
  }
}
