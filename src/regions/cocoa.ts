import { answerOrder } from './answer-order.ts';
import { result } from '../feedback.ts';
import type { StudySpec, StudyData } from './types.ts';
import {
  emptyData,
  validData,
  parts,
  control,
  choice,
  svgChoice,
} from './shared.ts';
export const cocoaChain = ['beans', 'roast', 'mass', 'press'] as const;
export const chainNames: Record<string, string> = {
  beans: 'Getrocknete Bohnen',
  roast: 'Rösten und mahlen',
  mass: 'Kakaomasse',
  press: 'Pressen: Butter und Presskuchen',
};
const investments = 60;
const scenarios = {
  base: { income: 180, costs: 100, investment: 0 },
  quality: { income: 200, costs: 110, investment: 20 },
  process: { income: 260, costs: 185, investment: 60 },
} as const;
export function cocoaModel(id: string) {
  const p = Object.hasOwn(scenarios, id)
    ? scenarios[id as keyof typeof scenarios]
    : scenarios.base;
  return {
    ...p,
    surplus: p.income - p.costs,
    investmentLeft: investments - p.investment,
  };
}
const allChecked = (d: StudyData) =>
  ['quality', 'process'].every((id) => d.checked.includes(id));
const explanation = (id: string) => {
  const m = cocoaModel(id);
  return `${m.income} Einnahmen − ${m.costs} laufende Ausgaben = ${m.surplus} GE Überschuss. Die einmalige Investition von ${m.investment} GE kommt aus einem getrennten Topf.`;
};
export const cocoa: StudySpec = {
  id: 'cocoa',
  number: 3,
  country: 'Ghana',
  place: 'bei Kumasi',
  title: 'Was wird aus dem Kakao?',
  question:
    'Warum bleibt bei mehr Verarbeitung hier nicht automatisch mehr Überschuss übrig?',
  intro:
    'Ghana liegt in Westafrika. Die Szene spielt bei Kumasi. Eine erfundene Genossenschaft verkauft Kakaoprodukte. Sie möchte ihren Betrieb verbessern. Du untersuchst zwei Ideen.',
  modelNote:
    'Erfundener Betrieb im Kontext Ghanas. Ghana hat bereits eigene Kakaoverarbeitung. Alle Geldeinheiten (GE), Einnahmen und Kosten sind erfunden. Eine Spielrunde, keine echten Preise oder Mengen. Keine Umrechnung von Bohnen in Produktmengen. Ein getrennter Investitionstopf enthält 60 GE. Einmalige Investitionen und laufende Ausgaben werden nicht vermischt. Nachfrage, Ausbildung, Energie und Transport können reale Ergebnisse beeinflussen.',
  goals: {
    surplus: 'Mehr Überschuss in dieser Runde.',
    processing: 'Mehr Verarbeitung im eigenen Betrieb ermöglichen.',
  },
  terms: [
    [
      [
        'Genossenschaft',
        'Ein Betrieb, der seinen Mitgliedern gemeinsam gehört.',
      ],
      [
        'Rohstoff',
        'Material, aus dem ein Produkt entsteht. Hier: Kakaobohnen.',
      ],
      [
        'Verarbeitung',
        'Einen Rohstoff verändern, zum Beispiel rösten und mahlen.',
      ],
    ],
    [
      ['Einnahmen', 'Geld, das der Betrieb in dieser Runde erhält.'],
      ['Ausgaben', 'Geld, das der Betrieb für diese Runde bezahlt.'],
      [
        'Überschuss',
        'Einnahmen minus laufende Ausgaben. Hier keine vollständige Gewinnrechnung.',
      ],
    ],
  ],
  initial: emptyData,
  options: () => [
    {
      id: 'quality',
      label: 'Lagerung und Qualität verbessern',
      goal: 'surplus',
      benefit: 'Qualität: 200 − 110 = 90 GE Überschuss.',
      limit: 'Die eigene Verarbeitung wird damit nicht ausgebaut.',
      facts: [
        'Einmalig 20 GE investieren; 40 GE im Investitionstopf übrig.',
        'In der folgenden Modellrunde: 200 GE Einnahmen, 110 GE laufende Ausgaben.',
      ],
    },
    {
      id: 'process',
      label: 'Eine zusätzliche Presse nutzen',
      goal: 'processing',
      benefit: 'Verarbeitung: 260 − 185 = 75 GE Überschuss.',
      limit:
        'Die laufenden Ausgaben steigen. Es bleiben weniger GE als bei der Qualitätsmaßnahme.',
      facts: [
        'Einmalig 60 GE investieren; der Investitionstopf ist aufgebraucht.',
        'In der folgenden Modellrunde: 260 GE Einnahmen, 185 GE laufende Ausgaben.',
      ],
    },
  ],
  change(d, a) {
    if (
      a.op === 'pick' &&
      a.value &&
      cocoaChain.includes(a.value as (typeof cocoaChain)[number]) &&
      !d.chain.includes(a.value) &&
      d.chain.length < 4
    )
      d.chain.push(a.value);
    if (a.op === 'undo') d.chain.pop();
    if (
      a.op === 'select' &&
      ['base', 'quality', 'process'].includes(a.value ?? '')
    ) {
      d.selection = a.value!;
      if (d.selection !== 'base' && !d.explored.includes(d.selection))
        d.explored.push(d.selection);
    }
    if (a.op === 'answer' && a.field) {
      if (a.field === 'why') d.why = a.value;
      else {
        d.answers[a.field] = a.value ?? '';
        d.checked = d.checked.filter((x) => x !== a.field);
      }
    }
    return d;
  },
  evaluate(step, d, failures) {
    if (step === 0) {
      const correct = cocoaChain.every((x, i) => d.chain[i] === x),
        right = d.chain.filter((x, i) => x === cocoaChain[i]).length;
      if (d.chain.length < 4)
        return result(
          right ? 'partial' : 'hint',
          'Baue die Verarbeitungskette',
          right
            ? `${right} Schritte stehen schon richtig. Ergänze die Kette.`
            : 'Wähle die vier Schritte in der passenden Reihenfolge.',
        );
      if (correct)
        return result(
          'correct',
          '✓ Die Verarbeitungskette passt',
          'Bohnen werden geröstet und gemahlen. Es entsteht Kakaomasse. Beim Pressen entstehen Kakaobutter und Presskuchen. Aus dem Kuchen kann später Kakaopulver entstehen.',
          true,
        );
      return result(
        failures >= 1 ? 'hint' : right ? 'partial' : 'incorrect',
        '↺ Prüfe die Reihenfolge',
        `${right} Schritte stehen richtig. ` +
          (failures >= 1
            ? 'Getrocknete Bohnen → Rösten und mahlen → Kakaomasse → Pressen. Du kannst dieses Beispiel übernehmen.'
            : 'Was ist der Rohstoff? Was entsteht beim Mahlen?'),
        false,
        true,
      );
    }
    if (allChecked(d))
      return parts(
        [
          {
            name: 'Zusammenhang von Einnahmen und Kosten',
            chosen: d.why,
            correct: 'costs',
          },
        ],
        failures,
        'Mehr Verarbeitung kann mehr Einnahmen bringen. Sie verursacht hier auch höhere laufende Ausgaben. Deshalb bleiben nur 75 statt 90 GE übrig. Ein späterer Gewinn ist nicht garantiert.',
      );
    if (!['quality', 'process'].includes(d.selection))
      return result(
        'hint',
        'Teste eine Idee',
        'Wähle Lagerung oder Presse in der Szene.',
      );
    const e = parts(
      [
        {
          name: 'berechneter Überschuss',
          chosen: d.answers[d.selection],
          correct: String(cocoaModel(d.selection).surplus),
        },
      ],
      failures,
      explanation(d.selection),
    );
    return {
      ...e,
      mark: e.feedback.complete ? d.selection : undefined,
      feedback: { ...e.feedback, complete: false },
    };
  },
  example(step, d) {
    if (step === 0) d.chain = [...cocoaChain];
    else if (allChecked(d)) d.why = 'costs';
    else if (['quality', 'process'].includes(d.selection)) {
      d.answers[d.selection] = String(cocoaModel(d.selection).surplus);
      if (!d.checked.includes(d.selection)) d.checked.push(d.selection);
    }
    return d;
  },
  canAdopt: (step, d) =>
    step === 0 || allChecked(d) || ['quality', 'process'].includes(d.selection),
  hint(step, d, level) {
    if (step === 0)
      return level === 1
        ? 'Beginne mit dem Rohstoff.'
        : level === 2
          ? 'Durch Rösten und Mahlen entsteht Kakaomasse.'
          : 'Getrocknete Bohnen → Rösten und mahlen → Kakaomasse → Pressen: Butter und Presskuchen.';
    return level === 1
      ? 'Vergleiche Einnahmen und laufende Ausgaben.'
      : level === 2
        ? 'Ziehe die laufenden Ausgaben von den Einnahmen ab. Der Investitionstopf ist getrennt.'
        : allChecked(d)
          ? '260 − 185 = 75. 200 − 110 = 90. Mehr Einnahmen bedeuten hier nicht mehr Überschuss.'
          : explanation(d.selection) +
            ' Übernahme gilt für diese Idee. Teste auch die andere.';
  },
  reset(step, d) {
    if (step === 0) d.chain = [];
    else {
      d.selection = 'base';
      d.answers = {};
      d.checked = [];
      d.explored = [];
      d.why = undefined;
    }
    return d;
  },
  valid(d): d is StudyData {
    return (
      validData(d) &&
      d.chain.every((x) =>
        cocoaChain.includes(x as (typeof cocoaChain)[number]),
      ) &&
      new Set(d.chain).size === d.chain.length &&
      ['base', 'quality', 'process'].includes(d.selection) &&
      d.checked.every(
        (x) =>
          ['quality', 'process'].includes(x) &&
          d.answers[x] === String(cocoaModel(x).surplus),
      ) &&
      d.explored.every((x) => ['quality', 'process'].includes(x))
    );
  },
  scene(d, step, h) {
    const m = cocoaModel(d.selection);
    return `<svg class="study-scene" viewBox="0 0 720 270" role="group" aria-label="Erfundene Kakaowerkstatt"><rect x="5" y="5" width="710" height="260" rx="20" fill="#eee5d3"/>${cocoaChain.map((key, i) => `<path d="M${72 + i * 170} 90h100" stroke="#72543c" stroke-width="4"/><rect x="${15 + i * 175}" y="100" width="160" height="65" rx="12" fill="${d.chain[i] === key ? '#d4e0c8' : '#fffef8'}" stroke="#72543c"/><text x="${95 + i * 175}" y="125" text-anchor="middle">${i + 1}. ${h.esc(d.chain[i] ? ({ beans: 'Bohnen', roast: 'Rösten/mahlen', mass: 'Masse', press: 'Pressen' } as Record<string, string>)[d.chain[i]] : 'Schritt wählen')}</text>`).join('')}${step > 0 ? svgChoice(h, 'quality', 'Lagerung', `<rect x="35" y="192" width="285" height="55" rx="10" fill="${d.selection === 'quality' ? '#d4e0c8' : '#fffef8'}"/><text x="175" y="226" text-anchor="middle">Lagerung</text>`, d.selection === 'quality', 'quality') + svgChoice(h, 'process', 'Presse', `<rect x="380" y="192" width="285" height="55" rx="10" fill="${d.selection === 'process' ? '#d4e0c8' : '#fffef8'}"/><text x="520" y="226" text-anchor="middle">Presse</text>`, d.selection === 'process', 'process') : ''}</svg>${step > 0 ? `<p class="study-production-change">${d.selection === 'process' ? 'Im Betrieb kommt eine zusätzliche Presse hinzu.' : d.selection === 'quality' ? 'Die Lagerung wird verbessert. Die Verarbeitung bleibt gleich.' : 'Ausgangsbetrieb: noch keine der beiden Verbesserungen.'}</p><div class="study-ledger"><span>Einnahmen <strong>${m.income} GE</strong></span><span>Laufende Ausgaben <strong>${m.costs} GE</strong></span></div><p class="small-note">Getrennter Investitionstopf: ${m.investment} von 60 GE eingesetzt; ${m.investmentLeft} GE übrig.</p>` : ''}`;
  },
  task(d, step, h) {
    if (step === 0)
      return `<p>Wähle die Schritte der Reihe nach.</p><div class="study-options">${['mass', 'beans', 'press', 'roast'].map((k) => control(h, chainNames[k], 'pick', k, '', 'chain-' + k, 'button secondary', d.chain.includes(k))).join('')}</div>${control(h, 'Letzten Schritt zurücknehmen', 'undo', '', '', 'chain-undo', 'text-button', !d.chain.length)}`;
    if (allChecked(d))
      return `<fieldset><legend>Warum bleibt bei mehr Verarbeitung hier weniger übrig?</legend>${answerOrder(
        [
          [
            'costs',
            'Die Einnahmen steigen. Die laufenden Ausgaben steigen aber auch.',
          ],
          ['income', 'Alle Einnahmen sind Überschuss.'],
          ['free', 'Eine neue Presse verursacht keine laufenden Kosten.'],
        ],
        2,
      )
        .map(([v, t]) => h.radio('study-why', v, t, d.why === v))
        .join('')}</fieldset>`;
    const m = cocoaModel(d.selection);
    return `<div class="study-options">${['quality', 'process'].map((k) => control(h, k === 'quality' ? 'Lagerung testen' : 'Presse testen', 'select', k, '', 'try-' + k)).join('')}</div>${
      d.selection === 'base'
        ? '<p>Teste beide Ideen.</p>'
        : `<p class="study-inline-ledger">${m.income} GE Einnahmen − ${m.costs} GE laufende Ausgaben.</p><fieldset><legend>Wie viel bleibt in dieser Runde übrig?</legend>${answerOrder(
            [m.surplus, m.income, m.costs],
            d.selection === 'quality' ? 1 : 2,
          )
            .map((n) => choice(h, d, d.selection, String(n), n + ' GE'))
            .join('')}</fieldset>`
    }<p class="small-note">Schon berechnet: ${d.checked.length} von 2 Ideen.</p>`;
  },
};
