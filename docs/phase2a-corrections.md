> Historischer Korrekturstand `518d2168813aa93c20dd674898e2b26aa644c87d`. Aktuelle Fortführung: [Phase 2B](phase2b-handover.md). Die damaligen Prüfergebnisse und Grenzen bleiben als historische Belege erhalten.

# Gezielte Korrektur Phase 2A nach unabhängiger Gegenprüfung

Ausgangsstand tatsächlich geprüft: `feat/phase2a-kenia-drei-wege`, Commit `f6d922407bacf0af7e592520b7f502ac61501a9e`, sauberer Arbeitsbaum. Weiterarbeit im selben Checkout und Branch. Auftrag: [Work-Korrekturprompt und verbindliche Nutzerergänzungen](phase2a-correction-request.md). Die vollständige neue Commit-ID, Tree-ID und der saubere Abgabestatus stehen im äußeren `BESTAND.txt` des Prüfpakets; im wiederhergestellten Checkout liefert `git rev-parse HEAD` die Abgabe-ID.

## B1: Ziel und Empfehlung verbinden

Vorher konnte „Über Süd / kurzer Schulweg für Amina“ mit richtigen Leila-/David-Belegen abgeschlossen werden, ohne Aminas längsten Weg zu behandeln. Jetzt werden richtige Einzelinformationen ausdrücklich anerkannt. Eine sachliche Rückmeldung zeigt Amina auf Süd mit 28 Minuten gegenüber Nord mit 10 Minuten. Die legitime Süd-Empfehlung wird nicht rot bewertet und ein Zielkonflikt verbraucht keinen Fehlversuch.

Für ein verbundenes Bausteinargument bestehen zwei ausdrückliche Wege:

- „Ich möchte mein Ziel ändern“ öffnet den eigenen Vorschlag. Die Lernenden wählen das neue Ziel selbst; Belege bleiben erhalten und müssen erneut geprüft werden.
- „Trotzdem ist mir Leilas kürzerer Weg wichtiger: 10 statt 22 Minuten“ hält eine konkrete andere Folge fest. Im Lernprodukt stehen sowohl der in Kauf genommene längere Amina-Weg als auch Leilas priorisierter Vorteil und der gewählte Nachteil. Ein bloßes „Ich habe abgewogen“ wird nicht als Gewichtung behandelt.

Die Prüfung leitet für jedes Personenziel die kürzeste Verbindung aus demselben Modell ab. Alle drei Linien bleiben als Empfehlung möglich. Ein günstiger Vergleich für die Zielperson allein erklärt noch nicht das Ignorieren ihrer kürzesten Verbindung. In diesem Fall muss ein anderer zutreffender Vorteil gewählt, das Ziel geändert oder eine eigene Erklärung ausdrücklich unbewertet abgegeben werden. Es gibt keine verpflichtende längere Texteingabe und keine automatische Freitextbewertung.

Auch das allgemeine Kriterium „Verschiedene Interessen abwägen“ benötigt eine konkret ausgewählte Folge. Das Eingeben irgendeines Textes schließt eine offene Bausteinbegründung nicht stillschweigend ab: Die unbewertete Abgabe muss ausdrücklich gewählt werden und erscheint im Lernprodukt als solche. Unzutreffende ausgewählte Belege bleiben als zu prüfen markiert.

Hilfe 3 erklärt genau die gewählte Linie und das bereits gewählte Ziel. Bei einem Konflikt zeigt das Beispiel ausdrücklich die andere Gewichtung. Die Vorschau benennt, dass auch diese Gewichtung übernommen wird. Erst der eigene Übernahme-Klick setzt die Belege und Gewichtung; eigenes Ziel und eigener Text werden nicht überschrieben. Aktuelle Beispielübernahme und die historische Nutzung der Hilfe bleiben unterscheidbar. Änderungen an Linie, Ziel, Belegen, Vergleich, Gewichtung oder Text öffnen die Prüfung erneut. Alte gespeicherte, widersprüchliche oder nur allgemein „abwägende“ Abschlüsse werden zur Überarbeitung geöffnet, ohne die vorhandenen Antworten und früheren Lernschritte zu verwerfen.

## B3: Sprache und Anordnung entlasten

Die bestehende sechste Aufgabe hat jetzt vier kurze Ansichten: Vorschlag, Vorteil, Nachteil, Gewichtung. Pro Beleg wählen die Lernenden eine von zwei Vergleichslinien und dann eine von drei Personen. Statt sechs langen ähnlichen Sätzen stehen Namen und die beiden Gesamtzeiten nebeneinander. Linie und persönliches Ziel sind direkt darüber sichtbar. Abschnittswechsel richten die Navigation im sichtbaren Bereich aus; die Karte kann unter der Aufgabe weiter geöffnet und bedient werden.

Die Denkleistung bleibt erhalten: Alle sechs bisherigen Kombinationen aus Vergleichslinie und Person sind weiterhin möglich. Auch unzutreffende Rollen und Zeitgleichstände bleiben auswählbar. Es wird keine richtige Person vorgewählt oder automatisch zugeordnet. Die Lernenden müssen kürzere/längere Zeiten erkennen, einen Nachteil aus einer anderen Perspektive auswählen und einen Zielkonflikt bewusst bearbeiten. Die Schrift der entscheidenden Fragen, Belegzeilen und Gewichtung beträgt 16 CSS-Pixel, die Touch-Zeilen mindestens 52 Pixel. Texte zu den ursprünglichen fünf Lernschritten und sämtliche Zeiten/Busabschnitte bleiben erhalten.

## B2: Reproduzierbare Browserprüfung

Alle Bildschirmaufnahmen nutzen `tests/browser/artifacts.ts`: standardmäßig `test-results/evidence/`, optional `AFRIKA_EVIDENCE_DIR`. Kein Test schreibt fest nach `/workspace` oder überschreibt standardmäßig historische Belege. Die neue Prüfung wurde mit `AFRIKA_EVIDENCE_DIR=docs/evidence/phase2a-corrections npm run test:e2e -- --reporter=list` aufgezeichnet.

Die native Auswahlfeldprüfung verwendet weiterhin Fokus und tatsächliche Tastaturereignisse. Linux nutzt `Home`, `ArrowDown`, `Enter`; auf macOS ist zusätzlich das Öffnen mit Leertaste vorgesehen. **Hier tatsächlich geprüft: Linux und Chromium, kein physisches iPad/Safari und kein macOS.** Die macOS-Sequenz ist nicht hier verifiziert. Works früherer Befund 44/45 auf macOS und dessen unabhängiger erfolgreicher Tastaturdurchlauf bleiben historische Ergebnisse; ein neuer macOS-Nachweis wird nicht behauptet. Andere Tests mit `selectOption` sind funktionale Auswahltests und werden nicht als native Tastaturbeweise ausgegeben.

## Tatsächliche Prüfungen des Korrekturstands

Die Rohprotokolle und Bildschirmaufnahmen liegen in [evidence/phase2a-corrections](evidence/phase2a-corrections). Die Eingabe-Hashes und konkrete Umgebung sind in [validation-inputs.json](evidence/phase2a-corrections/validation-inputs.json) aufgezeichnet. Der Produktionsbuild wurde vor den Browserläufen erstellt und während des abschließenden Laufs nicht verändert.

| Prüfung                   | Ergebnis / genaue Abdeckung                                                                                                                                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Logik                     | 59/59 Fälle; weiterhin alle neun Modellzeiten, Einstieg/Teilfahrten und 972 Belegpaare; zusätzlich alle 3 Linien × 3 Personenziele, Konflikte, konkrete Gewichtung, Zieländerung, fehlende Gewichtung, Hilfe, Änderungen, alte Abschlüsse und bewusste unbewertete Texte  |
| Build                     | `npm run build` erfolgreich: TypeScript und Vite-Produktionsbuild, keine neue Abhängigkeit; Lockfile unverändert                                                                                                                                                          |
| Browser                   | 58/58 Fälle auf Linux/Chromium: alle bisherigen 45 Fälle an die neue Oberfläche angepasst plus 13 gezielte Korrekturfälle; keine Wiederholungsversuche (`retries: 0`)                                                                                                     |
| Alle 9 Zielkombinationen  | Richtige Vor-/Nachteile ausdrücklich anerkannt; 6 Konflikte neutral und zunächst offen; explizite andere Gewichtung mit nachvollziehbarem Produkt und anschließend bewusste Zieländerung, jeweils auch Neuladen                                                           |
| Simulierte iPads          | 768×1024 und 1024×768, Touch-Ereignisse; Vorteil/Nachteil, beide Konfliktwege, automatische und freiwillige Hilfe, Beispielübernahme, Gewichtsänderung und erneute Prüfung; lokale Vergleichszeilen passen zusammen in den sichtbaren Bereich, kein horizontaler Überlauf |
| Tastatur                  | Native Ursache-/Folge-Auswahl, Kartenbedienung, neue Radio-Belege und beide Konfliktwege ohne Freitextpflicht; Fokus nach Prüfung, Beispielübernahme und Abschluss                                                                                                        |
| Erhaltene Regressionen    | R1 direkte Startkarte bei Rücksprung/Neuladen; R2 Erklärung nach höchstens zwei bewerteten Fehlversuchen mit bewusster Übernahme; R3 richtige unvollständige Teilantworten; ursprünglicher Transfer, Speicher blockiert/ungültig, Neustart und XSS-Textescaping           |
| Präfix und Zugänglichkeit | Vollständiger zusätzlicher Durchlauf unter `/Afrika-2040/`, ohne Veröffentlichung; axe-Prüfungen der vorhandenen Ansichten und der Konflikt-/Hilfenansichten ohne gemeldete A/AA-Verstöße                                                                                 |

Die iPad-Praxisprüfung misst die räumliche Nähe von Auswahlkontext und Belegzeilen sowie deren tatsächliche Sichtbarkeit. Sie verlangt keinen Kartenwechsel zum Vergleichen. Ein normaler vertikaler Fortgang zwischen den kurzen Abschnitten ist weiterhin möglich; ein vollkommen scrollfreies gesamtes Spiel wird nicht behauptet. Die JSON-Messwerte und je Orientierung die Ansichten Vorteil, Nachteil, offener Konflikt und fertiges Lernprodukt liegen neben den Protokollen. Die Bilder wurden visuell betrachtet. Während der Entwicklung wurde ein zunächst zu tiefer Belegbereich im Querformat korrigiert. Die vollständige abschließende Prüfung bezieht sich auf die danach angepasste Oberfläche.

## Curriculare Einordnung und Grenzen

Die drei curricularen PDFs sind erneut auf allen 159 Seiten textuell zugänglich, mit identischen SHA-256-Werten. Das ursprüngliche Renderaudit bleibt getrennt dokumentiert; es wird nicht als neuer Vollrender ausgegeben. [Zugriffsnachweis](evidence/phase2a-corrections/source-access-recheck.json), [curriculare Begründung](curriculum.md).

Die Korrektur konkretisiert B1 S2 und K1 S4 (Fachanforderungen S. 22), Sprachbildung und die gleiche kognitive Herausforderung bei sprachlicher Unterstützung (FA S. 9/15; Leitfaden S. 20/62), im Afrikaschwerpunkt Jahrgang 7 des Schulcurriculums S. 4. Auswahl von Belegen und Gewichtungsbausteinen ist weiterhin angeleitet. Ein technisch verbundener Bausteintext beweist keine vollständig selbstständige Urteilskompetenz, individuelle Förderwirkung oder Unterrichtswirksamkeit. Eine Erprobung mit Schülerinnen und Schülern sehr geringer Lesekompetenz und die unabhängige Gegenprüfung stehen aus. Keine umfassende Nachhaltigkeitsbewertung, keine Verallgemeinerung über Nairobi/Kenia und keine neue Entwicklungsphase.

Kein Push, Merge, Deployment oder Phase 2B. Die Abgabe ist ein lokaler Entwicklungsstand für die erneute unabhängige Prüfung. Das vollständige ZIP außerhalb des Repositories enthält Quellkopie, Git-Bundle, Tests, Protokolle, Bilder und Bestands-/Prüfsummendateien. Paketprüfung und tatsächlicher Cloud-Dateidownload sind getrennte Dinge; der in diesem Gespräch wiederholt fehlgeschlagene Dateiexport ist durch eine lokale ZIP-Prüfung nicht behoben.
