import type { Task } from './tasks.ts';
import type { ProfileId } from './profiles.ts';
import { step, pick, own, differentiated } from './simulation-variants.ts';
import { transferTasks } from '../geography/transfer.ts';
const countries = [
  ['GHA', 'Ghana'],
  ['KEN', 'Kenia'],
  ['MAR', 'Marokko'],
] as const;
export function orientationTasks(p: ProfileId): Task[] {
  const ts: Task[] = [];
  for (const [code, name, city] of [
    ['GHA', 'Ghana', 'Kumasi'],
    ['KEN', 'Kenia', 'Nairobi'],
    ['MAR', 'Marokko', 'Agadir'],
  ] as const) {
    ts.push(
      step(
        'orientation.country.' + code,
        `Finde ${name} auf der Karte`,
        'orientation',
        [
          pick(
            'country',
            `Tippe ${name} an. Die Tasten unter der Karte bieten dieselbe Auswahl.`,
            code,
            countries,
            `${name} ist ein Land. ${city} ist eine Stadt darin.`,
          ),
        ],
        code === 'MAR'
          ? 'Suche im Norden Afrikas.'
          : code === 'GHA'
            ? 'Suche im Westen Afrikas.'
            : 'Suche im Osten Afrikas.',
        [],
        { simulation: { kind: 'orientation', preset: code, required: [code] } },
      ),
    );
    if (p === 'foerder' || p === 'esa')
      ts.push(
        step(
          'orientation.city.' + code,
          `${city}: Stadt oder Land?`,
          'orientation',
          [
            pick(
              'city',
              `Was ist ${city}?`,
              'city',
              [
                ['country', 'Ein Land'],
                ['city', `Eine Stadt in ${name}`],
              ],
              `${city} liegt in ${name}.`,
            ),
          ],
          'Das Punktsymbol steht für eine Stadt.',
          [],
          { simulation: { kind: 'orientation', preset: code } },
        ),
      );
  }
  if (p !== 'foerder')
    ts.push(
      step(
        'orientation.equator',
        'Lagebeziehungen untersuchen',
        'orientation',
        [
          pick(
            'south',
            'Welche Stadt liegt südlich des Äquators?',
            'Nairobi',
            [
              ['Kumasi', 'Kumasi'],
              ['Nairobi', 'Nairobi'],
              ['Agadir', 'Agadir'],
            ],
            'Nairobi liegt knapp südlich des Äquators.',
          ),
          pick(
            'north',
            'Was liegt weiter nördlich: Marokko oder Ghana?',
            'MAR',
            [
              ['GHA', 'Ghana'],
              ['MAR', 'Marokko'],
            ],
            'Marokko liegt weiter nördlich als Ghana.',
          ),
        ],
        'Nutze Nordpfeil und Äquatorlinie.',
      ),
    );
  ts.push(
    step(
      'orientation.scope',
      'Was zeigt diese Übersicht nicht?',
      'orientation',
      [
        pick(
          'limit',
          'Kannst du daraus eine genaue Busfahrzeit ablesen?',
          'no',
          [
            ['yes', 'Ja'],
            ['no', 'Nein'],
          ],
          'Eine Übersichtskarte enthält keinen Fahrplan und keine Modellbuszeiten.',
        ),
      ],
      'Prüfe Maßstab und dargestellte Informationen.',
    ),
  );
  if (p === 'ahr')
    ts.push(
      step(
        'orientation.describe',
        'Beschreibe zwei Orte kurz selbst',
        'orientation',
        [
          own(
            'Wähle zwei Städte. Beschreibe ihre Lage zueinander und zum Äquator. Welche Genauigkeitsgrenze bleibt?',
            'Agadir liegt nördlicher als Nairobi. Nairobi liegt südlich des Äquators, Agadir nördlich. Eine genaue Reisezeit folgt aus der vereinfachten Übersicht nicht.',
          ),
        ],
        'Verbinde Nordrichtung, Äquator und Darstellungsgrenze.',
        [
          'Zwei tatsächlich markierte Städte gewählt.',
          'Lagebeziehung und Äquatorbezug passen.',
          'Keine genaue Strecke oder Fahrzeit aus der Übersicht behauptet.',
        ],
      ),
    );
  return differentiated(ts, p);
}
export function reviewTasks(p: ProfileId): Task[] {
  const ts: Task[] = [];
  for (const [i, code] of (['KEN', 'GHA', 'MAR'] as const).entries()) {
    const t = transferTasks[code];
    const choices: readonly (readonly [string, string])[] = [
      ['model', t.choices[0]],
      ['general', t.choices[1]],
    ];
    ts.push(
      step(
        'review.' + code,
        `${code === 'KEN' ? 'Kenia' : code === 'GHA' ? 'Ghana' : 'Marokko'}: Beleg und Reichweite`,
        'review',
        [
          pick(
            'claim',
            'Welche Aussage passt zum gezeigten Modell?',
            'model',
            i === 1 ? choices : [...choices].reverse(),
            t.explanation,
          ),
          pick(
            'scope',
            'Gilt dieses Modell für alle Menschen und Betriebe im Land?',
            'local',
            [
              ['all', 'Ja, für das ganze Land.'],
              ['local', 'Nein, nur für den erfundenen Fall.'],
            ],
            t.scope,
          ),
        ],
        t.hint,
        [],
        { simulation: { kind: 'review', preset: code } },
      ),
    );
  }
  ts.push(
    step(
      'review.common',
      'Drei Länder, verschiedene Interessen',
      'review',
      [
        pick(
          'consequences',
          'Welche gemeinsame Erkenntnis tragen die Fälle?',
          'different',
          [
            ['same', 'Eine Maßnahme hilft allen gleich.'],
            [
              'different',
              'Dieselbe Maßnahme kann unterschiedliche Folgen haben.',
            ],
          ],
          'Kürzere Wege, Überschuss und Wasser haben verschiedene Nutznießer und Grenzen.',
        ),
        pick(
          'weigh',
          'Wie begründest du eine Wahl?',
          'evidence',
          [
            [
              'evidence',
              'Passender Beleg und Nachteil, dann die wichtigere Folge.',
            ],
            ['automatic', 'Immer die erste angebotene Maßnahme wählen.'],
          ],
          'Die persönliche Wahl ist offen; die Sachbelege müssen zu ihr passen.',
        ),
      ],
      'Vergleiche Nutzen und verbleibendes Problem in jedem Fall.',
    ),
  );
  ts.push(
    step(
      'review.transfer',
      'Ein neues erfundenes Beispiel',
      'review',
      [
        pick(
          'claim',
          'Ein Betrieb hat höhere Einnahmen und noch stärker gestiegene Ausgaben. Ist deshalb mehr Überschuss sicher?',
          'no',
          [
            ['yes', 'Ja'],
            ['no', 'Nein'],
          ],
          'Laufender Überschuss ist Einnahmen minus laufende Ausgaben. Größere Einnahmen allein genügen nicht.',
        ),
      ],
      'Übertrage das Verfahren statt eine alte Zahl zu kopieren.',
    ),
  );
  ts.push(
    step(
      'review.revision',
      'Dein Afrikabild erneut betrachten',
      'review',
      p === 'foerder' || p === 'esa'
        ? [
            pick(
              'revision',
              'Was würdest du über Afrika sagen?',
              'varied',
              [
                ['same', 'Ein Foto oder Betrieb zeigt überall dasselbe.'],
                [
                  'varied',
                  'Unterschiedliche Orte und Menschen brauchen genaue Belege.',
                ],
              ],
              'Einzelne Modelle stehen nicht für den ganzen Kontinent.',
            ),
          ]
        : [
            own(
              'Nenne einen konkreten Beleg aus einem Fall. Wie begrenzt er eine pauschale Aussage über Afrika?',
              'Im Kenia-Modell hilft Nord Amina, aber David braucht länger. Das erklärt einen erfundenen Wegkonflikt und nicht alle Verkehrsverhältnisse Nairobis oder Afrikas.',
            ),
          ],
      'Nutze einen konkreten Fall und begrenze seine Reichweite.',
      [
        'Konkreter Beleg statt pauschaler Behauptung.',
        'Modell und wirklicher Raum getrennt.',
        'Offene eigene Erklärung braucht noch menschliche Rückmeldung.',
      ],
    ),
  );
  if (p === 'ahr')
    ts.push(
      step(
        'review.cause',
        'Von der Modellwirkung zur echten Entscheidung',
        'review',
        [
          own(
            'Verbinde zwei der Fälle. Welche gemeinsame Bedingung oder Unsicherheit erkennst du? Welche reale Information brauchst du jeweils?',
            'Mehr Technik kann die Einnahmen oder den Bedarf pro Feld verändern. Absatz beziehungsweise zusätzliche Flächennutzung beeinflussen aber das Gesamtergebnis. Ich brauche echte Kosten und Nachfrage beziehungsweise Fläche, Zufluss und Rückflüsse. Eine Klickentscheidung weist noch keine reale Wirkung nach.',
          ),
        ],
        'Unterscheide Mechanismus, Gesamtwirkung und fehlende Daten.',
        [
          'Zwei Fälle sachlich korrekt verbunden.',
          'Bedingung oder konkurrierendes Interesse konkret erklärt.',
          'Relevante reale Zusatzinformation je Fall.',
        ],
      ),
    );
  return differentiated(ts, p);
}
