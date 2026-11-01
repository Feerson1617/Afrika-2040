/** Task-bound fictional cases. The checked episode models remain unchanged. */
const demand = { people: 18, seatsPerTrip: 10, trips: 2, walk: 12 } as const;
const water = { initial: 70, withdrawal: 50 } as const;
const area = { initial: 80, first: 45, extra: 10, former: 60 } as const;
export const transferCases = {
  'demand-18': { ...demand, capacity: demand.seatsPerTrip * demand.trips },
  'water-70': { ...water, remaining: water.initial - water.withdrawal },
  'area-10': {
    ...area,
    total: area.first + area.extra,
    remaining: area.initial - area.first - area.extra,
    saving: area.former - area.first - area.extra,
  },
} as const;
export type TransferCaseId = keyof typeof transferCases;
export const transferContext = {
  'demand-18': `Neuer Fall: ${transferCases['demand-18'].people} Menschen, ${transferCases['demand-18'].capacity} Plätze pro Stunde. Der betrachtete Fußweg bleibt ${transferCases['demand-18'].walk} Minuten lang. Beantworte die Frage zum neuen Fall.`,
  'water-70': `Neue Runde: ${water.initial} WE im Tank, ${water.withdrawal} WE Entnahme. Kein Zufluss. Beantworte die Frage zu dieser Runde.`,
  'area-10': `Neues Zusatzfeld: ${area.first} WE für das erste Feld, ${area.extra} WE für das Zusatzfeld. Tank am Anfang: ${area.initial} WE. Früher wurden ${area.former} WE entnommen. Beantworte die Frage zum neuen Fall.`,
} as const;
