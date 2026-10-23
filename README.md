# Afrika 2040 – Gestalte die Zukunft

Ein kurzer Geographie-Lernprototyp für eine heterogene 7. Klasse: **„Welcher Busweg hilft wem?“** in einer ausdrücklich erfundenen Nachbarschaft in Nairobi. Vergleiche Fußweg und Busfahrt, erkläre einen Zusammenhang und begründe eine Empfehlung. **Phase 2A** führt nach dem Vergleich von Amina und David die dritte Person Leila und den Busweg über Süd ein. Nach den sechs bisherigen Lernschritten erweitert **Phase 2B** dieselbe Episode um ein erfundenes Fußweg-Ereignis: entdecken, Folgen erklären und die ursprüngliche Empfehlung erneut prüfen. Weitere Episoden sind nicht implementiert.

## Starten

Voraussetzung: Node.js ab 22.18 (geprüft mit 24.19), npm.

```sh
npm ci
npm run dev
```

Im Browser die vom Entwicklungsserver angegebene Adresse öffnen. „Spiel starten“ führt direkt zur Karte. Zuerst Aminas Fußweg und Busfahrt wählen, dann die beiden bisherigen Buswege vergleichen und Aminas kürzere Gesamtzeit erklären. Anschließend für Leila vermuten und alle drei Wege testen. Zum Schluss in vier kurzen Abschnitten eine Buslinie, ein Ziel, einen Vorteil und einen Nachteil für eine andere Person wählen. Bei einem Zielkonflikt das Ziel bewusst ändern oder eine konkrete andere Folge stärker gewichten. Satzbausteine und eigene Texte sind möglich; eigene Texte bleiben unbewertet. „Wörter erklären“ und dreistufige Aufgabenhilfen sind freiwillig. Nach der ersten Empfehlung startet „Eine Woche später …“ die neue Situation. Nur Leilas Fußweg zum Platz wird sechs Minuten länger; Vorher und Jetzt bleiben getrennt verfügbar. Beibehalten und Wechseln benötigen jeweils eine Begründung. „Zurück“ erhält die Eingaben; „Neu starten“ löscht beide Situationen im aktuellen Tab.

Cloud-Arbeitsverzeichnis: `/workspace/Afrika-2040`. Wenn das Benutzerverzeichnis nicht schreibbar ist, `npm --cache /workspace/.cache/npm ci` verwenden. Im vorhandenen Checkout arbeiten; kein zusätzlicher Worktree erforderlich.

## Prüfen

```sh
npm test
npm run build
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=webkit
```

Die Browsertests starten selbst zwei lokale Server für den Produktionsbuild. Ein vorhandenes `/usr/bin/chromium` wird verwendet. Andernfalls einmal `npx playwright install chromium` ausführen; `CHROMIUM_PATH` kann auf eine vorhandene Chromium-Datei zeigen. Die aktuelle Phase-2B-Prüfung liegt in `docs/evidence/phase2b/`; frühere Korrekturbelege liegen in `docs/evidence/phase2a-corrections/`; `docs/evidence/phase2a/` dokumentiert den früheren Phase-2A-Ausgangsstand. Historische Phase-1-Belege liegen in `docs/evidence/`. Neue Screenshots schreibt der Test standardmäßig nach `test-results/evidence/`. Mit `AFRIKA_EVIDENCE_DIR=mein-pruefordner npm run test:e2e -- --project=chromium` ist der Ausgabeort konfigurierbar. Aktuelle Laufberichte liegen in den ignorierten Verzeichnissen `test-results/` und `playwright-report/`.

Für WebKit muss zusätzlich der passende Playwright-Browser installiert sein (`npx playwright install webkit`). Das WebKit-Projekt umfasst die neuen Phase-2B-Szenarien. Ohne Browserinstallation scheitert es sichtbar beim Start und wird nicht als bestandene oder übersprungene Prüfung dargestellt. Der aktuelle Cloud-Download ist durch die Netzwerkfreigabe blockiert; genaue Grenzen stehen im Übergabebericht.

Die native Tastatursequenz wird vor der fachlichen Rückmeldung auf ihren tatsächlich ausgewählten Wert geprüft. Linux ist hier geprüft. macOS öffnet das Auswahlfeld mit Leertaste und verwendet danach Pfeil-ab statt der dort unzuverlässigen Home-Taste; diese Plattform ist hier nicht verifiziert; aus dem früheren Work-Ergebnis 44/45 auf macOS wird kein neuer 45/45-Nachweis abgeleitet. Die Tests setzen Node und einen installierten Chromium voraus.

Für eine lokale Prüfung des fertigen Builds: `npm run preview`. Relative Ressourcenpfade unterstützen die spätere Veröffentlichung unter einem GitHub-Pages-Repositorypfad. Diese Phase veröffentlicht nichts und enthält keinen automatischen Deployment-Workflow.

## Fachliche und technische Übergabe

- [Curriculare Prüfung mit Seitenbelegen und Abwägungen](docs/curriculum.md)
- [Architektur, Lernmodell und Prüfregeln](docs/development.md)
- [Aktuelle Phase-2B-Übergabe: Änderungen, Tests und Grenzen](docs/phase2b-handover.md)
- [Verbindlicher Phase-2B-Auftrag](docs/phase2b-request.md)
- [Phase-2A-Korrektur nach Gegenprüfung](docs/phase2a-corrections.md)
- [Ausgangsübergabe Phase 2A vor der Gegenprüfung](docs/phase2a-handover.md)
- [Verbindlicher Phase-2A-Auftrag](docs/phase2a-request.md)
- [Historische Erstübergabe Phase 1](docs/handover.md)
- [Korrekturen nach unabhängiger Phase-1-Prüfung und erneute Prüfergebnisse](docs/phase1-corrections.md)
- [Langfristige Projektregeln](AGENTS.md)

Schülerantworten werden nur in diesem Browser-Tab gespeichert, niemals an Bewertungsdienste geschickt. Freitext wird nicht automatisch fachlich bewertet. Der Prototyp ersetzt keine vollständige Afrika-Unterrichtsreihe und keine unabhängige didaktische Prüfung.
