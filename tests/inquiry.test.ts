import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  topicIds,
  populationBalance,
  populationModel,
  populationData,
  economyData,
  rainRegions,
  seasons,
  type TopicId,
} from '../src/inquiry/content.ts';
import {
  newInquiry,
  reduceInquiry,
  evaluateInquiry,
  checkDefinition,
  checkComplete,
  restoreInquiry,
  productStatus,
  productExample,
  type Inquiry,
  type InquiryAction,
} from '../src/inquiry/state.ts';
import { initialState, reduce } from '../src/state.ts';
import { readSession, saveSession } from '../src/storage.ts';
function act(
  s: Inquiry,
  op: InquiryAction['op'],
  value?: string,
  field?: string,
) {
  return reduceInquiry(s, { type: 'inquiry', op, value, field });
}
const solutions: Record<
  TopicId,
  [Record<string, string>, Record<string, string>]
> = {
  image: [
    { detail: 'stalls', origin: 'jbdodane', scope: 'place' },
    { counter: 'built', missing: 'life' },
  ],
  nature: [
    {
      'ghana-season': 'may-sep',
      'morocco-season': 'oct-apr',
      location: 'morocco',
    },
    { rain: 'tanger', adapt: 'limited' },
  ],
  population: [
    { natural: '30', migration: '-10', end: '1020' },
    { trend: 'increase', status: 'estimate', condition: 'conditional' },
  ],
  economy: [
    { 'surplus-a': '80', 'surplus-b': '60', first: '20' },
    { access: 'share', growth: 'real', conditions: 'together' },
  ],
  future: [
    { reach: 'shade', environment: 'energy', cost: 'running' },
    {
      plan: 'cool',
      goal: 'loss',
      evidence: 'cool',
      limit: 'cool',
      unknown: 'cool',
    },
  ],
};
function start(id: TopicId) {
  let s = act(newInquiry(), 'topic', id);
  if (id === 'image') {
    s = act(s, 'initial', 'Alles Natur');
    s = act(s, 'initial-save');
    s = act(s, 'material', 'market');
    s = act(s, 'material', 'forest');
  }
  if (id === 'future') {
    s = act(s, 'material', 'cool');
    s = act(s, 'material', 'shade');
  }
  return s;
}
function fill(s: Inquiry, answers: Record<string, string>) {
  for (const [f, v] of Object.entries(answers)) s = act(s, 'answer', v, f);
  return s;
}
function finish(id: TopicId) {
  let s = start(id);
  for (const a of solutions[id]) {
    s = fill(s, a);
    s = act(s, 'check');
    assert.equal(checkComplete(id, s.step as 0 | 1, s.records[id]), true);
    s = act(s, 'next');
  }
  return s;
}
test('curriculum real data match independent source snapshots, country, year and indicator; no silent rounding or reordered years', () => {
  for (const [file, code, series] of [
    ['ghapop', 'SP.POP.TOTL', populationData],
    [
      'ghanaelec',
      'EG.ELC.ACCS.ZS',
      economyData.map((x) => [x.year, x.electricity]),
    ],
    ['ghagdp', 'NY.GDP.MKTP.KD.ZG', economyData.map((x) => [x.year, x.gdp])],
  ] as const) {
    const raw = JSON.parse(
      readFileSync(
        new URL(`../docs/sources/afrika-data/${file}.json`, import.meta.url),
        'utf8',
      ),
    );
    assert.equal(raw[0].lastupdated, '2026-10-08');
    for (const [year, value] of series) {
      const row = raw[1].find((r: any) => Number(r.date) === year);
      assert.equal(row.countryiso3code, 'GHA');
      assert.equal(row.indicator.id, code);
      assert.equal(value, row.value);
    }
  }
  assert.deepEqual(
    rainRegions.map((x) => x.mm),
    [634.1, 205.15],
  );
  assert.deepEqual(
    seasons.map((x) => [...x.wet]),
    [
      [5, 6, 7, 8, 9],
      [10, 11, 12, 1, 2, 3, 4],
    ],
  );
});
test('curriculum population arithmetic separates natural change, migration, total and stock, including decline and new values', () => {
  assert.deepEqual(populationBalance(populationModel), {
    natural: 30,
    migration: -10,
    change: 20,
    end: 1020,
  });
  assert.deepEqual(
    populationBalance({
      start: 800,
      births: 28,
      deaths: 12,
      arrivals: 5,
      departures: 17,
    }),
    { natural: 16, migration: -12, change: 4, end: 804 },
  );
  assert.deepEqual(
    populationBalance({
      start: 1000,
      births: 30,
      deaths: 12,
      arrivals: 10,
      departures: 40,
    }),
    { natural: 18, migration: -30, change: -12, end: 988 },
  );
  assert.deepEqual(
    populationBalance({
      start: 100,
      births: 8,
      deaths: 8,
      arrivals: 4,
      departures: 4,
    }),
    { natural: 0, migration: 0, change: 0, end: 100 },
  );
});
test('curriculum every offered alternative is judged against an independent factual answer, including both market proposals', () => {
  for (const id of topicIds) {
    let s = start(id);
    for (const step of [0, 1] as const) {
      const variants =
        id === 'future' && step === 1
          ? [
              solutions.future[1],
              {
                plan: 'shade',
                goal: 'access',
                evidence: 'shade',
                limit: 'shade',
                unknown: 'shade',
              },
            ]
          : [solutions[id][step]];
      for (const values of variants) {
        s = fill(s, values);
        const def = checkDefinition(id, step, s.records[id]);
        for (const field of def.fields) {
          if (!field.options) continue;
          for (const [candidate] of field.options) {
            const changed = act(s, 'answer', candidate, field.id);
            const result = evaluateInquiry(id, step, changed.records[id]);
            const correct =
              candidate === (values as Record<string, string>)[field.id];
            assert.equal(
              result.feedback.complete,
              correct,
              `${id}/${step}/${field.id}/${candidate}`,
            );
            assert.equal(result.error, !correct);
            if (!correct) {
              assert.equal(result.feedback.kind, 'partial');
              assert.match(result.feedback.text, /Schon passend:/);
            }
          }
        }
      }
      s = act(s, 'check');
      s = act(s, 'next');
    }
  }
});
test('curriculum oral alternative needs no written essay and never certifies factual quality', () => {
  for (const id of topicIds) {
    let s = finish(id);
    s = act(s, 'oral', 'true');
    s = act(s, 'submit');
    assert.equal(s.records[id].submitted, true);
    assert.deepEqual(s.records[id].product, ['', '', '']);
    assert.equal(
      productStatus(id, s.records[id]),
      'Mündliche Bearbeitung vermerkt – fachlich noch nicht geprüft',
    );
    assert.equal(restoreInquiry(s)!.records[id].submitted, true);
    s = act(s, 'oral', 'false');
    s = act(s, 'submit');
    assert.equal(s.records[id].submitted, false);
  }
});
for (const id of topicIds) {
  test(`curriculum ${id}: complete both material tasks, own product remains ungraded, survives restore and rework`, () => {
    let s = finish(id);
    assert.equal(s.step, 2);
    const r = s.records[id];
    assert.equal(r.submitted, false);
    s = act(s, 'submit');
    assert.equal(s.records[id].submitted, false);
    for (const [i, text] of [
      'Mein konkreter Beleg.',
      'Meine Erklärung mit Bedingung.',
      'Meine begründete Grenze.',
    ].entries())
      s = act(s, 'product', text, String(i));
    s = act(s, 'submit');
    assert.equal(s.records[id].submitted, true);
    assert.match(
      productStatus(id, s.records[id]),
      /Eigene Antwort.*nicht geprüft/,
    );
    s = restoreInquiry(JSON.parse(JSON.stringify(s)))!;
    assert.equal(s.records[id].submitted, true);
    assert.equal(s.records[id].product[1], 'Meine Erklärung mit Bedingung.');
    s = act(s, 'back');
    s = act(s, 'answer', '', Object.keys(solutions[id][1]).at(-1));
    assert.equal(s.records[id].submitted, false);
    assert.equal(s.records[id].product[1], 'Meine Erklärung mit Bedingung.');
    assert.equal(checkComplete(id, 1, s.records[id]), false);
  });
  test(`curriculum ${id}: every fully wrong, partial, missing, second error, hint and deliberate adoption path`, () => {
    let s = start(id),
      r = s.records[id];
    s = act(s, 'check');
    assert.equal(s.records[id].checks[0].failures, 0);
    assert.equal(s.records[id].checks[0].feedback?.kind, 'neutral');
    // In-memory drafts emulate a wrong but fully supplied selection without deriving expectations from task definitions.
    for (const key of Object.keys(solutions[id][0]))
      r.checks[0].answers[key] = 'objectively-wrong';
    let e = evaluateInquiry(id, 0, r);
    assert.equal(e.feedback.kind, 'incorrect');
    assert.equal(e.error, true);
    const first = Object.keys(solutions[id][0])[0];
    r.checks[0].answers[first] = solutions[id][0][first];
    e = evaluateInquiry(id, 0, r);
    assert.equal(e.feedback.kind, 'partial');
    assert.match(e.feedback.text, /Schon passend:/);
    const other = Object.keys(solutions[id][0])[1];
    delete r.checks[0].answers[other];
    e = evaluateInquiry(id, 0, r);
    assert.equal(e.error, false);
    assert.equal(e.feedback.kind, 'partial');
    r.checks[0].answers[other] = 'objectively-wrong';
    s.records[id] = r;
    s = act(s, 'check');
    assert.equal(s.records[id].checks[0].failures, 1);
    s = act(s, 'check');
    assert.equal(s.records[id].checks[0].failures, 2);
    assert.equal(s.records[id].checks[0].help, 3);
    assert.equal(s.records[id].checks[0].feedback?.kind, 'hint');
    assert.equal(s.records[id].checks[0].exampleUsed, false);
    s = act(s, 'adopt');
    assert.equal(checkComplete(id, 0, s.records[id]), true);
    assert.equal(s.records[id].checks[0].exampleUsed, true);
    assert.equal(s.records[id].checks[0].adopted, true);
    s = act(s, 'answer', '', first);
    assert.equal(s.records[id].checks[0].adopted, false);
    assert.equal(s.records[id].checks[0].exampleUsed, true);
    assert.equal(checkComplete(id, 0, s.records[id]), false);
  });
  test(`curriculum ${id}: all three product helps, automatic display is not adoption, edited example remains marked`, () => {
    let s = finish(id);
    for (let i = 1; i <= 3; i++) {
      s = act(s, 'product-help');
      assert.equal(s.records[id].productHelp, i);
      assert.equal(s.records[id].productExampleUsed, false);
      assert.equal(s.records[id].submitted, false);
    }
    s = act(s, 'product-adopt');
    assert.deepEqual(s.records[id].product, productExample(id, s.records[id]));
    assert.match(productStatus(id, s.records[id]), /bewusst übernommen/);
    s = act(s, 'product', 'Ich verändere diese Begründung.', '1');
    s = act(s, 'submit');
    assert.match(
      productStatus(id, s.records[id]),
      /Beispiel genutzt oder überarbeitet/,
    );
    const restored = restoreInquiry(s)!;
    assert.equal(restored.records[id].productAdopted, false);
    assert.equal(restored.records[id].productExampleUsed, true);
  });
}
test('curriculum no incomplete numeric input counts as a failure; malformed numbers are never parseFloat-coerced', () => {
  let s = start('population');
  s = fill(s, { natural: '30', migration: '', end: '1020' });
  s = act(s, 'check');
  assert.equal(s.records.population.checks[0].failures, 0);
  assert.equal(s.records.population.checks[0].feedback?.kind, 'partial');
  for (const bad of ['-10 people', '-1e1', '0x400', '-10.0', 'Infinity']) {
    s = fill(s, { migration: bad });
    const e = evaluateInquiry('population', 0, s.records.population);
    assert.equal(e.feedback.complete, false);
    assert.equal(e.error, true);
  }
});
test('curriculum inspect both authentic materials and both measures before completion; help cannot replace exploration', () => {
  for (const id of ['image', 'future'] as const) {
    let s = act(newInquiry(), 'topic', id);
    if (id === 'image') s = act(s, 'initial-save', 'none');
    s = fill(s, solutions[id][0]);
    s = act(s, 'check');
    assert.equal(checkComplete(id, 0, s.records[id]), false);
    assert.equal(s.records[id].checks[0].failures, 0);
    for (let i = 0; i < 3; i++) s = act(s, 'help');
    s = act(s, 'adopt');
    assert.equal(checkComplete(id, 0, s.records[id]), false);
  }
});
test('curriculum both proposals with both goals: legitimate conflict is neutral without failure; explicit concrete weighting or changed goal enables completion', () => {
  for (const plan of ['cool', 'shade'] as const)
    for (const goal of ['loss', 'access']) {
      let s = start('future');
      s = fill(s, solutions.future[0]);
      s = act(s, 'check');
      s = act(s, 'next');
      s = fill(s, { plan, goal, evidence: plan, limit: plan, unknown: plan });
      s = act(s, 'check');
      let p = s.records.future.checks[1];
      const matches = goal === (plan === 'cool' ? 'loss' : 'access');
      assert.equal(p.feedback?.kind, 'neutral');
      assert.equal(p.feedback?.complete, matches);
      assert.equal(p.failures, 0);
      assert.match(p.feedback!.text, /Beleg|passend/);
      if (!matches) {
        assert.match(p.feedback!.title, /offen/);
        s = act(s, 'answer', plan === 'cool' ? 'loss' : 'access', 'weighting');
        s = act(s, 'check');
        assert.equal(s.records.future.checks[1].feedback?.complete, true);
        assert.match(
          s.records.future.checks[1].feedback!.text,
          /nehme in Kauf/,
        );
        assert.equal(s.records.future.checks[1].failures, 0);
      }
      const restored = restoreInquiry(s)!;
      assert.equal(checkComplete('future', 1, restored.records.future), true);
      s = act(s, 'answer', plan === 'cool' ? 'shade' : 'cool', 'plan');
      assert.equal(s.records.future.checks[1].answers.weighting, undefined);
      s = act(s, 'check');
      assert.equal(s.records.future.checks[1].feedback?.kind, 'incorrect');
      assert.equal(s.records.future.checks[1].failures, 1);
    }
});
test('curriculum wrong evidence for other measure is objective partial feedback, not legitimized by preference', () => {
  let s = start('future');
  s = fill(s, solutions.future[0]);
  s = act(s, 'check');
  s = act(s, 'next');
  s = fill(s, {
    plan: 'cool',
    goal: 'access',
    evidence: 'shade',
    limit: 'cool',
    unknown: 'cool',
  });
  s = act(s, 'check');
  assert.equal(s.records.future.checks[1].feedback?.kind, 'partial');
  assert.equal(s.records.future.checks[1].failures, 1);
  s = act(s, 'check');
  assert.equal(s.records.future.checks[1].feedback?.kind, 'hint');
  assert.match(s.records.future.checks[1].feedback!.text, /Kühlung kann/);
  assert.equal(s.records.future.checks[1].exampleUsed, false);
  s = act(s, 'adopt');
  assert.equal(s.records.future.checks[1].answers.goal, 'loss');
  assert.equal(s.records.future.checks[1].answers.weighting, undefined);
  assert.equal(checkComplete('future', 1, s.records.future), true);
});
test('curriculum original six-episode state survives new namespace, malformed new content, return home, storage failure and reset', () => {
  const old = initialState();
  old.step = 1;
  old.route = 'north';
  old.progress[0].failures = 1;
  let s = reduce(old, { type: 'inquiry', op: 'open' });
  assert.deepEqual(s.progress, old.progress);
  assert.deepEqual(s.decision, old.decision);
  s = reduce(s, { type: 'inquiry', op: 'home' });
  assert.equal(s.screen, 'start');
  assert.equal(s.step, 1);
  assert.equal(s.route, 'north');
  let raw = '';
  const store = {
    getItem: () => raw,
    setItem: (_k: string, v: string) => {
      raw = v;
    },
    removeItem: () => {
      raw = '';
    },
  };
  assert.equal(saveSession(s, store), true);
  let back = readSession(store);
  assert.deepEqual(back.progress, old.progress);
  const damaged = JSON.parse(raw);
  damaged.inquiry = {
    topic: 'population',
    step: 2,
    records: { population: null },
  };
  raw = JSON.stringify(damaged);
  back = readSession(store);
  assert.deepEqual(back.progress, old.progress);
  assert.equal(back.inquiry?.step, 0);
  assert.equal(
    saveSession(s, {
      ...store,
      setItem: () => {
        throw new Error('blocked');
      },
    }),
    false,
  );
  const reset = reduce(s, { type: 'restart' });
  assert.equal(reset.inquiry, undefined);
});
test('curriculum restore re-evaluates forged completion/feedback and isolates damaged records', () => {
  const s = finish('population');
  const p = s.records.population.checks[0];
  p.answers.natural = '999';
  p.feedback = { kind: 'correct', title: 'fake', text: 'fake', complete: true };
  const restored = restoreInquiry(s)!;
  assert.equal(restored.step, 0);
  assert.equal(
    checkComplete('population', 0, restored.records.population),
    false,
  );
  assert.notEqual(restored.records.population.checks[0].feedback?.text, 'fake');
});
