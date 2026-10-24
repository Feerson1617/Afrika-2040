// All quantities describe one invented hour, never measured Nairobi statistics.
export const demandEpisode = {
  title: 'Mehr Menschen – reicht der Bus noch?',
  previousPeople: 16,
  newcomers: 8,
  trips: 2,
  seatsPerTrip: 10,
  extraTrips: 1,
  walk: 12,
  shortcutWalk: 4,
} as const;
export const measures = ['bus', 'path'] as const;
export type Measure = (typeof measures)[number];
export const measureNames = {
  bus: 'Eine zusätzliche Busfahrt',
  path: 'Ein kürzerer Fußweg',
} as const;
export const demandGoals = {
  capacity: 'Alle sollen in dieser Stunde mitfahren können.',
  access: 'Ein kurzer Fußweg für die neuen Nachbarn.',
} as const;
export type DemandGoal = keyof typeof demandGoals;
export const demandScreens = [
  'demand-check',
  'demand-explore',
  'demand-decide',
  'demand-end',
] as const;
export type DemandScreen = (typeof demandScreens)[number];
