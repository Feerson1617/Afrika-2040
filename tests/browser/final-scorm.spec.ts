import { test, expect, type Page, type Locator } from '@playwright/test';
import {
  fullToDecision,
  chooseRoute,
  setGoal,
  selectEvidence,
  routeChoices,
  key,
} from './phase2a-helpers.ts';
import { auditAccessibility } from './accessibility.ts';
import { evidencePath } from './artifacts.ts';
import { writeFileSync } from 'node:fs';
async function help(page: Page) {
  for (const name of [
    'Ich brauche einen Hinweis',
    'Genauer zeigen',
    'Erklärung ansehen',
  ])
    await page.getByRole('button', { name, exact: true }).click();
}
async function first(page: Page, route: keyof typeof routeChoices) {
  await fullToDecision(page);
  const c = routeChoices[route];
  await chooseRoute(page, c.name);
  await setGoal(
    page,
    { direct: 'market', north: 'school', south: 'training' }[route],
  );
  await selectEvidence(page, 'advantage', c.advantage);
  await selectEvidence(page, 'disadvantage', c.disadvantage);
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
}
for (const blocked of [true, false])
  test(`F2 actual warning, correct green feedback, support, reload and preserved old records: blocked=${blocked}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await page.locator('#episode-3').click();
    await page.locator('#chain-beans').click();
    await page
      .getByRole('button', { name: 'Episoden auswählen', exact: true })
      .click();
    if (blocked)
      await page.addInitScript(() => {
        Storage.prototype.setItem = () => {
          throw new DOMException('blocked', 'SecurityError');
        };
      });
    if (blocked)
      await page.evaluate(() => {
        Storage.prototype.setItem = () => {
          throw new DOMException('blocked', 'SecurityError');
        };
      });
    await page.locator('#geo-pick-GHA').click();
    await page.locator('#geo-check').click();
    await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
    await expect(page.locator('#storage-warning')).toBeVisible({
      visible: blocked,
    });
    const live = page.locator('#storage-warning');
    await expect(live).toHaveAttribute('role', 'status');
    await expect(live).toHaveAttribute('aria-live', 'polite');
    if (blocked) {
      await expect(live).toContainText('Beim Neuladen');
      await expect(live).toBeInViewport();
    }
    if (blocked)
      await page.evaluate(() => {
        (window as any).warningMutations = 0;
        new MutationObserver(
          (changes) => ((window as any).warningMutations += changes.length),
        ).observe(document.getElementById('storage-warning')!, {
          childList: true,
          characterData: true,
          subtree: true,
        });
      });
    await page.locator('#review-open').click();
    await page.locator('#geo-transfer-claim-model').check();
    await page.locator('#review-check').click();
    await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
    await page.locator('#review-tab-GHA').click();
    await help(page);
    await page.locator('#review-adopt').click();
    await expect(page.locator('[data-review-complete]')).toContainText(
      'bewusst',
    );
    expect(await page.locator('#storage-warning').count()).toBe(1);
    if (blocked)
      expect(await page.evaluate(() => (window as any).warningMutations)).toBe(
        0,
      );
    expect((await auditAccessibility(page)).violations).toEqual([]);
    await page.screenshot({
      path: evidencePath(`storage-${blocked}.png`),
      fullPage: false,
    });
    const old = await page.evaluate(
      (k) => JSON.parse(sessionStorage.getItem(k)!),
      key,
    );
    expect(old.studies.cocoa.data.chain).toEqual(['beans']);
    if (!blocked) {
      expect(old.geography.records.GHA.progress.failures).toBe(0);
      expect(old.geography.review.records.KEN.progress.failures).toBe(0);
    }
    await page.reload();
    if (blocked) {
      await expect(page.locator('#geo-check')).toBeVisible();
      await page.locator('#episode-3').click();
      await expect(page.locator('.study-scene')).toContainText('Bohnen');
    } else {
      await expect(page.locator('[data-review-complete]')).toContainText(
        'bewusst',
      );
      await expect(page.locator('#storage-warning')).toBeHidden();
    }
  });
for (const touch of [false, true])
  for (const route of ['direct', 'north', 'south'] as const)
    test(`F3 viewport positions ${route} touch=${touch}`, async ({
      browser,
    }) => {
      const ctx = await browser.newContext({
        viewport: { width: 1024, height: 768 },
        hasTouch: touch,
        isMobile: touch,
        baseURL: 'http://127.0.0.1:4173',
      });
      const page = await ctx.newPage();
      const press = (el: Locator) => (touch ? el.tap() : el.click());
      await first(page, route);
      await page
        .getByRole('button', { name: 'Was hat sich verändert?' })
        .click();
      await page.locator('#event-path-leila-platz').check();
      await page.locator('#check-answer').click();
      for (const view of ['before', 'now'])
        await press(page.locator('#event-view-' + view));
      await press(page.locator('#next-step'));
      const measured: unknown[] = [];
      async function positions() {
        await expect
          .poll(async () => {
            const b = await page.locator('#task-title').boundingBox();
            return b!.y;
          })
          .toBeGreaterThanOrEqual(0);
        for (const sel of [
          '#task-title',
          '.event-comparison',
          (await page.locator('#event-answer-direct-longer').count())
            ? '#event-answer-direct-longer'
            : '.event-comparison tbody tr:first-child',
        ]) {
          const b = await page.locator(sel).boundingBox();
          measured.push({ selector: sel, ...b });
          expect(b!.y).toBeGreaterThanOrEqual(0);
          expect(b!.y + b!.height).toBeLessThanOrEqual(768);
        }
      }
      await positions();
      if (route === 'north' && touch)
        await page.screenshot({
          path: evidencePath('event-task-visible.png'),
          fullPage: false,
        });
      await page.reload();
      await positions();
      for (const r of ['direct', 'north', 'south'])
        await page
          .locator(`#event-answer-${r}-${r === 'south' ? 'same' : 'longer'}`)
          .check();
      await page.locator('#check-answer').click();
      await page.locator('#event-connection').selectOption('sued');
      await page.locator('#event-cause').selectOption('unchanged');
      await page.locator('#check-answer').click();
      await press(page.locator('#next-step'));
      await press(page.getByRole('button', { name: '← Zurück', exact: true }));
      await positions();
      // A simple selection keeps the viewport, rather than forcing the task top again.
      await page.locator('#event-map-details > summary').click();
      await page.locator('#event-view-before').scrollIntoViewIfNeeded();
      const y = await page.evaluate(() => scrollY);
      await press(page.locator('#event-view-before'));
      expect(Math.abs((await page.evaluate(() => scrollY)) - y)).toBeLessThan(
        8,
      );
      if (route === 'north' && touch)
        await page.screenshot({
          path: evidencePath('event-landscape.png'),
          fullPage: true,
        });
      writeFileSync(
        evidencePath(`positions-${route}-${touch}.json`),
        JSON.stringify(measured, null, 2),
      );
      await ctx.close();
    });
test('SCORM readiness: simulated narrow embedded static Pages build, no LMS API or external runtime', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.route('**/mock-lms', (r) =>
    r.fulfill({
      contentType: 'text/html',
      body: '<html lang="de"><title>Lokale LMS-Simulation</title><iframe title="Spiel" src="/Afrika-2040/" style="width:640px;height:650px;border:0" sandbox="allow-scripts allow-same-origin"></iframe></html>',
    }),
  );
  await page.goto('http://127.0.0.1:4174/mock-lms');
  const f = page.frameLocator('iframe');
  await f.locator('#geo-pick-GHA').click();
  await f.locator('#geo-check').click();
  await expect(f.locator('[data-feedback]')).toHaveClass(/correct/);
  await f.locator('#review-open').click();
  await f.locator('#geo-transfer-claim-model').check();
  await f.locator('#review-check').click();
  await expect(f.locator('[data-feedback]')).toHaveClass(/correct/);
  expect(
    await f
      .locator('body')
      .evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true);
  await f.locator('#review-home').click();
  await f.locator('#episode-3').click();
  await expect(f.locator('#task-title')).toBeVisible();
  expect(requests.every((u) => u.startsWith('http://127.0.0.1:4174/'))).toBe(
    true,
  );
  await page.screenshot({
    path: evidencePath('mock-frame.png'),
    fullPage: true,
  });
});
test('SCORM state sizes measured from six actually completed episodes, help, texts and geography', async ({
  page,
}) => {
  test.setTimeout(90000);
  const samples: any[] = [];
  async function measure(label: string) {
    const state = await page.evaluate(
      (k) => JSON.parse(sessionStorage.getItem(k)!),
      key,
    );
    const raw = JSON.stringify(state);
    samples.push({
      label,
      characters: raw.length,
      utf8Bytes: Buffer.byteLength(raw),
      completed: {
        kenya: state.progress[5].complete,
        demand: state.demand?.decide.complete,
        regional: Object.entries(state.studies ?? {})
          .filter(([, v]: any) => v.progress[2].complete)
          .map(([k]) => k),
      },
    });
  }
  await first(page, 'north');
  await measure('one episode');
  await page
    .getByRole('button', { name: 'Episode 2 starten', exact: true })
    .click();
  await page.locator('#demand-route-north').click();
  await help(page);
  await page.locator('#demand-example').click();
  await page.locator('#next-step').click();
  await help(page);
  for (const m of ['bus', 'path']) {
    await page.locator('#demand-try-' + m).click();
    await page.locator('#demand-example').click();
  }
  await page.locator('#next-step').click();
  await page.locator('#demand-proposal-bus').check();
  await page.locator('#demand-goal-capacity').check();
  await help(page);
  await page.locator('#demand-example').click();
  await page.locator('#next-step').click();
  await measure('two episodes with help');
  await page
    .getByRole('button', { name: 'Episoden auswählen', exact: true })
    .click();
  for (const [n, options, proposal, goal] of [
    [3, ['quality', 'process'], 'quality', 'surplus'],
    [4, [], 'training', 'training'],
    [5, ['repair', 'tech'], 'tech', 'less'],
    [6, ['same', 'extra'], 'extra', 'area'],
  ] as const) {
    await page.locator('#episode-' + n).click();
    await help(page);
    await page.locator('#study-adopt').click();
    await page.locator('#next-step').click();
    await help(page);
    for (const o of options) {
      await page.locator('#try-' + o).click();
      await page.locator('#study-adopt').click();
    }
    await page.locator('#study-adopt').click();
    await page.locator('#next-step').click();
    await page.locator('#study-proposal-' + proposal).check();
    await page.locator('#study-goal-' + goal).check();
    await help(page);
    await page.locator('#study-adopt').click();
    await page.locator('#next-step').click();
    await measure('through episode ' + n);
    await page
      .getByRole('button', { name: 'Episoden auswählen', exact: true })
      .click();
  }
  for (const id of ['KEN', 'GHA', 'MAR']) {
    await page.locator('#geo-target-' + id).click();
    await page.locator('#geo-pick-' + id).click();
    await page.locator('#geo-check').click();
  }
  await page.locator('#review-open').click();
  for (const id of ['KEN', 'GHA', 'MAR']) {
    await page.locator('#review-tab-' + id).click();
    await page.locator('#geo-transfer-claim-model').check();
    await page.locator('#review-check').click();
  }
  await page.locator('#review-tab-common').click();
  await page.locator('#geo-transfer-consequences-different').check();
  await page.locator('#geo-transfer-weigh-evidence').check();
  await page.locator('#review-check').click();
  await measure('all six plus geography and review');
  await page.locator('#review-home').click();
  await page.locator('#episode-6').click();
  await page
    .getByRole('button', { name: 'Empfehlung bearbeiten', exact: true })
    .click();
  await page.locator('#study-own-words > summary').click();
  for (const text of ['Mein eigener Gedanke.', 'Ä'.repeat(1500)]) {
    await page.locator('#study-text').fill(text);
    await page.locator('#check-answer').click();
    await page.locator('#next-step').click();
    await measure('all six, text length ' + text.length);
    if (text.length < 1500) {
      await page
        .getByRole('button', { name: 'Empfehlung bearbeiten', exact: true })
        .click();
    }
  }
  writeFileSync(
    evidencePath('state-sizes.json'),
    JSON.stringify(samples, null, 2),
  );
  expect(samples.at(-1).completed.regional).toHaveLength(4);
});
test('F2 recovery saves the in-memory correct answers without penalties and removes the warning', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => {
    const native = Storage.prototype.setItem;
    (window as any).restoreSaving = () => {
      Storage.prototype.setItem = native;
    };
    Storage.prototype.setItem = () => {
      throw new DOMException('blocked', 'SecurityError');
    };
  });
  await page.locator('#geo-pick-GHA').click();
  await page.locator('#geo-check').click();
  await page.locator('#review-open').click();
  await page.locator('#geo-transfer-claim-model').check();
  await page.locator('#review-check').click();
  await expect(page.locator('#storage-warning')).toBeVisible();
  await page.evaluate(() => (window as any).restoreSaving());
  await page.locator('#review-check').click();
  await expect(page.locator('#storage-warning')).toBeHidden();
  const state = await page.evaluate(
    (k) => JSON.parse(sessionStorage.getItem(k)!),
    key,
  );
  expect(state.geography.records.GHA.progress.failures).toBe(0);
  expect(state.geography.review.records.KEN.progress.failures).toBe(0);
  expect(state.geography.records.GHA.progress.complete).toBe(true);
  await page.reload();
  await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
});
