import test from 'node:test';
import assert from 'node:assert/strict';
import { routes } from '../src/content.ts';
import { evidenceFor } from '../src/model.ts';
import { evaluateDecision, explainDecision } from '../src/feedback.ts';
import { decisionExample, goalStatus, weightingProduct } from '../src/decision.ts';
import { initialState, reduce } from '../src/state.ts';
import { readSession } from '../src/storage.ts';
const check = { type: 'check', persisted: true } as const;
const restore = (s: unknown) => readSession({ getItem: () => JSON.stringify(s), setItem() {}, removeItem() {} });
const fastest = { school: 'north', market: 'direct', training: 'south' };
for (const route of routes) for (const criterion of ['school', 'market', 'training'] as const) {
  test(`B1 ${route}/${criterion}: acknowledge facts, require a connected goal, allow explicit weighting or changed goal`, () => {
    const d = { route, criterion, ...evidenceFor(route), text: '' };
    const conflict = fastest[criterion] !== route;
    const f = evaluateDecision(d, true);
    assert.equal(goalStatus(d)?.conflict, conflict);
    assert.equal(f.kind, 'neutral');
    assert.match(f.text, /Du belegst den Vorteil/);
    assert.match(f.text, /Du beachtest auch den Nachteil/);
    assert.equal(f.complete, !conflict);
    if (conflict) assert.match(f.text, /noch nicht verbunden/);
    const weighted = { ...d, weighting: d.advantage, acceptConflict: true };
    assert.equal(evaluateDecision(weighted, true).complete, true);
    if (conflict) {
      assert.match(weightingProduct(weighted), /längeren Weg.*in Kauf/);
      assert.match(weightingProduct(weighted), /wichtiger.*statt/);
      const changedGoal = route === 'north' ? 'school' : route === 'south' ? 'training' : 'market';
      assert.equal(evaluateDecision({ ...d, criterion: changedGoal }, true).complete, true);
    }
    const s = initialState(); s.step = 5; s.decision = d;
    const checked = reduce(reduce(s, check), check);
    assert.equal(checked.progress[5].failures, 0, 'a legitimate goal conflict is not an incorrect fact');
    const example = decisionExample(d)!;
    assert.equal(example.criterion, criterion);
    assert.equal(evaluateDecision(example, true).complete, true);
    assert.equal(example.supported, true);
    if (conflict) assert.match(explainDecision(d), /weniger gut.*Trotzdem.*wichtiger/);
  });
}
test('activity-only criterion and a bare acknowledgement cannot replace concrete weighting', () => {
  const d = { route: 'south' as const, criterion: 'tradeoff' as const, ...evidenceFor('south'), text: '' };
  assert.equal(evaluateDecision(d, true).complete, false);
  assert.equal(evaluateDecision({ ...d, acceptConflict: true }, true).complete, false);
  assert.equal(evaluateDecision({ ...d, weighting: d.advantage }, true).complete, true);
  const contradictory = { ...d, criterion: 'school' as const, weighting: d.advantage };
  assert.equal(evaluateDecision(contradictory, true).complete, false);
  assert.equal(evaluateDecision({ ...contradictory, acceptConflict: true }, true).complete, true);
});
test('a favourable comparison for the same goal person does not explain ignoring their fastest route', () => {
  const d = { route: 'direct' as const, criterion: 'school' as const, advantage: 'amina-direct-south' as const, disadvantage: 'leila-direct-south' as const, weighting: 'amina-direct-south' as const, acceptConflict: true, text: '' };
  assert.equal(evaluateDecision(d, true).complete, false);
});
test('any route, goal, fact, comparison, priority or text edit invalidates completion and current example provenance', () => {
  let s = initialState(); s.step = 5; s.screen = 'game';
  s.decision = { route: 'south', criterion: 'school', text: 'bleibt mein Gedanke' };
  s = reduce(s, { type: 'help', value: 3 });
  s = reduce(s, { type: 'use-example', persisted: true });
  assert.equal(s.decision.criterion, 'school');
  assert.equal(s.decision.text, 'bleibt mein Gedanke');
  assert.equal(s.progress[5].complete, true);
  for (const action of [
    { type: 'decision-route', value: 'north' }, { type: 'criterion', value: 'training' },
    { type: 'advantage', value: 'leila-south-north' }, { type: 'disadvantage', value: 'amina-south-north' },
    { type: 'advantage-other', value: 'north' }, { type: 'disadvantage-other', value: 'north' },
    { type: 'weighting', value: undefined }, { type: 'text', value: 'geändert' },
  ] as const) {
    const changed = reduce(s, action);
    assert.equal(changed.progress[5].complete, false, action.type);
    assert.equal(changed.progress[5].feedback, undefined, action.type);
    assert.equal(changed.decision.supported, undefined, action.type);
    assert.equal(changed.progress[5].supported, true, 'historical use remains visible');
    assert.equal(reduce(changed, { type: 'use-example', persisted: true }).progress[5].complete, true);
  }
  assert.deepEqual(restore(s), JSON.parse(JSON.stringify(s)));
});
test('old accepted contradictory or activity-only endings reopen without losing drafts or earlier progress', () => {
  for (const criterion of ['school', 'tradeoff'] as const) {
    const old = initialState(); old.step = 5; old.screen = 'end';
    old.progress[2].person = 'david'; old.progress[2].complete = true;
    old.progress[5].complete = true;
    old.decision = { route: 'south', criterion, ...evidenceFor('south'), text: 'Mein alter Text' };
    const loaded = restore(old);
    assert.equal(loaded.screen, 'game');
    assert.equal(loaded.step, 5);
    assert.equal(loaded.decision.panel, 'weigh');
    assert.equal(loaded.progress[5].complete, false);
    assert.equal(loaded.decision.text, 'Mein alter Text');
    assert.equal(loaded.progress[2].person, 'david');
  }
});
test('text alone is not silently approved; deliberate ungraded submission is preserved and any edit reopens it', () => {
  for (const text of ['???', '<img src=x>', 'Leila braucht 999 Minuten']) {
    let s = initialState(); s.step = 5;
    s.decision = { route: 'south', criterion: 'school', text };
    s = reduce(s, check);
    assert.equal(s.progress[5].complete, false);
    s = reduce(s, { type: 'submit-ungraded', persisted: true });
    assert.equal(s.progress[5].complete, true);
    assert.match(s.progress[5].feedback!.title, /unbewertet/);
    assert.match(s.progress[5].feedback!.text, /weniger gut.*noch nicht verbunden/);
    assert.equal(restore(s).decision.ungraded, true);
    s = reduce(s, { type: 'text', value: text + '?' });
    assert.equal(s.decision.ungraded, undefined);
    assert.equal(reduce(s, check).progress[5].complete, false);
  }
});
test('no example without a deliberately chosen goal; draft comparisons and panel round trip; invalid fields are rejected', () => {
  const s = initialState(); s.step = 5; s.decision = { route: 'south', text: '', panel: 'advantage', advantageOther: 'north' };
  assert.equal(decisionExample(s.decision), undefined);
  assert.deepEqual(restore(s), JSON.parse(JSON.stringify(s)));
  for (const extra of [{ panel: 'bogus' }, { weighting: 'bogus' }, { acceptConflict: 'yes' }, { ungraded: 1 }, { advantageOther: 'bogus' }])
    assert.deepEqual(restore({ ...s, decision: { ...s.decision, ...extra } }), initialState());
});
