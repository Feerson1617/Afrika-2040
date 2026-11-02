# Lernhindernisse – belegter Zwischenstand

Ausgangscommit: `542eab3176d79a509ab29cdf648c3f5a1fb9faf4`, Branch `feat/afrika-vier-lernwege`, Arbeitsbaum zu Beginn sauber. Kein Push genehmigt.

**Der vollständige Auftrag ist noch nicht erfüllt.** Die Matrix enthält das Inventar aller 52 Varianten mit 494 Lernschritten. Sie ist ausdrücklich keine abgeschlossene didaktische Einzelprüfung. `completeAudit: false` und `reviewComplete: false` verhindern eine Verwechslung. Eine automatisch gelöste Aufgabe wird nicht als geeignet freigegeben.

## Tatsächlich implementiert

- ESA-Kenia 2 `demand.now.capacity`, Ghana 4 `share.paid.free` und Marokko 6 `area.total.total`: Eingabewerte statt fertiger Ergebnisse. Dasselbe gilt für die zusammengefassten MSA-/AHR-Aufgaben. Keine Antwort im SVG oder zugänglichen Namen. Vollansicht nach Hilfe 3 oder vollständig richtiger Rechnung; keine automatische Beispielübernahme. Alle bisherigen Auswahl-IDs und Berechnungen bleiben erhalten.
- Die notwendige Untersuchung beider Marokko-Pläne bleibt möglich und verpflichtend. Die Rechnung gilt ausdrücklich für den Plan mit Zusatzfeld; der frühere Fall bleibt klar bezeichnet. Anfang und frühere Entnahme bleiben für weitere Felder der MSA-/AHR-Aufgabe vorhanden.
- Kenia 2: kurze Erstansicht bei der Frage, ob die Plätze reichen. Menschen und Plätze werden in einer kleinen Tabelle verglichen. Zusätzlicher Kontext steht aufklappbar bereit. Beim Rechnen bleibt die Gehzeit ausdrücklich den acht neuen Nachbarn zugeordnet.
- Hilfen zu Landschaft/Wasserkreislauf, Stromanteil/GEPA-Nachweis, Wasserentnahme/Ankunft/Rest und zusätzlicher Fahrt/Fußweg sind auf die jeweilige Frage bezogen. Unzutreffende Pfeil- und Tankverweise entfallen.
- Im Förder-/ESA-Stromschritt sind BIP-Spalte und allgemeine Wirtschaftserklärung aus der Erstansicht entfernt. Originaldaten und vollständige Quellen bleiben aufklappbar. „89,5 Prozent“ wird als ungefähr 90 von 100 erklärt; daraus folgt keine Aussage über Stromausfälle.
- GE und WE werden in den betroffenen Simulationen und bei Bedarf im Rückblick ausdrücklich als erfundene Einheiten erklärt. Keine Umdeutung in Euro oder Liter.
- Die Wörterhilfe „Kapazität“ verrät nicht länger das aktuelle Ergebnis 20. Die bestehenden 66 Begriffe wurden gelesen und in 56 notwendige Begriffe (A) und zehn Vertiefungsbegriffe (B) eingeordnet. Diese Einordnung ersetzt noch nicht die Prüfung ihres Erstauftretens in jeder Aufgabe; zusätzliche Begriffe außerhalb des Glossars sind noch offen. Keine künstliche C-Kategorie allein zur Kürzung.

## Alle 13 Lernbereiche und verbleibende Arbeiten

| Bereich          | Belegter Stand                                                          | Noch offen                                                                       |
| ---------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Orientierung     | Vorhandene Karte, IDs und Lernhandlungen erhalten                       | Alle Zeichen, Einführungszeitpunkte, tatsächliche Sichtbereiche einzeln prüfen   |
| Bilder und Orte  | Vorhandene Quellen und ESA-Kontext erhalten                             | Beobachtung/Vermutung und Hilfen vollständig pro Schritt beurteilen              |
| Natur und Wasser | Landschaft/Wasserweg getrennte Hilfen, keine erfundenen Pfeile          | Alle Kalender-, Mengen- und Quellenaufgaben einzeln prüfen                       |
| Bevölkerung      | Fachmodell und Antworten erhalten                                       | Negative Zahlen, Zeichen und Voraussetzungen aller Rechenketten prüfen           |
| Wirtschaft       | Stromanteil entlastet; GEPA-Hilfe konkretisiert                         | Alle übrigen Rechen-, Quellen- und AHR-Schritte vollständig prüfen               |
| Zukunft          | Persönliche Prioritäten unverändert                                     | Leselast, Einheiten, Monatskosten und lange Abwägungsbausteine prüfen            |
| Kenia 1          | Zeiten und Antwortidentitäten unverändert                               | Erstansichten, Einstiege und Linienabschnitte vollständig prüfen                 |
| Kenia 2          | Rechenleck entfernt; zwei kurze Ansichten; Hilfe zur konkreten Maßnahme | Alle weiteren Zustände und Hilfen vollständig beurteilen                         |
| Ghana 3          | GE-Einführung; Modellwerte erhalten                                     | Verarbeitung, Erstansichten, Kostenbegriffe und alle Hilfen einzeln prüfen       |
| Ghana 4          | Freien Betrag selbst rechnen; GE erklären                               | 28 Verteilungen, Perspektiven und alle gespeicherten Produkte vollständig prüfen |
| Marokko 5        | WE-Einführung und Teilfragenhilfen verbessert                           | Alle Vergleichs-, Entscheidungs- und Transferzustände einzeln prüfen             |
| Marokko 6        | Rechenleck entfernt; Untersuchungspflicht erhalten                      | Alle Abwägungen, Grenzfälle und Ansichten didaktisch prüfen                      |
| Rückblick        | Einheitserklärung bei Bedarf ergänzt                                    | Alle Vergleiche, Quellenbegriffe und Direkteinstiege einzeln prüfen              |

Insbesondere noch nicht erledigt: die zwanzig Prüfdimensionen für jeden Schritt fachlich fertig ausarbeiten; alle bereits geeigneten Aufgaben bewusst freigeben; lange Gewichtungsoptionen beurteilen und gegebenenfalls überarbeiten; die älteren erreichbaren Oberflächen vollständig einbeziehen; alle zusätzlichen Fachwörter erfassen; alle Erstansichten und Zustandswechsel im Browser didaktisch beurteilen. Die Platzhalter in der Matrix bleiben sichtbar. Dieser Stand ist kein Release-Kandidat.

## Nachweise

Die tatsächlich ausgeführten Tests und ihre Endstände stehen in `evidence/lernhindernisse/checks.json`. Bestehende Tests werden nicht gelöscht oder abgeschwächt. Eine beim großen Lauf entdeckte fehlende explizite Zuordnung zur Gruppe der acht neuen Nachbarn wurde im Anwendungstext korrigiert. Der Erstlauf mit diesem Fehler bleibt als fehlgeschlagen protokolliert.

Vorher-/Nachher-Bildschirmaufnahmen stammen aus dem unveränderten Ausgangscommit und diesem Arbeitsstand, Chromium bei 1024 × 768 mit emuliertem Touch. Wortzahlen beruhen auf tatsächlich sichtbarem `innerText`, nicht auf Quelltextlänge. Der zusätzlich notwendige Einheitentext kann die Wortzahl erhöhen; das ist offen auszuweisen. Die Zahlen und Bilder werden nach dem letzten Build aufgenommen.

Es werden keine Unterrichtserprobung, physische Schul-iPad-Prüfung oder vollständige Screenreader-Abnahme behauptet. Eine vollständige Lernhindernisprüfung muss über erfolgreiche Browserdurchläufe hinausgehen. Alle Testantworten sind synthetisch.

## Tatsächliche Vorher-/Nachher-Messung

| ESA-Aufgabe           | Vorher: sichtbare Wörter | Nachher |
| --------------------- | -----------------------: | ------: |
| `demand.now.capacity` |                      252 |     169 |
| `share.paid.free`     |                      146 |     156 |
| `area.total.total`    |                      194 |     193 |

Ghana enthält nachher zusätzlich die notwendige Einführung von GE. Das wird nicht als geringere Wortzahl ausgegeben. Die Rechenlösung 120 ist aus der Erstansicht entfernt. Die synthetische Messung aller 494 Erstansichten steht separat in `evidence/lernhindernisse/initial-view-measurements.json`; sie ist kein Nachweis von Verständlichkeit oder Lernwirksamkeit. Die dort verwendeten vorherigen Antworten sind bewusst übernommene Beispiele.

## Tatsächliche technische Prüfungen

488/488 Logiktests bestanden. Größerer Browserlauf: 390/402 bestanden, zwölf Fälle scheiterten zunächst an der fehlenden ausdrücklichen Gruppe der acht neuen Nachbarn. Nach Korrektur und letzter Aufgabenentlastung bestanden 108/108 gezielte Fälle in Chromium und WebKit, danach nochmals 6/6 Rechenleck-Fälle nach Ergänzung der aufklappbaren Modellgrenzen. Zusammen mit den 28 gezielten Anfangsfällen sind 430 verschiedene Browserfälle erfolgreich geprüft. Darunter alle 52 Varianten jeweils regulär und unterstützt in beiden Engines (208 unterschiedliche Kombinationen). TypeScript, Produktionsbuild und strenge Artefaktprüfung bestanden. Kein Test gelöscht oder abgeschwächt. Die vollständige historische Browser-Suite wurde in diesem Zwischenstand nicht erneut ausgeführt.

Die Identitäten aller Aufgaben und Felder, Bewertungs-Sollwerte, akzeptierten Antwort-IDs, Abhängigkeiten und Modellverknüpfungen wurden zusätzlich gegen die Aufgabenverträge des Ausgangsstands verglichen. Wortlaut und Darstellungen dürfen sich ändern; dieser Vergleich schützt die fachliche Auswertung. Die Rohprotokolle liegen im kompakten lokalen Prüfpaket, Prüfsummen und Laufdetails im JSON-Nachweis.
