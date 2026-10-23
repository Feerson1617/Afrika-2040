import { episode, personNames } from './content.ts';
import type { Person, Route } from './content.ts';

export function journey(person: Person, route: Route) {
  const t = episode.times;
  const walk =
    person === 'amina'
      ? route === 'direct'
        ? t.walk.amina.platz
        : t.walk.amina.nord
      : t.walk.david.platz;
  const bus =
    route === 'direct'
      ? t.bus.direct
      : person === 'amina'
        ? t.bus.nordZentrum
        : t.bus.platzNord + t.bus.nordZentrum;
  return { walk, bus, total: walk + bus };
}

export type Evidence = `${Person}-${Route}`;
export const evidenceIds: Evidence[] = [
  'amina-north',
  'david-direct',
  'amina-direct',
  'david-north',
];

export function evidenceLabel(id: Evidence) {
  const [person, route] = id.split('-') as [Person, Route];
  const here = journey(person, route).total;
  const other = journey(person, route === 'direct' ? 'north' : 'direct').total;
  return `${personNames[person]} braucht ${here} statt ${other} Minuten.`;
}

export function evidenceFor(route: Route) {
  return route === 'north'
    ? {
        advantage: 'amina-north' as Evidence,
        disadvantage: 'david-north' as Evidence,
      }
    : {
        advantage: 'david-direct' as Evidence,
        disadvantage: 'amina-direct' as Evidence,
      };
}
