# Playwright E2E with system Chromium (no Playwright browser downloads)

This project is configured to run Playwright E2E tests using a Chromium/Chrome executable installed via OS packages.

## Why
Some CI environments/images disallow Playwright downloading browsers at runtime. Instead, install Chromium via the OS package manager and point Playwright to that binary.

## Requirements

### 1) Install Chromium via OS packages
Examples (choose the one for your base image):

**Debian/Ubuntu**
```bash
apt-get update
apt-get install -y chromium
# On some distros the package name is: chromium-browser
```

**Alpine**
```bash
apk add --no-cache chromium
```

### 2) Set environment variables
Set these when running tests:

- `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`  
  Prevents Playwright from trying to download its bundled browsers.

- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium`  
  Absolute path to the system executable. Common values:
  - `/usr/bin/chromium`
  - `/usr/bin/chromium-browser`
  - `/usr/bin/google-chrome`

Optional:
- `PLAYWRIGHT_BASE_URL=http://localhost:3000`  
  Override the base URL (defaults to `http://localhost:3000`).

## Running locally
```bash
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
npm run test:e2e
```

## HTML report
Playwright writes an HTML report to `frontend/playwright-report/`.

In CI, the config is set up to generate a portable report (single-file HTML where supported).
To open it locally:

```bash
npm run test:e2e:report
```
