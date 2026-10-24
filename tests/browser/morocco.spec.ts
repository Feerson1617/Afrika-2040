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
async function areaBaseline(page: Page, touch = false) {
  for (const id of [
    '#try-same',
    '#study-single-45',
    '#study-saving-15',
    '#check-answer',
    '#next-step',
  ]) {
    if (touch) await page.locator(id).tap();
    else await page.locator(id).click();
  }
}
async function areaTrials(page: Page, touch = false) {
  for (const [k, v] of [
    ['same', '45'],
    ['extra', '65'],
  ]) {
    for (const id of ['#try-' + k, `#study-${k}-${v}`, '#check-answer']) {
      if (touch) await page.locator(id).tap();
      else await page.locator(id).click();
    }
  }
  for (const id of ['#study-why-growth', '#check-answer', '#next-step']) {
    if (touch) await page.locator(id).tap();
    else await page.locator(id).click();
  }
}
for (const k of ['same', 'extra'])
  test(`Morocco B2 full independent ${k}: field changes, total withdrawal and causal product`, async ({
    page,
  }) => {
    await begin(page, 6);
    await areaBaseline(page);
    await areaTrials(page);
    await decision(page, k, k === 'same' ? 'save' : 'area');
    await expect(page.locator('.study-product')).toContainText('mehr Flächen');
    await expect(page.locator('.study-product')).toContainText(
      '65 statt früher 60',
    );
    await page.reload();
    await expect(page.locator('.study-product')).toBeVisible();
  });
test('Morocco B2 missing/partial work, wrong total despite right single field, supported completion and honest provenance', async ({
  page,
}) => {
  await begin(page, 6);
  await page.locator('#try-same').click();
  await page.locator('#study-single-45').check();
  await page.locator('#check-answer').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/partial/);
  await expect(page.locator('[data-feedback]')).toContainText('45 WE');
  for (const name of [
    'Ich brauche einen Hinweis',
    'Genauer zeigen',
    'Erklärung ansehen',
    'Dieses Beispiel übernehmen',
  ])
    await page.getByRole('button', { name, exact: true }).click();
  await page.locator('#next-step').click();
  await page.locator('#try-extra').click();
  await page.locator('#study-extra-45').check();
  for (let i = 0; i < 2; i++) await page.locator('#check-answer').click();
  await expect(page.locator('#help-title')).toHaveText('→ Hilfe 3 von 3');
  await page.locator('#study-adopt').click();
  await expect(page.locator('#study-extra-65')).toBeChecked();
  await page.locator('#try-same').click();
  await page.locator('#study-adopt').click();
  await page.locator('#study-adopt').click();
  await page.locator('#next-step').click();
  await page.locator('#study-proposal-extra').check();
  await page.locator('#study-goal-save').check();
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
    '65 statt früher 60',
  );
});
test('Morocco B2 all A/AA views and computed names with keyboard switches in both directions', async ({
  page,
}) => {
  await begin(page, 6);
  expect((await auditAccessibility(page)).violations).toEqual([]);
  for (const k of ['same', 'base', 'same']) {
    await page.locator('#study-scene-' + k).focus();
    await page.keyboard.press('Space');
    await expect(page.locator('#study-scene-' + k)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  }
  await areaBaseline(page);
  for (const k of ['extra', 'same', 'extra']) {
    const el = page.locator('#study-scene-' + k);
    await el.focus();
    await expect(el).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#study-scene-' + k)).toHaveAccessibleName(
      k === 'extra' ? 'Zusatzfeld ausprobieren' : 'Gleiches Feld ausprobieren',
    );
    await expect(page.locator('#study-scene-' + k)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  }
  await expect(page.locator('.study-scene')).toContainText('Gesamt 65 WE');
  await expect(page.locator('.study-scene')).toContainText('Rest 15 WE');
  expect((await auditAccessibility(page)).violations).toEqual([]);
  await areaTrials(page);
  expect((await auditAccessibility(page)).violations).toEqual([]);
});
for (const device of [
  { name: 'portrait', width: 768, height: 1024 },
  { name: 'landscape', width: 1024, height: 768 },
])
  for (const n of [5, 6])
    test(`Morocco episode ${n} complete actual touch on simulated iPad ${device.name}`, async ({
      browser,
    }) => {
      const ctx = await browser.newContext({
        viewport: device,
        hasTouch: true,
        isMobile: true,
        baseURL: 'http://127.0.0.1:4173',
      });
      const page = await ctx.newPage();
      await page.goto('/');
      await page.locator('#episode-' + n).tap();
      if (n === 5) {
        for (const id of [
          '#study-withdrawal-60',
          '#study-rest-20',
          '#check-answer',
          '#next-step',
        ])
          await page.locator(id).tap();
        for (const [k, v] of [
          ['repair', '30'],
          ['tech', '35'],
        ])
          for (const id of ['#try-' + k, `#study-${k}-${v}`, '#check-answer'])
            await page.locator(id).tap();
        for (const id of ['#study-why-delivery', '#check-answer', '#next-step'])
          await page.locator(id).tap();
      } else {
        await areaBaseline(page, true);
        await page.locator('#study-scene-extra').tap();
        await expect(page.locator('.study-scene')).toContainText(
          'Gesamt 65 WE',
        );
        if (device.name === 'portrait')
          await page.screenshot({
            path: evidencePath('morocco-b2-ipad-area.png'),
            fullPage: true,
          });
        await areaTrials(page, true);
      }
      await decision(
        page,
        n === 5 ? 'tech' : 'extra',
        n === 5 ? 'less' : 'area',
        true,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.reload();
      await expect(page.locator('.study-product')).toBeVisible();
      await ctx.close();
    });
