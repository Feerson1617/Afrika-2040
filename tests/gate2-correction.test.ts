import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  active,
  areaId,
  newLearning,
  reduceLearning,
  restoreLearning,
  canContinue,
  type LearningState,
} from '../src/learning/storage.ts';
import { tasksFor } from '../src/learning/tasks.ts';
import { profileIds } from '../src/learning/profiles.ts';
import { evaluate } from '../src/learning/progress.ts';
import { topicAnswers } from './topic-oracles.ts';
import { allWords, taskWords } from '../src/learning/words.ts';
import { economyData } from '../src/inquiry/content.ts';
const act = (
  s: LearningState,
  op: Parameters<typeof reduceLearning>[1]['op'],
  value?: string,
  field?: string,
) => reduceLearning(s, { type: 'learning', op, value, field });
function solve(
  s: LearningState,
  plan: 'cool' | 'shade' = 'shade',
  goal = 'access',
) {
  const t = active(s)!.task;
  const values = {
    ...topicAnswers(t, plan),
    ...(t.id === 'future.goal' ? { goal } : {}),
  };
  for (const f of t.fields) s = act(s, 'answer', values[f.id], f.id);
  return act(s, 'check');
}
function completed(
  profile: (typeof profileIds)[number],
  plan: 'cool' | 'shade',
  goal: string,
) {
  let s = act(newLearning(), 'recommend', profile, 'e');
  for (let i = 0; i < 40 && s.view !== 'journal'; i++) {
    s = solve(s, plan, goal);
    const a = active(s)!;
    assert.ok(canContinue(a.task, a.attempt!), a.task.id);
    s = act(s, 'next');
  }
  assert.equal(s.view, 'journal');
  return s;
}
function at(s: LearningState, id: string) {
  s = structuredClone(s);
  s.view = 'task';
  s.records[areaId(s.unit!, s.profile!)].index = tasksFor(
    s.unit!,
    s.profile!,
  ).findIndex((t) => t.id === id);
  assert.ok(active(s)!.attempt);
  return s;
}
for (const profile of profileIds)
  for (const plan of ['cool', 'shade'] as const)
    for (const goal of ['loss', 'access'])
      test(`Gate2 correction ${profile}/${plan}/${goal}: valid opinions survive adoption, actual changes invalidate current dependants and preserve historical proof`, () => {
        let s = completed(profile, plan, goal);
        const key = areaId('e', profile);
        for (const id of [
          'future.goal',
          'future.plan',
          'future.weight',
          'future.revision',
        ]) {
          s = at(s, id);
          const old = structuredClone(active(s)!.attempt!);
          s = act(s, 'help');
          s = act(s, 'help');
          s = act(s, 'help');
          s = act(s, 'adopt');
          const p = active(s)!.attempt!;
          assert.deepEqual(p.answers, old.answers, id);
          assert.equal(p.exampleUsed, old.exampleUsed);
          assert.deepEqual(p.submissions, old.submissions);
          assert.ok(canContinue(active(s)!.task, p));
          assert.equal(evaluate(active(s)!.task, p.answers).kind, 'neutral');
        }
        const before = structuredClone(s.records[key].attempts);
        s = at(s, 'future.plan');
        const changed = plan === 'cool' ? 'shade' : 'cool';
        s = act(s, 'answer', changed, 'plan');
        s = act(s, 'check');
        for (const [id, p] of Object.entries(s.records[key].attempts))
          if (
            [
              'future.evidence',
              'future.limit',
              'future.weight',
              'future.judgment',
              'future.relation',
              'future.revision',
            ].includes(id)
          ) {
            assert.equal(p.process, 'draft', id);
            assert.equal(p.factual, 'ungraded', id);
            assert.deepEqual(p.answers, before[id].answers);
            assert.deepEqual(p.submissions, before[id].submissions);
          }
        s = at(s, 'future.evidence');
        const index = s.records[key].index;
        s = act(s, 'next');
        assert.equal(s.records[key].index, index);
        // Even an outdated imported submitted flag cannot bypass current factual evaluation.
        active(s)!.attempt!.process = 'submitted';
        active(s)!.attempt!.factual = 'correct';
        assert.equal(canContinue(active(s)!.task, active(s)!.attempt!), false);
        s = act(s, 'next');
        assert.equal(s.records[key].index, index);
        assert.equal(active(s)!.attempt!.process, 'draft');
        s = act(s, 'help');
        s = act(s, 'help');
        s = act(s, 'help');
        s = act(s, 'adopt');
        assert.equal(active(s)!.attempt!.answers.evidence, changed);
        const history = active(s)!.attempt!.submissions;
        assert.equal(history[0].contextPlan, plan);
        assert.equal(history[0].factual, 'correct');
        assert.equal(history.at(-1)!.contextPlan, changed);
        assert.equal(history.at(-1)!.support, 'example');
        assert.deepEqual(restoreLearning(s)!.records, s.records);
        s = at(s, 'future.goal');
        s = act(s, 'answer', goal === 'access' ? 'loss' : 'access', 'goal');
        assert.equal(s.records[key].attempts['future.weight'].process, 'draft');
      });
test('Gate2 correction all three initial representations stay neutral, unchanged and independently attributed after help/adopt', () => {
  for (const profile of profileIds)
    for (const idea of ['nature', 'cities', 'uncertain']) {
      let s = act(newLearning(), 'recommend', profile, 'a');
      s = act(s, 'answer', idea, 'idea');
      s = act(s, 'check');
      const before = structuredClone(active(s)!.attempt!);
      for (let i = 0; i < 3; i++) s = act(s, 'help');
      s = act(s, 'adopt');
      assert.equal(active(s)!.attempt!.answers.idea, idea);
      assert.equal(active(s)!.attempt!.exampleUsed, false);
      assert.deepEqual(active(s)!.attempt!.submissions, before.submissions);
      assert.equal(active(s)!.attempt!.factual, 'na');
    }
});
test('Gate2 correction missing choices can use an explicitly displayed example; no invented factual failure', () => {
  for (const profile of profileIds) {
    let s = act(newLearning(), 'recommend', profile, 'a');
    s = act(s, 'check');
    assert.equal(active(s)!.attempt!.failures, 0);
    s = act(s, 'help');
    s = act(s, 'help');
    s = act(s, 'help');
    assert.equal(active(s)!.attempt!.exampleUsed, false);
    s = act(s, 'adopt');
    assert.equal(active(s)!.attempt!.exampleUsed, true);
    assert.equal(active(s)!.attempt!.answers.idea, 'nature');
  }
});
test('Gate2 correction weighting changes invalidate an own judgment without deleting its text', () => {
  let s = completed('ahr', 'shade', 'loss');
  s = at(s, 'future.weight');
  const before =
    s.records['e.ahr.v1'].attempts['future.judgment'].answers.explanation;
  s = act(s, 'answer', 'adapt', 'weight');
  assert.equal(
    s.records['e.ahr.v1'].attempts['future.judgment'].process,
    'draft',
  );
  assert.equal(
    s.records['e.ahr.v1'].attempts['future.judgment'].answers.explanation,
    before,
  );
  s = act(s, 'check');
  assert.equal(
    evaluate(active(s)!.task, active(s)!.attempt!.answers).kind,
    'neutral',
  );
});
test('Gate2 correction outdated context never unlocks a current weighting or own text; deliberate oral explanation remains possible', () => {
  let s = completed('ahr', 'shade', 'loss');
  s = at(s, 'future.weight');
  active(s)!.attempt!.submissions.at(-1)!.contextPlan = 'cool';
  assert.equal(canContinue(active(s)!.task, active(s)!.attempt!), false);
  const index = s.records['e.ahr.v1'].index;
  s = act(s, 'next');
  assert.equal(s.records['e.ahr.v1'].index, index);
  s = at(s, 'future.judgment');
  s = act(s, 'answer', '', 'explanation');
  s = act(s, 'oral');
  s = act(s, 'check');
  assert.ok(canContinue(active(s)!.task, active(s)!.attempt!));
  assert.equal(active(s)!.attempt!.factual, 'ungraded');
});
test('Gate2 correction AHR adds an independently applied, versioned two-source claim; MSA and old IDs stay intact', () => {
  const msa = tasksFor('d', 'msa'),
    ahr = tasksFor('d', 'ahr');
  assert.equal(msa.length, 5);
  assert.equal(ahr.length, 6);
  assert.deepEqual(
    ahr.slice(0, 5).map((t) => t.id),
    msa.map((t) => t.id),
  );
  const task = ahr.at(-1)!;
  assert.equal(task.id, 'economy.source-claim.v1');
  assert.equal(task.fields[0].kind, 'text');
  assert.match(task.fields[0].label, /Teilnehmerinnen.*GEPA/);
  assert.match(task.fields[0].label, /zusätzliche Information/);
  assert.ok(task.criteria.length >= 4);
  let s = act(newLearning(), 'recommend', 'ahr', 'd');
  for (let i = 0; i < 5; i++) {
    s = solve(s);
    s = act(s, 'next');
  }
  assert.equal(active(s)!.task.id, 'economy.source-claim.v1');
  assert.deepEqual(active(s)!.attempt!.answers, {});
  assert.equal(active(s)!.attempt!.process, 'draft');
  s = act(s, 'answer', 'ich weiß es noch nicht', 'explanation');
  s = act(s, 'check');
  assert.equal(active(s)!.attempt!.factual, 'ungraded');
  assert.ok(canContinue(active(s)!.task, active(s)!.attempt!));
});
test('Gate2 correction lower economic transfers retain complete referents and only necessary electricity data', () => {
  for (const profile of ['foerder', 'esa'] as const)
    for (const t of tasksFor('d', profile).filter((t) =>
      t.id.startsWith('economy.transfer'),
    )) {
      assert.match(
        t.focus!.paragraphs.join(' '),
        /Strom.*verdienen|Stromzugang.*Einkommen/,
      );
      assert.doesNotMatch(t.focus!.paragraphs.join(' '), /BIP|WDI/);
      assert.match(JSON.stringify(t.focus!.rows), /85,1/);
      assert.match(JSON.stringify(t.focus!.rows), /89,5/);
      assert.doesNotMatch(JSON.stringify(t.focus!.rows), /3,8|3,1/);
      assert.ok(t.fields.every((f) => !f.label.includes('damit')));
    }
  assert.equal(economyData.at(-2)!.electricity, 85.1);
  assert.equal(economyData.at(-1)!.electricity, 89.5);
  assert.ok(
    economyData.at(-2)!.gdp > economyData.at(-1)!.gdp &&
      economyData.at(-1)!.gdp > 0,
  );
});
test('Gate2 correction glossary is complete and duplicate-free while actual-step terms remain small', () => {
  const names = allWords.map(([word]) =>
    word
      .replace(/\s*\(.*?\)/g, '')
      .trim()
      .toLocaleLowerCase('de-DE'),
  );
  assert.equal(new Set(names).size, names.length);
  for (const term of [
    'Einnahmen',
    'Überschuss',
    'Investition',
    'Verdunstung',
    'Atmosphäre',
    'Marktstand',
    'Kühlraum',
    'Mehrwegkiste',
    'Zugang',
    'Verteilung',
    'Wartung',
  ])
    assert.ok(names.includes(term.toLocaleLowerCase('de-DE')), term);
  const task = tasksFor('d', 'foerder').find(
    (t) => t.id === 'economy.data.access',
  )!;
  assert.deepEqual(
    taskWords(task).map(([word]) => word),
    ['Zugang', 'Prozent'],
  );
});
test('Gate2 correction an actual 3c8b51b AHR journal preserves its five historical answers but never completes the new source claim', async () => {
  const { readFileSync } = await import('node:fs');
  const old = JSON.parse(
    readFileSync(
      new URL('./fixtures/gate2-3c8b51b-ahr.json', import.meta.url),
      'utf8',
    ),
  );
  let s = restoreLearning(old)!;
  for (const [id, p] of Object.entries(old.records['d.ahr.v1'].attempts))
    assert.deepEqual(s.records['d.ahr.v1'].attempts[id], p);
  assert.equal(
    s.records['d.ahr.v1'].attempts['economy.source-claim.v1'],
    undefined,
  );
  s = act(s, 'unit', 'd');
  assert.equal(active(s)!.task.id, 'economy.explain');
  s = act(s, 'next');
  assert.equal(active(s)!.task.id, 'economy.source-claim.v1');
  assert.deepEqual(active(s)!.attempt!.answers, {});
  assert.equal(active(s)!.attempt!.process, 'draft');
});
test('Gate2 correction both revision choices retain their meaning and provenance after help and adoption in every profile', () => {
  for (const profile of profileIds)
    for (const value of ['keep', 'change']) {
      let s = at(completed(profile, 'shade', 'loss'), 'future.revision');
      s = act(s, 'answer', value, 'revision');
      s = act(s, 'check');
      const before = structuredClone(active(s)!.attempt!);
      for (let i = 0; i < 3; i++) s = act(s, 'help');
      s = act(s, 'adopt');
      assert.equal(active(s)!.attempt!.answers.revision, value);
      assert.equal(active(s)!.attempt!.exampleUsed, before.exampleUsed);
      assert.deepEqual(active(s)!.attempt!.submissions, before.submissions);
      if (value === 'change') {
        const index = active(s)!.index;
        s = act(s, 'next');
        assert.equal(active(s)!.index, index);
        s = act(s, 'future-revise');
        assert.equal(active(s)!.task.id, 'future.plan');
      }
    }
});
test('Gate2 correction help explains the selected plan and announces a missing-choice example before adoption', async () => {
  const { explanationFor } = await import('../src/learning/help.ts');
  for (const profile of profileIds) {
    let s = at(completed(profile, 'shade', 'access'), 'future.plan');
    let a = active(s)!;
    const own = explanationFor(a.task, a.attempt!, a.task.fields[0]);
    assert.match(own, /Deine Wahl bleibt: Schattendächer und Mehrwegkisten/);
    assert.doesNotMatch(own, /Ein mögliches Beispiel: Gemeinsamer Kühlraum/);
    s = act(s, 'answer', '', 'plan');
    a = active(s)!;
    const missing = explanationFor(a.task, a.attempt!, a.task.fields[0]);
    assert.match(missing, /Ein mögliches Beispiel: Gemeinsamer Kühlraum/);
    s = act(s, 'adopt');
    assert.equal(active(s)!.attempt!.answers.plan, 'cool');
    assert.equal(active(s)!.attempt!.exampleUsed, true);
    const evidence = s.records[`e.${profile}.v1`].attempts['future.evidence'];
    assert.equal(evidence.process, 'draft');
    assert.equal(evidence.submissions[0].contextPlan, 'shade');
  }
});
