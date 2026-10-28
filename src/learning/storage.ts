import { profileIds, isProfile, profiles, type ProfileId } from './profiles.ts';
import type { Unit } from './catalog.ts';
import { tasksFor, type Task } from './tasks.ts';
import { evaluate, exampleValue } from './progress.ts';
export interface Identity {
  conceptId: string;
  taskId: string;
  variantId: string;
  profileId: ProfileId;
  taskVersion: 1;
  modelVersion: string;
  materialVersion: string;
  attemptId: string;
}
export interface Submission {
  answers: Record<string, string>;
  factual: string;
  support: 'example' | 'standard' | 'help' | 'own';
}
export interface Attempt {
  identity: Identity;
  answers: Record<string, string>;
  process: 'draft' | 'submitted' | 'explained';
  factual: string;
  form: 'chosen' | 'calculated' | 'written' | 'oral-self-report';
  failures: number;
  help: 0 | 1 | 2 | 3;
  standardScaffold: boolean;
  exampleShown: boolean;
  exampleUsed: boolean;
  adopted: boolean;
  criteriaSeen: boolean;
  revised: boolean;
  oral: boolean;
  submissions: Submission[];
  olderSubmissions: number;
  mapSelection?: string;
}
export interface LearningState {
  version: 1;
  profile?: ProfileId;
  pendingProfile?: ProfileId;
  unit?: Unit;
  view: 'menu' | 'profiles' | 'task' | 'journal';
  sequence: number;
  records: Record<string, { index: number; attempts: Record<string, Attempt> }>;
}
export type LearningAction = {
  type: 'learning';
  op:
    | 'open'
    | 'profiles'
    | 'request-profile'
    | 'confirm-profile'
    | 'cancel-profile'
    | 'unit'
    | 'answer'
    | 'check'
    | 'help'
    | 'adopt'
    | 'criteria'
    | 'oral'
    | 'next'
    | 'back'
    | 'journal'
    | 'menu'
    | 'home'
    | 'rework'
    | 'material';
  value?: string;
  field?: string;
};
export function newLearning(): LearningState {
  return { version: 1, view: 'menu', sequence: 0, records: {} };
}
export function areaId(unit: Unit, profile: ProfileId) {
  return `${unit}.${profile}.v1`;
}
export function identity(
  task: Task,
  unit: Unit,
  profile: ProfileId,
  sequence: number,
): Identity {
  return {
    conceptId: task.conceptId,
    taskId: task.id,
    variantId: `${areaId(unit, profile)}:${task.id}`,
    profileId: profile,
    taskVersion: 1,
    modelVersion: unit === 'c' ? 'population.balance.v1' : 'kenia.network.v1',
    materialVersion: `${task.material}.a3be815.v1`,
    attemptId: `local-${sequence}`,
  };
}
export function active(s: LearningState) {
  if (!s.profile || !s.unit) return;
  const key = areaId(s.unit, s.profile),
    record = s.records[key],
    tasks = tasksFor(s.unit, s.profile),
    index = record?.index ?? 0,
    task = tasks[index];
  if (!task) return;
  return {
    key,
    record,
    tasks,
    index,
    task,
    attempt: record?.attempts[task.id],
  };
}
function ensure(s: LearningState) {
  const a = active(s);
  if (!a) return;
  if (!s.records[a.key]) s.records[a.key] = { index: 0, attempts: {} };
  if (!s.records[a.key].attempts[a.task.id]) {
    s.sequence++;
    s.records[a.key].attempts[a.task.id] = {
      identity: identity(a.task, s.unit!, s.profile!, s.sequence),
      answers: {},
      process: 'draft',
      factual: 'ungraded',
      form: a.task.fields.some((f) => f.kind === 'text')
        ? 'written'
        : a.task.fields.some((f) => f.kind === 'integer')
          ? 'calculated'
          : 'chosen',
      failures: 0,
      help: 0,
      standardScaffold: profiles[s.profile!].standardHint,
      exampleShown: false,
      exampleUsed: false,
      adopted: false,
      criteriaSeen: false,
      revised: false,
      oral: false,
      submissions: [],
      olderSubmissions: 0,
    };
  }
  return active(s)!;
}
function checked(s: LearningState, adopt = false) {
  const a = ensure(s);
  if (!a?.attempt) return;
  const p = a.attempt;
  const result = evaluate(a.task, p.answers, p.failures);
  if (adopt) {
    for (const f of a.task.fields)
      if (result.parts.find((x) => x.field === f.id)?.status !== 'correct')
        p.answers[f.id] = exampleValue(f);
    p.exampleUsed = true;
    p.adopted = true;
    p.exampleShown = true;
  }
  const e = evaluate(a.task, p.answers, p.failures);
  if (e.error) {
    p.failures = Math.min(2, p.failures + 1);
    if (p.failures >= 2) {
      p.help = 3;
      p.exampleShown = true;
    }
  }
  p.process = e.ready ? (adopt ? 'explained' : 'submitted') : 'draft';
  p.factual = e.factual;
  if (p.submissions.length === 40) {
    p.submissions.shift();
    p.olderSubmissions++;
  }
  p.submissions.push({
    answers: { ...p.answers },
    factual: e.factual,
    support: p.exampleUsed
      ? 'example'
      : p.help
        ? 'help'
        : p.standardScaffold
          ? 'standard'
          : 'own',
  });
}
export function reduceLearning(
  value: LearningState | undefined,
  action: LearningAction,
): LearningState {
  const s = structuredClone(value ?? newLearning());
  if (action.op === 'open') {
    s.view = s.profile ? 'menu' : 'profiles';
    return s;
  }
  if (action.op === 'profiles') {
    s.view = 'profiles';
    return s;
  }
  if (action.op === 'request-profile' && isProfile(action.value)) {
    s.pendingProfile = action.value;
    return s;
  }
  if (action.op === 'cancel-profile') {
    delete s.pendingProfile;
    s.view = s.unit ? 'task' : 'menu';
    return s;
  }
  if (action.op === 'confirm-profile' && s.pendingProfile) {
    s.profile = s.pendingProfile;
    delete s.pendingProfile;
    s.view = s.unit ? 'task' : 'menu';
    ensure(s);
    return s;
  }
  if (action.op === 'menu' || action.op === 'home') {
    s.view = 'menu';
    return s;
  }
  if (action.op === 'journal') {
    s.view = 'journal';
    return s;
  }
  if (action.op === 'unit' && (action.value === 'c' || action.value === 's1')) {
    s.unit = action.value;
    s.view = s.profile ? 'task' : 'profiles';
    ensure(s);
    return s;
  }
  const a = ensure(s);
  if (!a?.attempt) return s;
  const p = a.attempt;
  if (
    action.op === 'answer' &&
    action.field &&
    a.task.fields.some((f) => f.id === action.field)
  ) {
    p.answers[action.field] = (action.value ?? '').slice(0, 2000);
    p.process = 'draft';
    p.factual = 'ungraded';
    p.adopted = false;
    if (p.criteriaSeen) p.revised = true;
  }
  if (action.op === 'oral' && a.task.fields.every((f) => f.kind === 'text')) {
    p.oral = !p.oral;
    p.form = p.oral ? 'oral-self-report' : 'written';
    p.process = 'draft';
    p.factual = 'ungraded';
  }
  if (action.op === 'check') {
    if (p.oral) {
      p.process = 'submitted';
      p.factual = 'ungraded';
      p.submissions.push({
        answers: { ...p.answers },
        factual: 'ungraded',
        support: p.exampleUsed
          ? 'example'
          : p.standardScaffold
            ? 'standard'
            : p.help
              ? 'help'
              : 'own',
      });
    } else checked(s);
  }
  if (
    action.op === 'material' &&
    /^(amina|david)-(direct|north)$/.test(action.value ?? '')
  )
    p.mapSelection = action.value;
  if (action.op === 'help') {
    p.help = (
      p.standardScaffold && p.help === 0 ? 2 : Math.min(3, p.help + 1)
    ) as Attempt['help'];
    if (p.help === 3) p.exampleShown = true;
  }
  if (action.op === 'adopt') checked(s, true);
  if (
    action.op === 'criteria' &&
    (p.process !== 'draft' ||
      p.help === 3 ||
      a.task.fields.some((f) => f.kind === 'text' && p.answers[f.id]?.trim()))
  )
    p.criteriaSeen = true;
  if (action.op === 'rework') {
    p.process = 'draft';
    p.adopted = false;
  }
  if (action.op === 'back' && a.index > 0) {
    s.records[a.key].index--;
    ensure(s);
  }
  if (action.op === 'next' && p.process !== 'draft') {
    if (a.index < a.tasks.length - 1) {
      s.records[a.key].index++;
      ensure(s);
    } else s.view = 'journal';
  }
  return s;
}
// Read optional learning data independently: a damaged record never discards a valid sibling or legacy branch.
export function restoreLearning(raw: unknown): LearningState | undefined {
  if (!raw || typeof raw !== 'object' || (raw as any).version !== 1) return;
  const v = raw as any,
    s = newLearning();
  s.sequence =
    Number.isSafeInteger(v.sequence) && v.sequence >= 0 && v.sequence < 1e9
      ? v.sequence
      : 0;
  if (isProfile(v.profile)) s.profile = v.profile;
  if (v.unit === 'c' || v.unit === 's1') s.unit = v.unit;
  if (['menu', 'profiles', 'task', 'journal'].includes(v.view)) s.view = v.view;
  const ids = new Set<string>();
  for (const unit of ['c', 's1'] as const)
    for (const profile of profileIds) {
      const key = areaId(unit, profile),
        r = v.records?.[key];
      if (!r || typeof r !== 'object') continue;
      const tasks = tasksFor(unit, profile),
        record = {
          index:
            Number.isInteger(r.index) && r.index >= 0 && r.index < tasks.length
              ? r.index
              : 0,
          attempts: {} as Record<string, Attempt>,
        };
      s.records[key] = record;
      for (const task of tasks) {
        const p = r.attempts?.[task.id];
        if (
          !p ||
          typeof p !== 'object' ||
          !p.answers ||
          typeof p.answers !== 'object'
        )
          continue;
        const wanted = identity(task, unit, profile, 0),
          got = p.identity;
        if (
          !got ||
          [
            'conceptId',
            'taskId',
            'variantId',
            'profileId',
            'taskVersion',
            'modelVersion',
            'materialVersion',
          ].some((k) => got[k] !== wanted[k as keyof Identity]) ||
          typeof got.attemptId !== 'string' ||
          !/^local-[1-9]\d{0,8}$/.test(got.attemptId) ||
          ids.has(got.attemptId)
        )
          continue;
        ids.add(got.attemptId);
        s.sequence = Math.max(s.sequence, Number(got.attemptId.slice(6)));
        const answers: Record<string, string> = {};
        for (const f of task.fields)
          if (typeof p.answers[f.id] === 'string')
            answers[f.id] = p.answers[f.id].slice(0, 2000);
        const e = evaluate(task, answers, 0),
          oral = p.oral === true && task.fields.every((f) => f.kind === 'text');
        const submitted =
          ['submitted', 'explained'].includes(p.process) && (e.ready || oral);
        const exampleUsed = p.exampleUsed === true || p.adopted === true;
        const a: Attempt = {
          identity: { ...wanted, attemptId: got.attemptId },
          answers,
          process: submitted
            ? exampleUsed && p.adopted === true
              ? 'explained'
              : 'submitted'
            : 'draft',
          factual:
            oral || (!submitted && p.factual === 'ungraded')
              ? 'ungraded'
              : e.factual,
          form: oral
            ? 'oral-self-report'
            : task.fields.some((f) => f.kind === 'text')
              ? 'written'
              : task.fields.some((f) => f.kind === 'integer')
                ? 'calculated'
                : 'chosen',
          failures: [0, 1, 2].includes(p.failures) ? p.failures : 0,
          help: [0, 1, 2, 3].includes(p.help) ? p.help : 0,
          standardScaffold: profiles[profile].standardHint,
          exampleShown: p.exampleShown === true,
          exampleUsed,
          adopted:
            p.adopted === true &&
            task.fields.every((f) => answers[f.id] === exampleValue(f)),
          criteriaSeen: p.criteriaSeen === true,
          revised: p.revised === true,
          oral,
          submissions: [],
          olderSubmissions:
            Number.isSafeInteger(p.olderSubmissions) && p.olderSubmissions >= 0
              ? p.olderSubmissions
              : 0,
        };
        if (Array.isArray(p.submissions))
          for (const item of p.submissions.slice(-40)) {
            if (!item || typeof item.answers !== 'object' || !item.answers)
              continue;
            const answer: Record<string, string> = {};
            for (const f of task.fields)
              if (typeof item.answers[f.id] === 'string')
                answer[f.id] = item.answers[f.id].slice(0, 2000);
            a.submissions.push({
              answers: answer,
              factual: evaluate(task, answer).factual,
              support: ['example', 'standard', 'help', 'own'].includes(
                item.support,
              )
                ? item.support
                : 'help',
            });
          }
        if (
          typeof p.mapSelection === 'string' &&
          /^(amina|david)-(direct|north)$/.test(p.mapSelection)
        )
          a.mapSelection = p.mapSelection;
        record.attempts[task.id] = a;
      }
    }
  if (s.view === 'task' && (!s.profile || !s.unit)) s.view = 'menu';
  if (s.profile && s.unit && s.view === 'task') ensure(s);
  return s;
}
