import type { Foot, Person, Route, Step } from './content.ts';
import type { Evidence } from './model.ts';
import type { Feedback } from './feedback.ts';
import {
  evaluateClosed,
  evaluateDecision,
  hasIncorrectDecisionEvidence,
} from './feedback.ts';
import { evidenceFor } from './model.ts';

export interface Progress {
  foot?: Foot;
  bus?: Route;
  person?: Person;
  failures: number;
  help: number;
  complete: boolean;
  feedback?: Feedback;
  transfer?: 'yes' | 'no';
  transferFailures: number;
  transferFeedback?: Feedback;
}
export interface State {
  screen: 'start' | 'game' | 'end';
  step: Step;
  route: Route;
  progress: Progress[];
  decision: {
    route?: Route;
    advantage?: Evidence;
    disadvantage?: Evidence;
    text: string;
    supported?: boolean;
  };
  words: boolean;
  highlight?: Person;
}
export function newProgress(): Progress {
  return { failures: 0, help: 0, complete: false, transferFailures: 0 };
}
export function initialState(): State {
  return {
    screen: 'start',
    step: 0,
    route: 'direct',
    progress: Array.from({ length: 4 }, newProgress),
    decision: { text: '' },
    words: false,
  };
}
export type Action =
  | {
      type:
        | 'start'
        | 'restart'
        | 'next'
        | 'back'
        | 'reset-task'
        | 'words'
        | 'check-transfer';
    }
  | { type: 'route'; value: Route }
  | { type: 'foot'; value: Foot }
  | { type: 'bus'; value: Route }
  | { type: 'person' | 'highlight'; value: Person }
  | { type: 'help'; value: number }
  | { type: 'decision-route'; value: Route }
  | { type: 'advantage' | 'disadvantage'; value?: Evidence }
  | { type: 'text'; value: string }
  | { type: 'transfer'; value: 'yes' | 'no' }
  | { type: 'check' | 'use-example'; persisted: boolean };

export function reduce(current: State, action: Action): State {
  if (action.type === 'restart') return initialState();
  const s = structuredClone(current);
  const p = s.progress[s.step];
  switch (action.type) {
    case 'start':
      s.screen = 'game';
      break;
    case 'words':
      s.words = !s.words;
      break;
    case 'route':
      s.route = s.step === 0 ? 'direct' : action.value;
      break;
    case 'highlight':
      s.highlight = action.value;
      break;
    case 'foot':
      p.foot = action.value;
      if (p.help < 3 && p.failures < 2) {
        p.feedback = undefined;
        p.complete = false;
      }
      break;
    case 'bus':
      p.bus = action.value;
      if (p.help < 3 && p.failures < 2) {
        p.feedback = undefined;
        p.complete = false;
      }
      break;
    case 'person':
      p.person = action.value;
      if (p.help < 3 && p.failures < 2) {
        p.feedback = undefined;
        p.complete = false;
      }
      break;
    case 'help':
      p.help = Math.max(p.help, Math.min(3, action.value));
      if (p.help === 3 && s.step < 3) p.complete = true;
      break;
    case 'check': {
      if (s.step === 3) {
        p.feedback = evaluateDecision(s.decision, action.persisted);
        p.complete = p.feedback.complete;
        if (hasIncorrectDecisionEvidence(s.decision)) {
          p.failures = Math.min(2, p.failures + 1);
          if (p.failures >= 2) {
            p.help = 3;
            p.feedback.title = 'Deine Belege gemeinsam prüfen';
            p.feedback.text += ' Die Erklärung unten hilft dir weiter.';
          }
        }
      } else if (p.failures < 2 && !p.complete) {
        const result = evaluateClosed(s.step, p, p.failures);
        p.feedback = result.feedback;
        p.complete = result.feedback.complete;
        if (result.failed) p.failures++;
        if (p.failures >= 2) p.help = 3;
      }
      break;
    }
    case 'use-example':
      if (s.step === 3 && p.help === 3 && s.decision.route) {
        Object.assign(s.decision, evidenceFor(s.decision.route), {
          supported: true,
        });
        p.feedback = evaluateDecision(s.decision, action.persisted);
        p.complete = p.feedback.complete;
      }
      break;
    case 'decision-route':
      s.decision.route = action.value;
      s.decision.supported = undefined;
      p.feedback = undefined;
      p.complete = false;
      break;
    case 'advantage':
      s.decision.advantage = action.value;
      s.decision.supported = undefined;
      p.feedback = undefined;
      p.complete = false;
      break;
    case 'disadvantage':
      s.decision.disadvantage = action.value;
      s.decision.supported = undefined;
      p.feedback = undefined;
      p.complete = false;
      break;
    case 'text':
      s.decision.text = action.value.slice(0, 1500);
      p.feedback = undefined;
      p.complete = false;
      break;
    case 'transfer':
      p.transfer = action.value;
      p.transferFeedback = undefined;
      break;
    case 'check-transfer':
      if (p.transfer) {
        const yes = p.transfer === 'yes';
        if (!yes) p.transferFailures = Math.min(2, p.transferFailures + 1);
        p.transferFeedback = yes
          ? {
              kind: 'correct',
              title: '✓ Der ganze Weg zählt',
              text: '3 Minuten zu Fuß + 10 Minuten im Bus = 13 Minuten.',
              complete: true,
            }
          : p.transferFailures >= 2
            ? {
                kind: 'hint',
                title: '→ So rechnest du',
                text: '3 Minuten zu Fuß + 10 Minuten im Bus = 13 Minuten. Der Fußweg gehört dazu.',
                complete: true,
              }
            : {
                kind: 'incorrect',
                title: '↺ Ein Teil fehlt',
                text: '10 Minuten sind nur die Busfahrt. Nimm den Fußweg dazu.',
                complete: false,
              };
      }
      break;
    case 'next':
      if (p.complete) {
        if (s.step < 3) {
          s.step = (s.step + 1) as Step;
          s.highlight = undefined;
        } else s.screen = 'end';
      }
      break;
    case 'back':
      if (s.screen === 'end') s.screen = 'game';
      else if (s.step > 0) {
        s.step = (s.step - 1) as Step;
        s.highlight = undefined;
      } else s.screen = 'start';
      break;
    case 'reset-task':
      s.progress[s.step] = newProgress();
      if (s.step === 3) s.decision = { text: '' };
      break;
  }
  // Task 1 always uses the direct starting route, including navigation/rework.
  if (s.step === 0) s.route = 'direct';
  return s;
}
