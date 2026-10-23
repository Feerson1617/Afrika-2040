import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync } from 'node:fs';
import { evidencePath } from './artifacts.ts';
import {
  fullToDecision,
  chooseRoute,
  setGoal,
  panel,
  selectEvidence,
  key,
  routeChoices,
} from './phase2a-helpers.ts';
const goals = ['school', 'market', 'training'] as const;
const matching = {
  north: 'school',
  direct: 'market',
  south: 'training',
} as const;
const names = { school: 'Amina', market: 'David', training: 'Leila' };
const totals = {
  direct: [22, 12, 22],
  north: [10, 18, 28],
  south: [28, 18, 10],
};
const shortest = [10, 12, 10];
const saved = (p: Page) =>
  p.evaluate((k) => JSON.parse(sessionStorage.getItem(k)!), key);
for (const route of ['direct', 'north', 'south'] as const)
  for (const [index, goal] of goals.entries()) {
    test(`B1 all goals ${route}/${goal}: correct partial facts, conscious weighting, changed goal and reload`, async ({
      page,
    }) => {
      const c = routeChoices[route];
      await fullToDecision(page);
      await chooseRoute(page, c.name);
      await setGoal(page, goal);
      await selectEvidence(page, 'advantage', c.advantage);
      await selectEvidence(page, 'disadvantage', c.disadvantage);
      await page.getByRole('button', { name: 'Empfehlung prüfen' }).click();
      const feedback = page.locator('[data-feedback]');
      await expect(feedback).toHaveClass(/neutral/);
      await expect(feedback).toContainText('Du belegst den Vorteil');
      await expect(feedback).toContainText('Du beachtest auch den Nachteil');
      const conflict = goal !== matching[route];
      if (conflict) {
        await expect(feedback).toContainText('noch nicht verbunden');
        await expect(feedback).toContainText(`${totals[route][index]} Minuten`);
        await expect(feedback).toContainText(`${shortest[index]} Minuten`);
        await expect(page.locator('#next-step')).toHaveCount(0);
        await page.locator('input[name="weighting"]').check();
        await page.getByRole('button', { name: 'Empfehlung prüfen' }).click();
        await expect(feedback).toContainText('wichtiger');
      }
      expect((await saved(page)).progress[5].failures).toBe(0);
      await page.getByRole('button', { name: 'Zum Abschluss' }).click();
      if (conflict) {
        await expect(page.locator('.weighting-product')).toContainText(
          'in Kauf',
        );
        await expect(page.locator('.weighting-product')).toContainText(
          names[goal],
        );
        await expect(page.locator('.weighting-product')).toContainText(
          'wichtiger',
        );
        await page.reload();
        await expect(page.locator('.weighting-product')).toBeVisible();
        await page
          .getByRole('button', { name: 'Empfehlung noch einmal ansehen' })
          .click();
        await page
          .getByRole('button', { name: 'Ich möchte mein Ziel ändern' })
          .click();
        await page
          .getByLabel('Mein Ziel oder Kriterium')
          .selectOption(matching[route]);
        expect((await saved(page)).decision.weighting).toBeUndefined();
        await panel(page, 'weigh');
        await expect(page.locator('#next-step')).toHaveCount(0);
        await page.getByRole('button', { name: 'Empfehlung prüfen' }).click();
        await page.getByRole('button', { name: 'Zum Abschluss' }).click();
        await expect(page.locator('.recommendation')).toContainText(
          names[matching[route]],
        );
      }
      await expect(page.locator('.recommendation')).toContainText(
        'Du hast deine Empfehlung mit Bausteinen begründet.',
      );
    });
  }
for (const device of [
  { name: 'ipad-portrait', width: 768, height: 1024 },
  { name: 'ipad-landscape', width: 1024, height: 768 },
])
  test(`B3 ${device.name}: touch, local comparisons, wrong selection, both conflict paths, provenance and bounded search`, async ({
    browser,
  }) => {
    test.setTimeout(60000);
    const context = await browser.newContext({
      viewport: device,
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await fullToDecision(page, true);
    await chooseRoute(page, 'Über Süd', true);
    await setGoal(page, 'school');
    const metrics: unknown[] = [];
    for (const kind of ['advantage', 'disadvantage'] as const) {
      await panel(page, kind, true);
      await page.locator(`#${kind}-other-direct`).tap();
      await expect(page.locator('[data-decision-panel]')).toHaveCount(1);
      await expect(page.locator('#decision-map')).not.toHaveAttribute('open');
      const rows = page.locator('.evidence-rows');
      await expect(rows.locator('input')).toHaveCount(3);
      // Equal as well as shorter and longer comparisons remain selectable; no automatic matching.
      await expect(rows).toContainText('28');
      await expect(rows).toContainText('22');
      await expect(rows).toContainText('18');
      await expect(rows).toContainText('12');
      await expect(rows).toContainText('10');
      await page.locator('#decision-title').scrollIntoViewIfNeeded();
      const m = await page.evaluate(() => {
        const a = document
          .querySelector('.decision-context')!
          .getBoundingClientRect();
        const b = document
          .querySelector('.evidence-rows')!
          .getBoundingClientRect();
        return {
          height: innerHeight,
          comparisonSpan: b.bottom - a.top,
          rowsTop: b.top,
          rowsBottom: b.bottom,
          scrollY,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      expect(m.comparisonSpan).toBeLessThan(device.height - 32);
      expect(m.rowsTop).toBeGreaterThanOrEqual(0);
      expect(m.rowsBottom).toBeLessThanOrEqual(device.height);
      expect(m.overflow).toBe(false);
      metrics.push({ panel: kind, ...m });
      for (const label of await rows.locator('.choice').all())
        expect((await label.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await page.screenshot({
        path: evidencePath(`correction-${device.name}-${kind}.png`),
      });
      // A fact chosen in the wrong role is possible and remains a thinking task.
      await page
        .locator(
          `#${kind}-${kind === 'advantage' ? 'david' : 'leila'}-south-direct`,
        )
        .tap();
    }
    await panel(page, 'weigh', true);
    await page.getByRole('button', { name: 'Empfehlung prüfen' }).tap();
    await expect(page.locator('[data-feedback]')).toContainText(
      'Prüfe deinen Vorteil',
    );
    await expect(page.locator('[data-feedback]')).toContainText(
      'Prüfe deinen Nachteil',
    );
    await selectEvidence(page, 'advantage', 'leila-south-direct', true);
    await selectEvidence(page, 'disadvantage', 'david-south-direct', true);
    await page.getByRole('button', { name: 'Empfehlung prüfen' }).tap();
    await expect(page.locator('[data-feedback]')).toContainText(
      'Du belegst den Vorteil',
    );
    await expect(page.locator('[data-feedback]')).toContainText(
      'noch nicht verbunden',
    );
    await page.screenshot({
      path: evidencePath(`correction-${device.name}-conflict.png`),
      fullPage: true,
    });
    await page
      .getByRole('button', { name: 'Ich möchte mein Ziel ändern' })
      .tap();
    await page.getByLabel('Mein Ziel oder Kriterium').selectOption('training');
    await panel(page, 'weigh', true);
    await page.getByRole('button', { name: 'Empfehlung prüfen' }).tap();
    await expect(page.locator('#next-step')).toBeVisible();
    await setGoal(page, 'school');
    await panel(page, 'weigh', true);
    await page.locator('input[name="weighting"]').tap();
    await page.getByRole('button', { name: 'Empfehlung prüfen' }).tap();
    await page.getByRole('button', { name: 'Zum Abschluss' }).tap();
    await expect(page.locator('.weighting-product')).toContainText('Amina');
    await expect(page.locator('.weighting-product')).toContainText('Leilas');
    await page.screenshot({
      path: evidencePath(`correction-${device.name}-product.png`),
      fullPage: true,
    });
    await page
      .getByRole('button', { name: 'Empfehlung noch einmal ansehen' })
      .tap();
    await selectEvidence(page, 'disadvantage', 'amina-south-north', true);
    await expect(page.locator('#next-step')).toHaveCount(0);
    await page.getByRole('button', { name: 'Ich brauche einen Hinweis' }).tap();
    await page.getByRole('button', { name: 'Genauer zeigen' }).tap();
    await page.getByRole('button', { name: 'Erklärung ansehen' }).tap();
    await expect(page.locator('.help-panel')).toContainText('weniger gut');
    await expect(page.locator('.help-panel')).toContainText('Trotzdem');
    await page
      .getByRole('button', { name: 'Dieses Beispiel übernehmen' })
      .tap();
    await expect(page.locator('[data-feedback]')).toContainText(
      'Beispiel übernommen',
    );
    await page.reload();
    expect((await saved(page)).decision.supported).toBe(true);
    await page
      .getByRole('button', { name: 'Gewichtung noch einmal öffnen' })
      .tap();
    await expect(page.locator('#next-step')).toHaveCount(0);
    expect((await saved(page)).decision.supported).toBeUndefined();
    await page
      .getByRole('button', { name: 'Dieses Beispiel übernehmen' })
      .tap();
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(axe.violations).toEqual([]);
    writeFileSync(
      evidencePath(`correction-${device.name}-metrics.json`),
      JSON.stringify(metrics, null, 2) + '\n',
    );
    await context.close();
  });
test('B1 keyboard: both conflict paths and deliberate ungraded text; Pages prefix; no silent auto-completion', async ({
  page,
}) => {
  await fullToDecision(page);
  await chooseRoute(page, 'Über Süd');
  await setGoal(page, 'school');
  for (const [kind, person] of [
    ['advantage', 'leila'],
    ['disadvantage', 'david'],
  ] as const) {
    await page.locator(`.decision-tabs [data-value="${kind}"]`).focus();
    await page.keyboard.press('Enter');
    await page.locator(`#${kind}-other-direct`).focus();
    await page.keyboard.press('Space');
    await page.locator(`#${kind}-${person}-south-direct`).focus();
    await page.keyboard.press('Space');
  }
  await page.locator('.decision-tabs [data-value="weigh"]').focus();
  await page.keyboard.press('Enter');
  await page.locator('#check-answer').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#feedback-title')).toBeFocused();
  await expect(page.locator('#next-step')).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Ich möchte mein Ziel ändern' })
    .focus();
  await page.keyboard.press('Enter');
  // Native select type-ahead uses real keys, then assert the actual result.
  await page.locator('#criterion').focus();
  await page.keyboard.press('l');
  await page.keyboard.press('Enter');
  await expect(page.locator('#criterion')).toHaveValue('training');
  await page.locator('.decision-tabs [data-value="weigh"]').focus();
  await page.keyboard.press('Enter');
  await page.locator('#check-answer').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#next-step')).toBeVisible();
  await setGoal(page, 'school');
  await panel(page, 'weigh');
  await page.locator('input[name="weighting"]').focus();
  await page.keyboard.press('Space');
  await page.locator('#check-answer').focus();
  await page.keyboard.press('Enter');
  await page.locator('#next-step').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.weighting-product')).toContainText('Trotzdem');
  // Visit same production build through repository prefix, preserving a deliberately ungraded record.
  await page.goto('http://127.0.0.1:4174/Afrika-2040/');
  await page.evaluate((k) => {
    // Source is an existing real playthrough, copied across local origins for this prefix check.
    sessionStorage.removeItem(k);
  }, key);
  await page.reload();
  // Separate complete flow on prefixed base; no asset errors or special runtime API.
  await page.getByRole('button', { name: 'Spiel starten' }).click();
  for (let i = 0; i < 5; i++) {
    for (const name of [
      'Ich brauche einen Hinweis',
      'Genauer zeigen',
      'Erklärung ansehen',
    ])
      await page.getByRole('button', { name }).click();
    if (i >= 3)
      await page
        .getByRole('button', { name: 'Dieses Beispiel übernehmen' })
        .click();
    await page.getByRole('button', { name: 'Weiter →', exact: true }).click();
  }
  await chooseRoute(page, 'Über Süd');
  await setGoal(page, 'school');
  await panel(page, 'weigh');
  await page.locator('#own-words > summary').click();
  await page.locator('#own-text').fill('<img src=x onerror=alert(1)> ???');
  await page.locator('#check-answer').click();
  await expect(page.locator('#next-step')).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Eigenen Text unbewertet abgeben' })
    .click();
  await page.locator('#next-step').click();
  await expect(page.locator('[data-ungraded]')).toContainText(
    'nicht bestätigt',
  );
  await expect(page.locator('.recommendation img')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('[data-ungraded]')).toBeVisible();
});

test('B1 automatic support keeps the conflicting goal, acknowledges the correct fact and marks any later edit', async ({
  page,
}) => {
  await fullToDecision(page);
  await chooseRoute(page, 'Über Süd');
  await setGoal(page, 'school');
  await selectEvidence(page, 'advantage', 'leila-south-direct');
  await selectEvidence(page, 'disadvantage', 'leila-south-direct');
  for (let i = 0; i < 2; i++) await page.locator('#check-answer').click();
  await expect(page.locator('[data-feedback]')).toContainText(
    'Du belegst den Vorteil',
  );
  await expect(page.locator('.help-panel')).toContainText('28 Minuten');
  await expect(page.locator('.help-panel')).toContainText('nur 10 Minuten');
  expect((await saved(page)).decision.disadvantage).toBe('leila-south-direct');
  await page
    .getByRole('button', { name: 'Dieses Beispiel übernehmen' })
    .click();
  expect((await saved(page)).decision.criterion).toBe('school');
  await page.locator('#next-step').click();
  await expect(page.locator('.weighting-product')).toContainText(
    'längeren Weg für Amina in Kauf',
  );
  await expect(page.locator('[data-supported]')).toContainText(
    'Vorschlag begründen',
  );
  await page
    .getByRole('button', { name: 'Empfehlung noch einmal ansehen' })
    .click();
  await setGoal(page, 'training');
  await panel(page, 'weigh');
  await expect(page.locator('#next-step')).toHaveCount(0);
  expect((await saved(page)).decision.supported).toBeUndefined();
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await expect(page.locator('[data-supported]')).toContainText(
    'Vorschlag begründen',
  );
  await expect(page.locator('.weighting-product')).toHaveCount(0);
});
