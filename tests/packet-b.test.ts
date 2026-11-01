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
for (const unit of ['s1', 's2'] as const)
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
