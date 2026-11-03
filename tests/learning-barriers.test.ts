import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tasksFor } from '../src/learning/tasks.ts';
import { simulationMaterial } from '../src/learning/simulation-material.ts';
import type { Attempt } from '../src/learning/storage.ts';
const draft = {
  answers: {},
  help: 0,
  factual: 'ungraded',
  process: 'draft',
} as Attempt;
for (const p of ['esa', 'msa', 'ahr'] as const)
  for (const [u, prefix, result] of [
    ['s2', 'demand.now', 20],
    ['s4', 'share.paid', 120],
    ['s6', 'area.total', 65],
  ] as const)
    test(`independent calculation ${u}/${p}: inputs without answer in text, SVG or accessible name`, () => {
      const task = tasksFor(u, p).find(
        (t) =>
          t.id.startsWith(prefix) && t.fields.some((f) => f.kind === 'integer'),
      )!;
      const html = simulationMaterial(task, p, draft);
      assert.doesNotMatch(html, new RegExp(`\\b${result}\\b`));
      for (const input of u === 's2'
        ? [2, 10, 24]
        : u === 's4'
          ? [300, 100, 80]
          : [45, 20, 60, 80])
        assert.match(html, new RegExp(`\\b${input}\\b`));
      const explained = simulationMaterial(task, p, { ...draft, help: 3 });
      assert.match(explained, new RegExp(`\\b${result}\\b`));
    });
for (const p of ['foerder', 'esa'] as const)
  test(`question-specific scaffolds ${p}`, () => {
    const n = tasksFor('n', p).filter((t) =>
      t.id.startsWith('nature.concepts'),
    );
    for (const t of n) assert.doesNotMatch(t.hints.join(' '), /Pfeil|Tank/);
    const access = tasksFor('d', p).find(
      (t) => t.id === 'economy.data.access',
    )!;
    assert.doesNotMatch(access.focus!.paragraphs.join(' '), /BIP/);
    assert.equal(access.focus!.rows![0].length, 2);
    assert.match(access.focus!.paragraphs.join(' '), /ungefähr 90 von 100/);
    for (const t of tasksFor('s2', p).filter((t) =>
      t.id.startsWith('demand.explore'),
    ))
      assert.match(
        t.hints[0],
        t.id.endsWith('bus') ? /zusätzliche Fahrt/ : /kurzen Fußweg/,
      );
    const rest = tasksFor('s5', p).find((t) => t.id === 'water.base.rest');
    if (rest) assert.doesNotMatch(rest.hints[0], /Pfeil am Feld/);
  });

test('capacity glossary explains the quantity without disclosing the current arithmetic answer', async () => {
  const { allWords } = await import('../src/learning/words.ts');
  const definition = allWords.find(([word]) => word === 'Kapazität')![1];
  assert.doesNotMatch(definition, /20/);
  assert.match(definition, /Stunde/);
  assert.match(definition, /Fahrten/);
});

test('RC source and interaction wording preserve the required learning action', async () => {
  // Rendering full pages is covered by actual browser tests; these checks protect material text.
  for (const p of ['foerder', 'esa', 'msa', 'ahr'] as const) {
    for (const t of tasksFor('s3', p).filter((t) =>
      t.id.startsWith('cocoa.chain'),
    )) {
      const html = simulationMaterial(t, p, draft);
      assert.doesNotMatch(html, /Ordne die Karten/);
      assert.match(html, /Wähle den passenden Schritt/);
    }
    const transfer = tasksFor('d', p).find((t) =>
      t.id.startsWith('economy.transfer'),
    )!;
    assert.match(
      transfer.fields.find((f) => f.id === 'cause')!.explanation,
      /wie viele von 100/,
    );
  }
});
test('RC earlier ESA wage reading does not disclose the following free-money result', () => {
  const t = tasksFor('s4', 'esa').find((t) => t.id === 'share.paid.wages')!;
  assert.doesNotMatch(simulationMaterial(t, 'esa', draft), /120/);
  assert.match(t.hints[1], /Löhne/);
});

test('number-format explanation cannot disclose any arithmetic answer', async () => {
  const { integerFormatHint } = await import('../src/learning/language.ts');
  assert.doesNotMatch(integerFormatHint, /\d/);
  assert.match(integerFormatHint, /Minuszeichen/);
  assert.match(integerFormatHint, /Tausenderpunkte/);
});
