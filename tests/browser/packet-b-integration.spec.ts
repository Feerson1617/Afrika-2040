import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { evidencePath } from './artifacts.ts';
import { initialState } from '../../src/state.ts';
import {
  newLearning,
  reduceLearning,
  active,
} from '../../src/learning/storage.ts';
const key = 'afrika-2040:kenia-bus:v2a';
test('Afrika curriculum PaketB integrated main: five chapters, direct unlocked entry, profile choice, resume, honest journal and legacy access', async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');
  await expect(page.locator('#learning-chapters > section')).toHaveCount(5);
  await expect(page.locator('#learning-chapters button')).toHaveCount(13);
  await expect(page.locator('#inquiry-open')).toHaveCount(0);
  await page.locator('#learn-s3').press('Enter');
  await page
    .locator('[data-op="request-profile"][data-value="foerder"]')
    .click();
  await page.locator('[data-op="confirm-profile"]').click();
  await expect(page.locator('h1')).toContainText('Schritt 1');
  await page.locator('#learn-step').selectOption('beans');
  await page.locator('#learning-check').press('Enter');
  await page.locator('[data-op="menu"]').click();
  await page.locator('#learning-resume').click();
  await expect(page.locator('#learn-step')).toHaveValue('beans');
  await page.reload();
  await expect(page.locator('#learn-step')).toHaveValue('beans');
  await page.locator('[data-op="journal"]').click();
  await expect(page.locator('.journal-record')).toHaveCount(1);
  await expect(page.locator('.journal-record')).toContainText('Ghana 3');
  await expect(page.locator('.journal-record')).toContainText('Bohnen');
  await expect(
    page.getByText('Noch nicht begonnene Bereiche', { exact: true }),
  ).toBeVisible();
  const axe = await new AxeBuilder({ page })
    .withTags([
      'wcag2a',
      'wcag2aa',
      'wcag21a',
      'wcag21aa',
      'wcag22a',
      'wcag22aa',
    ])
    .analyze();
  expect(axe.violations).toEqual([]);
  await page.screenshot({
    path: evidencePath(`packet-journal-${browserName}.png`),
    fullPage: true,
  });
  await page.locator('[data-op="menu"]').click();
  await page.locator('#learning-legacy > summary').click();
  await page
    .getByRole('button', { name: 'Bisherige Themen und Episoden öffnen' })
    .click();
  await expect(page.locator('#inquiry-open')).toBeVisible();
});
test('Afrika curriculum PaketB orientation map keyboard and HTML alternatives keep actual answers and focus together', async ({
  page,
}) => {
  await page.goto('/?lernweg=esa&bereich=o');
  await page.locator('#geo-country-GHA').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#geo-country-GHA')).toBeFocused();
  await expect(page.locator('#geo-country-GHA')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('#learn-country')).toHaveValue('GHA');
  await page.locator('#sim-Modelluntersuchen-MAR').press('Enter');
  await expect(page.locator('#learn-country')).toHaveValue('MAR');
  await page.locator('#learning-check').click();
  await expect(page.locator('[data-learning-feedback]')).toHaveClass(
    /incorrect/,
  );
  await page.locator('#learning-check').click();
  await expect(page.locator('[data-learning-feedback]')).toHaveClass(/hint/);
  await page.locator('#learning-adopt').click();
  await expect(page.locator('#learn-country')).toHaveValue('GHA');
  await expect(page.locator('#geo-country-GHA')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.reload();
  await expect(page.locator('#learn-country')).toHaveValue('GHA');
});
test('Afrika curriculum PaketB iPad future table uses readable aliases and concrete low-language weighting', async ({
  page,
  browserName,
}) => {
  let s = reduceLearning(newLearning(), {
    type: 'learning',
    op: 'recommend',
    value: 'esa',
    field: 'e',
  });
  for (let i = 0; i < 20 && active(s)!.task.id !== 'future.weight'; i++) {
    s = reduceLearning(s, { type: 'learning', op: 'adopt' });
    s = reduceLearning(s, { type: 'learning', op: 'next' });
  }
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');
  await page.evaluate(
    ({ key, s }) => sessionStorage.setItem(key, JSON.stringify({ ...s })),
    { key, s: { ...initialState(), screen: 'learning', learning: s } },
  );
  await page.reload();
  await expect(page.locator('.inquiry-material')).toContainText(
    'Schattendächer und Mehrwegkisten',
  );
  await expect(page.locator('table tbody th').first()).toHaveCSS(
    'overflow-wrap',
    'normal',
  );
  expect(await page.locator('#learn-weight').innerText()).not.toMatch(
    /gewichte|deren|legitim/,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: evidencePath(`packet-table-${browserName}.png`),
    fullPage: true,
  });
});
test('Afrika curriculum PaketB narrow embedded content retains chapter navigation and keyboard controls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');
  await page.evaluate(() => {
    document.body.innerHTML =
      '<iframe title="Lernspiel" src="/?lernweg=msa&bereich=s6" style="width:700px;height:650px;border:0"></iframe>';
  });
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('h1')).toBeVisible();
  await frame.locator('#sim-Modelluntersuchen-same').press('Enter');
  await expect(frame.locator('#sim-Modelluntersuchen-same')).toBeFocused();
  await frame.locator('#learn-single').fill('45');
  await frame.locator('#learn-saving').fill('15');
  await frame.locator('#learning-check').press('Enter');
  await expect(frame.locator('#learning-next')).toBeVisible();
});
