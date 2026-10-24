import { test, expect, type Page } from '@playwright/test';
import { auditAccessibility } from './accessibility.ts';
import { evidencePath } from './artifacts.ts';
async function begin(page: Page, n = 5) {
  await page.goto('/');
  await page.locator('#episode-' + n).click();
}
async function baseline(page: Page) {
  for (const id of [
    '#study-withdrawal-60',
    '#study-rest-20',
    '#check-answer',
    '#next-step',
  ])
    await page.locator(id).click();
}
async function trials(page: Page) {
  for (const [k, v] of [
    ['repair', '30'],
    ['tech', '35'],
  ]) {
    await page.locator('#try-' + k).click();
    await page.locator(`#study-${k}-${v}`).check();
    await page.locator('#check-answer').click();
  }
  await page.locator('#study-why-delivery').check();
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
}
async function decision(page: Page, k: string, goal: string, touch = false) {
  for (const [f, v] of [
    ['proposal', k],
    ['goal', goal],
    ['benefit', k],
    ['limit', k],
  ]) {
    if (touch) await page.locator(`#study-${f}-${v}`).tap();
    else await page.locator(`#study-${f}-${v}`).check();
  }
  for (const id of ['#check-answer', '#next-step']) {
    if (touch) await page.locator(id).tap();
    else await page.locator(id).click();
  }
  await expect(page.locator('.study-product')).toBeVisible();
}
for (const [k, goal] of [
  ['repair', 'repair'],
  ['tech', 'less'],
])
  test(`Morocco B1 full ${k}, tank balance and independently preserved product`, async ({
    page,
  }) => {
    await begin(page);
    await baseline(page);
    await trials(page);
    await decision(page, k, goal);
    await expect(page.locator('.study-product')).toContainText(
      k === 'repair' ? '30 WE' : '35 WE',
    );
    await page.reload();
    await expect(page.locator('.study-product')).toBeVisible();
  });
test('Morocco B1 partials, wrong answers, bounded help and full supported path without claiming groundwater or harvest', async ({
  page,
}) => {
  await begin(page);
  await page.locator('#study-withdrawal-60').check();
  await page.locator('#check-answer').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/partial/);
  await expect(page.locator('[data-feedback]')).toContainText('60 WE');
  await page.locator('#study-rest-60').check();
  for (let i = 0; i < 2; i++) await page.locator('#check-answer').click();
  await expect(page.locator('#help-title')).toHaveText('→ Hilfe 3 von 3');
  await page.locator('#study-adopt').click();
  await page.locator('#next-step').click();
  for (const name of [
    'Ich brauche einen Hinweis',
    'Genauer zeigen',
    'Erklärung ansehen',
  ])
    await page.getByRole('button', { name, exact: true }).click();
  for (const k of ['repair', 'tech']) {
    await page.locator('#try-' + k).click();
    await page.locator('#study-adopt').click();
  }
  await page.locator('#study-adopt').click();
  await page.locator('#next-step').click();
  await page.locator('#study-proposal-tech').check();
  await page.locator('#study-goal-repair').check();
  for (const name of [
    'Ich brauche einen Hinweis',
    'Genauer zeigen',
    'Erklärung ansehen',
    'Dieses Beispiel übernehmen',
  ])
    await page.getByRole('button', { name, exact: true }).click();
  await page.locator('#next-step').click();
  await expect(page.locator('[data-supported]')).toBeVisible();
  await expect(page.locator('.study-product')).toContainText(
    'Dafür nehme ich in Kauf',
  );
  await page.screenshot({
    path: evidencePath('morocco-b1-supported.png'),
    fullPage: true,
  });
});
test('Morocco B1 A/AA in all learning states, computed SVG labels and bidirectional keyboard/HTML controls', async ({
  page,
}) => {
  await begin(page);
  expect((await auditAccessibility(page)).violations).toEqual([]);
  await baseline(page);
  for (const k of ['repair', 'tech', 'repair']) {
    const el = page.locator('#study-scene-' + k);
    await el.focus();
    await expect(el).toBeFocused();
    await page.keyboard.press(k === 'repair' ? 'Space' : 'Enter');
    await expect(page.locator('#study-scene-' + k)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.locator('#study-scene-' + k)).toHaveAccessibleName(
      k === 'repair'
        ? 'Reparatur ausprobieren'
        : 'Neue Verteilung ausprobieren',
    );
  }
  await page.locator('#try-tech').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#study-scene-tech')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect((await auditAccessibility(page)).violations).toEqual([]);
  await trials(page);
  expect((await auditAccessibility(page)).violations).toEqual([]);
});
