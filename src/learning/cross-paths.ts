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
        'Wo liegen die Orte?',
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
      'Was zeigt die Karte? Welche Angaben fehlen?',
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
            'Wähle zwei Städte. Welche liegt weiter nördlich? Wo liegen sie zum Äquator? Was zeigt die Karte nicht genau?',
            'Agadir liegt nördlicher als Nairobi. Nairobi liegt südlich des Äquators, Agadir nördlich. Eine genaue Reisezeit folgt aus der vereinfachten Übersicht nicht.',
          ),
        ],
        'Nutze den Nordpfeil und den Äquator. Was zeigt die Karte nicht genau?',
        [
          'Du wählst zwei Städte, die auf der Karte eingezeichnet sind.',
          'Du beschreibst richtig, welche Stadt weiter nördlich liegt. Du nennst die Lage zum Äquator.',
          'Du behauptest nicht, dass die Karte genaue Strecken oder Fahrzeiten zeigt.',
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
        `${code === 'KEN' ? 'Kenia' : code === 'GHA' ? 'Ghana' : 'Marokko'}: Was zeigt das Beispiel?`,
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
            code === 'KEN'
              ? 'Zeigen die drei Buswege, wie lange alle Menschen in Kenia unterwegs sind?'
              : code === 'GHA'
                ? 'Sind alle Betriebe in Ghana wie unser erfundener Betrieb?'
                : 'Zeigt unser erfundener Tank, wie viel Wasser es in Marokko wirklich gibt?',
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
          'Was zeigen die drei Beispiele gemeinsam?',
          'different',
          [
            ['same', 'Eine Maßnahme hilft allen gleich.'],
            [
              'different',
              'Dieselbe Maßnahme kann unterschiedliche Folgen haben.',
            ],
          ],
          'Ein kürzerer Weg, mehr Geld oder mehr Wasser hilft nicht allen gleich. Bei jedem Vorschlag bleiben Probleme.',
        ),
        pick(
          'weigh',
          'Wie begründest du eine Wahl?',
          'evidence',
          [
            [
              'evidence',
              'Eine passende Angabe und einen Nachteil nennen. Sagen, welche Folge wichtiger ist.',
            ],
            [
              'automatic',
              'Den Vorteil nennen. Ein Nachteil gehört nicht zur Begründung.',
            ],
          ],
          'Du darfst selbst wählen. Die Angaben aus dem Material müssen zu deiner Wahl passen.',
        ),
      ],
      'Was wird bei jedem Vorschlag besser? Welches Problem bleibt?',
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
      'Nutze die neuen Angaben. Vergleiche wieder Einnahmen und Ausgaben.',
    ),
  );
  ts.push(
    step(
      'review.revision',
      'Was denkst du jetzt über Afrika?',
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
              'Nenne eine Angabe aus einem Beispiel. Warum gilt die Angabe nicht für ganz Afrika?',
              'Im Kenia-Modell hilft Nord Amina, aber David braucht länger. Das erklärt einen erfundenen Wegkonflikt und nicht alle Verkehrsverhältnisse Nairobis oder Afrikas.',
            ),
          ],
      'Nutze ein Beispiel. Sage auch, für wen und für welchen Ort es gilt.',
      [
        'Du nennst eine passende Angabe. Du sagst nicht, dass es überall so ist.',
        'Modell und wirklicher Raum getrennt.',
        'Deine eigene Erklärung muss noch mit jemandem besprochen werden.',
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
            'Mit neuer Technik kann ein Betrieb mehr Geld einnehmen. Ein Feld kann weniger Wasser brauchen. Entscheidend ist aber auch: Wie viel verkauft der Betrieb? Wie viele Felder werden bewässert? Ich brauche echte Angaben zu Kosten und Käufern. Beim Wasser brauche ich Angaben zu Flächen, Zufluss und Wasser, das zurückfließt. Eine Entscheidung im Spiel beweist noch keine Wirkung in der Wirklichkeit.',
          ),
        ],
        'Wie wirkt die Maßnahme? Was ändert sich insgesamt? Welche Angaben fehlen dir noch?',
        [
          'Zwei Fälle sachlich korrekt verbunden.',
          'Du erklärst eine Bedingung oder ein anderes Interesse.',
          'Du nennst für jeden Fall eine fehlende Angabe aus der Wirklichkeit.',
        ],
      ),
    );
  return differentiated(ts, p);
}
