import {
  populationBalance,
  populationData,
  populationModel,
} from '../inquiry/content.ts';
import { material as oldMaterial } from '../inquiry/ui.ts';
import { newRecord } from '../inquiry/state.ts';
import { journey, lineDuration } from '../model.ts';
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
  if (task.material === 'm2')
    return `<h2>Ghana · historische Schätzungen</h2><p>WDI: Personen zur Jahresmitte. Eingefrorener Materialstand, keine neuen Zahlen und keine Prognose für 2040.</p><table><caption>Ghana · Personen</caption><thead><tr><th>Jahr</th><th>Menschen</th></tr></thead><tbody>${populationData
      .filter(
        ([year]) => profile !== 'foerder' || year === 2000 || year === 2024,
      )
      .map(
        ([year, value]) =>
          `<tr><th scope="row">${year}</th><td>${value.toLocaleString('de-DE')} (etwa ${(value / 1e6).toLocaleString('de-DE', { maximumFractionDigits: 1 })} Millionen)</td></tr>`,
      )
      .join(
        '',
      )}</tbody></table><p>Schätzung: Die Zahl wurde aus vorhandenen Daten berechnet. Zwischenjahre sind nicht automatisch ein gleichmäßiger Anstieg. Die Reihe zeigt keine einzelnen Ursachen.</p><details id="learning-original"><summary>Vollständige Reihe, Diagramm und Quelle</summary>${oldMaterial('population', 1, newRecord())}</details>`;
  if (task.material === 'm4')
    return `<h2>Zusätzliche erfundene Situation</h2><p>In einem Ort leben nun mehr Kinder und Jugendliche. Diese Annahme ist nicht aus der Ghana-Gesamtzahl abgelesen.</p><p>Menschen diskutieren Bildung, Ausbildung und Versorgung. Schulplätze, Lehrkräfte und später passende Arbeitsplätze können nötig sein. Mehr Geburten bedeuten nicht sofort mehr erwachsene Arbeitskräfte.</p>`;
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
  return `<h2>${task.material === 'm1' ? 'M1' : task.material === 'm3' ? 'M3 · neuer Fall' : 'Gegenfall · Fortzug verändert'}</h2><p><strong>Erfundenes Modell: ein Ort, ein Jahr, Personen.</strong></p>${table(subset)}${profile === 'foerder' ? `<details id="learning-full-model"><summary>Alle Angaben zum Modell</summary>${table(rows)}</details>` : ''}${profile === 'foerder' && task.id.endsWith('total-direction') ? `<p class="model-card">${balance.natural} mehr durch Geburten und Sterbefälle. ${Math.abs(balance.migration)} weniger durch Umzüge. Die Zahlen werden erklärt; du entscheidest die Gesamtwirkung.</p>` : ''}${task.id.endsWith('.arrival') ? '<p>Außerhalb → in den Ort</p>' : task.id.endsWith('.departure') ? '<p>Aus dem Ort → nach außerhalb</p>' : ''}<p>Die Werte zeigen nicht die echte Bevölkerung Ghanas.</p>`;
}
function kenyaMaterial(profile: ProfileId, selection: string) {
  const [who, route] = selection.split('-') as [
      'amina' | 'david',
      'direct' | 'north',
    ],
    v = journey(who, route);
  const name = who === 'amina' ? 'Amina' : 'David',
    routeName = route === 'north' ? 'Nord' : 'Direkt';
  return `<h2>Erfundenes Wegenetz im Kontext Nairobis</h2><p>Du vergleichst Amina und David, Direkt und Nord. Gesamtweg: zu Fuß zur richtigen Haltestelle und dann nur den benutzten Busabschnitt. Wartezeit und Fahrpreis fehlen.</p><div role="group" aria-label="Person und Linie untersuchen">${(['amina-direct', 'amina-north', 'david-direct', 'david-north'] as const).map((key) => `<button type="button" data-action="learning" data-op="material" data-value="${key}" id="learning-map-${key}" aria-pressed="${selection === key}">${key.startsWith('amina') ? 'Amina' : 'David'} · ${key.endsWith('north') ? 'Nord' : 'Direkt'}</button>`).join('')}</div><svg class="study-scene" viewBox="0 0 620 160" role="group" aria-label="Persönlichen Weg untersuchen"><g id="learning-route-switch" role="button" tabindex="0" data-action="learning" data-op="material" data-value="${who}-${route === 'direct' ? 'north' : 'direct'}" aria-pressed="${route === 'north'}" aria-labelledby="learning-map-text" aria-describedby="learning-map-help"><rect x="5" y="5" width="610" height="145" rx="15" fill="#e6ecdf" stroke="#234e42"/><path d="M40 85H225" stroke="#536449" stroke-width="4" stroke-dasharray="8 5"/><path d="M225 85H560" stroke="#234e42" stroke-width="8"/><text id="learning-map-text" font-size="17"><tspan x="25" y="38">${name} · ${routeName} </tspan><tspan x="30" y="125">Zu Fuß: ${v.walk} Min. </tspan><tspan x="290" y="125">Benutzter Busabschnitt: ${v.bus} Min.</tspan></text></g></svg><p id="learning-map-help">Antippen oder Enter auf der Skizze wechselt die Linie. Du kannst auch die vier Tasten über der Skizze nutzen.</p><p>Ganze Linie ${routeName}: ${lineDuration(route)} Minuten. Eine Person fährt nicht immer die ganze Linie.</p><table><caption>Persönliche Wege · Modellminuten</caption><thead><tr><th>Person und Linie</th><th>Fußweg</th><th>Benutzte Busfahrt</th>${profile === 'foerder' ? '<th>Erklärte Gesamtzeit</th>' : ''}</tr></thead><tbody>${(
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
