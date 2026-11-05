import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { initialState } from '../../src/state.ts';
import {
  active,
  newLearning,
  reduceLearning,
  type LearningState,
} from '../../src/learning/storage.ts';
import { tasksFor, type Task } from '../../src/learning/tasks.ts';
import { profileIds, type ProfileId } from '../../src/learning/profiles.ts';
import type { Unit } from '../../src/learning/catalog.ts';
import { answers } from '../learning-oracles.ts';
import { evidencePath } from './artifacts.ts';
const key = 'afrika-2040:kenia-bus:v2a';
const op = (s: LearningState, op: any, value?: string, field?: string) =>
  reduceLearning(s, { type: 'learning', op, value, field });
function fixture(unit: Unit, profile: ProfileId, target: string) {
  let s = op(newLearning(), 'recommend', profile, unit);
  for (let i = 0; i < 60; i++) {
    if (active(s)!.task.id === target) return s;
    for (const id of active(s)!.task.simulation?.required ?? [])
      s = op(s, 'simulate', id);
    s = op(s, 'adopt');
    s = op(s, 'next');
  }
  throw Error(target);
}
async function seed(page: Page, state: LearningState) {
  await page.goto('/');
  await page.evaluate(
    ({ key, state }) => sessionStorage.setItem(key, JSON.stringify(state)),
    { key, state: { ...initialState(), screen: 'learning', learning: state } },
  );
  await page.reload();
}
const saved = (page: Page) =>
  page.evaluate(
    (key) => JSON.parse(sessionStorage.getItem(key)!).learning,
    key,
  );
async function input(page: Page, task: Task, wrong = false) {
  const expected = answers(task);
  for (const [index, f] of task.fields.entries()) {
    const value =
      wrong && index === 0
        ? f.kind === 'integer'
          ? '999'
          : f.options!.find(([id]) => id !== expected[f.id])![0]
        : expected[f.id];
    const el = page.locator('#learn-' + f.id);
    if (f.kind === 'choice') {
      if (await el.evaluate((e) => e.tagName === 'FIELDSET'))
        await page
          .locator(`input[data-field="${f.id}"][value="${value}"]`)
          .check();
      else await el.selectOption(value);
    } else await el.fill(value);
  }
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
const tags = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22a',
  'wcag22aa',
];
for (const viewport of [
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
])
  test(`Afrika curriculum visual atlas ${viewport.width}: direct chapters, keyboard, contrast and no extra entry step`, async ({
    page,
    browserName,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('#learning-open')).toBeInViewport();
    await expect(page.locator('#learning-chapters > section')).toHaveCount(5);
    await expect(page.locator('#learning-chapters button')).toHaveCount(13);
    await expect(page.locator('.atlas-preview svg')).toHaveAccessibleName(
      /Ghana mit Kumasi.*Kenia mit Nairobi.*Marokko mit Agadir/,
    );
    await noOverflow(page);
    expect(
      (await new AxeBuilder({ page }).withTags(tags).analyze()).violations,
    ).toEqual([]);
    await page.screenshot({
      path: evidencePath(`visual-start-${viewport.width}-${browserName}.png`),
      fullPage: true,
    });
    await page.locator('#learn-s3').press('Enter');
    await expect(page.locator('h1')).toHaveText('Wähle deinen Lernweg');
    await expect(page.locator('.learning-profiles > section')).toHaveCount(4);
    await page
      .locator('[data-op="request-profile"][data-value="foerder"]')
      .press('Enter');
    await page.locator('[data-op="confirm-profile"]').press('Enter');
    await expect(page.locator('h1')).toHaveText('Kakaobohnen verarbeiten');
    await expect(page.locator('#learn-step')).toHaveValue('');
    await expect(page.locator('.learning-process li')).toHaveCount(4);
    await expect(page.locator('.learning-process')).not.toContainText(
      'Pressen',
    );
    await noOverflow(page);
    expect(
      (await new AxeBuilder({ page }).withTags(tags).analyze()).violations,
    ).toEqual([]);
  });
for (const profile of profileIds)
  for (const unit of ['s1', 's2', 's3', 's4', 's5', 's6'] as const)
    test(`Afrika curriculum visual models ${unit}/${profile}: touch, visible change, keyboard and reload`, async ({
      browser,
      browserName,
    }) => {
      const context = await browser.newContext({
        viewport: { width: 1024, height: 768 },
        hasTouch: true,
      });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      const target =
        unit === 's4'
          ? 'share.plan'
          : unit === 's6'
            ? 'area.cause'
            : tasksFor(unit, profile).find(
                (t) => t.simulation?.required?.length,
              )!.id;
      await seed(page, fixture(unit, profile, target));
      if (unit === 's4') {
        for (const part of ['payout', 'reserve', 'training']) {
          await page.locator(`#allocate-${part}-plus`).tap();
          await page.locator(`#allocate-${part}-plus`).tap();
          await expect(
            page.locator(`.allocation-track .allocation-${part}`),
          ).toHaveAttribute('data-amount', '40');
        }
        await expect(
          page.locator('.allocation-track .allocation-left'),
        ).toHaveAttribute('data-amount', '0');
        await page.locator('#allocate-payout-minus').press('Enter');
        await expect(page.locator('#allocate-payout-minus')).toBeFocused();
        await expect(
          page.locator('.allocation-track .allocation-left'),
        ).toHaveAttribute('data-amount', '20');
        await page.locator('#allocate-reserve-plus').press('Enter');
        const widths = await page
          .locator('.allocation-track > span')
          .evaluateAll((els) =>
            els.map((e) => e.getBoundingClientRect().width),
          );
        expect(widths[1] / widths[0]).toBeCloseTo(3, 1);
        await page.locator('#learning-check').tap();
        await expect(page.locator('#learning-next')).toBeVisible();
      } else {
        const choices =
          unit === 's1'
            ? ['leila-direct', 'leila-south', 'leila-north', 'leila-direct']
            : unit === 's2'
              ? ['base', 'bus', 'path', 'base']
              : unit === 's3'
                ? ['base', 'quality', 'process', 'base']
                : unit === 's5'
                  ? ['base', 'repair', 'tech', 'base']
                  : ['base', 'same', 'extra', 'same'];
        for (const [i, choice] of choices.entries()) {
          const control = page.locator(
            `button[data-op="simulate"][data-value="${choice}"]${unit === 's1' ? '[id^="sim-Linie"]' : ''}`,
          );
          if (i === choices.length - 1) {
            await control.press('Enter');
            await expect(control).toBeFocused();
          } else await control.tap();
          await expect(control).toHaveAttribute('aria-pressed', 'true');
          if (unit === 's1') {
            await expect(page.locator('.bus.active')).toHaveCount(1);
            await expect(page.locator('.journey-focus')).toContainText('Leila');
            await expect(page.locator('.journey-focus')).toContainText(
              choice === 'leila-south'
                ? '2 Minuten zu Fuß'
                : '12 Minuten zu Fuß',
            );
            await expect(page.locator('.journey-focus')).toContainText(
              choice === 'leila-south'
                ? '8 Minuten im Bus'
                : choice === 'leila-north'
                  ? '16 Minuten im Bus'
                  : '10 Minuten im Bus',
            );
          }
          if (unit === 's2') {
            await expect(
              page.locator('.capacity-picture .person-filled'),
            ).toHaveCount(24);
            await expect(
              page.locator('.capacity-picture .seat-filled'),
            ).toHaveCount(choice === 'bus' ? 30 : 20);
            await expect(
              page.locator('.inquiry-material > [aria-live="polite"]'),
            ).toContainText(`${choice === 'path' ? 4 : 12} Minuten Fußweg`);
          }
          if (unit === 's3') {
            const [income, costs] =
              choice === 'process'
                ? [260, 185]
                : choice === 'quality'
                  ? [200, 110]
                  : [180, 100];
            await expect(
              page.locator('[data-ledger="income"] strong'),
            ).toHaveText(String(income));
            await expect(
              page.locator('[data-ledger="costs"] strong'),
            ).toHaveText(String(costs));
            const ratios = await page
              .locator('.ledger-track')
              .evaluateAll((els) =>
                els
                  .slice(0, 2)
                  .map(
                    (e) =>
                      e.firstElementChild!.getBoundingClientRect().width /
                      e.getBoundingClientRect().width,
                  ),
              );
            expect(ratios[0]).toBeCloseTo(income / 260, 2);
            expect(ratios[1]).toBeCloseTo(costs / 260, 2);
            await expect(page.locator('[data-ledger="surplus"]')).toHaveCount(
              profile === 'foerder' ? 1 : 0,
            );
          }
          if (unit === 's5' || unit === 's6') {
            const withdrawal =
              unit === 's5'
                ? ({ base: 60, repair: 50, tech: 45 } as any)[choice]
                : ({ base: 60, same: 45, extra: 65 } as any)[choice];
            await expect(page.locator('.water-scene')).toHaveAccessibleName(
              `Tank, Entnahme und Feld getrennt. ${withdrawal} WE werden entnommen.`,
            );
            if (unit === 's5')
              await expect(page.locator('.water-scene')).toContainText('40 WE');
            else
              await expect(page.locator('.water-scene')).toContainText(
                choice === 'base' ? '60 WE' : '45 WE',
              );
            if (unit === 's6' && choice === 'extra')
              await expect(page.locator('.water-scene')).toContainText(
                'Zusatzfeld',
              );
            if (unit === 's6')
              await expect(page.locator('.extra-field-branch')).toHaveCount(
                choice === 'extra' ? 1 : 0,
              );
          }
          if (i === 1 || i === 2)
            await page.screenshot({
              path: evidencePath(
                `visual-${unit}-${profile}-${choice}-${browserName}.png`,
              ),
              fullPage: true,
            });
        }
      }
      await noOverflow(page);
      expect(
        (await new AxeBuilder({ page }).withTags(tags).analyze()).violations,
      ).toEqual([]);
      const state = await saved(page);
      const current = active(state)!.attempt!;
      await page.reload();
      expect(active(await saved(page))!.attempt).toEqual(current);
      expect(errors).toEqual([]);
      await context.close();
    });
for (const profile of profileIds)
  test(`Afrika curriculum visual feedback ${profile}: true partial wrong, support, reduced motion and back`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const target = tasksFor('s3', profile).find((t) =>
      t.id.startsWith('cocoa.compare'),
    )!.id;
    await seed(page, fixture('s3', profile, target));
    for (const choice of ['quality', 'process'])
      await page
        .locator(`button[data-op="simulate"][data-value="${choice}"]`)
        .click();
    const task = active(await saved(page))!.task;
    await input(page, task, true);
    await page.locator('#learning-check').press('Enter');
    await expect(page.locator('[data-learning-feedback]')).toHaveClass(
      task.fields.length === 1 ? /incorrect/ : /partial/,
    );
    await expect(page.locator('[data-learning-feedback]')).toHaveCSS(
      'background-color',
      task.fields.length === 1 ? 'rgb(255, 240, 236)' : 'rgb(255, 247, 218)',
    );
    if (task.fields.length > 1)
      await expect(page.locator('[data-finding="correct"]')).toContainText(
        'Diese Angabe passt.',
      );
    await page.locator('#learning-check').press('Enter');
    await expect(page.locator('[data-learning-feedback]')).toHaveClass(/hint/);
    expect(active(await saved(page))!.attempt!.exampleUsed).toBe(false);
    await page.locator('#learning-adopt').press('Enter');
    expect(active(await saved(page))!.attempt!.exampleUsed).toBe(true);
    await expect(page.locator('[data-learning-feedback]')).toHaveClass(
      /correct/,
    );
    await expect(page.locator('[data-learning-feedback]')).toHaveCSS(
      'animation-name',
      'none',
    );
    await page.locator('#learning-next').press('Enter');
    await page.locator('[data-op="back"]').press('Enter');
    await expect(page.locator('#learning-next')).toBeVisible();
    await page.reload();
    await expect(page.locator('#learning-next')).toBeVisible();
    await page.locator('[data-op="rework"]').press('Enter');
    for (const choice of ['quality', 'process'])
      await page
        .locator(`button[data-op="simulate"][data-value="${choice}"]`)
        .click();
    await input(page, active(await saved(page))!.task);
    await page.locator('#learning-check').press('Enter');
    await expect(page.locator('[data-learning-feedback]')).toHaveCSS(
      'background-color',
      'rgb(237, 245, 232)',
    );
  });

for (const viewport of [
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
])
  test(`Afrika curriculum visual compact ${viewport.width}: six scenes remain usable without horizontal scrolling`, async ({
    page,
    browserName,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize(viewport);
    for (const unit of ['s1', 's2', 's3', 's4', 's5', 's6'] as const) {
      const target =
        unit === 's4'
          ? 'share.plan'
          : unit === 's6'
            ? 'area.cause'
            : tasksFor(unit, 'esa').find((t) => t.simulation?.required?.length)!
                .id;
      await seed(page, fixture(unit, 'esa', target));
      await noOverflow(page);
      const buttons = page.locator('.inquiry-material button');
      for (const rect of await buttons.evaluateAll((es) =>
        es.map((e) => ({
          w: e.getBoundingClientRect().width,
          h: e.getBoundingClientRect().height,
        })),
      )) {
        expect(rect.w).toBeGreaterThanOrEqual(44);
        expect(rect.h).toBeGreaterThanOrEqual(44);
      }
      await page.locator('#learning-check').press('Enter');
      await expect(page.locator('#learning-help')).toBeVisible();
      await page.screenshot({
        path: evidencePath(
          `visual-compact-${unit}-${viewport.width}-${browserName}.png`,
        ),
        fullPage: true,
      });
    }
  });

test('Afrika curriculum visual feedback: full text contrast from the first animation frame', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await seed(page, fixture('c', 'msa', tasksFor('c', 'msa')[0].id));
  // Freeze any future decoration at its first frame: text must already be
  // readable there, not only after an animation has finished.
  await page.addStyleTag({
    content:
      '[data-learning-feedback] { animation-play-state: paused !important; }',
  });
  await input(page, active(await saved(page))!.task);
  await page.locator('#learning-check').click();
  await expect(page.locator('[data-learning-feedback]')).toHaveClass(/correct/);
  await expect(page.locator('[data-learning-feedback]')).toHaveCSS(
    'opacity',
    '1',
  );
  expect(
    (await new AxeBuilder({ page }).withTags(tags).analyze()).violations,
  ).toEqual([]);
});
