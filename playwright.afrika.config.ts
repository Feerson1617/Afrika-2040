import { defineConfig } from '@playwright/test';
import release from './playwright.release.config.ts';
const match =
  /(?:inquiry(?:-correction)?|game|phase2b|episode2|episode2-accessibility|regions|morocco|final-integration|pedagogical-final|release-rc1|final-scorm|phase5-integration|release-live)\.spec\.ts/;
export default defineConfig(release, {
  testMatch: match,
  grep: new RegExp((release.grep as RegExp).source + '|Afrika curriculum'),
  projects: release.projects!.map((project) => ({
    ...project,
    testMatch: match,
    use:
      project.name === 'webkit' && process.env.WEBKIT_PATH
        ? {
            ...project.use,
            launchOptions: { executablePath: process.env.WEBKIT_PATH },
          }
        : project.use,
  })),
});
