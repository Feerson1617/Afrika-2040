import { share, shareKeys, shareModel } from '../regions/share.ts';
import { emptyData } from '../regions/shared.ts';
export function allocationData(value = '') {
  const d = emptyData(),
    parts = value.split('-').map(Number);
  shareKeys.forEach(
    (key, i) =>
      (d.allocations[key] =
        Number.isInteger(parts[i]) && parts[i] >= 0 && parts[i] <= 120
          ? parts[i]
          : 0),
  );
  if (shareModel(d).left < 0) d.allocations = {};
  return d;
}
export function adjustAllocation(
  value: string | undefined,
  field: string,
  delta: string,
) {
  const d = allocationData(value);
  share.change(d, { type: 'study', op: 'adjust', field, value: delta });
  return shareKeys.map((key) => d.allocations[key] ?? 0).join('-');
}
