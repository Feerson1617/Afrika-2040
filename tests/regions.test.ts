import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reduce } from '../src/state.ts';
import type { State } from '../src/state.ts';
import type { StudyAction, StudyId } from '../src/regions/types.ts';
import { cocoa, cocoaChain, cocoaModel } from '../src/regions/cocoa.ts';
import { evaluateStudyDecision } from '../src/regions/shared.ts';
import { readSession, storageKey } from '../src/storage.ts';
import { evidenceFor } from '../src/model.ts';
const action = (
  s: State,
  op: StudyAction['op'],
  value?: string,
  field?: string,
) => reduce(s, { type: 'study', op, value, field, persisted: true });
const start = (id: StudyId = 'cocoa') =>
  reduce(initialState(), { type: 'study', op: 'start', id });
const record = (s: State) => s.studies![s.activeStudy!]!;
const restore = (s: State) =>
  readSession({
    getItem: (k) => (k === storageKey ? JSON.stringify(s) : null),
    setItem() {},
    removeItem() {},
  });
function cocoaExplore() {
  let s = start();
  for (const key of cocoaChain) s = action(s, 'pick', key);
  s = action(s, 'check');
  assert.equal(record(s).progress[0].complete, true);
  return action(s, 'next');
}
function cocoaDecision() {
  let s = cocoaExplore();
  for (const [key, value] of [
    ['quality', '90'],
    ['process', '75'],
  ]) {
    s = action(s, 'select', key);
    s = action(s, 'answer', value, key);
    s = action(s, 'check');
  }
  s = action(s, 'answer', 'costs', 'why');
  s = action(s, 'check');
  assert.equal(record(s).progress[1].complete, true);
  return action(s, 'next');
}
function permutations<T>(a: T[]): T[][] {
  return a.length
    ? a.flatMap((v, i) =>
        permutations(a.filter((_, j) => i !== j)).map((t) => [v, ...t]),
      )
    : [[]];
}
test('Ghana cocoa oracle separates one-time investment, operating costs and surplus', () => {
  assert.deepEqual(cocoaModel('base'), {
    income: 180,
    costs: 100,
    investment: 0,
    surplus: 80,
    investmentLeft: 60,
  });
  assert.deepEqual(cocoaModel('quality'), {
    income: 200,
    costs: 110,
    investment: 20,
    surplus: 90,
    investmentLeft: 40,
  });
  assert.deepEqual(cocoaModel('process'), {
    income: 260,
    costs: 185,
    investment: 60,
    surplus: 75,
    investmentLeft: 0,
  });
  assert.ok(cocoaModel('process').income > cocoaModel('quality').income);
  assert.ok(cocoaModel('process').surplus < cocoaModel('quality').surplus);
});
test('all 24 processing orders: correct order only, partial work free, two complete mistakes explain and adoption continues', () => {
  for (const chain of permutations([...cocoaChain])) {
    const d = cocoa.initial();
    d.chain = chain;
    const e = cocoa.evaluate(0, d, 0);
    assert.equal(
      e.feedback.complete,
      chain.every((v, i) => v === cocoaChain[i]),
    );
  }
  let s = start();
  s = action(s, 'pick', 'beans');
  s = action(s, 'check');
  assert.equal(record(s).progress[0].failures, 0);
  assert.equal(record(s).progress[0].feedback!.kind, 'partial');
  for (const key of ['press', 'mass', 'roast']) s = action(s, 'pick', key);
  s = action(s, 'check');
  s = action(s, 'check');
  assert.equal(record(s).progress[0].failures, 2);
  assert.equal(record(s).progress[0].help, 3);
  assert.equal(record(s).progress[0].complete, false);
  s = action(s, 'adopt');
  assert.deepEqual(record(s).data.chain, [...cocoaChain]);
  assert.equal(record(s).progress[0].supported, true);
  assert.equal(action(s, 'next').screen, 'study');
  assert.equal(record(action(s, 'next')).step, 1);
});
test('both calculations and the cost explanation are necessary; incomplete inputs never fail; two errors count once each', () => {
  let s = cocoaExplore();
  for (let i = 0; i < 3; i++) s = action(s, 'check');
  assert.equal(record(s).progress[1].failures, 0);
  s = action(s, 'select', 'quality');
  s = action(s, 'answer', '200', 'quality');
  s = action(s, 'check');
  assert.equal(record(s).progress[1].failures, 1);
  s = action(s, 'check');
  assert.equal(record(s).progress[1].failures, 2);
  assert.equal(record(s).progress[1].help, 3);
  s = action(s, 'adopt');
  assert.equal(record(s).progress[1].complete, false);
  s = action(s, 'select', 'process');
  s = action(s, 'adopt');
  assert.equal(record(s).progress[1].complete, false);
  s = action(s, 'adopt');
  assert.equal(record(s).progress[1].complete, true);
  assert.equal(record(s).data.why, 'costs');
});
for (const proposal of ['quality', 'process'])
  for (const goal of ['surplus', 'processing'])
    test(`Ghana cocoa ${proposal}/${goal}: neutral connected decision, concrete conflicting priority, no position penalties`, () => {
      let s = cocoaDecision();
      s = action(s, 'answer', proposal, 'proposal');
      s = action(s, 'answer', goal, 'goal');
      s = action(s, 'answer', proposal, 'benefit');
      s = action(s, 'answer', proposal, 'limit');
      s = action(s, 'check');
      const fit =
        (proposal === 'quality' && goal === 'surplus') ||
        (proposal === 'process' && goal === 'processing');
      assert.equal(record(s).progress[2].complete, fit);
      assert.equal(record(s).progress[2].failures, 0);
      assert.equal(record(s).progress[2].feedback!.kind, 'neutral');
      if (!fit) {
        assert.match(record(s).progress[2].feedback!.text, /noch|Dein Ziel/);
        s = action(s, 'answer', 'yes', 'weighted');
        s = action(s, 'check');
        assert.equal(record(s).progress[2].complete, true);
      }
      s = action(s, 'next');
      assert.equal(record(s).step, 3);
      assert.equal(record(restore(s)).step, 3);
    });
test('wrong complete evidence reaches bounded help; original text remains explicitly ungraded; later edits reopen the product', () => {
  let s = cocoaDecision();
  for (const [field, value] of [
    ['proposal', 'quality'],
    ['goal', 'processing'],
    ['benefit', 'all'],
    ['limit', 'none'],
  ])
    s = action(s, 'answer', value, field);
  s = action(s, 'check');
  s = action(s, 'check');
  assert.equal(record(s).progress[2].failures, 2);
  assert.equal(record(s).decision.supported, undefined);
  s = action(s, 'adopt');
  assert.equal(record(s).progress[2].complete, true);
  assert.equal(record(s).decision.supported, true);
  s = action(s, 'text', '??? <img src=x>');
  assert.equal(record(s).decision.supported, undefined);
  assert.equal(record(s).progress[2].complete, false);
  s = action(s, 'submit');
  assert.equal(record(s).decision.ungraded, true);
  assert.equal(record(s).progress[2].complete, true);
  s = action(s, 'text', 'changed');
  assert.equal(record(s).decision.ungraded, undefined);
  assert.equal(record(s).progress[2].complete, false);
});
test('new regional states preserve Kenyan answers and support migration, damaged child storage, return, reset and restart', () => {
  let old = initialState();
  old.screen = 'end';
  old.step = 5;
  old.decision = {
    route: 'north',
    criterion: 'school',
    ...evidenceFor('north'),
    text: 'Kenya first',
  };
  old = reduce(old, { type: 'check', persisted: true });
  const first = structuredClone(old.decision),
    progress = structuredClone(old.progress);
  let s = reduce(old, { type: 'study', op: 'start', id: 'cocoa' });
  s = action(s, 'pick', 'beans');
  s = restore(s);
  assert.deepEqual(s.decision, first);
  assert.deepEqual(s.progress, progress);
  s = action(s, 'home');
  assert.equal(s.screen, 'start');
  s = reduce(s, { type: 'study', op: 'start', id: 'cocoa' });
  assert.deepEqual(record(s).data.chain, ['beans']);
  s = action(s, 'reset');
  assert.deepEqual(record(s).data.chain, []);
  const broken = structuredClone(s);
  broken.studies!.cocoa!.data.chain = ['unknown'];
  const safe = restore(broken);
  assert.equal(safe.screen, 'start');
  assert.deepEqual(safe.decision, first);
  const proto = JSON.parse(JSON.stringify(s));
  proto.activeStudy = '__proto__';
  proto.studies = JSON.parse('{"__proto__": {"bad":true}}');
  assert.equal(restore(proto).screen, 'start');
  assert.deepEqual(restore(proto).decision, first);
  assert.deepEqual(reduce(s, { type: 'restart' }), initialState());
});
test('empty decisions and own texts are not rated as wrong; no keyword evaluation of speculative text', () => {
  const d = cocoa.initial();
  for (const text of ['', '???', '999 garantierter Gewinn']) {
    const e = evaluateStudyDecision(
      cocoa,
      d,
      { proposal: 'process', goal: 'processing', text },
      0,
      true,
    );
    assert.equal(e.failed, false);
    assert.equal(e.feedback.complete, false);
  }
});
