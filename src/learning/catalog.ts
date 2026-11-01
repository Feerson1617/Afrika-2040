import { profileIds } from './profiles.ts';
export const units = [
  'o',
  'a',
  'n',
  'c',
  'd',
  'e',
  's1',
  's2',
  's3',
  's4',
  's5',
  's6',
  'r',
] as const;
export const implementedUnits = ['a', 'n', 'c', 'd', 'e', 's1'] as const;
export type Unit = (typeof implementedUnits)[number];
export const isUnit = (value: unknown): value is Unit =>
  implementedUnits.includes(value as Unit);
export const unitNames: Record<Unit, string> = {
  a: 'Bilder und Orte',
  n: 'Natur und Wasser',
  c: 'Bevölkerung',
  d: 'Wirtschaft',
  e: 'Zukunft entscheiden',
  s1: 'Kenia · früher Vergleich',
};
export const chapters = [
  {
    id: 'pictures',
    name: 'Bilder und Orte',
    topic: 'image',
    episodes: [],
    areas: ['o', 'a'],
  },
  {
    id: 'nature',
    name: 'Natur und Wasser',
    topic: 'nature',
    episodes: ['water', 'area'],
    areas: ['n', 's5', 's6'],
  },
  {
    id: 'people',
    name: 'Menschen und Wege',
    topic: 'population',
    episodes: [],
    areas: ['c', 's1', 's2'],
  },
  {
    id: 'economy',
    name: 'Arbeit und Wirtschaft',
    topic: 'economy',
    episodes: ['cocoa', 'share'],
    areas: ['d', 's3', 's4'],
  },
  {
    id: 'future',
    name: 'Zukunft entscheiden',
    topic: 'future',
    episodes: [],
    areas: ['e', 'r'],
  },
] as const;
export const variantCatalog = units.flatMap((unit) =>
  profileIds.map((profileId) => ({
    areaId: `${unit}.${profileId}.v1`,
    unit,
    profileId,
    status: ['a', 'n', 'c', 'd', 'e'].includes(unit)
      ? 'implemented'
      : unit === 's1'
        ? 'early-comparison-only'
        : 'planned',
  })),
);
