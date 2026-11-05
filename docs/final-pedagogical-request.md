# AFRIKA 2040 – LETZTE FACHDIDAKTISCHE KORREKTUR VOR DEM RELEASE

## 1. Projekt und Ausgangsstand

Repository: `Feerson1617/Afrika-2040`

Ausgangsbranch: `feat/release-candidate-1`

Verbindlicher Referenzcommit:

`bd1e0db099a4de5aad59215da392926ad6119910`

Prüfe vor Beginn den tatsächlichen Repository-Stand. Erhalte sämtliche bereits vorgenommenen Änderungen.

Erstelle für die Korrektur einen separaten Branch:

`fix/final-pedagogical-corrections`

**Ziel ist der Abschluss der fachdidaktischen Entwicklung vor der Veröffentlichung.**

Das Spiel umfasst sechs vollständig entwickelte Episoden und wurde bereits mehrfach technisch und fachlich unabhängig geprüft.

Eine zusätzliche fachdidaktische Untersuchung durch Work sowie eine kritische Zweitbegutachtung haben zwei relevante Unterstützungsmängel und eine kleine fachsprachliche Unschärfe bestätigt.

Korrigiere ausschließlich diese Punkte.

Keine neuen Episoden, keine grundlegende Neugestaltung, keine neuen Bewertungsmechanismen.

## 2. Verbindliche Grundsätze

Zielgruppe ist eine stark leistungsheterogene 7. Klasse einer Gemeinschaftsschule in Schleswig-Holstein.

Einige Lernende verfügen über sehr geringe Lesekompetenz und benötigen umfangreiche Unterstützung.

Daher gelten weiterhin:

- Pädagogische und didaktische Qualität stehen vor grafischem Aufwand.
- Fachliche Korrektheit ist unverzichtbar.
- Einfache, präzise Sprache verwenden.
- Fachbegriffe erklären, nicht ersatzlos streichen.
- Freiwillige gestufte Unterstützung erhalten.
- Richtige Teilantworten anerkennen.
- Fachlich falsche Antworten rot, teilweise richtige gelb und richtige grün kennzeichnen.
- Legitime offene Entscheidungen neutral behandeln.
- Keine Strafpunkte für Fehler oder Hilfen.
- Nach spätestens zwei bewertbaren Fehlversuchen eine konkrete Erklärung anbieten.
- Unterstützte Abschlüsse ermöglichen, ohne sie als selbstständige Leistung auszugeben.
- Freitexte nicht automatisch anhand von Schlüsselwörtern benoten.
- Alle sechs Episoden weiterhin unabhängig startbar halten.

Die Schul-iPads werden ausschließlich im Querformat verwendet. Vorrangige Testgröße: 1024 × 768 CSS-Pixel.

## 3. P2-01 – Widersprüchlichen Hilfeabschluss in Kenia beheben

### Ausgangsproblem

In den ersten drei Aufgaben der ersten Kenia-Episode kann Hilfe 3 einen unterstützten Abschluss freischalten, obwohl noch eine falsche oder unvollständige Antwort ausgewählt ist.

Beispiel:

1. Aminas direkten Weg richtig bearbeiten.
2. Bei „Für wen wird der Weg über Nord kürzer?“ David auswählen.
3. „Weg prüfen“ drücken.
4. Alle drei Hilfen öffnen.

Die richtige Erklärung nennt Amina. Gleichzeitig bleibt David ausgewählt, die rote Fehlermeldung sichtbar und „Weiter“ verfügbar.

### Verbindliche Korrektur

Nach Hilfe 3 muss ein eindeutiger aktueller Lernstatus erscheinen.

Geeignete Formulierung:

**„Mit Erklärung bearbeitet“**

Die richtige Erklärung muss erkennbar sein.

Die vorherige falsche Auswahl darf nicht als scheinbar gültige aktuelle Lösung angezeigt werden.

Eine frühere falsche Idee darf dokumentiert bleiben, muss dann aber klar als frühere Idee gekennzeichnet sein.

Eine alte rote Fehlermeldung darf nicht als aktuelle Aufforderung zum erneuten Bearbeiten stehen bleiben, während die Eingabe gesperrt und das Weitergehen freigegeben ist.

Nutze die bestehenden gelben Hinweis- und Unterstützungsmuster.

**Wichtig: Keine falsche Eigenleistungskennzeichnung.**

Wenn das Spiel durch eine Erklärung den Abschluss ermöglicht, darf es nicht behaupten, die lernende Person habe die richtige Antwort selbst ausgewählt.

### Zusätzliche Schutzanforderung

Unterscheide zwei Fälle:

**Fall A: Zuvor falsche oder unvollständige Antwort**

Hilfe 3 ermöglicht einen ausdrücklich unterstützten Abschluss.

**Fall B: Zuvor bereits selbstständig richtig bestätigte Antwort**

Wenn die lernende Person danach lediglich die Erklärung öffnet, darf die frühere korrekte Leistung nicht rückwirkend als ausschließlich mit Beispiel gelöst dargestellt werden.

Die Hilfenutzung darf dokumentiert werden. Sie muss jedoch von der Herkunft der tatsächlich bestätigten Antwort unterscheidbar bleiben.

Prüfe außerdem alte gespeicherte Spielzustände mit widersprüchlicher Hilfe-/Antwortdarstellung. Sie müssen verständlich geöffnet werden, ohne historische Leistungen nachträglich umzudeuten.

Keine neue Pflichtbestätigung und keine zusätzlichen Schreibaufgaben.

### Regressionstests

Für jede der ersten drei Aufgaben:

- Keine Antwort und Hilfe 3.
- Falsche Antwort und Hilfe 3.
- Richtige Antwort und anschließend Hilfe 3.
- Hilfe 1, 2 und 3.
- Neuladen.
- Rücksprung.
- Aufgabe neu bearbeiten.
- Weitergehen.
- Unterstützungskennzeichnung.
- Freiwilliger Transfer.
- Wiederherstellung eines älteren Spielstands.

Prüfe die tatsächlich sichtbaren Rückmeldungen, nicht nur interne Abschlussflags.

## 4. P2-02 – Wörterhilfe im Entscheidungsschritt verbessern

### Ausgangsproblem

In den Episoden 3 bis 6 werden die Begriffe „Vorschlag“, „Beleg“, „Grenze“ und „Gewichten“ benötigt.

Die dort abrufbare Wörterhilfe erklärt überwiegend Begriffe aus dem vorherigen Lernschritt.

Außerdem wird in Episode 3 „Genossenschaft“ bereits im Einstieg verwendet, obwohl die Erklärung erst in Episode 4 vorhanden ist.

### Verbindliche Korrektur

Ergänze passende Worterklärungen in den bereits vorhandenen Wörterhilfebereichen.

Nutze beispielsweise:

**Vorschlag:** „Deine Idee, was getan werden soll.“

**Beleg:** „Eine passende Angabe, die deinen Gedanken stützt.“

**Grenze:** „Was dein Vorschlag nicht löst oder welcher Nachteil bleibt.“

**Gewichten:** „Du entscheidest, welche Folge dir wichtiger ist und welchen Nachteil du dafür in Kauf nimmst.“

**Genossenschaft:** „Ein Betrieb, der seinen Mitgliedern gemeinsam gehört.“

Die Erklärung von Genossenschaft muss bereits beim direkten Einstieg in Episode 3 erreichbar sein.

Bei „Grenze“ muss klar werden, dass die Grenze einer Maßnahme beziehungsweise Entscheidung gemeint ist, nicht eine Landesgrenze.

### Anforderungen an die Darstellung

- Nutze den vorhandenen aufklappbaren Wörterbereich.
- Keine zusätzliche Hilfeseite entwickeln.
- Keine große dauerhaft sichtbare Textwand erzeugen.
- Höchstens wenige kurze Erklärungen gleichzeitig zeigen.
- Fachlich wichtige bestehende Begriffe wie Überschuss, Entnahme und Verbrauch nicht durch ungenaue Vereinfachungen ersetzen.
- Die Begriffe dort erklären, wo sie benötigt werden.
- Die Wörterhilfe darf keine Fehlversuche auslösen.
- Das Lesen einer Worterklärung darf nicht als Übernahme eines Lösungsbeispiels gelten.
- Dynamische Beispiele müssen stets zur aktuell gewählten Maßnahme und ihren Zahlen passen.

Prüfe bei allen vier Episoden, dass der dritte Lernschritt wirklich seine eigenen geeigneten Begriffe anzeigt und nicht lediglich die Wortliste des vorherigen Schritts wiederholt.

## 5. Kleine fachsprachliche Präzisierung – Episode 3

Die Leitfrage der Kakao-Episode verwendet bisher den Begriff „Gewinn“.

Das Spiel berechnet jedoch bewusst nur den laufenden Überschuss aus Einnahmen und laufenden Ausgaben.

Ändere die Leitfrage deshalb zu:

**„Warum bleibt bei mehr Verarbeitung hier nicht automatisch mehr Überschuss übrig?“**

Erhalte die vorhandene Erklärung des Überschusses.

Keine Veränderung des wirtschaftlichen Modells, der Investitionsbeträge oder der Berechnung.

## 6. Bestehende Spielqualität schützen

Folgende Inhalte müssen unverändert korrekt bleiben:

### Kenia

- Amina: direkt 22 Minuten, Nord 10 Minuten.
- David: direkt 12 Minuten, Nord 18 Minuten.
- Leila: vorher direkt/Nord/Süd 22/28/10 Minuten.
- Nach Straßenereignis 28/34/10 Minuten.
- Tatsächliche Einstiegsstellen und genutzte Busabschnitte.
- Nachfrage 16 → 24 Personen.
- Buskapazitäten 20 beziehungsweise 30 Plätze.
- Fußwege 12 beziehungsweise 4 Minuten.

### Ghana

- Ausgangslage 180 − 100 = 80 GE.
- Qualität 200 − 110 = 90 GE.
- Verarbeitung 260 − 185 = 75 GE.
- Einmaliger Investitionstopf getrennt von laufenden Kosten.
- 120 GE frei verfügbare Mittel in Episode 4.
- Alle legitimen vollständigen Verteilungen.
- Keine moralisch vorgeschriebene einzige richtige Entscheidung.

### Marokko

- Tankstart 80 WE.
- Entnahme 60/50/45 WE.
- Tankreste 20/30/35 WE.
- 40 WE gelangen zum gleichen Feld.
- Erstes Feld 60 → 45 WE.
- Zusatzfeld weitere 20 WE.
- Gesamtentnahme 65 WE.
- Entnahme nicht mit Verbrauch verwechseln.
- Tankrest nicht als Grundwasserbestand darstellen.

### Übergreifend

Erhalte:

- die korrekten Rückmeldungsfarben,
- die drei Hilfestufen,
- die bewusste Beispielübernahme,
- die neutralen Zielkonflikte,
- die gespeicherten Lernprodukte,
- die vollständige Ghana-Verteilung,
- die geographisch korrekte Afrikakarte,
- die unterschiedlichen Antwortpositionen im Rückblick,
- die Speicherwarnung,
- die korrigierte Kenia-Navigation,
- die direkten Episodeneinstiege.

Keine neue SCORM-Anbindung und keine Veränderung der Speicherarchitektur.

## 7. Technische und didaktische Qualitätsprüfung

Führe alle bestehenden Logiktests und den Produktionsbuild aus.

Ergänze gezielte Tests für die beiden Korrekturen.

Prüfe die tatsächlich laufende Anwendung in Chromium und WebKit, soweit die Umgebung dies erlaubt.

Mindestens:

- Desktop.
- iPad-Querformat 1024 × 768.
- Touch.
- Tastatur.
- Falsche und richtige Antworten.
- Unterstützter Abschluss.
- Bereits zuvor selbstständig korrekte Antwort mit nachträglich geöffneter Erklärung.
- Alte gespeicherte Zustände.
- Rücksprung und Neubearbeitung.
- Direktstart aller vier regionalen Episoden.
- Wörterhilfe in jedem relevanten Lernschritt.
- Fachlich passender Beleg.
- Legitime offene Entscheidungen.

Teste auch, dass die Anwendung keine zusätzlichen externen Laufzeitanfragen benötigt.

Keine bestehenden Regressionstests löschen oder abschwächen.

## 8. Abschluss und Übergabe

Liefere nach erfolgreicher Korrektur:

1. Den vollständigen neuen Commit.
2. Eine knappe Übersicht der geänderten Dateien.
3. Die behobenen Vorher-/Nachher-Zustände.
4. Die tatsächlichen Logiktestergebnisse.
5. Die tatsächlichen Browserprüfungen.
6. Repräsentative Screenshots.
7. Offene Grenzen und nicht verifizierte Eigenschaften.
8. Ein kompaktes Prüfpaket für die unabhängige Nachprüfung.

Unterscheide:

- selbst getestete Funktionen,
- durch Codeprüfung gestützte Aussagen,
- didaktische Einschätzungen,
- nicht empirisch nachgewiesenen Lernerfolg.

### Verbindlicher Entwicklungsstopp

Keine neuen Episoden, keine weiteren Spielmechaniken und keine umfangreiche grafische Neugestaltung.

Keine Arbeitsblätter oder Lehrkräftehandreichungen erstellen. Diese Begleitmaterialien werden nach der Fertigstellung des Spiels gesondert entwickelt.

**Kein Merge nach main, kein Push und keine GitHub-Pages-Veröffentlichung ohne meine gesonderte Freigabe.**

Nach dieser Korrektur stoppen. Eine unabhängige, gezielte Nachprüfung entscheidet über die abschließende Freigabe für die Bereitstellung.