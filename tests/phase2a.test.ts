import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reduce, selectedPerson } from '../src/state.ts';
import {
  evaluateExplanation,
  hasIncorrectDecisionEvidence,
} from '../src/feedback.ts';
import { renderMap } from '../src/map.ts';
import { readSession, storageKey, clearSession } from '../src/storage.ts';
import { routes } from '../src/content.ts';
import { evidenceFor } from '../src/model.ts';
const check = { type: 'check', persisted: true } as const;
const restore = (s: unknown) =>
  readSession({
    getItem: () => JSON.stringify(s),
    setItem() {},
    removeItem() {},
  });

test('staged introduction hides Leila and South until the extension, including after going back', () => {
  for (const step of [0, 1, 2, 3] as const) {
    const s = initialState();
    s.step = step;
    assert.doesNotMatch(renderMap(s), /Leila|Über Süd|id="map-bus-south"/);
    assert.notEqual(
      reduce(s, { type: 'route', value: 'south' }).route,
      'south',
    );
    assert.notEqual(
      reduce(s, { type: 'highlight', value: 'leila' }).highlight,
      'leila',
    );
  }
  let s = initialState();
  s.step = 4;
  s.progress[4].prediction = 'north';
  s.route = 'south';
  s.highlight = 'leila';
  assert.match(renderMap(s), /Leila|map-bus-south/);
  s = reduce(s, { type: 'back' });
  assert.equal(s.step, 3);
  assert.equal(s.route, 'north');
  assert.equal(s.highlight, undefined);
  assert.doesNotMatch(renderMap(s), /Leila|Über Süd/);
});
test('every route renders the complete sections but only the selected person rides the appropriate portion', () => {
  const expected = {
    direct: ['direct'],
    north: ['platzNord', 'nordZentrum'],
    south: ['platzSued', 'suedZentrum'],
  };
  for (const route of routes) {
    const s = initialState();
    s.step = 5;
    s.route = route;
    s.highlight = route === 'north' ? 'amina' : 'leila';
    const html = renderMap(s);
    const shown = [...html.matchAll(/data-segment="([^"]+)"/g)].map(
      (m) => m[1],
    );
    assert.deepEqual(shown, expected[route]);
    const ridden = [...html.matchAll(/data-ride-segment="([^"]+)"/g)].map(
      (m) => m[1],
    );
    assert.deepEqual(
      ridden,
      route === 'north'
        ? ['nordZentrum']
        : route === 'south'
          ? ['suedZentrum']
          : ['direct'],
    );
    assert.equal(
      (html.match(/class="map-badge bus-time"/g) || []).length,
      ridden.length,
    );
  }
});
test('a prediction is recorded without grading; the actual inspection follows it', () => {
  let s = initialState();
  s.step = 4;
  s = reduce(s, { type: 'route', value: 'south' });
  assert.equal(s.route, 'direct');
  s = reduce(s, { type: 'prediction', value: 'north' });
  assert.equal(s.progress[4].prediction, 'north');
  assert.equal(s.progress[4].failures, 0);
  assert.equal(selectedPerson(s), 'leila');
  assert.deepEqual(s.progress[4].explored, ['direct']);
  s = reduce(s, { type: 'prediction', value: 'south' });
  assert.equal(s.progress[4].prediction, 'north');
  s = reduce(s, { type: 'highlight', value: 'amina' });
  s = reduce(s, { type: 'route', value: 'south' });
  assert.deepEqual(s.progress[4].explored, ['direct']);
  s = reduce(s, { type: 'highlight', value: 'leila' });
  assert.deepEqual(s.progress[4].explored, ['direct', 'south']);
  s = reduce(s, { type: 'route-answer', value: 'south' });
  s = reduce(s, check);
  assert.equal(s.progress[4].complete, false);
  assert.equal(s.progress[4].failures, 0);
  s = reduce(s, { type: 'route', value: 'north' });
  s = reduce(s, check);
  assert.equal(s.progress[4].complete, true);
  assert.equal(s.progress[4].feedback?.kind, 'correct');
});
test('the cause and effect explanation recognizes either correct incomplete part without failed attempts', () => {
  for (const answer of [
    { cause: 'shorter' as const, text: '' },
    { effect: 'total' as const, text: '' },
  ]) {
    const f = evaluateExplanation(answer, 0, true);
    assert.equal(f.feedback.kind, 'partial');
    assert.equal(f.failed, false);
    assert.equal(f.feedback.complete, false);
    assert.match(f.feedback.text, /passt/);
  }
  for (const answer of [
    { cause: 'longer' as const, text: '' },
    { effect: 'busOnly' as const, text: '' },
    { text: '' },
  ])
    assert.equal(evaluateExplanation(answer, 0, true).failed, false);
});
test('guided correct explanations are qualified and partial errors acknowledge the valid cause', () => {
  assert.equal(
    evaluateExplanation(
      { cause: 'longer', effect: 'unchanged', text: '' },
      0,
      true,
    ).feedback.kind,
    'incorrect',
  );
  const f = evaluateExplanation(
    { cause: 'shorter', effect: 'total', text: '' },
    0,
    true,
  );
  assert.equal(f.feedback.kind, 'correct');
  assert.match(f.feedback.title, /Angeleitete/);
  assert.match(f.feedback.text, /erst in Nord/);
  const partial = evaluateExplanation(
    { cause: 'shorter', effect: 'busOnly', text: '' },
    0,
    true,
  );
  assert.equal(partial.feedback.kind, 'partial');
  assert.match(partial.feedback.text, /kürzeren Fußweg passt/);
  assert.equal(partial.failed, true);
});
test('two explanation errors expose a deliberate supported completion; an edit can adopt again', () => {
  let s = initialState();
  s.step = 3;
  s.explanation = { cause: 'same', effect: 'busOnly', text: '' };
  for (let i = 0; i < 4; i++) s = reduce(s, check);
  assert.equal(s.progress[3].failures, 2);
  assert.equal(s.progress[3].help, 3);
  assert.equal(s.progress[3].complete, false);
  s = reduce(s, { type: 'use-example', persisted: true });
  assert.equal(s.progress[3].complete, true);
  assert.equal(s.explanation.supported, true);
  s = reduce(s, { type: 'cause', value: 'longer' });
  assert.equal(s.progress[3].complete, false);
  assert.equal(s.explanation.supported, undefined);
  s = reduce(s, { type: 'use-example', persisted: true });
  assert.equal(s.explanation.cause, 'shorter');
  assert.equal(s.progress[3].supported, true);
});
test('Leila support after two errors preserves the real prediction and inspections, and leaves routes usable', () => {
  let s = initialState();
  s.step = 4;
  s = reduce(s, { type: 'prediction', value: 'direct' });
  for (const value of routes) s = reduce(s, { type: 'route', value });
  s = reduce(s, { type: 'route-answer', value: 'north' });
  s = reduce(s, check);
  s = reduce(s, check);
  assert.equal(s.progress[4].failures, 2);
  assert.equal(s.progress[4].complete, false);
  s = reduce(s, { type: 'use-example', persisted: true });
  assert.equal(s.progress[4].complete, true);
  assert.equal(s.progress[4].prediction, 'direct');
  assert.equal(s.progress[4].routeAnswer, 'south');
  s = reduce(s, { type: 'route', value: 'south' });
  assert.equal(s.route, 'south');
  let supported = initialState();
  supported.step = 4;
  supported = reduce(supported, { type: 'help', value: 3 });
  supported = reduce(supported, { type: 'use-example', persisted: true });
  assert.equal(supported.progress[4].prediction, undefined);
  assert.deepEqual(supported.progress[4].explored, []);
  supported = reduce(supported, { type: 'route', value: 'south' });
  assert.equal(supported.route, 'south');
});
test('all three decisions offer matching supported examples, named criteria and a bounded failure counter', () => {
  for (const route of routes) {
    let s = initialState();
    s.step = 5;
    s.decision = {
      route,
      criterion: 'tradeoff',
      advantage: evidenceFor(route).advantage,
      disadvantage: evidenceFor(route).advantage,
      text: '',
    };
    for (let i = 0; i < 4; i++) s = reduce(s, check);
    assert.equal(s.progress[5].failures, 2);
    assert.equal(s.progress[5].complete, false);
    assert.equal(s.progress[5].help, 3);
    s = reduce(s, { type: 'use-example', persisted: true });
    assert.equal(s.progress[5].complete, true);
    assert.equal(s.decision.supported, true);
    assert.equal(s.progress[5].feedback?.kind, 'neutral');
    s = reduce(s, { type: 'next' });
    assert.equal(s.screen, 'end');
  }
});
test('incomplete evidence or a missing criterion never consumes failures, even when a selected fact is wrong', () => {
  for (const answer of [
    { route: 'south' as const, text: '' },
    {
      route: 'south' as const,
      criterion: 'training' as const,
      advantage: 'david-south-direct' as const,
      text: '',
    },
    { route: 'south' as const, ...evidenceFor('north'), text: '' },
  ])
    assert.equal(hasIncorrectDecisionEvidence(answer), false);
});
test('free explanation text is never graded, including contradictory facts, HTML and unusual language', () => {
  for (const text of [
    '???',
    'Amina ist 999 Minuten im Bus',
    '<b>NICHT</b>',
    'weg macht flupp',
  ]) {
    let s = initialState();
    s.step = 3;
    s.explanation = { cause: 'longer', effect: 'busOnly', text };
    for (let i = 0; i < 4; i++) s = reduce(s, check);
    assert.equal(s.progress[3].failures, 0);
    assert.equal(s.progress[3].feedback?.kind, 'neutral');
    assert.equal(s.progress[3].complete, true);
    assert.match(s.progress[3].feedback!.text, /nicht sicher prüfen/);
  }
});
test('changing a first idea is not a success signal, and does not alter the final recommendation', () => {
  let s = initialState();
  s.step = 3;
  s = reduce(s, { type: 'first-route', value: 'north' });
  assert.equal(s.progress[3].complete, false);
  assert.equal(s.progress[3].failures, 0);
  assert.equal(s.decision.route, undefined);
  s = reduce(s, { type: 'first-route', value: 'direct' });
  assert.equal(s.progress[3].complete, false);
});
test('new state round trips with support, criterion, nine-value routes and both texts; reset affects one task only', () => {
  let s = initialState();
  s.step = 5;
  s.route = 'south';
  s.highlight = 'leila';
  s.explanation = {
    cause: 'shorter',
    effect: 'total',
    text: 'eigene Erklärung',
  };
  s.firstRoute = 'north';
  s.progress[4].prediction = 'direct';
  s.progress[4].explored = routes.slice();
  s.decision = {
    route: 'south',
    criterion: 'training',
    ...evidenceFor('south'),
    text: 'eigene Gewichtung',
    supported: true,
  };
  s = reduce(s, check);
  assert.deepEqual(restore(s), s);
  s = reduce(s, { type: 'reset-task' });
  assert.equal(s.decision.text, '');
  assert.equal(s.explanation.text, 'eigene Erklärung');
  assert.equal(s.progress[4].prediction, 'direct');
  assert.deepEqual(reduce(s, { type: 'restart' }), initialState());
});
test('corrupt extended states are rejected; a late route cannot leak into the first comparison on restoration', () => {
  const s = initialState();
  s.screen = 'game';
  s.route = 'south';
  assert.equal(restore(s).route, 'direct');
  for (const bad of [
    { ...s, explanation: { text: 44 } },
    { ...s, decision: { text: '', criterion: 'unknown' } },
    { ...s, progress: s.progress.slice(0, 4) },
  ])
    assert.deepEqual(restore(bad), initialState());
  const old = new Map([['afrika-2040:kenia-bus:v1', 'old phase 1']]);
  assert.deepEqual(
    readSession({
      getItem: (k) => old.get(k) ?? null,
      setItem() {},
      removeItem() {},
    }),
    initialState(),
  );
  old.set(storageKey, 'phase 2a');
  clearSession({
    getItem: (k) => old.get(k) ?? null,
    setItem() {},
    removeItem: (k) => {
      old.delete(k);
    },
  });
  assert.equal(old.size, 0);
});
