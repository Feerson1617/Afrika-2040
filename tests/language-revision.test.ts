import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tasksFor, legacyTasksFor, type Task } from '../src/learning/tasks.ts';
import { implementedUnits } from '../src/learning/catalog.ts';
import { profileIds, profiles } from '../src/learning/profiles.ts';
import { allWords, taskWords } from '../src/learning/words.ts';
import { simulationMaterial } from '../src/learning/simulation-material.ts';
import {
  newLearning,
  reduceLearning,
  active,
} from '../src/learning/storage.ts';
const baseline = JSON.parse(
  readFileSync(
    new URL('./fixtures/language-e4b9100-contract.json', import.meta.url),
    'utf8',
  ),
);
const protect = (t: Task) => {
  const {
    title,
    instruction,
    hints,
    criteria,
    explained,
    contextNote,
    focus,
    fields,
    ...rest
  } = t;
  return {
    ...rest,
    fields: fields.map(({ id, kind, expected, accepted, options }) => ({
      id,
      kind,
      ...(expected !== undefined ? { expected } : {}),
      ...(accepted ? { accepted } : {}),
      ...(options ? { options: options.map((o) => o[0]) } : {}),
    })),
    ...(focus
      ? {
          focus: {
            topic: focus.topic,
            picture: focus.picture,
            season: focus.season,
          },
        }
      : {}),
  };
};
for (const v of baseline)
  test(`archived language contract remains readable with protected structure ${v.unit}/${v.profile}`, () => {
    assert.deepEqual(
      JSON.parse(
        JSON.stringify(legacyTasksFor(v.unit, v.profile).map(protect)),
      ),
      v.tasks,
    );
  });
test('legacy archive keeps all 494 tasks and 607 fields; active routes keep 66 glossary terms', () => {
  const tasks = implementedUnits.flatMap((u) =>
    profileIds.flatMap((p) => legacyTasksFor(u, p)),
  );
  assert.equal(tasks.length, 494);
  assert.equal(tasks.flatMap((t) => t.fields).length, 607);
  assert.equal(allWords.length, 66);
  assert.equal(profiles.esa.name, 'Mit Hilfe');
  for (const t of tasks)
    assert.ok(
      taskWords(t).every((entry) => entry && entry[0] && entry[1]),
      t.id,
    );
});
test('ESA split photo questions retain the newspaper claim without altering answer IDs', () => {
  for (const id of ['image.headline.evidence', 'image.headline.revision']) {
    const t = tasksFor('a', 'esa').find((t) => t.id === id)!;
    assert.match(
      t.contextNote!,
      /Schulzeitung.*Afrika ist nur unberührte Natur.*Menschen haben dort nichts gebaut/,
    );
  }
});
test('AHR example distinguishes one additional journey from total three journeys', () => {
  const t = tasksFor('s2', 'ahr').find((t) => t.id === 'demand.cause')!;
  const e = t.fields[0].example!;
  assert.match(e, /zusätzlichen Fahrt.*insgesamt drei Fahrten pro Stunde/);
  assert.match(
    e,
    /Jede Fahrt hat 10 Plätze.*Zusammen gibt es 30 Plätze pro Stunde/,
  );
  assert.match(e, /Fußweg bleibt 12 Minuten/);
  assert.match(e, /4 Minuten.*20 Plätze/);
  assert.match(e, /Kosten.*Fahrzeiten/);
  assert.doesNotMatch(e, /Eine Fahrt schafft 30/);
});
test('processing cards lead; money remains optional there and fully available later', () => {
  for (const p of profileIds) {
    const chain = tasksFor('s3', p).find((t) =>
      t.id.startsWith('cocoa.chain'),
    )!;
    let s = reduceLearning(newLearning(), {
      type: 'learning',
      op: 'recommend',
      value: p,
      field: 's3',
    });
    const a = active(s)!.attempt!;
    const html = simulationMaterial(chain, p, a);
    assert.match(html, /learning-process/);
    assert.equal((html.match(/<li /g) ?? []).length, 4);
    assert.match(html, /Jetzt auswählen/);
    assert.equal((html.match(/Noch offen/g) ?? []).length, 3);
    const [visible, extra] = html.split('<details id="learning-cocoa-money">');
    assert.doesNotMatch(visible, /Einnahmen|Überschuss|Anschaffungstopf/);
    assert.match(extra, /Einnahmen/);
    assert.match(extra, /Laufende Ausgaben/);
    assert.deepEqual(
      taskWords(chain).map((x) => x[0]),
      ['Rohstoff', 'Verarbeitung'],
    );
    const later = tasksFor('s3', p).find((t) => t.id.startsWith('cocoa.base'));
    assert.ok(later);
    assert.doesNotMatch(
      simulationMaterial(later!, p, a),
      /id="learning-cocoa-money"/,
    );
  }
});

test('language revision preserves evaluated IDs and values in every documented resolved choice', async () => {
  const { resolveSimulation } =
    await import('../src/learning/simulation-variants.ts');
  const { futureReference } = await import('../src/learning/topic-variants.ts');
  const choices = JSON.parse(
    readFileSync(
      new URL('./fixtures/language-e4b9100-resolved.json', import.meta.url),
      'utf8',
    ),
  );
  for (const row of choices) {
    const t = tasksFor(row.unit, row.profile).find((t) => t.id === row.id)!;
    for (const [choice, expected] of Object.entries(row.choices)) {
      const records: Record<string, { answers: Record<string, string> }> = {};
      if (t.reference) records['future.plan'] = { answers: { plan: choice } };
      else if (t.allocationReference)
        records['share.plan'] = { answers: { plan: choice } };
      else if (t.linked)
        records[t.linked.task] = { answers: { [t.linked.field]: choice } };
      const actual = resolveSimulation(futureReference(t, records), records);
      const corrected = structuredClone(expected) as any[];
      // A2: maintenance + water not reaching the field also hold for the new distribution.
      if (row.unit === 's5' && choice === 'tech')
        for (const f of corrected)
          if (f.id === 'limit') f.accepted = ['repair', 'tech'];
      assert.deepEqual(
        JSON.parse(JSON.stringify(protect(actual).fields)),
        corrected,
        `${row.unit}/${row.profile}/${row.id}/${choice}`,
      );
    }
  }
});
