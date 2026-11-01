import type { Task } from './tasks.ts';
import type { Attempt } from './storage.ts';
import type { ProfileId } from './profiles.ts';
import { renderMap } from '../map.ts';
import { initialState } from '../state.ts';
import {
  persons,
  routes,
  personNames,
  routeNames,
  boarding,
  stopNames,
  lineStops,
} from '../content.ts';
import { journey, journeyParts, lineDuration } from '../model.ts';
import { demandScenario } from '../demand.ts';
const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
export const controls = (
  options: readonly (readonly [string, string])[],
  selection: string,
  group = 'Modell untersuchen',
) =>
  `<div role="group" aria-label="${group}">${options.map(([id, name]) => `<button type="button" id="sim-${group.replace(/[^a-zA-Z]/g, '')}-${id}" class="button secondary" data-action="learning" data-op="simulate" data-value="${id}" aria-pressed="${selection === id}">${esc(name)}</button>`).join('')}</div>`;
export const table = (head: string[], rows: (string | number)[][]) =>
  `<table><caption>Erfundenes Modell · Angaben für diese Runde</caption><thead><tr>${head.map((x) => `<th scope="col">${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((x, i) => (i ? `<td>${esc(String(x))}</td>` : `<th scope="row">${esc(String(x))}</th>`)).join('')}</tr>`).join('')}</tbody></table>`;
export function simulationMaterial(t: Task, p: ProfileId, a: Attempt): string {
  const cfg = t.simulation!,
    simple = p === 'foerder';
  if (cfg.kind === 'network') {
    const selected = a.simulationSelection ?? cfg.preset ?? 'amina-direct';
    const [rawWho, rawRoute] = selected.split('-');
    const who = persons.includes(rawWho as any)
        ? (rawWho as (typeof persons)[number])
        : 'amina',
      route = routes.includes(rawRoute as any)
        ? (rawRoute as (typeof routes)[number])
        : 'direct';
    const situation = cfg.now ? 'now' : 'before',
      j = journey(who, route, situation),
      parts = journeyParts(who, route, situation);
    const s = {
      ...initialState(),
      step: 5 as const,
      screen: cfg.now ? ('event-effects' as const) : ('game' as const),
      route,
      highlight: who,
    };
    if (cfg.now) s.road = { view: 'now' } as any;
    const map = renderMap(s)
      .replace(
        /data-action="route" data-value="([a-z]+)"/g,
        (_, r) =>
          `data-action="learning" data-op="simulate" data-value="${who}-${r}"`,
      )
      .replace(
        /data-action="highlight" data-value="([a-z]+)"/g,
        (_, who) =>
          `data-action="learning" data-op="simulate" data-value="${who}-${route}"`,
      );
    return `<h2>Drei Menschen in Nairobi</h2><p>Nairobi ist real. Menschen, Wege und Zeiten sind erfunden. Keine echte Stadtkarte. Erst zu Fuß, dann mit dem Bus. Wartezeit und Fahrpreis fehlen.</p>${cfg.now ? '<p><strong>Jetzt: Eine Baustelle verlängert nur Leilas Fußweg zum Platz um 6 Minuten.</strong> Nach Süd bleibt ihr Fußweg gleich.</p>' : ''}${controls(
      persons.map(
        (person) => [`${person}-${route}`, personNames[person]] as const,
      ),
      selected,
      'Person wählen',
    )}${controls(
      routes.map((r) => [`${who}-${r}`, routeNames[r]] as const),
      selected,
      'Linie wählen',
    )}${map}<p>${personNames[who]} steigt bei ${stopNames[boarding[who][route]]} ein. Mitfahrt: ${lineStops[
      route
    ]
      .slice(lineStops[route].indexOf(parts.board))
      .map((stop) => stopNames[stop])
      .join(' → ')}. Ganze Linie: ${lineDuration(route)} Minuten.</p>${table(
      [
        'Person / Linie',
        'Zu Fuß',
        'Mitfahrt',
        ...(simple ? ['Erklärte Gesamtzeit'] : []),
      ],
      [who].flatMap((person) =>
        routes.map((r) => {
          const q = journey(person, r, situation);
          return [
            `${personNames[person]} · ${routeNames[r]}`,
            q.walk,
            q.bus,
            ...(simple ? [q.total] : []),
          ];
        }),
      ),
    )}<p>Aktuell untersucht: ${personNames[who]}, ${routeNames[route]}, ${j.walk} Minuten zu Fuß und ${j.bus} Minuten im Bus.</p>`;
  }
  if (cfg.kind === 'demand') {
    const options = [
      ['before', 'Vor dem Zuzug'],
      ['base', 'Jetzt: unverändert'],
      ['bus', 'Zusätzliche Fahrt'],
      ['path', 'Kurzer Fußweg'],
    ] as const;
    const selection = a.simulationSelection ?? cfg.preset ?? 'base';
    const model = demandScenario(
      selection === 'bus' || selection === 'path' ? selection : 'base',
      selection === 'before' ? 'before' : 'now',
    );
    return `<h2>Nairobi · Plätze und Fußwege</h2><p>Eine unabhängige erfundene Modellstunde. Vorher wollen 16 Menschen fahren, nach Zuzug 24. Ein Bus hat 10 Plätze. Bisher: zwei Fahrten pro Stunde. Beide Maßnahmen sind unabhängig voneinander prüfbar.</p>${controls(options, selection)}<p aria-live="polite">${esc(options.find(([id]) => id === selection)?.[1] ?? 'Jetzt')}: ${model.people} Menschen · ${model.capacity} Plätze · ${model.walk} Minuten Fußweg.</p><figure aria-label="Menschen und Plätze"><div>${'● '.repeat(model.people)}</div><figcaption>${model.people} Menschen; ${model.capacity} Plätze in einer Stunde. Die Punkte sind Menschen, keine Einwohnerzahl Nairobis.</figcaption></figure>${table(
      ['Größe', 'Wert'],
      [
        ['Fahrten pro Stunde', model.trips],
        ['Plätze pro Fahrt', 10],
        ['Plätze pro Stunde', model.capacity],
        ['Fußweg (Minuten)', model.walk],
      ],
    )}<p>Eine zusätzliche Fahrt und ein neuer Fußweg lösen verschiedene Probleme. Die genaue Wartezeit, Kosten und der Fahrpreis fehlen.</p>`;
  }
  return '';
}
