# Afrika 2040 – Gestalte die Zukunft

Fünf curriculare Untersuchungsbereiche und sechs direkt startbare Modell-Episoden für eine heterogene 7. Klasse. Reale Ortsbezüge und geprüfte Originalmaterialien werden von erfundenen Betrieben und Modellzahlen getrennt; freiwillige Worterklärungen und drei Hilfestufen unterstützen die Bearbeitung.

Der Einstieg **„Afrika untersuchen · fünf Themen“** führt zu Afrikabild, Naturraum, Bevölkerung, Wirtschaft und Nachhaltigkeit. Auf Materialauswertung folgen kurze eigene Erklärungen mit Lernjournal. Aktueller Entwicklungsstand und Grenzen: [Übergabe](docs/afrika-vollstaendig-handover.md), [curriculare Abdeckung](docs/afrika-lernziele-und-pruefbarkeit.md) und [Klassenarbeitsvorbereitung](docs/afrika-klassenarbeitsreife.md).

| Ort                  | Episode                                 | Untersuchung                                                                    |
| -------------------- | --------------------------------------- | ------------------------------------------------------------------------------- |
| Kenia / Nairobi      | 1. Welcher Busweg hilft wem?            | Drei Personen, drei Buslinien; späterer Fußweg-Umweg und erneute Empfehlung.    |
| Kenia / Nairobi      | 2. Mehr Menschen – reicht der Bus noch? | Nachfrage, zusätzliche Fahrten und kürzerer Fußweg.                             |
| Ghana / bei Kumasi   | 3. Was wird aus dem Kakao?              | Verarbeitungskette, Einnahmen, laufende Kosten und getrennter Investitionstopf. |
| Ghana / bei Kumasi   | 4. Mehr Einnahmen – mehr für alle?      | 120 freie GE auf Auszahlung, Rücklage und Fortbildung verteilen.                |
| Marokko / bei Agadir | 5. Wasser für die nächste Ernte         | Tankvorrat, Entnahme und zwei technische Maßnahmen.                             |
| Marokko / bei Agadir | 6. Gespartes Wasser – wirklich gespart? | Einsparung am gleichen Feld und höhere Gesamtentnahme bei einem Zusatzfeld.     |

Die sechs bisherigen Episoden bleiben als Modelllabore erhalten. Der curriculare Ausbau steht zur unabhängigen Prüfung bereit. Kein Push, Merge oder Deployment im aktuellen Auftrag.

## Starten

Voraussetzung: Node.js ab 22.18 (geprüft mit 24.19), npm.

```sh
npm ci
npm run dev
```

Im Browser die angegebene Adresse öffnen und eine Episode wählen. Frühere Episoden sind keine Voraussetzung. In Kenia bleiben der ursprüngliche Vergleich und das spätere Ereignis erhalten. Die neuen Episoden führen über Ausgangslage, Experiment und Begründung zu einem kurzen Lernprodukt. Die Begründung ist in Vorschlag/Ziel, Beleg und Grenze/Gewichtung gegliedert; Werte stehen neben den Antworten. Unterschiedliche begründete Empfehlungen bleiben neutral. Eigene Texte werden nicht automatisch bewertet. Übernommene Beispiele bleiben kenntlich.

„Zurück“ und „Episoden auswählen“ erhalten die Eingaben im aktuellen Tab. „Schritt neu bearbeiten“ öffnet die aktuelle Aufgabe und folgende Produkte erneut. „Neu starten“ verlangt eine Bestätigung und löscht die Episoden und die neuen Untersuchungsdaten im Tab. Der bisherige Kenia-Abschluss bietet außerdem „Neu spielen“ als unmittelbaren vollständigen Neustart; „Episoden auswählen“ erhält dagegen alle Antworten. Speicherung ist weder geräteübergreifend noch für spätere Unterrichtstage zugesichert. Gesperrter Browserspeicher verhindert das Spielen nicht.

Cloud-Arbeitsverzeichnis: `/workspace/Afrika-2040`. Wenn das Benutzerverzeichnis nicht schreibbar ist, `npm --cache /workspace/.cache/npm ci` verwenden. Im vorhandenen Checkout arbeiten; kein zusätzlicher Worktree erforderlich.

## Prüfen

```sh
npm test
npm run build
node scripts/check-dist.mjs
npx playwright test --config playwright.afrika.config.ts
```

Die Browsertests starten selbst zwei lokale Server für den Produktionsbuild. Ein vorhandenes `/usr/bin/chromium` wird verwendet. Andernfalls einmal `npx playwright install chromium` ausführen; `CHROMIUM_PATH` kann auf eine vorhandene Chromium-Datei zeigen. Neue Protokolle und wenige repräsentative Bilder werden außerhalb Git in einem separaten Abnahmeexport gebündelt. Die bisherige SVG-Namenskorrektur mit vollständigen A-/AA-Filtern liegt in `docs/evidence/episode2-correction/`; die vorherige kombinierte Prüfung liegt in `docs/evidence/episode2/`, die getrennte Phase-2B-Korrektur in `docs/evidence/gate-a/`. Die frühere Phase-2B-Prüfung liegt in `docs/evidence/phase2b/`; frühere Korrekturbelege liegen in `docs/evidence/phase2a-corrections/`; `docs/evidence/phase2a/` dokumentiert den früheren Phase-2A-Ausgangsstand. Historische Phase-1-Belege liegen in `docs/evidence/`. Neue Screenshots schreibt der Test standardmäßig nach `test-results/evidence/`. Mit `AFRIKA_EVIDENCE_DIR=mein-pruefordner npm run test:e2e -- --project=chromium` ist der Ausgabeort konfigurierbar. Aktuelle Laufberichte liegen in den ignorierten Verzeichnissen `test-results/` und `playwright-report/`.

Für WebKit muss zusätzlich der passende Playwright-Browser installiert sein (`npx playwright install webkit`). Das WebKit-Projekt umfasst die bisherigen Kenia-Korrekturen und alle neuen regionalen Episoden einschließlich der Integration. Ohne Browserinstallation scheitert es sichtbar beim Start und wird nicht als bestandene oder übersprungene Prüfung dargestellt. Der aktuelle Ausbau wurde tatsächlich in Chromium und WebKit getestet; lokale Einrichtung und Umgebungsgrenzen stehen im aktuellen Übergabebericht. `playwright.afrika.config.ts` umfasst die neuen Themen und die gezielte Regression aller sechs Episoden. Die vollständige historische Testsammlung ist weiterhin über `npm run test:e2e` verfügbar.

Die native Tastatursequenz prüft vor der fachlichen Rückmeldung den tatsächlich ausgewählten Wert. Linux ist hier geprüft. Der bestehende Mac-Helfer verwendet Leertaste → Pfeil-ab → Enter. Der aktuelle Korrekturprompt nennt 98/100 alte Chromium-Fälle auf dem Prüf-Mac und zwei leere native Auswahlwerte. Die dort beschriebene erfolgreiche manuelle Sequenz Öffnen → Home → Pfeil-ab → Enter ist hier mangels Mac nicht verifiziert. Der Testtreiberpunkt bleibt offen; die Wertprüfungen bleiben erhalten.

Für eine lokale Prüfung des fertigen Builds: `npm run preview`. Relative Ressourcenpfade unterstützen die spätere Veröffentlichung unter einem GitHub-Pages-Repositorypfad. Dieser Auftrag veröffentlicht nichts. Der vorhandene manuell auszulösende Pages-Workflow wurde nicht gestartet oder verändert.

## Fachliche und technische Übergabe

- [Früherer Ausbau Ghana/Marokko: Modelle, Quellenzugriff, Qualitäts-Gates und Grenzen](docs/ghana-marokko-development.md)
- [Verbindlicher Ausbauauftrag](docs/ghana-marokko-request.md)
- [Bisherige SVG-Namenskorrektur und Abnahmenachweis](docs/episode2-correction.md)
- [Vorherige kombinierte Übergabe und Gate B](docs/combined-handover.md)
- [Separater Abschluss der Phase-2B-Korrektur und Gate A](docs/phase2b-correction-gate.md)
- [Verbindlicher kombinierter Auftrag](docs/combined-request.md)
- [Curriculare Prüfung mit Seitenbelegen und Abwägungen](docs/curriculum.md)
- [Architektur, Lernmodell und Prüfregeln](docs/development.md)
- [Frühere Phase-2B-Übergabe: Änderungen, Tests und Grenzen](docs/phase2b-handover.md)
- [Verbindlicher Phase-2B-Auftrag](docs/phase2b-request.md)
- [Phase-2A-Korrektur nach Gegenprüfung](docs/phase2a-corrections.md)
- [Ausgangsübergabe Phase 2A vor der Gegenprüfung](docs/phase2a-handover.md)
- [Verbindlicher Phase-2A-Auftrag](docs/phase2a-request.md)
- [Historische Erstübergabe Phase 1](docs/handover.md)
- [Korrekturen nach unabhängiger Phase-1-Prüfung und erneute Prüfergebnisse](docs/phase1-corrections.md)
- [Langfristige Projektregeln](AGENTS.md)

Schülerantworten werden nur in diesem Browser-Tab gespeichert, niemals an Bewertungsdienste geschickt. Freitext wird nicht automatisch fachlich bewertet. Der Prototyp ersetzt keine vollständige Afrika-Unterrichtsreihe und keine unabhängige didaktische Prüfung.
