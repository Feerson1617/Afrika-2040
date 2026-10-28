import { renderLearning } from './learning/chapter-ui.ts';
import {
  active as activeLearning,
  type LearningAction,
} from './learning/storage.ts';
import { recommendation, consumedRecommendation } from './learning/entry.ts';
import { resetNotice } from './reset.ts';
import { renderInquiry } from './inquiry/ui.ts';
import { productStatus, type InquiryAction } from './inquiry/state.ts';
import { renderReview } from './geography/review-ui.ts';
import { transferHint } from './geography/transfer.ts';
import { renderContext } from './geography/context.ts';
import { renderOrientation } from './geography/ui.ts';
import { geoHint, type GeoAction } from './geography/state.ts';
import { renderStudy, studyMenu, studyHint } from './regions/ui.ts';
import { studies } from './regions/registry.ts';
import type { StudyAction, StudyId } from './regions/types.ts';
import { renderDemand, demandHint } from './demand-ui.ts';
import { renderEvent } from './event-ui.ts';
import { changeLabel, eventExplanation, eventSituation } from './event.ts';
import {
  decisionPanels,
  goalMessage,
  goalStatus,
  hasWeighting,
  weightingChoice,
  weightingProduct,
} from './decision.ts';
import './style.css';
import {
  episode,
  glossary,
  personNames,
  routeNames,
  tasks,
  criteria,
  lineStops,
  stopNames,
  visibleRoutes,
  visiblePersons,
} from './content.ts';
import type { Person, Route, Situation } from './content.ts';
import {
  evidenceFits,
  evidenceLabel,
  evidenceParts,
  differentPeople,
  explanationChoices,
  journey,
  journeyParts,
} from './model.ts';
import {
  currentDecision,
  currentProgress,
  initialState,
  reduce,
  selectedPerson,
} from './state.ts';
import type { Action } from './state.ts';
import type { Decision, Feedback } from './feedback.ts';
import { explainDecision, explainTask } from './feedback.ts';
import { renderMap } from './map.ts';
import { clearSession, readSession, saveSession } from './storage.ts';

const app = document.querySelector<HTMLDivElement>('#app')!;
const announcer = document.querySelector<HTMLDivElement>('#announcer')!;
let storage: Storage | undefined;
try {
  storage = window.sessionStorage;
} catch {
  /* In-memory play remains available. */
}
let state = readSession(storage);
let restartPending = false;
const storageWarning = document.createElement('aside');
storageWarning.id = 'storage-warning';
storageWarning.className = 'storage-warning';
storageWarning.setAttribute('role', 'status');
storageWarning.setAttribute('aria-live', 'polite');
storageWarning.setAttribute('aria-atomic', 'true');
storageWarning.hidden = true;
app.before(storageWarning);
function updateStorageWarning(storageFailed: boolean) {
  const warning = storageFailed
    ? 'Speichern ist gerade nicht möglich. Beim Neuladen können deine Antworten verloren gehen.'
    : '';
  if (storageWarning.textContent !== warning)
    storageWarning.textContent = warning;
  storageWarning.hidden = !storageFailed;
}
function persistState() {
  const saved = saveSession(state, storage);
  updateStorageWarning(!saved);
  return saved;
}
function consumeEntry() {
  history.replaceState(
    history.state,
    '',
    consumedRecommendation(location.href),
  );
}
function openRecommendation() {
  const entry = recommendation(location.search);
  if (!entry) return;
  state = reduce(state, {
    type: 'learning',
    op: 'recommend',
    value: entry.profile,
    field: entry.unit,
  });
  persistState();
  if (!state.learning?.pendingProfile) consumeEntry();
}
openRecommendation();
function syncStoredState() {
  if (!storage) return;
  try {
    storage.getItem('afrika-2040:kenia-bus:v2a');
    state = readSession(storage);
  } catch {
    // A blocked store must not discard the current in-memory work on history navigation.
  }
}
window.addEventListener('popstate', () => {
  // Hash-only navigation (including the keyboard skip link) belongs to the
  // browser. Replacing its DOM here would destroy the newly focused target.
  if (!recommendation(location.search) && !state.learning?.pendingUnit) return;
  syncStoredState();
  openRecommendation();
  render('main', true);
});
window.addEventListener('pageshow', (event) => {
  if (!event.persisted) return;
  syncStoredState();
  openRecommendation();
  render('main', true);
});

const esc = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
const button = (text: string, action: string, cls = 'button', extra = '') =>
  `<button type="button" class="${cls}" data-action="${action}" ${extra}>${text}</button>`;
const arrow = `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M5 19L19 5M6 5H19V18" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`;
const mark = `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 24V9a3 3 0 013-3h12M10 25h15V10" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="7" cy="25" r="4" fill="currentColor"/><circle cx="25" cy="7" r="4" fill="currentColor"/></svg>`;

function header() {
  return `<header class="site-header"><div class="brand"><span class="brand-mark">${mark}</span><span>AFRIKA <strong>2040</strong></span></div><span class="header-caption">${state.screen === 'learning' ? (state.learning?.unit === 's1' ? 'Kenia / Nairobi' : state.learning?.unit === 'c' ? 'Bevölkerung untersuchen' : 'Fünf Kapitel') : state.screen === 'inquiry' ? 'Afrika untersuchen' : state.screen === 'study' && state.activeStudy ? `${studies[state.activeStudy]!.country} / ${studies[state.activeStudy]!.place}` : state.screen === 'review' ? 'Drei Orte im Vergleich' : state.screen === 'start' ? 'Gestalte die Zukunft' : 'Kenia <span aria-hidden="true">/</span> Nairobi'}</span></header>`;
}

function start() {
  return `${header()}<main id="main" class="start-screen" tabindex="-1">
    <div class="hero-copy"><p class="eyebrow"><span class="tiny-dot"></span> Entdecken. Abwägen. Mitgestalten.</p>
      <h1>Afrika 2040 <span>Gestalte die<br>Zukunft.</span></h1>
      <p class="intro">Du untersuchst Orte in Afrika. Menschen vor Ort haben Ideen für ihre Zukunft. Prüfe die Vorschläge. Entscheide, was du empfehlen würdest.</p>
      <a class="text-button" href="#episodes-menu">Direkt zu den Episoden</a>
      ${button('Fünf Kapitel · Lernweg wählen', 'learning', 'button primary', 'data-op="open" id="learning-open"')}
      ${button('Afrika untersuchen · fünf Themen', 'inquiry', 'button primary', 'data-op="open" id="inquiry-open"')}
    </div>
    ${renderOrientation(state.geography, { header: '', restartPending, button, radio, esc, feedback })}
    <div class="episode-list" id="episodes-menu" tabindex="-1">
      ${button(`${state.step > 0 ? 'Episode 1 fortsetzen' : 'Spiel starten'} ${arrow}`, 'start', 'button primary start-button')}${state.progress[5].complete || state.road?.revision.complete ? button('Bisherige Empfehlungen ansehen', 'episode-report', 'button secondary') : ''}
      <section class="episode-picker kenya-picker" aria-label="Kenia"><h2>Kenia · Nairobi</h2><p>Episode 1: Welcher Busweg hilft wem?</p>${button(state.demand ? 'Episode 2 fortsetzen' : 'Episode 2 starten', 'demand-start', 'button secondary')}<p class="small-note">Mehr Menschen – reicht der Bus noch? Direkt spielbar. Frühere Antworten bleiben erhalten.</p></section>
      <section class="episode-picker study-picker" aria-label="Ghana und Marokko">${studyMenu({ button })}</section>
      ${button('Drei Orte – Rückblick', 'geography', 'button secondary', 'data-op="review" id="review-open"')}
      <p class="start-location">Sechs Episoden. Alle direkt spielbar. Antworten bleiben nur in diesem Browser-Tab.</p>
    </div>

    <p class="privacy-note">Ohne Anmeldung. Deine Antworten bleiben in diesem Browser-Tab.</p>
  </main>`;
}

function feedback(f?: Feedback) {
  return f
    ? `<div class="feedback ${f.kind}" data-feedback><h3 id="feedback-title" tabindex="-1">${esc(f.title)}</h3><p>${esc(f.text)}</p></div>`
    : '';
}

function radio(
  group: string,
  value: string,
  label: string,
  checked: boolean,
  disabled = false,
) {
  return `<label class="choice ${checked ? 'is-selected' : ''}" for="${group}-${value}"><input id="${group}-${value}" name="${group}" type="radio" value="${value}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}><span>${label}</span></label>`;
}

function closedInput() {
  const p = state.progress[state.step];
  if (p.supported && p.help === 3) return '';
  if (state.step === 0)
    return `<fieldset><legend>1. Aminas Fußweg</legend><div class="choice-stack">
    ${radio('foot', 'platz', `Zum Platz <small>${episode.times.walk.amina.platz} Minuten zu Fuß</small>`, p.foot === 'platz', p.complete)}
    ${radio('foot', 'nord', `Nach Nord <small>${episode.times.walk.amina.nord} Minuten zu Fuß</small>`, p.foot === 'nord', p.complete)}</div></fieldset>
    <fieldset><legend>2. Aminas Busfahrt</legend><div class="choice-stack">
    ${radio('bus', 'direct', `Platz → Zentrum <small>${episode.times.bus.direct} Minuten im Bus</small>`, p.bus === 'direct', p.complete)}
    ${radio('bus', 'north', `Nord → Zentrum <small>${episode.times.bus.nordZentrum} Minuten im Bus</small>`, p.bus === 'north', p.complete)}</div></fieldset>`;
  return `<fieldset><legend>Wähle eine Person.</legend><div class="person-choices">${radio('person', 'amina', 'Amina', p.person === 'amina', p.complete)}${radio('person', 'david', 'David', p.person === 'david', p.complete)}</div></fieldset>`;
}

function routeSwitch() {
  const locked =
    state.step === 4 &&
    !state.progress[4].prediction &&
    !state.progress[4].supported;
  return `<div class="route-switch" role="group" aria-label="Busweg auf der Karte"><span>Busweg ansehen</span><div>${visibleRoutes(
    state.step,
  )
    .map((r) =>
      button(
        routeNames[r],
        'route',
        `route-button ${state.route === r ? 'selected' : ''}`,
        `id="route-${r}" data-value="${r}" aria-pressed="${state.route === r}" ${locked ? 'disabled' : ''}`,
      ),
    )
    .join(
      '',
    )}</div></div>${locked ? '<p class="small-note">Wähle zuerst deine Vermutung. Danach kannst du alle drei Buswege testen.</p>' : ''}`;
}

function comparison() {
  return `<section class="comparison" aria-label="Gesamtzeiten vergleichen"><table><caption>Der ganze Weg <span>Fußweg + Busfahrt</span></caption><thead><tr><th scope="col">Person</th><th scope="col" ${state.route === 'direct' ? 'class="viewed"' : ''}>Direkt</th><th scope="col" ${state.route === 'north' ? 'class="viewed"' : ''}>Über Nord</th></tr></thead><tbody>${(
    ['amina', 'david'] as const
  )
    .map(
      (person) =>
        `<tr class="${state.highlight === person || (state.progress[state.step].help >= 2 && person === (state.step === 2 ? 'david' : 'amina')) ? 'evidence-highlight' : ''}"><th scope="row">${button(personNames[person], 'highlight', 'text-button person-evidence', `data-value="${person}" aria-label="${personNames[person]} auf der Karte zeigen"`)}</th>${(
          ['direct', 'north'] as Route[]
        )
          .map((route) => {
            const j = journey(person, route);
            return `<td class="${state.route === route ? 'viewed' : ''}"><strong>${j.total} Min.</strong><span>${j.walk} + ${j.bus}</span></td>`;
          })
          .join('')}</tr>`,
    )
    .join('')}</tbody></table></section>`;
}

function ownWords(explanation = false) {
  const text = explanation
    ? state.explanation.text
    : currentDecision(state).text;
  const id = explanation ? 'explanation-text' : 'own-text';
  return `<details id="own-words" class="own-words" ${text ? 'open' : ''}><summary>Mit eigenen Worten <span>freiwillig</span></summary><label for="${id}">${explanation ? 'Warum ist Aminas ganzer Weg über Nord kürzer?' : 'Ich schlage diesen Busweg vor, weil …'}</label><textarea id="${id}" name="${explanation ? 'explanation-text' : 'text'}" rows="4" maxlength="1500">${esc(text)}</textarea><p class="small-note">Das Spiel bewertet deinen Text nicht. ${explanation ? 'Zeige deinen Beleg auf der Karte.' : 'Die Zeitbelege stehen oben.'}</p>${!explanation ? button('Eigenen Text unbewertet abgeben', 'submit-ungraded', 'button secondary', text.trim() ? '' : 'disabled') : ''}</details>`;
}
function explanationInput() {
  const e = state.explanation;
  return `${(['cause', 'effect'] as const)
    .map(
      (type) =>
        `<label class="select-label" for="${type}">${type === 'cause' ? 'Was ändert sich am Fußweg?' : 'Was folgt für den ganzen Weg?'}<select id="${type}" name="${type}"><option value="">Satz auswählen</option>${Object.entries(
          explanationChoices[type],
        )
          .map(
            ([key, text]) =>
              `<option value="${key}" ${e[type] === key ? 'selected' : ''}>${esc(text)}</option>`,
          )
          .join(
            '',
          )}</select></label>${e[type] ? `<p class="sentence-preview">${esc((explanationChoices[type] as Record<string, string>)[e[type]!])}</p>` : ''}`,
    )
    .join('')}${ownWords(true)}`;
}
function firstIdea() {
  return `<fieldset class="first-idea"><legend>Deine erste Idee <span>freiwillig</span></legend><p class="small-note">Welchen Busweg würdest du jetzt empfehlen? Du kannst später anders entscheiden.</p><div class="person-choices">${(['direct', 'north'] as Route[]).map((r) => radio('first-route', r, routeNames[r], state.firstRoute === r)).join('')}</div></fieldset>`;
}
function explorationIntro() {
  const p = state.progress[4];
  return `<section class="leila-intro" aria-label="Leila kommt dazu"><h2>Neu: Leila wohnt im Süden.</h2><p>Sie lernt einen Beruf im Zentrum. Der neue Busweg fährt Platz → Süd → Zentrum.</p>${
    p.supported && !p.prediction
      ? '<p class="small-note">Mit Beispiel verglichen. Du kannst die Wege weiter testen.</p>'
      : p.prediction
        ? `<p id="prediction-status" tabindex="-1" class="small-note">Deine erste Vermutung für Leila: <strong>${routeNames[p.prediction]}</strong>. Sie wird nicht bewertet.</p>`
        : `<fieldset><legend>Welcher Busweg ist wohl für Leila am schnellsten? Vermute zuerst.</legend><div class="three-choices">${visibleRoutes(
            4,
          )
            .map((r) => radio('prediction', r, routeNames[r], false))
            .join('')}</div></fieldset>`
  }</section>`;
}
function journeyExplorer() {
  const person = selectedPerson(state),
    j = journey(person, state.route, eventSituation(state.screen, state.road)),
    parts = journeyParts(
      person,
      state.route,
      eventSituation(state.screen, state.road),
    );
  return `<section class="journey-explorer" aria-label="Einen ganzen Weg verfolgen"><div class="person-inspector" role="group" aria-label="Person auf der Karte"><span>Wessen Weg?</span>${visiblePersons(
    state.step,
  )
    .map((who) =>
      button(
        personNames[who],
        'highlight',
        `route-button ${person === who ? 'selected' : ''}`,
        `id="inspect-${who}" data-value="${who}" aria-pressed="${person === who}" aria-label="${personNames[who]}: ganzen Weg zeigen"`,
      ),
    )
    .join(
      '',
    )}</div><h2>${personNames[person]}: ${routeNames[state.route]}</h2><p class="route-itinerary">Buslinie: ${lineStops[state.route].map((stop) => stopNames[stop]).join(' → ')}</p><p class="journey-total"><span><strong data-time="walk">${j.walk}</strong> Min. zu Fuß bis ${stopNames[parts.board]}</span><b aria-hidden="true">+</b><span><strong data-time="bus">${j.bus}</strong> Min. im Bus</span><b aria-hidden="true">=</b><span><strong data-time="total">${j.total}</strong> Min. insgesamt</span></p><p class="small-note">Die kräftige Linie zeigt die Busfahrt dieser Person. Der Fußweg ist gestrichelt.</p></section>`;
}
function explorationInput() {
  const p = state.progress[4],
    missing = visibleRoutes(4).filter((r) => !p.explored.includes(r));
  return `<p class="field-intro">Teste Leilas ganzen Weg auf jeder Linie. Wähle dazu die Buswege unter der Karte.</p><ul class="explored-routes">${visibleRoutes(
    4,
  )
    .map(
      (r) =>
        `<li>${p.explored.includes(r) ? '✓ Angesehen' : 'Noch ansehen'}: ${routeNames[r]}</li>`,
    )
    .join('')}</ul>${
    missing.length
      ? `<p class="small-note">Für Leila noch testen: ${missing.map((r) => routeNames[r]).join(', ')}.</p>`
      : `<fieldset><legend>Welcher Busweg ist für Leila am schnellsten?</legend><div class="three-choices">${visibleRoutes(
          4,
        )
          .map((r) =>
            radio(
              'route-answer',
              r,
              routeNames[r],
              p.routeAnswer === r,
              p.complete,
            ),
          )
          .join('')}</div></fieldset>`
  }`;
}
const shortGoals = {
  school: 'Amina: kurzer Schulweg',
  market: 'David: kurzer Weg zum Markt',
  training: 'Leila: kurzer Weg zur Ausbildung',
  tradeoff: 'Verschiedene Interessen abwägen',
};
function evidenceInput(
  d: Decision,
  panel: 'advantage' | 'disadvantage',
  situation: Situation,
  next = false,
) {
  const other = d[panel]
    ? evidenceParts(d[panel]!).other
    : d[panel === 'advantage' ? 'advantageOther' : 'disadvantageOther'];
  return !d.route
    ? `<p>Wähle zuerst deine Buslinie.</p>${button('Zum Vorschlag', 'decision-panel', 'button secondary', 'data-value="plan"')}`
    : `<p class="field-intro">${panel === 'advantage' ? 'Wer braucht mit deinem Vorschlag weniger Zeit?' : 'Wer braucht mit deinem Vorschlag mehr Zeit? Wähle eine andere Person als beim Vorteil.'}</p><fieldset><legend>Mit welcher Linie vergleichst du?</legend><div class="person-choices">${visibleRoutes(
        5,
      )
        .filter((r) => r !== d.route)
        .map((r) => radio(panel + '-other', r, routeNames[r], other === r))
        .join(
          '',
        )}</div></fieldset>${other ? `<fieldset class="evidence-rows"><legend>${panel === 'advantage' ? 'Wähle den Vorteil' : 'Wähle den Nachteil'} <small>ganzer Weg in Minuten</small></legend><div class="evidence-heading"><span>Person</span><span>${routeNames[d.route]}</span><span>${routeNames[other]}</span></div>${(['amina', 'david', 'leila'] as Person[]).map((person) => radio(panel, `${person}-${d.route}-${other}`, `<span class="evidence-person">${personNames[person]}</span><strong>${journey(person, d.route!, situation).total}</strong><strong>${journey(person, other, situation).total}</strong>`, d[panel] === `${person}-${d.route}-${other}`).replace('<input ', `<input aria-label="${esc(evidenceLabel(`${person}-${d.route!}-${other}`, situation))}" `)).join('')}</fieldset>` : '<p class="small-note">Wähle eine Vergleichslinie. Dann siehst du die Zeiten direkt hier.</p>'}${next ? button(panel === 'advantage' ? 'Weiter zum Nachteil →' : 'Weiter zur Gewichtung →', 'decision-panel', 'button secondary', `data-value="${panel === 'advantage' ? 'disadvantage' : 'weigh'}"`) : ''}`;
}
function decisionInput() {
  const d = state.decision,
    panel = d.panel ?? 'plan';
  const titles = ['Vorschlag', 'Vorteil', 'Nachteil', 'Gewichtung'];
  const context = `<div class="decision-context" role="group" aria-label="Deine aktuelle Auswahl"><span>Buslinie: <strong>${d.route ? routeNames[d.route] : 'noch wählen'}</strong></span><span>Ziel: <strong>${d.criterion ? shortGoals[d.criterion] : 'noch wählen'}</strong></span></div>`;
  const nav = `<nav class="decision-tabs" aria-label="Schritte der Begründung">${decisionPanels.map((p, i) => button(`${i + 1}. ${titles[i]}`, 'decision-panel', 'text-button', `data-value="${p}" aria-current="${panel === p ? 'step' : 'false'}"`)).join('')}</nav>`;
  let body = '';
  if (panel === 'plan') {
    body = `${state.firstRoute ? `<p class="small-note">Deine erste Idee: ${routeNames[state.firstRoute]}. Du darfst anders entscheiden.</p>` : ''}<fieldset><legend>Welche Buslinie schlägst du vor?</legend><div class="three-choices">${visibleRoutes(
      5,
    )
      .map((r) => radio('decision-route', r, routeNames[r], d.route === r))
      .join(
        '',
      )}</div></fieldset><label class="select-label" for="criterion">Mein Ziel oder Kriterium<select id="criterion" name="criterion"><option value="">Ziel auswählen</option>${Object.entries(
      shortGoals,
    )
      .map(
        ([k, label]) =>
          `<option value="${k}" ${d.criterion === k ? 'selected' : ''}>${label}</option>`,
      )
      .join(
        '',
      )}</select></label>${button('Weiter zum Vorteil →', 'decision-panel', 'button secondary', 'data-value="advantage"')}`;
  } else if (panel === 'advantage' || panel === 'disadvantage') {
    body = evidenceInput(d, panel, 'before', true);
  } else {
    const conflict = goalStatus(d)?.conflict;
    body = `<div class="chosen-evidence"><p><strong>Dein Vorteil:</strong> ${d.advantage ? esc(evidenceLabel(d.advantage)) : 'noch wählen'}</p><p><strong>Dein Nachteil:</strong> ${d.disadvantage ? esc(evidenceLabel(d.disadvantage)) : 'noch wählen'}</p></div>${goalMessage(d) ? `<p class="goal-note">${esc(goalMessage(d))}</p>` : ''}${conflict || d.criterion === 'tradeoff' ? `<fieldset class="weighting"><legend>${conflict ? 'Was ist dir bei deiner Entscheidung wichtiger?' : 'Welche Folge ist dir wichtiger?'}</legend>${conflict ? button('Ich möchte mein Ziel ändern', 'decision-panel', 'button secondary', 'data-value="plan"') : ''}${weightingChoice(d) ? radio('weighting', d.advantage!, esc(weightingChoice(d)), hasWeighting(d)) : '<p class="small-note">Wähle einen zutreffenden Vorteil für eine andere Person. Dann kannst du diese Folge stärker gewichten.</p>'}${d.weighting ? button('Gewichtung noch einmal öffnen', 'clear-weighting', 'text-button') : ''}</fieldset>` : ''}${ownWords()}<details id="deeper" class="deeper"><summary>Weiterdenken</summary><p>Warum ist dir diese Folge besonders wichtig? Was müsste man für einen echten Busweg noch wissen?</p></details>`;
  }
  return `${nav}${context}<section class="decision-part" data-decision-panel="${panel}" aria-labelledby="decision-title"><h3 id="decision-title" tabindex="-1">${decisionPanels.indexOf(panel) + 1}. ${titles[decisionPanels.indexOf(panel)]}</h3>${body}</section>`;
}

function currentHint() {
  if (state.screen === 'study') return studyHint(state);
  if (state.demand && state.screen.startsWith('demand-'))
    return demandHint(state);
  const p = currentProgress(state);
  if (state.road && state.screen.startsWith('event-')) {
    const r = state.road;
    if (state.screen === 'event-find')
      return p.help === 1
        ? 'Suche Leilas Haus im Süden. Welche Verbindung ist ein Fußweg?'
        : p.help === 2
          ? 'Suche den Fußweg von Leilas Haus zum Platz. Er ist auf der Karte hervorgehoben.'
          : `Der betroffene Fußweg führt von Leilas Haus zum Platz: ${journey('leila', 'direct', 'now').walk} statt ${journey('leila', 'direct').walk} Minuten. Übernimm den markierten Fußweg bewusst, um mit Hilfe weiterzugehen.`;
    if (state.screen === 'event-effects')
      return p.help === 1
        ? 'Vergleiche vorher und jetzt für jede Linie. Zähle Fußweg und Busfahrt zusammen.'
        : p.help === 2
          ? 'Folge Leilas Weg zur Haltestelle. Welche Verbindung braucht sie für die Linie über Süd?'
          : `${['direct', 'north', 'south'].map((route) => changeLabel(route as Route)).join(' ')} ${eventExplanation()}`;
    return p.help === 1
      ? 'Prüfe deinen alten Vorschlag mit den neuen Zeiten. Beibehalten und Wechseln sind möglich.'
      : p.help === 2
        ? `${goalMessage(r.review, 'now')} Welche Folge ist dir wichtiger?`
        : `${explainDecision(r.review, 'now')} ${r.review.route ? changeLabel(r.review.route) : ''}`;
  }
  if (p.help === 3)
    return state.step === 5
      ? state.decision.route
        ? explainDecision(state.decision)
        : 'Wähle zuerst deinen Busweg. Dann zeigen wir dir ein passendes Beispiel.'
      : explainTask(state.step);
  if (state.step === 5) {
    if (!state.decision.route || !state.decision.criterion)
      return 'Wähle zuerst deine Buslinie und dein Ziel im Schritt „Vorschlag“.';
    if (p.help === 1)
      return 'Ein Vorteil heißt: weniger Zeit. Ein Nachteil heißt: mehr Zeit. Vergleiche zwei Linien für dieselbe Person.';
    return `${goalMessage(state.decision)} Prüfe deinen Vorteil und den Nachteil für eine andere Person. Bei der Gewichtung entscheidest du, welche Folge dir wichtiger ist.`;
  }
  return tasks[state.step].hints[Math.max(0, p.help - 1) as 0 | 1];
}

function help() {
  const p = currentProgress(state);
  if (!p.help) return '';
  if (state.screen.startsWith('event-'))
    return `<aside class="help-panel" aria-label="Aufgabenhilfe"><h3 id="help-title" tabindex="-1">→ Hilfe ${p.help} von 3</h3><p>${esc(currentHint())}</p>${p.help < 3 ? button(p.help === 1 ? 'Genauer zeigen' : 'Erklärung ansehen', 'help', 'text-button', `data-value="${p.help + 1}"`) : button('Dieses Beispiel übernehmen', 'use-example', 'button secondary')}</aside>`;
  return `<aside class="help-panel" aria-label="Aufgabenhilfe"><h3 id="help-title" tabindex="-1">→ Hilfe ${p.help} von 3</h3><p>${currentHint()}</p>
    ${state.step >= 3 && p.help === 3 && (state.step !== 5 || (state.decision.route && state.decision.criterion)) && (state.step === 3 ? !state.explanation.supported : state.step === 5 ? !state.decision.supported : !p.complete) ? button('Dieses Beispiel übernehmen', 'use-example', 'button secondary', 'id="decision-example-button"') : ''}
    ${
      p.help < 3
        ? button(
            p.help === 1 ? 'Genauer zeigen' : 'Erklärung ansehen',
            'help',
            'text-button',
            `data-value="${p.help + 1}"`,
          )
        : `
    <details id="transfer" class="transfer"><summary>Probiere einen neuen Weg <span>freiwillig</span></summary>
      <p>Neues Beispiel: Amina wohnt nun näher am Platz. Sie geht 3 Minuten zum Bus. Die direkte Busfahrt dauert 10 Minuten. Wie lange ist ihr ganzer Weg?</p>
      <fieldset><legend>Die Karte oben bleibt unverändert.</legend><div class="person-choices">${radio('transfer', 'yes', '13 Minuten', p.transfer === 'yes', Boolean(p.transferFeedback?.complete))}${radio('transfer', 'no', '10 Minuten', p.transfer === 'no', Boolean(p.transferFeedback?.complete))}</div></fieldset>
      ${!p.transferFeedback?.complete ? button('Neuen Weg prüfen', 'check-transfer', 'button secondary') : ''}
      ${p.transferFeedback ? `<div class="feedback ${p.transferFeedback.kind}"><h4 id="transfer-feedback-title" tabindex="-1">${esc(p.transferFeedback.title)}</h4><p>${esc(p.transferFeedback.text)}</p></div>` : ''}</details>`
    }</aside>`;
}

function game() {
  const task = tasks[state.step];
  const p = state.progress[state.step];
  return `${header()}<main id="main" class="game-screen ${state.step === 5 ? 'decision-screen' : ''}" tabindex="-1">
    <div class="episode-heading"><div><p class="eyebrow">Deine erste Zukunftsfrage</p><h1>${episode.title}</h1></div>${button('Wörter erklären', 'words', 'button quiet', `id="words-toggle" aria-expanded="${state.words}" aria-controls="word-help"`)}</div>
    ${state.words ? `<aside id="word-help" class="word-help" aria-label="Wörter erklärt"><h2>Wörter für deinen Weg</h2><dl>${glossary.map(([term, meaning]) => `<div><dt>${term}</dt><dd>${meaning}</dd></div>`).join('')}</dl>${button('Wörter schließen', 'words', 'text-button')}</aside>` : ''}
    <div class="game-layout">${state.step === 5 ? '<details id="decision-map" class="decision-map"><summary>Karte und ganze Wege ansehen</summary>' : ''}<div class="map-column">${state.step === 4 ? explorationIntro() : ''}${renderMap(state)}${state.step > 0 ? routeSwitch() + (state.step >= 4 ? journeyExplorer() : comparison()) : '<p class="map-context"><strong>Amina</strong> fährt zur Schule. <strong>David</strong> fährt zum Markt. Beide Ziele liegen im Zentrum.</p>'}<p class="model-note">${episode.modelNote} Wartezeiten, Fahrpreise und Kapazitäten werden hier nicht berechnet.</p></div>${state.step === 5 ? '</details>' : ''}
    <section class="task-panel" aria-labelledby="task-title"><div class="task-prompt"><div class="task-step"><span>0${state.step + 1} <span aria-hidden="true">/</span> 06</span><span>${task.label}</span></div><div class="step-rule" aria-hidden="true">${tasks.map((_, i) => `<i class="${i <= state.step ? 'filled' : ''}"></i>`).join('')}</div>
      <h2 id="task-title" tabindex="-1">${state.step === 5 ? 'Deine Empfehlung' : task.question}</h2><p class="instruction">${state.step === 5 ? 'Wähle selbst. Belege deinen Vorteil und den Nachteil für eine andere Person.' : task.instruction}</p></div><div class="task-work">
      ${state.step === 5 ? decisionInput() : state.step === 4 ? explorationInput() : state.step === 3 ? explanationInput() : closedInput()}
      ${feedback(p.feedback)}${help()}${state.step === 3 && p.complete ? firstIdea() : ''}
      <div class="task-actions">${(state.step === 5 ? state.decision.panel === 'weigh' : !p.complete || state.step === 3) ? button(state.step === 5 ? 'Empfehlung prüfen' : state.step === 3 ? 'Erklärung prüfen' : 'Weg prüfen', 'check', 'button primary', `id="check-answer" ${p.complete && state.step !== 3 && state.step !== 5 ? 'disabled' : ''}`) : ''}
      ${p.complete && (state.step !== 5 || state.decision.panel === 'weigh') ? button(state.step === 5 ? 'Zum Abschluss →' : 'Weiter →', 'next', 'button primary', 'id="next-step"') : ''}
      ${p.help === 0 ? button('Ich brauche einen Hinweis', 'help', 'text-button help-button', 'data-value="1"') : ''}</div>
      <div class="task-navigation">${button('← Zurück', 'back', 'text-button')}${button('Aufgabe neu bearbeiten', 'reset-task', 'text-button')}</div>
    </div></section></div>
    <footer class="game-footer">${button('Episoden auswählen', 'episode-home', 'text-button')}<span>Ein Ort. ${state.step < 4 ? 'Zwei' : 'Drei'} Perspektiven.</span>${button('Neu starten', 'ask-restart', 'text-button')}${restartPending ? `<span class="restart-confirm">${resetNotice} ${button('Ja, neu starten', 'restart', 'text-button')} ${button('Abbrechen', 'cancel-restart', 'text-button')}</span>` : ''}</footer>
  </main>`;
}

function end() {
  const d = state.decision,
    e = state.explanation;
  return `${header()}<main id="main" class="end-screen" tabindex="-1"><p class="eyebrow">Dein Blick auf die Wege</p><span class="end-symbol" aria-hidden="true">${arrow}</span><h1>Ein Busweg.<br>Drei Perspektiven.</h1><p class="takeaway">Ein Busweg kann einer Person helfen und einer anderen einen Nachteil bringen. Auch der Weg zur Haltestelle zählt.</p>
    <section class="recommendation" aria-label="Dein Lernprodukt"><p class="eyebrow">Deine Empfehlung</p><h2>${d.route ? routeNames[d.route] : 'Dein Busweg'}</h2>${state.firstRoute ? `<p><strong>Deine erste Idee:</strong> ${routeNames[state.firstRoute]}</p>` : ''}<p><strong>Dein Ziel oder Kriterium:</strong> ${d.criterion ? criteria[d.criterion] : 'Noch offen'}</p>${d.advantage ? `<p><strong>Dein Beleg zum Vorteil:</strong> ${esc(evidenceLabel(d.advantage))}</p>${d.route && !evidenceFits(d.advantage, d.route, 'advantage') ? '<p class="small-note">Diesen Beleg musst du noch prüfen: Er zeigt keinen Vorteil deines Vorschlags.</p>' : ''}` : ''}${d.disadvantage ? `<p><strong>Dein Beleg zum Nachteil:</strong> ${esc(evidenceLabel(d.disadvantage))}</p>${d.route && (!evidenceFits(d.disadvantage, d.route, 'disadvantage') || (d.advantage && !differentPeople(d.advantage, d.disadvantage))) ? '<p class="small-note">Diesen Beleg musst du noch prüfen: Gefragt ist ein Nachteil für eine andere Person.</p>' : ''}` : ''}${d.text ? `<p class="saved-text">${esc(d.text)}</p><p class="small-note">Dein eigener Text wurde nicht automatisch fachlich geprüft. Prüfe: Hast du einen zutreffenden Beleg und einen Nachteil für eine andere Person genannt?</p>` : ''}
    ${weightingProduct(d) ? `<p class="weighting-product"><strong>Deine Gewichtung:</strong> ${esc(weightingProduct(d))}</p>` : ''}${d.ungraded ? '<p class="small-note" data-ungraded>Bewusst unbewertet abgegeben. Die Verbindung von Ziel, Belegen und Gewichtung ist damit nicht bestätigt.</p>' : '<p class="small-note">Du hast deine Empfehlung mit Bausteinen begründet.</p>'}
    <details id="learning-process"><summary>Deine Erklärung und deine Vermutung</summary><h3>Aminas Weg erklären</h3>${e.cause ? `<p>${esc(explanationChoices.cause[e.cause])}</p>` : ''}${e.effect ? `<p>${esc(explanationChoices.effect[e.effect])}</p>` : ''}${e.text ? `<p class="saved-explanation saved-text">${esc(e.text)}</p><p class="small-note">Deine eigene Erklärung wurde nicht automatisch fachlich geprüft.</p>` : `<p class="small-note">Mit Satzbausteinen erklärt.${e.cause !== 'shorter' || e.effect !== 'total' ? ' Prüfe die Sätze noch einmal.' : ''}</p>`}${state.progress[4].prediction ? `<p>Deine erste Vermutung für Leila: ${routeNames[state.progress[4].prediction!]}.</p>` : ''}</details>
    ${state.progress.map((p, i) => (p.supported ? `<p class="small-note" data-supported>Mit Hilfe erstellt: Bei „${tasks[i].label}“ hast du ${i < 3 ? 'die Erklärung genutzt' : 'das erklärte Beispiel übernommen'}.</p>` : i < 3 && p.help === 3 ? `<p class="small-note" data-explanation-after-confirmation>Bei „${tasks[i].label}“ war deine richtige Antwort bestätigt. Danach hast du die Erklärung angesehen.</p>` : '')).join('')}
    <p class="reflection">Zeige jemandem deinen Vorschlag. Erkläre: Welche Folge ist dir besonders wichtig?</p></section><p class="end-model">Dieses Modell ist erfunden. Daraus folgen keine allgemeinen Aussagen über Nairobi oder Kenia. Wartezeiten, Fahrpreise und Kapazitäten fehlen. Ein Vergleich der Zeiten ist noch keine umfassende Nachhaltigkeitsbewertung. Die Zeiten sind keine Vorhersage für das Jahr 2040.</p><section class="event-transition" aria-label="Eine Woche später"><h2>Eine Woche später …</h2><p>Im Viertel hat sich etwas verändert. Prüfe, ob deine Entscheidung noch passt.</p>${button(state.road ? 'Neue Situation weiter prüfen' : 'Was hat sich verändert?', 'event-start', 'button primary')}</section>${button('Episode 2 starten', 'demand-start', 'button secondary')}<div class="end-actions">${button('Episoden auswählen', 'episode-home', 'button secondary')}${button('Empfehlung noch einmal ansehen', 'back', 'button secondary')}${button('Neu spielen', 'restart', 'button primary')}</div><p class="privacy-note">Neustart löscht deine Antworten in diesem Tab.</p></main>`;
}

function render(focusId?: string, taskChange = false) {
  const view =
    state.screen === 'learning'
      ? `learning-${state.learning?.view}-${state.learning?.profile}-${state.learning?.pendingProfile}-${state.learning?.unit}-${state.learning && activeLearning(state.learning)?.index}`
      : state.screen === 'inquiry'
        ? `inquiry-${state.inquiry?.topic}-${state.inquiry?.step}-${state.inquiry?.journal}`
        : state.screen === 'study'
          ? `study-${state.activeStudy}-${state.studies?.[state.activeStudy!]?.step}`
          : `${state.screen}-${state.step}`;
  const openDetails =
    app.dataset.view === view
      ? [...app.querySelectorAll<HTMLDetailsElement>('details[open][id]')].map(
          (el) => el.id,
        )
      : [];
  app.dataset.view = view;
  app.innerHTML =
    state.screen === 'learning'
      ? renderLearning(
          state.learning,
          header(),
          restartPending,
          !!state.inquiry ||
            !!state.demand ||
            !!state.studies ||
            state.step > 0,
        )
      : state.screen === 'inquiry'
        ? renderInquiry(state.inquiry, header())
        : state.screen === 'review'
          ? renderReview(state, {
              header: header(),
              button,
              radio,
              esc,
              feedback,
              restartPending,
            })
          : state.screen === 'study'
            ? renderStudy(state, {
                header: header(),
                button,
                radio,
                esc,
                feedback,
                restartPending,
              })
            : state.screen === 'start'
              ? start()
              : state.screen === 'end'
                ? end()
                : state.screen.startsWith('demand-')
                  ? renderDemand(state, {
                      header: header(),
                      button,
                      radio,
                      esc,
                      feedback,
                      restartPending,
                    })
                  : state.screen.startsWith('event-')
                    ? renderEvent(state, {
                        header: header(),
                        button,
                        radio,
                        esc,
                        feedback,
                        help,
                        evidenceInput,
                        ownWords,
                        routeSwitch,
                        journeyExplorer,
                        restartPending,
                      })
                    : game();
  if (
    state.screen !== 'start' &&
    state.screen !== 'review' &&
    state.screen !== 'inquiry' &&
    state.screen !== 'learning'
  ) {
    const country =
      state.screen === 'study' && state.activeStudy
        ? state.activeStudy === 'cocoa' || state.activeStudy === 'share'
          ? 'GHA'
          : 'MAR'
        : 'KEN';
    app
      .querySelector('main')
      ?.insertAdjacentHTML(
        'beforeend',
        renderContext(country) +
          button(
            'Drei Orte – Rückblick',
            'geography',
            'button secondary',
            'data-op="review" id="review-open"',
          ),
      );
  }
  for (const id of openDetails) {
    const detail = document.getElementById(id) as HTMLDetailsElement | null;
    if (detail) detail.open = true;
  }
  if (focusId)
    document.getElementById(focusId)?.focus({
      preventScroll: ![
        'task-title',
        'main',
        'decision-title',
        'feedback-title',
      ].includes(focusId),
    });
  if (taskChange && focusId) {
    requestAnimationFrame(() =>
      document
        .getElementById(focusId)
        ?.scrollIntoView({ block: 'start', behavior: 'instant' }),
    );
  }
}

function dispatch(action: Action) {
  const geo = action.type === 'geography';
  const oldFocus = document.activeElement?.id;
  state = reduce(state, action);
  if (
    action.type === 'learning' &&
    ['confirm-profile', 'cancel-profile'].includes(action.op) &&
    recommendation(location.search)
  )
    consumeEntry();
  if (action.type === 'restart') {
    clearSession(storage);
    restartPending = false;
    updateStorageWarning(false);
  } else persistState();
  if (action.type === 'learning') {
    const navigation = [
      'open',
      'profiles',
      'confirm-profile',
      'cancel-profile',
      'unit',
      'next',
      'back',
      'menu',
      'home',
      'journal',
    ].includes(action.op);
    const focus =
      action.op === 'check' || action.op === 'adopt'
        ? 'learning-feedback-title'
        : action.op === 'help'
          ? 'learning-help-title'
          : navigation
            ? 'main'
            : oldFocus;
    render(focus, navigation);
    announcer.textContent =
      action.op === 'check'
        ? (document.querySelector('[data-learning-feedback]')?.textContent ??
          '')
        : '';
    return;
  }
  if (action.type === 'inquiry') {
    const navigation = [
      'open',
      'menu',
      'home',
      'topic',
      'journal',
      'next',
      'back',
      'initial-save',
    ].includes(action.op);
    const focus = ['check', 'adopt'].includes(action.op)
      ? 'inquiry-feedback-title'
      : ['help', 'product-help'].includes(action.op)
        ? 'inquiry-help-title'
        : ['submit', 'product-adopt'].includes(action.op)
          ? 'inquiry-product-status'
          : navigation
            ? 'main'
            : oldFocus;
    render(focus, navigation);
    const topic = state.inquiry?.topic;
    announcer.textContent =
      topic && state.inquiry && ['check', 'adopt'].includes(action.op)
        ? (state.inquiry.records[topic].checks[Math.min(state.inquiry.step, 1)]
            .feedback?.text ?? '')
        : '';
    return;
  }
  const navigate =
    [
      'start',
      'restart',
      'next',
      'back',
      'demand-start',
      'demand-next',
      'demand-back',
      'demand-reset',
      'episode-home',
      'episode-report',
      'event-start',
      'event-next',
      'event-back',
      'event-reset',
    ].includes(action.type) ||
    (action.type === 'study' &&
      ['start', 'next', 'back', 'home', 'reset'].includes(action.op));
  const report =
    [
      'check',
      'check-transfer',
      'use-example',
      'submit-ungraded',
      'event-submit-explanation',
    ].includes(action.type) ||
    (action.type === 'study' &&
      ['check', 'adopt', 'submit'].includes(action.op));
  render(
    geo && ['review', 'home'].includes(action.op)
      ? 'main'
      : geo &&
          ['check', 'adopt', 'transfer-check', 'transfer-adopt'].includes(
            action.op,
          )
        ? 'feedback-title'
        : geo && ['help', 'transfer-help'].includes(action.op)
          ? 'help-title'
          : action.type === 'study' && action.op === 'panel'
            ? 'study-decision-title'
            : action.type === 'decision-panel'
              ? 'decision-title'
              : navigate
                ? (state.screen === 'study' &&
                    state.studies?.[state.activeStudy!]?.step !== 3) ||
                  (state.screen.startsWith('demand-') &&
                    state.screen !== 'demand-end') ||
                  state.screen === 'game' ||
                  (state.screen.startsWith('event-') &&
                    state.screen !== 'event-end')
                  ? 'task-title'
                  : 'main'
                : action.type === 'prediction'
                  ? 'prediction-status'
                  : action.type === 'words'
                    ? 'words-toggle'
                    : action.type === 'help'
                      ? 'help-title'
                      : action.type === 'reset-task'
                        ? 'task-title'
                        : action.type === 'check-transfer'
                          ? 'transfer-feedback-title'
                          : report && currentProgress(state).feedback
                            ? 'feedback-title'
                            : oldFocus,
    navigate || (geo && ['review', 'home'].includes(action.op)),
  );
  if (geo && state.geography) {
    announcer.textContent =
      state.screen === 'review' && state.geography.review
        ? action.op === 'transfer-help'
          ? transferHint(state.geography.review)
          : (state.geography.review.records[state.geography.review.tab].progress
              .feedback?.text ?? '')
        : action.op === 'help'
          ? geoHint(state.geography)
          : (state.geography.records[state.geography.target].progress.feedback
              ?.text ?? '');
  }
  if (report)
    announcer.textContent =
      (action.type === 'check-transfer'
        ? currentProgress(state).transferFeedback
        : currentProgress(state).feedback
      )?.text ?? '';
  if (action.type === 'decision-panel')
    document
      .querySelector('.decision-tabs')
      ?.scrollIntoView({ block: 'start', behavior: 'instant' });
  if (action.type === 'prediction')
    announcer.textContent = `Deine Vermutung: ${routeNames[state.progress[4].prediction!]}. Teste nun Leilas Wege.`;
  if (action.type === 'route' || action.type === 'highlight') {
    const person = selectedPerson(state),
      j = journey(
        person,
        state.route,
        eventSituation(state.screen, state.road),
      );
    announcer.textContent = `${personNames[person]}, ${routeNames[state.route]}: ${j.walk} Minuten zu Fuß plus ${j.bus} Minuten im Bus. Insgesamt ${j.total} Minuten.`;
  }
  if (
    action.type === 'help' ||
    (action.type === 'study' && action.op === 'help')
  ) {
    announcer.textContent = currentHint();
    document
      .querySelector<HTMLElement>('.help-panel')
      ?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }
}

function activate(el: Element) {
  const name = el.getAttribute('data-action')!;
  if (name === 'learning') {
    const op = el.getAttribute('data-op');
    if (op === 'ask-reset') {
      restartPending = true;
      render();
      return;
    }
    dispatch({
      type: 'learning',
      op: op as LearningAction['op'],
      value: el.getAttribute('data-value') ?? undefined,
      field: el.getAttribute('data-field') ?? undefined,
    });
    return;
  }
  if (name === 'inquiry') {
    dispatch({
      type: 'inquiry',
      op: el.getAttribute('data-op') as InquiryAction['op'],
      value: el.getAttribute('data-value') ?? undefined,
    });
    return;
  }
  if (name === 'geography') {
    dispatch({
      type: 'geography',
      op: el.getAttribute('data-op') as GeoAction['op'],
      value: el.getAttribute('data-value') ?? undefined,
    });
    return;
  }
  const value = el.getAttribute('data-value');
  if (name === 'study') {
    dispatch({
      type: 'study',
      op: el.getAttribute('data-op') as StudyAction['op'],
      id: el.getAttribute('data-episode') as StudyId,
      field: el.getAttribute('data-field') ?? undefined,
      value: value ?? undefined,
      persisted: persistState(),
    });
    return;
  }
  if (name === 'focus-review-goal') {
    document.getElementById('revision-criterion')?.focus();
    document
      .getElementById('revision-criterion')
      ?.scrollIntoView({ block: 'center' });
    return;
  }
  if (name === 'ask-restart' || name === 'cancel-restart') {
    restartPending = name === 'ask-restart';
    render();
    return;
  }
  if (name === 'clear-weighting') {
    dispatch({ type: 'weighting', value: undefined });
    return;
  }
  if (
    name === 'check' ||
    name === 'use-example' ||
    name === 'submit-ungraded' ||
    name === 'event-submit-explanation'
  ) {
    dispatch({ type: name, persisted: persistState() });
    return;
  }
  if (name === 'help') {
    dispatch({ type: 'help', value: Number(value) });
    return;
  }
  if (
    [
      'route',
      'foot',
      'bus',
      'person',
      'highlight',
      'decision-panel',
      'event-path',
      'event-view',
      'demand-measure',
      'demand-view',
      'demand-goal',
    ].includes(name)
  ) {
    // A solved task stays available for inspection; explicit rework resets it.
    if (
      state.step === 0 &&
      ['foot', 'bus'].includes(name) &&
      state.progress[0].complete
    )
      return;
    dispatch({ type: name, value } as Action);
    return;
  }
  dispatch({ type: name } as Action);
}

app.addEventListener('click', (event) => {
  const el = (event.target as Element).closest('[data-action]');
  if (el) activate(el);
});
app.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && state.words) {
    dispatch({ type: 'words' });
    return;
  }
  const el = (event.target as Element).closest(
    'svg [role="button"][data-action]',
  );
  if (el && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    activate(el);
  }
});
app.addEventListener('change', (event) => {
  const el = event.target as HTMLInputElement | HTMLSelectElement;
  if (el.name === 'learning-answer') {
    if (el instanceof HTMLSelectElement)
      dispatch({
        type: 'learning',
        op: 'answer',
        field: el.dataset.field,
        value: el.value,
      });
    return;
  }
  if (el.name === 'learning-oral') {
    dispatch({ type: 'learning', op: 'oral' });
    return;
  }
  if (el.name.startsWith('inquiry-')) {
    // Text/numeric edits are saved on input, without replacing the clicked next control on blur.
    if (el.name === 'inquiry-answer' && el instanceof HTMLSelectElement)
      dispatch({
        type: 'inquiry',
        op: 'answer',
        field: el.dataset.field,
        value: el.value,
      });
    if (el.name === 'inquiry-oral')
      dispatch({
        type: 'inquiry',
        op: 'oral',
        value: String((el as HTMLInputElement).checked),
      });
    return;
  }
  if (el.name.startsWith('geo-transfer-')) {
    dispatch({
      type: 'geography',
      op: 'transfer-answer',
      field: el.name.slice(13),
      value: el.value,
    });
    return;
  }
  if (el.name === 'study-text') return;
  if (el.name.startsWith('study-')) {
    dispatch({
      type: 'study',
      op: 'answer',
      field: el.name.slice(6),
      value: el.value,
      persisted: persistState(),
    });
    return;
  }
  if (el.name === 'demand-later') {
    dispatch({ type: 'demand-later', value: Number(el.value) });
    return;
  }
  if (el.name === 'demand-text') return; // Input already saved it; avoid replacing a clicked control on blur.
  if (el.name.startsWith('demand-')) {
    dispatch({ type: el.name, value: el.value } as Action);
    return;
  }
  if (el.name.startsWith('event-answer-')) {
    dispatch({
      type: 'event-answer',
      route: el.name.slice(13) as Route,
      value: el.value as 'longer' | 'same',
    });
    return;
  }
  if (
    [
      'foot',
      'bus',
      'person',
      'decision-route',
      'advantage',
      'disadvantage',
      'transfer',
      'first-route',
      'prediction',
      'route-answer',
      'cause',
      'effect',
      'criterion',
      'advantage-other',
      'disadvantage-other',
      'weighting',
      'event-path',
      'event-connection',
      'event-cause',
      'event-change-evidence',
      'event-reason',
    ].includes(el.name)
  )
    dispatch({ type: el.name, value: el.value || undefined } as Action);
});
app.addEventListener('input', (event) => {
  const el = event.target as HTMLTextAreaElement;
  if (
    el.name.startsWith('inquiry-') &&
    el.tagName !== 'SELECT' &&
    el.name !== 'inquiry-oral'
  ) {
    const op =
      el.name === 'inquiry-initial'
        ? 'initial'
        : el.name === 'inquiry-product'
          ? 'product'
          : 'answer';
    state = reduce(state, {
      type: 'inquiry',
      op,
      field: el.dataset.field,
      value: el.value,
    });
    persistState();
    document.querySelector('[data-inquiry-feedback]')?.remove();
    document.getElementById('inquiry-next')?.remove();
    const topic = state.inquiry?.topic;
    const status = document.getElementById('inquiry-product-status');
    if (status && topic && state.inquiry)
      status.textContent = productStatus(topic, state.inquiry.records[topic]);
    const notice = document.getElementById('inquiry-product-notice');
    if (notice)
      notice.textContent =
        'Geändert – noch nicht erneut abgegeben. Freie Texte bleiben fachlich ungeprüft.';
    return;
  }
  if (el.name === 'study-text') {
    state = reduce(state, { type: 'study', op: 'text', value: el.value });
    persistState();
    document.querySelector('[data-feedback]')?.remove();
    document.getElementById('next-step')?.remove();
    const b = document.querySelector<HTMLButtonElement>('#study-submit');
    if (b) b.disabled = !el.value.trim();
    return;
  }
  if (
    el.name !== 'text' &&
    el.name !== 'explanation-text' &&
    el.name !== 'event-text' &&
    el.name !== 'demand-text'
  )
    return;
  state = reduce(state, { type: el.name, value: el.value });
  persistState();
  document.querySelector('[data-feedback]')?.remove();
  document.getElementById('next-step')?.remove();
  const ungraded = document.querySelector<HTMLButtonElement>(
    '[data-action="submit-ungraded"]',
  );
  if (ungraded && (el.name === 'text' || el.name === 'demand-text'))
    ungraded.disabled = !el.value.trim();
  const explanationSubmit = document.querySelector<HTMLButtonElement>(
    '[data-action="event-submit-explanation"]',
  );
  if (explanationSubmit && el.name === 'event-text')
    explanationSubmit.disabled = !el.value.trim();
});

// Do not rely on previous tasks' services or an existing in-memory state.
if (!state) state = initialState();
render(undefined, false);
if (['event-find', 'event-effects', 'event-review'].includes(state.screen))
  requestAnimationFrame(() =>
    document
      .getElementById('task-title')
      ?.scrollIntoView({ block: 'start', behavior: 'instant' }),
  );

app.addEventListener('input', (event) => {
  const el = event.target as HTMLInputElement | HTMLTextAreaElement;
  if (el.name !== 'learning-answer' || el instanceof HTMLSelectElement) return;
  state = reduce(state, {
    type: 'learning',
    op: 'answer',
    field: el.dataset.field,
    value: el.value,
  });
  persistState();
  document.querySelector('[data-learning-feedback]')?.remove();
  document.querySelector('#learning-next')?.remove();
});
