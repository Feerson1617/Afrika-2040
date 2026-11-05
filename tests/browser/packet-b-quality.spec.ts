import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { implementedUnits } from '../../src/learning/catalog.ts';
import { profileIds } from '../../src/learning/profiles.ts';
import { tasksFor, type Task } from '../../src/learning/tasks.ts';
import {
  active,
  newLearning,
  reduceLearning,
  type LearningState,
} from '../../src/learning/storage.ts';
import { initialState } from '../../src/state.ts';
import { answers } from '../learning-oracles.ts';
import { topicAnswers } from '../topic-oracles.ts';
import { evidencePath } from './artifacts.ts';
const key = 'afrika-2040:kenia-bus:v2a';
const act = (
  s: LearningState,
  op: Parameters<typeof reduceLearning>[1]['op'],
  value?: string,
  field?: string,
) => reduceLearning(s, { type: 'learning', op, value, field });
const graded = (t: Task) =>
  t.fields.filter(
    (f) =>
      f.kind !== 'text' &&
      f.expected &&
      f.expected !== 'either' &&
      f.expected !== 'linked',
  );
async function fill(page: Page, field: Task['fields'][number], value: string) {
  const el = page.locator('#learn-' + field.id);
  if (field.kind === 'choice') {
    if (await el.evaluate((e) => e.tagName === 'FIELDSET'))
      await page
        .locator(`input[data-field="${field.id}"][value="${value}"]`)
        .check();
    else await el.selectOption(value);
  } else await el.fill(value);
}
for (const unit of implementedUnits)
  for (const profile of profileIds)
    test(`Afrika curriculum PaketB quality ${unit}/${profile}: actual feedback, counters, help, retained right parts and rework`, async ({
      page,
      browserName,
    }) => {
      test.setTimeout(60000);
      await page.setViewportSize({ width: 1024, height: 768 });
      const list = tasksFor(unit, profile),
        candidates = list
          .map((t, i) => ({ t, i }))
          .filter(({ t }) => graded(t).length);
      const index =
        candidates.find(({ t }) => graded(t).length > 1)?.i ??
        candidates[Math.min(1, candidates.length - 1)].i;
      let s = act(newLearning(), 'recommend', profile, unit);
      for (let i = 0; i < index; i++) {
        const t = active(s)!.task;
        for (const id of t.simulation?.required ?? [])
          s = act(s, 'simulate', id);
        const values = ['a', 'n', 'd', 'e'].includes(unit)
          ? topicAnswers(t, 'cool')
          : answers(t);
        for (const f of t.fields) s = act(s, 'answer', values[f.id], f.id);
        s = act(s, 'check');
        s = act(s, 'next');
      }
      const task = active(s)!.task,
        fields = graded(task),
        values = ['a', 'n', 'd', 'e'].includes(unit)
          ? topicAnswers(task, 'cool')
          : answers(task);
      await page.goto('/');
      await page.evaluate(
        ({ key, s }) => sessionStorage.setItem(key, JSON.stringify(s)),
        { key, s: { ...initialState(), screen: 'learning', learning: s } },
      );
      await page.reload();
      const get = () =>
        page.evaluate(
          (key) => JSON.parse(sessionStorage.getItem(key)!).learning,
          key,
        );
      await page.locator('#learning-check').press('Enter');
      expect(active(await get())!.attempt!.failures).toBe(0);
      await expect(page.locator('#learning-next')).toHaveCount(0);
      for (const id of task.simulation?.required ?? [])
        await page
          .locator(`#sim-Liniewhlen-${id}, #sim-Modelluntersuchen-${id}`)
          .press('Enter');
      for (const f of task.fields) await fill(page, f, values[f.id]);
      const wrongField = fields.at(-1)!;
      const wrong =
        wrongField.kind === 'integer'
          ? String(Number(wrongField.expected) + 7)
          : wrongField.options!.find(
              ([id]) =>
                id !== wrongField.expected &&
                !wrongField.accepted?.includes(id),
            )![0];
      await fill(page, wrongField, wrong);
      await page.locator('#learning-check').press('Enter');
      await expect(page.locator('[data-learning-feedback]')).toHaveClass(
        fields.length > 1 ? /partial/ : /incorrect/,
      );
      expect(active(await get())!.attempt!.failures).toBe(1);
      if (fields.length > 1)
        await expect(
          page.locator(`[data-finding="correct"]`).first(),
        ).toContainText('Diese Angabe passt.');
      const before = active(await get())!.attempt!;
      await page.locator('#learning-check').press('Enter');
      await expect(page.locator('[data-learning-feedback]')).toHaveClass(
        /hint/,
      );
      await expect(page.locator('[data-learning-feedback]')).toHaveCSS(
        'background-color',
        'rgb(255, 247, 218)',
      );
      expect(active(await get())!.attempt!.failures).toBe(2);
      if (profile === 'foerder') {
        const scan = await new AxeBuilder({ page })
          .withTags([
            'wcag2a',
            'wcag2aa',
            'wcag21a',
            'wcag21aa',
            'wcag22a',
            'wcag22aa',
          ])
          .analyze();
        expect(scan.violations).toEqual([]);
        await page.screenshot({
          path: evidencePath(`quality-${unit}-${browserName}.png`),
          fullPage: true,
        });
      }
      await page.locator('#learning-adopt').click();
      await expect(page.locator('#learning-next')).toBeVisible();
      const adopted = active(await get())!.attempt!;
      expect(adopted.exampleShown).toBe(true);
      expect(adopted.exampleUsed).toBe(true);
      for (const f of fields.filter((f) => f.id !== wrongField.id))
        expect(adopted.answers[f.id]).toBe(before.answers[f.id]);
      for (const [id, p] of Object.entries(
        s.records[`${unit}.${profile}.v1`].attempts,
      ))
        if (id !== task.id)
          expect(
            (await get()).records[`${unit}.${profile}.v1`].attempts[id],
          ).toEqual(p);
      await page.reload();
      await expect(page.locator('#learning-next')).toBeVisible();
      expect(active(await get())!.attempt!.answers).toEqual(adopted.answers);
      await page.locator('[data-op="rework"]').click();
      await expect(page.locator('#learning-next')).toHaveCount(0);
      await page.locator('#learning-check').click();
      await expect(page.locator('#learning-next')).toBeVisible();
    });
