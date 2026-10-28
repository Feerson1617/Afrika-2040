import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  recommendation,
  consumedRecommendation,
} from '../src/learning/entry.ts';
import {
  active,
  newLearning,
  reduceLearning,
  restoreLearning,
  type LearningState,
} from '../src/learning/storage.ts';
import { profiles, profileIds } from '../src/learning/profiles.ts';
import { tasksFor } from '../src/learning/tasks.ts';
import { answers } from './learning-oracles.ts';
import { taskWords } from '../src/learning/words.ts';
const act = (
  s: LearningState,
  op: Parameters<typeof reduceLearning>[1]['op'],
  value?: string,
  field?: string,
) => reduceLearning(s, { type: 'learning', op, value, field });
const start = () => act(newLearning(), 'recommend', 'ahr', 'c');
function submit(s: LearningState) {
  for (const f of active(s)!.task.fields)
    s = act(s, 'answer', answers(active(s)!.task)[f.id], f.id);
  return act(s, 'check');
}
test('entry contract accepts only a complete unique closed pair and preserves path, other parameters and hash', () => {
  assert.deepEqual(recommendation('?lernweg=esa&bereich=s1'), {
    profile: 'esa',
    unit: 's1',
  });
  for (const search of [
    '?lernweg=esa',
    '?bereich=c',
    '?lernweg=bad&bereich=c',
    '?lernweg=esa&bereich=n',
    '?lernweg=esa&lernweg=ahr&bereich=c',
    '?lernweg=esa&bereich=c&bereich=s1',
  ])
    assert.equal(recommendation(search), undefined);
  assert.equal(
    consumedRecommendation(
      'https://example.test/Afrika-2040/?keep=a%20b&lernweg=esa&bereich=c&keep=2#read',
    ),
    '/Afrika-2040/?keep=a+b&keep=2#read',
  );
});
test('all twelve new conflicting recommendations require confirmation, cancel retains source, confirm resumes separate target and unit', () => {
  for (const from of profileIds)
    for (const to of profileIds.filter((p) => p !== from)) {
      let s = act(newLearning(), 'recommend', from, 'c');
      s = submit(s);
      const old = structuredClone(s.records);
      s = act(s, 'recommend', to, 's1');
      assert.equal(s.profile, from);
      assert.equal(s.unit, 'c');
      assert.deepEqual(s.records, old);
      const cancelled = act(s, 'cancel-profile');
      assert.equal(cancelled.profile, from);
      assert.equal(cancelled.unit, 'c');
      assert.deepEqual(cancelled.records, old);
      s = act(s, 'confirm-profile');
      assert.equal(s.profile, to);
      assert.equal(s.unit, 's1');
      assert.deepEqual(s.records[`c.${from}.v1`], old[`c.${from}.v1`]);
      assert.equal(active(s)!.attempt!.identity.profileId, to);
      assert.deepEqual(active(s)!.attempt!.answers, {});
      assert.deepEqual(restoreLearning(s)!.records, s.records);
    }
});
test('recommending same profile resumes existing index without changing answers or provenance', () => {
  let s = submit(start());
  s = act(s, 'next');
  s = act(s, 'answer', 'Mein ungeprüfter Gedanke.', 'explanation');
  const before = structuredClone(s.records);
  s = act(s, 'recommend', 'ahr', 'c');
  assert.deepEqual(s.records, before);
  assert.equal(active(s)!.index, 1);
});
for (const mode of ['numeric', 'written', 'oral'] as const)
  test(`forty newest ${mode} submissions and compacted count survive reload without losing provenance`, () => {
    let s = start();
    if (mode !== 'numeric') {
      s = submit(s);
      s = act(s, 'next');
      if (mode === 'oral') s = act(s, 'oral');
    }
    s = act(s, 'help');
    for (let i = 0; i < 47; i++) {
      if (mode === 'numeric') s = submit(s);
      else {
        s = act(s, 'answer', 'Eigener Gedanke ' + i, 'explanation');
        s = act(s, 'check');
      }
    }
    const p = active(s)!.attempt!;
    assert.equal(p.submissions.length, 40);
    assert.equal(p.olderSubmissions, 7);
    assert.equal(p.submissions.at(-1)!.support, 'help');
    if (mode !== 'numeric') {
      assert.equal(p.factual, 'ungraded');
      assert.equal(p.submissions[0].answers.explanation, 'Eigener Gedanke 7');
      assert.equal(
        p.submissions.at(-1)!.answers.explanation,
        'Eigener Gedanke 46',
      );
    }
    assert.deepEqual(
      restoreLearning(JSON.parse(JSON.stringify(s)))!.records,
      s.records,
    );
  });
test('restore compacts valid overlong old submissions once, adds to prior count and retains current draft and example origin', () => {
  let s = submit(start());
  s = act(s, 'next');
  s = act(s, 'help');
  s = act(s, 'help');
  s = act(s, 'help');
  s = act(s, 'adopt');
  s = act(s, 'answer', 'Neuer ungeprüfter Entwurf.', 'explanation');
  const p = active(s)!.attempt!;
  p.olderSubmissions = 9;
  p.submissions = Array.from({ length: 55 }, (_, i) => ({
    answers: { explanation: 'Alt ' + i },
    factual: 'ungraded',
    support: 'example',
  }));
  p.submissions.splice(4, 0, null as any); // Corrupted items aren't learner submissions.
  let restored = restoreLearning(s)!;
  const got = active(restored)!.attempt!;
  assert.equal(got.olderSubmissions, 24);
  assert.equal(got.submissions.length, 40);
  assert.equal(got.submissions[0].answers.explanation, 'Alt 15');
  assert.equal(got.submissions.at(-1)!.answers.explanation, 'Alt 54');
  assert.equal(got.answers.explanation, 'Neuer ungeprüfter Entwurf.');
  assert.equal(got.factual, 'ungraded');
  assert.equal(got.process, 'draft');
  assert.equal(got.exampleUsed, true);
  assert.equal(got.adopted, false);
  assert.deepEqual(restoreLearning(restored), restored);
  restored = act(restored, 'check');
  assert.equal(active(restored)!.attempt!.olderSubmissions, 25);
});
test('every pilot task has independent factual oracles, retained IDs/counts and contextual word support', () => {
  for (const [index, profile] of profileIds.entries())
    for (const unit of ['c', 's1'] as const) {
      assert.equal(
        tasksFor(unit, profile).length,
        (unit === 'c' ? [14, 13, 8, 8] : [4, 6, 4, 4])[index],
      );
      let s = act(newLearning(), 'recommend', profile, unit);
      for (const task of tasksFor(unit, profile)) {
        assert.ok(taskWords(task).length);
        s = submit(s);
        assert.notEqual(active(s)!.attempt!.process, 'draft', task.id);
        if (task.fields.some((f) => f.kind === 'text'))
          assert.equal(active(s)!.attempt!.factual, 'ungraded');
        s = act(s, 'next');
      }
      assert.equal(s.view, 'journal');
    }
  assert.deepEqual(
    taskWords(tasksFor('c', 'foerder')[0]).map((x) => x[0]),
    ['Geburt'],
  );
  assert.deepEqual(
    taskWords(tasksFor('c', 'foerder')[7]).map((x) => x[0]),
    ['Schätzung', 'Million'],
  );
  assert.ok(profiles.foerder.standardHint);
});

test('all 16 region situations have independent positive and every negative control regardless of stable display slot', async () => {
  const { regionPositionCases } = await import('./region-position-cases.ts');
  const { studies } = await import('../src/regions/registry.ts');
  const positions: number[] = [];
  for (const { id, step, data, expected } of regionPositionCases()) {
    const spec = studies[id]!;
    function order(d: typeof data) {
      const groups: Record<string, string[]> = {};
      spec.task(d, step, {
        button: () => '',
        esc: String,
        radio: (g: string, v: string) => {
          (groups[g.slice(6)] ??= []).push(v);
          return '';
        },
      } as any);
      return groups;
    }
    const before = order(data);
    for (const [field, value] of Object.entries(expected))
      if (field === 'why') data.why = value;
      else data.answers[field] = value;
    assert.equal(spec.evaluate(step, data, 0).feedback.kind, 'correct');
    assert.deepEqual(order(data), before);
    assert.deepEqual(order(JSON.parse(JSON.stringify(data))), before);
    for (const [field, value] of Object.entries(expected)) {
      positions.push(before[field].indexOf(value) + 1);
      for (const wrong of before[field].filter((v) => v !== value)) {
        const copy = structuredClone(data);
        if (field === 'why') copy.why = wrong;
        else copy.answers[field] = wrong;
        assert.match(
          spec.evaluate(step, copy, 0).feedback.kind,
          /incorrect|partial/,
        );
      }
    }
  }
  assert.equal(positions.length, 16);
  for (const slot of [1, 2, 3])
    assert.ok(positions.filter((p) => p === slot).length >= 4);
});
