import { newProgress, applyEvaluation, type Progress } from '../progress.ts';
import { result } from '../feedback.ts';
import type { State } from '../state.ts';
export const regions = {
  KEN: {
    name: 'Kenia',
    city: 'Nairobi',
    area: 'Ostafrika',
    subregion: 'Eastern Africa',
    lon: 36.814711,
    lat: -1.281401,
  },
  GHA: {
    name: 'Ghana',
    city: 'Kumasi',
    area: 'Westafrika',
    subregion: 'Western Africa',
    lon: -1.63196,
    lat: 6.691937,
  },
  MAR: {
    name: 'Marokko',
    city: 'Agadir',
    area: 'Nordafrika',
    subregion: 'Northern Africa',
    lon: -9.620044,
    lat: 30.439988,
  },
} as const;
export type RegionId = keyof typeof regions;
export interface GeoRecord {
  selection?: RegionId;
  progress: Progress;
}
export interface Geography {
  target: RegionId;
  records: Record<RegionId, GeoRecord>;
}
export interface GeoAction {
  type: 'geography';
  op: 'target' | 'pick' | 'check' | 'help' | 'adopt' | 'reset';
  value?: string;
}
export const isRegion = (v: unknown): v is RegionId =>
  typeof v === 'string' && Object.hasOwn(regions, v);
export function newGeography(): Geography {
  return {
    target: 'GHA',
    records: {
      KEN: { progress: newProgress() },
      GHA: { progress: newProgress() },
      MAR: { progress: newProgress() },
    },
  };
}
export function geoHint(g: Geography) {
  const r = regions[g.target],
    level = g.records[g.target].progress.help;
  return level === 1
    ? `Suche im ${r.area === 'Nordafrika' ? 'Norden' : r.area === 'Westafrika' ? 'Westen' : 'Osten'} Afrikas.`
    : level === 2
      ? `${r.name} liegt in ${r.area}. Diese Region ist auf der Karte markiert.`
      : `Hier liegt ${r.name}. Dort liegt die Stadt ${r.city}. Wähle das gezeigte Land oder übernimm das Beispiel.`;
}
export function evaluateLocation(g: Geography) {
  const d = g.records[g.target],
    r = regions[g.target];
  if (!d.selection)
    return result(
      'hint',
      'Wähle ein Land',
      'Tippe auf eines der drei hervorgehobenen Länder oder nutze die Länderknöpfe.',
    );
  if (d.selection === g.target)
    return result(
      'correct',
      '✓ Das ist ' + r.name,
      `${r.name} liegt in ${r.area}. Der Punkt zeigt ${r.city}.`,
      true,
    );
  const other = regions[d.selection];
  return result(
    d.progress.failures >= 1 ? 'hint' : 'incorrect',
    '↺ Schau auf die Lage',
    `Du hast ${other.name} in ${other.area} gewählt. Gesucht ist ${r.name}. ${d.progress.failures >= 1 ? `${r.name} liegt in ${r.area}. Die Hilfe zeigt dir die Lage.` : 'Versuche es noch einmal oder nutze einen Hinweis.'}`,
    false,
    true,
  );
}
export function reduceGeography(current: State, a: GeoAction) {
  const s = structuredClone(current);
  s.geography ??= newGeography();
  const g = s.geography;
  if (a.op === 'target') {
    if (isRegion(a.value)) g.target = a.value;
    return s;
  }
  const d = g.records[g.target],
    p = d.progress;
  if (a.op === 'pick' && isRegion(a.value)) {
    d.selection = a.value;
    p.feedback = undefined;
    p.complete = false;
  }
  if (a.op === 'check') applyEvaluation(p, evaluateLocation(g));
  if (a.op === 'help')
    p.help = Math.max(p.help, Math.min(3, Number(a.value) || 1));
  if (a.op === 'adopt' && p.help === 3) {
    d.selection = g.target;
    applyEvaluation(p, evaluateLocation(g));
    p.supported = true;
  }
  if (a.op === 'reset') g.records[g.target] = { progress: newProgress() };
  return s;
}
export function restoreGeography(
  s: State,
  validProgress: (v: unknown) => boolean,
) {
  const g = s.geography;
  if (!g) return;
  if (
    !isRegion(g.target) ||
    !g.records ||
    Object.keys(g.records).length !== 3 ||
    !Object.keys(regions).every((key) => {
      const id = key as RegionId,
        r = g.records[id];
      return (
        r &&
        (!r.selection || isRegion(r.selection)) &&
        validProgress(r.progress) &&
        (!r.progress.complete || r.selection === id)
      );
    })
  ) {
    delete s.geography;
  }
}
export const project = (lon: number, lat: number) => ({
  x: 24 + (lon + 20) * 9.2,
  y: 24 + (38 - lat) * 9.2,
});
