import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tasksFor } from '../src/learning/tasks.ts';
import { profileIds } from '../src/learning/profiles.ts';
import {
  active,
  newLearning,
  reduceLearning,
  restoreLearning,
  type LearningState,
} from '../src/learning/storage.ts';
import { evaluate } from '../src/learning/progress.ts';
import { topicAnswers } from './topic-oracles.ts';
const act = (
  s: LearningState,
  op: Parameters<typeof reduceLearning>[1]['op'],
  value?: string,
  field?: string,
) => reduceLearning(s, { type: 'learning', op, value, field });
for (const unit of ['a', 'n', 'd', 'e'] as const)
  for (const profile of profileIds)
    for (const supported of [false, true])
      test(`Gate2 complete ${unit}/${profile} supported=${supported}: independent facts, provenance and restore`, () => {
        let s = act(newLearning(), 'recommend', profile, unit);
        const count = tasksFor(unit, profile).length;
        for (let i = 0; i < count; i++) {
          const t = active(s)!.task;
          assert.equal(active(s)!.index, i);
          if (profile === 'foerder' || profile === 'esa')
            assert.equal(t.fields.length, 1, t.id);
          if (profile === 'foerder')
            assert.ok(t.fields.every((f) => f.kind === 'choice'));
          assert.ok(t.focus?.paragraphs.length && t.focus.words.length);
          assert.notEqual(t.hints[0], t.hints[1]);
          const answers = topicAnswers(t, profile === 'msa' ? 'shade' : 'cool');
          if (!supported) {
            for (const f of t.fields) {
              assert.ok(answers[f.id], t.id + ':' + f.id);
              if (f.kind !== 'text' && f.expected !== 'either') {
                const wrong =
                  f.kind === 'integer'
                    ? '999'
                    : f.options!.find(([id]) => id !== answers[f.id])![0];
                const values = Object.fromEntries(
                  t.fields.map((f) => [f.id, answers[f.id]]),
                );
                const bad = evaluate(t, { ...values, [f.id]: wrong });
                assert.equal(bad.ready, false, t.id);
                assert.equal(bad.error, true);
                assert.equal(
                  evaluate(t, { ...values, [f.id]: wrong }, 1).kind,
                  'hint',
                );
              }
              s = act(s, 'answer', answers[f.id], f.id);
            }
            s = act(s, 'check');
          } else {
            for (let j = 0; j < 3; j++) s = act(s, 'help');
            assert.equal(active(s)!.attempt!.exampleUsed, false);
            s = act(s, 'adopt');
          }
          const a = active(s)!.attempt!;
          assert.notEqual(a.process, 'draft', t.id);
          assert.equal(a.exampleUsed, supported);
          if (t.fields.some((f) => f.kind === 'text'))
            assert.equal(a.factual, 'ungraded');
          if (t.id === 'future.weight' || t.id === 'future.plan' || t.personal)
            assert.equal(evaluate(active(s)!.task, a.answers).kind, 'neutral');
          const restored = restoreLearning(s)!;
          assert.deepEqual(restored.records, s.records, t.id);
          s = act(restored, 'next');
        }
        assert.equal(s.view, 'journal');
      });
test('Gate2 goal conflicts allow actual concrete weighting with both plans, changes invalidate later proofs and preserve historical labels', () => {
  for (const plan of ['cool', 'shade'] as const)
    for (const goal of ['loss', 'access'])
      for (const weight of ['adapt', 'tradeoff']) {
        let s = act(newLearning(), 'recommend', 'esa', 'e');
        while (s.view !== 'journal') {
          const t = active(s)!.task;
          for (const f of t.fields)
            s = act(
              s,
              'answer',
              t.id === 'future.goal'
                ? goal
                : t.id === 'future.weight'
                  ? weight
                  : topicAnswers(t, plan)[f.id],
              f.id,
            );
          s = act(s, 'check');
          assert.notEqual(active(s)!.attempt!.process, 'draft', t.id);
          s = act(s, 'next');
        }
        const r = s.records['e.esa.v1'],
          before = structuredClone(r.attempts['future.weight'].submissions);
        r.index = tasksFor('e', 'esa').findIndex((t) => t.id === 'future.plan');
        s.view = 'task';
        s = act(s, 'answer', plan === 'cool' ? 'shade' : 'cool', 'plan');
        for (const id of ['future.evidence', 'future.limit', 'future.weight'])
          assert.equal(s.records['e.esa.v1'].attempts[id].process, 'draft');
        assert.deepEqual(
          s.records['e.esa.v1'].attempts['future.weight'].submissions,
          before,
        );
        assert.match(
          before[0].labels!.weight,
          plan === 'cool' ? /30|Kühlung/ : /60/,
        );
        assert.deepEqual(restoreLearning(s)!.records, s.records);
      }
});
test('Gate2 all directed profile switches preserve actual topic attempts, including new ungraded answers and examples', () => {
  for (const unit of ['a', 'n', 'd', 'e'] as const)
    for (const from of profileIds)
      for (const to of profileIds.filter((x) => x !== from)) {
        let s = act(newLearning(), 'recommend', from, unit);
        const task = active(s)!.task;
        for (const f of task.fields)
          s = act(s, 'answer', topicAnswers(task)[f.id], f.id);
        s = act(s, 'check');
        const old = structuredClone(s.records[`${unit}.${from}.v1`]);
        s = act(s, 'request-profile', to);
        const cancelled = act(s, 'cancel-profile');
        assert.equal(cancelled.profile, from);
        assert.deepEqual(cancelled.records[`${unit}.${from}.v1`], old);
        s = act(s, 'confirm-profile');
        assert.equal(active(s)!.attempt!.identity.profileId, to);
        assert.deepEqual(active(s)!.attempt!.answers, {});
        for (let i = 0; i < 3; i++) s = act(s, 'help');
        s = act(s, 'adopt');
        s = restoreLearning(s)!;
        s = act(s, 'request-profile', from);
        s = act(s, 'confirm-profile');
        assert.deepEqual(s.records[`${unit}.${from}.v1`], old);
      }
});
test('Gate2 multi-part findings preserve correct parts and do not count empty or malformed inputs as factual errors', () => {
  for (const unit of ['a', 'n', 'd', 'e'] as const)
    for (const p of ['msa', 'ahr'] as const) {
      const t = tasksFor(unit, p).find(
        (t) => t.fields.length > 1 && !t.reference,
      )!;
      const oracle = topicAnswers(t),
        all = Object.fromEntries(t.fields.map((f) => [f.id, oracle[f.id]]));
      assert.equal(evaluate(t, all).ready, true);
      const f = t.fields[0],
        wrong =
          f.kind === 'integer'
            ? '999'
            : f.options!.find(([id]) => id !== all[f.id])![0];
      const partial = evaluate(t, { ...all, [f.id]: wrong });
      assert.equal(partial.kind, 'partial');
      assert.ok(partial.parts.some((p) => p.status === 'correct'));
      assert.equal(evaluate(t, { ...all, [f.id]: '' }).error, false);
      if (f.kind === 'integer')
        assert.equal(evaluate(t, { ...all, [f.id]: '1.02' }).error, false);
    }
});
