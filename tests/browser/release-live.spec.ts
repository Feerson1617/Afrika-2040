import { test, expect } from '@playwright/test';
import { evidencePath } from './artifacts.ts';

// Also usable after a separately approved deployment. No production URL is
// contacted unless the operator explicitly sets RELEASE_LIVE_URL.
const url =
  process.env.RELEASE_LIVE_URL || 'http://127.0.0.1:4174/Afrika-2040/';
for (const device of [
  { name: 'desktop', width: 1440, height: 1000, touch: false },
  { name: 'ipad-landscape', width: 1024, height: 768, touch: true },
])
  test(`release live smoke: resources, six entries, feedback and same-tab resume on ${device.name}`, async ({
    browser,
    browserName,
  }) => {
    const target = new URL(url);
    if (process.env.RELEASE_LIVE_URL) expect(target.protocol).toBe('https:');
    const context = await browser.newContext({
      viewport: device,
      hasTouch: device.touch,
      isMobile: device.touch,
    });
    const page = await context.newPage();
    const errors: string[] = [],
      external: string[] = [],
      resources: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    page.on('requestfailed', (r) =>
      errors.push(r.url() + ': ' + r.failure()?.errorText),
    );
    page.on('response', (r) => {
      if (r.status() >= 400) errors.push(r.url() + ': ' + r.status());
      if (/\.(js|css)(\?|$)/.test(r.url()))
        resources.push(new URL(r.url()).pathname);
    });
    page.on('request', (r) => {
      if (new URL(r.url()).origin !== target.origin) external.push(r.url());
    });
    const press = async (selector: string) => {
      if (device.touch) await page.locator(selector).tap();
      else await page.locator(selector).click();
    };
    const response = await page.goto(url);
    expect(response?.ok()).toBe(true);
    expect(new URL(page.url()).origin).toBe(target.origin);
    expect(
      resources.some(
        (r) => r.startsWith(target.pathname + 'assets/') && r.endsWith('.js'),
      ),
    ).toBe(true);
    expect(
      resources.some(
        (r) => r.startsWith(target.pathname + 'assets/') && r.endsWith('.css'),
      ),
    ).toBe(true);
    await expect(page.locator('svg.africa-overview')).toBeVisible();
    await press('#geo-pick-GHA');
    await press('#geo-check');
    await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
    for (const n of [1, 2, 3, 4, 5, 6]) {
      const button =
        n === 1
          ? page.getByRole('button', { name: 'Spiel starten', exact: true })
          : n === 2
            ? page.getByRole('button', {
                name: 'Episode 2 starten',
                exact: true,
              })
            : page.locator('#episode-' + n);
      if (device.touch) await button.tap();
      else await button.click();
      await expect(page.locator('#task-title')).toBeVisible();
      const menu = page.getByRole('button', {
        name: 'Episoden auswählen',
        exact: true,
      });
      if (device.touch) await menu.tap();
      else await menu.click();
    }
    await page
      .getByRole('button', { name: 'Spiel starten', exact: true })
      .click();
    await press('label[for="foot-nord"]');
    await press('label[for="bus-north"]');
    await press('#check-answer');
    await expect(page.locator('[data-feedback]')).toHaveClass(/incorrect/);
    const rework = page.getByRole('button', {
      name: 'Aufgabe neu bearbeiten',
      exact: true,
    });
    if (device.touch) await rework.tap();
    else await rework.click();
    await press('label[for="foot-platz"]');
    await press('label[for="bus-north"]');
    await press('#check-answer');
    await expect(page.locator('[data-feedback]')).toHaveClass(/partial/);
    await press('label[for="bus-direct"]');
    await press('#check-answer');
    await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
    await page.reload();
    await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
    await expect(page.locator('#foot-platz')).toBeChecked();
    for (const name of [
      'Ich brauche einen Hinweis',
      'Genauer zeigen',
      'Erklärung ansehen',
    ]) {
      const b = page.getByRole('button', { name, exact: true });
      if (device.touch) await b.tap();
      else await b.click();
    }
    await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
    await press('#next-step');
    await expect(page.locator('#task-title')).toHaveText(
      'Für wen wird der Weg über Nord kürzer?',
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: evidencePath(`release-smoke-${browserName}-${device.name}.png`),
      fullPage: false,
    });
    expect(errors).toEqual([]);
    expect(external).toEqual([]);
    await context.close();
  });
