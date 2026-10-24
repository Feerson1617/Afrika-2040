import { newProgress, applyEvaluation } from '../progress.ts';
import { studies } from './registry.ts';
import { evaluateStudyDecision, decisionExample } from './shared.ts';
import type { StudyAction, StudyState } from './types.ts';
import type { State, Action } from '../state.ts';
export function newStudy(): StudyState {
  return {
    step: 0,
    data: {
      chain: [],
      selection: 'base',
      allocations: {},
      answers: {},
      explored: [],
      checked: [],
    },
    progress: Array.from({ length: 3 }, newProgress),
    decision: { text: '' },
  };
}
export function activeStudy(s: State) {
  return s.activeStudy && s.studies?.[s.activeStudy];
}
export function studyProgress(s: State) {
  const r = activeStudy(s);
  return r?.progress[Math.min(r.step, 2)];
}
export function reduceStudy(current: State, raw: Action): State {
  const s = structuredClone(current);
  if (raw.type === 'words') {
    s.words = !s.words;
    return s;
  }
  if (raw.type !== 'study') return s;
  const a: StudyAction = raw;
  if (a.op === 'home') {
    s.screen = 'start';
    return s;
  }
  if (a.op === 'start') {
    if (!a.id || !Object.hasOwn(studies, a.id)) return s;
    s.studies ??= {};
    s.studies[a.id] ??= { ...newStudy(), data: studies[a.id]!.initial() };
    s.activeStudy = a.id;
    s.screen = 'study';
    return s;
  }
  const r = activeStudy(s),
    spec = s.activeStudy && studies[s.activeStudy];
  if (!r || !spec || s.screen !== 'study') return s;
  const p = r.progress[Math.min(r.step, 2)];
  const reopen = (from: number) => {
    for (let i = from; i < 3; i++) {
      r.progress[i].complete = false;
      r.progress[i].feedback = undefined;
    }
    r.decision.supported = undefined;
    r.decision.ungraded = undefined;
    r.decision.weighted = undefined;
  };
  switch (a.op) {
    case 'panel':
      if (r.step === 2 && ['plan', 'benefit', 'limit'].includes(a.value ?? ''))
        r.panel = a.value as StudyState['panel'];
      break;
    case 'help':
      p.help = Math.max(p.help, Math.min(3, Number(a.value) || 1));
      break;
    case 'select':
      r.data = spec.change(r.data, a);
      p.feedback = undefined;
      break;
    case 'pick':
    case 'undo':
    case 'adjust':
      r.data = spec.change(r.data, a);
      reopen(r.step);
      break;
    case 'answer':
      if (
        r.step === 2 &&
        ['proposal', 'goal', 'benefit', 'limit', 'weighted'].includes(
          a.field ?? '',
        )
      ) {
        reopen(2);
        const d = r.decision;
        if (a.field === 'proposal') {
          d.proposal = a.value;
          d.benefit = undefined;
          d.limit = undefined;
        } else if (a.field === 'goal') d.goal = a.value;
        else if (a.field === 'benefit') d.benefit = a.value;
        else if (a.field === 'limit') d.limit = a.value;
        else d.weighted = a.value === 'yes';
      } else {
        r.data = spec.change(r.data, a);
        reopen(r.step);
      }
      break;
    case 'text':
      r.decision.text = (a.value ?? '').slice(0, 1500);
      reopen(2);
      break;
    case 'check': {
      if (r.step === 2)
        r.panel =
          !r.decision.proposal || !r.decision.goal
            ? 'plan'
            : !r.decision.benefit
              ? 'benefit'
              : 'limit';
      const e =
        r.step === 2
          ? evaluateStudyDecision(
              spec,
              r.data,
              r.decision,
              p.failures,
              Boolean(a.persisted),
            )
          : spec.evaluate(r.step as 0 | 1, r.data, p.failures);
      if (
        'mark' in e &&
        typeof e.mark === 'string' &&
        !r.data.checked.includes(e.mark)
      )
        r.data.checked.push(e.mark);
      applyEvaluation(p, e);
      break;
    }
    case 'adopt':
      if (p.help !== 3) break;
      if (r.step === 2) {
        const ex = decisionExample(spec, r.data, r.decision);
        if (!ex) break;
        r.decision = ex;
        r.panel = 'limit';
        applyEvaluation(
          p,
          evaluateStudyDecision(
            spec,
            r.data,
            r.decision,
            p.failures,
            Boolean(a.persisted),
          ),
        );
      } else {
        if (!spec.canAdopt(r.step as 0 | 1, r.data)) break;
        r.data = spec.example(r.step as 0 | 1, r.data);
        const e = spec.evaluate(r.step as 0 | 1, r.data, 0);
        if (
          'mark' in e &&
          typeof e.mark === 'string' &&
          !r.data.checked.includes(e.mark)
        )
          r.data.checked.push(e.mark);
        applyEvaluation(p, e);
      }
      p.supported = true;
      if (r.step < 2 && p.feedback) {
        p.feedback.kind = 'hint';
        p.feedback.title = '→ Mit erklärtem Beispiel bearbeitet';
      }
      break;
    case 'submit':
      if (
        r.step === 2 &&
        r.decision.text.trim() &&
        r.decision.proposal &&
        r.decision.goal
      ) {
        r.decision.ungraded = true;
        applyEvaluation(
          p,
          evaluateStudyDecision(
            spec,
            r.data,
            r.decision,
            p.failures,
            Boolean(a.persisted),
          ),
        );
      }
      break;
    case 'next':
      if (p.complete && r.step < 3) r.step = (r.step + 1) as StudyState['step'];
      break;
    case 'back':
      if (r.step > 0) r.step = (r.step - 1) as StudyState['step'];
      else s.screen = 'start';
      break;
    case 'reset':
      if (r.step < 2) r.data = spec.reset(r.step as 0 | 1, r.data);
      else r.decision = { text: '' };
      for (let i = Math.min(r.step, 2); i < 3; i++)
        r.progress[i] = newProgress();
      reopen(Math.min(r.step, 2));
      break;
  }
  return s;
}
