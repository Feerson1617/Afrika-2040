import {
  transferCases,
  transferContext,
  type TransferCaseId,
} from './transfer-cases.ts';
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
import { canContinue, type Attempt } from './storage.ts';
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
/** A view switch is not a new answer or a different task. Old saved selections
 * deliberately open the current case; only an explicit comparison opens the old one. */
function transferMaterial(
  id: TransferCaseId,
  a: Attempt,
  task: Task,
  profile: ProfileId,
): string {
  const revealed =
    profile === 'foerder' ||
    a.help === 3 ||
    (a.factual === 'correct' && canContinue(task, a));
  const comparison = a.simulationSelection === 'comparison';
  const selected = comparison ? 'comparison' : 'current';
  const label = comparison
    ? 'Früherer Fall · nur zum Vergleich'
    : 'Neuer Fall · diese Aufgabe';
  const header = `<h2>${label}</h2><p>${esc(transferContext[id])}</p>${controls(
    [
      ['current', 'Neuen Fall ansehen'],
      ['comparison', 'Früheren Fall vergleichen'],
    ],
    selected,
    'Transfer vergleichen',
  )}`;
  const note = comparison
    ? '<p><strong>Nur zum Vergleich.</strong> Die Frage rechts gilt weiterhin für den neuen Fall. Deine Antwort bleibt erhalten.</p>'
    : '';
  // Do not emit the solution into HTML, SVG geometry or accessible descriptions.
  if (!comparison && !revealed) {
    let initial: string;
    if (id === 'demand-18') {
      const c = transferCases[id];
      initial = `<p>Dieses Beispiel ist erfunden. Es gilt für eine Stunde.</p>${table(
        ['Größe', 'Wert'],
        [
          ['Menschen in dieser Stunde', c.people],
          ['Plätze pro Stunde', c.capacity],
          ['Betrachteter Fußweg (Minuten)', c.walk],
        ],
      )}${profile === 'esa' ? '<p>Vergleiche Menschen und Plätze. Prüfe danach die Angabe zum Fußweg.</p>' : '<p>Untersuche die Angaben. Begründe deine Antworten zum neuen Fall.</p>'}`;
    } else {
      const c = transferCases[id];
      const data =
        id === 'water-70'
          ? transferCases['water-70']
          : transferCases['area-10'];
      const inputRows: (string | number)[][] =
        id === 'water-70'
          ? [
              ['Tank am Anfang', data.initial],
              ['Entnahme', transferCases['water-70'].withdrawal],
            ]
          : [
              ['Tank am Anfang', data.initial],
              ['Erstes Feld', transferCases['area-10'].first],
              ['Zusatzfeld', transferCases['area-10'].extra],
              ['Früher: nur das erste Feld', transferCases['area-10'].former],
            ];
      const facts = inputRows
        .map(([label, value]) => `${label}: ${value} WE`)
        .join('. ');
      initial = `<p>Erfundene Runde bei Agadir. WE bedeutet Wassereinheiten. Es sind erfundene Mengen, keine echten Literangaben. Kein Zufluss. Grundwasser ist Wasser unter der Erde in Lücken von Boden und Gestein. Der Tank ist kein Grundwasser.</p><figure><svg class="study-scene" viewBox="0 0 660 280" role="img" aria-label="Angaben für deine Rechnung. ${esc(facts)}. Wie viel Wasser danach bleibt, musst du noch berechnen."><rect x="35" y="50" width="150" height="160" fill="#8eb5c1" stroke="#253e34"/><text x="110" y="35" text-anchor="middle">Anfang: ${c.initial} WE</text>${inputRows
        .slice(1)
        .map(
          ([label, value], i) =>
            `<text x="225" y="${80 + i * 50}">${esc(String(label))}: ${value} WE</text>`,
        )
        .join(
          '',
        )}</svg><figcaption>Der Tank zeigt das Wasser am Anfang, vor der Entnahme.</figcaption></figure>${table(['Angabe', 'WE'], inputRows)}${profile === 'esa' ? `<p>${id === 'water-70' ? `${transferCases['water-70'].initial} − ${transferCases['water-70'].withdrawal}` : `${transferCases['area-10'].first} + ${transferCases['area-10'].extra}`} = ___</p>` : '<p>Nutze die Zahlen. Beantworte die Frage zum neuen Fall.</p>'}`;
    }
    return `<section data-transfer-view="current" data-transfer-solution="withheld">${header}${initial}</section>`;
  }
  let body: string;
  if (id === 'demand-18') {
    const c = comparison ? demandScenario() : transferCases[id];
    body = `<p>Dieses Beispiel ist erfunden. Es gilt für eine Stunde.</p><p>${c.people} Menschen wollen mitfahren. Es gibt ${c.capacity} Plätze. Der betrachtete Fußweg ist ${c.walk} Minuten lang.${comparison ? ' Im früheren Fall gilt dieser Fußweg für die acht neuen Nachbarn.' : ' Freie Plätze verkürzen den Fußweg nicht.'}</p><figure aria-label="Menschen und Plätze"><div>${'● '.repeat(c.people)}</div><figcaption>${c.people} Menschen · ${c.capacity} Plätze in einer Stunde. Die Punkte sind Menschen, keine Einwohnerzahl Nairobis.</figcaption></figure>${table(
      ['Größe', 'Wert'],
      [
        ['Menschen in dieser Stunde', c.people],
        ['Plätze pro Stunde', c.capacity],
        ['Betrachteter Fußweg (Minuten)', c.walk],
      ],
      label,
    )}<p>Nachfrage und Plätze sind Größen für eine Stunde. Der Fußweg beschreibt den Zugang. Wartezeit, Kosten und Fahrpreis fehlen.</p>`;
  } else if (id === 'water-70') {
    const c = comparison ? waterModel('repair') : transferCases[id];
    body = `<p>Erfundene Runde bei Agadir. WE bedeutet Wassereinheiten. Es sind erfundene Mengen, keine echten Literangaben. Kein Zufluss. Grundwasser ist Wasser unter der Erde in Lücken von Boden und Gestein. Der Tank ist kein Grundwasser.</p><figure><svg class="study-scene" viewBox="0 0 660 280" role="img" aria-label="${esc(label)}: Tank am Anfang ${c.initial} WE, Entnahme ${c.withdrawal} WE, Rest ${c.remaining} WE.">${transferTank(c.initial, c.remaining)}<path d="M190 130H360" stroke="#356a76" stroke-width="9"/><text x="280" y="70" text-anchor="middle">Entnahme</text><text x="280" y="100" text-anchor="middle">${c.withdrawal} WE</text></svg><figcaption>Nur Tank und Entnahme. ${comparison ? 'Die frühere Reparatur wird verglichen.' : 'Für diese neue Runde sind keine Mengen am Feld angegeben.'}</figcaption></figure>${table(
      ['Größe', 'WE'],
      [
        ['Tank am Anfang', c.initial],
        ['Entnahme', c.withdrawal],
        ['Tankrest', c.remaining],
      ],
      label,
    )}<p>Tankrest = Anfang minus Entnahme. Daraus folgt keine Aussage über Verbrauch oder Grundwasser.</p>`;
  } else {
    const c = comparison
      ? {
          ...areaModel('extra'),
          total: areaModel('extra').withdrawal,
          former: transferCases[id].former,
        }
      : transferCases[id];
    body = `<p>Erfundene Runde bei Agadir. WE bedeutet Wassereinheiten. Tank am Anfang: ${c.initial} WE. Kein Zufluss.</p><figure><svg class="study-scene" viewBox="0 0 660 280" role="img" aria-label="${esc(label)}: Erstes Feld ${c.first} WE, Zusatzfeld ${c.extra} WE, Gesamtentnahme ${c.total} WE, Tankrest ${c.remaining} WE.">${transferTank(c.initial, c.remaining)}<path d="M190 130H360" stroke="#356a76" stroke-width="9"/><text x="275" y="70" text-anchor="middle">Entnahme</text><text x="275" y="100" text-anchor="middle">${c.total} WE</text><rect x="375" y="80" width="150" height="85" fill="#d4e0bd" stroke="#234e42"/><text x="450" y="112" text-anchor="middle">Erstes Feld</text><text x="450" y="144" text-anchor="middle">${c.first} WE</text><rect x="545" y="105" width="85" height="60" fill="#d4e0bd" stroke="#234e42"/><text x="587" y="143" text-anchor="middle">${c.extra} WE</text><text x="587" y="192" text-anchor="middle">Zusatzfeld</text></svg><figcaption>Die Zeichnung zeigt keine echten Feldgrößen. Das Zusatzfeld ist kleiner. Entnahme ist nicht gleich Verbrauch.</figcaption></figure>${table(
      ['Größe', 'WE'],
      [
        ['Tank am Anfang', c.initial],
        ['Erstes Feld', c.first],
        ['Zusatzfeld', c.extra],
        ['Gesamtentnahme', c.total],
        ['Tankrest', c.remaining],
        ['Früher: nur das erste Feld', c.former],
      ],
      label,
    )}<p>${c.first} + ${c.extra} = ${c.total} WE. ${c.total} WE sind ${Math.abs(c.total - c.former)} WE ${c.total < c.former ? 'weniger' : 'mehr'} als früher ${c.former} WE. ${c.initial} − ${c.total} = ${c.remaining} WE bleiben im Tank.</p><p>Keine Aussage über Grundwasser, Ernte oder Einkommen. Das Beispiel ist kein Messwert für Marokko.</p>`;
  }
  return `<section data-transfer-view="${selected}">${header}${note}${body}</section>`;
}
function transferTank(initial: number, remaining: number): string {
  const height = (152 * remaining) / initial;
  return `<rect x="35" y="50" width="150" height="160" rx="8" fill="#fffef8" stroke="#253e34" stroke-width="3"/><rect x="39" y="${206 - height}" width="142" height="${height}" fill="#8eb5c1"/><text x="110" y="35" text-anchor="middle">Tank: Start ${initial} WE</text><text x="110" y="240" text-anchor="middle">Rest ${remaining} WE</text>`;
}
export function simulationMaterial(t: Task, p: ProfileId, a: Attempt): string {
  const cfg = t.simulation!,
    simple = p === 'foerder';
  if (cfg.transfer) return transferMaterial(cfg.transfer, a, t, p);
  if (
    cfg.kind === 'demand' &&
    (t.id === 'demand.before' || (simple && t.id === 'demand.now'))
  ) {
    const model = demandScenario(
      'base',
      t.id === 'demand.before' ? 'before' : 'now',
    );
    return `<h2>Reichen die Plätze?</h2><p>Ein erfundenes Busbeispiel in Nairobi. Die Angaben gelten für eine Stunde.</p>${table(
      ['Angabe', 'Anzahl'],
      [
        ['Menschen, die fahren möchten', model.people],
        ['Angebotene Plätze', model.capacity],
      ],
    )}<p>Vergleiche die Menschen und die Plätze.</p><details><summary>Mehr zum Beispiel ansehen</summary><p>Acht Menschen ziehen hinzu. Wir betrachten später auch den Fußweg der acht neuen Nachbarn. Die Fahrgäste hier sind nicht die gesamte Bevölkerung Nairobis.</p></details>`;
  }
  // A calculation needs inputs, not its answer in a second table or SVG label.
  const reveal =
    simple || a.help === 3 || (a.factual === 'correct' && canContinue(t, a));
  if (
    !reveal &&
    t.id.startsWith('demand.now') &&
    t.fields.some((f) => f.id === 'capacity')
  )
    return `<h2>Plätze in einer Stunde</h2><p>Dieses Busbeispiel in Nairobi ist erfunden. Ein Bus fährt zweimal pro Stunde. Jede Fahrt hat 10 Plätze.</p>${table(
      ['Angabe', 'Wert'],
      [
        ['Fahrten in einer Stunde', 2],
        ['Plätze bei jeder Fahrt', 10],
        ['Menschen in dieser Stunde', 24],
        ['Fußweg der acht neuen Nachbarn (Minuten)', demandScenario().walk],
      ],
    )}<p>Wie viele Plätze sind es zusammen? Das Zeichen × bedeutet mal: 2 × 10 = ___.</p>`;
  if (
    t.id.startsWith('share.paid') &&
    ((!reveal && t.fields.some((f) => f.id === 'free')) ||
      (!simple && !t.fields.some((f) => f.id === 'free')))
  )
    return `<h2>Was bleibt nach dem Bezahlen?</h2><p>Eine erfundene Runde bei Kumasi. GE heißt Geldeinheiten. Wir rechnen mit erfundenem Geld. Die Beträge sind keine echten Preise.</p>${table(
      ['Angabe', 'GE'],
      [
        ['Einnahmen', 300],
        ['Bereits bezahlte Löhne', 100],
        ['Bereits bezahlte andere Kosten', 80],
      ],
    )}${t.fields.some((f) => f.id === 'free') ? '<p>Ziehe die beiden bezahlten Beträge von den Einnahmen ab. 300 − 100 − 80 = ___.</p>' : '<p>Lies bei den Löhnen: Sind sie schon bezahlt?</p>'}`;
  if (
    !reveal &&
    t.id.startsWith('area.total') &&
    t.fields.some((f) => f.id === 'total')
  ) {
    const selected = a.simulationSelection === 'same' ? 'same' : 'extra';
    const selectedModel = areaModel(selected);
    return `<h2>Wasser für beide Felder</h2>${controls(
      [
        ['same', 'Gleiches Feld'],
        ['extra', 'Mit Zusatzfeld'],
      ],
      selected,
    )}<p><strong>Aktuelle Modellansicht: ${selected === 'same' ? 'Gleiches Feld' : 'Mit Zusatzfeld'}.</strong></p><p>Für deine Rechnung gilt der Plan mit Zusatzfeld. Untersuche beide Pläne mit den Tasten.</p><p>Eine erfundene Runde bei Agadir. WE bedeutet Wassereinheiten. Mit diesen erfundenen Mengen rechnen wir. Es sind keine echten Literangaben.</p>${table(
      ['Feld', 'Entnahme (WE)'],
      [
        ['Erstes Feld', selectedModel.first],
        ...(selected === 'extra' ? [['Zusatzfeld', selectedModel.extra]] : []),
        ['Frühere Entnahme: ein Feld', 60],
        ['Tank am Anfang', 80],
      ],
    )}<p>Wie viel Wasser verlässt den Tank für beide Felder zusammen? Rechne erstes Feld plus Zusatzfeld.</p><details><summary>Grenzen des Modells ansehen</summary><p>Es fließt kein Wasser nach. Grundwasser ist Wasser unter der Erde in Lücken von Boden und Gestein. Der Tank ist kein Grundwasser. Die Entnahme zeigt nicht den tatsächlichen Wasserverbrauch.</p></details>${p === 'esa' ? '<p>45 + 20 = ___</p>' : ''}`;
  }

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
    return `<h2>Nairobi · Plätze und Fußwege</h2><p>Erfundenes Beispiel für eine Stunde. Nach dem Zuzug wollen 24 statt 16 Menschen fahren. Die Gehzeit gilt für die acht neuen Nachbarn. Ein Bus hat 10 Plätze. Bisher gibt es zwei Fahrten pro Stunde.</p>${controls(options, selection)}<p aria-live="polite">${esc(options.find(([id]) => id === selection)?.[1] ?? 'Jetzt')}: ${model.people} Menschen · ${model.capacity} Plätze${selection === 'before' ? '' : ` · ${model.walk} Minuten Fußweg für die neuen Nachbarn`}.</p><details><summary>Menschenpunkte ansehen</summary><figure aria-label="Menschen und Plätze"><div>${'● '.repeat(model.people)}</div><figcaption>${model.people} Menschen; ${model.capacity} Plätze in einer Stunde. Die Punkte sind Menschen, keine Einwohnerzahl Nairobis.</figcaption></figure></details>${table(
      ['Größe', 'Wert'],
      [
        ['Fahrten pro Stunde', model.trips],
        ['Plätze pro Fahrt', 10],
        ['Plätze pro Stunde', model.capacity],
        ...(selection === 'before'
          ? []
          : [['Fußweg der neuen Nachbarn (Minuten)', model.walk]]),
      ],
    )}<details><summary>Was das Modell nicht zeigt</summary><p>Die genaue Wartezeit, Kosten und der Fahrpreis fehlen. Menschen und Zeiten sind erfunden.</p></details>`;
  }
  if (cfg.kind === 'cocoa') {
    const selection = a.simulationSelection ?? cfg.preset ?? 'base',
      m = cocoaModel(selection);
    const economicView = `${controls(
      [
        ['base', 'Bisher'],
        ['quality', 'Qualität'],
        ['process', 'Presse'],
      ],
      selection,
    )}${table(['Laufende Runde', 'GE'], [['Einnahmen', m.income], ['Laufende Ausgaben', m.costs], ...(simple ? [['Erklärter Überschuss', m.surplus]] : [])])}<section aria-label="Getrennter Anschaffungstopf"><h3>Einmalige Anschaffung · eigener Topf</h3><p>Topf vorher: 60 GE. Anschaffung: ${m.investment} GE. Im Topf bleiben ${m.investmentLeft} GE. Die Anschaffung zahlst du einmal aus diesem eigenen Topf. Die laufenden Ausgaben stehen im anderen Topf oben. Die Anschaffung wird dort nicht noch einmal abgezogen.</p></section><details><summary>Modellgrenzen ansehen</summary><p>${esc(cocoa.modelNote)}</p></details>`;
    const introduction =
      '<h2>Ein Betrieb bei Kumasi · Ghana</h2><p>Der Betrieb ist erfunden. Er gehört seinen Mitgliedern gemeinsam. Das heißt Genossenschaft. Ghana hat bereits eigene Kakaoverarbeitung.</p>';
    if (t.id.startsWith('cocoa.chain'))
      return (
        introduction +
        '<p>Aus Kakaobohnen entstehen andere Produkte. Das heißt Verarbeitung. Schau dir die Karten an. Wähle den passenden Schritt.</p><figure><ul class="learning-material-cards" aria-label="Ungeordnete Materialkarten"><li>Pressen: Butter und Presskuchen</li><li>Getrocknete Bohnen</li><li>Kakaomasse</li><li>Rösten und mahlen</li></ul><figcaption>Die Karten stehen noch nicht in der richtigen Reihenfolge.</figcaption></figure><details id="learning-cocoa-money"><summary>Geld und Angaben zum Modell ansehen</summary><p>GE heißt Geldeinheiten. Wir rechnen hier mit erfundenem Geld. Die Beträge sind keine echten Preise.</p>' +
        economicView +
        '</details>'
      );
    return (
      introduction +
      '<p>GE heißt Geldeinheiten. Wir rechnen hier mit erfundenem Geld. Die Beträge sind keine echten Preise.</p>' +
      economicView
    );
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
    return `<h2>Geld gemeinsam verteilen · Ghana</h2><p>GE heißt Geldeinheiten. Wir rechnen hier mit erfundenem Geld. Die Beträge sind keine echten Preise.</p><p>Eine neue erfundene Runde bei Kumasi. 300 GE Einnahmen. 100 GE Löhne und 80 GE andere Kosten sind bereits bezahlt. Nun sind 120 GE frei. Keine Verteilung ist automatisch die beste.</p>${
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
    return `<h2>Ein Betrieb bei Agadir · Marokko</h2><p>Am Anfang sind 80 WE im Tank. Es fließt kein Wasser nach. WE bedeutet Wassereinheiten. Die Mengen sind für das Spiel erfunden. Es sind keine Literangaben. Grundwasser ist Wasser unter der Erde in Lücken von Boden und Gestein. Der Tank ist kein Grundwasser.</p>${controls(options, selection)}<p><strong>Aktuelle Modellansicht: ${esc(options.find(([id]) => id === selection)?.[1] ?? options[0][1])}.</strong> Prüfe, auf welche Maßnahme sich die Frage bezieht.</p>${!isWater && t.id.startsWith('area.total') ? '<p>Die Rechenfrage gilt weiterhin für den Plan mit Zusatzfeld. Die Tasten wechseln nur die Vergleichsansicht.</p>' : ''}<figure><svg class="study-scene" viewBox="0 0 660 280" role="img" aria-label="Tank, Entnahme und Feld getrennt. ${m.withdrawal} WE werden entnommen.">${diagram}<path d="M190 130H370" stroke="#356a76" stroke-width="9"/><text x="220" y="70">Entnahme</text><text x="235" y="100">${m.withdrawal} WE</text><rect x="380" y="80" width="150" height="85" fill="#d4e0bd" stroke="#234e42"/><text x="390" y="112">${isWater ? 'Am Feld' : 'Erstes Feld'}</text><text x="410" y="144">${isWater ? '40' : (m as ReturnType<typeof areaModel>).first} WE</text>${!isWater && selection === 'extra' ? `<rect x="545" y="105" width="85" height="60" fill="#d4e0bd" stroke="#234e42"/><text x="587" y="143" text-anchor="middle">${(m as ReturnType<typeof areaModel>).extra} WE</text><text x="587" y="192" text-anchor="middle">Zusatzfeld</text>` : ''}</svg><figcaption>${isWater ? 'Entnahme aus dem Tank ist nicht gleich Ankunft am Feld. Der Verbleib des übrigen Wassers wird nicht berechnet.' : 'Die Zeichnung zeigt nicht, wie groß die Felder wirklich sind. Die Zusatzfläche ist kleiner.'}</figcaption></figure>${
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
    return `<h2>Drei Länder in Afrika</h2><p>Oben ist Norden. Die gestrichelte Linie ist der Äquator, keine Landesgrenze. Punkte zeigen Städte. Die Länder sind an ihrem wirklichen Ort eingezeichnet. Unsere erfundene Nachbarschaft ist hier nicht eingezeichnet.</p>${map}${controls(
      Object.entries(regions).map(([id, r]) => [id, r.name]),
      a.simulationSelection ?? '',
    )}<details><summary>Städte und Quelle nachsehen</summary>${table(
      ['Stadt', 'Land'],
      Object.values(regions).map((r) => [r.city, r.name]),
      'Reale Städte und Länder · Übersicht',
    )}<p>Natural Earth, public domain; stark vereinfachte Übersicht. Genaue Reisezeiten kannst du hier nicht ablesen. Die gestrichelte Gebietsgrenze der Westsahara ist keine normale durchgezogene Staatsgrenze.</p></details>`;
  }
  if (cfg.kind === 'review') {
    const code = isRegion(cfg.preset) ? cfg.preset : undefined;
    return `<h2>Fälle erneut vergleichen</h2><p>Hier stehen die nötigen Fallangaben. Du kannst sie auch lesen, wenn du eine Episode noch nicht bearbeitet hast. Die Angaben bedeuten nicht, dass du die Episode schon bearbeitet hast.</p>${(code ? [code] : (['KEN', 'GHA', 'MAR'] as const)).map((id) => `<section><h3>${regions[id].name} · erfundener Fall</h3><p>${esc(transferTasks[id].example)}</p></section>`).join('')}<details><summary>Reale Orte und Kontext</summary>${(code ? [code] : (['KEN', 'GHA', 'MAR'] as const)).map((id) => renderContext(id)).join('')}</details>`;
  }
  return '';
}
