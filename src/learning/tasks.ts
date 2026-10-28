import { populationModel, populationBalance } from '../inquiry/content.ts';
import { journey } from '../model.ts';
import { isProfile, type ProfileId } from './profiles.ts';
import type { Unit } from './catalog.ts';
export type MaterialId = 'm1' | 'm2' | 'm3' | 'm4' | 'counter' | 'kenia';
export interface LearningField {
  id: string;
  label: string;
  kind: 'choice' | 'integer' | 'text';
  options?: readonly (readonly [string, string])[];
  expected?: string;
  explanation: string;
  example?: string;
}
export interface Task {
  id: string;
  conceptId: string;
  title: string;
  instruction: string;
  material: MaterialId;
  fields: LearningField[];
  hints: [string, string, string];
  criteria: string[];
  explained?: string;
  transfer?: boolean;
}
export const transferModel = {
  start: 800,
  births: 28,
  deaths: 12,
  arrivals: 5,
  departures: 17,
};
export const counterModel = { ...populationModel, departures: 70 };
const choice = (
  id: string,
  label: string,
  expected: string,
  options: LearningField['options'],
  explanation: string,
): LearningField => ({
  id,
  label,
  kind: 'choice',
  expected,
  options,
  explanation,
});
const num = (
  id: string,
  label: string,
  expected: number,
  explanation: string,
): LearningField => ({
  id,
  label,
  kind: 'integer',
  expected: String(expected),
  explanation,
});
const text = (
  id: string,
  label: string,
  example: string,
  explanation: string,
): LearningField => ({ id, label, kind: 'text', example, explanation });
function concreteSupport(id: string, material: MaterialId): string {
  if (id.includes('.event.')) {
    if (id.endsWith('.birth'))
      return 'Ein neuer Mensch kommt im Ort zur Welt. Es geht nicht um einen Umzug.';
    if (id.endsWith('.death'))
      return 'Ein Mensch lebt nicht mehr. Es geht nicht um einen Umzug in einen anderen Ort.';
    if (id.endsWith('.arrival'))
      return 'Folge dem Pfeil: Eine Person kommt von außerhalb über die Grenze in den Ort.';
    return 'Folge dem Pfeil: Eine Person verlässt den Ort und wohnt danach außerhalb.';
  }
  if (material === 'm2')
    return 'Lies Jahr und Wert zusammen: 2000 und 2024. Die Quelle nennt historische Schätzungen. Die Gesamtlinie trennt Geburten, Sterbefälle und Umzüge nicht auf.';
  if (material === 'm4')
    return id.includes('bridge')
      ? '24 sind Fahrgäste in einer Stunde. Die Ghana-Tabelle zählt Menschen im ganzen Land.'
      : id.includes('question')
        ? 'Frage nach einer konkreten fehlenden Angabe, etwa Altersverteilung oder vorhandenen Angeboten.'
        : 'Verbinde eine Bedingung mit einer möglichen Folge: etwa nutzbare Schulplätze mit Lehrkräften oder Ausbildung mit passenden Arbeitsplätzen. Eine Bedingung allein ist keine Erfolgsgarantie.';
  if (material === 'kenia')
    return id === 'kenia.walk'
      ? 'Der gestrichelte erste Teil führt zu Fuß zur Haltestelle. Erst der zweite Teil ist die Busfahrt.'
      : id === 'kenia.used-section' || id === 'kenia.explain'
        ? 'Amina steigt an der Nordhaltestelle ein. Die ganze Nordlinie dauert 16 Minuten; sie benutzt davon 8 Minuten. Ihr Fußweg dorthin dauert 2 Minuten.'
        : id.includes('times')
          ? 'Amina: Direkt 12 Minuten Fußweg und 10 Minuten Bus; Nord 2 und 8. David: Direkt 2 und 10; Nord 2 und 16. Addiere jeweils nur die Teile derselben Person und Route.'
          : id === 'kenia.transfer'
            ? 'Das Modell rechnet Wegzeiten. Es enthält weder Ticketpreise noch Wartezeiten oder eine sichere Zukunftsentwicklung.'
            : 'Vergleiche beide Richtungen getrennt: Amina 22 → 10 Minuten; David 12 → 18 Minuten. Ein Vorteil für eine Person kann ein Nachteil für die andere sein.';
  const m =
      material === 'm1'
        ? populationModel
        : material === 'm3'
          ? transferModel
          : counterModel,
    b = populationBalance(m);
  if (id.includes('natural'))
    return `Markiere ${m.births} Geburten und ${m.deaths} Sterbefälle. Bei einer Rechnung ziehst du die Sterbefälle von den Geburten ab.`;
  if (id.includes('migration'))
    return `Markiere ${m.arrivals} Zuzüge und ${m.departures} Fortzüge. Rechne Zuzug minus Fortzug. Gehen mehr weg, ist der Saldo negativ.`;
  if (id.includes('operations'))
    return 'Geburten und Sterbefälle bilden ein Paar; Zuzug und Fortzug das andere. Zähle nicht alle vier Größen zusammen.';
  return `Nutze beide Teilwirkungen: ${b.natural} und (${b.migration}). Die Anfangszahl ${m.start} gehört erst zum Endbestand. Setze kein zweites Minus vor einen schon negativen Saldo.`;
}
function task(
  id: string,
  title: string,
  material: MaterialId,
  fields: LearningField[],
  hint: string,
  criteria: string[] = [],
  explained?: string,
): Task {
  return {
    id,
    conceptId: id.startsWith('kenia')
      ? 'accessibility.personal-journey'
      : id.startsWith('population.source')
        ? 'population.source-limit'
        : id.startsWith('population.condition')
          ? 'population.conditional-effects'
          : 'population.balance',
    title,
    instruction: fields.some((f) => f.kind === 'text')
      ? 'Ein kurzer Satz oder Stichwörter reichen. Dein eigener Text wird nicht fachlich bewertet.'
      : fields.some((f) => f.kind === 'integer')
        ? 'Rechne mit den Angaben.'
        : 'Nutze die Angaben und wähle selbst.',
    material,
    fields,
    hints: [
      hint,
      concreteSupport(id, material),
      fields
        .map((f) => (f.kind === 'text' ? f.example : f.explanation))
        .join(' '),
    ],
    criteria: criteria.length ? criteria : fields.map((f) => f.explanation),
    explained,
    transfer: material === 'm3' || material === 'counter',
  };
}
const moreLess = [
  ['less', 'weniger'],
  ['more', 'mehr'],
] as const;
function events(profile: ProfileId) {
  return (['birth', 'death', 'arrival', 'departure'] as const).map(
    (event, i) => {
      const labels = [
        'Ein Baby wird geboren.',
        'Ein Mensch stirbt.',
        'Ein Mensch zieht in den Ort.',
        'Ein Mensch zieht aus dem Ort weg.',
      ];
      return profile === 'foerder'
        ? task(
            'population.event.' + event,
            labels[i] + ' Wird die Zahl größer oder kleiner?',
            'm1',
            [
              choice(
                'direction',
                'Die Zahl wird …',
                i % 2 === 0 ? 'more' : 'less',
                moreLess,
                labels[i] +
                  (i % 2 === 0
                    ? ' Die Zahl wird größer.'
                    : ' Die Zahl wird kleiner.'),
              ),
            ],
            'Betrachte nur dieses Ereignis im Ort.',
          )
        : task(
            'population.event.' + event,
            labels[i] + ' Welches Ereignis ist das?',
            'm1',
            [
              choice(
                'event',
                'Ordne zu.',
                event,
                [
                  ['arrival', 'Zuzug'],
                  ['death', 'Sterbefall'],
                  ['birth', 'Geburt'],
                  ['departure', 'Fortzug'],
                ],
                [
                  'Das ist eine Geburt.',
                  'Das ist ein Sterbefall.',
                  'Das ist Zuzug.',
                  'Das ist Fortzug.',
                ][i],
              ),
            ],
            'Geburt und Sterbefall sind etwas anderes als Umziehen.',
          );
    },
  );
}
function directions(material: 'm1' | 'm3') {
  const b = populationBalance(
      material === 'm1' ? populationModel : transferModel,
    ),
    prefix = 'population.' + (material === 'm1' ? 'base' : 'transfer');
  return [
    task(
      prefix + '.natural-direction',
      'Geburten und Sterbefälle: Werden es mehr oder weniger?',
      material,
      [
        choice(
          'direction',
          'Durch diese beiden Größen werden es …',
          'more',
          moreLess,
          `Mehr Geburten als Sterbefälle: ${b.natural} mehr.`,
        ),
      ],
      'Vergleiche die Zahl der Geburten mit der Zahl der Sterbefälle.',
    ),
    task(
      prefix + '.migration-direction',
      'Zuzug und Fortzug: Werden es mehr oder weniger?',
      material,
      [
        choice(
          'direction',
          'Durch Umzüge werden es …',
          'less',
          [...moreLess].reverse(),
          `${Math.abs(b.migration)} mehr ziehen weg als zu.`,
        ),
      ],
      'Vergleiche Zuzug mit Fortzug.',
    ),
    task(
      prefix + '.total-direction',
      'Bleiben insgesamt mehr Menschen als am Anfang?',
      material,
      [
        choice(
          'direction',
          'Insgesamt werden es …',
          'more',
          moreLess,
          `${b.natural} mehr und ${Math.abs(b.migration)} weniger: ${b.change} mehr. Ende: ${b.end} Personen.`,
        ),
      ],
      'Vergleiche die beiden Änderungen.',
      [],
      `Erklärte Rechnung: ${b.natural} mehr durch Geburten und Sterbefälle, ${Math.abs(b.migration)} weniger durch Umzüge. Diese Werte sind vorgegeben, nicht von dir gerechnet.`,
    ),
  ];
}
function arithmetic(
  material: 'm1' | 'm3' | 'counter',
  split = false,
  change = false,
) {
  const m =
      material === 'm1'
        ? populationModel
        : material === 'm3'
          ? transferModel
          : counterModel,
    b = populationBalance(m),
    prefix =
      'population.' +
      (material === 'm1' ? 'base' : material === 'm3' ? 'transfer' : 'counter');
  const f = [
    num(
      'natural',
      split
        ? `${m.births} − ${m.deaths} =`
        : 'Natürliche Veränderung (Personen)',
      b.natural,
      `${m.births} − ${m.deaths} = ${b.natural}.`,
    ),
    num(
      'migration',
      split
        ? `${m.arrivals} − ${m.departures} =`
        : 'Wanderungssaldo (Personen)',
      b.migration,
      `${m.arrivals} − ${m.departures} = ${b.migration}.`,
    ),
    ...(change
      ? [
          num(
            'change',
            'Gesamtveränderung (Personen)',
            b.change,
            `${b.natural} + (${b.migration}) = ${b.change}.`,
          ),
        ]
      : []),
    num(
      'end',
      split
        ? `${m.start} + (natürliche Veränderung) + (Wanderungssaldo) =`
        : 'Endbestand (Personen)',
      b.end,
      `${m.start} + (${b.natural}) + (${b.migration}) = ${b.end}. Die Änderung allein ist noch nicht der Endbestand.`,
    ),
  ];
  return split
    ? f.map((field) =>
        task(
          prefix + '.' + field.id,
          'Eine Teilrechnung nach der anderen',
          material,
          [field],
          field.explanation.split('=')[0] + ' = …',
        ),
      )
    : [
        task(
          prefix + '.balance',
          'Berechne die Teiländerungen und den Endbestand.',
          material,
          f,
          'Rechne natürliche Veränderung und Umzüge getrennt. Addiere beide Beiträge zur Anfangszahl.',
        ),
      ];
}
function source(profile: ProfileId) {
  const fields =
    profile === 'foerder'
      ? [
          choice(
            'larger',
            'In welchem Jahr ist der Wert größer?',
            '2024',
            [
              ['2000', '2000'],
              ['2024', '2024'],
            ],
            '2024: etwa 34,4 Millionen; 2000: etwa 19,6 Millionen.',
          ),
        ]
      : [
          choice(
            'year2000',
            'Wie viele Menschen im Jahr 2000?',
            '19637087',
            [
              ['34427414', 'etwa 34,4 Millionen'],
              ['19637087', 'etwa 19,6 Millionen'],
            ],
            '2000: 19.637.087 Menschen.',
          ),
          choice(
            'year2024',
            'Wie viele Menschen im Jahr 2024?',
            '34427414',
            [
              ['19637087', 'etwa 19,6 Millionen'],
              ['34427414', 'etwa 34,4 Millionen'],
            ],
            '2024: 34.427.414 Menschen.',
          ),
        ];
  fields.push(
    choice(
      'status',
      'Was sind diese Angaben?',
      'estimate',
      [
        ['future', 'Sichere Zahlen für 2040'],
        ['estimate', 'Schätzungen für vergangene Jahre'],
      ],
      'Historische Schätzungen sind keine Zukunftsprognosen.',
    ),
  );
  if (profile === 'msa')
    fields.push(
      choice(
        'limit',
        'Was zeigt die Reihe allein nicht?',
        'causes',
        [
          [
            'causes',
            'Wie viel Geburten und Umzüge jeweils zur Änderung beitragen',
          ],
          ['trend', 'Dass die geschätzte Zahl zwischen 2000 und 2024 steigt'],
        ],
        'Die Reihe zeigt die Gesamtzahl, nicht ihre einzelnen Ursachen.',
      ),
    );
  return task(
    'population.source.read',
    'Lies Jahre, Werte und Datenstatus.',
    'm2',
    fields,
    'Lies jeweils Jahr und Wert zusammen. Schätzung heißt: aus vorhandenen Daten berechnet.',
  );
}
function sourceSteps(profile: ProfileId) {
  const item = source(profile);
  return item.fields.map((field) => ({
    ...item,
    id: item.id + '.' + field.id,
    title: field.label,
    fields: [field],
  }));
}
function conditions(profile: ProfileId) {
  if (profile === 'foerder')
    return [
      task(
        'population.condition.places',
        'Mehr Kinder: Was kann beim Lernen helfen?',
        'm4',
        [
          choice(
            'help',
            'Wähle.',
            'places',
            [
              ['none', 'Keine zusätzlichen nutzbaren Plätze'],
              ['places', 'Zusätzliche nutzbare Schulplätze'],
            ],
            'Zusätzliche Schulplätze können helfen, wenn sie nutzbar sind.',
          ),
        ],
        'Was brauchen die Kinder, um in der Schule zu lernen?',
      ),
      task(
        'population.condition.teachers',
        'Was braucht die Schule außerdem?',
        'm4',
        [
          choice(
            'condition',
            'Wähle eine passende Bedingung.',
            'teachers',
            [
              ['teachers', 'Lehrkräfte'],
              ['nothing', 'Nur das Gebäude; sonst nichts'],
            ],
            'Ein Gebäude allein reicht nicht. Es braucht auch Lehrkräfte.',
          ),
        ],
        'Wer unterstützt die Kinder beim Lernen?',
      ),
    ];
  return [
    task(
      'population.condition.links',
      'Verbinde Möglichkeiten und Bedingungen.',
      'm4',
      [
        choice(
          'chance',
          'Ausbildung kann später Erwerbsmöglichkeiten eröffnen, wenn …',
          'jobs',
          [
            ['automatic', 'dadurch sofort alle Arbeit haben.'],
            ['jobs', 'auch passende Arbeitsplätze entstehen.'],
          ],
          'Ausbildung kann helfen, garantiert aber keine Beschäftigung.',
        ),
        choice(
          'risk',
          'Mehr Kinder ohne zusätzliche Plätze und Lehrkräfte …',
          'pressure',
          [
            ['pressure', 'können die Versorgung schwieriger machen.'],
            ['always', 'machen jeden Ort sofort ärmer.'],
          ],
          'Schulplätze und Lehrkräfte sind eine Bedingung; keine pauschale Armutsbehauptung.',
        ),
      ],
      'Achte darauf, unter welcher Bedingung eine Folge möglich ist.',
    ),
  ];
}
export function tasksFor(unit: Unit, profile: ProfileId): Task[] {
  if ((unit !== 'c' && unit !== 's1') || !isProfile(profile))
    throw new Error('Dieser Lernbereich ist noch nicht als Lernweg umgesetzt.');
  if (unit === 's1') return kenyaTasks(profile);
  if (profile === 'foerder')
    return [
      ...events(profile),
      ...directions('m1'),
      ...sourceSteps(profile),
      ...conditions(profile),
      ...directions('m3'),
    ];
  if (profile === 'esa')
    return [
      ...events(profile),
      ...arithmetic('m1', true),
      task(
        'population.base.reason',
        'Warum gibt es am Ende mehr Menschen?',
        'm1',
        [
          choice(
            'reason',
            'Wähle die passende Erklärung.',
            'balance',
            [
              ['away', 'Wegziehen vergrößert die Zahl.'],
              [
                'balance',
                'Die natürliche Zunahme ist größer als die Abnahme durch Umzüge.',
              ],
            ],
            'Die natürliche Zunahme +30 übersteigt den Wanderungsverlust 10.',
          ),
        ],
        'Vergleiche +30 und −10.',
      ),
      source(profile),
      ...conditions(profile),
      ...arithmetic('m3', true),
    ];
  if (profile === 'msa')
    return [
      task(
        'population.operations',
        'Welche Zahlen und Operationen gehören zusammen?',
        'm1',
        [
          choice(
            'natural',
            'Natürliche Veränderung',
            'birth-death',
            [
              ['sum', '48 + 18'],
              ['birth-death', '48 − 18'],
              ['moves', '30 − 40'],
            ],
            'Geburten minus Sterbefälle: 48 − 18.',
          ),
          choice(
            'migration',
            'Wanderungssaldo',
            'arrival-departure',
            [
              ['arrival-departure', '30 − 40'],
              ['reverse', '40 − 30'],
              ['births', '48 − 18'],
            ],
            'Zuzug minus Fortzug: 30 − 40.',
          ),
        ],
        'Welche Zahlen gehören zusammen?',
      ),
      ...arithmetic('m1'),
      task(
        'population.stock-change',
        'Unterscheide Änderung und Bestand.',
        'm1',
        [
          num('change', 'Änderung (Personen)', 20, '+20 ist die Änderung.'),
          num(
            'stock',
            'Endbestand (Personen)',
            1020,
            '1020 ist Anfang plus Änderung.',
          ),
        ],
        'Was war schon am Anfang vorhanden?',
      ),
      source(profile),
      ...conditions(profile),
      task(
        'population.condition.own',
        'Erkläre eine Bedingung kurz selbst.',
        'm4',
        [
          text(
            'explanation',
            'Wann können mehr junge Menschen eine Chance sein?',
            'Wenn Ausbildung und passende Arbeitsplätze entstehen, können sich später Erwerbsmöglichkeiten eröffnen.',
            'Eine Bedingung und eine mögliche Folge verbinden.',
          ),
        ],
        'Welche Bedingung muss erfüllt sein?',
        [
          'Du nennst eine konkrete Bedingung, etwa Ausbildung und passende Arbeitsplätze.',
          'Du erklärst eine mögliche Folge, keine Garantie und keine sofort erwachsenen Arbeitskräfte.',
        ],
      ),
      ...arithmetic('m3', false, true),
      task(
        'population.bridge',
        'Bevölkerung und Fahrgäste sind verschiedene Größen.',
        'm4',
        [
          choice(
            'scope',
            'Sind 24 Fahrgäste die Einwohnerzahl Ghanas?',
            'no',
            [
              ['yes', 'Ja'],
              ['no', 'Nein: Fahrgäste in einem erfundenen Verkehrsmodell'],
            ],
            '24 bezeichnet Fahrgäste in einer Modellstunde, keine Landesbevölkerung.',
          ),
        ],
        'Lies Ort, Einheit und Zeitraum.',
      ),
    ];
  return [
    ...arithmetic('m1'),
    task(
      'population.base.explain',
      'Mehr Menschen ziehen weg als zu. Warum steigt die Zahl trotzdem?',
      'm1',
      [
        text(
          'explanation',
          'Verbinde beide Teiländerungen.',
          'Die natürliche Zunahme +30 ist größer als der Wanderungsverlust 10. Insgesamt sind es 20 mehr und am Ende 1020 Personen.',
          'Beide Teiländerungen und die Gesamtwirkung unterscheiden.',
        ),
      ],
      'Vergleiche die beiden Beiträge.',
      [
        'Beide Salden stimmen und sind einbezogen.',
        'Du unterscheidest Änderung +20 und Endbestand 1020.',
      ],
    ),
    source(profile),
    task(
      'population.source.explain',
      'Beweist die Reihe, dass mehr Menschen zugezogen sind?',
      'm2',
      [
        text(
          'explanation',
          'Eine Behauptung: „Ghanas Bevölkerung ist gewachsen. Deshalb sind mehr Menschen zugezogen.“ Prüfe sie mit der Reihe. Begründe kurz.',
          'Zwischen 2000 und 2024 steigt die geschätzte Zahl von etwa 19,6 auf 34,4 Millionen. Die Reihe allein zeigt nicht, wie Geburten, Sterbefälle oder Umzüge beigetragen haben.',
          'Historische Gesamtzahlen sind keine getrennten Ursachen.',
        ),
      ],
      'Prüfe Datenart und Aussagegrenze.',
      [
        'Zwei Jahre und passende Werte mit Einheit.',
        'Schätzung für vergangene Jahre, keine Prognose.',
        'Keine einzelne Ursache aus der Gesamtlinie behaupten.',
      ],
    ),
    task(
      'population.condition.explain',
      'Eine mögliche Chance und eine Herausforderung',
      'm4',
      [
        text(
          'explanation',
          'Unter welchen Bedingungen können beide entstehen?',
          'Ausbildung und passende Arbeitsplätze können später Chancen eröffnen. Ohne weitere Schulplätze und Lehrkräfte kann die Versorgung schwieriger werden.',
          'Beide Folgen sind bedingt, nicht zwangsläufig.',
        ),
      ],
      'Welche Bedingungen verändern die Folgen?',
      [
        'Eine konkrete Chance und passende Bedingung.',
        'Eine Herausforderung und passende Bedingung.',
        'Keine sofortige Erwerbstätigkeit durch mehr Geburten.',
      ],
    ),
    ...arithmetic('m3'),
    ...arithmetic('counter', false, true),
    task(
      'population.question',
      'Welche Information brauchst du für einen wirklichen Ort?',
      'm4',
      [
        text(
          'question',
          'Stelle eine kurze eigene Frage.',
          'Wie viele Kinder leben dort, und wie viele nutzbare Schulplätze gibt es?',
          'Frage nach einer relevanten zusätzlichen Information.',
        ),
      ],
      'Was fehlt für ein Urteil über Versorgung?',
      [
        'Die Frage betrifft Versorgung, etwa Altersverteilung oder vorhandene Angebote.',
        'Die Gesamtbevölkerung allein beantwortet deine Frage noch nicht.',
      ],
    ),
  ];
}
function kenyaTasks(profile: ProfileId): Task[] {
  const a = journey('amina', 'direct'),
    n = journey('amina', 'north'),
    d = journey('david', 'direct'),
    dn = journey('david', 'north');
  const benefit = choice(
      'benefit',
      'Wem hilft Nord im Vergleich zu Direkt?',
      'amina',
      [
        ['david', 'David: 12 → 18 Minuten'],
        ['amina', 'Amina: 22 → 10 Minuten'],
      ],
      'Amina braucht über Nord 10 statt 22 Minuten.',
    ),
    limit = choice(
      'limit',
      'Welcher Nachteil gehört dazu?',
      'david',
      [
        ['david', 'David braucht 18 statt 12 Minuten.'],
        ['amina', 'Amina braucht länger als vorher.'],
      ],
      'David braucht über Nord 18 statt 12 Minuten.',
    );
  if (profile === 'foerder')
    return [
      task(
        'kenia.walk',
        'Welchen Teil geht Amina zu Fuß?',
        'kenia',
        [
          choice(
            'walk',
            'Wähle.',
            'to-stop',
            [
              ['bus', 'Die Fahrt mit dem Bus'],
              ['to-stop', 'Den Weg von zu Hause zur Haltestelle'],
            ],
            'Amina geht zur Haltestelle. Danach fährt sie Bus.',
          ),
        ],
        'Folge Aminas Weg vom Startpunkt zur Haltestelle.',
      ),
      task(
        'kenia.compare',
        'Welcher Weg ist für Amina kürzer?',
        'kenia',
        [
          choice(
            'route',
            'Wähle.',
            'north',
            [
              ['direct', 'Direkt: 22 Minuten'],
              ['north', 'Nord: 10 Minuten'],
            ],
            '10 ist weniger als 22 Minuten.',
          ),
        ],
        'Vergleiche Aminas beide Gesamtzeiten.',
        [],
        `Erklärte Rechnung: Direkt ${a.walk} + ${a.bus} = ${a.total}, Nord ${n.walk} + ${n.bus} = ${n.total} Minuten. Du wählst den Vergleich; die Rechnung ist vorgegeben.`,
      ),
      task(
        'kenia.benefit',
        'Wem hilft Nord?',
        'kenia',
        [benefit],
        'Vergleiche jede Person mit ihrem bisherigen Weg.',
      ),
      task(
        'kenia.limit',
        'Wer braucht über Nord mehr Zeit?',
        'kenia',
        [limit],
        'Vergleiche jede Person mit ihrem bisherigen Weg.',
      ),
    ];
  const numbers = task(
    'kenia.times',
    'Berechne die persönlichen Gesamtzeiten.',
    'kenia',
    [
      num(
        'amina-direct',
        profile === 'esa'
          ? `${a.walk} + ${a.bus} = (Amina Direkt)`
          : 'Amina Direkt (Minuten)',
        22,
        '12 Minuten zu Fuß + 10 Minuten Bus = 22.',
      ),
      num(
        'amina-north',
        profile === 'esa'
          ? `${n.walk} + ${n.bus} = (Amina Nord)`
          : 'Amina Nord (Minuten)',
        10,
        '2 Minuten zu Fuß + 8 Minuten Bus = 10.',
      ),
      num(
        'david-direct',
        profile === 'esa'
          ? `${d.walk} + ${d.bus} = (David Direkt)`
          : 'David Direkt (Minuten)',
        12,
        '2 + 10 = 12 Minuten.',
      ),
      num(
        'david-north',
        profile === 'esa'
          ? `${dn.walk} + ${dn.bus} = (David Nord)`
          : 'David Nord (Minuten)',
        18,
        `${dn.walk} + ${dn.bus} = 18 Minuten.`,
      ),
    ],
    'Addiere Fußweg und den tatsächlich genutzten Busabschnitt.',
  );
  if (profile !== 'ahr')
    return [
      ...(profile === 'esa'
        ? numbers.fields.map((field) => ({
            ...numbers,
            id: numbers.id + '.' + field.id,
            title: field.label,
            fields: [field],
          }))
        : [
            task(
              'kenia.used-section',
              'Welchen Busabschnitt benutzt Amina über Nord?',
              'kenia',
              [
                choice(
                  'section',
                  'Wähle anhand ihres Einstiegs.',
                  'used',
                  [
                    ['whole', 'Die gesamte Nordlinie: 16 Minuten'],
                    ['used', 'Den Abschnitt ab Nord: 8 Minuten'],
                  ],
                  'Amina steigt an der Nordhaltestelle ein und fährt den letzten Abschnitt (8 Minuten).',
                ),
              ],
              'Unterscheide gesamte Linie und späteren Einstieg.',
            ),
            numbers,
          ]),
      task(
        'kenia.effects',
        'Verbinde die unterschiedlichen Folgen.',
        'kenia',
        [benefit, limit],
        'Nicht jede Person hat denselben Weg zur Haltestelle.',
      ),
      task(
        'kenia.recommendation',
        'Welche Folge ist dir wichtiger?',
        'kenia',
        [
          choice(
            'priority',
            'Beide Prioritäten sind möglich.',
            'either',
            [
              [
                'amina',
                'Aminas Zeitvorteil. Ich akzeptiere Davids längeren Weg.',
              ],
              [
                'david',
                'Davids kürzerer Direktweg. Ich akzeptiere Aminas längeren Weg.',
              ],
            ],
            'Eine Priorität ist keine falsche Rechnung. Beide Folgen müssen stimmen.',
          ),
        ],
        'Du darfst beide Zeitfolgen unterschiedlich gewichten.',
      ),
    ];
  return [
    numbers,
    task(
      'kenia.explain',
      'Warum kann die längere Linie Amina helfen?',
      'kenia',
      [
        text(
          'explanation',
          'Erkläre den persönlichen Weg.',
          'Amina geht nur 2 statt 12 Minuten zur Haltestelle. Sie steigt später ein und fährt über Nord 8 Minuten. Insgesamt sind es 10 statt 22 Minuten.',
          'Gesamte Linie und benutzter Busabschnitt unterscheiden.',
        ),
      ],
      'Vergleiche Fußweg und Einstieg.',
      [
        'Fußweg 12 → 2 Minuten.',
        'Genutzter Busabschnitt 10 → 8 Minuten, nicht die gesamte Linie.',
        'Gesamtzeit 22 → 10 Minuten.',
      ],
    ),
    task(
      'kenia.judgment',
      'Empfiehl einen Weg und nenne seinen Nachteil.',
      'kenia',
      [
        text(
          'explanation',
          'Welcher Beleg trägt deine Wahl?',
          'Ich empfehle Nord wegen Aminas Zeitvorteil von 22 auf 10 Minuten. Dafür akzeptiere ich, dass David 18 statt 12 Minuten braucht.',
          'Direkt oder Nord mit passendem Vorteil und Nachteil sind zulässig.',
        ),
      ],
      'Welche Person profitiert und welche braucht länger?',
      [
        'Vorschlag und tatsächlich passende Zeitfolge.',
        'Nachteil einer anderen Person und eigene Gewichtung.',
        'Auch Direkt ist mit umgekehrter Gewichtung begründbar.',
      ],
    ),
    task(
      'kenia.transfer',
      'Was fehlt für eine Entscheidung über echte Wege?',
      'kenia',
      [
        choice(
          'missing',
          'Wähle eine zusätzliche nötige Information.',
          'price',
          [
            ['price', 'Fahrpreis oder Wartezeit'],
            ['forecast', 'Die sichere Verkehrslage im Jahr 2040'],
          ],
          'Fahrpreis und Wartezeit fehlen; das Modell ist keine Prognose.',
        ),
      ],
      'Was berechnet das Modell nicht?',
    ),
  ];
}
