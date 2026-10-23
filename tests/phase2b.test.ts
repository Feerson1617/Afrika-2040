import test from 'node:test';
import assert from 'node:assert/strict';
import { episode, persons, routes } from '../src/content.ts';
import type { Route } from '../src/content.ts';
import {
  evidenceFor,
  evidenceLabel,
  journey,
  journeyParts,
  walkTime,
} from '../src/model.ts';
import { goalStatus, weightingProduct } from '../src/decision.ts';
import {
  evaluateDecision,
  evaluateEventFind,
  evaluateEventEffects,
} from '../src/feedback.ts';
import {
  changeLabel,
  effectsMatch,
  evaluateRevision,
  revisionReason,
} from '../src/event.ts';
import { initialState, reduce } from '../src/state.ts';
import type { Action, State } from '../src/state.ts';
import { readSession, storageKey } from '../src/storage.ts';
import { renderMap } from '../src/map.ts';
const check = { type: 'check', persisted: true } as const;
const next = { type: 'event-next' } as const;
const matching = {
  direct: 'market',
  north: 'school',
  south: 'training',
} as const;
const restore = (s: State) =>
  readSession({
    getItem: (k) => (k === storageKey ? JSON.stringify(s) : null),
    setItem() {},
    removeItem() {},
  });
function start(route: Route = 'north'): State {
  let s = initialState();
  s.screen = 'end';
  s.step = 5;
  s.decision = {
    route,
    criterion: matching[route],
    ...evidenceFor(route),
    text: 'mein erster Text',
    panel: 'weigh',
  };
  s = reduce(s, check);
  assert.equal(s.progress[5].complete, true);
  return reduce(s, { type: 'event-start' });
}
function toEffects(route: Route = 'north') {
  let s = start(route);
  s = reduce(s, { type: 'event-path', value: 'leila-platz' });
  return reduce(reduce(s, check), next);
}
function toRevision(route: Route = 'north') {
  let s = toEffects(route);
  for (const value of ['direct', 'north', 'south'] as const)
    s = reduce(s, {
      type: 'event-answer',
      route: value,
      value: value === 'south' ? 'same' : 'longer',
    });
  s = reduce(s, check);
  s = reduce(s, { type: 'event-connection', value: 'sued' });
  s = reduce(s, { type: 'event-cause', value: 'unchanged' });
  s = reduce(s, check);
  assert.equal(s.road!.effects.complete, true);
  return reduce(s, next);
}
test('all eighteen required journeys derive from exactly one changed walk; old values, buses and boarding remain intact', () => {
  const expected = {
    amina: { before: [22, 10, 28], now: [22, 10, 28] },
    david: { before: [12, 18, 18], now: [12, 18, 18] },
    leila: { before: [22, 28, 10], now: [28, 34, 10] },
  };
  const original = structuredClone(episode.times);
  for (const person of persons)
    for (const [i, route] of routes.entries()) {
      for (const situation of ['before', 'now'] as const)
        assert.equal(
          journey(person, route, situation).total,
          expected[person][situation][i],
        );
      assert.equal(
        journey(person, route, 'now').bus,
        journey(person, route).bus,
      );
      assert.deepEqual(
        journeyParts(person, route, 'now').segments,
        journeyParts(person, route).segments,
      );
      assert.equal(
        journey(person, route, 'now').total - journey(person, route).total,
        person === 'leila' && route !== 'south' ? 6 : 0,
      );
    }
  assert.equal(walkTime('leila', 'platz'), 12);
  assert.equal(walkTime('leila', 'platz', 'now'), 18);
  assert.equal(walkTime('leila', 'sued', 'now'), 2);
  assert.deepEqual(episode.times, original);
});
test('new evidence and weighting use the current situation while the original product still uses its original values', () => {
  assert.match(evidenceLabel('leila-south-direct'), /10 statt Direkt 22/);
  assert.match(
    evidenceLabel('leila-south-direct', 'now'),
    /10 statt Direkt 28/,
  );
  const d = {
    route: 'south' as const,
    criterion: 'school' as const,
    ...evidenceFor('south'),
    weighting: evidenceFor('south').advantage,
    acceptConflict: true,
    text: '',
  };
  assert.match(weightingProduct(d, 'now'), /10 statt 28/);
  assert.match(weightingProduct(d), /10 statt 22/);
  assert.equal(goalStatus(d, 'now')?.current, 28);
});
test('event is gated by the old completion and keeps a separate immutable snapshot and all six old tasks', () => {
  assert.deepEqual(
    reduce(initialState(), { type: 'event-start' }),
    initialState(),
  );
  const s = start();
  const old = structuredClone(s.decision),
    progress = structuredClone(s.progress);
  assert.equal(s.screen, 'event-find');
  assert.equal(s.road!.view, 'before');
  assert.deepEqual(s.road!.original, old);
  assert.equal(s.road!.review.text, '');
  const changed = reduce(s, { type: 'event-path', value: 'bus' });
  assert.deepEqual(changed.progress, progress);
  assert.deepEqual(changed.decision, old);
  assert.deepEqual(changed.road!.original, old);
});
test('localisation: missing input is free, area is partial, buses are wrong, two failures explain and adoption really continues', () => {
  assert.equal(evaluateEventFind(undefined, 0).failed, false);
  assert.equal(evaluateEventFind('south-area', 0).feedback.kind, 'partial');
  assert.equal(evaluateEventFind('bus', 0).feedback.kind, 'incorrect');
  let s = start();
  for (let i = 0; i < 4; i++) s = reduce(s, check);
  assert.equal(s.road!.find.failures, 0);
  s = reduce(s, { type: 'event-path', value: 'south-area' });
  s = reduce(s, check);
  assert.match(s.road!.find.feedback!.text, /Wohnbereich/);
  assert.equal(s.road!.find.failures, 0);
  s = reduce(s, { type: 'event-path', value: 'bus' });
  s = reduce(s, check);
  s = reduce(s, check);
  assert.equal(s.road!.find.failures, 2);
  assert.equal(s.road!.find.help, 3);
  assert.equal(s.road!.find.complete, false);
  s = reduce(s, { type: 'use-example', persisted: true });
  assert.equal(s.road!.find.complete, true);
  assert.equal(s.road!.find.supported, true);
  assert.equal(reduce(s, next).screen, 'event-effects');
});
test('before/now uses the same map; construction and detour are restricted to the later footpath situation, including back navigation', () => {
  let s = start();
  s = reduce(s, { type: 'event-view', value: 'now' });
  assert.equal(s.road!.view, 'before');
  assert.doesNotMatch(renderMap(s), /class="event-works"/);
  s = reduce(s, { type: 'event-path', value: 'leila-platz' });
  s = reduce(s, check);
  assert.match(renderMap(s), /class="event-works"/);
  assert.match(renderMap(s), /Umweg/);
  assert.match(renderMap(s), /18 Min/);
  s = reduce(s, { type: 'event-view', value: 'before' });
  assert.doesNotMatch(renderMap(s), /class="event-works"/);
  s = reduce(s, next);
  assert.equal(s.road!.view, 'now');
  s = reduce(s, { type: 'event-back' });
  assert.equal(s.screen, 'event-find');
  s = reduce(s, { type: 'event-back' });
  assert.equal(s.screen, 'end');
  assert.doesNotMatch(renderMap(s), /class="event-works"/);
});
test('all 27 incomplete/complete effect combinations are handled honestly; full comparison still needs a cause and connection', () => {
  for (const a of [undefined, 'longer', 'same'] as const)
    for (const b of [undefined, 'longer', 'same'] as const)
      for (const c of [undefined, 'longer', 'same'] as const) {
        const r = toEffects().road!;
        r.answers = { direct: a, north: b, south: c };
        const f = evaluateEventEffects(r, true);
        assert.equal(f.feedback.complete, false);
        if (!a || !b || !c) assert.equal(f.failed, false);
        assert.equal(
          effectsMatch(r),
          a === 'longer' && b === 'longer' && c === 'same',
        );
      }
  let s = toEffects();
  s.road!.answers = { direct: 'longer', north: 'longer', south: 'same' };
  s = reduce(s, check);
  assert.equal(s.road!.compared, true);
  assert.equal(s.road!.effects.complete, false);
  assert.equal(s.road!.effects.failures, 0);
  s = reduce(s, { type: 'event-connection', value: 'sued' });
  s = reduce(s, check);
  assert.equal(s.road!.effects.feedback!.kind, 'partial');
  assert.equal(s.road!.effects.failures, 0);
  s = reduce(s, { type: 'event-cause', value: 'buses' });
  s = reduce(s, check);
  assert.match(s.road!.effects.feedback!.text, /Einstieg in Süd passt/);
  s = reduce(s, check);
  assert.equal(s.road!.effects.help, 3);
  s = reduce(s, { type: 'use-example', persisted: true });
  assert.equal(s.road!.effects.complete, true);
});
for (const old of routes)
  for (const route of routes)
    test(`revision ${old} → ${route}: staying and changing require explicit current evidence and a reason, never a success for switching alone`, () => {
      let s = toRevision(old);
      const first = structuredClone(s.road!.original);
      if (route !== old) {
        s = reduce(s, { type: 'decision-route', value: route });
        s = reduce(s, { type: 'criterion', value: matching[route] });
        for (const kind of ['advantage', 'disadvantage'] as const)
          s = reduce(s, { type: kind, value: evidenceFor(route)[kind] });
      }
      s = reduce(s, check);
      assert.equal(s.road!.revision.complete, false);
      s = reduce(s, { type: 'event-change-evidence', value: route });
      s = reduce(s, check);
      assert.equal(s.road!.revision.complete, false);
      s = reduce(s, { type: 'event-reason', value: 'goal' });
      s = reduce(s, check);
      assert.equal(s.road!.revision.complete, true);
      assert.equal(s.road!.revision.feedback!.kind, 'neutral');
      assert.match(
        revisionReason(s.road!),
        route === old ? /bleibe/ : /wechsle/,
      );
      assert.deepEqual(s.road!.original, first);
      assert.deepEqual(s.decision, first);
      s = reduce(s, next);
      assert.equal(s.screen, 'event-end');
      assert.equal(restore(s).screen, 'event-end');
    });
for (const route of routes)
  for (const criterion of ['school', 'market', 'training'] as const)
    test(`new goal connection ${route}/${criterion} stays neutral and accepts only an explicit coherent priority`, () => {
      let s = toRevision(route);
      s = reduce(s, { type: 'criterion', value: criterion });
      s = reduce(s, { type: 'event-change-evidence', value: route });
      s = reduce(s, check);
      assert.match(s.road!.revision.feedback!.text, /Du belegst den Vorteil/);
      assert.match(
        s.road!.revision.feedback!.text,
        /Du beachtest auch den Nachteil/,
      );
      assert.equal(s.road!.revision.complete, false);
      assert.equal(s.road!.revision.failures, 0);
      s = reduce(s, {
        type: 'event-reason',
        value: criterion === matching[route] ? 'goal' : 'priority',
      });
      s = reduce(s, check);
      assert.equal(s.road!.revision.complete, true);
    });
test('correct but unrelated change evidence is acknowledged and remains open until related to the current recommendation', () => {
  let s = toRevision('north');
  s = reduce(s, { type: 'event-change-evidence', value: 'south' });
  s = reduce(s, { type: 'event-reason', value: 'goal' });
  s = reduce(s, check);
  assert.match(s.road!.revision.feedback!.text, /10 → 10/);
  assert.equal(s.road!.revision.complete, false);
  assert.equal(s.road!.revision.failures, 0);
});
test('all relevant edits invalidate an adopted revision and its current provenance while keeping historical help visible', () => {
  let s = toRevision('south');
  s = reduce(s, { type: 'criterion', value: 'school' });
  s = reduce(s, { type: 'help', value: 3 });
  s = reduce(s, { type: 'use-example', persisted: true });
  assert.equal(s.road!.revision.complete, true);
  assert.equal(s.road!.review.supported, true);
  assert.match(s.road!.revision.feedback!.text, /28 Minuten/);
  const actions: Action[] = [
    { type: 'decision-route', value: 'north' },
    { type: 'criterion', value: 'training' },
    { type: 'advantage', value: 'leila-south-north' },
    { type: 'disadvantage', value: 'amina-south-direct' },
    { type: 'advantage-other', value: 'north' },
    { type: 'event-reason', value: 'goal' },
    { type: 'event-change-evidence', value: 'north' },
    { type: 'text', value: 'geändert' },
  ];
  for (const a of actions) {
    const x = reduce(s, a);
    assert.equal(x.road!.revision.complete, false, a.type);
    assert.equal(x.road!.review.supported, undefined, a.type);
    assert.equal(x.road!.revision.supported, true);
  }
});
test('unusual free explanations and revisions are deliberately ungraded, escaped later, never keyword evaluated, and edits reopen them', () => {
  for (const text of [
    '???',
    'Die Busse brauchen 999 Minuten',
    '<img src=x onerror=alert(1)>',
  ]) {
    let s = toEffects();
    s.road!.answers = { direct: 'longer', north: 'longer', south: 'same' };
    s = reduce(s, check);
    s = reduce(s, { type: 'event-text', value: text });
    s = reduce(s, check);
    assert.equal(s.road!.effects.complete, false);
    s = reduce(s, { type: 'event-submit-explanation', persisted: true });
    assert.equal(s.road!.effects.complete, true);
    assert.equal(s.road!.effects.feedback!.kind, 'neutral');
    s = reduce(s, next);
    s = reduce(s, { type: 'text', value: text });
    s = reduce(s, check);
    assert.equal(s.road!.revision.complete, false);
    s = reduce(s, { type: 'submit-ungraded', persisted: true });
    assert.equal(s.road!.revision.complete, true);
    assert.equal(s.road!.review.ungraded, true);
    assert.equal(restore(s).road!.review.text, text);
    s = reduce(s, { type: 'text', value: text + '?' });
    assert.equal(s.road!.revision.complete, false);
    assert.equal(s.road!.review.ungraded, undefined);
  }
});
test('legacy phase-2A states migrate without replaying tasks; damaged new state preserves the valid first product; restart clears both situations', () => {
  const newer = start();
  const original = structuredClone(newer.road!.original);
  const old = structuredClone(newer);
  delete old.road;
  old.screen = 'end';
  const loaded = restore(old);
  assert.equal(loaded.screen, 'end');
  assert.deepEqual(loaded.decision, original);
  assert.equal(loaded.road, undefined);
  for (const bad of [
    { view: 'bogus' },
    { answers: { unknown: 'longer' } },
    { cause: 'unknown' },
    { review: { text: 22 } },
  ]) {
    const broken = structuredClone(newer);
    Object.assign(broken.road!, bad);
    const safe = restore(broken);
    assert.equal(safe.screen, 'end');
    assert.equal(safe.road, undefined);
    assert.deepEqual(safe.decision, original);
  }
  let s = toRevision();
  s = reduce(s, { type: 'event-reset' });
  assert.equal(s.road!.revision.complete, false);
  assert.deepEqual(s.road!.original, original);
  assert.deepEqual(reduce(s, { type: 'restart' }), initialState());
});
test('new map/time selection and all partial work round trip without changing the first product', () => {
  let s = toEffects();
  s = reduce(s, { type: 'route', value: 'north' });
  s = reduce(s, { type: 'event-view', value: 'before' });
  s = reduce(s, { type: 'event-answer', route: 'direct', value: 'longer' });
  const x = restore(s);
  assert.equal(x.road!.view, 'before');
  assert.equal(x.route, 'north');
  assert.equal(x.road!.answers.direct, 'longer');
  assert.equal(x.road!.find.complete, true);
  assert.match(changeLabel('north'), /28 → 34/);
  assert.equal(evaluateDecision(s.road!.original, true).complete, true);
  assert.equal(evaluateRevision(x.road!, true).complete, false);
});

test('the first recommendation keeps its historical support marker even if the old task is later explicitly reworked', () => {
  let s = start();
  s = reduce(s, { type: 'event-back' });
  delete s.road;
  s.progress[5].supported = true;
  s = reduce(s, { type: 'event-start' });
  assert.equal(s.road!.originalSupported, true);
  s = reduce(s, { type: 'event-back' });
  s = reduce(s, { type: 'back' });
  s = reduce(s, { type: 'reset-task' });
  assert.equal(s.progress[5].supported, undefined);
  assert.equal(s.road!.originalSupported, true);
  assert.equal(s.road!.original.route, 'north');
});
