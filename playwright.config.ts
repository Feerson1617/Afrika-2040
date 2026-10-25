import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

const systemChromium = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        launchOptions: {
          executablePath: existsSync(systemChromium)
            ? systemChromium
            : undefined,
          args: ['--no-sandbox', '--disable-dev-shm-usage'],
        },
      },
    },
    {
      name: 'webkit',
      testMatch:
        /(?:phase2b(?:-correction)?|episode2(?:-accessibility)?|regions|morocco|final-integration|correction-six|correction-kenya-reports|feedback-classification)\.spec\.ts/,
      use: { browserName: 'webkit' },
    },
  ],
  webServer: [
    {
      command: 'npm run preview -- --port 4173 --strictPort',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'node tests/pages-server.mjs',
      url: 'http://127.0.0.1:4174/Afrika-2040/',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
