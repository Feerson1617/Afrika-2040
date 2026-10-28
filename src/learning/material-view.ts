import {
  populationBalance,
  populationData,
  populationModel,
} from '../inquiry/content.ts';
import { material as oldMaterial, sources } from '../inquiry/ui.ts';
import { newRecord } from '../inquiry/state.ts';
import { journey, lineDuration } from '../model.ts';
import { boarding, lineStops, stopNames } from '../content.ts';
import { counterModel, transferModel, type Task } from './tasks.ts';
import type { ProfileId } from './profiles.ts';
import type { Attempt } from './storage.ts';
export const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
export function materialView(task: Task, profile: ProfileId, attempt: Attempt) {
  if (task.material === 'm2') {
    const simple = profile === 'foerder';
    return `<h2>Ghana · Menschen in früheren Jahren</h2><p>${simple ? 'Die Zahlen gelten für frühere Jahre. Sie wurden aus Daten berechnet. Das heißt Schätzung. Es sind keine Zahlen für 2040. Quelle: Weltbank.' : 'Ghana · 2000–2024 · Bevölkerung in Personen zur Jahresmitte. Historische Schätzungen der Weltbank (WDI), keine Prognose für 2040.'}</p><table><caption>Ghana · ${simple ? 'etwa so viele Menschen' : 'Personen'}</caption><thead><tr><th scope="col">Jahr</th><th scope="col">Menschen</th></tr></thead><tbody>${populationData
      .filter(
        ([year]) => profile !== 'foerder' || year === 2000 || year === 2024,
      )
      .map(
        ([year, value]) =>
          `<tr><th scope="row">${year}</th><td>${simple ? '' : value.toLocaleString('de-DE') + ' ('}etwa ${(value / 1e6).toLocaleString('de-DE', { maximumFractionDigits: 1 })} Millionen${simple ? '' : ')'}</td></tr>`,
      )
      .join(
        '',
      )}</tbody></table>${simple ? '' : '<p>Schätzung: Die Zahl wurde aus vorhandenen Daten berechnet. Zwischenjahre sind nicht automatisch ein gleichmäßiger Anstieg.</p>'}<details id="learning-original"><summary>${simple ? 'Genaue Zahlen und Quelle ansehen' : 'Vollständige Reihe, Diagramm und Quelle'}</summary>${oldMaterial('population', 1, newRecord())}<h3>Quelle: Weltbank</h3>${sources('population')}</details>`;
  }
  if (task.material === 'm4')
    return profile === 'foerder'
      ? '<h2>Eine neue erfundene Situation</h2><p>In einem Ort leben nun mehr Kinder und Jugendliche. Das nehmen wir hier an. Das steht nicht in den Ghana-Zahlen.</p><p>Die Menschen im Ort überlegen: Wie können alle Kinder gut lernen?</p>'
      : `<h2>Zusätzliche erfundene Situation</h2><p>In einem Ort leben nun mehr Kinder und Jugendliche. Diese Annahme ist nicht aus der Ghana-Gesamtzahl abgelesen.</p><p>Menschen diskutieren Bildung, Ausbildung und Versorgung. Schulplätze, Lehrkräfte und später passende Arbeitsplätze können nötig sein. Mehr Geburten bedeuten nicht sofort mehr erwachsene Arbeitskräfte.</p>`;
  if (task.material === 'kenia')
    return kenyaMaterial(profile, attempt.mapSelection ?? 'amina-direct');
  const m =
    task.material === 'm1'
      ? populationModel
      : task.material === 'm3'
        ? transferModel
        : counterModel;
  const balance = populationBalance(m);
  const rows = Object.entries({
    Anfang: m.start,
    Geburten: m.births,
    Sterbefälle: m.deaths,
    Zuzug: m.arrivals,
    Fortzug: m.departures,
  });
  const table = (data: typeof rows) =>
    `<table><caption>Personen · derselbe Ort, dasselbe Jahr</caption><tbody>${data.map(([label, value]) => `<tr><th scope="row">${label}</th><td>${value.toLocaleString('de-DE')}</td></tr>`).join('')}</tbody></table>`;
  const keys = task.id.includes('natural-direction')
    ? ['Geburten', 'Sterbefälle']
    : task.id.includes('migration-direction')
      ? ['Zuzug', 'Fortzug']
      : task.id.endsWith('.birth')
        ? ['Geburten']
        : task.id.endsWith('.death')
          ? ['Sterbefälle']
          : task.id.endsWith('.arrival')
            ? ['Zuzug']
            : task.id.endsWith('.departure')
              ? ['Fortzug']
              : ['Anfang'];
  const subset =
    profile === 'foerder'
      ? rows.filter(([label]) => keys.includes(label))
      : rows;
  return `<h2>${profile === 'foerder' ? (task.material === 'm1' ? 'Unser erfundener Ort' : 'Ein anderer erfundener Ort') : task.material === 'm1' ? 'M1' : task.material === 'm3' ? 'M3 · neuer Fall' : 'Gegenfall · Fortzug verändert'}</h2><p><strong>${profile === 'foerder' ? 'Die Zahlen sind erfunden. Sie gelten für einen Ort und ein Jahr.' : 'Erfundenes Modell: ein Ort, ein Jahr, Personen.'}</strong></p>${profile === 'foerder' ? eventPicture(task.id) : ''}${table(subset)}${profile === 'foerder' ? `<details id="learning-full-model"><summary>Alle Zahlen zum Ort ansehen</summary>${table(rows)}</details>` : ''}${profile === 'foerder' && task.id.endsWith('total-direction') ? `<p class="model-card">${balance.natural} mehr durch Geburten und Sterbefälle. ${Math.abs(balance.migration)} weniger durch Umzüge. Vergleiche beide Zahlen. Du entscheidest: Werden es insgesamt mehr oder weniger?</p>` : ''}<p>Die Werte zeigen nicht die echte Bevölkerung Ghanas.</p>`;
}
function eventPicture(id: string) {
  const event = id.split('.').at(-1);
  if (!['birth', 'death', 'arrival', 'departure'].includes(event!)) return '';
  const label =
    event === 'birth'
      ? 'Ein Baby wird im Ort geboren.'
      : event === 'death'
        ? 'Ein Mensch im Ort stirbt.'
        : event === 'arrival'
          ? 'Eine Person zieht von außerhalb in den Ort.'
          : 'Eine Person zieht aus dem Ort nach außerhalb.';
  const person = (x: number, y: number, small = false, outline = false) =>
    `<circle cx="${x}" cy="${y}" r="${small ? 7 : 11}" fill="${outline ? '#fffef8' : '#234e42'}" stroke="#234e42" stroke-width="2"/><path d="M${x} ${y + 13}v${small ? 20 : 33}" stroke="#234e42" stroke-width="${small ? 8 : 13}" ${outline ? 'stroke-dasharray="3 3"' : ''}/>`;
  return `<figure class="learning-event"><svg viewBox="0 0 520 180" role="img" aria-labelledby="event-title event-desc"><title id="event-title">${label}</title><desc id="event-desc">Der Rahmen zeigt die Grenze des Ortes. ${event === 'arrival' || event === 'departure' ? 'Der Pfeil zeigt den Umzug über die Grenze.' : 'Dieses Ereignis passiert innerhalb der Ortsgrenze. Es ist kein Umzug.'}</desc><rect x="160" y="15" width="245" height="150" rx="16" fill="#eef1e7" stroke="#234e42" stroke-width="3"/><text x="225" y="43" font-size="19">Unser Ort</text><text x="20" y="160" font-size="17">Außerhalb</text>${event === 'arrival' ? person(55, 65) + '<path d="M85 95H250m-22-14l22 14-22 14" fill="none" stroke="#234e42" stroke-width="4"/>' : event === 'departure' ? person(240, 65) + '<path d="M210 115H65m22-14l-22 14 22 14" fill="none" stroke="#234e42" stroke-width="4"/>' : event === 'birth' ? person(225, 75) + person(300, 100, true) : person(270, 75, false, true)}</svg><figcaption>${label}</figcaption></figure>`;
}
function kenyaMaterial(profile: ProfileId, selection: string) {
  const [who, route] = selection.split('-') as [
      'amina' | 'david',
      'direct' | 'north',
    ],
    v = journey(who, route);
  const name = who === 'amina' ? 'Amina' : 'David',
    routeName = route === 'north' ? 'Nord' : 'Direkt';
  return `<h2>Wege von Amina und David</h2><p>Nairobi ist ein echter Ort. Die Wege hier sind erfunden. Du vergleichst Direkt und Nord. Erst geht die Person zu Fuß zur Haltestelle. Dann fährt sie Bus. Wartezeit und Fahrpreis fehlen.</p><div role="group" aria-label="Person und Linie untersuchen">${(['amina-direct', 'amina-north', 'david-direct', 'david-north'] as const).map((key) => `<button type="button" data-action="learning" data-op="material" data-value="${key}" id="learning-map-${key}" aria-pressed="${selection === key}">${key.startsWith('amina') ? 'Amina' : 'David'} · ${key.endsWith('north') ? 'Nord' : 'Direkt'}</button>`).join('')}</div><svg class="study-scene" viewBox="0 0 620 160" role="group" aria-label="Persönlichen Weg untersuchen"><g id="learning-route-switch" role="button" tabindex="0" data-action="learning" data-op="material" data-value="${who}-${route === 'direct' ? 'north' : 'direct'}" aria-pressed="${route === 'north'}" aria-labelledby="learning-map-text" aria-describedby="learning-map-help"><rect x="5" y="5" width="610" height="145" rx="15" fill="#e6ecdf" stroke="#234e42"/><path d="M40 85H225" stroke="#536449" stroke-width="4" stroke-dasharray="8 5"/><path d="M225 85H560" stroke="#234e42" stroke-width="8"/><text id="learning-map-text" font-size="17"><tspan x="25" y="38">${name} · ${routeName} </tspan><tspan x="30" y="125">Zu Fuß: ${v.walk} Min. </tspan><tspan x="290" y="125">Benutzter Busabschnitt: ${v.bus} Min.</tspan></text></g></svg><p id="learning-map-help">Antippen oder Enter auf der Skizze wechselt die Linie. Du kannst auch die vier Tasten über der Skizze nutzen.</p><p class="learning-boarding">${name} steigt bei ${stopNames[boarding[who][route]]} ein. Buslinie ${routeName}: ${lineStops[route].map((stop) => stopNames[stop]).join(' → ')}.<br>Mitfahrt: ${lineStops[
    route
  ]
    .slice(lineStops[route].indexOf(boarding[who][route]))
    .map((stop) => stopNames[stop])
    .join(
      ' → ',
    )}.</p><p>Ganze Linie ${routeName}: ${lineDuration(route)} Minuten. Eine Person fährt nicht immer die ganze Linie.</p><table><caption>Persönliche Wege · Modellminuten</caption><thead><tr><th>Person und Linie</th><th>Fußweg</th><th>Benutzte Busfahrt</th>${profile === 'foerder' ? '<th>Erklärte Gesamtzeit</th>' : ''}</tr></thead><tbody>${(
    ['amina', 'david'] as const
  )
    .flatMap((person) =>
      (['direct', 'north'] as const).map((r) => {
        const j = journey(person, r);
        return `<tr><th scope="row">${person === 'amina' ? 'Amina' : 'David'} · ${r === 'north' ? 'Nord' : 'Direkt'}</th><td>${j.walk}</td><td>${j.bus}</td>${profile === 'foerder' ? `<td>${j.total}</td>` : ''}</tr>`;
      }),
    )
    .join('')}</tbody></table>`;
}
