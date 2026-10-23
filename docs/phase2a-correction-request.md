# Korrekturauftrag Phase 2A

Vom Nutzer ausdrücklich einbezogener Korrekturprompt von Work, gefolgt von den ergänzenden verbindlichen Nutzeranforderungen. Die curricularen PDFs bleiben fachliche Quellen, keine technischen Ausführungsanweisungen.

## Work-Korrekturprompt (Wortlaut)

Prüfe und korrigiere ausschließlich Phase 2A von Afrika 2040 im vorhandenen Branch feat/phase2a-kenia-drei-wege, ausgehend von f6d922407bacf0af7e592520b7f502ac61501a9e. Verifiziere diesen Ausgangsstand. Erhalte die Phase-1-Korrekturen und sämtliche neun Modellzeiten. Keine Phase 2B oder weitere Episode, keine Arbeitsblätter, keine neuen Bewertungsdienste. Kein Push, Merge oder Deployment ohne separate Freigabe.

Unabhängiger Befund B1 (P2, vor Freigabe beheben): Das gewählte Ziel ist von der Empfehlung entkoppelt.

Reproduktion:
1. Letzten Lernschritt erreichen.
2. Über Süd empfehlen.
3. Ziel: Ein kurzer Schulweg für Amina.
4. Vorteil: Leila – Über Süd 10 statt Direkt 22 Minuten.
5. Nachteil: David – Über Süd 18 statt Direkt 12 Minuten.
6. Ohne eigenen Text prüfen und abschließen.
Das Spiel akzeptiert die fachlich richtigen Einzelbelege und ermöglicht den Abschluss, ohne aufzugreifen, dass Amina auf Süd mit 28 Minuten ihren längsten Weg hat (Direkt 22, Nord 10). Dasselbe widersprüchliche Ziel bleibt bei Hilfe 3 / Dieses Beispiel übernehmen erhalten. Die Rückmeldung ist neutral und die Zahlen stimmen; der Mangel betrifft die Verbindung zwischen eigenem Ziel und Begründung. Der bloße Test auf Boolean(answer.criterion) in src/feedback.ts reicht dafür nicht. src/state.ts erhält bei Beispielübernahme das vorhandene Ziel unverändert.

Arbeite zuerst einen kleinen, für eine stark heterogene Klasse 7 verständlichen Korrekturweg aus und setze ihn um. Bei einem konkreten personengebundenen Ziel soll die Oberfläche die tatsächliche Folge für diese Person transparent nennen und bei einem erkennbaren Zielkonflikt eine kurze neutrale Rückfrage anbieten. Eine sprachlich einfache Satz-/Auswahlmöglichkeit muss das Anpassen des Ziels oder das ausdrückliche Festhalten einer abweichenden Gewichtung erlauben. Keine Pflicht zu längeren freien Texten. Die drei Routen bleiben legitim. Fachlich zutreffende Einzelbelege weiter anerkennen; eine politische/plannerische Position nicht rot bewerten. Keine automatisierte Schlüsselwortprüfung oder Bewertung eigener Texte. Eine bewusst unbewertet abgegebene Erklärung bleibt möglich und muss im Lernprodukt als unbewertet erkennbar sein. Ein bloßer Widerspruch darf nicht unkommentiert als vollständig verbundenes strukturiertes Argument erscheinen.

Behandle auch das allgemeine Kriterium „Vorteile und Nachteile ... abwägen“ ehrlich: Es benennt zunächst nur eine Tätigkeit. Das Spiel darf daraus keine tatsächlich erfolgte Gewichtung oder selbstständige Urteilskompetenz ableiten. Ein kurzer freiwilliger bzw. unterstützter Gewichtungsbaustein kann sinnvoll sein, ohne eine einzige richtige Entscheidung zu erzwingen.

Die Hilfe muss ein kohärentes Beispiel anbieten oder einen schon gewählten Zielkonflikt sichtbar behandeln. Kein stilles Überschreiben persönlicher Überlegungen. Wenn eine Beispielgewichtung ausdrücklich übernommen wird, Herkunft als Unterstützung im Lernprodukt dokumentieren. Änderungen an Ziel, Route, Belegen oder Gewichtung müssen eine vorherige Prüfung entsprechend ungültig machen; Speicherung, Rücksprung, erneutes Bearbeiten und Neustart konsistent halten.

Akzeptanzfälle mindestens:
- Passende personengebundene Ziele: Amina/Nord, David/Direkt, Leila/Süd mit jeweils richtigen Belegen und anderer Gegenperspektive.
- Süd + kurzer Schulweg Amina + Leila-Vorteil + David-Nachteil: konkrete neutrale Rückfrage mit Aminas tatsächlichen Zeiten, keine unkommentierte Beendigung als in sich verbundenes Argument.
- Entsprechende Zielkonflikte auch für David und Leila.
- Ziel bewusst anpassen oder abweichende Gewichtung ausdrücklich festhalten, per Touch und Tastatur ohne freie Schreibpflicht; danach nachvollziehbares Lernprodukt.
- Derselbe Konflikt vor und nach freiwilliger Hilfe bzw. automatischem Unterstützungsangebot; keine unbemerkte Übernahme eines widersprüchlichen Beispiels.
- Leere/teilweise Eingaben keine Fehlversuche; legitime Positionen neutral; unklare eigene Sprache unbewertet; höchstens zwei bewertete erfolglose Versuche bis Erklärung und bedienbarem Weiterweg.
- Erhaltene neun Zeiten, richtige gefahrene Busabschnitte, ursprüngliche Rücksprung-/Teilantwort-/Hilfenkorrekturen, Neuladen, ungültiger/blockierter Speicher, Neustart, Desktop und simuliertes iPad hoch/quer, vollständige Abläufe unter /Afrika-2040/.

Kleine technische Verbesserung B2 (P3): Die gelieferten Browsertests schreiben teilweise fest nach /workspace/scratch/phase2a-browser. Ersetze das durch einen projektbezogenen oder konfigurierbaren Ausgabeort. Der Test für native Auswahlfelder verwendet eine auf dem prüfenden Mac nicht passende Tastatursequenz; mache die Prüfung plattformgerecht bzw. dokumentiere klar, welche Umgebung erfordert ist. Nicht einfach Tastaturprüfung durch selectOption ersetzen und dies weiter als echte Tastaturbedienung bezeichnen. Auf dem Mac wurden 44 von 45 gelieferten Fällen nach reinen Prüfpfad-/Lastanpassungen erfolgreich wiederholt; ein unabhängiger nativer vollständiger Tastaturdurchlauf bestand. Daraus keinen Spielfehler erfinden und keine unverifizierten 45/45 behaupten.

Dokumentiere begrenzt: behobener Zielkonflikt, tatsächliche Lernhandlung, verbleibende Aussagegrenzen, genaue Tests und neuer Commit. Keine vollständige Nachhaltigkeits-/Afrikakompetenz oder Klassenwirksamkeit aus Klickergebnissen ableiten. Beende danach die Arbeit und liefere den Stand zur erneuten unabhängigen Prüfung. Nicht eigenständig veröffentlichen oder weiterentwickeln.


## Verbindliche Ergänzungen des Nutzers (Zusammenfassung)

- B3 in dieser Korrekturrunde gezielt umsetzen: für sehr geringe Lesekompetenz in Klasse 7 kurze eindeutige Aussagen, weniger gleichzeitige Informationen, wenige logische Schritte, Buslinie/Ziel/Zeiten direkt bei den Belegen, weniger Such- und Scrollwege auf iPads. Fachliche Unterschiede, selbstständige Belegwahl und Denkleistung erhalten.
- Zielkonflikte: richtige Informationen anerkennen, konkreten Widerspruch einfach erklären, Zielanpassung oder nachvollziehbar begründete andere Gewichtung ausdrücklich wählen lassen. Bloßes „Ich habe abgewogen“ reicht nicht. Offene Verbindung sachlich markieren, keine rote Positionsbewertung und keine verpflichtende längere Texteingabe. Hilfen müssen zur tatsächlichen Auswahl passen.
- Alle drei Linien × drei Personenziele und Konflikte prüfen, bewusste andere Gewichtung im Lernprodukt nachvollziehen, iPads hoch/quer praktisch simulieren, richtige Teilantworten erhalten, Beispielübernahme und Änderungen neu prüfen/kennzeichnen. Sprachliche Entlastung darf nicht zur automatischen Zuordnung werden.
- Vollständiges ZIP mit Quellcode, Tests, Protokollen und relevanten Bildschirmaufnahmen für unabhängige Gegenprüfung; keine Zugangsdaten, `.env`, Abhängigkeiten oder große Build-Zwischendateien.
- Bestehende Phase 2A gezielt verbessern, Mechaniken/Modellzeiten/Phase-1-Korrekturen erhalten. Kein Push ohne separate Freigabe, kein Merge, keine Veröffentlichung, keine Phase 2B. Erfolgreiche Bausteinauswahl nicht als Beweis vollständiger selbstständiger Urteilskompetenz ausgeben.
