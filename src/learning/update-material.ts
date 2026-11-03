// Keep the reader's DOM when only an answer changes. When a confirmed result
// must disappear, restore both open AND closed panels by their semantic path.
export function updateMaterial(
  material: Element,
  previous: string,
  next: string,
) {
  if (previous === next) return;
  const panels = () => {
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
  };
  const saved = new Map(panels().map(({ detail, key }) => [key, detail.open]));
  const { scrollX, scrollY } = window;
  material.innerHTML = next;
  for (const { detail, key } of panels())
    if (saved.has(key)) detail.open = saved.get(key)!;
  window.scrollTo(scrollX, scrollY);
}
