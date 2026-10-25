import { demandEpisode, measureNames } from './demand-content.ts';
import {
  demandScenario,
  trialMatches,
  demandAdvantage,
  demandDisadvantage,
  demandConflict,
  demandPriority,
  demandFactLabels,
  demandExample,
  demandProduct,
} from './demand.ts';
import {
  decisionExample,
  goalMessage,
  goalStatus,
  hasWeighting,
  weightingProduct,
} from './decision.ts';
import type { DecisionPanel } from './decision.ts';
import type {
  Criterion,
  Foot,
  Person,
  Route,
  Situation,
  Step,
} from './content.ts';
import { routeNames, routes, tasks } from './content.ts';
import {
  differentPeople,
  evidenceFits,
  evidenceLabel,
  explanationText,
  journey,
} from './model.ts';
import type { Cause, Effect, Evidence } from './model.ts';
export type FeedbackKind =
  'correct' | 'incorrect' | 'partial' | 'hint' | 'neutral';
export interface Feedback {
  kind: FeedbackKind;
  title: string;
  text: string;
  complete: boolean;
}
export interface Evaluation {
  feedback: Feedback;
  failed: boolean;
}
export const result = (
  kind: FeedbackKind,
  title: string,
  text: string,
  complete = false,
  failed = false,
): Evaluation => ({ feedback: { kind, title, text, complete }, failed });
export function explainTask(step: Step): string {
  const a = journey('amina', 'direct'),
    n = journey('amina', 'north');
  const d = journey('david', 'direct'),
    dn = journey('david', 'north');
  if (step === 0)
    return `Amina geht ${a.walk} Minuten zum Platz. Dann fährt sie ${a.bus} Minuten im Bus. Zusammen sind das ${a.total} Minuten.`;
  if (step === 1)
    return `Für Amina wird der Weg kürzer: über Nord ${n.walk} + ${n.bus} = ${n.total} Minuten, direkt ${a.walk} + ${a.bus} = ${a.total} Minuten.`;
  if (step === 2)
    return `Für David dauert es länger: über Nord ${dn.walk} + ${dn.bus} = ${dn.total} Minuten, direkt ${d.walk} + ${d.bus} = ${d.total} Minuten.`;
  if (step === 3) return explanationText();
  const ld = journey('leila', 'direct'),
    ln = journey('leila', 'north'),
    ls = journey('leila', 'south');
  return `Leila braucht direkt ${ld.total}, über Nord ${ln.total} und über Süd ${ls.walk} + ${ls.bus} = ${ls.total} Minuten. Über Süd steigt sie erst in Süd ein. Das hilft Leila. David braucht dann ${journey('david', 'south').total} statt ${d.total} Minuten. Amina braucht ${journey('amina', 'south').total} statt ${a.total} Minuten. Mehr Haltestellen machen den Weg also nicht für alle besser.`;
}
export function evaluateClosed(
  step: Step,
  answer: {
    foot?: Foot;
    bus?: Route;
    person?: Person;
    routeAnswer?: Route;
    prediction?: Route;
    explored?: Route[];
  },
  failures: number,
): Evaluation {
  if (step === 4) {
    if (
      !answer.prediction ||
      !routes.every((r) => answer.explored?.includes(r))
    )
      return result(
        'hint',
        'Teste Leilas Wege',
        'Vermute zuerst. Sieh dann Leilas ganzen Weg auf allen drei Linien an. Dafür gibt es keine Fehlversuche.',
      );
    if (!answer.routeAnswer)
      return result(
        'hint',
        'Dein Vergleich fehlt noch',
        'Welcher Busweg ist für Leila am schnellsten?',
      );
    if (answer.routeAnswer === 'south')
      return result(
        'correct',
        '✓ Leilas Weg wird kürzer',
        explainTask(4),
        true,
      );
    if (failures >= 1)
      return result(
        'hint',
        '→ Wir vergleichen gemeinsam',
        'Die Erklärung unten vergleicht Leilas drei Wege. Du kannst das erklärte Beispiel übernehmen.',
        false,
        true,
      );
    return result(
      'incorrect',
      '↺ Prüfe den Einstieg',
      'Leila kann am Platz oder in Süd einsteigen. Vergleiche ihren Fußweg und ihre Busfahrt zusammen.',
      false,
      true,
    );
  }
  const empty = step === 0 ? !answer.foot || !answer.bus : !answer.person;
  if (
    step === 0 &&
    empty &&
    (answer.foot === 'platz' || answer.bus === 'direct')
  )
    return result(
      'partial',
      '◐ Ein Teil passt schon',
      answer.foot === 'platz'
        ? 'Der Fußweg zum Platz passt. Wähle jetzt noch die Busfahrt.'
        : 'Die direkte Busfahrt passt. Wähle jetzt noch den Fußweg.',
    );
  if (empty)
    return result(
      'hint',
      'Noch eine Auswahl',
      step === 0
        ? answer.foot
          ? 'Wähle jetzt noch die Busfahrt. Dann prüfen wir beide Teile.'
          : answer.bus
            ? 'Wähle jetzt noch den Fußweg. Dann prüfen wir beide Teile.'
            : 'Wähle einen Fußweg und eine Busfahrt.'
        : 'Wähle Amina oder David.',
    );
  const parts =
    step === 0
      ? Number(answer.foot === 'platz') + Number(answer.bus === 'direct')
      : Number(answer.person === (step === 1 ? 'amina' : 'david'));
  if (parts === (step === 0 ? 2 : 1))
    return result('correct', '✓ Das passt', explainTask(step), true);
  if (failures >= 1)
    return result(
      'hint',
      '→ Wir schauen es gemeinsam an',
      explainTask(step),
      true,
      true,
    );
  if (step === 0 && parts === 1)
    return result(
      'partial',
      '◐ Ein Teil passt schon',
      answer.foot === 'platz'
        ? 'Der Fußweg zum Platz passt. Prüfe jetzt, wo der direkte Bus hinfährt.'
        : 'Die direkte Busfahrt passt. Prüfe jetzt den Fußweg zu ihrer Haltestelle.',
      false,
      true,
    );
  return result(
    'incorrect',
    '↺ Das passt noch nicht',
    tasks[step].hints[0],
    false,
    true,
  );
}
export interface Explanation {
  cause?: Cause;
  effect?: Effect;
  text: string;
  supported?: boolean;
}
export function textNotice(persisted: boolean, material = 'auf der Karte') {
  return (
    (persisted
      ? 'Deine Antwort wurde gespeichert.'
      : 'Deine Antwort bleibt für dieses Spiel erhalten. Der Browser erlaubt kein Speichern.') +
    ` Das Spiel kann sie nicht sicher prüfen. Zeige deinen Beleg ${material}.`
  );
}
export function evaluateExplanation(
  answer: Explanation,
  failures: number,
  persisted: boolean,
): Evaluation {
  if (answer.text.trim())
    return result(
      'neutral',
      'Deine eigene Erklärung',
      textNotice(persisted),
      true,
    );
  const cause = answer.cause === 'shorter',
    effect = answer.effect === 'total';
  if (cause && effect)
    return result(
      answer.supported ? 'hint' : 'correct',
      answer.supported
        ? '→ Mit Unterstützung erklärt'
        : '✓ Angeleitete Erklärung passt',
      explanationText(),
      true,
    );
  const acknowledged = cause
    ? 'Der Satz zum kürzeren Fußweg passt. '
    : effect
      ? 'Der Satz zur kürzeren Gesamtzeit passt. '
      : '';
  if (!answer.cause || !answer.effect)
    return result(
      acknowledged ? 'partial' : 'hint',
      acknowledged ? '◐ Ein Satz passt schon' : 'Ergänze deine Erklärung',
      acknowledged +
        (!answer.cause
          ? 'Wähle jetzt den Satz zum Fußweg.'
          : 'Wähle jetzt den Satz zur Gesamtzeit.'),
    );
  if (failures >= 1)
    return result(
      'hint',
      '→ Den Zusammenhang gemeinsam erklären',
      'Die Erklärung unten zeigt dir Fußweg, Einstieg und Gesamtzeit. Du kannst das erklärte Beispiel übernehmen.',
      false,
      true,
    );
  return result(
    acknowledged ? 'partial' : 'incorrect',
    acknowledged ? '◐ Ein Satz passt schon' : '↺ Untersuche den Zusammenhang',
    acknowledged +
      (cause
        ? 'Prüfe die Folge für den ganzen Weg. Auch der Fußweg zählt.'
        : 'Prüfe, wie sich Aminas Fußweg zur Haltestelle ändert.'),
    false,
    true,
  );
}
export interface Decision {
  route?: Route;
  criterion?: Criterion;
  advantage?: Evidence;
  disadvantage?: Evidence;
  text: string;
  supported?: boolean;
  panel?: DecisionPanel;
  advantageOther?: Route;
  disadvantageOther?: Route;
  weighting?: Evidence;
  acceptConflict?: boolean;
  ungraded?: boolean;
}
export function hasIncorrectDecisionEvidence(
  answer: Decision,
  situation: Situation = 'before',
): boolean {
  if (
    !answer.route ||
    !answer.criterion ||
    !answer.advantage ||
    !answer.disadvantage ||
    answer.text.trim()
  )
    return false;
  return (
    !evidenceFits(answer.advantage, answer.route, 'advantage', situation) ||
    !evidenceFits(
      answer.disadvantage,
      answer.route,
      'disadvantage',
      situation,
    ) ||
    !differentPeople(answer.advantage, answer.disadvantage)
  );
}
export function explainDecision(
  answer: Decision,
  situation: Situation = 'before',
): string {
  const example = decisionExample(answer, situation);
  if (!example)
    return 'Wähle zuerst deinen Busweg und dein Ziel. Dann zeigen wir ein Beispiel für genau diese Auswahl.';
  return `Beispiel für ${routeNames[example.route!]} und dein gewähltes Ziel: Vorteil: ${evidenceLabel(example.advantage!, situation)} Nachteil: ${evidenceLabel(example.disadvantage!, situation)} ${weightingProduct(example, situation)} Du übernimmst damit auch diese Gewichtung. Dein Ziel und dein eigener Text bleiben erhalten.`;
}
export function evaluateDecision(
  answer: Decision,
  persisted: boolean,
  situation: Situation = 'before',
): Feedback {
  if (!answer.route)
    return result(
      'neutral',
      'Dein Vorschlag fehlt noch',
      'Wähle zuerst den Busweg, den du vorschlägst.',
    ).feedback;
  const good = evidenceFits(
    answer.advantage,
    answer.route,
    'advantage',
    situation,
  );
  const downside = evidenceFits(
    answer.disadvantage,
    answer.route,
    'disadvantage',
    situation,
  );
  const distinct = differentPeople(answer.advantage, answer.disadvantage);
  const hasText = Boolean(answer.text.trim());
  const parts: string[] = [];
  if (!answer.criterion) parts.push('Wähle noch dein Ziel oder Kriterium.');
  if (answer.supported) parts.push('Du hast das erklärte Beispiel übernommen.');
  if (good)
    parts.push(
      `Du belegst den Vorteil: ${evidenceLabel(answer.advantage!, situation)}`,
    );
  else if (answer.advantage)
    parts.push(
      'Prüfe deinen Vorteil: Zeigt der Beleg bei deinem Busweg weniger Zeit als bei der Vergleichslinie?',
    );
  else if (!hasText) parts.push('Wähle einen Vorteil mit Zeitangabe.');
  if (downside)
    parts.push(
      `Du beachtest auch den Nachteil: ${evidenceLabel(answer.disadvantage!, situation)}`,
    );
  else if (answer.disadvantage)
    parts.push(
      'Prüfe deinen Nachteil: Zeigt der Beleg bei deinem Busweg mehr Zeit als bei der Vergleichslinie?',
    );
  else if (!hasText)
    parts.push('Ergänze auch einen Nachteil für eine andere Person.');
  if (good && downside && !distinct)
    parts.push(
      'Beide Belege betreffen dieselbe Person. Ergänze den Nachteil für eine andere Person.',
    );
  if (hasText) parts.push(textNotice(persisted));
  const conflict = goalStatus(answer, situation)?.conflict;
  if (answer.criterion && answer.criterion !== 'tradeoff')
    parts.push(goalMessage(answer, situation));
  const needsWeighting = conflict || answer.criterion === 'tradeoff';
  const connected = !needsWeighting || hasWeighting(answer, situation);
  if (needsWeighting && !connected)
    parts.push(
      'Dein Argument ist noch nicht verbunden. Ändere dein Ziel oder wähle konkret, welche Folge dir wichtiger ist.',
    );
  if (hasWeighting(answer, situation))
    parts.push(weightingProduct(answer, situation));
  const structured =
    good && downside && distinct && Boolean(answer.criterion) && connected;
  if (structured)
    parts.push(
      'Die ausgewählten Belege und dein Ziel sind verbunden. Du hast deine Empfehlung mit Bausteinen begründet.',
    );
  return {
    kind: 'neutral',
    title: answer.supported
      ? 'Mit Unterstützung begründet'
      : hasText
        ? answer.ungraded
          ? 'Bewusst unbewertet abgegeben'
          : 'Deine Gedanken – noch prüfen'
        : structured
          ? 'Deine ausgewählten Belege passen'
          : 'Deine Belege prüfen',
    text: parts.join(' '),
    complete:
      Boolean(answer.criterion) &&
      (structured || (hasText && answer.ungraded === true)),
  };
}

// The new situation uses the same Feedback/Evaluation contract and bounded attempts.
export function evaluateEventFind(
  path: import('./event.ts').EventPath | undefined,
  failures: number,
): Evaluation {
  const before = journey('leila', 'direct').walk,
    now = journey('leila', 'direct', 'now').walk;
  if (!path)
    return result(
      'hint',
      'Zeige zuerst einen Weg',
      'Wähle eine Verbindung auf der Karte oder darunter.',
    );
  if (path === 'leila-platz')
    return result(
      'correct',
      '✓ Den Fußweg gefunden',
      `Richtig. Leilas Fußweg zum Platz ist länger geworden. Sie braucht jetzt ${now} statt ${before} Minuten.`,
      true,
    );
  if (path === 'south-area')
    return result(
      'partial',
      '◐ Der Wohnbereich passt',
      'Du hast den richtigen Wohnbereich gefunden. Zeige jetzt den Fußweg zum Platz.',
      false,
      false,
    );
  if (failures >= 1)
    return result(
      'hint',
      '→ Der betroffene Fußweg',
      `Leilas Fußweg zum Platz ist betroffen: ${now} statt ${before} Minuten. Die Busse und der kurze Fußweg nach Süd bleiben gleich. Der markierte Weg zeigt es dir. Übernimm die Erklärung, um mit Hilfe weiterzugehen.`,
      false,
      true,
    );
  return result(
    'incorrect',
    '↺ Suche die Fußverbindung',
    'Das ist nicht der betroffene Weg. Die Buslinien haben sich nicht verändert. Suche Leilas Fußweg zum Platz.',
    false,
    true,
  );
}
export function evaluateEventEffects(
  road: import('./event.ts').RoadState,
  persisted: boolean,
): Evaluation {
  const expected = routes.map((route) => ({
    route,
    answer:
      journey('leila', route, 'now').total > journey('leila', route).total
        ? 'longer'
        : 'same',
  }));
  const correct = expected.filter((x) => road.answers[x.route] === x.answer);
  const complete = expected.every((x) => road.answers[x.route]);
  const acknowledged = correct.length
    ? `Das passt schon: ${correct.map((x) => routeNames[x.route]).join(', ')}. `
    : '';
  if (!complete)
    return result(
      correct.length ? 'partial' : 'hint',
      'Der Vergleich ist noch offen',
      acknowledged + 'Wähle für jede Linie: länger oder gleich.',
    );
  if (correct.length !== routes.length) {
    const explanation =
      'Nur der Fußweg zum Platz ist länger. Die Busfahrten bleiben gleich. Prüfe, bei welchen Linien Leila zum Platz geht.';
    return result(
      road.effects.failures >= 1
        ? 'hint'
        : correct.length
          ? 'partial'
          : 'incorrect',
      'Prüfe die Folgen',
      acknowledged + explanation,
      false,
      true,
    );
  }
  if (!road.compared)
    return result(
      'correct',
      '✓ Die Zeiten verglichen',
      'Dein Vergleich passt. Erkläre jetzt, warum der Weg über Süd gleich lang bleibt.',
    );
  if (road.explanationUngraded && road.explanationText.trim())
    return result(
      'neutral',
      'Bewusst unbewertet erklärt',
      textNotice(persisted),
      true,
    );
  const connection = road.connection === 'sued',
    cause = road.cause === 'unchanged';
  const part = connection
    ? 'Der Einstieg in Süd passt. '
    : cause
      ? 'Ein unveränderter Fußweg passt als Ursache. '
      : '';
  if (!road.connection || !road.cause)
    return result(
      connection || cause ? 'partial' : 'hint',
      'Die Erklärung ist noch offen',
      part + 'Wähle den Einstieg und die Ursache.',
    );
  if (connection && cause)
    return result(
      'correct',
      road.explanationSupported
        ? '→ Mit Beispiel erklärt'
        : '✓ Mit Bausteinen erklärt',
      `Leila geht zur Haltestelle Süd. Dieser Fußweg ist nicht betroffen. Deshalb bleibt ihr ganzer Weg bei ${journey('leila', 'south', 'now').total} Minuten.`,
      true,
    );
  return result(
    road.effects.failures >= 1
      ? 'hint'
      : connection || cause
        ? 'partial'
        : 'incorrect',
    'Prüfe den Zusammenhang',
    part +
      'Die Baustelle betrifft den Fußweg zum Platz. Prüfe Leilas Einstieg für die Linie über Süd. Die Busse fahren wie zuvor.',
    false,
    true,
  );
}

// Episode 2 shares the same Evaluation contract, feedback colours and Progress
// counters as Episode 1. Correct positions are never inferred from free text.
export function evaluateDemandCheck(
  d: import('./demand.ts').DemandState,
): Evaluation {
  const s = demandScenario();
  const acknowledged =
    d.enough === 'no'
      ? 'Richtig: Die Plätze reichen nicht für alle. '
      : d.later === s.later
        ? `Richtig: ${s.later} Personen müssen später fahren. `
        : '';
  if (!d.route || !d.seenNow || !d.enough || d.later === undefined)
    return result(
      acknowledged ? 'partial' : 'hint',
      'Noch eine Angabe',
      acknowledged +
        (!d.route
          ? 'Wähle eine Ausgangslinie.'
          : !d.seenNow
            ? 'Sieh dir die Situation „Jetzt“ an.'
            : 'Wähle, ob die Plätze reichen und wie viele Personen später fahren müssen.'),
    );
  if (d.enough === 'no' && d.later === s.later)
    return result(
      'correct',
      d.check.supported
        ? '→ Mit Hilfe verglichen'
        : '✓ Nachfrage und Plätze verglichen',
      `${s.people} Menschen möchten fahren. Es gibt ${s.capacity} Plätze. ${s.later} Menschen müssen später fahren.`,
      true,
    );
  return result(
    d.check.failures >= 1 ? 'hint' : acknowledged ? 'partial' : 'incorrect',
    d.check.failures >= 1
      ? '→ So kannst du vergleichen'
      : '↺ Vergleiche Menschen und Plätze',
    acknowledged +
      (d.check.failures >= 1
        ? `${s.people} Menschen, aber nur ${s.capacity} Plätze: ${s.later} müssen später fahren. Du kannst das erklärte Beispiel übernehmen.`
        : `Vergleiche ${s.people} Menschen mit ${s.capacity} Plätzen. Ein Platz reicht für eine Person.`),
    false,
    true,
  );
}
export function evaluateDemandTrial(
  d: import('./demand.ts').DemandState,
): Evaluation {
  if (d.measure === 'base' || !d.explored.includes(d.measure))
    return result(
      'hint',
      'Probiere eine Maßnahme',
      'Wähle eine Maßnahme auf der Karte oder darunter.',
    );
  const measure = d.measure,
    t = d.trials[measure],
    scenario = demandScenario(measure);
  const capacity = t?.capacity === (measure === 'bus' ? 'more' : 'same');
  const walk = t?.walk === (measure === 'path' ? 'shorter' : 'same');
  const acknowledged = [
    capacity ? 'Dein Vergleich der Busplätze passt.' : '',
    walk ? 'Dein Vergleich des Fußwegs passt.' : '',
  ]
    .filter(Boolean)
    .join(' ');
  if (!t?.capacity || !t.walk)
    return result(
      acknowledged ? 'partial' : 'hint',
      'Dein Vergleich ist noch offen',
      `${acknowledged} Wähle, was sich an Plätzen und Fußweg verändert.`,
    );
  const explanation = `${measureNames[measure]}: ${scenario.trips} Fahrten mit je ${demandEpisode.seatsPerTrip} Plätzen ergeben ${scenario.capacity} Plätze. Der Fußweg dauert ${scenario.walk} Minuten. ${scenario.later ? `${scenario.later} Personen müssen weiter später fahren.` : 'Die Plätze reichen in dieser Stunde für alle.'}`;
  if (trialMatches(measure, t))
    return result(
      'correct',
      t.supported ? '→ Mit Hilfe untersucht' : '✓ Die Wirkung passt',
      explanation,
      true,
    );
  return result(
    d.explore.failures >= 1 ? 'hint' : acknowledged ? 'partial' : 'incorrect',
    '↺ Eine Maßnahme verändert nicht alles',
    `${acknowledged} ${d.explore.failures >= 1 ? explanation + ' Du kannst dieses Beispiel übernehmen.' : 'Vergleiche die Busplätze und den Fußweg vor und nach dieser Maßnahme.'}`,
    false,
    true,
  );
}
export function evaluateDemandDecision(
  d: import('./demand.ts').DemandDecision,
  failures: number,
  persisted: boolean,
): Evaluation {
  if (!d.measure || !d.goal)
    return result(
      'hint',
      'Dein Vorschlag und dein Ziel',
      'Wähle eine Maßnahme und dein Ziel.',
    );
  if (d.text.trim() && d.ungraded)
    return result(
      'neutral',
      'Bewusst unbewertet abgegeben',
      textNotice(persisted),
      true,
    );
  const labels = demandFactLabels(),
    good = demandAdvantage(d),
    downside = demandDisadvantage(d);
  const acknowledged = [
    good ? `Dein Vorteil passt: ${labels.advantage[d.advantage!]}` : '',
    downside
      ? `Dein Nachteil passt: ${labels.disadvantage[d.disadvantage!]}`
      : '',
  ]
    .filter(Boolean)
    .join(' ');
  if (d.text.trim() && !(good && downside))
    return result(
      'neutral',
      'Dein eigener Gedanke',
      `${acknowledged} ${textNotice(persisted)} Prüfe die Bausteine oder gib deinen eigenen Text bewusst unbewertet ab.`,
    );
  if (!d.advantage || !d.disadvantage)
    return result(
      acknowledged ? 'partial' : 'hint',
      'Ergänze deine Begründung',
      `${acknowledged} Wähle einen Vorteil und einen verbleibenden Nachteil.`,
    );
  if (!good || !downside) {
    const example = demandExample(d)!;
    return result(
      failures >= 1 ? 'hint' : acknowledged ? 'partial' : 'incorrect',
      '↺ Prüfe die Folgen deines Vorschlags',
      `${acknowledged} ${failures >= 1 ? `Beispiel: ${demandProduct(example)} Du kannst dieses Beispiel bewusst übernehmen.` : 'Prüfe: Welche Größe verändert deine Maßnahme? Was bleibt gleich?'}`,
      false,
      true,
    );
  }
  if (demandConflict(d) && !demandPriority(d)) {
    const scenario = demandScenario(d.measure);
    return result(
      'neutral',
      'Dein Argument ist noch nicht verbunden',
      `${acknowledged} ${d.measure === 'bus' ? `Du möchtest einen kurzen Fußweg. Er bleibt aber ${scenario.walk} Minuten lang.` : `Du möchtest Plätze für alle. Aber ${scenario.later} Personen müssen später fahren.`} Ändere dein Ziel oder entscheide bewusst, welche Folge dir wichtiger ist.`,
    );
  }
  return result(
    'neutral',
    d.supported
      ? 'Mit Unterstützung begründet'
      : 'Deine Empfehlung mit Bausteinen',
    `${acknowledged} ${demandPriority(d) || 'Dein Vorteil stützt dein gewähltes Ziel.'} Beide Maßnahmen haben Grenzen. Deine Empfehlung ist nachvollziehbar.`,
    true,
  );
}
