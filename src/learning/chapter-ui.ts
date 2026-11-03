import { integerFormatHint } from './language.ts';
import './style.css';
import { chapters, unitNames, implementedUnits, type Unit } from './catalog.ts';
import { profileIds, profiles } from './profiles.ts';
import {
  active,
  canContinue,
  newLearning,
  type LearningState,
  type Attempt,
} from './storage.ts';
import { tasksFor, type Task } from './tasks.ts';
import { evaluate } from './progress.ts';
import { escapeHtml as esc, materialView } from './material-view.ts';
import { resetNotice } from '../reset.ts';
import { resolveSimulation } from './simulation-variants.ts';
import { futureReference } from './topic-variants.ts';
import { explanationFor } from './help.ts';
import { wordHelp } from './words.ts';
const button = (label: string, op: string, value = '', extra = '') =>
  `<button type="button" class="button secondary" data-action="learning" data-op="${op}" data-value="${value}" ${extra}>${label}</button>`;
const support = (a: Attempt, simple = false) =>
  a.exampleUsed
    ? 'Beispiel genutzt'
    : a.help
      ? 'Hilfe angesehen'
      : a.standardScaffold
        ? simple
          ? 'Du siehst einen Hinweis'
          : 'Du siehst einen Hinweis'
        : 'Du hast noch kein Beispiel geöffnet';
const historySupport: Record<string, string> = {
  example: 'Beispiel genutzt',
  standard: 'Du siehst einen Hinweis',
  help: 'Hilfe angesehen',
  own: 'Ohne Hilfe abgegeben',
};
const historyFactual: Record<string, string> = {
  correct: 'Angaben passen',
  partial: 'Ein Teil passt',
  incorrect: 'Angaben passen noch nicht',
  ungraded: 'Eigener Text nicht geprüft',
  na: 'Keine fachliche Bewertung',
};
function status(a: Attempt, simple = false) {
  if (simple)
    return `${a.process === 'draft' ? 'Deine Antwort ist noch offen.' : 'Deine Antwort ist gespeichert.'} ${a.factual === 'correct' ? 'Richtig. Diese Angaben passen.' : a.factual === 'partial' ? 'Ein Teil stimmt schon. Prüfe die anderen Angaben noch einmal.' : a.factual === 'incorrect' ? 'Die Angaben passen noch nicht.' : a.factual === 'na' && a.process !== 'draft' ? 'Du entscheidest, was dir wichtiger ist.' : a.form === 'written' || a.oral ? 'Die App kann nicht prüfen, ob deine Erklärung fachlich richtig ist. Besprich sie mit jemandem.' : 'Wähle deine Antwort. Drücke dann „Angaben prüfen“.'} ${a.exampleUsed ? 'Du hast ein Beispiel genutzt.' : a.help ? 'Du hast Hilfe angesehen.' : ''}`;
  return `${a.process === 'draft' ? 'Antwort noch offen' : a.process === 'explained' ? 'Mit Erklärung bearbeitet' : 'Abgegeben'} · ${a.factual === 'correct' ? 'Angaben geprüft' : a.factual === 'partial' ? 'Ein Teil passt' : a.factual === 'incorrect' ? 'Angaben passen noch nicht' : 'Noch nicht geprüft'} · ${support(a)}${a.oral ? ' · Du möchtest mündlich erklären. Das Gespräch wurde nicht geprüft' : ''}${a.criteriaSeen ? ' · Kriterien zur Selbstkontrolle angesehen' : ''}${a.revised ? ' · danach überarbeitet' : ''}`;
}
function explorationHint(task: Task): string {
  const kind = task.simulation?.kind;
  if (kind === 'orientation')
    return 'Wähle das gesuchte Land auf der Karte oder mit einer Taste darunter.';
  if (kind === 'network')
    return 'Wähle die genannte Person. Teste die in der Aufgabe genannten Linien nacheinander. Vergleiche ihre Wege.';
  if (kind === 'demand')
    return 'Teste zuerst die zusätzliche Fahrt. Teste danach den kürzeren Fußweg. Vergleiche Plätze und Gehzeit.';
  if (kind === 'water')
    return 'Teste zuerst die Reparatur. Teste danach die neue Verteilung. Vergleiche die Zahlen.';
  if (kind === 'cocoa')
    return 'Teste zuerst Lagerung und Qualität. Teste danach die zusätzliche Presse. Vergleiche Einnahmen und Ausgaben.';
  if (kind === 'share')
    return 'Tippe Auszahlung, Rücklage und Fortbildung nacheinander an. Lies, was jeder Zweck bewirkt.';
  return task.simulation?.required?.length === 1
    ? 'Wähle zuerst den Plan für dasselbe Feld. Lies die Zahlen.'
    : 'Teste zuerst denselben Acker. Teste danach das zusätzliche Feld. Vergleiche die Wassermengen.';
}
function optionText(task: Task, field: string, label: string): string {
  const parts =
    field === 'weight' &&
    task.linked &&
    label.match(/^Mir ist wichtig: (.+) Dafür akzeptiere ich: (.+)$/);
  return parts
    ? `<strong>Mir ist wichtig:</strong> ${esc(parts[1])}<br><strong>Dafür nehme ich in Kauf:</strong> ${esc(parts[2])}`
    : esc(label);
}
function fields(task: Task, p: Attempt) {
  if (task.budget)
    return '<p>Baue deinen Plan mit den +20- und −20-Tasten im Material. Erst bei Rest 0 ist er vollständig.</p>';
  return task.fields
    .map((f) =>
      (task.focus || task.simulation) &&
      f.kind === 'choice' &&
      f.options!.some(([, label]) => label.length > 65)
        ? `<fieldset class="learning-long-choice" id="learn-${f.id}"><legend>${esc(f.label)}</legend>${f.options!.map(([id, label]) => `<label class="choice" for="learn-${f.id}-${id}"><input id="learn-${f.id}-${id}" type="radio" name="learning-choice-${f.id}" data-field="${f.id}" value="${esc(id)}" ${p.answers[f.id] === id ? 'checked' : ''}><span>${optionText(task, f.id, label)}</span></label>`).join('')}</fieldset>`
        : `<label class="inquiry-field" for="learn-${f.id}">${esc(f.label)}${f.kind === 'text' ? `<textarea id="learn-${f.id}" name="learning-answer" data-field="${f.id}" rows="3" maxlength="2000">${esc(p.answers[f.id] ?? '')}</textarea>` : f.kind === 'integer' ? `<input type="text" id="learn-${f.id}" name="learning-answer" data-field="${f.id}" inputmode="text" maxlength="80" autocomplete="off" aria-describedby="learning-number" value="${esc(p.answers[f.id] ?? '')}">` : `<select id="learn-${f.id}" name="learning-answer" data-field="${f.id}"><option value="">Bitte wählen</option>${f.options!.map(([id, label]) => `<option value="${id}" ${p.answers[f.id] === id ? 'selected' : ''}>${esc(label)}</option>`).join('')}</select>`}</label>`,
    )
    .join('');
}
export function renderLearning(
  value: LearningState | undefined,
  header: string,
  restartPending: boolean,
  hasLegacy: boolean,
) {
  const s = value ?? newLearning();
  const nav = `<nav class="inquiry-nav" aria-label="Kapitel und Lernweg">${button('Startseite', 'home')}${button('Kapitel', 'menu')}${button('Lernweg ändern', 'profiles')}${button('Lernjournal', 'journal')}</nav>`;
  const open =
    header +
    `<main id="main" class="inquiry-screen learning-screen" tabindex="-1">${nav}`;
  const footer = `<footer>${button('Alle Antworten in diesem Tab löschen', 'ask-reset')} ${restartPending ? `<p class="restart-confirm">${resetNotice}<button type="button" data-action="restart">Ja, neu starten</button><button type="button" data-action="cancel-restart">Abbrechen</button></p>` : ''}</footer></main>`;
  if (s.pendingProfile)
    return (
      open +
      `<h1>Lernweg wechseln?</h1><p>${s.pendingUnit ? 'Dieser Link empfiehlt einen anderen Lernweg. ' : ''}Deine bisherigen Antworten bleiben gespeichert. Jeder Lernweg hat eigene Aufgaben. Im neuen Lernweg musst du die Aufgaben neu bearbeiten.</p><p>Bisher: ${s.profile ? profiles[s.profile].name : 'noch kein Lernweg'}. Öffnen: ${profiles[s.pendingProfile].name}${s.pendingUnit ? ` · ${unitNames[s.pendingUnit]}` : ''}</p>${button('Diesen Lernweg öffnen', 'confirm-profile')}${button('Beim bisherigen Lernweg bleiben', 'cancel-profile')}` +
      footer
    );
  if (s.view === 'profiles')
    return (
      open +
      `<h1>Wähle deinen Lernweg</h1><p>Alle Wege sind für die 7. Klasse. Du lernst dieselben Grundlagen. Die Aufgaben und Hilfen sind unterschiedlich.</p><p>Deine Lehrkraft kann dir einen Weg empfehlen. Du kannst ihn später wechseln. Die App sagt nicht, welcher Weg für dich richtig ist.</p><div class="inquiry-menu">${profileIds.map((id) => `<section><h2>${profiles[id].name}</h2><p>${profiles[id].description}</p>${button('Diesen Lernweg wählen', 'request-profile', id)}</section>`).join('')}</div><details><summary>Zuordnung für die Lehrkraft</summary>${profileIds.map((id) => `<p>${profiles[id].name}: ${profiles[id].teacher}</p>`).join('')}<p>Förder ersetzt keinen individuellen Förderplan. AHR/ÜOS ist hier für Jahrgang 7. Sprachliche Hilfe bleibt in allen Wegen verfügbar.</p></details>` +
      footer
    );
  if (s.view === 'journal')
    return (
      open +
      `<h1>Lernjournal · Lernwege</h1><p>Die App prüft deine Auswahl und deine Rechnungen. Eigene Erklärungen musst du noch mit jemandem besprechen. Eine fertige Seite zeigt noch nicht, ob du alles selbst erklären kannst.</p>${Object.entries(
        s.records,
      )
        .sort(
          ([, a], [, b]) =>
            Number(
              Object.values(b.attempts).some((p) => p.submissions.length),
            ) -
            Number(Object.values(a.attempts).some((p) => p.submissions.length)),
        )
        .map(
          ([key, r]) =>
            `<details class="journal-record" ${key === `${s.unit}.${s.profile}.v1` ? 'open' : ''}><summary><h2>${unitNames[key.split('.')[0] as Unit]} · ${profiles[key.split('.')[1] as keyof typeof profiles].name}</h2></summary><p>Kapitel: ${chapters.find((c) => (c.areas as readonly string[]).includes(key.split('.')[0]))?.name ?? ''}</p>${Object.entries(
              r.attempts,
            )
              .map(([taskId, a]) => {
                const sourceTask = tasksFor(
                  key.split('.')[0] as Unit,
                  a.identity.profileId,
                ).find((t) => t.id === taskId)!;
                const task = resolveSimulation(
                  futureReference(sourceTask, r.attempts),
                  r.attempts,
                );
                return `<article><h3>${esc(task.title)}</h3>${task.contextNote ? `<p>${esc(task.contextNote)}</p>` : ''}<p>${status(a, true)}</p>${task.fields.map((f) => `<p><strong>${esc(f.label)}</strong>: <span class="own-answer">${esc(f.options?.find(([id]) => id === a.answers[f.id])?.[1] ?? a.answers[f.id] ?? 'Noch offen')}</span></p>`).join('')}${task.explained ? `<p>${esc(task.explained)}</p>` : ''}<details><summary>Details zu deiner Bearbeitung</summary><p>${status(a)}</p><p>Aufgabe: ${esc(taskId)} · Variante: ${esc(a.identity.variantId)} · Versuch: ${esc(a.identity.attemptId)}</p><p>Modell: ${esc(a.identity.modelVersion)} · Material: ${esc(a.identity.materialVersion)}</p><p>Hinweis von Anfang an sichtbar: ${a.standardScaffold ? 'ja' : 'nein'}; freiwillige Hilfe: ${a.help}; Beispiel angezeigt: ${a.exampleShown ? 'ja' : 'nein'}; bewusst genutzt: ${a.exampleUsed ? 'ja' : 'nein'}.</p><p>${a.submissions.length} gespeicherte Antworten${a.olderSubmissions ? `, ${a.olderSubmissions} ältere Antworten nur noch gezählt` : ''}. Freie Texte bleiben ungeprüft.</p>${a.submissions.map((item, index) => `<details><summary>Frühere gespeicherte Antwort ${a.olderSubmissions + index + 1} · ${esc(historySupport[item.support] ?? item.support)}</summary>${task.fields.map((f) => `<p>${esc(f.label)}: ${esc(item.labels?.[f.id] ?? f.options?.find(([id]) => id === item.answers[f.id])?.[1] ?? item.answers[f.id] ?? 'Noch offen')}</p>`).join('')}<p>Prüfung dieser früheren Antwort: ${esc(historyFactual[item.factual] ?? item.factual)}. Eigene Texte sind ungeprüft.</p></details>`).join('')}</details></article>`;
              })
              .join('')}</details>`,
        )
        .join('')}<details><summary>Noch nicht begonnene Bereiche</summary><p>${
        s.profile
          ? implementedUnits
              .filter((u) => !s.records[`${u}.${s.profile}.v1`])
              .map((u) => unitNames[u])
              .join(' · ')
          : 'Wähle zunächst einen Lernweg.'
      }</p></details>${hasLegacy ? legacyLink() : ''}` +
      footer
    );
  const a = active(s);
  if (s.view !== 'task' || !a?.attempt)
    return (
      open +
      `<h1>Fünf Kapitel · Orte verstehen. Entscheidungen prüfen.</h1><p>2040 ist unser Zukunftsblick. Unsere Beispiele sagen die Zukunft nicht voraus. Du kannst jedes Kapitel direkt öffnen.</p>${s.profile ? `<p>Dein Weg: ${profiles[s.profile].name}</p>${s.unit && s.records[`${s.unit}.${s.profile}.v1`] ? button('Weiterarbeiten', 'unit', s.unit, 'id="learning-resume"') : ''}` : button('Lernweg wählen', 'profiles', '', 'id="learning-open"')}<div class="inquiry-menu" id="learning-chapters">${chapters
        .map(
          (c) =>
            `<section><h2>${c.name}</h2>${c.areas
              .filter((id) => implementedUnits.includes(id as Unit))
              .map((id) =>
                button(
                  unitNames[id as Unit],
                  'unit',
                  id,
                  `id="learn-${id === 'c' ? 'population' : id === 's1' ? 'kenya' : id === c.areas[0] && id !== 'o' ? c.topic : id}"`,
                ),
              )
              .join('')}</section>`,
        )
        .join('')}</div>${legacyLink(hasLegacy)}` +
      footer
    );

  const rawAttempt = a.attempt,
    p =
      rawAttempt.process !== 'draft' && !canContinue(a.task, rawAttempt)
        ? {
            ...rawAttempt,
            process: 'draft' as const,
            factual: evaluate(a.task, rawAttempt.answers).factual,
            adopted: false,
          }
        : rawAttempt,
    task = a.task,
    e = evaluate(task, p.answers, p.failures === 2 ? 1 : 0),
    hasText = task.fields.some((f) => f.kind === 'text');
  const carried =
    s.profile === 'esa' && task.id.endsWith('.end')
      ? (() => {
          const prefix = task.id.slice(0, -4),
            natural = a.record.attempts[prefix + '.natural']?.answers.natural,
            migration =
              a.record.attempts[prefix + '.migration']?.answers.migration;
          const start = task.material === 'm3' ? 800 : 1000;
          return `<p class="learning-scaffold">Deine geprüften Ergebnisse: ${esc(natural ?? 'noch offen')} und ${esc(migration ?? 'noch offen')}.<br>Menschen am Ende: ${start} + (${esc(natural ?? '?')}) + (${esc(migration ?? '?')}). Die Zahl zu den Umzügen hat schon ein Plus oder Minus. Übernimm das Zeichen.</p>`;
        })()
      : '';
  return (
    open +
    `<p class="eyebrow">${unitNames[s.unit!]} · Schritt ${a.index + 1} von ${a.tasks.length} · ${profiles[s.profile!].name}</p><h1>${esc(task.title)}</h1><div class="inquiry-work"><section class="inquiry-material" aria-label="Material zur Aufgabe">${materialView(task, s.profile!, p)}</section><section class="inquiry-task"><h2 id="learning-title" tabindex="-1">Dein Auftrag</h2>${task.instruction ? `<p>${esc(task.instruction)}</p>` : ''}${task.contextNote ? `<p class="learning-context">${esc(task.contextNote)}</p>` : ''}${p.standardScaffold ? `<aside class="learning-scaffold"><strong>Denkhinweis</strong><p>${esc(task.hints[0])}</p></aside>` : ''}${task.explained ? `<p>${esc(task.explained)}</p>` : ''}${carried}${task.simulation?.required?.some((id) => !p.explored?.includes(id)) ? `<p role="status">${explorationHint(task)}</p>` : ''}${fields(task, p)}${task.fields.some((f) => f.kind === 'integer') ? `<p id="learning-number" class="small-note">${integerFormatHint}</p>` : ''}${hasText ? `<p>Die App kann deinen eigenen Text nicht fachlich prüfen.</p><label class="choice"><input type="checkbox" name="learning-oral" ${p.oral ? 'checked' : ''}>Ich möchte meine Antwort mündlich geben. Die App kann das nicht prüfen.</label>` : ''}${p.submissions.length && (p.process !== 'draft' || p.factual !== 'ungraded') ? `<section class="feedback ${e.kind}" data-learning-feedback role="status"><h3 id="learning-feedback-title" tabindex="-1">${p.oral ? 'Du möchtest mündlich erklären. Noch nicht fachlich geprüft.' : esc(e.title)}</h3>${e.parts.map((f) => `<p data-finding="${f.status}"><strong>${esc(f.label)}</strong>: ${f.status === 'correct' ? 'Diese Angabe passt.' : f.status === 'missing' ? 'Noch offen; kein Fehlversuch.' : f.status === 'format' ? 'Schreibe eine eindeutige ganze Zahl oder wähle eine Angabe. Kein fachlicher Fehlversuch.' : f.status === 'unchecked' ? 'Die App kann deinen eigenen Text nicht fachlich prüfen.' : f.status === 'opinion' ? (task.personal ? 'Deine Vorstellung ist gespeichert, nicht fachlich bewertet.' : 'Du darfst so entscheiden.') : 'Diese Angabe passt noch nicht. Prüfe die passende Stelle im Material.'}</p>`).join('')}</section>` : ''}<div class="inquiry-actions">${button(hasText ? 'Antwort speichern' : 'Angaben prüfen', 'check', '', 'id="learning-check"')}${button('Hilfe', 'help', '', 'id="learning-help"')}${canContinue(task, p) ? (task.id === 'future.revision' && p.answers.revision === 'change' ? button('Anderen Plan wählen und Belege neu prüfen', 'future-revise', '', 'id="learning-revise"') : button(a.index === a.tasks.length - 1 ? 'Zum Lernjournal' : 'Weiter', 'next', '', 'id="learning-next"')) : ''}</div><p class="small-note">${p.failures ? `Noch nicht passende Antworten: ${p.failures} von 2. ${p.failures === 1 ? 'Du kannst es erneut versuchen.' : 'Lies die Erklärung. Du kannst das Beispiel übernehmen.'} ` : ''}${support(p, s.profile === 'foerder')}.</p>${
      p.help
        ? `<aside class="help-panel"><h3 id="learning-help-title" tabindex="-1">Hilfe ${p.help} von 3</h3>${
            p.help === 3
              ? task.fields
                  .filter(
                    (f) =>
                      p.failures < 2 ||
                      p.process !== 'draft' ||
                      e.parts.find((part) => part.field === f.id)?.status !==
                        'correct',
                  )
                  .map(
                    (f) =>
                      `<section><h4>${esc(f.label)}</h4><p>${esc(explanationFor(task, p, f))}</p></section>`,
                  )
                  .join('')
              : `<p>${esc(task.hints[p.help - 1])}</p>`
          }${p.help === 3 ? `${hasText ? '<p>Bei der Übernahme wird dein aktueller Text durch das angezeigte Beispiel ersetzt. Frühere Abgaben bleiben erhalten.</p>' : '<p>Passende eigene Antworten bleiben erhalten. Das Beispiel ergänzt fehlende Angaben und berichtigt Fehler.</p>'}${button('Beispiel als Antwort übernehmen', 'adopt', '', 'id="learning-adopt"')}` : button('Weitere Hilfe', 'help')}</aside>`
        : ''
    }${hasText && (p.process !== 'draft' || p.help === 3 || task.fields.some((f) => p.answers[f.id]?.trim())) ? button('Kriterien zur Selbstkontrolle öffnen', 'criteria', '', 'id="learning-criteria"') : ''}${p.criteriaSeen ? `<aside class="learning-criteria"><h3>Selbst prüfen – die App bewertet deinen Text nicht</h3><ul>${task.criteria.map((c) => `<li>${esc(c)}</li>`).join('')}</ul><p>Du kannst deine Antwort überarbeiten. Besprich deine Antwort danach mit deiner Lehrkraft oder einer anderen Person.</p></aside>` : ''}<p data-learning-status>${status(p, s.profile === 'foerder')}</p></section></div>${wordHelp(task)}<div class="inquiry-actions">${button('Zurück', 'back')}${button('Aufgabe neu bearbeiten', 'rework')}</div>` +
    footer
  );
}
function legacyLink(hasLegacy = true) {
  return `<details id="learning-legacy"><summary>Frühere Aufgaben und Ergebnisse</summary><p>Deine früheren Ergebnisse bleiben erhalten. Die neuen Lernwegaufgaben musst du selbst bearbeiten.</p><button type="button" class="button secondary" data-action="legacy-home">Bisherige Themen und Episoden öffnen</button>${hasLegacy ? '<button type="button" data-action="inquiry" data-op="journal">Bisheriges Themenjournal ansehen</button><button type="button" data-action="episode-report">Bisherige Kenia-Empfehlung ansehen</button>' : ''}</details>`;
}
