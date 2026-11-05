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
- **Feedback:** unveränderte fachliche Farben und Texte, ruhige Gestaltung; richtige Rückmeldung erscheint sofort mit vollem Textkontrast. Die zunächst vorgesehene 180-ms-Einblendung wurde nach dem CI-Befund vollständig entfernt; die Darstellung benötigt keine Animation. Keine Töne, Punkte, Ranglisten oder Belohnung für bloßes Weiterklicken.

[Vorher-Nachher-Aufnahmen und Messwerte](evidence/visual/README.md)

## 3. Grenzen und technische Absicherung

Geändert werden ausschließlich Darstellungsbausteine, CSS und zugehörige Browserprüfungen. Fachmodelle, Antwort-IDs, 52 Varianten, 472 aktuelle Pflichtschritte, Hilfen, Bewertung, Speicherformat, Aufgaben-/Profilwechsel und Quellenzustände werden nicht verändert. Keine neuen Abhängigkeiten, Laufzeitdienste, externen Schriften oder Bildanfragen. Alle neuen Symbole sind lokale SVGs; die geografischen Umrisse sind bereits enthaltene gemeinfreie Daten.

Vorher-Nachher-Aufnahmen verwenden dieselben vorbereiteten, synthetischen Spielstände. Manche frühere Schritte wurden in den Aufnahmeständen bewusst mit dem vorhandenen Beispielweg vorbereitet; diese Unterstützung bleibt sichtbar gekennzeichnet. Die Aufnahmen sind keine Behauptung selbstständiger Schülerleistung. Tatsächliche Klick-, Touch- und Tastaturprüfungen werden getrennt im Testnachweis dokumentiert.

## 4. Endgültige Prüfungen

Der erste Grafikcommit `bf527b45b2f1334cc4219885c155ed2d879b6f2d` bestand lokal 511 Logiktests und 1.006 Browserfälle, 503 je Engine. GitHub bestätigte Chromium ebenfalls mit 503/503. Der WebKit-Job in [Lauf 41897455709](https://github.com/Feerson1617/Afrika-2040/actions/runs/41897455709) erreichte nach knapp acht Minuten Bibliotheksinstallation das 25-Minuten-Gesamtlimit. Seine Fehlerbelege zeigten zusätzlich zwei konkrete Probleme. Dieser CI-Lauf wird **nicht** als erfolgreich ausgegeben.

Die enge Nachkorrektur umfasst:

- **Kontrast:** Die Einblendung mit Deckkraft 0,7 senkte den Kontrast vorübergehend auf 3,65:1. Sie entfällt vollständig. Eine neue Regression friert mögliche künftige Effekte am ersten Bild ein und verlangt sofort volle Textdeckkraft und bestandene WCAG-A/AA-Prüfungen. Am alten Produktionsbuild schlug sie in beiden Engines nachweislich fehl.
- **N1-Messbeginn:** Der Trace zeigte die Eingabe-Fokussierung noch bei Scrollposition 1042; WebKit brachte das zuvor außerhalb des Bilds liegende Feld erst beim ersten Tastendruck auf Position 503 ins Bild. Der Test stellt nun vor der Messung ein vollständig sichtbares, fokussiertes Eingabefeld her. Danach bleiben dieselbe Zwei-Pixel-Grenze, DOM-Identität, Cursor-, Quellen-, Abgabe-, Rückkehr- und Reload-Prüfungen bestehen. Keine Änderung an Eingabe- oder Speicherlogik.
- **CI-Laufzeit:** 35 statt 25 Minuten Gesamtbudget erlauben vollständige Browserprüfungen auch bei langsamer Systembibliotheksinstallation. Einzelfall-Zeitlimits, Assertions, Fallauswahl und fehlende automatische Wiederholungen bleiben unverändert.

Prüfungen nach dieser letzten Änderung:

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 511 bestanden, keine Fehler oder übersprungenen Tests |
| `npm run build` | TypeScript und Vite-Produktionsbuild erfolgreich |
| `node scripts/check-dist.mjs` | Strenge Artefaktprüfung erfolgreich, genau fünf Dateien |
| Visuelle Fälle, N1 und betroffener Bevölkerungsweg in beiden Engines | 108/108 bestanden, keine Fehler oder übersprungenen Fälle |
| Zwei CI-Fälle, je zehnmal pro Engine | 40/40 bestanden, keine Fehler |
| Vollständige neue CI-Auswahl | 1.008 Fälle, 504 je Engine; tatsächlicher Abschluss wird für die neue SHA in PR #2 und der Übergabe bestätigt |

Die gezielten Browserbefehle verwenden `playwright.afrika.config.ts` und die Auswahl `Afrika curriculum visual|RC-final N1|Afrika curriculum N1|four paths c/msa supported=true`. Die Wiederholungsprüfung wählt die beiden betroffenen Fälle mit `--repeat-each=10`. Der ursprüngliche vollständige lokale Lauf bleibt als Nachweis des ersten Grafikcommits erhalten und wird nicht als neuer Komplettlauf ausgegeben. Die neue vollständige CI prüft nach dem Push sämtliche bestehenden Regressionen und 68 visuelle Fälle.

Tatsächlich geprüft werden alle vier Profile und sechs Simulationen, sichtbare Vorher-/Nachher-Werte, proportionale Geldbalken, getrennte Felder, berechnete zugängliche Namen, `aria-pressed`, Fokus, Touch- und Tastaturaktionen sowie rote, gelbe und grüne Rückmeldungen. Die bewusste Beispielübernahme bleibt von automatisch angezeigter Erklärung getrennt. Die bestehende CI-Auswahl umfasst alle 52 Varianten, N1/F1–F3/T1, Quellenzustände, Rücksprung, Reload und erneute Bearbeitung.

Die gerenderten Seiten wurden bei **1024 × 768**, ergänzend **768 × 1024** und **390 × 844** geprüft. Die neuen Zugänglichkeitsprüfungen verwenden `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22a` und `wcag22aa`. Das ist ein automatisierter Ausschnitt der Barrierefreiheitsprüfung, keine vollständige WCAG-Zertifizierung.

65 bestehende Quelldateien bleiben bytegleich zum Rückfallpunkt. Fachmodelle, Aufgaben, Bewertung, Speicherlogik und geografische Quelldaten sind unverändert. Der Build enthält HTML, JavaScript, CSS und dieselben zwei freigegebenen Fotos: keine Schülerdaten, PDFs, privaten Quellen, Testberichte oder Abhängigkeitsordner. Der zusätzliche komprimierte JavaScript-/CSS-Umfang beträgt ungefähr 5 KB.

Nachweise des endgültigen lokalen Stands: [Prüfsummen](evidence/visual/source-hashes.json), [unveränderte Dateien](evidence/visual/protected-files.json), [Logiktestprotokoll](evidence/visual/logic.txt), [Build](evidence/visual/build.txt), [Artefakte](evidence/visual/dist.json), [gezielte Browserfälle](evidence/visual/correction-cases.json), [Zusammenfassung mit getrennten Prüfläufen](evidence/visual/checks.json). Der [erste vollständige lokale Browserlauf](evidence/visual/browser-cases.json) gehört ausdrücklich zu `bf527b4`.

## 5. Empfehlung und verbleibende Grenzen

Nach erfolgreicher Bestätigung sämtlicher oben dokumentierter Produktionsprüfungen und der CI für die neue SHA ist die technische Empfehlung: **für eine begleitete Unterrichtserprobung geeignet, vorbehaltlich der unabhängigen Prüfung dieses Grafikstands**. Im geprüften Umfang ist dann kein offener blockierender Fehler bekannt.

Die tatsächlich gerenderte Oberfläche wirkt durch den Atlas-Einstieg, zusammenhängende Szenen und sichtbar reagierende Darstellungen einladender und weniger wie ein Formular. Hervorgehobene Aufträge und Prüftasten unterstützen die Bedienung; zusätzliche Lösungsschritte entstehen nicht. Diese gestalterische Einschätzung belegt keine tatsächliche Motivation oder Lernwirksamkeit in einer realen Klasse.

Physische Schul-iPads, die konkrete Schulnetz-/Einbettungsumgebung und der Unterrichtseinsatz wurden nicht geprüft. WebKit ist eine Browserengine-Simulation, kein vollständiger Ersatz für den Test auf den eingesetzten Geräten. Lange Materialien bleiben vertikal scrollbar; Kenia 2 und Ghana 4 erhalten etwas mehr Materialhöhe, während die Prüftaste in den verglichenen Ansichten früher liegt. Die unabhängige Gesamtfreigabe und die begleitete Unterrichtserprobung bleiben getrennte Schritte.

Kein Merge, kein Release, keine Veröffentlichung, kein SCORM und keine Begleitmaterialien.
