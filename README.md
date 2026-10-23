# Afrika 2040 – Gestalte die Zukunft

Ein kurzer Geographie-Lernprototyp für eine heterogene 7. Klasse: **„Welcher Busweg hilft wem?“** in einer ausdrücklich erfundenen Nachbarschaft in Nairobi. Vergleiche Fußweg und Busfahrt, erkläre einen Zusammenhang und begründe eine Empfehlung. **Phase 2A** führt nach dem Vergleich von Amina und David die dritte Person Leila und den Busweg über Süd ein. Die Episode umfasst sechs Lernschritte. Weitere Episoden und Phase 2B sind nicht implementiert.

## Starten

Voraussetzung: Node.js ab 22.18 (geprüft mit 24.19), npm.

```sh
npm ci
npm run dev
```

Im Browser die vom Entwicklungsserver angegebene Adresse öffnen. „Spiel starten“ führt direkt zur Karte. Zuerst Aminas Fußweg und Busfahrt wählen, dann die beiden bisherigen Buswege vergleichen und Aminas kürzere Gesamtzeit erklären. Anschließend für Leila vermuten und alle drei Wege testen. Zum Schluss eine Buslinie mit ausdrücklich genanntem Ziel, Vorteil und Nachteil für eine andere Person empfehlen. Satzbausteine und eigene Texte sind möglich; eigene Texte bleiben unbewertet. „Wörter erklären“ und dreistufige Aufgabenhilfen sind freiwillig. „Zurück“ erhält die Eingaben; „Neu starten“ löscht sie im aktuellen Tab.

Cloud-Arbeitsverzeichnis: `/workspace/Afrika-2040`. Wenn das Benutzerverzeichnis nicht schreibbar ist, `npm --cache /workspace/.cache/npm ci` verwenden. Im vorhandenen Checkout arbeiten; kein zusätzlicher Worktree erforderlich.

## Prüfen

```sh
npm test
npm run build
npm run test:e2e
```

Die Browsertests starten selbst zwei lokale Server für den Produktionsbuild. Ein vorhandenes `/usr/bin/chromium` wird verwendet. Andernfalls einmal `npx playwright install chromium` ausführen; `CHROMIUM_PATH` kann auf eine vorhandene Chromium-Datei zeigen. Aktuelle Prüfergebnisse und Screenshots liegen in `docs/evidence/phase2a/`, historische Phase-1-Belege in `docs/evidence/`. Aktuelle Laufberichte liegen in den ignorierten Verzeichnissen `test-results/` und `playwright-report/`.

Für eine lokale Prüfung des fertigen Builds: `npm run preview`. Relative Ressourcenpfade unterstützen die spätere Veröffentlichung unter einem GitHub-Pages-Repositorypfad. Diese Phase veröffentlicht nichts und enthält keinen automatischen Deployment-Workflow.

## Fachliche und technische Übergabe

- [Curriculare Prüfung mit Seitenbelegen und Abwägungen](docs/curriculum.md)
- [Architektur, Lernmodell und Prüfregeln](docs/development.md)
- [Aktuelle Phase-2A-Übergabe: Änderungen, Tests, Selbstevaluation und offene Punkte](docs/phase2a-handover.md)
- [Verbindlicher Phase-2A-Auftrag](docs/phase2a-request.md)
- [Historische Erstübergabe Phase 1](docs/handover.md)
- [Korrekturen nach unabhängiger Phase-1-Prüfung und erneute Prüfergebnisse](docs/phase1-corrections.md)
- [Langfristige Projektregeln](AGENTS.md)

Schülerantworten werden nur in diesem Browser-Tab gespeichert, niemals an Bewertungsdienste geschickt. Freitext wird nicht automatisch fachlich bewertet. Der Prototyp ersetzt keine vollständige Afrika-Unterrichtsreihe und keine unabhängige didaktische Prüfung.
