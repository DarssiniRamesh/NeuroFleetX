# NeuroFleetX Frontend BDD (Cucumber + Playwright)

This folder contains a minimal Cucumber/Gherkin layer on top of the existing Playwright E2E tests.

## Structure

- `features/` – Gherkin `.feature` files
  - `admin-fleet-dashboard.feature` – Admin login and Fleet dashboard access
- `steps/` – Cucumber step definitions implemented with Playwright
  - `admin-fleet-dashboard.steps.ts` – reuses existing `e2e/helpers/auth.ts`
- `../../cucumber.config.ts` – Playwright config used when running Cucumber

## Install

From `NeuroFleetX/frontend`:

```bash
npm install
```

(Playwright itself is already configured in this project.)

## Run all BDD scenarios

```bash
npm run test:bdd
```

## Run only the Admin Fleet scenario (tagged)

```bash
npm run test:bdd:admin-fleet
```

This command runs only scenarios tagged with `@admin-fleet`, including:

- **Scenario:** Admin logs in and can access the Fleet dashboard
