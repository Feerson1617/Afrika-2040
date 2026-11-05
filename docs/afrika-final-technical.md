# Letzte technische Korrektur · Release-Kandidat

Historischer Stand `4bcee44415b670a27eec991dd047e9937c04eb1c`. Der anschließend unabhängig festgestellte Rest bei Rückkehr und Reload ist im [N1-Nachtrag](afrika-n1-return.md) dokumentiert. Die nachstehenden Ergebnisse beziehen sich auf den damaligen Stand.

Ausgangscommit: `cc9bfe054c0171c953acb080fb11be526e5a033e`, Branch `feat/afrika-vier-lernwege`. Lokaler HEAD, sauberer Arbeitsbaum und gleichlautender Remote waren vor Beginn bestätigt. Die vollständige SHA des neuen Commits steht in der Übergabe und in `handover.json` des Prüfpakets; die Quellhashes in `docs/evidence/final-technical/checks.json` binden diese Prüfungen an den Anwendungscode.

## Gezielte Änderungen

- **N1/P2:** Der Eingabehandler vergleicht das vor und nach der Änderung erzeugte Material. Gleiches Material behält seine DOM-Knoten: Quellen, verschachtelte Zusatzmaterialien, bewusst geschlossene Bereiche und die Leseposition werden beim Schreiben nicht zurückgesetzt. Bei einer notwendigen Aktualisierung abhängiger Rechenergebnisse werden vorhandene Öffnungs- und Schließzustände nach ID beziehungsweise verschachteltem Zusammenfassungspfad wiederhergestellt. Eingabefeld und Cursor werden nicht ersetzt. Neue Antwort, offener Status und gegebenenfalls Hilfe-3-Herkunft werden weiterhin sofort gespeichert/angezeigt; alte bestätigte Ergebnisse verschwinden.
- **S1:** Die bereits verknüpfte Auswahl zeigt „Mir ist wichtig“, „Ein Nachteil bleibt“ und „Trotzdem wähle ich diesen Plan“. Vorteil und Grenze bleiben auf den eigenen Vorschlag bezogen. Auswahl-IDs, vorläufige Alternative und neutrale Bewertung sind unverändert. In allen 24 betroffenen Aufgaben-/Profilkombinationen beider Engines geprüft; die Bildschirmaufnahmen zeigen die tatsächliche Darstellung.
- **S2:** Ein negativer Wanderungssaldo bedeutet mehr Fortzug als Zuzug, nicht automatisch eine sinkende Gesamtbevölkerung. Geburten und Sterbefälle werden ausdrücklich als zusätzliche Einflussgrößen genannt. Der Hinweis nennt kein fertiges Ergebnis. Er gilt auch in zusammengefassten Aufgaben mit negativem Wanderungssaldo; ein Minus bei der gesamten Änderung wird getrennt erklärt.
- **T1:** Der normale Kakao-Ablauf nach drei früheren Kenia-Aufgaben reproduzierte in Chromium den unsichtbaren, bereits fokussierten Rückmeldungstitel. Die einmalige Wiederherstellung wartet jetzt auf `pageshow` und zwei Rendering-Schritte. Nur wenn die gespeicherte Rückmeldung außerhalb des Fensters liegt, wird sie ins Fenster geholt. Keine wiederkehrende Scrollschleife, keine zusätzliche Navigation oder Änderung des Spielstands.

Geänderter Anwendungscode: `src/main.ts`, `src/learning/update-material.ts`, `src/learning/chapter-ui.ts`, `src/learning/material-view.ts`. Die elf separat verglichenen Kern-Dateien für Fachmodelle, Bewertung, Speicherung, Aufgaben, Hilfen und Profile sind byteidentisch zum Ausgangsstand. Keine Modellwerte, Antwort-IDs, Bewertungsregeln oder Spielmechaniken geändert.

## Tatsächlich ausgeführte Prüfung

| Prüfung                                | Ergebnis                                                                |
| -------------------------------------- | ----------------------------------------------------------------------- |
| Vorhandene Logiktests                  | **491/491 bestanden**, keine übersprungen                               |
| TypeScript                             | `tsc --noEmit` erfolgreich                                              |
| Produktionsbuild                       | erfolgreich, Node 24.19.0                                               |
| Strenge Artefaktprüfung                | **5/5** zugelassene Dateien; keine privaten Daten/PDFs/Abhängigkeiten   |
| Abschließende Browserprüfung           | **356/356 bestanden**, keine übersprungen oder wiederholt, 11,8 Minuten |
| Vollständige Varianten                 | **208/208**, 52 Varianten × zwei Bearbeitungswege × zwei Engines        |
| Gezielte Material-/Sprach-/F1–F3-Fälle | **148/148** innerhalb derselben finalen Browserprüfung                  |
| Gesonderte T1-Wiederholung             | **6/6** Abläufe, **30 Reloads**                                         |
| Formatierung und Patchprüfung          | erfolgreich                                                             |

Die unbearbeiteten Protokolle, Bildschirmaufnahmen und einzelnen Browserfälle stehen unter `docs/evidence/final-technical/`. Alle endgültigen Läufe beziehen sich auf dieselben aufgezeichneten Quellhashes. Die historische Fehlerreproduktion wird nicht in erfolgreiche Ergebnisse umgedeutet.

Reproduktion: Vor der Anwendungskorrektur scheiterten alle zehn N1-Browserfälle an den automatisch geschlossenen Quellen (vier Aufgaben, Zukunft zusätzlich MSA/AHR, jeweils Chromium/WebKit). Der erste erweiterte Lauf bestand 147 von 148 Fällen und machte T1 in Chromium sichtbar. Diese Fehlprotokolle bleiben im Prüfpaket erhalten. Nach der T1-Korrektur bestanden sechs Wiederholungsläufe mit insgesamt 30 Neuladungen (je Engine drei vollständige Abläufe mit je fünf Reloads). Jeder Reload prüft die tatsächliche vollständige Sichtbarkeit der Rückmeldung sowie unveränderte frühere Aufgaben und Abgaben.

N1 prüft mehrere aufeinanderfolgende Eingaben, unveränderte Material-/Eingabeknoten, Quellen und verschachtelte Bereiche, bewusst geschlossene Angaben, Fokus, Cursor, Scrollposition (höchstens zwei Pixel Abweichung), gespeicherten Text, Rücksprung, Reload und bestehende Abgaben. Auch bei bewusst geöffneter Hilfe 3 wird kein Beispiel heimlich übernommen. Ein zusätzlicher Browser-DOM-Vertrag erzwingt eine echte Materialaktualisierung und kontrolliert offene **und** geschlossene verschachtelte Bereiche, einschließlich anonymer `details`.

F1–F3 bleiben in beiden Engines geschützt: verschiedene Marokko-Planansichten, keine 120 GE in Ghana-Hilfe 1/2, sofortiger offener Kenia-/Ghana-/Marokko-Status nach Rechenänderungen, keine alten Resultate im Material, erhaltene Abgabehistorie und ehrliche Hilfe-3-Provenienz. Die 208 vollständigen Durchläufe umfassen alle 52 Varianten jeweils ohne Beispiel und mit Unterstützung, jeweils in Chromium und WebKit. Desktop/Tastatur und simuliertes iPad mit Touch bei 1024 × 768 werden durchlaufen. Bestehende Tests wurden ergänzt; nur die erwartete, ausdrücklich geänderte S1-Beschriftung wurde angepasst. Kein Test gelöscht oder übersprungen.

Reproduzierbare Befehle:

```sh
npm test
npx tsc --noEmit
npm run build
node scripts/check-dist.mjs
WEBKIT_PATH=/pfad/zum/verfügbaren/webkit npx playwright test -c playwright.editorial.config.ts \
  'language-revision.spec|packet-b.spec|topics-gate2.spec|four-paths.spec' \
  --grep 'RC-final|Afrika curriculum language|Afrika curriculum editorial|Afrika curriculum barriers|PaketB (s[1-6]|o|r)/|Gate2 [ande]/|four paths c/' \
  --workers=4 --reporter=list,json
```

`WEBKIT_PATH` ist nur bei einem abweichenden lokalen Browserpfad nötig. Die neuen Tests werden außerdem vom bestehenden CI-Profil automatisch entdeckt (16 zusätzliche Browserfälle). Die wiederholte T1-Prüfung verwendet `--grep 'RC-final T1' --repeat-each=3`.

## Release-Grenzen und Übergabe

Kein bestätigter P1/P2-Befund bleibt nach den hier dokumentierten Korrekturen offen. T1 ist jetzt gezielt reproduziert und in beiden Engines wiederholt bestanden; damit ist keine Garantie für jede reale Safari-/iPad-Version oder jedes Timing verbunden. Kein physisches iPad, kein vollständiger Screenreader-Abnahmetest und kein Unterrichtsversuch durchgeführt. Die unabhängige Abnahme bleibt ausstehend.

Die frühere vollständige Sprach-/Lernhindernisprüfung bleibt als **historische Prüfung des Ausgangscommits** erhalten. Ihr globales Quellmanifest wird durch diese Änderung nicht stillschweigend neu freigegeben. Dieser Bericht dokumentiert ausschließlich die beauftragte technische und sprachliche Differenzprüfung. Keine neue Gesamtrevision und keine behauptete empirische Lernwirksamkeit.

Der aktuelle Unterschied zum tatsächlich abgerufenen `main` (`9448eb119c0d6339164ae36a0aa474717b8be51d`) umfasst die gesamte seitdem entstandene Anwendung, nicht nur vier Korrekturdateien: vor dem Abschlusscommit 40 branchseitige Commits und einen nur main-seitigen historischen Mergecommit. Dateiliste, Diffstatistik und Commitliste liegen im Prüfpaket. Der Draft-PR muss daher den vollständigen Entwicklungsbranch zur unabhängigen Prüfung vorlegen. Es wird weder ein neuer Merge noch eine Neuschreibung der Historie vorgenommen.

Die bestehende CI prüft ausschließlich Pull Requests gegen main. Pages bleibt ein gesonderter manueller Workflow, auf main und eine ausdrücklich bestätigte vollständige SHA begrenzt. Ein Entwicklungsbranch-Push oder Draft-PR löst keine Pages-Veröffentlichung aus. Vor späterem Merge sind unabhängige Abnahme, tatsächlicher GitHub-CI-Erfolg und Prüfung des dann aktuellen Branch-Unterschieds nötig. Veröffentlichung erfordert eine eigene Freigabe, konfigurierte Pages-Umgebung und einen erfolgreichen geprüften Build der ausdrücklich benannten main-SHA.

Keine SCORM-Anbindung, kein LMS-Tracking, keine neuen Inhalte, keine Begleitmaterialien oder Klassenarbeit. SCORM bleibt lediglich dokumentierter späterer Weg. Keine privaten Original-PDFs, `.env`-Dateien, Zugangsdaten, Abhängigkeiten oder Tests im Veröffentlichungsbuild; die strenge Prüfung lässt ausschließlich HTML, JS, CSS und die zwei anhand ihrer Hashes zugelassenen Fotos zu.

Nach erfolgreicher lokaler Prüfung sind ausschließlich der normale Push dieses Abschlusscommits auf den bestehenden Entwicklungsbranch und ein Draft-PR gegen main freigegeben. Die tatsächlich ermittelte Remote-SHA, der PR-Link und der beobachtete GitHub-CI-Status werden anschließend außerhalb dieses Commits in `handover.json` des Prüfpakets und in der Chat-Übergabe festgehalten. Ein lokaler Testlauf wird ausdrücklich nicht als grüner GitHub-CI-Lauf ausgegeben. Nach der Übergabe endet die Entwicklung.
