import {
  economyData,
  plans,
  rainRegions,
  seasons,
  type TopicId,
} from '../inquiry/content.ts';
import type { ProfileId } from './profiles.ts';
import type { LearningField, Task } from './tasks.ts';
export type TopicUnit = 'a' | 'n' | 'd' | 'e';
export interface Focus {
  topic: TopicId;
  paragraphs: string[];
  rows?: string[][];
  picture?: 'market' | 'forest';
  comparePictures?: boolean;
  season?: 0 | 1;
  steps?: string[];
  words: [string, string][];
}
const pick = (
  id: string,
  label: string,
  expected: string,
  options: readonly (readonly [string, string])[],
  explanation: string,
): LearningField => ({
  id,
  label,
  expected,
  options,
  explanation,
  kind: 'choice',
});
const number = (
  id: string,
  label: string,
  expected: number,
  explanation: string,
): LearningField => ({
  id,
  label,
  expected: String(expected),
  explanation,
  kind: 'integer',
});
const own = (id: string, label: string, example: string): LearningField => ({
  id,
  label,
  kind: 'text',
  example,
  explanation:
    'Die App prüft deinen Text nicht fachlich. Öffne die Selbstkontrolle und vergleiche.',
});
const focus = (
  topic: TopicId,
  paragraphs: string[],
  words: [string, string][],
  rest: Partial<Focus> = {},
): Focus => ({ topic, paragraphs, words, ...rest });
const imageWords: [string, string][] = [
  ['Beobachtung', 'Etwas, das du auf dem Foto sehen kannst.'],
  ['Ausschnitt', 'Ein Foto zeigt einen kleinen Teil der Welt.'],
];
const natureWords: [string, string][] = [
  ['Niederschlag', 'Wasser fällt aus Wolken, zum Beispiel als Regen.'],
  ['Regenzeit', 'In diesen Monaten fällt meist mehr Regen.'],
  ['Vegetationszeit', 'Zeit, in der Pflanzen wachsen können.'],
];
const moneyWords: [string, string][] = [
  ['Einnahmen', 'Geld, das ein Betrieb bekommt.'],
  [
    'Überschuss',
    'Der Betrieb bekommt Geld. Er bezahlt seine laufenden Kosten. Das übrige Geld heißt Überschuss.',
  ],
  [
    'Investition',
    'Der Betrieb kauft etwas, etwa eine Maschine. Diese Anschaffung heißt Investition. Hier wird sie einmal bezahlt.',
  ],
];
const futureWords: [string, string][] = [
  ['Beleg', 'Eine passende Angabe für deinen Vorschlag.'],
  ['Grenze', 'Ein Problem, das bei deinem Vorschlag bleibt.'],
  ['Wartung', 'Regelmäßig prüfen und pflegen.'],
];
function item(
  id: string,
  title: string,
  fields: LearningField[],
  material: Focus,
  h1: string,
  h2: string,
  criteria: string[] = [],
  transfer = false,
): Task {
  return {
    id,
    conceptId: id.split('.').slice(0, 2).join('.'),
    title,
    fields,
    material: 'topic',
    focus: material,
    instruction: fields.some((f) => f.kind === 'text')
      ? 'Ein kurzer Satz oder Stichwörter reichen. Die App bewertet deinen Text nicht fachlich.'
      : '',
    hints: [
      h1,
      h2,
      fields
        .map((f) => (f.kind === 'text' ? f.example : f.explanation))
        .join(' '),
    ],
    criteria: criteria.length ? criteria : fields.map((f) => f.explanation),
    transfer,
  };
}
function split(task: Task, profile: ProfileId) {
  if (profile !== 'foerder' && profile !== 'esa') return [task];
  return task.fields.map((f) => {
    let focus = task.focus;
    if (profile === 'foerder' && task.id === 'nature.concepts' && focus) {
      focus = {
        ...focus,
        paragraphs:
          f.id === 'savanna'
            ? [
                'Savanne: Graslandschaft mit Regenzeiten und Trockenzeiten. Tropischer Regenwald: sehr feucht, zum Beispiel in Teilen des Kongobeckens.',
              ]
            : [
                'Wasser kann in die Luft gelangen. Wolken und Niederschlag gehören zum Wasserkreislauf.',
              ],
        steps: f.id === 'cycle' ? focus.steps : undefined,
      };
    }
    let hints = task.hints;
    if (task.id === 'nature.concepts') {
      const first =
        f.id === 'savanna'
          ? 'Suche die Landschaft mit einer Regenzeit und einer Trockenzeit.'
          : 'Denke an eine Pfütze, die in der Sonne trocknet. Wohin gelangt das Wasser?';
      const second =
        f.id === 'savanna'
          ? 'Vergleiche: ganzjährig feucht oder Regenzeit und Trockenzeit?'
          : 'Wasser wird zu Wasserdampf und gelangt in die Luft. Dieser Vorgang hat einen Fachnamen.';
      hints = [first, second, f.explanation];
    }
    if (task.id === 'economy.data' && f.id === 'access' && focus) {
      focus = {
        ...focus,
        paragraphs: [
          'Ghana, Quelle: Weltbank. Prozent bedeutet: von 100. 89,5 Prozent sind ungefähr 90 von 100 Menschen. Das ist eine gerundete Angabe. Zugang zu Strom sagt nicht, wie oft er ausfällt.',
        ],
        rows: focus.rows?.map((row) => row.slice(0, 2)),
      };
      hints = [
        'Lies die Spalte Stromzugang. Prozent bedeutet: von 100.',
        'Die Zahl beschreibt einen Anteil der Menschen. Sie misst keine Stromausfälle.',
        f.explanation,
      ];
    }
    if (task.id === 'nature.regions' && f.id === 'higher')
      hints = [
        'Lies bei beiden Regionen die Zahl in derselben Spalte.',
        'Beide Werte gelten für ein Jahr und haben dieselbe Einheit. Welche Zahl ist größer?',
        f.explanation,
      ];
    if (task.id === 'economy.conditions' && f.id === 'pair')
      hints = [
        'Was könnte dem Betrieb helfen?',
        'Was zeigt der Bericht wirklich? Steht dort, dass später alle mehr Geld verdienen?',
        f.explanation,
      ];
    if (task.id === 'economy.conditions' && f.id === 'proof')
      hints = [
        'Lies: Worüber berichtet GEPA? Werden spätere Einnahmen genannt?',
        'GEPA berichtet über eine eigene Schulung. Eine Schulung ist noch kein gemessener späterer Erfolg.',
        f.explanation,
      ];
    return {
      ...task,
      id: task.id + '.' + f.id,
      hints,
      title: f.label,
      fields: [f],
      focus,
    };
  });
}
function images(p: ProfileId): Task[] {
  const photo = (picture: 'market' | 'forest') =>
    focus(
      'image',
      [
        'Ein echtes Foto aus Ghana. Das Foto zeigt einen Ort zu einem früheren Zeitpunkt.',
      ],
      imageWords,
      { picture },
    );
  const market = item(
    'image.observe',
    'Was siehst du auf dem Marktfoto?',
    [
      pick(
        'built',
        'Was haben Menschen gebaut?',
        'gate',
        [
          ['gate', 'Das Tor zum Markt'],
          ['tree', 'Einen Baum'],
        ],
        'Das Markttor wurde von Menschen gebaut.',
      ),
      pick(
        'income',
        'Beweist das Foto, wie viel alle verdienen?',
        'unknown',
        [
          ['rich', 'Alle sind reich.'],
          ['unknown', 'Das können wir aus dem Foto nicht erkennen.'],
        ],
        'Das Foto zeigt kein Einkommen aller Menschen.',
      ),
    ],
    photo('market'),
    'Suche ein sichtbares Detail.',
    'Ein Bauwerk ist von Menschen gemacht. Einkommen sieht man nicht direkt.',
  );
  const forest = item(
    'image.second',
    'Prüfe das zweite Foto.',
    [
      pick(
        'built',
        'Was haben Menschen hier gebaut?',
        'walkway',
        [
          ['leaves', 'Die Blätter'],
          ['walkway', 'Den Weg zwischen den Bäumen'],
        ],
        'Der Baumkronenweg ist gebaut.',
      ),
      pick(
        'scope',
        'Zeigen zwei Fotos ganz Afrika?',
        'limited',
        [
          ['limited', 'Nein. Es sind zwei Orte und Zeitpunkte.'],
          ['all', 'Ja. So sieht ganz Afrika aus.'],
        ],
        'Die Fotos zeigen Ausschnitte, keinen ganzen Kontinent.',
      ),
    ],
    photo('forest'),
    'Betrachte den Weg und seine Befestigung.',
    'Menschen haben den Weg gebaut. Das Foto zeigt weder alle Orte noch alle Zeiten.',
    [],
    true,
  );
  const headline = item(
    'image.headline',
    'Eine erfundene Schulzeitung behauptet: „Afrika ist nur unberührte Natur.“',
    [
      pick(
        'evidence',
        'Was siehst du auf den Fotos? Was zeigt, dass die Behauptung nicht stimmt?',
        'built',
        [
          ['beautiful', 'Beide Fotos sind schön.'],
          ['built', 'Markttor und Baumkronenweg wurden gebaut.'],
        ],
        'Menschen haben den Weg und das Markttor gebaut. Sie nutzen die Orte.',
      ),
      pick(
        'revision',
        'Welche neue Überschrift passt zu den beiden Fotos? Sie soll nicht für ganz Afrika sprechen.',
        'places',
        [
          ['all', 'Afrika ist überall reich.'],
          ['places', 'Zwei Einblicke in Orte in Ghana'],
        ],
        'Eine passende Überschrift nennt die gezeigten Orte. Sie spricht nicht für ganz Afrika.',
      ),
    ],
    photo('forest'),
    'Vergleiche die Behauptung mit beiden Bildern.',
    'Nenne etwas, das du auf einem Foto siehst. Sprich nur über die gezeigten Orte.',
  );
  headline.contextNote =
    'Eine erfundene Schulzeitung schreibt: „Afrika ist nur unberührte Natur.“ Sie behauptet: Menschen haben dort nichts gebaut.';
  const initial = item(
    'image.initial',
    'Was denkst du bisher über Afrika?',
    [
      pick(
        'idea',
        'Du kannst wählen oder diese Frage auslassen.',
        'either',
        [
          ['nature', 'Ich denke zuerst an Natur.'],
          ['cities', 'Ich denke zuerst an Städte und Alltag.'],
          ['uncertain', 'Ich weiß es noch nicht oder möchte nichts angeben.'],
        ],
        'Deine erste Vorstellung wird nicht als richtig oder falsch bewertet.',
      ),
    ],
    focus(
      'image',
      [
        'Später prüfst du zwei Fotos. Was zeigen die Fotos wirklich? Deine Vorstellung allein beweist noch nichts über Afrika.',
      ],
      imageWords,
    ),
    'Du musst keine bestimmte Vorstellung haben.',
    'Ein Bild im Kopf kann sich durch neue Belege ändern.',
  );
  initial.personal = true;
  const tasks = [initial, ...split(market, p), ...split(forest, p)];
  if (p !== 'foerder') tasks.push(...split(headline, p));
  if (p === 'ahr')
    tasks.push(
      item(
        'image.perspective',
        'Nur das Waldfoto wird gedruckt. Welche Vorstellung kann entstehen?',
        [
          own(
            'explanation',
            'Was sollte die Zeitung zusätzlich zeigen? Nenne etwas auf dem anderen Foto. Was zeigen auch beide Fotos nicht?',
            'Wer nur das Waldfoto sieht, denkt vielleicht nur an Natur. Das Marktfoto zeigt auch einen Ort, den Menschen nutzen. Beide Fotos zusammen zeigen trotzdem nicht ganz Afrika.',
          ),
        ],
        photo('forest'),
        'Was wird gezeigt, was fehlt?',
        'Was könnte jemand beim Waldfoto denken? Was zeigt das andere Foto zusätzlich?',
        [
          'Mögliche Wirkung der Auswahl erklärt.',
          'Sichtbares Detail aus dem anderen Foto genutzt.',
          'Du beachtest: Die beiden Fotos zeigen nicht, wie es überall in Afrika aussieht.',
        ],
        true,
      ),
    );
  else if (p === 'msa')
    tasks.push(
      item(
        'image.revision',
        'Was denkst du jetzt? Was hast du auf den Fotos gesehen?',
        [
          own(
            'explanation',
            'Was kannst du über die beiden gezeigten Orte sagen? Schreibe nur, was die Fotos zeigen.',
            'Die Bilder zeigen Natur und gebaute Orte in Ghana. Sie zeigen nicht ganz Afrika.',
          ),
        ],
        photo('market'),
        'Nenne Orte statt ganz Afrika.',
        'Verbinde ein Detail mit der Grenze deiner Aussage.',
        ['Etwas Sichtbares genannt. Nur über die gezeigten Orte gesprochen.'],
        true,
      ),
    );
  return tasks;
}
function nature(p: ProfileId): Task[] {
  const calendar = (season: 0 | 1) =>
    focus(
      'nature',
      [
        `${seasons[season].name}: ein Kalender der typischen Jahreszeiten, keine gemessenen Monatsmengen.`,
        seasons[season].detail,
      ],
      natureWords,
      { season },
    );
  const gh = item(
    'nature.calendar.ghana',
    'Lies den Kalender für Nordghana.',
    [
      pick(
        'wet',
        'Wann ist es dort regenreicher?',
        'may-sep',
        [
          ['oct-apr', 'Oktober bis April'],
          ['may-sep', 'Mai bis September'],
        ],
        'Nordghana: Mai bis September laut Kalender.',
      ),
    ],
    calendar(0),
    'Lies die markierten Monate.',
    'Ordne die Monatsnamen den Regenzeichen zu.',
  );
  const ma = item(
    'nature.calendar.morocco',
    'Lies nun Nordwestmarokko.',
    [
      pick(
        'wet',
        'Wann ist es dort meist regenreicher?',
        'oct-apr',
        [
          ['oct-apr', 'Oktober bis April'],
          ['may-sep', 'Mai bis September'],
        ],
        'Nordwestmarokko: überwiegend Oktober bis April.',
      ),
    ],
    calendar(1),
    'Jetzt geht es um Nordwestmarokko.',
    'Vergleiche die Wintermonate mit den Sommermonaten.',
  );
  const water = focus(
    'nature',
    [
      'Ein erfundener Ort sammelt Regen in einem Speicher. In trockenen Monaten brauchen Pflanzen Wasser. Der Speicher hat begrenzt Platz.',
    ],
    natureWords,
    {
      steps: [
        'Wasser verdunstet',
        'Wolken entstehen',
        'Niederschlag fällt',
        'Wasser fließt ab oder geht in den Boden',
      ],
    },
  );
  const chain = item(
    'nature.use',
    'Verbinde Regen, Pflanzen und Nutzung.',
    [
      pick(
        'growth',
        'Was brauchen Pflanzen zum Wachsen?',
        'conditions',
        [
          ['conditions', 'Passende Bedingungen, zum Beispiel genug Wasser'],
          ['always', 'Nur Wärme, auch ohne Wasser'],
        ],
        'Pflanzen brauchen passende Bedingungen. Ein Kalender erzeugt keinen Regen.',
      ),
      pick(
        'limit',
        'Welches Problem kann es bei einem Speicher für Regenwasser geben?',
        'limited',
        [
          ['endless', 'Er liefert auch ohne neuen Regen dauerhaft Wasser.'],
          ['limited', 'Er kann leer werden. Nicht alle können ihn nutzen.'],
        ],
        'Platz, Wasserqualität und Zugang begrenzen die Nutzung.',
      ),
    ],
    water,
    'Was hilft Pflanzen beim Wachsen? Wie können Menschen das Regenwasser nutzen?',
    'Regen kann Wachstum ermöglichen. Speicherung und Zugang müssen aber funktionieren.',
  );
  const regions = focus(
    'nature',
    [
      'Zwei Regionen in Marokko. Die Werte zeigen den durchschnittlichen Niederschlag pro Jahr von 1991 bis 2020. mm bedeutet Millimeter. 1 mm Niederschlag entspricht einem Liter Wasser auf einem Quadratmeter Fläche. Die Werte gelten für die ganze Region, nicht für eine einzelne Wetterstation.',
    ],
    natureWords,
    {
      rows: [
        ['Region', 'Niederschlag pro Jahr'],
        ...rainRegions.map((r) => [
          r.name,
          r.mm.toLocaleString('de-DE') + ' mm',
        ]),
      ],
    },
  );
  const comparison = item(
    'nature.regions',
    'Achte auf die Einheit. Achte auf die Jahre. Erst dann vergleichst du die Zahlen.',
    [
      pick(
        'higher',
        'Welche Region hat den höheren Jahreswert?',
        'tanger',
        [
          ['souss', 'Souss-Massa'],
          ['tanger', 'Tanger-Tétouan-Al Hoceima'],
        ],
        '634,10 mm sind mehr als 205,15 mm.',
      ),
      pick(
        'access',
        'Beweist der Jahreswert genug Wasser für alle?',
        'no',
        [
          ['yes', 'Ja. Niederschlag ist immer nutzbares Trinkwasser.'],
          ['no', 'Nein. Saison, Qualität, Bedarf und Zugang fehlen.'],
        ],
        'Auch wenn in einer Region mehr Regen fällt, müssen nicht alle Menschen genug Wasser haben.',
      ),
    ],
    regions,
    'Für welche Region gelten die Zahlen? Was wird gemessen? Für welche Jahre gelten die Werte?',
    'Mehr Regen im Jahr bedeutet nicht, dass jeder Mensch mehr Wasser nutzen kann.',
  );
  const concepts = item(
    'nature.concepts',
    'Ordne Landschaft und Kreislauf ein.',
    [
      pick(
        'savanna',
        'Wo gibt es deutlich erkennbare Regenzeiten und Trockenzeiten?',
        'savanna',
        [
          ['savanna', 'Savanne'],
          ['rainforest', 'Immerfeuchter Regenwald ohne trockene Zeit'],
        ],
        'Savanne: Graslandschaft mit mehr oder weniger Bäumen und ausgeprägten Jahreszeiten.',
      ),
      pick(
        'cycle',
        'Wie kommt Wasser wieder in die Luft?',
        'evaporation',
        [
          ['evaporation', 'Verdunstung'],
          [
            'stop',
            'Nur neu fallender Regen bringt Wasser vom Boden in die Luft.',
          ],
        ],
        'Wasser kann verdunsten und später als Niederschlag fallen.',
      ),
    ],
    focus(
      'nature',
      [
        'Savanne: Graslandschaft mit mehr oder weniger Bäumen und Regen-/Trockenzeiten. Wüste: sehr wenig Regen. Sahel: trockener Übergangsraum südlich der Sahara. Tropischer Regenwald: sehr feucht, zum Beispiel Teile des Kongobeckens.',
      ],
      natureWords,
      { steps: ['Verdunstung', 'Wolken', 'Niederschlag', 'Boden und Abfluss'] },
    ),
    'Vergleiche die Jahreszeiten. Wie gelangt Wasser vom Boden in die Luft?',
    'Trenne die beiden Fragen: Welche Landschaft hat Regenzeiten und Trockenzeiten? Wie bewegt sich Wasser im Wasserkreislauf?',
  );
  const transfer = item(
    'nature.transfer',
    'Neue Bedingung: Der Speicher wird kleiner.',
    [
      pick(
        'duration',
        'Bei gleichem Bedarf reicht der volle kleinere Speicher …',
        'shorter',
        [
          ['longer', 'länger.'],
          ['shorter', 'kürzer.'],
        ],
        'Bei gleichem Bedarf ist ein kleinerer Vorrat schneller aufgebraucht.',
      ),
    ],
    water,
    'Bedarf und Zufluss bleiben hier gleich.',
    'Vergleiche die nutzbaren Vorräte, nicht die Größe einer ganzen Region.',
    [],
    true,
  );
  const result = [
    gh,
    ...(p === 'foerder' ? [] : [ma]),
    ...split(chain, p),
    ...(p === 'foerder' ? [] : split(comparison, p)),
    ...split(concepts, p),
    transfer,
  ];
  if (p === 'ahr')
    result.push(
      item(
        'nature.recommend',
        'Empfiehl eine Nutzung für ein gewähltes Gebiet.',
        [
          own(
            'explanation',
            'Nenne Gebiet und Sammelzeit. Welche zusätzliche Information brauchst du?',
            'In Nordghana kann man vor allem von Mai bis September sammeln. Für die Nutzung in der Trockenzeit brauche ich Angaben zu Speichergröße, Bedarf und Zugang.',
          ),
        ],
        calendar(0),
        'Wähle einen Raum und nutze seinen Kalender.',
        'Verbinde Jahreszeit und Nutzung. Ein fehlender Wert muss zu deiner Empfehlung passen.',
        [
          'Gebiet und passende Monate.',
          'Nutzung unter einer Bedingung erklärt.',
          'Konkrete fehlende Information.',
        ],
        true,
      ),
    );
  if (p === 'msa' || p === 'ahr')
    result.push(
      item(
        'nature.equal-total',
        'Zwei neue erfundene Orte: gleiche Jahresmenge, andere Saison.',
        [
          pick(
            'supply',
            'In B ist die Trockenzeit länger. Ist die Versorgung damit sicher gleich?',
            'no',
            [
              [
                'yes',
                'Ja. Gleiche Jahresmenge bedeutet immer gleiche Versorgung.',
              ],
              [
                'no',
                'Nein. Speicherung, Bedarf und Zugang können sich unterscheiden.',
              ],
            ],
            'Gleich viel Regen im Jahr bedeutet nicht, dass während einer Trockenzeit gleich viel Wasser verfügbar ist.',
          ),
        ],
        focus(
          'nature',
          [
            'Erfundener Vergleich: In A und B fällt über das Jahr gleich viel Regen. In B ist die Trockenzeit länger. Weitere Angaben fehlen.',
          ],
          natureWords,
        ),
        'In beiden Orten regnet es im Jahr gleich viel. Fällt der Regen aber in denselben Monaten?',
        'Gleich viel Wasser im Jahr ist nicht automatisch zur selben Zeit nutzbar.',
        [],
        true,
      ),
    );
  return result;
}
function economy(p: ProfileId): Task[] {
  const model = focus(
    'economy',
    [
      'Erfundene Betriebe, eine Runde. GE sind erfundene Geldeinheiten. Eine Anschaffung wird einmal bezahlt.',
    ],
    moneyWords,
    {
      rows: [
        ['Betrieb', 'Einnahmen', 'Laufende Ausgaben', 'Einmalig'],
        ['A', '200 GE', '120 GE', '0 GE'],
        ['B', '240 GE', '180 GE', '40 GE'],
      ],
    },
  );
  const calc = item(
    'economy.balance',
    'Prüfe den Überschuss und die Anschaffung.',
    p === 'foerder'
      ? [
          pick(
            'surplus',
            'Erklärte Rechnung: A bleiben 80 GE, B bleiben laufend 60 GE. Wer hat mehr übrig?',
            'a',
            [
              ['b', 'B'],
              ['a', 'A'],
            ],
            '80 GE sind mehr als 60 GE. Diese Teilrechnungen waren vorgegeben.',
          ),
          pick(
            'scope',
            'Ist der Überschuss von A das Einkommen aller Menschen Ghanas?',
            'no',
            [
              ['no', 'Nein. Es geht nur um diesen erfundenen Betrieb.'],
              ['yes', 'Ja. Alle bekommen genau 80 GE.'],
            ],
            'Ein Betrieb ist nicht die Wirtschaft des ganzen Landes.',
          ),
        ]
      : [
          number(
            'surplus-a',
            p === 'esa' ? '200 − 120 = (GE)' : 'Laufender Überschuss A (GE)',
            80,
            '200 − 120 = 80 GE.',
          ),
          number(
            'surplus-b',
            p === 'esa' ? '240 − 180 = (GE)' : 'Laufender Überschuss B (GE)',
            60,
            '240 − 180 = 60 GE.',
          ),
          number(
            'first',
            p === 'esa'
              ? '60 − 40 = nach einmaliger Anschaffung (GE)'
              : 'B: Wie viel Geld bleibt im eigenen Topf für Anschaffungen? (GE)',
            20,
            '60 − 40 = 20 GE. Die Anschaffung nicht doppelt abziehen.',
          ),
        ],
    model,
    'Ziehe laufende Ausgaben von Einnahmen ab.',
    'Rechne die einmalige Anschaffung erst nach dem laufenden Überschuss getrennt ab.',
  );
  const data = focus(
    'economy',
    [
      'Ghana, Quelle: Weltbank. Prozent bedeutet: von 100. Stromzugang zeigt: Wie viel Prozent der Menschen haben Zugang zu Strom? Das BIP beschreibt die wirtschaftliche Leistung eines Landes in einem Jahr. Die Wachstumsrate zeigt die Veränderung zum Vorjahr in Prozent. Preisänderungen sind herausgerechnet. Die Zahlen gelten für frühere Jahre. Sie sagen die Zukunft nicht voraus.',
    ],
    moneyWords,
    {
      rows: [
        ['Jahr', 'Stromzugang', 'BIP-Wachstum'],
        ...economyData
          .filter((r) => r.year >= 2022)
          .map((r) => [
            String(r.year),
            r.electricity.toLocaleString('de-DE') + ' %',
            r.gdp.toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' %',
          ]),
      ],
    },
  );
  const read = item(
    'economy.data',
    'Lies die Einheit und prüfe die Aussage.',
    [
      pick(
        'access',
        'Was bedeutet 89,5 Prozent Stromzugang im Jahr 2023?',
        'share',
        [
          [
            'reliable',
            'Der Strom fällt bei den angeschlossenen Haushalten nicht aus.',
          ],
          ['share', '89,5 von 100 Menschen haben Zugang zu Strom.'],
        ],
        'Die Zahl zum Strom zeigt nicht, wie oft er ausfällt oder wer ihn bezahlen kann.',
      ),
      pick(
        'growth',
        'Was sagt 3,1 Prozent BIP-Wachstum 2023?',
        'country',
        [
          [
            'country',
            'Das BIP ist höher als 2022. Preisänderungen sind herausgerechnet.',
          ],
          ['profit', 'Jeder Betrieb hat 3,1 GE Überschuss.'],
        ],
        'Das BIP zeigt den neu geschaffenen wirtschaftlichen Wert im ganzen Land. Es zeigt nicht den Überschuss eines Betriebs.',
      ),
    ],
    data,
    'Prüfe: Welche Größe wird gezählt?',
    'Anteil der Menschen, Änderung des BIP und Überschuss sind verschiedene Größen.',
  );
  const gepa = focus(
    'economy',
    [
      'GEPA fördert den Export in Ghana. Am 23.10.2024 berichtete GEPA über eine eigene Schulung. Die Teilnehmerinnen betrieben bereits Kakaoverarbeitung. Themen waren Preise, Transport und Verkaufsregeln.',
      'Stromzugang Ghana: 2022 85,1 %, 2023 89,5 %. Quelle: Weltbank. Die Angaben gelten für frühere Jahre.',
    ],
    moneyWords,
  );
  const links = item(
    'economy.conditions',
    'Was kann Verarbeitung unterstützen?',
    [
      pick(
        'pair',
        'Wie können Strom und Wissen dem Kakaobetrieb helfen?',
        'together',
        [
          ['machine', 'Eine Maschine garantiert Gewinn.'],
          [
            'together',
            'Zuverlässiger Strom und Wissen können zusammen helfen.',
          ],
        ],
        'Mit Strom können Maschinen arbeiten. Wissen kann bei der Verarbeitung und beim Verkauf helfen. Für Erfolg braucht der Betrieb noch mehr, zum Beispiel Käufer.',
      ),
      pick(
        'proof',
        'Beweisen Bericht und Tabelle einen sicheren Gewinn?',
        'no',
        [
          ['no', 'Nein. Dafür fehlen weitere Angaben.'],
          ['yes', 'Ja. Alle Teilnehmenden verdienen nun sicher mehr.'],
        ],
        'GEPA berichtet über eine eigene Schulung. Der Bericht zeigt nicht, ob die Betriebe später mehr Geld übrig haben.',
      ),
    ],
    gepa,
    'Unterscheide eine mögliche Hilfe von einem bewiesenen Erfolg.',
    'Prüfe, was GEPA tatsächlich berichtet und was der Stromanteil tatsächlich misst.',
  );
  const transfer = item(
    'economy.transfer',
    'Behauptung: Mehr Stromzugang bedeutet automatisch mehr Einkommen für alle.',
    [
      pick(
        'cause',
        'Mehr Menschen haben Zugang zu Strom. Verdienen deshalb automatisch alle mehr Geld?',
        'no',
        [
          ['yes', 'Ja. Mehr Stromzugang beweist mehr Einkommen für alle.'],
          ['no', 'Nein. Die Stromzahlen zeigen das Einkommen nicht.'],
        ],
        'Die Stromwerte zeigen, wie viele von 100 Menschen Zugang zu Strom haben. Sie zeigen nicht, wie viel Geld die Menschen verdienen. Sie beweisen nicht, dass die Menschen jetzt mehr verdienen.',
      ),
      pick(
        'distribution',
        'Welche Angaben fehlen zum Einkommen der Menschen?',
        'distribution',
        [
          [
            'distribution',
            'Angaben zu Einkommen, Verteilung und Lebensbedingungen',
          ],
          [
            'nothing',
            'Keine weiteren Angaben. Die Stromzahlen zeigen jedes Einkommen.',
          ],
        ],
        'Für die Aussage über alle Menschen fehlen Angaben dazu, wie viel Geld die einzelnen Menschen verdienen.',
      ),
    ],
    p === 'foerder' || p === 'esa'
      ? focus(
          'economy',
          [
            'Behauptung: In Ghana haben mehr Menschen Zugang zu Strom. Deshalb verdienen automatisch alle mehr Geld.',
            'Die Tabelle zeigt den Zugang zu Strom. Prozent heißt: von hundert. Quelle: Weltbank. Historische Angaben, keine Zahlen für heute.',
          ],
          [
            [
              'Zugang',
              'Ein Angebot erreichen oder nutzen können. Hier: Zugang zu Strom.',
            ],
            [
              'Verteilung',
              'Wie sich etwas auf verschiedene Menschen oder Gruppen verteilt.',
            ],
          ],
          {
            rows: [
              ['Jahr', 'Stromzugang'],
              ...economyData
                .filter((r) => r.year >= 2022)
                .map((r) => [
                  String(r.year),
                  r.electricity.toLocaleString('de-DE') + ' Prozent',
                ]),
            ],
          },
        )
      : {
          ...data,
          paragraphs: [
            ...data.paragraphs,
            'Behauptung: Mehr Stromzugang bedeutet automatisch mehr Einkommen für alle. Die gezeigte BIP-Wachstumsrate sinkt von rund 3,8 auf 3,1 Prozent, bleibt aber positiv. Das bedeutet hier weiterhin Wachstum des preisbereinigten BIP, nicht ein sinkendes BIP.',
          ],
        },
    'Was zeigen die Stromwerte? Lies die Einheit.',
    'Die Tabelle zeigt den Zugang zu Strom. Was Menschen verdienen, steht dort nicht. Dafür brauchst du Angaben zu ihrem Einkommen.',
    [],
    true,
  );
  if (p === 'foerder') {
    calc.fields[0].label = 'Welcher Betrieb hat mehr Geld übrig?';
    calc.fields[1].label =
      'Zeigt ein Betrieb, wie alle Menschen in Ghana leben?';
    calc.focus = {
      ...model,
      paragraphs: [
        'Erfundene Betriebe, eine Runde. Die Rechnungen sind hier schon erklärt. GE heißt Geldeinheiten.',
      ],
      rows: [
        ['Betrieb', 'Erklärter laufender Überschuss'],
        ['A', '200 − 120 = 80 GE'],
        ['B', '240 − 180 = 60 GE'],
      ],
    };
    calc.hints[0] =
      'Vergleiche die beiden Ergebnisse. Ein Betrieb ist nicht das ganze Land.';
    read.fields = read.fields.filter((f) => f.id === 'access');
    read.focus = {
      ...data,
      paragraphs: [
        'Ghana: Wie viele Menschen haben Zugang zu Strom? Prozent heißt: von hundert. Quelle: Weltbank. Die Zahlen gelten für frühere Jahre.',
      ],
      rows: [
        ['Jahr', 'Anteil mit Stromzugang'],
        ['2022', '85,1 Prozent'],
        ['2023', '89,5 Prozent'],
      ],
    };
    read.hints[0] = 'Es geht um den Zugang der Menschen zu Strom.';
  }
  const result = [
    ...split(calc, p),
    ...split(read, p),
    ...split(links, p),
    ...split(transfer, p),
  ];
  if (p === 'msa' || p === 'ahr')
    result.push(
      item(
        'economy.explain',
        p === 'ahr'
          ? 'Verbinde zwei Quellen und prüfe ihre Grenze.'
          : 'Erkläre eine mögliche Verbindung kurz selbst.',
        [
          own(
            'explanation',
            'Wie können Strom und Wissen helfen? Was ist damit noch nicht bewiesen?',
            'Mit zuverlässigem Strom können Maschinen arbeiten. Wissen über Preise und Transport kann beim Verkauf helfen. GEPA berichtet über die eigene Schulung. Der Bericht und die Stromwerte beweisen nicht, dass alle mehr Geld verdienen.',
          ),
        ],
        gepa,
        'Nenne zwei Bedingungen und ihren Zusammenhang.',
        'Was berichtet GEPA über die Schulung? Was zeigen die Weltbank-Daten zum Strom? Unterscheide: Was könnte helfen? Was belegen die Quellen wirklich?',
        [
          'Beide Materialien genutzt.',
          'Mögliche Verbindung konkret erklärt.',
          'Zugang nicht mit Zuverlässigkeit verwechselt.',
          'Kein garantierter Gewinn oder Wohlstand für alle.',
        ],
      ),
    );
  if (p === 'ahr')
    result.push(
      item(
        'economy.source-claim.v1',
        'Beweisen zwei Quellen einen heutigen Einkommensanstieg?',
        [
          own(
            'explanation',
            'Behauptung: „Weil in Ghana mehr Menschen Zugang zu Strom haben, verdienen die Teilnehmerinnen der GEPA-Schulung heute mehr Geld.“ Prüfe die Behauptung mit beiden Quellen. Welche zusätzliche Information brauchst du?',
            'Die Stromreihe zeigt den Zugang zu Strom 2022 und 2023. GEPA berichtet 2024 über die eigene Schulung. Beide Quellen zeigen nicht, was die Teilnehmerinnen heute verdienen. Ich brauche vergleichbare Angaben zu ihrem Einkommen vor und nach der Schulung. Ich muss auch andere mögliche Ursachen prüfen. Selbst wenn die Einkommen gestiegen sind, muss die Schulung nicht die Ursache sein.',
          ),
        ],
        focus(
          'economy',
          [
            'Quelle 1: Weltbank, Ghana. 2022: 85,1 Prozent mit Stromzugang. 2023: 89,5 Prozent. Die Werte geben den Anteil der Bevölkerung mit Stromzugang an.',
            'Quelle 2: GEPA berichtet am 23.10.2024 über eine eigene Schulung. Die Teilnehmerinnen führten bereits Kakaoverarbeitungsbetriebe. In der Schulung ging es um Preise, Transport und Regeln für den Verkauf ins Ausland.',
          ],
          [
            ['Quelle', 'Herkunft einer Information.'],
            ['Ursache', 'Etwas, das eine Veränderung bewirkt.'],
            [
              'Einkommen',
              'Geld, das Menschen erhalten; hier nicht in den Quellen gemessen.',
            ],
          ],
        ),
        'Lies beide Quellen einzeln. Was zeigt die erste Quelle? Was berichtet die zweite? Was kannst du daraus nicht sicher schließen?',
        'Wessen Einkommen wird behauptet? Für welche Jahre gelten die Quellen? Was wurde gemessen? Welche Angabe zum Einkommen fehlt?',
        [
          'Du nennst richtig: Wie viel Prozent haben Zugang zu Strom? Für welche Jahre gelten die Angaben?',
          'Du erklärst: GEPA berichtet über die eigene Schulung. Der Bericht untersucht nicht, wie viel Geld die Teilnehmerinnen verdienen.',
          'Die behauptete Ursache-Wirkung ist durch diese Quellen nicht bewiesen.',
          'Genannt, welche Einkommensdaten der Teilnehmerinnen fehlen. Auch andere mögliche Ursachen genannt.',
        ],
        true,
      ),
    );
  return result;
}
export function futureReference(
  task: Task,
  records: Record<string, { answers: Record<string, string> }>,
): Task {
  if (!task.reference) return task;
  const plan = records['future.plan']?.answers.plan;
  if (plan !== 'cool' && plan !== 'shade')
    return {
      ...task,
      fields: task.fields.map((f) => ({ ...f, expected: '__missing_plan__' })),
    };
  const selected = plans[plan];
  const goal = records['future.goal']?.answers.goal;
  return {
    ...task,
    contextPlan: plan,
    contextGoal: goal,
    focus:
      task.reduced && task.focus
        ? {
            ...task.focus,
            paragraphs:
              task.id === 'future.weight'
                ? [
                    'Kühlung kann empfindliche Lebensmittel schützen. Beim Kühlraum haben 30 Stände Zugang. Dächer und Kisten erreichen 60 Stände, kühlen empfindliche Ware aber nicht genug.',
                  ]
                : [
                    'Dein gewähltes Angebot: ' + selected.name,
                    task.id === 'future.evidence'
                      ? selected.benefit
                      : selected.limit,
                  ],
            rows: undefined,
          }
        : task.focus,
    contextNote: `Dein Vorschlag: ${selected.name}. Zuerst gewähltes Ziel: ${goal === 'loss' ? 'empfindliche Lebensmittel schützen' : goal === 'access' ? 'vielen Ständen Zugang geben' : 'noch offen'}.`,
    fields: task.fields.map((f) => {
      if (f.id === 'weight')
        return {
          ...f,
          expected: 'either',
          options: task.simpleLanguage
            ? [
                [
                  'adapt',
                  `Ich wähle diesen Plan. Mir ist wichtig: ${plan === 'cool' ? 'empfindliche Waren kühlen' : 'Zugang für 60 Stände'}. Dafür nehme ich in Kauf: ${plan === 'cool' ? 'nur 30 statt 60 Stände und Strombedarf' : 'weniger Schutz für empfindliche Waren'}.`,
                ],
                [
                  'tradeoff',
                  `Mein erstes Ziel bleibt wichtig. Trotzdem ist mir hier ${plan === 'cool' ? 'die Kühlung' : 'der Zugang für 60 Stände'} wichtiger. Dafür akzeptiere ich ${plan === 'cool' ? 'nur 30 statt 60 Stände und Strombedarf' : 'weniger Kühlung empfindlicher Waren'}.`,
                ],
              ]
            : ([
                [
                  'adapt',
                  `Ich passe mein Ziel an: ${plan === 'cool' ? 'Kühlung' : 'Zugang für 60 Stände'} ist mir wichtiger. Dafür akzeptiere ich ${plan === 'cool' ? 'nur 30 nutzende Stände und Strombedarf' : 'die geringere Kühlung empfindlicher Ware'}.`,
                ],
                [
                  'tradeoff',
                  `Mein erstes Ziel bleibt wichtig. Trotzdem ist mir hier ${plan === 'cool' ? 'die Kühlung wichtiger. Dafür akzeptiere ich, dass nur 30 statt 60 Stände das Angebot nutzen' : 'der Zugang für 60 Stände wichtiger. Dafür akzeptiere ich, dass empfindliche Waren weniger gut gekühlt werden'}.`,
                ],
              ] as const),
        };
      return {
        ...f,
        expected: f.expected === 'linked' ? plan : f.expected,
        explanation:
          f.expected === 'linked'
            ? f.id === 'evidence'
              ? selected.benefit
              : selected.limit
            : f.explanation,
        example:
          f.kind === 'text'
            ? `Ich empfehle ${selected.name}, weil ${selected.benefit} Ich akzeptiere: ${selected.limit}`
            : f.example,
      };
    }),
  };
}
function future(p: ProfileId): Task[] {
  const offer = (
    section: 'stands' | 'investment' | 'running' | 'ecology' | 'all',
  ) =>
    focus(
      'future',
      [
        'Erfundene Angebote für einen Markt in Kumasi. Kumasi ist real. GE und Folgen sind erfunden.',
      ],
      futureWords,
      {
        rows:
          section === 'all'
            ? [
                ['Angebot', 'Einmalig', 'Monatlich', 'Stände'],
                ...Object.values(plans).map((x) => [
                  x.name,
                  x.investment + ' GE',
                  x.running + ' GE',
                  String(x.stands),
                ]),
              ]
            : [
                [
                  'Angebot',
                  section === 'stands'
                    ? 'Nutzende Stände'
                    : section === 'investment'
                      ? 'Einmalige Anschaffung'
                      : section === 'running'
                        ? 'Kosten pro Monat'
                        : 'Umwelt',
                ],
                ...Object.values(plans).map((x) => [
                  x.name,
                  section === 'ecology'
                    ? x.ecology
                    : String(x[section]) +
                      (section === 'stands' ? ' Stände' : ' GE'),
                ]),
              ],
      },
    );
  const facts = [
    item(
      'future.reach',
      'Wer kann das Angebot nutzen?',
      [
        pick(
          'reach',
          'Welches Angebot erreicht mehr Stände?',
          'shade',
          [
            ['cool', 'Kühlraum'],
            ['shade', 'Dächer und Kisten'],
          ],
          '60 Stände sind mehr als 30 Stände.',
        ),
      ],
      offer('stands'),
      'Vergleiche die Zahl der Stände.',
      'Es geht um Stände, nicht um die Einwohnerzahl von Kumasi.',
    ),
    item(
      'future.investment',
      'Was kostet am Anfang weniger?',
      [
        pick(
          'investment',
          'Welche Anschaffung ist günstiger?',
          'shade',
          [
            ['shade', 'Dächer und Kisten'],
            ['cool', 'Kühlraum'],
          ],
          '30 GE sind weniger als 80 GE.',
        ),
      ],
      offer('investment'),
      'Vergleiche nur die einmaligen Kosten.',
      'Monatliche Kosten werden getrennt verglichen.',
    ),
    item(
      'future.running',
      'Was kostet immer wieder Geld?',
      [
        pick(
          'running',
          'Für welche Angebote fallen monatliche Kosten an?',
          'both',
          [
            ['cool', 'Nur für den Kühlraum'],
            ['both', 'Für beide Angebote'],
          ],
          '12 GE beziehungsweise 3 GE werden jeden Monat fällig.',
        ),
      ],
      offer('running'),
      'Lies die Zeile pro Monat.',
      'Einmalige Anschaffung und monatliche Kosten sind verschiedene Zeitbezüge.',
    ),
    item(
      'future.ecology',
      'Prüfe Umwelt und Kühlung.',
      [
        pick(
          'energy',
          'Welches Angebot braucht Strom für aktive Kühlung?',
          'cool',
          [
            ['shade', 'Dächer und Kisten'],
            ['cool', 'Kühlraum'],
          ],
          'Aktive Kühlung braucht Energie.',
        ),
        pick(
          'materials',
          'Sind Dächer und Kisten ohne Umweltfolgen?',
          'no',
          [
            [
              'no',
              'Nein. Herstellung, Reinigung und Ersatz brauchen Ressourcen.',
            ],
            ['yes', 'Ja. Sie brauchen gar kein Material.'],
          ],
          'Auch ohne aktive Kühlung gibt es Material- und Reinigungsbedarf.',
        ),
      ],
      offer('ecology'),
      'Prüfe Energie und Material getrennt.',
      'Mit diesen wenigen Angaben kennen wir noch nicht alle Folgen für die Umwelt.',
    ),
  ];
  const material = offer('all');
  material.paragraphs.push(
    ...Object.values(plans).map(
      (x) => `${x.name}: ${x.benefit} Grenze: ${x.limit}`,
    ),
  );
  const goal = item(
    'future.goal',
    'Was ist dir zuerst besonders wichtig?',
    [
      pick(
        'goal',
        'Dein zuerst gewähltes Ziel',
        'either',
        [
          ['loss', 'Empfindliche Lebensmittel schützen'],
          ['access', 'Möglichst vielen Ständen Zugang geben'],
        ],
        'Beide Ziele sind möglich. Du kannst später ein anderes Ziel wichtiger finden.',
      ),
    ],
    material,
    'Du darfst selbst wählen, was dir wichtiger ist.',
    'Kühlung und breiter Zugang sind verschiedene Vorteile.',
  );
  const plan = item(
    'future.plan',
    'Welchen Plan empfiehlst du?',
    [
      pick(
        'plan',
        'Dein Vorschlag',
        'either',
        [
          ['cool', 'Kühlraum'],
          ['shade', 'Dächer und Kisten'],
        ],
        'Du darfst beide Vorschläge wählen. Die Angaben und das genannte Problem müssen zu deiner Wahl passen.',
      ),
    ],
    material,
    'Vergleiche beide Angebote.',
    'Du darfst selbst wählen. Die Angabe aus dem Material muss zu deiner Wahl passen.',
  );
  const evidence = item(
    'future.evidence',
    'Welche Angabe aus dem Material passt zu deinem Vorschlag?',
    [
      pick(
        'evidence',
        'Wähle eine passende Folge.',
        'linked',
        [
          ['shade', plans.shade.benefit],
          ['guarantee', 'Der Plan garantiert Gewinn für alle.'],
          ['cool', plans.cool.benefit],
        ],
        'Der Beleg muss zum gewählten Angebot gehören.',
      ),
    ],
    material,
    'Achte auf den Namen deines Vorschlags.',
    'Kühlung schützt empfindliche Ware; Dächer und Kisten erreichen 60 Stände.',
  );
  evidence.reference = true;
  const limit = item(
    'future.limit',
    'Welcher Nachteil bleibt bei deinem Vorschlag?',
    [
      pick(
        'limit',
        'Wähle eine passende Grenze.',
        'linked',
        [
          ['cool', plans.cool.limit],
          ['shade', plans.shade.limit],
          ['none', 'Kein Nachteil bleibt.'],
        ],
        'Die Grenze muss den gewählten Plan betreffen.',
      ),
    ],
    material,
    'Eine Wahl kann zugleich einen Vorteil und einen Nachteil haben.',
    'Was wird gekühlt? Wer kann das Angebot nutzen? Wie viel Material und Energie braucht es?',
  );
  limit.reference = true;
  const weighting = item(
    'future.weight',
    'Verbinde deine Wahl mit deinem Ziel.',
    [
      pick(
        'weight',
        'Was ist dir bei deinem Plan am wichtigsten?',
        'either',
        [
          [
            'cool',
            'Kühlung ist mir wichtiger. Dafür akzeptiere ich nur 30 nutzende Stände und Strombedarf.',
          ],
          [
            'shade',
            'Zugang für 60 Stände ist mir wichtiger. Dafür akzeptiere ich die geringere Kühlung empfindlicher Ware.',
          ],
        ],
        'Welcher Vorteil ist dir wichtiger? Welchen Nachteil nimmst du dafür in Kauf?',
      ),
    ],
    material,
    'Dein erstes Ziel darf sich ändern.',
    'Sage, welche Folge dir wichtiger ist. Nenne auch den Nachteil, den du dafür in Kauf nimmst.',
  );
  weighting.reference = true;
  // The weighting must actually refer to the current proposal, even when the earlier goal differs.
  weighting.fields[0].expected = 'linked';
  weighting.fields[0].id = 'weight';
  const maintenance = focus(
    'future',
    [
      'Neue Information: Bei beiden Angeboten ist noch unklar, wer prüft und pflegt. Auch Dächer und Kisten müssen gereinigt und repariert werden.',
    ],
    futureWords,
  );
  const uncertainty = item(
    'future.uncertainty',
    'Was musst du noch klären?',
    [
      pick(
        'question',
        'Welche Frage hilft bei beiden Plänen?',
        'maintenance',
        [
          ['colour', 'Wie viele Stände kann der Kühlraum aufnehmen?'],
          ['maintenance', 'Wer prüft, pflegt und repariert? Wer bezahlt das?'],
        ],
        'Bei beiden Angeboten ist offen: Wer prüft, pflegt und repariert die Anlage?',
      ),
    ],
    maintenance,
    'Wer soll später den Kühlraum, die Dächer oder die Kisten prüfen und reparieren?',
    'Auch nach einem Planwechsel musst du klären, wer später prüft und repariert.',
    [],
    true,
  );
  const revision = item(
    'future.revision',
    'Behalten oder ändern – unter einer Bedingung.',
    [
      pick(
        'revision',
        'Du weißt jetzt nicht, wer später repariert. Bleibst du bei deinem Plan oder änderst du ihn?',
        'either',
        [
          [
            'keep',
            'Ich behalte meinen Plan, wenn Pflege und Bezahlung geklärt werden.',
          ],
          [
            'change',
            'Ich möchte den anderen Plan prüfen. Auch dort muss die Pflege geklärt werden.',
          ],
        ],
        'Beide Wege sind möglich. Bei einer Änderung müssen die neuen Belege geprüft werden.',
      ),
    ],
    maintenance,
    'Beibehalten und neu prüfen sind beide möglich.',
    'Ein ungeklärtes Problem macht nicht automatisch den anderen Plan besser.',
    [],
    true,
  );
  const result = [
    ...facts.flatMap((t) => split(t, p)),
    goal,
    plan,
    evidence,
    limit,
    weighting,
    uncertainty,
    revision,
  ];
  if (p === 'msa' || p === 'ahr') {
    const judgment = item(
      'future.judgment',
      'Was ist dir wichtiger? Warum?',
      [
        own(
          'explanation',
          'Welche Folge ist dir wichtiger? Welchen Nachteil akzeptierst du?',
          '',
        ),
      ],
      material,
      'Nenne eine passende Angabe. Warum ist dir diese Folge wichtiger?',
      'Mir ist … wichtiger. Dafür nehme ich … in Kauf.',
      [
        'Beleg und Grenze passen zum aktuellen Vorschlag.',
        'Konkrete wichtigere Folge benannt.',
        'Einmalige und monatliche Kosten getrennt.',
      ],
    );
    judgment.reference = true;
    result.splice(result.length - 2, 0, judgment);
  }
  if (p === 'ahr')
    result.push(
      item(
        'future.relation',
        'Wie hängen die Folgen zusammen? Welche wichtigen Angaben fehlen noch?',
        [
          own(
            'explanation',
            'Wie können zwei Folgen zusammenhängen? Welche Information könnte dein Urteil ändern?',
            'Laufende Kosten müssen regelmäßig bezahlt werden. Ich muss wissen: Wer bezahlt die Kosten? Wer prüft, pflegt und repariert die Anlage? Sonst weiß ich nicht, wie lange die Menschen das Angebot nutzen können. Die Angaben zeigen auch nicht alle Folgen für die Umwelt.',
          ),
        ],
        maintenance,
        'Verbinde zwei Folgen statt sie nur aufzuzählen.',
        'Wenn …, dann kann … gelten. Benenne eine dazu passende fehlende Angabe.',
        [
          'Du erklärst, wie die Folgen zusammenhängen können. Du behauptest nicht, dass diese Wirkung sicher eintritt.',
          'Konkrete fehlende Information.',
          'Beibehalten und Ändern sachlich begründet möglich.',
        ],
        true,
      ),
    );
  if (p === 'foerder')
    for (const t of result) if (t.reference) t.reduced = true;
  return result;
}
export function topicTasks(unit: TopicUnit, p: ProfileId): Task[] {
  return unit === 'a'
    ? images(p)
    : unit === 'n'
      ? nature(p)
      : unit === 'd'
        ? economy(p)
        : future(p);
}
