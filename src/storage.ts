import {
  connections,
  effectsMatch,
  eventCauses,
  eventPaths,
  eventScreens,
  evaluateRevision,
} from './event.ts';
import { evaluateEventEffects } from './feedback.ts';
import { decisionPanels } from './decision.ts';
import { evaluateDecision } from './feedback.ts';
import { initialState, normalizeView } from './state.ts';
import type { State } from './state.ts';
import { criteria, persons, routes, tasks } from './content.ts';
import { evidenceIds, explanationChoices } from './model.ts';
export const storageKey = 'afrika-2040:kenia-bus:v2a';
const legacyStorageKey = 'afrika-2040:kenia-bus:v1';
type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export function saveSession(state: State, storage?: Store): boolean {
  try {
    if (!storage) return false;
    storage.setItem(storageKey, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
export function clearSession(storage?: Store) {
  for (const key of [storageKey, legacyStorageKey]) {
    try {
      storage?.removeItem(key);
    } catch {
      /* In-memory reset still works. */
    }
  }
}
export function readSession(storage?: Store): State {
  try {
    const raw = storage?.getItem(storageKey);
    if (!raw) return initialState();
    const s = JSON.parse(raw);
    const oneOf = (v: unknown, values: unknown[]) => values.includes(v);
    const optional = (v: unknown, values: unknown[]) =>
      v === undefined || oneOf(v, values);
    const text = (v: unknown) => typeof v === 'string' && v.length <= 1500;
    const feedback = (f: any) =>
      f === undefined ||
      (f &&
        oneOf(f.kind, ['correct', 'incorrect', 'partial', 'hint', 'neutral']) &&
        typeof f.title === 'string' &&
        typeof f.text === 'string' &&
        typeof f.complete === 'boolean');
    if (
      !s ||
      !oneOf(s.screen, ['start', 'game', 'end', ...eventScreens]) ||
      !oneOf(s.step, [0, 1, 2, 3, 4, 5]) ||
      !oneOf(s.route, routes) ||
      typeof s.words !== 'boolean' ||
      !optional(s.highlight, persons) ||
      !optional(s.firstRoute, ['direct', 'north'])
    )
      return initialState();
    const progress = (p: any) =>
      p &&
      oneOf(p.failures, [0, 1, 2]) &&
      oneOf(p.help, [0, 1, 2, 3]) &&
      typeof p.complete === 'boolean' &&
      optional(p.supported, [true, false]) &&
      optional(p.foot, ['platz', 'nord', 'sued']) &&
      optional(p.bus, routes) &&
      optional(p.person, persons) &&
      optional(p.prediction, routes) &&
      optional(p.routeAnswer, routes) &&
      Array.isArray(p.explored) &&
      p.explored.length <= routes.length &&
      new Set(p.explored).size === p.explored.length &&
      p.explored.every((r: unknown) => oneOf(r, routes)) &&
      optional(p.transfer, ['yes', 'no']) &&
      oneOf(p.transferFailures, [0, 1, 2]) &&
      feedback(p.feedback) &&
      feedback(p.transferFeedback);
    if (
      !Array.isArray(s.progress) ||
      s.progress.length !== tasks.length ||
      !s.progress.every(progress)
    )
      return initialState();
    const e = s.explanation,
      d = s.decision;
    if (
      !e ||
      !optional(e.cause, Object.keys(explanationChoices.cause)) ||
      !optional(e.effect, Object.keys(explanationChoices.effect)) ||
      !text(e.text) ||
      !optional(e.supported, [true, false])
    )
      return initialState();
    const decision = (d: any) =>
      !(
        !d ||
        !optional(d.route, routes) ||
        !optional(d.criterion, Object.keys(criteria)) ||
        !optional(d.advantage, evidenceIds) ||
        !optional(d.disadvantage, evidenceIds) ||
        !optional(d.supported, [true, false]) ||
        !optional(d.panel, [...decisionPanels]) ||
        !optional(d.advantageOther, routes) ||
        !optional(d.disadvantageOther, routes) ||
        !optional(d.weighting, evidenceIds) ||
        !optional(d.acceptConflict, [true, false]) ||
        !optional(d.ungraded, [true, false]) ||
        !text(d.text)
      );
    if (!decision(d)) return initialState();
    // Recheck old or edited completion flags; preserve the actual draft and history.
    if (s.progress[5].complete || s.screen === 'end') {
      const checked = evaluateDecision(d, true);
      s.progress[5].complete = checked.complete;
      s.progress[5].feedback = checked;
      if (!checked.complete) {
        if (s.screen === 'end') {
          s.screen = 'game';
          s.step = 5;
        }
        d.panel = 'weigh';
      }
    }
    const r = s.road;
    if (r !== undefined) {
      const valid =
        r &&
        decision(r.original) &&
        optional(r.originalSupported, [true, false]) &&
        evaluateDecision(r.original, true).complete &&
        decision(r.review) &&
        oneOf(r.view, ['before', 'now']) &&
        optional(r.path, [...eventPaths]) &&
        progress(r.find) &&
        progress(r.effects) &&
        progress(r.revision) &&
        r.answers &&
        typeof r.answers === 'object' &&
        !Array.isArray(r.answers) &&
        Object.entries(r.answers).every(
          ([route, answer]) =>
            oneOf(route, routes) && oneOf(answer, ['longer', 'same']),
        ) &&
        typeof r.compared === 'boolean' &&
        optional(r.connection, Object.keys(connections)) &&
        optional(r.cause, Object.keys(eventCauses)) &&
        text(r.explanationText) &&
        optional(r.explanationUngraded, [true, false]) &&
        optional(r.explanationSupported, [true, false]) &&
        optional(r.changeEvidence, routes) &&
        optional(r.reason, ['goal', 'priority']);
      if (!valid) {
        delete s.road;
        if (oneOf(s.screen, [...eventScreens])) {
          s.screen = s.progress[5].complete ? 'end' : 'game';
          s.step = 5;
        }
      } else {
        r.find.complete = r.find.complete && r.path === 'leila-platz';
        r.compared = r.compared && effectsMatch(r);
        if (r.effects.complete) {
          r.effects.feedback = evaluateEventEffects(r, true).feedback;
          r.effects.complete = r.effects.feedback.complete;
        }
        if (r.revision.complete) {
          r.revision.feedback = evaluateRevision(r, true);
          r.revision.complete = r.revision.feedback.complete;
        }
        if (oneOf(s.screen, [...eventScreens])) {
          s.step = 5;
          if (!r.find.complete && s.screen !== 'event-find')
            s.screen = 'event-find';
          else if (
            !r.effects.complete &&
            (s.screen === 'event-review' || s.screen === 'event-end')
          )
            s.screen = 'event-effects';
          else if (!r.revision.complete && s.screen === 'event-end')
            s.screen = 'event-review';
          if (s.screen === 'event-review') r.view = 'now';
          if (
            s.screen === 'event-find' &&
            !r.find.complete &&
            r.find.help !== 3
          )
            r.view = 'before';
        }
      }
    } else if (oneOf(s.screen, [...eventScreens])) {
      s.screen = s.progress[5].complete ? 'end' : 'game';
      s.step = 5;
    }
    return normalizeView(s as State);
  } catch {
    return initialState();
  }
}
