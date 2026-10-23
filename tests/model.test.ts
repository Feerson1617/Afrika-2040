import test from 'node:test';
import assert from 'node:assert/strict';
import { evidenceFor, evidenceIds, journey } from '../src/model.ts';
import { evaluateClosed, evaluateDecision } from '../src/feedback.ts';

test('all four journeys include the right walk and boarding point', () => {
  assert.deepEqual(journey('amina', 'direct'), {
    walk: 12,
    bus: 10,
    total: 22,
  });
  assert.deepEqual(journey('amina', 'north'), { walk: 2, bus: 8, total: 10 });
  assert.deepEqual(journey('david', 'direct'), { walk: 2, bus: 10, total: 12 });
  assert.deepEqual(journey('david', 'north'), { walk: 2, bus: 16, total: 18 });
});
test('route change benefits Amina by 12 minutes and costs David 6', () => {
  assert.equal(
    journey('amina', 'direct').total - journey('amina', 'north').total,
    12,
  );
  assert.equal(
    journey('david', 'north').total - journey('david', 'direct').total,
    6,
  );
});
test('missing choices are prompts, not failed attempts', () => {
  for (const step of [0, 1, 2] as const) {
    const f = evaluateClosed(step, {}, 0);
    assert.equal(f.failed, false);
    assert.equal(f.feedback.kind, 'hint');
    assert.equal(f.feedback.complete, false);
  }
});
test('step 1 distinguishes all combinations and both partial answers', () => {
  assert.equal(
    evaluateClosed(0, { foot: 'platz', bus: 'direct' }, 0).feedback.kind,
    'correct',
  );
  assert.equal(
    evaluateClosed(0, { foot: 'platz', bus: 'north' }, 0).feedback.kind,
    'partial',
  );
  assert.equal(
    evaluateClosed(0, { foot: 'nord', bus: 'direct' }, 0).feedback.kind,
    'partial',
  );
  assert.equal(
    evaluateClosed(0, { foot: 'nord', bus: 'north' }, 0).feedback.kind,
    'incorrect',
  );
});
test('benefit and disadvantage use distinct criteria', () => {
  assert.equal(
    evaluateClosed(1, { person: 'amina' }, 0).feedback.kind,
    'correct',
  );
  assert.equal(
    evaluateClosed(1, { person: 'david' }, 0).feedback.kind,
    'incorrect',
  );
  assert.equal(
    evaluateClosed(2, { person: 'david' }, 0).feedback.kind,
    'correct',
  );
  assert.equal(
    evaluateClosed(2, { person: 'amina' }, 0).feedback.kind,
    'incorrect',
  );
});
test('second failed attempt explains and permits continuation in every closed task', () => {
  for (const step of [0, 1, 2] as const) {
    const f = evaluateClosed(
      step,
      step === 0
        ? { foot: 'nord', bus: 'north' }
        : { person: step === 1 ? 'david' : 'amina' },
      1,
    ).feedback;
    assert.equal(f.kind, 'hint');
    assert.equal(f.complete, true);
    assert.match(f.text, /Minuten/);
  }
});
test('both routes are legitimate; only relevant evidence completes a structured answer', () => {
  for (const route of ['direct', 'north'] as const)
    for (const advantage of evidenceIds)
      for (const disadvantage of evidenceIds) {
        const f = evaluateDecision(
          { route, advantage, disadvantage, text: '' },
          true,
        );
        const expected = evidenceFor(route);
        assert.equal(f.kind, 'neutral');
        assert.equal(
          f.complete,
          advantage === expected.advantage &&
            disadvantage === expected.disadvantage,
        );
      }
});
test('partial reasoning acknowledges what fits and requests the missing perspective', () => {
  const f = evaluateDecision(
    { route: 'north', advantage: 'amina-north', text: '' },
    true,
  );
  assert.equal(f.kind, 'neutral');
  assert.equal(f.complete, false);
  assert.match(f.text, /Du belegst den Vorteil/);
  assert.match(f.text, /Nachteil/);
});
test('unexpected phrasing and even contradictory free text are never keyword-graded', () => {
  for (const text of [
    'amina gut',
    'kp bus',
    'NICHT kürzer',
    'Amina braucht 999 Minuten',
    '<script>alert(1)</script>',
  ]) {
    const f = evaluateDecision({ route: 'direct', text }, true);
    assert.equal(f.kind, 'neutral');
    assert.equal(f.complete, true);
    assert.match(f.text, /kann sie nicht sicher prüfen/);
    assert.doesNotMatch(f.text, /richtig|falsch|korrekt/i);
  }
});
test('no false saved claim when storage is blocked', () => {
  const f = evaluateDecision({ route: 'north', text: 'Meine Gedanken' }, false);
  assert.match(f.text, /erlaubt kein Speichern/);
  assert.doesNotMatch(f.text, /wurde gespeichert/);
});
