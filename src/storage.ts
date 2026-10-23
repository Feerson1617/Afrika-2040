import { initialState } from './state.ts';
import type { State } from './state.ts';

export const storageKey = 'afrika-2040:kenia-bus:v1';
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
  try {
    storage?.removeItem(storageKey);
  } catch {
    /* The in-memory reset still works. */
  }
}
export function readSession(storage?: Store): State {
  try {
    const raw = storage?.getItem(storageKey);
    if (!raw) return initialState();
    const s = JSON.parse(raw);
    const oneOf = (v: unknown, values: unknown[]) => values.includes(v);
    const feedback = (f: any) =>
      f === undefined ||
      (f &&
        oneOf(f.kind, ['correct', 'incorrect', 'partial', 'hint', 'neutral']) &&
        typeof f.title === 'string' &&
        typeof f.text === 'string' &&
        typeof f.complete === 'boolean');
    if (
      !s ||
      !oneOf(s.screen, ['start', 'game', 'end']) ||
      !oneOf(s.step, [0, 1, 2, 3]) ||
      !oneOf(s.route, ['direct', 'north']) ||
      typeof s.words !== 'boolean' ||
      !oneOf(s.highlight, [undefined, 'amina', 'david'])
    )
      return initialState();
    if (
      !Array.isArray(s.progress) ||
      s.progress.length !== 4 ||
      !s.progress.every(
        (p: any) =>
          p &&
          oneOf(p.failures, [0, 1, 2]) &&
          oneOf(p.help, [0, 1, 2, 3]) &&
          typeof p.complete === 'boolean' &&
          oneOf(p.foot, [undefined, 'platz', 'nord']) &&
          oneOf(p.bus, [undefined, 'direct', 'north']) &&
          oneOf(p.person, [undefined, 'amina', 'david']) &&
          oneOf(p.transfer, [undefined, 'yes', 'no']) &&
          oneOf(p.transferFailures, [0, 1, 2]) &&
          feedback(p.feedback) &&
          feedback(p.transferFeedback),
      )
    )
      return initialState();
    const d = s.decision;
    const facts = [
      undefined,
      'amina-direct',
      'amina-north',
      'david-direct',
      'david-north',
    ];
    if (
      !d ||
      !oneOf(d.route, [undefined, 'direct', 'north']) ||
      !oneOf(d.advantage, facts) ||
      !oneOf(d.disadvantage, facts) ||
      typeof d.text !== 'string' ||
      d.text.length > 1500
    )
      return initialState();
    return s as State;
  } catch {
    return initialState();
  }
}
