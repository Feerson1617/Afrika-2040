import { personNames, routeNames, routes } from './content.ts';
import { evidenceFits, evidenceFor, evidenceLabel, evidenceParts, journey } from './model.ts';
import type { Decision } from './feedback.ts';

export const decisionPanels = ['plan', 'advantage', 'disadvantage', 'weigh'] as const;
export type DecisionPanel = typeof decisionPanels[number];
const goalPeople = { school: 'amina', market: 'david', training: 'leila' } as const;
export function goalStatus(d: Decision) {
  if (!d.route || !d.criterion || d.criterion === 'tradeoff') return undefined;
  const person = goalPeople[d.criterion];
  const best = routes.reduce((a, b) => journey(person, a).total <= journey(person, b).total ? a : b);
  const current = journey(person, d.route).total;
  const fastest = journey(person, best).total;
  return { person, best, current, fastest, conflict: current > fastest };
}
export function goalMessage(d: Decision): string {
  const g = goalStatus(d);
  if (!g || !d.route) return '';
  return g.conflict
    ? `Du möchtest einen kurzen Weg für ${personNames[g.person]}. ${routeNames[d.route]}: ${g.current} Minuten. ${routeNames[g.best]}: nur ${g.fastest} Minuten. Dein Vorschlag erfüllt dieses Ziel weniger gut.`
    : `${personNames[g.person]} braucht ${routeNames[d.route]} ${g.current} Minuten. Das ist hier der kürzeste Weg.`;
}
export function hasWeighting(d: Decision): boolean {
  if (!d.route || !d.weighting || d.weighting !== d.advantage || !evidenceFits(d.weighting, d.route, 'advantage')) return false;
  const g = goalStatus(d);
  return !g?.conflict || (d.acceptConflict === true && evidenceParts(d.weighting).person !== g.person);
}
export function weightingChoice(d: Decision): string {
  if (!d.route || !evidenceFits(d.advantage, d.route, 'advantage')) return '';
  const g = goalStatus(d);
  if (g?.conflict && evidenceParts(d.advantage!).person === g.person) return '';
  const { person, other } = evidenceParts(d.advantage!);
  return `${g?.conflict ? 'Trotzdem ist mir' : 'Mir ist'} ${personNames[person]}s kürzerer Weg wichtiger: ${journey(person, d.route).total} statt ${journey(person, other).total} Minuten.`;
}
export function weightingProduct(d: Decision): string {
  if (!hasWeighting(d)) return '';
  const g = goalStatus(d);
  return `${g?.conflict ? `${goalMessage(d)} Ich nehme den längeren Weg für ${personNames[g.person]} in Kauf. ` : ''}${weightingChoice(d)}${d.disadvantage && evidenceFits(d.disadvantage, d.route!, 'disadvantage') ? ` Dafür nehme ich diesen Nachteil in Kauf: ${evidenceLabel(d.disadvantage)}` : ''}`;
}
export function decisionExample(d: Decision): Decision | undefined {
  if (!d.route || !d.criterion) return undefined;
  const example = { ...d, ...evidenceFor(d.route), supported: true, ungraded: undefined };
  return { ...example, weighting: example.advantage, acceptConflict: goalStatus(example)?.conflict || undefined, panel: 'weigh' };
}
