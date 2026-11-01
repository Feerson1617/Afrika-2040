import { waterModel, water } from '../regions/water.ts';
import { areaModel, area } from '../regions/area.ts';
import { cocoaModel, cocoa } from '../regions/cocoa.ts';
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
      kind === 'network'
        ? 'Suche den Einstieg. Addiere den Fußweg und nur die Busabschnitte ab diesem Einstieg. Lies bei jedem Beleg auch die Vergleichslinie.'
        : kind === 'demand'
          ? 'Plätze pro Stunde = Fahrten mal Plätze je Fahrt. Vergleiche dies mit der Nachfrage. Der Fußweg ist eine andere Größe.'
          : kind === 'cocoa'
            ? id.startsWith('cocoa.chain')
              ? 'Rösten und Mahlen verändern die Bohnen. Die Presse verarbeitet die entstandene Masse weiter.'
              : 'Laufender Überschuss = Einnahmen minus laufende Ausgaben. Halte die einmalige Anschaffung im getrennten Topf.'
            : kind === 'share'
              ? 'Alle Beträge zusammen müssen 120 GE ergeben. Unterscheide zusätzliches Geld heute, Vorsorge und mögliche spätere Wirkungen.'
              : kind === 'water'
                ? 'Tankrest = Anfang minus Entnahme. Die Ankunft am Feld ist eine andere Messstelle. Verbrauch wird hier nicht berechnet.'
                : kind === 'area'
                  ? 'Erstes Feld plus Zusatzfeld ergibt die gesamte Entnahme. Vergleiche erst dieselbe Fläche, dann die Summe mit früher 60 WE.'
                  : kind === 'orientation'
                    ? 'Stadtpunkte liegen innerhalb der Länderflächen. Norden ist oben. Die Äquatorlinie trennt Nordhalbkugel und Südhalbkugel.'
                    : 'Suche zuerst den konkreten Beleg im jeweiligen Fall. Prüfe dann, ob die Behauptung über den erfundenen Fall hinausgeht.',
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
export function orderTaskFields(t: Task): Task {
  if (!t.simulation) return t;
  return {
    ...t,
    fields: t.fields.map((f) => {
      if (f.kind !== 'choice' || f.expected === 'either' || !f.options?.length)
        return f;
      const options = [...f.options].sort((a, b) =>
        a[0].localeCompare(b[0], 'de'),
      );
      const shift =
        [...(t.id + ':' + f.id)].reduce((n, c) => n + c.charCodeAt(0), 0) %
        options.length;
      return {
        ...f,
        options: [...options.slice(shift), ...options.slice(0, shift)],
      };
    }),
  };
}
export function differentiated(tasks: Task[], p: ProfileId): Task[] {
  return tasks
    .flatMap((t) =>
      (p === 'foerder' || p === 'esa') && t.fields.length > 1
        ? t.fields.map((f) => ({
            ...t,
            id: t.id + '.' + f.id,
            fields: [f],
            title: f.label,
          }))
        : [t],
    )
    .map(orderTaskFields);
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
  if (p === 'ahr' && (kind !== 'network' || now))
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
function resolveSimulationInner(
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
  if (task.allocationReference)
    return resolveAllocation(task, records, contextKey);
  if (task.differentBudget)
    return {
      ...task,
      contextKey,
      fields: task.fields.map((f) => ({
        ...f,
        options: f.options?.filter(
          ([id]) => id !== records['share.plan']?.answers.plan,
        ),
      })),
    };
  if (task.id === 'share.perspective') {
    const first = records['share.plan']?.answers.plan ?? '',
      second = records['share.plan.second']?.answers.plan ?? '';
    const amounts = first.split('-').map(Number),
      i = amounts.indexOf(Math.max(...amounts));
    const names = [
      'die Auszahlung heute',
      'die Rücklage für Reparaturen',
      'die Fortbildung',
    ];
    const limits = [
      'Dieses Geld ist danach nicht mehr im Betrieb.',
      'Das Geld wird heute nicht ausgezahlt. Ob es für Reparaturen reicht, ist unklar.',
      'Das Geld wird heute nicht ausgezahlt. Zusätzliche Aufträge sind nicht sicher.',
    ];
    const a = allocationOptions.find(([id]) => id === first),
      b = allocationOptions.find(([id]) => id === second);
    return {
      ...task,
      contextKey,
      fields: task.fields.map((f) => ({
        ...f,
        example:
          a && b
            ? `Mein erster Plan: ${a[1]}. Mein zweiter Plan: ${b[1]}. In diesem Beispiel behalte ich den ersten Plan. Mir ist ${names[i]} wichtig; dafür sind ${amounts[i]} GE vorgesehen. Dafür akzeptiere ich: ${limits[i]}`
            : 'Verteile zuerst beide Pläne vollständig.',
      })),
    };
  }
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
      ['path', 'Die neuen Nachbarn gehen nur 4 statt 12 Minuten.'],
    ];
    limits = [
      ['bus', 'Der Fußweg der neuen Nachbarn bleibt 12 Minuten lang.'],
      ['path', 'Es bleiben 20 Plätze. Vier Menschen fahren später.'],
    ];
  }
  if (link.kind === 'cocoa' || link.kind === 'water' || link.kind === 'area') {
    const options = (
      link.kind === 'water' ? water : link.kind === 'area' ? area : cocoa
    ).options({} as any);
    selectedName = options.find((x) => x.id === plan)?.label ?? plan;
    benefits = options.map((x) => [x.id, x.benefit]);
    limits = options.map((x) => [x.id, x.limit]);
  }
  if (task.simpleLanguage && link.kind === 'kenya') {
    benefits = benefits.slice(0, 2);
    limits = limits.slice(0, 2);
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
    simulation: task.simulation
      ? {
          ...task.simulation,
          preset:
            link.kind === 'kenya'
              ? `${(task.fields.some((f) => f.id === 'limit') && task.fields.length === 1 ? limit : benefit)?.[0].split('-')[0] ?? 'amina'}-${plan}`
              : plan,
        }
      : task.simulation,
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
export function cocoaTasks(p: ProfileId): Task[] {
  const simple = p === 'foerder';
  const ts: Task[] = [];
  const chain = [
    ['beans', 'Getrocknete Bohnen'],
    ['roast', 'Rösten und mahlen'],
    ['mass', 'Kakaomasse'],
    ['press', 'Pressen: Butter und Presskuchen'],
  ] as const;
  for (const [i, [id, label]] of chain.entries())
    ts.push(
      step(
        'cocoa.chain.' + id,
        `Schritt ${i + 1} der Verarbeitung`,
        'cocoa',
        [
          pick(
            'step',
            i === 0
              ? 'Was ist der Rohstoff?'
              : `Was kommt als Schritt ${i + 1}?`,
            id,
            simple ? [[id, label], chain[(i + 1) % 4]] : chain,
            'Die Kette: Bohnen → Rösten und mahlen → Kakaomasse → Pressen. Beim Pressen entstehen Butter und Presskuchen.',
          ),
        ],
        'Welche Veränderung ist zuerst nötig?',
      ),
    );
  const base = cocoaModel('base');
  ts.push(
    step(
      'cocoa.base',
      'Einnahmen sind nicht der Überschuss',
      'cocoa',
      simple
        ? [
            pick(
              'surplus',
              '180 − 100 = 80 GE. Wie viel bleibt?',
              '80',
              [
                ['180', '180 GE'],
                ['80', '80 GE'],
              ],
              'Die Rechnung ist vorgegeben. Die laufenden Ausgaben gehen von den Einnahmen ab.',
            ),
          ]
        : [
            number(
              'surplus',
              p === 'esa' ? '180 − 100 =' : 'Laufender Überschuss (GE)',
              base.surplus,
              '180 − 100 = 80 GE.',
            ),
          ],
      'Ziehe die laufenden Ausgaben von den Einnahmen ab.',
    ),
  );
  const cases = [
    ['quality', 'Lagerung und Qualität'],
    ['process', 'Zusätzliche Presse'],
  ] as const;
  ts.push(
    step(
      'cocoa.compare',
      'Teste beide Maßnahmen',
      'cocoa',
      cases.map(([id, name]) => {
        const m = cocoaModel(id);
        return simple
          ? pick(
              id,
              `${name}: Welcher laufende Überschuss bleibt?`,
              String(m.surplus),
              [
                [String(m.income), `${m.income} GE Einnahmen`],
                [String(m.surplus), `${m.surplus} GE Überschuss`],
              ],
              `${m.income} − ${m.costs} = ${m.surplus} GE. Diese Rechnung ist hier erklärt.`,
            )
          : number(
              id,
              p === 'esa'
                ? `${m.income} − ${m.costs} = (${name})`
                : `${name}: laufender Überschuss (GE)`,
              m.surplus,
              `${m.income} − ${m.costs} = ${m.surplus} GE.`,
            );
      }),
      'Wechsle zwischen Qualität und Presse. Trenne Einnahmen und Ausgaben.',
      [],
      { simulation: { kind: 'cocoa', required: ['quality', 'process'] } },
    ),
  );
  ts.push(
    step(
      'cocoa.investment',
      'Ein eigener Topf für Anschaffungen',
      'cocoa',
      [
        pick(
          'pot',
          'Woher kommen die einmaligen 20 oder 60 GE?',
          'separate',
          [
            ['running', 'Aus dem laufenden Überschuss noch einmal abziehen'],
            ['separate', 'Aus einem getrennten Topf mit 60 GE'],
          ],
          'Einmalige Anschaffung und laufende Runde sind getrennte Rechnungen.',
        ),
        pick(
          'cause',
          'Warum bedeutet mehr Einnahme hier nicht mehr Überschuss?',
          'costs',
          [
            ['automatic', 'Die Presse garantiert später Gewinn.'],
            ['costs', 'Die laufenden Ausgaben steigen ebenfalls.'],
          ],
          '260 − 185 = 75 GE sind weniger als 200 − 110 = 90 GE.',
        ),
      ],
      'Lies die zwei Geldtöpfe getrennt.',
    ),
  );
  ts.push(...decision('cocoa.final', 'cocoa', cases, p));
  ts.push(
    step(
      'cocoa.transfer',
      'Eine neue Information prüfen',
      'cocoa',
      [
        pick(
          'guarantee',
          'Beweisen unsere Modellzahlen sichere spätere Verkäufe?',
          'no',
          [
            ['no', 'Nein. Nachfrage und Verkaufspreise können sich ändern.'],
            ['yes', 'Ja. Jede zusätzliche Presse lohnt sich sicher.'],
          ],
          'Die Runde ist erfunden. Eine Zukunftsrendite wird nicht berechnet.',
        ),
      ],
      'Was fehlt für echte spätere Einnahmen?',
    ),
  );
  if (p === 'ahr')
    ts.push(
      step(
        'cocoa.cause',
        'Wann kann zusätzliche Verarbeitung trotzdem sinnvoll sein?',
        'cocoa',
        [
          own(
            'Trenne Überschuss in dieser Runde und längerfristiges Ziel. Welche Absatzangabe brauchst du?',
            'Die Presse bringt mit 260 GE höhere Einnahmen, aber nur 75 statt 90 GE Überschuss. Mehr eigene Verarbeitung kann mir trotzdem wichtig sein. Ob Nachfrage und Absatzpreise künftig reichen, müsste ich zusätzlich prüfen.',
          ),
        ],
        'Verbinde Rechnung, Ziel und eine fehlende Information.',
        [
          'Mehr Einnahmen von mehr Überschuss unterschieden.',
          'Einmalige Investition separat.',
          'Konkrete Absatzinformation und ihre Bedeutung.',
        ],
      ),
    );
  return differentiated(ts, p);
}
export const allocationOptions: readonly (readonly [string, string])[] = [
  ['40-40-40', '40 GE Auszahlung, 40 GE Rücklage, 40 GE Fortbildung'],
  ...Array.from({ length: 7 }, (_, a) =>
    Array.from(
      { length: 7 - a },
      (_, b) =>
        [
          `${a * 20}-${b * 20}-${120 - a * 20 - b * 20}`,
          `${a * 20} GE Auszahlung, ${b * 20} GE Rücklage, ${120 - a * 20 - b * 20} GE Fortbildung`,
        ] as const,
    ),
  )
    .flat()
    .filter(([id]) => id !== '40-40-40'),
];
export function shareTasks(p: ProfileId): Task[] {
  const ts = [
    step(
      'share.paid',
      'Was ist schon bezahlt?',
      'share',
      [
        pick(
          'wages',
          'Die 100 GE Löhne sind …',
          'paid',
          [
            ['open', 'noch offen'],
            ['paid', 'bereits bezahlt'],
          ],
          '100 GE Löhne und 80 GE andere Kosten sind bereits bezahlt.',
        ),
        p === 'foerder'
          ? pick(
              'free',
              '300 − 100 − 80 = 120 GE. Welcher Betrag ist frei?',
              '120',
              [
                ['300', '300 GE'],
                ['120', '120 GE'],
              ],
              'Die Rechnung ist hier erklärt. 120 GE sind frei.',
            )
          : number(
              'free',
              p === 'esa' ? '300 − 100 − 80 =' : 'Freier Betrag (GE)',
              120,
              '300 − 100 − 80 = 120 GE.',
            ),
      ],
      'Ziehe bereits bezahlte Kosten nicht ein zweites Mal ab.',
    ),
    step(
      'share.effects',
      'Untersuche drei Zwecke',
      'share',
      [
        pick(
          'now',
          'Welcher Zweck gibt Mitgliedern jetzt zusätzlich Geld?',
          'payout',
          [
            ['training', 'Fortbildung'],
            ['payout', 'Auszahlung'],
            ['reserve', 'Rücklage'],
          ],
          'Auszahlung ist zusätzliches Geld, kein Ersatz für unbezahlte Löhne.',
        ),
        pick(
          'future',
          'Garantiert eine Fortbildung spätere Einnahmen?',
          'no',
          [
            ['yes', 'Ja'],
            ['no', 'Nein'],
          ],
          'Fortbildung kann helfen, garantiert aber keine Aufträge.',
        ),
      ],
      'Tippe jeden Zweck an. Prüfe heutige Wirkung und Unsicherheit.',
      [],
      {
        simulation: {
          kind: 'share',
          required: ['payout', 'reserve', 'training'],
        },
      },
    ),
    step(
      'share.plan',
      'Verteile deine freien 120 GE',
      'share',
      [
        pick(
          'plan',
          'Dein Verteilungsplan',
          'either',
          allocationOptions,
          'Jede vollständige Verteilung der 120 GE ist möglich. Keine ist automatisch die beste.',
        ),
      ],
      'Verteile in Schritten von 20 GE. Achte auf den Rest.',
      [],
      { budget: true },
    ),
    step(
      'share.proof',
      'Welche Folge hat dein Plan?',
      'share',
      [
        pick(
          'evidence',
          'Welchen Zweck unterstützt dein Plan?',
          'linked',
          [],
          '',
        ),
        pick('limit', 'Welche Grenze bleibt?', 'linked', [], ''),
      ],
      'Verbinde Geldbetrag, Zweck und Zeit.',
      ['Vorteil und Grenze passen zu den tatsächlichen Beträgen.'],
      { dependsOn: ['share.plan'], allocationReference: true },
    ),
    step(
      'share.tradeoff',
      'Begrenztes Geld',
      'share',
      [
        pick(
          'tradeoff',
          'Was passiert bei festem Budget, wenn 20 GE mehr in die Rücklage gehen?',
          'less',
          [
            ['more', 'Für alle anderen Zwecke gibt es zugleich mehr.'],
            ['less', 'Für andere Zwecke bleiben zusammen 20 GE weniger.'],
          ],
          'Der freie Betrag bleibt 120 GE. Man muss an anderer Stelle 20 GE wegnehmen.',
        ),
      ],
      'Vergleiche denselben gesamten Topf.',
    ),
  ];
  if (p === 'msa' || p === 'ahr')
    ts.push(
      step(
        'share.plan.second',
        'Baue einen zweiten eigenen Plan',
        'share',
        [
          pick(
            'plan',
            'Ein anderer Verteilungsplan',
            'either',
            allocationOptions,
            'Du darfst eine andere Verteilung ausprobieren.',
          ),
        ],
        'Vergleiche deinen zweiten Plan mit dem ersten.',
        [],
        { budget: true, differentBudget: true, dependsOn: ['share.plan'] },
      ),
    );
  if (p === 'ahr')
    ts.push(
      step(
        'share.perspective',
        'Begründe gegenüber einem anderen Mitglied',
        'share',
        [
          own(
            'Vergleiche deine beiden Pläne. Ein anderes Mitglied möchte mehr Auszahlung. Wie begründest du deine Wahl, und was bleibt unsicher?',
            'Ich vergleiche die Beträge meiner beiden Pläne. Mehr Rücklage lässt weniger sofortige Auszahlung zu. Mir ist die Vorsorge wichtiger, obwohl noch unklar ist, ob das Geld für eine echte Reparatur reicht. Fortbildung ist ebenfalls keine Garantie für zusätzliche Einnahmen.',
          ),
        ],
        'Nenne einen tatsächlichen Betrag aus jedem deiner Pläne.',
        [
          'Beide eigenen Pläne korrekt verglichen.',
          'Andere Perspektive und Zeitpunkt einbezogen.',
          'Konkrete Unsicherheit statt Renditeversprechen.',
        ],
        { dependsOn: ['share.plan', 'share.plan.second'] },
      ),
    );
  return differentiated(ts, p);
}
function resolveAllocation(
  t: Task,
  records: Record<string, { answers: Record<string, string> }>,
  contextKey: string,
): Task {
  const source = records['share.plan']?.answers.plan ?? '';
  const parts = source.split('-').map(Number);
  const valid = allocationOptions.some(([id]) => id === source);
  const names = ['Auszahlung', 'Rücklage', 'Fortbildung'];
  const largest = parts.indexOf(Math.max(...parts));
  const effects = [
    'Mitglieder erhalten jetzt zusätzliches Geld.',
    'Geld bleibt für mögliche Reparaturen im Betrieb.',
    'Mitglieder können etwas dazulernen.',
  ];
  const limits = [
    'Das ausgezahlte Geld steht dem Betrieb nicht mehr zur Verfügung.',
    'Das Geld wird jetzt nicht ausgezahlt. Ob es für Reparaturen reicht, bleibt offen.',
    'Das Geld wird jetzt nicht ausgezahlt. Zusätzliche Aufträge sind nicht sicher.',
  ];
  return {
    ...t,
    contextKey,
    contextNote: valid
      ? `Dein Plan: ${allocationOptions.find(([id]) => id === source)![1]}.`
      : 'Dein Verteilungsplan ist noch nicht vollständig.',
    fields: t.fields.map((f) => ({
      ...f,
      expected: valid ? String(largest) : '__missing_budget__',
      accepted: valid
        ? parts.flatMap((amount, i) => (amount > 0 ? [String(i)] : []))
        : [],
      options: names.map((name, i) => [
        String(i),
        f.id === 'evidence'
          ? `${name}: ${effects[i]}`
          : `${name}: ${limits[i]}`,
      ]),
      explanation: valid
        ? f.id === 'evidence'
          ? `${names[largest]} erhält ${parts[largest]} GE. ${effects[largest]}`
          : limits[largest]
        : 'Verteile zuerst alle 120 GE.',
    })),
  };
}
export function waterTasks(p: ProfileId): Task[] {
  const simple = p === 'foerder',
    base = waterModel('base');
  const ts = [
    step(
      'water.base',
      'Wo wird das Wasser gemessen?',
      'water',
      simple
        ? [
            pick(
              'withdrawal',
              'Wie viel geht aus dem Tank heraus?',
              '60',
              [
                ['40', '40 WE am Feld'],
                ['60', '60 WE Entnahme'],
              ],
              'Entnahme ist Wasser aus dem Tank.',
            ),
            pick(
              'arrival',
              'Wie viel kommt am Feld an?',
              '40',
              [
                ['40', '40 WE'],
                ['60', '60 WE'],
              ],
              'Am Feld kommen 40 WE an. Das ist nicht die gesamte Entnahme.',
            ),
          ]
        : [
            number(
              'withdrawal',
              'Entnahme aus dem Tank (WE)',
              base.withdrawal,
              '60 WE werden entnommen.',
            ),
            number(
              'rest',
              p === 'esa' ? '80 − 60 =' : 'Rest im Tank (WE)',
              base.remaining,
              '80 − 60 = 20 WE.',
            ),
          ],
      'Unterscheide den Pfeil am Tank vom Pfeil am Feld.',
    ),
    step(
      'water.compare',
      'Teste Reparatur und neue Verteilung',
      'water',
      ['repair', 'tech'].map((id) => {
        const m = waterModel(id);
        return simple
          ? pick(
              id,
              `${id === 'repair' ? 'Reparatur' : 'Neue Verteilung'}: Was bleibt im Tank?`,
              String(m.remaining),
              [
                [String(m.remaining), `${m.remaining} WE`],
                ['40', '40 WE am Feld'],
              ],
              `Erklärte Rechnung: 80 − ${m.withdrawal} = ${m.remaining} WE.`,
            )
          : number(
              id,
              p === 'esa'
                ? `80 − ${m.withdrawal} =`
                : `${id === 'repair' ? 'Reparatur' : 'Neue Verteilung'}: Tankrest (WE)`,
              m.remaining,
              `80 − ${m.withdrawal} = ${m.remaining} WE.`,
            );
      }),
      'Wähle beide Maßnahmen. Vergleiche für dasselbe Feld.',
      [],
      { simulation: { kind: 'water', required: ['repair', 'tech'] } },
    ),
    step(
      'water.scope',
      'Was wissen wir über das Wasser?',
      'water',
      [
        pick(
          'same',
          'Was bleibt in beiden Versuchen gleich?',
          'field',
          [
            ['ground', 'Der gesamte Grundwasservorrat'],
            ['field', '40 WE am selben Feld'],
          ],
          'Die gleiche Fläche bekommt jeweils 40 WE.',
        ),
        pick(
          'consumption',
          'Ist alles übrige Wasser sicher verbraucht?',
          'no',
          [
            ['no', 'Nein. Verbrauch und Rückflüsse werden nicht berechnet.'],
            ['yes', 'Ja. Es ist sicher für immer verschwunden.'],
          ],
          'Tankentnahme, Ankunft und Verbrauch sind verschiedene Größen.',
        ),
      ],
      'Prüfe Messstelle und Modellgrenze.',
    ),
    ...decision(
      'water.final',
      'water',
      [
        ['repair', 'Vorhandene Leitung reparieren'],
        ['tech', 'Wasserverteilung erneuern'],
      ],
      p,
    ),
    step(
      'water.transfer',
      'Ein kleinerer Tankvorrat',
      'water',
      simple
        ? [
            pick(
              'rest',
              'Neue erfundene Runde: 70 WE da, 50 WE entnommen. 70 − 50 = 20. Was bleibt?',
              '20',
              [
                ['50', '50 WE'],
                ['20', '20 WE'],
              ],
              '20 WE bleiben; das ist keine Grundwassermessung.',
            ),
          ]
        : [
            number(
              'rest',
              p === 'esa'
                ? 'Neuer Fall: 70 − 50 ='
                : 'Neuer Fall: Start 70 WE, Entnahme 50 WE. Tankrest?',
              20,
              '70 − 50 = 20 WE.',
            ),
          ],
      'Die neue Runde hat 70 statt 80 WE am Anfang.',
    ),
  ];
  if (p === 'ahr')
    ts.push(
      step(
        'water.system',
        'Welche Umweltwirkung ist damit noch nicht belegt?',
        'water',
        [
          own(
            'Erkläre Entnahme, Ankunft und Tankrest. Warum beweist ein größerer Tankrest noch keinen besseren Grundwasserzustand?',
            'Bei neuer Verteilung erreichen 40 WE das Feld, während 45 statt 60 WE aus dem Tank entnommen werden. Es bleiben 35 WE. Der Tank ist kein Grundwasser. Verbrauch, Rückflüsse und echte Zuflüsse werden nicht berechnet.',
          ),
        ],
        'Benenne die Grenze des berechneten Systems.',
        [
          'Entnahme, Ankunft und Rest unterschieden.',
          'Kontrollierter Vergleich desselben Felds.',
          'Keine Grundwasser- oder Erntegarantie behauptet.',
        ],
      ),
    );
  return differentiated(ts, p);
}
export function areaTasks(p: ProfileId): Task[] {
  const simple = p === 'foerder',
    same = areaModel('same'),
    extra = areaModel('extra');
  const ts = [
    step(
      'area.single',
      'Zuerst dasselbe Feld',
      'area',
      simple
        ? [
            pick(
              'saving',
              'Früher 60 WE, jetzt 45 WE. Braucht dasselbe Feld weniger?',
              'yes',
              [
                ['yes', 'Ja: 15 WE weniger'],
                ['no', 'Nein: mehr'],
              ],
              '60 − 45 = 15 WE weniger. Die Rechnung ist vorgegeben.',
            ),
          ]
        : [
            number(
              'single',
              'Entnahme für das erste Feld mit neuer Technik (WE)',
              same.first,
              '45 WE für dasselbe erste Feld.',
            ),
            number(
              'saving',
              p === 'esa' ? '60 − 45 =' : 'Einsparung am ersten Feld (WE)',
              15,
              '60 − 45 = 15 WE weniger.',
            ),
          ],
      'Vergleiche genau dasselbe Feld.',
      [],
      { simulation: { kind: 'area', preset: 'same', required: ['same'] } },
    ),
    step(
      'area.total',
      'Jetzt kommt eine Fläche dazu',
      'area',
      simple
        ? [
            pick(
              'total',
              'Erklärte Rechnung: 45 + 20 = 65 WE. Wie ist das gegenüber früher 60 WE?',
              'more',
              [
                ['less', 'Insgesamt weniger'],
                ['more', 'Insgesamt mehr'],
              ],
              'Das erste Feld braucht weniger. Beide zusammen brauchen hier mehr.',
            ),
          ]
        : [
            number(
              'total',
              p === 'esa'
                ? '45 + 20 ='
                : 'Gesamtentnahme für beide Felder (WE)',
              extra.withdrawal,
              '45 + 20 = 65 WE.',
            ),
            number(
              'rest',
              p === 'esa' ? '80 − 65 =' : 'Rest im Tank (WE)',
              extra.remaining,
              '80 − 65 = 15 WE.',
            ),
          ],
      'Teste beide Pläne. Das kleinere Zusatzfeld braucht weitere 20 WE.',
      [],
      {
        simulation: {
          kind: 'area',
          preset: 'extra',
          required: ['same', 'extra'],
        },
      },
    ),
    step(
      'area.cause',
      'Eine Behauptung prüfen',
      'area',
      [
        pick(
          'claim',
          'Senkt sparsame Technik immer die gesamte Entnahme?',
          'no',
          [
            ['yes', 'Ja, unabhängig von der Fläche.'],
            ['no', 'Nein. Zusätzliche Flächen können die Einsparung aufheben.'],
          ],
          'Einzelfeld und alle bewässerten Felder sind verschiedene Bezugsebenen.',
        ),
      ],
      'Vergleiche erst dieselbe Fläche, dann alle Flächen.',
    ),
    ...decision(
      'area.final',
      'area',
      [
        ['same', 'Nur das gleiche Feld bewässern'],
        ['extra', 'Auch das kleinere Zusatzfeld bewässern'],
      ],
      p,
    ),
    step(
      'area.transfer',
      'Ein anderes erfundenes Zusatzfeld',
      'area',
      simple
        ? [
            pick(
              'total',
              'Dieses Zusatzfeld braucht nur 10 WE. 45 + 10 = 55 WE. Ist das weniger als früher 60 WE?',
              'yes',
              [
                ['no', 'Nein'],
                ['yes', 'Ja'],
              ],
              '55 WE sind weniger als 60 WE. Nicht jede Erweiterung hebt die Einsparung auf.',
            ),
          ]
        : [
            number(
              'total',
              p === 'esa'
                ? 'Neuer Fall: 45 + 10 ='
                : 'Neuer Fall: Zusatzfeld 10 WE. Gesamt mit erstem Feld?',
              55,
              '45 + 10 = 55 WE.',
            ),
            pick(
              'less',
              'Ist die Gesamtentnahme hier kleiner als früher 60 WE?',
              'yes',
              [
                ['yes', 'Ja'],
                ['no', 'Nein'],
              ],
              '55 ist kleiner als 60. Die Größe der Erweiterung ist entscheidend.',
            ),
          ],
      'Prüfe die neue Zusatzmenge statt die alte Summe zu übernehmen.',
    ),
  ];
  if (p === 'ahr')
    ts.push(
      step(
        'area.condition',
        'Unter welcher Bedingung bleibt es insgesamt weniger?',
        'area',
        [
          own(
            'Das erste Feld braucht 45 WE. Wann bleibt die Gesamtentnahme unter früher 60 WE? Prüfe auch genau 15 WE Zusatzentnahme.',
            'Bei weniger als 15 WE Zusatzentnahme bleibt die Summe unter 60 WE. Bei genau 15 WE sind es 60 WE. Bei 20 WE sind es 65 WE. Das erklärt eine Modellbedingung, keine Vorhersage über Marokkos Wasserhaushalt.',
          ),
        ],
        'Prüfe kleiner, gleich und größer.',
        [
          'Zusatzentnahme kleiner als 15 WE als Bedingung.',
          'Grenzfall 15 WE ergibt insgesamt 60 WE.',
          'Keine Ernte-/Einkommens- oder reale Wasserprognose.',
        ],
      ),
    );
  return differentiated(ts, p);
}

export function resolveSimulation(
  task: Task,
  records: Record<string, { answers: Record<string, string> }>,
): Task {
  return orderTaskFields(resolveSimulationInner(task, records));
}
