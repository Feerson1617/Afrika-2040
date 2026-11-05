import { area } from './area.ts';
import { water } from './water.ts';
import { share } from './share.ts';
import { cocoa } from './cocoa.ts';
import type { StudyId, StudySpec } from './types.ts';
export const studies: Partial<Record<StudyId, StudySpec>> = {
  cocoa,
  share,
  water,
  area,
};
export const studyList = () =>
  Object.values(studies).filter((s): s is StudySpec => Boolean(s));
