import { test, expect, type Page, type Locator } from '@playwright/test';
import { auditAccessibility } from './accessibility.ts';
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
for (const [route, goal, advantage, disadvantage] of [
  [
    'direct',
    'market',
    'Dein Beleg zum Vorteil: David: Direkt 12 statt Über Nord 18 Minuten.',
    'Dein Beleg zum Nachteil: Amina: Direkt 22 statt Über Nord 10 Minuten.',
  ],
  [
    'north',
    'school',
    'Dein Beleg zum Vorteil: Amina: Über Nord 10 statt Direkt 22 Minuten.',
    'Dein Beleg zum Nachteil: David: Über Nord 18 statt Direkt 12 Minuten.',
  ],
  [
    'south',
    'training',
    'Dein Beleg zum Vorteil: Leila: Über Süd 10 statt Direkt 22 Minuten.',
    'Dein Beleg zum Nachteil: David: Über Süd 18 statt Direkt 12 Minuten.',
  ],
] as const)
  test(`Kenya entire report ${route}: assigned evidence paragraphs and stable complete text`, async ({
    page,
  }) => {
    await fullToDecision(page);
    const c = routeChoices[route];
    await chooseRoute(page, c.name);
    await setGoal(page, goal);
    await selectEvidence(page, 'advantage', c.advantage);
    await selectEvidence(page, 'disadvantage', c.disadvantage);
    await page.locator('#check-answer').click();
    await page.locator('#next-step').click();
    await expect(
      page
        .locator('.recommendation > p')
        .filter({ has: page.locator('strong') })
        .filter({ hasText: 'Dein Beleg zum Vorteil:' }),
    ).toHaveText(advantage);
    await expect(
      page
        .locator('.recommendation > p')
        .filter({ hasText: 'Dein Beleg zum Nachteil:' }),
    ).toHaveText(disadvantage);
    const text = await page.locator('.recommendation').innerText();
    await page.reload();
    expect(await page.locator('.recommendation').innerText()).toBe(text);
  });
for (const measure of ['bus', 'path'] as const)
  test(`Kenya episode 2 entire ${measure} product keeps capacity and access separate`, async ({
    page,
  }) => {
    const errors = observe(page);
    await enter(page);
    await first(page);
    await decide(page);
    await proposal(page, measure);
    await page.locator('#check-answer').click();
    await page.locator('#next-step').click();
    const expected =
      measure === 'bus'
        ? 'Ich empfehle: Eine zusätzliche Busfahrt. Für alle 24 Personen gibt es Plätze. Aber: Der Fußweg bleibt 12 Minuten lang.'
        : 'Ich empfehle: Ein kürzerer Fußweg. Der Fußweg dauert nur 4 Minuten. Aber: 4 Personen müssen später fahren.';
    await expect(page.locator('.demand-product')).toHaveText(expected);
    const all = await page.locator('.recommendation').innerText();
    await page.reload();
    expect(await page.locator('.recommendation').innerText()).toBe(all);
    expect(errors).toEqual([]);
  });
