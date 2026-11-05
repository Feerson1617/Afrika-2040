import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reduce, type State } from '../src/state.ts';
import {
  newReview,
  evaluateTransfer,
  transferHint,
  type ReviewTab,
} from '../src/geography/transfer.ts';
import { episodeStatus } from '../src/geography/review-ui.ts';
import { readSession } from '../src/storage.ts';
const act = (s: State, op: any, value?: string, field?: string) =>
  reduce(s, { type: 'geography', op, value, field });
const reload = (s: State) =>
  readSession({
    getItem: () => JSON.stringify(s),
    setItem() {},
    removeItem() {},
  });
test('three country transfers reject unsupported real-world generalizations, bound attempts, require conscious example use and recheck edits', () => {
  for (const tab of ['KEN', 'GHA', 'MAR'] as const) {
    let s = act(initialState(), 'review');
    s = act(s, 'review-tab', tab);
    s = act(s, 'transfer-check');
    assert.equal(s.geography!.review!.records[tab].progress.failures, 0);
    s = act(s, 'transfer-answer', 'all', 'claim');
    s = act(s, 'transfer-check');
    let d = s.geography!.review!.records[tab];
    assert.equal(d.progress.feedback!.kind, 'incorrect');
    s = act(s, 'transfer-check');
    d = s.geography!.review!.records[tab];
    assert.equal(d.progress.help, 3);
    assert.equal(d.progress.supported, undefined);
    assert.equal(d.progress.complete, false);
    s = act(s, 'transfer-adopt');
    d = s.geography!.review!.records[tab];
    assert.equal(d.progress.supported, true);
    assert.equal(d.progress.complete, true);
    s = reload(s);
    assert.equal(s.screen, 'review');
    assert.equal(s.geography!.review!.records[tab].progress.supported, true);
    s = act(s, 'transfer-answer', 'all', 'claim');
    assert.equal(
      s.geography!.review!.records[tab].progress.supported,
      undefined,
    );
    assert.equal(s.geography!.review!.records[tab].progress.complete, false);
    s = act(s, 'transfer-answer', 'model', 'claim');
    s = act(s, 'transfer-check');
    assert.equal(
      s.geography!.review!.records[tab].progress.feedback!.kind,
      'correct',
    );
    const r = newReview();
    r.tab = tab;
    const hints = [1, 2, 3].map((level) => {
      r.records[tab].progress.help = level;
      return transferHint(r);
    });
    assert.equal(new Set(hints).size, 3);
  }
});
test('comparison acknowledges each right part, never counts missing input, preserves correct parts through the supported way', () => {
  for (const first of [true, false]) {
    const r = newReview(),
      d = r.records.common;
    d.answers[first ? 'consequences' : 'weigh'] = first
      ? 'different'
      : 'evidence';
    let e = evaluateTransfer('common', d);
    assert.equal(e.feedback.kind, 'partial');
    assert.equal(e.failed, false);
    d.answers[first ? 'weigh' : 'consequences'] = first ? 'any' : 'same';
    e = evaluateTransfer('common', d);
    assert.equal(e.feedback.kind, 'partial');
    assert.equal(e.failed, true);
    assert.match(e.feedback.text, /Das passt schon/);
    d.progress.failures = 1;
    assert.equal(evaluateTransfer('common', d).feedback.kind, 'hint');
  }
  let s = act(initialState(), 'review');
  s = act(s, 'review-tab', 'common');
  s = act(s, 'transfer-answer', 'different', 'consequences');
  s = act(s, 'transfer-answer', 'any', 'weigh');
  s = act(s, 'transfer-check');
  s = act(s, 'transfer-check');
  assert.equal(s.geography!.review!.records.common.progress.failures, 2);
  s = act(s, 'transfer-adopt');
  assert.deepEqual(s.geography!.review!.records.common.answers, {
    consequences: 'different',
    weigh: 'evidence',
  });
  assert.equal(s.geography!.review!.records.common.progress.complete, true);
});
test('review status is honest for previews and completed episodes; navigation and malformed optional review preserve previous episode answers', () => {
  let s = initialState();
  s.decision.text = 'Meine bisherige Antwort';
  assert.match(
    episodeStatus(s, 'KEN'),
    /Episode 1: noch nicht abgeschlossen · Vorschau/,
  );
  s.progress[5].complete = true;
  assert.match(episodeStatus(s, 'KEN'), /Episode 1: Abschluss vorhanden/);
  assert.match(episodeStatus(s, 'GHA'), /Episode 3: noch nicht abgeschlossen/);
  s = act(s, 'review');
  s = act(s, 'home');
  assert.equal(s.decision.text, 'Meine bisherige Antwort');
  s.geography!.review!.tab = 'bad' as ReviewTab;
  s = reload(s);
  assert.equal(s.geography!.review, undefined);
  assert.equal(s.decision.text, 'Meine bisherige Antwort');
  s = act(s, 'review');
  assert.equal(s.geography!.review!.tab, 'KEN');
  s = act(s, 'transfer-answer', 'model', 'claim');
  s = act(s, 'transfer-check');
  s.geography!.review!.records.KEN.answers.claim = 'all';
  s = reload(s);
  assert.equal(s.geography!.review!.records.KEN.progress.complete, false);
});
