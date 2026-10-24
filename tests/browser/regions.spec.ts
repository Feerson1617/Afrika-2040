import { test, expect, type Page } from '@playwright/test';
import { auditAccessibility } from './accessibility.ts';
import { evidencePath } from './artifacts.ts';
async function begin(page: Page, n = 3) {
  await page.goto('/');
  await page.locator('#episode-' + n).click();
}
async function chain(page: Page) {
  for (const id of ['beans', 'roast', 'mass', 'press'])
    await page.locator('#chain-' + id).click();
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
}
async function trials(page: Page) {
  for (const [id, value] of [
    ['quality', '90'],
    ['process', '75'],
  ]) {
    await page.locator('#try-' + id).click();
    await page.locator(`#study-${id}-${value}`).check();
    await page.locator('#check-answer').click();
  }
  await page.locator('#study-why-costs').check();
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
}
for (const measure of ['quality', 'process'])
  test(`Ghana A1 full ${measure}: production, both trials, explanation, decision, reload and independent entry`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await begin(page);
    await chain(page);
    await trials(page);
    for (const [field, value] of [
      ['proposal', measure],
      ['goal', measure === 'quality' ? 'surplus' : 'processing'],
      ['benefit', measure],
      ['limit', measure],
    ])
      await page.locator(`#study-${field}-${value}`).check();
    await page.locator('#check-answer').click();
    await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
    await page.locator('#next-step').click();
    await expect(page.locator('.study-product')).toContainText(
      measure === 'quality' ? '90 GE' : '75 GE',
    );
    await page.reload();
    await expect(page.locator('.study-product')).toBeVisible();
    if (measure === 'process')
      await page.screenshot({
        path: evidencePath('ghana-a1-product.png'),
        fullPage: true,
      });
    expect(errors).toEqual([]);
  });
test('Ghana A1 supported route, partial acknowledgment, visible help, neutral target conflict and current provenance', async ({
  page,
}) => {
  await begin(page);
  await page.locator('#chain-beans').click();
  await page.locator('#check-answer').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/partial/);
  for (const name of [
    'Ich brauche einen Hinweis',
    'Genauer zeigen',
    'Erklärung ansehen',
    'Dieses Beispiel übernehmen',
  ])
    await page.getByRole('button', { name, exact: true }).click();
  await page.locator('#next-step').click();
  for (const id of ['quality', 'process']) {
    await page.locator('#try-' + id).click();
    if (id === 'quality')
      for (const name of [
        'Ich brauche einen Hinweis',
        'Genauer zeigen',
        'Erklärung ansehen',
      ])
        await page.getByRole('button', { name, exact: true }).click();
    await page
      .getByRole('button', { name: 'Dieses Beispiel übernehmen' })
      .click();
  }
  await page
    .getByRole('button', { name: 'Dieses Beispiel übernehmen' })
    .click();
  await page.locator('#next-step').click();
  for (const [f, v] of [
    ['proposal', 'process'],
    ['goal', 'surplus'],
    ['benefit', 'process'],
    ['limit', 'process'],
  ])
    await page.locator(`#study-${f}-${v}`).check();
  await page.locator('#check-answer').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
  await expect(page.locator('[data-feedback]')).toContainText(
    'noch nicht verbunden',
  );
  await page.locator('#study-weighted-yes').check();
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await expect(page.locator('[data-help-history]')).toBeVisible();
  await expect(page.locator('.study-product')).toContainText(
    'Dafür nehme ich in Kauf',
  );
});
test('Ghana A1 complete shared A/AA audit includes interactive scene and correct computed labels', async ({
  page,
}) => {
  await begin(page);
  expect((await auditAccessibility(page)).violations).toEqual([]);
  await chain(page);
  for (const label of ['Lagerung', 'Presse'])
    await expect(
      page.getByRole('button', { name: label + ' ausprobieren', exact: true }),
    ).toBeVisible();
  expect((await auditAccessibility(page)).violations).toEqual([]);
  await trials(page);
  expect((await auditAccessibility(page)).violations).toEqual([]);
});
