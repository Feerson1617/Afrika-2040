import { test, expect, type Page } from '@playwright/test';
import { initialState } from '../../src/state.ts';
import {
  active,
  newLearning,
  reduceLearning,
  type LearningState,
} from '../../src/learning/storage.ts';
import { type Unit } from '../../src/learning/catalog.ts';
import { profileIds, type ProfileId } from '../../src/learning/profiles.ts';
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
function fixture(unit: Unit, profile: ProfileId, target: string) {
  let s = act(newLearning(), 'recommend', profile, unit);
  for (let i = 0; i < 70; i++) {
    const t = active(s)!.task;
    if (t.id === target) return s;
    for (const id of t.simulation?.required ?? []) s = act(s, 'simulate', id);
    const values = ['a', 'n', 'd', 'e'].includes(unit)
      ? topicAnswers(t, 'cool')
      : answers(t);
    for (const f of t.fields) s = act(s, 'answer', values[f.id], f.id);
    s = act(s, 'check');
    s = act(s, 'next');
  }
  throw Error('Target not reached: ' + target);
}
async function seed(page: Page, s: LearningState) {
  await page.goto('/');
  await page.evaluate(
    ({ key, s }) => sessionStorage.setItem(key, JSON.stringify(s)),
    { key, s: { ...initialState(), screen: 'learning', learning: s } },
  );
  await page.reload();
}
const get = (page: Page) =>
  page.evaluate(
    (key) => JSON.parse(sessionStorage.getItem(key)!).learning,
    key,
  );
test('Afrika curriculum language P2-01 ESA context survives both split steps, reload and back', async ({
  browser,
  browserName,
}) => {
  const ctx = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await seed(page, fixture('a', 'esa', 'image.headline.evidence'));
  for (const [id, value] of [
    ['evidence', 'built'],
    ['revision', 'places'],
  ]) {
    await expect(page.locator('.learning-context')).toHaveText(
      'Eine erfundene Schulzeitung schreibt: „Afrika ist nur unberührte Natur.“ Sie behauptet: Menschen haben dort nichts gebaut.',
    );
    await page.reload();
    await expect(page.locator('.learning-context')).toContainText(
      'Menschen haben dort nichts gebaut',
    );
    const el = page.locator('#learn-' + id);
    await el.selectOption(value);
    await page.locator('#learning-check').tap();
    await expect(page.locator('[data-learning-feedback]')).toHaveClass(
      /correct/,
    );
    if (id === 'evidence') await page.locator('#learning-next').tap();
  }
  await page.locator('[data-op="back"]').tap();
  await expect(page.locator('.learning-context')).toContainText(
    'Afrika ist nur unberührte Natur',
  );
  expect(active(await get(page))!.task.id).toBe('image.headline.evidence');
  expect(active(await get(page))!.attempt!.answers.evidence).toBe('built');
  await page.screenshot({
    path: evidencePath(`language-esa-photo-${browserName}.png`),
    fullPage: true,
  });
  await ctx.close();
});
test('Afrika curriculum language P2-02 AHR full help and deliberate adoption retain correct journey meaning', async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await seed(page, fixture('s2', 'ahr', 'demand.cause'));
  for (let h = 0; h < 3; h++)
    await page.locator('#learning-help').press('Enter');
  const help = page.locator('.help-panel');
  await expect(help).toContainText('insgesamt drei Fahrten pro Stunde');
  await expect(help).toContainText(
    'Jede Fahrt hat 10 Plätze. Zusammen gibt es 30 Plätze pro Stunde.',
  );
  await expect(help).toContainText('4 Minuten');
  await expect(help).toContainText('20 Plätze');
  expect(active(await get(page))!.attempt!.exampleUsed).toBe(false);
  await page.locator('#learning-adopt').press('Enter');
  const saved = active(await get(page))!.attempt!;
  expect(saved.answers.explanation).toContain('insgesamt drei Fahrten');
  expect(saved.factual).toBe('ungraded');
  expect(saved.exampleUsed).toBe(true);
  await page.reload();
  await expect(page.locator('#learn-explanation')).toHaveValue(
    saved.answers.explanation,
  );
  await page.screenshot({
    path: evidencePath(`language-ahr-bus-${browserName}.png`),
    fullPage: true,
  });
});
for (const p of profileIds)
  test(`Afrika curriculum language cocoa ${p}: processing comes first and full money data remain reachable`, async ({
    browser,
    browserName,
  }) => {
    const ctx = await browser.newContext({
      viewport: { width: 1024, height: 768 },
      hasTouch: true,
    });
    const page = await ctx.newPage();
    await seed(page, fixture('s3', p, 'cocoa.chain.beans'));
    await expect(page.locator('.learning-material-cards')).toBeVisible();
    await expect(page.locator('#learning-cocoa-money')).not.toHaveAttribute(
      'open',
      '',
    );
    await expect(page.locator('#learning-cocoa-money table')).not.toBeVisible();
    await page.locator('#learning-words > summary').tap();
    await expect(page.locator('#learning-words > p')).toHaveCount(2);
    await expect(page.locator('#learning-words > p').first()).toContainText(
      'Rohstoff',
    );
    await expect(page.locator('#learning-words > p').last()).toContainText(
      'Verarbeitung',
    );
    await page.locator('#learning-cocoa-money > summary').tap();
    await expect(page.locator('#learning-cocoa-money table')).toBeVisible();
    await expect(page.locator('#learning-cocoa-money')).toContainText('180');
    await expect(page.locator('#learning-cocoa-money')).toContainText('100');
    await page.locator('#learning-cocoa-money > summary').tap();
    if (p === 'foerder')
      await page.screenshot({
        path: evidencePath(`language-cocoa-${browserName}.png`),
        fullPage: true,
      });
    await ctx.close();
  });

for (const profile of profileIds)
  test(`Afrika curriculum editorial ${profile}: visible cocoa hints, honest saved text and no initial failure counter`, async ({
    browser,
    browserName,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 1024, height: 768 },
      hasTouch: true,
    });
    const page = await context.newPage();
    await seed(page, fixture('s3', profile, 'cocoa.chain.beans'));
    await expect(page.locator('.inquiry-task')).not.toContainText(
      'Wähle oder rechne selbst',
    );
    await expect(page.locator('.inquiry-task')).not.toContainText('0 von 2');
    await expect(page.locator('[data-learning-status]')).not.toContainText(
      'Du entscheidest, was dir wichtiger ist',
    );
    for (const [i, value] of ['beans', 'roast', 'mass', 'press'].entries()) {
      const hint = [
        'Womit beginnt die Verarbeitung?',
        'Was passiert mit den getrockneten Bohnen?',
        'Was entsteht nach dem Rösten und Mahlen?',
        'Was geschieht beim Pressen der Kakaomasse?',
      ][i];
      if (profile === 'foerder' || profile === 'esa') {
        await expect(page.locator('.learning-scaffold')).toContainText(hint);
        await page.locator('#learning-help').tap();
        await expect(page.locator('.help-panel')).toContainText(
          'Hilfe 2 von 3',
        );
        await expect(page.locator('.help-panel')).toContainText(
          'Rösten und Mahlen verändern die Bohnen',
        );
      } else {
        await page.locator('#learning-help').tap();
        await expect(page.locator('.help-panel')).toContainText(hint);
      }
      expect(active(await get(page))!.attempt!.exampleUsed).toBe(false);
      await page.locator('#learn-step').selectOption(value);
      await page.locator('#learning-check').press('Enter');
      await expect(page.locator('[data-learning-feedback]')).toHaveClass(
        /correct/,
      );
      await page.reload();
      await expect(page.locator('#learn-step')).toHaveValue(value);
      if (i === 2)
        await page.screenshot({
          path: evidencePath(`editorial-cocoa-${profile}-${browserName}.png`),
          fullPage: true,
        });
      await page.locator('#learning-next').tap();
    }
    await page.locator('[data-op="back"]').tap();
    await expect(page.locator('#learn-step')).toHaveValue('press');
    expect(active(await get(page))!.attempt!.failures).toBe(0);
    await context.close();
  });
test('Afrika curriculum editorial AHR save button, oral self report, self control, historical text and keyboard', async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await seed(page, fixture('s4', 'ahr', 'share.perspective'));
  await expect(page.locator('#learning-check')).toHaveAccessibleName(
    'Antwort speichern',
  );
  await expect(page.locator('.inquiry-task')).toContainText(
    'Die App kann deinen eigenen Text nicht fachlich prüfen.',
  );
  await expect(
    page.getByLabel(
      'Ich möchte meine Antwort mündlich geben. Die App kann das nicht prüfen.',
    ),
  ).not.toBeChecked();
  const original =
    'Mein alter eigener Text: Ich möchte die Pläne erst besprechen.';
  await page.locator('#learn-explanation').fill(original);
  await page.locator('#learning-check').press('Enter');
  const first = active(await get(page))!.attempt!;
  expect(first.factual).toBe('ungraded');
  expect(first.failures).toBe(0);
  await expect(page.locator('[data-learning-feedback]')).toHaveClass(/neutral/);
  await page.locator('#learning-criteria').press('Enter');
  await expect(page.locator('.learning-criteria')).toContainText(
    'ersten und zweiten Plan',
  );
  for (let h = 0; h < 3; h++)
    await page.locator('#learning-help').press('Enter');
  expect(active(await get(page))!.attempt!.exampleUsed).toBe(false);
  await expect(page.locator('#learning-adopt')).toHaveAccessibleName(
    'Beispiel als Antwort übernehmen',
  );
  await page.locator('#learning-adopt').press('Enter');
  await page.reload();
  const adopted = active(await get(page))!.attempt!;
  expect(adopted.exampleUsed).toBe(true);
  expect(adopted.factual).toBe('ungraded');
  expect(
    adopted.submissions.some((s) => s.answers.explanation === original),
  ).toBe(true);
  await page.locator('[data-op="journal"]').press('Enter');
  await expect(page.locator('.journal-record')).toContainText(
    'Die App kann nicht prüfen',
  );
  await expect(page.locator('.journal-record')).toContainText(original);
  await page.screenshot({
    path: evidencePath(`editorial-journal-${browserName}.png`),
    fullPage: true,
  });
});
