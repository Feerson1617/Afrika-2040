import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reduce, type State, type Action } from '../src/state.ts';
import { readSession } from '../src/storage.ts';
import { decisionTerms } from '../src/regions/ui.ts';
import { studies } from '../src/regions/registry.ts';
const act = (s: State, a: Action) => reduce(s, a);
function at(step: number) {
  let s = act(initialState(), { type: 'start' });
  while (s.step < step) {
    s = act(s, { type: 'help', value: 3 });
    s = act(s, { type: 'next' });
  }
  return s;
}
function choice(s: State, correct: boolean) {
  if (s.step === 0) {
    s = act(s, { type: 'foot', value: correct ? 'platz' : 'nord' });
    return act(s, { type: 'bus', value: correct ? 'direct' : 'north' });
  }
  return act(s, {
    type: 'person',
    value: correct
      ? s.step === 1
        ? 'amina'
        : 'david'
      : s.step === 1
        ? 'david'
        : 'amina',
  });
}
const reload = (s: State) =>
  readSession({
    getItem: () => JSON.stringify(s),
    setItem() {},
    removeItem() {},
  });
for (const step of [0, 1, 2]) {
  test(`early task ${step}: empty, wrong and unconfirmed correct selections become explained, never falsely checked`, () => {
    for (const answer of ['empty', 'wrong', 'unconfirmed']) {
      let s = at(step);
      if (answer !== 'empty') s = choice(s, answer === 'unconfirmed');
      if (answer === 'wrong') s = act(s, { type: 'check', persisted: true });
      const attempts = s.progress[step].failures;
      for (const level of [1, 2]) {
        s = act(s, { type: 'help', value: level });
        assert.equal(s.progress[step].complete, false);
      }
      s = act(s, { type: 'help', value: 3 });
      let p = s.progress[step];
      assert.equal(p.complete, true);
      assert.equal(p.supported, true);
      assert.equal(p.feedback?.kind, 'hint');
      assert.equal(p.feedback?.title, '→ Mit Erklärung bearbeitet');
      assert.equal(p.person, undefined);
      assert.equal(p.foot, undefined);
      assert.equal(p.bus, undefined);
      assert.equal(p.failures, attempts);
      const before = structuredClone(p);
      s = reload(s);
      assert.deepEqual(s.progress[step], before);
      s = act(s, { type: 'transfer', value: 'yes' });
      s = act(s, { type: 'check-transfer' });
      assert.equal(s.progress[step].transferFeedback?.kind, 'correct');
      s = act(s, { type: 'next' });
      assert.equal(s.step, step + 1);
      s = act(s, { type: 'back' });
      assert.equal(s.step, step);
      assert.equal(s.progress[step].supported, true);
      s = act(s, { type: 'reset-task' });
      assert.equal(s.progress[step].complete, false);
      assert.equal(s.progress[step].supported, undefined);
    }
  });
  test(`early task ${step}: confirmed answer remains correct after explanation, including old mistaken support flag`, () => {
    let s = choice(at(step), true);
    s = act(s, { type: 'check', persisted: true });
    const confirmed = structuredClone(s.progress[step].feedback);
    for (const level of [1, 2, 3]) s = act(s, { type: 'help', value: level });
    assert.equal(s.progress[step].supported, undefined);
    assert.deepEqual(s.progress[step].feedback, confirmed);
    s.progress[step].supported = true;
    s = reload(s);
    assert.equal(s.progress[step].supported, undefined);
    assert.deepEqual(s.progress[step].feedback, confirmed);
    assert.equal(s.progress[step].complete, true);
  });
  test(`early task ${step}: legacy contradictory state normalizes without changing other answers`, () => {
    let s = choice(at(step), false);
    s = act(s, { type: 'check', persisted: true });
    s.progress[step].help = 3;
    s.progress[step].complete = true;
    s.progress[step].supported = true;
    s.decision.text = 'Unverändert';
    s = reload(s);
    assert.equal(s.progress[step].feedback?.kind, 'hint');
    assert.equal(s.progress[step].supported, true);
    assert.equal(s.progress[step].person, undefined);
    assert.equal(s.progress[step].foot, undefined);
    assert.equal(s.decision.text, 'Unverändert');
    assert.deepEqual(reload(s), s);
  });
}
test('partial early facts are acknowledged, bounded automatic support has the same truthful completion', () => {
  let s = at(0);
  s = act(s, { type: 'foot', value: 'platz' });
  s = act(s, { type: 'check', persisted: true });
  assert.equal(s.progress[0].feedback?.kind, 'partial');
  s = act(s, { type: 'help', value: 3 });
  assert.match(s.progress[0].feedback!.text, /Fußweg zum Platz passte/);
  assert.equal(s.progress[0].failures, 0);
  for (const step of [0, 1, 2]) {
    s = choice(at(step), false);
    s = act(s, { type: 'check', persisted: true });
    s = act(s, { type: 'check', persisted: true });
    assert.equal(s.progress[step].complete, true);
    assert.equal(s.progress[step].help, 3);
    assert.equal(
      s.progress[step].feedback!.title,
      '→ Mit Erklärung bearbeitet',
    );
    assert.equal(s.progress[step].failures, 2);
  }
});
test('decision glossary has its own four terms; technical terms remain intact and cocoa starts with cooperative definition', () => {
  assert.deepEqual(
    decisionTerms.map((t) => t[0]),
    ['Vorschlag', 'Beleg', 'Grenze', 'Gewichten'],
  );
  assert.match(
    decisionTerms.find((t) => t[0] === 'Grenze')![1],
    /keine Landesgrenze/,
  );
  assert.ok(studies.cocoa!.terms[0].some((t) => t[0] === 'Genossenschaft'));
  assert.equal(
    studies.cocoa!.question,
    'Warum bleibt bei mehr Verarbeitung hier nicht automatisch mehr Überschuss übrig?',
  );
  assert.ok(studies.cocoa!.terms[1].some((t) => t[0] === 'Überschuss'));
  assert.ok(studies.water!.terms[0].some((t) => t[0] === 'Entnahme'));
  assert.ok(studies.water!.terms[1].some((t) => t[0] === 'Verbrauch'));
});
