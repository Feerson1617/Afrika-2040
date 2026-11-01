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
  if (id.startsWith('cocoa.chain.')) return { step: id.split('.').at(-1)! };
  if (id === 'cocoa.base') return { surplus: '80' };
  if (id.startsWith('cocoa.compare')) return { quality: '90', process: '75' };
  if (id.startsWith('cocoa.investment'))
    return { pot: 'separate', cause: 'costs' };
  if (id.startsWith('cocoa.final'))
    return {
      plan: 'quality',
      evidence: 'quality',
      limit: 'quality',
      weight: 'benefit',
      explanation:
        'Qualität ergibt 90 GE, die Presse nur 75 GE. Für mehr Verarbeitung könnte ich trotzdem die Presse wählen.',
    };
  if (id === 'cocoa.transfer') return { guarantee: 'no' };
  if (id === 'cocoa.cause')
    return {
      explanation:
        '260 GE sind Einnahmen, kein Überschuss. Nach 185 GE Kosten bleiben 75 GE. Mehr eigene Verarbeitung kann trotzdem mein Ziel sein. Dafür fehlen Absatzinformationen.',
    };
  if (id.startsWith('share.paid')) return { wages: 'paid', free: '120' };
  if (id.startsWith('share.effects')) return { now: 'payout', future: 'no' };
  if (id === 'share.plan') return { plan: '40-40-40' };
  if (id === 'share.plan.second') return { plan: '60-20-40' };
  if (id.startsWith('share.proof')) return { evidence: '0', limit: '0' };
  if (id === 'share.tradeoff') return { tradeoff: 'less' };
  if (id === 'share.perspective')
    return {
      explanation:
        'Im ersten Plan je 40 GE, im zweiten 60 GE Auszahlung, 20 GE Rücklage und 40 GE Fortbildung. Die Auszahlung stärkt das heutige Einkommen, die Rücklage wird kleiner. Künftige Reparaturkosten sind ungewiss.',
    };
  if (id.startsWith('water.base'))
    return { withdrawal: '60', arrival: '40', rest: '20' };
  if (id.startsWith('water.compare')) return { repair: '30', tech: '35' };
  if (id.startsWith('water.scope')) return { same: 'field', consumption: 'no' };
  if (id.startsWith('water.final'))
    return {
      plan: 'repair',
      evidence: 'repair',
      limit: 'repair',
      weight: 'benefit',
      explanation:
        'Reparatur nutzt die vorhandene Leitung und lässt 30 WE im Tank. Sie bleibt wartungsbedürftig.',
    };
  if (id === 'water.transfer') return { rest: '20' };
  if (id === 'water.system')
    return {
      explanation:
        '45 WE Entnahme und 40 WE Ankunft sind verschiedene Messstellen. Bei 80 WE Start bleiben 35 WE im Tank. Über Verbrauch und Grundwasser fehlen Angaben.',
    };
  if (id.startsWith('area.single'))
    return {
      saving:
        t.fields?.find((f) => f.id === 'saving')?.kind === 'choice'
          ? 'yes'
          : '15',
      single: '45',
    };
  if (id.startsWith('area.total'))
    return {
      total:
        t.fields?.find((f) => f.id === 'total')?.kind === 'choice'
          ? 'more'
          : '65',
      rest: '15',
    };
  if (id === 'area.cause') return { claim: 'no' };
  if (id.startsWith('area.final'))
    return {
      plan: 'same',
      evidence: 'same',
      limit: 'same',
      weight: 'benefit',
      explanation:
        'Nur das erste Feld braucht 45 statt 60 WE. Die Zusatzfläche wird dann nicht bewässert.',
    };
  if (id.startsWith('area.transfer'))
    return {
      total:
        t.fields?.find((f) => f.id === 'total')?.kind === 'choice'
          ? 'yes'
          : '55',
      less: 'yes',
    };
  if (id === 'area.condition')
    return {
      explanation:
        'Zusatzentnahme muss kleiner als 15 WE sein, dann bleibt die Summe unter 60. Bei 15 WE ergibt sich genau 60, bei 20 WE insgesamt 65.',
    };
  if (id.startsWith('orientation.country.'))
    return { country: id.split('.').at(-1)! };
  if (id.startsWith('orientation.city.')) return { city: 'city' };
  if (id.startsWith('orientation.equator'))
    return { south: 'Nairobi', north: 'MAR' };
  if (id === 'orientation.scope') return { limit: 'no' };
  if (id === 'orientation.describe')
    return {
      explanation:
        'Agadir liegt nördlicher als Nairobi. Nairobi liegt südlich des Äquators. Eine genaue Fahrzeit zeigt diese Übersicht nicht.',
    };
  if (/^review\.(KEN|GHA|MAR)/.test(id))
    return { claim: 'model', scope: 'local' };
  if (id.startsWith('review.common'))
    return { consequences: 'different', weigh: 'evidence' };
  if (id === 'review.transfer') return { claim: 'no' };
  if (id === 'review.revision')
    return {
      revision: 'varied',
      explanation:
        'Nord hilft Amina, verlängert aber Davids Weg. Das sind erfundene Wege, kein Beweis für ganz Nairobi oder Afrika.',
    };
  if (id === 'review.cause')
    return {
      explanation:
        'Eine zusätzliche Fläche kann die Einsparung am ersten Feld aufheben. Mehr Verarbeitung kann höhere Kosten auslösen. Echte Flächen und Kosten müsste ich zusätzlich kennen.',
    };
}
