import { cocoa } from './cocoa.ts';
import type { StudyId, StudySpec } from './types.ts';
export const studies: Partial<Record<StudyId, StudySpec>> = { cocoa };
export const studyList = () =>
  Object.values(studies).filter((s): s is StudySpec => Boolean(s));
