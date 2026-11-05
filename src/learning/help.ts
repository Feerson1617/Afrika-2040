import { plans } from '../inquiry/content.ts';
import type { LearningField, Task } from './tasks.ts';
import type { Attempt } from './storage.ts';
// Explain a valid open choice in its own terms; do not present the first option
// as the uniquely correct example for somebody else's legitimate decision.
export function explanationFor(
  task: Task,
  attempt: Attempt,
  field: LearningField,
) {
  if (field.kind === 'text') return field.example ?? '';
  const selected = field.options?.find(
    ([id]) => id === attempt.answers[field.id],
  );
  if (field.expected === 'either' && selected) {
    if (
      task.id === 'future.plan' &&
      (selected[0] === 'cool' || selected[0] === 'shade')
    ) {
      const plan = plans[selected[0]];
      return `Deine Wahl bleibt: ${plan.name}. Dazu passt als Beleg: ${plan.benefit} Diese Grenze bleibt: ${plan.limit}`;
    }
    return `Deine Auswahl bleibt: ${selected[1]} ${field.explanation}`;
  }
  if (field.expected === 'either' && field.options?.length) {
    const [id, label] = field.options[0];
    if (task.id === 'future.plan' && (id === 'cool' || id === 'shade')) {
      const plan = plans[id];
      return `Ein mögliches Beispiel: ${plan.name}. Beleg: ${plan.benefit} Grenze: ${plan.limit}`;
    }
    return `Ein mögliches Beispiel: ${label} ${field.explanation}`;
  }
  return field.explanation;
}
