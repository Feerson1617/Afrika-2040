import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  tasksFor,
  legacyTasksFor,
  storedTasksFor,
} from '../src/learning/tasks.ts';
import { implementedUnits } from '../src/learning/catalog.ts';
import { profileIds } from '../src/learning/profiles.ts';
import { resolveSimulation } from '../src/learning/simulation-variants.ts';
import { evaluate } from '../src/learning/progress.ts';
import {
  active,
  restoreLearning,
  reduceLearning,
  newLearning,
} from '../src/learning/storage.ts';
import { cocoa, cocoaModel } from '../src/regions/cocoa.ts';
import { water, waterModel } from '../src/regions/water.ts';
import { evaluateStudyDecision, product } from '../src/regions/shared.ts';
import { simulationMaterial } from '../src/learning/simulation-material.ts';
const old = JSON.parse(
  readFileSync(
    new URL('./fixtures/streamline-3499de6-saves.json', import.meta.url),
    'utf8',
  ),
);
const act = (s: any, op: any, value?: string, field?: string) =>
  reduceLearning(s, { type: 'learning', op, value, field });

test('streamline: 52 routes, exact reductions, same archived IDs and all competencies represented', () => {
  let total = 0;
  for (const u of implementedUnits)
    for (const p of profileIds) {
      const route = tasksFor(u, p),
        previous = legacyTasksFor(u, p),
        archive = storedTasksFor(u, p);
      total += route.length;
      const reduction =
        u === 's1' && p === 'esa'
          ? 6
          : u === 'e'
            ? 3
            : u === 'r' && ['foerder', 'esa'].includes(p)
              ? 2
              : 0;
      assert.equal(route.length, previous.length - reduction, `${u}/${p}`);
      for (const t of previous)
        assert.ok(
          archive.some((a) => a.id === t.id),
          t.id,
        );
      for (const t of route) {
        assert.equal(t.hints.length, 3);
        assert.ok(t.fields.length && t.criteria.length);
      }
      if (u === 'e') {
        for (const id of [
          'future.reach',
          'future.goal',
          'future.plan',
          'future.evidence',
          'future.limit',
          'future.weight',
          'future.revision',
        ])
          assert.ok(
            route.some((t) => t.id === id || t.id.startsWith(id + '.')),
          );
        const comparison = route[0].focus!;
        assert.deepEqual(comparison.rows, [
          ['Angebot', 'Einmalig', 'Monatlich', 'Stände'],
          ['Gemeinsamer Kühlraum', '80 GE', '12 GE', '30'],
          ['Schattendächer und Mehrwegkisten', '30 GE', '3 GE', '60'],
        ]);
        assert.ok(route.some((t) => t.id.startsWith('future.ecology')));
        if (['msa', 'ahr'].includes(p))
          assert.equal(
            route.find((t) => t.id === 'future.judgment')!.fields[0].kind,
            'text',
          );
      }
      if (u === 'r')
        for (const country of ['KEN', 'GHA', 'MAR'])
          assert.ok(route.some((t) => t.id.startsWith('review.' + country)));
    }
  assert.equal(total, 472);
  const kenia = tasksFor('s1', 'esa');
  assert.deepEqual(
    kenia.flatMap((t) =>
      t.fields
        .filter((f) => f.kind === 'integer')
        .map((f) => [t.id, f.id, f.expected]),
    ),
    [
      ['kenia.times.amina-north', 'amina-north', '10'],
      ['kenia.times.david-north', 'david-north', '18'],
      ['kenia.full.times.south', 'south', '10'],
      ['kenia.event.times.direct', 'direct', '28'],
    ],
  );
});
for (const p of profileIds) {
  test(`streamline A1 ${p}: every cocoa proposal/evidence/limit combination and honest processing benefit`, () => {
    const spec = cocoa.options(cocoa.initial());
    const press = spec.find((o) => o.id === 'process')!;
    assert.match(press.benefit, /mehr eigene Verarbeitung.*260 GE Einnahmen/);
    assert.doesNotMatch(press.benefit, /höchste|mehr Überschuss/);
    assert.match(press.limit, /185.*75.*80.*90.*nicht sicher/);
    for (const plan of ['quality', 'process'])
      for (const evidence of ['quality', 'process'])
        for (const limit of ['quality', 'process']) {
          const records = { 'cocoa.final.choice': { answers: { plan } } };
          const proof = tasksFor('s3', p)
            .filter((t) => t.id.startsWith('cocoa.final.proof'))
            .flatMap((t) => resolveSimulation(t, records).fields);
          const t = {
            ...tasksFor('s3', p).find((t) =>
              t.id.startsWith('cocoa.final.proof'),
            )!,
            fields: proof,
          };
          const e = evaluate(t, { evidence, limit });
          const right = Number(plan === evidence) + Number(plan === limit);
          assert.equal(
            e.kind,
            right === 2 ? 'correct' : right === 1 ? 'partial' : 'incorrect',
          );
          if (right !== 2)
            assert.equal(evaluate(t, { evidence, limit }, 1).kind, 'hint');
        }
  });
  test(`streamline A2 ${p}: both measures accept shared maintenance/field gap, not wrong amounts or guarantees`, () => {
    for (const plan of ['repair', 'tech'])
      for (const evidence of ['repair', 'tech'])
        for (const limit of ['repair', 'tech']) {
          const records = { 'water.final.choice': { answers: { plan } } };
          const raw = tasksFor('s5', p).filter((t) =>
            t.id.startsWith('water.final.proof'),
          );
          const t = {
            ...raw[0],
            fields: raw.flatMap((t) => resolveSimulation(t, records).fields),
          };
          const correctLimit =
            limit === plan || (plan === 'tech' && limit === 'repair');
          const right = Number(evidence === plan) + Number(correctLimit);
          const e = evaluate(t, { evidence, limit });
          assert.equal(
            e.kind,
            right === 2 ? 'correct' : right === 1 ? 'partial' : 'incorrect',
            `${plan}/${evidence}/${limit}`,
          );
          assert.equal(evaluate(t, { limit }).error, false);
          if (right !== 2)
            assert.equal(evaluate(t, { evidence, limit }, 1).kind, 'hint');
        }
  });
}
test('streamline: the approved model values are unchanged and the legacy water product retains the chosen valid limit', () => {
  assert.deepEqual(
    ['base', 'quality', 'process'].map((x) => cocoaModel(x).surplus),
    [80, 90, 75],
  );
  assert.deepEqual(
    ['base', 'repair', 'tech'].map((x) => {
      const m = waterModel(x);
      return [m.withdrawal, m.atField, m.remaining, m.notAtField];
    }),
    [
      [60, 40, 20, 20],
      [50, 40, 30, 10],
      [45, 40, 35, 5],
    ],
  );
  const d = {
    proposal: 'tech',
    goal: 'less',
    benefit: 'tech',
    limit: 'repair',
    text: '',
    weighted: false,
    ungraded: false,
  };
  assert.equal(
    evaluateStudyDecision(water, water.initial(), d, 0, false).feedback.kind,
    'neutral',
  );
  assert.doesNotMatch(
    product(water, water.initial(), {
      ...d,
      proposal: 'repair',
      limit: 'tech',
    }),
    /Neue Teile, Filter/,
  );
  assert.match(
    product(water, water.initial(), d),
    /Wartung bleibt nötig.*Nicht alles entnommene Wasser/,
  );
});
for (const save of old)
  test(`streamline old ${save.unit}/${save.profile}: every old cursor, archived responses, support and nested panels survive`, () => {
    const key = `${save.unit}.${save.profile}.v1`,
      previous = legacyTasksFor(save.unit, save.profile);
    for (let i = 0; i < previous.length; i++) {
      const raw = structuredClone(save);
      raw.view = 'task';
      raw.records[key].index = i;
      const s = restoreLearning(raw)!;
      assert.equal(s.routeVersion, 2);
      for (const [id, attempt] of Object.entries(raw.records[key].attempts))
        assert.deepEqual(s.records[key].attempts[id], attempt, id);
      assert.ok(active(s)!.task);
      assert.deepEqual(
        restoreLearning(JSON.parse(JSON.stringify(s)))!.records,
        s.records,
      );
      if (save.unit === 'r')
        assert.equal(
          s.records[key].attempts['review.scope']?.process ?? 'draft',
          'draft',
        );
    }
  });
test('streamline old review cannot skip unseen country claims after scope reordering', () => {
  const raw = structuredClone(old.find((s: any) => s.unit === 'r'));
  const key = `r.${raw.profile}.v1`;
  raw.view = 'task';
  raw.records[key].index = 1;
  raw.records[key].attempts = Object.fromEntries(
    Object.entries(raw.records[key].attempts).filter(
      ([id]) => id === 'review.KEN.claim',
    ),
  );
  assert.equal(active(restoreLearning(raw)!)!.task.id, 'review.GHA.claim');
});
test('streamline cocoa workspace shows only own answers, no future processing solution; adoption stays explicit', () => {
  let s = act(newLearning(), 'recommend', 'esa', 's3');
  const render = () => {
    const a = active(s)!;
    return simulationMaterial(a.task, 'esa', a.attempt!, a.record.attempts);
  };
  assert.equal((render().match(/Noch offen/g) ?? []).length, 3);
  assert.doesNotMatch(
    render().split('<details')[0],
    /Rösten|Kakaomasse|Presskuchen/,
  );
  s = act(s, 'answer', 'beans', 'step');
  s = act(s, 'check');
  s = act(s, 'next');
  assert.match(render(), /Getrocknete Bohnen.*Geprüft/);
  assert.equal((render().match(/Noch offen/g) ?? []).length, 2);
  s = act(s, 'help');
  s = act(s, 'help');
  s = act(s, 'help');
  assert.equal(active(s)!.attempt!.exampleUsed, false);
  s = act(s, 'adopt');
  s = act(s, 'next');
  assert.match(render(), /Rösten und mahlen.*Beispiel genutzt/);
});

test('streamline unfinished old practice keeps its changed answer and earlier submission without granting completion', () => {
  const raw = structuredClone(old.find((s: any) => s.unit === 's1'));
  raw.view = 'task';
  raw.records['s1.esa.v1'].index = 0;
  const attempt = raw.records['s1.esa.v1'].attempts['kenia.times.amina-direct'];
  attempt.answers['amina-direct'] = '21';
  attempt.process = 'draft';
  attempt.factual = 'ungraded';
  attempt.adopted = false;
  attempt.revised = true;
  const restored = restoreLearning(raw)!;
  const kept =
    restored.records['s1.esa.v1'].attempts['kenia.times.amina-direct'];
  assert.equal(kept.answers['amina-direct'], '21');
  assert.equal(kept.process, 'draft');
  assert.equal(kept.factual, 'ungraded');
  assert.deepEqual(kept.submissions, attempt.submissions);
  assert.deepEqual(kept.materialPanels, attempt.materialPanels);
  assert.equal(kept.exampleUsed, true);
  assert.equal(active(restored)!.task.id, 'kenia.times.amina-north');
  assert.deepEqual(restoreLearning(restored)!.records, restored.records);
});
