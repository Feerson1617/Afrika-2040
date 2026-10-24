import test from 'node:test';
import assert from 'node:assert/strict';
import {
  demandScenario,
  trialMatches,
  demandProduct,
  demandPriority,
} from '../src/demand.ts';
import {
  evaluateDemandCheck,
  evaluateDemandTrial,
  evaluateDemandDecision,
} from '../src/feedback.ts';
import { initialState, reduce } from '../src/state.ts';
import type { Action, State } from '../src/state.ts';
import type { DemandDecision } from '../src/demand.ts';
import { readSession, saveSession, storageKey } from '../src/storage.ts';
import { evidenceFor, journey } from '../src/model.ts';
const check = { type: 'check', persisted: true } as const;
const adopt = { type: 'use-example', persisted: true } as const;
const next = { type: 'demand-next' } as const;
const restore = (s: State) =>
  readSession({
    getItem: (k) => (k === storageKey ? JSON.stringify(s) : null),
    setItem() {},
    removeItem() {},
  });
const start = () => reduce(initialState(), { type: 'demand-start' });
function explore() {
  let s = start();
  for (const a of [
    { type: 'demand-route', value: 'north' },
    { type: 'demand-view', value: 'now' },
    { type: 'demand-enough', value: 'no' },
    { type: 'demand-later', value: 4 },
  ] as Action[])
    s = reduce(s, a);
  s = reduce(s, check);
  assert.equal(s.demand!.check.complete, true);
  return reduce(s, next);
}
function decide() {
  let s = explore();
  for (const m of ['bus', 'path'] as const) {
    s = reduce(s, { type: 'demand-measure', value: m });
    s = reduce(s, {
      type: 'demand-capacity',
      value: m === 'bus' ? 'more' : 'same',
    });
    s = reduce(s, {
      type: 'demand-walk',
      value: m === 'bus' ? 'same' : 'shorter',
    });
    s = reduce(s, check);
  }
  assert.equal(s.demand!.explore.complete, true);
  return reduce(s, next);
}
function proposal(measure: 'bus' | 'path', goal: 'capacity' | 'access'): State {
  let s = decide();
  for (const a of [
    { type: 'demand-proposal', value: measure },
    { type: 'demand-goal', value: goal },
    { type: 'demand-advantage', value: measure === 'bus' ? 'seats' : 'walk' },
    {
      type: 'demand-disadvantage',
      value: measure === 'bus' ? 'long-walk' : 'not-enough',
    },
  ] as Action[])
    s = reduce(s, a);
  return s;
}
test('Episode 2 independent literal oracle: all model totals and selective effects, no derived waiting minutes', () => {
  assert.deepEqual(demandScenario('base', 'before'), {
    people: 16,
    trips: 2,
    capacity: 20,
    later: 0,
    walk: 12,
  });
  assert.deepEqual(demandScenario(), {
    people: 24,
    trips: 2,
    capacity: 20,
    later: 4,
    walk: 12,
  });
  assert.deepEqual(demandScenario('bus'), {
    people: 24,
    trips: 3,
    capacity: 30,
    later: 0,
    walk: 12,
  });
  assert.deepEqual(demandScenario('path'), {
    people: 24,
    trips: 2,
    capacity: 20,
    later: 4,
    walk: 4,
  });
});
test('direct entry has no invented earlier recommendation and does not complete or overwrite old tasks', () => {
  const old = initialState(),
    s = reduce(old, { type: 'demand-start' });
  assert.equal(s.screen, 'demand-check');
  assert.equal(s.demand!.route, undefined);
  assert.equal(s.demand!.basis, 'chosen');
  assert.deepEqual(s.decision, old.decision);
  assert.deepEqual(s.progress, old.progress);
  assert.equal(reduce(s, next).screen, 'demand-check');
});
test('first and revised recommendations can supply a route without modifying either historical product or old times', () => {
  let s = initialState();
  s.screen = 'end';
  s.step = 5;
  s.decision = {
    route: 'north',
    criterion: 'school',
    ...evidenceFor('north'),
    text: '',
  };
  s = reduce(s, check);
  let first = reduce(s, { type: 'demand-start' });
  assert.equal(first.demand!.basis, 'first');
  assert.equal(first.demand!.route, 'north');
  s = reduce(s, { type: 'event-start' });
  for (const a of [
    { type: 'event-path', value: 'leila-platz' },
    check,
    { type: 'event-next' },
    { type: 'help', value: 3 },
    adopt,
    { type: 'event-next' },
    { type: 'decision-route', value: 'south' },
    { type: 'criterion', value: 'training' },
    { type: 'help', value: 3 },
    adopt,
    { type: 'event-next' },
  ] as Action[])
    s = reduce(s, a);
  assert.equal(s.screen, 'event-end');
  const history = structuredClone({
    decision: s.decision,
    road: s.road,
    progress: s.progress,
  });
  const newer = reduce(s, { type: 'demand-start' });
  assert.equal(newer.demand!.basis, 'revision');
  assert.equal(newer.demand!.route, 'south');
  assert.deepEqual(
    { decision: newer.decision, road: newer.road, progress: newer.progress },
    history,
  );
  assert.equal(journey('leila', 'direct').total, 22);
  assert.equal(journey('leila', 'direct', 'now').total, 28);
  const chosen = reduce(newer, { type: 'demand-route', value: 'direct' });
  assert.equal(chosen.demand!.basis, 'chosen');
  assert.deepEqual(chosen.road, history.road);
});
test('incomplete demand inputs are free; partial correct facts survive a full wrong answer; automatic help requires conscious adoption', () => {
  let s = start();
  for (let i = 0; i < 3; i++) s = reduce(s, check);
  assert.equal(s.demand!.check.failures, 0);
  for (const a of [
    { type: 'demand-route', value: 'direct' },
    { type: 'demand-view', value: 'now' },
    { type: 'demand-enough', value: 'no' },
  ] as Action[])
    s = reduce(s, a);
  s = reduce(s, check);
  assert.equal(s.demand!.check.failures, 0);
  assert.equal(s.demand!.check.feedback!.kind, 'partial');
  s = reduce(s, { type: 'demand-later', value: 0 });
  s = reduce(s, check);
  assert.equal(s.demand!.check.failures, 1);
  assert.match(s.demand!.check.feedback!.text, /Die Plätze reichen nicht/);
  s = restore(reduce(s, check));
  assert.equal(s.demand!.check.failures, 2);
  assert.equal(s.demand!.check.help, 3);
  assert.equal(s.demand!.check.complete, false);
  s = reduce(s, adopt);
  assert.equal(s.demand!.check.complete, true);
  assert.equal(s.demand!.check.supported, true);
  assert.equal(s.demand!.later, 4);
});
test('a help example never silently chooses the starting route, proposal or goal', () => {
  let s = reduce(start(), { type: 'help', value: 3 });
  s = reduce(s, adopt);
  assert.equal(s.demand!.route, undefined);
  assert.equal(s.demand!.check.complete, false);
  s = reduce(decide(), { type: 'help', value: 3 });
  s = reduce(s, adopt);
  assert.equal(s.demand!.decision.measure, undefined);
  assert.equal(s.demand!.decide.complete, false);
});
for (const m of ['bus', 'path'] as const)
  test(`all nine ${m} partial/complete trial combinations recognise two separate dimensions`, () => {
    for (const capacity of [undefined, 'more', 'same'] as const)
      for (const walk of [undefined, 'shorter', 'same'] as const) {
        const d = explore().demand!;
        d.measure = m;
        d.explored = [m];
        d.trials[m] = { capacity, walk };
        const e = evaluateDemandTrial(d);
        assert.equal(
          e.feedback.complete,
          capacity === (m === 'bus' ? 'more' : 'same') &&
            walk === (m === 'bus' ? 'same' : 'shorter'),
        );
        if (!capacity || !walk) assert.equal(e.failed, false);
      }
  });
for (const m of ['bus', 'path'] as const)
  test(`trial ${m} repeated full error has automatic support, correct part recognition, no automatic adoption, and real continuation`, () => {
    let s = reduce(explore(), { type: 'demand-measure', value: m });
    s = reduce(s, {
      type: 'demand-capacity',
      value: m === 'bus' ? 'more' : 'same',
    });
    s = reduce(s, {
      type: 'demand-walk',
      value: m === 'bus' ? 'shorter' : 'same',
    });
    s = reduce(s, check);
    assert.equal(s.demand!.explore.failures, 1);
    assert.match(s.demand!.explore.feedback!.text, /Busplätze passt/);
    s = restore(reduce(s, check));
    assert.equal(s.demand!.explore.help, 3);
    assert.equal(s.demand!.trials[m]!.supported, undefined);
    assert.equal(s.demand!.explore.complete, false);
    s = reduce(s, adopt);
    assert.equal(s.demand!.trials[m]!.supported, true);
    assert.equal(trialMatches(m, s.demand!.trials[m]), true);
    assert.equal(s.demand!.explore.complete, false);
    assert.equal(reduce(s, next).screen, 'demand-explore');
    s = reduce(s, {
      type: 'demand-measure',
      value: m === 'bus' ? 'path' : 'bus',
    });
    s = reduce(s, adopt);
    assert.equal(s.demand!.explore.complete, true);
    assert.equal(reduce(s, next).screen, 'demand-decide');
  });
for (const m of ['bus', 'path'] as const)
  for (const goal of ['capacity', 'access'] as const)
    test(`both legitimate measures ${m}/${goal}: neutral conflict, specific weighting or conscious goal change`, () => {
      let s = proposal(m, goal);
      s = reduce(s, check);
      const conflict =
        (m === 'bus' && goal === 'access') ||
        (m === 'path' && goal === 'capacity');
      assert.equal(s.demand!.decide.feedback!.kind, 'neutral');
      assert.equal(s.demand!.decide.failures, 0);
      assert.equal(s.demand!.decide.complete, !conflict);
      assert.match(s.demand!.decide.feedback!.text, /Dein Vorteil passt/);
      assert.match(s.demand!.decide.feedback!.text, /Dein Nachteil passt/);
      if (conflict) {
        const changed = reduce(
          reduce(s, {
            type: 'demand-goal',
            value: m === 'bus' ? 'capacity' : 'access',
          }),
          check,
        );
        assert.equal(changed.demand!.decide.complete, true);
        s = reduce(s, {
          type: 'demand-weighting',
          value: m === 'bus' ? 'capacity' : 'access',
        });
        s = reduce(s, check);
        assert.equal(s.demand!.decide.complete, true);
        assert.match(demandPriority(s.demand!.decision), /wichtiger/);
        assert.match(demandPriority(s.demand!.decision), /in Kauf/);
      }
      const ended = restore(reduce(s, next));
      assert.equal(ended.screen, 'demand-end');
      assert.match(demandProduct(ended.demand!.decision), /Aber:/);
    });
test('missing decision facts never count, even after repeated check; unrelated priority does not resolve a goal conflict', () => {
  let s = decide();
  s = reduce(s, { type: 'demand-proposal', value: 'path' });
  s = reduce(s, { type: 'demand-goal', value: 'capacity' });
  for (let i = 0; i < 3; i++) s = reduce(s, check);
  assert.equal(s.demand!.decide.failures, 0);
  s = proposal('path', 'capacity');
  s = reduce(s, { type: 'demand-weighting', value: 'capacity' });
  s = reduce(s, check);
  assert.equal(s.demand!.decide.complete, false);
  assert.equal(s.demand!.decide.failures, 0);
});
for (const measure of ['bus', 'path'] as const)
  test(`two wrong recommendation facts ${measure} count once and allow a supported product with unchanged own text`, () => {
    let s = proposal(measure, 'capacity');
    s = reduce(s, { type: 'demand-advantage', value: 'both' });
    s = reduce(s, { type: 'demand-disadvantage', value: 'none' });
    s = reduce(s, check);
    assert.equal(s.demand!.decide.failures, 1);
    s = reduce(s, check);
    assert.equal(s.demand!.decide.failures, 2);
    assert.equal(s.demand!.decide.help, 3);
    assert.equal(s.demand!.decision.supported, undefined);
    s = reduce(s, { type: 'demand-text', value: 'mein eigener Text ???' });
    s = reduce(s, adopt);
    assert.equal(s.demand!.decide.complete, true);
    assert.equal(s.demand!.decision.supported, true);
    assert.equal(s.demand!.decision.text, 'mein eigener Text ???');
  });
test('unclear free text is never keyword graded, requires deliberate submission, is retained and edits reopen the product', () => {
  for (const text of [
    '???',
    'Beide Maßnahmen geben 999 Plätze',
    '<img src=x onerror=alert(1)>',
  ]) {
    let s = proposal('bus', 'access');
    s = reduce(s, { type: 'demand-advantage', value: 'both' });
    s = reduce(s, { type: 'demand-text', value: text });
    for (let i = 0; i < 3; i++) s = reduce(s, check);
    assert.equal(s.demand!.decide.failures, 0);
    assert.equal(s.demand!.decide.complete, false);
    s = reduce(s, { type: 'submit-ungraded', persisted: false });
    assert.equal(s.demand!.decide.complete, true);
    assert.equal(s.demand!.decision.ungraded, true);
    s = restore(reduce(s, next));
    assert.equal(s.screen, 'demand-end');
    assert.equal(s.demand!.decision.text, text);
    s = reduce(s, { type: 'demand-back' });
    s = reduce(s, { type: 'demand-text', value: text + '?' });
    assert.equal(s.demand!.decide.complete, false);
    assert.equal(s.demand!.decision.ungraded, undefined);
  }
});
test('all relevant edits reopen a supported product and current provenance; historical help is retained', () => {
  let s = proposal('path', 'capacity');
  s = reduce(s, { type: 'help', value: 3 });
  s = reduce(s, adopt);
  const actions: Action[] = [
    { type: 'demand-proposal', value: 'bus' },
    { type: 'demand-goal', value: 'access' },
    { type: 'demand-advantage', value: 'both' },
    { type: 'demand-disadvantage', value: 'none' },
    { type: 'demand-weighting', value: 'access' },
    { type: 'demand-text', value: 'changed' },
  ];
  for (const a of actions) {
    const x = reduce(s, a);
    assert.equal(x.demand!.decide.complete, false, a.type);
    assert.equal(x.demand!.decision.supported, undefined, a.type);
    assert.equal(x.demand!.decide.supported, true, a.type);
  }
});
test('back, change, reload and episode menu preserve work; explicit reset clears only the chosen episode step; global restart clears both', () => {
  let s = reduce(proposal('bus', 'capacity'), check);
  s = reduce(s, next);
  assert.equal(restore(s).screen, 'demand-end');
  s = reduce(s, { type: 'episode-home' });
  assert.equal(s.screen, 'start');
  assert.equal(reduce(s, { type: 'demand-start' }).screen, 'demand-end');
  s = reduce(reduce(s, { type: 'demand-start' }), { type: 'demand-back' });
  s = reduce(s, { type: 'demand-back' });
  assert.equal(s.screen, 'demand-explore');
  s = reduce(s, { type: 'demand-walk', value: 'same' });
  assert.equal(s.demand!.decide.complete, false);
  assert.equal(s.demand!.explore.complete, false);
  assert.equal(restore(s).screen, 'demand-explore');
  s = reduce(s, { type: 'demand-reset' });
  assert.deepEqual(s.demand!.trials, {});
  assert.equal(s.demand!.check.complete, true);
  assert.deepEqual(reduce(s, { type: 'restart' }), initialState());
});
test('legacy sessions retain Episode 1; broken optional Episode 2 is discarded without damaging previous learning products', () => {
  let old = initialState();
  old.step = 5;
  old.screen = 'end';
  old.decision = {
    route: 'north',
    criterion: 'school',
    ...evidenceFor('north'),
    text: 'first',
  };
  old = reduce(old, check);
  const snapshot = restore(old);
  assert.equal(snapshot.screen, 'end');
  assert.equal(snapshot.demand, undefined);
  for (const corruption of [
    { view: 'bad' },
    { check: { complete: true } },
    { trials: { bus: { capacity: 'unknown' } } },
    { decision: { text: 15 } },
    { explored: ['bus', 'bus'] },
  ]) {
    const newer = reduce(old, { type: 'demand-start' });
    Object.assign(newer.demand!, corruption);
    const loaded = restore(newer);
    assert.equal(loaded.screen, 'start');
    assert.equal(loaded.demand, undefined);
    assert.deepEqual(loaded.decision, snapshot.decision);
    assert.deepEqual(loaded.progress, snapshot.progress);
  }
});
test('forged completion is rechecked; blocked storage still leaves full in-memory play available', () => {
  let s = start();
  s.screen = 'demand-end';
  s.demand!.check.complete = true;
  s.demand!.explore.complete = true;
  s.demand!.decide.complete = true;
  const loaded = restore(s);
  assert.equal(loaded.screen, 'demand-check');
  assert.equal(loaded.demand!.check.complete, false);
  const store = {
    getItem() {
      throw Error('blocked');
    },
    setItem() {
      throw Error('blocked');
    },
    removeItem() {
      throw Error('blocked');
    },
  };
  assert.deepEqual(readSession(store), initialState());
  assert.equal(saveSession(decide(), store), false);
  s = reduce(proposal('path', 'access'), check);
  assert.equal(reduce(s, next).screen, 'demand-end');
});
