import { criteria, episode, routeNames, routes, roadEvent } from './content.ts';
import type { Situation } from './content.ts';
import { evidenceLabel, journey, walkTime } from './model.ts';
import { goalMessage, goalStatus, weightingProduct } from './decision.ts';
import {
  changeLabel,
  connections,
  eventCauses,
  eventExplanation,
  revisionReason,
} from './event.ts';
import type { RoadState } from './event.ts';
import { currentProgress } from './state.ts';
import type { State } from './state.ts';
import type { Decision, Feedback } from './feedback.ts';
import { renderMap } from './map.ts';
interface UI {
  header: string;
  restartPending: boolean;
  button(text: string, action: string, cls?: string, extra?: string): string;
  radio(
    group: string,
    value: string,
    label: string,
    checked: boolean,
    disabled?: boolean,
  ): string;
  esc(text: string): string;
  feedback(f?: Feedback): string;
  help(): string;
  evidenceInput(
    d: Decision,
    kind: 'advantage' | 'disadvantage',
    situation: Situation,
  ): string;
  ownWords(): string;
  routeSwitch(): string;
  journeyExplorer(): string;
}
const shortGoals = {
  school: 'Amina: kurzer Schulweg',
  market: 'David: kurzer Weg zum Markt',
  training: 'Leila: kurzer Weg zur Ausbildung',
  tradeoff: 'Verschiedene Interessen abwägen',
};
export function renderEvent(s: State, h: UI): string {
  const r = s.road!,
    p = currentProgress(s),
    d = r.review;
  const { button, radio, esc } = h;
  const before = walkTime('leila', 'platz'),
    now = walkTime('leila', 'platz', 'now');
  const views = () =>
    s.screen === 'event-find' && !r.find.complete && r.find.help !== 3
      ? '<p class="small-note">Die bekannte Karte: vor der Veränderung.</p>'
      : `<div class="event-views" role="group" aria-label="Situation auf der Karte">${(['before', 'now'] as const).map((view) => button(view === 'before' ? 'Vorher' : 'Jetzt', 'event-view', `route-button ${r.view === view ? 'selected' : ''}`, `id="event-view-${view}" data-value="${view}" aria-pressed="${r.view === view}"`)).join('')}<span>Auf der Karte: <strong>${r.view === 'before' ? 'Vorher' : 'Jetzt'}</strong></span></div>`;
  const summary = (answer: Decision, situation: Situation) =>
    `<p><strong>Buslinie:</strong> ${answer.route ? routeNames[answer.route] : 'noch offen'}</p><p><strong>Ziel:</strong> ${answer.criterion ? criteria[answer.criterion] : 'noch offen'}</p>${answer.advantage ? `<p><strong>Vorteil:</strong> ${esc(evidenceLabel(answer.advantage, situation))}</p>` : ''}${answer.disadvantage ? `<p><strong>Nachteil:</strong> ${esc(evidenceLabel(answer.disadvantage, situation))}</p>` : ''}${weightingProduct(answer, situation) ? `<p>${esc(weightingProduct(answer, situation))}</p>` : ''}${answer.text ? `<p class="saved-text">${esc(answer.text)}</p><p class="small-note">Eigener Text: nicht automatisch geprüft.</p>` : ''}${answer.ungraded ? '<p class="small-note" data-ungraded>Bewusst unbewertet abgegeben.</p>' : '<p class="small-note">Mit Bausteinen begründet.</p>'}`;
  const original = () =>
    `<details id="original-report" class="original-report"><summary>Deine erste Empfehlung: ${routeNames[r.original.route!]}</summary><div class="original-recommendation">${summary(r.original, 'before')}${r.originalSupported ? '<p class="small-note" data-original-supported>Erste Empfehlung mit Hilfe erstellt.</p>' : ''}</div></details>`;
  const map = () =>
    `<div class="event-map">${views()}${renderMap(s)}${s.screen === 'event-effects' ? h.routeSwitch() + h.journeyExplorer() : ''}</div>`;
  const compare = () =>
    `<table class="event-comparison"><caption>Leilas ganzer Weg <span>Minuten</span></caption><thead><tr><th scope="col">Buslinie</th><th scope="col" class="${r.view === 'before' ? 'current-view' : ''}">Vorher</th><th scope="col" class="${r.view === 'now' ? 'current-view' : ''}">Jetzt</th><th scope="col">${r.compared ? 'Dein Vergleich' : 'Was gilt jetzt?'}</th></tr></thead><tbody>${routes.map((route) => `<tr data-event-route="${route}"><th scope="row">${routeNames[route]}</th><td>${journey('leila', route).total}</td><td>${journey('leila', route, 'now').total}</td><td>${r.compared ? (r.answers[route] === 'longer' ? 'Länger' : 'Gleich') : `<fieldset><legend class="sr-only">${routeNames[route]}: jetzt länger oder gleich?</legend><div class="event-answer">${radio('event-answer-' + route, 'longer', 'Länger', r.answers[route] === 'longer')}${radio('event-answer-' + route, 'same', 'Gleich', r.answers[route] === 'same')}</div></fieldset>`}</td></tr>`).join('')}</tbody></table>`;
  if (s.screen === 'event-end')
    return `${h.header}<main id="main" class="end-screen event-end" tabindex="-1"><p class="eyebrow">Deine Entscheidung erneut geprüft</p><h1>Neue Bedingungen.<br>Dein Vorschlag.</h1><p class="takeaway">Eine Veränderung kann Menschen und Wege unterschiedlich betreffen. Nicht jede Veränderung macht einen neuen Vorschlag nötig.</p><section class="recommendation" aria-label="Dein Lernprodukt nach dem Ereignis">${original()}<h2>Eine Woche später im Modell</h2><p>Leilas Fußweg zum Platz: ${before} → ${now} Minuten. Die Busse fahren wie zuvor.</p><p><strong>Dein beobachteter Beleg:</strong> ${r.changeEvidence ? changeLabel(r.changeEvidence) : 'Kein Baustein gewählt.'}</p><p><strong>Deine Erklärung:</strong> ${r.explanationUngraded ? 'Bewusst unbewertet abgegeben.' : eventExplanation()}</p>${r.explanationText ? `<p class="saved-explanation saved-text">${esc(r.explanationText)}</p><p class="small-note">Eigener Erklärungstext: nicht automatisch geprüft.</p>` : ''}<h2>Deine erneute Empfehlung</h2>${summary(d, 'now')}${revisionReason(r) ? `<p class="revision-reason"><strong>Warum ich ${d.route === r.original.route ? 'dabei bleibe' : 'wechsle'}:</strong> ${esc(revisionReason(r))}</p>` : ''}${r.revision.supported ? '<p data-supported>Erneute Empfehlung mit Hilfe erstellt.</p>' : ''}${r.find.supported ? '<p data-event-supported>Betroffenen Weg mit Hilfe gefunden.</p>' : ''}${r.effects.supported ? '<p data-event-supported>Folgen und Erklärung mit Hilfe erstellt.</p>' : ''}<p class="reflection">Zeige, welche Folge dir wichtig ist. Beibehalten und Wechseln brauchen eine Begründung.</p></section><p class="end-model">${episode.modelNote} Die Baustelle ist eine erfundene neue Bedingung. Keine Vorhersage für Nairobi. Wartezeit, Fahrpreis und Kapazität fehlen im Modell.</p>${button('Episode 2 starten', 'demand-start', 'button secondary')}<div class="end-actions">${button('Episoden auswählen', 'episode-home', 'button secondary')}${button('Erneute Empfehlung ansehen', 'event-back', 'button secondary')}${button('Neu spielen', 'restart', 'button primary')}</div></main>`;
  let body = '',
    title = '';
  if (s.screen === 'event-find') {
    title = 'Zeige den Weg, der sich verändert hat.';
    body = `<div class="event-discovery"><p class="event-story">Auf einem Fußweg im Süden wird gebaut. Leila muss einen Umweg gehen. Zum Platz braucht sie jetzt ${roadEvent.extraWalk} Minuten länger. Die Busse fahren wie bisher.</p>${r.find.complete || r.find.help === 3 ? `<p class="event-change">Fußweg Leila → Platz: <strong>${before} → ${now} Minuten</strong></p>` : ''}${map()}<fieldset class="event-paths"><legend>Wähle auf der Karte oder hier.</legend>${radio('event-path', 'leila-platz', 'Leila → Platz · Fußweg', r.path === 'leila-platz')}${radio('event-path', 'leila-sued', 'Leila → Süd · Fußweg', r.path === 'leila-sued')}${radio('event-path', 'bus', 'Die Buslinie', r.path === 'bus')}${radio('event-path', 'south-area', 'Leilas Wohnbereich', r.path === 'south-area')}</fieldset></div>`;
  } else if (s.screen === 'event-effects') {
    title = 'Für welche Buswege braucht Leila jetzt länger?';
    body = `${compare()}${
      r.compared
        ? `<section class="event-explanation" aria-labelledby="event-cause-title"><h2 id="event-cause-title">Warum bleibt Leilas Weg über Süd gleich lang?</h2><label class="select-label" for="event-connection">Wo steigt Leila für diese Linie ein?<select id="event-connection" name="event-connection"><option value="">Wähle den Einstieg</option>${Object.entries(
            connections,
          )
            .map(
              ([v, label]) =>
                `<option value="${v}" ${r.connection === v ? 'selected' : ''}>${label}</option>`,
            )
            .join(
              '',
            )}</select></label><label class="select-label" for="event-cause">Welche Ursache erklärt die gleiche Zeit?<select id="event-cause" name="event-cause"><option value="">Wähle die Ursache</option>${Object.entries(
            eventCauses,
          )
            .map(
              ([v, label]) =>
                `<option value="${v}" ${r.cause === v ? 'selected' : ''}>${label}</option>`,
            )
            .join(
              '',
            )}</select></label><details id="event-own-explanation" ${r.explanationText ? 'open' : ''}><summary>Mit eigenen Worten · freiwillig</summary><label for="event-text">Warum bleibt der Weg über Süd gleich lang? Was gilt für Amina und David?</label><textarea id="event-text" name="event-text" rows="3" maxlength="1500">${esc(r.explanationText)}</textarea><p class="small-note">Dein Text wird nicht automatisch geprüft.</p>${button('Erklärung unbewertet abgeben', 'event-submit-explanation', 'button secondary', r.explanationText.trim() ? '' : 'disabled')}</details><details id="event-deeper"><summary>Weiterdenken</summary><p>Warum bleiben Amina und David gleich schnell? Unterscheide Fußweg und Busfahrt. Was fehlt im Modell?</p></details></section>`
        : '<p class="small-note">Vergleiche zuerst die Zeiten. Danach erklärst du einen Zusammenhang.</p>'
    }<details id="event-map-details"><summary>Modellkarte und ganze Wege ansehen</summary>${map()}</details>`;
  } else {
    title = 'Ist dein Busweg jetzt noch sinnvoll?';
    const priorityPreview = {
      ...r,
      review: { ...d, weighting: d.advantage, acceptConflict: true },
    } as RoadState;
    body = `${original()}<p class="event-change">Neue Bedingung: Leilas Fußweg zum Platz dauert ${now} statt ${before} Minuten.</p><fieldset><legend>Meine erneute Empfehlung</legend><div class="three-choices">${routes.map((route) => radio('decision-route', route, routeNames[route], d.route === route)).join('')}</div></fieldset><label class="select-label" for="revision-criterion">Mein Ziel oder Kriterium<select id="revision-criterion" name="criterion"><option value="">Ziel auswählen</option>${Object.entries(
      shortGoals,
    )
      .map(
        ([v, label]) =>
          `<option value="${v}" ${d.criterion === v ? 'selected' : ''}>${label}</option>`,
      )
      .join(
        '',
      )}</select></label><section class="chosen-evidence" aria-label="Deine Belege mit den jetzigen Zeiten"><p><strong>Jetzt · Vorteil:</strong> ${d.advantage ? evidenceLabel(d.advantage, 'now') : 'noch wählen'}</p><p><strong>Jetzt · Nachteil:</strong> ${d.disadvantage ? evidenceLabel(d.disadvantage, 'now') : 'noch wählen'}</p></section><details id="revision-facts" ${!d.advantage || !d.disadvantage ? 'open' : ''}><summary>Vorteil oder Nachteil ändern</summary>${h.evidenceInput(d, 'advantage', 'now')}${h.evidenceInput(d, 'disadvantage', 'now')}</details><fieldset class="change-evidence"><legend>Das hat sich für meinen Vorschlag verändert.</legend>${routes.map((route) => radio('event-change-evidence', route, changeLabel(route), r.changeEvidence === route)).join('')}</fieldset>${goalMessage(d, 'now') ? `<p class="goal-note">${esc(goalMessage(d, 'now'))}</p>` : ''}${goalStatus(d, 'now')?.conflict ? button('Ich möchte mein Ziel ändern', 'focus-review-goal', 'button secondary') : ''}<fieldset class="revision-priority"><legend>Deshalb bleibe ich dabei oder wechsle.</legend>${revisionReason(r, 'goal') ? radio('event-reason', 'goal', esc(revisionReason(r, 'goal')), r.reason === 'goal') : ''}${revisionReason(priorityPreview, 'priority') ? radio('event-reason', 'priority', esc(revisionReason(priorityPreview, 'priority')), r.reason === 'priority') : ''}${!revisionReason(r, 'goal') && !revisionReason(priorityPreview, 'priority') ? '<p>Wähle einen zutreffenden Vorteil und dein Ziel. Dann kannst du deine Gewichtung festhalten.</p>' : ''}</fieldset>${h.ownWords()}`;
  }
  return `${h.header}<main id="main" class="game-screen event-screen" tabindex="-1"><div class="episode-heading"><div><p class="eyebrow">Eine Woche später · erfundene Situation</p><h1 id="task-title" tabindex="-1">${title}</h1></div>${button('Wörter erklären', 'words', 'button quiet', `id="words-toggle" aria-expanded="${s.words}" aria-controls="word-help"`)}</div>${s.words ? `<aside id="word-help" class="word-help"><h2>Wörter für die neue Situation</h2><dl><div><dt>Umweg</dt><dd>Ein anderer, längerer Weg zum selben Ziel.</dd></div><div><dt>Gesamtzeit</dt><dd>Fußweg und Busfahrt zusammen.</dd></div><div><dt>Beleg</dt><dd>Hier: Zeiten vergleichen, um einen Gedanken zu stützen.</dd></div></dl>${button('Wörter schließen', 'words', 'text-button')}</aside>` : ''}<section class="task-panel event-task" aria-labelledby="task-title"><p class="task-step">${s.screen === 'event-find' ? 'Neue Situation · 1 von 2' : s.screen === 'event-effects' ? 'Folgen untersuchen · 2 von 2' : 'Deine Empfehlung überprüfen'}</p>${body}${h.feedback(p.feedback)}${h.help()}<div class="task-actions">${button(s.screen === 'event-find' ? 'Weg prüfen' : s.screen === 'event-effects' ? (r.compared ? 'Erklärung prüfen' : 'Vergleich prüfen') : 'Erneute Empfehlung prüfen', 'check', 'button primary', 'id="check-answer"')}${p.complete ? button(s.screen === 'event-find' ? 'Folgen untersuchen →' : s.screen === 'event-effects' ? 'Empfehlung überprüfen →' : 'Zum neuen Abschluss →', 'event-next', 'button primary', 'id="next-step"') : ''}${p.help === 0 ? button('Ich brauche einen Hinweis', 'help', 'text-button', 'data-value="1"') : ''}</div><div class="task-navigation">${button('← Zurück', 'event-back', 'text-button')}${button('Schritt neu bearbeiten', 'event-reset', 'text-button')}</div></section><footer class="game-footer">${button('Episoden auswählen', 'episode-home', 'text-button')}<span>${episode.modelNote}</span>${button('Neu starten', 'ask-restart', 'text-button')}${h.restartPending ? `<span class="restart-confirm">Alle Antworten löschen? ${button('Ja, neu starten', 'restart', 'text-button')} ${button('Abbrechen', 'cancel-restart', 'text-button')}</span>` : ''}</footer></main>`;
}
