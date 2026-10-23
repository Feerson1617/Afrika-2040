import { evidencePath } from './artifacts.ts';
import { chooseRoute, setGoal, ownTextPanel, panel, selectEvidence, weightSelected, openDecisionMap, nativeFirstOption } from './phase2a-helpers.ts';
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  fullToDecision,
  finish2A,
  routeChoices,
  actOn,
  key,
} from './phase2a-helpers.ts';
const expected = {
  amina: { direct: [12, 10, 22], north: [2, 8, 10], south: [12, 16, 28] },
  david: { direct: [2, 10, 12], north: [2, 16, 18], south: [2, 16, 18] },
  leila: { direct: [12, 10, 22], north: [12, 16, 28], south: [2, 8, 10] },
};
const routeNames = { direct: 'Direkt', north: 'Über Nord', south: 'Über Süd' };
const personNames = { amina: 'Amina', david: 'David', leila: 'Leila' };
const saved = (page: Page) =>
  page.evaluate((k) => JSON.parse(sessionStorage.getItem(k)!), key);
async function toExplanation(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Spiel starten' }).click();
  for (let i = 0; i < 3; i++) {
    await page
      .getByRole('button', { name: 'Ich brauche einen Hinweis' })
      .click();
    await page.getByRole('button', { name: 'Genauer zeigen' }).click();
    await page.getByRole('button', { name: 'Erklärung ansehen' }).click();
    await page.getByRole('button', { name: 'Weiter →', exact: true }).click();
  }
}
for (const device of [
  { name: 'desktop', width: 1440, height: 1000, touch: false },
  { name: 'ipad-landscape', width: 1024, height: 768, touch: true },
  { name: 'ipad-portrait', width: 768, height: 1024, touch: true },
])
  for (const route of ['direct', 'north', 'south'] as const) {
    test(`Phase2A full ${route} flow on ${device.name}: all nine journeys and supported completion`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { width: device.width, height: device.height },
        hasTouch: device.touch,
        isMobile: device.touch,
      });
      const page = await context.newPage(),
        errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      const act = actOn(device.touch);
      await fullToDecision(page, device.touch);
      await openDecisionMap(page);
      for (const r of ['direct', 'north', 'south'] as const) {
        await openDecisionMap(page);
        await act(page.locator(`#route-${r}`));
        for (const person of ['amina', 'david', 'leila'] as const) {
          await act(page.locator(`#inspect-${person}`));
          const [walk, bus, total] = expected[person][r];
          await expect(page.locator('[data-time="walk"]')).toHaveText(
            String(walk),
          );
          await expect(page.locator('[data-time="bus"]')).toHaveText(
            String(bus),
          );
          await expect(page.locator('[data-time="total"]')).toHaveText(
            String(total),
          );
          await expect(page.locator('#map-desc')).toContainText(
            `${personNames[person]} geht ${walk} Minuten`,
          );
          await expect(page.locator('.map-control.bus')).toHaveCount(1);
          const sections = await page
            .locator('[data-segment]')
            .evaluateAll((els) =>
              els.map((el) => el.getAttribute('data-segment')),
            );
          expect(sections).toEqual(
            r === 'direct'
              ? ['direct']
              : r === 'north'
                ? ['platzNord', 'nordZentrum']
                : ['platzSued', 'suedZentrum'],
          );
          await expect(page.locator('.map-badge text')).toHaveText([
            `${walk} Min.`,
            ...(r === 'direct' ? ['10 Min.'] : ['8 Min.', '8 Min.']),
          ]);
        }
      }
      const c = routeChoices[route];
      await openDecisionMap(page);
      await act(page.locator(`#route-${route}`));
      await act(
        page.locator(
          `#inspect-${route === 'direct' ? 'david' : route === 'north' ? 'amina' : 'leila'}`,
        ),
      );
      const readability = await page
        .locator('.map-badge')
        .evaluateAll((groups) =>
          groups.map((group) => {
            const el = group.querySelector('text')! as SVGTextElement,
              m = el.getScreenCTM()!,
              text = el.getBoundingClientRect(),
              rect = group.querySelector('rect')!.getBoundingClientRect();
            return {
              cssPixels:
                Number.parseFloat(getComputedStyle(el).fontSize) *
                Math.hypot(m.a, m.b),
              fits:
                text.left >= rect.left &&
                text.right <= rect.right &&
                text.top >= rect.top &&
                text.bottom <= rect.bottom,
            };
          }),
        );
      expect(
        Math.min(...readability.map((r) => r.cssPixels)),
      ).toBeGreaterThanOrEqual(14);
      expect(readability.every((r) => r.fits)).toBe(true);
      console.log(
        JSON.stringify({
          phase2aReadability: {
            device: device.name,
            route,
            minimumCssPixels: Math.min(...readability.map((r) => r.cssPixels)),
            labelsFit: true,
          },
        }),
      );
      for (const selector of [
        '.route-button',
        '.three-choices .choice',
        '.task-actions .button',
      ])
        for (const el of await page.locator(selector).all())
          expect((await el.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.locator('.map-column').screenshot({
        path: evidencePath(`map-${device.name}-${route}.png`),
      });
      await chooseRoute(page, c.name);
      await setGoal(page,
          route === 'north'
            ? 'school'
            : route === 'south'
              ? 'training'
              : 'market',
        );
      await selectEvidence(page, 'advantage', c.advantage);
      await selectEvidence(page, 'disadvantage', c.disadvantage);
      await weightSelected(page);
      await act(
        page.getByRole('button', { name: 'Empfehlung prüfen', exact: true }),
      );
      await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
      await act(page.getByRole('button', { name: 'Zum Abschluss' }));
      await expect(
        page.getByRole('heading', { name: 'Ein Busweg. Drei Perspektiven.' }),
      ).toBeVisible();
      await expect(page.locator('.recommendation')).toContainText(c.benefit);
      await expect(page.locator('.recommendation')).toContainText(c.cost);
      await expect(page.locator('[data-supported]')).toHaveCount(0);
      if (device.name === 'desktop')
        await page.screenshot({
          path: evidencePath(`end-${route}.png`),
          fullPage: true,
        });
      await page.reload();
      await expect(page.locator('.recommendation')).toContainText(c.name);
      await act(
        page.getByRole('button', { name: 'Empfehlung noch einmal ansehen' }),
      );
      await act(page.getByRole('button', { name: 'Aufgabe neu bearbeiten' }));
      await chooseRoute(page, c.name);
      await setGoal(page, 'tradeoff');
      await selectEvidence(page, 'advantage', c.advantage);
      await selectEvidence(page, 'disadvantage', c.wrong);
      for (let i = 0; i < 2; i++) {
        await weightSelected(page);
        await act(page.getByRole('button', { name: 'Empfehlung prüfen' }));
        }
      await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
      await expect(
        page.getByRole('button', { name: 'Zum Abschluss' }),
      ).toHaveCount(0);
      const support = page.getByRole('button', {
        name: 'Dieses Beispiel übernehmen',
      });
      await expect(support).toBeVisible();
      if (device.name === 'ipad-landscape' && route === 'south')
        await page.screenshot({
          path: evidencePath('ipad-supported-south.png'),
          fullPage: true,
        });
      await act(support);
      await act(page.getByRole('button', { name: 'Zum Abschluss' }));
      await expect(page.locator('[data-supported]')).toContainText(
        'Vorschlag begründen',
      );
      expect((await saved(page)).progress[5].failures).toBe(2);
      expect(errors).toEqual([]);
      await act(page.getByRole('button', { name: 'Neu spielen', exact: true }));
      expect(
        await page.evaluate(() =>
          sessionStorage.getItem('afrika-2040:kenia-bus:v2a'),
        ),
      ).toBeNull();
      await context.close();
    });
  }

test('Phase2A explanation: partial feedback, two errors, accessible support and re-adoption after editing', async ({
  page,
}) => {
  await toExplanation(page);
  await expect(page.locator('.map-column')).not.toContainText('Leila');
  await expect(page.locator('#route-south')).toHaveCount(0);
  await page.getByLabel('Was ändert sich am Fußweg?').selectOption('shorter');
  for (let i = 0; i < 4; i++)
    await page.getByRole('button', { name: 'Erklärung prüfen' }).click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/partial/);
  expect((await saved(page)).progress[3].failures).toBe(0);
  await page
    .getByLabel('Was folgt für den ganzen Weg?')
    .selectOption('busOnly');
  await page.getByRole('button', { name: 'Erklärung prüfen' }).click();
  await expect(page.locator('[data-feedback]')).toContainText('Fußweg passt');
  await page.getByRole('button', { name: 'Erklärung prüfen' }).click();
  await expect(
    page.getByRole('button', { name: 'Weiter →', exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('.help-panel')).toContainText('erst in Nord');
  await page.screenshot({
    path: evidencePath('explanation-support.png'),
    fullPage: true,
  });
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  await page
    .getByRole('button', { name: 'Dieses Beispiel übernehmen' })
    .focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-feedback]')).toHaveClass(/hint/);
  await page.getByLabel('Was ändert sich am Fußweg?').selectOption('same');
  await expect(
    page.getByRole('button', { name: 'Dieses Beispiel übernehmen' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Dieses Beispiel übernehmen' })
    .click();
  await page.reload();
  expect((await saved(page)).explanation.supported).toBe(true);
});
test('Phase2A free explanation is preserved, escaped and never graded even with contradictory blocks', async ({
  page,
}) => {
  await toExplanation(page);
  await ownTextPanel(page);
  await page.getByText('Mit eigenen Worten', { exact: false }).click();
  for (const text of [
    '???',
    'Amina braucht 999 Minuten',
    '<img src=x onerror=alert(1)> bus flupp',
  ]) {
    await page
      .getByLabel('Warum ist Aminas ganzer Weg über Nord kürzer?')
      .fill(text);
    await page.getByRole('button', { name: 'Erklärung prüfen' }).click();
    await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
    await expect(page.locator('[data-feedback]')).toContainText(
      'nicht sicher prüfen',
    );
    expect((await saved(page)).progress[3].failures).toBe(0);
  }
  await page.reload();
  await expect(
    page.getByLabel('Warum ist Aminas ganzer Weg über Nord kürzer?'),
  ).toHaveValue('<img src=x onerror=alert(1)> bus flupp');
  await finish2A(page);
  await chooseRoute(page, 'Über Süd');
  await selectEvidence(page, 'advantage', routeChoices.south.advantage);
  await selectEvidence(page, 'disadvantage', routeChoices.south.disadvantage);
  await weightSelected(page);
  await page.getByRole('button', { name: 'Empfehlung prüfen' }).click();
  await page.getByRole('button', { name: 'Zum Abschluss' }).click();
  await page
    .getByText('Deine Erklärung und deine Vermutung', { exact: true })
    .click();
  await expect(page.locator('.saved-explanation')).toHaveText(
    '<img src=x onerror=alert(1)> bus flupp',
  );
  await expect(page.locator('.recommendation img')).toHaveCount(0);
});
test('Phase2A prediction, Leila errors and repeated visits retain an honest supported record', async ({
  page,
}) => {
  await toExplanation(page);
  await page.getByLabel('Was ändert sich am Fußweg?').selectOption('shorter');
  await page.getByLabel('Was folgt für den ganzen Weg?').selectOption('total');
  await page.getByRole('button', { name: 'Erklärung prüfen' }).click();
  await page.getByRole('button', { name: 'Weiter →', exact: true }).click();
  await expect(page.locator('#route-south')).toBeDisabled();
  await chooseRoute(page, 'Direkt');
  for (const name of ['Über Nord', 'Über Süd'])
    await page.getByRole('button', { name, exact: true }).click();
  await chooseRoute(page, 'Über Nord');
  for (let i = 0; i < 2; i++)
    await page.getByRole('button', { name: 'Weg prüfen', exact: true }).click();
  expect((await saved(page)).progress[4].prediction).toBe('direct');
  await page
    .getByRole('button', { name: 'Dieses Beispiel übernehmen' })
    .click();
  await page.getByRole('button', { name: 'Weiter →', exact: true }).click();
  await openDecisionMap(page);
  await page.locator('#route-south').click();
  await page.getByRole('button', { name: '← Zurück', exact: true }).click();
  await expect(page.locator('.leila-intro')).toContainText('Direkt');
  await page.getByRole('button', { name: '← Zurück', exact: true }).click();
  await expect(page.locator('#marker-leila')).toHaveCount(0);
  await expect(page.locator('#route-south')).toHaveCount(0);
  await page.getByRole('button', { name: 'Weiter →', exact: true }).click();
  await page.reload();
  expect((await saved(page)).progress[4].supported).toBe(true);
  await page.getByRole('button', { name: 'Aufgabe neu bearbeiten' }).click();
  await expect(page.locator('#route-south')).toBeDisabled();
  expect((await saved(page)).progress[3].complete).toBe(true);
  expect((await saved(page)).progress[4].explored).toEqual([]);
});
test('Phase2A keyboard operates new sentence blocks, the South line, person selection and supported final decision', async ({
  page,
}) => {
  await toExplanation(page);
  for (const id of ['cause', 'effect']) {
    await nativeFirstOption(page, id);
  }
  await page.getByRole('button', { name: 'Erklärung prüfen' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
  await page.getByRole('button', { name: 'Weiter →', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('radio', { name: 'Über Süd', exact: true }).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#prediction-status')).toBeFocused();
  for (const id of ['route-north', 'route-south', 'route-direct']) {
    await page.locator('#' + id).focus();
    await page.keyboard.press('Enter');
  }
  await page.getByRole('radio', { name: 'Über Süd', exact: true }).focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Weg prüfen', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Weiter →', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.locator('#decision-map > summary').focus();
  await page.keyboard.press('Enter');
  await page.locator('#route-south').focus();
  await page.keyboard.press('Space');
  await page.locator('#inspect-leila').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-time="total"]')).toHaveText('10');
  await page.getByRole('radio', { name: 'Über Süd', exact: true }).focus();
  await page.keyboard.press('Space');
  await nativeFirstOption(page, 'criterion');
  for (const name of [
    'Ich brauche einen Hinweis',
    'Genauer zeigen',
    'Erklärung ansehen',
    'Dieses Beispiel übernehmen',
  ]) {
    await page.getByRole('button', { name, exact: true }).focus();
    await page.keyboard.press('Enter');
  }
  await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
  await page.getByRole('button', { name: 'Zum Abschluss' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.recommendation')).toContainText('Über Süd');
});
test('Phase2A new map and recommendation remain accessible with expanded words and named criteria', async ({
  page,
}) => {
  await fullToDecision(page);
  await openDecisionMap(page);
  await page.locator('#route-south').click();
  await chooseRoute(page, 'Über Süd');
  await page.getByRole('button', { name: 'Wörter erklären' }).click();
  for (const stage of ['decision', 'end']) {
    if (stage === 'end') {
      await selectEvidence(page, 'advantage', routeChoices.south.advantage);
      await selectEvidence(page, 'disadvantage', routeChoices.south.disadvantage);
      await weightSelected(page);
      await page.getByRole('button', { name: 'Empfehlung prüfen' }).click();
      await page.getByRole('button', { name: 'Zum Abschluss' }).click();
    }
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(result.violations, stage).toEqual([]);
  }
});

test('Phase2A an explicitly named goal is required without guessing it from free text or counting incomplete work as failure', async ({
  page,
}) => {
  await fullToDecision(page);
  await setGoal(page, '');
  await chooseRoute(page, 'Über Süd');
  await selectEvidence(page, 'advantage', 'david-south-direct');
  await selectEvidence(page, 'disadvantage', 'leila-south-direct');
  for (let i = 0; i < 3; i++) {
    await weightSelected(page);
    await page.getByRole('button', { name: 'Empfehlung prüfen' }).click();
    }
  expect((await saved(page)).progress[5].failures).toBe(0);
  await expect(page.locator('[data-feedback]')).toContainText(
    'Ziel oder Kriterium',
  );
  await expect(page.getByRole('button', { name: 'Zum Abschluss' })).toHaveCount(
    0,
  );
  await ownTextPanel(page);
  await page.getByText('Mit eigenen Worten', { exact: false }).click();
  await page
    .getByLabel('Ich schlage diesen Busweg vor, weil …')
    .fill('MEIN ZIEL: Leila?? 999');
  await weightSelected(page);
  await page.getByRole('button', { name: 'Empfehlung prüfen' }).click();
  await expect(page.getByRole('button', { name: 'Zum Abschluss' })).toHaveCount(
    0,
  );
  await setGoal(page, 'training');
  await weightSelected(page);
  await page.getByRole('button', { name: 'Empfehlung prüfen' }).click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
  await expect(page.locator('[data-feedback]')).toContainText(
    'nicht sicher prüfen',
  );
  await expect(page.getByRole('button', { name: 'Zum Abschluss' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Eigenen Text unbewertet abgeben' }).click();
  await expect(page.getByRole('button', { name: 'Zum Abschluss' })).toBeVisible();
});
test('Phase2A alternative valid evidence and a different weighting are accepted; a changed route alone never completes the task', async ({
  page,
}) => {
  await fullToDecision(page);
  await chooseRoute(page, 'Direkt');
  await setGoal(page, 'training');
  await selectEvidence(page, 'advantage', 'amina-direct-south');
  await selectEvidence(page, 'disadvantage', 'leila-direct-south');
  await weightSelected(page);
  await page.getByRole('button', { name: 'Empfehlung prüfen' }).click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
  await expect(
    page.getByRole('button', { name: 'Zum Abschluss' }),
  ).toBeVisible();
  await chooseRoute(page, 'Über Nord');
  await expect(page.getByRole('button', { name: 'Zum Abschluss' })).toHaveCount(
    0,
  );
  expect((await saved(page)).decision.advantage).toBeUndefined();
  expect((await saved(page)).progress[5].failures).toBe(0);
});
