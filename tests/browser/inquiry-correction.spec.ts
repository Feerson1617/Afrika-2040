import { test, expect, type Page } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { evidencePath } from './artifacts.ts';
const key = 'afrika-2040:kenia-bus:v2a';
async function open(page: Page) {
  await page.goto('/');
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await page.locator('#inquiry-open').click();
  await page.locator('[data-op="topic"][data-value="population"]').click();
}
async function enter(page: Page, values: string[]) {
  for (const [i, name] of ['natural', 'migration', 'end'].entries())
    await page.locator('#inq-' + name).fill(values[i]);
}
async function current(page: Page) {
  return page.evaluate(
    (key) =>
      JSON.parse(sessionStorage.getItem(key)!).inquiry.records.population
        .checks[0],
    key,
  );
}
const feedback = (page: Page) => page.locator('[data-inquiry-feedback]');
for (const touch of [false, true])
  test(`Afrika curriculum correction numeric notations, keyboard, reload and back: touch=${touch}`, async ({
    browser,
    browserName,
  }) => {
    const context = await browser.newContext({
      viewport: touch
        ? { width: 1024, height: 768 }
        : { width: 1440, height: 1000 },
      hasTouch: touch,
      isMobile: touch,
      baseURL: 'http://127.0.0.1:4173',
    });
    const page = await context.newPage(),
      results = [];
    for (const values of [
      ['30', '-10', '1020'],
      ['30', '−10', '1020'],
      ['30', '-10', '1.020'],
      [' 30 ', ' −10 ', ' 1.020 '],
    ]) {
      await open(page);
      if (touch) await enter(page, values);
      else
        for (const [i, name] of ['natural', 'migration', 'end'].entries()) {
          await page.locator('#inq-' + name).focus();
          await page.keyboard.insertText(values[i]);
        }
      if (touch) await page.locator('#inquiry-check').tap();
      else await page.locator('#inquiry-check').press('Enter');
      await expect(feedback(page)).toHaveClass(/correct/);
      const state = await current(page);
      expect(state.failures).toBe(0);
      expect(state.feedback.complete).toBe(true);
      results.push({
        values,
        feedback: state.feedback,
        failures: state.failures,
      });
      await page.reload();
      for (const [i, name] of ['natural', 'migration', 'end'].entries())
        await expect(page.locator('#inq-' + name)).toHaveValue(values[i]);
      await expect(feedback(page)).toHaveClass(/correct/);
      await page.locator('#inquiry-next').click();
      await page.locator('[data-op="back"]').click();
      await expect(page.locator('#inq-end')).toHaveValue(values[2]);
    }
    await page.screenshot({
      path: evidencePath(
        `numbers-after-${browserName}-${touch ? 'ipad' : 'desktop'}.png`,
      ),
      fullPage: true,
    });
    writeFileSync(
      evidencePath(
        `numbers-after-${browserName}-${touch ? 'ipad' : 'desktop'}.json`,
      ),
      JSON.stringify(results, null, 2) + '\n',
    );
    await context.close();
  });

test('Afrika curriculum correction ambiguous numbers preserve right parts without factual errors; correcting the notation enables success', async ({
  page,
  browserName,
}) => {
  await open(page);
  for (const bad of [
    '30abc',
    '1.02',
    '1..020',
    '1,020',
    '10+20',
    '−',
    '1.020.00',
    '1e3',
  ]) {
    await enter(page, ['30', '−10', bad]);
    for (let i = 0; i < 2; i++) await page.locator('#inquiry-check').click();
    await expect(feedback(page)).toHaveClass(/partial/);
    await expect(feedback(page)).toHaveCSS(
      'background-color',
      'rgb(255, 247, 218)',
    );
    await expect(feedback(page)).toContainText('Schon passend:');
    await expect(feedback(page)).toContainText('Prüfe die Schreibweise');
    expect((await current(page)).failures).toBe(0);
    expect((await current(page)).help).toBe(0);
    await page.reload();
    expect((await current(page)).failures).toBe(0);
    await expect(page.locator('#inq-end')).toHaveValue(bad);
  }
  await enter(page, ['0', '', '1.02']);
  await page.locator('#inquiry-check').click();
  await expect(feedback(page)).toHaveClass(/neutral/);
  await expect(feedback(page)).toHaveCSS(
    'background-color',
    'rgb(238, 243, 245)',
  );
  expect((await current(page)).failures).toBe(0);
  await enter(page, ['30', '999', '1.02']);
  await page.locator('#inquiry-check').click();
  await expect(feedback(page)).toHaveClass(/partial/);
  expect((await current(page)).failures).toBe(0);
  await page.screenshot({
    path: evidencePath(`numbers-format-hint-${browserName}.png`),
    fullPage: true,
  });
  await enter(page, ['30', '−10', '1.020']);
  await page.locator('#inquiry-check').click();
  await expect(feedback(page)).toHaveClass(/correct/);
  expect((await current(page)).failures).toBe(0);
});

test('Afrika curriculum correction two factual failures, format interruption, help and adopted answer retain their provenance', async ({
  page,
  browserName,
}) => {
  await open(page);
  await enter(page, ['0', '0', '0']);
  await page.locator('#inquiry-check').click();
  await expect(feedback(page)).toHaveClass(/incorrect/);
  await expect(feedback(page)).toHaveCSS(
    'background-color',
    'rgb(255, 240, 236)',
  );
  expect((await current(page)).failures).toBe(1);
  await enter(page, ['30', '−', '999']);
  await page.locator('#inquiry-check').click();
  expect((await current(page)).failures).toBe(1);
  expect((await current(page)).help).toBe(0);
  await page.locator('#inq-migration').fill('−10');
  await page.locator('#inquiry-check').click();
  await expect(feedback(page)).toHaveClass(/hint/);
  await expect(feedback(page)).toHaveCSS(
    'background-color',
    'rgb(255, 247, 218)',
  );
  await expect(feedback(page)).toContainText('Schon passend:');
  expect((await current(page)).failures).toBe(2);
  expect((await current(page)).exampleUsed).toBe(false);
  await expect(page.locator('#inquiry-help-title')).toHaveText('Hilfe 3 von 3');
  await page.locator('[data-op="adopt"]').click();
  expect((await current(page)).adopted).toBe(true);
  await page.locator('#inquiry-next').click();
  await page.locator('[data-op="back"]').click();
  await page.locator('#inq-end').fill('1.020');
  await expect(page.locator('#inquiry-next')).toHaveCount(0);
  await page.locator('#inquiry-check').click();
  await page.reload();
  const restored = await current(page);
  expect(restored.adopted).toBe(false);
  expect(restored.exampleUsed).toBe(true);
  expect(restored.failures).toBe(2);
  await expect(feedback(page)).toHaveClass(/correct/);
  await page.screenshot({
    path: evidencePath(`numbers-supported-${browserName}.png`),
    fullPage: true,
  });
});

test('Afrika curriculum correction real baseline save retains ungraded text and supported product through journal and confirmed reset', async ({
  page,
}) => {
  const old = JSON.parse(
    readFileSync(
      new URL('../fixtures/inquiry-5785267.json', import.meta.url),
      'utf8',
    ),
  );
  await page.goto('/');
  await page.evaluate(
    ({ key, old }) => sessionStorage.setItem(key, JSON.stringify(old)),
    { key, old },
  );
  await page.reload();
  await page.locator('[data-op="journal"]').first().click();
  const population = page
    .locator('.journal-record')
    .filter({ has: page.locator('h2').filter({ hasText: 'C ·' }) });
  await expect(population.locator('.own-product')).toHaveText(
    old.inquiry.records.population.product,
  );
  await expect(population).toContainText('Eigene Antwort: noch nicht geprüft.');
  const future = page
    .locator('.journal-record')
    .filter({ has: page.locator('h2').filter({ hasText: 'E ·' }) });
  await expect(future.locator('.own-product')).toHaveText(
    old.inquiry.records.future.product,
  );
  await expect(future).toContainText('Beispiel genutzt');
  const saved = await page.evaluate(
    (key) => JSON.parse(sessionStorage.getItem(key)!),
    key,
  );
  expect(saved.inquiry.records.future.productExampleUsed).toBe(true);
  expect(saved.inquiry.records.population.checks[0].failures).toBe(0);
  await page.locator('[data-op="home"]').click();
  await page.locator('#episode-3').click();
  await page.locator('[data-action="ask-restart"]').click();
  await page.locator('[data-action="cancel-restart"]').click();
  expect(
    await page.evaluate(
      (key) =>
        JSON.parse(sessionStorage.getItem(key)!).inquiry.records.population
          .product,
      key,
    ),
  ).toEqual(old.inquiry.records.population.product);
  await page.locator('[data-action="ask-restart"]').click();
  await page.locator('[data-action="restart"]').click();
  const reset = await page.evaluate((key) => sessionStorage.getItem(key), key);
  expect(reset === null || JSON.parse(reset).inquiry === undefined).toBe(true);
});
