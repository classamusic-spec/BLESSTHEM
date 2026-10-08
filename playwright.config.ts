import { defineConfig, devices } from '@playwright/test';

/** End-to-end flows A–G from the product spec, on a phone-sized viewport. */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    ...devices['iPhone 13'],
    browserName: 'chromium',
    locale: 'en-US',
    timezoneId: 'America/Chicago',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npx vite --port 5173 --strictPort',
    url: 'http://localhost:5173/welcome',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
