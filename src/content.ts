export type Route = 'direct' | 'north';
export type Person = 'amina' | 'david';
export type Step = 0 | 1 | 2 | 3;
export type Foot = 'platz' | 'nord';

export const episode = {
  id: 'kenia-bus-1',
  country: 'Kenia',
  city: 'Nairobi',
  title: 'Welcher Busweg hilft wem?',
  modelNote:
    'Nairobi liegt in Kenia. Diese Nachbarschaft, die Personen und alle Zeiten sind erfunden.',
  times: {
    walk: { amina: { platz: 12, nord: 2 }, david: { platz: 2 } },
    bus: { direct: 10, platzNord: 8, nordZentrum: 8 },
  },
} as const;

export const routeNames: Record<Route, string> = {
  direct: 'Direkt',
  north: 'Über Nord',
};
export const personNames: Record<Person, string> = {
  amina: 'Amina',
  david: 'David',
};

export const tasks = [
  {
    label: 'Weg untersuchen',
    question: 'Zeige Aminas Weg zur Schule.',
    instruction:
      'Der Bus fährt zuerst direkt: Platz → Zentrum. Wähle den Fußweg und die Busfahrt.',
    hints: [
      'Wo hält der direkte Bus? Prüfe zuerst den Fußweg dorthin.',
      'Der direkte Bus fährt am Platz ab. Folge der gestrichelten Linie von Amina zum Platz.',
      'Amina geht 12 Minuten zum Platz. Dann fährt sie 10 Minuten im Bus. Zusammen sind das 22 Minuten.',
    ],
  },
  {
    label: 'Vorteil entdecken',
    question: 'Für wen wird der Weg über Nord kürzer?',
    instruction:
      'Wechsle den Busweg auf der Karte. Vergleiche Fußweg und Busfahrt zusammen.',
    hints: [
      'Die Busfahrt allein reicht nicht. Vergleiche für jede Person den gesamten Weg.',
      'Schau auf Aminas Fußwege: zum Platz 12 Minuten, nach Nord nur 2 Minuten.',
      'Für Amina wird der Weg kürzer: über Nord 2 + 8 = 10 Minuten, direkt 12 + 10 = 22 Minuten.',
    ],
  },
  {
    label: 'Nachteil untersuchen',
    question: 'Für wen dauert der Weg über Nord länger?',
    instruction:
      'Prüfe auch die andere Person. Vergleiche wieder den gesamten Weg.',
    hints: [
      'Wer steigt am Platz ein? Für diese Person kommt ein Busabschnitt dazu.',
      'David geht bei beiden Buswegen 2 Minuten zum Platz. Vergleiche seine Busfahrten.',
      'Für David dauert es länger: über Nord 2 + 16 = 18 Minuten, direkt 2 + 10 = 12 Minuten.',
    ],
  },
  {
    label: 'Vorschlag begründen',
    question: 'Welchen Busweg schlägst du vor?',
    instruction:
      'Nenne einen Vorteil mit Beleg und einen Nachteil. Beide Buswege sind möglich.',
    hints: [
      'Dein Vorschlag darf einer Person besonders helfen. Denke auch an die andere Person.',
      'Wähle einen Vorteil und einen Nachteil mit Zeiten aus der Karte. Oder schreibe deine Gedanken auf.',
      'Über Nord hilft Amina: 10 statt 22 Minuten. David braucht dann 18 statt 12 Minuten. Direkt hilft David, aber Amina braucht länger. Begründe, was dir wichtiger ist.',
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
    'Eine Angabe, die deinen Gedanken stützt. Zum Beispiel: Amina braucht 10 statt 22 Minuten.',
  ],
  [
    'Modell',
    'Ein vereinfachtes Beispiel. Es zeigt ausgewählte Zusammenhänge. Es bildet nicht alles ab.',
  ],
] as const;
