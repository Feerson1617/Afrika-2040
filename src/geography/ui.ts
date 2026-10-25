import { outlines } from './map-data.ts';
import { renderContext } from './context.ts';
import {
  newGeography,
  regions,
  geoHint,
  project,
  type Geography,
  type RegionId,
} from './state.ts';
import type { StudyUI } from '../regions/types.ts';
export function geoButton(
  h: Pick<StudyUI, 'button'>,
  label: string,
  op: string,
  value = '',
  id = '',
  extra = '',
) {
  return h.button(
    label,
    'geography',
    'button secondary',
    `data-op="${op}" data-value="${value}" ${id ? `id="${id}"` : ''} ${extra}`,
  );
}
export function africaMap(g: Geography, all = false) {
  const d = g.records[g.target],
    p = d.progress;
  const marked = p.help === 3 ? g.target : d.selection;
  const labelPositions = {
    KEN: { x: 570, y: 430 },
    GHA: { x: 55, y: 360 },
    MAR: { x: 230, y: 12 },
  };
  return `<svg class="africa-overview${all ? ' review-map' : ''}" viewBox="0 0 740 730" role="group" aria-labelledby="africa-title africa-desc"><title id="africa-title">Kenia, Ghana und Marokko in Afrika</title><desc id="africa-desc">Vereinfachte Karte aus echten Natural-Earth-Daten. Drei hervorgehobene Länder sind wählbar. Die Länderknöpfe unter der Karte bieten dieselbe Auswahl.</desc><rect x="0" y="0" width="740" height="730" rx="16" fill="#eef3f5"/>${[
    ...outlines,
  ]
    .sort(
      (a, b) =>
        Number(Object.hasOwn(regions, a.code)) -
        Number(Object.hasOwn(regions, b.code)),
    )
    .map((f) => {
      const selected = Object.hasOwn(regions, f.code),
        active = marked === f.code || all;
      const fill = selected
        ? active
          ? '#d4e0c8'
          : '#f0d994'
        : !all && p.help >= 2 && f.region === regions[g.target].subregion
          ? '#dbe8ee'
          : '#f7f6ee';
      const path = `<path d="${f.path}" fill="${fill}" stroke="#68766b" stroke-width="${selected ? 2.5 : 1}" ${f.code === 'SAH' ? 'stroke-dasharray="5 4"' : ''}/>`;
      if (!selected) return path;
      const id = f.code as RegionId,
        r = regions[id],
        point = project(r.lon, r.lat),
        pos = labelPositions[id];
      return `<g role="button" tabindex="0" id="geo-country-${id}" data-action="geography" data-op="${all ? 'review-tab' : 'pick'}" data-value="${id}" aria-label="${r.name}${active ? ' ' + r.city : ''}" aria-pressed="${all ? g.review?.tab === id : d.selection === id}">${path}<path d="M${pos.x + 70} ${pos.y + 24}L${point.x} ${point.y}" stroke="#244f40" fill="none" stroke-width="2"/><rect x="${pos.x}" y="${pos.y}" width="155" height="48" rx="8" fill="#fffef8" stroke="#244f40"/><text x="${pos.x + 77}" y="${pos.y + 31}" text-anchor="middle">${r.name}</text>${active ? `<circle cx="${point.x}" cy="${point.y}" r="7" fill="#a44d2e" stroke="#fffef8" stroke-width="2"/><text class="geo-city-label" x="${point.x + (id === 'KEN' ? -70 : 10)}" y="${point.y + 23}"> ${r.city}</text>` : ''}</g>`;
    })
    .join(
      '',
    )}<path d="M24 ${project(0, 0).y}H680" stroke="#68766b" stroke-dasharray="6 7"/><text x="480" y="${project(0, 0).y - 8}">Äquator</text><text x="52" y="716">Norden ↑ · stark vereinfachte Übersicht</text></svg>`;
}
export function renderOrientation(value: Geography | undefined, h: StudyUI) {
  const g = value ?? newGeography(),
    d = g.records[g.target],
    p = d.progress,
    r = regions[g.target];
  return `<section class="orientation" aria-labelledby="geo-title"><h2 id="geo-title" tabindex="-1">Unsere drei Orte in Afrika</h2><p>Suche ein Land. Danach kannst du jede Episode direkt starten.</p><div class="geo-targets" role="group" aria-label="Land zum Erkunden">${(Object.keys(regions) as RegionId[]).map((id) => geoButton(h, 'Wo liegt ' + regions[id].name + '?', 'target', id, 'geo-target-' + id, `aria-pressed="${g.target === id}"`)).join('')}</div><p class="geo-question"><strong>Wo liegt ${r.name}?</strong> Wähle eines der drei hervorgehobenen Länder.</p>${africaMap(g)}<div class="geo-alternatives" role="group" aria-label="Länder auswählen">${(Object.keys(regions) as RegionId[]).map((id) => geoButton(h, regions[id].name, 'pick', id, 'geo-pick-' + id, `aria-pressed="${d.selection === id}"`)).join('')}</div>${d.selection || p.help === 3 ? `<p class="geo-place">${p.help === 3 ? 'Gezeigtes Beispiel: ' : 'Der Punkt zeigt: '}${regions[p.help === 3 ? g.target : d.selection!].city} in ${regions[p.help === 3 ? g.target : d.selection!].name}.</p>` : ''}${h.feedback(p.feedback)}${p.help ? `<aside class="help-panel"><h3 id="help-title" tabindex="-1">→ Hilfe ${p.help} von 3</h3><p>${geoHint(g)}</p>${p.help < 3 ? geoButton(h, p.help === 1 ? 'Genauer zeigen' : 'Erklärung ansehen', 'help', String(p.help + 1)) : geoButton(h, 'Dieses Beispiel übernehmen', 'adopt', '', 'geo-adopt')}</aside>` : ''}<div class="geo-actions">${geoButton(h, 'Lage prüfen', 'check', '', 'geo-check')}${!p.help ? geoButton(h, 'Ich brauche einen Hinweis', 'help', '1') : ''}${geoButton(h, 'Lage neu erkunden', 'reset')}</div><p class="small-note">${p.complete ? `${r.name}: Lage ${p.supported ? 'mit Beispiel' : 'zugeordnet'}. Du kannst eine Episode wählen.` : 'Die Orientierung ist freiwillig. Alle Episoden bleiben direkt spielbar.'}</p>${renderContext(g.target)}<details class="geo-license"><summary>Kartenquelle und Genauigkeit</summary><p>Natural Earth: Länder 1:110 Millionen, Orte 1:10 Millionen. Gemeinfrei (Public Domain). Lineare Längen-/Breitengradprojektion. Kleine Inseln und Grenzen sind vereinfacht. Gestrichelte Linien bei Westsahara kennzeichnen den ungeklärten Status. Die Karte zeigt keine Spielwege oder Modellflächen.</p><p><a href="https://github.com/nvkelso/natural-earth-vector/blob/master/LICENSE.md" target="_blank" rel="noopener noreferrer">Offizielle Nutzungsrechte</a> · <a href="https://github.com/nvkelso/natural-earth-vector" target="_blank" rel="noopener noreferrer">Kartendaten</a>. Datenabruf: 25.10.2026. Die Karte funktioniert ohne Internet.</p></details></section>`;
}
