import { defineConfig } from '@playwright/test';
import existing from './playwright.config.ts';
import curriculum from './playwright.afrika.config.ts';
// Full existing regressions, without the bounded release title filter.
// Retain historical WebKit support and include all 52 curriculum routes.
export default defineConfig(existing, {
  projects: existing.projects!.map((project) => ({
    ...project,
    testMatch:
      project.name === 'webkit'
        ? [project.testMatch as RegExp, curriculum.testMatch as RegExp]
        : '**/*.spec.ts',
    use:
      project.name === 'webkit' && process.env.WEBKIT_PATH
        ? {
            ...project.use,
            launchOptions: { executablePath: process.env.WEBKIT_PATH },
          }
        : project.use,
  })),
});
