import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tasksFor } from '../src/learning/tasks.ts';
import { profiles, profileIds } from '../src/learning/profiles.ts';
import { variantCatalog } from '../src/learning/catalog.ts';
import {
  active,
  newLearning,
  reduceLearning,
  restoreLearning,
  areaId,
  type LearningState,
} from '../src/learning/storage.ts';
import { evaluate, exampleValue } from '../src/learning/progress.ts';
import { readSession, saveSession, storageKey } from '../src/storage.ts';
import { initialState, reduce } from '../src/state.ts';
import { readFileSync } from 'node:fs';
function act(
  s: LearningState,
  op: Parameters<typeof reduceLearning>[1]['op'],
  value?: string,
  field?: string,
) {
  return reduceLearning(s, { type: 'learning', op, value, field });
}
function start(profile: (typeof profileIds)[number], unit: 'c' | 's1' = 'c') {
  let s = act(newLearning(), 'unit', unit);
  s = act(s, 'request-profile', profile);
  return act(s, 'confirm-profile');
}
function solve(s: LearningState) {
  const a = active(s)!;
  for (const f of a.task.fields)
    s = act(
      s,
      'answer',
      f.kind === 'text' ? 'Mein eigener ungeprüfter Gedanke.' : exampleValue(f),
      f.id,
    );
  return act(s, 'check');
}
const store = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
};
test('catalog has 52 distinct area profiles but only eight explicit pilot entries; no silent fallback', () => {
  assert.equal(variantCatalog.length, 52);
  assert.equal(new Set(variantCatalog.map((v) => v.areaId)).size, 52);
  assert.equal(
    variantCatalog.filter((v) => v.status === 'implemented').length,
    4,
  );
  assert.equal(
    variantCatalog.filter((v) => v.status === 'early-comparison-only').length,
    4,
  );
});
test('each subtask has complete contract and unique identity; forms require different work', () => {
  const ids = new Set<string>();
  for (const unit of ['c', 's1'] as const)
    for (const profile of profileIds) {
      const tasks = tasksFor(unit, profile);
      assert.ok(tasks.length >= 3);
      for (const t of tasks) {
        const key = areaId(unit, profile) + ':' + t.id;
        assert.ok(!ids.has(key), key);
        ids.add(key);
        assert.ok(t.material && t.instruction && t.conceptId);
        assert.equal(t.hints.length, 3);
        assert.ok(t.criteria.length);
        assert.ok(t.fields.length);
        for (const f of t.fields)
          assert.ok(f.kind === 'text' ? f.example : f.expected);
      }
    }
  assert.ok(
    tasksFor('c', 'foerder').every(
      (t) => t.fields.length === 1 && t.fields[0].kind === 'choice',
    ),
  );
  assert.equal(
    tasksFor('c', 'msa')
      .flatMap((t) => t.fields)
      .filter((f) => f.kind === 'text').length,
    1,
  );
  assert.ok(
    tasksFor('c', 'ahr')
      .flatMap((t) => t.fields)
      .filter((f) => f.kind === 'text').length >= 3,
  );
  assert.ok(tasksFor('s1', 'msa').some((t) => t.id === 'kenia.used-section'));
  assert.ok(profiles.esa.standardHint && !profiles.ahr.standardHint);
});
for (const profile of profileIds)
  for (const unit of ['c', 's1'] as const)
    for (const supported of [false, true])
      test(`complete ${unit}/${profile} supported=${supported} retains actual proof scope`, () => {
        let s = start(profile, unit);
        const count = tasksFor(unit, profile).length;
        for (let i = 0; i < count; i++) {
          const a = active(s)!;
          assert.equal(a.index, i);
          assert.equal(
            a.attempt!.standardScaffold,
            profiles[profile].standardHint,
          );
          s = act(s, 'check');
          assert.equal(active(s)!.attempt!.failures, 0);
          assert.equal(active(s)!.attempt!.process, 'draft');
          if (supported) {
            for (let h = 0; h < 3; h++) s = act(s, 'help');
            assert.equal(active(s)!.attempt!.exampleUsed, false);
            s = act(s, 'adopt');
          } else s = solve(s);
          const p = active(s)!.attempt!;
          assert.notEqual(p.process, 'draft');
          assert.equal(p.exampleUsed, supported);
          if (a.task.fields.some((f) => f.kind === 'text'))
            assert.equal(p.factual, 'ungraded');
          if (a.task.fields.some((f) => f.expected === 'either'))
            assert.equal(p.factual, 'na');
          const restored = restoreLearning(JSON.parse(JSON.stringify(s)))!;
          assert.deepEqual(restored.records, s.records);
          s = act(restored, 'next');
        }
        assert.equal(s.view, 'journal');
        assert.equal(
          Object.keys(s.records[areaId(unit, profile)].attempts).length,
          count,
        );
      });
test('numeric oracles, German notations, partial answers and two genuine errors survive format interruptions', () => {
  const t = tasksFor('c', 'ahr').find(
    (t) => t.id === 'population.base.balance',
  )!;
  for (const values of [
    ['30', '-10', '1020'],
    ['30', '−10', '1.020'],
    [' 30 ', ' −10 ', ' 1.020 '],
  ])
    assert.equal(
      evaluate(
        t,
        Object.fromEntries(
          ['natural', 'migration', 'end'].map((k, i) => [k, values[i]]),
        ),
      ).ready,
      true,
    );
  for (const bad of ['30abc', '1.02', '1..020', '1,020', '10+20', '−']) {
    const e = evaluate(t, { natural: '30', migration: '−10', end: bad });
    assert.equal(e.error, false);
    assert.equal(e.kind, 'partial');
    assert.equal(e.parts[0].status, 'correct');
  }
  let s = start('ahr');
  for (const f of t.fields) s = act(s, 'answer', '0', f.id);
  s = act(s, 'check');
  assert.equal(active(s)!.attempt!.failures, 1);
  s = act(s, 'answer', '1.02', 'end');
  s = act(s, 'check');
  assert.equal(active(s)!.attempt!.failures, 1);
  s = act(s, 'answer', '0', 'end');
  s = act(s, 'check');
  assert.equal(active(s)!.attempt!.failures, 2);
  assert.equal(active(s)!.attempt!.help, 3);
  assert.equal(active(s)!.attempt!.exampleUsed, false);
  s = act(s, 'adopt');
  assert.equal(active(s)!.attempt!.factual, 'correct');
  s = act(s, 'answer', '1.020', 'end');
  s = act(s, 'check');
  assert.equal(active(s)!.attempt!.adopted, false);
  assert.equal(active(s)!.attempt!.exampleUsed, true);
  const transfer = tasksFor('c', 'msa').find(
    (t) => t.id === 'population.transfer.balance',
  )!;
  assert.equal(
    evaluate(transfer, {
      natural: '16',
      migration: '−12',
      change: '4',
      end: '804',
    }).ready,
    true,
  );
  const counter = tasksFor('c', 'ahr').find(
    (t) => t.id === 'population.counter.balance',
  )!;
  assert.equal(
    evaluate(counter, {
      natural: '30',
      migration: '-40',
      change: '-10',
      end: '990',
    }).ready,
    true,
  );
  const kenia = tasksFor('s1', 'ahr')[0];
  assert.equal(
    evaluate(kenia, {
      'amina-direct': '22',
      'amina-north': '10',
      'david-direct': '12',
      'david-north': '18',
    }).ready,
    true,
  );
});
test('all twelve directed profile switches keep drafts, checked answers and provenance separate through reload', () => {
  for (const from of profileIds)
    for (const to of profileIds.filter((p) => p !== from))
      for (const mode of ['draft', 'checked', 'example'] as const) {
        let s = start(from);
        const task = active(s)!.task,
          field = task.fields[0];
        s = act(s, 'answer', exampleValue(field), field.id);
        if (mode === 'checked') s = solve(s);
        if (mode === 'example') {
          s = act(s, 'help');
          s = act(s, 'help');
          s = act(s, 'help');
          s = act(s, 'adopt');
        }
        const original = structuredClone(s.records[areaId('c', from)]);
        s = act(s, 'request-profile', to);
        assert.equal(s.profile, from);
        s = act(s, 'confirm-profile');
        assert.equal(active(s)!.attempt!.process, 'draft');
        assert.deepEqual(active(s)!.attempt!.answers, {});
        assert.equal(active(s)!.attempt!.exampleUsed, false);
        s = restoreLearning(JSON.parse(JSON.stringify(s)))!;
        s = act(s, 'request-profile', from);
        s = act(s, 'confirm-profile');
        assert.deepEqual(s.records[areaId('c', from)], original);
      }
});
test('text, criteria and revision stay ungraded; oral self-report is not a confirmed discussion', () => {
  let s = start('ahr');
  s = solve(s);
  s = act(s, 'next');
  assert.equal(active(s)!.task.fields[0].kind, 'text');
  s = act(
    s,
    'answer',
    'Völlig unklar <script>alert(1)</script>',
    'explanation',
  );
  s = act(s, 'check');
  assert.equal(active(s)!.attempt!.factual, 'ungraded');
  assert.equal(active(s)!.attempt!.criteriaSeen, false);
  s = act(s, 'criteria');
  s = act(s, 'answer', 'Geänderte eigene Antwort.', 'explanation');
  assert.equal(active(s)!.attempt!.revised, true);
  assert.equal(active(s)!.attempt!.factual, 'ungraded');
  s = act(s, 'oral');
  s = act(s, 'check');
  assert.equal(active(s)!.attempt!.form, 'oral-self-report');
  assert.equal(active(s)!.attempt!.factual, 'ungraded');
  s = act(s, 'request-profile', 'foerder');
  s = act(s, 'confirm-profile');
  assert.equal(active(s)!.attempt!.form, 'chosen');
  assert.equal(active(s)!.attempt!.criteriaSeen, false);
});
test('opening help after confirmed answer preserves it; shown example is distinct from adopted example', () => {
  let s = solve(start('esa'));
  const before = active(s)!.attempt!;
  s = act(s, 'help');
  s = act(s, 'help');
  s = act(s, 'help');
  const p = active(s)!.attempt!;
  assert.equal(p.process, before.process);
  assert.equal(p.factual, before.factual);
  assert.equal(p.exampleShown, true);
  assert.equal(p.exampleUsed, false);
  assert.deepEqual(p.answers, before.answers);
});
test('old fixture remains without profile; corrupted optional tasks cannot relabel or delete sibling/legacy answers', () => {
  const old = JSON.parse(
    readFileSync(
      new URL('./fixtures/inquiry-5785267.json', import.meta.url),
      'utf8',
    ),
  );
  const memory = store();
  memory.setItem(storageKey, JSON.stringify(old));
  const state = readSession(memory);
  assert.equal(state.learning, undefined);
  assert.deepEqual(
    state.inquiry!.records.population.product,
    old.inquiry.records.population.product,
  );
  let learning = solve(start('ahr'));
  learning = act(learning, 'next');
  learning = act(learning, 'answer', 'Mein Entwurf', 'explanation');
  const raw = JSON.parse(JSON.stringify(learning));
  raw.records['c.ahr.v1'].attempts[
    'population.base.balance'
  ].identity.profileId = 'foerder';
  raw.records['c.ahr.v1'].attempts['population.base.explain'].criteriaSeen = {
    bad: true,
  };
  memory.setItem(
    storageKey,
    JSON.stringify({ ...state, screen: 'learning', learning: raw }),
  );
  const restored = readSession(memory);
  assert.equal(
    restored.learning!.records['c.ahr.v1'].attempts['population.base.balance'],
    undefined,
  );
  assert.equal(
    restored.learning!.records['c.ahr.v1'].attempts['population.base.explain']
      .answers.explanation,
    'Mein Entwurf',
  );
  assert.deepEqual(
    restored.inquiry!.records.population.product,
    state.inquiry!.records.population.product,
  );
  assert.equal(
    saveSession(
      { ...state, learning },
      {
        getItem: () => null,
        setItem: () => {
          throw Error('blocked');
        },
        removeItem: () => {},
      },
    ),
    false,
  );
  assert.equal(
    reduce({ ...initialState(), learning }, { type: 'restart' }).learning,
    undefined,
  );
});

test('planned or unknown variants never silently become population tasks', () => {
  assert.throws(() => tasksFor('n' as any, 'esa'), /noch nicht/);
  assert.throws(() => tasksFor('c', 'unknown' as any), /noch nicht/);
});

test('every pilot contract rejects its actual wrong alternatives, recognizes right parts, and keeps legitimate priorities/text neutral', () => {
  for (const unit of ['c', 's1'] as const)
    for (const profile of profileIds)
      for (const task of tasksFor(unit, profile)) {
        assert.notEqual(task.hints[0], task.hints[1], task.id);
        const answers = Object.fromEntries(
          task.fields.map((f) => [f.id, exampleValue(f)]),
        );
        for (const f of task.fields) {
          if (f.kind === 'text') {
            const e = evaluate(task, {
              ...answers,
              [f.id]: 'Ich bin unsicher und weiß es noch nicht.',
            });
            assert.equal(e.kind, 'neutral');
            assert.equal(e.factual, 'ungraded');
            continue;
          }
          if (f.expected === 'either') {
            for (const [id] of f.options!) {
              const e = evaluate(task, { ...answers, [f.id]: id });
              assert.equal(e.kind, 'neutral');
              assert.equal(e.error, false);
            }
            continue;
          }
          const wrong =
            f.kind === 'choice'
              ? f.options!.filter(([id]) => id !== f.expected).map(([id]) => id)
              : [String(Number(f.expected) + 1)];
          for (const value of wrong) {
            const e = evaluate(task, { ...answers, [f.id]: value });
            assert.equal(e.ready, false, task.id);
            assert.equal(e.error, true, task.id);
            assert.ok(['partial', 'incorrect'].includes(e.kind));
            assert.equal(
              evaluate(task, { ...answers, [f.id]: value }, 1).kind,
              'hint',
            );
          }
          if (f.kind === 'integer') {
            const e = evaluate(task, { ...answers, [f.id]: '1.02' });
            assert.equal(e.error, false);
            assert.equal(e.ready, false);
          }
        }
      }
});
