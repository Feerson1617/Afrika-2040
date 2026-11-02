import {
  boarding,
  episode,
  lineSegments,
  lineStops,
  personNames,
  persons,
  routeNames,
  routes,
} from './content.ts';
import type { Person, Route } from './content.ts';
export function lineDuration(route: Route) {
  return lineSegments[route].reduce(
    (sum, segment) => sum + episode.times.bus[segment],
    0,
  );
}
export function journeyParts(person: Person, route: Route) {
  const board = boarding[person][route];
  const segments = lineSegments[route].slice(lineStops[route].indexOf(board));
  return { board, segments, walk: episode.times.walk[person][board]! };
}
export function journey(person: Person, route: Route) {
  const parts = journeyParts(person, route);
  const bus = parts.segments.reduce(
    (sum, segment) => sum + episode.times.bus[segment],
    0,
  );
  return { walk: parts.walk, bus, total: parts.walk + bus };
}
export type Evidence = `${Person}-${Route}-${Route}`;
export const evidenceIds: Evidence[] = persons.flatMap((person) =>
  routes.flatMap((route) =>
    routes
      .filter((other) => other !== route)
      .map((other) => `${person}-${route}-${other}` as Evidence),
  ),
);
export function evidenceParts(id: Evidence) {
  const [person, route, other] = id.split('-') as [Person, Route, Route];
  return { person, route, other };
}
export function evidenceLabel(id: Evidence) {
  const { person, route, other } = evidenceParts(id);
  return `${personNames[person]}: ${routeNames[route]} ${journey(person, route).total} statt ${routeNames[other]} ${journey(person, other).total} Minuten.`;
}
export function evidenceFits(
  id: Evidence | undefined,
  route: Route,
  kind: 'advantage' | 'disadvantage',
) {
  if (!id || !evidenceIds.includes(id)) return false;
  const parts = evidenceParts(id);
  if (parts.route !== route) return false;
  const delta =
    journey(parts.person, route).total -
    journey(parts.person, parts.other).total;
  return kind === 'advantage' ? delta < 0 : delta > 0;
}
export function differentPeople(a?: Evidence, b?: Evidence) {
  return Boolean(a && b && evidenceParts(a).person !== evidenceParts(b).person);
}
export function evidenceFor(route: Route): {
  advantage: Evidence;
  disadvantage: Evidence;
} {
  const examples: Record<
    Route,
    { advantage: Evidence; disadvantage: Evidence }
  > = {
    direct: {
      advantage: 'david-direct-north',
      disadvantage: 'amina-direct-north',
    },
    north: {
      advantage: 'amina-north-direct',
      disadvantage: 'david-north-direct',
    },
    south: {
      advantage: 'leila-south-direct',
      disadvantage: 'david-south-direct',
    },
  };
  return examples[route];
}
export const explanationChoices = {
  cause: {
    shorter: `Amina geht nur ${journey('amina', 'north').walk} statt ${journey('amina', 'direct').walk} Minuten zur Haltestelle.`,
    same: 'Aminas Fußweg bleibt gleich lang.',
    longer: 'Amina geht über Nord länger zu Fuß.',
  },
  effect: {
    total: `Deshalb braucht ihr ganzer Weg über Nord nur ${journey('amina', 'north').total} statt ${journey('amina', 'direct').total} Minuten.`,
    busOnly: 'Deshalb zählt nur die Zeit im Bus.',
    unchanged: 'Deshalb bleibt ihre Gesamtzeit gleich.',
  },
} as const;
export type Cause = keyof typeof explanationChoices.cause;
export type Effect = keyof typeof explanationChoices.effect;
export function explanationText() {
  return `${explanationChoices.cause.shorter} Sie steigt erst in Nord ein und fährt ${journey('amina', 'north').bus} Minuten im Bus. ${explanationChoices.effect.total} Die ganze Buslinie ab Platz dauert zwar ${lineDuration('north')} statt ${lineDuration('direct')} Minuten. Amina fährt aber nur den letzten Abschnitt.`;
}
