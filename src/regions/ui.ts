import { studies, studyList } from './registry.ts';
import { activeStudy } from './state.ts';
import {
  control,
  optionOf,
  product,
  weighting,
  decisionExample,
} from './shared.ts';
import type { State } from '../state.ts';
import type { StudyUI } from './types.ts';
export function studyMenu(h: Pick<StudyUI, 'button'>) {
  return studyList()
    .map((spec) =>
      h.button(
        `Episode ${spec.number}: ${spec.title}`,
        'study',
        'button secondary',
        `data-op="start" data-episode="${spec.id}" id="episode-${spec.number}"`,
      ),
    )
    .join('');
}
export function studyHint(s: State) {
  const r = activeStudy(s)!,
    spec = studies[s.activeStudy!]!,
    level = r.progress[Math.min(r.step, 2)].help;
  if (r.step < 2) return spec.hint(r.step as 0 | 1, r.data, level);
  const example = decisionExample(spec, r.data, r.decision);
  return level < 3
    ? 'Verbinde dein Ziel mit einem zutreffenden Beleg. Beachte auch die Grenze deines Vorschlags.'
    : example
      ? product(spec, r.data, example)
      : 'Wähle zuerst einen Vorschlag und dein Ziel. Dann zeigen wir ein passendes Beispiel.';
}
export function renderStudy(s: State, h: StudyUI) {
  const r = activeStudy(s)!,
    spec = studies[s.activeStudy!]!,
    p = r.progress[Math.min(r.step, 2)],
    d = r.decision;
  const options = spec.options(r.data),
    selected = optionOf(spec, r.data, d);
  const facts = () =>
    selected
      ? `<section class="study-facts" aria-label="Angaben für deinen Vorschlag"><h3>${selected.label}</h3>${selected.facts.map((t) => `<p>${h.esc(t)}</p>`).join('')}</section>`
      : '';
  const model = () =>
    `<details class="study-model"><summary>Das Modell und seine Grenzen</summary><p>${h.esc(spec.modelNote)}</p></details>`;
  const footer = () =>
    `<footer class="game-footer">${control(h, 'Episoden auswählen', 'home')}${h.button('Neu starten', 'ask-restart', 'text-button')}${h.restartPending ? `<span class="restart-confirm">Alle Antworten löschen? ${h.button('Ja, neu starten', 'restart', 'text-button')} ${h.button('Abbrechen', 'cancel-restart', 'text-button')}</span>` : ''}</footer>`;
  if (r.step === 3)
    return `${h.header}<main id="main" class="end-screen study-screen" tabindex="-1"><p class="eyebrow">Episode ${spec.number} · ${spec.country}</p><h1>Dein begründeter Vorschlag</h1><section class="recommendation" aria-label="Dein Lernprodukt"><h2>${selected?.label ?? 'Dein Vorschlag'}</h2><p><strong>Mein Ziel:</strong> ${d.goal ? h.esc(spec.goals[d.goal]) : 'noch offen'}</p>${d.ungraded ? '<p data-ungraded>Eigener Text bewusst unbewertet. Die Bausteine sind damit nicht bestätigt.</p>' : `<p class="study-product">${h.esc(product(spec, r.data, d))}</p><p>Du hast deinen Vorschlag mit Bausteinen begründet.</p>`}${d.text ? `<p class="saved-text">${h.esc(d.text)}</p><p class="small-note">Eigener Text: nicht automatisch geprüft.</p>` : ''}${d.supported ? '<p data-supported>Diese Empfehlung wurde mit einem Beispiel erstellt.</p>' : ''}${r.progress.some((x) => x.supported) ? '<p data-help-history>In dieser Episode hast du erklärte Beispiele übernommen.</p>' : ''}<p>Zeige deinen Beleg. Erkläre, welche Grenze bleibt.</p></section>${model()}${control(h, 'Empfehlung bearbeiten', 'back')}${footer()}</main>`;
  let body = '';
  if (r.step < 2) body = spec.task(r.data, r.step as 0 | 1, h);
  else
    body = `<fieldset><legend>Mein Vorschlag</legend>${options.map((o) => h.radio('study-proposal', o.id, o.label, d.proposal === o.id, o.eligible === false)).join('')}</fieldset>${facts()}<fieldset><legend>Mein Ziel</legend>${Object.entries(
      spec.goals,
    )
      .map(([id, label]) => h.radio('study-goal', id, label, d.goal === id))
      .join(
        '',
      )}</fieldset>${d.proposal && d.goal ? `<fieldset><legend>Welcher Beleg stützt meinen Vorschlag?</legend>${options.map((o) => h.radio('study-benefit', o.id, o.benefit, d.benefit === o.id)).join('')}${h.radio('study-benefit', 'all', 'Mein Vorschlag löst alle Probleme.', d.benefit === 'all')}</fieldset><fieldset><legend>Welche Grenze bleibt bei meinem Vorschlag?</legend>${options.map((o) => h.radio('study-limit', o.id, o.limit, d.limit === o.id)).join('')}${h.radio('study-limit', 'none', 'Es bleibt keine Grenze.', d.limit === 'none')}</fieldset>` : ''}${selected && d.goal && d.goal !== selected.goal ? `<section class="goal-note"><p>Dein Ziel und dein Vorschlag passen noch nicht zusammen. Was ist dir wichtiger?</p>${control(h, 'Ich passe mein Ziel an', 'answer', selected.goal, 'goal', 'study-adjust-goal')}${h.radio('study-weighted', 'yes', h.esc(weighting(spec, r.data, { ...d, weighted: true })), Boolean(d.weighted))}</section>` : ''}<details id="study-own-words" ${d.text ? 'open' : ''}><summary>Mit eigenen Worten · freiwillig</summary><label for="study-text">Mein Vorschlag, mein Beleg und eine Grenze</label><textarea id="study-text" name="study-text" rows="3" maxlength="1500">${h.esc(d.text)}</textarea><p class="small-note">Dein Text wird nicht automatisch geprüft.</p>${control(h, 'Eigenen Text unbewertet abgeben', 'submit', '', '', 'study-submit', 'button secondary', !d.text.trim() || !d.proposal || !d.goal)}</details><details><summary>Weiterdenken · freiwillig</summary><p>Welche weitere Information brauchst du für eine echte Entscheidung? Welche Folgen sind sicher und welche nur möglich?</p></details>`;
  const level = p.help,
    example = r.step === 2 ? decisionExample(spec, r.data, d) : undefined;
  const hint = studyHint(s);
  const adoptable =
    r.step < 2 ? spec.canAdopt(r.step as 0 | 1, r.data) : Boolean(example);
  return `${h.header}<main id="main" class="game-screen study-screen study-${spec.id}" tabindex="-1"><div class="episode-heading"><div><p class="eyebrow">Episode ${spec.number} · ${r.step + 1} von 3 · ${spec.place}</p><h1>${spec.title}</h1></div>${h.button('Wörter erklären', 'words', 'button quiet', 'id="words-toggle" aria-controls="word-help" aria-expanded="' + s.words + '"')}</div><p class="study-question">${spec.question}</p><p class="model-note">Erfundene Szene und Modellzahlen. Keine Statistik über ${spec.country}.</p>${s.words ? `<aside id="word-help" class="word-help"><h2>Wörter für diesen Schritt</h2><dl>${(spec.terms[Math.min(r.step, spec.terms.length - 1)] ?? []).map(([term, meaning]) => `<div><dt>${h.esc(term)}</dt><dd>${h.esc(meaning)}</dd></div>`).join('')}</dl>${h.button('Wörter schließen', 'words', 'text-button')}</aside>` : ''}<div class="study-layout ${r.step === 2 ? 'study-decision' : ''}">${r.step < 2 ? `<section class="study-world" aria-label="Zentrale Untersuchungsszene"><p>${h.esc(spec.intro)}</p>${spec.scene(r.data, r.step, h)}</section>` : ''}<section class="task-panel study-task" aria-labelledby="task-title"><h2 id="task-title" tabindex="-1">${r.step === 0 ? 'Untersuche die Ausgangslage.' : r.step === 1 ? 'Teste und erkläre die Folgen.' : 'Begründe deinen Vorschlag.'}</h2>${body}${h.feedback(p.feedback)}${level ? `<aside class="help-panel"><h3 id="help-title" tabindex="-1">→ Hilfe ${level} von 3</h3><p>${h.esc(hint)}</p>${level < 3 ? control(h, level === 1 ? 'Genauer zeigen' : 'Erklärung ansehen', 'help', String(level + 1)) : control(h, 'Dieses Beispiel übernehmen', 'adopt', '', '', 'study-adopt', 'button secondary', !adoptable)}</aside>` : ''}<div class="task-actions">${control(h, 'Antwort prüfen', 'check', '', '', 'check-answer', 'button primary')}${p.complete ? control(h, r.step === 2 ? 'Zum Abschluss →' : 'Weiter →', 'next', '', '', 'next-step', 'button primary') : ''}${!level ? control(h, 'Ich brauche einen Hinweis', 'help', '1', '', '', 'text-button') : ''}</div><div class="task-navigation">${control(h, '← Zurück', 'back', '', '', '', 'text-button')}${control(h, 'Schritt neu bearbeiten', 'reset', '', '', '', 'text-button')}</div></section></div>${model()}${footer()}</main>`;
}
