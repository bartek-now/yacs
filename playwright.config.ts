import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  timeout: 30000,
  retries: 0,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node scripts/serve.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'android-web', use: { ...devices['Pixel 7'], browserName: 'chromium' } },
    { name: 'iphone-web', use: { ...devices['iPhone 13'], browserName: 'webkit' } },
  ],
});
