import { test, expect, type Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { tasksFor } from '../../src/learning/tasks.ts';
import type { ProfileId } from '../../src/learning/profiles.ts';
import type { Unit } from '../../src/learning/catalog.ts';
import { topicAnswers } from '../topic-oracles.ts';
import { evidencePath } from './artifacts.ts';

const root = 'http://127.0.0.1:4174/Afrika-2040/';
const key = 'afrika-2040:kenia-bus:v2a';
const panels = (page: Page) => page.locator('.inquiry-material details');
const snapshot = (page: Page) =>
  panels(page).evaluateAll((els) =>
    els.map((el) => ({
      id: el.id,
      summary: el.querySelector(':scope > summary')!.textContent,
      open: (el as HTMLDetailsElement).open,
    })),
  );
const saved = (page: Page) =>
  page.evaluate(
    (key) => JSON.parse(sessionStorage.getItem(key)!).learning,
    key,
  );

// All preceding tasks are answered with visible controls. No target or answer
// state is injected into sessionStorage. Fixed topic oracles are independent of grading.
async function reach(
  page: Page,
  unit: Unit,
  profile: ProfileId,
  target: string,
) {
  const visited: string[] = [];
  for (const task of tasksFor(unit, profile)) {
    await expect(page.locator('h1')).toHaveText(task.title);
    visited.push(task.id);
    if (task.id === target) return visited;
    const values = topicAnswers(task, 'cool');
    for (const field of task.fields) {
      const input = page.locator('#learn-' + field.id);
      if (field.kind !== 'choice') await input.fill(values[field.id]);
      else if (await input.evaluate((el) => el.tagName === 'FIELDSET'))
        await page
          .locator(
            `input[data-field="${field.id}"][value="${values[field.id]}"]`,
          )
          .check();
      else await input.selectOption(values[field.id]);
    }
    await page.locator('#learning-check').tap();
    await expect(page.locator('#learning-next')).toBeVisible();
    await page.locator('#learning-next').tap();
  }
  throw Error('Target not reached: ' + target);
}
async function mixed(page: Page, reverse = false) {
  const all = panels(page);
  expect(await all.count()).toBeGreaterThan(1);
  for (let i = 0; i < (await all.count()); i++)
    if (!(await all.nth(i).evaluate((el: HTMLDetailsElement) => el.open)))
      await all.nth(i).locator(':scope > summary').tap();
  // A closed parent can intentionally retain an open nested source. Exercise
  // this independently of the visible parent-open / nested-closed back case.
  await all
    .nth(reverse ? 0 : (await all.count()) - 1)
    .locator(':scope > summary')
    .tap();
  return snapshot(page);
}
const targets = [
  ['e', 'future.judgment', 'msa'],
  ['e', 'future.judgment', 'ahr'],
  ['a', 'image.perspective', 'ahr'],
  ['d', 'economy.source-claim.v1', 'ahr'],
  ['n', 'nature.recommend', 'ahr'],
] as const;
test('Afrika curriculum N1 anonymous live material panel keeps both choices across independent reloads', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(`${root}?lernweg=msa&bereich=o`);
  const panel = panels(page).first();
  expect(await panel.getAttribute('id')).toBeNull();
  const original = await snapshot(page);
  await panel.locator(':scope > summary').tap();
  const open = await snapshot(page);
  expect(open[0].open).toBe(true);
  await page.reload();
  expect(await snapshot(page)).toEqual(open);
  await panel.locator(':scope > summary').tap();
  await page.reload();
  expect(await snapshot(page)).toEqual(original);
  await context.close();
});
test('Afrika curriculum N1 profile isolation, reset cancellation and confirmed session reset', async ({
  browser,
  browserName,
}) => {
  test.setTimeout(120000);
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    hasTouch: true,
  });
  const page = await context.newPage();
  const target = 'future.judgment';
  await page.goto(`${root}?lernweg=msa&bereich=e`);
  await reach(page, 'e', 'msa', target);
  const msa = await mixed(page);
  await page.locator('#learn-explanation').fill('Meine eigene MSA-Überlegung.');
  await page.locator('#learning-check').tap();
  const history = (await saved(page)).records['e.msa.v1'].attempts[target]
    .submissions;
  async function change(profile: ProfileId) {
    await page.locator('[data-op="profiles"]').tap();
    await page
      .locator(`[data-op="request-profile"][data-value="${profile}"]`)
      .tap();
    await page.locator('[data-op="confirm-profile"]').tap();
  }
  await change('ahr');
  await reach(page, 'e', 'ahr', target);
  expect((await snapshot(page)).every((d) => !d.open)).toBe(true);
  const ahr = await mixed(page, true);
  await change('msa');
  expect((await saved(page)).profile).toBe('msa');
  expect(await snapshot(page)).toEqual(msa);
  await expect(page.locator('#learn-explanation')).toHaveValue(
    'Meine eigene MSA-Überlegung.',
  );
  expect(
    (await saved(page)).records['e.msa.v1'].attempts[target].submissions,
  ).toEqual(history);
  await change('ahr');
  await page.reload();
  expect(await snapshot(page)).toEqual(ahr);
  await page.locator('[data-op="ask-reset"]').tap();
  await page.locator('[data-action="cancel-restart"]').tap();
  expect(await snapshot(page)).toEqual(ahr);
  await page.locator('[data-op="ask-reset"]').tap();
  await page.locator('[data-action="restart"]').tap();
  expect(
    await page.evaluate((key) => sessionStorage.getItem(key), key),
  ).toBeNull();
  await page.goto(`${root}?lernweg=msa&bereich=e`);
  await reach(page, 'e', 'msa', target);
  expect((await snapshot(page)).every((d) => !d.open)).toBe(true);
  await expect(page.locator('#learn-explanation')).toHaveValue('');
  const fresh = (await saved(page)).records['e.msa.v1'].attempts[target];
  expect(fresh.submissions).toEqual([]);
  expect(fresh.materialPanels).toBeUndefined();
  await page.screenshot({
    path: evidencePath(`N1-reset-${browserName}.png`),
    fullPage: true,
  });
  await context.close();
});
test('Afrika curriculum N1 blocked storage: in-memory panels, answers, back and warning stay usable', async ({
  browser,
  browserName,
}) => {
  test.setTimeout(120000);
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    hasTouch: true,
  });
  await context.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage blocked', 'QuotaExceededError');
    };
  });
  const page = await context.newPage();
  await page.goto(`${root}?lernweg=msa&bereich=e`);
  await reach(page, 'e', 'msa', 'future.judgment');
  const chosen = await mixed(page);
  await page
    .locator('#learn-explanation')
    .fill('Meine Antwort bleibt in diesem geöffneten Tab.');
  await page.locator('#learning-check').tap();
  await expect(page.locator('[data-learning-feedback]')).toHaveClass(/neutral/);
  await page.locator('[data-op="back"]').tap();
  await page.locator('#learning-next').tap();
  expect(await snapshot(page)).toEqual(chosen);
  await expect(page.locator('#learn-explanation')).toHaveValue(
    'Meine Antwort bleibt in diesem geöffneten Tab.',
  );
  await expect(page.locator('#storage-warning')).toBeVisible();
  await expect(page.locator('#storage-warning')).toContainText(
    'Beim Neuladen können deine Antworten verloren gehen',
  );
  await page.screenshot({
    path: evidencePath(`N1-blocked-${browserName}.png`),
    fullPage: true,
  });
  await context.close();
});
for (const [unit, target, profile] of targets)
  for (const viewport of [
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
  ])
    test(`Afrika curriculum N1 return ${target}/${profile} ${viewport.width}x${viewport.height}: normal path, mixed panels, writing, back and separate reload`, async ({
      browser,
      browserName,
    }) => {
      test.setTimeout(120000);
      const context = await browser.newContext({ viewport, hasTouch: true });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(`${root}?lernweg=${profile}&bereich=${unit}`);
      const visited = await reach(page, unit, profile, target);
      const input = page.locator('#learn-explanation');
      await mixed(page);
      await input.fill('Meine erste Überlegung.');
      await page.locator('#learning-check').tap();
      const record = (await saved(page)).records[`${unit}.${profile}.v1`];
      const history = record.attempts[target].submissions;
      expect(history).toHaveLength(1);
      const before = await mixed(page);
      await input.tap();
      await input.press('Home');
      for (let i = 0; i < 8; i++) await input.press('ArrowRight');
      const position = await input.evaluate((el: HTMLTextAreaElement) => ({
        caret: el.selectionStart,
        scroll: window.scrollY,
      }));
      for (const word of [' Hier', ' denke', ' ich', ' weiter']) {
        await page.keyboard.insertText(word);
        expect(await snapshot(page)).toEqual(before);
        await expect(input).toBeFocused();
      }
      expect(
        await input.evaluate((el: HTMLTextAreaElement) => el.selectionStart),
      ).toBe(position.caret + ' Hier denke ich weiter'.length);
      expect(
        Math.abs((await page.evaluate(() => scrollY)) - position.scroll),
      ).toBeLessThanOrEqual(2);
      const text = await input.inputValue();
      const name = `N1-return-${target}-${profile}-${viewport.width}-${browserName}`;
      await page.screenshot({
        path: evidencePath(name + '-before-back.png'),
        fullPage: true,
      });
      await page.locator('[data-op="back"]').tap();
      const otherTask = await mixed(page, true);
      await page.locator('#learning-next').tap();
      const afterBack = await snapshot(page);
      expect
        .soft(
          afterBack,
          'return must restore this task, not the intervening task',
        )
        .toEqual(before);
      await expect(input).toHaveValue(text);
      expect(
        (await saved(page)).records[`${unit}.${profile}.v1`].attempts[target]
          .submissions,
      ).toEqual(history);
      await page.screenshot({
        path: evidencePath(name + '-after-back.png'),
        fullPage: true,
      });
      // Deliberately configure a DIFFERENT mixed state immediately before reload.
      const beforeReload = await mixed(page, true);
      expect(beforeReload.some((d) => d.open)).toBe(true);
      expect(beforeReload.some((d) => !d.open)).toBe(true);
      await page.reload();
      const afterReload = await snapshot(page);
      expect
        .soft(
          afterReload,
          'reload must restore the independently chosen mixed state',
        )
        .toEqual(beforeReload);
      await expect(input).toHaveValue(text);
      const restored = (await saved(page)).records[`${unit}.${profile}.v1`]
        .attempts[target];
      expect(restored.submissions).toEqual(history);
      expect(restored.factual).toBe('ungraded');
      expect(restored.exampleUsed).toBe(false);
      await page.screenshot({
        path: evidencePath(name + '-after-reload.png'),
        fullPage: true,
      });
      await page.locator('[data-op="back"]').tap();
      const afterOtherTask = await snapshot(page);
      expect
        .soft(afterOtherTask, 'the other task keeps its own panels')
        .toEqual(otherTask);
      expect(errors).toEqual([]);
      writeFileSync(
        evidencePath(name + '.json'),
        JSON.stringify(
          {
            target,
            profile,
            viewport,
            browserName,
            path: page.url(),
            visited,
            before,
            afterBack,
            otherTask,
            afterOtherTask,
            beforeReload,
            afterReload,
            text,
            history,
            restoredSubmissions: restored.submissions,
            errors,
          },
          null,
          2,
        ),
      );
      await context.close();
    });
