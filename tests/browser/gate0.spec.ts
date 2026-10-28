import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { evidencePath } from './artifacts.ts';
const key = 'afrika-2040:kenia-bus:v2a';
test('Afrika curriculum Gate0 reset announces full scope and cancel preserves all inquiry products', async ({
  page,
  browserName,
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
  await page.locator('[data-op="home"]').click();
  await page.locator('[data-action="demand-start"]').click();
  await page.locator('[data-action="ask-restart"]').click();
  await expect(page.locator('.restart-confirm')).toContainText(
    'Alle Antworten in diesem Tab löschen?',
  );
  await expect(page.locator('.restart-confirm')).toContainText('Lernjournal');
  await page.screenshot({
    path: evidencePath(`gate0-reset-${browserName}.png`),
    fullPage: true,
  });
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
  await page.reload();
  expect(
    await page.evaluate((key) => sessionStorage.getItem(key), key),
  ).toBeNull();
});
test('Afrika curriculum Gate0 economic writing has full GEPA and electricity material without changing draft', async ({
  page,
  browserName,
}) => {
  await page.goto('/');
  await page.locator('#inquiry-open').click();
  await page.locator('[data-op="topic"][data-value="economy"]').click();
  for (let i = 0; i < 2; i++) {
    for (let h = 0; h < 3; h++)
      await page
        .getByRole('button', { name: 'Ich brauche einen Hinweis', exact: true })
        .click();
    await page.locator('[data-op="adopt"]').click();
    await page.locator('#inquiry-next').click();
  }
  await page.locator('#inq-product-0').fill('Mein eigener Entwurf.');
  const before = await page.evaluate(
    (key) => JSON.parse(sessionStorage.getItem(key)!).inquiry.records.economy,
    key,
  );
  await page.locator('#inquiry-material-again summary').click();
  await expect(page.locator('#inquiry-material-again')).toContainText(
    'In der Schulung ging es um Preise, Transport und Regeln',
  );
  await expect(page.locator('#inquiry-material-again')).toContainText('Strom');
  expect(
    await page.evaluate(
      (key) => JSON.parse(sessionStorage.getItem(key)!).inquiry.records.economy,
      key,
    ),
  ).toEqual(before);
  await page.screenshot({
    path: evidencePath(`gate0-material-${browserName}.png`),
    fullPage: true,
  });
});
test('Afrika curriculum Gate0 water answer order survives check, back and reload with semantic evaluation', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#episode-5').click();
  const order = () =>
    page
      .locator('input[name="study-withdrawal"]')
      .evaluateAll((els) => els.map((el) => (el as HTMLInputElement).value));
  const before = await order();
  expect(before).toEqual(['40', '60', '80']);
  await page.locator('input[name="study-withdrawal"][value="40"]').check();
  await page.locator('input[name="study-rest"][value="20"]').check();
  await page.locator('[data-action="study"][data-op="check"]').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/partial/);
  expect(await order()).toEqual(before);
  await page.locator('input[name="study-withdrawal"][value="60"]').check();
  await page.locator('[data-action="study"][data-op="check"]').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
  await page.reload();
  expect(await order()).toEqual(before);
});
