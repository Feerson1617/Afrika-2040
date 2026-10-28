import type { Task } from './tasks.ts';
const words = {
  birth: ['Geburt', 'Ein Mensch kommt zur Welt.'],
  death: ['Sterbefall', 'Ein Mensch stirbt.'],
  arrival: ['Zuzug', 'Ein Mensch zieht in den Ort.'],
  departure: ['Fortzug', 'Ein Mensch zieht aus dem Ort weg.'],
  natural: ['Natürliche Veränderung', 'Geburten minus Sterbefälle.'],
  migration: ['Wanderungssaldo', 'Zuzug minus Fortzug.'],
  stock: ['Bestand', 'Zahl der Menschen zu einem Zeitpunkt.'],
  estimate: [
    'Schätzung',
    'Die Zahl wurde aus vorhandenen Daten berechnet. Sie kann später geändert werden.',
  ],
  million: ['Million', 'Eine Million sind tausend mal tausend.'],
  condition: [
    'Bedingung',
    'Etwas, das nötig ist, damit eine Folge eintreten kann.',
  ],
  walk: ['Fußweg', 'Der Weg zu Fuß zur Haltestelle.'],
  section: ['Busabschnitt', 'Nur der Teil der Linie, den die Person mitfährt.'],
  total: ['Gesamtzeit', 'Fußweg plus benutzte Busfahrt.'],
  describe: ['Beschreibe', 'Sage, was im Material steht.'],
  explain: ['Erkläre', 'Sage, wie Angaben zusammenhängen.'],
  justify: ['Begründe', 'Nutze einen passenden Beleg für deine Wahl.'],
} as const;
export function taskWords(task: Task) {
  const event = task.id.split('.').at(-1) as keyof typeof words;
  const keys: readonly (keyof typeof words)[] = task.id.includes('.event.')
    ? [event]
    : task.material === 'm2'
      ? ['estimate', 'million']
      : task.material === 'm4'
        ? ['condition']
        : task.material === 'kenia'
          ? ['walk', 'section', 'total']
          : task.id.includes('natural-direction')
            ? ['birth', 'death']
            : task.id.includes('migration-direction')
              ? ['arrival', 'departure']
              : ['natural', 'migration', 'stock'];
  return keys.map((key) => words[key]);
}
export function wordHelp(task: Task) {
  const render = (items: readonly (readonly [string, string])[]) =>
    items
      .map(([word, meaning]) => `<p><strong>${word}</strong>: ${meaning}</p>`)
      .join('');
  return `<details id="learning-words"><summary>Wörter zu diesem Schritt</summary>${render(taskWords(task))}<details id="learning-all-words"><summary>Alle Wörter ansehen</summary>${render(Object.values(words))}</details></details>`;
}
