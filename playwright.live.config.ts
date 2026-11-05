import { defineConfig } from '@playwright/test';
import existing from './playwright.config.ts';

if (!process.env.RELEASE_LIVE_URL)
  throw new Error(
    'Set RELEASE_LIVE_URL explicitly for the separately approved live check.',
  );

// Deliberately separate from CI: the public URL is a future, explicit operation.
export default defineConfig(existing, {
  testMatch: /release-live\.spec\.ts/,
  grep: /release live smoke:/,
  webServer: [],
  projects: existing.projects!.map((p) => ({
    ...p,
    testMatch: /release-live\.spec\.ts/,
  })),
});
