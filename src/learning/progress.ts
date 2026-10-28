import { parseInquiryInteger } from '../inquiry/state.ts';
import type { LearningField, Task } from './tasks.ts';
export type Finding = {
  field: string;
  label: string;
  status:
    'correct' | 'incorrect' | 'missing' | 'format' | 'unchecked' | 'opinion';
  explanation: string;
};
export function findings(
  task: Task,
  answers: Record<string, string>,
): Finding[] {
  return task.fields.map((f) => {
    const value = answers[f.id]?.trim();
    let status: Finding['status'];
    if (!value) status = 'missing';
    else if (f.kind === 'text') status = 'unchecked';
    else if (f.kind === 'integer') {
      const parsed = parseInquiryInteger(value);
      status =
        parsed === undefined
          ? 'format'
          : parsed === parseInquiryInteger(f.expected)
            ? 'correct'
            : 'incorrect';
    } else if (!f.options?.some(([id]) => id === value)) status = 'format';
    else if (f.expected === 'either') status = 'opinion';
    else status = value === f.expected ? 'correct' : 'incorrect';
    return { field: f.id, label: f.label, status, explanation: f.explanation };
  });
}
export function evaluate(
  task: Task,
  answers: Record<string, string>,
  failures = 0,
) {
  const parts = findings(task, answers),
    correct = parts.filter((p) => p.status === 'correct').length;
  const incomplete = parts.some(
      (p) => p.status === 'missing' || p.status === 'format',
    ),
    wrong = parts.some((p) => p.status === 'incorrect');
  const error = !incomplete && wrong,
    ready = !incomplete && !wrong;
  const unchecked = parts.some((p) => p.status === 'unchecked'),
    opinion = parts.some((p) => p.status === 'opinion');
  const factual = wrong
    ? correct
      ? 'partial'
      : 'incorrect'
    : correct
      ? 'correct'
      : unchecked
        ? 'ungraded'
        : 'na';
  const kind = incomplete
    ? correct
      ? 'partial'
      : 'neutral'
    : wrong
      ? failures >= 1
        ? 'hint'
        : correct
          ? 'partial'
          : 'incorrect'
      : unchecked || opinion
        ? 'neutral'
        : 'correct';
  const title = incomplete
    ? parts.some((p) => p.status === 'format')
      ? 'Prüfe die Schreibweise.'
      : 'Ergänze die offenen Angaben.'
    : wrong
      ? failures >= 1
        ? 'Schrittweise erklärt'
        : correct
          ? 'Ein Teil passt bereits.'
          : 'Prüfe die Angaben.'
      : unchecked
        ? 'Eigene Antwort gespeichert – noch nicht fachlich geprüft'
        : opinion
          ? 'Deine Priorität bleibt deine.'
          : 'Diese Angaben passen.';
  return {
    parts,
    error,
    ready,
    unchecked,
    opinion,
    factual,
    kind,
    title,
  } as const;
}
export function exampleValue(field: LearningField) {
  return field.kind === 'text'
    ? (field.example ?? '')
    : field.expected === 'either'
      ? (field.options?.[0][0] ?? '')
      : (field.expected ?? '');
}
