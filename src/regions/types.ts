import type { Evaluation, Feedback } from '../feedback.ts';
import type { Progress } from '../progress.ts';
export type StudyId = 'cocoa' | 'share' | 'water' | 'area';
export interface StudyData {
  chain: string[];
  selection: string;
  allocations: Record<string, number>;
  answers: Record<string, string>;
  explored: string[];
  checked: string[];
  why?: string;
}
export interface StudyDecision {
  proposal?: string;
  goal?: string;
  benefit?: string;
  limit?: string;
  weighted?: boolean;
  text: string;
  supported?: boolean;
  ungraded?: boolean;
}
export type StudyPanel = 'plan' | 'benefit' | 'limit';
export interface StudyState {
  panel?: StudyPanel;
  step: 0 | 1 | 2 | 3;
  data: StudyData;
  progress: Progress[];
  decision: StudyDecision;
}
export interface StudyAction {
  type: 'study';
  op:
    | 'panel'
    | 'start'
    | 'select'
    | 'pick'
    | 'undo'
    | 'adjust'
    | 'answer'
    | 'help'
    | 'adopt'
    | 'check'
    | 'next'
    | 'back'
    | 'home'
    | 'reset'
    | 'text'
    | 'submit';
  id?: StudyId;
  field?: string;
  value?: string;
  persisted?: boolean;
}
export interface StudyOption {
  id: string;
  label: string;
  goal: string;
  benefit: string;
  limit: string;
  facts: string[];
  eligible?: boolean;
}
export interface StudyEvaluation extends Evaluation {
  mark?: string;
}
export interface StudyUI {
  header: string;
  restartPending: boolean;
  button(text: string, action: string, cls?: string, extra?: string): string;
  radio(
    group: string,
    value: string,
    label: string,
    checked: boolean,
    disabled?: boolean,
  ): string;
  esc(text: string): string;
  feedback(f?: Feedback): string;
}
export interface StudySpec {
  id: StudyId;
  number: number;
  country: string;
  place: string;
  title: string;
  question: string;
  intro: string;
  modelNote: string;
  goals: Record<string, string>;
  terms: [string, string][][];
  conclusion?(data: StudyData): string;
  initial(): StudyData;
  options(data: StudyData): StudyOption[];
  change(data: StudyData, action: StudyAction): StudyData;
  evaluate(step: 0 | 1, data: StudyData, failures: number): StudyEvaluation;
  example(step: 0 | 1, data: StudyData): StudyData;
  hint(step: 0 | 1, data: StudyData, level: number): string;
  canAdopt(step: 0 | 1, data: StudyData): boolean;
  reset(step: 0 | 1, data: StudyData): StudyData;
  valid(data: unknown): data is StudyData;
  scene(data: StudyData, step: number, ui: StudyUI): string;
  task(data: StudyData, step: 0 | 1, ui: StudyUI): string;
}
