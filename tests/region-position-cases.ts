import { studies } from '../src/regions/registry.ts';
import type { StudyData } from '../src/regions/types.ts';
export function regionPositionCases() {
  const result: {
    id: string;
    step: number;
    data: StudyData;
    expected: Record<string, string>;
  }[] = [];
  const add = (
    id: string,
    step: number,
    expected: Record<string, string>,
    patch: Partial<StudyData> = {},
  ) =>
    result.push({
      id,
      step,
      expected,
      data: { ...studies[id]!.initial(), ...patch },
    });
  add('cocoa', 1, { quality: '90' }, { selection: 'quality' });
  add('cocoa', 1, { process: '75' }, { selection: 'process' });
  add(
    'cocoa',
    1,
    { why: 'costs' },
    {
      checked: ['quality', 'process'],
      answers: { quality: '90', process: '75' },
    },
  );
  add('share', 0, { free: '120', wages: 'paid' });
  add(
    'share',
    1,
    { why: 'tradeoff' },
    {
      allocations: { payout: 40, reserve: 40, training: 40 },
      explored: ['payout', 'reserve', 'training'],
    },
  );
  add('water', 0, { withdrawal: '60', rest: '20' });
  add('water', 1, { repair: '30' }, { selection: 'repair' });
  add('water', 1, { tech: '35' }, { selection: 'tech' });
  add(
    'water',
    1,
    { why: 'delivery' },
    { checked: ['repair', 'tech'], answers: { repair: '30', tech: '35' } },
  );
  add(
    'area',
    0,
    { single: '45', saving: '15' },
    { selection: 'same', explored: ['base', 'same'] },
  );
  add('area', 1, { same: '45' }, { selection: 'same' });
  add('area', 1, { extra: '65' }, { selection: 'extra' });
  add(
    'area',
    1,
    { why: 'growth' },
    { checked: ['same', 'extra'], answers: { same: '45', extra: '65' } },
  );
  return result;
}
