// Fixed rotation per semantic question; never depends on render or answer state.
export function answerOrder<T>(values: readonly T[], shift: number): T[] {
  const offset = shift % values.length;
  return [...values.slice(offset), ...values.slice(0, offset)];
}
