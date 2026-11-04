# Visueller Feinschliff – Prüfbericht

Ausgangspunkt: `dd962339fb21ec0a1ebff2afdccea9df77138500`.

## 1. Getrennter, bestätigter Rückfallpunkt

`e9664a2cf7f689657508c693521ff83b327f10bf` ist der unveränderte Anwendungsstand mit korrigiertem Ghana-Integrationstest. Der Test prüft die genaue Überschrift **Kakaobohnen verarbeiten**, die sichtbare Rohstofffrage und den berechneten zugänglichen Namen des Auswahlfelds. Alle bisherigen Interaktionen bleiben erhalten.

- 511/511 Logiktests, TypeScript, Produktionsbuild und Artefaktprüfung erfolgreich.
- 8/8 gezielte Integrationstests in Chromium und WebKit erfolgreich.
- [GitHub Actions 41883485054](https://github.com/Feerson1617/Afrika-2040/actions/runs/41883485054): **success**, exakt diese SHA. Je 470/470 Browserfälle; Chromium 8,7 Minuten, WebKit 15,0 Minuten.
- Phase 2 wurde erst nach dem bestätigten Abschluss beider CI-Jobs begonnen.

## 2. Darstellung und Bedienung

Die Oberfläche verwendet ein ruhiges Atlasmotiv mit warmem Papier, dunklem Grün und unterschiedlichen Motiven für die fünf Kapitel. Die Startkarte übernimmt dieselben Natural-Earth-Umrisse und Ortskoordinaten wie die bestehende Unterrichtskarte. Sie ergänzt keine erfundenen geografischen Belege. Die vorhandenen Fotos und ihre Quellen bleiben erhalten.

Der vorhandene Startknopf, alle 13 direkten Bereichseinstiege und die vier gleichwertig dargestellten Lernwege bleiben erhalten. Keine neue Einführung, keine zusätzliche Auswahl. Navigation ist optisch zurückgenommen; aktuelle Aufgabe, Antwortfläche und Prüfen/Weiter sind stärker hervorgehoben. Der schmale Balken zeigt ausdrücklich die **Position im Lernweg**, keine Kompetenzbewertung.

- **Kenia 1:** deutlichere aktive Buslinie und benutzte Busabschnitte, weiterhin gestrichelte Fußwege. Die frühen HTML-Alternativen sind ebenfalls deutlich auswählbar. Die bestehende Wegeauskunft wird hervorgehoben.
- **Kenia 2:** Menschen und Plätze werden aus den vorhandenen Zahlen als einzelne Zeichen in Zehnerreihen verglichen. Anzahl, Fußweg und Zeitraum stehen weiterhin ausdrücklich im Text. Ein Platz ist keine Aussage zur tatsächlichen Wartezeit.
- **Ghana 3:** zusammenhängende, nummerierte Verarbeitungsschritte, eigener geprüfter Stand und aktueller Schritt unterscheidbar. Keine späteren Antworten als Bildhinweis. Einnahmen und laufende Ausgaben erhalten proportionale Balken mit derselben Skala; Überschuss nur dort, wo er bereits vorher ausdrücklich gezeigt wurde. Der Anschaffungstopf bleibt getrennt.
- **Ghana 4:** ein proportionaler Balken zeigt Auszahlung, Rücklage, Fortbildung und noch verfügbares Geld. Alle Teile ergeben zusammen 120 GE. Kompakte Regler bewahren die bestehenden ±20-Aktionen; ihre zugänglichen Namen nennen weiterhin den jeweiligen Zweck. Es wird keine Verteilung ausgezeichnet.
- **Marokko 5/6:** Tank, Entnahmepfeil und Feld sind räumlich klarer gestaltet. Das Zusatzfeld bleibt eine separate Fläche. Beim Zusatzfeld verzweigt der Pfeil sichtbar zu beiden Flächen. Keine neue Aussage zu Verbrauch oder Grundwasser; sämtliche Mengen und Einblenderegeln bleiben gleich.
- **Feedback:** unveränderte fachliche Farben und Texte, ruhige Gestaltung; richtige Rückmeldung erscheint kurz mit 180 ms. Bei `prefers-reduced-motion` entfällt diese Bewegung vollständig. Keine Töne, Punkte, Ranglisten oder Belohnung für bloßes Weiterklicken.

[Vorher-Nachher-Aufnahmen und Messwerte](evidence/visual/README.md)

## 3. Grenzen und technische Absicherung

Geändert werden ausschließlich Darstellungsbausteine, CSS und zugehörige Browserprüfungen. Fachmodelle, Antwort-IDs, 52 Varianten, 472 aktuelle Pflichtschritte, Hilfen, Bewertung, Speicherformat, Aufgaben-/Profilwechsel und Quellenzustände werden nicht verändert. Keine neuen Abhängigkeiten, Laufzeitdienste, externen Schriften oder Bildanfragen. Alle neuen Symbole sind lokale SVGs; die geografischen Umrisse sind bereits enthaltene gemeinfreie Daten.

Vorher-Nachher-Aufnahmen verwenden dieselben vorbereiteten, synthetischen Spielstände. Manche frühere Schritte wurden in den Aufnahmeständen bewusst mit dem vorhandenen Beispielweg vorbereitet; diese Unterstützung bleibt sichtbar gekennzeichnet. Die Aufnahmen sind keine Behauptung selbstständiger Schülerleistung. Tatsächliche Klick-, Touch- und Tastaturprüfungen werden getrennt im Testnachweis dokumentiert.

## 4. Endgültige Prüfungen

Die endgültigen Browserläufe prüfen den Produktionsbuild nach der letzten SVG-Korrektur (sichtbare Verzweigung zum Zusatzfeld). Quell- und Build-Prüfsummen verknüpfen die Läufe mit genau diesem Stand. Die Ergebnisse werden vor dem Commit gegen die maschinenlesbaren Protokolle geprüft.

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 511 bestanden; keine fehlgeschlagenen oder übersprungenen Logiktests |
| `npm run build` | TypeScript und Vite-Produktionsbuild erfolgreich |
| `node scripts/check-dist.mjs` | Strenge Artefaktprüfung erfolgreich; genau fünf Dateien |
| Neue visuelle Produktionsprüfungen | 66 bestanden, 33 je Engine |
| Bisherige Produktionsregressionen | 940 bestanden, 470 je Engine; keine Fehler, Wiederholungsfehler oder ausgelassenen Fälle |
| Vollständige Auswahl des CI-Gates | 1.006 bestanden: 503 Chromium und 503 WebKit |
| Formatprüfung der geänderten TypeScript-/CSS-Dateien | erfolgreich |

Die Browserbefehle verwenden `playwright.afrika.config.ts` mit Chromium und WebKit. Der neue Lauf wählt `--grep 'Afrika curriculum visual'`; der anschließende bestehende Lauf wählt `--grep-invert 'Afrika curriculum visual'`. Zusammen entsprechen sie exakt der vollständigen aktuellen CI-Auswahl. Kein Test wird ausgelassen oder abgeschwächt. Die neuen Prüfungen sind dauerhaft in das bestehende CI-Gate aufgenommen.

Tatsächlich geprüft werden alle vier Profile und sechs Simulationen, alle 52 Varianten mit eigenen und unterstützten Antworten, N1/F1–F3/T1, Quellenzustände, Rücksprung, Reload und erneute Bearbeitung. Neue Prüfungen kontrollieren insbesondere die sichtbaren Vorher-/Nachher-Werte, proportionalen Geldbalken, getrennten Felder, berechneten zugänglichen Namen, `aria-pressed`, Fokus, Touch- und Tastaturaktionen sowie rote, gelbe und grüne Rückmeldungen. Die bewusste Beispielübernahme bleibt von automatisch angezeigter Erklärung getrennt. Reduzierte Bewegung schaltet die neue Animation ab.

Die gerenderten Seiten wurden bei **1024 × 768**, ergänzend **768 × 1024** und **390 × 844** geprüft. Die neuen Zugänglichkeitsprüfungen verwenden `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22a` und `wcag22aa`. Das ist ein automatisierter Ausschnitt der Barrierefreiheitsprüfung, keine vollständige WCAG-Zertifizierung.

65 bestehende Quelldateien bleiben bytegleich zum Rückfallpunkt. Insbesondere Fachmodelle, Aufgaben, Bewertung, Speicherlogik und geografische Quelldaten sind unverändert. Die drei geänderten bestehenden Anwendungsdateien und das neue SVG-/Diagrammmodul betreffen die Darstellung. Der geprüfte Build enthält HTML, JavaScript, CSS und dieselben zwei freigegebenen Fotos: keine Schülerdaten, PDFs, privaten Quellen, Testberichte oder Abhängigkeitsordner. Der zusätzliche komprimierte JavaScript-/CSS-Umfang beträgt ungefähr 5 KB.

Nachweise: [Prüfsummen](evidence/visual/source-hashes.json), [unveränderte Dateien](evidence/visual/protected-files.json), [Logiktestprotokoll](evidence/visual/logic.txt), [Build](evidence/visual/build.txt), [Artefakte](evidence/visual/dist.json), [Browserfälle](evidence/visual/browser-cases.json), [Zusammenfassung](evidence/visual/checks.json).

Die CI für die neue Commit-SHA wird nach dem normalen Entwicklungsbranch-Push gesondert in Draft-PR #2 und der Übergabe bestätigt. Der oben genannte grüne Rückfallpunkt ist kein Ersatz für diese Prüfung.

## 5. Empfehlung und verbleibende Grenzen

Nach erfolgreicher Bestätigung sämtlicher oben dokumentierter Produktionsprüfungen und der CI für die neue SHA ist die technische Empfehlung: **für eine begleitete Unterrichtserprobung geeignet, vorbehaltlich der unabhängigen Prüfung dieses Grafikstands**. Im geprüften Umfang ist dann kein offener blockierender Fehler bekannt.

Die tatsächlich gerenderte Oberfläche wirkt durch den Atlas-Einstieg, zusammenhängende Szenen und sichtbar reagierende Darstellungen einladender und weniger wie ein Formular. Hervorgehobene Aufträge und Prüftasten unterstützen die Bedienung; zusätzliche Lösungsschritte entstehen nicht. Diese gestalterische Einschätzung belegt keine tatsächliche Motivation oder Lernwirksamkeit in einer realen Klasse.

Physische Schul-iPads, die konkrete Schulnetz-/Einbettungsumgebung und der Unterrichtseinsatz wurden nicht geprüft. WebKit ist eine Browserengine-Simulation, kein vollständiger Ersatz für den Test auf den eingesetzten Geräten. Lange Materialien bleiben vertikal scrollbar; Kenia 2 und Ghana 4 erhalten etwas mehr Materialhöhe, während die Prüftaste in den verglichenen Ansichten früher liegt. Die unabhängige Gesamtfreigabe und die begleitete Unterrichtserprobung bleiben getrennte Schritte.

Kein Merge, kein Release, keine Veröffentlichung, kein SCORM und keine Begleitmaterialien.
