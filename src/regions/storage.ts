import type { State } from '../state.ts';
import type { StudyId, StudyState } from './types.ts';
import { studies } from './registry.ts';
import { evaluateStudyDecision } from './shared.ts';
export function restoreStudies(
  s: State,
  validProgress: (p: unknown) => boolean,
) {
  const incoming = s.studies;
  if (incoming && typeof incoming === 'object' && !Array.isArray(incoming)) {
    const safe: Partial<Record<StudyId, StudyState>> = {};
    for (const [key, raw] of Object.entries(incoming)) {
      const spec = Object.hasOwn(studies, key)
          ? studies[key as StudyId]
          : undefined,
        r = raw as StudyState,
        d = r?.decision;
      const optional = (v: unknown, values: unknown[]) =>
        v === undefined || values.includes(v);
      const options =
        spec && r?.data && spec.valid(r.data) ? spec.options(r.data) : [];
      if (
        !spec ||
        !r ||
        ![0, 1, 2, 3].includes(r.step) ||
        !spec.valid(r.data) ||
        !Array.isArray(r.progress) ||
        r.progress.length !== 3 ||
        !r.progress.every(validProgress) ||
        !d ||
        typeof d.text !== 'string' ||
        d.text.length > 1500 ||
        !optional(
          d.proposal,
          options.map((x) => x.id),
        ) ||
        !optional(d.goal, Object.keys(spec.goals)) ||
        !optional(d.benefit, [...options.map((x) => x.id), 'all']) ||
        !optional(d.limit, [...options.map((x) => x.id), 'none']) ||
        ![d.weighted, d.supported, d.ungraded].every((v) =>
          optional(v, [true, false]),
        )
      )
        continue;
      for (const step of [0, 1] as const)
        r.progress[step].complete =
          r.progress[step].complete &&
          spec.evaluate(step, r.data, 0).feedback.complete;
      if (r.progress[2].complete) {
        r.progress[2].feedback = evaluateStudyDecision(
          spec,
          r.data,
          d,
          r.progress[2].failures,
          true,
        ).feedback;
        r.progress[2].complete = r.progress[2].feedback.complete;
      }
      const first = r.progress.findIndex((p) => !p.complete);
      if (first >= 0 && r.step > first) r.step = first as 0 | 1 | 2;
      safe[key as StudyId] = r;
    }
    s.studies = safe;
  } else delete s.studies;
  if (
    s.screen === 'study' &&
    (!s.activeStudy ||
      !Object.hasOwn(studies, s.activeStudy) ||
      !s.studies ||
      !Object.hasOwn(s.studies, s.activeStudy))
  )
    s.screen = 'start';
}
