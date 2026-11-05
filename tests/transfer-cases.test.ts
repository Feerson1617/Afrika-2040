import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tasksFor } from '../src/learning/tasks.ts';
import { profileIds } from '../src/learning/profiles.ts';
import { variantCatalog } from '../src/learning/catalog.ts';
import { transferCases } from '../src/learning/transfer-cases.ts';
import { simulationMaterial } from '../src/learning/simulation-material.ts';
import {
  active,
  newLearning,
  reduceLearning,
  restoreLearning,
  type LearningState,
} from '../src/learning/storage.ts';
import { evaluate } from '../src/learning/progress.ts';
import { answers } from './learning-oracles.ts';
import { demandScenario } from '../src/demand.ts';
import { waterModel } from '../src/regions/water.ts';
import { areaModel } from '../src/regions/area.ts';
const act = (
  s: LearningState,
  op: Parameters<typeof reduceLearning>[1]['op'],
  value?: string,
  field?: string,
) => reduceLearning(s, { type: 'learning', op, value, field });
const rows = (html: string) =>
  [
    ...html.matchAll(/<tr><th scope="row">(.*?)<\/th><td>(.*?)<\/td><\/tr>/g),
  ].map((m) => [m[1], m[2]]);
const cases = {
  s2: {
    id: 'demand-18',
    rows: [
      ['Menschen in dieser Stunde', '18'],
      ['Plätze pro Stunde', '20'],
      ['Betrachteter Fußweg (Minuten)', '12'],
    ],
  },
  s5: {
    id: 'water-70',
    rows: [
      ['Tank am Anfang', '70'],
      ['Entnahme', '50'],
      ['Tankrest', '20'],
    ],
  },
  s6: {
    id: 'area-10',
    rows: [
      ['Tank am Anfang', '80'],
      ['Erstes Feld', '45'],
      ['Zusatzfeld', '10'],
      ['Gesamtentnahme', '55'],
      ['Tankrest', '25'],
      ['Früher: nur das erste Feld', '60'],
    ],
  },
} as const;
for (const unit of ['s2', 's5', 's6'] as const)
  for (const profile of profileIds)
    test(`TransferRC ${unit}/${profile}: task, model material, assessment, support and history agree`, () => {
      let s = act(newLearning(), 'recommend', profile, unit);
      for (const [index, t] of tasksFor(unit, profile).entries()) {
        if (!t.simulation?.transfer) continue;
        s.records[`${unit}.${profile}.v1`].index = index;
        s = act(s, 'rework');
        const task = active(s)!.task;
        assert.equal(task.id, t.id);
        assert.equal(task.simulation!.transfer, cases[unit].id);
        const html = simulationMaterial(task, profile, active(s)!.attempt!);
        assert.deepEqual(
          rows(html),
          profile === 'foerder'
            ? cases[unit].rows
            : cases[unit].rows.filter(
                ([label]) => !['Tankrest', 'Gesamtentnahme'].includes(label),
              ),
        );
        assert.deepEqual(
          rows(
            simulationMaterial(task, profile, {
              ...active(s)!.attempt!,
              help: 3,
            }),
          ),
          cases[unit].rows,
        );
        assert.match(html, /data-transfer-view="current"/);
        assert.match(
          task.contextNote!,
          /Neuer Fall|Neue Runde|Neues Zusatzfeld/,
        );
        if (unit === 's5')
          assert.doesNotMatch(html, /Ankunft am selben Feld|40 WE/);
        const correct = answers(task);
        assert.equal(evaluate(task, correct).kind, 'correct');
        assert.equal(evaluate(task, {}).error, false);
        const wrong = Object.fromEntries(
          task.fields.map((f) => [
            f.id,
            f.kind === 'integer'
              ? String(Number(correct[f.id]) + 7)
              : f.options!.find(([id]) => id !== correct[f.id])![0],
          ]),
        );
        assert.equal(evaluate(task, wrong).kind, 'incorrect');
        assert.equal(evaluate(task, wrong, 1).kind, 'hint');
        if (task.fields.length > 1) {
          const partial = {
            ...wrong,
            [task.fields[0].id]: correct[task.fields[0].id],
          };
          assert.equal(evaluate(task, partial).kind, 'partial');
          assert.equal(
            evaluate(task, { [task.fields[0].id]: correct[task.fields[0].id] })
              .error,
            false,
          );
        }
        for (const [f, v] of Object.entries(correct))
          s = act(s, 'answer', v, f);
        s = act(s, 'check');
        const saved = structuredClone(active(s)!.attempt!);
        for (const view of ['comparison', 'current', 'comparison', 'current']) {
          s = act(s, 'simulate', view);
          const current = active(s)!;
          assert.deepEqual(current.attempt!.answers, saved.answers);
          assert.deepEqual(current.attempt!.submissions, saved.submissions);
          assert.equal(current.attempt!.factual, 'correct');
          assert.match(
            simulationMaterial(current.task, profile, current.attempt!),
            new RegExp(`data-transfer-view="${view}"`),
          );
          s = restoreLearning(JSON.parse(JSON.stringify(s)))!;
        }
        for (let h = 0; h < 3; h++) s = act(s, 'help');
        assert.equal(active(s)!.attempt!.exampleUsed, false);
        assert.equal(active(s)!.attempt!.exampleShown, true);
        // Showing a complete example does not itself create a new submission.
        assert.deepEqual(active(s)!.attempt!.submissions, saved.submissions);
      }
    });
const old = JSON.parse(
  readFileSync(
    new URL('./fixtures/transfer-5b825b1.json', import.meta.url),
    'utf8',
  ),
);
test('TransferRC real 5b825b1 browser submissions restore unchanged without claiming a new independent attempt', () => {
  assert.equal(old.states.length, 12);
  for (const previous of old.states) {
    const s = restoreLearning(previous)!;
    assert.ok(s);
    assert.deepEqual(s.records, previous.records);
    const { task, attempt } = active(s)!;
    assert.equal(attempt!.factual, 'correct');
    assert.match(
      simulationMaterial(task, s.profile!, attempt!),
      /data-transfer-view="current"/,
    );
    assert.deepEqual(
      act(s, 'simulate', 'comparison').records[`${s.unit}.${s.profile}.v1`]
        .attempts[task.id].submissions,
      attempt!.submissions,
    );
  }
});
test('TransferRC original episode models and 52 identities remain separate from the new cases', () => {
  assert.equal(variantCatalog.length, 52);
  assert.equal(demandScenario().people, 24);
  assert.equal(demandScenario().capacity, 20);
  assert.equal(demandScenario().walk, 12);
  assert.deepEqual(
    [
      waterModel('repair').initial,
      waterModel('repair').withdrawal,
      waterModel('repair').remaining,
    ],
    [80, 50, 30],
  );
  assert.deepEqual(
    [
      areaModel('extra').first,
      areaModel('extra').extra,
      areaModel('extra').withdrawal,
      areaModel('extra').remaining,
    ],
    [45, 20, 65, 15],
  );
  assert.deepEqual(
    [
      transferCases['water-70'].initial,
      transferCases['water-70'].withdrawal,
      transferCases['water-70'].remaining,
    ],
    [70, 50, 20],
  );
  assert.deepEqual(
    [
      transferCases['area-10'].first,
      transferCases['area-10'].extra,
      transferCases['area-10'].total,
      transferCases['area-10'].remaining,
      transferCases['area-10'].saving,
    ],
    [45, 10, 55, 25, 5],
  );
});
