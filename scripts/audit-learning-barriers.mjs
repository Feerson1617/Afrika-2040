import { writeFileSync, readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
registerHooks({
  load(url, context, next) {
    if (/\.(css|jpg|png)$/.test(url))
      return {
        format: 'module',
        source: 'export default ' + JSON.stringify(url.split('/').at(-1)),
        shortCircuit: true,
      };
    return next(url, context);
  },
});
const { tasksFor } = await import('../src/learning/tasks.ts');
const { implementedUnits, chapters } =
  await import('../src/learning/catalog.ts');
const { profileIds } = await import('../src/learning/profiles.ts');
const { materialView } = await import('../src/learning/material-view.ts');
const { taskWords, allWords } = await import('../src/learning/words.ts');
const draft = {
  answers: {},
  help: 0,
  factual: 'ungraded',
  process: 'draft',
  explored: [],
};
const optionalTerms = new Set([
  'Atmosphäre',
  'Vegetationszeit',
  'Projektion',
  'Urbanisierung',
  'Wertschöpfung',
  'Investition',
  'Ressourcen',
  'Sozial',
  'Wirtschaftlich',
  'Ökologisch',
]);
const measurements = JSON.parse(
  readFileSync(
    'docs/evidence/lernhindernisse/initial-view-measurements.json',
    'utf8',
  ),
);
const rows = [];
for (const unit of implementedUnits)
  for (const profile of profileIds)
    for (const t of tasksFor(unit, profile)) {
      const html = materialView(t, profile, draft);
      const targeted =
        (t.id.startsWith('demand.now') &&
          t.fields.some((f) => f.id === 'capacity') &&
          profile !== 'foerder') ||
        (t.id.startsWith('share.paid') &&
          t.fields.some((f) => f.id === 'free') &&
          profile !== 'foerder') ||
        (t.id.startsWith('area.total') &&
          t.fields.some((f) => f.id === 'total') &&
          profile !== 'foerder');
      const scaffold =
        ['foerder', 'esa'].includes(profile) &&
        /^(nature.concepts|economy.data.access|economy.conditions.proof|water.base|demand.explore)/.test(
          t.id,
        );
      rows.push({
        unit,
        chapter:
          chapters.find((c) => c.areas.includes(unit))?.name ??
          'Gemeinsamer Rückblick',
        profile,
        taskId: t.id,
        fields: t.fields.map((f) => ({
          id: f.id,
          question: f.label,
          kind: f.kind,
          options: f.options,
        })),
        objective: t.title,
        learningAction: t.fields.some((f) => f.kind === 'text')
          ? 'erklären / beurteilen (menschlich zu prüfen)'
          : t.fields.some((f) => f.kind === 'integer')
            ? 'rechnen oder ablesen: anhand Material und Aufgabenauftrag zu unterscheiden'
            : t.personal
              ? 'eigene Vorstellung äußern, unbewertet'
              : 'erkennen / vergleichen / entscheiden: konkrete Teilhandlung noch zu sichten',
        materials: { html, source: t.material, focus: t.focus ?? null },
        priorKnowledge: taskWords(t).map(([term, definition]) => ({
          term,
          definition,
        })),
        technicalTerms: taskWords(t),
        abbreviations: [
          ...new Set(html.match(/\b(?:GE|WE|BIP|GEPA|Min|Std)\b/g) ?? []),
        ],
        quantitiesUnitsSigns: [
          ...new Set(
            (html + ' ' + t.fields.map((f) => f.label).join(' ')).match(
              /\b\d+(?:[,.]\d+)?\b|[%×−+]/g,
            ) ?? [],
          ),
        ],
        initialViewMeasurement: measurements.steps.find(
          (r) => r.unit === unit && r.profile === profile && r.taskId === t.id,
        ),
        languageBarriers: {
          review: 'offen außerhalb gezielter Fundstellen',
          questions: t.fields.map((f) => f.label),
        },
        unnecessaryInformation: targeted
          ? 'Zusätzliche Modellansicht entfernt; nur Recheneingaben im Material. Andere Fälle noch zu prüfen.'
          : 'Noch im konkreten Aufgabenkontext zu prüfen',
        misinterpretations: targeted
          ? 'Ablesen einer fertigen Antwort kann als eigenständiges Rechnen erscheinen.'
          : 'Noch im konkreten Aufgabenkontext zu prüfen',
        help: {
          standard: ['foerder', 'esa'].includes(profile),
          levels: t.hints,
        },
        answerSuitability:
          'IDs und Sollwerte unverändert; vollständige didaktische Einzelprüfung noch offen',
        prematureSolution: targeted
          ? 'Fertiges Ergebnis in sichtbarem Material, SVG und ARIA vor eigenem Rechnen entfernt. Förderung bleibt erklärt.'
          : 'Noch im konkreten Aufgabenkontext zu prüfen',
        interactionBarriers:
          'Noch mit tatsächlichem Browserzustand abzugleichen',
        alternative: targeted
          ? 'Nur Eingabewerte, Rechenzeichen und Frage zeigen. Vollansicht nach Hilfe 3 oder richtiger Rechnung.'
          : scaffold
            ? 'Hinweise auf die konkrete Teilfrage beziehen.'
            : 'Keine Änderung allein aus automatischer Erfassung ableiten.',
        rationale: targeted
          ? 'Der Auftrag verlangt eine Rechnung. Das Ergebnis im Material ersetzt diese Denkleistung.'
          : scaffold
            ? 'Eine Hilfestufe muss den nächsten Denkschritt der sichtbaren Teilfrage unterstützen.'
            : 'Eine erfolgreiche Testantwort ist kein didaktisches Urteil.',
        finding:
          targeted || scaffold ? 'Hindernis festgestellt und behoben' : null,
        implementationStatus:
          targeted || scaffold
            ? 'Gezielte Korrektur implementiert; restliche Prüfdimensionen offen'
            : 'Inventar erfasst, Einzelprüfung offen',
        actualVerification:
          targeted || scaffold
            ? [
                'tests/learning-barriers.test.ts; Browsernachprüfung separat protokolliert',
              ]
            : [],
        reviewComplete: false,
      });
    }
writeFileSync(
  'docs/afrika-lernhindernisse-audit.json',
  JSON.stringify(
    {
      baseCommit: '542eab3176d79a509ab29cdf648c3f5a1fb9faf4',
      completeAudit: false,
      notice:
        'Vollständiges Inventar, noch keine vollständige didaktische Prüfung. Offene Angaben sind ausdrücklich nicht als geeignet freigegeben.',
      variants: 52,
      steps: rows.length,
      glossary: allWords.map(([term, definition]) => ({
        term,
        definition,
        category: optionalTerms.has(term) ? 'B' : 'A',
        review: optionalTerms.has(term)
          ? 'Für Vertiefung sinnvoll; Alltagsbeschreibung trägt zunächst die Lernhandlung. Fachbegriff freiwillig erreichbar.'
          : 'Für die zugehörige Lernhandlung oder ihre fachliche Grenze erforderlich. Definition konkret geprüft; Einsatz und Erstauftreten pro Aufgabe weiter zu prüfen.',
      })),
      stepsAudit: rows,
    },
    null,
    2,
  ) + '\n',
);

console.log({
  steps: rows.length,
  targeted: rows.filter((r) => r.finding).length,
});
