import { test, expect } from '@playwright/test';
import { auditAccessibility } from './accessibility.ts';
import { evidencePath } from './artifacts.ts';
test('phase5 production under Pages prefix: local assets, orientation, offline facts, transfer, comparison and six independent returns', async ({
  page,
  context,
}) => {
  const errors: string[] = [],
    external: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => {
    if (!r.url().startsWith('http://127.0.0.1:4174/')) external.push(r.url());
  });
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(r.url() + ':' + r.status());
  });
  await page.goto('http://127.0.0.1:4174/Afrika-2040/');
  await page.locator('#geo-target-MAR').click();
  await page.locator('#geo-pick-MAR').click();
  await page.locator('#geo-check').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
  await context.setOffline(true);
  await page.locator('#real-context-MAR > summary').click();
  await page.locator('#real-context-MAR .context-source summary').click();
  await expect(page.locator('#real-context-MAR')).toContainText(
    'Rabat liegt weiter nördlich',
  );
  await page.locator('#review-open').click();
  for (const id of ['KEN', 'GHA', 'MAR']) {
    await page.locator('#review-tab-' + id).click();
    await page.locator('#geo-transfer-claim-model').check();
    await page.locator('#review-check').click();
    await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
  }
  await page.locator('#review-tab-common').click();
  await page.locator('#geo-transfer-consequences-same').check();
  await page.locator('#geo-transfer-weigh-any').check();
  await page.locator('#review-check').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/incorrect/);
  expect(
    await page
      .locator('[data-feedback]')
      .evaluate((e) => getComputedStyle(e).backgroundColor),
  ).toBe('rgb(255, 240, 236)');
  await page.locator('#geo-transfer-consequences-different').check();
  await page.locator('#geo-transfer-weigh-evidence').check();
  await page.locator('#review-check').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
  expect((await auditAccessibility(page)).violations).toEqual([]);
  await page.screenshot({
    path: evidencePath('phase5-prefix-independent-comparison.png'),
    fullPage: true,
  });
  await page.locator('#review-home').click();
  for (const n of [1, 2, 3, 4, 5, 6]) {
    if (n === 1)
      await page.getByRole('button', { name: 'Spiel starten' }).click();
    else if (n === 2)
      await page
        .getByRole('button', { name: 'Episode 2 starten', exact: true })
        .click();
    else await page.locator('#episode-' + n).click();
    await expect(page.locator('#task-title')).toBeVisible();
    await page
      .getByRole('button', { name: 'Episoden auswählen', exact: true })
      .click();
  }
  await context.setOffline(false);
  await page.reload();
  await expect(page.locator('.orientation')).toContainText(
    'Marokko: Lage zugeordnet',
  );
  await page.locator('#review-open').click();
  await expect(page.locator('[data-review-complete]')).toContainText(
    'mit Bausteinen',
  );
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
