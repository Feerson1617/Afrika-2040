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
const scenarios = { base: 60, repair: 50, tech: 45 } as const;
export function waterModel(id: string) {
  const withdrawal = Object.hasOwn(scenarios, id)
    ? scenarios[id as keyof typeof scenarios]
    : scenarios.base;
  return {
    ...waterBalance(withdrawal),
    atField: 40,
    notAtField: withdrawal - 40,
  };
}
const checkedBoth = (d: StudyData) =>
  ['repair', 'tech'].every((k) => d.checked.includes(k));
const explain = (id: string) => {
  const m = waterModel(id);
  return `80 − ${m.withdrawal} = ${m.remaining} WE bleiben im Tank. Am Feld kommen 40 WE an. ${m.notAtField} WE erreichen das Feld nicht. Was mit ihnen geschieht, wird nicht berechnet.`;
};
export const water: StudySpec = {
  id: 'water',
  number: 5,
  country: 'Marokko',
  place: 'bei Agadir',
  title: 'Wasser für die nächste Ernte',
  question:
    'Wie kann ein landwirtschaftlicher Betrieb mit weniger Wasser auskommen?',
  intro:
    'Marokko liegt in Nordafrika. Die erfundene Szene spielt bei Agadir. Ein Betrieb nutzt einen Tank und bewässert ein Feld. Du prüfst zwei vorhandene technische Möglichkeiten.',
  modelNote:
    'Erfundener Betrieb bei einem realen Ort. Marokko wird hier nicht als einheitlicher Naturraum dargestellt. Alle Wassereinheiten (WE) und Wirkungen sind Modellannahmen, keine örtlichen Messwerte oder echten Einsparquoten. Eine Runde: 80 WE im Tank, kein Zufluss. Die gleiche Fläche erhält im Modell jeweils 40 WE; daraus folgt keine sichere Ernte. Nicht am Feld ankommendes Wasser kann etwa versickern oder verdunsten; die Aufteilung und Rückflüsse werden nicht berechnet. Entnahme ist Wasser aus dem Tank. Verbrauch bedeutet etwa: Wasser verdunstet und ist vor Ort zunächst nicht wieder nutzbar. Er wird hier nicht berechnet. Der Tankrest ist kein Grundwasserbestand. Keine Aussage über den realen Wasserhaushalt Marokkos.',
  goals: {
    repair: 'Die vorhandene Leitung weiter nutzen.',
    less: 'In dieser Runde möglichst wenig Wasser entnehmen.',
  },
  terms: [
    [
      ['Vorrat', 'Wasser, das am Anfang im Tank ist.'],
      ['Entnahme', 'Wasser, das aus dem Tank herausgenommen wird.'],
    ],
    [
      ['Bewässerung', 'Wasser gezielt zu einer Anbaufläche bringen.'],
      [
        'Verbrauch',
        'Zum Beispiel Wasser, das verdunstet und vor Ort zunächst nicht wieder nutzbar ist. Hier nicht berechnet.',
      ],
    ],
  ],
  initial: emptyData,
  options: () => [
    {
      id: 'repair',
      label: 'Die Leitung reparieren',
      goal: 'repair',
      benefit: 'Reparatur: 50 WE entnommen, 30 WE bleiben im Tank.',
      limit:
        'Die Leitung bleibt wartungsbedürftig. Nicht alles entnommene Wasser erreicht das Feld.',
      facts: [
        '80 WE am Anfang − 50 WE Entnahme = 30 WE Rest.',
        '40 WE erreichen das gleiche Feld. Vorhandene Leitung wird weiter genutzt.',
      ],
    },
    {
      id: 'tech',
      label: 'Die Wasserverteilung erneuern',
      goal: 'less',
      benefit: 'Neue Verteilung: 45 WE entnommen, 35 WE bleiben im Tank.',
      limit:
        'Neue Teile, Filter und Wartung sind nötig. Eine sichere Ernte folgt daraus nicht.',
      facts: [
        '80 WE am Anfang − 45 WE Entnahme = 35 WE Rest.',
        '40 WE erreichen das gleiche Feld. Die gesamte Verteilung wird erneuert.',
      ],
    },
  ],
  change(d, a) {
    if (a.op === 'select' && Object.hasOwn(scenarios, a.value ?? '')) {
      d.selection = a.value!;
      if (d.selection !== 'base' && !d.explored.includes(d.selection))
        d.explored.push(d.selection);
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
    if (step === 0)
      return parts(
        [
          {
            name: 'Entnahme: 60 WE',
            chosen: d.answers.withdrawal,
            correct: '60',
          },
          { name: 'Tankrest: 20 WE', chosen: d.answers.rest, correct: '20' },
        ],
        failures,
        '80 WE sind am Anfang da. 60 WE werden entnommen. 80 − 60 = 20 WE bleiben im Tank. Nur 40 WE kommen am Feld an. Entnahme und Ankunft sind verschiedene Größen.',
      );
    if (checkedBoth(d))
      return parts(
        [
          {
            name: 'gleiche Feldmenge bei weniger Entnahme',
            chosen: d.why,
            correct: 'delivery',
          },
        ],
        failures,
        'In beiden Versuchen kommen 40 WE am gleichen Feld an. Dafür wird weniger aus dem Tank entnommen. Ein Tankrest ist keine Aussage über Grundwasser. Der Verbrauch und die Ernte werden nicht berechnet.',
      );
    if (!['repair', 'tech'].includes(d.selection))
      return result(
        'hint',
        'Teste eine Maßnahme',
        'Wähle Reparatur oder neue Verteilung.',
      );
    const e = parts(
      [
        {
          name: 'verbleibender Tankvorrat',
          chosen: d.answers[d.selection],
          correct: String(waterModel(d.selection).remaining),
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
    if (step === 0) d.answers = { ...d.answers, withdrawal: '60', rest: '20' };
    else if (checkedBoth(d)) d.why = 'delivery';
    else if (['repair', 'tech'].includes(d.selection)) {
      d.answers[d.selection] = String(waterModel(d.selection).remaining);
      if (!d.checked.includes(d.selection)) d.checked.push(d.selection);
    }
    return d;
  },
  canAdopt: (step, d) =>
    step === 0 || checkedBoth(d) || ['repair', 'tech'].includes(d.selection),
  hint(step, d, level) {
    if (step === 0)
      return level === 1
        ? 'Unterscheide den Anfangsvorrat und das herausgenommene Wasser.'
        : level === 2
          ? 'Entnahme ist nicht nur das Wasser am Feld. Rechne Anfang minus Entnahme.'
          : 'Am Anfang 80 WE, Entnahme 60 WE. 80 − 60 = 20 WE bleiben. Am Feld kommen 40 WE an.';
    return level === 1
      ? 'Was bleibt bei den Versuchen gleich? Was ändert sich?'
      : level === 2
        ? 'Immer 40 WE am gleichen Feld. Vergleiche die Entnahme und den Tankrest.'
        : checkedBoth(d)
          ? 'Reparatur: 80 − 50 = 30. Neue Verteilung: 80 − 45 = 35. Jeweils 40 WE am Feld, weniger Entnahme. Daraus folgen weder berechneter Verbrauch noch eine sichere Ernte.'
          : explain(d.selection) + ' Teste auch die andere Maßnahme.';
  },
  reset(step, d) {
    if (step === 0) d.answers = {};
    else {
      d.selection = 'base';
      delete d.answers.repair;
      delete d.answers.tech;
      d.explored = [];
      d.checked = [];
      d.why = undefined;
    }
    return d;
  },
  valid(d): d is StudyData {
    return (
      validData(d) &&
      Object.hasOwn(scenarios, d.selection) &&
      d.checked.every(
        (k) =>
          ['repair', 'tech'].includes(k) &&
          d.answers[k] === String(waterModel(k).remaining),
      ) &&
      d.explored.every((k) => ['repair', 'tech'].includes(k))
    );
  },
  scene(d, step, h) {
    const m = waterModel(d.selection);
    return `<svg class="study-scene" viewBox="0 0 720 345" role="group" aria-label="Erfundener Tank, Leitung und gleiches Anbaufeld">${tankGraphic(m.remaining)}<path d="M185 120H410V150H455" stroke="#466a76" stroke-width="${d.selection === 'tech' ? 14 : 9}" fill="none"/><text x="300" y="95" text-anchor="middle">Entnahme ${m.withdrawal} WE</text><rect x="455" y="60" width="240" height="150" rx="10" fill="#d4e0c8" stroke="#536449"/>${[0, 1, 2, 3].map((i) => `<path d="M${480 + i * 52} 190V100m0 35l-12-12m12 26l12-12" stroke="#536449" fill="none" stroke-width="3"/>`).join('')}<text x="575" y="240" text-anchor="middle">Am Feld: 40 WE</text><text x="300" y="185" text-anchor="middle">${m.notAtField} WE nicht</text><text x="300" y="215" text-anchor="middle">am Feld</text>${step > 0 ? ['repair', 'tech'].map((k, i) => svgChoice(h, k, k === 'repair' ? 'Reparatur' : 'Neue Verteilung', `<rect x="${30 + i * 350}" y="275" width="310" height="60" rx="10" fill="${d.selection === k ? '#d4e0c8' : '#fffef8'}" stroke="#536449"/><text x="${185 + i * 350}" y="312" text-anchor="middle">${k === 'repair' ? 'Reparatur' : 'Neue Verteilung'}</text>`, d.selection === k, k)).join('') : ''}</svg><p class="small-note">WE = erfundene Wassereinheiten. Kein Zufluss. Verbrauch und Grundwasser nicht berechnet.</p>`;
  },
  task(d, step, h) {
    if (step === 0)
      return `<p class="study-inline-ledger">Start: 80 WE · Aus dem Tank: 60 WE · Am Feld: 40 WE</p><fieldset><legend>Wie viel wird aus dem Tank entnommen?</legend>${['60', '40', '80'].map((v) => choice(h, d, 'withdrawal', v, v + ' WE')).join('')}</fieldset><fieldset><legend>Wie viel bleibt im Tank?</legend>${['20', '40', '60'].map((v) => choice(h, d, 'rest', v, v + ' WE')).join('')}</fieldset>`;
    if (checkedBoth(d))
      return `<fieldset><legend>Warum bleibt mehr im Tank?</legend>${[
        [
          'delivery',
          '40 WE erreichen das gleiche Feld. Dafür wird weniger entnommen.',
        ],
        ['ground', 'Die Technik lässt das echte Grundwasser sicher steigen.'],
        ['harvest', 'Weniger Entnahme garantiert eine größere Ernte.'],
      ]
        .map(([v, t]) => h.radio('study-why', v, t, d.why === v))
        .join('')}</fieldset>`;
    const m = waterModel(d.selection);
    return `<div class="study-options">${control(h, 'Reparatur testen', 'select', 'repair', '', 'try-repair')}${control(h, 'Neue Verteilung testen', 'select', 'tech', '', 'try-tech')}</div>${d.selection === 'base' ? '<p>Untersuche beide Maßnahmen.</p>' : `<p class="study-inline-ledger">Start 80 WE · Entnahme ${m.withdrawal} WE · Am Feld 40 WE</p><fieldset><legend>Wie viel bleibt im Tank?</legend>${[m.remaining, 40, m.withdrawal].map((v) => choice(h, d, d.selection, String(v), v + ' WE')).join('')}</fieldset>`}<p class="small-note">Schon geprüft: ${d.checked.length} von 2 Maßnahmen.</p>`;
  },
};
