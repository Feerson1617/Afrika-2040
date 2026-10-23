import './style.css';
import {
  episode,
  glossary,
  personNames,
  routeNames,
  tasks,
} from './content.ts';
import type { Route } from './content.ts';
import { evidenceFor, evidenceIds, evidenceLabel, journey } from './model.ts';
import { initialState, reduce } from './state.ts';
import type { Action } from './state.ts';
import type { Feedback } from './feedback.ts';
import { explainDecision } from './feedback.ts';
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
  return `<header class="site-header"><div class="brand"><span class="brand-mark">${mark}</span><span>AFRIKA <strong>2040</strong></span></div><span class="header-caption">${state.screen === 'start' ? 'Gestalte die Zukunft' : 'Kenia <span aria-hidden="true">/</span> Nairobi'}</span></header>`;
}

function start() {
  return `${header()}<main id="main" class="start-screen" tabindex="-1">
    <div class="hero-copy"><p class="eyebrow"><span class="tiny-dot"></span> Entdecken. Abwägen. Mitgestalten.</p>
      <h1>Afrika 2040 <span>Gestalte die<br>Zukunft.</span></h1>
      <p class="intro">Du untersuchst Orte in Afrika. Menschen vor Ort haben Ideen für ihre Zukunft. Prüfe die Vorschläge. Entscheide, was du empfehlen würdest.</p>
      ${button(`Spiel starten ${arrow}`, 'start', 'button primary start-button')}
      <p class="start-location">Dein erster Ort: <strong>Nairobi, Kenia</strong></p>
    </div>
    <div class="hero-art" aria-hidden="true"><span class="art-label">Jeder Weg macht einen Unterschied.</span>
      <svg viewBox="0 0 540 550"><circle cx="270" cy="270" r="216" fill="#e5e9d7"/><path d="M50 420C290 490 100 60 390 116S280 401 520 390" fill="none" stroke="#b8c9b0" stroke-width="54"/><path d="M50 420C290 490 100 60 390 116S280 401 520 390" fill="none" stroke="#f9f8ed" stroke-width="2" stroke-dasharray="8 10"/>
      <path d="M20 340C200 400 360 140 535 237" fill="none" stroke="#c4774f" stroke-width="16"/><circle cx="120" cy="336" r="14" fill="#f6f4e9" stroke="#c4774f" stroke-width="7"/><circle cx="437" cy="230" r="14" fill="#f6f4e9" stroke="#c4774f" stroke-width="7"/>
      <g transform="translate(160 235) rotate(-14 110 65)"><rect x="3" y="17" width="230" height="112" rx="23" fill="#c8cbb5"/><rect width="230" height="112" rx="23" fill="#264e40"/><rect x="17" y="16" width="160" height="45" rx="8" fill="#e2eadb"/><rect x="185" y="16" width="29" height="71" rx="6" fill="#e2eadb"/><path d="M70 16V61M124 16V61" stroke="#264e40" stroke-width="5"/><path d="M15 81H174" stroke="#e8c978" stroke-width="8"/><circle cx="47" cy="112" r="20" fill="#243c35"/><circle cx="47" cy="112" r="9" fill="#e6e5d5"/><circle cx="183" cy="112" r="20" fill="#243c35"/><circle cx="183" cy="112" r="9" fill="#e6e5d5"/></g>
      <path d="M412 407V454M396 430H427" stroke="#40634e" stroke-width="2"/><circle cx="412" cy="402" r="26" fill="#b5c7a5"/><circle cx="400" cy="396" r="18" fill="#cfdbc1"/>
      </svg><span class="art-stamp">01 <span>Kenia<br>Welcher Busweg hilft wem?</span></span>
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
  return `<div class="route-switch" role="group" aria-label="Busweg auf der Karte"><span>Busweg ansehen</span><div>${(['direct', 'north'] as Route[]).map((r) => button(routeNames[r], 'route', `route-button ${state.route === r ? 'selected' : ''}`, `id="route-${r}" data-value="${r}" aria-pressed="${state.route === r}"`)).join('')}</div></div>`;
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

function decisionInput() {
  const d = state.decision;
  const select = (type: 'advantage' | 'disadvantage', label: string) =>
    `<label class="select-label" for="${type}">${label}<select id="${type}" name="${type}"><option value="">Beleg auswählen</option>${evidenceIds.map((id) => `<option value="${id}" ${d[type] === id ? 'selected' : ''}>${esc(evidenceLabel(id))}</option>`).join('')}</select></label>`;
  return `<fieldset><legend>Mein Vorschlag</legend><div class="person-choices">${radio('decision-route', 'direct', 'Direkt', d.route === 'direct')}${radio('decision-route', 'north', 'Über Nord', d.route === 'north')}</div></fieldset>
    <p class="field-intro">Nutze die Bausteine oder schreibe selbst.</p>
    ${select('advantage', 'Ein Vorteil mit Beleg')}${select('disadvantage', 'Ein Nachteil mit Beleg')}
    <details id="own-words" class="own-words" ${d.text ? 'open' : ''}><summary>Mit eigenen Worten <span>freiwillig</span></summary><label for="own-text">Ich schlage diesen Busweg vor, weil …</label><textarea id="own-text" name="text" rows="4" maxlength="1500" placeholder="Wem hilft dein Vorschlag? Für wen wird der Weg länger?">${esc(d.text)}</textarea><p class="small-note">Das Spiel bewertet deinen Text nicht. Du kannst deinen Beleg auf der Karte zeigen.</p></details>
    <details id="deeper" class="deeper"><summary>Weiterdenken</summary><p>Welche Folge ist dir wichtiger? Begründe deine Wahl. Welche Angaben fehlen, um einen echten Busweg zu planen?</p></details>`;
}

function currentHint() {
  const p = state.progress[state.step];
  if (state.step === 3 && p.help === 3)
    return state.decision.route
      ? explainDecision(state.decision.route)
      : 'Wähle zuerst deinen Busweg. Dann zeigen wir dir ein passendes Beispiel.';
  return tasks[state.step].hints[p.help - 1];
}

function help() {
  const p = state.progress[state.step];
  if (!p.help) return '';
  return `<aside class="help-panel" aria-label="Aufgabenhilfe"><h3 id="help-title" tabindex="-1">→ Hilfe ${p.help} von 3</h3><p>${currentHint()}</p>
    ${state.step === 3 && p.help === 3 && state.decision.route && !state.decision.supported ? button('Dieses Beispiel übernehmen', 'use-example', 'button secondary', 'id="decision-example-button"') : ''}
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
  return `${header()}<main id="main" class="game-screen" tabindex="-1">
    <div class="episode-heading"><div><p class="eyebrow">Deine erste Zukunftsfrage</p><h1>${episode.title}</h1></div>${button('Wörter erklären', 'words', 'button quiet', `id="words-toggle" aria-expanded="${state.words}" aria-controls="word-help"`)}</div>
    ${state.words ? `<aside id="word-help" class="word-help" aria-label="Wörter erklärt"><h2>Wörter für deinen Weg</h2><dl>${glossary.map(([term, meaning]) => `<div><dt>${term}</dt><dd>${meaning}</dd></div>`).join('')}</dl>${button('Wörter schließen', 'words', 'text-button')}</aside>` : ''}
    <div class="game-layout"><div class="map-column">${renderMap(state)}${state.step > 0 ? routeSwitch() + comparison() : '<p class="map-context"><strong>Amina</strong> fährt zur Schule. <strong>David</strong> fährt zum Markt. Beide Ziele liegen im Zentrum.</p>'}<p class="model-note">${episode.modelNote} Keine echte Stadtkarte. Wartezeit und Fahrpreis werden hier nicht berechnet.</p></div>
    <section class="task-panel" aria-labelledby="task-title"><div class="task-prompt"><div class="task-step"><span>0${state.step + 1} <span aria-hidden="true">/</span> 04</span><span>${task.label}</span></div><div class="step-rule" aria-hidden="true">${tasks.map((_, i) => `<i class="${i <= state.step ? 'filled' : ''}"></i>`).join('')}</div>
      <h2 id="task-title" tabindex="-1">${task.question}</h2><p class="instruction">${task.instruction}</p></div><div class="task-work">
      ${state.step === 3 ? decisionInput() : closedInput()}
      ${feedback(p.feedback)}${help()}
      <div class="task-actions">${!p.complete || state.step === 3 ? button(state.step === 3 ? 'Empfehlung prüfen' : 'Weg prüfen', 'check', 'button primary', `id="check-answer" ${p.complete && state.step < 3 ? 'disabled' : ''}`) : ''}
      ${p.complete ? button(state.step === 3 ? 'Zum Abschluss →' : 'Weiter →', 'next', 'button primary', 'id="next-step"') : ''}
      ${p.help === 0 ? button('Ich brauche einen Hinweis', 'help', 'text-button help-button', 'data-value="1"') : ''}</div>
      <div class="task-navigation">${button('← Zurück', 'back', 'text-button')}${button('Aufgabe neu bearbeiten', 'reset-task', 'text-button')}</div>
    </div></section></div>
    <footer class="game-footer"><span>Ein Ort. Zwei Perspektiven.</span>${button('Neu starten', 'ask-restart', 'text-button')}${restartPending ? `<span class="restart-confirm">Alle Antworten löschen? ${button('Ja, neu starten', 'restart', 'text-button')} ${button('Abbrechen', 'cancel-restart', 'text-button')}</span>` : ''}</footer>
  </main>`;
}

function end() {
  const d = state.decision;
  return `${header()}<main id="main" class="end-screen" tabindex="-1"><p class="eyebrow">Dein Blick auf die Wege</p><span class="end-symbol" aria-hidden="true">${arrow}</span><h1>Ein Busweg.<br>Zwei Perspektiven.</h1><p class="takeaway">Ein kurzer Busweg ist nicht für alle der schnellste Weg. Auch der Weg zur Haltestelle zählt.</p>
    <section class="recommendation" aria-label="Dein Lernprodukt"><p class="eyebrow">Deine Empfehlung</p><h2>${d.route ? esc(routeNames[d.route]) : 'Dein Busweg'}</h2>${d.advantage ? `<p><strong>Dein Beleg zum Vorteil:</strong> ${esc(evidenceLabel(d.advantage))}</p>${d.route && d.advantage !== evidenceFor(d.route).advantage ? '<p class="small-note">Diesen Beleg musst du noch prüfen: Er zeigt keinen Vorteil deines Vorschlags.</p>' : ''}` : ''}${d.disadvantage ? `<p><strong>Dein Beleg zum Nachteil:</strong> ${esc(evidenceLabel(d.disadvantage))}</p>${d.route && d.disadvantage !== evidenceFor(d.route).disadvantage ? '<p class="small-note">Diesen Beleg musst du noch prüfen: Er zeigt keinen Nachteil deines Vorschlags.</p>' : ''}` : ''}${d.supported ? '<p class="small-note" data-supported>Mit Hilfe erstellt: Du hast das erklärte Beispiel übernommen.</p>' : ''}${d.text ? `<p class="saved-text">${esc(d.text)}</p><p class="small-note">Dein eigener Text wurde nicht automatisch fachlich geprüft.</p>` : ''}<p class="reflection">Zeige jemandem deinen Vorschlag. Erkläre: Welche Folge ist dir besonders wichtig?</p></section>
    <p class="end-model">Dieses Beispiel ist erfunden. In einer echten Stadt spielen weitere Dinge eine Rolle, zum Beispiel Wartezeit und Fahrpreis. Die Zeiten sind keine Vorhersage für das Jahr 2040.</p>
    <div class="end-actions">${button('Empfehlung noch einmal ansehen', 'back', 'button secondary')}${button('Neu spielen', 'restart', 'button primary')}</div><p class="privacy-note">Neustart löscht deine Antworten in diesem Tab.</p>
  </main>`;
}

function render(focusId?: string) {
  const view = `${state.screen}-${state.step}`;
  const openDetails =
    app.dataset.view === view
      ? [...app.querySelectorAll<HTMLDetailsElement>('details[open][id]')].map(
          (el) => el.id,
        )
      : [];
  app.dataset.view = view;
  app.innerHTML =
    state.screen === 'start'
      ? start()
      : state.screen === 'end'
        ? end()
        : game();
  for (const id of openDetails) {
    const detail = document.getElementById(id) as HTMLDetailsElement | null;
    if (detail) detail.open = true;
  }
  if (focusId)
    document
      .getElementById(focusId)
      ?.focus({ preventScroll: !['task-title', 'main'].includes(focusId) });
}

function dispatch(action: Action) {
  const oldFocus = document.activeElement?.id;
  state = reduce(state, action);
  if (action.type === 'restart') {
    clearSession(storage);
    restartPending = false;
  } else saveSession(state, storage);
  const navigate = ['start', 'restart', 'next', 'back'].includes(action.type);
  const report = ['check', 'check-transfer', 'use-example'].includes(
    action.type,
  );
  render(
    navigate
      ? state.screen === 'game'
        ? 'task-title'
        : 'main'
      : action.type === 'words'
        ? 'words-toggle'
        : action.type === 'help'
          ? 'help-title'
          : action.type === 'reset-task'
            ? 'task-title'
            : action.type === 'check-transfer'
              ? 'transfer-feedback-title'
              : report && state.progress[state.step].feedback
                ? 'feedback-title'
                : oldFocus,
  );
  if (report)
    announcer.textContent =
      (action.type === 'check-transfer'
        ? state.progress[state.step].transferFeedback
        : state.progress[state.step].feedback
      )?.text ?? '';
  if (action.type === 'help') {
    announcer.textContent = currentHint();
    document
      .querySelector<HTMLElement>('.help-panel')
      ?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }
}

function activate(el: Element) {
  const name = el.getAttribute('data-action')!;
  const value = el.getAttribute('data-value');
  if (name === 'ask-restart' || name === 'cancel-restart') {
    restartPending = name === 'ask-restart';
    render();
    return;
  }
  if (name === 'check' || name === 'use-example') {
    dispatch({ type: name, persisted: saveSession(state, storage) });
    return;
  }
  if (name === 'help') {
    dispatch({ type: 'help', value: Number(value) });
    return;
  }
  if (['route', 'foot', 'bus', 'person', 'highlight'].includes(name)) {
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
  if (
    [
      'foot',
      'bus',
      'person',
      'decision-route',
      'advantage',
      'disadvantage',
      'transfer',
    ].includes(el.name)
  )
    dispatch({ type: el.name, value: el.value || undefined } as Action);
});
app.addEventListener('input', (event) => {
  const el = event.target as HTMLTextAreaElement;
  if (el.name !== 'text') return;
  state = reduce(state, { type: 'text', value: el.value });
  saveSession(state, storage);
  document.querySelector('[data-feedback]')?.remove();
  document.getElementById('next-step')?.remove();
});

// Do not rely on previous tasks' services or an existing in-memory state.
if (!state) state = initialState();
render();
