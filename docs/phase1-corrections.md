# Phase 1 – gezielte Korrekturen nach unabhängiger Prüfung

## Stand und Umfang

Ausgangsstand: `feat/phase1-kenia`, Commit `5e82afceeae39c0566797ab04cf2ee9ae4da1736`, sauberer Arbeitsbaum. Branch und Commit stimmten exakt mit dem unabhängigen Prüfbericht und Korrekturprompt überein. Der Nutzer hat die gezielte Umsetzung ausdrücklich beauftragt. Der neue Commit liegt auf demselben Entwicklungsbranch; den vollständigen Stand zeigt `git rev-parse HEAD` beziehungsweise die Bestandsdatei des neuen Bundle-ZIPs.

Bearbeitet wurden ausschließlich R1–R3 und die begrenzte Lesbarkeitsverbesserung R4 samt Tests und Dokumentation. Unverändert sind die Modellwerte Amina 22/10 und David 12/18 Minuten, die offene Wahl beider Linien und die unbewertete Freitexteingabe. `src/content.ts`, `src/model.ts`, die Abhängigkeiten und der Lockfile wurden nicht verändert. Keine Phase 2, kein Push, kein Merge, keine Veröffentlichung. **Diese Korrektur ist keine unabhängige Freigabe.**

Die separat hochgeladenen Dateien `Pruefbericht-Phase1.md` und `Korrekturprompt-Phase1.txt` sind bytegleich mit ihren Exemplaren im Prüfpaket. Die im Prüfpaket genannten Prüfsummen aller drei curricularen Original-PDFs stimmen mit `docs/source-access.json` überein. Der Prüfbericht dient als Befundquelle; der ausdrücklich bestätigte Korrekturprompt begrenzt den Arbeitsauftrag. Fremde lokale Dateilinks im Prüfbericht werden nicht als hier verfügbare Dateien ausgegeben.

## Korrekturen und nachgewiesenes Verhalten

### R1 – direkte Ausgangskarte nach Rücksprung und Wiederherstellung

`state.ts` erzwingt in Aufgabe 1 die direkte Ausgangsroute. `storage.ts` normalisiert auch ältere gespeicherte Zustände mit Aufgabe 1 und der globalen Nord-Route. `map.ts` berücksichtigt die feste Ausgangsroute zusätzlich selbst. Dadurch folgt die Beschriftung nicht mehr der alten globalen Route. Bearbeitungsstände und Antworten anderer Aufgaben bleiben erhalten.

Geprüft wurden tatsächliche sichtbare SVG-Texte: an der direkten Verbindung steht **10 Min.**; an der alternativen Verbindung Nord–Zentrum steht einmal **8 Min.**; es gibt keine zusätzliche verwaiste Acht-Minuten-Angabe am nicht gezeichneten Abschnitt Platz–Nord. Direkte Verbindung, aktive Darstellung und zugängliche Beschriftungen passen zusammen. Rücksprung, Neubearbeitung, Neuladen und ein ausdrücklich injizierter alter gespeicherter Nord-Zustand wurden im Browser durchlaufen. Die zuvor bearbeitete zweite Aufgabe blieb erhalten.

Beleg: [Aufgabe 1 nach Wiederherstellung](evidence/review-R1-restored.png).

### R2 – neutraler unterstützter Weiterweg für beide Linien

In Aufgabe 4 werden erfolglose strukturierte Prüfungen gezählt, wenn eine Linie gewählt wurde und mindestens ein ausgewählter Beleg objektiv nicht dazu passt. Der Zähler ist auf zwei begrenzt. Ein fehlender Beleg bei sonst passender Auswahl und ein nicht leerer Freitext lösen keinen Fehlversuch aus. Freitext wird weder sprachlich noch fachlich automatisch bewertet.

Nach der zweiten unpassenden Belegprüfung erscheint automatisch Hilfe 3 mit einer konkreten Erklärung für die gewählte Linie. Passende Teilgedanken werden weiterhin anerkannt. Falsche Belege werden zunächst weder ersetzt noch bestätigt; der Abschluss bleibt bis zur eigenen Korrektur, einem ausdrücklich ungeprüften eigenen Text oder einer bewussten Beispielübernahme ausstehend. **„Dieses Beispiel übernehmen“** setzt die erklärten passenden Belege. Feedback bleibt neutral und der Abschluss kennzeichnet **„Mit Hilfe erstellt: Du hast das erklärte Beispiel übernommen.“** Die Hilfe steht auch freiwillig über alle drei Hilfestufen bereit. Ohne gewählten Busweg verlangt Hilfe 3 zuerst diese Wahl; bei Linienwechsel wechselt das Beispiel mit. Eigene Änderungen der Belegauswahl entfernen die Übernahmekennzeichnung.

Browserprüfungen: je Linie vier wiederholte unpassende Prüfungen; automatische Erklärung spätestens beim zweiten Versuch; keine stille Korrektur der falschen Auswahl; Neuladen mit sichtbarem Unterstützungsangebot; bewusste Übernahme per Tastatur; korrektes, gekennzeichnetes Lernprodukt nach Neuladen. Hinzu kommen alle freiwilligen Hilfestufen, Linienwechsel sowie sprachlich unklare und fachlich unsinnige Freitexte mit weiter null Fehlversuchen. Widersprüchliche Belege neben Freitext bleiben am Schluss ausdrücklich als zu prüfen markiert. Unterstützte Abschlüsse beider Linien wurden zusätzlich auf Desktop und beiden iPad-Ausrichtungen mit den jeweiligen Eingaben durchlaufen.

Belege: [Erklärung Direkt](evidence/review-R2-direct-explanation.png), [Erklärung Über Nord](evidence/review-R2-north-explanation.png), [Unterstützter Weiterweg auf iPad quer](evidence/review-ipad-supported.png).

### R3 – richtige unvollständige Teilantwort anerkennen

Bei ausschließlich „Zum Platz“ lautet die gelbe Rückmeldung: „Der Fußweg zum Platz passt. Wähle jetzt noch die Busfahrt.“ Bei ausschließlich „Platz → Zentrum“ wird entsprechend die direkte Busfahrt anerkannt und nur der Fußweg verlangt. Eine falsche einzelne Auswahl wird nicht als passend bestätigt. Leere und unvollständige Eingaben zählen in Aufgabe 1 weiterhin nicht als Fehlversuch.

Beide richtigen und beide falschen Einzelwahlen wurden im Browser jeweils viermal geprüft. Die Rückmeldungen blieben gelb, der Zähler blieb null, und keine unvollständige Antwort öffnete einen irreführenden Abschlussweg.

### R4 – begrenzt verbesserte Kartenlesbarkeit

Die Kartenzeiten verwenden jetzt 20 statt 16 SVG-Schrifteinheiten. Die zugehörigen Beschriftungsfelder wurden von 72 × 32 auf 84 × 36 Einheiten angepasst. Keine neue Ansicht, zusätzliche Episode oder Vergrößerungsfunktion wurde eingeführt.

Im tatsächlichen Browser wurden Schriftgröße und SVG-Bildschirmtransformation kombiniert gemessen; zusätzlich wurde geprüft, dass die Textgrenzen innerhalb der zugehörigen Felder liegen. Gemessene Mindestgröße der Minutenangaben, jeweils für beide Linien:

| Ansicht              |                                              CSS-Pixel |
| -------------------- | -----------------------------------------------------: |
| Desktop 1440 × 1000  |                                                  16,00 |
| iPad quer 1024 × 768 | **14,47** (vorher etwa 11,6 laut unabhängiger Prüfung) |
| iPad hoch 768 × 1024 |                                                  17,82 |

Kein Abschneiden der Zeitbeschriftungen und keine horizontale Überbreite in den geprüften Abläufen. Messwerte: [review-readability.json](evidence/review-readability.json). Die Bildschirmaufnahmen für beide Linien auf [Desktop Direkt](evidence/review-desktop-direct.png), [Desktop Über Nord](evidence/review-desktop-north.png), [iPad quer Direkt](evidence/review-ipad-landscape-direct.png), [iPad quer Über Nord](evidence/review-ipad-landscape-north.png), [iPad hoch Direkt](evidence/review-ipad-portrait-direct.png) und [iPad hoch Über Nord](evidence/review-ipad-portrait-north.png) wurden erstellt. Repräsentative Aufnahmen des Rücksprungs, der Entscheidungshilfe sowie beider iPad-Ausrichtungen wurden zusätzlich visuell geprüft.

## Tatsächlich ausgeführte Prüfungen

Linux x86_64; Node 24.19.0, Chromium 154.0.8037.57; vorhandene Vite-/TypeScript-/Playwright-Versionen und Abhängigkeiten unverändert.

| Befehl/Prüfung                                                 | Ergebnis                                                                                                                                                                 |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Neue Logik-Regressionstests vor der ersten Anwendungskorrektur | 8 ausgeführt: **6 fehlgeschlagen, 2 bestanden**. Die Fehler R1–R3 wurden damit am Ausgangscode aufgedeckt; die beiden bereits passenden Schutzfälle blieben erfolgreich. |
| `npm test` nach den Korrekturen                                | **27 bestanden**, 0 fehlgeschlagen, 0 übersprungen: 19 vorhandene und 8 neue Fälle                                                                                       |
| `npm run build`                                                | TypeScript-Prüfung und Produktionsbuild erfolgreich                                                                                                                      |
| Nur die neuen Browser-Regressionsfälle                         | **15 bestanden**, 0 fehlgeschlagen, 0 übersprungen                                                                                                                       |
| Abschließend `npm run test:e2e`                                | **29 bestanden**, 0 fehlgeschlagen, 0 übersprungen; vollständiger Lauf 34,1 Sekunden                                                                                     |
| `npm run format:check`, `git diff --check`                     | Erfolgreich                                                                                                                                                              |

Die 15 zusätzlichen Browserfälle bestehen aus einer R1-Navigations-/Wiederherstellungsfolge, zwei R2-Folgen für die beiden Linien, einer freiwilligen Hilfe-/Linienwechselfolge, einer Freitextfolge, vier R3-Einzelwahlfolgen und sechs vollständigen Durchläufen (zwei Empfehlungen × Desktop/iPad quer/iPad hoch). In diesen sechs Durchläufen wurden sowohl reguläre Belege als auch der unterstützte Weiterweg bis zum Abschluss geprüft. Für iPad wurden Touch-Simulationen mit Tippaktionen verwendet; Dropdown-Werte wurden mit Playwrights Select-API ausgewählt. Das ist keine Behauptung einer Prüfung nativer iPad-Hardware.

Die bisherigen 14 Browserfälle bestehen weiterhin, einschließlich Produktionspfad `/Afrika-2040/`, Neustart, Tastatur, Speicherung, HTML-Textescaping und gesperrtem Speicher. Die neuen Entscheidungshilfe-Ansichten wurden zusätzlich mit axe geprüft: keine gemeldeten Verstöße gegen die geprüften WCAG-2/2.1-A/AA-Regeln. Daraus folgt weder ein vollständiger Kontrastnachweis der SVG-Karte noch umfassende Barrierefreiheit.

Protokolle: [Neue Regressionstests vor der Korrektur](evidence/review-regressions-before.txt), [27 Logiktests](evidence/review-unit-tests.txt), [29 Browsertests einschließlich Messwerten](evidence/review-browser-tests.txt). Die alten Protokolle der Erstübergabe bleiben historisch erhalten und sind keine aktuellen Prüfergebnisse.

## Didaktische Grenze und erneute Abnahme

Die Modellzeiten und die offene Entscheidung bleiben fachlich unverändert. Die Unterstützung erleichtert den Abschluss, ohne falsche Belege als richtig auszugeben. Eine richtige Bausteinauswahl, ein Abschluss oder eine übernommene Beispielbegründung weisen **keinen selbstständigen Erklärungs- oder Abwägungserfolg** nach. Diese Leistungen müssten beispielsweise durch eine kurze eigene mündliche Erklärung oder Zeigen mit Erläuterung in der Lerngruppe beobachtet werden. Eine automatische Freitextbenotung wurde nicht ergänzt.

Ungeprüft bleiben echtes iPad/iPadOS, reale Safari-Version auf dem Gerät, VoiceOver/NVDA, Verständlichkeit und Lernerfolg der Zielgruppe sowie individuelle Förderplanpassung. Die ergänzenden WebKit-Ergebnisse des unabhängigen Berichts gehören zum Ausgangscommit und wurden hier für den Korrekturstand nicht wiederholt. Eine Veröffentlichung oder Wiederherstellung in einem neuen Cloud-Task wurde nicht durchgeführt. Die vollständige Wiederherstellung des neuen Git-Bundles wird separat beim Verpacken des Commitstands geprüft.

Start und Spielablauf bleiben wie in [README.md](../README.md): `npm ci`, `npm run dev`; Prüfungen mit `npm test`, `npm run build` und `npm run test:e2e`. Vorhandenen Checkout verwenden. Das neue Bundle-ZIP dient ausschließlich der **erneuten unabhängigen Abnahme**. Eine Freigabe bleibt ausstehend; Phase 2 beginnt nicht.
