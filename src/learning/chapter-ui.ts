import './style.css';
import { chapters } from './catalog.ts';
import { profileIds, profiles } from './profiles.ts';
import {
  active,
  newLearning,
  type LearningState,
  type Attempt,
} from './storage.ts';
import { tasksFor, type Task } from './tasks.ts';
import { evaluate } from './progress.ts';
import { escapeHtml as esc, materialView } from './material-view.ts';
import { resetNotice } from '../reset.ts';
const button = (label: string, op: string, value = '', extra = '') =>
  `<button type="button" class="button secondary" data-action="learning" data-op="${op}" data-value="${value}" ${extra}>${label}</button>`;
const support = (a: Attempt) =>
  a.exampleUsed
    ? 'Beispiel genutzt'
    : a.help
      ? 'Hilfe angesehen'
      : a.standardScaffold
        ? 'Mit sichtbarem Gerüst'
        : 'Ohne geöffnetes Aufgabenbeispiel';
function status(a: Attempt) {
  return `${a.process === 'draft' ? 'Entwurf' : a.process === 'explained' ? 'Mit Erklärung bearbeitet' : 'Abgegeben'} · ${a.factual === 'correct' ? 'Sachangaben geprüft' : a.factual === 'partial' ? 'Sachangaben teilweise passend' : a.factual === 'incorrect' ? 'Sachangaben noch unpassend' : 'Noch nicht fachlich geprüft'} · ${support(a)}${a.oral ? ' · mündlich selbstgemeldet, nicht beobachtet' : ''}${a.criteriaSeen ? ' · Kriterien zur Selbstkontrolle angesehen' : ''}${a.revised ? ' · danach überarbeitet' : ''}`;
}
function fields(task: Task, p: Attempt) {
  return task.fields
    .map(
      (f) =>
        `<label class="inquiry-field" for="learn-${f.id}">${esc(f.label)}${f.kind === 'text' ? `<textarea id="learn-${f.id}" name="learning-answer" data-field="${f.id}" rows="3" maxlength="2000">${esc(p.answers[f.id] ?? '')}</textarea>` : f.kind === 'integer' ? `<input type="text" id="learn-${f.id}" name="learning-answer" data-field="${f.id}" inputmode="text" maxlength="80" autocomplete="off" aria-describedby="learning-number" value="${esc(p.answers[f.id] ?? '')}">` : `<select id="learn-${f.id}" name="learning-answer" data-field="${f.id}"><option value="">Bitte wählen</option>${f.options!.map(([id, label]) => `<option value="${id}" ${p.answers[f.id] === id ? 'selected' : ''}>${esc(label)}</option>`).join('')}</select>`}</label>`,
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
      `<h1>Lernweg wechseln?</h1><p>Dein bisheriger Entwurf bleibt bei seinem Lernweg. Im anderen Weg bearbeitest du eigene Aufgaben. Es wird kein Abschluss übertragen.</p><p>Öffnen: ${profiles[s.pendingProfile].name}</p>${button('Diesen Lernweg öffnen', 'confirm-profile')}${button('Beim bisherigen Lernweg bleiben', 'cancel-profile')}` +
      footer
    );
  if (s.view === 'profiles')
    return (
      open +
      `<h1>Wähle deinen Lernweg</h1><p>Deine Lehrkraft kann dir einen Weg empfehlen. Du kannst ihn später wechseln. Es gibt keine Rangliste und keine automatische Einstufung.</p><div class="inquiry-menu">${profileIds.map((id) => `<section><h2>${profiles[id].name}</h2><p>${profiles[id].description}</p>${button('Diesen Lernweg wählen', 'request-profile', id)}</section>`).join('')}</div><details><summary>Zuordnung für die Lehrkraft</summary>${profileIds.map((id) => `<p>${profiles[id].name}: ${profiles[id].teacher}</p>`).join('')}<p>Förder ersetzt keinen individuellen Förderplan. AHR/ÜOS ist hier für Jahrgang 7. Sprachliche Hilfe bleibt in allen Wegen verfügbar.</p></details>` +
      footer
    );
  if (s.view === 'journal')
    return (
      open +
      `<h1>Lernjournal · Lernwege</h1><p>Bearbeitung ist kein Kompetenznachweis. Eigene Texte, Selbstkontrolle und mündliche Selbstauskunft sind nicht automatisch fachlich bewertet.</p>${Object.entries(
        s.records,
      )
        .map(
          ([key, r]) =>
            `<section class="journal-record"><h2>${key.startsWith('c.') ? 'Bevölkerung' : 'Kenia · früher Vergleich'} · ${profiles[key.split('.')[1] as keyof typeof profiles].name}</h2>${Object.entries(
              r.attempts,
            )
              .map(([taskId, a]) => {
                const task = tasksFor(
                  key.startsWith('c.') ? 'c' : 's1',
                  a.identity.profileId,
                ).find((t) => t.id === taskId)!;
                return `<article><h3>${esc(task.title)}</h3><p>${status(a)}</p>${task.fields.map((f) => `<p><strong>${esc(f.label)}</strong>: <span class="own-answer">${esc(f.options?.find(([id]) => id === a.answers[f.id])?.[1] ?? a.answers[f.id] ?? 'Noch offen')}</span></p>`).join('')}${task.explained ? `<p>${esc(task.explained)}</p>` : ''}<details><summary>Herkunft und geprüfter Umfang</summary><p>Aufgabe: ${esc(taskId)} · Variante: ${esc(a.identity.variantId)} · Versuch: ${esc(a.identity.attemptId)}</p><p>Modell: ${esc(a.identity.modelVersion)} · Material: ${esc(a.identity.materialVersion)}</p><p>Standardgerüst: ${a.standardScaffold ? 'ja' : 'nein'}; freiwillige Hilfe: ${a.help}; Beispiel angezeigt: ${a.exampleShown ? 'ja' : 'nein'}; bewusst genutzt: ${a.exampleUsed ? 'ja' : 'nein'}.</p><p>${a.submissions.length} protokollierte Antwortversuche${a.olderSubmissions ? `, ${a.olderSubmissions} ältere Versuche verdichtet` : ''}. Freie Texte bleiben ungeprüft.</p>${a.submissions.map((item, index) => `<details><summary>Frühere Antwortabgabe ${a.olderSubmissions + index + 1} · ${esc(item.support)}</summary>${task.fields.map((f) => `<p>${esc(f.label)}: ${esc(f.options?.find(([id]) => id === item.answers[f.id])?.[1] ?? item.answers[f.id] ?? 'Noch offen')}</p>`).join('')}<p>Prüfstatus zum Antwortinhalt: ${esc(item.factual)}. Eigene Texte sind ungeprüft.</p></details>`).join('')}</details></article>`;
              })
              .join('')}</section>`,
        )
        .join('')}${hasLegacy ? legacyLink() : ''}` +
      footer
    );
  const a = active(s);
  if (s.view !== 'task' || !a?.attempt)
    return (
      open +
      `<h1>Fünf Kapitel · Orte verstehen. Entscheidungen prüfen.</h1><p>2040 ist unser Zukunftsblick. Unsere Beispiele sagen die Zukunft nicht voraus.</p><p>Entwicklungsprototyp: Bevölkerung vollständig in vier Lernwegen; Kenia bisher nur der frühe Vergleich. Die anderen Aufgaben bleiben im bisherigen Lernweg erreichbar.</p>${!s.profile ? button('Lernweg wählen', 'profiles') : `<p>Dein Weg: ${profiles[s.profile].name}</p>`}<div class="inquiry-menu">${chapters.map((c) => `<section><h2>${c.name}</h2>${c.id === 'people' ? `${button('Bevölkerung · vier Lernwege', 'unit', 'c', 'id="learn-population"')}${button('Kenia · früher Vergleich in vier Lernwegen', 'unit', 's1', 'id="learn-kenya"')}` : ''}<button type="button" data-action="inquiry" data-op="topic" data-value="${c.topic}">Bisherigen Themenweg öffnen</button>${c.episodes.map((id) => `<button type="button" data-action="study" data-op="start" data-episode="${id}">${id === 'water' ? 'Wasserlabor' : id === 'area' ? 'Zusatzfläche' : id === 'cocoa' ? 'Kakaoverarbeitung' : 'Verteilung'} direkt starten</button>`).join('')}${c.id === 'people' ? '<button type="button" data-action="start">Kenia Episode 1 direkt starten</button><button type="button" data-action="demand-start">Kenia Episode 2 direkt starten</button>' : ''}</section>`).join('')}</div>${hasLegacy ? legacyLink() : ''}` +
      footer
    );
  const p = a.attempt,
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
          return `<p class="learning-scaffold">Deine geprüften Teilwerte: ${esc(natural ?? 'noch offen')} und ${esc(migration ?? 'noch offen')}.<br>Endbestand: ${start} + (${esc(natural ?? '?')}) + (${esc(migration ?? '?')}). Der Wanderungssaldo steht schon mit seinem Vorzeichen da.</p>`;
        })()
      : '';
  return (
    open +
    `<p class="eyebrow">${s.unit === 'c' ? 'Menschen und Wege · Bevölkerung' : 'Menschen und Wege · Kenia'} · ${a.index + 1} von ${a.tasks.length} · ${profiles[s.profile!].name}</p><h1>${esc(task.title)}</h1><div class="inquiry-work"><section class="inquiry-material" aria-label="Material zur Aufgabe">${materialView(task, s.profile!, p)}</section><section class="inquiry-task"><h2 id="learning-title" tabindex="-1">Dein Auftrag</h2><p>${esc(task.instruction)}</p>${p.standardScaffold ? `<aside class="learning-scaffold"><strong>Denkhinweis</strong><p>${esc(task.hints[0])}</p></aside>` : ''}${task.explained ? `<p>${esc(task.explained)}</p>` : ''}${carried}${fields(task, p)}${task.fields.some((f) => f.kind === 'integer') ? '<p id="learning-number" class="small-note">Ganze Zahlen: -10 und −10 sowie 1020 und 1.020 gelten gleich. Unklare Schreibweisen zählen nicht als Rechenfehler.</p>' : ''}${hasText ? `<label class="choice"><input type="checkbox" name="learning-oral" ${p.oral ? 'checked' : ''}>Ich möchte mündlich erklären. Das ist nur meine Selbstmeldung, noch keine beobachtete Besprechung.</label>` : ''}${p.submissions.length && (p.process !== 'draft' || p.factual !== 'ungraded') ? `<section class="feedback ${e.kind}" data-learning-feedback role="status"><h3 id="learning-feedback-title" tabindex="-1">${p.oral ? 'Mündliche Bearbeitung selbstgemeldet – fachlich ungeprüft' : esc(e.title)}</h3>${e.parts.map((f) => `<p data-finding="${f.status}"><strong>${esc(f.label)}</strong>: ${f.status === 'correct' ? 'Diese Angabe passt.' : f.status === 'missing' ? 'Noch offen; kein Fehlversuch.' : f.status === 'format' ? 'Schreibe eine eindeutige ganze Zahl oder wähle eine Angabe. Kein fachlicher Fehlversuch.' : f.status === 'unchecked' ? 'Eigener Text, fachlich ungeprüft.' : f.status === 'opinion' ? 'Deine Priorität ist legitim.' : 'Diese Angabe passt noch nicht. Sieh den zugehörigen Materialteil an.'}</p>`).join('')}</section>` : ''}<div class="inquiry-actions">${button(hasText ? 'Antwort abgeben (ohne Fachbewertung)' : 'Angaben prüfen', 'check', '', 'id="learning-check"')}${button('Hilfe', 'help', '', 'id="learning-help"')}${p.process !== 'draft' ? button(a.index === a.tasks.length - 1 ? 'Zum Lernjournal' : 'Weiter', 'next', '', 'id="learning-next"') : ''}</div><p class="small-note">Fachliche Fehlversuche: ${p.failures} von 2. ${support(p)}.</p>${
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
                      `<section><h4>${esc(f.label)}</h4><p>${esc(f.kind === 'text' ? (f.example ?? '') : f.explanation)}</p></section>`,
                  )
                  .join('')
              : `<p>${esc(task.hints[p.help - 1])}</p>`
          }${p.help === 3 ? button('Dieses Beispiel bewusst übernehmen', 'adopt', '', 'id="learning-adopt"') : button('Nächste Hilfestufe', 'help')}</aside>`
        : ''
    }${hasText && (p.process !== 'draft' || p.help === 3 || task.fields.some((f) => p.answers[f.id]?.trim())) ? button('Kriterien zur Selbstkontrolle öffnen', 'criteria', '', 'id="learning-criteria"') : ''}${p.criteriaSeen ? `<aside class="learning-criteria"><h3>Selbstkontrolle – keine fachliche Freigabe</h3><ul>${task.criteria.map((c) => `<li>${esc(c)}</li>`).join('')}</ul><p>Du kannst deine Antwort überarbeiten. Eine Besprechung mit Lehrkraft oder Partner ist ein eigener Unterrichtsschritt.</p></aside>` : ''}<p>${status(p)}</p></section></div><details id="learning-words"><summary>Wörter und Aufgaben kurz erklärt</summary><p>Geburten: Menschen kommen zur Welt. Sterbefälle: Menschen sterben. Zuzug: Menschen ziehen in den Ort. Fortzug: Menschen ziehen aus dem Ort weg.</p><p>Natürliche Veränderung: Geburten minus Sterbefälle. Wanderungssaldo: Zuzug minus Fortzug. Bestand: Zahl der Menschen zu einem Zeitpunkt.</p><p>Fußweg: Weg zu Fuß. Busabschnitt: nur der Teil der Linie, den die Person mitfährt. Gesamtzeit: Fußweg plus benutzte Busfahrt.</p><p>Beschreibe: Sage, was im Material steht. Erkläre: Sage, wie Angaben zusammenhängen. Begründe: Nutze einen passenden Beleg für deine Wahl.</p></details><div class="inquiry-actions">${button('Zurück', 'back')}${button('Aufgabe neu bearbeiten', 'rework')}</div>` +
    footer
  );
}
function legacyLink() {
  return '<aside><h2>Bisheriger Lernweg, ohne Niveaueinstufung</h2><p>Frühere Ergebnisse bleiben erhalten. Sie bestätigen keine neue Profilaufgabe.</p><button type="button" data-action="inquiry" data-op="journal">Bisheriges Themenjournal ansehen</button><button type="button" data-action="episode-report">Bisherige Kenia-Empfehlung ansehen</button></aside>';
}
