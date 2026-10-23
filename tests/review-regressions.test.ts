import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reduce } from '../src/state.ts';
import { readSession } from '../src/storage.ts';
import { renderMap } from '../src/map.ts';
import { evaluateClosed } from '../src/feedback.ts';

test('R1: back and rework restore the direct starting route without losing other answers', () => {
  let s = initialState();
  s.step = 1;
  s.route = 'north';
  s.progress[1].person = 'amina';
  s.progress[1].complete = true;
  const other = structuredClone(s.progress[1]);
  s = reduce(s, { type: 'back' });
  assert.equal(s.route, 'direct');
  s = reduce(s, { type: 'reset-task' });
  assert.equal(s.route, 'direct');
  assert.deepEqual(s.progress[1], other);
});

test('R1: legacy saved north state in task 1 is normalized; renderer is safe independently', () => {
  const legacy = initialState();
  legacy.screen = 'game';
  legacy.route = 'north';
  legacy.progress[2].person = 'david';
  const restored = readSession({
    getItem: () => JSON.stringify(legacy),
    setItem() {},
    removeItem() {},
  });
  assert.equal(restored.route, 'direct');
  assert.equal(restored.progress[2].person, 'david');
  // A stale state reaching the renderer must not reintroduce the orphan 8-minute label.
  const html = renderMap(legacy);
  assert.match(html, />10 Min\.<\/text>/);
  assert.equal((html.match(/>8 Min\.<\/text>/g) || []).length, 1);
});

for (const route of ['direct', 'north'] as const) {
  test(`R2: ${route} gets concrete support after two wrong evidence checks and deliberate adoption`, () => {
    let s = initialState();
    s.step = 5;
    s.decision =
      route === 'north'
        ? {
            criterion: 'tradeoff',
            route,
            advantage: 'amina-north-direct',
            disadvantage: 'amina-direct-north',
            text: '',
          }
        : {
            criterion: 'tradeoff',
            route,
            advantage: 'david-direct-north',
            disadvantage: 'david-north-direct',
            text: '',
          };
    s = reduce(s, { type: 'check', persisted: true });
    assert.equal(s.progress[5].failures, 1);
    assert.equal(s.progress[5].complete, false);
    for (let i = 0; i < 3; i++)
      s = reduce(s, { type: 'check', persisted: true });
    assert.equal(s.progress[5].failures, 2);
    assert.equal(s.progress[5].help, 3);
    assert.equal(s.progress[5].complete, false);
    assert.equal(s.progress[5].feedback?.kind, 'neutral');
    const wrong = s.decision.disadvantage;
    s = reduce(s, { type: 'use-example', persisted: true });
    assert.equal(s.decision.supported, true);
    assert.equal(s.progress[5].complete, true);
    assert.notEqual(s.decision.disadvantage, wrong);
    assert.equal(s.progress[5].feedback?.kind, 'neutral');
    assert.match(s.progress[5].feedback!.text, /Beispiel übernommen/);
    s = reduce(s, { type: 'next' });
    assert.equal(s.screen, 'end');
  });
}

test('R2: voluntary help 3 offers adoption without failures, route change and rework stay safe', () => {
  let s = initialState();
  s.step = 5;
  s = reduce(s, { type: 'use-example', persisted: true });
  assert.equal(s.progress[5].complete, false);
  s = reduce(s, { type: 'decision-route', value: 'north' });
  s = reduce(s, { type: 'criterion', value: 'tradeoff' });
  for (const level of [1, 2, 3]) s = reduce(s, { type: 'help', value: level });
  assert.equal(s.progress[5].failures, 0);
  assert.equal(s.progress[5].complete, false);
  s = reduce(s, { type: 'use-example', persisted: true });
  assert.equal(s.decision.advantage, 'amina-north-direct');
  assert.equal(s.decision.disadvantage, 'david-north-direct');
  s = reduce(s, { type: 'decision-route', value: 'direct' });
  assert.equal(s.decision.supported, undefined);
  assert.equal(s.progress[5].complete, false);
  s = reduce(s, { type: 'use-example', persisted: true });
  assert.equal(s.decision.advantage, 'david-direct-north');
  assert.equal(s.decision.disadvantage, 'amina-direct-north');
  const restored = readSession({
    getItem: () => JSON.stringify(s),
    setItem() {},
    removeItem() {},
  });
  assert.equal(restored.decision.supported, true);
  s = reduce(restored, { type: 'reset-task' });
  assert.equal(s.progress[5].failures, 0);
  assert.equal(s.decision.supported, undefined);
});

test('R2: unclear free text and correct-but-incomplete evidence never consume failures', () => {
  for (const text of ['???', 'amina 999 Minuten', '<b>bus</b>', '']) {
    let s = initialState();
    s.step = 5;
    s.decision = {
      criterion: 'tradeoff',
      route: 'north',
      advantage: 'amina-north-direct',
      text,
    };
    // With text present, even an incorrect selected fact must not grade the text.
    if (text) s.decision.disadvantage = 'amina-direct-north';
    for (let i = 0; i < 4; i++)
      s = reduce(s, { type: 'check', persisted: true });
    assert.equal(s.progress[5].failures, 0);
    assert.equal(s.progress[5].help, 0);
    assert.equal(s.progress[5].feedback?.kind, 'neutral');
    if (text) assert.match(s.progress[5].feedback!.text, /nicht sicher prüfen/);
  }
});

test('R3: either correct incomplete part is explicitly recognized without a failed attempt', () => {
  const foot = evaluateClosed(0, { foot: 'platz' }, 0);
  assert.equal(foot.feedback.kind, 'partial');
  assert.equal(foot.failed, false);
  assert.match(foot.feedback.text, /Fußweg zum Platz passt/);
  assert.match(foot.feedback.text, /Wähle.*Busfahrt/);
  const bus = evaluateClosed(0, { bus: 'direct' }, 0);
  assert.equal(bus.feedback.kind, 'partial');
  assert.equal(bus.failed, false);
  assert.match(bus.feedback.text, /direkte Busfahrt passt/);
  assert.match(bus.feedback.text, /Wähle.*Fußweg/);
});

test('R3: incorrect incomplete choices are not confirmed or counted as failures', () => {
  for (const answer of [
    { foot: 'nord' as const },
    { bus: 'north' as const },
    {},
  ]) {
    const result = evaluateClosed(0, answer, 0);
    assert.equal(result.failed, false);
    assert.equal(result.feedback.complete, false);
    assert.equal(result.feedback.kind, 'hint');
    assert.doesNotMatch(result.feedback.text, /passt schon|passt\./);
  }
});
