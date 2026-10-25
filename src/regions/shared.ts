import { result, textNotice } from '../feedback.ts';
import type { Evaluation } from '../feedback.ts';
import type {
  StudyData,
  StudyDecision,
  StudyOption,
  StudySpec,
  StudyUI,
} from './types.ts';
export const emptyData = (): StudyData => ({
  chain: [],
  selection: 'base',
  allocations: {},
  answers: {},
  explored: [],
  checked: [],
});
export function validData(d: unknown): d is StudyData {
  const x = d as StudyData;
  const strings = (v: unknown) =>
    Array.isArray(v) &&
    v.length <= 12 &&
    new Set(v).size === v.length &&
    v.every((t) => typeof t === 'string' && t.length <= 80);
  return Boolean(
    x &&
    typeof x === 'object' &&
    strings(x.chain) &&
    strings(x.explored) &&
    strings(x.checked) &&
    typeof x.selection === 'string' &&
    x.selection.length <= 80 &&
    x.answers &&
    typeof x.answers === 'object' &&
    !Array.isArray(x.answers) &&
    Object.keys(x.answers).length <= 20 &&
    Object.entries(x.answers).every(
      ([k, v]) => k.length <= 80 && typeof v === 'string' && v.length <= 120,
    ) &&
    x.allocations &&
    typeof x.allocations === 'object' &&
    !Array.isArray(x.allocations) &&
    Object.entries(x.allocations).length <= 5 &&
    Object.entries(x.allocations).every(
      ([k, v]) => k.length <= 80 && Number.isInteger(v) && v >= 0 && v <= 120,
    ) &&
    (x.why === undefined || (typeof x.why === 'string' && x.why.length <= 120)),
  );
}
export function parts(
  checks: { name: string; chosen?: string; correct: string }[],
  failures: number,
  explanation: string,
): Evaluation {
  const right = checks.filter((x) => x.chosen === x.correct),
    missing = checks.some((x) => !x.chosen);
  const ack = right.length
    ? 'Das passt schon: ' + right.map((x) => x.name).join(', ') + '. '
    : '';
  if (missing)
    return result(
      right.length ? 'partial' : 'hint',
      'Ergänze deinen Vergleich',
      ack + 'Wähle für jede Frage eine Antwort.',
    );
  if (right.length === checks.length)
    return result('correct', '✓ Dein Vergleich passt', explanation, true);
  return result(
    failures >= 1 ? 'hint' : right.length ? 'partial' : 'incorrect',
    '↺ Prüfe den Zusammenhang',
    ack +
      (failures >= 1
        ? explanation + ' Du kannst das Beispiel bewusst übernehmen.'
        : 'Vergleiche die Angaben in der Szene.'),
    false,
    true,
  );
}
export function optionOf(
  spec: StudySpec,
  data: StudyData,
  d: StudyDecision,
): StudyOption | undefined {
  return spec
    .options(data)
    .find((o) => o.id === d.proposal && o.eligible !== false);
}
export function weighting(spec: StudySpec, data: StudyData, d: StudyDecision) {
  const o = optionOf(spec, data, d);
  return o && d.weighted
    ? `Mir ist wichtiger: ${spec.goals[o.goal]} Dafür nehme ich in Kauf: ${o.limit}`
    : '';
}
export function evaluateStudyDecision(
  spec: StudySpec,
  data: StudyData,
  d: StudyDecision,
  failures: number,
  persisted: boolean,
): Evaluation {
  const o = optionOf(spec, data, d);
  if (!o || !d.goal)
    return result(
      'hint',
      'Wähle deinen Vorschlag und dein Ziel',
      'Dein Vorschlag und dein Ziel sind noch offen.',
    );
  if (d.ungraded && d.text.trim())
    return result(
      'neutral',
      'Bewusst unbewertet abgegeben',
      textNotice(persisted, 'in den Angaben zu deinem Vorschlag'),
      true,
    );
  const good = d.benefit === o.id,
    limit = d.limit === o.id;
  const ack = [
    good ? 'Dein Beleg passt: ' + o.benefit : '',
    limit ? 'Du beachtest die Grenze: ' + o.limit : '',
  ]
    .filter(Boolean)
    .join(' ');
  if (d.text.trim() && !(good && limit))
    return result(
      'neutral',
      'Dein eigener Gedanke',
      ack +
        ' ' +
        textNotice(persisted, 'in den Angaben zu deinem Vorschlag') +
        ' Prüfe die Bausteine oder gib deinen Text bewusst unbewertet ab.',
    );
  if (!d.benefit || !d.limit)
    return result(
      good || limit ? 'partial' : 'hint',
      'Ergänze deine Begründung',
      ack + ' Wähle einen Beleg und eine Grenze.',
    );
  if (!good || !limit) {
    const options = spec.options(data);
    const wrong = [
      !good
        ? options.find((x) => x.id === d.benefit)
          ? `Dein Beleg gehört zu: ${options.find((x) => x.id === d.benefit)!.label}. ${options.find((x) => x.id === d.benefit)!.benefit}`
          : 'Dein Vorschlag löst nicht alle Probleme.'
        : '',
      !limit
        ? options.find((x) => x.id === d.limit)
          ? `Deine Grenze gehört zu: ${options.find((x) => x.id === d.limit)!.label}.`
          : 'Bei deinem Vorschlag bleibt eine Grenze.'
        : '',
    ]
      .filter(Boolean)
      .join(' ');
    return result(
      failures >= 1 ? 'hint' : good || limit ? 'partial' : 'incorrect',
      'Dein Argument ist noch nicht verbunden',
      [
        ack,
        wrong,
        failures >= 1
          ? 'Unten steht ein passendes Beispiel. Du kannst es bewusst übernehmen.'
          : 'Behalte passende Teile. Prüfe die Angaben zu deinem Vorschlag.',
      ]
        .filter(Boolean)
        .join(' '),
      false,
      true,
    );
  }
  if (d.goal !== o.goal && !d.weighted)
    return result(
      'neutral',
      'Dein Argument ist noch nicht verbunden',
      ack +
        ` Dein Ziel ist: ${spec.goals[d.goal]} Dein Beleg zeigt: ${spec.goals[o.goal]} Passe dein Ziel an oder gewichte diese konkrete Folge ausdrücklich höher.`,
    );
  return result(
    'neutral',
    d.supported
      ? 'Mit Unterstützung begründet'
      : 'Deine Empfehlung mit Bausteinen',
    ack +
      ' ' +
      (weighting(spec, data, d) || 'Dein Beleg stützt dein Ziel.') +
      ' Unterschiedliche Ziele können zu unterschiedlichen Empfehlungen führen.',
    true,
  );
}
export function decisionExample(
  spec: StudySpec,
  data: StudyData,
  d: StudyDecision,
): StudyDecision | undefined {
  const o = optionOf(spec, data, d);
  if (!o || !d.goal) return;
  return {
    ...d,
    benefit: o.id,
    limit: o.id,
    weighted: d.goal !== o.goal,
    supported: true,
    ungraded: undefined,
  };
}
export function product(spec: StudySpec, data: StudyData, d: StudyDecision) {
  return productParts(spec, data, d).join(' ');
}
export function productParts(
  spec: StudySpec,
  data: StudyData,
  d: StudyDecision,
) {
  const o = optionOf(spec, data, d);
  return o
    ? [
        `Ich empfehle: ${o.label}.`,
        `Mein Beleg: ${o.benefit}`,
        d.weighted ? weighting(spec, data, d) : 'Aber: ' + o.limit,
        spec.conclusion?.(data, d) ?? '',
      ]
    : [];
}
export const control = (
  h: StudyUI,
  text: string,
  op: string,
  value = '',
  field = '',
  id = '',
  cls = 'button secondary',
  disabled = false,
) =>
  h.button(
    text,
    'study',
    cls,
    `data-op="${op}" data-value="${value}" data-field="${field}" ${id ? `id="${id}"` : ''} ${disabled ? 'disabled' : ''}`,
  );
export const choice = (
  h: StudyUI,
  d: StudyData,
  key: string,
  value: string,
  text: string,
) => h.radio('study-' + key, value, text, d.answers[key] === value);
export function svgChoice(
  h: StudyUI,
  id: string,
  label: string,
  shape: string,
  selected: boolean,
  value: string,
) {
  return `<g id="study-scene-${id}" role="button" tabindex="0" data-action="study" data-op="select" data-value="${value}" aria-label="${h.esc(label)} ausprobieren" aria-pressed="${selected}">${shape}</g>`;
}
