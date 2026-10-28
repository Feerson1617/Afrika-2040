// Unabhängige Sollantworten nach 03_Mustersequenzen und vorab gerechneten Werten.
export function answers(t: { id: string }): Record<string, string> {
  const id = t.id;
  if (id.startsWith('population.event.')) {
    const e = id.split('.').at(-1);
    return {
      event: e,
      direction: ['birth', 'arrival'].includes(e) ? 'more' : 'less',
    };
  }
  if (id.includes('-direction'))
    return { direction: id.includes('migration') ? 'less' : 'more' };
  const numeric = id.includes('transfer')
    ? { natural: '16', migration: '−12', change: '4', end: '804' }
    : id.includes('counter')
      ? { natural: '30', migration: '−40', change: '-10', end: '990' }
      : { natural: '30', migration: '−10', change: '20', end: '1.020' };
  if (id.includes('.balance') || /\.(natural|migration|end)$/.test(id))
    return numeric;
  if (id === 'population.operations')
    return { natural: 'birth-death', migration: 'arrival-departure' };
  if (id === 'population.stock-change') return { change: '20', stock: '1.020' };
  if (id === 'population.base.reason') return { reason: 'balance' };
  if (id.startsWith('population.source.read'))
    return {
      larger: '2024',
      year2000: '19637087',
      year2024: '34427414',
      status: 'estimate',
      limit: 'causes',
    };
  if (id === 'population.condition.places') return { help: 'places' };
  if (id === 'population.condition.teachers') return { condition: 'teachers' };
  if (id === 'population.condition.links')
    return { chance: 'jobs', risk: 'pressure' };
  if (
    id === 'population.condition.own' ||
    id === 'population.condition.explain'
  )
    return {
      explanation:
        'Mit Ausbildung und passenden Arbeitsplätzen können später Chancen entstehen. Ohne weitere Schulplätze und Lehrkräfte kann es schwieriger werden.',
    };
  if (id === 'population.base.explain')
    return {
      explanation:
        '30 mehr durch Geburten und Sterbefälle. 10 weniger durch Umzüge. Zusammen sind es 20 mehr, am Ende 1020 Menschen.',
    };
  if (id === 'population.source.explain')
    return {
      explanation:
        '2000 etwa 19,6 Millionen, 2024 etwa 34,4 Millionen Menschen. Es sind Schätzungen für frühere Jahre. Die Reihe zeigt die einzelnen Ursachen nicht.',
    };
  if (id === 'population.question')
    return {
      question:
        'Wie viele Kinder leben dort und wie viele Schulplätze gibt es?',
    };
  if (id === 'population.bridge') return { scope: 'no' };
  if (id === 'kenia.walk') return { walk: 'to-stop' };
  if (id === 'kenia.compare') return { route: 'north' };
  if (id === 'kenia.benefit') return { benefit: 'amina' };
  if (id === 'kenia.limit') return { limit: 'david' };
  if (id.startsWith('kenia.times'))
    return {
      'amina-direct': '22',
      'amina-north': '10',
      'david-direct': '12',
      'david-north': '18',
    };
  if (id === 'kenia.used-section') return { section: 'used' };
  if (id === 'kenia.effects') return { benefit: 'amina', limit: 'david' };
  if (id === 'kenia.recommendation') return { priority: 'david' };
  if (id === 'kenia.explain')
    return {
      explanation:
        'Amina geht nur 2 Minuten nach Nord. Sie fährt 8 Minuten im Bus. Das ist zusammen 10 statt 22 Minuten. Sie fährt nicht die ganze Linie.',
    };
  if (id === 'kenia.judgment')
    return {
      explanation:
        'Ich wähle Direkt für Davids kürzeren Weg: 12 statt 18 Minuten. Dafür braucht Amina 22 statt 10 Minuten.',
    };
  if (id === 'kenia.transfer') return { missing: 'price' };
  throw Error('Kein unabhängiger Sollwert für ' + id);
}
