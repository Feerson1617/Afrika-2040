import { evidencePath } from './artifacts.ts';
import { chooseRoute, setGoal, ownTextPanel, panel, selectEvidence, weightSelected } from './phase2a-helpers.ts';
import { test, expect, type Page, type Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

import { key, routeChoices as choices, finish2A } from './phase2a-helpers.ts';

async function saved(page: Page) {
  return page.evaluate((k) => JSON.parse(sessionStorage.getItem(k)!), key);
}
async function solveStart(page: Page, touch = false) {
  const act = (l: Locator) => (touch ? l.tap() : l.click());
  await page.goto('/');
  await act(page.getByRole('button', { name: 'Spiel starten' }));
  await act(page.getByRole('radio', { name: /Zum Platz/ }));
  await act(page.getByRole('radio', { name: /Platz → Zentrum/ }));
  await act(page.getByRole('button', { name: 'Weg prüfen', exact: true }));
  await act(page.getByRole('button', { name: 'Weiter →', exact: true }));
}
async function toDecision(page: Page, touch = false) {
  await solveStart(page, touch);
  const act = (l: Locator) => (touch ? l.tap() : l.click());
  for (const name of ['Amina', 'David']) {
    await act(page.getByRole('radio', { name, exact: true }));
    await act(page.getByRole('button', { name: 'Weg prüfen', exact: true }));
    await act(page.getByRole('button', { name: 'Weiter →', exact: true }));
  }
  await finish2A(page, touch);
}
async function assertDirectStartingMap(page: Page) {
  await expect(
    page.getByRole('heading', { name: 'Zeige Aminas Weg zur Schule.' }),
  ).toBeVisible();
  await expect(page.locator('.map-badge.bus-time text')).toHaveText([
    '10 Min.',
  ]);
  await expect(page.locator('.map-badge text')).toHaveText([
    '12 Min.',
    '2 Min.',
    '2 Min.',
    '10 Min.',
    '8 Min.',
  ]);
  await expect(page.locator('#map-bus-direct')).toHaveClass(/active/);
  await expect(page.locator('#map-bus-direct')).toHaveAttribute(
    'aria-label',
    /Platz → Zentrum, 10 Minuten/,
  );
  await expect(page.locator('#bus-nord-choice')).toHaveAttribute(
    'aria-label',
    /Nord → Zentrum, 8 Minuten/,
  );
  await expect(page.locator('#map-bus-north')).toHaveCount(0);
}

test('R1: direct visible times survive back, rework, reload and a legacy saved north state', async ({
  page,
}) => {
  await solveStart(page);
  await page.getByRole('radio', { name: 'Amina', exact: true }).check();
  await page.getByRole('button', { name: 'Weg prüfen', exact: true }).click();
  await page.getByRole('button', { name: 'Über Nord', exact: true }).click();
  const other = (await saved(page)).progress[1];
  await page.getByRole('button', { name: '← Zurück', exact: true }).click();
  await assertDirectStartingMap(page);
  await page.getByRole('button', { name: 'Aufgabe neu bearbeiten' }).click();
  await assertDirectStartingMap(page);
  await page.reload();
  await assertDirectStartingMap(page);
  expect((await saved(page)).progress[1]).toEqual(other);
  await page.evaluate((k) => {
    const s = JSON.parse(sessionStorage.getItem(k)!);
    s.route = 'north';
    sessionStorage.setItem(k, JSON.stringify(s));
  }, key);
  await page.reload();
  await assertDirectStartingMap(page);
  await page.screenshot({
    path: evidencePath('review-R1-restored.png'),
    fullPage: true,
  });
  await page.getByRole('radio', { name: /Zum Platz/ }).check();
  await page.getByRole('radio', { name: /Platz → Zentrum/ }).check();
  await page.getByRole('button', { name: 'Weg prüfen', exact: true }).click();
  await page.getByRole('button', { name: 'Weiter →', exact: true }).click();
  await expect(
    page.getByRole('radio', { name: 'Amina', exact: true }),
  ).toBeChecked();
  expect((await saved(page)).progress[1]).toEqual(other);
});

for (const route of ['direct', 'north'] as const) {
  test(`R2: ${route} wrong evidence gets neutral support, deliberate adoption and a labeled learning product`, async ({
    page,
  }) => {
    const c = choices[route];
    await toDecision(page);
    await chooseRoute(page, c.name);
    await selectEvidence(page, 'advantage', c.advantage);
    await selectEvidence(page, 'disadvantage', c.wrong);
    for (let i = 1; i <= 4; i++) {
      await weightSelected(page);
      await page.getByRole('button', { name: 'Empfehlung prüfen' }).click();
      await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
      await expect(page.locator('[data-feedback]')).toContainText(
        'Du belegst den Vorteil',
      );
      expect((await saved(page)).progress[5].failures).toBe(Math.min(2, i));
      await expect(
        page.getByRole('button', { name: 'Zum Abschluss' }),
      ).toHaveCount(0);
      if (i >= 2) {
        await expect(page.locator('.help-panel')).toContainText(
          `Beispiel für ${c.name}`,
        );
        await expect(page.locator('.help-panel')).toContainText(c.benefit);
        await expect(page.locator('.help-panel')).toContainText(c.cost);
        await expect(
          page.getByRole('button', { name: 'Dieses Beispiel übernehmen' }),
        ).toBeVisible();
      }
    }
    // Merely showing an explanation must not silently correct the selected wrong fact.
    expect((await saved(page)).decision.disadvantage).toBe(c.wrong);
    await page.reload();
    await expect(
      page.getByRole('button', { name: 'Dieses Beispiel übernehmen' }),
    ).toBeVisible();
    await page.screenshot({
      path: evidencePath(`review-R2-${route}-explanation.png`),
      fullPage: true,
    });
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(axe.violations).toEqual([]);
    await page
      .getByRole('button', { name: 'Dieses Beispiel übernehmen' })
      .focus();
    await page.keyboard.press('Enter');
    expect((await saved(page)).decision.disadvantage).toBe(c.disadvantage);
    await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
    await expect(page.locator('[data-feedback]')).toContainText(
      'Mit Unterstützung begründet',
    );
    await page.getByRole('button', { name: 'Zum Abschluss' }).click();
    await expect(
      page.locator('.recommendation [data-supported]'),
    ).toContainText('Mit Hilfe erstellt');
    await expect(page.locator('.recommendation')).toContainText(c.benefit);
    await expect(page.locator('.recommendation')).toContainText(c.cost);
    await expect(page.locator('.recommendation')).not.toContainText(
      'Diesen Beleg musst du noch prüfen',
    );
    await page.reload();
    await expect(page.locator('[data-supported]')).toBeVisible();
  });
}

test('R2: all voluntary hints and a changed proposal offer the matching example without counting failures', async ({
  page,
}) => {
  await toDecision(page);
  await page.getByRole('button', { name: 'Ich brauche einen Hinweis' }).click();
  await expect(page.locator('.help-panel')).toContainText('Hilfe 1 von 3');
  await page.getByRole('button', { name: 'Genauer zeigen' }).click();
  await expect(page.locator('.help-panel')).toContainText('Hilfe 2 von 3');
  await page.getByRole('button', { name: 'Erklärung ansehen' }).click();
  await expect(page.locator('.help-panel')).toContainText(
    'Wähle zuerst deinen Busweg',
  );
  await expect(
    page.getByRole('button', { name: 'Dieses Beispiel übernehmen' }),
  ).toHaveCount(0);
  await chooseRoute(page, 'Über Nord');
  await expect(page.locator('.help-panel')).toContainText(
    'Beispiel für Über Nord',
  );
  await chooseRoute(page, 'Direkt');
  await expect(page.locator('.help-panel')).toContainText(
    'Beispiel für Direkt',
  );
  await expect(page.locator('.help-panel')).toContainText(
    'David: Direkt 12 statt Über Nord 18 Minuten',
  );
  expect((await saved(page)).progress[5].failures).toBe(0);
  await page
    .getByRole('button', { name: 'Dieses Beispiel übernehmen' })
    .click();
  await page.getByRole('button', { name: 'Zum Abschluss' }).click();
  await expect(page.locator('[data-supported]')).toBeVisible();
});

test('R2: unclear free text is never counted as a failed evidence check or silently confirmed', async ({
  page,
}) => {
  await toDecision(page);
  await chooseRoute(page, 'Über Nord');
  await selectEvidence(page, 'advantage', 'amina-north-direct');
  await selectEvidence(page, 'disadvantage', 'amina-north-direct');
  await ownTextPanel(page);
  await page.getByText('Mit eigenen Worten', { exact: false }).click();
  for (const text of ['???', 'amina 999 Minuten', '<b>bus???</b>']) {
    await page.getByLabel('Ich schlage diesen Busweg vor, weil …').fill(text);
    await weightSelected(page);
    await page.getByRole('button', { name: 'Empfehlung prüfen' }).click();
    await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
    await expect(page.locator('[data-feedback]')).toContainText(
      'nicht sicher prüfen',
    );
    expect((await saved(page)).progress[5].failures).toBe(0);
  }
  await expect(page.locator('#next-step')).toHaveCount(0);
  await page.getByRole('button', { name: 'Eigenen Text unbewertet abgeben' }).click();
  await page.getByRole('button', { name: 'Zum Abschluss' }).click();
  await expect(page.locator('.recommendation')).toContainText(
    'Diesen Beleg musst du noch prüfen',
  );
  await expect(page.locator('.saved-text')).toHaveText('<b>bus???</b>');
  await expect(page.locator('[data-supported]')).toHaveCount(0);
});

for (const c of [
  {
    choice: /Zum Platz/,
    part: 'Fußweg zum Platz passt',
    missing: 'Busfahrt',
    kind: 'partial',
  },
  {
    choice: /Platz → Zentrum/,
    part: 'direkte Busfahrt passt',
    missing: 'Fußweg',
    kind: 'partial',
  },
  { choice: /Nach Nord/, part: '', missing: 'Busfahrt', kind: 'hint' },
  { choice: /Nord → Zentrum/, part: '', missing: 'Fußweg', kind: 'hint' },
]) {
  test(`R3: incomplete ${c.choice.source} gets accurate yellow feedback without consuming attempts`, async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Spiel starten' }).click();
    await page.getByRole('radio', { name: c.choice }).check();
    for (let i = 0; i < 4; i++)
      await page
        .getByRole('button', { name: 'Weg prüfen', exact: true })
        .click();
    await expect(page.locator('[data-feedback]')).toHaveClass(
      new RegExp(c.kind),
    );
    await expect(page.locator('[data-feedback]')).toContainText(c.missing);
    if (c.part)
      await expect(page.locator('[data-feedback]')).toContainText(c.part);
    else
      await expect(page.locator('[data-feedback]')).not.toContainText('passt');
    expect((await saved(page)).progress[0].failures).toBe(0);
    await expect(
      page.getByRole('button', { name: 'Weiter →', exact: true }),
    ).toHaveCount(0);
  });
}

for (const viewport of [
  { name: 'desktop', width: 1440, height: 1000, touch: false },
  { name: 'ipad-landscape', width: 1024, height: 768, touch: true },
  { name: 'ipad-portrait', width: 768, height: 1024, touch: true },
])
  for (const route of ['direct', 'north'] as const) {
    test(`complete ${route} recommendation on ${viewport.name}, with measured map readability`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        hasTouch: viewport.touch,
        isMobile: viewport.touch,
      });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await solveStart(page, viewport.touch);
      const act = (l: Locator) => (viewport.touch ? l.tap() : l.click());
      await act(
        page.getByRole('button', { name: choices[route].name, exact: true }),
      );
      const sizes = await page
        .locator('.map-badge text')
        .evaluateAll((elements) =>
          elements.map((el) => {
            const m = (el as SVGTextElement).getScreenCTM()!;
            return (
              Number.parseFloat(getComputedStyle(el).fontSize) *
              Math.hypot(m.a, m.b)
            );
          }),
        );
      expect(Math.min(...sizes)).toBeGreaterThanOrEqual(14);
      const fits = await page.locator('.map-badge').evaluateAll((groups) =>
        groups.every((group) => {
          const text = group.querySelector('text')!.getBoundingClientRect();
          const rect = group.querySelector('rect')!.getBoundingClientRect();
          return (
            text.left >= rect.left &&
            text.right <= rect.right &&
            text.top >= rect.top &&
            text.bottom <= rect.bottom
          );
        }),
      );
      expect(fits).toBe(true);
      test.info().annotations.push({
        type: 'minimum-map-time-css-px',
        description: Math.min(...sizes).toFixed(2),
      });
      console.log(
        JSON.stringify({
          readability: {
            viewport: viewport.name,
            route,
            minimumCssPixels: Number(Math.min(...sizes).toFixed(2)),
            labelsFit: fits,
          },
        }),
      );
      for (const time of [22, 10, 12, 18])
        await expect(page.locator('.comparison')).toContainText(`${time} Min.`);
      await page.screenshot({
        path: evidencePath(`review-${viewport.name}-${route}.png`),
        fullPage: true,
      });
      for (const name of ['Amina', 'David']) {
        await act(page.getByRole('radio', { name, exact: true }));
        await act(
          page.getByRole('button', { name: 'Weg prüfen', exact: true }),
        );
        await act(page.getByRole('button', { name: 'Weiter →', exact: true }));
      }
      await finish2A(page, viewport.touch);
      await chooseRoute(page, choices[route].name);
      await setGoal(page, 'tradeoff');
      await selectEvidence(page, 'advantage', choices[route].advantage);
      await selectEvidence(page, 'disadvantage', choices[route].disadvantage);
      await weightSelected(page);
      await act(page.getByRole('button', { name: 'Empfehlung prüfen' }));
      await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
      await act(page.getByRole('button', { name: 'Zum Abschluss' }));
      await expect(page.locator('.recommendation')).toContainText(
        choices[route].benefit,
      );
      await expect(page.locator('.recommendation')).toContainText(
        choices[route].cost,
      );
      await expect(page.locator('[data-supported]')).toHaveCount(0);
      // The same device must also provide the supported route after two wrong checks.
      await act(
        page.getByRole('button', { name: 'Empfehlung noch einmal ansehen' }),
      );
      await act(page.getByRole('button', { name: 'Aufgabe neu bearbeiten' }));
      await chooseRoute(page, choices[route].name);
      await setGoal(page, 'tradeoff');
      await selectEvidence(page, 'advantage', choices[route].advantage);
      await selectEvidence(page, 'disadvantage', choices[route].wrong);
      for (let i = 0; i < 2; i++) {
        await weightSelected(page);
        await act(page.getByRole('button', { name: 'Empfehlung prüfen' }));
        }
      const support = page.getByRole('button', {
        name: 'Dieses Beispiel übernehmen',
      });
      await expect(support).toBeVisible();
      const box = await support.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      if (viewport.name === 'ipad-landscape' && route === 'north')
        await page.screenshot({
          path: evidencePath('review-ipad-supported.png'),
          fullPage: true,
        });
      await act(support);
      await act(page.getByRole('button', { name: 'Zum Abschluss' }));
      await expect(page.locator('[data-supported]')).toBeVisible();
      await expect(page.locator('.recommendation')).toContainText(
        choices[route].cost,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(errors).toEqual([]);
      await context.close();
    });
  }
