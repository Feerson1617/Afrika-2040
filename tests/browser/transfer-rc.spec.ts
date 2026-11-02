import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
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
const key = 'afrika-2040:kenia-bus:v2a',
  before = process.env.TRANSFER_BASELINE === '1';
const act = (
  s: LearningState,
  op: Parameters<typeof reduceLearning>[1]['op'],
  value?: string,
  field?: string,
) => reduceLearning(s, { type: 'learning', op, value, field });
function fixture(
  unit: 's2' | 's5' | 's6',
  profile: (typeof profileIds)[number],
) {
  let s = act(newLearning(), 'recommend', profile, unit);
  for (let i = 0; i < 60; i++) {
    const t = active(s)!.task;
    if (
      t.id.startsWith(
        unit === 's2'
          ? 'demand.transfer'
          : unit === 's5'
            ? 'water.transfer'
            : 'area.transfer',
      )
    )
      return s;
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
    for (const supported of before ? [false] : [false, true])
      test(`Afrika curriculum TransferRC ${before ? 'before' : 'after'} ${unit}/${profile} supported=${supported}`, async ({
        browser,
        browserName,
      }) => {
        test.setTimeout(60000);
        const context = await browser.newContext({
          viewport: {
            width: supported ? 1024 : 1366,
            height: supported ? 768 : 900,
          },
          hasTouch: supported,
        });
        const page = await context.newPage();
        const press = async (selector: string) =>
          supported
            ? page.locator(selector).tap()
            : page.locator(selector).press('Enter');
        const s = fixture(unit, profile);
        if (before && unit !== 's2')
          active(s)!.attempt!.simulationSelection =
            unit === 's5' ? 'repair' : 'extra';
        await seed(page, s);
        if (before) {
          const text = await page.locator('.inquiry-material').innerText();
          expect(text).toContain(
            unit === 's2' ? '24 Menschen' : unit === 's5' ? '80' : '20',
          );
          const current = active(await state(page))!;
          await fill(page, current.task, answers(current.task));
          await page.locator('#learning-check').click();
          await expect(page.locator('[data-learning-feedback]')).toHaveClass(
            /correct/,
          );
          const row = {
            unit,
            profile,
            engine: browserName,
            task: current.task.id,
            material: text,
            svg: (await page.locator('.inquiry-material svg').count())
              ? await page.locator('.inquiry-material svg').textContent()
              : null,
            answers: active(await state(page))!.attempt!.answers,
            status: active(await state(page))!.attempt!.factual,
          };
          const out = process.env.AFRIKA_EVIDENCE_DIR!;
          mkdirSync(out, { recursive: true });
          writeFileSync(
            join(out, `before-${unit}-${profile}-${browserName}.json`),
            JSON.stringify(row, null, 2),
          );
          writeFileSync(
            join(out, `before-state-${unit}-${profile}-${browserName}.json`),
            JSON.stringify(await state(page), null, 2),
          );
          await page.screenshot({
            path: evidencePath(`before-${unit}-${profile}-${browserName}.png`),
            fullPage: true,
          });
          await context.close();
          return;
        }
        // Current new case and explicit old comparison must never change the task or saved answer history.
        await expect(
          page.locator('[data-transfer-view="current"]'),
        ).toBeVisible();
        const values =
          unit === 's2'
            ? ['18', '20', '12']
            : unit === 's5'
              ? profile === 'foerder'
                ? ['70', '50', '20']
                : ['70', '50']
              : profile === 'foerder'
                ? ['45', '10', '55', '25']
                : ['45', '10', '60'];
        for (const value of values)
          await expect(
            page.locator('[data-transfer-view="current"]'),
          ).toContainText(value);
        if (unit === 's5')
          await expect(
            page.locator('[data-transfer-view="current"]'),
          ).not.toContainText('40 WE');
        await page.locator('#learning-check').press('Enter');
        expect(active(await state(page))!.attempt!.failures).toBe(0);
        await expect(page.locator('#learning-next')).toHaveCount(0);
        const t = active(await state(page))!.task;
        if (!supported) {
          const wrong = Object.fromEntries(
            t.fields.map((f) => [
              f.id,
              f.kind === 'integer'
                ? String(Number(f.expected) + 7)
                : f.options!.find(([id]) => id !== f.expected)![0],
            ]),
          );
          await fill(page, t, wrong);
          await press('#learning-check');
          await expect(page.locator('[data-learning-feedback]')).toHaveClass(
            /incorrect/,
          );
          await expect(page.locator('[data-learning-feedback]')).toHaveCSS(
            'background-color',
            'rgb(255, 240, 236)',
          );
          expect(active(await state(page))!.attempt!.failures).toBe(1);
        }
        if (supported) {
          const a = answers(t);
          const wrong = { ...a };
          const f = t.fields.at(-1)!;
          wrong[f.id] =
            f.kind === 'integer'
              ? String(Number(f.expected) + 1)
              : f.options!.find(([id]) => id !== f.expected)![0];
          await fill(page, t, wrong);
          await page.locator('#learning-check').click();
          await expect(page.locator('[data-learning-feedback]')).toHaveClass(
            t.fields.length > 1 ? /partial/ : /incorrect/,
          );
          await page.locator('#learning-check').click();
          await expect(page.locator('[data-learning-feedback]')).toHaveClass(
            /hint/,
          );
          expect(active(await state(page))!.attempt!.failures).toBe(2);
          for (let h = 0; h < 3; h++) await press('#learning-help');
          expect(active(await state(page))!.attempt!.exampleShown).toBe(true);
          expect(active(await state(page))!.attempt!.exampleUsed).toBe(false);
          await press('#learning-adopt');
          expect(active(await state(page))!.attempt!.exampleUsed).toBe(true);
        } else {
          await fill(page, t, answers(t));
          await page.locator('#learning-check').press('Enter');
          await expect(page.locator('[data-learning-feedback]')).toHaveClass(
            /correct/,
          );
        }
        await expect(page.locator('#learning-next')).toBeVisible();
        const saved = active(await state(page))!.attempt!;
        await press('[data-op="simulate"][data-value="comparison"]');
        await expect(
          page.locator('[data-transfer-view="comparison"]'),
        ).toBeVisible();
        await expect(page.locator('.inquiry-material')).toContainText(
          'Vergleich',
        );
        await page
          .locator('[data-op="simulate"][data-value="current"]')
          .press('Enter');
        await expect(
          page.locator('[data-transfer-view="current"]'),
        ).toBeVisible();
        expect(active(await state(page))!.attempt!.answers).toEqual(
          saved.answers,
        );
        expect(active(await state(page))!.attempt!.submissions).toEqual(
          saved.submissions,
        );
        if (unit === 's6') {
          const boxes = await page
            .locator('.inquiry-material svg text')
            .evaluateAll((nodes) =>
              nodes.map((n) => {
                const b = (n as SVGGraphicsElement).getBBox();
                return {
                  text: n.textContent,
                  x: b.x,
                  y: b.y,
                  right: b.x + b.width,
                  bottom: b.y + b.height,
                };
              }),
            );
          for (const box of boxes) {
            expect(box.x, box.text ?? '').toBeGreaterThanOrEqual(0);
            expect(box.right, box.text ?? '').toBeLessThanOrEqual(660);
            expect(box.bottom).toBeLessThanOrEqual(280);
          }
        }
        await page.reload();
        await expect(
          page.locator('[data-transfer-view="current"]'),
        ).toBeVisible();
        await expect(page.locator('#learning-next')).toBeVisible();
        expect(active(await state(page))!.attempt!.answers).toEqual(
          saved.answers,
        );
        if (profile === 'foerder')
          await page.screenshot({
            path: evidencePath(
              `after-${unit}-${profile}-${browserName}-${supported}.png`,
            ),
            fullPage: true,
          });
        await page.locator('[data-op="back"]').click();
        await page.locator('#learning-next').click();
        await expect(
          page.locator('[data-transfer-view="current"]'),
        ).toBeVisible();
        expect(active(await state(page))!.attempt!.answers).toEqual(
          saved.answers,
        );
        await page.locator('[data-op="journal"]').click();
        const article = page.locator('.journal-record article').filter({
          has: page.getByRole('heading', {
            level: 3,
            name: t.title,
            exact: true,
          }),
        });
        await expect(article).toHaveCount(1);
        await expect(article).toContainText('Richtig. Diese Angaben passen.');
        await article
          .locator('details')
          .first()
          .locator('summary')
          .first()
          .click();
        await expect(article).toContainText(
          `bewusst genutzt: ${supported ? 'ja' : 'nein'}`,
        );
        expect(
          (await state(page)).records[`${unit}.${profile}.v1`].attempts[t.id]
            .submissions,
        ).toEqual(saved.submissions);
        await context.close();
      });

if (!before) {
  const legacy = JSON.parse(
    readFileSync(
      new URL('../fixtures/transfer-5b825b1.json', import.meta.url),
      'utf8',
    ),
  ).states as LearningState[];
  for (const old of legacy)
    test(`Afrika curriculum TransferRC legacy ${old.unit}/${old.profile}: real old submission remains historical`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      await seed(page, old);
      const task = active(old)!.task,
        previous = active(old)!.attempt!;
      await expect(
        page.locator('[data-transfer-view="current"]'),
      ).toBeVisible();
      await expect(page.locator('[data-learning-feedback]')).toHaveClass(
        /correct/,
      );
      expect(active(await state(page))!.attempt).toEqual(previous);
      await page
        .locator('[data-op="simulate"][data-value="comparison"]')
        .press('Enter');
      await page.reload();
      await expect(
        page.locator('[data-transfer-view="comparison"]'),
      ).toBeVisible();
      expect(active(await state(page))!.attempt!.submissions).toEqual(
        previous.submissions,
      );
      await page
        .locator('[data-op="simulate"][data-value="current"]')
        .press('Enter');
      await page.locator('[data-op="journal"]').click();
      const article = page.locator('.journal-record article');
      await expect(article).toHaveCount(1);
      await expect(article).toContainText('Richtig. Diese Angaben passen.');
      await article
        .locator('details')
        .first()
        .locator('summary')
        .first()
        .click();
      await expect(article).toContainText(
        `${previous.submissions.length} gespeicherte Antworten`,
      );
      await expect(article).toContainText('bewusst genutzt: nein');
      expect(
        (await state(page)).records[`${old.unit}.${old.profile}.v1`].attempts[
          task.id
        ].submissions,
      ).toEqual(previous.submissions);
    });
  test('Afrika curriculum TransferRC original extra field: every SVG text stays inside at iPad landscape', async ({
    page,
    browserName,
  }) => {
    let s = act(newLearning(), 'recommend', 'foerder', 's6');
    const i = tasksFor('s6', 'foerder').findIndex((t) => t.id === 'area.total');
    expect(i).toBeGreaterThanOrEqual(0);
    s.records['s6.foerder.v1'].index = i;
    s = act(s, 'simulate', 'extra');
    await page.setViewportSize({ width: 1024, height: 768 });
    await seed(page, s);
    const texts = await page
      .locator('.inquiry-material svg text')
      .evaluateAll((ns) =>
        ns.map((n) => {
          const b = (n as SVGGraphicsElement).getBBox();
          return {
            text: n.textContent,
            x: b.x,
            right: b.x + b.width,
            bottom: b.y + b.height,
          };
        }),
      );
    expect(texts.some((t) => t.text === 'Zusatzfeld')).toBe(true);
    expect(texts.some((t) => t.text === '20 WE')).toBe(true);
    for (const t of texts) {
      expect(t.x, t.text ?? '').toBeGreaterThanOrEqual(0);
      expect(t.right, t.text ?? '').toBeLessThanOrEqual(660);
      expect(t.bottom, t.text ?? '').toBeLessThanOrEqual(280);
    }
    await page.screenshot({
      path: evidencePath(`original-extra-${browserName}.png`),
      fullPage: true,
    });
  });
}
