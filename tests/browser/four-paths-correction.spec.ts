import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  profileIds,
  profiles,
  type ProfileId,
} from '../../src/learning/profiles.ts';
import { tasksFor } from '../../src/learning/tasks.ts';
import {
  active,
  newLearning,
  reduceLearning,
  type LearningState,
} from '../../src/learning/storage.ts';
import { initialState } from '../../src/state.ts';
import { reduceStudy } from '../../src/regions/state.ts';
import { answers } from '../learning-oracles.ts';
import { regionPositionCases } from '../region-position-cases.ts';
import { evidencePath } from './artifacts.ts';
import { writeFileSync } from 'node:fs';
const key = 'afrika-2040:kenia-bus:v2a';
const tags = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22a',
  'wcag22aa',
];
const op = (page: Page, name: string) =>
  page.locator(`[data-action="learning"][data-op="${name}"]`).first();
const get = async (page: Page) =>
  page.evaluate(
    (key) => JSON.parse(sessionStorage.getItem(key)!).learning,
    key,
  );
const act = (
  s: LearningState,
  op: Parameters<typeof reduceLearning>[1]['op'],
  value?: string,
  field?: string,
) => reduceLearning(s, { type: 'learning', op, value, field });
function solved(s: LearningState) {
  for (const f of active(s)!.task.fields)
    s = act(s, 'answer', answers(active(s)!.task)[f.id], f.id);
  return act(s, 'check');
}
async function assertActive(
  page: Page,
  profile: ProfileId,
  unit: 'c' | 's1' = 'c',
) {
  const s = await get(page),
    r = s.records[`${unit}.${profile}.v1`],
    task = tasksFor(unit, profile)[r.index];
  expect(s.profile).toBe(profile);
  expect(s.unit).toBe(unit);
  await expect(page.locator('h1')).toHaveText(task.title);
  await expect(page.locator('.eyebrow')).toContainText(profiles[profile].name);
  await expect(page.locator('.eyebrow')).toContainText(
    `Schritt ${r.index + 1} von`,
  );
  expect(r.attempts[task.id].identity.profileId).toBe(profile);
}
async function seed(page: Page, learning: LearningState) {
  await page.goto('/');
  await page.evaluate(
    ({ key, state }) => sessionStorage.setItem(key, JSON.stringify(state)),
    { key, state: { ...initialState(), screen: 'learning', learning } },
  );
  await page.reload();
}
async function choose(page: Page, profile: ProfileId) {
  await op(page, 'profiles').click();
  await page
    .locator(`[data-op="request-profile"][data-value="${profile}"]`)
    .click();
  await op(page, 'confirm-profile').click();
}
for (const from of profileIds)
  for (const to of profileIds.filter((p) => p !== from))
    test(`Afrika curriculum correction switch ${from} to ${to}: visible reload, cancellation and separate provenance`, async ({
      page,
    }) => {
      for (const mode of ['draft', 'checked', 'example', 'ungraded'] as const) {
        // Every starting fixture includes a real reducer-created ungraded text.
        // Profiles without text keep this in its AHR record, never relabel it.
        let s = act(newLearning(), 'recommend', 'ahr', 'c');
        s = solved(s);
        s = act(s, 'next');
        s = act(
          s,
          'answer',
          'Mein noch ungeprüfter eigener Zusammenhang.',
          'explanation',
        );
        s = act(s, 'check');
        if (from !== 'ahr') {
          s = act(s, 'request-profile', from);
          s = act(s, 'confirm-profile');
        }
        if (mode === 'draft')
          s = act(
            s,
            'answer',
            answers(active(s)!.task)[active(s)!.task.fields[0].id],
            active(s)!.task.fields[0].id,
          );
        if (mode === 'checked') s = solved(s);
        if (mode === 'example') {
          s = act(s, 'help');
          s = act(s, 'help');
          s = act(s, 'help');
          s = act(s, 'adopt');
        }
        await seed(page, s);
        await assertActive(page, from);
        const before = await get(page);
        await op(page, 'profiles').click();
        await page
          .locator(`[data-op="request-profile"][data-value="${to}"]`)
          .click();
        await op(page, 'cancel-profile').click();
        await assertActive(page, from);
        expect((await get(page)).records).toEqual(before.records);
        await choose(page, to);
        await assertActive(page, to);
        await page.reload();
        await assertActive(page, to);
        const dest = await get(page);
        for (const id of Object.keys(before.records))
          expect(dest.records[id]).toEqual(before.records[id]);
        const allIds = Object.values(dest.records).flatMap((r: any) =>
          Object.values(r.attempts).map((a: any) => a.identity.attemptId),
        );
        expect(new Set(allIds).size).toBe(allIds.length);
        await choose(page, from);
        await page.reload();
        await assertActive(page, from);
        expect((await get(page)).records[`c.${from}.v1`]).toEqual(
          before.records[`c.${from}.v1`],
        );
        expect(
          (await get(page)).records['c.ahr.v1'].attempts[
            'population.base.explain'
          ].factual,
        ).toBe('ungraded');
      }
    });
test('Afrika curriculum correction recommendation links: fresh tab, conflict cancel/confirm, reload and real history', async ({
  page,
  browser,
  browserName,
}) => {
  await page.goto(
    'http://127.0.0.1:4174/Afrika-2040/?keep=one&lernweg=foerder&bereich=c#material',
  );
  await assertActive(page, 'foerder');
  expect(page.url()).toBe(
    'http://127.0.0.1:4174/Afrika-2040/?keep=one#material',
  );
  await page.locator('#learn-direction').selectOption('more');
  await page.locator('#learning-check').press('Enter');
  await page.locator('#learning-next').click();
  await choose(page, 'ahr');
  await page.reload();
  await assertActive(page, 'ahr');
  const before = await get(page);
  await page.goto(
    'http://127.0.0.1:4174/Afrika-2040/?keep=two&lernweg=foerder&bereich=s1#read',
  );
  await expect(page.locator('h1')).toHaveText('Lernweg wechseln?');
  expect((await get(page)).profile).toBe('ahr');
  expect((await get(page)).records).toEqual(before.records);
  await page.reload();
  await expect(page.locator('h1')).toHaveText('Lernweg wechseln?');
  expect((await get(page)).profile).toBe('ahr');
  expect((await get(page)).records).toEqual(before.records);
  await op(page, 'cancel-profile').click();
  await assertActive(page, 'ahr');
  expect(page.url()).toBe('http://127.0.0.1:4174/Afrika-2040/?keep=two#read');
  await page.reload();
  await assertActive(page, 'ahr');
  await page.goBack();
  await assertActive(page, 'ahr');
  await page.goForward();
  await assertActive(page, 'ahr');
  // Explicitly reopening the raw link is a new recommendation, not a stale reload.
  await page.goto(
    'http://127.0.0.1:4174/Afrika-2040/?keep=three&lernweg=foerder&bereich=s1#read',
  );
  await expect(page.locator('h1')).toHaveText('Lernweg wechseln?');
  await op(page, 'confirm-profile').click();
  await assertActive(page, 'foerder', 's1');
  for (const [id, record] of Object.entries(before.records))
    expect((await get(page)).records[id]).toEqual(record);
  await page.reload();
  await assertActive(page, 'foerder', 's1');
  await page.goBack();
  await assertActive(page, 'foerder', 's1');
  await page.goForward();
  await assertActive(page, 'foerder', 's1');
  await page.screenshot({
    path: evidencePath(`correction-entry-${browserName}.png`),
    fullPage: true,
  });
  const context = await browser.newContext();
  const fresh = await context.newPage();
  await fresh.goto('http://127.0.0.1:4173/?lernweg=esa&bereich=s1');
  await assertActive(fresh, 'esa', 's1');
  await context.close();
});
test('Afrika curriculum correction same-document back/forward recommendations are explicit and keep the current task', async ({
  page,
}) => {
  await page.goto('/?lernweg=esa&bereich=c');
  await assertActive(page, 'esa');
  await page.locator('#learn-event').selectOption('birth');
  await page.locator('#learning-check').click();
  await page.locator('#learning-next').click();
  await page.evaluate(() => {
    history.pushState({}, '', '?marker=new&lernweg=msa&bereich=s1#map');
    history.pushState({}, '', '?marker=later');
  });
  await page.goBack();
  await expect(page.locator('h1')).toHaveText('Lernweg wechseln?');
  await op(page, 'cancel-profile').click();
  await assertActive(page, 'esa');
  await page.goForward();
  await assertActive(page, 'esa');
  await page.goBack();
  await assertActive(page, 'esa');
});
test('Afrika curriculum correction simple materials, relevant words and honest journal on iPad and narrow frame', async ({
  browser,
  browserName,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/?lernweg=foerder&bereich=c');
  for (let i = 0; i < 7; i++) {
    await assertActive(page, 'foerder');
    if (i < 4) {
      await expect(page.locator('.learning-event')).toBeVisible();
      await expect(page.locator('.learning-event svg')).toHaveAccessibleName(
        /.+/,
      );
      expect(await page.locator('#learn-direction').inputValue()).toBe('');
    }
    await page.locator('#learning-words summary').first().tap();
    if (i === 0) {
      await expect(page.locator('#learning-words > p')).toHaveCount(1);
      await expect(page.locator('#learning-words > p')).toContainText('Geburt');
    }
    for (const f of tasksFor('c', 'foerder')[i].fields)
      await page
        .locator('#learn-' + f.id)
        .selectOption(answers(tasksFor('c', 'foerder')[i])[f.id]);
    await page.locator('#learning-check').tap();
    await page.locator('#learning-next').tap();
  }
  await assertActive(page, 'foerder');
  const visible = () =>
    page.locator('.inquiry-material').evaluate((el) => el.innerText);
  await expect(page.locator('[data-learning-status]')).toContainText(
    'Wähle deine Antwort. Drücke dann „Angaben prüfen“.',
  );
  const text = await visible();
  expect(text).toContain('etwa 19,6 Millionen');
  expect(text).toContain('etwa 34,4 Millionen');
  expect(text).not.toMatch(
    /19\.637\.087|34\.427\.414|WDI|eingefroren|Jahresmitte|2010|2020/,
  );
  await page.locator('#learning-words summary').first().tap();
  await expect(page.locator('#learning-words > p')).toHaveCount(2);
  await expect(page.locator('#learning-words > p').first()).toContainText(
    'Schätzung',
  );
  await expect(page.locator('#learning-all-words')).not.toHaveAttribute('open');
  await page.screenshot({
    path: evidencePath(`correction-foerder-source-${browserName}.png`),
    fullPage: true,
  });
  await page.locator('#learning-original > summary').tap();
  await expect(page.locator('#learning-original')).toContainText('19.637.087');
  await expect(page.locator('#learning-original')).toContainText('34.427.414');
  await page.locator('#learning-original > details > summary').tap();
  await expect(
    page.locator('#learning-original a[href*="SP.POP.TOTL"]'),
  ).toBeVisible();
  await expect(page.locator('#learning-original')).toContainText('Weltbank');
  const scan = await new AxeBuilder({ page }).withTags(tags).analyze();
  expect(scan.violations).toEqual([]);
  await op(page, 'journal').tap();
  const journal = await page.locator('main').evaluate((el) => el.innerText);
  expect(journal).toContain('Die App hat diese Angaben geprüft. Sie passen.');
  expect(journal).not.toMatch(
    /Kompetenznachweis|Variante:|Standardgerüst:|Sachangaben|factual/,
  );
  await page.screenshot({
    path: evidencePath(`correction-foerder-journal-${browserName}.png`),
    fullPage: true,
  });
  await page.setViewportSize({ width: 720, height: 900 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});
test('Afrika curriculum correction AHR applies source criticism without a prefilled conclusion and keeps text ungraded', async ({
  page,
  browserName,
}) => {
  await page.goto('/?lernweg=ahr&bereich=c');
  for (let i = 0; i < 3; i++) {
    const t = tasksFor('c', 'ahr')[i];
    for (const f of t.fields) {
      const el = page.locator('#learn-' + f.id);
      if (f.kind === 'choice') await el.selectOption(answers(t)[f.id]);
      else await el.fill(answers(t)[f.id]);
    }
    await page.locator('#learning-check').click();
    await page.locator('#learning-next').click();
  }
  await assertActive(page, 'ahr');
  const material = await page
    .locator('.inquiry-material')
    .evaluate((el) => el.innerText);
  expect(material).toMatch(/Ghana/);
  expect(material).toMatch(/2000–2024/);
  expect(material).toMatch(/Personen zur Jahresmitte/);
  expect(material).toMatch(/Schätzungen/);
  expect(material).toMatch(/Weltbank/);
  expect(material).not.toMatch(
    /keine einzelnen Ursachen|nicht.*Ursachen|trennt.*nicht|Beiträge von/,
  );
  await expect(page.locator('label[for="learn-explanation"]')).toContainText(
    'Deshalb sind mehr Menschen zugezogen',
  );
  await expect(page.locator('#learning-criteria')).toHaveCount(0);
  await expect(page.locator('.help-panel')).toHaveCount(0);
  await page.screenshot({
    path: evidencePath(`correction-ahr-question-${browserName}.png`),
    fullPage: true,
  });
  await page
    .locator('#learn-explanation')
    .fill('ich weis es noch nicht <b>mein Text</b>');
  await page.locator('#learning-check').press('Enter');
  await expect(page.locator('[data-learning-feedback]')).toHaveClass(/neutral/);
  await expect(page.locator('[data-learning-feedback]')).toContainText(
    'fachlich ungeprüft',
  );
  let a = (await get(page)).records['c.ahr.v1'].attempts[
    'population.source.explain'
  ];
  expect(a.factual).toBe('ungraded');
  expect(a.failures).toBe(0);
  expect(a.exampleUsed).toBe(false);
  await page.locator('#learning-criteria').click();
  await expect(page.locator('.learning-criteria')).toContainText(
    'Keine einzelne Ursache',
  );
  await page
    .locator('#learn-explanation')
    .fill(
      'Die Reihe zeigt die Gesamtzahl, aber nicht die Anteile von Geburten, Sterbefällen und Umzügen.',
    );
  await page.locator('#learning-check').click();
  await page.reload();
  await assertActive(page, 'ahr');
  a = (await get(page)).records['c.ahr.v1'].attempts[
    'population.source.explain'
  ];
  expect(a.factual).toBe('ungraded');
  expect(a.revised).toBe(true);
  for (let i = 0; i < 3; i++) await page.locator('#learning-help').click();
  a = (await get(page)).records['c.ahr.v1'].attempts[
    'population.source.explain'
  ];
  expect(a.exampleShown).toBe(true);
  expect(a.exampleUsed).toBe(false);
  await page.locator('#learning-adopt').click();
  a = (await get(page)).records['c.ahr.v1'].attempts[
    'population.source.explain'
  ];
  expect(a.exampleUsed).toBe(true);
  expect(a.factual).toBe('ungraded');
});
test('Afrika curriculum correction oral history has 40 newest plus older count in visible journal before and after reload', async ({
  page,
  browserName,
}) => {
  let s = solved(act(newLearning(), 'recommend', 'ahr', 'c'));
  s = act(s, 'next');
  await seed(page, s);
  await assertActive(page, 'ahr');
  await page.locator('[name="learning-oral"]').check();
  for (let i = 0; i < 45; i++) {
    await page.locator('#learn-explanation').fill('Mündliche Notiz ' + i);
    await page.locator('#learning-check').click();
  }
  for (let reload = 0; reload < 2; reload++) {
    if (reload) await page.reload();
    await op(page, 'journal').click();
    const record = page.locator('.journal-record article').nth(1);
    await record.locator('details > summary').first().click();
    await expect(record).toContainText(
      '40 protokollierte Antwortversuche, 5 ältere Versuche verdichtet',
    );
    const a = (await get(page)).records['c.ahr.v1'].attempts[
      'population.base.explain'
    ];
    expect(a.submissions.length).toBe(40);
    expect(a.olderSubmissions).toBe(5);
    expect(a.submissions[0].answers.explanation).toBe('Mündliche Notiz 5');
    expect(a.answers.explanation).toBe('Mündliche Notiz 44');
    expect(a.factual).toBe('ungraded');
  }
  await page.evaluate((key) => {
    const raw = JSON.parse(sessionStorage.getItem(key)!);
    const a =
      raw.learning.records['c.ahr.v1'].attempts['population.base.explain'];
    a.olderSubmissions = 7;
    a.submissions = Array.from({ length: 55 }, (_, i) => ({
      answers: { explanation: 'Ältere Selbstmeldung ' + i },
      factual: 'ungraded',
      support: 'own',
    }));
    sessionStorage.setItem(key, JSON.stringify(raw));
  }, key);
  await page.reload();
  // Restore intentionally does not rewrite storage just by reading it.
  // First verify the compacted visible state, then persist via normal navigation.
  const restoredArticle = page.locator('.journal-record article').nth(1);
  await restoredArticle.locator('details > summary').first().click();
  await expect(restoredArticle).toContainText(
    '40 protokollierte Antwortversuche, 22 ältere Versuche verdichtet',
  );
  await expect(restoredArticle.locator('.own-answer')).toContainText(
    'Mündliche Notiz 44',
  );
  expect(
    (await get(page)).records['c.ahr.v1'].attempts['population.base.explain']
      .submissions.length,
  ).toBe(55);
  await op(page, 'journal').click();
  const migrated = (await get(page)).records['c.ahr.v1'].attempts[
    'population.base.explain'
  ];
  expect(migrated.submissions.length).toBe(40);
  expect(migrated.olderSubmissions).toBe(22);
  expect(migrated.submissions[0].answers.explanation).toBe(
    'Ältere Selbstmeldung 15',
  );
  expect(migrated.submissions.at(-1).answers.explanation).toBe(
    'Ältere Selbstmeldung 54',
  );
  expect(migrated.answers.explanation).toBe('Mündliche Notiz 44');
  expect(migrated.factual).toBe('ungraded');
  await page.reload();
  expect(
    (await get(page)).records['c.ahr.v1'].attempts['population.base.explain'],
  ).toEqual(migrated);
  await page.screenshot({
    path: evidencePath(`correction-oral-history-${browserName}.png`),
    fullPage: true,
  });
});
test('Afrika curriculum correction all 16 rendered region positions survive wrong/right feedback, back and reload', async ({
  page,
  browserName,
}) => {
  const result = [];
  for (const c of regionPositionCases()) {
    const base = reduceStudy(initialState(), {
      type: 'study',
      op: 'start',
      id: c.id,
    } as any);
    const record = base.studies![c.id as keyof typeof base.studies]!;
    record.data = structuredClone(c.data);
    record.step = c.step;
    // Prior step is an explicit prerequisite for restoring a later study step.
    if (c.step === 1) {
      record.progress[0].complete = true;
      if (c.id === 'cocoa')
        record.data.chain = ['beans', 'roast', 'mass', 'press'];
      if (c.id === 'share')
        Object.assign(record.data.answers, { free: '120', wages: 'paid' });
      if (c.id === 'water')
        Object.assign(record.data.answers, { withdrawal: '60', rest: '20' });
      if (c.id === 'area') {
        Object.assign(record.data.answers, { single: '45', saving: '15' });
        record.data.explored = ['base', 'same'];
      }
    }
    await page.goto('/');
    await page.evaluate(
      ({ key, base }) => sessionStorage.setItem(key, JSON.stringify(base)),
      { key, base },
    );
    await page.reload();
    const orders: Record<string, string[]> = {};
    for (const [field, right] of Object.entries(c.expected)) {
      const loc = page.locator(`input[name="study-${field}"]`);
      orders[field] = await loc.evaluateAll((els) =>
        els.map((el) => (el as HTMLInputElement).value),
      );
      expect(orders[field]).toContain(right);
      await page
        .locator(`input[name="study-${field}"][value="${right}"]`)
        .check();
    }
    for (const [field, right] of Object.entries(c.expected)) {
      const wrong = orders[field].find((v) => v !== right)!;
      await page
        .locator(`input[name="study-${field}"][value="${wrong}"]`)
        .check();
      await page.locator('[data-action="study"][data-op="check"]').click();
      await expect(page.locator('[data-feedback]')).toHaveClass(
        /partial|incorrect|hint/,
      );
      await page
        .locator(`input[name="study-${field}"][value="${right}"]`)
        .check();
      await page.locator('[data-action="study"][data-op="check"]').click();
      await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
    }
    if (await page.locator('#next-step').count()) {
      await page.locator('#next-step').click();
      await page.locator('[data-action="study"][data-op="back"]').click();
    }
    await page.reload();
    // A measure answer may advance internally after a correct check; return to it via measure control.
    if (c.step === 1 && Object.keys(c.expected)[0] !== 'why')
      await page
        .locator(
          `[data-action="study"][data-op="select"][data-value="${c.data.selection}"]`,
        )
        .first()
        .click();
    for (const [f, right] of Object.entries(c.expected)) {
      const now = await page
        .locator(`input[name="study-${f}"]`)
        .evaluateAll((els) => els.map((el) => (el as HTMLInputElement).value));
      expect(now).toEqual(orders[f]);
      result.push({
        episode: c.id,
        selection: c.data.selection,
        field: f,
        right,
        position: now.indexOf(right) + 1,
        order: now,
      });
    }
  }
  expect(result.length).toBe(16);
  for (const slot of [1, 2, 3])
    expect(
      result.filter((r) => r.position === slot).length,
    ).toBeGreaterThanOrEqual(4);
  writeFileSync(
    evidencePath(`correction-positions-${browserName}.json`),
    JSON.stringify(result, null, 2),
  );
});
