import { defineConfig } from '@playwright/test';
import existing from './playwright.config.ts';

// Reuse the production servers, launch options and timeouts. No historical
// test is changed or skipped; this bounded release gate selects existing cases.
const gate = new RegExp(
  [
    'complete mouse flow,',
    'partial and incorrect feedback,',
    'keyboard can operate start,',
    'production assets work under',
    'Phase2B full north on (desktop|ipad-landscape):',
    'Phase2B wrong, partial and missing',
    'Episode 2 missing and partial inputs,',
    'Episode 2 accessible SVG names.*(desktop|ipad-landscape)$',
    'Ghana A1 full (quality|process):',
    'Ghana A2 full independent plan',
    'Ghana A2 wrong/partial feedback,',
    'Morocco B[12] full',
    'Morocco B2 missing/partial work,',
    'all six entries,',
    'actual Kenya recommendation survives',
    'a fact about another tested measure',
    'all new SVG touch targets.*landscape',
    'P2-01 (mouse|touch|keyboard) confirmed:',
    'P2-01 touch wrong:',
    'P2-01 mouse missing:',
    'P2-01 confirmed early answers keep',
    'P2-02 ',
    'RC1 ',
    'F2 ',
    'F3 viewport positions north touch=true',
    'SCORM readiness: simulated narrow',
    'phase5 production under Pages prefix:',
    'release live smoke:',
  ].join('|'),
);

export default defineConfig(existing, {
  testMatch:
    /(?:game|phase2b|episode2|episode2-accessibility|regions|morocco|final-integration|pedagogical-final|release-rc1|final-scorm|phase5-integration|release-live)\.spec\.ts/,
  grep: gate,
  // The original WebKit file filter omits game.spec.ts. Explicitly admit this
  // bounded release selection for both engines; retain their launch settings.
  projects: existing.projects!.map((project) => ({
    ...project,
    // GitHub-hosted runners use the engine installed by this lockfile's
    // Playwright, even if an unrelated system Chromium happens to exist.
    use:
      project.name === 'chromium' && process.env.GITHUB_ACTIONS === 'true'
        ? {
            ...project.use,
            launchOptions: {
              ...project.use?.launchOptions,
              executablePath: undefined,
            },
          }
        : project.use,
    testMatch:
      /(?:game|phase2b|episode2|episode2-accessibility|regions|morocco|final-integration|pedagogical-final|release-rc1|final-scorm|phase5-integration|release-live)\.spec\.ts/,
  })),
});
