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
export type Unit = 'c' | 's1';
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
    status:
      unit === 'c'
        ? 'implemented'
        : unit === 's1'
          ? 'early-comparison-only'
          : 'planned',
  })),
);
