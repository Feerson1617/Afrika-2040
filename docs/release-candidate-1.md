# Release-Kandidat 1 – interne Vorbereitung

Ausgangsstand exakt `a94f2ff682a4cc11bb0f14f466c572d7b6adafa0`, sauber auf `feat/phase5-final-scorm-readiness`. Separater Branch: `feat/release-candidate-1`. Der vollständige RC1-Commit steht im nach dem Commit erzeugten externen Bericht `Release-Kandidat-1.md` und in `Commit.json`; diese Dateien benennen eindeutig den unveränderlichen Prüfstand. Kein Push, Merge oder Deployment.

## Änderung und didaktische Reichweite

Nur die sichtbare Antwortreihenfolge wurde verändert. Die richtige Aussage steht bei Kenia an Position 2, Ghana an Position 1, Marokko an Position 2. Im gemeinsamen Vergleich steht „Folgen“ richtig an Position 1, „Begründen“ richtig an Position 2. Die feste Variation verhindert den bisherigen durchgängigen Positionshinweis. Sie ist kein Zufall und bleibt nach Neuladen, Rücksprung und neuer Bearbeitung stabil.

Texte, IDs (`model`/`all`, `different`/`same`, `evidence`/`any`), gespeicherte Werte, Auswertung, Rückmeldungen und drei Hilfestufen bleiben gleich. Die Darstellung kehrt bei Bedarf eine Kopie der Optionsliste um, niemals die Daten oder Bewertungsregeln. Diese kleine Entlastung des Positionshinweises beweist keine selbstständige Urteilskompetenz oder Lernwirksamkeit.

Alle 37 anderen Quelldateien sind gegenüber dem Referenzcommit bytegleich, darunter Modelle, Feedback, Speicherwarnung, Kenia-Navigation, Ghana-Verteilung und Kartendaten. Hashnachweis: `protected-source.json` im Prüfbelegpaket. Keine fachliche Aussage oder Spielmechanik verändert.

## Tatsächlich ausgeführte Prüfungen

- Alle **159 Logiktests** bestanden; erfolgreicher TypeScript-/Vite-Produktionsbuild mit `base: './'`.
- Drei neue vollständige Browserfälle für Maus/Desktop, echte Touch-Aktionen bei 1024 × 768 und Tastatur bei 1024 × 768 bestanden. Die Auswahl erfolgt ausdrücklich nach sichtbarer Position; geprüft wird danach die richtige fachliche Bewertung und gespeicherte ID. Länderfragen: falsch/rot, zweite Fehlbewertung/gelbe Erklärung, bewusste Übernahme, richtig/grün, Änderungen, drei verschiedene Hilfen, Neuladen und Neubearbeitung. Gemeinsamer Vergleich: unvollständig ohne Fehlversuch, Teilanerkennung, vollständig falsch, Unterstützung und Rücksprung. Berechnete zugängliche Namen stimmen mit den ursprünglichen Aussagen überein. Axe mit allen sechs bestehenden WCAG-A-/AA-Tags in den geprüften Abschlusszuständen ohne gefundene Verletzung; keine vollständige Accessibility-Zertifizierung.
- Anschließend gezielte bestehende Regressionen der sechs Episoden: vollständige Berichte und feste Zahlenorakel, alle Kenia-Routen und beide Nachfrage-Maßnahmen, alle regionalen Vorschläge und vollständige Ghana-Verteilung, Speicherwarnung/-wiederherstellung, Ereignisnavigation samt Viewport-Messungen, Geographie, Rückblick, unabhängige Einstiege und Wiederaufnahme. Zusätzlich statischer Pages-Unterpfad und lokaler 640 × 650 Inhaltsframe. **52/52 ausgewählte Chromium-Browserfälle bestanden**, keine übersprungenen Fälle oder automatischen Wiederholungen. Einzelfälle: `regression.txt`/`results.json` im Belegpaket. Keine unnötige Wiederholung des gesamten historischen Browserpakets.
- WebKit wurde tatsächlich zu starten versucht; die Engine fehlt (`webkit-2370/pw_run.sh`). Neue Fälle sind dafür registriert, aber **in dieser Runde nicht unter WebKit ausgeführt**. Die bestehende Kenia-Korrektur blieb unverändert. Keine erneute Safari-/Hardware-/Unterrichtsprüfung behauptet.

## Veröffentlichungsbuild und Datenprüfung

Das frisch erzeugte `dist/` enthält ausschließlich `index.html`, eine lokale JavaScript- und eine CSS-Datei. Karten sind Bestandteil des lokalen Codes. Es enthält keine PDFs, Anhänge, Spielstanddateien, Tests, Protokolle oder Abhängigkeitsordner. Die HTML-Ressourcenpfade sind relativ; der Build funktioniert lokal unter `/Afrika-2040/` und im Testframe ohne verpflichtende externe Requests.

Keine schulischen Original-PDFs oder `.env`-Dateien sind versioniert oder Teil dieses Builds. Keine realen Schülerdaten wurden als Testdaten eingesetzt; Antworten werden weiterhin nur im Browser-Tab verarbeitet. Der erzeugte Dateibestand sowie häufige Credential-Muster wurden geprüft, ohne etwaige Werte auszugeben; kein Fund. Es gibt keine Importe privater Anhänge oder Umgebungswerte im Anwendungscode. Das ist eine konkrete Build-Prüfung, keine pauschale Garantie für künftige CI-Konfigurationen. Dateigrößen/Hashes: `build-audit.json`.

## Einschätzung und offene, nicht blockierende Grenzen

Der Stand eignet sich als **lokaler Release-Kandidat für die unabhängige Abnahme**, nicht als bereits freigegebene Veröffentlichung. Die Positionskorrektur hat nach den ausgeführten Prüfungen keinen bekannten funktionalen Blocker. WebKit/Safari auf dem tatsächlichen Schul-iPad, vollständige manuelle Screenreader-Nutzung und Unterrichtswirkung wurden hier nicht neu nachgewiesen. Diese Reichweitengrenzen bleiben offen; sie werden nicht durch Chromium-Tests ersetzt. Der eng begrenzte RC1-Eingriff ändert die vorherigen Plattformkorrekturen nicht.

Ein Browser-Tab ist keine garantierte dauerhafte Wiederaufnahme. Die vorhandene Warnung bei Schreibfehlern bleibt erhalten. Die Karte ist generalisiert, Modellwerte sind erfunden, freiwilliger Freitext bleibt unbewertet. Die bekannten Grenzen aus `curriculum.md` und `scorm-readiness.md` gelten weiter. Keine neue Hochformatoptimierung und keine neue Episode.

## Vor einer späteren Zusammenführung nach main

1. Unabhängige Abnahme genau des im externen Bericht genannten vollständigen Commits; offene Befunde bewerten. Vor einer konkreten Produktivfreigabe die erforderliche Schulgeräte-/Browserprüfung klären.
2. Erst nach ausdrücklicher Freigabe diesen Entwicklungsstand übertragen beziehungsweise zur Review bereitstellen. Es wurde hier kein Pull Request angelegt.
3. Den dann aktuellen `main` tatsächlich einlesen, die gesamte Branch-Differenz und mögliche Konflikte prüfen. Diese Runde behauptet keinen frisch geprüften Remote-main-Stand. Bei Änderungen/Konflikten den resultierenden Stand erneut passend testen.
4. Konkrete Merge-Freigabe einholen und ausschließlich den geprüften Stand zusammenführen. Kein automatischer Merge oder Release-Tag durch diesen Auftrag.

## Voraussetzungen für GitHub Pages

- Aktuelle Repository-/Pages-Einstellungen, Berechtigungen, Sichtbarkeit und Ziel-URL durch die verantwortliche Person prüfen; hier keine Settings geändert oder live bestätigt.
- Ein verbindliches Veröffentlichungsverfahren auswählen. TypeScript-Quellcode im Repository-Wurzelverzeichnis ist kein fertiger Pages-Build. Für einen üblichen Actions-Weg: unterstützte Node-Version, `npm ci`, erforderliche Tests, `npm run build`, ausschließlich `dist/` als Pages-Artefakt und ein ausdrücklich freigegebener Deployment-Schritt mit passenden Pages-/OIDC-Berechtigungen und Environment-Regeln. Alternativ müsste ein gesondert vereinbarter Weg fertige statische Dateien bereitstellen.
- Im Branch ist derzeit kein Pages-Workflow versioniert. Ein Workflow oder eine andere Publikationskonfiguration müsste später konkret geprüft und freigegeben werden; diese Runde fügt keine hinzu.
- Relative Ressourcenpfade erhalten, `/Afrika-2040/` beziehungsweise eine später gewählte Domain gegen den wirklichen Auslieferungspfad testen. Keine Anhänge, Schul-PDFs, Testspielstände oder internen Belegpakete als Pages-Artefakt hochladen.
- Erst nach ausdrücklicher Veröffentlichungsfreigabe deployen und danach Start, Ressourcen, Navigation und Speicherverhalten an der echten URL prüfen. Bisherige lokale Tests ersetzen diesen späteren Nachweis nicht.

## SCORM und Übergabe

SCORM bleibt eine vorbereitete Option, keine implementierte Auslieferung. Kein Manifest, produktiver API-Adapter, Suspend-Datentransport, Punkteschlüssel, Tracking oder itslearning-Import ergänzt. Vor einem künftigen Export gelten der versionierte Resume-Entwurf, die Unterschiede zwischen 1.2 und 2004 sowie Schul-/Add-on-/Datenschutzfragen aus `scorm-readiness.md`.

Die kompakte RC1-Prüfdatei enthält diesen Bericht mit vollständigem Commit, den lokalen Produktionsbuild, einen binären Git-Patch gegenüber dem bekannten Referenzcommit, aktuelle Protokolle/Prüfmetadaten und zwei gezielte Bilder. Sie ist bewusst kein neues historisches Vollbelegpaket und kein SCORM-ZIP. Der Patch ermöglicht zusammen mit dem vorhandenen Referenzstand die Rekonstruktion; ein separater Vergleich prüft den resultierenden Dateistand. Nach Commit und Bereitstellung endet die Arbeit.
