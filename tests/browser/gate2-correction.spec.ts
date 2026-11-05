import { test, expect, type Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { initialState } from '../../src/state.ts';
import {
  active,
  newLearning,
  reduceLearning,
  type LearningState,
} from '../../src/learning/storage.ts';
import { tasksFor } from '../../src/learning/tasks.ts';
import { profileIds, type ProfileId } from '../../src/learning/profiles.ts';
import { topicAnswers } from '../topic-oracles.ts';
import { evidencePath } from './artifacts.ts';
const key = 'afrika-2040:kenia-bus:v2a';
const act = (
  s: LearningState,
  op: Parameters<typeof reduceLearning>[1]['op'],
  value?: string,
  field?: string,
) => reduceLearning(s, { type: 'learning', op, value, field });
function fixture(
  profile: ProfileId,
  unit: 'a' | 'd' | 'e',
  target: string,
  plan: 'cool' | 'shade' = 'shade',
  goal = 'access',
  complete = false,
) {
  let s = act(newLearning(), 'recommend', profile, unit);
  for (let i = 0; i < 45 && s.view !== 'journal'; i++) {
    const t = active(s)!.task;
    if (!complete && t.id === target) return s;
    const values = {
      ...topicAnswers(t, plan),
      ...(t.id === 'future.goal' ? { goal } : {}),
    };
    for (const f of t.fields) s = act(s, 'answer', values[f.id], f.id);
    s = act(s, 'check');
    const next = act(s, 'next');
    if (active(next)?.task.id === t.id && next.view !== 'journal')
      throw Error('Fixture cannot advance ' + t.id);
    s = next;
  }
  s.view = 'task';
  s.records[`${unit}.${profile}.v1`].index = tasksFor(unit, profile).findIndex(
    (t) => t.id === target,
  );
  return s;
}
async function seed(page: Page, s: LearningState) {
  await page.goto('/?ansicht=bisher');
  await page.evaluate(
    ({ key, s }) => sessionStorage.setItem(key, JSON.stringify({ ...s })),
    { key, s: { ...initialState(), screen: 'learning', learning: s } },
  );
  await page.reload();
}
const state = (page: Page) =>
  page.evaluate(
    (key) => JSON.parse(sessionStorage.getItem(key)!).learning,
    key,
  );
async function choose(page: Page, field: string, value: string) {
  const loc = page.locator('#learn-' + field);
  if (await loc.evaluate((el) => el.tagName === 'FIELDSET'))
    await page
      .locator(`input[data-field="${field}"][value="${value}"]`)
      .check();
  else await loc.selectOption(value);
}
async function help(page: Page) {
  for (let i = 0; i < 3; i++) await page.locator('#learning-help').click();
}
for (const profile of profileIds)
  for (const plan of ['cool', 'shade'] as const)
    for (const goal of ['loss', 'access'])
      test(`Afrika curriculum Gate2 correction ${profile}/${plan}/${goal}: adoption, dependency, current status and historical proof`, async ({
        page,
        browserName,
      }) => {
        test.setTimeout(60000);
        await page.setViewportSize({ width: 1024, height: 768 });
        const s = fixture(profile, 'e', 'future.plan', plan, goal, true);
        await seed(page, s);
        const recordKey = `e.${profile}.v1`,
          original = (await state(page)).records[recordKey];
        await expect(page.locator('#learn-plan')).toHaveValue(plan);
        await help(page);
        await expect(page.locator('.help-panel')).toContainText(
          plan === 'shade'
            ? 'Deine Wahl bleibt: Schattendächer und Mehrwegkisten'
            : 'Deine Wahl bleibt: Gemeinsamer Kühlraum',
        );
        await page.locator('#learning-adopt').click();
        let current = await state(page);
        expect(
          current.records[recordKey].attempts['future.plan'].answers.plan,
        ).toBe(plan);
        expect(
          current.records[recordKey].attempts['future.plan'].exampleUsed,
        ).toBe(false);
        expect(
          current.records[recordKey].attempts['future.plan'].submissions,
        ).toEqual(original.attempts['future.plan'].submissions);
        await expect(page.locator('[data-learning-feedback]')).toHaveClass(
          /neutral/,
        );
        await expect(page.locator('#learning-next')).toBeVisible();
        const changed = plan === 'cool' ? 'shade' : 'cool';
        await choose(page, 'plan', changed);
        await page.locator('#learning-check').press('Enter');
        await page.locator('#learning-next').click();
        await expect(page.locator('h1')).toHaveText(
          'Welche Angabe aus dem Material passt zu deinem Vorschlag?',
        );
        await expect(page.locator('#learning-next')).toHaveCount(0);
        await expect(page.locator('[data-learning-status]')).not.toContainText(
          'Richtig. Diese Angaben passen.',
        );
        current = await state(page);
        const evidence = current.records[recordKey].attempts['future.evidence'];
        expect(evidence.process).toBe('draft');
        expect(evidence.factual).toBe('ungraded');
        expect(evidence.answers.evidence).toBe(plan);
        expect(evidence.submissions).toEqual(
          original.attempts['future.evidence'].submissions,
        );
        await page.locator('#learning-check').click();
        await expect(page.locator('[data-learning-feedback]')).toHaveClass(
          /incorrect/,
        );
        await expect(page.locator('[data-learning-feedback]')).toHaveCSS(
          'background-color',
          'rgb(255, 240, 236)',
        );
        await expect(page.locator('#learning-next')).toHaveCount(0);
        await page.locator('#learning-check').click();
        await expect(page.locator('[data-learning-feedback]')).toHaveClass(
          /hint/,
        );
        await expect(page.locator('[data-learning-feedback]')).toHaveCSS(
          'background-color',
          'rgb(255, 247, 218)',
        );
        await page.locator('#learning-adopt').click();
        current = await state(page);
        const adopted = current.records[recordKey].attempts['future.evidence'];
        expect(adopted.answers.evidence).toBe(changed);
        expect(adopted.exampleUsed).toBe(true);
        expect(adopted.submissions[0].contextPlan).toBe(plan);
        expect(adopted.submissions.at(-1).contextPlan).toBe(changed);
        expect(adopted.submissions.at(-1).support).toBe('example');
        await page.locator('#learning-next').click();
        await expect(page.locator('#learning-next')).toHaveCount(0);
        await help(page);
        await page.locator('#learning-adopt').click();
        await page.locator('#learning-next').click();
        await expect(page.locator('h1')).toHaveText(
          'Verbinde deine Wahl mit deinem Ziel.',
        );
        await expect(page.locator('#learning-next')).toHaveCount(0);
        await choose(page, 'weight', 'adapt');
        await page.locator('#learning-check').click();
        await expect(page.locator('[data-learning-feedback]')).toHaveClass(
          /neutral/,
        );
        // Reopening goal invalidates only connected judgments, not already matching factual evidence.
        for (let i = 0; i < 4; i++)
          await page.locator('[data-op="back"]').click();
        await expect(page.locator('h1')).toHaveText(
          'Was ist dir zuerst besonders wichtig?',
        );
        await choose(page, 'goal', goal === 'loss' ? 'access' : 'loss');
        await page.locator('#learning-check').click();
        current = await state(page);
        expect(
          current.records[recordKey].attempts['future.weight'].process,
        ).toBe('draft');
        expect(
          current.records[recordKey].attempts['future.evidence'].factual,
        ).toBe('correct');
        for (let i = 0; i < 4; i++)
          await page.locator('#learning-next').click();
        await expect(page.locator('h1')).toHaveText(
          'Verbinde deine Wahl mit deinem Ziel.',
        );
        await expect(page.locator('#learning-next')).toHaveCount(0);
        await choose(page, 'weight', 'tradeoff');
        await page.locator('#learning-check').click();
        await expect(page.locator('[data-learning-feedback]')).toHaveClass(
          /neutral/,
        );
        if (profile === 'msa' || profile === 'ahr')
          expect(
            (await state(page)).records[recordKey].attempts['future.judgment']
              .answers,
          ).toEqual(original.attempts['future.judgment'].answers);
        await page.locator('[data-op="journal"]').click();
        const article = page.locator('.journal-record article').filter({
          has: page.getByRole('heading', {
            name: 'Welche Angabe aus dem Material passt zu deinem Vorschlag?',
            exact: true,
          }),
        });
        await article.locator('details > summary').first().click();
        await article.locator('details details > summary').first().click();
        await expect(article).toContainText(
          original.attempts['future.evidence'].submissions[0].labels.evidence,
        );
        if (profile === 'foerder' && plan === 'shade' && goal === 'access')
          await page.screenshot({
            path: evidencePath(
              `correction-decision-history-${browserName}.png`,
            ),
            fullPage: true,
          });
        await page.reload();
        const restored = await state(page);
        expect(restored.profile).toBe(profile);
        expect(
          restored.records[recordKey].attempts['future.evidence'].submissions[0]
            .contextPlan,
        ).toBe(plan);
        if (profile === 'foerder' && plan === 'shade' && goal === 'access')
          writeFileSync(
            evidencePath(`correction-decision-${browserName}.json`),
            JSON.stringify(restored, null, 2),
          );
      });
for (const profile of profileIds)
  test(`Afrika curriculum Gate2 correction initial ${profile}: no silent replacement or new example provenance`, async ({
    page,
  }) => {
    for (const idea of ['nature', 'cities', 'uncertain']) {
      await seed(page, fixture(profile, 'a', 'image.initial'));
      await choose(page, 'idea', idea);
      await page.locator('#learning-check').click();
      const before = active(await state(page))!.attempt!;
      await help(page);
      await page.locator('#learning-adopt').click();
      await expect(page.locator('#learn-idea')).toHaveValue(idea);
      await expect(page.locator('[data-learning-feedback]')).toHaveClass(
        /neutral/,
      );
      const after = active(await state(page))!.attempt!;
      expect(after.exampleUsed).toBe(false);
      expect(after.submissions).toEqual(before.submissions);
    }
  });
test('Afrika curriculum Gate2 correction economics: explicit lower claim, full glossary and new AHR application', async ({
  page,
  browserName,
}) => {
  for (const profile of ['foerder', 'esa'] as const) {
    await seed(page, fixture(profile, 'd', 'economy.transfer.cause'));
    await expect(page.locator('h1')).toContainText(
      'Mehr Menschen haben Zugang zu Strom',
    );
    await expect(page.locator('h1')).not.toContainText('damit');
    const text = await page
      .locator('.inquiry-material')
      .evaluate((el) => (el as HTMLElement).innerText);
    expect(text).toContain('85,1');
    expect(text).toContain('89,5');
    expect(text).not.toMatch(/BIP|WDI|3,8|3,1/);
    await expect(page.locator('aside.learning-scaffold')).toBeVisible();
    await page.locator('#learning-words > summary').click();
    await page.locator('#learning-all-words > summary').click();
    for (const term of [
      'Einnahmen',
      'Überschuss',
      'Investition',
      'Verdunstung',
      'Atmosphäre',
      'Marktstand',
      'Kühlraum',
      'Mehrwegkiste',
      'Zugang',
      'Verteilung',
      'Wartung',
    ])
      await expect(
        page
          .locator('#learning-all-words strong')
          .filter({ hasText: new RegExp('^' + term + '$') }),
      ).toHaveCount(1);
    await page.screenshot({
      path: evidencePath(`correction-economy-${profile}-${browserName}.png`),
      fullPage: true,
    });
    await choose(page, 'cause', 'no');
    await page.locator('#learning-check').press('Enter');
    await expect(page.locator('[data-learning-feedback]')).toHaveClass(
      /correct/,
    );
    await page.locator('#learning-next').click();
    await expect(page.locator('h1')).toContainText('Einkommen');
  }
  await seed(page, fixture('ahr', 'd', 'economy.source-claim.v1'));
  await expect(page.locator('#learn-explanation')).toHaveValue('');
  await expect(page.locator('#learning-criteria')).toHaveCount(0);
  await expect(page.locator('label[for="learn-explanation"]')).toContainText(
    'GEPA',
  );
  await page.screenshot({
    path: evidencePath(`correction-ahr-claim-${browserName}.png`),
    fullPage: true,
  });
  await page.locator('#learn-explanation').fill('Ich bin noch unsicher.');
  await page.locator('#learning-check').press('Enter');
  await expect(page.locator('[data-learning-feedback]')).toHaveClass(/neutral/);
  expect(active(await state(page))!.attempt!.factual).toBe('ungraded');
  await page.locator('#learning-criteria').click();
  await expect(page.locator('.learning-criteria')).toContainText('Einkommens');
  await page.reload();
  await expect(page.locator('#learn-explanation')).toHaveValue(
    'Ich bin noch unsicher.',
  );
});
for (const profile of profileIds)
  test(`Afrika curriculum Gate2 correction revision ${profile}: change stays change and returns to plan`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await seed(page, fixture(profile, 'e', 'future.revision'));
    await choose(page, 'revision', 'change');
    await page.locator('#learning-check').press('Enter');
    const before = (await state(page)).records[`e.${profile}.v1`].attempts[
      'future.revision'
    ];
    await expect(page.locator('#learning-next')).toHaveCount(0);
    await expect(page.locator('#learning-revise')).toBeVisible();
    await help(page);
    await expect(page.locator('.help-panel')).toContainText(
      'Deine Auswahl bleibt: Ich möchte den anderen Plan prüfen.',
    );
    await page.locator('#learning-adopt').click();
    const after = (await state(page)).records[`e.${profile}.v1`].attempts[
      'future.revision'
    ];
    expect(after.answers.revision).toBe('change');
    expect(after.exampleUsed).toBe(false);
    expect(after.submissions).toEqual(before.submissions);
    await page.reload();
    await expect(
      page.locator('input[data-field="revision"][value="change"]'),
    ).toBeChecked();
    await page.locator('#learning-revise').press('Enter');
    await expect(page.locator('#learn-plan')).toHaveValue('shade');
    expect(active(await state(page))!.task.id).toBe('future.plan');
  });
test('Afrika curriculum Gate2 correction missing choice: concrete example is announced and dependent current proofs stay drafts', async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await seed(page, fixture('esa', 'e', 'future.plan', 'shade', 'access', true));
  await choose(page, 'plan', '');
  await help(page);
  await expect(page.locator('.help-panel')).toContainText(
    'Ein mögliches Beispiel: Gemeinsamer Kühlraum',
  );
  await page.screenshot({
    path: evidencePath(`correction-missing-example-${browserName}.png`),
    fullPage: true,
  });
  await page.locator('#learning-adopt').click();
  let s = await state(page);
  let p = s.records['e.esa.v1'].attempts['future.plan'];
  expect(p.answers.plan).toBe('cool');
  expect(p.exampleUsed).toBe(true);
  let evidence = s.records['e.esa.v1'].attempts['future.evidence'];
  expect(evidence.process).toBe('draft');
  expect(evidence.answers.evidence).toBe('shade');
  expect(evidence.submissions[0].contextPlan).toBe('shade');
  await page.locator('#learning-next').click();
  await expect(page.locator('#learning-next')).toHaveCount(0);
  await page.reload();
  s = await state(page);
  evidence = s.records['e.esa.v1'].attempts['future.evidence'];
  expect(evidence.process).toBe('draft');
  expect(evidence.submissions[0].contextPlan).toBe('shade');
});
