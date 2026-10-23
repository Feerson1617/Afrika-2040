import type { Foot, Person, Route, Step } from './content.ts';
import { tasks } from './content.ts';
import { evidenceFor, evidenceLabel } from './model.ts';
import type { Evidence } from './model.ts';

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

export function evaluateClosed(
  step: Step,
  answer: { foot?: Foot; bus?: Route; person?: Person },
  failures: number,
): Evaluation {
  const empty = step === 0 ? !answer.foot || !answer.bus : !answer.person;
  if (empty)
    return {
      feedback: {
        kind: 'hint',
        title: 'Noch eine Auswahl',
        text:
          step === 0
            ? 'Wähle einen Fußweg und eine Busfahrt.'
            : 'Wähle Amina oder David.',
        complete: false,
      },
      failed: false,
    };
  const correctParts =
    step === 0
      ? Number(answer.foot === 'platz') + Number(answer.bus === 'direct')
      : Number(answer.person === (step === 1 ? 'amina' : 'david'));
  const correct = correctParts === (step === 0 ? 2 : 1);
  if (correct)
    return {
      feedback: {
        kind: 'correct',
        title: '✓ Das passt',
        text: tasks[step].hints[2],
        complete: true,
      },
      failed: false,
    };
  if (failures >= 1)
    return {
      feedback: {
        kind: 'hint',
        title: '→ Wir schauen es gemeinsam an',
        text: tasks[step].hints[2],
        complete: true,
      },
      failed: true,
    };
  if (step === 0 && correctParts === 1)
    return {
      feedback: {
        kind: 'partial',
        title: '◐ Ein Teil passt schon',
        complete: false,
        text:
          answer.foot === 'platz'
            ? 'Der Fußweg zum Platz passt. Prüfe jetzt, wo der direkte Bus hinfährt.'
            : 'Die direkte Busfahrt passt. Prüfe jetzt den Fußweg zu ihrer Haltestelle.',
      },
      failed: true,
    };
  return {
    feedback: {
      kind: 'incorrect',
      title: '↺ Das passt noch nicht',
      text: tasks[step].hints[0],
      complete: false,
    },
    failed: true,
  };
}

export interface Decision {
  route?: Route;
  advantage?: Evidence;
  disadvantage?: Evidence;
  text: string;
}
export function evaluateDecision(
  answer: Decision,
  persisted: boolean,
): Feedback {
  if (!answer.route)
    return {
      kind: 'neutral',
      title: 'Dein Vorschlag fehlt noch',
      text: 'Wähle zuerst den Busweg, den du vorschlägst.',
      complete: false,
    };
  const expected = evidenceFor(answer.route);
  const good = answer.advantage === expected.advantage;
  const downside = answer.disadvantage === expected.disadvantage;
  const hasText = Boolean(answer.text.trim());
  const parts: string[] = [];
  if (good)
    parts.push(`Du belegst den Vorteil: ${evidenceLabel(expected.advantage)}`);
  else if (answer.advantage)
    parts.push(
      'Prüfe deinen Vorteil: Wer braucht bei deinem Busweg weniger Zeit?',
    );
  if (downside)
    parts.push(
      `Du beachtest auch den Nachteil: ${evidenceLabel(expected.disadvantage)}`,
    );
  else if (answer.disadvantage)
    parts.push(
      'Prüfe deinen Nachteil: Wer braucht bei deinem Busweg mehr Zeit?',
    );
  if (hasText)
    parts.push(
      persisted
        ? 'Deine Antwort wurde gespeichert. Das Spiel kann sie nicht sicher prüfen. Zeige deinen Beleg auf der Karte.'
        : 'Deine Antwort bleibt für dieses Spiel erhalten. Der Browser erlaubt kein Speichern. Das Spiel kann sie nicht sicher prüfen. Zeige deinen Beleg auf der Karte.',
    );
  if (!good && !answer.advantage && !hasText)
    parts.push('Wähle einen Vorteil mit Zeitangabe.');
  if (!downside && !answer.disadvantage && !hasText)
    parts.push('Ergänze auch einen Nachteil für die andere Person.');
  if (good && downside)
    parts.push(
      'Du kannst beide Folgen abwägen. Was ist dir bei deinem Vorschlag besonders wichtig?',
    );
  return {
    kind: 'neutral',
    title: hasText
      ? 'Deine Gedanken'
      : good && downside
        ? 'Dein Vorschlag ist begründet'
        : 'Deine Belege prüfen',
    text: parts.join(' '),
    complete: (good && downside) || hasText,
  };
}
