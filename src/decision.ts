import type { Situation } from './content.ts';
import { personNames, routeNames, routes } from './content.ts';
import {
  evidenceFits,
  evidenceFor,
  evidenceLabel,
  evidenceParts,
  journey,
} from './model.ts';
import type { Decision } from './feedback.ts';

export const decisionPanels = [
  'plan',
  'advantage',
  'disadvantage',
  'weigh',
] as const;
export type DecisionPanel = (typeof decisionPanels)[number];
const goalPeople = {
  school: 'amina',
  market: 'david',
  training: 'leila',
} as const;
export function goalStatus(d: Decision, situation: Situation = 'before') {
  if (!d.route || !d.criterion || d.criterion === 'tradeoff') return undefined;
  const person = goalPeople[d.criterion];
  const best = routes.reduce((a, b) =>
    journey(person, a, situation).total <= journey(person, b, situation).total
      ? a
      : b,
  );
  const current = journey(person, d.route, situation).total;
  const fastest = journey(person, best, situation).total;
  return { person, best, current, fastest, conflict: current > fastest };
}
export function goalMessage(
  d: Decision,
  situation: Situation = 'before',
): string {
  const g = goalStatus(d, situation);
  if (!g || !d.route) return '';
  return g.conflict
    ? `Du möchtest einen kurzen Weg für ${personNames[g.person]}. ${routeNames[d.route]}: ${g.current} Minuten. ${routeNames[g.best]}: nur ${g.fastest} Minuten. Dein Vorschlag erfüllt dieses Ziel weniger gut.`
    : `${personNames[g.person]} braucht ${routeNames[d.route]} ${g.current} Minuten. Das ist hier der kürzeste Weg.`;
}
export function hasWeighting(
  d: Decision,
  situation: Situation = 'before',
): boolean {
  if (
    !d.route ||
    !d.weighting ||
    d.weighting !== d.advantage ||
    !evidenceFits(d.weighting, d.route, 'advantage', situation)
  )
    return false;
  const g = goalStatus(d, situation);
  return (
    !g?.conflict ||
    (d.acceptConflict === true &&
      evidenceParts(d.weighting).person !== g.person)
  );
}
export function weightingChoice(
  d: Decision,
  situation: Situation = 'before',
): string {
  if (!d.route || !evidenceFits(d.advantage, d.route, 'advantage', situation))
    return '';
  const g = goalStatus(d, situation);
  if (g?.conflict && evidenceParts(d.advantage!).person === g.person) return '';
  const { person, other } = evidenceParts(d.advantage!);
  return `${g?.conflict ? 'Trotzdem ist mir' : 'Mir ist'} ${personNames[person]}s kürzerer Weg wichtiger: ${journey(person, d.route, situation).total} statt ${journey(person, other, situation).total} Minuten.`;
}
export function weightingProduct(
  d: Decision,
  situation: Situation = 'before',
): string {
  if (!hasWeighting(d, situation)) return '';
  const g = goalStatus(d, situation);
  return `${g?.conflict ? `${goalMessage(d, situation)} Ich nehme den längeren Weg für ${personNames[g.person]} in Kauf. ` : ''}${weightingChoice(d, situation)}${d.disadvantage && evidenceFits(d.disadvantage, d.route!, 'disadvantage', situation) ? ` Dafür nehme ich diesen Nachteil in Kauf: ${evidenceLabel(d.disadvantage, situation)}` : ''}`;
}
export function decisionExample(
  d: Decision,
  situation: Situation = 'before',
): Decision | undefined {
  if (!d.route || !d.criterion) return undefined;
  const example = {
    ...d,
    ...evidenceFor(d.route),
    supported: true,
    ungraded: undefined,
  };
  return {
    ...example,
    weighting: example.advantage,
    acceptConflict: goalStatus(example, situation)?.conflict || undefined,
    panel: 'weigh',
  };
}
