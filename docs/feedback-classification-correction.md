# Begrenzte Feedback-Korrektur nach 2685b60

Ausgangspunkt: `feat/ghana-marokko-episoden`, `2685b60ff6fd039c6f179189df8fb0c2b1c83621`, sauberer Arbeitsbaum. Auftrag: Korrekturprompt, Nachprüfung und ausdrückliche Nutzerergänzung vom 25. Oktober 2026. Die fremden Prüfergebnisse wurden als Befunde gelesen; sie sind keine eigenen erneut ausgeführten Tests.

## Änderung

Genau eine Anwendungszeile in `src/regions/shared.ts`, `evaluateStudyDecision`, stellt die Klassifikation vollständig ausgefüllter, objektiv unpassender Bausteine wieder her. Die übrigen Zweige, Texte, Modelle, Farben im CSS, Hilfestufen, Speicherlogik und Spielinhalte bleiben unverändert.

| Situation                                            | Rückmeldung                                                               | Neuer Fehlversuch?                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------- |
| Beide Bestandteile unpassend, erste Prüfung          | `incorrect`, rot                                                          | ja                                            |
| Genau ein Bestandteil passend, erste Prüfung         | `partial`, gelb; richtiger Teil bleibt anerkannt/gewählt                  | ja                                            |
| Zweiter vollständig bewertbarer Fehlversuch          | `hint`, gelb; vorhandene automatische Hilfe 3 zeigt das konkrete Beispiel | ja, Zähler bleibt auf höchstens zwei begrenzt |
| Unvollständig, ohne passenden Teil                   | `hint`, gelb                                                              | nein                                          |
| Unvollständig, mit passendem Teil                    | `partial`, gelb                                                           | nein                                          |
| Passende Belege, noch offener legitimer Zielkonflikt | `neutral`, offen                                                          | nein                                          |
| Passende Belege und bewusst gewichteter Zielkonflikt | `neutral`, begründeter Abschluss                                          | nein                                          |
| Unklarer eigener Text                                | `neutral`, ausdrücklich nicht automatisch sicher prüfbar                  | nein                                          |

Bewertet wird der fachliche Bezug von Beleg und Grenze zum Vorschlag. Die Wahl der Maßnahme bleibt legitim. Eine wahre Zahl der anderen Maßnahme wird weiterhin dieser Maßnahme zugeordnet und nicht als mathematisch falsch bezeichnet. Die automatische Erklärung ist keine bewusste Übernahme; erst die bestehende Übernahmeschaltfläche markiert das Produkt als unterstützt. Keine Punkte oder Strafabzüge.

Die bisherige Neutral-Erwartung im ausdrücklich genannten Logiktest war falsch. Der Test heißt nun „a true fact about another option with a correct limit is partial; the chosen position stays legitimate“ und prüft gelbe Teilanerkennung. Der entsprechende bestehende Browserfall wurde ebenso korrigiert. Die bisherigen zwölf Korrekturwege prüfen zusätzlich erste rote und zweite gelbe Rückmeldung. Kein Test wurde gelöscht, übersprungen oder inhaltlich abgeschwächt.

## Eigene Absicherung

Vier neue Logikmatrizen prüfen vollständig falsche Bausteine, beide Teilfehler-Richtungen, wahre Angaben einer anderen Maßnahme, unvollständige Angaben, legitime offene/gewichtete Ziele, unklare Texte, Zähler, Übernahme, tatsächliche Überarbeitung und Neuladen. Eine neue Browsermatrix bedient alle vier regionalen Episoden auf Desktop und simulierten iPads hoch/quer; iPad-Eingaben erfolgen mit Touch. Die vorbereitenden Untersuchungsschritte werden dabei über die sichtbaren freiwilligen Hilfen abgeschlossen, ohne Zustandsinjektion.

Jeder der zwölf Browserfälle prüft sechs vollständig bewertbare Fehlzuordnungen. Geprüft werden die sichtbare Feedbackklasse, berechnete Text-/Hintergrund-/Rahmenfarben, konkrete Rückmeldung, gespeicherte Auswahl und Zähler, erneutes Laden, zweite Erklärung, Begrenzung des Zählers, bewusste Übernahme und Verlust der aktuellen Beispielmarkierung nach einer echten Änderung. Hinzu kommen unvollständige Eingaben, legitimer Zielkonflikt, Zielanpassung, bewusste Gewichtung und bewusst unbewertete eigene Abgabe. Seiten-, Konsolen-, Anfrage- und HTTP-Fehler werden erfasst. Die erklärenden Zustände werden mit den bestehenden WCAG-A/AA-Filtern geprüft.

Gemessene Hintergründe: rot `rgb(255, 240, 236)`, gelb für `partial` und `hint` `rgb(255, 247, 218)`, neutral `rgb(238, 243, 245)`. Zusätzlich werden die konkreten Text- und Rahmenfarben gegen feste Sollwerte geprüft. Die repräsentative rote und gelbe erste Rückmeldung wurde visuell kontrolliert. JSON-Messprotokolle und wenige Bilder liegen außerhalb von Git.

**Empfindlichkeitskontrolle vor der Anwendungsänderung:** Mit den korrigierten Sollwerten scheiterten fünf Logikprüfungen am alten Stand, weil tatsächlich `neutral` statt `partial` bzw. `incorrect` zurückkam. Auch der neue Desktop-Browserfall erkannte denselben Fehler. Das ist eine beabsichtigte negative Gegenkontrolle, kein bestandener Anwendungstest. Eine anfängliche neue Speicherassertion wurde sachlich korrigiert: JSON lässt optionale `undefined`-Felder weg; verglichen werden nun die tatsächlich serialisierbaren Entscheidungsdaten, weiterhin vollständig und unverändert.

**Grenzen:** Der erneute lokale WebKit-Start scheitert an der fehlenden ausführbaren Engine. Kein eigener WebKit-Erfolg, keine macOS-/Hardware-iPad-/Safari-Prüfung und keine vollständige Screenreader-/WCAG-Zertifizierung behauptet. Die fremde WebKit-Nachprüfung ist kein Ersatz für diesen fehlenden eigenen Lauf. Keine Aussage über empirische Lernwirksamkeit oder selbstständige Eignung für jede 7. Klasse. Die unabhängige Abnahme bleibt erforderlich.

Der Auftrag endet mit dem lokalen Korrekturcommit. Kein Push, Merge oder Pages-Deployment ohne erneute ausdrückliche Freigabe. Die historischen Berichte beschreiben ihre damaligen Stände; ihre frühere pauschale Neutral-Erwartung wird durch die obige Klassifikation berichtigt.

## Abschlussergebnis

- **151/151 Logiktests**, **181/181 Chromium-Browserfälle**, Produktionsbuild und gezielter Formatcheck bestanden. Keine Test-Retries, keine gelöschten oder übersprungenen Fälle.
- Die 181 Fälle enthalten sämtliche 169 bisherigen Fälle und die zwölf neuen Matrixfälle. Diese sind Prüfabläufe, keine 181 vollständigen Unterrichtserprobungen.
- Die zwölf Matrixfälle bestätigen 24 erste rote und 48 erste teilrichtige gelbe Rückmeldungen sowie anschließend 72 gelbe Erklärungshilfen. Die berechneten Farben und Texte stehen in den externen JSON-Protokollen. Keine erfassten Seiten-, Konsolen-, HTTP- oder Anfragefehler in diesen Matrixfällen.
- Alle drei curricularen Original-PDFs haben unveränderte SHA-256-Werte; dies war eine Hashkontrolle, keine neue seitenweise Inhaltsprüfung.
- WebKit bleibt mangels installierter Engine ungeprüft. Die unabhängige Gesamtprüfung sowie reale Unterrichts- und Hardware-Erprobung bleiben offen.

Neue Protokolle und wenige Bilder bleiben unter `/workspace/output/feedback-2685-correction/` außerhalb der Git-Historie. Die einzige Änderung am Anwendungscode ist die Rückgabeklassifikation in einer Zeile der gemeinsamen Bewertungsfunktion. Keine weitere Änderung an Spielinhalten, keine neuen Abhängigkeiten und keine Veröffentlichung.
