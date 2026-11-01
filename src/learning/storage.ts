import { adjustAllocation } from './allocation.ts';
import { profileIds, isProfile, profiles, type ProfileId } from './profiles.ts';
import { isUnit, implementedUnits, type Unit } from './catalog.ts';
import { resolveSimulation } from './simulation-variants.ts';
import { futureReference } from './topic-variants.ts';
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
  contextKey?: string;
  labels?: Record<string, string>;
  contextPlan?: 'cool' | 'shade';
  contextGoal?: 'loss' | 'access';
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
  simulationSelection?: string;
  explored?: string[];
}
export interface LearningState {
  version: 1;
  profile?: ProfileId;
  pendingProfile?: ProfileId;
  pendingUnit?: Unit;
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
    | 'recommend'
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
    | 'material'
    | 'future-revise'
    | 'simulate'
    | 'allocate';
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
    modelVersion:
      unit === 'c'
        ? 'population.balance.v1'
        : unit === 's1'
          ? 'kenia.network.v1'
          : `topic.${unit}.v1`,
    materialVersion: task.focus
      ? `${task.focus.topic}.8d73c02.v1`
      : `${task.material}.a3be815.v1`,
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
    task: resolveSimulation(
      futureReference(task, record?.attempts ?? {}),
      record?.attempts ?? {},
    ),
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
// All answer changes, including actual example replacements, use this one path.
function setAnswer(
  a: NonNullable<ReturnType<typeof active>>,
  field: string,
  value: string,
) {
  const p = a.attempt!;
  value = value.slice(0, 2000);
  if (p.answers[field] === value) return false;
  p.answers[field] = value;
  if (
    field === 'plan' &&
    ['network', 'demand', 'cocoa', 'water', 'area'].includes(
      a.task.simulation?.kind ?? '',
    )
  )
    p.simulationSelection =
      a.task.simulation?.kind === 'network' ? 'amina-' + value : value;
  if (a.task.simulation?.kind === 'orientation' && field === 'country')
    p.simulationSelection = value;
  p.process = 'draft';
  p.factual = 'ungraded';
  p.adopted = false;
  if (p.criteriaSeen) p.revised = true;
  for (const [id, later] of Object.entries(a.record.attempts)) {
    if (a.tasks.find((t) => t.id === id)?.dependsOn?.includes(a.task.id)) {
      later.process = 'draft';
      later.factual = 'ungraded';
      later.adopted = false;
      delete later.simulationSelection;
    }
  }
  if (['future.plan', 'future.goal', 'future.weight'].includes(a.task.id)) {
    for (const [id, later] of Object.entries(a.record.attempts)) {
      const dependent =
        a.task.id === 'future.plan'
          ? a.tasks.find((t) => t.id === id)?.reference ||
            ['future.relation', 'future.revision'].includes(id)
          : a.task.id === 'future.weight'
            ? [
                'future.judgment',
                'future.relation',
                'future.revision',
              ].includes(id)
            : [
                'future.weight',
                'future.judgment',
                'future.relation',
                'future.revision',
              ].includes(id);
      if (dependent) {
        later.process = 'draft';
        later.factual = 'ungraded';
        later.adopted = false;
      }
    }
  }
  return true;
}
export function canContinue(task: Task, p: Attempt) {
  if (p.process === 'draft') return false;
  if (task.simulation?.required?.some((id) => !p.explored?.includes(id)))
    return false;
  if (task.contextKey && p.submissions.at(-1)?.contextKey !== task.contextKey)
    return false;
  if (task.reference) {
    const proof = p.submissions.at(-1);
    if (!task.contextPlan || proof?.contextPlan !== task.contextPlan)
      return false;
    if (
      ['future.weight', 'future.judgment'].includes(task.id) &&
      (!task.contextGoal || proof.contextGoal !== task.contextGoal)
    )
      return false;
  }
  return (
    (p.oral && task.fields.every((f) => f.kind === 'text')) ||
    evaluate(task, p.answers, p.failures).ready
  );
}
function checked(s: LearningState, adopt = false) {
  const a = ensure(s);
  if (!a?.attempt) return;
  const p = a.attempt;
  if (
    a.task.fields.length === 1 &&
    ['cocoa', 'water'].includes(a.task.simulation?.kind ?? '') &&
    ['quality', 'process', 'repair', 'tech'].includes(a.task.fields[0].id)
  )
    p.simulationSelection = a.task.fields[0].id;
  const result = evaluate(a.task, p.answers, p.failures);
  let usedExample = false;
  if (adopt) {
    p.exampleShown = true;
    for (const f of a.task.fields) {
      const status = result.parts.find((x) => x.field === f.id)?.status;
      // A valid personal choice is a legitimate answer, not a failed fact.
      if (status !== 'correct' && status !== 'opinion')
        usedExample = setAnswer(a, f.id, exampleValue(f)) || usedExample;
    }
    if (usedExample) {
      p.exampleUsed = true;
      p.adopted = true;
    } else if (canContinue(a.task, p)) return;
  }
  const e = evaluate(a.task, p.answers, p.failures);
  if (e.error) {
    p.failures = Math.min(2, p.failures + 1);
    if (p.failures >= 2) {
      p.help = 3;
      p.exampleShown = true;
    }
  }
  p.process =
    e.ready &&
    !a.task.simulation?.required?.some((id) => !p.explored?.includes(id))
      ? usedExample
        ? 'explained'
        : 'submitted'
      : 'draft';
  p.factual = e.factual;
  appendSubmission(p, {
    ...(a.task.contextKey ? { contextKey: a.task.contextKey } : {}),
    ...(a.task.reference || a.task.linked
      ? {
          ...(a.task.reference
            ? {
                contextGoal: s.records[a.key].attempts['future.goal']?.answers
                  .goal as 'loss' | 'access',
                contextPlan: s.records[a.key].attempts['future.plan']?.answers
                  .plan as 'cool' | 'shade',
              }
            : {}),
          labels: Object.fromEntries(
            a.task.fields.map((f) => [
              f.id,
              f.options?.find(([id]) => id === p.answers[f.id])?.[1] ??
                p.answers[f.id] ??
                '',
            ]),
          ),
        }
      : {}),
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
// The same limit applies to numeric, written and oral submissions, and restore.
function appendSubmission(p: Attempt, submission: Submission) {
  p.submissions.push(submission);
  const excess = Math.max(0, p.submissions.length - 40);
  if (excess) {
    p.submissions.splice(0, excess);
    p.olderSubmissions += excess;
  }
}
export function reduceLearning(
  value: LearningState | undefined,
  action: LearningAction,
): LearningState {
  const s = structuredClone(value ?? newLearning());
  if (
    action.op === 'recommend' &&
    isProfile(action.value) &&
    isUnit(action.field)
  ) {
    if (s.profile && s.profile !== action.value) {
      s.pendingProfile = action.value;
      s.pendingUnit = action.field;
    } else {
      s.profile = action.value;
      s.unit = action.field;
      delete s.pendingProfile;
      delete s.pendingUnit;
      s.view = 'task';
      ensure(s);
    }
    return s;
  }
  if (action.op === 'open') {
    s.view = s.profile ? 'menu' : 'profiles';
    return s;
  }
  if (action.op === 'profiles') {
    s.view = 'profiles';
    return s;
  }
  if (action.op === 'request-profile' && isProfile(action.value)) {
    delete s.pendingUnit;
    s.pendingProfile = action.value;
    return s;
  }
  if (action.op === 'cancel-profile') {
    delete s.pendingProfile;
    delete s.pendingUnit;
    s.view = s.unit ? 'task' : 'menu';
    return s;
  }
  if (action.op === 'confirm-profile' && s.pendingProfile) {
    s.profile = s.pendingProfile;
    if (s.pendingUnit) s.unit = s.pendingUnit;
    delete s.pendingProfile;
    delete s.pendingUnit;
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
  if (action.op === 'unit' && isUnit(action.value)) {
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
    setAnswer(a, action.field, action.value ?? '');
  }
  if (action.op === 'allocate' && a.task.budget && action.field && action.value)
    setAnswer(
      a,
      'plan',
      adjustAllocation(p.answers.plan, action.field, action.value),
    );
  if (
    action.op === 'simulate' &&
    a.task.simulation &&
    action.value &&
    /^[A-Za-z0-9-]{1,50}$/.test(action.value)
  ) {
    p.simulationSelection = action.value;
    if (
      a.task.simulation.kind === 'orientation' &&
      a.task.fields.some((f) => f.id === 'country')
    )
      setAnswer(a, 'country', action.value);
    p.explored = [...new Set([...(p.explored ?? []), action.value])].slice(-30);
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
      appendSubmission(p, {
        ...(a.task.contextKey ? { contextKey: a.task.contextKey } : {}),
        ...(a.task.reference
          ? {
              contextPlan: a.task.contextPlan,
              contextGoal: a.task.contextGoal as 'loss' | 'access',
            }
          : {}),
        answers: { ...p.answers },
        factual: 'ungraded',
        support: p.exampleUsed
          ? 'example'
          : p.help
            ? 'help'
            : p.standardScaffold
              ? 'standard'
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
  if (
    action.op === 'future-revise' &&
    s.unit === 'e' &&
    a.task.id === 'future.revision' &&
    p.answers.revision === 'change' &&
    canContinue(a.task, p)
  ) {
    s.records[a.key].index = a.tasks.findIndex((t) => t.id === 'future.plan');
    s.view = 'task';
    return s;
  }
  if (
    action.op === 'next' &&
    a.task.id === 'future.revision' &&
    p.answers.revision === 'change'
  )
    return s;
  if (action.op === 'next' && !canContinue(a.task, p)) {
    if (p.process !== 'draft') {
      p.process = 'draft';
      p.factual = evaluate(a.task, p.answers, p.failures).factual;
      p.adopted = false;
    }
    return s;
  }
  if (action.op === 'next' && canContinue(a.task, p)) {
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
  if (isUnit(v.unit)) s.unit = v.unit;
  if (['menu', 'profiles', 'task', 'journal'].includes(v.view)) s.view = v.view;
  const ids = new Set<string>();
  for (const unit of implementedUnits)
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
      for (const sourceTask of tasks) {
        const task = resolveSimulation(
          futureReference(sourceTask, record.attempts),
          record.attempts,
        );
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
          for (const item of p.submissions) {
            if (!item || typeof item.answers !== 'object' || !item.answers)
              continue;
            const answer: Record<string, string> = {};
            for (const f of task.fields)
              if (typeof item.answers[f.id] === 'string')
                answer[f.id] = item.answers[f.id].slice(0, 2000);
            let historical = task;
            if (task.dependsOn && typeof item.contextKey === 'string') {
              try {
                const context = JSON.parse(item.contextKey);
                historical = resolveSimulation(
                  sourceTask,
                  Object.fromEntries(
                    task.dependsOn.map((id) => [
                      id,
                      { answers: context[id] ?? {} },
                    ]),
                  ),
                );
              } catch {}
            }
            appendSubmission(a, {
              ...(task.contextKey && typeof item.contextKey === 'string'
                ? { contextKey: item.contextKey.slice(0, 6000) }
                : {}),
              ...((task.reference || task.linked) &&
              item.labels &&
              typeof item.labels === 'object'
                ? {
                    labels: Object.fromEntries(
                      task.fields
                        .filter((f) => typeof item.labels[f.id] === 'string')
                        .map((f) => [f.id, item.labels[f.id].slice(0, 2000)]),
                    ),
                  }
                : {}),
              ...(task.reference &&
              (item.contextGoal === 'loss' || item.contextGoal === 'access')
                ? { contextGoal: item.contextGoal }
                : {}),
              answers: answer,
              factual: evaluate(
                task.reference &&
                  (item.contextPlan === 'cool' || item.contextPlan === 'shade')
                  ? futureReference(sourceTask, {
                      ...record.attempts,
                      'future.plan': { answers: { plan: item.contextPlan } },
                    })
                  : historical,
                answer,
              ).factual,
              ...(task.reference &&
              (item.contextPlan === 'cool' || item.contextPlan === 'shade')
                ? { contextPlan: item.contextPlan }
                : {}),
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
        if (
          typeof p.simulationSelection === 'string' &&
          /^[A-Za-z0-9-]{1,50}$/.test(p.simulationSelection)
        )
          a.simulationSelection = p.simulationSelection;
        if (Array.isArray(p.explored))
          a.explored = [
            ...new Set<string>(
              p.explored.filter(
                (v: unknown) =>
                  typeof v === 'string' && /^[A-Za-z0-9-]{1,50}$/.test(v),
              ),
            ),
          ].slice(-30);
        if (a.process !== 'draft' && !canContinue(task, a)) {
          a.process = 'draft';
          a.factual = 'ungraded';
          a.adopted = false;
        }
        record.attempts[task.id] = a;
      }
    }
  if (s.view === 'task' && (!s.profile || !s.unit)) s.view = 'menu';
  if (s.profile && s.unit && s.view === 'task') ensure(s);
  return s;
}
