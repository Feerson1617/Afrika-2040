import { control, optionOf, weighting } from './shared.ts';
import type { StudySpec, StudyState, StudyUI, StudyPanel } from './types.ts';
export const studyPanels = ['plan', 'benefit', 'limit'] as const;
export function decisionView(spec: StudySpec, r: StudyState, h: StudyUI) {
  const d = r.decision,
    selected = optionOf(spec, r.data, d),
    options = spec.options(r.data),
    panel = r.panel ?? 'plan';
  const titles: Record<StudyPanel, string> = {
    plan: '1. Vorschlag und Ziel',
    benefit: '2. Passenden Beleg wählen',
    limit: '3. Grenze und Gewichtung',
  };
  const nav = `<nav class="study-tabs" aria-label="Drei Abschnitte deiner Begründung">${studyPanels.map((k) => control(h, titles[k], 'panel', k, '', 'study-panel-' + k, 'button secondary').replace('data-op=', `${panel === k ? 'aria-current="step" ' : ''}data-op=`)).join('')}</nav>`;
  const facts = selected
    ? `<section class="study-facts" aria-label="Angaben für deinen Vorschlag">${panel !== 'plan' ? `<p><strong>Mein Vorschlag:</strong> ${h.esc(selected.label)}</p><p><strong>Mein Ziel:</strong> ${d.goal ? h.esc(spec.goals[d.goal]) : 'noch offen'}</p>` : ''}${selected.facts.map((t) => `<p>${h.esc(t)}</p>`).join('')}</section>`
    : '';
  let body = '';
  if (panel === 'plan')
    body = `<fieldset><legend>Mein Vorschlag</legend>${options.map((o) => h.radio('study-proposal', o.id, o.label, d.proposal === o.id, o.eligible === false)).join('')}</fieldset>${facts}<fieldset><legend>Mein Ziel</legend>${Object.entries(
      spec.goals,
    )
      .map(([id, t]) => h.radio('study-goal', id, t, d.goal === id))
      .join(
        '',
      )}</fieldset>${control(h, 'Passenden Beleg wählen →', 'panel', 'benefit', '', 'study-to-benefit', 'button secondary', !selected || !d.goal)}`;
  else if (!selected || !d.goal)
    body = `<p>Wähle zuerst deinen Vorschlag und dein Ziel.</p>${control(h, 'Zum Vorschlag', 'panel', 'plan')}`;
  else if (panel === 'benefit')
    body = `${facts}<fieldset><legend>Welcher Beleg stützt meinen Vorschlag?</legend>${options.map((o) => h.radio('study-benefit', o.id, o.benefit, d.benefit === o.id)).join('')}${h.radio('study-benefit', 'all', 'Mein Vorschlag löst alle Probleme.', d.benefit === 'all')}</fieldset>${control(h, 'Eine Grenze benennen →', 'panel', 'limit', '', 'study-to-limit', 'button secondary', !d.benefit)}`;
  else
    body = `${facts}${d.benefit ? `<p class="study-chosen-evidence"><strong>Mein gewählter Beleg:</strong> ${h.esc(options.find((o) => o.id === d.benefit)?.benefit ?? 'Mein Vorschlag löst alle Probleme.')}</p>` : ''}<fieldset><legend>Welche Grenze bleibt bei meinem Vorschlag?</legend>${options.map((o) => h.radio('study-limit', o.id, o.limit, d.limit === o.id)).join('')}${h.radio('study-limit', 'none', 'Es bleibt keine Grenze.', d.limit === 'none')}</fieldset>${d.goal !== selected.goal ? `<section class="goal-note"><p>Dein Beleg erklärt dein Ziel noch nicht. Welche Folge ist dir wichtiger?</p>${control(h, 'Ich passe mein Ziel an', 'answer', selected.goal, 'goal', 'study-adjust-goal')}${h.radio('study-weighted', 'yes', h.esc(weighting(spec, r.data, { ...d, weighted: true })), Boolean(d.weighted))}</section>` : ''}<details id="study-own-words" ${d.text ? 'open' : ''}><summary>Mit eigenen Worten · freiwillig</summary><label for="study-text">Mein Vorschlag, mein Beleg und eine Grenze</label><textarea id="study-text" name="study-text" rows="3" maxlength="1500">${h.esc(d.text)}</textarea><p class="small-note">Dein Text wird nicht automatisch geprüft.</p>${control(h, 'Eigenen Text unbewertet abgeben', 'submit', '', '', 'study-submit', 'button secondary', !d.text.trim())}</details><details><summary>Weiterdenken · freiwillig</summary><p>Welche weitere Information brauchst du für eine echte Entscheidung? Welche Folgen sind sicher und welche nur möglich?</p></details>`;
  return `${nav}<h3 id="study-decision-title" tabindex="-1">${titles[panel]}</h3><section class="study-decision-part" aria-labelledby="study-decision-title">${body}</section>`;
}
