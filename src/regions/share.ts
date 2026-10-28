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
export const shareKeys = ['payout', 'reserve', 'training'] as const;
const names: Record<string, string> = {
  payout: 'Auszahlung',
  reserve: 'Rücklage',
  training: 'Fortbildung',
};
const effects: Record<string, string> = {
  payout:
    'Die Mitglieder erhalten jetzt zusätzliches Geld. Es ist danach nicht mehr im Betrieb.',
  reserve:
    'Die Genossenschaft behält Geld für mögliche Reparaturen. Ob es später reicht, ist offen.',
  training:
    'Mitglieder können etwas dazulernen. Zusätzliche Aufträge oder Einnahmen sind nicht sicher.',
};
export function shareModel(d: StudyData) {
  const amounts = shareKeys.map((k) => d.allocations[k] ?? 0);
  const used = amounts.reduce((a, b) => a + b, 0);
  return {
    income: 300,
    paidWages: 100,
    otherPaidCosts: 80,
    available: 120,
    used,
    left: 120 - used,
  };
}
export const share: StudySpec = {
  id: 'share',
  number: 4,
  country: 'Ghana',
  place: 'bei Kumasi',
  title: 'Mehr Einnahmen – mehr für alle?',
  question: 'Wie soll die Genossenschaft ihren freien Überschuss nutzen?',
  intro:
    'Ghana liegt in Westafrika. Die Szene spielt bei Kumasi. Eine erfundene Genossenschaft entscheidet gemeinsam. Löhne und alle anderen Kosten sind bereits bezahlt. Verteile den freien Überschuss und untersuche die Folgen.',
  modelNote:
    'Eine neue, unabhängige Modellrunde; keine Fortrechnung aus Episode 3. Alle GE sind erfunden. 300 GE Einnahmen minus 100 GE bereits bezahlte Löhne minus 80 GE andere bezahlte Kosten ergeben 120 GE freien Überschuss. Auszahlungen gehen an Mitglieder, nicht als Ersatz für geschuldete Löhne. Rücklagen sind keine Garantie gegen jede Reparatur. Fortbildung garantiert weder höhere Erträge noch neue Aufträge. Keine Verteilung wird als moralisch beste belohnt.',
  goals: {
    payout: 'Mitglieder sollen jetzt zusätzlich Geld erhalten.',
    reserve: 'Geld für mögliche Reparaturen zurücklegen.',
    training: 'Mitgliedern weiteres Lernen ermöglichen.',
  },
  terms: [
    [
      [
        'Genossenschaft',
        'Ein Betrieb, der seinen Mitgliedern gemeinsam gehört.',
      ],
      [
        'Freier Überschuss',
        'Geld, das nach den bezahlten Kosten verteilt werden kann.',
      ],
    ],
    [
      ['Rücklage', 'Geld, das für spätere Ausgaben zurückgelegt wird.'],
      [
        'Fortbildung',
        'Neues für die Arbeit lernen. Ein späterer Vorteil ist möglich, aber nicht sicher.',
      ],
    ],
  ],
  initial() {
    const d = emptyData();
    d.allocations = { payout: 0, reserve: 0, training: 0 };
    return d;
  },
  options(d) {
    return shareKeys.map((id) => ({
      id,
      label: `Meinen Plan mit ${names[id]} begründen`,
      goal: id,
      eligible: d.allocations[id] > 0,
      benefit: `${d.allocations[id]} GE für ${names[id]}: ${{ payout: 'Mitglieder erhalten jetzt zusätzliches Geld.', reserve: 'Die Genossenschaft behält Geld für Reparaturen.', training: 'Mitglieder können dazulernen.' }[id]}`,
      limit:
        id === 'payout'
          ? 'Ausgezahltes Geld steht später nicht mehr für den Betrieb bereit.'
          : id === 'reserve'
            ? 'Zurückgelegtes Geld bringt den Mitgliedern jetzt keine zusätzliche Auszahlung.'
            : 'Der spätere Nutzen ist offen. Geld für Fortbildung wird jetzt ausgegeben.',
      facts: [
        `Mein Plan: ${d.allocations.payout} GE Auszahlung · ${d.allocations.reserve} GE Rücklage · ${d.allocations.training} GE Fortbildung.`,
        '120 GE frei verfügbar; Löhne und alle bisherigen Kosten bezahlt.',
      ],
    }));
  },
  change(d, a) {
    if (
      a.op === 'select' &&
      shareKeys.includes(a.value as (typeof shareKeys)[number])
    ) {
      d.selection = a.value!;
      if (!d.explored.includes(d.selection)) d.explored.push(d.selection);
    }
    if (
      a.op === 'adjust' &&
      shareKeys.includes(a.field as (typeof shareKeys)[number]) &&
      ['20', '-20'].includes(a.value ?? '')
    ) {
      const value = (d.allocations[a.field!] ?? 0) + Number(a.value);
      if (value >= 0 && (Number(a.value) < 0 || shareModel(d).left >= 20))
        d.allocations[a.field!] = value;
    }
    if (a.op === 'answer' && a.field) {
      if (a.field === 'why') d.why = a.value;
      else d.answers[a.field] = a.value ?? '';
    }
    return d;
  },
  evaluate(step, d, failures) {
    if (step === 0)
      return parts(
        [
          {
            name: 'freier Überschuss: 120 GE',
            chosen: d.answers.free,
            correct: '120',
          },
          {
            name: 'Löhne schon bezahlt',
            chosen: d.answers.wages,
            correct: 'paid',
          },
        ],
        failures,
        '300 − 100 − 80 = 120 GE. Diese 120 GE sind nach allen bisherigen Kosten frei. Niemand muss dafür auf geschuldete Löhne verzichten.',
      );
    const m = shareModel(d);
    if (m.left > 0 || shareKeys.some((k) => !d.explored.includes(k)))
      return result(
        d.explored.length || m.used ? 'partial' : 'hint',
        'Dein Plan entsteht',
        `${m.used} von 120 GE verteilt; ${d.explored.length} von 3 Folgen angesehen. Verteile auch den Rest. Sieh jede Folge an. Jede vollständige Verteilung ist möglich.`,
      );
    return parts(
      [
        {
          name: 'begrenzter gemeinsamer Geldtopf',
          chosen: d.why,
          correct: 'tradeoff',
        },
      ],
      failures,
      'Dein Plan verteilt genau 120 GE. Mehr für einen Zweck bedeutet weniger für andere Zwecke. Eine Auszahlung hilft jetzt; Rücklagen oder Lernen betreffen mögliche spätere Bedürfnisse. Es gibt keinen für alle Ziele besten Plan.',
    );
  },
  example(step, d) {
    if (step === 0) d.answers = { free: '120', wages: 'paid' };
    else {
      d.allocations = { payout: 40, reserve: 40, training: 40 };
      d.explored = [...shareKeys];
      d.selection = 'training';
      d.why = 'tradeoff';
    }
    return d;
  },
  canAdopt: () => true,
  hint(step, _d, level) {
    if (step === 0)
      return level === 1
        ? 'Was wurde von den Einnahmen bereits bezahlt?'
        : level === 2
          ? 'Ziehe die bezahlten Löhne und anderen Kosten ab.'
          : '300 − 100 − 80 = 120 GE. Die Löhne sind schon bezahlt.';
    return level === 1
      ? 'Jeder Geldschein kann nur einmal verteilt werden.'
      : level === 2
        ? 'Vergleiche: Was wirkt jetzt? Was betrifft später? Sieh alle drei Folgen an.'
        : 'Ein möglicher Plan: 40 GE Auszahlung, 40 GE Rücklage, 40 GE Fortbildung. Auszahlung hilft jetzt. Rücklage kann Reparaturen ermöglichen. Fortbildung kann später helfen. Mehr für einen Zweck lässt weniger für andere. Das ist ein Beispiel, keine beste Lösung.';
  },
  reset(step, d) {
    if (step === 0) d.answers = {};
    else {
      d.allocations = { payout: 0, reserve: 0, training: 0 };
      d.selection = 'base';
      d.explored = [];
      d.why = undefined;
    }
    return d;
  },
  valid(d): d is StudyData {
    return (
      validData(d) &&
      ['base', ...shareKeys].includes(d.selection) &&
      Object.keys(d.allocations).length === 3 &&
      shareKeys.every(
        (k) =>
          Number.isInteger(d.allocations[k]) &&
          d.allocations[k] >= 0 &&
          d.allocations[k] % 20 === 0,
      ) &&
      shareModel(d).left >= 0 &&
      d.explored.every((k) =>
        shareKeys.includes(k as (typeof shareKeys)[number]),
      )
    );
  },
  scene(d, step, h) {
    const m = shareModel(d);
    return `<svg class="study-scene" viewBox="0 0 720 260" role="group" aria-label="Gemeinsamer Geldtopf der erfundenen Genossenschaft"><rect x="5" y="5" width="710" height="250" rx="20" fill="#eee5d3"/><text x="360" y="45" text-anchor="middle">120 GE frei nach allen Kosten</text>${shareKeys.map((k, i) => svgChoice(h, k, names[k] + ' ' + d.allocations[k] + ' GE', `<rect x="${20 + i * 235}" y="85" width="215" height="130" rx="12" fill="${d.selection === k ? '#d4e0c8' : '#fffef8'}" stroke="#72543c"/><text x="${128 + i * 235}" y="123" text-anchor="middle">${names[k]}<tspan x="${128 + i * 235}" dy="45"> ${d.allocations[k]} GE</tspan></text>`, d.selection === k, k)).join('')}</svg>${step === 0 ? '<div class="study-ledger"><span>Einnahmen <strong>300 GE</strong></span><span>Löhne bezahlt <strong>100 GE</strong></span><span>Andere Kosten bezahlt <strong>80 GE</strong></span></div>' : `<p class="study-balance" role="status">${m.used} GE verteilt · Noch frei: <strong>${m.left} GE</strong></p>`}${shareKeys.includes(d.selection as (typeof shareKeys)[number]) ? `<p class="study-effect">${effects[d.selection]}</p>` : ''}`;
  },
  task(d, step, h) {
    if (step === 0)
      return `<fieldset><legend>Wie viel ist nach allen Kosten frei?</legend>${['300', '120', '200'].map((v) => choice(h, d, 'free', v, v + ' GE')).join('')}</fieldset><fieldset><legend>Was gilt für die Löhne?</legend>${choice(h, d, 'wages', 'later', 'Die Löhne sollen erst aus den 120 GE bezahlt werden.')}${choice(h, d, 'wages', 'paid', 'Die Löhne sind bereits bezahlt.')}</fieldset>`;
    return `<p>Verteile in Schritten von 20 GE. Wähle jeden Zweck an und lies die Folge.</p><p class="study-mini-balance" role="status">Noch frei: <strong>${shareModel(d).left} von 120 GE</strong></p>${shareKeys.map((k) => `<section class="study-allocation"><h3>${names[k]}: <strong>${d.allocations[k]} GE</strong></h3><div class="study-options">${control(h, names[k] + ' ansehen', 'select', k, '', 'try-' + k)}${control(h, '+20 GE für ' + names[k], 'adjust', '20', k, 'add-' + k, 'button secondary', shareModel(d).left < 20)}${control(h, '−20 GE bei ' + names[k], 'adjust', '-20', k, 'remove-' + k, 'button secondary', !d.allocations[k])}</div>${d.selection === k ? `<p class="study-effect">${effects[k]}</p>` : ''}</section>`).join('')}<fieldset><legend>Was gilt für jede Verteilung?</legend>${answerOrder(
      [
        ['tradeoff', 'Mehr für einen Zweck heißt weniger für andere.'],
        ['everyone', 'Jede Verteilung erfüllt alle Wünsche.'],
        ['sure', 'Fortbildung bringt sicher mehr Einnahmen.'],
      ],
      1,
    )
      .map(([v, t]) => h.radio('study-why', v, t, d.why === v))
      .join('')}</fieldset>`;
  },
};
