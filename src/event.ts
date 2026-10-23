import { personNames, routeNames, routes } from './content.ts';
import type { Route, Situation } from './content.ts';
import { journey } from './model.ts';
import { goalStatus, hasWeighting, weightingChoice } from './decision.ts';
import type { Decision, Feedback } from './feedback.ts';
import { evaluateDecision } from './feedback.ts';
import type { Progress } from './state.ts';

export const eventScreens = [
  'event-find',
  'event-effects',
  'event-review',
  'event-end',
] as const;
export type EventScreen = (typeof eventScreens)[number];
export const eventPaths = [
  'leila-platz',
  'leila-sued',
  'bus',
  'amina',
  'south-area',
] as const;
export type EventPath = (typeof eventPaths)[number];
export const connections = {
  sued: 'Zur Haltestelle Süd',
  platz: 'Zur Haltestelle Platz',
  zentrum: 'Zu Fuß bis ins Zentrum',
} as const;
export const eventCauses = {
  unchanged: 'Dieser Fußweg bleibt frei.',
  buses: 'Die Busfahrt dauert länger.',
  allWalks: 'Alle Fußwege sind länger.',
} as const;
export interface RoadState {
  original: Decision;
  originalSupported?: boolean;
  view: Situation;
  path?: EventPath;
  find: Progress;
  effects: Progress;
  revision: Progress;
  answers: Partial<Record<Route, 'longer' | 'same'>>;
  compared: boolean;
  connection?: keyof typeof connections;
  cause?: keyof typeof eventCauses;
  explanationText: string;
  explanationUngraded?: boolean;
  explanationSupported?: boolean;
  review: Decision;
  changeEvidence?: Route;
  reason?: 'goal' | 'priority';
}
export function effectsMatch(road: RoadState) {
  return routes.every(
    (route) =>
      road.answers[route] ===
      (journey('leila', route, 'now').total > journey('leila', route).total
        ? 'longer'
        : 'same'),
  );
}
export function changeLabel(route: Route) {
  const before = journey('leila', route).total,
    now = journey('leila', route, 'now').total;
  return `Leila · ${routeNames[route]}: ${before} → ${now} Minuten (${now === before ? 'gleich' : '+' + (now - before)}).`;
}
export function eventExplanation() {
  return `Leila geht zur Haltestelle Süd. Dieser Fußweg ist nicht betroffen. Deshalb bleibt ihr ganzer Weg bei ${journey('leila', 'south', 'now').total} Minuten.`;
}
export function revisionReason(road: RoadState, reason = road.reason): string {
  const d = road.review;
  if (!d.route) return '';
  const start =
    d.route === road.original.route
      ? `Ich bleibe bei ${routeNames[d.route]}.`
      : `Ich wechsle zu ${routeNames[d.route]}.`;
  if (reason === 'goal') {
    const g = goalStatus(d, 'now');
    if (!g || g.conflict) return '';
    return `${start} ${personNames[g.person]} braucht ${g.current} Minuten. Dieser kurze Weg ist mir wichtig.`;
  }
  if (reason === 'priority' && hasWeighting(d, 'now'))
    return `${start} ${weightingChoice(d, 'now')}`;
  return '';
}

export function eventSituation(screen: string, road?: RoadState): Situation {
  return screen.startsWith('event-') && road ? road.view : 'before';
}

export function evaluateRevision(
  road: RoadState,
  persisted: boolean,
): Feedback {
  const base = evaluateDecision(road.review, persisted, 'now');
  const ungraded = road.review.ungraded && Boolean(road.review.text.trim());
  const validChange =
    road.changeEvidence === road.review.route && Boolean(road.changeEvidence);
  const reason = revisionReason(road);
  return {
    kind: 'neutral',
    title: ungraded
      ? 'Bewusst unbewertet überarbeitet'
      : base.complete && validChange && reason
        ? 'Deine Empfehlung erneut geprüft'
        : 'Deine erneute Begründung prüfen',
    text: `${base.text} ${road.changeEvidence ? changeLabel(road.changeEvidence) : 'Wähle noch einen Vorher-Jetzt-Beleg.'} ${!validChange && !ungraded ? 'Zeige Leilas Zeit für die Linie, die du jetzt empfiehlst.' : ''} ${reason || (ungraded ? 'Deine eigene Begründung bleibt ungeprüft.' : 'Wähle konkret, welche Folge dir jetzt wichtiger ist.')}`,
    complete: base.complete && Boolean(ungraded || (validChange && reason)),
  };
}

export function revisionDraft(original: Decision): Decision {
  return {
    ...structuredClone(original),
    text: '',
    supported: undefined,
    ungraded: undefined,
    weighting: undefined,
    acceptConflict: undefined,
  };
}
