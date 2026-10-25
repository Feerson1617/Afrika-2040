import type { State } from '../state.ts';
import type { StudyUI } from '../regions/types.ts';
import { newGeography, regions, type RegionId } from './state.ts';
import { newReview, transferTasks, transferHint } from './transfer.ts';
import { africaMap, geoButton } from './ui.ts';
import { renderContext } from './context.ts';
export function episodeStatus(s: State, id: RegionId) {
  const flags =
    id === 'KEN'
      ? [
          s.progress[5].complete || s.road?.revision.complete,
          s.demand?.decide.complete,
        ]
      : id === 'GHA'
        ? [
            s.studies?.cocoa?.progress[2].complete,
            s.studies?.share?.progress[2].complete,
          ]
        : [
            s.studies?.water?.progress[2].complete,
            s.studies?.area?.progress[2].complete,
          ];
  const first = id === 'KEN' ? 1 : id === 'GHA' ? 3 : 5;
  return flags
    .map(
      (done, i) =>
        `Episode ${first + i}: ${done ? 'Abschluss vorhanden' : 'noch nicht abgeschlossen · Vorschau'}`,
    )
    .join(' · ');
}
export function renderReview(s: State, h: StudyUI) {
  const g = s.geography ?? newGeography(),
    review = g.review ?? newReview();
  // The map also works before the first review action creates persisted state.
  const mapState = { ...g, review };
  const tab = review.tab,
    d = review.records[tab],
    p = d.progress;
  const field = (name: string, legend: string, options: [string, string][]) =>
    `<fieldset><legend>${legend}</legend>${options.map(([value, text]) => h.radio('geo-transfer-' + name, value, text, d.answers[name] === value)).join('')}</fieldset>`;
  const body =
    tab === 'common'
      ? `<h2 id="review-task-title" tabindex="-1">Was haben die Entscheidungen gemeinsam?</h2><ul class="review-comparisons"><li>Busmodell Nord: Amina 10 statt 22 Min.; David 18 statt 12 Min.</li><li>Kakaomodell: Qualität 90 GE Überschuss; Verarbeitung 75 GE.</li><li>Flächenmodell: erstes Feld verbessert 45 WE; mit Zusatzfläche insgesamt 65 WE.</li></ul>${field(
          'consequences',
          '1. Welche Folgen haben Vorschläge?',
          [
            [
              'different',
              'Ein Vorschlag kann helfen und zugleich einen Nachteil haben.',
            ],
            ['same', 'Ein Vorschlag hilft immer allen gleich.'],
          ],
        )}${field('weigh', '2. Wie begründest du einen Vorschlag?', [
          ['evidence', 'Ich prüfe Vorteile und Grenzen mit passenden Angaben.'],
          ['any', 'Eine richtige Zahl zu irgendeinem Vorschlag reicht aus.'],
        ])}`
      : `<p class="eyebrow">${regions[tab].name} · ${regions[tab].city}</p><h2 id="review-task-title" tabindex="-1">Was belegt unser Modell?</h2><p class="review-example">${transferTasks[tab].example}</p>${field(
          'claim',
          'Wähle die belegte Aussage.',
          [
            ['model', transferTasks[tab].choices[0]],
            ['all', transferTasks[tab].choices[1]],
          ],
        )}`;
  return `${h.header}<main id="main" class="review-screen" tabindex="-1"><p class="eyebrow">Freiwilliger Rückblick · alle Episoden bleiben direkt spielbar</p><h1>Drei Orte – unterschiedliche Herausforderungen und Möglichkeiten</h1><p>Dies sind Erkenntnisse aus unseren erfundenen Modellen. Sie beschreiben keine ganzen Länder.</p><div class="review-overview"><section aria-label="Die drei Orte auf der Afrikakarte">${africaMap(mapState, true)}<p class="small-note">Natural Earth · gemeinfrei · vereinfachte Übersicht. Quellen und Genauigkeit findest du auf der Startseite.</p></section><div class="review-insights">${(Object.keys(regions) as RegionId[]).map((id) => `<section><h2>${regions[id].name} · ${regions[id].city}</h2><p><strong>Im Modell:</strong> ${transferTasks[id].insight}</p><p class="review-status" data-region-status="${id}">${episodeStatus(s, id)}</p></section>`).join('')}</div></div><nav class="review-tabs" aria-label="Rückblick auswählen">${(Object.keys(regions) as RegionId[]).map((id) => geoButton(h, regions[id].name, 'review-tab', id, 'review-tab-' + id, `aria-pressed="${tab === id}"`)).join('')}${geoButton(h, 'Gemeinsam vergleichen', 'review-tab', 'common', 'review-tab-common', `aria-pressed="${tab === 'common'}"`)}</nav><section class="task-panel review-task" aria-labelledby="review-task-title">${body}${h.feedback(p.feedback)}${p.help && !p.complete ? `<aside class="help-panel"><h3 id="help-title" tabindex="-1">→ Hilfe ${p.help} von 3</h3><p>${h.esc(transferHint(review))}</p>${p.help < 3 ? geoButton(h, p.help === 1 ? 'Genauer zeigen' : 'Erklärung ansehen', 'transfer-help', String(p.help + 1)) : geoButton(h, 'Dieses Beispiel übernehmen', 'transfer-adopt', '', 'review-adopt')}</aside>` : ''}<div class="task-actions">${geoButton(h, 'Aussage prüfen', 'transfer-check', '', 'review-check')}${!p.help ? geoButton(h, 'Ich brauche einen Hinweis', 'transfer-help', '1') : ''}${geoButton(h, 'Antwort neu bearbeiten', 'transfer-reset')}</div>${p.complete ? `<p class="review-completion" data-review-complete>Aussage ${p.supported ? 'mit bewusst übernommenem Beispiel' : 'mit Bausteinen'} geprüft. Erkläre jemandem ein Modellbeispiel.</p>` : ''}${tab === 'common' ? '' : renderContext(tab)}</section><footer class="game-footer">${geoButton(h, 'Zu den Episoden', 'home', '', 'review-home')}<span>Verschiedene Ziele bleiben möglich.</span></footer></main>`;
}
