// Fixed answers derived from the protected design table, not exampleValue or model functions.
export function episodeAnswers(t: {
  id: string;
}): Record<string, string> | undefined {
  const id = t.id;
  if (id === 'kenia.full.explore') return { boarding: 'sued' };
  if (id === 'kenia.full.leila') return { fastest: 'south' };
  if (id.startsWith('kenia.full.times'))
    return { direct: '22', north: '28', south: '10' };
  if (id === 'kenia.event.path') return { path: 'leila-platz' };
  if (id.startsWith('kenia.event.times'))
    return { direct: '28', north: '34', south: '10', unchanged: 'south' };
  if (id.startsWith('kenia.first') || id.startsWith('kenia.revised'))
    return {
      plan: 'direct',
      evidence: 'david-direct-north',
      limit: 'amina-direct-north',
      weight: 'benefit',
      explanation:
        'Ich wähle Direkt für Davids 12 statt 18 Minuten. Dafür akzeptiere ich Aminas 22 statt 10 Minuten.',
    };
  if (id === 'kenia.full.spatial')
    return {
      explanation:
        'Amina steigt erst in Nord ein. David fährt vom Platz beide Abschnitte. Der Umweg betrifft nur Leilas Fußweg zum Platz.',
    };
  if (id === 'kenia.full.limit') return { missing: 'cost' };
  if (id === 'demand.before') return { enough: 'yes' };
  if (id.startsWith('demand.now'))
    return { enough: 'no', capacity: '20', later: '4' };
  if (id.startsWith('demand.explore')) return { bus: 'seats', path: 'walk' };
  if (id.startsWith('demand.final'))
    return {
      plan: 'bus',
      evidence: 'bus',
      limit: 'bus',
      weight: 'benefit',
      explanation:
        'Ich wähle die zusätzliche Fahrt: 30 Plätze reichen für 24 Menschen. Der Fußweg bleibt 12 Minuten.',
    };
  if (id.startsWith('demand.transfer')) return { enough: 'yes', access: 'no' };
  if (id === 'demand.cause')
    return {
      explanation:
        'Plätze pro Stunde und Fußweg sind verschiedene Größen. Eine Fahrt schafft Plätze, ein Weg verkürzt den Zugang. Betriebskosten können meine Wahl ändern.',
    };
}
