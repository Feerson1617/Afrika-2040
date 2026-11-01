import type { Task, LearningField } from './tasks.ts';
import type { ProfileId } from './profiles.ts';
import { journey, evidenceIds, evidenceFits, evidenceLabel } from '../model.ts';
import { routes, routeNames } from '../content.ts';
import { demandScenario } from '../demand.ts';
export const pick = (
  id: string,
  label: string,
  expected: string,
  options: readonly (readonly [string, string])[],
  explanation: string,
): LearningField => ({
  id,
  label,
  kind: 'choice',
  expected,
  options,
  explanation,
});
export const number = (
  id: string,
  label: string,
  value: number,
  explanation: string,
): LearningField => ({
  id,
  label,
  kind: 'integer',
  expected: String(value),
  explanation,
});
export const own = (label: string, example: string): LearningField => ({
  id: 'explanation',
  label,
  kind: 'text',
  example,
  explanation:
    'Deine Erklärung bleibt fachlich ungeprüft. Nutze die Selbstkontrolle oder besprich sie.',
});
export function step(
  id: string,
  title: string,
  kind: NonNullable<Task['simulation']>['kind'],
  fields: LearningField[],
  hint: string,
  criteria: string[] = [],
  extra: Partial<Task> = {},
): Task {
  return {
    id,
    conceptId: id,
    title,
    material: 'simulation',
    simulation: { kind },
    instruction: fields.some((f) => f.kind === 'text')
      ? 'Ein kurzer Satz oder Stichwörter reichen. Dein Text wird nicht automatisch fachlich geprüft.'
      : 'Untersuche das Modell. Wähle oder rechne selbst.',
    fields,
    hints: [
      hint,
      'Verbinde die Größen mit der passenden Person, Maßnahme und Runde. Vergleiche die Darstellung und deine Antwort.',
      'Prüfe das erklärte Beispiel. Du entscheidest, ob du es übernehmen möchtest.',
    ],
    criteria: criteria.length
      ? criteria
      : [
          'Sachangaben zum dargestellten Modell zugeordnet.',
          'Eigene Entscheidungen sind keine automatische Fachbewertung.',
        ],
    ...extra,
  };
}
export function differentiated(tasks: Task[], p: ProfileId): Task[] {
  return tasks.flatMap((t) =>
    (p === 'foerder' || p === 'esa') && t.fields.length > 1
      ? t.fields.map((f) => ({
          ...t,
          id: t.id + '.' + f.id,
          fields: [f],
          title: f.label,
        }))
      : [t],
  );
}
export function decision(
  prefix: string,
  kind: NonNullable<Task['simulation']>['kind'],
  options: readonly (readonly [string, string])[],
  p: ProfileId,
  now = false,
): Task[] {
  const choiceId = prefix + '.choice';
  const linked: NonNullable<Task['linked']> = {
    task: choiceId,
    field: 'plan',
    kind:
      kind === 'network'
        ? 'kenya'
        : (kind as 'demand' | 'cocoa' | 'water' | 'area'),
    now,
  };
  const common = { dependsOn: [choiceId], linked, simulation: { kind, now } };
  const result = [
    step(
      choiceId,
      now
        ? 'Deine Empfehlung nach der Änderung'
        : 'Welchen Vorschlag machst du?',
      kind,
      [
        pick(
          'plan',
          'Dein Vorschlag',
          'either',
          options,
          'Du darfst unterschiedlich entscheiden. Begründe mit passenden Folgen.',
        ),
      ],
      'Welche Folge ist dir wichtig?',
      [],
      { simulation: { kind, now } },
    ),
    step(
      prefix + '.proof',
      'Beleg und Grenze zu deinem Vorschlag',
      kind,
      [
        pick(
          'evidence',
          'Welcher Beleg stützt deinen Vorschlag?',
          'linked',
          [],
          '',
        ),
        pick(
          'limit',
          'Welcher Nachteil bleibt bei deinem Vorschlag?',
          'linked',
          [],
          '',
        ),
      ],
      'Beide Angaben müssen zu deinem eigenen Vorschlag passen.',
      [],
      common,
    ),
    step(
      prefix + '.weight',
      'Welche Folge ist dir wichtiger?',
      kind,
      [
        pick(
          'weight',
          'Wofür entscheidest du dich bewusst?',
          'either',
          [],
          'Du darfst so entscheiden.',
        ),
      ],
      'Nutze den Vorteil und den Nachteil deines gewählten Vorschlags.',
      [],
      common,
    ),
  ];
  if (p === 'ahr')
    result.push(
      step(
        prefix + '.own',
        'Erkläre deine Entscheidung kurz selbst',
        kind,
        [own('Warum wählst du diesen Vorschlag trotz seines Nachteils?', '')],
        'Verbinde einen Beleg, einen Nachteil und deine wichtigere Folge.',
        [
          'Vorschlag passt zu den genannten Zahlen.',
          'Vorteil und Nachteil betreffen denselben Vorschlag.',
          'Wichtigere Folge mit einem konkreten Grund verbunden.',
        ],
        common,
      ),
    );
  return differentiated(
    result.map((t) =>
      resolveSimulation(t, {
        [choiceId]: { answers: { plan: options[0][0] } },
      }),
    ),
    p,
  );
}
export function kenyaCompletion(p: ProfileId): Task[] {
  const simple = p === 'foerder';
  const ts: Task[] = [
    step(
      'kenia.full.explore',
      'Drei Personen, drei Linien',
      'network',
      [
        pick(
          'boarding',
          'Wo steigt Leila in den Südbus ein?',
          'sued',
          [
            ['platz', 'Platz'],
            ['sued', 'Süd'],
          ],
          'Leila geht zur Haltestelle Süd und fährt nur Süd → Zentrum.',
        ),
      ],
      'Wähle Leila und untersuche alle drei Linien.',
      [],
      {
        simulation: {
          kind: 'network',
          preset: 'leila-south',
          required: ['leila-direct', 'leila-north', 'leila-south'],
        },
      },
    ),
  ];
  if (simple)
    ts.push(
      step(
        'kenia.full.leila',
        'Welcher Weg hilft Leila?',
        'network',
        [
          pick(
            'fastest',
            'Vergleiche: Direkt 22, Nord 28, Süd 10 Minuten.',
            'south',
            [
              ['north', 'Nord'],
              ['south', 'Süd'],
            ],
            'Süd braucht 10 Minuten. Das ist weniger als 22 und 28.',
          ),
        ],
        'Vergleiche Leilas gesamte Wege.',
      ),
    );
  else
    ts.push(
      step(
        'kenia.full.times',
        'Leilas persönliche Gesamtzeiten',
        'network',
        routes.map((r) => {
          const j = journey('leila', r);
          return number(
            r,
            p === 'esa'
              ? `${j.walk} + ${j.bus} = (Leila ${routeNames[r]})`
              : `Leila ${routeNames[r]} (Minuten)`,
            j.total,
            `${j.walk} Minuten zu Fuß + ${j.bus} Minuten Bus = ${j.total}.`,
          );
        }),
        'Addiere den Fußweg und die tatsächlich benutzte Busfahrt.',
      ),
    );
  ts.push(
    ...decision(
      'kenia.first',
      'network',
      routes.map((r) => [r, routeNames[r]]),
      p,
    ),
  );
  ts.push(
    step(
      'kenia.event.path',
      'Eine Baustelle: Was ändert sich?',
      'network',
      [
        pick(
          'path',
          'Welcher Weg bekommt einen Umweg?',
          'leila-platz',
          [
            ['all', 'Alle Buslinien'],
            ['leila-platz', 'Leilas Fußweg zum Platz'],
          ],
          'Nur Leilas Fußweg zum Platz wird um 6 Minuten länger. Der Fußweg nach Süd bleibt gleich.',
        ),
      ],
      'Untersuche Leilas Weg zum Platz und nach Süd.',
      [],
      {
        simulation: {
          kind: 'network',
          now: true,
          preset: 'leila-direct',
          required: ['leila-direct', 'leila-south'],
        },
      },
    ),
  );
  ts.push(
    step(
      'kenia.event.times',
      'Leila nach der Baustelle',
      'network',
      simple
        ? [
            pick(
              'unchanged',
              'Welcher Gesamtweg bleibt bei 10 Minuten?',
              'south',
              [
                ['direct', 'Direkt'],
                ['south', 'Süd'],
              ],
              'Leilas Weg nach Süd ist von der Baustelle nicht betroffen.',
            ),
          ]
        : routes.map((r) => {
            const j = journey('leila', r, 'now');
            return number(
              r,
              p === 'esa'
                ? `${j.walk} + ${j.bus} = (jetzt ${routeNames[r]})`
                : `Jetzt Leila ${routeNames[r]} (Minuten)`,
              j.total,
              `Jetzt: ${j.walk} + ${j.bus} = ${j.total} Minuten.`,
            );
          }),
      'Prüfe den geänderten Fußweg, nicht die Fahrzeit.',
      [],
      { simulation: { kind: 'network', now: true } },
    ),
  );
  ts.push(
    ...decision(
      'kenia.revised',
      'network',
      routes.map((r) => [r, routeNames[r]]),
      p,
      true,
    ),
  );
  if (p === 'ahr')
    ts.push(
      step(
        'kenia.full.spatial',
        'Warum wirken Wege unterschiedlich?',
        'network',
        [
          own(
            'Warum hilft die längere Nordlinie Amina, aber nicht David? Was kann die Baustelle an deiner Wahl ändern?',
            'Amina steigt später ein und geht nur 2 statt 12 Minuten. David steigt am Platz ein und fährt beide Nordabschnitte. Die Baustelle verlängert nur Leilas Fußweg zum Platz; ihre Südverbindung bleibt 10 Minuten.',
          ),
        ],
        'Verbinde Wohnort, Einstieg und die neue Bedingung.',
        [
          'Persönlicher Einstieg von gesamter Linie unterschieden.',
          'Beide Personen mit richtigen Teilwegen erklärt.',
          'Baustelle nur Leilas betroffenem Fußweg zugeordnet.',
        ],
      ),
    );
  ts.push(
    step(
      'kenia.full.limit',
      'Was sagt das Modell über echte Wege?',
      'network',
      [
        pick(
          'missing',
          'Welche Information fehlt für echte Erreichbarkeit?',
          'cost',
          [
            ['certain', 'Eine sichere Vorhersage für 2040'],
            ['cost', 'Fahrpreise und Wartezeiten'],
          ],
          'Das erfundene Zeitmodell enthält weder Fahrpreise noch Wartezeiten.',
        ),
      ],
      'Prüfe, was nicht berechnet wird.',
    ),
  );
  return differentiated(ts, p);
}
export function demandTasks(p: ProfileId): Task[] {
  const a = demandScenario('base', 'before'),
    b = demandScenario();
  const ts = [
    step(
      'demand.before',
      'Vor dem Zuzug: Reichen die Plätze?',
      'demand',
      [
        pick(
          'enough',
          '16 Menschen, 20 Plätze in einer Stunde. Reicht das?',
          'yes',
          [
            ['yes', 'Ja'],
            ['no', 'Nein'],
          ],
          '16 ist weniger als 20. Das sagt noch nichts über einen kurzen Fußweg.',
        ),
      ],
      'Vergleiche Menschen und Plätze für dieselbe Stunde.',
      [],
      { simulation: { kind: 'demand', preset: 'before' } },
    ),
    step(
      'demand.now',
      'Jetzt wollen mehr Menschen fahren',
      'demand',
      p === 'foerder'
        ? [
            pick(
              'enough',
              '24 Menschen, 20 Plätze. Können alle in dieser Stunde fahren?',
              'no',
              [
                ['yes', 'Ja'],
                ['no', 'Nein'],
              ],
              'Vier Menschen müssen später fahren.',
            ),
          ]
        : [
            number(
              'capacity',
              p === 'esa' ? '2 Fahrten × 10 Plätze =' : 'Plätze pro Stunde',
              a.capacity,
              '2 × 10 = 20 Plätze.',
            ),
            number(
              'later',
              p === 'esa'
                ? '24 Menschen − 20 Plätze ='
                : 'Wie viele müssen später fahren?',
              b.later,
              '24 − 20 = 4. Die genaue Wartezeit ist unbekannt.',
            ),
          ],
      'Vergleiche 24 Menschen mit den vorhandenen Plätzen.',
    ),
    step(
      'demand.explore',
      'Teste beide Maßnahmen',
      'demand',
      [
        pick(
          'bus',
          'Zusätzliche Fahrt: Was verändert sie?',
          'seats',
          [
            ['walk', 'Nur den Fußweg'],
            ['seats', 'Die Zahl der Plätze pro Stunde'],
          ],
          '3 × 10 = 30 Plätze. Der Fußweg bleibt 12 Minuten.',
        ),
        pick(
          'path',
          'Neue Verbindung: Was verändert sie?',
          'walk',
          [
            ['walk', 'Den Fußweg'],
            ['seats', 'Die Zahl der Plätze'],
          ],
          'Der Fußweg verkürzt sich auf 4 Minuten. Es bleiben 20 Plätze und 4 Menschen müssen später fahren.',
        ),
      ],
      'Schalte beide Maßnahmen an. Lies Plätze und Fußweg getrennt.',
      [],
      { simulation: { kind: 'demand', required: ['bus', 'path'] } },
    ),
    ...decision(
      'demand.final',
      'demand',
      [
        ['bus', 'Eine zusätzliche Busfahrt'],
        ['path', 'Einen kurzen Fußweg schaffen'],
      ],
      p,
    ),
    step(
      'demand.transfer',
      'Ein neuer erfundener Vergleich',
      'demand',
      [
        pick(
          'enough',
          'Jetzt sind es 18 Menschen bei 20 Plätzen. Reicht die Kapazität?',
          'yes',
          [
            ['no', 'Nein'],
            ['yes', 'Ja'],
          ],
          '18 ist kleiner als 20.',
        ),
        pick(
          'access',
          'Beweist das auch einen kurzen Fußweg?',
          'no',
          [
            ['yes', 'Ja'],
            ['no', 'Nein'],
          ],
          'Freie Plätze und Erreichbarkeit sind verschiedene Größen.',
        ),
      ],
      'Der Vergleich hat 18 Menschen. Die übrigen Modellregeln bleiben gleich.',
    ),
  ];
  if (p === 'ahr')
    ts.push(
      step(
        'demand.cause',
        'Zwei Probleme, zwei Wirkungen',
        'demand',
        [
          own(
            'Warum sind die Maßnahmen nicht austauschbar? Welche weitere Angabe könnte deine Wahl ändern?',
            'Eine Fahrt schafft 30 Plätze pro Stunde, lässt den Fußweg aber bei 12 Minuten. Ein neuer Weg verkürzt auf 4 Minuten, lässt aber 20 Plätze. Kosten und die zeitliche Nachfrageverteilung könnten meine Wahl ändern. Eine genaue Wartezeit wird nicht berechnet.',
          ),
        ],
        'Unterscheide Beförderung pro Stunde und persönlichen Zugang.',
        [
          'Beide Maßnahmen mit verschiedenen Größen erklärt.',
          'Zeitraum und Modellgrenze genannt.',
          'Konkrete weitere Information und ihre mögliche Bedeutung benannt.',
        ],
      ),
    );
  return differentiated(ts, p);
}
export function resolveSimulation(
  task: Task,
  records: Record<string, { answers: Record<string, string> }>,
): Task {
  if (!task.dependsOn) return task;
  const contextKey = JSON.stringify(
    Object.fromEntries(
      task.dependsOn.map((id) => [id, records[id]?.answers ?? {}]),
    ),
  );
  const link = task.linked;
  if (!link) return { ...task, contextKey };
  const plan = records[link.task]?.answers[link.field];
  if (!plan)
    return {
      ...task,
      contextKey,
      fields: task.fields.map((f) => ({ ...f, expected: '__missing_plan__' })),
    };
  let benefits: readonly (readonly [string, string])[] = [],
    limits: typeof benefits = [],
    selectedName = plan;
  if (link.kind === 'kenya' && routes.includes(plan as any)) {
    const r = plan as (typeof routes)[number],
      s = link.now ? 'now' : 'before';
    selectedName = routeNames[r];
    benefits = evidenceIds
      .filter((id) => evidenceFits(id, r, 'advantage', s))
      .map((id) => [id, evidenceLabel(id, s)]);
    limits = evidenceIds
      .filter((id) => evidenceFits(id, r, 'disadvantage', s))
      .map((id) => [id, evidenceLabel(id, s)]);
  } else if (link.kind === 'demand') {
    selectedName = plan === 'bus' ? 'zusätzliche Fahrt' : 'kurzer Fußweg';
    benefits = [
      ['bus', '30 Plätze: Alle 24 können in dieser Stunde fahren.'],
      ['path', 'Nur 4 statt 12 Minuten Fußweg.'],
    ];
    limits = [
      ['bus', 'Der Fußweg bleibt 12 Minuten lang.'],
      ['path', 'Es bleiben 20 Plätze. Vier Menschen fahren später.'],
    ];
  }
  const opts = (list: typeof benefits) =>
    link.kind === 'kenya'
      ? [
          ...list,
          ['unrelated', 'Alle Menschen brauchen immer gleich lange.'] as const,
        ]
      : list;
  const chosen = (list: typeof benefits) =>
    link.kind === 'kenya' ? list[0] : list.find(([id]) => id === plan);
  const benefit = chosen(benefits),
    limit = chosen(limits);
  return {
    ...task,
    contextKey,
    contextNote: `Dein Vorschlag: ${selectedName}.`,
    fields: task.fields.map((f) =>
      f.id === 'evidence'
        ? {
            ...f,
            expected: benefit?.[0] ?? '__missing__',
            accepted:
              link.kind === 'kenya' ? benefits.map((x) => x[0]) : undefined,
            options: opts(benefits),
            explanation: benefit?.[1] ?? '',
          }
        : f.id === 'limit'
          ? {
              ...f,
              expected: limit?.[0] ?? '__missing__',
              accepted:
                link.kind === 'kenya' ? limits.map((x) => x[0]) : undefined,
              options: opts(limits),
              explanation: limit?.[1] ?? '',
            }
          : f.id === 'weight'
            ? {
                ...f,
                options: [
                  [
                    'benefit',
                    `Mir ist wichtig: ${benefit?.[1]} Dafür akzeptiere ich: ${limit?.[1]}`,
                  ],
                  [
                    'reconsider',
                    'Ich möchte diese Folgen noch mit jemandem besprechen. Meine Wahl bleibt vorläufig.',
                  ],
                ],
              }
            : f.kind === 'text'
              ? {
                  ...f,
                  example: `Ich wähle ${selectedName}. Mir ist wichtig: ${benefit?.[1]} Dafür akzeptiere ich: ${limit?.[1]}`,
                }
              : f,
    ),
  };
}
