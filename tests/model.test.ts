import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evidenceFor,
  evidenceIds,
  evidenceLabel,
  journey,
  journeyParts,
  lineDuration,
  differentPeople,
} from '../src/model.ts';
import { evaluateClosed, evaluateDecision } from '../src/feedback.ts';
import { persons, routes } from '../src/content.ts';

test('all nine prescribed journeys include the actual walk and the ridden bus sections', () => {
  const expected = {
    amina: { direct: [12, 10, 22], north: [2, 8, 10], south: [12, 16, 28] },
    david: { direct: [2, 10, 12], north: [2, 16, 18], south: [2, 16, 18] },
    leila: { direct: [12, 10, 22], north: [12, 16, 28], south: [2, 8, 10] },
  };
  for (const person of persons)
    for (const route of routes) {
      const [walk, bus, total] = expected[person][route];
      assert.deepEqual(
        journey(person, route),
        { walk, bus, total },
        `${person}/${route}`,
      );
    }
});
test('full route lengths and boarding determine all bus sections', () => {
  assert.deepEqual(routes.map(lineDuration), [10, 16, 16]);
  assert.deepEqual(journeyParts('amina', 'north'), {
    board: 'nord',
    walk: 2,
    segments: ['nordZentrum'],
  });
  assert.deepEqual(journeyParts('leila', 'south'), {
    board: 'sued',
    walk: 2,
    segments: ['suedZentrum'],
  });
  assert.deepEqual(journeyParts('amina', 'south').segments, [
    'platzSued',
    'suedZentrum',
  ]);
  assert.deepEqual(journeyParts('leila', 'north').segments, [
    'platzNord',
    'nordZentrum',
  ]);
  assert.deepEqual(journeyParts('david', 'south').segments, [
    'platzSued',
    'suedZentrum',
  ]);
});
test('the original Phase-1 advantages remain unchanged', () => {
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
  for (const step of [0, 1, 2, 4] as const) {
    const f = evaluateClosed(step, {}, 0);
    assert.equal(f.failed, false);
    assert.equal(f.feedback.complete, false);
  }
});
test('all four original route-part combinations retain correct, partial and wrong feedback', () => {
  for (const [foot, bus, kind] of [
    ['platz', 'direct', 'correct'],
    ['platz', 'north', 'partial'],
    ['nord', 'direct', 'partial'],
    ['nord', 'north', 'incorrect'],
  ] as const)
    assert.equal(evaluateClosed(0, { foot, bus }, 0).feedback.kind, kind);
});
test('benefit and disadvantage use distinct perspectives', () => {
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
test('the second failed attempt still explains every original closed task', () => {
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
test('all evidence labels name the person and both comparison routes unambiguously', () => {
  assert.equal(evidenceIds.length, 18);
  assert.equal(new Set(evidenceIds).size, 18);
  assert.equal(
    evidenceLabel('leila-south-direct'),
    'Leila: Über Süd 10 statt Direkt 22 Minuten.',
  );
  assert.equal(
    evidenceLabel('david-north-south'),
    'David: Über Nord 18 statt Über Süd 18 Minuten.',
  );
});
test('all 972 evidence pairs are judged by truth, reference route and different people; every recommendation remains neutral', () => {
  const allowed = {
    direct: {
      good: [
        'david-direct-north',
        'david-direct-south',
        'amina-direct-south',
        'leila-direct-north',
      ],
      bad: ['amina-direct-north', 'leila-direct-south'],
    },
    north: {
      good: ['amina-north-direct', 'amina-north-south'],
      bad: ['david-north-direct', 'leila-north-direct', 'leila-north-south'],
    },
    south: {
      good: ['leila-south-direct', 'leila-south-north'],
      bad: ['david-south-direct', 'amina-south-direct', 'amina-south-north'],
    },
  };
  for (const route of routes)
    for (const advantage of evidenceIds)
      for (const disadvantage of evidenceIds) {
        const f = evaluateDecision(
          { route, criterion: 'tradeoff', advantage, disadvantage, text: '' },
          true,
        );
        const expected =
          allowed[route].good.includes(advantage) &&
          allowed[route].bad.includes(disadvantage) &&
          advantage.split('-')[0] !== disadvantage.split('-')[0];
        assert.equal(f.kind, 'neutral');
        assert.equal(
          f.complete,
          expected,
          `${route}: ${advantage}/${disadvantage}`,
        );
      }
});
test('different valid weightings and comparison references are accepted', () => {
  for (const route of routes) {
    assert.equal(
      evaluateDecision(
        { route, criterion: 'tradeoff', ...evidenceFor(route), text: '' },
        true,
      ).complete,
      true,
    );
  }
  assert.equal(
    evaluateDecision(
      {
        route: 'direct',
        criterion: 'school',
        advantage: 'amina-direct-south',
        disadvantage: 'leila-direct-south',
        text: '',
      },
      true,
    ).complete,
    true,
  );
  assert.equal(
    differentPeople('amina-direct-south', 'amina-direct-north'),
    false,
  );
  assert.equal(
    evaluateDecision(
      {
        route: 'direct',
        criterion: 'school',
        advantage: 'amina-direct-south',
        disadvantage: 'amina-direct-north',
        text: '',
      },
      true,
    ).complete,
    false,
  );
});
test('a named criterion is required, including when a free text is recorded', () => {
  for (const text of ['', 'mein Ziel ist wichtig'])
    assert.equal(
      evaluateDecision({ route: 'south', ...evidenceFor('south'), text }, true)
        .complete,
      false,
    );
});
test('correct incomplete reasoning is acknowledged without rejecting a route', () => {
  const f = evaluateDecision(
    {
      route: 'north',
      criterion: 'school',
      advantage: 'amina-north-direct',
      text: '',
    },
    true,
  );
  assert.equal(f.kind, 'neutral');
  assert.equal(f.complete, false);
  assert.match(f.text, /Du belegst den Vorteil/);
  assert.match(f.text, /Nachteil/);
});
test('unusual or contradictory free text is saved without keyword grading', () => {
  for (const text of [
    'amina gut',
    'kp bus',
    'NICHT kürzer',
    'Leila braucht 999 Minuten',
    '<script>alert(1)</script>',
  ]) {
    const f = evaluateDecision(
      { route: 'south', criterion: 'training', text },
      true,
    );
    assert.equal(f.kind, 'neutral');
    assert.equal(f.complete, true);
    assert.match(f.text, /kann sie nicht sicher prüfen/);
    assert.doesNotMatch(f.text, /richtig|falsch|korrekt/i);
  }
});
test('no false saved claim when storage is blocked', () => {
  const f = evaluateDecision(
    { route: 'north', criterion: 'school', text: 'Meine Gedanken' },
    false,
  );
  assert.match(f.text, /erlaubt kein Speichern/);
  assert.doesNotMatch(f.text, /wurde gespeichert/);
});
