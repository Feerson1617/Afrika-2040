import { share } from './share.ts';
import { cocoa } from './cocoa.ts';
import type { StudyId, StudySpec } from './types.ts';
export const studies: Partial<Record<StudyId, StudySpec>> = { cocoa, share };
export const studyList = () =>
  Object.values(studies).filter((s): s is StudySpec => Boolean(s));
