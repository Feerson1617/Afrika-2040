import type { Task } from './tasks.ts';
import type { Unit } from './catalog.ts';
import type { ProfileId } from './profiles.ts';

// Keep the original definitions available for reading saved answers. Only the
// compulsory route is shorter; no answer is moved to another task or profile.
export function streamline(
  tasks: Task[],
  unit: Unit,
  profile: ProfileId,
): Task[] {
  let result = tasks;
  if (unit === 's1' && profile === 'esa') {
    const repeated = new Set([
      'kenia.times.amina-direct',
      'kenia.times.david-direct',
      'kenia.full.times.direct',
      'kenia.full.times.north',
      'kenia.event.times.north',
      'kenia.event.times.south',
    ]);
    result = result
      .filter((t) => !repeated.has(t.id))
      .map((t) => {
        if (t.id === 'kenia.times.amina-north')
          return {
            ...t,
            explained:
              'Beispiel Amina Direkt: 12 Minuten zu Fuß + 10 Minuten Bus = 22 Minuten. Über Nord steigt sie später ein. Rechne ihren Weg selbst.',
          };
        if (t.id === 'kenia.effects')
          return {
            ...t,
            explained:
              'Zum Vergleichen: David Direkt braucht 2 Minuten zu Fuß + 10 Minuten Bus = 12 Minuten. Nutze auch deine eigenen Rechnungen.',
          };
        return t;
      });
  }
  if (unit === 'e') {
    const comparison = tasks.find((t) => t.id === 'future.goal')!.focus!;
    result = result
      .filter(
        (t) =>
          !['future.investment', 'future.running', 'future.uncertainty'].some(
            (id) => t.id === id || t.id.startsWith(id + '.'),
          ),
      )
      .map((t) =>
        t.id.startsWith('future.reach')
          ? {
              ...t,
              title: 'Vergleiche die beiden Angebote.',
              focus: {
                ...comparison,
                paragraphs: comparison.paragraphs.slice(0, 1),
              },
              contextNote:
                'Einmalig: nur bei der Anschaffung. Monatlich: jeden Monat erneut bezahlen.',
            }
          : t,
      );
  }
  if (unit === 'r' && (profile === 'foerder' || profile === 'esa')) {
    result = result.filter(
      (t) => !['review.GHA.scope', 'review.MAR.scope'].includes(t.id),
    );
    const scope = result.find((t) => t.id === 'review.KEN.scope')!;
    const general = {
      ...scope,
      id: 'review.scope',
      conceptId: 'review.scope',
      title: 'Was zeigen die drei Modelle nicht?',
      fields: scope.fields.map((f) => ({
        ...f,
        label:
          'Gelten die erfundenen Wege, Betriebe und Tanks für das ganze jeweilige Land?',
        explanation:
          'Nein. Jedes Modell zeigt nur den erfundenen Fall. Es beschreibt weder alle Wege in Kenia noch alle Betriebe in Ghana oder den Wasserhaushalt Marokkos.',
      })),
      simulation: { kind: 'review' as const },
      hints: [
        'Vergleiche den Ort im Beispiel mit dem ganzen Land.',
        'Die Modelle zeigen bestimmte Wege, einen Betrieb und einen Tank. Welche anderen Orte fehlen?',
        'Die erfundenen Fälle stehen nicht für das ganze jeweilige Land.',
      ] as Task['hints'],
    };
    result = result.filter((t) => t.id !== scope.id);
    result.splice(3, 0, general);
  }
  return result.map((t) => {
    if (t.id.startsWith('cocoa.chain.'))
      return {
        ...t,
        workspace: 'cocoa-chain',
        title: 'Kakaobohnen verarbeiten',
      };
    if (
      t.focus?.topic === 'image' &&
      /image\.(headline|perspective|revision)/.test(t.id)
    )
      return { ...t, focus: { ...t.focus, comparePictures: true } };
    return t;
  });
}
