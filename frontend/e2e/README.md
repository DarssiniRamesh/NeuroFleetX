# NeuroFleetX Frontend E2E (Playwright)

This folder contains Playwright-based end-to-end tests for the React/Vite frontend.

## Prerequisites

From `NeuroFleetX/frontend`:

```bash
npm install
npm run test:e2e:install
```

## Run tests

```bash
npm run test:e2e
```

## HTML report (single-file artifact)

The Playwright HTML report is generated as a **single portable file**:

- `NeuroFleetX/frontend/playwright-report/playwright-report.zip`

To view it locally:

```bash
# Option A: Use Playwright helper
npm run test:e2e:report

# Option B: Unzip and open in a browser
unzip -o playwright-report/playwright-report.zip -d playwright-report-unzipped
# then open playwright-report-unzipped/index.html
```

## Notes

- Tests rely on stable `data-testid` attributes added across key flows (login/register, navigation, key pages).
- The suite uses UI registration to create unique users, avoiding reliance on pre-seeded DB data.
- Default dev server URL is `http://localhost:3000` (configured in `playwright.config.ts`).
  - Override via `PLAYWRIGHT_BASE_URL` if needed.
