import { test, expect, type Page } from '@playwright/test';
import { auditAccessibility } from './accessibility.ts';
import { evidencePath } from './artifacts.ts';
const progress = (page: Page, tab: string) =>
  page.evaluate(
    (id) =>
      JSON.parse(sessionStorage.getItem('afrika-2040:kenia-bus:v2a')!).geography
        .review.records[id].progress,
    tab,
  );
test('phase5 all three transfers: false claim, two errors, conscious support, editing, reload and fully independent answer', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#review-open').click();
  await expect(page.locator('h1')).toContainText('Drei Orte');
  await expect(page.locator('[data-region-status=KEN]')).toContainText(
    'Vorschau',
  );
  for (const [tab, scope] of [
    ['KEN', 'Nairobi'],
    ['GHA', 'Betrieb'],
    ['MAR', 'Tank'],
  ]) {
    await page.locator('#review-tab-' + tab).click();
    await page.locator('#review-check').click();
    expect((await progress(page, tab)).failures).toBe(0);
    await page.locator('#geo-transfer-claim-all').check();
    await page.locator('#review-check').click();
    await expect(page.locator('[data-feedback]')).toHaveClass(/incorrect/);
    await expect(page.locator('[data-feedback]')).toContainText(scope);
    await page.locator('#review-check').click();
    await expect(page.locator('[data-feedback]')).toHaveClass(/hint/);
    await expect(page.locator('#help-title')).toContainText('3 von 3');
    expect((await progress(page, tab)).supported).toBeUndefined();
    await expect(page.locator('[data-review-complete]')).toHaveCount(0);
    await page.locator('#review-adopt').click();
    await expect(page.locator('[data-review-complete]')).toContainText(
      'bewusst übernommenem Beispiel',
    );
    await page.reload();
    await expect(page.locator('[data-review-complete]')).toContainText(
      'bewusst übernommenem Beispiel',
    );
    await page.locator('#geo-transfer-claim-all').check();
    await expect(page.locator('[data-review-complete]')).toHaveCount(0);
    expect((await progress(page, tab)).supported).toBeUndefined();
    await page.locator('#geo-transfer-claim-model').check();
    await page.locator('#review-check').click();
    await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
    await expect(page.locator('[data-review-complete]')).toContainText(
      'mit Bausteinen',
    );
  }
  expect((await auditAccessibility(page)).violations).toEqual([]);
});
test('phase5 common comparison: partial acknowledgment, actual colors, missing answer without failure and supported completion', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#review-open').click();
  await page.locator('#review-tab-common').click();
  await page.locator('#geo-transfer-consequences-different').check();
  await page.locator('#review-check').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/partial/);
  expect((await progress(page, 'common')).failures).toBe(0);
  await page.locator('#geo-transfer-weigh-any').check();
  await page.locator('#review-check').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/partial/);
  await expect(page.locator('[data-feedback]')).toContainText(
    'Das passt schon',
  );
  expect((await progress(page, 'common')).failures).toBe(1);
  const color = await page
    .locator('[data-feedback]')
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.locator('#review-check').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/hint/);
  expect(
    await page
      .locator('[data-feedback]')
      .evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe(color);
  expect((await progress(page, 'common')).failures).toBe(2);
  await expect(page.locator('[data-feedback]')).toContainText(
    'Folgen der Vorschläge',
  );
  await expect(
    page.locator('#geo-transfer-consequences-different'),
  ).toBeChecked();
  await page.locator('#review-adopt').click();
  await expect(page.locator('#geo-transfer-weigh-evidence')).toBeChecked();
  await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
  const green = await page
    .locator('[data-feedback]')
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(green).not.toBe(color);
  expect((await auditAccessibility(page)).violations).toEqual([]);
  await page.screenshot({
    path: evidencePath('phase5-common-supported-desktop.png'),
    fullPage: true,
  });
});
for (const size of [
  { name: 'portrait', width: 768, height: 1024 },
  { name: 'landscape', width: 1024, height: 768 },
])
  test(`phase5 ${size.name}: touch map and alternative, short transfer, distinct help, return to former episode`, async ({
    browser,
  }) => {
    const ctx = await browser.newContext({
      viewport: size,
      isMobile: true,
      hasTouch: true,
      baseURL: 'http://127.0.0.1:4173',
    });
    const page = await ctx.newPage();
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await page.locator('#episode-3').tap();
    await page.locator('#chain-beans').tap();
    await page.locator('#review-open').tap();
    for (const [id, name] of [
      ['MAR', 'Marokko Agadir'],
      ['KEN', 'Kenia Nairobi'],
      ['GHA', 'Ghana Kumasi'],
    ]) {
      await page.locator('#geo-country-' + id + ' rect').tap();
      await expect(page.locator('#geo-country-' + id)).toHaveAccessibleName(
        name,
      );
      await expect(page.locator('#geo-country-' + id)).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await expect(page.locator('#review-tab-' + id)).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    }
    await page.locator('#review-tab-KEN').tap();
    await page.locator('label[for=geo-transfer-claim-model]').tap();
    await page.locator('#review-check').tap();
    await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
    await page.locator('#review-tab-MAR').tap();
    const hints: string[] = [];
    for (const name of [
      'Ich brauche einen Hinweis',
      'Genauer zeigen',
      'Erklärung ansehen',
    ]) {
      await page.getByRole('button', { name, exact: true }).tap();
      hints.push(await page.locator('.help-panel p').innerText());
    }
    expect(new Set(hints).size).toBe(3);
    await page.locator('#review-adopt').tap();
    expect((await auditAccessibility(page)).violations).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (size.name === 'portrait')
      await page.screenshot({
        path: evidencePath('phase5-transfer-ipad-portrait.png'),
        fullPage: true,
      });
    await page.locator('#review-home').tap();
    await page.locator('#episode-3').tap();
    await expect(page.locator('.study-scene')).toContainText('Bohnen');
    await page
      .getByRole('button', { name: 'Episoden auswählen', exact: true })
      .tap();
    await page.locator('#review-open').tap();
    await page.locator('#review-tab-MAR').tap();
    await expect(page.locator('[data-review-complete]')).toContainText(
      'bewusst übernommenem Beispiel',
    );
    expect(errors).toEqual([]);
    await ctx.close();
  });
test('phase5 keyboard, both directions in review map selection, names, focus and actual HTML alternative', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#review-open').focus();
  await page.keyboard.press('Enter');
  for (const id of ['KEN', 'GHA', 'KEN']) {
    await page.locator('#geo-country-' + id).focus();
    await page.keyboard.press('Space');
    await expect(page.locator('#geo-country-' + id)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.locator('#geo-country-' + id)).toBeFocused();
  }
  await page.locator('#review-tab-MAR').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#geo-country-KEN')).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(page.locator('#geo-country-MAR')).toHaveAccessibleName(
    'Marokko Agadir',
  );
  await page.locator('#geo-transfer-claim-model').focus();
  await page.keyboard.press('Space');
  await page.locator('#review-check').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
  await expect(page.locator('#feedback-title')).toBeFocused();
});
