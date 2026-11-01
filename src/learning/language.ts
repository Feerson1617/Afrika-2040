import type { Task } from './tasks.ts';
const substitutions: readonly (readonly [string, string])[] = [
  [
    'Beide Vorschläge sind legitim. Passende Belege und Grenzen gehören dazu.',
    'Du darfst beide Vorschläge wählen. Beleg und Nachteil müssen dazu passen.',
  ],
  [
    'Eine legitime Wahl ersetzt noch keinen passenden Sachbeleg.',
    'Deine Wahl ist erlaubt. Der Beleg muss dazu passen.',
  ],
  [
    'Du darfst selbst gewichten.',
    'Du darfst selbst wählen, was dir wichtiger ist.',
  ],
  [
    'Beide Ziele sind möglich. Du kannst später bewusst anders gewichten.',
    'Beide Ziele sind möglich. Du kannst später ein anderes Ziel wichtiger finden.',
  ],
  ['Beide Prioritäten sind möglich.', 'Du darfst beide Wege wählen.'],
  [
    'Eine Priorität ist keine falsche Rechnung. Beide Folgen müssen stimmen.',
    'Du darfst entscheiden, was dir wichtiger ist. Beide Zeitangaben müssen stimmen.',
  ],
  [
    'Du darfst beide Zeitfolgen unterschiedlich gewichten.',
    'Du darfst entscheiden, welche Zeitfolge dir wichtiger ist.',
  ],
  [
    'Prüfe die Einheit: Was wurde mit den Stromwerten überhaupt erfasst?',
    'Was zeigen die Stromwerte? Lies die Einheit.',
  ],
  [
    'Die Tabelle erfasst Stromzugang.',
    'Die Tabelle zeigt den Zugang zu Strom.',
  ],
];
export function simpleTask(t: Task): Task {
  if (!t.simpleLanguage) return t;
  const text = (v: string) =>
    substitutions
      .reduce((s, [a, b]) => s.replaceAll(a, b), v)
      .replace(
        /\bGEPA\b/,
        'GEPA (Ghanas Organisation für Verkäufe ins Ausland)',
      )
      .replace(/\bWDI\b/, 'Weltbank-Daten (WDI)');
  return {
    ...t,
    instruction: text(t.instruction),
    hints: t.hints.map(text) as Task['hints'],
    fields: t.fields.map((f) => ({
      ...f,
      label: text(f.label),
      explanation: text(f.explanation),
    })),
    ...(t.focus
      ? { focus: { ...t.focus, paragraphs: t.focus.paragraphs.map(text) } }
      : {}),
  };
}
