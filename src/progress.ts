import type { Foot, Person, Route } from './content.ts';
import type { Feedback, Evaluation } from './feedback.ts';
export interface Progress {
  foot?: Foot;
  bus?: Route;
  person?: Person;
  prediction?: Route;
  routeAnswer?: Route;
  explored: Route[];
  failures: number;
  help: number;
  complete: boolean;
  supported?: boolean;
  feedback?: Feedback;
  transfer?: 'yes' | 'no';
  transferFailures: number;
  transferFeedback?: Feedback;
}
export function newProgress(): Progress {
  return {
    failures: 0,
    help: 0,
    complete: false,
    transferFailures: 0,
    explored: [],
  };
}

// The existing bounded-attempt contract, shared by the added episodes.
export function applyEvaluation(p: Progress, evaluated: Evaluation) {
  p.feedback = evaluated.feedback;
  p.complete = p.feedback.complete;
  if (evaluated.failed) p.failures = Math.min(2, p.failures + 1);
  if (p.failures >= 2) p.help = 3;
}
