import { africaMap } from '../geography/ui.ts';
import { newGeography, isRegion, regions } from '../geography/state.ts';
import { newReview, transferTasks } from '../geography/transfer.ts';
import { renderContext } from '../geography/context.ts';
import { waterModel, water } from '../regions/water.ts';
import { areaModel, area } from '../regions/area.ts';
import { tankGraphic } from '../regions/water-model.ts';
import { cocoaModel, cocoa } from '../regions/cocoa.ts';
import { share, shareModel, shareKeys } from '../regions/share.ts';
import { allocationData } from './allocation.ts';
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
export const table = (
  head: string[],
  rows: (string | number)[][],
  caption = 'Erfundenes Modell · Angaben für diese Runde',
) =>
  `<table><caption>${esc(caption)}</caption><thead><tr>${head.map((x) => `<th scope="col">${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((x, i) => (i ? `<td>${esc(String(x))}</td>` : `<th scope="row">${esc(String(x))}</th>`)).join('')}</tr>`).join('')}</tbody></table>`;
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
    return `<h2>Nairobi · Plätze und Fußwege</h2><p>Eine unabhängige erfundene Modellstunde. Vorher wollen 16 Menschen fahren, nach Zuzug 24. Acht neue Nachbarn kommen dazu. Die Fußwegzeiten beziehen sich auf diese acht neuen Nachbarn. Ein Bus hat 10 Plätze. Bisher: zwei Fahrten pro Stunde. Beide Maßnahmen sind unabhängig voneinander prüfbar.</p>${controls(options, selection)}<p aria-live="polite">${esc(options.find(([id]) => id === selection)?.[1] ?? 'Jetzt')}: ${model.people} Menschen · ${model.capacity} Plätze${selection === 'before' ? '' : ` · ${model.walk} Minuten Fußweg für die neuen Nachbarn`}.</p><figure aria-label="Menschen und Plätze"><div>${'● '.repeat(model.people)}</div><figcaption>${model.people} Menschen; ${model.capacity} Plätze in einer Stunde. Die Punkte sind Menschen, keine Einwohnerzahl Nairobis.</figcaption></figure>${table(
      ['Größe', 'Wert'],
      [
        ['Fahrten pro Stunde', model.trips],
        ['Plätze pro Fahrt', 10],
        ['Plätze pro Stunde', model.capacity],
        ...(selection === 'before'
          ? []
          : [['Fußweg der neuen Nachbarn (Minuten)', model.walk]]),
      ],
    )}<p>Eine zusätzliche Fahrt und ein neuer Fußweg lösen verschiedene Probleme. Die genaue Wartezeit, Kosten und der Fahrpreis fehlen.</p>`;
  }
  if (cfg.kind === 'cocoa') {
    const selection = a.simulationSelection ?? cfg.preset ?? 'base',
      m = cocoaModel(selection);
    return `<h2>Ein Betrieb bei Kumasi · Ghana</h2><p>Erfundene Genossenschaft: Der Betrieb gehört seinen Mitgliedern gemeinsam. Ghana hat bereits eigene Kakaoverarbeitung. GE sind erfundene Geldeinheiten, keine echten Preise.</p>${t.id.startsWith('cocoa.chain') ? '<figure><ul class="learning-material-cards" aria-label="Ungeordnete Materialkarten"><li>Pressen: Butter und Presskuchen</li><li>Getrocknete Bohnen</li><li>Kakaomasse</li><li>Rösten und mahlen</li></ul><figcaption>Materialkarten: Ordne die Verarbeitung selbst.</figcaption></figure>' : ''}${controls(
      [
        ['base', 'Bisher'],
        ['quality', 'Qualität'],
        ['process', 'Presse'],
      ],
      selection,
    )}${table(['Laufende Runde', 'GE'], [['Einnahmen', m.income], ['Laufende Ausgaben', m.costs], ...(simple ? [['Erklärter Überschuss', m.surplus]] : [])])}<section aria-label="Getrennter Anschaffungstopf"><h3>Einmalige Anschaffung · eigener Topf</h3><p>Topf vorher: 60 GE. Anschaffung: ${m.investment} GE. Im Topf bleiben ${m.investmentLeft} GE. Diese Anschaffung wird nicht als laufende Ausgabe umbenannt.</p></section><details><summary>Modellgrenzen ansehen</summary><p>${esc(cocoa.modelNote)}</p></details>`;
  }
  if (cfg.kind === 'share') {
    const d = allocationData(a.answers.plan),
      m = shareModel(d),
      selection = a.simulationSelection ?? 'payout';
    const names = {
      payout: 'Auszahlung',
      reserve: 'Rücklage',
      training: 'Fortbildung',
    };
    const effects = {
      payout:
        'Mitglieder bekommen jetzt zusätzliches Geld. Es ist dann nicht mehr im Betrieb.',
      reserve:
        'Geld bleibt für mögliche Reparaturen. Ob es später reicht, ist unklar.',
      training:
        'Mitglieder können dazulernen. Zusätzliche Aufträge sind nicht sicher.',
    };
    return `<h2>120 GE gemeinsam verteilen · Ghana</h2><p>Eine neue erfundene Runde bei Kumasi. 300 GE Einnahmen. 100 GE Löhne und 80 GE andere Kosten sind bereits bezahlt. Nun sind 120 GE frei. Keine Verteilung ist automatisch die beste.</p>${
      t.budget
        ? `<div role="group" aria-label="120 GE verteilen">${shareKeys.map((key) => `<section><h3>${names[key]}: ${d.allocations[key] ?? 0} GE</h3><button type="button" id="allocate-${key}-minus" data-action="learning" data-op="allocate" data-field="${key}" data-value="-20" ${!d.allocations[key] ? 'disabled' : ''}>${names[key]} −20 GE</button><button type="button" id="allocate-${key}-plus" data-action="learning" data-op="allocate" data-field="${key}" data-value="20" ${m.left < 20 ? 'disabled' : ''}>${names[key]} +20 GE</button></section>`).join('')}</div><p role="status">Noch zu verteilen: ${m.left} GE.</p>${t.differentBudget ? '<p>Ändere mindestens einen Betrag gegenüber deinem ersten Plan.</p>' : ''}`
        : controls(
            shareKeys.map((key) => [key, names[key]]),
            selection,
          )
    }<p>${effects[selection as keyof typeof effects] ?? effects.payout}</p><details><summary>Unabhängige Runde und Grenzen</summary><p>${esc(share.modelNote)}</p></details>`;
  }
  if (cfg.kind === 'water' || cfg.kind === 'area') {
    const isWater = cfg.kind === 'water',
      selection = a.simulationSelection ?? cfg.preset ?? 'base';
    const m = isWater ? waterModel(selection) : areaModel(selection);
    const options: readonly (readonly [string, string])[] = isWater
      ? [
          ['base', 'Bisher'],
          ['repair', 'Reparatur'],
          ['tech', 'Neue Verteilung'],
        ]
      : [
          ['base', 'Früher: ein Feld'],
          ['same', 'Neue Technik: gleiches Feld'],
          ['extra', 'Mit Zusatzfeld'],
        ];
    const shape = tankGraphic(m.remaining);
    const diagram = simple
      ? shape
      : shape.replace(`Rest ${m.remaining} WE`, 'Rest selbst bestimmen');
    return `<h2>Ein Betrieb bei Agadir · Marokko</h2><p>Unabhängige erfundene Runde. 80 Wassereinheiten (WE) im Tank, kein Zufluss. WE sind keine echten Messwerte. Der Tank ist kein Grundwasser.</p>${controls(options, selection)}<p><strong>Aktuelle Modellansicht: ${esc(options.find(([id]) => id === selection)?.[1] ?? options[0][1])}.</strong> Prüfe, auf welche Maßnahme sich die Frage bezieht.</p><figure><svg class="study-scene" viewBox="0 0 660 280" role="img" aria-label="Tank, Entnahme und Feld getrennt. ${m.withdrawal} WE werden entnommen.">${diagram}<path d="M190 130H370" stroke="#356a76" stroke-width="9"/><text x="220" y="70">Entnahme</text><text x="235" y="100">${m.withdrawal} WE</text><rect x="380" y="80" width="150" height="85" fill="#d4e0bd" stroke="#234e42"/><text x="390" y="112">${isWater ? 'Am Feld' : 'Erstes Feld'}</text><text x="410" y="144">${isWater ? '40' : (m as ReturnType<typeof areaModel>).first} WE</text>${!isWater && selection === 'extra' ? '<rect x="545" y="105" width="85" height="60" fill="#d4e0bd" stroke="#234e42"/><text x="547" y="192">Zusatz: 20 WE</text>' : ''}</svg><figcaption>${isWater ? 'Entnahme aus dem Tank ist nicht gleich Ankunft am Feld. Der Verbleib des übrigen Wassers wird nicht berechnet.' : 'Feldsymbole sind schematisch, ohne Hektarmaßstab. Die Zusatzfläche ist kleiner.'}</figcaption></figure>${
      isWater
        ? table(
            ['Messstelle', 'WE'],
            [
              ['Tank am Anfang', 80],
              ['Entnahme', m.withdrawal],
              ['Ankunft am selben Feld', 40],
              ...(simple ? [['Erklärter Tankrest', m.remaining]] : []),
            ],
          )
        : table(
            ['Fläche', 'Entnahme (WE)'],
            [
              ['Erstes Feld', (m as ReturnType<typeof areaModel>).first],
              ['Zusatzfeld', (m as ReturnType<typeof areaModel>).extra],
              ...(simple
                ? [
                    ['Erklärte Gesamtentnahme', m.withdrawal],
                    ['Erklärter Tankrest', m.remaining],
                  ]
                : []),
            ],
          )
    }<details><summary>Grenzen und Annahmen des Modells</summary><p>${esc((isWater ? water : area).modelNote)}</p></details>`;
  }
  if (cfg.kind === 'orientation') {
    const g = newGeography();
    if (isRegion(cfg.preset)) g.target = cfg.preset;
    g.review = newReview();
    g.review.tab = 'common';
    if (isRegion(a.simulationSelection)) g.review.tab = a.simulationSelection;
    const map = africaMap(g, true).replace(
      /data-action="geography" data-op="review-tab"/g,
      'data-action="learning" data-op="simulate"',
    );
    return `<h2>Drei Länder in Afrika</h2><p>Nordrichtung: oben. Die gestrichelte Linie ist der Äquator, keine Landesgrenze. Punkte zeigen Städte. Diese Übersicht nutzt echte Natural-Earth-Umrisse. Sie ist keine Karte unserer erfundenen Nachbarschaft.</p>${map}${controls(
      Object.entries(regions).map(([id, r]) => [id, r.name]),
      a.simulationSelection ?? '',
    )}<details><summary>Städte und Quelle nachsehen</summary>${table(
      ['Stadt', 'Land'],
      Object.values(regions).map((r) => [r.city, r.name]),
      'Reale Städte und Länder · Übersicht',
    )}<p>Natural Earth, public domain; stark vereinfachte Übersicht. Keine genaue Reisezeitmessung. Die gestrichelte Gebietsgrenze der Westsahara ist keine normale durchgezogene Staatsgrenze.</p></details>`;
  }
  if (cfg.kind === 'review') {
    const code = isRegion(cfg.preset) ? cfg.preset : undefined;
    return `<h2>Fälle erneut vergleichen</h2><p>Hier stehen die nötigen Fallangaben. Du kannst sie auch lesen, wenn du eine Episode noch nicht bearbeitet hast. Das ist kein Nachweis einer früheren Bearbeitung.</p>${(code ? [code] : (['KEN', 'GHA', 'MAR'] as const)).map((id) => `<section><h3>${regions[id].name} · erfundener Fall</h3><p>${esc(transferTasks[id].example)}</p></section>`).join('')}<details><summary>Reale Orte und Kontext</summary>${(code ? [code] : (['KEN', 'GHA', 'MAR'] as const)).map((id) => renderContext(id)).join('')}</details>`;
  }
  return '';
}
