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
} from './phase2a-helpers.ts';
const act =
  (touch = false) =>
  (l: Locator) =>
    touch ? l.tap() : l.click();
const saved = (page: Page) =>
  page.evaluate((k) => JSON.parse(sessionStorage.getItem(k)!), key);
function observe(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push('JS: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('Console: ' + m.text());
  });
  page.on('requestfailed', (r) => errors.push('Request: ' + r.url()));
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`);
  });
  page.on('request', (r) => {
    if (
      /^https?:/.test(r.url()) &&
      !['127.0.0.1', 'localhost'].includes(new URL(r.url()).hostname)
    )
      errors.push('External: ' + r.url());
  });
  return errors;
}
async function enter(page: Page, touch = false, path = '/') {
  await page.goto(path);
  await act(touch)(
    page.getByRole('button', { name: 'Episode 2 starten', exact: true }),
  );
}
async function first(
  page: Page,
  touch = false,
  route = 'north',
  capture = false,
) {
  await act(touch)(page.locator('#demand-route-' + route));
  await expect(page.locator('#demand-people-count')).toContainText(
    '16 Personen',
  );
  await expect(page.locator('.demand-person')).toHaveCount(16);
  await act(touch)(page.locator('#demand-view-now'));
  await expect(page.locator('#demand-people-count')).toContainText(
    '24 Personen',
  );
  await expect(page.locator('.demand-person.new-person')).toHaveCount(8);
  await expect(page.locator('.seat')).toHaveCount(20);
  await act(touch)(page.locator('#demand-enough-no'));
  await act(touch)(page.locator('#demand-later-4'));
  if (capture) {
    const core = await page.evaluate(() => {
      const box = (selector: string) =>
        document.querySelector(selector)!.getBoundingClientRect().toJSON();
      return {
        viewport: { width: innerWidth, height: innerHeight },
        quantities: box('.demand-quantities'),
        answer: box('#demand-later-4'),
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    expect(core.quantities.top).toBeGreaterThanOrEqual(0);
    expect(core.answer.bottom).toBeLessThanOrEqual(core.viewport.height);
    expect(core.overflow).toBe(false);
    const name = `episode2-${test.info().project.name}-${core.viewport.width}x${core.viewport.height}-current-comparison`;
    writeFileSync(
      evidencePath(name + '.json'),
      JSON.stringify(core, null, 2) + '\n',
    );
    await page.screenshot({ path: evidencePath(name + '.png') });
  }
  await act(touch)(page.locator('#check-answer'));
  await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
  await expect(page.locator('[data-feedback]')).toContainText(
    '4 Menschen müssen später fahren',
  );
  await act(touch)(page.locator('#next-step'));
}
async function mapTry(page: Page, measure: 'bus' | 'path', touch = false) {
  const svg = page.locator('svg.demand-map');
  await svg.scrollIntoViewIfNeeded();
  const point = await svg.evaluate((el: SVGSVGElement, measure) => {
    const p = el.createSVGPoint();
    p.x = measure === 'bus' ? 620 : 240;
    p.y = measure === 'bus' ? 220 : 150;
    const q = p.matrixTransform(el.getScreenCTM()!);
    return { x: q.x, y: q.y };
  }, measure);
  if (touch) await page.touchscreen.tap(point.x, point.y);
  else await page.mouse.click(point.x, point.y);
}
async function trial(
  page: Page,
  measure: 'bus' | 'path',
  touch = false,
  map = false,
) {
  if (map) await mapTry(page, measure, touch);
  else await act(touch)(page.locator('#demand-try-' + measure));
  await expect(page.locator('#demand-try-' + measure)).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('#demand-capacity-count')).toContainText(
    measure === 'bus' ? '30 Plätze' : '20 Plätze',
  );
  await expect(page.locator('.seat')).toHaveCount(measure === 'bus' ? 30 : 20);
  await expect(page.locator('.demand-current-facts')).toContainText(
    measure === 'bus' ? '12' : '4',
  );
  await act(touch)(
    page.locator('#demand-capacity-' + (measure === 'bus' ? 'more' : 'same')),
  );
  await act(touch)(
    page.locator('#demand-walk-' + (measure === 'bus' ? 'same' : 'shorter')),
  );
  await act(touch)(page.locator('#check-answer'));
}
async function decide(page: Page, touch = false) {
  await trial(page, 'bus', touch);
  await trial(page, 'path', touch);
  await act(touch)(page.locator('#next-step'));
}
async function proposal(
  page: Page,
  measure: 'bus' | 'path',
  touch = false,
  conflict = false,
) {
  const click = act(touch);
  await click(page.locator('#demand-proposal-' + measure));
  await click(
    page.locator(
      '#demand-goal-' +
        (conflict
          ? measure === 'bus'
            ? 'access'
            : 'capacity'
          : measure === 'bus'
            ? 'capacity'
            : 'access'),
    ),
  );
  await click(
    page.locator('#demand-advantage-' + (measure === 'bus' ? 'seats' : 'walk')),
  );
  await click(
    page.locator(
      '#demand-disadvantage-' +
        (measure === 'bus' ? 'long-walk' : 'not-enough'),
    ),
  );
}
for (const device of [
  { name: 'desktop', width: 1440, height: 1000, touch: false },
  { name: 'ipad-landscape', width: 1024, height: 768, touch: true },
  { name: 'ipad-portrait', width: 768, height: 1024, touch: true },
])
  for (const measure of ['bus', 'path'] as const) {
    test(`Episode 2 complete ${measure} on ${device.name}: direct entry, real model experiments and supported judgment limits`, async ({
      browser,
      browserName,
    }) => {
      const context = await browser.newContext({
        viewport: device,
        hasTouch: device.touch,
        isMobile: device.touch,
      });
      const page = await context.newPage();
      const errors = observe(page),
        click = act(device.touch);
      await enter(page, device.touch);
      await expect(page.locator('.demand-transition')).toContainText(
        'Baustelle ist beendet',
      );
      expect((await saved(page)).demand.basis).toBe('chosen');
      expect((await saved(page)).decision).toEqual({ text: '' });
      await page.screenshot({
        path: evidencePath(`episode2-${browserName}-${device.name}-demand.png`),
        fullPage: true,
      });
      await first(
        page,
        device.touch,
        measure === 'bus' ? 'north' : 'south',
        true,
      );
      await trial(page, 'bus', device.touch, true);
      await page.screenshot({
        path: evidencePath(`episode2-${browserName}-${device.name}-bus.png`),
        fullPage: true,
      });
      await trial(page, 'path', device.touch, true);
      await page.screenshot({
        path: evidencePath(`episode2-${browserName}-${device.name}-path.png`),
        fullPage: true,
      });
      const metrics = await page.evaluate(() => ({
        width: innerWidth,
        height: innerHeight,
        overflow: document.documentElement.scrollWidth > innerWidth,
        choiceHeights: [
          ...document.querySelectorAll('.demand-task .choice'),
        ].map((el) => el.getBoundingClientRect().height),
        facts: document
          .querySelector('.demand-current-facts')
          ?.getBoundingClientRect()
          .toJSON(),
      }));
      expect(metrics.overflow).toBe(false);
      expect(Math.min(...metrics.choiceHeights)).toBeGreaterThanOrEqual(44);
      writeFileSync(
        evidencePath(`episode2-${browserName}-${device.name}-metrics.json`),
        JSON.stringify(metrics, null, 2) + '\n',
      );
      await click(page.locator('#next-step'));
      await proposal(page, measure, device.touch);
      await page.screenshot({
        path: evidencePath(
          `episode2-${browserName}-${device.name}-decision-${measure}.png`,
        ),
        fullPage: true,
      });
      await click(page.locator('#check-answer'));
      await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
      await click(page.locator('#next-step'));
      await expect(page.locator('.demand-product')).toContainText('Aber:');
      await expect(page.locator('.demand-product')).toContainText(
        measure === 'bus' ? '12 Minuten' : '4 Personen',
      );
      await page.reload();
      await expect(page.locator('#demand-deeper')).toBeVisible();
      await page.screenshot({
        path: evidencePath(
          `episode2-${browserName}-${device.name}-end-${measure}.png`,
        ),
        fullPage: true,
      });
      expect((await saved(page)).progress.every((p: any) => !p.complete)).toBe(
        true,
      );
      expect(errors).toEqual([]);
      await context.close();
    });
  }
test('Episode 2 missing and partial inputs, automatic help after two errors, both trial effects and deliberate adoption', async ({
  page,
  browserName,
}) => {
  await enter(page);
  for (let i = 0; i < 3; i++) await page.locator('#check-answer').click();
  expect((await saved(page)).demand.check.failures).toBe(0);
  await page.locator('#demand-route-direct').check();
  await page.locator('#demand-view-now').click();
  await page.locator('#demand-enough-no').check();
  await page.locator('#check-answer').click();
  expect((await saved(page)).demand.check.failures).toBe(0);
  await page.locator('#demand-later-0').check();
  await page.locator('#check-answer').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/partial/);
  await page.locator('#check-answer').click();
  expect((await saved(page)).demand.check.failures).toBe(2);
  expect((await saved(page)).demand.check.supported).toBeUndefined();
  await expect(page.locator('#demand-example')).toBeVisible();
  await page.locator('#demand-example').click();
  await page.locator('#next-step').click();
  for (const measure of ['bus', 'path'] as const) {
    await page.locator('#demand-try-' + measure).click();
    await page
      .locator('#demand-capacity-' + (measure === 'bus' ? 'more' : 'same'))
      .check();
    await page
      .locator('#demand-walk-' + (measure === 'bus' ? 'shorter' : 'same'))
      .check();
    await page.locator('#check-answer').click();
    await expect(page.locator('[data-feedback]')).toContainText(
      'Busplätze passt',
    );
    await page.locator('#check-answer').click();
    await expect(page.locator('#demand-example')).toBeVisible();
    await page.locator('#demand-example').click();
  }
  await page.locator('#next-step').click();
  await proposal(page, 'path');
  await page.locator('#demand-advantage-both').check();
  await page.locator('#check-answer').click();
  await expect(page.locator('[data-feedback]')).toContainText(
    'Dein Nachteil passt',
  );
  await page.locator('#check-answer').click();
  expect((await saved(page)).demand.decide.failures).toBe(2);
  expect((await saved(page)).demand.decision.supported).toBeUndefined();
  await page.screenshot({
    path: evidencePath(`episode2-${browserName}-automatic-help.png`),
    fullPage: true,
  });
  await page.locator('#demand-example').click();
  await page.locator('#next-step').click();
  await expect(page.locator('[data-supported]')).toBeVisible();
  await expect(page.locator('[data-demand-help-history]')).toBeVisible();
  await page.getByRole('button', { name: 'Empfehlung bearbeiten' }).click();
  await page.locator('#demand-advantage-seats').check();
  await expect(page.locator('#next-step')).toHaveCount(0);
  expect((await saved(page)).demand.decision.supported).toBeUndefined();
});
for (const measure of ['bus', 'path'] as const)
  test(`Episode 2 conscious goal conflict ${measure} has two valid revision paths and a concrete weighted product`, async ({
    page,
    browserName,
  }) => {
    await enter(page);
    await first(page);
    await decide(page);
    await proposal(page, measure, false, true);
    await page.locator('#check-answer').click();
    await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
    await expect(page.locator('[data-feedback]')).toContainText(
      'Dein Vorteil passt',
    );
    await expect(page.locator('[data-feedback]')).toContainText(
      'Dein Nachteil passt',
    );
    await expect(page.locator('[data-feedback]')).toContainText(
      'noch nicht verbunden',
    );
    expect((await saved(page)).demand.decide.failures).toBe(0);
    await expect(page.locator('#next-step')).toHaveCount(0);
    await page.screenshot({
      path: evidencePath(`episode2-${browserName}-conflict-${measure}.png`),
      fullPage: true,
    });
    await page
      .locator(
        '#demand-weighting-' + (measure === 'bus' ? 'capacity' : 'access'),
      )
      .check();
    await page.locator('#check-answer').click();
    await page.locator('#next-step').click();
    await expect(page.locator('.demand-product')).toContainText('wichtiger');
    await expect(page.locator('.demand-product')).toContainText('in Kauf');
    await page.getByRole('button', { name: 'Empfehlung bearbeiten' }).click();
    await page.locator('#demand-adjust-goal').click();
    await page.locator('#check-answer').click();
    await page.locator('#next-step').click();
    await expect(page.locator('.demand-product')).toContainText('Aber:');
  });
test('Episode 2 unclear free text remains ungraded, escaped and editable; example adoption keeps own text and honest provenance', async ({
  page,
}) => {
  await enter(page);
  await first(page);
  await decide(page);
  await proposal(page, 'bus', false, true);
  await page.locator('#demand-own-words > summary').click();
  await page
    .locator('#demand-text')
    .fill('<img src=x onerror=alert(1)> Beide Probleme gelöst ???');
  await page.locator('#check-answer').click();
  expect((await saved(page)).demand.decide.failures).toBe(0);
  await expect(page.locator('#next-step')).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Eigenen Text unbewertet abgeben' })
    .click();
  await page.locator('#next-step').click();
  await expect(page.locator('[data-ungraded]')).toBeVisible();
  await expect(page.locator('.saved-text')).toContainText('<img src=x');
  await expect(page.locator('.recommendation img')).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Empfehlung bearbeiten' }).click();
  await page.locator('#demand-text').fill('geändert ???');
  await expect(page.locator('#next-step')).toHaveCount(0);
  for (const name of [
    'Ich brauche einen Hinweis',
    'Genauer zeigen',
    'Erklärung ansehen',
    'Dieses Beispiel übernehmen',
  ])
    await page.getByRole('button', { name, exact: true }).click();
  await page.locator('#next-step').click();
  await expect(page.locator('[data-supported]')).toBeVisible();
  await expect(page.locator('.saved-text')).toContainText('geändert ???');
  await expect(page.locator('[data-ungraded]')).toHaveCount(0);
});
test('Episode 2 uses an existing first recommendation, keeps it through reload/back/menu and opens its saved report', async ({
  page,
}) => {
  await fullToDecision(page);
  await chooseRoute(page, 'Über Nord');
  await setGoal(page, 'school');
  await selectEvidence(page, 'advantage', routeChoices.north.advantage);
  await selectEvidence(page, 'disadvantage', routeChoices.north.disadvantage);
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  const firstReport = (await saved(page)).decision;
  await page.getByRole('button', { name: 'Episode 2 starten' }).click();
  await expect(page.locator('#demand-route-north')).toBeChecked();
  expect((await saved(page)).demand.basis).toBe('first');
  await page.locator('#demand-view-now').click();
  await page.locator('#demand-enough-no').check();
  await page.locator('#demand-later-4').check();
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await decide(page);
  await proposal(page, 'path');
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await page.reload();
  expect((await saved(page)).decision).toEqual(firstReport);
  await page
    .getByRole('button', { name: 'Episoden auswählen', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Bisherige Empfehlungen ansehen' })
    .click();
  await expect(page.locator('.recommendation')).toContainText('Über Nord');
  expect((await saved(page)).decision).toEqual(firstReport);
});
test('Episode 2 native keyboard alone operates complete direct entry, real map controls, choices and report', async ({
  page,
}) => {
  await page.goto('/');
  const press = async (selector: string, key = 'Enter') => {
    await page.locator(selector).focus();
    await page.keyboard.press(key);
  };
  await press('[data-action="demand-start"]');
  await press('#demand-route-north', 'Space');
  await expect(page.locator('#demand-route-north')).toBeChecked();
  await press('#demand-view-now');
  await press('#demand-enough-no', 'Space');
  await press('#demand-later-4', 'Space');
  await press('#check-answer');
  await press('#next-step');
  for (const measure of ['bus', 'path'] as const) {
    await press('#demand-map-' + measure, 'Space');
    await expect(page.locator('#demand-try-' + measure)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await press(
      '#demand-capacity-' + (measure === 'bus' ? 'more' : 'same'),
      'Space',
    );
    await press(
      '#demand-walk-' + (measure === 'bus' ? 'same' : 'shorter'),
      'Space',
    );
    await press('#check-answer');
  }
  await press('#next-step');
  await press('#demand-proposal-path', 'Space');
  await press('#demand-goal-access', 'Space');
  await press('#demand-advantage-walk', 'Space');
  await press('#demand-disadvantage-not-enough', 'Space');
  await press('#check-answer');
  await press('#next-step');
  await expect(page.locator('.demand-product')).toContainText('4 Personen');
});
test('Episode 2 blocked storage permits a complete supported flow, word help and confirmed restart', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'sessionStorage', {
      get() {
        throw new DOMException('blocked', 'SecurityError');
      },
    }),
  );
  await enter(page);
  await page.getByRole('button', { name: 'Wörter erklären' }).click();
  await expect(page.locator('#word-help')).toContainText('Zuzug');
  await page.getByRole('button', { name: 'Wörter schließen' }).click();
  await first(page);
  await decide(page);
  await proposal(page, 'bus');
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await expect(page.locator('.demand-product')).toBeVisible();
  await page.getByRole('button', { name: 'Neu starten', exact: true }).click();
  await page.getByRole('button', { name: 'Abbrechen', exact: true }).click();
  await expect(page.locator('.demand-product')).toBeVisible();
  await page.getByRole('button', { name: 'Neu starten', exact: true }).click();
  await page.getByRole('button', { name: 'Ja, neu starten' }).click();
  await expect(
    page.getByRole('button', { name: 'Spiel starten' }),
  ).toBeVisible();
});
test('Episode 2 damaged optional storage and explicit step reset have safe continuations', async ({
  page,
}) => {
  await enter(page);
  await first(page);
  await trial(page, 'bus');
  await page.getByRole('button', { name: 'Schritt neu bearbeiten' }).click();
  await expect(page.locator('#demand-try-bus')).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  expect((await saved(page)).demand.explored).toEqual([]);
  await page.evaluate((k) => {
    const s = JSON.parse(sessionStorage.getItem(k)!);
    s.demand.trials = { bus: { capacity: 'broken' } };
    sessionStorage.setItem(k, JSON.stringify(s));
  }, key);
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Episode 2 starten', exact: true }),
  ).toBeVisible();
  // readSession normalises in memory; the next interaction persists the safe draft.
  await page
    .getByRole('button', { name: 'Episode 2 starten', exact: true })
    .click();
  await expect(page.locator('#demand-route-direct')).not.toBeChecked();
  expect((await saved(page)).demand.trials).toEqual({});
  expect((await saved(page)).demand.check.complete).toBe(false);
});
for (const measure of ['bus', 'path'] as const)
  test(`Episode 2 full ${measure} works below the local Pages prefix with clean resources`, async ({
    page,
  }) => {
    const errors = observe(page);
    await enter(page, false, 'http://127.0.0.1:4174/Afrika-2040/');
    await first(page);
    await decide(page);
    await proposal(page, measure);
    await page.locator('#check-answer').click();
    await page.locator('#next-step').click();
    await page.reload();
    await expect(page.locator('.demand-product')).toBeVisible();
    expect(errors).toEqual([]);
  });
test('Episode 2 start, comparison, trial, open conflict, supported product pass scoped axe rules', async ({
  page,
}) => {
  const audit = async () => {
    const r = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(r.violations).toEqual([]);
  };
  await page.goto('/');
  await audit();
  await page
    .getByRole('button', { name: 'Episode 2 starten', exact: true })
    .click();
  await audit();
  await first(page);
  await trial(page, 'bus');
  await audit();
  await trial(page, 'path');
  await page.locator('#next-step').click();
  await proposal(page, 'path', false, true);
  await page.locator('#check-answer').click();
  await audit();
  for (const name of [
    'Ich brauche einen Hinweis',
    'Genauer zeigen',
    'Erklärung ansehen',
    'Dieses Beispiel übernehmen',
  ])
    await page.getByRole('button', { name, exact: true }).click();
  await page.locator('#next-step').click();
  await audit();
});

test('Episode 2 preserves both actual Episode 1 products after the revised South recommendation supplies its starting route', async ({
  page,
}) => {
  await fullToDecision(page);
  await chooseRoute(page, 'Über Nord');
  await setGoal(page, 'school');
  await selectEvidence(page, 'advantage', routeChoices.north.advantage);
  await selectEvidence(page, 'disadvantage', routeChoices.north.disadvantage);
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await page.getByRole('button', { name: 'Was hat sich verändert?' }).click();
  await page.locator('#event-path-leila-platz').check();
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  for (const route of ['direct', 'north', 'south'])
    await page
      .locator(
        `#event-answer-${route}-${route === 'south' ? 'same' : 'longer'}`,
      )
      .check();
  await page.locator('#check-answer').click();
  await page.locator('#event-connection').selectOption('sued');
  await page.locator('#event-cause').selectOption('unchanged');
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await page.locator('#decision-route-south').check();
  await page.locator('#revision-criterion').selectOption('training');
  for (const kind of ['advantage', 'disadvantage'] as const) {
    await page.locator('#' + kind + '-other-direct').check();
    await page.locator('#' + kind + '-' + routeChoices.south[kind]).check();
  }
  await page.locator('#event-change-evidence-south').check();
  await page.locator('#event-reason-goal').check();
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  const before = await saved(page);
  await page
    .getByRole('button', { name: 'Episode 2 starten', exact: true })
    .click();
  expect((await saved(page)).demand.basis).toBe('revision');
  await expect(page.locator('#demand-route-south')).toBeChecked();
  await first(page, false, 'south');
  await decide(page);
  await proposal(page, 'bus');
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await page.reload();
  const after = await saved(page);
  expect(after.decision).toEqual(before.decision);
  expect(after.road.original).toEqual(before.road.original);
  expect(after.road.review).toEqual(before.road.review);
  expect(after.progress).toEqual(before.progress);
  await page
    .getByRole('button', { name: 'Episoden auswählen', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Bisherige Empfehlungen ansehen' })
    .click();
  await expect(page.locator('.revision-reason')).toContainText(
    'wechsle zu Über Süd',
  );
});
