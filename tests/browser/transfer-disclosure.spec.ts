import { test, expect, type Page } from '@playwright/test';
import { initialState } from '../../src/state.ts';
import {
  active,
  newLearning,
  reduceLearning,
  type LearningState,
} from '../../src/learning/storage.ts';
import { tasksFor } from '../../src/learning/tasks.ts';
import { profileIds } from '../../src/learning/profiles.ts';
import { answers } from '../learning-oracles.ts';
import { evidencePath } from './artifacts.ts';
const key = 'afrika-2040:kenia-bus:v2a';
const act = (
  s: LearningState,
  op: Parameters<typeof reduceLearning>[1]['op'],
  value?: string,
  field?: string,
) => reduceLearning(s, { type: 'learning', op, value, field });
function fixture(
  unit: 's2' | 's5' | 's6',
  profile: (typeof profileIds)[number],
  target: string,
) {
  let s = act(newLearning(), 'recommend', profile, unit);
  for (let i = 0; i < 60; i++) {
    const t = active(s)!.task;
    if (t.id === target) return s;
    for (const id of t.simulation?.required ?? []) s = act(s, 'simulate', id);
    for (const f of t.fields) s = act(s, 'answer', answers(t)[f.id], f.id);
    s = act(s, 'check');
    s = act(s, 'next');
  }
  throw Error('Transfer not reached');
}
async function seed(page: Page, s: LearningState) {
  await page.goto('/');
  await page.evaluate(
    ({ key, s }) => sessionStorage.setItem(key, JSON.stringify(s)),
    { key, s: { ...initialState(), screen: 'learning', learning: s } },
  );
  await page.reload();
}
const state = (page: Page) =>
  page.evaluate(
    (key) => JSON.parse(sessionStorage.getItem(key)!).learning,
    key,
  );
async function fill(
  page: Page,
  t: ReturnType<typeof tasksFor>[number],
  values: Record<string, string>,
) {
  for (const f of t.fields) {
    const el = page.locator('#learn-' + f.id);
    if (f.kind === 'choice') {
      if (await el.evaluate((e) => e.tagName === 'FIELDSET'))
        await page
          .locator(`input[data-field="${f.id}"][value="${values[f.id]}"]`)
          .check();
      else await el.selectOption(values[f.id]);
    } else await el.fill(values[f.id]);
  }
}

for (const unit of ['s2', 's5', 's6'] as const)
  for (const profile of profileIds)
    for (const task of tasksFor(unit, profile).filter(
      (t) => t.simulation?.transfer,
    ))
      for (const supported of [false, true])
        test(`Afrika curriculum D1 ${unit}/${profile}/${task.id} supported=${supported}`, async ({
          browser,
          browserName,
        }) => {
          test.setTimeout(60000);
          const ctx = await browser.newContext({
            viewport: { width: 1024, height: 768 },
            hasTouch: true,
          });
          const page = await ctx.newPage();
          await seed(page, fixture(unit, profile, task.id));
          const material = page.locator('.inquiry-material');
          const hidden = async () => {
            if (profile === 'foerder') return;
            await expect(
              material.locator('[data-transfer-solution="withheld"]'),
            ).toBeVisible();
            const content = await material.innerHTML();
            if (unit === 's5')
              expect(content).not.toMatch(/20 WE|Rest 20|<td>20<\/td>/);
            if (unit === 's6')
              expect(content).not.toMatch(
                /55 WE|25 WE|<td>(55|25)<\/td>|5 WE weniger/,
              );
            if (unit === 's2')
              expect(content).not.toContain(
                'Freie Plätze verkürzen den Fußweg nicht',
              );
          };
          const shown = async () => {
            await expect(
              material.locator('[data-transfer-solution="withheld"]'),
            ).toHaveCount(0);
            await expect(material).toContainText(
              unit === 's5'
                ? 'Rest 20 WE'
                : unit === 's6'
                  ? '55 WE'
                  : 'Freie Plätze verkürzen den Fußweg nicht',
            );
          };
          await hidden();
          await page.reload();
          await hidden();
          if (profile === 'msa' && !supported)
            await page.screenshot({
              path: evidencePath(
                `d1-initial-${unit}-${task.id}-${browserName}.png`,
              ),
              fullPage: true,
            });
          for (const el of await page
            .locator('select[name="learning-answer"]')
            .all()) {
            const box = await el.boundingBox();
            expect(box!.height).toBeGreaterThanOrEqual(44);
            await el.focus();
            await expect(el).toBeFocused();
            await expect(el).toHaveCSS('outline-style', 'solid');
          }
          if (profile === 'esa' && unit !== 's2')
            await expect(material).toContainText(
              unit === 's5' ? '70 − 50 = ___' : '45 + 10 = ___',
            );
          await page.locator('#learning-check').press('Enter');
          expect(active(await state(page))!.attempt!.failures).toBe(0);
          await hidden();
          // Both lower help levels remain input-only; standard scaffold is already help 1.
          while (active(await state(page))!.attempt!.help < 2) {
            await page.locator('#learning-help').tap();
            await hidden();
          }
          const correct = answers(task);
          if (task.fields.length > 1) {
            await fill(page, { ...task, fields: [task.fields[0]] }, correct);
            await page.locator('#learning-check').tap();
            expect(active(await state(page))!.attempt!.failures).toBe(0);
            await hidden();
          }
          if (supported) {
            const history = active(await state(page))!.attempt!.submissions;
            await page.locator('#learning-help').tap();
            await shown();
            expect(active(await state(page))!.attempt!.exampleUsed).toBe(false);
            expect(active(await state(page))!.attempt!.submissions).toEqual(
              history,
            );
            await page.locator('#learning-adopt').tap();
            expect(active(await state(page))!.attempt!.exampleUsed).toBe(true);
          } else {
            await fill(page, task, correct);
            await page.locator('#learning-check').press('Enter');
            await shown();
            const f = task.fields.at(-1)!;
            const wrong =
              f.kind === 'integer'
                ? String(Number(correct[f.id]) + 7)
                : f.options!.find(([id]) => id !== correct[f.id])![0];
            await fill(page, { ...task, fields: [f] }, { [f.id]: wrong });
            expect(active(await state(page))!.attempt!.process).toBe('draft');
            await hidden();
            await page.locator('#learning-check').tap();
            await expect(page.locator('[data-learning-feedback]')).toHaveClass(
              task.fields.length > 1 ? /partial/ : /incorrect/,
            );
            expect(active(await state(page))!.attempt!.failures).toBe(1);
            await hidden();
            await page.locator('#learning-check').press('Enter');
            await expect(page.locator('[data-learning-feedback]')).toHaveClass(
              /hint/,
            );
            await shown();
            expect(active(await state(page))!.attempt!.failures).toBe(2);
            expect(active(await state(page))!.attempt!.exampleUsed).toBe(false);
            await page.locator('#learning-adopt').tap();
          }
          const saved = active(await state(page))!.attempt!;
          await page
            .locator('[data-value="comparison"][data-op="simulate"]')
            .tap();
          await expect(material).toContainText('nur zum Vergleich');
          await page
            .locator('[data-value="current"][data-op="simulate"]')
            .press('Enter');
          await shown();
          await page.reload();
          await shown();
          expect(active(await state(page))!.attempt!.submissions).toEqual(
            saved.submissions,
          );
          await page.locator('[data-op="back"]').tap();
          await page.locator('#learning-next').tap();
          await shown();
          await page.locator('[data-op="rework"]').tap();
          expect(active(await state(page))!.attempt!.process).toBe('draft');
          expect(active(await state(page))!.attempt!.submissions).toEqual(
            saved.submissions,
          );
          if (profile === 'msa' && !supported)
            await page.screenshot({
              path: evidencePath(`d1-${unit}-${task.id}-${browserName}.png`),
              fullPage: true,
            });
          await ctx.close();
        });

test('Afrika curriculum T1 native select uses keyboard and retains semantic answer', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    hasTouch: true,
  });
  const page = await context.newPage();
  await seed(page, fixture('s2', 'msa', 'demand.transfer'));
  const select = page.locator('#learn-enough');
  await expect(select).toHaveAccessibleName(
    'Jetzt sind es 18 Menschen bei 20 Plätzen. Reicht die Kapazität?',
  );
  expect((await select.boundingBox())!.height).toBe(48);
  // Traverse the actual tab order, then use the native select's keyboard handling.
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  for (
    let i = 0;
    i < 30 && !(await select.evaluate((e) => e === document.activeElement));
    i++
  )
    await page.keyboard.press('Tab');
  await expect(select).toBeFocused();
  await expect(select).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  const value = await select.inputValue();
  expect(['yes', 'no']).toContain(value);
  expect(active(await state(page))!.attempt!.answers.enough).toBe(value);
  await page.reload();
  await expect(select).toHaveValue(value);
  expect(active(await state(page))!.attempt!.answers.enough).toBe(value);
  await context.close();
});
