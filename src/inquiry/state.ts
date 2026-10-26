import {
  topicIds,
  topics,
  decisionFields,
  plans,
  type Check,
  type Field,
  type Plan,
  type TopicId,
} from './content.ts';
import type { Feedback } from '../feedback.ts';
export interface InquiryCheck {
  answers: Record<string, string>;
  failures: number;
  help: number;
  checked: boolean;
  adopted: boolean;
  exampleUsed: boolean;
  feedback?: Feedback;
}
export interface InquiryRecord {
  checks: [InquiryCheck, InquiryCheck];
  seen: string[];
  material: string;
  initial: string;
  initialSaved: boolean;
  product: [string, string, string];
  oral: boolean;
  submitted: boolean;
  productHelp: number;
  productExampleUsed: boolean;
  productAdopted: boolean;
}
export interface Inquiry {
  topic?: TopicId;
  step: 0 | 1 | 2;
  journal: boolean;
  records: Record<TopicId, InquiryRecord>;
}
export type InquiryAction = {
  type: 'inquiry';
  op:
    | 'open'
    | 'menu'
    | 'home'
    | 'topic'
    | 'journal'
    | 'next'
    | 'back'
    | 'material'
    | 'initial'
    | 'initial-save'
    | 'answer'
    | 'check'
    | 'help'
    | 'adopt'
    | 'product'
    | 'oral'
    | 'submit'
    | 'product-help'
    | 'product-adopt';
  value?: string;
  field?: string;
};
export function newCheck(): InquiryCheck {
  return {
    answers: {},
    failures: 0,
    help: 0,
    checked: false,
    adopted: false,
    exampleUsed: false,
  };
}
export function newRecord(): InquiryRecord {
  return {
    checks: [newCheck(), newCheck()],
    seen: [],
    material: '',
    initial: '',
    initialSaved: false,
    product: ['', '', ''],
    oral: false,
    submitted: false,
    productHelp: 0,
    productExampleUsed: false,
    productAdopted: false,
  };
}
export function newInquiry(): Inquiry {
  return {
    step: 0,
    journal: false,
    records: Object.fromEntries(
      topicIds.map((id) => [id, newRecord()]),
    ) as Inquiry['records'],
  };
}
export function selectedPlan(r: InquiryRecord): Plan | undefined {
  const v = r.checks[1].answers.plan;
  return v === 'cool' || v === 'shade' ? v : undefined;
}
export function checkDefinition(
  id: TopicId,
  step: 0 | 1,
  r: InquiryRecord,
): Check {
  const def = topics[id].checks[step];
  if (id !== 'future' || step !== 1) return def;
  const plan = selectedPlan(r);
  return { ...def, fields: plan ? decisionFields(plan) : [] };
}
function matches(field: Field, value: string | undefined) {
  if (value === undefined || !value.trim()) return false;
  if (field.options) return value === field.expected;
  return (
    /^[+-]?\d+$/.test(value.trim()) && Number(value) === Number(field.expected)
  );
}
function message(
  kind: Feedback['kind'],
  title: string,
  text: string,
  complete = false,
): Feedback {
  return { kind, title, text, complete };
}
export function requiredSeen(id: TopicId): string[] {
  return id === 'image'
    ? ['market', 'forest']
    : id === 'future'
      ? ['cool', 'shade']
      : [];
}
export function evaluateInquiry(
  id: TopicId,
  step: 0 | 1,
  r: InquiryRecord,
  second = false,
): { feedback: Feedback; error: boolean } {
  const p = r.checks[step],
    def = checkDefinition(id, step, r),
    plan = selectedPlan(r);
  const result = (feedback: Feedback, error = false) => ({ feedback, error });
  if (id === 'image' && !r.initialSaved)
    return result(
      message(
        'neutral',
        'Zuerst deine Vorstellung',
        'Halte zuerst eine Vorstellung fest oder wähle „Noch keine Vorstellung“. Sie wird nicht bewertet.',
      ),
    );
  if (step === 0 && requiredSeen(id).some((v) => !r.seen.includes(v)))
    return result(
      message(
        'neutral',
        'Beide Materialien ansehen',
        id === 'image'
          ? 'Öffne beide Fotos und lies Ort, Datum und Urheber. Deine bisherigen Antworten bleiben erhalten.'
          : 'Öffne beide Angebote. Vergleiche Zugang, Kosten und Umweltfolgen. Deine Antworten bleiben erhalten.',
      ),
    );
  if (
    id === 'future' &&
    step === 1 &&
    (!plan || !['loss', 'access'].includes(p.answers.goal))
  )
    return result(
      message(
        'neutral',
        'Ziel und Vorschlag fehlen noch',
        'Wähle ein Ziel und einen Vorschlag. Beide Maßnahmen sind begründbar.',
      ),
    );
  const correct = def.fields.filter((f) => matches(f, p.answers[f.id]));
  const missing = def.fields.filter((f) => !p.answers[f.id]?.trim());
  const wrong = def.fields.filter(
    (f) => p.answers[f.id]?.trim() && !matches(f, p.answers[f.id]),
  );
  const praise = correct.length
    ? 'Schon passend: ' + correct.map((f) => f.label).join('; ') + '.'
    : '';
  if (missing.length)
    return result(
      message(
        correct.length ? 'partial' : 'neutral',
        correct.length ? 'Ein Teil passt bereits' : 'Noch nicht vollständig',
        `${praise} Ergänze: ${missing.map((f) => f.label).join('; ')}. Das zählt nicht als Fehlversuch.`.trim(),
      ),
    );
  if (wrong.length)
    return result(
      message(
        second ? 'hint' : correct.length ? 'partial' : 'incorrect',
        second
          ? 'Schrittweise erklärt'
          : correct.length
            ? 'Ein Teil passt bereits'
            : 'Die Zuordnung passt noch nicht',
        `${praise} Prüfe: ${wrong.map((f) => f.label).join('; ')}.${second ? ' ' + wrong.map((f) => f.explanation).join(' ') + ' Du kannst die Erklärung nutzen oder das Beispiel bewusst übernehmen.' : ' Vergleiche diese Angaben mit dem Material. Richtige Teile kannst du behalten.'}`.trim(),
      ),
      true,
    );
  if (id === 'future' && step === 1 && plan) {
    const conflict = p.answers.goal !== plans[plan].goal;
    if (conflict && p.answers.weighting !== plans[plan].goal)
      return result(
        message(
          'neutral',
          'Belege passen – Gewichtung noch offen',
          plan === 'cool'
            ? 'Beleg, Grenze und offene Frage passen zum Kühlraum. Du möchtest möglichst viele Stände erreichen. Der Kühlraum erreicht aber 30, Dächer und Kisten erreichen 60. Passe dein Ziel an oder begründe, warum dir der Schutz empfindlicher Lebensmittel trotzdem wichtiger ist.'
            : 'Beleg, Grenze und offene Frage passen zu Dächern und Kisten. Dein Ziel ist weniger Verderb empfindlicher Lebensmittel. Schatten ersetzt aber keine Kühlung. Passe dein Ziel an oder begründe, warum dir der Zugang für 60 Stände trotzdem wichtiger ist.',
        ),
      );
    return result(
      message(
        'neutral',
        conflict
          ? 'Zielkonflikt bewusst gewichtet'
          : 'Vorschlag mit Belegen verbunden',
        `${praise} ${conflict ? weightingText(plan) : 'Dein Ziel passt zur genannten Folge.'} Die Entscheidung bleibt deine. Geprüft ist die Zuordnung; selbstständige Urteilskompetenz ist damit nicht nachgewiesen.`,
        true,
      ),
    );
  }
  return result(
    message(
      'correct',
      'Diese Angaben passen',
      'Die Materialzuordnung beziehungsweise Rechnung stimmt. Erkläre den Zusammenhang danach selbst. Eine passende Auswahl allein ist noch kein selbstständiger Leistungsnachweis.',
      true,
    ),
  );
}
export function weightingText(plan: Plan): string {
  return plan === 'cool'
    ? 'Mir ist der Schutz empfindlicher Lebensmittel wichtiger als Zugang für alle 60 Stände. Ich nehme in Kauf, dass zunächst nur 30 Stände den Kühlraum nutzen können.'
    : 'Mir ist der Zugang für 60 Stände wichtiger als die Kühlung empfindlicher Lebensmittel. Ich nehme in Kauf, dass Schatten diese Lebensmittel nicht wie ein Kühlraum schützt.';
}
export function inquiryExplanation(
  id: TopicId,
  step: 0 | 1,
  r: InquiryRecord,
): string {
  const def = checkDefinition(id, step, r);
  const plan = selectedPlan(r);
  if (id === 'future' && step === 1 && !plan)
    return 'Wähle zuerst einen Vorschlag. Dann passen Erklärung und Beispiel zu deiner Entscheidung.';
  return (
    def.fields.map((f) => f.explanation).join(' ') +
    (id === 'future' &&
    step === 1 &&
    plan &&
    r.checks[1].answers.goal !== plans[plan].goal
      ? ' Ein Zielkonflikt bleibt möglich: ' + weightingText(plan)
      : '')
  );
}
export function productExample(
  id: TopicId,
  r: InquiryRecord,
): [string, string, string] {
  if (id !== 'future') return topics[id].example;
  const plan = selectedPlan(r) ?? 'cool',
    p = plans[plan];
  return [
    `Ich empfehle ${p.name}. ${p.benefit} Die Grenze bleibt: ${p.limit}`,
    `${p.stands} Stände erhalten Zugang. Einmalig kostet die Anschaffung ${p.investment} GE, laufend ${p.running} GE pro Monat. ${p.ecology} ${weightingText(plan)}`,
    `Ich würde vor der Umsetzung klären: ${p.unknown} Bei ungeklärter Wartung ist meine Empfehlung vorläufig. Ich würde die Umsetzung davon abhängig machen, dass Zuständigkeit und Finanzierung geklärt sind.`,
  ];
}
export function checkComplete(
  id: TopicId,
  step: 0 | 1,
  r: InquiryRecord,
): boolean {
  return (
    r.checks[step].checked && evaluateInquiry(id, step, r).feedback.complete
  );
}
export function productReady(id: TopicId, r: InquiryRecord): boolean {
  return checkComplete(id, 0, r) && checkComplete(id, 1, r);
}
export function productStatus(id: TopicId, r: InquiryRecord): string {
  if (!productReady(id, r)) return 'Entwurf – Materialzuordnung noch offen';
  if (!r.submitted) return 'Entwurf – noch nicht abgegeben';
  if (r.productAdopted)
    return 'Beispiel bewusst übernommen – kein selbstständiger Leistungsnachweis';
  if (r.productExampleUsed)
    return 'Beispiel genutzt oder überarbeitet – eigener Text fachlich ungeprüft';
  if (r.oral)
    return 'Mündliche Bearbeitung vermerkt – fachlich noch nicht geprüft';
  return 'Eigene Antwort – fachlich noch nicht geprüft';
}
export function reduceInquiry(
  current: Inquiry | undefined,
  action: InquiryAction,
): Inquiry {
  const s = structuredClone(current ?? newInquiry());
  const value = action.value ?? '';
  if (action.op === 'open' || action.op === 'menu') {
    s.topic = undefined;
    s.journal = false;
    return s;
  }
  if (action.op === 'journal') {
    s.journal = true;
    return s;
  }
  if (action.op === 'topic') {
    if (topicIds.includes(value as TopicId)) {
      s.topic = value as TopicId;
      s.step = 0;
      s.journal = false;
    }
    return s;
  }
  if (!s.topic) return s;
  const id = s.topic,
    r = s.records[id];
  if (action.op === 'back') {
    if (s.step > 0) s.step = (s.step - 1) as 0 | 1;
    else s.topic = undefined;
    return s;
  }
  if (action.op === 'next') {
    if (s.step !== 2 && checkComplete(id, s.step, r))
      s.step = (s.step + 1) as 1 | 2;
    return s;
  }
  if (action.op === 'material') {
    if (requiredSeen(id).includes(value)) {
      r.material = value;
      if (!r.seen.includes(value)) r.seen.push(value);
    }
    return s;
  }
  if (action.op === 'initial') {
    r.initial = value.slice(0, 450);
    r.initialSaved = false;
    r.submitted = false;
    return s;
  }
  if (action.op === 'initial-save') {
    if (value === 'none') r.initial = 'Noch keine konkrete Vorstellung.';
    r.initialSaved = Boolean(r.initial.trim());
    return s;
  }
  if (action.op === 'product') {
    const index = Number(action.field);
    if ([0, 1, 2].includes(index)) {
      r.product[index] = value.slice(0, 700);
      r.submitted = false;
      r.productAdopted = false;
    }
    return s;
  }
  if (action.op === 'oral') {
    r.oral = value === 'true';
    r.submitted = false;
    r.productAdopted = false;
    return s;
  }
  if (action.op === 'product-help') {
    r.productHelp = Math.min(3, r.productHelp + 1);
    return s;
  }
  if (
    action.op === 'product-adopt' &&
    r.productHelp === 3 &&
    productReady(id, r)
  ) {
    r.product = productExample(id, r);
    r.productExampleUsed = true;
    r.productAdopted = true;
    r.oral = false;
    r.submitted = true;
    return s;
  }
  if (action.op === 'submit') {
    r.submitted =
      productReady(id, r) &&
      (r.oral || r.product.every((t) => t.trim().length > 0));
    return s;
  }
  if (s.step === 2) return s;
  const step = s.step,
    p = r.checks[step];
  if (action.op === 'answer' && action.field) {
    const def = checkDefinition(id, step, r),
      field = def.fields.find((f) => f.id === action.field);
    const extra =
      id === 'future' &&
      step === 1 &&
      ['plan', 'goal', 'weighting'].includes(action.field);
    if (!field && !extra) return s;
    if (
      field?.options &&
      !field.options.some(([v]) => v === value) &&
      value !== ''
    )
      return s;
    if (
      extra &&
      ![
        '',
        ...(action.field === 'plan' ? ['cool', 'shade'] : ['loss', 'access']),
      ].includes(value)
    )
      return s;
    p.answers[action.field] = value.slice(0, 80);
    // Old choices remain visible, but must fit the newly selected plan on recheck.
    if (['plan', 'goal'].includes(action.field)) delete p.answers.weighting;
    p.checked = false;
    p.feedback = undefined;
    p.adopted = false;
    r.submitted = false;
    r.productAdopted = false;
  }
  if (action.op === 'help') p.help = Math.min(3, p.help + 1);
  if (action.op === 'check') {
    const outcome = evaluateInquiry(id, step, r, p.failures >= 1);
    if (outcome.error) {
      p.failures = Math.min(2, p.failures + 1);
      if (p.failures === 2) p.help = 3;
    }
    p.feedback = outcome.feedback;
    p.checked = true;
  }
  if (action.op === 'adopt' && p.help === 3) {
    const plan = selectedPlan(r);
    if (id === 'future' && step === 1 && !plan) return s;
    for (const f of checkDefinition(id, step, r).fields)
      p.answers[f.id] = f.expected;
    if (id === 'future' && step === 1 && plan) {
      // The explicit example chooses a coherent goal; no hidden claim of a prior weighting.
      p.answers.goal = plans[plan].goal;
      delete p.answers.weighting;
    }
    p.adopted = true;
    p.exampleUsed = true;
    p.checked = true;
    p.feedback = evaluateInquiry(id, step, r).feedback;
    p.feedback.text = 'Beispiel bewusst übernommen. ' + p.feedback.text;
    r.submitted = false;
  }
  return s;
}
// Parse the optional new namespace separately: corrupt inquiry data cannot erase old episodes.
export function restoreInquiry(value: unknown): Inquiry | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return undefined;
  const raw = value as Record<string, unknown>,
    out = newInquiry();
  if (topicIds.includes(raw.topic as TopicId)) out.topic = raw.topic as TopicId;
  out.step = [0, 1, 2].includes(raw.step as number)
    ? (raw.step as 0 | 1 | 2)
    : 0;
  out.journal = raw.journal === true;
  const records = raw.records as Record<string, unknown> | undefined;
  const short = (v: unknown, max = 700) =>
    typeof v === 'string' ? v.slice(0, max) : '';
  const level = (v: unknown, max: number) =>
    Number.isInteger(v) && Number(v) >= 0 && Number(v) <= max ? Number(v) : 0;
  for (const id of topicIds) {
    const candidate = records && records[id];
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate))
      continue;
    const v = candidate as Record<string, unknown>,
      r = newRecord();
    r.initial = short(v.initial, 450);
    r.initialSaved = v.initialSaved === true && Boolean(r.initial.trim());
    if (Array.isArray(v.seen))
      r.seen = requiredSeen(id).filter((x) =>
        (v.seen as unknown[]).includes(x),
      );
    r.material = r.seen.includes(String(v.material)) ? String(v.material) : '';
    for (const step of [0, 1] as const) {
      const c = Array.isArray(v.checks) ? v.checks[step] : undefined;
      if (!c || typeof c !== 'object') continue;
      const p = r.checks[step];
      p.failures = level(c.failures, 2);
      p.help = level(c.help, 3);
      p.exampleUsed = c.exampleUsed === true;
      p.adopted = c.adopted === true && p.exampleUsed;
      if (
        c.answers &&
        typeof c.answers === 'object' &&
        !Array.isArray(c.answers)
      ) {
        if (id === 'future' && step === 1) {
          for (const key of ['plan', 'goal', 'weighting']) {
            const val = c.answers[key];
            if (
              (key === 'plan'
                ? ['cool', 'shade']
                : ['loss', 'access']
              ).includes(val)
            )
              p.answers[key] = val;
          }
        }
        for (const f of checkDefinition(id, step, r).fields) {
          const val = short(c.answers[f.id], 80);
          if (!f.options || f.options.some(([x]) => x === val))
            p.answers[f.id] = val;
        }
      }
      p.checked = c.checked === true;
      if (p.checked)
        p.feedback = evaluateInquiry(id, step, r, p.failures >= 2).feedback;
      if (
        p.adopted &&
        checkDefinition(id, step, r).fields.some(
          (f) => !matches(f, p.answers[f.id]),
        )
      )
        p.adopted = false;
    }
    if (Array.isArray(v.product))
      r.product = [0, 1, 2].map((i) =>
        short((v.product as unknown[])[i]),
      ) as InquiryRecord['product'];
    r.oral = v.oral === true;
    r.productHelp = level(v.productHelp, 3);
    r.productExampleUsed = v.productExampleUsed === true;
    r.productAdopted =
      v.productAdopted === true &&
      r.productExampleUsed &&
      r.product.every((x, i) => x === productExample(id, r)[i]);
    r.submitted =
      v.submitted === true &&
      productReady(id, r) &&
      (r.oral || r.product.every((x) => x.trim()));
    out.records[id] = r;
  }
  if (out.topic) {
    const r = out.records[out.topic];
    if (out.step > 0 && !checkComplete(out.topic, 0, r)) out.step = 0;
    else if (out.step === 2 && !checkComplete(out.topic, 1, r)) out.step = 1;
  }
  return out;
}
