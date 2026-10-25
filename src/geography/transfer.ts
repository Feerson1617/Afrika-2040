import { parts } from '../regions/shared.ts';
import { applyEvaluation, newProgress, type Progress } from '../progress.ts';
import type { State } from '../state.ts';
import type { GeoAction } from './state.ts';
export const transferTasks = {
  KEN: {
    insight: 'Ein Busweg hilft verschiedenen Menschen unterschiedlich.',
    example:
      'Im Busmodell braucht Amina über Nord 10 statt 22 Minuten. David braucht dort 18 statt 12 Minuten.',
    choices: [
      'Im Modell hilft Nord Amina. David braucht länger.',
      'Nord ist für alle Menschen in Nairobi der beste Busweg.',
    ],
    explanation:
      'Im Modell wird Aminas Weg kürzer, Davids Weg länger. Das gilt für die erfundenen Wege und Personen. Für ganz Nairobi fehlen uns Daten.',
    scope:
      'Die Modellzeiten beschreiben keine echten Wege aller Menschen in Nairobi.',
    hint: 'Vergleiche Amina und David: Wer gewinnt Zeit, wer braucht länger?',
  },
  GHA: {
    insight: 'Mehr Einnahmen bedeuten nicht immer mehr Überschuss.',
    example:
      'Im Kakaomodell: Qualität bringt 200 − 110 = 90 GE Überschuss. Verarbeitung bringt 260 − 185 = 75 GE.',
    choices: [
      'Im Modell bleibt bei Qualität mehr Überschuss als bei Verarbeitung.',
      'Alle Betriebe in Ghana verdienen mit Qualität mehr Geld.',
    ],
    explanation:
      'Im Modell sind 90 GE mehr als 75 GE. Überschuss ist das Geld nach den laufenden Ausgaben. Das belegt keine Aussage über alle Betriebe in Ghana.',
    scope: 'Die Geldbeträge gelten nur für unseren erfundenen Betrieb.',
    hint: 'Vergleiche das Geld nach den laufenden Ausgaben, nicht nur die Einnahmen.',
  },
  MAR: {
    insight:
      'Weniger Wasser je Fläche heißt nicht immer weniger Entnahme insgesamt.',
    example:
      'Im Flächenmodell: erstes Feld verbessert 45 WE. Mit Zusatzfläche insgesamt 65 WE; anfangs waren es 60 WE.',
    choices: [
      'Im Modell spart das erste Feld. Mit Zusatzfläche steigt die gesamte Entnahme.',
      'Sparsame Technik senkt die gesamte Entnahme in jedem Betrieb in Marokko.',
    ],
    explanation:
      'Im Modell sinkt die Entnahme für das erste Feld von 60 auf 45 WE. Mit Zusatzfläche sind es insgesamt 65 WE. Das sind keine Messwerte für Marokko.',
    scope:
      'Ein erfundener Tank belegt keine Aussage über jeden Betrieb in Marokko.',
    hint: 'Vergleiche das erste Feld mit der gesamten Fläche.',
  },
} as const;
export type ReviewTab = keyof typeof transferTasks | 'common';
export interface TransferRecord {
  answers: Record<string, string>;
  progress: Progress;
}
export interface Review {
  tab: ReviewTab;
  records: Record<ReviewTab, TransferRecord>;
}
export const isReviewTab = (v: unknown): v is ReviewTab =>
  ['KEN', 'GHA', 'MAR', 'common'].includes(String(v));
export function newReview(): Review {
  return {
    tab: 'KEN',
    records: Object.fromEntries(
      ['KEN', 'GHA', 'MAR', 'common'].map((id) => [
        id,
        { answers: {}, progress: newProgress() },
      ]),
    ) as Review['records'],
  };
}
export const commonExplanation =
  'Im Modell hilft Nord Amina, kostet David aber Zeit. Qualität bringt mehr Überschuss; Verarbeitung verändert die Arbeit im Betrieb. Spartechnik spart auf dem ersten Feld; eine Zusatzfläche braucht weiteres Wasser. Prüfe deshalb Vorteile und Grenzen mit passenden Angaben.';
export function transferChecks(tab: ReviewTab, d: TransferRecord) {
  return tab === 'common'
    ? [
        {
          name: 'Folgen der Vorschläge',
          chosen: d.answers.consequences,
          correct: 'different',
        },
        {
          name: 'Vorteile und Grenzen prüfen',
          chosen: d.answers.weigh,
          correct: 'evidence',
        },
      ]
    : [
        {
          name: 'Aussage über das Modell',
          chosen: d.answers.claim,
          correct: 'model',
        },
      ];
}
export function evaluateTransfer(tab: ReviewTab, d: TransferRecord) {
  const evaluation = parts(
    transferChecks(tab, d),
    d.progress.failures,
    tab === 'common' ? commonExplanation : transferTasks[tab].explanation,
  );
  if (evaluation.failed && d.progress.failures === 0) {
    evaluation.feedback.text =
      tab === 'common'
        ? (d.answers.consequences === 'different'
            ? 'Das passt schon: Vorschläge haben unterschiedliche Folgen. '
            : d.answers.weigh === 'evidence'
              ? 'Das passt schon: Du prüfst Vorteile und Grenzen mit Angaben. '
              : '') +
          'Nicht jeder Vorschlag hilft allen gleich. Angaben müssen zum Vorschlag passen. Prüfe den noch unpassenden Teil an den Modellbeispielen.'
        : transferTasks[tab].scope +
          ' Prüfe: Welche Aussage ist durch das Spielmodell belegt?';
  }
  if (evaluation.failed && d.progress.failures >= 1) {
    const right = transferChecks(tab, d)
      .filter((x) => x.chosen === x.correct)
      .map((x) => x.name);
    evaluation.feedback.text =
      (right.length ? 'Das passt schon: ' + right.join(', ') + '. ' : '') +
      'Unten steht die Erklärung. Du kannst das Beispiel bewusst übernehmen.';
  }
  return evaluation;
}
export function transferHint(review: Review) {
  const tab = review.tab,
    level = review.records[tab].progress.help;
  if (level === 1)
    return tab === 'common'
      ? 'Denke an zwei Vorschläge: Helfen beide allen gleich?'
      : 'Welche Aussage gilt nur für unser Modell? Welche spricht über alle Menschen oder Betriebe?';
  if (level === 2)
    return tab === 'common'
      ? 'Nord hilft Amina, kostet David aber Zeit. Entscheide anhand passender Belege und beachte Grenzen.'
      : transferTasks[tab].hint;
  return tab === 'common' ? commonExplanation : transferTasks[tab].explanation;
}
export function reduceReview(s: State, a: GeoAction) {
  const g = s.geography!;
  g.review ??= newReview();
  const review = g.review;
  if (a.op === 'review') {
    s.screen = 'review';
    return s;
  }
  if (a.op === 'home') {
    s.screen = 'start';
    return s;
  }
  if (a.op === 'review-tab') {
    if (isReviewTab(a.value)) review.tab = a.value;
    return s;
  }
  const d = review.records[review.tab],
    p = d.progress;
  if (a.op === 'transfer-answer') {
    const allowed =
      review.tab === 'common'
        ? a.field === 'consequences'
          ? ['different', 'same']
          : a.field === 'weigh'
            ? ['evidence', 'any']
            : []
        : a.field === 'claim'
          ? ['model', 'all']
          : [];
    if (a.field && a.value && allowed.includes(a.value)) {
      d.answers[a.field] = a.value;
      p.feedback = undefined;
      p.complete = false;
      p.supported = undefined;
    }
  }
  if (a.op === 'transfer-check')
    applyEvaluation(p, evaluateTransfer(review.tab, d));
  if (a.op === 'transfer-help')
    p.help = Math.max(p.help, Math.min(3, Number(a.value) || 1));
  if (a.op === 'transfer-adopt' && p.help === 3) {
    for (const c of transferChecks(review.tab, d))
      d.answers[
        review.tab === 'common'
          ? c.correct === 'different'
            ? 'consequences'
            : 'weigh'
          : 'claim'
      ] = c.correct;
    applyEvaluation(p, evaluateTransfer(review.tab, d));
    p.supported = true;
  }
  if (a.op === 'transfer-reset')
    review.records[review.tab] = { answers: {}, progress: newProgress() };
  return s;
}
export function restoreReview(
  s: State,
  validProgress: (v: unknown) => boolean,
) {
  const g = s.geography,
    r = g?.review;
  if (r) {
    if (
      !isReviewTab(r.tab) ||
      !r.records ||
      Object.keys(r.records).length !== 4 ||
      !['KEN', 'GHA', 'MAR', 'common'].every((key) => {
        const tab = key as ReviewTab,
          d = r.records[tab];
        return (
          d &&
          d.answers &&
          typeof d.answers === 'object' &&
          !Array.isArray(d.answers) &&
          Object.entries(d.answers).every(([k, v]) =>
            tab === 'common'
              ? k === 'consequences'
                ? ['different', 'same'].includes(v)
                : k === 'weigh' && ['evidence', 'any'].includes(v)
              : k === 'claim' && ['model', 'all'].includes(v),
          ) &&
          validProgress(d.progress)
        );
      })
    )
      delete g!.review;
    else
      for (const tab of Object.keys(r.records) as ReviewTab[]) {
        const d = r.records[tab];
        if (d.progress.complete) {
          d.progress.feedback = evaluateTransfer(tab, d).feedback;
          d.progress.complete = d.progress.feedback.complete;
        }
      }
  }
  if (s.screen === 'review' && !g) s.screen = 'start';
}
