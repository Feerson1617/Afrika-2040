import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  active,
  newLearning,
  reduceLearning,
  restoreLearning,
  type LearningState,
} from '../src/learning/storage.ts';
import { tasksFor } from '../src/learning/tasks.ts';
import { profileIds } from '../src/learning/profiles.ts';
import { answers } from './learning-oracles.ts';
const act = (
  s: LearningState,
  op: Parameters<typeof reduceLearning>[1]['op'],
  value?: string,
  field?: string,
) => reduceLearning(s, { type: 'learning', op, value, field });
for (const unit of ['s1', 's2', 's3', 's4', 's5', 's6', 'o', 'r'] as const)
  for (const profile of profileIds)
    for (const supported of [false, true])
      test(`PaketB ${unit}/${profile} supported=${supported}: full path, independent answers and roundtrip`, () => {
        let s = act(newLearning(), 'recommend', profile, unit);
        for (const raw of tasksFor(unit, profile)) {
          const task = active(s)!.task;
          assert.equal(task.id, raw.id);
          for (const id of task.simulation?.required ?? [])
            s = act(s, 'simulate', id);
          s = act(s, 'check');
          assert.equal(active(s)!.attempt!.failures, 0);
          if (supported) {
            for (let i = 0; i < 3; i++) s = act(s, 'help');
            s = act(s, 'adopt');
          } else {
            for (const f of task.fields) {
              assert.notEqual(
                answers(task)[f.id],
                undefined,
                task.id + '/' + f.id,
              );
              s = act(s, 'answer', answers(task)[f.id], f.id);
            }
            s = act(s, 'check');
          }
          assert.notEqual(active(s)!.attempt!.process, 'draft', task.id);
          assert.deepEqual(restoreLearning(s)!.records, s.records);
          s = act(s, 'next');
        }
        assert.equal(s.view, 'journal');
      });
for (const profile of profileIds)
  test(`PaketB ${profile}: all route choices survive adoption, change invalidates proof and historical context remains`, () => {
    let s = act(newLearning(), 'recommend', profile, 's1');
    const move = (id: string) => {
      s.records[`s1.${profile}.v1`].index = tasksFor('s1', profile).findIndex(
        (t) => t.id === id,
      );
      s = act(s, 'rework');
    };
    // Create attempts normally, never fabricate identity/completion flags.
    for (
      let i = 0;
      i < tasksFor('s1', profile).length && s.view !== 'journal';
      i++
    ) {
      for (const id of active(s)!.task.simulation?.required ?? [])
        s = act(s, 'simulate', id);
      s = act(s, 'help');
      s = act(s, 'help');
      s = act(s, 'help');
      s = act(s, 'adopt');
      s = act(s, 'next');
    }
    s.view = 'task';
    move('kenia.revised.choice');
    for (const plan of ['north', 'direct', 'south']) {
      s = act(s, 'answer', plan, 'plan');
      s = act(s, 'check');
      const history = structuredClone(active(s)!.attempt!.submissions);
      s = act(s, 'adopt');
      assert.equal(active(s)!.attempt!.answers.plan, plan);
      assert.deepEqual(active(s)!.attempt!.submissions, history);
      s = act(s, 'next');
      const a = active(s)!;
      assert.equal(a.attempt!.process, 'draft');
      const before = a.index;
      s = act(s, 'next');
      assert.equal(active(s)!.index, before);
      s = act(s, 'adopt');
      assert.equal(active(s)!.attempt!.factual, 'correct');
      assert.ok(
        active(s)!.attempt!.submissions.at(-1)!.contextKey!.includes(plan),
      );
      assert.deepEqual(restoreLearning(s)!.records, s.records);
      move('kenia.revised.choice');
    }
  });
test('PaketB exploration cannot be claimed through example adoption or an old completion flag', () => {
  let s = act(newLearning(), 'recommend', 'msa', 's2');
  s.records['s2.msa.v1'].index = tasksFor('s2', 'msa').findIndex(
    (t) => t.id === 'demand.explore',
  );
  s = act(s, 'adopt');
  const index = active(s)!.index;
  s = act(s, 'next');
  assert.equal(active(s)!.index, index);
  for (const id of ['bus', 'path']) s = act(s, 'simulate', id);
  s = act(s, 'check');
  s = act(s, 'next');
  assert.notEqual(active(s)!.index, index);
});
test('PaketB Ghana: every complete 120 GE allocation is legitimate; repeated +20 cannot overspend', async () => {
  const { adjustAllocation, allocationData } =
    await import('../src/learning/allocation.ts');
  const { shareModel } = await import('../src/regions/share.ts');
  const { evaluate } = await import('../src/learning/progress.ts');
  let count = 0;
  for (let payout = 0; payout <= 120; payout += 20)
    for (let reserve = 0; reserve <= 120 - payout; reserve += 20) {
      const training = 120 - payout - reserve,
        id = `${payout}-${reserve}-${training}`;
      let s = act(newLearning(), 'recommend', 'foerder', 's4');
      s.records['s4.foerder.v1'].index = tasksFor('s4', 'foerder').findIndex(
        (t) => t.id === 'share.plan',
      );
      s = act(s, 'answer', id, 'plan');
      s = act(s, 'check');
      assert.equal(active(s)!.attempt!.factual, 'na');
      assert.equal(evaluate(active(s)!.task, { plan: id }).kind, 'neutral');
      count++;
    }
  assert.equal(count, 28);
  let id = '0-0-0';
  for (let i = 0; i < 10; i++) id = adjustAllocation(id, 'payout', '20');
  assert.equal(id, '120-0-0');
  assert.equal(shareModel(allocationData(id)).left, 0);
});
test('PaketB all 52 variants retain separate IDs and never grade arbitrary own text as factual knowledge', async () => {
  const { implementedUnits, variantCatalog } =
    await import('../src/learning/catalog.ts');
  const { evaluate } = await import('../src/learning/progress.ts');
  assert.equal(variantCatalog.length, 52);
  assert.ok(variantCatalog.every((v) => v.status === 'implemented'));
  for (const unit of implementedUnits)
    for (const p of profileIds) {
      const tasks = tasksFor(unit, p);
      assert.ok(tasks.length >= 3);
      assert.equal(new Set(tasks.map((t) => t.id)).size, tasks.length);
      if (p === 'foerder' || p === 'esa')
        assert.ok(tasks.every((t) => t.fields.every((f) => f.kind !== 'text')));
      for (const task of tasks)
        for (const f of task.fields)
          if (f.kind === 'text') {
            const values = Object.fromEntries(
              task.fields.map((f) => [
                f.id,
                f.kind === 'text'
                  ? 'Keine Ahnung. Irgendein eigener Text.'
                  : '',
              ]),
            );
            const e = evaluate(task, values);
            assert.equal(e.factual, 'ungraded');
            assert.equal(e.error, false);
          }
    }
});
test('PaketB every directed profile switch in all 13 areas keeps actual current answers and identities separate', async () => {
  const { implementedUnits } = await import('../src/learning/catalog.ts');
  for (const unit of implementedUnits)
    for (const from of profileIds)
      for (const to of profileIds) {
        if (from === to) continue;
        let s = act(newLearning(), 'recommend', from, unit);
        const original = structuredClone(s.records[`${unit}.${from}.v1`]);
        s = act(s, 'request-profile', to);
        s = act(s, 'cancel-profile');
        assert.equal(s.profile, from);
        assert.deepEqual(s.records[`${unit}.${from}.v1`], original);
        s = act(s, 'request-profile', to);
        s = act(s, 'confirm-profile');
        assert.equal(s.profile, to);
        assert.equal(active(s)!.attempt!.identity.profileId, to);
        assert.deepEqual(s.records[`${unit}.${from}.v1`], original);
        assert.deepEqual(restoreLearning(s)!.records, s.records);
      }
});
test('PaketB helpers use concrete model operations and a budget example names both actual plans', () => {
  for (const [unit, term] of [
    ['s1', 'Einstieg'],
    ['s2', 'Plätze'],
    ['s3', 'Bohnen'],
    ['s4', '120 GE'],
    ['s5', 'Entnahme'],
    ['s6', 'Zusatzfeld'],
    ['o', 'Stadtpunkte'],
    ['r', 'Beleg'],
  ] as const) {
    const task = tasksFor(unit, 'esa').find((t) => t.simulation)!;
    assert.ok(task.hints[1].includes(term), unit);
  }
  let s = act(newLearning(), 'recommend', 'ahr', 's4');
  for (const raw of tasksFor('s4', 'ahr')) {
    const t = active(s)!.task;
    if (t.id === 'share.perspective') break;
    for (const id of t.simulation?.required ?? []) s = act(s, 'simulate', id);
    for (const f of t.fields) s = act(s, 'answer', answers(t)[f.id], f.id);
    s = act(s, 'check');
    s = act(s, 'next');
  }
  const example = active(s)!.task.fields[0].example!;
  assert.match(example, /40 GE Auszahlung, 40 GE Rücklage, 40 GE Fortbildung/);
  assert.match(example, /60 GE Auszahlung, 20 GE Rücklage, 40 GE Fortbildung/);
  assert.match(example, /Auszahlung heute/);
  assert.doesNotMatch(example, /Mir ist die Rücklage/);
});
for (const profile of profileIds)
  test(`PaketB ${profile}: every new episode proposal direction rechecks contextual proof and preserves valid choices`, async () => {
    const { canContinue } = await import('../src/learning/storage.ts');
    for (const unit of ['s1', 's2', 's3', 's5', 's6'] as const) {
      let complete = act(newLearning(), 'recommend', profile, unit);
      for (const raw of tasksFor(unit, profile)) {
        const task = active(complete)!.task;
        for (const id of task.simulation?.required ?? [])
          complete = act(complete, 'simulate', id);
        for (const f of task.fields)
          complete = act(complete, 'answer', answers(task)[f.id], f.id);
        complete = act(complete, 'check');
        complete = act(complete, 'next');
      }
      const list = tasksFor(unit, profile),
        key = `${unit}.${profile}.v1`;
      for (const [index, choice] of list.entries())
        if (choice.id.endsWith('.choice')) {
          let s = structuredClone(complete);
          s.view = 'task';
          s.records[key].index = index;
          const original = s.records[key].attempts[choice.id].answers.plan;
          const ordered = [
            ...choice.fields[0]
              .options!.map(([id]) => id)
              .filter((id) => id !== original),
            original,
          ];
          for (const id of ordered) {
            s.records[key].index = index;
            s = act(s, 'answer', id, 'plan');
            s = act(s, 'check');
            const history = structuredClone(active(s)!.attempt!.submissions);
            s = act(s, 'adopt');
            assert.equal(active(s)!.attempt!.answers.plan, id);
            assert.deepEqual(active(s)!.attempt!.submissions, history);
            const dependentIndex = list.findIndex((t) =>
              t.dependsOn?.includes(choice.id),
            );
            s.records[key].index = dependentIndex;
            assert.equal(active(s)!.attempt!.process, 'draft');
            active(s)!.attempt!.process = 'submitted';
            assert.equal(
              canContinue(active(s)!.task, active(s)!.attempt!),
              false,
            );
            active(s)!.attempt!.process = 'draft';
            s = act(s, 'adopt');
            assert.equal(active(s)!.attempt!.factual, 'correct');
            assert.ok(
              active(s)!.attempt!.submissions.at(-1)!.contextKey!.includes(id),
            );
            assert.deepEqual(restoreLearning(s)!.records, s.records);
          }
        }
    }
  });
test('PaketB final material labels real places honestly and factual positions are varied but deterministic', async () => {
  const { simulationMaterial } =
    await import('../src/learning/simulation-material.ts');
  const html = simulationMaterial(
    tasksFor('o', 'foerder')[0],
    'foerder',
    {} as any,
  );
  assert.match(html, /<caption>Reale Städte und Länder · Übersicht<\/caption>/);
  assert.doesNotMatch(html, /<caption>Erfundenes Modell/);
  const chain = tasksFor('s3', 'foerder').filter((t) =>
    t.id.startsWith('cocoa.chain.'),
  );
  const positions = chain.map((t) =>
    t.fields[0].options!.findIndex(([id]) => id === t.fields[0].expected),
  );
  assert.ok(new Set(positions).size > 1);
  assert.deepEqual(
    chain.map((t) => t.fields[0].options),
    tasksFor('s3', 'foerder')
      .filter((t) => t.id.startsWith('cocoa.chain.'))
      .map((t) => t.fields[0].options),
  );
});
test('PaketB final displayed scenario follows the chosen proposal and clears an obsolete dependent view', () => {
  let s = act(newLearning(), 'recommend', 'foerder', 's3');
  while (active(s)!.task.id !== 'cocoa.final.choice') {
    const t = active(s)!.task;
    for (const id of t.simulation?.required ?? []) s = act(s, 'simulate', id);
    for (const f of t.fields) s = act(s, 'answer', answers(t)[f.id], f.id);
    s = act(s, 'check');
    s = act(s, 'next');
  }
  s = act(s, 'answer', 'process', 'plan');
  s = act(s, 'check');
  assert.equal(active(s)!.attempt!.simulationSelection, 'process');
  s = act(s, 'next');
  assert.equal(active(s)!.task.simulation!.preset, 'process');
  s = act(s, 'simulate', 'quality');
  s = act(s, 'back');
  s = act(s, 'answer', 'quality', 'plan');
  s = act(s, 'check');
  s = act(s, 'next');
  assert.equal(active(s)!.task.simulation!.preset, 'quality');
  assert.equal(active(s)!.attempt!.simulationSelection, undefined);
});
