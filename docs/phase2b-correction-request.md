Gezielte Korrektur Phase 2B, kein neuer Entwicklungsabschnitt.

Repository Feerson1617/Afrika-2040, vorhandener Branch feat/phase2b-kenia-strassenereignis. Verbindlicher zu prüfender Ausgangscommit: 8eb0d8bcdaf45da27ca0a9cdab5de09a10238562. Arbeite im bestehenden Checkout und erhalte alle bisherigen Korrekturen, Modellwerte, ersten Lernprodukte und Unterstützungskennzeichnungen. Keine neuen Episoden, Arbeitsblätter, Punktesysteme oder externen Bewertungsdienste. Kein Push, Merge oder Deployment ohne gesonderte Freigabe.

P2-Befund der unabhängigen Prüfung: Bei einem vollständig ausgefüllten, vom Spiel zurückgewiesenen Vorher-/Jetzt-Beleg erreicht die automatische Unterstützung nie ihre Schwelle.

Reproduktion:
1. Erste Empfehlung Über Nord, Ziel Amina: kurzer Schulweg, passende Amina-/David-Belege erstellen.
2. Ereignis korrekt bearbeiten: Leila–Platz betroffen; Direkt und Nord länger, Süd gleich; Einstieg Süd und unveränderter Fußweg als Ursache.
3. Erneute Empfehlung Nord und Amina-Ziel beibehalten, passende Vor-/Nachteile vorhanden lassen.
4. Unter Das hat sich für meinen Vorschlag verändert den Beleg Leila · Über Süd: 10 → 10 Minuten (gleich) wählen.
5. Vollständigen Begründungsbaustein Ich bleibe bei Über Nord. Amina braucht 10 Minuten. Dieser kurze Weg ist mir wichtig wählen.
6. Viermal Erneute Empfehlung prüfen.

Tatsächlich: Abschluss gesperrt, stets dieselbe Aufforderung Zeige Leilas Zeit für die Linie, die du jetzt empfiehlst; road.revision.failures=0, help=0, kein übernehmbares Beispiel. Der Süd-Zeitwert ist richtig; das Spiel verlangt hier jedoch einen Beleg zur empfohlenen Nordlinie. Das ist keine leere Auswahl und kein bloß offener Zielkonflikt. Die zugesagte automatische Erklärung nach spätestens zwei erfolglosen bewertbaren Versuchen bleibt aus. Die freiwillige Hilfe 1–3 funktioniert als manuell zu suchender Ausweg.

Unabhängig reproduziert für alle sechs Kombinationen aus drei empfohlenen Linien und je zwei anderen Beleglinien, in Chromium und WebKit sowie im Nord/Süd-Fall zusätzlich über die native Tastatur. Ursache: evaluateRevision in src/event.ts berücksichtigt validChange für complete; der check-Zweig in src/state.ts berücksichtigt für die Hilfenschwelle nur hasIncorrectDecisionEvidence zu Vorteil/Nachteil.

Korrigiere diese Lücke möglichst klein innerhalb des vorhandenen Feedback-/Unterstützungssystems:
- Spätestens nach zwei solchen vollständig bewertbaren erfolglosen Zuordnungen eine konkrete Erklärung und den bestehenden tatsächlich bedienbaren unterstützten Weiterweg anbieten.
- Richtige Vor-/Nachteile und die tatsächlich richtige Zeitangabe ausdrücklich anerkennen. Einfach erklären, welcher Bezug zur jetzt empfohlenen Linie noch fehlt. Keine falsche Behauptung, 10 → 10 sei zahlenmäßig falsch.
- Eine legitime Empfehlung bleibt neutral, keine Punkte oder Punktabzüge. Leere/unvollständige Eingaben, offene legitime Zielkonflikte und unklare eigene Texte dürfen durch die Änderung keine Fehlbestrafung erhalten. Hilfe ist Unterstützung, keine Bewertung einer politischen Position.
- Keinen stillen Linien-, Ziel- oder Belegwechsel durchführen. Eine Beispielübernahme bleibt ausdrücklich bedienbar und im neuen Lernprodukt als Hilfe gekennzeichnet. Erste Empfehlung unverändert erhalten.
- Keine zusätzliche unabhängige globale Fehlerlogik einführen. Sorge für einen konsistenten begrenzten Unterstützungsweg im bestehenden System.

Akzeptanzfälle:
1. Alle 3 Empfehlungen × je 2 andere Vorher-/Jetzt-Beleglinien, jeweils mit sonst vollständiger korrekter Begründung: nach höchstens zwei Prüfungen konkrete Hilfe und übernehmbares Beispiel, anschließend bedienbarer Abschluss.
2. Fehlender Vorher-/Jetzt-Beleg bzw. fehlende Begründung: keine Fehlversuche als wäre eine falsche vollständige Antwort gegeben; verständlicher Hinweis und weiterhin freiwillige Hilfe.
3. Richtiger Beleg zur empfohlenen Linie, auch Süd 10 → 10: regulärer neutraler Abschluss ohne unnötige Unterstützung.
4. Zielkonflikte, bewusst andere Gewichtung, richtige Teilgedanken und sprachlich unklare unbewertet abgegebene Texte bleiben wie bisher behandelt.
5. Gleichzeitige unpassende alte Vor-/Nachteilsbelege und neuer Beleg führen zu keiner doppelten Zählung eines einzigen Prüfklicks; Grenze und Unterstützung bleiben konsistent.
6. Hilfenutzung, spätere Änderungen, Neuladen, Zurück, erneutes Bearbeiten, beschädigter/gesperrter Speicher und Neustart; erste Empfehlung und alter Situationsstand erhalten.
7. Weiterhin alle 18 Zeiten und unveränderte Busabschnitte, beide Wege Beibehalten/Ändern, Desktop und simuliertes iPad hoch/quer, Touch/Tastatur, Chromium/WebKit und lokale Pages-Pfade. Unabhängige WebKit-Durchläufe auf dem geprüften alten Stand bestanden; die Cloud-Download-Sperre ist davon getrennt zu behandeln.

Kleiner verbleibender P3-Testpunkt: Auf dem prüfenden Mac bestehen 73/75 gelieferte Chromium-Fälle. Zwei nativeFirstOption-Fälle scheitern vor der Fachbewertung an tatsächlich leeren Auswahlwerten (cause bzw. event-connection). Die tatsächliche native Tastaturbedienung bis zum neuen Abschluss besteht. Die neu eingeführte Wertprüfung ist richtig und muss erhalten bleiben. Plattformgerechte Teststeuerung bei Bedarf korrigieren oder ehrlich als ungeprüft/instabil kennzeichnen. selectOption darf nicht als Tastaturnachweis ausgegeben werden. Die Gruppenrolle und einfache Schülerformulierung sind bereits korrigiert; erhalten.

Liefere nach dieser begrenzten Korrektur einen überprüfbaren neuen Commit, tatsächliche Testergebnisse mit klaren Umgebungsgrenzen und ein vollständiges Prüfpaket. Keine Unterrichtswirkung oder eigenständige Urteilskompetenz aus erfolgreichen Klicks behaupten. Danach stoppen; keine weitere Phase und keine Veröffentlichung ohne neue Freigabe.
