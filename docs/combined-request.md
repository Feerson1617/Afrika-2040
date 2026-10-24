# AFRIKA 2040 – KOMBINIERTES ENTWICKLUNGSPAKET
## Phase 2B korrigieren + zweite Kenia-Episode entwickeln

### 1. Projekt und Ausgangsstand

Repository: `Feerson1617/Afrika-2040`

Ausgangsbranch: `feat/phase2b-kenia-strassenereignis`

Zu prüfender Ausgangscommit:
`8eb0d8bcdaf45da27ca0a9cdab5de09a10238562`

Verifiziere vor Beginn den tatsächlichen Repository-Stand.

Erstelle einen neuen Entwicklungsbranch:

`feat/kenia-phase2b-fix-und-episode2`

Arbeite in zwei klar getrennten Teilabschnitten:

**Abschnitt A:** Die noch offene Feedbackkorrektur der Phase 2B vollständig abschließen.

**Abschnitt B:** Eine zweite spielbare Kenia-Episode zum Thema Bevölkerungsentwicklung und Verkehrsinfrastruktur entwickeln.

Zwischen beiden Abschnitten liegt ein verbindlicher interner Qualitäts-Gate.

Erstelle nach Abschnitt A einen separaten Commit. Erst nach erfolgreichen gezielten Tests darf Abschnitt B begonnen werden.

Nach Abschnitt B ebenfalls einen eigenen Commit erstellen.

Keine eigenständige Veröffentlichung, kein Merge, kein Push und keine weiteren Episoden ohne gesonderte Freigabe.

## 2. Dauerhafte pädagogisch-didaktische Vorgaben

Dieses Projekt ist ein digitales Lernspiel für eine stark leistungsheterogene 7. Klasse.

Einige Lernende benötigen umfangreiche Unterstützung beim Lesen, Verstehen, Strukturieren und Begründen.

**Die pädagogische und didaktische Qualität hat bei der Gestaltung Vorrang vor zusätzlichem Funktionsumfang und grafischem Aufwand. Fachliche Korrektheit ist in jedem Fall unverzichtbar.**

Verbindliche Prinzipien:

- Sehr einfache, fachlich korrekte Sprache.
- Ein zentraler Arbeitsauftrag pro Lernschritt.
- Möglichst wenig Text und visuelle Überlastung.
- Gemeinsame Problemstellungen für alle Leistungsniveaus.
- Freiwillige und verständliche Hilfestellungen.
- Förderung von Fachsprache statt vollständiger Vermeidung.
- Fehlerfreundliches Lernen ohne negative Punkte.
- Anerkennung richtiger Teilantworten.
- Tatsächlich bedienbare Weiterwege nach wiederholten Fehlern.
- Kognitive Aktivierung durch Zusammenhänge, Vergleiche und Entscheidungen.
- Keine Bewertung legitimer unterschiedlicher Positionen als grundsätzlich richtig oder falsch.
- Keine automatische Schlüsselwortbewertung freier Texte.
- Kein behaupteter Lernzuwachs allein aufgrund erfolgreicher Klicks.
- Keine stereotypen oder pauschalisierenden Aussagen über afrikanische Staaten oder den Kontinent.

Nutze die vorhandenen Projektregeln in `AGENTS.md`.

Berücksichtige Fachanforderungen, Leitfaden und schulinternes Curriculum Geographie. Beziehe curriculare Aussagen nur auf tatsächlich verfügbare Quellen.

---

# ABSCHNITT A – PHASE 2B ABSCHLIESSEN

## A1. Fehler der adaptiven Unterstützung beheben

Ausgangsbefund:

Bei einer erneuten Empfehlung wird ein vollständig ausgefüllter, aber zur empfohlenen Linie unpassender Vorher-Jetzt-Beleg zurückgewiesen.

Der Fehlerzähler steigt jedoch nicht. Dadurch erscheint auch bei wiederholten Fehlern keine automatische Erklärung.

Beispiel:

- Empfohlene Linie: Über Nord.
- Neuer Beleg: Leila über Süd, 10 → 10 Minuten.
- Tatsächliche relevante Veränderung über Nord: 28 → 34 Minuten.

Das Spiel muss unterscheiden zwischen einer **zahlenmäßig richtigen Angabe** und einem **für die Entscheidung passenden Beleg**.

### Verbindliche Korrektur

Nach spätestens zwei vollständig bewertbaren, erfolglosen Zuordnungen muss eine konkrete Erklärung erscheinen.

Anschließend muss das vorhandene Hilfebeispiel bewusst übernommen werden können.

Der Lernende darf auch die Auswahl eigenständig korrigieren.

Richtige Teilgedanken bleiben ausdrücklich anerkannt.

Ein legitimer Zielkonflikt wird neutral behandelt. Unvollständige Antworten und unklare eigene Texte zählen nicht als vollständig falsche Antworten.

Ein Prüfklick darf maximal einen Fehlversuch auslösen.

Vermeide eine zusätzliche, von den bisherigen Zuständen unabhängige Fehlerverwaltung.

## A2. Feedback verständlich gestalten

Vermeide widersprüchlich wirkende Gesamtmeldungen.

Unterscheide sprachlich:

- Was bereits richtig ist.
- Was noch nicht zur Entscheidung passt.
- Was als Nächstes zu tun ist.

Beispiel für die erste Fehlzuordnung:

„Deine bisherigen Belege passen. Die neue Zeitangabe gehört aber zu Über Süd. Du empfiehlst Über Nord. Prüfe Leilas Zeit für Über Nord.“

Nach dem zweiten Fehler:

„Über Nord braucht Leila vorher 28 Minuten und jetzt 34 Minuten. Das sind sechs Minuten mehr. Du kannst dieses Beispiel übernehmen.“

Die Erläuterung darf nicht behaupten, eine zutreffende Zeitangabe sei mathematisch falsch.

Das automatische Anzeigen einer Erklärung gilt noch nicht als bewusst übernommene Lösung.

Eine Beispielübernahme muss ausdrücklich bestätigt und im Lernprodukt als Unterstützung gekennzeichnet werden.

## A3. Regressionstests und Gate A

Prüfe mindestens:

- Alle drei empfohlenen Linien kombiniert mit den jeweils zwei nicht passenden Vorher-Jetzt-Beleglinien.
- Automatische Erklärung spätestens nach zwei bewertbaren Fehlversuchen.
- Keine doppelte Fehlerzählung.
- Keine Fehlerzählung für leere oder unvollständige Antworten.
- Richtige Teilantworten.
- Passende Belege mit regulärem Abschluss.
- Neutrale Behandlung legitimer Gewichtungen.
- Eigene und unterstützte Begründungen.
- Neuladen, Rücksprung, Änderung und Neustart.
- Korrekte Speicherung der ersten und erneuten Empfehlung.
- Alle bisherigen Modellzeiten.

Erhalte die bestehenden technischen Prüfungen einschließlich Desktop, iPad-Simulation, Chromium, WebKit und Tastatur.

Den offenen macOS-Testtreiberfall bei nativen Auswahlfeldern bei Gelegenheit gezielt korrigieren. Eine programmatische Wertzuweisung darf nicht als Nachweis echter Tastaturbedienung gelten.

**Gate A:** Erst wenn der Ausgangsfehler behoben, die gezielten Regressionstests bestanden und die bisherige Episode weiterhin vollständig spielbar ist, darf Abschnitt B begonnen werden.

Dokumentiere die Ergebnisse und erstelle einen separaten Commit.

---

# ABSCHNITT B – ZWEITE KENIA-EPISODE

## B1. Thema und Leitfrage

Entwickle eine zweite, eigenständige Episode im bestehenden fiktiven Viertel im Kontext Nairobis.

Arbeitstitel:

**„Mehr Menschen – reicht der Bus noch?“**

Zentrale Leitfrage:

**„Was muss sich verändern, wenn mehr Menschen den Bus nutzen wollen?“**

Die Episode soll Bevölkerungsentwicklung, Zuzug, Infrastruktur und unterschiedliche Handlungsoptionen miteinander verbinden.

Die Lernenden sollen verstehen:

1. Durch Zuzug kann die Zahl der Menschen in einem Wohngebiet steigen.
2. Damit kann auch die Nachfrage nach Verkehrsmöglichkeiten zunehmen.
3. Eine bislang ausreichende Verbindung kann dann an ihre Grenzen gelangen.
4. Unterschiedliche Verbesserungen lösen unterschiedliche Probleme.
5. Eine begründete Entscheidung muss ihre Vorteile und verbleibenden Nachteile berücksichtigen.

Behandle Zuzug als konkrete Veränderung in diesem erfundenen Wohngebiet. Setze Zuzug nicht mit dem gesamten Bevölkerungswachstum Kenias gleich.

Vermeide die pauschale Darstellung, Bevölkerungswachstum sei grundsätzlich negativ. Zuzug kann auch neue wirtschaftliche und gesellschaftliche Möglichkeiten eröffnen.

Diese Episode soll sich deutlich von der ersten unterscheiden: Nicht erneut primär individuelle Buslinien vergleichen, sondern Veränderungen der Nachfrage und verschiedene Infrastrukturmaßnahmen untersuchen.

## B2. Anschluss und eigenständige Spielbarkeit

Die Episode muss an das vorhandene Spiel anschließen können.

Wenn eine frühere Empfehlung gespeichert wurde, darf sie als Ausgangsroute verwendet werden.

Wenn die Episode direkt gestartet wird, sollen die Lernenden eine Ausgangsroute auswählen können. Eine nicht selbst getroffene Entscheidung darf ihnen nicht nachträglich zugeschrieben werden.

**Wichtig für den Unterricht:** Die zweite Episode muss ohne erneutes Durchspielen der gesamten ersten Episode erreichbar sein. Wir möchten die Episoden an unterschiedlichen Unterrichtstagen einsetzen können.

Schaffe hierfür eine möglichst einfache Episodenauswahl, ohne das Spiel mit Menüs oder Einstellungen zu überfrachten.

Die vorherige Baustelle ist für diese neue Aufgabe beendet. Kennzeichne diesen Übergang kurz, statt die geänderten Fußwegzeiten unbemerkt zurückzusetzen.

Erhalte frühere Lernprodukte und die Möglichkeit, die erste Episode weiterhin vollständig zu spielen.

## B3. Ausgangssituation und vereinfachte Modellwerte

Im erfundenen Viertel sind neue Wohnungen bezogen worden.

Vorher wollten 16 Personen innerhalb einer bestimmten Stunde am Platz mit dem Bus ins Zentrum fahren.

Jetzt möchten acht weitere Personen mitfahren.

Insgesamt sind es damit 24 Personen.

Das Verkehrsangebot besteht aus:

- Zwei Busfahrten pro Stunde.
- Höchstens zehn Fahrgästen je Fahrt.
- Insgesamt 20 verfügbaren Beförderungsplätzen pro Stunde.

Für dieses Modell gilt: Jede Person möchte einmal fahren. Andere Fahrgäste und Haltestellen werden in der vereinfachten Kapazitätsrechnung nicht berücksichtigt.

Damit können bei unverändertem Angebot in dieser Stunde höchstens 20 der 24 Personen mitfahren. Vier Personen müssen auf eine spätere Fahrt warten.

Diese Zahlen sind ausdrücklich **erfundene Modellwerte** und keine tatsächlichen Verkehrsstatistiken Nairobis.

Die acht zusätzlichen Personen kommen im Modell aus einem neuen Wohnbereich. Ihr bisheriger Fußweg zur Haltestelle Platz dauert zwölf Minuten.

Eine mögliche neue Verbindung könnte diesen Fußweg auf vier Minuten verkürzen.

Vermeide, aus diesen Angaben unbelegte Aussagen über Einkommen, Lebensqualität, Sicherheit oder die gesamte Stadtentwicklung abzuleiten.

## B4. Spielerisches Grundprinzip

Entwickle eine kurze, tatsächlich interaktive Entscheidungssituation.

Die Lernenden sollen:

1. Die Veränderung der Nachfrage erkennen.
2. Die vorhandenen Plätze mit den Fahrgästen vergleichen.
3. Zwei unterschiedliche Verbesserungsvorschläge untersuchen.
4. Deren Folgen sichtbar ausprobieren.
5. Eine begründete Empfehlung abgeben.

Eine bloße Quizabfolge reicht nicht.

Zeige die Veränderung der Personen und der verfügbaren Busplätze beispielsweise durch einfache, übersichtliche Symbole direkt in der Spielsituation.

Die Karte soll räumliche Zusammenhänge erklären, nicht nur als Dekoration dienen.

Vermeide komplizierte wirtschaftliche Simulationssysteme oder zusätzliche Verwaltungsmenüs.

## B5. Zwei Handlungsoptionen

Die örtlichen Verantwortlichen verfügen im Modell über Mittel für genau **eine** der folgenden Maßnahmen.

### Möglichkeit A: Eine zusätzliche Busfahrt

Es fahren nun drei statt zwei Busse pro Stunde.

Jeder kann weiterhin zehn Personen befördern.

Dadurch entstehen 30 Plätze pro Stunde.

Bei einer Nachfrage von 24 Personen reichen die Plätze im betrachteten Zeitraum aus.

Der Fußweg vom neuen Wohnbereich zur Haltestelle bleibt zwölf Minuten lang.

Die Maßnahme verbessert die Kapazität, nicht die Entfernung zur Haltestelle.

### Möglichkeit B: Einen kürzeren Fußweg bauen

Der neue Wohnbereich erhält eine kürzere Verbindung zur Haltestelle am Platz.

Der Fußweg verkürzt sich von zwölf auf vier Minuten.

Es bleiben jedoch zwei Busfahrten mit insgesamt 20 Beförderungsplätzen pro Stunde.

Bei 24 Personen reicht die Kapazität weiterhin nicht für alle in dieser Stunde.

Die Maßnahme verbessert die räumliche Erreichbarkeit, nicht die Beförderungskapazität.

### Didaktische Anforderung

Die beiden Möglichkeiten müssen tatsächlich unterschiedliche Vorteile und Grenzen besitzen.

Die Lernenden dürfen nicht durch eine offensichtlich moralisch erwünschte Antwort gelenkt werden.

Beide Vorschläge können unter unterschiedlichen Zielsetzungen begründet werden.

Der Vorschlag für mehr Busfahrten löst im Modell den Kapazitätsengpass, verkürzt aber nicht automatisch den Fußweg.

Der kürzere Fußweg verbessert die Erreichbarkeit für den neuen Wohnbereich, löst aber nicht den Kapazitätsengpass.

Es darf keine automatische Berechnung kürzerer Wartezeiten erfolgen, wenn dazu keine weiteren Fahrplanannahmen getroffen wurden.

## B6. Lernfolge und Rückmeldungen

Entwickle eine kurze Folge mit möglichst wenigen Bildschirmen.

### Lernschritt 1: Die Veränderung erkennen

Möglicher Schülertext:

„Im Viertel wohnen jetzt mehr Menschen. Acht weitere Personen möchten mit dem Bus fahren.“

Arbeitsauftrag:

„Prüfe: Reichen die Plätze im Bus für alle?“

Die Lernenden sollen 24 Fahrgäste mit 20 verfügbaren Plätzen vergleichen.

Richtiges Feedback:

„24 Menschen möchten fahren. Es gibt 20 Plätze. Vier Menschen müssen später fahren.“

Bei einem Fehler wird auf beide Zahlen verwiesen, ohne direkt die gesamte Lösung zu verraten.

### Lernschritt 2: Möglichkeiten ausprobieren

Die beiden Maßnahmen werden sichtbar und interaktiv getestet.

Die Schülerinnen und Schüler sollen selbst feststellen, welche Größe sich verändert:

- Zahl der verfügbaren Plätze
- Fußweg zur Haltestelle

Eine Maßnahme darf nicht automatisch als Lösung sämtlicher Probleme dargestellt werden.

Rückmeldungen sollen richtig erkannte Teilwirkungen ausdrücklich anerkennen.

### Lernschritt 3: Begründet entscheiden

Arbeitsauftrag:

„Welchen Vorschlag empfiehlst du? Nenne einen Vorteil und einen Nachteil.“

Mögliche Antwortbausteine:

„Ich empfehle eine zusätzliche Busfahrt, weil dann für alle 24 Personen Plätze vorhanden sind. Der lange Fußweg bleibt aber.“

Oder:

„Ich empfehle den kürzeren Fußweg. Die acht Personen aus dem neuen Wohnbereich erreichen die Haltestelle schneller. Es gibt aber weiterhin nicht genug Busplätze.“

Beide Vorschläge dürfen nachvollziehbar begründet werden.

Eine Antwort ist nicht bereits deshalb fachlich falsch, weil eine andere Maßnahme mehr Fahrgäste befördern würde.

Das Spiel soll Ziel, Beleg und Nachteil miteinander verbinden und nicht nur isolierte Einzelantworten prüfen.

## B7. Sprachliche und didaktische Unterstützung

Übernimm das bestehende Feedbacksystem.

Für die neue Episode gelten insbesondere:

**Fachlich richtig:** Grün, mit kurzer Erklärung.

**Fachlich falsch:** Rot, mit konkret benanntem Denkfehler und nächstem Prüfschritt.

**Teilweise richtig:** Gelb, mit ausdrücklicher Anerkennung richtiger Bestandteile.

**Unvollständig:** Hinweis ohne Fehlversuch.

**Legitime begründete Entscheidung:** Neutrale Rückmeldung.

**Wiederholter bewertbarer Fehler:** Spätestens nach zwei Versuchen konkrete Erklärung und unterstützter Weiterweg.

**Freitext:** Keine unsichere automatische Bewertung.

Berücksichtige Schülerinnen und Schüler, die nur sehr kurze Texte lesen können.

Nutze Fachbegriffe gezielt:

- Zuzug
- Nachfrage
- Infrastruktur
- Erreichbarkeit

Die Begriffe müssen in den jeweiligen Aufgaben verständlich erklärt werden.

Begrenze die gleichzeitig sichtbaren neuen Begriffe.

Die Lernenden sollen keine längeren Texte verfassen müssen, um den regulären Spielverlauf abschließen zu können.

Leistungsstärkere Lernende erhalten eine sinnvolle Vertiefungsmöglichkeit, beispielsweise:

„Welches Problem bleibt bei deiner Entscheidung bestehen?“

Oder:

„Welche zusätzliche Information wäre für eine echte Verkehrsplanung wichtig?“

## B8. Fachliche und curriculare Qualität

Die Episode soll insbesondere räumliche Lagebeziehungen, Infrastrukturnutzung, Bevölkerungsveränderungen und kriterienorientiertes Beurteilen miteinander verbinden.

Ordne die Lernhandlungen passenden Kompetenzen aus den Fachanforderungen Geographie Schleswig-Holstein zu.

Unterscheide dabei zwischen verbindlichen Standards des Afrikaschwerpunkts und ergänzend angebahnten Kompetenzen.

Verwende die tatsächlichen Dokumente, soweit sie zugänglich sind.

Prüfe besonders, dass:

- Zuzug nicht mit Geburtenüberschuss gleichgesetzt wird.
- Eine größere Bevölkerung nicht automatisch negativ bewertet wird.
- Nachfrage nicht automatisch aus jeder Bevölkerungsveränderung folgt, sondern in der Spielsituation konkret vorgegeben ist.
- Ein zusätzlicher Bus nicht automatisch kürzere Fußwege erzeugt.
- Ein kürzerer Fußweg nicht automatisch mehr Beförderungsplätze erzeugt.
- Die fiktive Nachbarschaft nicht als repräsentativ für Nairobi oder Kenia dargestellt wird.

Die Lernenden sollen Unterschiede und Zusammenhänge verstehen, keine auswendig gelernten allgemeinen Behauptungen übernehmen.

## B9. Technische Umsetzung

Nutze die bestehende Architektur und erweitere sie möglichst wartbar.

Erhalte die Trennung von:

- Lerninhalten,
- Modellberechnung,
- Feedback,
- Zustandsverwaltung,
- Benutzeroberfläche,
- Speicherung.

Baue keine zweite unabhängig entwickelte Bewertungsmechanik.

Die neuen Zahlen und Wirkungen sollen aus einem konsistenten Modell stammen und nicht mehrfach voneinander unabhängig hinterlegt sein.

Die Episode muss auf Desktop und iPad funktionieren.

Verwende möglichst dieselben visuellen und technischen Grundprinzipien wie in der ersten Episode, damit die Lernenden bekannte Bedienhandlungen wiederverwenden können.

## B10. Interne Qualitätsprüfung – Gate B

Führe zunächst sämtliche bisherigen Regressionstests erneut aus.

Prüfe anschließend die zweite Episode unabhängig von ihrer eigenen Implementierungslogik.

Mindestens folgende Fälle sind verpflichtend:

- 16 Personen vorher, 24 Personen jetzt.
- Zwei Fahrten mit je zehn Plätzen ergeben 20 Plätze.
- Bei 24 Personen fehlen vier Plätze im betrachteten Zeitraum.
- Drei Fahrten mit je zehn Plätzen ergeben 30 Plätze.
- Die kürzere Fußwegverbindung reduziert zwölf auf vier Minuten.
- Die reine Fußwegmaßnahme verändert nicht die Zahl der Busplätze.
- Die zusätzliche Busfahrt verändert nicht den Fußweg.
- Beide Maßnahmen besitzen einen nachvollziehbaren Vorteil und eine Grenze.
- Fachlich falsche Ursache-Wirkungs-Zuordnungen werden erkannt.
- Richtige Teilantworten werden anerkannt.
- Unvollständige Antworten verbrauchen keine Fehlversuche.
- Nach zwei bewertbaren Fehlern erfolgt eine bedienbare Hilfe.
- Die Unterstützung wird korrekt gekennzeichnet.
- Beide Entscheidungen können begründet abgeschlossen werden.
- Die Episode kann ohne erneutes vollständiges Spielen der ersten Episode gestartet werden.
- Frühere Lernprodukte bleiben erhalten.
- Speichern, Neuladen, Neustart und Rücksprung funktionieren.
- Desktop, iPad hoch/quer, Touch und Tastatur werden geprüft.
- Chromium und WebKit werden getestet, soweit die tatsächliche Umgebung dies zulässt.
- Keine fehlgeschlagenen Ressourcen, relevanten Konsolenfehler oder unerlaubten externen Anfragen.

Führe vollständige Spieldurchläufe durch, nicht lediglich isolierte Komponenten- und Rechentests.

Dokumentiere ausdrücklich, welche Tests tatsächlich gelaufen sind.

### Pädagogisch-didaktische Abnahmefragen

Beantworte im Bericht:

1. Müssen die Lernenden den Zusammenhang zwischen Zuzug, Nachfrage und Verkehrsangebot tatsächlich verstehen?
2. Wird der Unterschied zwischen Kapazität und Erreichbarkeit nachvollziehbar?
3. Können Lernende mit hohem Unterstützungsbedarf die Aufgaben mit Hilfen abschließen?
4. Entsteht eine fachlich sinnvolle Entscheidung oder nur eine formal richtige Bausteinkombination?
5. Sind die Texte für die heterogene 7. Klasse plausibel verständlich?
6. Bleiben beide Maßnahmen begründbar?
7. Werden die Grenzen des vereinfachten Modells transparent?

Eine bestandene Browserprüfung ist kein empirischer Nachweis von Lernwirksamkeit.

---

# ABSCHNITT C – ABSCHLUSS UND ÜBERGABE

Erstelle eine vollständige, überprüfbare Übergabe mit:

1. Commit nach Abschnitt A.
2. Commit nach Abschnitt B.
3. Übersicht der tatsächlich umgesetzten Funktionen.
4. Ergebnisse sämtlicher Logiktests.
5. Ergebnisse der Browsertests.
6. Dokumentation der didaktischen Entscheidungen.
7. Übersicht der fachlichen Modellannahmen.
8. Konkrete noch offene Probleme.
9. Bildschirmaufnahmen der zentralen Lernansichten.
10. Vollständiges ZIP-Prüfpaket für die unabhängige Prüfung.

Kennzeichne technische Funktionen, selbst getestete Lernhandlungen und didaktische Annahmen ausdrücklich getrennt.

Behaupte keine tatsächliche Lernwirksamkeit oder vollständige Barrierefreiheit ohne entsprechende Prüfung.

Verändere keine Dateien der bisherigen schulischen Referenzdokumente.

Erstelle noch keine Arbeitsblätter, Lehrkräftehandreichungen oder sonstigen Unterrichtsbegleitmaterialien.

**Beende den Auftrag nach der zweiten Kenia-Episode. Keine Ghana- oder Marokko-Entwicklung innerhalb dieses Pakets.**

Die unabhängige Abnahme erfolgt anschließend durch ChatGPT beziehungsweise Work.