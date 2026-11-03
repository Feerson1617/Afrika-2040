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
          [
            'Suche auf den Karten das Material, mit dem die Verarbeitung beginnt.',
            'Welche Karte nennt Tätigkeiten, die die getrockneten Bohnen verändern?',
            'Was entsteht aus den Bohnen, wenn sie geröstet und gemahlen werden?',
            'Die Presse trennt die Masse. Suche die Karte mit dieser Tätigkeit.',
          ][i],
        );
      } else {
        await page.locator('#learning-help').tap();
        await expect(page.locator('.help-panel')).toContainText(hint);
        await page.locator('#learning-help').tap();
        await expect(page.locator('.help-panel')).toContainText(
          [
            'Suche auf den Karten das Material',
            'Welche Karte nennt Tätigkeiten',
            'Was entsteht aus den Bohnen',
            'Die Presse trennt die Masse',
          ][i],
        );
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

for (const [unit, target, result] of [
  ['s2', 'demand.now.capacity', '20'],
  ['s4', 'share.paid.free', '120'],
  ['s6', 'area.total.total', '65'],
] as const)
  test(`Afrika curriculum barriers ESA ${unit}: calculate without disclosed result, help, reload and retained exploration`, async ({
    page,
    browserName,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await seed(page, fixture(unit, 'esa', target));
    const material = page.locator('.inquiry-material');
    await expect(material).not.toContainText(
      new RegExp('\\b' + result + '\\b'),
    );
    expect(
      await material
        .locator('svg')
        .evaluateAll((els) =>
          els.map((e) => e.getAttribute('aria-label')).join(' '),
        ),
    ).not.toMatch(new RegExp('\\b' + result + '\\b'));
    await page.screenshot({
      path: evidencePath(`barrier-${unit}-${browserName}-inputs.png`),
      fullPage: true,
    });
    await page.reload();
    await expect(material).not.toContainText(
      new RegExp('\\b' + result + '\\b'),
    );
    if (unit === 's6')
      for (const id of ['same', 'extra'])
        await page
          .locator('[data-op="simulate"][data-value="' + id + '"]')
          .click();
    const field = active(await get(page))!.task.fields[0];
    await page.locator('#learn-' + field.id).fill(result);
    await page.locator('#learning-check').press('Enter');
    await expect(page.locator('[data-learning-feedback]')).toHaveClass(
      /correct/,
    );
    expect(active(await get(page))!.attempt!.exampleUsed).toBe(false);
    await page.reload();
    await expect(page.locator('#learn-' + field.id)).toHaveValue(result);
    await page.locator('[data-op="rework"]').click();
    await expect(material).not.toContainText(
      new RegExp('\\b' + result + '\\b'),
    );
    for (let h = 0; h < 2; h++) await page.locator('#learning-help').click();
    await expect(page.locator('.help-panel')).toContainText(result);
    expect(active(await get(page))!.attempt!.exampleUsed).toBe(false);
  });

for (const profile of ['esa', 'msa', 'ahr'] as const) {
  test(`RC-final F1 area view ${profile}: actual distinct cases without answers`, async ({
    page,
  }) => {
    const target = profile === 'esa' ? 'area.total.total' : 'area.total';
    await seed(page, fixture('s6', profile, target));
    const material = page.locator('.inquiry-material');
    await material.locator('[data-value="same"]').click();
    await expect(material).toContainText(
      'Aktuelle Modellansicht: Gleiches Feld',
    );
    await expect(
      material.locator('tr').filter({ hasText: 'Zusatzfeld' }),
    ).toHaveCount(0);
    await expect(material).not.toContainText(/\b65\b|\b15\b/);
    await material.locator('[data-value="extra"]').click();
    await expect(material).toContainText(
      'Aktuelle Modellansicht: Mit Zusatzfeld',
    );
    await expect(
      material.locator('tr').filter({ hasText: 'Zusatzfeld' }),
    ).toContainText('20');
    await expect(material).not.toContainText(/\b65\b|\b15\b/);
    await expect(page.locator('.inquiry-task')).toContainText(
      /Zusatzfeld|beide Felder/,
    );
  });
  test(`RC-final F2 free money ${profile}: help stage two without arithmetic result`, async ({
    page,
  }) => {
    await seed(
      page,
      fixture(
        's4',
        profile,
        profile === 'esa' ? 'share.paid.free' : 'share.paid',
      ),
    );
    while (active(await get(page))!.attempt!.help < 2)
      await page.locator('#learning-help').click();
    await expect(page.locator('.help-panel')).not.toContainText('120');
    await expect(page.locator('.help-panel')).toContainText(/Löhne/);
    await page.locator('#learning-help').click();
    await expect(page.locator('.help-panel')).toContainText('120');
    expect(active(await get(page))!.attempt!.exampleUsed).toBe(false);
  });
  for (const [unit, prefix, field, value] of [
    ['s2', 'demand.now', 'capacity', '20'],
    ['s4', 'share.paid', 'free', '120'],
    ['s6', 'area.total', 'total', '65'],
  ] as const)
    test(`RC-final F3 ${unit}/${profile}: edit invalidates visible proof without replacing input`, async ({
      page,
    }) => {
      await seed(
        page,
        fixture(
          unit,
          profile,
          profile === 'esa' ? prefix + '.' + field : prefix,
        ),
      );
      let task = active(await get(page))!.task;
      for (const id of task.simulation?.required ?? [])
        await page
          .locator('[data-op="simulate"][data-value="' + id + '"]')
          .click();
      const values = answers(task);
      for (const f of task.fields) {
        const el = page.locator('#learn-' + f.id);
        if (f.kind === 'integer')
          await el.fill(f.id === field ? value : values[f.id]);
        else if (f.kind === 'choice') await el.selectOption(values[f.id]);
      }
      await page.locator('#learning-check').click();
      await expect(page.locator('[data-learning-status]')).toContainText(
        /geprüft|Richtig/,
      );
      const saved = active(await get(page))!.attempt!.submissions;
      const input = page.locator('#learn-' + field);
      await input.evaluate((el) => ((window as any).__testedInput = el));
      await input.fill('998');
      await expect(page.locator('[data-learning-status]')).toContainText(
        'geändert',
      );
      await expect(page.locator('[data-learning-feedback]')).toHaveCount(0);
      await expect(page.locator('#learning-next')).toHaveCount(0);
      await expect(input).toBeFocused();
      expect(
        await input.evaluate((el) => (window as any).__testedInput === el),
      ).toBe(true);
      await input.press('ArrowLeft');
      await page.keyboard.insertText('7');
      await expect(input).toHaveValue('9978');
      expect(active(await get(page))!.attempt!.submissions).toEqual(saved);
      expect(active(await get(page))!.attempt!.factual).toBe('ungraded');
      const material = page.locator('.inquiry-material');
      await expect(material).not.toContainText(
        new RegExp('\\b' + value + '\\b'),
      );
      await page.reload();
      await expect(input).toHaveValue('9978');
    });
}

for (const profile of profileIds)
  for (const [unit, target] of [
    ['s1', 'kenia.first.weight'],
    ['s1', 'kenia.revised.weight'],
    ['s2', 'demand.final.weight'],
    ['s3', 'cocoa.final.weight'],
    ['s5', 'water.final.weight'],
    ['s6', 'area.final.weight'],
  ] as const)
    test(`RC-final weight ${unit}/${target}/${profile}: one option links priority and accepted drawback`, async ({
      page,
      browserName,
    }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      await seed(page, fixture(unit, profile, target));
      const option = page
        .locator('label')
        .filter({ has: page.locator('input[value="benefit"]') });
      await expect(option.locator('strong')).toHaveText([
        'Mir ist wichtig:',
        'Dafür nehme ich in Kauf:',
      ]);
      await option.locator('input').focus();
      await page.keyboard.press('Space');
      await page.locator('#learning-check').click();
      expect(active(await get(page))!.attempt!.answers.weight).toBe('benefit');
      await page.reload();
      await expect(option.locator('input')).toBeChecked();
      if (profile === 'foerder' && unit === 's5')
        await page.screenshot({
          path: evidencePath(`RC-weight-${browserName}.png`),
          fullPage: true,
        });
    });
for (const profile of ['esa', 'msa', 'ahr'] as const)
  for (const [unit, prefix, field, value] of [
    ['s2', 'demand.now', 'capacity', '20'],
    ['s4', 'share.paid', 'free', '120'],
    ['s6', 'area.total', 'total', '65'],
  ] as const)
    test(`RC-final F3-help3 ${unit}/${profile}: conscious explanation remains identified after editing`, async ({
      page,
    }) => {
      await seed(
        page,
        fixture(
          unit,
          profile,
          profile === 'esa' ? prefix + '.' + field : prefix,
        ),
      );
      while (active(await get(page))!.attempt!.help < 3)
        await page.locator('#learning-help').click();
      await page.locator('#learn-' + field).fill('998');
      await expect(page.locator('[data-learning-status]')).toContainText(
        'Hilfe 3',
      );
      await expect(page.locator('.help-panel')).toBeVisible();
      await expect(page.locator('.inquiry-material')).toContainText(value);
      const attempt = active(await get(page))!.attempt!;
      expect(attempt.help).toBe(3);
      expect(attempt.exampleUsed).toBe(false);
      expect(attempt.factual).toBe('ungraded');
      await page.reload();
      expect(active(await get(page))!.attempt!.answers[field]).toBe('998');
    });
for (const [profile, target, answer] of [
  ['esa', 'population.base.migration', '-10'],
  ['esa', 'population.base.end', '1020'],
  ['msa', 'population.base.balance', '1020'],
  ['ahr', 'population.base.balance', '1020'],
] as const)
  test(`RC-final number hint ${profile}/${target}: no solution hidden in format examples`, async ({
    page,
  }) => {
    await seed(page, fixture('c', profile, target));
    await expect(page.locator('#learning-number')).not.toContainText(/\d/);
    await expect(page.locator('#learning-number')).toContainText(
      'Tausenderpunkte',
    );
    const text = await page.locator('main').innerText();
    if (answer === '1020') expect(text).not.toMatch(/\b1\.?020\b/);
    else expect(text).not.toMatch(/[-−]10\b/);
  });
