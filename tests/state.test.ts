import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reduce } from '../src/state.ts';
import {
  clearSession,
  readSession,
  saveSession,
  storageKey,
} from '../src/storage.ts';

test('navigation guards cannot skip an unprocessed task, even under repeated clicks', () => {
  let s = reduce(initialState(), { type: 'start' });
  for (let i = 0; i < 20; i++) s = reduce(s, { type: 'next' });
  assert.equal(s.step, 0);
  s = reduce(s, { type: 'foot', value: 'platz' });
  s = reduce(s, { type: 'bus', value: 'direct' });
  s = reduce(s, { type: 'check', persisted: true });
  for (let i = 0; i < 20; i++) s = reduce(s, { type: 'next' });
  assert.equal(s.step, 1);
  assert.equal(s.screen, 'game');
});
test('two failures unlock explanation, not endless rated guesses', () => {
  let s = reduce(initialState(), { type: 'start' });
  s = reduce(s, { type: 'foot', value: 'nord' });
  s = reduce(s, { type: 'bus', value: 'north' });
  for (let i = 0; i < 12; i++)
    s = reduce(s, { type: 'check', persisted: true });
  assert.equal(s.progress[0].failures, 2);
  assert.equal(s.progress[0].help, 3);
  assert.equal(s.progress[0].complete, true);
  s = reduce(s, { type: 'foot', value: 'platz' });
  assert.equal(s.progress[0].complete, true);
  s = reduce(s, { type: 'next' });
  assert.equal(s.step, 1);
});
test('hints are voluntary, monotonic, and do not consume attempts', () => {
  let s = reduce(initialState(), { type: 'help', value: 1 });
  s = reduce(s, { type: 'help', value: 2 });
  s = reduce(s, { type: 'help', value: 1 });
  assert.equal(s.progress[0].help, 2);
  assert.equal(s.progress[0].failures, 0);
  assert.equal(s.progress[0].complete, false);
  s = reduce(s, { type: 'help', value: 3 });
  assert.equal(s.progress[0].complete, true);
});
test('back preserves work and explicit rework resets only the current task', () => {
  let s = reduce(initialState(), { type: 'help', value: 3 });
  s = reduce(s, { type: 'next' });
  s = reduce(s, { type: 'person', value: 'amina' });
  s = reduce(s, { type: 'check', persisted: true });
  s = reduce(s, { type: 'back' });
  assert.equal(s.progress[0].help, 3);
  assert.equal(s.progress[1].complete, true);
  s = reduce(s, { type: 'reset-task' });
  assert.equal(s.progress[0].complete, false);
  assert.equal(s.progress[1].complete, true);
});
test('transfer gives a second-attempt explanation and keeps the model unchanged', () => {
  let s = initialState();
  s = reduce(s, { type: 'transfer', value: 'no' });
  s = reduce(s, { type: 'check-transfer' });
  assert.equal(s.progress[0].transferFeedback?.complete, false);
  s = reduce(s, { type: 'check-transfer' });
  assert.equal(s.progress[0].transferFeedback?.complete, true);
  assert.equal(s.route, 'direct');
  assert.equal(s.decision.text, '');
});
test('changing evidence or text invalidates an already checked recommendation', () => {
  let s = initialState();
  s.step = 5;
  s.decision = {
    criterion: 'tradeoff',
    route: 'direct',
    advantage: 'david-direct-north',
    weighting: 'david-direct-north',
    disadvantage: 'amina-direct-north',
    text: '',
  };
  s = reduce(s, { type: 'check', persisted: true });
  assert.equal(s.progress[5].complete, true);
  s = reduce(s, { type: 'text', value: 'Neue Begründung' });
  assert.equal(s.progress[5].complete, false);
  assert.equal(s.progress[5].feedback, undefined);
});
test('restart deletes all answers, hints and progress', () => {
  const s = initialState();
  s.decision.text = 'privat';
  s.progress[0].help = 3;
  assert.deepEqual(reduce(s, { type: 'restart' }), initialState());
});
test('session round trip and corrupted data are handled', () => {
  const data = new Map<string, string>();
  const store = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      data.set(k, v);
    },
    removeItem: (k: string) => {
      data.delete(k);
    },
  };
  const s = initialState();
  s.decision.text = 'lokal';
  assert.equal(saveSession(s, store), true);
  assert.deepEqual(readSession(store), s);
  data.set(storageKey, '{broken');
  assert.deepEqual(readSession(store), initialState());
  data.set(storageKey, JSON.stringify({ ...s, progress: [] }));
  assert.deepEqual(readSession(store), initialState());
  data.set(storageKey, JSON.stringify({ ...s, decision: { text: 18 } }));
  assert.deepEqual(readSession(store), initialState());
  clearSession(store);
  assert.equal(data.has(storageKey), false);
});
test('blocked session storage never prevents play', () => {
  const store = {
    getItem: () => {
      throw Error('blocked');
    },
    setItem: () => {
      throw Error('blocked');
    },
    removeItem: () => {
      throw Error('blocked');
    },
  };
  assert.deepEqual(readSession(store), initialState());
  assert.equal(saveSession(initialState(), store), false);
  assert.doesNotThrow(() => clearSession(store));
});
