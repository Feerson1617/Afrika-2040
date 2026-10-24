import { test, expect, type Page } from '@playwright/test';
import { studyClick } from './study-helpers.ts';
import { auditAccessibility } from './accessibility.ts';
import { evidencePath } from './artifacts.ts';
import {
  fullToDecision,
  chooseRoute,
  setGoal,
  selectEvidence,
  key,
} from './phase2a-helpers.ts';
const settings: Record<number, [string, string]> = {
  3: ['process', 'processing'],
  4: ['training', 'training'],
  5: ['tech', 'less'],
  6: ['extra', 'area'],
};
async function help(page: Page) {
  for (const name of [
    'Ich brauche einen Hinweis',
    'Genauer zeigen',
    'Erklärung ansehen',
  ])
    await page.getByRole('button', { name, exact: true }).click();
}
async function supportedToDecision(page: Page, n: number) {
  await help(page);
  await page.locator('#study-adopt').click();
  await page.locator('#next-step').click();
  await help(page);
  if (n === 4) await page.locator('#study-adopt').click();
  else {
    for (const k of n === 3
      ? ['quality', 'process']
      : n === 5
        ? ['repair', 'tech']
        : ['same', 'extra']) {
      await page.locator('#try-' + k).click();
      await page.locator('#study-adopt').click();
    }
    await page.locator('#study-adopt').click();
  }
  await page.locator('#next-step').click();
}
async function finish(page: Page, n: number) {
  const [p, g] = settings[n];
  await studyClick(page, '#study-proposal-' + p, 'check');
  await studyClick(page, '#study-goal-' + g, 'check');
  await help(page);
  await page.locator('#study-adopt').click();
  await page.locator('#next-step').click();
  await expect(page.locator('.study-product')).toBeVisible();
}
test('all six entries, four complete independent regional products below Pages prefix, exact reload and cross-episode retention', async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => {
    if (r.url().startsWith('http://127.0.0.1:4174') && r.status() >= 400)
      errors.push(r.url() + ':' + r.status());
  });
  await page.goto('http://127.0.0.1:4174/Afrika-2040/');
  await expect(
    page.getByRole('button', { name: 'Spiel starten' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Episode 2 starten', exact: true }),
  ).toBeVisible();
  for (const n of [3, 4, 5, 6])
    await expect(page.locator('#episode-' + n)).toBeVisible();
  expect((await auditAccessibility(page)).violations).toEqual([]);
  const products: Record<number, string> = {};
  for (const n of [3, 4, 5, 6]) {
    await page.locator('#episode-' + n).click();
    await supportedToDecision(page, n);
    await finish(page, n);
    products[n] = (await page.locator('.study-product').textContent())!;
    expect((await auditAccessibility(page)).violations).toEqual([]);
    await page.reload();
    await expect(page.locator('.study-product')).toHaveText(products[n]);
    await page
      .getByRole('button', { name: 'Episoden auswählen', exact: true })
      .click();
  }
  for (const n of [6, 3, 5, 4]) {
    await page.locator('#episode-' + n).click();
    await expect(page.locator('.study-product')).toHaveText(products[n]);
    await page
      .getByRole('button', { name: 'Episoden auswählen', exact: true })
      .click();
  }
  expect(errors).toEqual([]);
});
test('actual Kenya recommendation survives regional work and reload; cancellation preserves every record and confirmed restart clears them', async ({
  page,
}) => {
  await fullToDecision(page);
  await chooseRoute(page, 'Über Nord');
  await setGoal(page, 'school');
  await selectEvidence(page, 'advantage', 'amina-north-direct');
  await selectEvidence(page, 'disadvantage', 'david-north-direct');
  await page
    .getByRole('button', { name: 'Empfehlung prüfen', exact: true })
    .click();
  await page.locator('#next-step').click();
  const before = await page.evaluate(
    (k) => JSON.parse(sessionStorage.getItem(k)!),
    key,
  );
  await page
    .getByRole('button', { name: 'Episoden auswählen', exact: true })
    .click();
  await page.locator('#episode-6').click();
  await supportedToDecision(page, 6);
  await finish(page, 6);
  await page.reload();
  const after = await page.evaluate(
    (k) => JSON.parse(sessionStorage.getItem(k)!),
    key,
  );
  expect(after.decision).toEqual(before.decision);
  expect(after.progress).toEqual(before.progress);
  expect(after.studies.area.progress[2].complete).toBe(true);
  await page
    .getByRole('button', { name: 'Episoden auswählen', exact: true })
    .click();
  await page
    .getByRole('button', {
      name: 'Bisherige Empfehlungen ansehen',
      exact: true,
    })
    .click();
  await expect(page.locator('.recommendation')).toContainText('Über Nord');
  await page
    .getByRole('button', { name: 'Episoden auswählen', exact: true })
    .click();
  await page.locator('#episode-3').click();
  await page.locator('#chain-beans').click();
  await page.getByRole('button', { name: 'Neu starten', exact: true }).click();
  await page.getByRole('button', { name: 'Abbrechen', exact: true }).click();
  await expect(page.locator('#chain-beans')).toBeDisabled();
  await page.getByRole('button', { name: 'Neu starten', exact: true }).click();
  await page
    .getByRole('button', { name: 'Ja, neu starten', exact: true })
    .click();
  expect(await page.evaluate((k) => sessionStorage.getItem(k), key)).toBeNull();
  await page.reload();
  await page.locator('#episode-6').click();
  await expect(page.locator('#study-single-45')).not.toBeChecked();
});
test('blocked storage still permits regional supported work and explicitly ungraded escaped text; reload is not falsely promised', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException('blocked', 'SecurityError');
    };
  });
  await page.goto('/');
  await page.locator('#episode-5').click();
  await supportedToDecision(page, 5);
  await studyClick(page, '#study-proposal-tech', 'check');
  await studyClick(page, '#study-goal-repair', 'check');
  await page.locator('#study-panel-limit').click();
  await page.locator('#study-own-words summary').click();
  await page.locator('#study-text').fill('??? <img src=x onerror=alert(1)>');
  await page.locator('#study-submit').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
  await expect(page.locator('[data-feedback]')).toContainText('nicht');
  await page.locator('#next-step').click();
  await expect(page.locator('[data-ungraded]')).toBeVisible();
  await expect(page.locator('.saved-text')).toContainText('<img');
  await expect(page.locator('.saved-text img')).toHaveCount(0);
  await expect(page.locator('.study-product')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('#episode-5')).toBeVisible();
});
async function keyboard(page: Page, id: string) {
  const el = page.locator(id);
  await el.focus();
  await expect(el).toBeFocused();
  const radio = (await el.getAttribute('type')) === 'radio';
  await page.keyboard.press(radio ? 'Space' : 'Enter');
  if (radio) await expect(page.locator(id)).toBeChecked();
}
for (const n of [3, 4, 5, 6])
  test(`complete regional episode ${n} by keyboard; SVG and HTML alternatives reached in actual Tab order`, async ({
    page,
  }) => {
    await page.goto('/');
    await keyboard(page, '#episode-' + n);
    const ids =
      n === 3
        ? ['#chain-beans', '#chain-roast', '#chain-mass', '#chain-press']
        : n === 4
          ? ['#study-free-120', '#study-wages-paid']
          : n === 5
            ? ['#study-withdrawal-60', '#study-rest-20']
            : ['#try-same', '#study-single-45', '#study-saving-15'];
    for (const id of [...ids, '#check-answer', '#next-step'])
      await keyboard(page, id);
    const wanted =
      n === 3
        ? [
            'study-scene-quality',
            'study-scene-process',
            'try-quality',
            'try-process',
          ]
        : n === 4
          ? [
              'study-scene-payout',
              'study-scene-reserve',
              'study-scene-training',
              'try-payout',
            ]
          : n === 5
            ? [
                'study-scene-repair',
                'study-scene-tech',
                'try-repair',
                'try-tech',
              ]
            : [
                'study-scene-same',
                'study-scene-extra',
                'try-same',
                'try-extra',
              ];
    await page.locator('#words-toggle').focus();
    const reached = new Set<string>();
    for (let i = 0; i < 45; i++) {
      await page.keyboard.press('Tab');
      const id = await page.evaluate(() => document.activeElement?.id ?? '');
      if (wanted.includes(id)) {
        reached.add(id);
        expect(
          await page
            .locator('#' + id)
            .evaluate((e) => getComputedStyle(e).outlineStyle),
        ).not.toBe('none');
      }
      if (wanted.every((k) => reached.has(k))) break;
    }
    expect([...reached].sort()).toEqual([...wanted].sort());
    if (n === 4) {
      for (const k of ['payout', 'reserve', 'training'])
        for (const id of ['#try-' + k, '#add-' + k, '#add-' + k])
          await keyboard(page, id);
      await keyboard(page, '#study-why-tradeoff');
    } else {
      const data =
        n === 3
          ? [
              ['quality', '90'],
              ['process', '75'],
            ]
          : n === 5
            ? [
                ['repair', '30'],
                ['tech', '35'],
              ]
            : [
                ['same', '45'],
                ['extra', '65'],
              ];
      for (const [k, v] of data)
        for (const id of ['#try-' + k, `#study-${k}-${v}`, '#check-answer'])
          await keyboard(page, id);
      await keyboard(
        page,
        n === 3
          ? '#study-why-costs'
          : n === 5
            ? '#study-why-delivery'
            : '#study-why-growth',
      );
    }
    await keyboard(page, '#check-answer');
    await keyboard(page, '#next-step');
    const [p, g] = settings[n];
    for (const [field, v] of [
      ['proposal', p],
      ['goal', g],
      ['benefit', p],
      ['limit', p],
    ]) {
      await keyboard(
        page,
        '#study-panel-' +
          (['proposal', 'goal'].includes(field) ? 'plan' : field),
      );
      await keyboard(page, `#study-${field}-${v}`);
    }
    await keyboard(page, '#check-answer');
    await keyboard(page, '#next-step');
    await expect(page.locator('.study-product')).toBeVisible();
  });
for (const device of [
  { name: 'portrait', width: 768, height: 1024 },
  { name: 'landscape', width: 1024, height: 768 },
])
  test(`all new SVG touch targets, readable scene text and adjacent decision facts on simulated iPad ${device.name}`, async ({
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
    for (const n of [3, 4, 5, 6]) {
      await page.locator('#episode-' + n).tap();
      await help(page);
      await page.locator('#study-adopt').tap();
      await page.locator('#next-step').tap();
      const targets = page.locator('.study-scene [role="button"]');
      for (const el of await targets.all()) {
        const b = (await el.boundingBox())!;
        expect(b.height).toBeGreaterThanOrEqual(44);
        expect(b.width).toBeGreaterThanOrEqual(44);
      }
      const textSize = await page
        .locator('.study-scene text')
        .evaluateAll((elements) =>
          Math.min(
            ...elements.map((e) => {
              const m = (e as SVGTextElement).getScreenCTM()!;
              return (
                parseFloat(getComputedStyle(e).fontSize) * Math.hypot(m.a, m.b)
              );
            }),
          ),
        );
      expect(textSize).toBeGreaterThanOrEqual(15);
      if (n === 4) {
        await help(page);
        await page.locator('#study-adopt').tap();
        await page.locator('#next-step').tap();
        await studyClick(page, '#study-proposal-training', 'tap');
        await studyClick(page, '#study-goal-training', 'tap');
        await page.locator('#study-panel-benefit').tap();
        await expect(page.locator('.study-decision-part fieldset')).toHaveCount(
          1,
        );
        await expect(page.locator('.study-facts')).toContainText('40 GE');
        const gap = await page
          .locator('.study-facts')
          .evaluate(
            (e) =>
              e.nextElementSibling!.getBoundingClientRect().top -
              e.getBoundingClientRect().bottom,
          );
        expect(gap).toBeLessThan(50);
        if (device.name === 'portrait')
          await page.screenshot({
            path: evidencePath('final-ipad-ghana-evidence.png'),
            fullPage: true,
          });
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page
        .getByRole('button', { name: 'Episoden auswählen', exact: true })
        .tap();
    }
    if (device.name === 'landscape')
      await page.screenshot({
        path: evidencePath('final-six-episode-menu.png'),
        fullPage: true,
      });
    await ctx.close();
  });
test('true information about another tested measure remains neutral and unconnected; correct partial evidence is explicitly acknowledged', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#episode-3').click();
  await supportedToDecision(page, 3);
  for (const [f, v] of [
    ['proposal', 'process'],
    ['goal', 'processing'],
    ['benefit', 'quality'],
    ['limit', 'process'],
  ])
    await studyClick(page, `#study-${f}-${v}`, 'check');
  await page.locator('#check-answer').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
  await expect(page.locator('[data-feedback]')).toContainText(
    'Du beachtest die Grenze',
  );
  await expect(page.locator('[data-feedback]')).toContainText(
    'noch nicht verbunden',
  );
  await expect(page.locator('#next-step')).toHaveCount(0);
  await studyClick(page, '#study-benefit-process', 'check');
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await expect(page.locator('.study-product')).toBeVisible();
});
