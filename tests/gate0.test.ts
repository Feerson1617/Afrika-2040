import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cocoa, cocoaModel } from '../src/regions/cocoa.ts';
import { share } from '../src/regions/share.ts';
import { water, waterModel } from '../src/regions/water.ts';
import { area, areaModel } from '../src/regions/area.ts';
import { resetNotice } from '../src/reset.ts';
import type { StudySpec, StudyData } from '../src/regions/types.ts';
function order(spec: StudySpec, data: StudyData, step: number) {
  const groups: Record<string, string[]> = {};
  spec.task(data, step, {
    button: () => '',
    esc: String,
    radio: (name: string, value: string) => {
      (groups[name] ??= []).push(value);
      return '';
    },
  } as any);
  return groups;
}
test('all 16 formerly first-position questions retain IDs and stable varied correct positions', () => {
  const seen: number[] = [];
  function check(
    spec: StudySpec,
    data: StudyData,
    step: number,
    expected: Record<string, string>,
  ) {
    const groups = order(spec, data, step);
    assert.deepEqual(order(spec, structuredClone(data), step), groups);
    for (const [field, id] of Object.entries(expected)) {
      const ids = groups['study-' + field];
      assert.equal(new Set(ids).size, ids.length);
      assert.equal(ids.filter((v) => v === id).length, 1);
      assert.ok(ids.some((v) => v !== id));
      seen.push(ids.indexOf(id) + 1);
    }
  }
  for (const selection of ['quality', 'process'])
    check(cocoa, { ...cocoa.initial(), selection }, 1, {
      [selection]: String(cocoaModel(selection).surplus),
    });
  check(cocoa, { ...cocoa.initial(), checked: ['quality', 'process'] }, 1, {
    why: 'costs',
  });
  check(share, share.initial(), 0, { free: '120', wages: 'paid' });
  check(share, share.initial(), 1, { why: 'tradeoff' });
  check(water, water.initial(), 0, { withdrawal: '60', rest: '20' });
  for (const selection of ['repair', 'tech'])
    check(water, { ...water.initial(), selection }, 1, {
      [selection]: String(waterModel(selection).remaining),
    });
  check(water, { ...water.initial(), checked: ['repair', 'tech'] }, 1, {
    why: 'delivery',
  });
  check(area, area.initial(), 0, { single: '45', saving: '15' });
  for (const selection of ['same', 'extra'])
    check(area, { ...area.initial(), selection }, 1, {
      [selection]: String(areaModel(selection).withdrawal),
    });
  check(area, { ...area.initial(), checked: ['same', 'extra'] }, 1, {
    why: 'growth',
  });
  assert.equal(seen.length, 16);
  assert.ok(new Set(seen).size >= 2);
  assert.ok(seen.filter((v) => v > 1).length >= 12);
});
test('global reset notice covers current topics and journal', () => {
  assert.match(resetNotice, /alle Themen, Episoden und dein Lernjournal/);
});
