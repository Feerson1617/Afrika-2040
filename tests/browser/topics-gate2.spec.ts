import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { profileIds, profiles } from '../../src/learning/profiles.ts';
import { tasksFor } from '../../src/learning/tasks.ts';
import { active } from '../../src/learning/storage.ts';
import { topicAnswers } from '../topic-oracles.ts';
import { evidencePath } from './artifacts.ts';
import { writeFileSync } from 'node:fs';
const key = 'afrika-2040:kenia-bus:v2a';
async function choose(
  page: import('@playwright/test').Page,
  field: string,
  value: string,
) {
  const el = page.locator('#learn-' + field);
  if (await el.evaluate((el) => el.tagName === 'FIELDSET'))
    await page
      .locator(`input[data-field="${field}"][value="${value}"]`)
      .check();
  else await el.selectOption(value);
}

for (const unit of ['a', 'n', 'd', 'e'] as const)
  for (const profile of profileIds)
    for (const supported of [false, true])
      test(`Afrika curriculum Gate2 ${unit}/${profile} supported=${supported}: complete actual learning route`, async ({
        browser,
        browserName,
      }) => {
        const context = await browser.newContext({
          viewport: supported
            ? { width: 1024, height: 768 }
            : { width: 1366, height: 900 },
          hasTouch: supported,
        });
        const page = await context.newPage();
        const errors: string[] = [],
          external: string[] = [];
        page.on('pageerror', (e) => errors.push(e.message));
        page.on('request', (r) => {
          if (!r.url().startsWith('http://127.0.0.1:4173/'))
            external.push(r.url());
        });
        const state = () =>
          page.evaluate(
            (key) => JSON.parse(sessionStorage.getItem(key)!).learning,
            key,
          );
        const press = async (id: string) =>
          supported ? page.locator(id).tap() : page.locator(id).press('Enter');
        await page.goto(
          `http://127.0.0.1:4173/?lernweg=${profile}&bereich=${unit}`,
        );
        const tasks = tasksFor(unit, profile),
          plan = profile === 'msa' ? 'shade' : 'cool';
        for (const [index, rawTask] of tasks.entries()) {
          await expect(page.locator('h1')).toHaveText(rawTask.title);
          await expect(page.locator('.eyebrow')).toContainText(
            profiles[profile].name,
          );
          const before = await state();
          expect(before.profile).toBe(profile);
          expect(before.records[`${unit}.${profile}.v1`].index).toBe(index);
          const a = active(before)!;
          expect(a.attempt!.identity.profileId).toBe(profile);
          await expect(page.locator('aside.learning-scaffold')).toHaveCount(
            profiles[profile].standardHint ? 1 : 0,
          );
          if (index === 0) {
            await page.locator('#learning-words > summary').click();
            await expect(
              page.locator('#learning-words > p').first(),
            ).toBeVisible();
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
          }
          if (supported) {
            await press('#learning-help');
            await press('#learning-help');
            await press('#learning-help');
            expect(active(await state())!.attempt!.exampleUsed).toBe(false);
            await press('#learning-adopt');
          } else {
            const answers = topicAnswers(rawTask, plan);
            for (const f of rawTask.fields) {
              const el = page.locator('#learn-' + f.id);
              if (f.kind === 'choice') await choose(page, f.id, answers[f.id]);
              else await el.fill(answers[f.id]);
            }
            await press('#learning-check');
          }
          await expect(page.locator('#learning-next')).toBeVisible();
          const after = active(await state())!.attempt!;
          expect(after.exampleUsed).toBe(supported);
          if (rawTask.fields.some((f) => f.kind === 'text')) {
            expect(after.factual).toBe('ungraded');
            await expect(page.locator('[data-learning-feedback]')).toHaveClass(
              /neutral/,
            );
            await press('#learning-criteria');
            await expect(page.locator('.learning-criteria')).toBeVisible();
            if (!supported) {
              await page
                .locator('#learn-' + rawTask.fields[0].id)
                .fill(
                  topicAnswers(rawTask, plan)[rawTask.fields[0].id] +
                    ' Ich möchte das besprechen.',
                );
              await expect(page.locator('#learning-next')).toHaveCount(0);
              await press('#learning-check');
            }
          }
          if (rawTask.id === 'future.weight')
            await expect(page.locator('[data-learning-feedback]')).toHaveClass(
              /neutral/,
            );
          if (index === 1 || rawTask.id === 'future.weight') {
            await page.screenshot({
              path: evidencePath(
                `gate2-${unit}-${profile}-${browserName}-${supported ? 'supported' : 'regular'}.png`,
              ),
              fullPage: true,
            });
            await page.reload();
            await expect(page.locator('h1')).toHaveText(rawTask.title);
            expect((await state()).profile).toBe(profile);
            await expect(page.locator('#learning-next')).toBeVisible();
          }
          await press('#learning-next');
        }
        await expect(page.locator('h1')).toHaveText('Lernjournal · Lernwege');
        await expect(page.locator('.journal-record')).toContainText(
          unit === 'a'
            ? 'Bilder und Orte'
            : unit === 'n'
              ? 'Natur und Wasser'
              : unit === 'd'
                ? 'Wirtschaft'
                : 'Zukunft entscheiden',
        );
        const s = await state();
        expect(
          Object.keys(s.records[`${unit}.${profile}.v1`].attempts),
        ).toHaveLength(tasks.length);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        expect(errors).toEqual([]);
        expect(external).toEqual([]);
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
        writeFileSync(
          evidencePath(
            `gate2-${unit}-${profile}-${browserName}-${supported ? 'supported' : 'regular'}.json`,
          ),
          JSON.stringify(s, null, 2),
        );
        await context.close();
      });
test('Afrika curriculum Gate2 future wrong parts, goal conflict, full sources, plan change and historical wording', async ({
  page,
}) => {
  await page.goto('/?lernweg=esa&bereich=e');
  async function s() {
    return page.evaluate(
      (key) => JSON.parse(sessionStorage.getItem(key)!).learning,
      key,
    );
  }
  while (active(await s())!.task.id !== 'future.evidence') {
    const t = active(await s())!.task;
    for (const f of t.fields)
      await choose(page, f.id, topicAnswers(t, 'cool')[f.id]);
    await page.locator('#learning-check').click();
    await page.locator('#learning-next').click();
  }
  await choose(page, 'evidence', 'shade');
  await page.locator('#learning-check').click();
  await expect(page.locator('[data-learning-feedback]')).toHaveClass(
    /incorrect/,
  );
  await page.locator('#learning-check').click();
  await expect(page.locator('[data-learning-feedback]')).toHaveClass(/hint/);
  await expect(page.locator('#learning-adopt')).toBeVisible();
  expect(active(await s())!.attempt!.exampleUsed).toBe(false);
  await page.locator('#learning-adopt').click();
  await page.locator('#learning-next').click();
  await choose(page, 'limit', 'cool');
  await page.locator('#learning-check').click();
  await page.locator('#learning-next').click();
  await expect(page.locator('.learning-context')).toContainText(
    'vielen Ständen Zugang',
  );
  await choose(page, 'weight', 'tradeoff');
  await page.locator('#learning-check').click();
  await expect(page.locator('[data-learning-feedback]')).toHaveClass(/neutral/);
  const history = active(await s())!.attempt!.submissions;
  expect(history[0].labels!.weight).toContain('30 statt 60');
  await page.locator('[data-op="back"]').click();
  await page.locator('[data-op="back"]').click();
  await page.locator('[data-op="back"]').click();
  await expect(page.locator('#learn-plan')).toBeVisible();
  await choose(page, 'plan', 'shade');
  await page.locator('#learning-check').click();
  await page.locator('#learning-next').click();
  await expect(page.locator('#learning-next')).toHaveCount(0);
  await choose(page, 'evidence', 'shade');
  await page.locator('#learning-check').click();
  await page.locator('#learning-next').click();
  await expect(page.locator('#learning-next')).toHaveCount(0);
  await page.locator('[data-op="journal"]').click();
  await expect(page.locator('.journal-record')).toContainText('Zugang');
  const journal = page.locator('.journal-record article').filter({
    has: page.getByRole('heading', {
      name: 'Verbinde deine Wahl mit deinem Ziel.',
      exact: true,
    }),
  });
  await journal.locator('details > summary').first().click();
  await journal.locator('details details > summary').first().click();
  await expect(journal).toContainText('30 statt 60');
});
test('Afrika curriculum Gate2 explicit revision requires a new plan and new evidence; long statements stay visible with keyboard', async ({
  page,
  browserName,
}) => {
  await page.goto('/?lernweg=esa&bereich=e');
  const state = () =>
    page.evaluate(
      (key) => JSON.parse(sessionStorage.getItem(key)!).learning,
      key,
    );
  async function solveUntilRevision(plan: 'cool' | 'shade') {
    while (active(await state())!.task.id !== 'future.revision') {
      const t = active(await state())!.task;
      for (const f of t.fields)
        await choose(page, f.id, topicAnswers(t, plan)[f.id]);
      await page.locator('#learning-check').press('Enter');
      await page.locator('#learning-next').click();
    }
  }
  await solveUntilRevision('cool');
  await choose(page, 'revision', 'change');
  await page.locator('#learning-check').click();
  await expect(page.locator('#learning-next')).toHaveCount(0);
  await page.locator('#learning-revise').press('Enter');
  await expect(page.locator('#learn-plan')).toBeVisible();
  await choose(page, 'plan', 'shade');
  await page.locator('#learning-check').click();
  await page.locator('#learning-next').click();
  await expect(page.locator('#learning-next')).toHaveCount(0);
  await solveUntilRevision('shade');
  const radio = page.locator('input[data-field="revision"][value="keep"]');
  await radio.focus();
  await radio.press('Space');
  await expect(radio).toBeChecked();
  await expect(radio).toBeFocused();
  await page.locator('#learning-check').press('Enter');
  await expect(page.locator('#learning-next')).toBeVisible();
  await page.screenshot({
    path: evidencePath(`gate2-revision-${browserName}.png`),
    fullPage: true,
  });
  await page.locator('#learning-next').click();
  const s = await state();
  expect(s.records['e.esa.v1'].attempts['future.plan'].answers.plan).toBe(
    'shade',
  );
  expect(
    s.records['e.esa.v1'].attempts['future.evidence'].answers.evidence,
  ).toBe('shade');
});
