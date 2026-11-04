import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  active,
  newLearning,
  reduceLearning,
  restoreLearning,
  type LearningState,
} from '../src/learning/storage.ts';
import { exampleValue } from '../src/learning/progress.ts';
import { initialState, reduce } from '../src/state.ts';
import { readSession, saveSession, clearSession } from '../src/storage.ts';
const act = (
  s: LearningState,
  op: Parameters<typeof reduceLearning>[1]['op'],
  value?: string,
  field?: string,
) => reduceLearning(s, { type: 'learning', op, value, field });
function fixture() {
  let s = act(newLearning(), 'recommend', 'msa', 'e');
  for (const f of active(s)!.task.fields)
    s = act(s, 'answer', exampleValue(f), f.id);
  return act(s, 'check');
}
test('material panel metadata round-trips open and closed states per task/profile without changing assessed work', () => {
  let s = fixture();
  const first = active(s)!;
  first.attempt!.materialPanels = {
    'id:learning-topic-full:0': true,
    'id:inquiry-sources:0': false,
    '/Outer:0/Nested:0': true,
  };
  const original = structuredClone(first.attempt!);
  s = act(s, 'next');
  active(s)!.attempt!.materialPanels = { 'id:learning-topic-full:0': false };
  s = act(s, 'request-profile', 'ahr');
  s = act(s, 'confirm-profile');
  active(s)!.attempt!.materialPanels = {
    'id:learning-topic-full:0': false,
    'id:inquiry-sources:0': true,
  };
  const restored = restoreLearning(JSON.parse(JSON.stringify(s)))!;
  const attempt = restored.records[first.key].attempts[first.task.id];
  for (const field of [
    'answers',
    'submissions',
    'failures',
    'help',
    'exampleUsed',
    'materialPanels',
  ] as const)
    assert.deepEqual(attempt[field], original[field]);
  assert.notDeepEqual(
    active(restored)!.attempt!.materialPanels,
    original.materialPanels,
  );
  assert.equal(active(restored)!.attempt!.identity.profileId, 'ahr');
  const values = new Map<string, string>();
  const storage = {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => {
      values.set(k, v);
    },
    removeItem: (k: string) => {
      values.delete(k);
    },
  };
  const state = {
    ...initialState(),
    screen: 'learning' as const,
    learning: restored,
  };
  assert.equal(saveSession(state, storage), true);
  assert.deepEqual(
    readSession(storage).learning!.records[first.key].attempts[first.task.id]
      .materialPanels,
    original.materialPanels,
  );
  clearSession(storage);
  assert.equal(readSession(storage).learning, undefined);
  assert.equal(reduce(state, { type: 'restart' }).learning, undefined);
});
test('legacy and malformed optional panel data keep valid answers and default UI compatibility', () => {
  const s = fixture(),
    current = active(s)!;
  assert.equal(
    Object.hasOwn(
      restoreLearning(s)!.records[current.key].attempts[current.task.id],
      'materialPanels',
    ),
    false,
  );
  for (const bad of ['open', [], 12, null]) {
    const raw: any = structuredClone(s);
    raw.records[current.key].attempts[current.task.id].materialPanels = bad;
    const restored =
      restoreLearning(raw)!.records[current.key].attempts[current.task.id];
    assert.equal(restored.materialPanels, undefined);
    assert.deepEqual(restored.answers, current.attempt!.answers);
    assert.deepEqual(restored.submissions, current.attempt!.submissions);
  }
});
test('restored panel data is bounded, boolean-only and independent of storage availability', () => {
  const s = fixture(),
    current = active(s)!;
  const raw: any = structuredClone(s);
  raw.records[current.key].attempts[current.task.id].materialPanels = {
    '': true,
    ['x'.repeat(1025)]: true,
    bad: 'open',
    ...Object.fromEntries(
      Array.from({ length: 80 }, (_, i) => [`id:panel-${i}:0`, i % 2 === 0]),
    ),
  };
  const restored = restoreLearning(raw)!;
  const panels =
    restored.records[current.key].attempts[current.task.id].materialPanels!;
  assert.equal(Object.keys(panels).length, 64);
  assert.ok(Object.values(panels).includes(false));
  assert.ok(
    Object.entries(panels).every(
      ([key, value]) =>
        key.length > 0 && key.length <= 1024 && typeof value === 'boolean',
    ),
  );
  assert.deepEqual(
    restored.records[current.key].attempts[current.task.id].submissions,
    current.attempt!.submissions,
  );
  assert.equal(
    saveSession(
      { ...initialState(), screen: 'learning', learning: restored },
      {
        getItem() {
          throw Error('blocked');
        },
        setItem() {
          throw Error('blocked');
        },
        removeItem() {
          throw Error('blocked');
        },
      },
    ),
    false,
  );
  assert.deepEqual(
    restored.records[current.key].attempts[current.task.id].materialPanels,
    panels,
  );
});
