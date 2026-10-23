# Afrika 2040 – Gestalte die Zukunft

Ein kurzer Geographie-Lernprototyp für eine heterogene 7. Klasse: **„Welcher Busweg hilft wem?“** in einer ausdrücklich erfundenen Nachbarschaft in Nairobi. Vergleiche Fußweg und Busfahrt, untersuche zwei Perspektiven und begründe eine Empfehlung. Phase 1 umfasst vier Lernschritte; spätere Episoden sind nicht implementiert.

## Starten

Voraussetzung: Node.js ab 22.18 (geprüft mit 24.19), npm.

```sh
npm ci
npm run dev
```

Im Browser die vom Entwicklungsserver angegebene Adresse öffnen. „Spiel starten“ führt direkt zur Karte. Zuerst Aminas Fußweg und Busfahrt wählen, danach beide Buswege vergleichen und schließlich eine Empfehlung mit Belegen oder eigenem Text abgeben. „Wörter erklären“ und dreistufige Aufgabenhilfen sind freiwillig. „Zurück“ erhält die Eingaben; „Neu starten“ löscht sie im aktuellen Tab.

Cloud-Arbeitsverzeichnis: `/workspace/Afrika-2040`. Wenn das Benutzerverzeichnis nicht schreibbar ist, `npm --cache /workspace/.cache/npm ci` verwenden. Im vorhandenen Checkout arbeiten; kein zusätzlicher Worktree erforderlich.

## Prüfen

```sh
npm test
npm run build
npm run test:e2e
```

Die Browsertests starten selbst zwei lokale Server für den Produktionsbuild. Ein vorhandenes `/usr/bin/chromium` wird verwendet. Andernfalls einmal `npx playwright install chromium` ausführen; `CHROMIUM_PATH` kann auf eine vorhandene Chromium-Datei zeigen. Screenshots liegen in `docs/evidence/`, aktuelle Laufberichte in den ignorierten Verzeichnissen `test-results/` und `playwright-report/`.

Für eine lokale Prüfung des fertigen Builds: `npm run preview`. Relative Ressourcenpfade unterstützen die spätere Veröffentlichung unter einem GitHub-Pages-Repositorypfad. Diese Phase veröffentlicht nichts und enthält keinen automatischen Deployment-Workflow.

## Fachliche und technische Übergabe

- [Curriculare Prüfung mit Seitenbelegen und Abwägungen](docs/curriculum.md)
- [Architektur, Lernmodell und Prüfregeln](docs/development.md)
- [Konkrete Ergebnisse, Selbstevaluation und offene Punkte](docs/handover.md)
- [Korrekturen nach unabhängiger Phase-1-Prüfung und erneute Prüfergebnisse](docs/phase1-corrections.md)
- [Langfristige Projektregeln](AGENTS.md)

Schülerantworten werden nur in diesem Browser-Tab gespeichert, niemals an Bewertungsdienste geschickt. Freitext wird nicht automatisch fachlich bewertet. Der Prototyp ersetzt keine vollständige Afrika-Unterrichtsreihe und keine unabhängige didaktische Prüfung.
