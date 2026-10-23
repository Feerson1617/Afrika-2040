export type Route = 'direct' | 'north' | 'south';
export type Person = 'amina' | 'david' | 'leila';
export type Step = 0 | 1 | 2 | 3 | 4 | 5;
export type Foot = 'platz' | 'nord' | 'sued';
export type Stop = Foot | 'zentrum';
export type Segment =
  'direct' | 'platzNord' | 'nordZentrum' | 'platzSued' | 'suedZentrum';
export const routes: Route[] = ['direct', 'north', 'south'];
export const persons: Person[] = ['amina', 'david', 'leila'];
export const episode = {
  id: 'kenia-bus-2a',
  country: 'Kenia',
  city: 'Nairobi',
  title: 'Welcher Busweg hilft wem?',
  modelNote:
    'Nairobi liegt in Kenia. Diese Nachbarschaft, die Personen und alle Zeiten sind erfunden. Keine echte Stadtkarte.',
  times: {
    walk: {
      amina: { platz: 12, nord: 2 },
      david: { platz: 2 },
      leila: { platz: 12, sued: 2 },
    } as Record<Person, Partial<Record<Foot, number>>>,
    bus: {
      direct: 10,
      platzNord: 8,
      nordZentrum: 8,
      platzSued: 8,
      suedZentrum: 8,
    },
  },
} as const;
export const lineStops: Record<Route, Stop[]> = {
  direct: ['platz', 'zentrum'],
  north: ['platz', 'nord', 'zentrum'],
  south: ['platz', 'sued', 'zentrum'],
};
export const lineSegments: Record<Route, Segment[]> = {
  direct: ['direct'],
  north: ['platzNord', 'nordZentrum'],
  south: ['platzSued', 'suedZentrum'],
};
export const boarding: Record<Person, Record<Route, Foot>> = {
  amina: { direct: 'platz', north: 'nord', south: 'platz' },
  david: { direct: 'platz', north: 'platz', south: 'platz' },
  leila: { direct: 'platz', north: 'platz', south: 'sued' },
};
export const routeNames: Record<Route, string> = {
  direct: 'Direkt',
  north: 'Über Nord',
  south: 'Über Süd',
};
export const stopNames: Record<Stop, string> = {
  platz: 'Platz',
  nord: 'Nord',
  sued: 'Süd',
  zentrum: 'Zentrum',
};
export const personNames: Record<Person, string> = {
  amina: 'Amina',
  david: 'David',
  leila: 'Leila',
};
export const criteria = {
  school: 'Ein kurzer Schulweg für Amina',
  market: 'Ein kurzer Weg zum Markt für David',
  training: 'Ein kurzer Weg zur Ausbildung für Leila',
  tradeoff: 'Vorteile und Nachteile für verschiedene Menschen abwägen',
} as const;
export type Criterion = keyof typeof criteria;
export const visibleRoutes = (step: Step) =>
  step < 4 ? routes.slice(0, 2) : routes;
export const visiblePersons = (step: Step) =>
  step < 4 ? persons.slice(0, 2) : persons;
export const tasks = [
  {
    label: 'Weg untersuchen',
    question: 'Zeige Aminas Weg zur Schule.',
    instruction:
      'Der Bus fährt zuerst direkt: Platz → Zentrum. Wähle den Fußweg und die Busfahrt.',
    hints: [
      'Wo hält der direkte Bus? Prüfe zuerst den Fußweg dorthin.',
      'Der direkte Bus fährt am Platz ab. Folge der gestrichelten Linie von Amina zum Platz.',
    ],
  },
  {
    label: 'Vorteil entdecken',
    question: 'Für wen wird der Weg über Nord kürzer?',
    instruction:
      'Wechsle den Busweg auf der Karte. Vergleiche Fußweg und Busfahrt zusammen.',
    hints: [
      'Die Busfahrt allein reicht nicht. Vergleiche den gesamten Weg.',
      'Schau auf Aminas Fußwege: zum Platz und nach Nord.',
    ],
  },
  {
    label: 'Nachteil untersuchen',
    question: 'Für wen dauert der Weg über Nord länger?',
    instruction:
      'Prüfe auch die andere Person. Vergleiche wieder den gesamten Weg.',
    hints: [
      'Wer steigt am Platz ein? Für diese Person kommt ein Busabschnitt dazu.',
      'Davids Fußweg bleibt gleich. Vergleiche seine Busfahrten.',
    ],
  },
  {
    label: 'Zusammenhang erklären',
    question: 'Warum ist Amina über Nord schneller?',
    instruction:
      'Die Buslinie ab Platz ist länger. Warum braucht Amina trotzdem weniger Zeit? Verbinde die Sätze oder schreibe selbst.',
    hints: [
      'Achte auf den Fußweg und auf Aminas Einstieg in den Bus.',
      'Amina steigt erst in Nord ein. Was ändert sich dadurch an ihrem ganzen Weg?',
    ],
  },
  {
    label: 'Leilas Wege testen',
    question: 'Ein Busweg für mehr Menschen?',
    instruction:
      'Leila wohnt im Süden. Sie lernt einen Beruf im Zentrum. Der neue Busweg fährt über Süd. Wird er für alle besser?',
    hints: [
      'Vermute zuerst, welcher Busweg Leila hilft. Teste dann ihre drei Wege.',
      'Wähle Leila unter der Karte. Wechsle zwischen Direkt, Über Nord und Über Süd. Vergleiche Fußweg und Busfahrt.',
    ],
  },
  {
    label: 'Vorschlag begründen',
    question: 'Welchen Busweg empfiehlst du?',
    instruction:
      'Nenne dein Ziel. Erkläre, wem dein Vorschlag hilft und für wen ein Nachteil entsteht. Alle drei Buswege sind möglich.',
    hints: [
      'Was ist dir wichtig? Denke auch an die Interessen einer anderen Person.',
      'Wähle Belege mit Zeiten. Achte darauf, welche beiden Buswege jeder Beleg vergleicht. Oder schreibe selbst.',
    ],
  },
] as const;
export const glossary = [
  [
    'Fußweg',
    'Der Teil des Weges, den du zu Fuß gehst. Hier: von zu Hause bis zur Haltestelle.',
  ],
  ['Busfahrt', 'Der Teil des Weges, den du im Bus fährst.'],
  ['Gesamtzeit', 'Die Zeit für den ganzen Weg. Hier: Fußweg plus Busfahrt.'],
  [
    'Beleg',
    'Eine Angabe, die deinen Gedanken stützt. Hier: Zeiten von zwei Buswegen vergleichen.',
  ],
  [
    'Kriterium',
    'Ein Maßstab für deine Entscheidung. Zum Beispiel: ein kurzer Schulweg.',
  ],
  [
    'Modell',
    'Ein vereinfachtes Beispiel. Es zeigt ausgewählte Zusammenhänge. Es bildet nicht alles ab.',
  ],
] as const;
