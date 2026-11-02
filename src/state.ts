import type { Criterion, Foot, Person, Route, Step } from './content.ts';
import { tasks, visiblePersons, visibleRoutes } from './content.ts';
import type { Cause, Effect, Evidence } from './model.ts';
import { decisionExample } from './decision.ts';
import type { DecisionPanel } from './decision.ts';
import type { Decision, Explanation, Feedback } from './feedback.ts';
import {
  evaluateClosed,
  evaluateDecision,
  evaluateExplanation,
  hasIncorrectDecisionEvidence,
} from './feedback.ts';
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
export interface State {
  screen: 'start' | 'game' | 'end';
  step: Step;
  route: Route;
  progress: Progress[];
  explanation: Explanation;
  firstRoute?: Route;
  decision: Decision;
  words: boolean;
  highlight?: Person;
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
export function initialState(): State {
  return {
    screen: 'start',
    step: 0,
    route: 'direct',
    progress: Array.from({ length: tasks.length }, newProgress),
    explanation: { text: '' },
    decision: { text: '' },
    words: false,
  };
}
export function selectedPerson(s: State): Person {
  return (
    s.highlight ?? (s.step === 2 ? 'david' : s.step >= 4 ? 'leila' : 'amina')
  );
}
export function normalizeView(s: State): State {
  if (s.step === 0) s.route = 'direct';
  else if (!visibleRoutes(s.step).includes(s.route)) s.route = 'north';
  if (s.highlight && !visiblePersons(s.step).includes(s.highlight))
    s.highlight = undefined;
  if (s.step === 4 && !s.progress[4].prediction && !s.progress[4].supported)
    s.route = 'direct';
  return s;
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
  | {
      type:
        | 'route'
        | 'decision-route'
        | 'prediction'
        | 'route-answer'
        | 'first-route';
      value: Route;
    }
  | { type: 'foot'; value: Foot }
  | { type: 'bus'; value: Route }
  | { type: 'person' | 'highlight'; value: Person }
  | { type: 'help'; value: number }
  | { type: 'advantage' | 'disadvantage'; value?: Evidence }
  | { type: 'criterion'; value?: Criterion }
  | { type: 'decision-panel'; value: DecisionPanel }
  | { type: 'advantage-other' | 'disadvantage-other'; value: Route }
  | { type: 'weighting'; value?: Evidence }
  | { type: 'submit-ungraded'; persisted: boolean }
  | { type: 'cause'; value?: Cause }
  | { type: 'effect'; value?: Effect }
  | { type: 'text' | 'explanation-text'; value: string }
  | { type: 'transfer'; value: 'yes' | 'no' }
  | { type: 'check' | 'use-example'; persisted: boolean };
export function reduce(current: State, action: Action): State {
  if (action.type === 'restart') return initialState();
  const s = structuredClone(current),
    p = s.progress[s.step];
  const invalidate = () => {
    p.feedback = undefined;
    p.complete = false;
  };
  const invalidateDecision = () => {
    s.decision.supported = undefined;
    s.decision.ungraded = undefined;
    s.decision.weighting = undefined;
    s.decision.acceptConflict = undefined;
    invalidate();
  };
  const trackLeila = () => {
    if (
      s.step === 4 &&
      (p.prediction || p.supported) &&
      selectedPerson(s) === 'leila' &&
      !p.explored.includes(s.route)
    )
      p.explored.push(s.route);
  };
  switch (action.type) {
    case 'start':
      s.screen = 'game';
      break;
    case 'words':
      s.words = !s.words;
      break;
    case 'route':
      if (
        s.step > 0 &&
        visibleRoutes(s.step).includes(action.value) &&
        !(s.step === 4 && !p.prediction && !p.supported)
      )
        s.route = action.value;
      trackLeila();
      break;
    case 'highlight':
      if (visiblePersons(s.step).includes(action.value))
        s.highlight = action.value;
      trackLeila();
      break;
    case 'foot':
    case 'bus':
    case 'person':
      if (s.step > 2 || p.complete) break;
      if (action.type === 'foot') p.foot = action.value;
      if (action.type === 'bus') p.bus = action.value;
      if (action.type === 'person') p.person = action.value;
      invalidate();
      break;
    case 'first-route':
      if (s.step === 3 && action.value !== 'south') s.firstRoute = action.value;
      break;
    case 'prediction':
      if (s.step === 4 && !p.prediction) {
        p.prediction = action.value;
        s.route = 'direct';
        s.highlight = 'leila';
        trackLeila();
      }
      break;
    case 'route-answer':
      if (s.step === 4) {
        p.routeAnswer = action.value;
        invalidate();
      }
      break;
    case 'cause':
    case 'effect':
      if (s.step === 3) {
        if (action.type === 'cause') s.explanation.cause = action.value;
        else s.explanation.effect = action.value;
        s.explanation.supported = undefined;
        invalidate();
      }
      break;
    case 'help':
      p.help = Math.max(p.help, Math.min(3, action.value));
      if (p.help === 3 && s.step < 3) {
        p.complete = true;
        p.supported = true;
      }
      break;
    case 'submit-ungraded':
      if (s.step !== 5 || !s.decision.text.trim()) break;
      s.decision.ungraded = Boolean(s.decision.route && s.decision.criterion);
      // Deliberate ungraded submission never marks the structured argument as verified.
      p.feedback = evaluateDecision(s.decision, action.persisted);
      p.complete = p.feedback.complete;
      break;
    case 'check': {
      if (s.step === 5) {
        p.feedback = evaluateDecision(s.decision, action.persisted);
        p.complete = p.feedback.complete;
        if (hasIncorrectDecisionEvidence(s.decision))
          p.failures = Math.min(2, p.failures + 1);
      } else if (s.step === 3) {
        const evaluated = evaluateExplanation(
          s.explanation,
          p.failures,
          action.persisted,
        );
        p.feedback = evaluated.feedback;
        p.complete = p.feedback.complete;
        if (evaluated.failed) p.failures = Math.min(2, p.failures + 1);
      } else if (!p.complete) {
        const evaluated = evaluateClosed(s.step, p, p.failures);
        p.feedback = evaluated.feedback;
        p.complete = p.feedback.complete;
        if (evaluated.failed) p.failures = Math.min(2, p.failures + 1);
      }
      if (p.failures >= 2) {
        p.help = 3;
        if (s.step < 3) p.supported = true;
      }
      break;
    }
    case 'use-example':
      if (p.help !== 3) break;
      if (s.step === 3) {
        Object.assign(s.explanation, {
          cause: 'shorter',
          effect: 'total',
          supported: true,
        });
        p.feedback = evaluateExplanation(
          s.explanation,
          0,
          action.persisted,
        ).feedback;
      } else if (s.step === 4) {
        p.routeAnswer = 'south';
        p.feedback = {
          kind: 'hint',
          title: '→ Mit Unterstützung verglichen',
          text: 'Du hast das erklärte Beispiel zu Leilas Wegen übernommen. Du kannst die Wege weiter auf der Karte testen.',
          complete: true,
        };
      } else if (s.step === 5 && decisionExample(s.decision)) {
        Object.assign(s.decision, decisionExample(s.decision));
        p.feedback = evaluateDecision(s.decision, action.persisted);
      } else break;
      p.supported = true;
      p.complete = p.feedback.complete;
      break;
    case 'decision-panel':
      if (s.step === 5) s.decision.panel = action.value;
      break;
    case 'weighting':
      if (s.step === 5) {
        s.decision.weighting = action.value;
        s.decision.acceptConflict = action.value ? true : undefined;
        s.decision.supported = undefined;
        s.decision.ungraded = undefined;
        invalidate();
      }
      break;
    case 'advantage-other':
    case 'disadvantage-other':
      if (s.step === 5 && action.value !== s.decision.route) {
        const field = action.type === 'advantage-other' ? 'advantage' : 'disadvantage';
        s.decision[field === 'advantage' ? 'advantageOther' : 'disadvantageOther'] = action.value;
        s.decision[field] = undefined;
        invalidateDecision();
      }
      break;
    case 'decision-route':
      if (s.step === 5) {
        s.decision.route = action.value;
        s.decision.advantageOther = undefined;
        s.decision.disadvantageOther = undefined;
        s.decision.advantage = undefined;
        s.decision.disadvantage = undefined;
        invalidateDecision();
      }
      break;
    case 'criterion':
    case 'advantage':
    case 'disadvantage':
      if (s.step === 5) {
        if (action.type === 'criterion') s.decision.criterion = action.value;
        else s.decision[action.type] = action.value;
        invalidateDecision();
      }
      break;
    case 'text':
    case 'explanation-text': {
      const target = action.type === 'text' ? s.decision : s.explanation;
      target.text = action.value.slice(0, 1500);
      if (action.type === 'text') { s.decision.supported = undefined; s.decision.ungraded = undefined; }
      invalidate();
      break;
    }
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
        if (s.step < tasks.length - 1) {
          s.step = (s.step + 1) as Step;
          s.highlight = undefined;
          if (s.step === 4) {
            s.route = 'direct';
            s.highlight = 'leila';
          }
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
      if (s.step === 3) {
        s.explanation = { text: '' };
        s.firstRoute = undefined;
      }
      if (s.step === 4) {
        s.route = 'direct';
        s.highlight = 'leila';
      }
      if (s.step === 5) s.decision = { text: '' };
      break;
  }
  return normalizeView(s);
}
