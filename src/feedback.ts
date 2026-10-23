import { decisionExample, goalMessage, goalStatus, hasWeighting, weightingProduct } from './decision.ts';
import type { DecisionPanel } from './decision.ts';
import type { Criterion, Foot, Person, Route, Step } from './content.ts';
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
const result = (
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
function textNotice(persisted: boolean) {
  return (
    (persisted
      ? 'Deine Antwort wurde gespeichert.'
      : 'Deine Antwort bleibt für dieses Spiel erhalten. Der Browser erlaubt kein Speichern.') +
    ' Das Spiel kann sie nicht sicher prüfen. Zeige deinen Beleg auf der Karte.'
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
export function hasIncorrectDecisionEvidence(answer: Decision): boolean {
  if (
    !answer.route ||
    !answer.criterion ||
    !answer.advantage ||
    !answer.disadvantage ||
    answer.text.trim()
  )
    return false;
  return (
    !evidenceFits(answer.advantage, answer.route, 'advantage') ||
    !evidenceFits(answer.disadvantage, answer.route, 'disadvantage') ||
    !differentPeople(answer.advantage, answer.disadvantage)
  );
}
export function explainDecision(answer: Decision): string {
  const example = decisionExample(answer);
  if (!example) return 'Wähle zuerst deinen Busweg und dein Ziel. Dann zeigen wir ein Beispiel für genau diese Auswahl.';
  return `Beispiel für ${routeNames[example.route!]} und dein gewähltes Ziel: Vorteil: ${evidenceLabel(example.advantage!)} Nachteil: ${evidenceLabel(example.disadvantage!)} ${weightingProduct(example)} Du übernimmst damit auch diese Gewichtung. Dein Ziel und dein eigener Text bleiben erhalten.`;
}
export function evaluateDecision(
  answer: Decision,
  persisted: boolean,
): Feedback {
  if (!answer.route)
    return result(
      'neutral',
      'Dein Vorschlag fehlt noch',
      'Wähle zuerst den Busweg, den du vorschlägst.',
    ).feedback;
  const good = evidenceFits(answer.advantage, answer.route, 'advantage');
  const downside = evidenceFits(
    answer.disadvantage,
    answer.route,
    'disadvantage',
  );
  const distinct = differentPeople(answer.advantage, answer.disadvantage);
  const hasText = Boolean(answer.text.trim());
  const parts: string[] = [];
  if (!answer.criterion) parts.push('Wähle noch dein Ziel oder Kriterium.');
  if (answer.supported) parts.push('Du hast das erklärte Beispiel übernommen.');
  if (good)
    parts.push(`Du belegst den Vorteil: ${evidenceLabel(answer.advantage!)}`);
  else if (answer.advantage)
    parts.push(
      'Prüfe deinen Vorteil: Zeigt der Beleg bei deinem Busweg weniger Zeit als bei der Vergleichslinie?',
    );
  else if (!hasText) parts.push('Wähle einen Vorteil mit Zeitangabe.');
  if (downside)
    parts.push(
      `Du beachtest auch den Nachteil: ${evidenceLabel(answer.disadvantage!)}`,
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
  const conflict = goalStatus(answer)?.conflict;
  if (answer.criterion && answer.criterion !== 'tradeoff') parts.push(goalMessage(answer));
  const needsWeighting = conflict || answer.criterion === 'tradeoff';
  const connected = !needsWeighting || hasWeighting(answer);
  if (needsWeighting && !connected)
    parts.push('Dein Argument ist noch nicht verbunden. Ändere dein Ziel oder wähle konkret, welche Folge dir wichtiger ist.');
  if (hasWeighting(answer)) parts.push(weightingProduct(answer));
  const structured = good && downside && distinct && Boolean(answer.criterion) && connected;
  if (structured)
    parts.push(
      'Die ausgewählten Belege und dein Ziel sind verbunden. Mit Bausteinen begründet; selbstständiges Urteilen ist damit noch nicht nachgewiesen.',
    );
  return {
    kind: 'neutral',
    title: answer.supported
      ? 'Mit Unterstützung begründet'
      : hasText
        ? answer.ungraded ? 'Bewusst unbewertet abgegeben' : 'Deine Gedanken – noch prüfen'
        : structured
          ? 'Deine ausgewählten Belege passen'
          : 'Deine Belege prüfen',
    text: parts.join(' '),
    complete: Boolean(answer.criterion) && (structured || (hasText && answer.ungraded === true)),
  };
}
