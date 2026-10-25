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

import { share, shareKeys, shareModel } from '../src/regions/share.ts';
function shareExplore() {
  let s = start('share');
  s = action(s, 'answer', '120', 'free');
  s = action(s, 'answer', 'paid', 'wages');
  s = action(s, 'check');
  assert.equal(record(s).progress[0].complete, true);
  return action(s, 'next');
}
function shareDecision(amounts = [40, 40, 40]) {
  let s = shareExplore();
  shareKeys.forEach((k, i) => {
    s = action(s, 'select', k);
    for (let j = 0; j < amounts[i]; j += 20) s = action(s, 'adjust', '20', k);
  });
  s = action(s, 'answer', 'tradeoff', 'why');
  s = action(s, 'check');
  assert.equal(record(s).progress[1].complete, true);
  return action(s, 'next');
}
test('Ghana allocation oracle: wages and all costs paid before 120 is distributed; no overspending or negative allocation', () => {
  assert.deepEqual(shareModel(share.initial()), {
    income: 300,
    paidWages: 100,
    otherPaidCosts: 80,
    available: 120,
    used: 0,
    left: 120,
  });
  let s = shareExplore();
  for (let i = 0; i < 8; i++) s = action(s, 'adjust', '20', 'reserve');
  assert.equal(record(s).data.allocations.reserve, 120);
  s = action(s, 'adjust', '-20', 'payout');
  assert.equal(record(s).data.allocations.payout, 0);
  s = action(s, 'adjust', '20', '__proto__');
  assert.equal(shareModel(record(s).data).left, 0);
});
test('all 28 allocations are valid, including single-purpose extremes; never a moral ranking or guaranteed future return', () => {
  let count = 0;
  for (let a = 0; a <= 120; a += 20)
    for (let b = 0; b <= 120 - a; b += 20) {
      const c = 120 - a - b;
      const s = shareDecision([a, b, c]),
        d = record(s).data;
      count++;
      assert.equal(share.valid(d), true);
      assert.equal(shareModel(d).left, 0);
      for (const o of share.options(d)) {
        assert.equal(o.eligible, d.allocations[o.id] > 0);
        if (!o.eligible) continue;
        for (const goal of shareKeys) {
          const e = evaluateStudyDecision(
            share,
            d,
            {
              proposal: o.id,
              goal,
              benefit: o.id,
              limit: o.id,
              weighted: goal !== o.id,
              text: '',
            },
            0,
            true,
          );
          assert.equal(e.feedback.complete, true);
          assert.equal(e.feedback.kind, 'neutral');
          assert.equal(e.failed, false);
        }
      }
      assert.equal(record(restore(s)).step, 2);
    }
  assert.equal(count, 28);
  assert.match(share.options(share.initial())[2].limit, /offen/);
});
test('allocation requires investigating all three purposes, complete budget and causal explanation; missing work is free and partial facts acknowledged', () => {
  let s = start('share');
  s = action(s, 'answer', '120', 'free');
  s = action(s, 'check');
  assert.equal(record(s).progress[0].feedback!.kind, 'partial');
  assert.match(record(s).progress[0].feedback!.text, /120 GE/);
  assert.equal(record(s).progress[0].failures, 0);
  s = shareExplore();
  for (let i = 0; i < 6; i++) s = action(s, 'adjust', '20', 'payout');
  s = action(s, 'answer', 'tradeoff', 'why');
  s = action(s, 'check');
  assert.equal(record(s).progress[1].complete, false);
  assert.equal(record(s).progress[1].failures, 0);
  for (const k of shareKeys) s = action(s, 'select', k);
  s = action(s, 'answer', 'sure', 'why');
  s = action(s, 'check');
  s = action(s, 'check');
  assert.equal(record(s).progress[1].failures, 2);
  assert.equal(record(s).progress[1].help, 3);
  s = action(s, 'adopt');
  assert.equal(record(s).progress[1].complete, true);
  assert.equal(record(s).progress[1].supported, true);
  assert.deepEqual(record(s).data.allocations, {
    payout: 40,
    reserve: 40,
    training: 40,
  });
});
test('editing a distribution invalidates its later product, preserves support history, other regional products and Kenyan state', () => {
  let s = shareDecision();
  for (const f of ['proposal', 'goal', 'benefit', 'limit'])
    s = action(s, 'answer', 'reserve', f);
  s = action(s, 'help', '3');
  s = action(s, 'adopt');
  s = action(s, 'next');
  assert.equal(record(s).step, 3);
  s = action(s, 'home');
  s = reduce(s, { type: 'study', op: 'start', id: 'cocoa' });
  s = action(s, 'pick', 'beans');
  s = action(s, 'home');
  s = reduce(s, { type: 'study', op: 'start', id: 'share' });
  s = action(s, 'back');
  s = action(s, 'back');
  s = action(s, 'adjust', '-20', 'reserve');
  assert.equal(record(s).progress[1].complete, false);
  assert.equal(record(s).progress[2].complete, false);
  assert.equal(record(s).decision.supported, undefined);
  assert.equal(record(s).progress[2].supported, true);
  assert.deepEqual(s.studies!.cocoa!.data.chain, ['beans']);
  assert.equal(record(restore(s)).step, 1);
  const damaged = structuredClone(s);
  damaged.studies!.share!.data.allocations.payout = 121;
  assert.equal(restore(damaged).studies!.share, undefined);
  assert.deepEqual(restore(damaged).studies!.cocoa!.data.chain, ['beans']);
});

import { water, waterModel } from '../src/regions/water.ts';
import { waterBalance } from '../src/regions/water-model.ts';
function waterExplore() {
  let s = start('water');
  for (const [k, v] of [
    ['withdrawal', '60'],
    ['rest', '20'],
  ])
    s = action(s, 'answer', v, k);
  s = action(s, 'check');
  assert.equal(record(s).progress[0].complete, true);
  return action(s, 'next');
}
function waterDecision() {
  let s = waterExplore();
  for (const [k, v] of [
    ['repair', '30'],
    ['tech', '35'],
  ]) {
    s = action(s, 'select', k);
    s = action(s, 'answer', v, k);
    s = action(s, 'check');
  }
  s = action(s, 'answer', 'delivery', 'why');
  s = action(s, 'check');
  assert.equal(record(s).progress[1].complete, true);
  return action(s, 'next');
}
test('Morocco tank oracle: stock minus withdrawal, delivery distinct, no invented consumption or groundwater result', () => {
  assert.deepEqual(waterModel('base'), {
    initial: 80,
    withdrawal: 60,
    remaining: 20,
    atField: 40,
    notAtField: 20,
  });
  assert.deepEqual(waterModel('repair'), {
    initial: 80,
    withdrawal: 50,
    remaining: 30,
    atField: 40,
    notAtField: 10,
  });
  assert.deepEqual(waterModel('tech'), {
    initial: 80,
    withdrawal: 45,
    remaining: 35,
    atField: 40,
    notAtField: 5,
  });
  for (const k of ['base', 'repair', 'tech']) {
    const m = waterModel(k);
    assert.equal(m.atField + m.notAtField, m.withdrawal);
    assert.equal(m.remaining + m.withdrawal, 80);
    assert.equal('consumption' in m, false);
    assert.equal('groundwater' in m, false);
  }
  assert.deepEqual(waterModel('__proto__'), waterModel('base'));
  for (let w = 0; w <= 80; w++) assert.equal(waterBalance(w).remaining, 80 - w);
  for (const w of [-1, 81, 1.5, NaN, Infinity])
    assert.throws(() => waterBalance(w), RangeError);
});
test('water incomplete/partial acknowledgment, bounded two failures and explicit adoption of each measure only', () => {
  let s = start('water');
  s = action(s, 'answer', '60', 'withdrawal');
  s = action(s, 'check');
  assert.equal(record(s).progress[0].failures, 0);
  assert.match(record(s).progress[0].feedback!.text, /60 WE/);
  s = action(s, 'answer', '60', 'rest');
  s = action(s, 'check');
  s = action(s, 'check');
  assert.equal(record(s).progress[0].help, 3);
  s = action(s, 'adopt');
  s = action(s, 'next');
  s = action(s, 'help', '3');
  s = action(s, 'adopt');
  assert.equal(record(s).progress[1].complete, false);
  for (const k of ['repair', 'tech']) {
    s = action(s, 'select', k);
    s = action(s, 'adopt');
    assert.equal(record(s).progress[1].complete, false);
  }
  s = action(s, 'adopt');
  assert.equal(record(s).progress[1].complete, true);
  assert.equal(record(s).progress[1].supported, true);
});
test('water investigations reject guaranteed groundwater/harvest claims; both measures and all goal combinations remain legitimately neutral', () => {
  let s = waterDecision();
  const d = record(s).data;
  for (const why of ['ground', 'harvest']) {
    const x = structuredClone(d);
    x.why = why;
    assert.equal(water.evaluate(1, x, 1).feedback.complete, false);
  }
  for (const o of water.options(d))
    for (const goal of ['repair', 'less']) {
      const e = evaluateStudyDecision(
        water,
        d,
        {
          proposal: o.id,
          goal,
          benefit: o.id,
          limit: o.id,
          weighted: goal !== o.goal,
          text: '',
        },
        0,
        true,
      );
      assert.equal(e.feedback.complete, true);
      assert.equal(e.feedback.kind, 'neutral');
      assert.equal(e.failed, false);
    }
  for (const [k, v] of [
    ['proposal', 'tech'],
    ['goal', 'less'],
    ['benefit', 'tech'],
    ['limit', 'tech'],
  ])
    s = action(s, 'answer', v, k);
  s = action(s, 'check');
  s = action(s, 'next');
  assert.equal(record(restore(s)).step, 3);
  s = action(s, 'back');
  s = action(s, 'back');
  s = action(s, 'answer', '45', 'tech');
  assert.equal(record(s).progress[1].complete, false);
  assert.equal(record(s).progress[2].complete, false);
  assert.equal(record(restore(s)).step, 1);
});

import { area, areaModel } from '../src/regions/area.ts';
import { product } from '../src/regions/shared.ts';
function areaExplore() {
  let s = start('area');
  s = action(s, 'select', 'same');
  for (const [k, v] of [
    ['single', '45'],
    ['saving', '15'],
  ])
    s = action(s, 'answer', v, k);
  s = action(s, 'check');
  assert.equal(record(s).progress[0].complete, true);
  return action(s, 'next');
}
function areaDecision() {
  let s = areaExplore();
  for (const [k, v] of [
    ['same', '45'],
    ['extra', '65'],
  ]) {
    s = action(s, 'select', k);
    s = action(s, 'answer', v, k);
    s = action(s, 'check');
  }
  s = action(s, 'answer', 'growth', 'why');
  s = action(s, 'check');
  assert.equal(record(s).progress[1].complete, true);
  return action(s, 'next');
}
test('Morocco area oracle: 60 to 45 on same field, extra smaller field adds 20 and total becomes 65, not 45', () => {
  assert.deepEqual(areaModel('base'), {
    initial: 80,
    withdrawal: 60,
    remaining: 20,
    first: 60,
    extra: 0,
  });
  assert.deepEqual(areaModel('same'), {
    initial: 80,
    withdrawal: 45,
    remaining: 35,
    first: 45,
    extra: 0,
  });
  assert.deepEqual(areaModel('extra'), {
    initial: 80,
    withdrawal: 65,
    remaining: 15,
    first: 45,
    extra: 20,
  });
  assert.equal(areaModel('base').first - areaModel('extra').first, 15);
  assert.equal(areaModel('extra').withdrawal - areaModel('base').withdrawal, 5);
});
test('area must be actively investigated; right single-field calculation does not confirm a false claim about overall savings', () => {
  let s = start('area');
  for (const [k, v] of [
    ['single', '45'],
    ['saving', '15'],
  ])
    s = action(s, 'answer', v, k);
  s = action(s, 'check');
  assert.equal(record(s).progress[0].complete, false);
  assert.equal(record(s).progress[0].failures, 0);
  s = action(s, 'select', 'same');
  s = action(s, 'check');
  s = action(s, 'next');
  s = action(s, 'select', 'extra');
  s = action(s, 'answer', '45', 'extra');
  s = action(s, 'check');
  s = action(s, 'check');
  assert.equal(record(s).progress[1].failures, 2);
  assert.equal(record(s).progress[1].complete, false);
  s = action(s, 'adopt');
  assert.equal(record(s).data.answers.extra, '65');
  assert.equal(record(s).progress[1].complete, false);
  s = action(s, 'select', 'same');
  s = action(s, 'adopt');
  s = action(s, 'adopt');
  assert.equal(record(s).progress[1].complete, true);
  for (const why of ['always', 'free']) {
    const d = structuredClone(record(s).data);
    d.why = why;
    assert.equal(area.evaluate(1, d, 1).feedback.complete, false);
  }
});
test('both area plans can be justified with every goal; complete product explains individual saving versus total withdrawal', () => {
  const s = areaDecision(),
    d = record(s).data;
  for (const o of area.options(d))
    for (const goal of ['save', 'area']) {
      const dec = {
        proposal: o.id,
        goal,
        benefit: o.id,
        limit: o.id,
        weighted: goal !== o.goal,
        text: '',
      };
      const e = evaluateStudyDecision(area, d, dec, 0, true);
      assert.equal(e.feedback.complete, true);
      assert.equal(e.feedback.kind, 'neutral');
      const text = product(area, d, dec);
      assert.match(text, /Zum Vergleich:/);
      assert.match(
        text,
        o.id === 'same'
          ? /Mein Plan bewässert nur das gleiche Feld: insgesamt 45 WE/
          : /Mein Plan bewässert auch das kleinere Zusatzfeld: 45 \+ 20 = 65 WE/,
      );
    }
});
test('both Morocco episodes reset the experiment without losing already correct baseline answers; reload preserves progress', () => {
  for (const build of [waterDecision, areaDecision]) {
    let s = build();
    s = action(s, 'back');
    s = action(s, 'reset');
    assert.equal(record(s).progress[0].complete, true);
    assert.equal(record(s).progress[1].complete, false);
    s = restore(s);
    assert.equal(record(s).step, 1);
    assert.equal(record(s).progress[0].complete, true);
    assert.equal(record(s).data.checked.length, 0);
  }
});
test('area edits invalidate current evidence and priority; unrelated Ghana and Kenya records remain intact', () => {
  let s = shareDecision([120, 0, 0]);
  s = action(s, 'home');
  const ghana = structuredClone(s.studies!.share);
  s = reduce(s, { type: 'study', op: 'start', id: 'area' });
  s = action(s, 'help', '3');
  s = action(s, 'adopt');
  s = action(s, 'next');
  for (const k of ['same', 'extra']) {
    s = action(s, 'select', k);
    s = action(s, 'help', '3');
    s = action(s, 'adopt');
  }
  s = action(s, 'adopt');
  s = action(s, 'next');
  for (const [k, v] of [
    ['proposal', 'extra'],
    ['goal', 'save'],
    ['benefit', 'extra'],
    ['limit', 'extra'],
    ['weighted', 'yes'],
  ])
    s = action(s, 'answer', v, k);
  s = action(s, 'check');
  s = action(s, 'next');
  assert.equal(record(restore(s)).step, 3);
  s = action(s, 'back');
  s = action(s, 'answer', 'same', 'proposal');
  assert.equal(record(s).progress[2].complete, false);
  assert.equal(record(s).decision.weighted, undefined);
  assert.deepEqual(s.studies!.share, ghana);
  assert.equal(s.step, 0);
});

test('regional decision sections preserve answers, never count navigation as failure, and reveal the missing part on check', () => {
  let s = cocoaDecision();
  s = action(s, 'panel', 'limit');
  s = action(s, 'check');
  assert.equal(record(s).panel, 'plan');
  assert.equal(record(s).progress[2].failures, 0);
  s = action(s, 'answer', 'quality', 'proposal');
  s = action(s, 'answer', 'surplus', 'goal');
  s = action(s, 'check');
  assert.equal(record(s).panel, 'benefit');
  assert.equal(record(s).progress[2].failures, 0);
  s = action(s, 'answer', 'quality', 'benefit');
  s = action(s, 'panel', 'plan');
  s = action(s, 'panel', 'limit');
  s = action(s, 'check');
  assert.equal(record(s).panel, 'limit');
  assert.equal(record(s).progress[2].feedback!.kind, 'partial');
  s = action(s, 'answer', 'quality', 'limit');
  s = action(s, 'check');
  assert.equal(record(s).progress[2].complete, true);
  s = action(s, 'panel', 'plan');
  assert.equal(record(s).progress[2].complete, true);
  assert.equal(record(restore(s)).panel, 'plan');
});
test('damaged successful experiment marks are rejected independently of stored completion flags; unrelated studies survive', () => {
  for (const build of [cocoaDecision, waterDecision, areaDecision]) {
    const s = build(),
      id = s.activeStudy!,
      r = record(s);
    r.data.answers[r.data.checked[0]] = '999';
    const next = restore(s);
    assert.equal(next.studies![id], undefined);
    assert.equal(next.screen, 'start');
  }
  const s = shareDecision();
  record(s).data.explored.push('payout');
  assert.equal(restore(s).studies!.share, undefined);
});
test('factually true evidence about another option is an unconnected argument, not a red judgment of the chosen position', () => {
  for (const spec of [cocoa, share, water, area]) {
    const d = spec.initial();
    if (spec.id === 'share')
      d.allocations = { payout: 40, reserve: 40, training: 40 };
    const options = spec.options(d),
      first = options[0],
      other = options[1];
    const e = evaluateStudyDecision(
      spec,
      d,
      {
        proposal: first.id,
        goal: first.goal,
        benefit: other.id,
        limit: first.id,
        text: '',
      },
      0,
      true,
    );
    assert.equal(e.feedback.kind, 'neutral');
    assert.equal(e.failed, true);
    assert.equal(e.feedback.complete, false);
    assert.match(e.feedback.text, /Du beachtest die Grenze/);
    assert.match(e.feedback.text, /gehört zu/);
  }
});

import { studyHint } from '../src/regions/ui.ts';
for (const build of [cocoaDecision, shareDecision, waterDecision, areaDecision])
  test(`correction: ${build.name} complete associations adapt within two checks; incomplete, own language and conflict stay open`, () => {
    let s = build(),
      r = record(s);
    const spec = { cocoa, share, water, area }[s.activeStudy!];
    const [o, other] = spec.options(r.data);
    for (const [k, v] of [
      ['proposal', o.id],
      ['goal', o.goal],
      ['benefit', other.id],
      ['limit', other.id],
    ])
      s = action(s, 'answer', v, k);
    s = action(s, 'check');
    assert.equal(record(s).progress[2].help, 0);
    s = action(s, 'check');
    r = record(s);
    assert.equal(r.progress[2].help, 3);
    assert.equal(r.progress[2].complete, false);
    assert.equal(r.decision.supported, undefined);
    assert.equal(r.progress[2].supported, undefined);
    s = action(s, 'adopt');
    assert.equal(record(s).progress[2].complete, true);
    assert.equal(record(s).decision.supported, true);
    s = action(s, 'answer', o.id, 'benefit');
    assert.equal(record(s).decision.supported, undefined);
    s = action(s, 'answer', undefined, 'limit');
    s = action(s, 'check');
    assert.match(record(s).progress[2].feedback!.text, /Dein Beleg passt/);
    const before = record(s).progress[2].failures;
    s = action(s, 'text', '???');
    s = action(s, 'check');
    assert.equal(record(s).progress[2].failures, before);
    s = action(s, 'submit');
    assert.equal(record(s).decision.ungraded, true);
    assert.doesNotMatch(record(s).progress[2].feedback!.text, /Karte/);
    const hints = [1, 2, 3].map((n) =>
      studyHint(action(build(), 'help', String(n))),
    ); // without a plan: safe prompts
    assert.notEqual(hints[0], hints[1]);
  });
test('complete area products: own plan and conditional comparison are assigned correctly for both goals, support and reload', () => {
  for (const proposal of ['same', 'extra'])
    for (const goal of ['save', 'area']) {
      let s = areaDecision();
      for (const [k, v] of [
        ['proposal', proposal],
        ['goal', goal],
        ['benefit', proposal],
        ['limit', proposal],
      ])
        s = action(s, 'answer', v, k);
      s = action(s, 'help', '3');
      const hints = [1, 2, 3].map((n) => {
        const x = structuredClone(s);
        record(x).progress[2].help = n;
        return studyHint(x);
      });
      assert.equal(new Set(hints).size, 3);
      s = action(s, 'adopt');
      s = action(s, 'next');
      s = restore(s);
      const d = record(s).decision,
        text = product(area, record(s).data, d);
      const conclusion =
        proposal === 'same'
          ? 'Mein Plan bewässert nur das gleiche Feld: insgesamt 45 WE. Zum Vergleich: Mit dem kleineren Zusatzfeld wären es 45 + 20 = 65 WE statt früher 60 WE. Mehr Flächen können die Einsparung am ersten Feld also aufheben.'
          : 'Mein Plan bewässert auch das kleinere Zusatzfeld: 45 + 20 = 65 WE statt früher 60 WE. Das erste Feld braucht weniger, beide Felder zusammen aber mehr. Zum Vergleich: Ohne Zusatzfeld wären es insgesamt 45 WE.';
      assert.ok(text.endsWith(conclusion));
      assert.equal(d.benefit, proposal);
      assert.equal(d.limit, proposal);
      assert.doesNotMatch(text, /Es werden aber mehr Flächen bewässert/);
    }
});
