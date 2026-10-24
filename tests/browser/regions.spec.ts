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
async function shareLedger(page: Page, touch = false) {
  for (const selector of [
    '#study-free-120',
    '#study-wages-paid',
    '#check-answer',
    '#next-step',
  ]) {
    if (touch) await page.locator(selector).tap();
    else await page.locator(selector).click();
  }
}
async function distribute(page: Page, touch = false) {
  for (const k of ['payout', 'reserve', 'training']) {
    for (const selector of ['#try-' + k, '#add-' + k, '#add-' + k]) {
      if (touch) await page.locator(selector).tap();
      else await page.locator(selector).click();
    }
  }
  for (const selector of [
    '#study-why-tradeoff',
    '#check-answer',
    '#next-step',
  ]) {
    if (touch) await page.locator(selector).tap();
    else await page.locator(selector).click();
  }
}
async function regionalDecision(
  page: Page,
  proposal: string,
  goal: string,
  touch = false,
) {
  for (const [f, v] of [
    ['proposal', proposal],
    ['goal', goal],
    ['benefit', proposal],
    ['limit', proposal],
  ]) {
    if (touch) await page.locator(`#study-${f}-${v}`).tap();
    else await page.locator(`#study-${f}-${v}`).check();
  }
  if (touch) await page.locator('#check-answer').tap();
  else await page.locator('#check-answer').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
  if (touch) await page.locator('#next-step').tap();
  else await page.locator('#next-step').click();
  await expect(page.locator('.study-product')).toBeVisible();
}
for (const priority of ['payout', 'reserve', 'training'])
  test(`Ghana A2 full independent plan and legitimate ${priority} argument`, async ({
    page,
  }) => {
    await begin(page, 4);
    await shareLedger(page);
    await distribute(page);
    await regionalDecision(page, priority, priority);
    await expect(page.locator('.study-product')).toContainText('40 GE');
    await page.reload();
    await expect(page.locator('.study-product')).toBeVisible();
  });
test('Ghana A2 wrong/partial feedback, all help stages, own example and rechecking after edits', async ({
  page,
}) => {
  await begin(page, 4);
  await page.locator('#study-free-120').check();
  await page.locator('#check-answer').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/partial/);
  await expect(page.locator('[data-feedback]')).toContainText('120 GE');
  await page.locator('#study-wages-later').check();
  for (let i = 0; i < 2; i++) await page.locator('#check-answer').click();
  await expect(page.locator('#help-title')).toHaveText('→ Hilfe 3 von 3');
  await page.locator('#study-adopt').click();
  await page.locator('#next-step').click();
  for (const name of [
    'Ich brauche einen Hinweis',
    'Genauer zeigen',
    'Erklärung ansehen',
    'Dieses Beispiel übernehmen',
  ])
    await page.getByRole('button', { name, exact: true }).click();
  await expect(page.locator('.study-mini-balance')).toContainText(
    '0 von 120 GE',
  );
  await page.locator('#next-step').click();
  await page.locator('#study-proposal-reserve').check();
  await page.locator('#study-goal-payout').check();
  for (const name of [
    'Ich brauche einen Hinweis',
    'Genauer zeigen',
    'Erklärung ansehen',
    'Dieses Beispiel übernehmen',
  ])
    await page.getByRole('button', { name, exact: true }).click();
  await expect(page.locator('#study-weighted-yes')).toBeChecked();
  await page.locator('#next-step').click();
  await expect(page.locator('[data-supported]')).toBeVisible();
  await page.getByRole('button', { name: 'Empfehlung bearbeiten' }).click();
  await page.locator('#study-goal-reserve').check();
  await expect(page.locator('#next-step')).toHaveCount(0);
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await expect(page.locator('[data-supported]')).toHaveCount(0);
  await expect(page.locator('[data-help-history]')).toBeVisible();
});
for (const device of [
  { name: 'portrait', width: 768, height: 1024 },
  { name: 'landscape', width: 1024, height: 768 },
]) {
  test(`Ghana A1 full actual touch on simulated iPad ${device.name} with calculation beside answers`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: device,
      hasTouch: true,
      isMobile: true,
      baseURL: 'http://127.0.0.1:4173',
    });
    const page = await context.newPage();
    await page.goto('/');
    await page.locator('#episode-3').tap();
    for (const k of ['beans', 'roast', 'mass', 'press'])
      await page.locator('#chain-' + k).tap();
    await page.locator('#check-answer').tap();
    await page.locator('#next-step').tap();
    for (const [k, v] of [
      ['quality', '90'],
      ['process', '75'],
    ]) {
      await page.locator('#try-' + k).tap();
      await expect(page.locator('.study-inline-ledger')).toContainText(
        k === 'quality' ? '200 GE' : '260 GE',
      );
      const distance = await page
        .locator('.study-inline-ledger')
        .evaluate((e) => {
          const b = e.getBoundingClientRect(),
            a = e.nextElementSibling!.getBoundingClientRect();
          return a.top - b.bottom;
        });
      expect(distance).toBeLessThan(100);
      await page.locator(`#study-${k}-${v}`).tap();
      await page.locator('#check-answer').tap();
    }
    for (const selector of ['#study-why-costs', '#check-answer', '#next-step'])
      await page.locator(selector).tap();
    await regionalDecision(page, 'process', 'processing', true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await context.close();
  });
  test(`Ghana A2 full actual touch on simulated iPad ${device.name}, budget and consequences stay at controls`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: device,
      hasTouch: true,
      isMobile: true,
      baseURL: 'http://127.0.0.1:4173',
    });
    const page = await context.newPage();
    await page.goto('/');
    await page.locator('#episode-4').tap();
    await shareLedger(page, true);
    await page.locator('#try-training').tap();
    await expect(page.locator('.study-allocation .study-effect')).toContainText(
      'nicht sicher',
    );
    await page.locator('#add-training').tap();
    await expect(page.locator('.study-mini-balance')).toBeInViewport();
    await page.locator('#remove-training').tap();
    await distribute(page, true);
    await expect(page.locator('.study-facts')).toHaveCount(0);
    await page.locator('#study-proposal-training').tap();
    await page.locator('#study-goal-training').tap();
    if (device.name === 'portrait')
      await page.screenshot({
        path: evidencePath('ghana-a2-ipad-decision.png'),
        fullPage: true,
      });
    await regionalDecision(page, 'training', 'training', true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (device.name === 'portrait')
      await page.screenshot({
        path: evidencePath('ghana-a2-ipad-product.png'),
        fullPage: true,
      });
    await context.close();
  });
}
test('Ghana keyboard activation in both episodes uses real focus, SVG and HTML alternatives; A2 all learning views A/AA', async ({
  page,
}) => {
  await begin(page);
  await chain(page);
  const svg = page.locator('#study-scene-quality');
  await svg.focus();
  await expect(svg).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#study-scene-quality')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.locator('#try-process').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#study-scene-process')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page
    .getByRole('button', { name: 'Episoden auswählen', exact: true })
    .click();
  await page.locator('#episode-4').focus();
  await page.keyboard.press('Enter');
  expect((await auditAccessibility(page)).violations).toEqual([]);
  await shareLedger(page);
  await page.locator('#study-scene-reserve').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#study-scene-reserve')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('#study-scene-reserve')).toHaveAccessibleName(
    'Rücklage 0 GE ausprobieren',
  );
  await page.locator('#add-reserve').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.study-mini-balance')).toContainText(
    '100 von 120 GE',
  );
  await expect(page.locator('#study-scene-reserve')).toHaveAccessibleName(
    'Rücklage 20 GE ausprobieren',
  );
  await page.locator('#remove-reserve').click();
  await expect(page.locator('#study-scene-reserve')).toHaveAccessibleName(
    'Rücklage 0 GE ausprobieren',
  );
  expect((await auditAccessibility(page)).violations).toEqual([]);
  await distribute(page);
  expect((await auditAccessibility(page)).violations).toEqual([]);
});
