import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tasksFor } from '../src/learning/tasks.ts';
import { profileIds } from '../src/learning/profiles.ts';
import {
  active,
  newLearning,
  reduceLearning,
} from '../src/learning/storage.ts';
import { simulationMaterial } from '../src/learning/simulation-material.ts';
import { answers } from './learning-oracles.ts';
for (const unit of ['s2', 's5', 's6'] as const)
  for (const profile of profileIds)
    for (const [index, t] of tasksFor(unit, profile).entries()) {
      if (!t.simulation?.transfer) continue;
      test(`D1 ${profile}/${t.id}: disclosure is task-bound and never changes stored provenance`, () => {
        let s = reduceLearning(newLearning(), {
          type: 'learning',
          op: 'recommend',
          value: profile,
          field: unit,
        });
        s.records[`${unit}.${profile}.v1`].index = index;
        s = reduceLearning(s, { type: 'learning', op: 'rework' });
        const p = active(s)!.attempt!;
        const snapshot = JSON.stringify(p);
        for (const help of [0, 1, 2] as const) {
          const html = simulationMaterial(t, profile, { ...p, help });
          if (profile !== 'foerder') {
            assert.match(html, /data-transfer-solution="withheld"/);
            if (unit === 's5') assert.doesNotMatch(html, /20 WE|<td>20<\/td>/);
            if (unit === 's6')
              assert.doesNotMatch(
                html,
                /55 WE|25 WE|5 WE weniger|<td>(55|25)<\/td>/,
              );
            if (unit === 's2')
              assert.doesNotMatch(
                html,
                /Freie Plätze verkürzen den Fußweg nicht/,
              );
          }
        }
        const explained = simulationMaterial(t, profile, { ...p, help: 3 });
        assert.doesNotMatch(explained, /data-transfer-solution="withheld"/);
        assert.equal(JSON.stringify(p), snapshot);
        const good = {
          ...p,
          answers: answers(t),
          process: 'submitted' as const,
          factual: 'correct',
        };
        assert.doesNotMatch(
          simulationMaterial(t, profile, good),
          /data-transfer-solution="withheld"/,
        );
        if (profile !== 'foerder')
          assert.match(
            simulationMaterial(t, profile, {
              ...good,
              process: 'draft',
              factual: 'ungraded',
            }),
            /data-transfer-solution="withheld"/,
          );
        assert.equal(p.exampleUsed, false);
        assert.equal(p.submissions.length, 0);
      });
    }
