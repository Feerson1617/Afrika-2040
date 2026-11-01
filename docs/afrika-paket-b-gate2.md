# Paket B – Gate 2: fünf Themen in vier Lernwegen

Historischer Bericht zum Ausgangscommit 3c8b51b. Die anschließende gezielte Nachbesserung, aktuellen Testergebnisse und neue AHR-Aufgabe stehen im [Gate-2-Korrekturbericht](afrika-gate2-correction.md).

Ausgang: `8d73c0229e9358b5efbfa0bf12ae69374d8a112a`, Branch `feat/afrika-vier-lernwege`. Der neue Auftrag gibt Paket B ausdrücklich frei. Dieser Bericht beschreibt ausschließlich den tatsächlich umgesetzten Themenausbau; Gates 3–5 sind damit nicht abgeschlossen.

## Umsetzung

Alle fünf Themen sind über Kapitel und direkte Empfehlungen (`lernweg` / `bereich`) in vier Profilen aufrufbar. Neue Themenkennungen sind `a`, `n`, `d`, `e`; Bevölkerung `c` bleibt bytegleich in ihren bisherigen Aufgabenverträgen und mathematischen Modellen. Profile, gemeinsame Bewertung, Zahlennormalisierung und Tab-Speicherung werden weiterverwendet. Keine vier Projektkopien, keine neuen realen Daten, keine Bewertungsdienste.

| Thema               | Förder | ESA | MSA | AHR |
| ------------------- | -----: | --: | --: | --: |
| Bilder / Afrikabild |      5 |   7 |   5 |   5 |
| Natur und Wasser    |      6 |   9 |   7 |   8 |
| Bevölkerung         |     14 |  13 |   8 |   8 |
| Wirtschaft          |      7 |   9 |   5 |   5 |
| Zukunft entscheiden |     12 |  12 |  12 |  13 |

Die Zahlen bezeichnen Teilaufgaben, keine Kompetenzstufen oder Unterrichtsstunden. Förder/ESA zeigen eine Frage pro Schritt. Förder verlangt keine Texteingabe oder selbstständige negative Rechnung; vorgegebene Teilrechnungen bleiben als solche bezeichnet. ESA rechnet mit sichtbaren Operationsgerüsten. MSA arbeitet überwiegend strukturiert mit einem kurzen eigenen Anlass je neuem Kapitelkern. AHR ergänzt Quellen-/Auswahlkritik, bedingte Zusammenhänge und eine eigene Begründung. Hilfen bleiben überall verfügbar.

- **Bilder:** Erste Vorstellung ohne Richtig/Falsch; zwei echte Fotos nacheinander; gebaute Details, unbelegte Wohlstandsaussagen, begrenzte Überschriften und die Wirkung einer Bildauswahl. Keine Behauptung einer tatsächlich untersuchten deutschen Medienauswahl. Die Schulzeitung ist erfunden.
- **Natur:** Getrennte Saisonkalender, Regionalmittel in gleicher Einheit/Periode, Nutzung und Grenzen, Naturraumbegriffe sowie ein vereinfachtes Kreislaufschema. Kleinere Speicher und ein ausdrücklich erfundener Vergleich gleicher Jahresmengen bei verschiedener Saison sind neue Anwendungen. Keine Monatsmesswerte aus Zeichen ableiten und den Tank nicht als Region ausgeben.
- **Bevölkerung:** Die angenommenen Paket-A-Korrekturen und alle vier vollständigen Wege bleiben erhalten.
- **Wirtschaft:** Betrieb A/B, getrennte Anschaffung, historische Strom-/BIP-Angaben, tatsächlicher GEPA-Eigenbericht, mögliche Verbindung von Wissen und Strom sowie Ursachen-/Verteilungsgrenzen. Keine Gleichsetzung von BIP und Betriebsüberschuss.
- **Zukunft:** Zugang, einmalige/monatliche Kosten, Umwelt und Kühlung; zuerst ein Ziel, dann eigene Planwahl, dazu separat passender Beleg und Grenze. Eine konkrete abweichende Gewichtung oder Zielanpassung ist neutral möglich. Wartung bleibt bei beiden Plänen ungeklärt; eine beabsichtigte Änderung führt zur erneuten Planwahl und Belegprüfung.

Die Kapitel zeigen die neuen Themenzugänge. Alte Themen und Episoden bleiben separat erreichbar; die vollständige Navigations-/Journalintegration ist Gate 4 und wird hier nicht behauptet.

## Materialien und Lernprodukte

Primärmaterial und Worterklärung gehören zum aktuellen Schritt. Vollständige vorhandene Materialien, genaue Werte und Quellen sind freiwillig aufklappbar. Beide echten Fotos behalten Urheber, Datum und Lizenz; keine erfundenen dokumentarischen Bilder. Historische Quellen werden nicht als neu abgerufen bezeichnet.

Eigene Texte bleiben fachlich ungeprüft, auch nach Kriterienaufruf oder Überarbeitung. Standardhinweis, freiwillige Hilfe, Beispielanzeige und bewusste Übernahme bleiben getrennt. Der unterstützte Weiterweg verändert weder eine legitime Priorität in eine falsche Antwort noch einen eigenen Text in einen automatisch geprüften Fachtext.

Bei einem Planwechsel werden spätere Beleg-/Grenz-/Gewichtungsnachweise wieder zum Entwurf. Die Antworten werden erhalten, aber neu geprüft. Frühere Abgaben behalten ihre damaligen Wortlaute und ihren damaligen Plan. Dadurch wird ein früher korrekter Kühlraumbeleg beim späteren Wechsel zu Schatten nicht rückwirkend als falscher Schattenbeleg umgedeutet.

## Prüfungen

Die gesamte Logiksuite besteht mit **274 Fällen**: alle bisherigen 239 sowie 35 neue Fälle, darunter vollständige reguläre/unterstützte Themenwege, alle gerichteten Profilwechsel je neuem Thema, korrekte Teile und Plan-/Zielkonflikte. Kein Test wurde gelöscht oder übersprungen. Die bestehenden drei Katalog-/URL-Erwartungen wurden sachlich an neu implementierte Kennungen angepasst; unbekannte und noch geplante Bereiche bleiben ausdrücklich abgewiesen.

Die neuen regulären Tests verwenden unabhängige Sollantworten aus `tests/topic-oracles.ts`; sie lesen nicht die Beispielwerte der Implementierung als Lösung ab. Unterstützte Durchläufe prüfen bewusst die Hilfe- und Beispielübernahme. Die abschließende neue Browserprüfung besteht mit **68 Fällen**, je 34 in Chromium und WebKit. Darin enthalten: 64 vollständige neue Themenwege (16 neue Kombinationen × regulär/unterstützt × zwei Engines) und vier zusätzliche Fehler-/Revisionsfälle. Im ersten kombinierten Lauf bestanden außerdem alle 40 vorhandenen Paket-A-Pilotfälle. Das ergibt **108 verschiedene erfolgreiche gezielte Browserfälle**. Nach den letzten Kürzungen der Fördermaterialien wurden die acht betroffenen Natur-/Zukunftswege zusätzlich erfolgreich geprüft; sie werden nicht erneut zur Zahl verschiedener Fälle addiert.

Über alle fünf Themen ergeben sich 80 vollständige Themen-Durchläufe; zusätzlich wurden 16 frühe Kenia-Durchläufe wiederholt. Dies sind technische Browserläufe, keine Unterrichtsbeobachtungen. Desktop: 1366 × 900, unterstützte Wege mit Touch bei 1024 × 768. Hinzu kommen die vorhandenen schmalen Pages-/Framefälle, Speicherwarnung und Neustart. Eigene Eingaben, Reload, Fokus, Enter/Leertaste, richtige/falsche Antworten, Hilfen, Beispielübernahme, Kriterien und historische Lernprodukte wurden tatsächlich bedient. Axe prüft relevante A/AA-Tags einschließlich WCAG 2.1 A und 2.2 A in ausgewählten Aufgaben-/Journalzuständen. Keine erkannten Verstöße in diesen Scans, keine Behauptung vollständiger manueller WCAG-Konformität.

Die tatsächlichen Quellen-/Materialtexte und vollständigen Aufgabenverträge stehen im aktualisierten `learning-task-contracts.json`; planabhängige Antwortformen sind für beide Pläne ausdrücklich ausgeleitet.

Produktionsbuild: TypeScript/Vite erfolgreich. Der unveränderte enge Artefaktprüfer erlaubt weiterhin genau HTML, JS, CSS und die zwei bytegleichen freigegebenen Fotos. Gemeinsame Modelle, reale Inhaltsdaten, Karte, bisherige Fachbewertung, Lockfile und Build-Prüfer sind gegenüber der Basis bytegleich. `src/inquiry/ui.ts` exportiert zusätzlich die bereits vorhandenen Fotometadaten; die Fotos oder Originalquellen wurden nicht verändert.

### Fehlerkontrolle während der Umsetzung

Die neuen Tests fanden die zunächst rückwirkend veränderte Bewertung früherer Planbelege; historische Abgaben erhalten jetzt den damaligen Kontext. Bei der Bildprüfung fielen abgeschnittene lange Auswahltexte auf: neue längere Bausteine sind als umbrochene native Radio-Auswahlen dargestellt. Ein Anschlussfehler dieser neuen Eingaben wurde im regulären Browserweg erkannt und im Ereignishandler korrigiert. Die fehlerhafte Zwischenprüfung wurde beendet und die betroffenen Themen erneut geprüft; sie wird nicht als bestanden gezählt. Frühere erfolgreiche Hilfsübernahmen wurden dabei nicht als Beleg für funktionierende eigene Eingaben ausgegeben.

### Tatsächlich gemessene Zustände

Reale Reducer-Wege mit einem Abgabeversuch pro Aufgabe, jede vierte Aufgabe unterstützt; neue Antworten über feste Sollwerte. Die Messung enthält die 20 Themenwege und vier frühen Kenia-Vergleiche, **keine vollständigen sechs Episodenprodukte**.

| Muster                                              | UTF-16-Einheiten | UTF-8-Bytes |
| --------------------------------------------------- | ---------------: | ----------: |
| Ein Profil, sechs vorhandene Bereiche               |           31.755 |      31.765 |
| Zwei Profile                                        |           67.443 |      67.471 |
| Drei Profile                                        |           95.148 |      95.224 |
| Alle 24 derzeit vorhandenen Wege                    |          125.959 |     126.127 |
| Zusätzlich lange synthetische aktuelle Textentwürfe |          153.860 |     153.980 |

Alle gemessenen Aufgabenstände lassen sich inhaltlich unverändert wiederherstellen. **Der rohe Tabstand überschreitet bereits bei zwei Profilen 64.000 Zeichen.** Er darf nicht unverändert als späteres SCORM-Wiederaufnahmeformat ausgegeben werden. Ein separater kompakter Datensatz muss feste Aufgaben-/Identitätstexte und aus Version/Plan/Antwort-ID rekonstruierbare Bausteintexte auslassen, aktuelle Rohantworten, Kontext und Hilfeherkunft dagegen erhalten. Eine garantierte Obergrenze für vollständige alte Produkte und lange Texte ist weiterhin nicht nachgewiesen. Keine SCORM-API, kein Codec oder LMS-Tracking implementiert.

Nicht behauptet: empirische Verständlichkeit oder Lernwirksamkeit, Hardware-iPad-/Safari-Abnahme, vollständige Screenreader-Konformität oder eine tatsächlich erfolgte Lehrkraftprüfung. Die 52er-Gesamtabnahme bleibt Gate 5. Keine fertige Klassenarbeit, Handreichung, SCORM-API, LMS-Übermittlung oder Kontenfunktion.

## Ausstehend nach diesem Zwischenstand

- **Gate 3:** Alle sechs Simulationsepisoden vollständig in vier Profilen. Der vorhandene frühe Kenia-Vergleich ist weiterhin nur ein Teilweg; er wird nicht als vollständige Episode gezählt.
- **Gate 4:** Durchgängige Kapitel-Hauptnavigation, Orientierung und Rückblick in vier Profilen sowie die umfassende Zusammenführung der alten und neuen Lernjournale. Die hierfür nötigen acht Querschnittsvarianten sind noch geplant.
- **Gate 5:** Gesamtabdeckung und unabhängiges Sollblatt aller 52 Varianten, vollständige Simulationstests, abschließende Größen-/Altstandprüfung und Gesamtprüfpaket.

Katalogstand: **20 vollständig umgesetzte Themenvarianten, vier begrenzte frühe Kenia-Varianten, 28 geplante Varianten**. Paket B ist insgesamt noch nicht fertig. Gate 2 erhält einen eigenen überprüfbaren Commit. Kein Push, Merge, Release oder Deployment.
