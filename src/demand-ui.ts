import {
  demandEpisode as model,
  demandGoals,
  measures,
  measureNames,
} from './demand-content.ts';
import type { Measure } from './demand-content.ts';
import {
  demandScenario,
  demandConflict,
  demandExample,
  demandFactLabels,
  demandPriority,
  demandProduct,
  measureGoal,
} from './demand.ts';
import type { DemandState } from './demand.ts';
import { routeNames, routes } from './content.ts';
import { demandProgress } from './state.ts';
import type { State } from './state.ts';
import type { Feedback } from './feedback.ts';
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
}
export function demandHint(s: State, level = demandProgress(s).help) {
  const d = s.demand!,
    n = demandScenario(),
    trial = demandScenario(d.measure);
  if (s.screen === 'demand-check')
    return level === 1
      ? 'Vergleiche die Menschen mit den Busplätzen. Jede Person fährt einmal.'
      : level === 2
        ? `${model.trips} Fahrten mit je ${model.seatsPerTrip} Plätzen: Das sind ${n.capacity} Plätze. Vergleiche sie mit ${n.people} Personen.`
        : `${n.people} Menschen möchten fahren. ${n.capacity} können in dieser Stunde mitfahren. ${n.people} − ${n.capacity} = ${n.later}: Diese Personen müssen später fahren. Wähle deine Ausgangslinie selbst. Dann kannst du das Beispiel übernehmen.`;
  if (s.screen === 'demand-explore')
    return d.measure === 'base'
      ? 'Wähle zuerst selbst eine Maßnahme. Dann kannst du ihre Wirkung prüfen.'
      : level === 1
        ? 'Sieh dir die Plätze in den Bussen und den Fußweg auf der Karte an.'
        : level === 2
          ? 'Vergleiche zwei Größen getrennt: Wie viele Plätze gibt es? Wie lange dauert der Fußweg?'
          : `${measureNames[d.measure]}: ${trial.trips} × ${model.seatsPerTrip} = ${trial.capacity} Plätze. Der Fußweg dauert ${trial.walk} Minuten. ${trial.later ? `${trial.later} Personen müssen weiter später fahren.` : `Alle ${trial.people} Personen finden einen Platz in dieser Stunde.`} Übernehmen gilt nur für diese Maßnahme. Probiere danach auch die andere.`;
  const example = demandExample(d.decision);
  return level === 1
    ? 'Was ist dir wichtiger: genug Plätze oder ein kurzer Fußweg? Beachte auch, welches Problem bleibt.'
    : level === 2
      ? 'Wähle einen Vorteil, den deine Maßnahme wirklich bewirkt. Nenne auch, was sie nicht verbessert.'
      : example
        ? `Beispiel zu deiner Auswahl: ${demandProduct(example)} Du übernimmst auch diese Gewichtung. Dein eigener Text bleibt ungeprüft.`
        : 'Wähle zuerst selbst einen Vorschlag und dein Ziel. Dann zeigen wir ein passendes Beispiel.';
}
function renderDemandMap(d: DemandState, active: boolean) {
  const v = demandScenario(d.measure),
    shortcut = d.measure === 'path';
  const pathLabel = shortcut
    ? `${v.walk} Min. · neuer Weg`
    : 'Neue Verbindung?';
  const busLabel = `${v.trips} Fahrten / Std.`;
  const line =
    d.route === 'north'
      ? 'M390 150L510 60L660 150'
      : d.route === 'south'
        ? 'M390 150L510 250L660 150'
        : 'M390 150L660 150';
  const click = (measure: Measure) =>
    active
      ? `role="button" tabindex="0" data-action="demand-measure" data-value="${measure}" aria-label="${measure === 'bus' ? `${busLabel} Zusätzliche Fahrt testen` : `${pathLabel} Kürzere Verbindung testen`}" aria-pressed="${d.measure === measure}"`
      : '';
  return `<svg class="demand-map" viewBox="0 0 760 330" role="${active ? 'group' : 'img'}" aria-labelledby="demand-map-title demand-map-desc"><title id="demand-map-title">Der neue Wohnbereich und die Haltestelle Platz</title><desc id="demand-map-desc">Erfundener Ausschnitt im bekannten Viertel. Acht neue Nachbarn gehen zum Platz. ${shortcut ? 'Die neue Verbindung' : 'Der bisherige Fußweg'} dauert ${v.walk} Minuten. Von dort fährt ${d.route ? routeNames[d.route] : 'die gewählte Linie'} ins Zentrum.</desc><rect x="10" y="10" width="740" height="310" rx="25" fill="#edf0e3"/>
  <path d="M90 160L150 270L300 270L390 150" fill="none" stroke="${shortcut ? '#99a392' : '#45654f'}" stroke-width="6" stroke-dasharray="9 9"/>
  <g class="demand-map-target" id="demand-map-path" ${click('path')}><path d="M90 160L390 150" stroke="transparent" stroke-width="72"/><path d="M90 160L390 150" fill="none" stroke="${shortcut ? '#45654f' : '#a6aea0'}" stroke-width="${shortcut ? '7' : '3'}" stroke-dasharray="${shortcut ? '9 7' : '4 9'}"/><text x="240" y="125" text-anchor="middle">${pathLabel}</text></g>
  <path d="${line}" fill="none" stroke="#a44d2e" stroke-width="9"/>
  ${d.route && d.route !== 'direct' ? `<circle cx="510" cy="${d.route === 'north' ? '60' : '250'}" r="9" fill="#fffef8" stroke="#a44d2e" stroke-width="4"/><text x="510" y="${d.route === 'north' ? '40' : '285'}" text-anchor="middle">${d.route === 'north' ? 'Nord' : 'Süd'}</text>` : ''}
  <g transform="translate(50 142)"><path d="M0 0L28 -25L56 0V42H0Z" fill="#e4c36c" stroke="#68592c" stroke-width="2"/><path d="M17 42V16H37V42" fill="#f7f6ee"/></g><text x="125" y="45" text-anchor="middle">Neuer Wohnbereich</text><text x="125" y="75" text-anchor="middle">${model.newcomers} weitere Personen</text>
  <circle cx="390" cy="150" r="14" fill="#fffef8" stroke="#a44d2e" stroke-width="5"/><text x="390" y="190" text-anchor="middle">Haltestelle Platz</text><circle cx="660" cy="150" r="14" fill="#fffef8" stroke="#a44d2e" stroke-width="5"/><text x="660" y="190" text-anchor="middle">Zentrum</text>
  <g class="demand-map-target" id="demand-map-bus" ${click('bus')}><rect x="568" y="202" width="115" height="43" rx="9" fill="#244f40"/><rect x="580" y="210" width="83" height="15" rx="3" fill="#edf0e3"/><circle cx="590" cy="248" r="7" fill="#253e34"/><circle cx="657" cy="248" r="7" fill="#253e34"/><text x="625" y="310" text-anchor="middle">${busLabel}</text></g>
  <text x="220" y="310" text-anchor="middle">${shortcut ? 'Alter Weg: ' + model.walk + ' Min.' : 'Bisher: ' + v.walk + ' Min.'}</text></svg>`;
}
function quantities(d: DemandState, first: boolean) {
  const v = demandScenario(first ? 'base' : d.measure, first ? d.view : 'now');
  return `<section class="demand-quantities" aria-label="Menschen und Beförderungsplätze"><div class="demand-people"><p id="demand-people-count"><strong>${v.people} Personen</strong> möchten in dieser Stunde fahren.</p><div class="people-symbols" aria-hidden="true">${Array.from({ length: v.people }, (_, i) => `<i class="demand-person ${i >= model.previousPeople ? 'new-person' : ''}"></i>`).join('')}</div><p class="small-note">Ein Symbol = eine Person. ${first && d.view === 'before' ? 'Vor dem Zuzug.' : `${model.newcomers} neue Nachbarn sind gelb markiert.`}</p></div><div class="demand-buses"><p id="demand-capacity-count"><strong>${v.capacity} Plätze</strong> in dieser Stunde.</p><div class="bus-symbols" aria-hidden="true">${Array.from({ length: v.trips }, (_, i) => `<div class="bus-card"><span>Fahrt ${i + 1}</span><div>${Array.from({ length: model.seatsPerTrip }, () => '<i class="seat"></i>').join('')}</div></div>`).join('')}</div><p class="small-note">${v.trips} Fahrten × ${model.seatsPerTrip} Plätze.</p></div></section>`;
}
export function renderDemand(s: State, h: UI) {
  const d = s.demand!,
    p = demandProgress(s),
    answer = d.decision;
  const { button, radio, esc } = h;
  const step =
    s.screen === 'demand-check' ? 1 : s.screen === 'demand-explore' ? 2 : 3;
  const facts = demandFactLabels();
  const summary = (measure: 'base' | Measure) => {
    const v = demandScenario(measure);
    return `<div class="demand-current-facts" role="group" aria-label="Zahlen für deinen Vorschlag"><span><strong>${v.people}</strong> Personen</span><span><strong>${v.capacity}</strong> Plätze / Stunde</span><span><strong>${v.walk}</strong> Min. Fußweg</span></div>`;
  };
  const help = () =>
    p.help
      ? `<aside class="help-panel" aria-labelledby="help-title"><h3 id="help-title" tabindex="-1">→ Hilfe ${p.help} von 3</h3><p>${esc(demandHint(s))}</p>${p.help < 3 ? button(p.help === 1 ? 'Genauer zeigen' : 'Erklärung ansehen', 'help', 'text-button', `data-value="${p.help + 1}"`) : button('Dieses Beispiel übernehmen', 'use-example', 'button secondary', `id="demand-example" ${(step === 1 ? !d.route : step === 2 ? d.measure === 'base' : !answer.measure || !answer.goal) ? 'disabled' : ''}`)}</aside>`
      : '';
  const history = () =>
    `<details class="demand-model"><summary>Das Modell und deine Ausgangslinie</summary><p>Ausgangslinie: ${d.route ? routeNames[d.route] : 'noch wählen'}. ${d.basis === 'chosen' ? 'Für diese Episode ausgewählt. Das ist keine frühere Empfehlung.' : d.basis === 'revision' ? 'Aus deiner gespeicherten erneuten Empfehlung übernommen.' : 'Aus deiner gespeicherten ersten Empfehlung übernommen.'}</p><p>Die Baustelle aus Episode 1 ist beendet. Die dort verlängerten Fußwege sind wieder wie vorher. Hier untersuchst du einen neuen Wohnbereich.</p><p>Erfundenes Viertel im Kontext Nairobis. Alle Zahlen sind Modellwerte. Jede Person fährt einmal. Gezählt werden nur die Personen am Platz in einer bestimmten Stunde. Andere Fahrgäste und Haltestellen fehlen. Wartezeit, Fahrpreis, Kosten und Umweltfolgen werden nicht berechnet. Hier steigt die Einwohnerzahl durch Zuzug. Geburten werden nicht untersucht. Keine allgemeine Aussage über Nairobi oder Kenia.</p></details>`;
  const footer = () =>
    `<footer class="game-footer">${button('Episoden auswählen', 'episode-home', 'text-button')}${button('Neu starten', 'ask-restart', 'text-button')}${h.restartPending ? `<span class="restart-confirm">Alle Antworten der sechs Episoden löschen? ${button('Ja, neu starten', 'restart', 'text-button')} ${button('Abbrechen', 'cancel-restart', 'text-button')}</span>` : ''}</footer>`;
  if (s.screen === 'demand-end')
    return `${h.header}<main id="main" class="end-screen demand-screen" tabindex="-1"><p class="eyebrow">Episode 2 · Dein Vorschlag</p><h1>Was ist dir wichtiger?</h1><section class="recommendation" aria-label="Dein Lernprodukt aus Episode 2"><h2>${answer.measure ? measureNames[answer.measure] : 'Dein Vorschlag'}</h2>${summary(answer.measure || 'base')}<p><strong>Mein Ziel:</strong> ${answer.goal ? demandGoals[answer.goal] : 'noch offen'}</p>${answer.ungraded ? '<p data-ungraded>Eigener Text bewusst unbewertet abgegeben. Die Bausteine sind damit nicht bestätigt.</p>' : `<p class="demand-product">${esc(demandProduct(answer))}</p><p>Du hast deine Empfehlung mit Bausteinen begründet.</p>`}${answer.text ? `<p class="saved-text">${esc(answer.text)}</p><p class="small-note">Eigener Text: nicht automatisch geprüft.</p>` : ''}${answer.supported ? '<p data-supported>Diese Empfehlung wurde mit einem Beispiel erstellt.</p>' : ''}${d.check.supported || d.explore.supported || d.decide.supported ? '<p class="small-note" data-demand-help-history>Du hast in dieser Episode erklärte Beispiele übernommen.</p>' : ''}<p>Zeige deinen Vorschlag. Erkläre: Welches Problem bleibt bestehen?</p></section><details id="demand-deeper"><summary>Weiterdenken · freiwillig</summary><p>Welche Information fehlt für eine echte Verkehrsplanung? Denke an Fahrplan, Kosten oder weitere Fahrgäste. Können mehr Nachbarn auch neue Ideen, Geschäfte oder Begegnungen ins Viertel bringen?</p></details>${history()}<div class="end-actions">${button('Empfehlung bearbeiten', 'demand-back', 'button secondary')}</div>${footer()}</main>`;
  let title: string, instruction: string, body: string;
  if (step === 1) {
    title = 'Reichen die Busplätze für alle?';
    instruction = `Neue Wohnungen sind bezogen. ${model.newcomers} weitere Personen möchten mitfahren.`;
    body = `<p class="small-note">Nachfrage heißt hier: Wie viele Menschen möchten mitfahren?</p><div class="event-views" role="group" aria-label="Nachfrage vorher und jetzt">${(['before', 'now'] as const).map((v) => button(v === 'before' ? `Vorher: ${model.previousPeople}` : `Jetzt: ${demandScenario().people}`, 'demand-view', `route-button ${d.view === v ? 'selected' : ''}`, `id="demand-view-${v}" data-value="${v}" aria-pressed="${d.view === v}"`)).join('')}</div>${quantities(d, true)}<fieldset><legend>Reichen die Plätze jetzt?</legend><div class="person-choices">${radio('demand-enough', 'yes', 'Ja', d.enough === 'yes')}${radio('demand-enough', 'no', 'Nein', d.enough === 'no')}</div></fieldset><fieldset><legend>Wie viele müssen später fahren?</legend><div class="three-choices">${[0, demandScenario().later, model.newcomers].map((n) => radio('demand-later', String(n), String(n) + ' Personen', d.later === n)).join('')}</div></fieldset>`;
  } else if (step === 2) {
    title = 'Was verändert deine Maßnahme?';
    instruction =
      'Probiere beide Ideen. Es gibt Mittel für genau eine Maßnahme.';
    const trial = d.measure === 'base' ? undefined : d.trials[d.measure];
    body = `<div class="demand-measures" role="group" aria-label="Maßnahmen ausprobieren">${measures.map((m) => button(m === 'bus' ? 'Busfahrt testen' : 'Fußweg testen', 'demand-measure', `route-button ${d.measure === m ? 'selected' : ''}`, `id="demand-try-${m}" data-value="${m}" aria-pressed="${d.measure === m}"`)).join('')}${button('Ohne Maßnahme', 'demand-measure', 'text-button', 'data-value="base" id="demand-try-base"')}</div><p class="small-note">Infrastruktur: zum Beispiel Busverbindungen und Wege.</p>${d.measure !== 'base' ? `${summary(d.measure)}<h3>${measureNames[d.measure]}</h3><fieldset><legend>Busplätze: Was ändert sich?</legend><div class="person-choices">${radio('demand-capacity', 'more', 'Mehr Plätze', trial?.capacity === 'more')}${radio('demand-capacity', 'same', 'Gleich viele', trial?.capacity === 'same')}</div></fieldset><fieldset><legend>Fußweg: Was ändert sich?</legend><div class="person-choices">${radio('demand-walk', 'shorter', 'Kürzer', trial?.walk === 'shorter')}${radio('demand-walk', 'same', 'Gleich lang', trial?.walk === 'same')}</div></fieldset>` : '<p>Teste eine Idee auf der Karte oder mit den Tasten oben.</p>'}<ul class="explored-routes">${measures.map((m) => `<li>${d.trials[m]?.checked ? '✓ Untersucht' : 'Noch untersuchen'}: ${measureNames[m]}</li>`).join('')}</ul><p class="small-note">Erreichbarkeit: Wie gut du ein Ziel erreichst. Hier: der Fußweg zum Platz.</p>`;
  } else {
    title = 'Welchen Vorschlag empfiehlst du?';
    instruction =
      'Wähle selbst. Verbinde dein Ziel mit einem Vorteil und einem Nachteil.';
    const priority = answer.measure
      ? demandPriority({ ...answer, weighting: measureGoal(answer.measure) })
      : '';
    body = `<fieldset><legend>Mein Vorschlag</legend><div class="person-choices">${measures.map((m) => radio('demand-proposal', m, measureNames[m], answer.measure === m)).join('')}</div></fieldset>${answer.measure ? summary(answer.measure) : ''}<fieldset><legend>Mein Ziel</legend><div class="choice-stack">${Object.entries(
      demandGoals,
    )
      .map(([v, label]) => radio('demand-goal', v, label, answer.goal === v))
      .join('')}</div></fieldset>${
      answer.measure && answer.goal
        ? `<fieldset><legend>Welcher Vorteil stützt meinen Vorschlag?</legend><div class="choice-stack">${Object.entries(
            facts.advantage,
          )
            .map(([v, label]) =>
              radio('demand-advantage', v, label, answer.advantage === v),
            )
            .join(
              '',
            )}</div></fieldset><fieldset><legend>Welcher Nachteil bleibt bei meinem Vorschlag?</legend><div class="choice-stack">${Object.entries(
            facts.disadvantage,
          )
            .map(([v, label]) =>
              radio('demand-disadvantage', v, label, answer.disadvantage === v),
            )
            .join(
              '',
            )}</div></fieldset>${demandConflict(answer) ? `<section class="goal-note" aria-label="Ziel und Vorschlag verbinden"><p>Dein Vorschlag löst ein anderes Problem als dein Ziel. Was ist dir wichtiger?</p>${button('Ich passe mein Ziel an den Vorschlag an', 'demand-goal', 'button secondary', `id="demand-adjust-goal" data-value="${measureGoal(answer.measure)}"`)}${radio('demand-weighting', measureGoal(answer.measure), esc(priority), Boolean(demandPriority(answer)))}</section>` : ''}`
        : '<p class="small-note">Wähle zuerst deinen Vorschlag und dein Ziel. Dann begründest du deine Entscheidung.</p>'
    }<details id="demand-own-words" ${answer.text ? 'open' : ''}><summary>Mit eigenen Worten · freiwillig</summary><label for="demand-text">Ich empfehle das, weil … Ein Nachteil bleibt …</label><textarea id="demand-text" name="demand-text" rows="3" maxlength="1500">${esc(answer.text)}</textarea><p class="small-note">Das Spiel bewertet deinen Text nicht.</p>${button('Eigenen Text unbewertet abgeben', 'submit-ungraded', 'button secondary', answer.text.trim() && answer.measure && answer.goal ? '' : 'disabled')}</details>`;
  }
  const world = () => {
    const map = renderDemandMap(
      step === 1 ? { ...d, measure: 'base' } : d,
      step === 2,
    );
    const setup = `<fieldset><legend>Ausgangslinie für diese Episode</legend><div class="three-choices">${routes.map((r) => radio('demand-route', r, routeNames[r], d.route === r)).join('')}</div></fieldset><p class="small-note">${d.basis === 'chosen' ? 'Wähle selbst. Das ist noch keine Empfehlung.' : 'Aus deiner gespeicherten Empfehlung übernommen.'}</p>`;
    return `<div class="demand-world"><p class="small-note">Erfundene Modellwerte · eine Stunde · jede Person fährt einmal.</p>${step === 1 ? setup : map}${step === 1 ? '' : quantities(d, false)}${step === 1 ? `<details id="demand-spatial-context"><summary>Den neuen Wohnbereich auf der Karte ansehen</summary>${map}</details>` : ''}</div>`;
  };
  return `${h.header}<main id="main" class="game-screen demand-screen" tabindex="-1"><div class="episode-heading"><div><p class="eyebrow">Episode 2 · ${step} von 3</p><h1>${model.title}</h1></div>${button('Wörter erklären', 'words', 'button quiet', `id="words-toggle" aria-expanded="${s.words}" aria-controls="word-help"`)}</div>${step === 1 ? '<p class="small-note demand-transition">Neue Situation: Die frühere Baustelle ist beendet. Wir untersuchen einen neuen Wohnbereich.</p>' : ''}${s.words ? `<aside id="word-help" class="word-help"><h2>Wörter für diesen Schritt</h2><dl>${step === 1 ? '<div><dt>Zuzug</dt><dd>Menschen ziehen neu in ein Gebiet. Das ist etwas anderes als eine Geburt.</dd></div><div><dt>Nachfrage</dt><dd>Hier: Wie viele Menschen mit dem Bus fahren möchten.</dd></div>' : '<div><dt>Infrastruktur</dt><dd>Zum Beispiel Busverbindungen und Wege, die Menschen nutzen.</dd></div><div><dt>Erreichbarkeit</dt><dd>Wie gut du ein Ziel erreichst. Hier: der Fußweg zum Platz.</dd></div>'}</dl>${button('Wörter schließen', 'words', 'text-button')}</aside>` : ''}<div class="demand-workspace ${step === 3 ? 'demand-decision-layout' : ''}">${step < 3 ? world() : ''}<section class="task-panel demand-task" aria-labelledby="task-title"><h2 id="task-title" tabindex="-1">${title}</h2><p class="instruction">${instruction}</p>${step === 1 ? '<p class="small-note">Zuzug: Menschen ziehen neu ins Viertel. Neue Nachbarn können auch neue Ideen und Begegnungen mitbringen.</p>' : ''}${body}${h.feedback(p.feedback)}${help()}<div class="task-actions">${button(step === 3 ? 'Empfehlung prüfen' : 'Vergleich prüfen', 'check', 'button primary', 'id="check-answer"')}${p.complete ? button(step === 3 ? 'Zum Abschluss →' : 'Weiter →', 'demand-next', 'button primary', 'id="next-step"') : ''}${p.help === 0 ? button('Ich brauche einen Hinweis', 'help', 'text-button', 'data-value="1"') : ''}</div><div class="task-navigation">${button('← Zurück', 'demand-back', 'text-button')}${button('Schritt neu bearbeiten', 'demand-reset', 'text-button')}</div></section></div>${history()}${footer()}</main>`;
}
