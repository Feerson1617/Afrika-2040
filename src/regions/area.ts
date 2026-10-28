import { answerOrder } from './answer-order.ts';
import { result } from '../feedback.ts';
import type { StudyData, StudySpec } from './types.ts';
import {
  emptyData,
  validData,
  parts,
  control,
  choice,
  svgChoice,
} from './shared.ts';
import { waterBalance, tankGraphic } from './water-model.ts';
export function areaModel(id: string) {
  const extra = id === 'extra' ? 20 : 0,
    first = id === 'base' ? 60 : 45;
  return { ...waterBalance(first + extra), first, extra };
}
const both = (d: StudyData) =>
  ['same', 'extra'].every((k) => d.checked.includes(k));
const cause =
  'Eine Fläche braucht weniger Wasser. Es werden aber mehr Flächen bewässert. Deshalb wird hier insgesamt mehr Wasser entnommen: 45 + 20 = 65 statt früher 60 WE.';
const explain = (id: string) => {
  const m = areaModel(id);
  return `${m.first} WE für das erste Feld + ${m.extra} WE für das Zusatzfeld = ${m.withdrawal} WE insgesamt. 80 − ${m.withdrawal} = ${m.remaining} WE bleiben im Tank.`;
};
export const area: StudySpec = {
  id: 'area',
  number: 6,
  country: 'Marokko',
  place: 'bei Agadir',
  title: 'Gespartes Wasser – wirklich gespart?',
  question:
    'Warum kann die gesamte Entnahme trotz sparsamerer Bewässerung steigen?',
  intro:
    'Marokko liegt in Nordafrika. Ein erfundener Betrieb bei Agadir plant eine neue Runde. Verbesserte Technik ist bereits verfügbar. Du entscheidest, ob ein kleineres Zusatzfeld bewässert wird.',
  modelNote:
    'Unabhängige Modellrunde, keine Voraussetzung aus Episode 5. 80 erfundene WE im Tank; kein Zufluss, keine Rückflüsse oder Grundwasserdynamik berechnet. Früher: gleiches erstes Feld mit 60 WE Entnahme. Mit verbesserter Technik: 45 WE für genau dieses Feld. Das kleinere Zusatzfeld benötigt im Modell weitere 20 WE; kein Verdoppeln gleich großer Flächen. Gesamt 45 + 20 = 65 WE. Die Flächensymbole sind schematisch, ohne Hektarangabe oder Maßstab. WE sind keine realen Messwerte Marokkos. Tankrest ist kein Grundwasser. Zusätzlicher Anbau kann wirtschaftliche Möglichkeiten bieten; Einkommen, Arbeitsplätze und Ernten sind nicht garantiert. Entnahme ist nicht mit Verbrauch gleichzusetzen; Verbrauch wird hier nicht berechnet.',
  goals: {
    save: 'Insgesamt weniger Wasser entnehmen.',
    area: 'Eine zusätzliche Fläche bewässern können.',
  },
  terms: [
    [
      [
        'Gleiche Fläche',
        'Wir vergleichen dasselbe erste Feld vor und nach dem Technikwechsel.',
      ],
      ['Einsparung', 'Die Differenz: 60 − 45 = 15 WE weniger für dieses Feld.'],
    ],
    [
      [
        'Gesamtentnahme',
        'Alles zusammen, was für beide Felder aus dem Tank genommen wird.',
      ],
      [
        'Zusatzfläche',
        'Ein weiteres, hier kleineres Feld. Auch dafür wird Wasser entnommen.',
      ],
    ],
  ],
  initial() {
    const d = emptyData();
    d.explored = ['base'];
    return d;
  },
  options: () => [
    {
      id: 'same',
      label: 'Nur das gleiche Feld bewässern',
      goal: 'save',
      benefit: '45 statt 60 WE: insgesamt 15 WE weniger Entnahme.',
      limit:
        'Das Zusatzfeld wird nicht bewässert. Eine sichere Ernte ist trotzdem nicht garantiert.',
      facts: [
        'Gleiches erstes Feld: 45 WE. Kein Zusatzfeld.',
        'Gesamt 45 WE · Tankrest 35 WE. Früher: 60 WE Entnahme.',
      ],
    },
    {
      id: 'extra',
      label: 'Auch das kleinere Zusatzfeld bewässern',
      goal: 'area',
      benefit: 'Zwei Felder bewässern: 45 + 20 = 65 WE insgesamt.',
      limit:
        'Insgesamt 5 WE mehr als früher. Nur 15 WE bleiben im Tank; zusätzliche Einnahmen sind unsicher.',
      facts: [
        'Gleiches erstes Feld: 45 WE. Kleineres Zusatzfeld: weitere 20 WE.',
        'Gesamt 65 WE · Tankrest 15 WE. Früher: 60 WE Entnahme.',
      ],
    },
  ],
  conclusion: (_data, decision) =>
    decision.proposal === 'same'
      ? 'Mein Plan bewässert nur das gleiche Feld: insgesamt 45 WE. Zum Vergleich: Mit dem kleineren Zusatzfeld wären es 45 + 20 = 65 WE statt früher 60 WE. Mehr Flächen können die Einsparung am ersten Feld also aufheben.'
      : 'Mein Plan bewässert auch das kleinere Zusatzfeld: 45 + 20 = 65 WE statt früher 60 WE. Das erste Feld braucht weniger, beide Felder zusammen aber mehr. Zum Vergleich: Ohne Zusatzfeld wären es insgesamt 45 WE.',
  change(d, a) {
    if (
      a.op === 'select' &&
      ['base', 'same', 'extra'].includes(a.value ?? '')
    ) {
      d.selection = a.value!;
      if (!d.explored.includes(d.selection)) d.explored.push(d.selection);
    }
    if (a.op === 'answer' && a.field) {
      if (a.field === 'why') d.why = a.value;
      else {
        d.answers[a.field] = a.value ?? '';
        d.checked = d.checked.filter((k) => k !== a.field);
      }
    }
    return d;
  },
  evaluate(step, d, failures) {
    if (step === 0) {
      if (!d.explored.includes('same'))
        return result(
          'hint',
          'Untersuche den Technikwechsel',
          'Schalte auf neue Technik am gleichen Feld. Vergleiche mit vorher.',
        );
      return parts(
        [
          {
            name: '45 WE für das gleiche Feld',
            chosen: d.answers.single,
            correct: '45',
          },
          {
            name: '15 WE weniger als vorher',
            chosen: d.answers.saving,
            correct: '15',
          },
        ],
        failures,
        'Das gleiche Feld braucht im Modell 45 statt 60 WE Entnahme. 60 − 45 = 15 WE weniger. Ein weiteres Feld ist in diesem Vergleich noch nicht bewässert.',
      );
    }
    if (both(d))
      return parts(
        [
          {
            name: 'Unterschied von einzelner Fläche und Gesamtentnahme',
            chosen: d.why,
            correct: 'growth',
          },
        ],
        failures,
        cause,
      );
    if (!['same', 'extra'].includes(d.selection))
      return result(
        'hint',
        'Teste beide Flächenpläne',
        'Wähle gleiches Feld oder Zusatzfeld.',
      );
    const e = parts(
      [
        {
          name: 'gesamte Wasserentnahme',
          chosen: d.answers[d.selection],
          correct: String(areaModel(d.selection).withdrawal),
        },
      ],
      failures,
      explain(d.selection),
    );
    return {
      ...e,
      mark: e.feedback.complete ? d.selection : undefined,
      feedback: { ...e.feedback, complete: false },
    };
  },
  example(step, d) {
    if (step === 0) {
      d.selection = 'same';
      d.explored = Array.from(new Set([...d.explored, 'same']));
      d.answers = { ...d.answers, single: '45', saving: '15' };
    } else if (both(d)) d.why = 'growth';
    else if (['same', 'extra'].includes(d.selection)) {
      d.answers[d.selection] = String(areaModel(d.selection).withdrawal);
      if (!d.checked.includes(d.selection)) d.checked.push(d.selection);
    }
    return d;
  },
  canAdopt: (step, d) =>
    step === 0 || both(d) || ['same', 'extra'].includes(d.selection),
  hint(step, d, level) {
    if (step === 0)
      return level === 1
        ? 'Vergleiche genau dieselbe Fläche.'
        : level === 2
          ? 'Früher 60 WE, mit neuer Technik 45 WE. Wie groß ist die Differenz?'
          : 'Gleiches Feld: 45 statt 60 WE. Das sind 15 WE weniger. Noch kein Zusatzfeld bewässert.';
    return level === 1
      ? 'Zähle die Entnahme für alle bewässerten Felder zusammen.'
      : level === 2
        ? 'Das erste Feld bleibt bei 45 WE. Das Zusatzfeld braucht weitere 20 WE.'
        : both(d)
          ? cause
          : explain(d.selection) + ' Vergleiche beide Flächenpläne.';
  },
  reset(step, d) {
    if (step === 0) {
      d.selection = 'base';
      d.explored = ['base'];
      d.answers = {};
    } else {
      d.selection = 'same';
      d.checked = [];
      d.why = undefined;
      delete d.answers.same;
      delete d.answers.extra;
    }
    return d;
  },
  valid(d): d is StudyData {
    return (
      validData(d) &&
      ['base', 'same', 'extra'].includes(d.selection) &&
      d.explored.every((k) => ['base', 'same', 'extra'].includes(k)) &&
      d.checked.every(
        (k) =>
          ['same', 'extra'].includes(k) &&
          d.answers[k] === String(areaModel(k).withdrawal),
      )
    );
  },
  scene(d, step, h) {
    const m = areaModel(d.selection);
    const controls = step === 0 ? ['base', 'same'] : ['same', 'extra'];
    const label = (k: string) =>
      k === 'base' ? 'Vorher' : k === 'same' ? 'Gleiches Feld' : 'Zusatzfeld';
    return `<svg class="study-scene" viewBox="0 0 720 410" role="group" aria-label="Erfundener Tank und bewässerte Flächen">${tankGraphic(m.remaining)}<path d="M185 115H440" fill="none" stroke="#466a76" stroke-width="10"/><text x="305" y="82" text-anchor="middle">Gesamt ${m.withdrawal} WE</text><rect x="445" y="40" width="250" height="150" rx="8" fill="#d4e0c8" stroke="#536449"/>${[0, 1, 2, 3].map((i) => `<path d="M${478 + i * 55} 155V80m0 25l-12-12m12 30l12-12" stroke="#536449" fill="none" stroke-width="3"/>`).join('')}<text x="570" y="215" text-anchor="middle">Gleiches Feld: ${m.first} WE</text>${m.extra ? '<path d="M390 115V267H515" stroke="#466a76" stroke-width="6" fill="none"/>' : ''}<rect x="515" y="245" width="180" height="70" rx="6" stroke="#536449" stroke-dasharray="${m.extra ? '0' : '8 5'}" fill="${m.extra ? '#d4e0c8' : '#fffef8'}"/><text x="605" y="274" text-anchor="middle">Zusatzfeld</text><text x="605" y="302" text-anchor="middle">${m.extra ? '+20 WE' : 'nicht bewässert'}</text>${controls.map((k, i) => svgChoice(h, k, label(k), `<rect x="${30 + i * 350}" y="335" width="310" height="70" rx="10" fill="${d.selection === k ? '#d4e0c8' : '#fffef8'}" stroke="#536449"/><text x="${185 + i * 350}" y="375" text-anchor="middle">${label(k)}</text>`, d.selection === k, k)).join('')}</svg><p class="small-note">Tankstart immer 80 erfundene WE. Früher insgesamt 60 WE Entnahme. Keine echten Flächengrößen.</p>`;
  },
  task(d, step, h) {
    if (step === 0)
      return `<div class="study-options">${control(h, 'Vorher ansehen', 'select', 'base', '', 'try-base')}${control(h, 'Neue Technik am gleichen Feld', 'select', 'same', '', 'try-same')}</div><p class="study-inline-ledger">Gleiches Feld: vorher 60 WE · neue Technik 45 WE</p><fieldset><legend>Wie viel entnimmt die neue Technik für das gleiche Feld?</legend>${['60', '45', '15'].map((v) => choice(h, d, 'single', v, v + ' WE')).join('')}</fieldset><fieldset><legend>Wie viel weniger als vorher?</legend>${['60', '45', '15'].map((v) => choice(h, d, 'saving', v, v + ' WE')).join('')}</fieldset>`;
    if (both(d))
      return `<fieldset><legend>Warum steigt die Entnahme mit dem Zusatzfeld wieder?</legend>${answerOrder(
        [
          [
            'growth',
            'Eine Fläche braucht weniger. Mehr Flächen brauchen zusammen aber mehr.',
          ],
          ['always', 'Sparsame Technik senkt die Gesamtentnahme immer.'],
          ['free', 'Das Zusatzfeld braucht kein weiteres Wasser.'],
        ],
        1,
      )
        .map(([v, t]) => h.radio('study-why', v, t, d.why === v))
        .join('')}</fieldset>`;
    const m = areaModel(d.selection);
    return `<div class="study-options">${control(h, 'Gleiches Feld testen', 'select', 'same', '', 'try-same')}${control(h, 'Zusatzfeld hinzufügen', 'select', 'extra', '', 'try-extra')}</div><p class="study-inline-ledger">Erstes Feld ${m.first} WE · Zusatzfeld ${m.extra} WE · Tankstart 80 WE</p>${
      ['same', 'extra'].includes(d.selection)
        ? `<fieldset><legend>Wie viel wird insgesamt entnommen?</legend>${answerOrder(
            Array.from(new Set([m.withdrawal, 45, 60, 65])),
            d.selection === 'same' ? 0 : 2,
          )
            .map((v) => choice(h, d, d.selection, String(v), v + ' WE'))
            .join('')}</fieldset>`
        : '<p>Teste einen Flächenplan.</p>'
    }<p class="small-note">Schon geprüft: ${d.checked.length} von 2 Flächenplänen.</p>`;
  },
};
