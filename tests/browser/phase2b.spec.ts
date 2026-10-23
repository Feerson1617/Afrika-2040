import { test, expect, type Page, type Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync } from 'node:fs';
import { evidencePath } from './artifacts.ts';
import {
  fullToDecision,
  chooseRoute,
  setGoal,
  selectEvidence,
  routeChoices,
  key,
  nativeFirstOption,
  ownTextPanel,
} from './phase2a-helpers.ts';
type Route = 'direct' | 'north' | 'south';
const routes: Route[] = ['direct', 'north', 'south'];
const names = { direct: 'Direkt', north: 'Über Nord', south: 'Über Süd' };
const matching = { direct: 'market', north: 'school', south: 'training' };
const oldTimes = {
  amina: [22, 10, 28],
  david: [12, 18, 18],
  leila: [22, 28, 10],
};
const newTimes = {
  amina: [22, 10, 28],
  david: [12, 18, 18],
  leila: [28, 34, 10],
};
const saved = (page: Page) =>
  page.evaluate((k) => JSON.parse(sessionStorage.getItem(k)!), key);
const act = (touch: boolean) => (el: Locator) =>
  touch ? el.tap() : el.click();
async function choosePathOnMap(page: Page, touch: boolean) {
  const path = page.locator('#event-walk-platz .path-hit');
  await path.scrollIntoViewIfNeeded();
  const point = await path.evaluate((el) => {
    const line = el as SVGPathElement,
      p = line.getPointAtLength(line.getTotalLength() * 0.4),
      m = line.getScreenCTM()!;
    return { x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f };
  });
  if (touch) await page.touchscreen.tap(point.x, point.y);
  else await page.mouse.click(point.x, point.y);
}
async function firstEnd(page: Page, route: Route = 'north', touch = false) {
  await fullToDecision(page, touch);
  await chooseRoute(page, names[route], touch);
  await setGoal(page, matching[route]);
  await selectEvidence(page, 'advantage', routeChoices[route].advantage, touch);
  await selectEvidence(
    page,
    'disadvantage',
    routeChoices[route].disadvantage,
    touch,
  );
  await act(touch)(page.locator('#check-answer'));
  await act(touch)(page.locator('#next-step'));
}
async function eventStart(page: Page, route: Route = 'north', touch = false) {
  await firstEnd(page, route, touch);
  await act(touch)(
    page.getByRole('button', { name: 'Was hat sich verändert?' }),
  );
}
async function compare(page: Page, touch = false) {
  for (const route of routes)
    await act(touch)(
      page.locator(
        `#event-answer-${route}-${route === 'south' ? 'same' : 'longer'}`,
      ),
    );
  await act(touch)(page.locator('#check-answer'));
}
async function toReview(page: Page, route: Route = 'north') {
  await eventStart(page, route);
  await page.locator('#event-path-leila-platz').check();
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await compare(page);
  await page.locator('#event-connection').selectOption('sued');
  await page.locator('#event-cause').selectOption('unchanged');
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
}
async function newFacts(page: Page, route: Route, touch = false) {
  const c = routeChoices[route];
  for (const kind of ['advantage', 'disadvantage'] as const) {
    await act(touch)(page.locator(`#${kind}-other-${c[kind].split('-')[2]}`));
    await act(touch)(page.locator(`#${kind}-${c[kind]}`));
  }
  if ((await page.locator('#revision-facts').getAttribute('open')) !== null)
    await act(touch)(page.locator('#revision-facts > summary'));
}
for (const device of [
  { name: 'desktop', width: 1440, height: 1000, touch: false },
  { name: 'ipad-landscape', width: 1024, height: 768, touch: true },
  { name: 'ipad-portrait', width: 768, height: 1024, touch: true },
])
  for (const original of routes)
    test(`Phase2B full ${original} on ${device.name}: eighteen times, same map, unchanged and changed recommendations`, async ({
      browser,
      browserName,
    }) => {
      test.setTimeout(60000);
      const context = await browser.newContext({
        viewport: device,
        hasTouch: device.touch,
        isMobile: device.touch,
      });
      const page = await context.newPage();
      const click = act(device.touch);
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await eventStart(page, original, device.touch);
      const snapshot = (await saved(page)).road.original;
      await expect(page.locator('svg.neighborhood')).toHaveCount(1);
      await expect(page.locator('.event-works')).toHaveCount(0);
      await choosePathOnMap(page, device.touch);
      await click(page.locator('#check-answer'));
      await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
      await expect(page.locator('.event-works')).toHaveCount(1);
      await expect(page.locator('[data-feedback]')).toContainText(
        '18 statt 12',
      );
      await click(page.locator('#event-view-before'));
      await expect(page.locator('.event-works')).toHaveCount(0);
      await click(page.locator('#event-view-now'));
      await expect(page.locator('.event-works')).toHaveCount(1);
      if (original === 'north')
        await page.screenshot({
          path: evidencePath(
            `phase2b-${browserName}-${device.name}-discovery.png`,
          ),
          fullPage: true,
        });
      await click(page.locator('#next-step'));
      await expect(page.locator('.event-explanation')).toHaveCount(0);
      const metrics = await page.locator('.event-comparison').evaluate((el) => {
        const r = el.getBoundingClientRect();
        return {
          top: r.top,
          bottom: r.bottom,
          height: r.height,
          viewportHeight: innerHeight,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      expect(metrics.height).toBeLessThan(device.height - 100);
      expect(metrics.bottom).toBeLessThanOrEqual(device.height);
      expect(metrics.overflow).toBe(false);
      for (const choice of await page.locator('.event-answer .choice').all())
        expect((await choice.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      if (original === 'north') {
        await page.screenshot({
          path: evidencePath(
            `phase2b-${browserName}-${device.name}-comparison.png`,
          ),
        });
        writeFileSync(
          evidencePath(`phase2b-${browserName}-${device.name}-metrics.json`),
          JSON.stringify(metrics, null, 2) + '\n',
        );
      }
      await click(page.locator('#event-map-details > summary'));
      for (const situation of ['before', 'now'] as const) {
        await click(page.locator('#event-view-' + situation));
        for (const [index, route] of routes.entries()) {
          await click(page.locator('#route-' + route));
          for (const who of ['amina', 'david', 'leila'] as const) {
            await click(page.locator('#inspect-' + who));
            await expect(page.locator('[data-time="total"]')).toHaveText(
              String(
                (situation === 'before' ? oldTimes : newTimes)[who][index],
              ),
            );
            if (who === 'leila')
              await expect(page.locator('[data-time="bus"]')).toHaveText(
                String(route === 'direct' ? 10 : route === 'north' ? 16 : 8),
              );
          }
        }
      }
      await click(page.locator('#event-map-details > summary'));
      await compare(page, device.touch);
      await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
      if (original === 'north')
        await page.screenshot({
          path: evidencePath(
            `phase2b-${browserName}-${device.name}-explanation.png`,
          ),
          fullPage: true,
        });
      await page.locator('#event-connection').selectOption('sued');
      await page.locator('#event-cause').selectOption('unchanged');
      await click(page.locator('#check-answer'));
      await click(page.locator('#next-step'));
      await expect(page.locator('#next-step')).toHaveCount(0);
      if (original === 'north')
        await page.screenshot({
          path: evidencePath(
            `phase2b-${browserName}-${device.name}-revision.png`,
          ),
          fullPage: true,
        });
      await click(page.locator('#event-change-evidence-' + original));
      await click(page.locator('#event-reason-goal'));
      await click(page.locator('#check-answer'));
      await click(page.locator('#next-step'));
      await expect(page.locator('.revision-reason')).toContainText('bleibe');
      await expect(page.locator('.original-report summary')).toContainText(
        names[original],
      );
      await page.reload();
      await expect(page.locator('.event-end')).toBeVisible();
      expect((await saved(page)).decision).toEqual(snapshot);
      expect((await saved(page)).road.original).toEqual(snapshot);
      if (original === 'north')
        await page.screenshot({
          path: evidencePath(
            `phase2b-${browserName}-${device.name}-ending.png`,
          ),
          fullPage: true,
        });
      await click(
        page.getByRole('button', { name: 'Erneute Empfehlung ansehen' }),
      );
      const changed = original === 'south' ? 'north' : 'south';
      await click(page.locator('#decision-route-' + changed));
      await page.locator('#revision-criterion').selectOption(matching[changed]);
      await newFacts(page, changed, device.touch);
      await click(page.locator('#event-change-evidence-' + changed));
      await click(page.locator('#event-reason-goal'));
      await click(page.locator('#check-answer'));
      await click(page.locator('#next-step'));
      await expect(page.locator('.revision-reason')).toContainText('wechsle');
      expect((await saved(page)).decision).toEqual(snapshot);
      expect(errors).toEqual([]);
      await click(
        page.getByRole('button', { name: 'Neu spielen', exact: true }),
      );
      expect(
        await page.evaluate((k) => sessionStorage.getItem(k), key),
      ).toBeNull();
      await context.close();
    });
test('Phase2B wrong, partial and missing localisation; supported exit after two errors; wrong bus cause and preserved right parts', async ({
  page,
}) => {
  await eventStart(page);
  for (let i = 0; i < 3; i++) await page.locator('#check-answer').click();
  expect((await saved(page)).road.find.failures).toBe(0);
  await page.locator('#marker-leila').click();
  await page.locator('#check-answer').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/partial/);
  expect((await saved(page)).road.find.failures).toBe(0);
  await page.locator('#event-path-bus').check();
  await page.locator('#check-answer').click();
  await page.locator('#check-answer').click();
  expect((await saved(page)).road.find.failures).toBe(2);
  await expect(page.locator('.help-panel')).toContainText('18 statt 12');
  await expect(page.locator('#next-step')).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Dieses Beispiel übernehmen' })
    .click();
  await page.locator('#next-step').click();
  await page.locator('#event-answer-direct-longer').check();
  await page.locator('#check-answer').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/partial/);
  expect((await saved(page)).road.effects.failures).toBe(0);
  await page.locator('#event-answer-north-longer').check();
  await page.locator('#event-answer-south-longer').check();
  await page.locator('#check-answer').click();
  await expect(page.locator('[data-feedback]')).toContainText(
    'Das passt schon: Direkt, Über Nord',
  );
  await page.locator('#check-answer').click();
  await page
    .getByRole('button', { name: 'Dieses Beispiel übernehmen' })
    .click();
  await expect(page.locator('#event-connection')).toHaveValue('sued');
  await expect(page.locator('#event-cause')).toHaveValue('unchanged');
  await page.locator('#event-cause').selectOption('buses');
  await page.locator('#check-answer').click();
  await expect(page.locator('[data-feedback]')).toContainText(
    'Einstieg in Süd passt',
  );
  await page
    .getByRole('button', { name: 'Dieses Beispiel übernehmen' })
    .click();
  await page.locator('#next-step').click();
  await page.locator('#event-change-evidence-north').check();
  await page.locator('#event-reason-goal').check();
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await expect(page.locator('[data-event-supported]')).toHaveCount(2);
});
test('Phase2B goal conflict: acknowledges correct facts, keeps open without weighting, allows different priority and conscious goal change', async ({
  page,
  browserName,
}) => {
  await toReview(page, 'south');
  await page.locator('#revision-criterion').selectOption('school');
  await page.locator('#event-change-evidence-south').check();
  await page.locator('#check-answer').click();
  await expect(page.locator('[data-feedback]')).toContainText(
    'Du belegst den Vorteil',
  );
  await expect(page.locator('[data-feedback]')).toContainText(
    'noch nicht verbunden',
  );
  await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
  await expect(page.locator('.goal-note')).toContainText('28 Minuten');
  await page.screenshot({
    path: evidencePath(`phase2b-${test.info().project.name}-goal-conflict.png`),
    fullPage: true,
  });
  await page.locator('#event-reason-priority').check();
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await expect(page.locator('.recommendation')).toContainText(
    '10 statt 28 Minuten',
  );
  await page
    .getByRole('button', { name: 'Erneute Empfehlung ansehen' })
    .click();
  await page
    .getByRole('button', { name: 'Ich möchte mein Ziel ändern' })
    .click();
  await expect(page.locator('#revision-criterion')).toBeFocused();
  await page.locator('#revision-criterion').selectOption('training');
  await expect(page.locator('#next-step')).toHaveCount(0);
  await page.locator('#event-reason-goal').check();
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await expect(page.locator('.revision-reason')).toContainText('10 Minuten');
});
test('Phase2B ungraded explanation/revision texts, examples and later edits retain honest provenance and escaped text', async ({
  page,
}) => {
  await eventStart(page);
  await page.locator('#event-path-leila-platz').check();
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await compare(page);
  await page.locator('#event-own-explanation > summary').click();
  await page
    .locator('#event-text')
    .fill('<img src=x onerror=alert(1)> 999 ???');
  await page.locator('#check-answer').click();
  await expect(page.locator('#next-step')).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Erklärung unbewertet abgeben' })
    .click();
  await page.locator('#next-step').click();
  await ownTextPanel(page);
  await page.locator('#own-words > summary').click();
  await page.locator('#own-text').fill('keine 999 ???');
  await page
    .getByRole('button', { name: 'Eigenen Text unbewertet abgeben' })
    .click();
  await page.locator('#next-step').click();
  await expect(page.locator('.saved-explanation')).toHaveText(
    '<img src=x onerror=alert(1)> 999 ???',
  );
  await expect(page.locator('.recommendation img')).toHaveCount(0);
  await expect(page.locator('[data-ungraded]')).toBeVisible();
  await page.reload();
  await page
    .getByRole('button', { name: 'Erneute Empfehlung ansehen' })
    .click();
  await page.locator('#own-text').fill('geändert');
  await expect(page.locator('#next-step')).toHaveCount(0);
  for (const name of [
    'Ich brauche einen Hinweis',
    'Genauer zeigen',
    'Erklärung ansehen',
    'Dieses Beispiel übernehmen',
  ])
    await page.getByRole('button', { name, exact: true }).click();
  expect((await saved(page)).road.review.text).toBe('geändert');
  await page.locator('#next-step').click();
  await expect(page.locator('[data-supported]')).toBeVisible();
});
test('Phase2B native keyboard operates localisation, comparison, actual selected cause, explicit revision and report', async ({
  page,
}) => {
  await firstEnd(page);
  const enter = async (selector: string, key = 'Enter') => {
    await page.locator(selector).focus();
    await page.keyboard.press(key);
  };
  await enter('[data-action="event-start"]');
  await enter('#event-walk-platz', 'Space');
  await enter('#check-answer');
  await enter('#event-view-before');
  await enter('#event-view-now');
  await enter('#next-step');
  for (const route of routes)
    await enter(
      `#event-answer-${route}-${route === 'south' ? 'same' : 'longer'}`,
      'Space',
    );
  await enter('#check-answer');
  await nativeFirstOption(page, 'event-connection');
  await expect(page.locator('#event-connection')).toHaveValue('sued');
  await nativeFirstOption(page, 'event-cause');
  await expect(page.locator('#event-cause')).toHaveValue('unchanged');
  await enter('#check-answer');
  await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
  await enter('#next-step');
  await enter('#event-change-evidence-north', 'Space');
  await enter('#event-reason-goal', 'Space');
  await enter('#check-answer');
  await enter('#next-step');
  await expect(page.locator('.event-end')).toBeVisible();
});
test('Phase2B migration, damaged optional event, return/back/reset and prefix preserve the valid first report', async ({
  page,
}) => {
  await firstEnd(page);
  const first = (await saved(page)).decision;
  await page.reload();
  await page.getByRole('button', { name: 'Was hat sich verändert?' }).click();
  await page.locator('#event-path-leila-platz').check();
  await page.locator('#check-answer').click();
  await page.locator('#event-view-before').click();
  await page.reload();
  await expect(page.locator('#event-view-before')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.locator('#next-step').click();
  await compare(page);
  await page.getByRole('button', { name: '← Zurück', exact: true }).click();
  await expect(page.locator('.event-works')).toHaveCount(1);
  await page.getByRole('button', { name: 'Schritt neu bearbeiten' }).click();
  await expect(page.locator('.event-works')).toHaveCount(0);
  expect((await saved(page)).decision).toEqual(first);
  await page.evaluate((k) => {
    const s = JSON.parse(sessionStorage.getItem(k)!);
    s.road.view = 'broken';
    sessionStorage.setItem(k, JSON.stringify(s));
  }, key);
  await page.reload();
  await expect(page.locator('.event-transition')).toBeVisible();
  expect((await saved(page)).decision).toEqual(first);
  const prefixState = await saved(page);
  await page.goto('http://127.0.0.1:4174/Afrika-2040/');
  await page.evaluate(
    ({ k, s }) => sessionStorage.setItem(k, JSON.stringify(s)),
    { k: key, s: prefixState },
  );
  await page.reload();
  await page.getByRole('button', { name: 'Was hat sich verändert?' }).click();
  await expect(page.locator('#event-walk-platz')).toBeVisible();
  await page.locator('#event-path-leila-platz').check();
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await compare(page);
  await page.locator('#event-connection').selectOption('sued');
  await page.locator('#event-cause').selectOption('unchanged');
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await page.locator('#event-change-evidence-north').check();
  await page.locator('#event-reason-goal').check();
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await expect(page.locator('.event-end')).toBeVisible();
});
test('Phase2B blocked storage supports a complete assisted flow, glossary and deliberate restart', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'sessionStorage', {
      get() {
        throw new DOMException('Blocked', 'SecurityError');
      },
    }),
  );
  await firstEnd(page);
  await page.getByRole('button', { name: 'Was hat sich verändert?' }).click();
  await page.getByRole('button', { name: 'Wörter erklären' }).click();
  await expect(page.locator('#word-help')).toContainText('Umweg');
  await page.keyboard.press('Escape');
  await expect(page.locator('#word-help')).toHaveCount(0);
  for (let step = 0; step < 3; step++) {
    for (const name of [
      'Ich brauche einen Hinweis',
      'Genauer zeigen',
      'Erklärung ansehen',
      'Dieses Beispiel übernehmen',
    ])
      await page.getByRole('button', { name, exact: true }).click();
    await page.locator('#next-step').click();
  }
  await expect(page.locator('.event-end')).toBeVisible();
  await page
    .getByRole('button', { name: 'Erneute Empfehlung ansehen' })
    .click();
  await page.getByRole('button', { name: 'Neu starten', exact: true }).click();
  await page.getByRole('button', { name: 'Abbrechen', exact: true }).click();
  await expect(page.locator('#task-title')).toContainText('Ist dein Busweg');
  await page.getByRole('button', { name: 'Neu starten', exact: true }).click();
  await page.getByRole('button', { name: 'Ja, neu starten' }).click();
  await expect(
    page.getByRole('button', { name: 'Spiel starten' }),
  ).toBeVisible();
});
test('Phase2B semantic context, new map, comparison, open conflict, support and report pass scoped axe checks', async ({
  page,
}) => {
  await eventStart(page, 'south');
  const scan = async () => {
    const r = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(r.violations).toEqual([]);
  };
  await scan();
  await page.locator('#event-path-leila-platz').check();
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await scan();
  await compare(page);
  await scan();
  await page.locator('#event-connection').selectOption('sued');
  await page.locator('#event-cause').selectOption('unchanged');
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await page.locator('#revision-criterion').selectOption('school');
  await page.locator('#event-change-evidence-south').check();
  await page.locator('#check-answer').click();
  await scan();
  await page.locator('#event-reason-priority').check();
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await scan();
  await expect(page.locator('main')).not.toContainText('Urteilskompetenz');
});

test('P3-A selection context has a named group role; pupil language stays simple', async ({
  page,
}) => {
  await fullToDecision(page);
  await expect(
    page.getByRole('group', { name: 'Deine aktuelle Auswahl', exact: true }),
  ).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  await expect(page.locator('main')).not.toContainText('Urteilskompetenz');
});
