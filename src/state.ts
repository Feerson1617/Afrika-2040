import {
  reduceLearning,
  type LearningState,
  type LearningAction,
} from './learning/storage.ts';
import {
  reduceInquiry,
  type Inquiry,
  type InquiryAction,
} from './inquiry/state.ts';
import {
  reduceGeography,
  type Geography,
  type GeoAction,
} from './geography/state.ts';
import { reduceStudy, studyProgress } from './regions/state.ts';
import type { StudyId, StudyState, StudyAction } from './regions/types.ts';
import { newProgress } from './progress.ts';
import type { Progress } from './progress.ts';
export { newProgress } from './progress.ts';
export type { Progress } from './progress.ts';
import { measures } from './demand-content.ts';
import type { DemandGoal, DemandScreen, Measure } from './demand-content.ts';
import { demandExample, demandScenario, trialMatches } from './demand.ts';
import type { DemandDecision, DemandState } from './demand.ts';
import {
  evaluateDemandCheck,
  evaluateDemandTrial,
  evaluateDemandDecision,
} from './feedback.ts';
import {
  effectsMatch,
  evaluateRevision,
  hasIncorrectRevisionEvidence,
  revisionDraft,
} from './event.ts';
import type { EventPath, RoadState } from './event.ts';
import type {
  Criterion,
  Foot,
  Person,
  Route,
  Situation,
  Step,
} from './content.ts';
import { tasks, visiblePersons, visibleRoutes } from './content.ts';
import type { Cause, Effect, Evidence } from './model.ts';
import { decisionExample } from './decision.ts';
import type { DecisionPanel } from './decision.ts';
import type { Decision, Explanation } from './feedback.ts';
import {
  evaluateClosed,
  settleEarlyExplanation,
  evaluateDecision,
  evaluateExplanation,
  hasIncorrectDecisionEvidence,
  evaluateEventFind,
  evaluateEventEffects,
} from './feedback.ts';
export interface State {
  learning?: LearningState;
  inquiry?: Inquiry;
  geography?: Geography;
  screen:
    | 'learning'
    | 'inquiry'
    | 'review'
    | 'start'
    | 'game'
    | 'end'
    | 'study'
    | import('./event.ts').EventScreen
    | DemandScreen;
  studies?: Partial<Record<StudyId, StudyState>>;
  activeStudy?: StudyId;
  demand?: DemandState;
  road?: RoadState;
  step: Step;
  route: Route;
  progress: Progress[];
  explanation: Explanation;
  firstRoute?: Route;
  decision: Decision;
  words: boolean;
  highlight?: Person;
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
export type RoadAction =
  | { type: 'event-start' | 'event-next' | 'event-back' | 'event-reset' }
  | { type: 'event-view'; value: Situation }
  | { type: 'event-path'; value: EventPath }
  | { type: 'event-answer'; route: Route; value: 'longer' | 'same' }
  | { type: 'event-connection'; value?: RoadState['connection'] }
  | { type: 'event-cause'; value?: RoadState['cause'] }
  | { type: 'event-text'; value: string }
  | { type: 'event-change-evidence'; value: Route }
  | { type: 'event-reason'; value: 'goal' | 'priority' }
  | { type: 'event-submit-explanation'; persisted: boolean };
export type DemandAction =
  | {
      type:
        | 'demand-start'
        | 'demand-next'
        | 'demand-back'
        | 'demand-reset'
        | 'episode-home'
        | 'episode-report';
    }
  | { type: 'demand-route'; value: Route }
  | { type: 'demand-view'; value: 'before' | 'now' }
  | { type: 'demand-enough'; value: 'yes' | 'no' }
  | { type: 'demand-later'; value: number }
  | { type: 'demand-measure'; value: Measure | 'base' }
  | { type: 'demand-capacity'; value: 'more' | 'same' }
  | { type: 'demand-walk'; value: 'shorter' | 'same' }
  | { type: 'demand-proposal'; value: Measure }
  | { type: 'demand-goal' | 'demand-weighting'; value: DemandGoal }
  | { type: 'demand-advantage'; value: DemandDecision['advantage'] }
  | { type: 'demand-disadvantage'; value: DemandDecision['disadvantage'] }
  | { type: 'demand-text'; value: string };
export type Action =
  | LearningAction
  | InquiryAction
  | GeoAction
  | StudyAction
  | DemandAction
  | RoadAction
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
  if (action.type === 'learning')
    return {
      ...current,
      screen: action.op === 'home' ? 'start' : 'learning',
      learning: reduceLearning(current.learning, action),
    };
  if (current.screen === 'learning') current = { ...current, screen: 'start' };
  if (action.type === 'inquiry')
    return {
      ...current,
      screen: action.op === 'home' ? 'start' : 'inquiry',
      inquiry: reduceInquiry(current.inquiry, action),
    };
  if (current.screen === 'inquiry') return current;
  if (action.type === 'geography') return reduceGeography(current, action);
  if (action.type === 'study' || current.screen === 'study')
    return reduceStudy(current, action);
  if (
    action.type === 'episode-home' ||
    action.type === 'episode-report' ||
    current.screen.startsWith('demand-') ||
    action.type.startsWith('demand-')
  )
    return reduceDemand(current, action);
  if (current.screen.startsWith('event-') || action.type.startsWith('event-'))
    return reduceRoad(current, action);
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
        settleEarlyExplanation(s.step, p);
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
        if (s.step < 3) settleEarlyExplanation(s.step, p);
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
        const field =
          action.type === 'advantage-other' ? 'advantage' : 'disadvantage';
        s.decision[
          field === 'advantage' ? 'advantageOther' : 'disadvantageOther'
        ] = action.value;
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
      if (action.type === 'text') {
        s.decision.supported = undefined;
        s.decision.ungraded = undefined;
      }
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

export function currentProgress(s: State): Progress {
  if (s.screen === 'study' && studyProgress(s)) return studyProgress(s)!;
  if (s.demand && s.screen.startsWith('demand-')) return demandProgress(s);
  if (s.road && s.screen.startsWith('event-'))
    return s.screen === 'event-find'
      ? s.road.find
      : s.screen === 'event-effects'
        ? s.road.effects
        : s.road.revision;
  return s.progress[s.step];
}
export function currentDecision(s: State): Decision {
  return s.road && (s.screen === 'event-review' || s.screen === 'event-end')
    ? s.road.review
    : s.decision;
}
function reduceRoad(current: State, action: Action): State {
  const s = structuredClone(current);
  if (action.type === 'event-start') {
    if (
      s.screen !== 'end' ||
      !s.progress[5].complete ||
      !evaluateDecision(s.decision, true).complete
    )
      return s;
    s.road ??= {
      original: structuredClone(s.decision),
      originalSupported: Boolean(s.progress[5].supported),
      view: 'before',
      find: newProgress(),
      effects: newProgress(),
      revision: newProgress(),
      answers: {},
      compared: false,
      explanationText: '',
      review: revisionDraft(s.decision),
    };
    s.screen = !s.road.find.complete
      ? 'event-find'
      : !s.road.effects.complete
        ? 'event-effects'
        : 'event-review';
    s.route = s.road.original.route!;
    s.highlight = 'leila';
    if (s.screen !== 'event-find') s.road.view = 'now';
    return s;
  }
  const r = s.road;
  if (!r || !s.screen.startsWith('event-')) return s;
  const p = currentProgress(s);
  const invalidate = () => {
    p.complete = false;
    p.feedback = undefined;
  };
  const editReview = () => {
    r.review.supported = undefined;
    r.review.ungraded = undefined;
    r.review.weighting = undefined;
    r.review.acceptConflict = undefined;
    r.reason = undefined;
    invalidate();
  };
  switch (action.type) {
    case 'words':
      s.words = !s.words;
      break;
    case 'route':
      s.route = action.value;
      break;
    case 'highlight':
      s.highlight = action.value;
      break;
    case 'event-view':
      if (
        s.screen === 'event-effects' ||
        (s.screen === 'event-find' && (r.find.complete || r.find.help === 3))
      )
        r.view = action.value;
      break;
    case 'event-path':
      if (s.screen === 'event-find') {
        r.path = action.value;
        invalidate();
      }
      break;
    case 'event-answer':
      if (s.screen === 'event-effects') {
        r.answers[action.route] = action.value;
        r.compared = false;
        r.explanationSupported = undefined;
        r.explanationUngraded = undefined;
        r.revision.complete = false;
        invalidate();
      }
      break;
    case 'event-connection':
    case 'event-cause':
      if (s.screen === 'event-effects') {
        if (action.type === 'event-connection') r.connection = action.value;
        else r.cause = action.value;
        r.explanationSupported = undefined;
        r.explanationUngraded = undefined;
        invalidate();
      }
      break;
    case 'event-text':
      r.explanationText = action.value.slice(0, 1500);
      r.explanationUngraded = undefined;
      r.explanationSupported = undefined;
      invalidate();
      break;
    case 'event-submit-explanation':
      if (
        s.screen === 'event-effects' &&
        r.explanationText.trim() &&
        r.compared &&
        effectsMatch(r)
      ) {
        r.explanationUngraded = true;
        p.feedback = evaluateEventEffects(r, action.persisted).feedback;
        p.complete = p.feedback.complete;
      }
      break;
    case 'check': {
      if (s.screen === 'event-review') {
        p.feedback = evaluateRevision(r, action.persisted);
        p.complete = p.feedback.complete;
        if (hasIncorrectRevisionEvidence(r))
          p.failures = Math.min(2, p.failures + 1);
      } else if (s.screen === 'event-find' || s.screen === 'event-effects') {
        const evaluated =
          s.screen === 'event-find'
            ? evaluateEventFind(r.path, p.failures)
            : evaluateEventEffects(r, action.persisted);
        p.feedback = evaluated.feedback;
        p.complete = p.feedback.complete;
        if (evaluated.failed) p.failures = Math.min(2, p.failures + 1);
        if (s.screen === 'event-effects' && effectsMatch(r)) r.compared = true;
        if (s.screen === 'event-find' && p.complete) r.view = 'now';
      }
      if (p.failures >= 2) {
        p.help = 3;
        if (s.screen === 'event-find') r.view = 'now';
      }
      break;
    }
    case 'help':
      p.help = Math.max(p.help, Math.min(3, action.value));
      break;
    case 'use-example':
      if (p.help !== 3) break;
      if (s.screen === 'event-find') {
        r.path = 'leila-platz';
        r.view = 'now';
        p.feedback = {
          kind: 'hint',
          title: '→ Mit Hilfe gefunden',
          text: evaluateEventFind(r.path, 0).feedback.text,
          complete: true,
        };
      } else if (s.screen === 'event-effects') {
        r.answers = { direct: 'longer', north: 'longer', south: 'same' };
        r.compared = true;
        r.connection = 'sued';
        r.cause = 'unchanged';
        r.explanationSupported = true;
        r.explanationUngraded = undefined;
        p.feedback = evaluateEventEffects(r, action.persisted).feedback;
      } else if (s.screen === 'event-review') {
        const example = decisionExample(r.review, 'now');
        if (!example) break;
        Object.assign(r.review, example);
        r.changeEvidence = r.review.route;
        r.reason = 'priority';
        p.feedback = evaluateRevision(r, action.persisted);
      } else break;
      p.supported = true;
      p.complete = p.feedback.complete;
      break;
    case 'decision-route':
      if (s.screen === 'event-review') {
        r.review.route = action.value;
        r.review.advantage = undefined;
        r.review.disadvantage = undefined;
        r.review.advantageOther = undefined;
        r.review.disadvantageOther = undefined;
        r.changeEvidence = undefined;
        editReview();
      }
      break;
    case 'criterion':
    case 'advantage':
    case 'disadvantage':
      if (s.screen === 'event-review') {
        if (action.type === 'criterion') r.review.criterion = action.value;
        else r.review[action.type] = action.value;
        editReview();
      }
      break;
    case 'advantage-other':
    case 'disadvantage-other':
      if (s.screen === 'event-review' && action.value !== r.review.route) {
        const field =
          action.type === 'advantage-other' ? 'advantage' : 'disadvantage';
        r.review[field] = undefined;
        r.review[
          field === 'advantage' ? 'advantageOther' : 'disadvantageOther'
        ] = action.value;
        editReview();
      }
      break;
    case 'event-change-evidence':
      r.changeEvidence = action.value;
      r.review.ungraded = undefined;
      r.review.supported = undefined;
      invalidate();
      break;
    case 'event-reason':
      r.reason = action.value;
      r.review.weighting =
        action.value === 'priority' ? r.review.advantage : undefined;
      r.review.acceptConflict = action.value === 'priority' ? true : undefined;
      r.review.supported = undefined;
      r.review.ungraded = undefined;
      invalidate();
      break;
    case 'weighting':
      r.review.weighting = action.value;
      r.review.acceptConflict = action.value ? true : undefined;
      r.review.supported = undefined;
      r.reason = action.value ? 'priority' : undefined;
      invalidate();
      break;
    case 'text':
      r.review.text = action.value.slice(0, 1500);
      r.review.supported = undefined;
      r.review.ungraded = undefined;
      invalidate();
      break;
    case 'submit-ungraded':
      if (r.review.text.trim()) {
        r.review.ungraded = Boolean(r.review.route && r.review.criterion);
        p.feedback = evaluateRevision(r, action.persisted);
        p.complete = p.feedback.complete;
      }
      break;
    case 'event-next':
      if (!p.complete) break;
      if (s.screen === 'event-find') {
        s.screen = 'event-effects';
        r.view = 'now';
      } else if (s.screen === 'event-effects') {
        s.screen = 'event-review';
        r.view = 'now';
      } else if (s.screen === 'event-review') s.screen = 'event-end';
      break;
    case 'event-back':
      if (s.screen === 'event-find') s.screen = 'end';
      else if (s.screen === 'event-effects') s.screen = 'event-find';
      else if (s.screen === 'event-review') s.screen = 'event-effects';
      else if (s.screen === 'event-end') s.screen = 'event-review';
      if (s.screen === 'event-review') r.view = 'now';
      break;
    case 'event-reset':
      if (s.screen === 'event-find') {
        r.find = newProgress();
        r.path = undefined;
        r.view = 'before';
        r.effects.complete = false;
        r.revision.complete = false;
      } else if (s.screen === 'event-effects') {
        r.effects = newProgress();
        r.answers = {};
        r.compared = false;
        r.connection = undefined;
        r.cause = undefined;
        r.explanationText = '';
        r.explanationSupported = undefined;
        r.explanationUngraded = undefined;
        r.revision.complete = false;
      } else if (s.screen === 'event-review') {
        r.revision = newProgress();
        r.review = revisionDraft(r.original);
        r.changeEvidence = undefined;
        r.reason = undefined;
      }
      break;
  }
  return s;
}

export function demandProgress(s: State): Progress {
  const d = s.demand!;
  return s.screen === 'demand-check'
    ? d.check
    : s.screen === 'demand-explore'
      ? d.explore
      : d.decide;
}
function reduceDemand(current: State, action: Action): State {
  const s = structuredClone(current);
  if (action.type === 'episode-report') {
    if (
      s.road?.find.complete &&
      s.road.effects.complete &&
      s.road.revision.complete &&
      evaluateRevision(s.road, true).complete
    ) {
      s.screen = 'event-end';
      s.step = 5;
    } else if (
      s.progress[5].complete &&
      evaluateDecision(s.decision, true).complete
    ) {
      s.screen = 'end';
      s.step = 5;
    }
    return s;
  }
  if (action.type === 'episode-home') {
    s.screen = 'start';
    return s;
  }
  if (action.type === 'demand-start') {
    if (!s.demand) {
      const revised =
        s.road &&
        s.road.find.complete &&
        s.road.effects.complete &&
        s.road.revision.complete &&
        evaluateRevision(s.road, true).complete;
      const first =
        s.progress[5].complete && evaluateDecision(s.decision, true).complete;
      s.demand = {
        route: revised
          ? s.road!.review.route
          : first
            ? s.decision.route
            : undefined,
        basis: revised ? 'revision' : first ? 'first' : 'chosen',
        view: 'before',
        seenNow: false,
        measure: 'base',
        explored: [],
        trials: {},
        check: newProgress(),
        explore: newProgress(),
        decide: newProgress(),
        decision: { text: '' },
      };
    }
    const d = s.demand;
    s.screen = !d.check.complete
      ? 'demand-check'
      : !d.explore.complete
        ? 'demand-explore'
        : !d.decide.complete
          ? 'demand-decide'
          : 'demand-end';
    return s;
  }
  const d = s.demand;
  if (!d || !s.screen.startsWith('demand-')) return s;
  const p = demandProgress(s);
  const invalidate = () => {
    p.complete = false;
    p.feedback = undefined;
  };
  const reopenDecision = () => {
    d.decide.complete = false;
    d.decide.feedback = undefined;
    d.decision.supported = undefined;
    d.decision.ungraded = undefined;
  };
  const editDecision = () => {
    reopenDecision();
    d.decision.weighting = undefined;
  };
  const assess = (evaluated: import('./feedback.ts').Evaluation) => {
    p.feedback = evaluated.feedback;
    p.complete = p.feedback.complete;
    if (evaluated.failed) p.failures = Math.min(2, p.failures + 1);
    if (p.failures >= 2) p.help = 3;
  };
  switch (action.type) {
    case 'words':
      s.words = !s.words;
      break;
    case 'demand-route':
      d.route = action.value;
      d.basis = 'chosen';
      d.check.complete = false;
      d.check.feedback = undefined;
      reopenDecision();
      break;
    case 'demand-view':
      d.view = action.value;
      if (action.value === 'now') d.seenNow = true;
      break;
    case 'demand-enough':
      d.enough = action.value;
      invalidate();
      reopenDecision();
      break;
    case 'demand-later':
      d.later = action.value;
      invalidate();
      reopenDecision();
      break;
    case 'demand-measure':
      d.measure = action.value;
      if (action.value !== 'base' && !d.explored.includes(action.value))
        d.explored.push(action.value);
      p.feedback = undefined;
      break;
    case 'demand-capacity':
    case 'demand-walk':
      if (s.screen === 'demand-explore' && d.measure !== 'base') {
        const t = (d.trials[d.measure] ??= {});
        if (action.type === 'demand-capacity') t.capacity = action.value;
        else t.walk = action.value;
        t.checked = undefined;
        t.supported = undefined;
        invalidate();
        reopenDecision();
      }
      break;
    case 'demand-proposal':
      d.decision.measure = action.value;
      d.decision.advantage = undefined;
      d.decision.disadvantage = undefined;
      editDecision();
      break;
    case 'demand-goal':
      d.decision.goal = action.value;
      editDecision();
      break;
    case 'demand-advantage':
      d.decision.advantage = action.value;
      editDecision();
      break;
    case 'demand-disadvantage':
      d.decision.disadvantage = action.value;
      editDecision();
      break;
    case 'demand-weighting':
      d.decision.weighting = action.value;
      reopenDecision();
      break;
    case 'demand-text':
      d.decision.text = action.value.slice(0, 1500);
      reopenDecision();
      break;
    case 'check':
      if (s.screen === 'demand-check') assess(evaluateDemandCheck(d));
      else if (s.screen === 'demand-explore') {
        const evaluated = evaluateDemandTrial(d);
        assess(evaluated);
        if (d.measure !== 'base' && evaluated.feedback.complete)
          d.trials[d.measure]!.checked = true;
        p.complete = measures.every(
          (m) => d.trials[m]?.checked && trialMatches(m, d.trials[m]),
        );
        p.feedback!.complete = p.complete;
      } else if (s.screen === 'demand-decide')
        assess(
          evaluateDemandDecision(d.decision, p.failures, action.persisted),
        );
      break;
    case 'help':
      p.help = Math.max(p.help, Math.min(3, action.value));
      break;
    case 'use-example':
      if (p.help !== 3) break;
      if (s.screen === 'demand-check') {
        if (!d.route) break; // A route is always the learner's choice.
        d.view = 'now';
        d.seenNow = true;
        d.enough = 'no';
        d.later = demandScenario().later;
        p.supported = true;
        assess(evaluateDemandCheck(d));
      } else if (s.screen === 'demand-explore') {
        if (d.measure === 'base') break;
        d.trials[d.measure] = {
          capacity: d.measure === 'bus' ? 'more' : 'same',
          walk: d.measure === 'path' ? 'shorter' : 'same',
          supported: true,
          checked: true,
        };
        p.supported = true;
        assess(evaluateDemandTrial(d));
        p.complete = measures.every(
          (m) => d.trials[m]?.checked && trialMatches(m, d.trials[m]),
        );
        p.feedback!.complete = p.complete;
      } else if (s.screen === 'demand-decide') {
        const example = demandExample(d.decision);
        if (!example) break;
        d.decision = example;
        p.supported = true;
        assess(
          evaluateDemandDecision(d.decision, p.failures, action.persisted),
        );
      }
      break;
    case 'submit-ungraded':
      if (
        s.screen === 'demand-decide' &&
        d.decision.text.trim() &&
        d.decision.measure &&
        d.decision.goal
      ) {
        d.decision.ungraded = true;
        assess(
          evaluateDemandDecision(d.decision, p.failures, action.persisted),
        );
      }
      break;
    case 'demand-next':
      if (p.complete)
        s.screen =
          s.screen === 'demand-check'
            ? 'demand-explore'
            : s.screen === 'demand-explore'
              ? 'demand-decide'
              : 'demand-end';
      break;
    case 'demand-back':
      s.screen =
        s.screen === 'demand-end'
          ? 'demand-decide'
          : s.screen === 'demand-decide'
            ? 'demand-explore'
            : s.screen === 'demand-explore'
              ? 'demand-check'
              : 'start';
      break;
    case 'demand-reset':
      if (s.screen === 'demand-check') {
        d.check = newProgress();
        d.enough = undefined;
        d.later = undefined;
        d.seenNow = false;
        d.view = 'before';
      } else if (s.screen === 'demand-explore') {
        d.explore = newProgress();
        d.trials = {};
        d.explored = [];
        d.measure = 'base';
      } else if (s.screen === 'demand-decide') {
        d.decide = newProgress();
        d.decision = { text: '' };
      }
      reopenDecision();
      break;
  }
  return s;
}
