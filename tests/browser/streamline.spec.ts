import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { initialState } from '../../src/state.ts';
import {
  active,
  newLearning,
  reduceLearning,
  type LearningState,
} from '../../src/learning/storage.ts';
import { profileIds, type ProfileId } from '../../src/learning/profiles.ts';
import { tasksFor } from '../../src/learning/tasks.ts';
import { answers } from '../learning-oracles.ts';
import { topicAnswers } from '../topic-oracles.ts';
import { evidencePath } from './artifacts.ts';
const key = 'afrika-2040:kenia-bus:v2a';
const op = (s: LearningState, op: any, value?: string, field?: string) =>
  reduceLearning(s, { type: 'learning', op, value, field });
function fixture(unit: any, profile: ProfileId, target: string) {
  let s = op(newLearning(), 'recommend', profile, unit);
  for (let i = 0; i < 60; i++) {
    const t = active(s)!.task;
    if (t.id === target) return s;
    for (const id of t.simulation?.required ?? []) s = op(s, 'simulate', id);
    const values = ['a', 'n', 'd', 'e'].includes(unit)
      ? topicAnswers(t, 'cool')
      : answers(t);
    for (const f of t.fields) s = op(s, 'answer', values[f.id], f.id);
    s = op(s, 'check');
    s = op(s, 'next');
  }
  throw Error(target);
}
const get = (page: Page) =>
  page.evaluate(
    (key) => JSON.parse(sessionStorage.getItem(key)!).learning,
    key,
  );
async function seed(page: Page, s: LearningState) {
  await page.goto('/');
  await page.evaluate(
    ({ key, s }) => sessionStorage.setItem(key, JSON.stringify(s)),
    { key, s: { ...initialState(), screen: 'learning', learning: s } },
  );
  await page.reload();
}
async function choose(page: Page, field: string, value: string) {
  const el = page.locator('#learn-' + field);
  if (await el.evaluate((e) => e.tagName === 'FIELDSET'))
    await page
      .locator(`input[data-field="${field}"][value="${value}"]`)
      .press('Space');
  else {
    await el.focus();
    await el.selectOption(value);
  }
}
for (const profile of profileIds)
  for (const unit of ['s3', 's5'] as const)
    test(`Afrika curriculum streamline ${unit}/${profile}: true and false proof, two failures, explicit help, return and reload`, async ({
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
      const prefix = unit === 's3' ? 'cocoa.final' : 'water.final';
      const choices =
        unit === 's3' ? ['quality', 'process'] : ['repair', 'tech'];
      for (const plan of choices) {
        await seed(page, fixture(unit, profile, prefix + '.choice'));
        await choose(page, 'plan', plan);
        await page.locator('#learning-check').tap();
        await page.locator('#learning-next').tap();
        const other = choices.find((x) => x !== plan)!;
        const combined = active(await get(page))!.task.fields.length === 2;
        await choose(page, 'evidence', other);
        if (combined) await choose(page, 'limit', plan);
        await page.locator('#learning-check').tap();
        await expect(page.locator('[data-learning-feedback]')).toHaveClass(
          combined ? /partial/ : /incorrect/,
        );
        if (combined)
          await expect(page.locator('[data-finding="correct"]')).toContainText(
            'Diese Angabe passt',
          );
        expect(active(await get(page))!.attempt!.failures).toBe(1);
        await page.locator('#learning-check').tap();
        await expect(page.locator('[data-learning-feedback]')).toHaveClass(
          /hint/,
        );
        expect(active(await get(page))!.attempt!.failures).toBe(2);
        expect(active(await get(page))!.attempt!.exampleUsed).toBe(false);
        await expect(page.locator('#learning-adopt')).toBeVisible();
        await page.locator('#learning-adopt').tap();
        expect(active(await get(page))!.attempt!.exampleUsed).toBe(true);
        if (!combined) {
          await page.locator('#learning-next').tap();
        }
        const acceptedLimit =
          unit === 's5' && plan === 'tech' ? 'repair' : plan;
        await choose(page, 'limit', acceptedLimit);
        await page.locator('#learning-check').tap();
        await expect(page.locator('[data-learning-feedback]')).toHaveClass(
          /correct/,
        );
        const saved = active(await get(page))!.attempt!;
        await page.reload();
        expect(active(await get(page))!.attempt!.answers).toEqual(
          saved.answers,
        );
        await expect(page.locator('#learning-next')).toBeVisible();
        await page.locator('[data-op="back"]').first().tap();
        await page.locator('#learning-next').tap();
        expect(active(await get(page))!.attempt!.answers).toEqual(
          saved.answers,
        );
        await page.screenshot({
          path: evidencePath(
            `streamline-${unit}-${profile}-${plan}-${browserName}.png`,
          ),
          fullPage: true,
        });
        await page.locator('#learning-next').tap();
        await choose(page, 'weight', 'benefit');
        await page.locator('#learning-check').tap();
        await expect(page.locator('[data-learning-feedback]')).toHaveClass(
          /neutral/,
        );
        if (plan === 'process') {
          const label = page
            .locator('label')
            .filter({ has: page.locator('input[value="benefit"]') });
          await expect(label).toContainText('mehr eigene Verarbeitung');
          await expect(label).toContainText('75 GE');
        }
      }
      expect(errors).toEqual([]);
      await context.close();
    });
for (const profile of profileIds)
  test(`Afrika curriculum streamline chain ${profile}: stable touch workspace, own progress, hints and keyboard`, async ({
    browser,
    browserName,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 1024, height: 768 },
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.goto('/?lernweg=' + profile + '&bereich=s3');
    await expect(page.locator('.learning-process li')).toHaveCount(4);
    await expect(page.locator('.learning-process')).not.toContainText(
      /Rösten|Kakaomasse|Presskuchen/,
    );
    await choose(page, 'step', 'beans');
    await page.locator('#learning-check').tap();
    await expect(page.locator('[data-learning-feedback]')).toHaveClass(
      /correct/,
    );
    await expect(page.locator('[data-learning-feedback]')).not.toContainText(
      'Kakaomasse',
    );
    await page.locator('#learning-next').tap();
    await expect(page.locator('#learning-title')).toBeFocused();
    await expect(page.locator('#learning-title')).toBeInViewport();
    await expect(page.locator('.learning-process li').first()).toContainText(
      'Getrocknete Bohnen',
    );
    const standard = ['foerder', 'esa'].includes(profile);
    if (standard)
      await expect(page.locator('.learning-scaffold')).toContainText(
        active(await get(page))!.task.hints[0],
      );
    for (let h = standard ? 2 : 1; h <= 3; h++) {
      await page.locator('#learning-help').press('Enter');
      await expect(page.locator('#learning-help-title')).toHaveText(
        `Hilfe ${h} von 3`,
      );
    }
    expect(active(await get(page))!.attempt!.exampleUsed).toBe(false);
    await page.locator('#learning-adopt').press('Enter');
    await page.locator('#learning-next').press('Enter');
    await expect(page.locator('.learning-process li').nth(1)).toContainText(
      'Beispiel genutzt',
    );
    const before = await get(page);
    await page.reload();
    expect((await get(page)).records).toEqual(before.records);
    await page.locator('[data-op="back"]').first().press('Enter');
    await expect(page.locator('#learning-next')).toBeVisible();
    await page.screenshot({
      path: evidencePath(`streamline-chain-${profile}-${browserName}.png`),
      fullPage: true,
    });
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
    await context.close();
  });
for (const profile of ['foerder', 'esa', 'msa', 'ahr'] as const)
  test(`Afrika curriculum streamline comparison ${profile}: costs accessible, photo pair and no horizontal overflow`, async ({
    page,
    browserName,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/?lernweg=' + profile + '&bereich=e');
    await expect(page.locator('.inquiry-material')).toContainText('80 GE');
    await expect(page.locator('.inquiry-material')).toContainText('12 GE');
    await expect(page.locator('.inquiry-material')).toContainText('Monatlich');
    await page.screenshot({
      path: evidencePath(`streamline-future-${profile}-${browserName}.png`),
      fullPage: true,
    });
    if (profile !== 'foerder') {
      const t = tasksFor('a', profile).find((t) => t.focus?.comparePictures)!;
      await seed(page, fixture('a', profile, t.id));
      await expect(page.locator('.learning-photo-pair img')).toHaveCount(2);
      const boxes = await page
        .locator('.learning-photo-pair img')
        .evaluateAll((es) =>
          es.map((e) => {
            const r = e.getBoundingClientRect();
            return { x: r.x, y: r.y, width: r.width, height: r.height };
          }),
        );
      expect(boxes[0].y).toBe(boxes[1].y);
      expect(boxes[1].x).toBeGreaterThan(boxes[0].x);
      await page.screenshot({
        path: evidencePath(`streamline-photos-${profile}-${browserName}.png`),
        fullPage: true,
      });
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
const old = JSON.parse(
  readFileSync(
    new URL('../fixtures/streamline-3499de6-saves.json', import.meta.url),
    'utf8',
  ),
);
for (const raw of old)
  test(`Afrika curriculum streamline old save ${raw.unit}/${raw.profile}: journal, current task and archived records after reload`, async ({
    page,
    browserName,
  }) => {
    await seed(page, raw);
    await expect(page.locator('h1')).toContainText('Lernjournal');
    const saved = await get(page);
    const key = Object.keys(raw.records)[0];
    for (const [id, a] of Object.entries(raw.records[key].attempts))
      expect(saved.records[key].attempts[id]).toEqual(a);
    await page.reload();
    expect((await get(page)).records).toEqual(saved.records);
    await expect(page.locator('.journal-record article')).toHaveCount(
      Object.keys(raw.records[key].attempts).length,
    );
    writeFileSync(
      evidencePath(
        `streamline-old-${raw.unit}-${raw.profile}-${browserName}.json`,
      ),
      JSON.stringify(saved),
    );
  });

for (const profile of profileIds)
  test(`Afrika curriculum streamline keyboard ${profile}: select with arrows, tab to check, Enter and reload`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/?lernweg=' + profile + '&bereich=e');
    const select = page.locator('#learn-reach');
    await select.focus();
    await select.press('Home');
    const options = await select
      .locator('option')
      .evaluateAll((es) => es.map((e) => (e as HTMLOptionElement).value));
    for (let i = 0; i < options.indexOf('shade'); i++)
      await select.press('ArrowDown');
    await select.press('Tab');
    await expect(select).toHaveValue('shade');
    await expect(page.locator('#learning-check')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-learning-feedback]')).toHaveClass(
      /correct/,
    );
    const before = active(await get(page))!;
    expect(before.attempt!.answers.reach).toBe('shade');
    await page.reload();
    expect(active(await get(page))!.attempt!.answers).toEqual(
      before.attempt!.answers,
    );
    expect((await get(page)).profile).toBe(profile);
    await expect(page.locator('#learning-next')).toBeVisible();
  });
