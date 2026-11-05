import { test } from 'node:test';
import assert from 'node:assert/strict';
import { storedTasksFor, tasksFor, type Task } from '../src/learning/tasks.ts';
import { implementedUnits } from '../src/learning/catalog.ts';
import { profileIds } from '../src/learning/profiles.ts';
import { evaluate } from '../src/learning/progress.ts';
import { decisionFields, topics, plans } from '../src/inquiry/content.ts';
import { journey } from '../src/model.ts';
import { allWords } from '../src/learning/words.ts';

// These factual reasons are independent of the generated answer labels.
const distractors = [
  {
    id: 'colour',
    text: 'Wie viele Stände kann der Kühlraum aufnehmen?',
    reason: 'Capacity is given (30); responsibility for repairs is missing.',
  },
  {
    id: 'reliable',
    text: 'Der Strom fällt bei den angeschlossenen Haushalten nicht aus.',
    reason: 'An access percentage does not measure outages.',
  },
  {
    id: 'stop',
    text: 'Nur neu fallender Regen bringt Wasser vom Boden in die Luft.',
    reason:
      'Evaporation moves liquid water to the air; falling rain moves down.',
  },
  {
    id: 'automatic',
    text: 'Den Vorteil nennen. Ein Nachteil gehört nicht zur Begründung.',
    reason: 'A reasoned proposal must include a relevant drawback.',
  },
  {
    id: 'unrelated',
    text: 'Die Dauer der ganzen Buslinie ist die Gesamtzeit jeder Person.',
    reason:
      'Amina walks and boards partway; her total is not the full line duration.',
  },
];
for (const example of distractors)
  test(`editorial distractor remains unambiguously wrong: ${example.reason}`, () => {
    let found = 0;
    for (const unit of implementedUnits)
      for (const profile of profileIds)
        for (const t of storedTasksFor(unit, profile))
          for (const f of t.fields) {
            if (
              !f.options?.some(
                ([id, label]) => id === example.id && label === example.text,
              )
            )
              continue;
            found++;
            const one = { ...t, fields: [f] };
            assert.equal(
              evaluate(one, { [f.id]: example.id }).kind,
              'incorrect',
            );
            assert.equal(
              evaluate(one, { [f.id]: f.expected! }).kind,
              'correct',
            );
            assert.equal(evaluate(one, { [f.id]: example.id }, 1).kind, 'hint');
          }
    assert.ok(found >= 4, example.text);
    if (example.id === 'unrelated') {
      const a = journey('amina', 'north');
      assert.equal(a.walk, 2);
      assert.equal(a.bus, 8);
      assert.equal(a.total, 10);
      assert.notEqual(a.total, 16);
    }
    if (example.id === 'colour') assert.equal(plans.cool.stands, 30);
  });
test('editorial legacy alternatives preserve source scope and actual unknown, not trivia', () => {
  const access = topics.economy.checks
    .flatMap((c) => c.fields)
    .find((f) => f.options?.some(([id]) => id === 'reliable'))!;
  assert.equal(
    access.options!.find(([id]) => id === 'reliable')![1],
    distractors[1].text,
  );
  assert.notEqual(access.expected, 'reliable');
  for (const plan of ['cool', 'shade'] as const) {
    const unknown = decisionFields(plan).find((f) => f.id === 'unknown')!;
    assert.equal(
      unknown.options!.find(([id]) => id === 'irrelevant')![1],
      distractors[0].text,
    );
    assert.equal(unknown.expected, plan);
    assert.equal(
      unknown.explanation,
      plan === 'cool'
        ? 'Wer kümmert sich um die Wartung? Wer zahlt die Stromkosten bei einem Ausfall?'
        : 'Wie gut schützen die Dächer die Lebensmittel in heißen Wochen?',
    );
  }
});
for (const profile of profileIds)
  test(`editorial ${profile}: four concrete cocoa hints, no generic command, complete task questions`, () => {
    const expected = [
      'Womit beginnt die Verarbeitung?',
      'Was passiert mit den getrockneten Bohnen?',
      'Was entsteht nach dem Rösten und Mahlen?',
      'Was geschieht beim Pressen der Kakaomasse?',
    ];
    const ts = tasksFor('s3', profile).filter((t) =>
      t.id.startsWith('cocoa.chain'),
    );
    assert.deepEqual(
      ts.map((t) => t.hints[0]),
      expected,
    );
    assert.deepEqual(
      ts.map((t) => t.fields[0].expected),
      ['beans', 'roast', 'mass', 'press'],
    );
    for (const unit of implementedUnits)
      for (const t of storedTasksFor(unit, profile)) {
        assert.doesNotMatch(t.instruction, /Wähle oder rechne selbst/);
        assert.ok(
          t.instruction || t.fields.every((f) => f.label.trim().length > 5),
          t.id,
        );
        assert.equal(t.hints.length, 3);
        if (t.focus)
          assert.doesNotMatch(
            t.focus.paragraphs.join(' '),
            /Weltbank \(Weltbank/,
          );
      }
  });
test('editorial retained depth: all four paths remain year-seven tasks with same concepts and voluntary terms', () => {
  assert.equal(allWords.length, 66);
  for (const word of [
    'Kapazität',
    'Wanderungssaldo',
    'BIP',
    'Wertschöpfung',
    'Atmosphäre',
    'Urbanisierung',
    'Verbrauch',
    'Zielkonflikt',
  ])
    assert.ok(
      allWords.find(([name, text]) => name === word && text.length > 20),
      word,
    );
  const task = (unit: Parameters<typeof tasksFor>[0], id: string): Task =>
    tasksFor(unit, 'ahr').find((t) => t.id === id)!;
  assert.match(
    task('s6', 'area.condition').fields[0].label,
    /45 WE.*60 WE.*15 WE/,
  );
  assert.match(
    task('d', 'economy.source-claim.v1').fields[0].label,
    /beiden Quellen/,
  );
  assert.match(
    task('s4', 'share.perspective').fields[0].label,
    /beiden Pläne.*anderes Mitglied.*unsicher/,
  );
  assert.equal(task('s2', 'demand.cause').fields[0].kind, 'text');
});
