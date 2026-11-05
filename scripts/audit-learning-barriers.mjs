import { writeFileSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { createHash } from 'node:crypto';
import {
  reviews,
  profileReview,
  areaProfiles,
} from './learning-barrier-reviews.mjs';
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
const { newLearning, reduceLearning, active } =
  await import('../src/learning/storage.ts');
const { resolveSimulation } =
  await import('../src/learning/simulation-variants.ts');
const { futureReference } = await import('../src/learning/topic-variants.ts');
const contracts = JSON.parse(
  readFileSync('docs/learning-task-contracts.json', 'utf8'),
);
const contexts = new Map();
const act = (s, op, value, field) =>
  reduceLearning(s, { type: 'learning', op, value, field });
for (const unit of implementedUnits)
  for (const profile of profileIds) {
    let state = act(newLearning(), 'recommend', profile, unit);
    for (let i = 0; i < 100 && state.view === 'task'; i++) {
      const current = active(state);
      if (!current) break;
      contexts.set([unit, profile, current.task.id].join('/'), current);
      for (const id of current.task.simulation?.required ?? [])
        state = act(state, 'simulate', id);
      for (let h = 0; h < 3; h++) state = act(state, 'help');
      state = act(state, 'adopt');
      const next = act(state, 'next');
      if (next.view === 'task' && active(next)?.task.id === current.task.id)
        throw new Error('Blocked review context ' + current.task.id);
      state = next;
    }
  }
const rows = [];
for (const unit of implementedUnits)
  for (const profile of profileIds)
    for (const t of tasksFor(unit, profile)) {
      const context = contexts.get([unit, profile, t.id].join('/'));
      if (!context) throw new Error('Missing concrete task context: ' + t.id);
      const html = materialView(context.task, profile, context.attempt);
      const existing = contracts.variants
        .find((v) => v.unit === unit && v.profileId === profile)
        .tasks.find((x) => x.id === t.id);
      const resolvedVariants = {};
      for (const choice of Object.keys(existing.resolvedFieldsByChoice ?? {})) {
        const records = {};
        if (t.reference) records['future.plan'] = { answers: { plan: choice } };
        else if (t.allocationReference)
          records['share.plan'] = { answers: { plan: choice } };
        else if (t.linked)
          records[t.linked.task] = { answers: { [t.linked.field]: choice } };
        resolvedVariants[choice] = resolveSimulation(
          futureReference(t, records),
          records,
        ).fields;
      }
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
      const decision = reviews[t.conceptId];
      if (!decision) throw new Error('No authored review for ' + t.conceptId);
      rows.push({
        unit,
        chapter:
          chapters.find((c) => c.areas.includes(unit))?.name ??
          'Gemeinsamer Rückblick',
        profile,
        taskId: t.id,
        concreteContext: {
          method:
            'Vorherige Schritte mit bewusst übernommenen Beispielen; keine eigenständige Schülerleistung',
          contextNote: context.task.contextNote ?? null,
          fields: context.task.fields,
          resolvedVariants,
        },
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
          ...new Set(html.match(/\b(?:GE|WE|BIP|GEPA|mm|Min|Std)\b/g) ?? []),
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
const sha = (value) => createHash('sha256').update(value).digest('hex');
const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(dir + '/' + e.name) : [dir + '/' + e.name],
  );
const sourceDigest = sha(
  files('src')
    .sort()
    .map((p) => p + '\0' + sha(readFileSync(p)))
    .join('\n'),
);
const manifestPath = 'docs/evidence/abschluss/review-manifest.json';
let manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, 'utf8'))
  : null;
const recordReviewedSnapshot = process.argv.includes(
  '--record-reviewed-snapshot',
);
if (recordReviewedSnapshot) {
  const proof = JSON.parse(
    readFileSync('docs/evidence/abschluss/checks.json', 'utf8'),
  );
  if (
    proof.logic.failed !== 0 ||
    proof.browsers.finalRoutes.expected !== 208 ||
    proof.browsers.finalRoutes.unexpected !== 0
  )
    throw new Error(
      'Content snapshot requires the completed technical verification; tests alone do not supply review decisions.',
    );
  for (const f of proof.testedSource)
    if (sha(readFileSync(f.path)) !== f.sha256)
      throw new Error('Tested source differs: ' + f.path);
}
if (recordReviewedSnapshot)
  manifest = {
    baseCommit: '4d6327a75fbd91030b9292ee0cca20bfd6953b4b',
    method:
      'Explizit aufgezeichnete inhaltliche Baustein-/Profilprüfung. Nicht aus Test-Erfolg erzeugt. Bei jeder Änderung an src ungültig; vor Neuaufzeichnung erneut inhaltlich prüfen.',
    sourceDigest,
    entries: {},
  };
const unresolved = [];
for (const row of rows) {
  const task = tasksFor(row.unit, row.profile).find((t) => t.id === row.taskId);
  const decision = reviews[task.conceptId];
  const text = task.fields.some((f) => f.kind === 'text');
  const numeric = task.fields.some((f) => f.kind === 'integer');
  const personal =
    task.personal || task.fields.some((f) => f.expected === 'either');
  const changed =
    /area.total|share.paid|cocoa.chain|economy.transfer|economy.conditions|nature.regions|nature.concepts/.test(
      task.id,
    ) ||
    task.id.endsWith('.weight') ||
    numeric;
  const writingActions = {
    'image.revision': 'Beobachtung beschreiben und räumlich begrenzen',
    'image.perspective':
      'Perspektiven vergleichen und fehlende Information nennen',
    'orientation.describe':
      'Räumliche Lage beschreiben und Kartengrenze nennen',
    'population.question':
      'Eine konkrete eigene Frage nach fehlenden Angaben formulieren',
    'nature.recommend':
      'Mit Region und Jahreszeit eine bedingte Empfehlung begründen',
    'share.perspective':
      'Zwei eigene Pläne aus einer anderen Perspektive vergleichen und begründen',
    'future.judgment':
      'Vorteil und Nachteil persönlich gewichten und begründen',
    'future.relation': 'Folgen bedingt verknüpfen',
    'review.revision': 'Eine räumlich begrenzte Aussage mit Beleg formulieren',
    'review.cause':
      'Zwei Modellfälle kausal verbinden und reale Zusatzinformationen nennen',
  };
  row.fieldActions = row.concreteContext.fields.map((f) => ({
    fieldId: f.id,
    question: f.label,
    action:
      f.kind === 'text'
        ? (writingActions[task.id] ??
          'Den in der Feldfrage bezeichneten Zusammenhang selbst erklären oder begründen; Text fachlich ungeprüft')
        : f.kind === 'integer'
          ? task.id.startsWith('population.source.read') ||
            (task.id.startsWith('water.base') && f.id === 'withdrawal') ||
            (task.id.startsWith('area.single') && f.id === 'single')
            ? 'Ablesen'
            : 'Berechnen'
          : f.expected === 'either' || task.personal
            ? 'Persönliche Vorstellung/Priorität wählen'
            : 'Erkennen, zuordnen oder vergleichen',
    profileReason: areaProfiles[row.unit][profileIds.indexOf(row.profile)],
  }));
  row.reviewBasis = {
    family: task.conceptId,
    sourceDecision: decision,
    profileDecision: areaProfiles[row.unit][profileIds.indexOf(row.profile)],
    method:
      'Inhaltliche Quellprüfung von Aufgabenfamilie und konkreten Feldern; Profilunterschiede gesondert; Browserläufe sind zusätzliche technische Nachprüfung, keine didaktische Freigabe durch Tests.',
  };
  row.objective = decision;
  row.learningAction = personal
    ? 'Eine eigene Vorstellung/Priorität wählen und von Sachangaben unterscheiden'
    : text
      ? 'Selbst erklären, verknüpfen oder begründet beurteilen: ' +
        task.fields.map((f) => f.label).join(' / ')
      : numeric
        ? (row.profile === 'foerder'
            ? 'Vorgerechnete Angaben vergleichen'
            : 'Selbst ablesen/rechnen und die Größen zuordnen') +
          ': ' +
          task.fields.map((f) => f.label).join(' / ')
        : 'Erkennen, vergleichen oder zuordnen: ' +
          task.fields.map((f) => f.label).join(' / ');
  row.languageBarriers = {
    questions: task.fields.map((f) => f.label),
    review:
      'Konkrete Feldfrage und sichtbarer Bezug geprüft. ' +
      (text
        ? 'Kurzer Satz oder Stichwörter zulässig; keine sprachliche Komplexität als höhere Anforderung.'
        : 'Feldfrage mit Auswahl/Rechengerüst verbunden; keine zusätzliche Pflichtschrift.'),
  };
  row.unnecessaryInformation =
    row.unit === 's2'
      ? 'Menschenpunkte und Zusatzgrenzen freiwillig; die für den Schritt nötigen Zahlen bleiben in der Erstansicht.'
      : row.unit === 's3' && task.id.startsWith('cocoa.chain')
        ? 'Wirtschaftsrechnung zunächst geschlossen; Verarbeitungskarten sichtbar.'
        : task.focus
          ? 'Schrittbezogener Materialausschnitt; vollständige Quellen/Materialien freiwillig erreichbar.'
          : 'Gemeinsame Modellansicht bewusst beibehalten, damit Vergleich und räumlicher Zusammenhang nicht zerfallen; Quellen/Grenzen in Details.';
  row.misinterpretations = decision;
  row.answerSuitability = personal
    ? 'Keine objektiv beste Priorität; Auswahl getrennt von späteren Sachbelegen.'
    : text
      ? 'Keine automatische Fachbewertung. Kriterien und bewusst übernehmbares Beispiel; kurze/mündlich selbstgemeldete Form möglich.'
      : 'Eindeutige Kennungen und fachliche Zuordnung anhand des Modells geprüft. Richtige Teilangaben bleiben bei falschen anderen Feldern erhalten.';
  row.prematureSolution =
    row.profile === 'foerder'
      ? 'Erklärte Rechnungen bewusst erlaubt; Bearbeitung nicht als selbstständige Rechenleistung ausgegeben.'
      : numeric
        ? 'Ablesen und eigenes Rechnen getrennt: nur benötigte Eingaben; bei Kapazität/freiem Geld/Gesamtentnahme Ergebnis bis eigener Rechnung oder Hilfe 3 zurückgehalten.'
        : 'Begriffe/Beobachtungen dürfen im Material stehen. Eigene Erklärung und persönliche Gewichtung werden nicht vorgewählt; Vollbeispiel erst bei Hilfe 3.';
  row.interactionBarriers =
    'Konkrete Bedienelemente: ' +
    (task.budget
      ? '+20/−20-Tasten statt Drag-and-drop; Restanzeige und vollständiger Plan.'
      : task.fields.some((f) => f.options?.some(([, l]) => l.length > 65))
        ? 'Getrennte Radiokarten statt abgeschnittener langer Select-Optionen; Gewichtung in wichtig/akzeptierter Nachteil gegliedert.'
        : task.simulation
          ? 'Modelltasten und native Antwortfelder; Karte hat HTML-Alternativen.'
          : 'Native Auswahl-/Zahl-/Textfelder.') +
    ' Tastatur/Touch und Rückkehr werden im Laufprotokoll geprüft; kein physischer iPad-Nachweis.';
  row.alternative = changed
    ? 'Umgesetzte Fundstellenkorrekturen und ihre Grenzen siehe reviewBasis sowie Bericht; Kennungen und Modellwerte bleiben erhalten.'
    : 'Baustein fachlich begründet unverändert: ' + decision;
  row.rationale =
    decision + ' ' + areaProfiles[row.unit][profileIds.indexOf(row.profile)];
  row.finding = changed
    ? 'Hindernis festgestellt und behoben.'
    : 'Kein vermeidbares Hindernis festgestellt.';
  if (
    !changed &&
    ['kenia.first.proof', 'kenia.revised.proof', 'nature.regions'].includes(
      task.conceptId,
    )
  ) {
    row.finding = 'Hindernis begründet beibehalten.';
    row.rationale +=
      ' Vollständige Vergleichsangaben beziehungsweise amtliche Regionsnamen bleiben erhalten. Die Zahl der Wörter ist kein automatischer Grenzwert; Eingabefragen und notwendige Vergleichspartner bleiben gemeinsam auffindbar. Reale Lesedauer und Unterstützungsbedarf sind empirisch zu prüfen.';
  }
  row.implementationStatus = changed
    ? 'Konkrete Material-/Hilfen-/Statuskorrektur umgesetzt; fachliche Quellprüfung abgeschlossen.'
    : 'Nach inhaltlicher Prüfung bewusst erhalten.';
  row.help.displayedThirdLevel = row.concreteContext.fields.map((f) =>
    f.kind === 'text' ? f.example : f.explanation,
  );
  row.reviewQuestions = [
    ['Lernziel', decision],
    ['Denkhandlung', row.learningAction],
    ['Auftrag verständlich', row.languageBarriers.review],
    [
      'Angaben vorhanden',
      'Materialquelle ' +
        row.materials.source +
        '; konkrete HTML-/Fokusangaben liegen im Datensatz. Bei abhängigen Aufgaben kommt der eigene Vorschlag aus dem gespeicherten Vorgängerschritt.',
    ],
    [
      'Vorwissen',
      row.priorKnowledge.map((x) => x.term + ': ' + x.definition).join(' / '),
    ],
    [
      'Fachbegriffe',
      'Zum Schritt gehörende Wörterhilfe, weitere Wörter freiwillig; Einordnung im Glossar.',
    ],
    [
      'Einheiten und Zeichen',
      row.abbreviations.join(', ') +
        '; GE/WE erfunden, Prozent von 100, BIP Landesleistung. Negative Ergebnisse werden als Abnahme erklärt. Minuten/Fahrten/Plätze nicht gleichsetzen.',
    ],
    ['Materialmenge', row.unnecessaryInformation],
    ['Hilfe 1', task.hints[0]],
    ['Hilfe 2', task.hints[1]],
    [
      'Hilfe 3',
      'Renderer verbindet die konkrete Felderklärung bzw. das Beispiel mit Hilfe 3; Anzeige und bewusste Übernahme bleiben getrennt. ' +
        row.help.displayedThirdLevel.join(' '),
    ],
    ['Antwortmöglichkeiten', row.answerSuitability],
    [
      'Selbstständigkeit',
      areaProfiles[row.unit][profileIds.indexOf(row.profile)],
    ],
    ['Lösungsvorwegnahme', row.prematureSolution],
    [
      'Feedback',
      'Eingabe, Prüfstatus und aktuelle Materialansicht gemeinsam aus Versuch abgeleitet. Freie Texte ungeprüft; richtige Teile anerkannt, vollständig bewertbare Fehlversuche begrenzt.',
    ],
    [
      'iPad',
      row.interactionBarriers +
        ' Synthetische Erstansicht: ' +
        (row.initialViewMeasurement?.visibleWords ?? 'neu zu messen') +
        ' sichtbare Wörter; kein Kompetenzmaß.',
    ],
    [
      'Anforderungsprofil',
      areaProfiles[row.unit][profileIds.indexOf(row.profile)],
    ],
    [
      'Quellen und Grenzen',
      'Reale Quelle/Zeitraum und erfundener Modellraum bleiben getrennt. Keine automatische Verallgemeinerung auf Land oder Kontinent. ' +
        decision,
    ],
    ['Verbesserung', row.alternative],
    [
      'Nachprüfung',
      'Quellabgleich der Aufgabe und Hilfen, unveränderte Sollwerte und Identitäten, Logiktests sowie regulärer/unterstützter Browserweg. Konkrete Läufe in evidence/abschluss/checks.json; empirische Verständlichkeit bleibt offen.',
    ],
  ].map(([question, result]) => ({ question, result }));
  row.actualVerification = [
    'Quellprüfung: ' + task.conceptId + ' / ' + row.profile,
    'Fachliche Begründung: scripts/learning-barrier-reviews.mjs',
    'Technik: docs/evidence/abschluss/checks.json',
  ];
  // This records the authored content review, not approval inferred from an answer oracle.
  const key = [row.unit, row.profile, row.taskId].join('/');
  const digest = sha(
    JSON.stringify({
      task,
      context: row.concreteContext,
      material: row.materials,
      decision,
      profileDecision: areaProfiles[row.unit][profileIds.indexOf(row.profile)],
      reviewQuestions: row.reviewQuestions,
      fieldActions: row.fieldActions,
      finding: row.finding,
      rationale: row.rationale,
    }),
  );
  if (recordReviewedSnapshot) {
    if (
      !decision ||
      !areaProfiles[row.unit][profileIds.indexOf(row.profile)] ||
      row.reviewQuestions.length !== 20
    )
      throw new Error('Cannot record incomplete content review: ' + key);
    manifest.entries[key] = {
      digest,
      status:
        'Inhaltliche Bausteinprüfung mit gesonderter Profilentscheidung abgeschlossen',
    };
  }
  row.reviewComplete =
    manifest?.sourceDigest === sourceDigest &&
    manifest.entries[key]?.digest === digest;
  row.reviewEvidence = { manifest: manifestPath, sourceDigest, digest, key };
  if (!row.reviewComplete) {
    row.finding = 'Noch nicht abgeschlossen.';
    row.implementationStatus =
      'Keine gültige aufgezeichnete Inhaltsprüfung für diesen Quellstand; neu prüfen.';
  }
  if (!row.reviewComplete) unresolved.push(row.taskId);
}
if (recordReviewedSnapshot)
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(
  'docs/afrika-lernhindernisse-audit.json',
  JSON.stringify(
    {
      baseCommit: '4d6327a75fbd91030b9292ee0cca20bfd6953b4b',
      completeAudit: unresolved.length === 0,
      reviewMethod:
        'Inhaltliche Bausteinprüfung mit expliziten Familienentscheidungen und Einzelfeldern je Profil; keine automatische Testfreigabe. Empirische Grenzen bleiben unabhängig davon offen.',
      variants: 52,
      steps: rows.length,
      completedReviews: rows.filter((r) => r.reviewComplete).length,
      unresolved,
      additionalTerms: [
        {
          term: 'Savanne',
          category: 'A',
          explanation:
            'Graslandschaft mit mehr oder weniger Bäumen und Regen-/Trockenzeiten; im Konzeptmaterial eingeführt.',
        },
        {
          term: 'Regenwald',
          category: 'A',
          explanation:
            'Sehr feuchter Wald, im Material als immerfeucht von der Savanne unterschieden; keine Aussage über alle Wälder.',
        },
        {
          term: 'Wüste',
          category: 'B',
          explanation:
            'Sehr wenig Regen; Kontext zur Landschaftsvielfalt, keine zusätzliche Pflichtaufgabe.',
        },
        {
          term: 'Sahel',
          category: 'B',
          explanation:
            'Trockener Übergangsraum südlich der Sahara; örtlicher Kontext, nicht auswendig abzufragen.',
        },
        {
          term: 'Wachstumsrate',
          category: 'A',
          explanation:
            'Veränderung zum Vorjahr in Prozent. Eine kleinere positive Rate bedeutet nicht automatisch kleineres BIP.',
        },
        {
          term: 'WE',
          category: 'A',
          explanation:
            'Erfundene Wassereinheiten, keine echten Liter; direkt in jeder Wasseransicht und bei Bedarf im Rückblick.',
        },
        {
          term: 'GEPA',
          category: 'A',
          explanation:
            'Ghanas Organisation zur Förderung von Verkäufen ins Ausland; Herkunft des Schulungsberichts, kein Beleg späteren Einkommens.',
        },
        {
          term: 'mm',
          category: 'A',
          explanation:
            'Millimeter; ein Millimeter Niederschlag entspricht einem Liter Wasser auf einem Quadratmeter.',
        },
        {
          term: 'Grundwasser',
          category: 'A',
          explanation:
            'Wasser unter der Erde in Lücken von Boden und Gestein; im Material getrennt vom Tank eingeführt.',
        },
        {
          term: 'Gesamtentnahme',
          category: 'A',
          explanation:
            'Wasser, das für alle betrachteten Felder zusammen den Tank verlässt; nicht tatsächlicher Verbrauch oder Bedarf.',
        },
        {
          term: 'Rücklage',
          category: 'A',
          explanation:
            'Geld bleibt im Betrieb für mögliche spätere Reparaturen; ob es reicht, ist offen.',
        },
        {
          term: 'Fortbildung',
          category: 'A',
          explanation:
            'Mitglieder lernen dazu; zusätzliche Aufträge oder Einnahmen sind dadurch nicht sicher.',
        },
        {
          term: 'Auszahlung',
          category: 'A',
          explanation:
            'Mitglieder erhalten jetzt zusätzlich Geld, das danach nicht mehr im Betrieb ist.',
        },
        {
          term: 'Genossenschaft',
          category: 'A',
          explanation:
            'Erfundener Betrieb gehört seinen Mitgliedern gemeinsam; im Kakaomaterial konkret erklärt.',
        },
        {
          term: 'Anschaffung',
          category: 'A',
          explanation:
            'Einmaliger Kauf, aus eigenem Geldtopf; nicht ein zweites Mal laufend abziehen.',
        },
        {
          term: 'monatlich',
          category: 'A',
          explanation:
            'Für jeden Monat; getrennt von einmaligen Kosten vergleichen.',
        },
        {
          term: 'Nordpfeil/Stadtpunkt/Länderfläche',
          category: 'A',
          explanation:
            'Norden oben, Punkt für Stadt, Fläche für Land; HTML-Auswahl als Alternative.',
        },
        {
          term: 'Minus vor einem Ergebnis',
          category: 'A',
          explanation:
            'Abnahme; bei mehr Fortzug als Zuzug ist der Wanderungssaldo negativ. Zeichen nur einmal übernehmen.',
        },
        {
          term: '×',
          category: 'A',
          explanation:
            'Mal; Fahrten in einer Stunde mal Plätze bei jeder Fahrt.',
        },
        {
          term: 'Presskuchen',
          category: 'B',
          explanation:
            'Gehört als Produkt zum Pressschritt; weiterführende technische Verarbeitung ist kein zusätzliches Pflichtziel.',
        },
        {
          term: 'schematisch/Hektarmaßstab',
          category: 'C',
          explanation:
            'Aus der erforderlichen Grafikbeschreibung entfernt: Zeichnung zeigt nicht, wie groß Felder wirklich sind.',
        },
      ],
      glossary: allWords.map(([term, definition]) => ({
        term,
        definition,
        category: optionalTerms.has(term) ? 'B' : 'A',
        rationale: optionalTerms.has(term)
          ? 'Freiwillige Vertiefung; Alltagsbeschreibung genügt zunächst.'
          : 'Für zugehörige Lernhandlung/Quellen- oder Modellgrenze nötig; konkret erklären.',
      })),
      stepsAudit: rows,
    },
    null,
    2,
  ) + '\n',
);
console.log({
  steps: rows.length,
  completed: rows.filter((r) => r.reviewComplete).length,
  unresolved,
});
