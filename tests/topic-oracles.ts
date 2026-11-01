// Fixed, independently specified answers: never derive a regular answer from exampleValue or expected.
import type { Task } from '../src/learning/tasks.ts';
export function topicAnswers(
  t: Task,
  plan: 'cool' | 'shade' = 'cool',
): Record<string, string> {
  const id = t.id;
  if (id === 'image.initial') return { idea: 'uncertain' };
  if (id.startsWith('image.observe'))
    return { built: 'gate', income: 'unknown' };
  if (id.startsWith('image.second'))
    return { built: 'walkway', scope: 'limited' };
  if (id.startsWith('image.headline'))
    return { evidence: 'built', revision: 'places' };
  if (id.startsWith('image.'))
    return {
      explanation:
        'Die Fotos zeigen gebaute Wege und ein Markttor in Ghana. Ein einzelnes Waldfoto kann den Blick auf Natur verengen. Auch zwei Fotos zeigen nicht ganz Afrika.',
    };
  if (id === 'nature.calendar.ghana') return { wet: 'may-sep' };
  if (id === 'nature.calendar.morocco') return { wet: 'oct-apr' };
  if (id.startsWith('nature.use'))
    return { growth: 'conditions', limit: 'limited' };
  if (id.startsWith('nature.regions'))
    return { higher: 'tanger', access: 'no' };
  if (id.startsWith('nature.concepts'))
    return { savanna: 'savanna', cycle: 'evaporation' };
  if (id === 'nature.transfer') return { duration: 'shorter' };
  if (id === 'nature.equal-total') return { supply: 'no' };
  if (id === 'nature.recommend')
    return {
      explanation:
        'In Nordghana kann Regen von Mai bis September gesammelt werden. Der Vorrat muss zur Nutzung in der Trockenzeit reichen. Dafür fehlen Angaben zu Bedarf und Speichergröße.',
    };
  if (id.startsWith('economy.balance'))
    return {
      surplus: 'a',
      scope: 'no',
      'surplus-a': '80',
      'surplus-b': '60',
      first: '20',
    };
  if (id.startsWith('economy.data'))
    return { access: 'share', growth: 'country' };
  if (id.startsWith('economy.conditions'))
    return { pair: 'together', proof: 'no' };
  if (id.startsWith('economy.transfer'))
    return { cause: 'no', distribution: 'distribution' };
  if (id === 'economy.explain')
    return {
      explanation:
        'GEPA berichtet über Wissen zu Preisen und Transport. Zuverlässiger Strom könnte Maschinenbetrieb ermöglichen. Der Anteil mit Zugang belegt keine Ausfallsicherheit und keinen Gewinn für alle.',
    };
  if (id.startsWith('future.reach')) return { reach: 'shade' };
  if (id.startsWith('future.investment')) return { investment: 'shade' };
  if (id.startsWith('future.running')) return { running: 'both' };
  if (id.startsWith('future.ecology'))
    return { energy: 'cool', materials: 'no' };
  if (id === 'future.goal')
    return { goal: plan === 'cool' ? 'access' : 'loss' };
  if (id === 'future.plan') return { plan };
  if (id === 'future.evidence') return { evidence: plan };
  if (id === 'future.limit') return { limit: plan };
  if (id === 'future.weight') return { weight: 'tradeoff' };
  if (id === 'future.uncertainty') return { question: 'maintenance' };
  if (id === 'future.revision') return { revision: 'keep' };
  if (id === 'future.judgment')
    return {
      explanation:
        plan === 'cool'
          ? 'Ich gewichte die Kühlung empfindlicher Ware stärker. Dafür akzeptiere ich nur 30 Stände und Energiebedarf.'
          : 'Ich gewichte Zugang für 60 Stände stärker. Dafür nehme ich geringere Kühlung empfindlicher Ware in Kauf.',
    };
  if (id === 'future.relation')
    return {
      explanation:
        'Laufende Kosten können den Zugang beeinflussen. Bei beiden Plänen ist Pflege nötig. Ich brauche Angaben zur Zuständigkeit und Finanzierung, bevor ich die Verlässlichkeit beurteilen kann.',
    };
  throw Error('Missing independent answer for ' + id);
}
