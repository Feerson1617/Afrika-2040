// One stable identity scheme for live updates, task returns and session restore.
// Anonymous panels use their nested summary path, with duplicate disambiguation.
export function materialPanelEntries(material: Element) {
  const paths = new Map<Element, string>();
  const occurrences = new Map<string, number>();
  return Array.from(material.querySelectorAll('details'), (detail) => {
    const parent = detail.parentElement?.closest('details');
    const base = detail.id
      ? `id:${detail.id}`
      : `${parent ? paths.get(parent) : ''}/${detail.querySelector(':scope > summary')?.textContent}`;
    const occurrence = occurrences.get(base) ?? 0;
    occurrences.set(base, occurrence + 1);
    const key = `${base}:${occurrence}`;
    paths.set(detail, key);
    return { detail, key };
  });
}
export function captureMaterialPanels(material: Element) {
  return Object.fromEntries(
    materialPanelEntries(material).map(({ detail, key }) => [key, detail.open]),
  );
}
export function restoreMaterialPanels(
  material: Element,
  saved: Record<string, boolean> = {},
) {
  for (const { detail, key } of materialPanelEntries(material))
    if (typeof saved[key] === 'boolean') detail.open = saved[key];
}
// Unchanged material retains its DOM and the reader's position while typing.
export function updateMaterial(
  material: Element,
  previous: string,
  next: string,
) {
  if (previous === next) return;
  const saved = captureMaterialPanels(material);
  const { scrollX, scrollY } = window;
  material.innerHTML = next;
  restoreMaterialPanels(material, saved);
  window.scrollTo(scrollX, scrollY);
}
