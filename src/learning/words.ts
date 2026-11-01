import { topics } from '../inquiry/content.ts';
import { topicTasks } from './topic-variants.ts';
import { profileIds } from './profiles.ts';
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
const addedWords: [string, string][] = [
  ['Entnahme', 'Wasser, das aus dem Tank herausgenommen wird.'],
  [
    'Tankrest',
    'Wasser, das nach der Entnahme im Tank bleibt. Kein Grundwasserbestand.',
  ],
  [
    'Verbrauch',
    'Zum Beispiel Wasser, das verdunstet und vor Ort zunächst nicht wieder nutzbar ist. Hier nicht berechnet.',
  ],
  ['Nachfrage', 'Wie viele Menschen in dieser Modellstunde fahren möchten.'],
  ['Kapazität', 'Wie viele Plätze in einer Stunde angeboten werden.'],
  ['Einnahmen', 'Geld, das ein Betrieb bekommt.'],
  ['Überschuss', 'Einnahmen minus laufende Ausgaben.'],
  ['Investition', 'Eine Anschaffung, die hier einmal bezahlt wird.'],
  [
    'Verdunstung',
    'Flüssiges Wasser wird zu Wasserdampf und gelangt in die Luft.',
  ],
  ['Atmosphäre', 'Die Lufthülle der Erde.'],
  ['Marktstand', 'Ein Platz auf einem Markt, an dem Waren verkauft werden.'],
  ['Kühlraum', 'Ein gekühlter Raum, der empfindliche Waren schützen kann.'],
  [
    'Mehrwegkiste',
    'Eine Kiste, die nach Reinigung erneut genutzt werden kann.',
  ],
  [
    'Zugang',
    'Ein Angebot erreichen oder nutzen können. Hier zum Beispiel Strom oder einen Kühlraum.',
  ],
  [
    'Verteilung',
    'Wie sich etwas auf verschiedene Menschen oder Gruppen verteilt.',
  ],
  ['Wartung', 'Etwas regelmäßig prüfen und pflegen.'],
  ['Prozent', 'Von hundert. 50 Prozent bedeutet 50 von 100.'],
  [
    'BIP',
    'Bruttoinlandsprodukt: wirtschaftlicher Wert, der in einem Land in einem Jahr neu entsteht. Kein Betriebskontostand.',
  ],
  ['Preisbereinigt', 'Der Einfluss veränderter Preise ist herausgerechnet.'],
  [
    'Einkommen',
    'Geld, das Menschen erhalten. Die Stromzugangsstatistik misst es nicht.',
  ],
  ['Ressourcen', 'Material und Energie, die für etwas gebraucht werden.'],
];
const wordKey = (word: string) =>
  word
    .normalize('NFC')
    .replace(/\s*\(.*?\)/g, '')
    .trim()
    .toLocaleLowerCase('de-DE');
// One shared, finite glossary; current-step terms stay first and optional.
export const allWords: readonly (readonly [string, string])[] = [
  ...new Map(
    [
      ...Object.values(words),
      ...addedWords,
      ...(['a', 'n', 'd', 'e'] as const).flatMap((unit) =>
        profileIds.flatMap((profile) =>
          topicTasks(unit, profile).flatMap((task) => task.focus?.words ?? []),
        ),
      ),
      ...Object.values(topics).flatMap((topic) =>
        topic.terms.split('\n').flatMap((line) => {
          const i = line.indexOf(':');
          return i < 0
            ? []
            : [
                [line.slice(0, i), line.slice(i + 1).trim()] as [
                  string,
                  string,
                ],
              ];
        }),
      ),
    ]
      .map((entry) => [wordKey(entry[0]), entry] as const)
      .reverse(),
  ).values(),
].reverse();
const byName = (...names: string[]) =>
  names.map((name) =>
    allWords.find(([word]) => wordKey(word) === wordKey(name))!,
  );
export function taskWords(task: Task) {
  if (task.simulation?.kind === 'water' || task.simulation?.kind === 'area')
    return byName('Entnahme', 'Tankrest', 'Verbrauch');
  if (task.simulation?.kind === 'cocoa')
    return byName('Einnahmen', 'Überschuss', 'Investition');
  if (task.simulation?.kind === 'share')
    return byName('Verteilung', 'Überschuss');
  if (task.simulation?.kind === 'network')
    return byName('Fußweg', 'Busabschnitt', 'Gesamtzeit');
  if (task.simulation?.kind === 'demand')
    return byName('Nachfrage', 'Kapazität', 'Zugang');
  if (task.id.startsWith('economy.data'))
    return task.fields.some((f) => f.id === 'growth')
      ? byName('Zugang', 'Prozent', 'BIP', 'Preisbereinigt')
      : byName('Zugang', 'Prozent');
  if (task.id.startsWith('economy.transfer'))
    return byName('Zugang', 'Verteilung', 'Einkommen');
  if (
    task.id.startsWith('nature.concepts') &&
    task.fields.some((f) => f.id === 'cycle')
  )
    return byName('Verdunstung', 'Atmosphäre', 'Niederschlag');
  if (task.id.startsWith('future.reach')) return byName('Marktstand', 'Zugang');
  if (task.id.startsWith('future.investment')) return byName('Investition');
  if (task.id.startsWith('future.ecology'))
    return byName('Kühlraum', 'Mehrwegkiste', 'Ressourcen');
  if (task.id === 'future.plan')
    return byName('Kühlraum', 'Mehrwegkiste', 'Marktstand');
  if (
    ['future.uncertainty', 'future.revision', 'future.relation'].includes(
      task.id,
    )
  )
    return byName('Wartung');
  if (task.focus) return task.focus.words;
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
  return `<details id="learning-words"><summary>Wörter zu diesem Schritt</summary>${render(taskWords(task))}<details id="learning-all-words"><summary>Alle Wörter ansehen</summary>${render(allWords)}</details></details>`;
}
