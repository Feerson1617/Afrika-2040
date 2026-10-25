# AFRIKA 2040 – CODEX-ENTWICKLUNGSAUFTRAG
## Phase 5: Geographische Verankerung, Transfer und didaktische Fertigstellung

### 1. Projekt und Ausgangsstand

Repository: `Feerson1617/Afrika-2040`

Ausgangsbranch: `feat/ghana-marokko-episoden`

Verbindlicher Ausgangscommit:
`9b1922627722bf919791901827959c41c8b433ee`

Prüfe vor Beginn den tatsächlichen Entwicklungsstand.

Erstelle einen neuen Entwicklungsbranch:

`feat/phase5-geographie-und-didaktik`

Der bisherige Stand umfasst sechs vollständig entwickelte und unabhängig geprüfte Episoden:

1. Kenia – Buswege und unterschiedliche Interessen
2. Kenia – Bevölkerungsentwicklung und Infrastruktur
3. Ghana – Kakaoverarbeitung und wirtschaftliche Entwicklung
4. Ghana – Überschussverteilung und unterschiedliche Interessen
5. Marokko – Bewässerung und Wasserentnahme
6. Marokko – Einsparung und zusätzliche Flächennutzung

Alle bekannten fachlichen und funktionalen P1-/P2-Befunde sind im geprüften Ausgangsstand geschlossen.

**Die sechs Episoden bilden eine geschützte Grundlage. Verändere ihre Spielmodelle, Berechnungen, bewährten Feedbackregeln und Lernprodukte nur, wenn dies zwingend erforderlich ist.**

Phase 5 konzentriert sich auf die geographische und didaktische Ergänzung des bestehenden Spiels.

Aktualisiere `AGENTS.md` entsprechend diesem neuen, ausdrücklich beauftragten Umfang. Alle bisherigen Qualitäts- und Datenschutzregeln bleiben gültig.

### 2. Übergeordnete didaktische Priorität

Das Spiel wird für eine stark leistungsheterogene 7. Klasse einer Gemeinschaftsschule in Schleswig-Holstein entwickelt.

Ein Teil der Lernenden besitzt sehr geringe Lesekompetenz, begrenzten Fachwortschatz oder erheblichen sonderpädagogischen Unterstützungsbedarf.

**Pädagogik und Didaktik bestimmen die technische Gestaltung. Fachliche Richtigkeit ist unverzichtbar.**

Alle Lernenden sollen geographische Zusammenhänge erkennen und einfache begründete Urteile entwickeln können.

Behalte verbindlich bei:

- kurze, verständliche Aufgaben,
- sehr einfache, aber fachlich korrekte Sprache,
- Fachbegriffe erklären statt ersatzlos streichen,
- differenzierte freiwillige Hilfen,
- Anerkennung richtiger Teilantworten,
- richtige Antworten grün, falsche rot, teilweise richtige gelb, legitime offene Entscheidungen neutral,
- keine negative Bewertung für genutzte Hilfen,
- spätestens nach zwei vollständig bewertbaren Fehlversuchen eine Erklärung und einen bedienbaren Weiterweg,
- keine automatische Schlüsselwortbewertung freier Texte,
- keine sichtbare Einteilung nach Leistungsfähigkeit,
- keine unzulässigen Verallgemeinerungen über Afrika,
- keine Behauptung selbstständiger Kompetenz allein aufgrund korrekter Bausteine.

Verwende die bisherigen gemeinsamen Komponenten. Erfinde kein neues Feedbacksystem.

### 3. Curriculare Grundlage

Berücksichtige die drei Originaldokumente des Projekts:

- Fachanforderungen Geographie Schleswig-Holstein (2015),
- Leitfaden zu den Fachanforderungen Geographie (2016),
- Fachinternes Curriculum Geographie ETS Tönning/Friedrichstadt.

Prüfe den tatsächlichen Zugriff. Erfinde keine Seitenverweise oder Kompetenzstandards.

Die bisherigen Episoden fördern besonders:

- kriterienorientiertes Beurteilen,
- Verknüpfen geographischer Informationen,
- Erklären von Mensch-Umwelt-Beziehungen,
- Bewerten von Maßnahmen mit unterschiedlichen Auswirkungen.

Die folgende Phase soll vor allem die bislang weniger ausgeprägten Bereiche stärken:

- räumliche Orientierung,
- reale Raumbezüge,
- Arbeit mit geographisch korrekten Karten,
- Überprüfung der Aussagekraft von Informationen,
- Reflexion über die Vielfalt afrikanischer Lebens- und Wirtschaftsräume,
- Transfer gewonnener Erkenntnisse.

Wichtig: Wir wollen keine vollständige Afrika-Unterrichtseinheit simulieren. Das Spiel ergänzt den Unterricht und unser bereits vorhandenes Afrika-Mystery-Spiel.

---

# ABSCHNITT A – ECHTE RÄUMLICHE ORIENTIERUNG

## A1. Geographisch korrekte Afrikakarte

Ergänze die Startoberfläche um eine hochwertige, aber übersichtliche Afrikakarte.

Die Lernenden sollen erkennen, wo die drei untersuchten Länder liegen.

Hebe hervor:

- Kenia in Ostafrika mit Nairobi,
- Ghana in Westafrika mit Kumasi,
- Marokko in Nordafrika mit Agadir.

Nutze nachweislich korrekte Kartendaten.

Eine geeignete, kostenlose und gemeinfreie Quelle ist Natural Earth:

https://www.naturalearthdata.com/

Lizenzinformationen:

https://www.naturalearthdata.com/about/terms-of-use/

Prüfe die tatsächlichen Kartendaten und Ortspositionen vor der Integration.

Verwende keine frei erfundenen Länderumrisse oder unüberprüften Koordinaten.

Die Karte soll lokal im Spiel verfügbar sein. Keine verpflichtenden externen Kartenserver, Trackingdienste, API-Schlüssel oder kostenpflichtigen Komponenten.

Ein übersichtliches SVG ist gegenüber einer komplizierten Kartenbibliothek zu bevorzugen.

## A2. Lernwirksame Karteninteraktion

Die Karte darf keine bloße Dekoration sein.

Die Lernenden sollen die Länder und Orte durch eine sehr einfache Handlung lokalisieren können.

Möglicher Arbeitsauftrag:

„Wo liegt Ghana? Tippe auf das Land.“

Wenn die Schülerinnen und Schüler Ghana auswählen, wird das Land hervorgehoben und Kumasi markiert.

Bei Schwierigkeiten werden Hilfen angeboten, beispielsweise:

„Ghana liegt in Westafrika.“

Danach kann die richtige Region hervorgehoben werden.

Nicht jede Episode muss dieselbe Orientierungsaufgabe erneut verlangen.

Wenn eine Region bereits eingeordnet wurde, kann die Information bei der zweiten Episode desselben Landes direkt wiederverwendet werden.

Die Episoden müssen dennoch unabhängig startbar bleiben.

Eine falsche Kartenauswahl ist kein Anlass für eine lange Rateschleife. Nach höchstens zwei bewertbaren Fehlversuchen wird die Lage verständlich gezeigt.

## A3. Barrierearmut

Die Karte muss auf iPads und Desktopgeräten funktionieren.

Verbindlich:

- Bedienung mit Finger, Maus und Tastatur,
- zugängliche Ländernamen,
- deutlich erkennbare Markierungen,
- keine ausschließliche Farbcodierung,
- HTML-Alternative zur SVG-Auswahl,
- sichtbarer Tastaturfokus,
- verständliches Feedback.

Die zentrale Karte soll sich auf kleinen Bildschirmen sinnvoll anpassen, ohne unlesbar zu werden.

Erhalte die bisherige visuelle Gestaltung des Spiels.

### Qualitäts-Gate A

Prüfe:

- korrekte Lage aller drei Länder,
- korrekte Verortung der drei Städte,
- Zuordnung zu Nord-, West- und Ostafrika,
- korrekte Kartenquelle und Nutzungsrechte,
- tatsächliche Touch- und Tastaturbedienung,
- alle gestuften Rückmeldungen,
- die unabhängige Startbarkeit sämtlicher Episoden.

Erstelle nach erfolgreichem Abschluss einen eigenen Commit.

---

# ABSCHNITT B – REALE RÄUME UND ERFUNDENE MODELLE

## B1. Kurze reale Informationen

Integriere zu jeder Region sehr wenige, gezielt ausgewählte und überprüfbare geographische Informationen.

Es sollen keine umfangreichen Ländersteckbriefe entstehen.

Orientiere dich an der Leitfrage:

**„Was gibt es dort wirklich – und was wurde für unser Spiel erfunden?“**

Für jeden Raum sollen zwei kurze Informationstypen zur Verfügung stehen:

**Realer Raumbezug**

Eine belegte Information über den tatsächlichen Ort, die Region oder einen relevanten wirtschaftlichen beziehungsweise naturräumlichen Zusammenhang.

**Spielmodell**

Eine klare Erklärung, welche Personen, Gebäude, Handlungen oder Zahlen für die Simulation erfunden wurden.

Beispiel:

„In Ghana wird tatsächlich Kakao verarbeitet. Unser Betrieb bei Kumasi und seine Geldbeträge sind erfunden.“

Die Inhalte sollen höchstens wenige kurze Sätze umfassen und erst bei Bedarf ausführlicher erklärt werden.

## B2. Fachlich geeignete Quellen

Recherchiere und verifiziere die Informationen anhand zuverlässiger Quellen.

Geeignete Ausgangspunkte sind beispielsweise:

**Kenia / Nairobi – öffentliche Verkehrsplanung**

https://africa.itdp.org/planning-nairobis-bus-rapid-transit-system/

**Ghana – tatsächlich vorhandene Kakaoverarbeitung**

https://www.gepaghana.org/import/ghana-exporter/cocoa-processing-company-limited/

**Marokko – Wasserverfügbarkeit und Landwirtschaft**

https://www.fao.org/in-action/water-scarcity-initiative-nena/countries/morocco/en

Diese Quellen sind Prüfgrundlagen, keine automatisch zu übernehmenden Schülertexte.

Achte besonders auf den räumlichen Maßstab:

- Eine Information über Nairobi ist nicht automatisch eine Aussage über ganz Kenia.
- Ein dokumentierter Verarbeitungsbetrieb in Tema beweist nicht die Existenz unseres erfundenen Betriebs bei Kumasi.
- Eine Aussage zur Wasserverfügbarkeit in Marokko ist nicht automatisch eine Messung für unseren erfundenen Betrieb bei Agadir.

Dokumentiere Quelle, Aussage, räumlichen Bezug, Abrufdatum und gegebenenfalls zeitlichen Geltungsbereich.

Die Quellenangaben sollen im Spiel aufrufbar sein, ohne die eigentliche Aufgabe mit Literaturangaben zu überladen.

## B3. Vielfältige Afrikadarstellungen

Überprüfe, ob die realen Informationen zu einseitigen Vorstellungen führen könnten.

Das Spiel darf nicht den Eindruck vermitteln:

- Kenia bestehe hauptsächlich aus Verkehrsproblemen.
- Ghana bestehe ausschließlich aus Kakaoanbau.
- Marokko bestehe nur aus trockenen Landschaften und Wassermangel.

Berücksichtige die Vielfalt der Länder, ohne sämtliche Lebensbereiche oberflächlich aufzuzählen.

Ergänze bei Bedarf pro Raum eine weitere kurze, belegte Perspektive, die das jeweilige Beispiel sinnvoll ergänzt.

Auch diese zusätzliche Perspektive muss sachlich korrekt, räumlich eingeordnet und für die Altersgruppe verständlich sein.

Vermeide unbewiesene Aussagen über Wohlstand, Lebensqualität, Bildung oder die Bevölkerung.

Menschen vor Ort sollen als eigenständig handelnde Akteure erkennbar bleiben.

Das bestehende Mystery-Spiel bearbeitet Afrikabilder bereits ausführlicher. Kopiere dessen Aufgabenstruktur nicht.

### Qualitäts-Gate B

Prüfe jede reale Information unabhängig auf:

- fachliche Richtigkeit,
- passende räumliche Zuordnung,
- Quellennachweis,
- Verständlichkeit,
- Vermeidung von Stereotypen,
- Trennung von realen Daten und erfundenen Modellwerten.

Widersprechen sich Quellen oder fehlt ein tragfähiger Beleg, verzichte auf die konkrete Aussage statt zu spekulieren.

Erstelle einen eigenen Commit.

---

# ABSCHNITT C – GEOGRAPHISCHER TRANSFER

## C1. Erkenntnisse einordnen

Ergänze eine sehr kurze, lernwirksame Reflexionshandlung, mit der die Schülerinnen und Schüler zwischen einer Erkenntnis aus dem Spiel und einer Aussage über die Wirklichkeit unterscheiden.

Möglicher Auftrag:

„Was kannst du aus unserem Modell sicher sagen?“

Beispielhafte Antwortmöglichkeiten zu Ghana:

- „Im Spiel bleibt bei der Qualitätsmaßnahme mehr Überschuss.“
- „Alle Betriebe in Ghana verdienen mit dieser Maßnahme mehr Geld.“

Nur die erste Aussage ist durch das Spielmodell belegt.

Die zweite Aussage darf nicht als reale Schlussfolgerung bestätigt werden.

Verwende vergleichbare Aufgaben für Kenia und Marokko.

Die Aufgabe soll keine umfangreiche neue Quizstrecke bilden.

Ein kurzer Transfer mit erklärender Rückmeldung reicht.

## C2. Gemeinsamer Rückblick auf die drei Länder

Entwickle eine kompakte Übersicht:

**„Drei Orte – unterschiedliche Herausforderungen und Möglichkeiten“**

Die Lernenden sehen die Afrikakarte mit den drei untersuchten Räumen.

Zu jedem Raum erscheint die zentrale fachliche Erkenntnis aus dem Spiel.

Beispielsweise:

- Kenia: Eine Verkehrsmaßnahme hilft unterschiedlichen Menschen auf unterschiedliche Weise.
- Ghana: Mehr Einnahmen bedeuten nicht automatisch mehr Überschuss.
- Marokko: Weniger Wasser pro Fläche bedeutet nicht immer weniger gesamte Entnahme.

Kennzeichne ausdrücklich, dass dies Erkenntnisse aus den jeweiligen Modellen sind.

Biete eine kurze Vergleichshandlung an:

„Was haben die Entscheidungen gemeinsam?“

Eine tragfähige Erkenntnis wäre:

„Jeder Vorschlag hat Folgen. Verschiedene Menschen verfolgen unterschiedliche Ziele. Deshalb müssen wir Vorteile und Nachteile prüfen.“

Diese Erkenntnis soll anhand konkreter Beispiele nachvollzogen werden können.

Der Rückblick darf auch funktionieren, wenn noch nicht alle sechs Episoden abgeschlossen wurden. Er darf nicht so tun, als seien nicht bearbeitete Episoden bereits gelernt worden.

## C3. Keine neue Scheinbewertung

Vermeide globale Nachhaltigkeitspunkte, Ranglisten oder einen „besten Entwicklungsweg“.

Bewerte fachliche Aussagen und die Verwendung von Belegen. Werte legitime unterschiedliche Prioritäten nicht pauschal ab.

Freie Aussagen bleiben ohne zuverlässige technische Prüfung ausdrücklich ungeprüft.

### Qualitäts-Gate C

Prüfe, dass die neuen Aufgaben tatsächlich die Unterscheidung zwischen Modell und Realität unterstützen und keine unzulässigen Verallgemeinerungen erzeugen.

Teste richtige, falsche, teilweise richtige und unterstützte Antworten sowie den Abschluss nach verschiedenen bereits bearbeiteten Episoden.

---

# ABSCHNITT D – SPRACHLICHE UND VISUELLE ABSCHLUSSOPTIMIERUNG

## D1. Schülertexte prüfen

Überprüfe die vollständige sichtbare Benutzeroberfläche aus Sicht einer Schülerin oder eines Schülers mit sehr geringer Lesekompetenz.

Konzentriere dich auf:

- Arbeitsaufträge,
- Hilfen,
- Rückmeldungen,
- Begründungsaufgaben,
- abschließende Lernprodukte.

Kürze unnötige Wiederholungen.

Erhalte notwendige fachliche Erklärungen.

Fachbegriffe sollen verständlich erklärt werden, nicht vollständig verschwinden.

## D2. Abschlussberichte übersichtlicher gestalten

Einige bestehende Berichte enthalten längere Fließtexte.

Prüfe eine klare Gliederung in wenige Abschnitte:

**Mein Vorschlag**

**Mein Beleg**

**Diese Grenze bleibt**

**Das habe ich verglichen**

Zeige nur die jeweils fachlich passende Information.

Insbesondere muss eine Maßnahme deutlich von einem untersuchten alternativen Szenario unterschieden bleiben.

Die vollständigen Modellinformationen dürfen über eine zusätzliche aufklappbare Erklärung zugänglich bleiben, wenn sie im unmittelbaren Lernprodukt zu lang wären.

Wichtig: Verändere die zugrunde liegende fachliche Bewertung nicht nur aus gestalterischen Gründen.

## D3. Hilfen erhalten

Behalte die drei tatsächlich unterschiedlichen Hilfestufen bei.

Eine bloße Verkürzung darf nicht dazu führen, dass lernrelevante Erklärungen verloren gehen.

Keine neue Pflicht zu längeren Freitexten.

Keine flächendeckende grafische Neugestaltung und keine zusätzliche Spielemechanik ohne nachgewiesenen didaktischen Nutzen.

---

# ABSCHNITT E – INTEGRATION UND UNABHÄNGIG PRÜFBARE ABNAHME

## E1. Regression

Führe sämtliche bisherigen Logiktests erneut aus.

Prüfe alle sechs Episoden, insbesondere:

- Modellzahlen und Berechnungen,
- Navigation und direkten Episodenstart,
- Speicherung und Wiederherstellung,
- Rücksprung und Neubearbeitung,
- sämtliche Feedbackkategorien,
- automatische Hilfe nach wiederholten bewertbaren Fehlern,
- korrekte Unterstützungskennzeichnungen,
- neutrale Behandlung offener Entscheidungen,
- vollständige Lernprodukte.

Die bekannten positiven Regressionen dürfen nicht verloren gehen.

## E2. Neue Tests

Entwickle gezielte Tests für:

- korrekte räumliche Verortung,
- Quellen- und Lizenznachweise der Kartenmaterialien,
- Modell-/Realitätsunterscheidung,
- richtige und falsche Transferaussagen,
- differenziertes Feedback der Orientierungshandlungen,
- Wiedereinstieg bei bereits bearbeiteten Regionen,
- Tastatur- und Touch-Bedienung der neuen Karte,
- Darstellung unter Desktop und iPad hoch/quer,
- korrekte zugängliche Namen nach Zustandswechseln,
- konsistente Darstellung der gekürzten Lernprodukte.

Prüfe auch den Produktionsbuild unter dem lokalen GitHub-Pages-Unterpfad `/Afrika-2040/`.

Kein externes Hosting oder öffentlicher Deploymentvorgang als Ersatz für lokale Tests.

## E3. Eigenständige Browsertests

Spiele die neuen Lernhandlungen vollständig im Browser durch.

Nutze Chromium und, wenn tatsächlich verfügbar, WebKit.

Prüfe reale Bedienaktionen und sichtbare Rückmeldungen, nicht nur den Quellcode.

Teste ausdrücklich die Nutzung mit Hilfen und die Rückkehr zu früheren Episoden.

Unterscheide sauber:

- selbst ausgeführte Prüfungen,
- reine Codeanalysen,
- nicht verifizierte Anforderungen.

Ein simuliertes iPad ersetzt keinen Test auf einem physischen iPad.

## E4. Technische Grenzen

Erhalte:

- kostenlose technische Grundlage,
- keine verpflichtenden Konten,
- keine externe Übermittlung von Schülerantworten,
- keine zusätzlichen Bewertungsdienste,
- keine unnötigen Laufzeitbibliotheken,
- lokale Browser-Speicherung mit ehrlicher Kennzeichnung der Grenzen.

Erstelle keine Arbeitsblätter, PDFs oder Lehrkräftehandreichungen. Diese Materialien sollen erst nach dem Abschluss des gesamten Spiels entwickelt werden.

## E5. Übergabe

Erstelle für jeden erfolgreich abgeschlossenen Arbeitsabschnitt einen nachvollziehbaren Commit.

Liefere am Ende:

1. den vollständigen neuen Commitstand,
2. eine präzise Übersicht der Änderungen,
3. verwendete Quellen und Nutzungsrechte,
4. Logik- und Browsertestergebnisse,
5. neue repräsentative Bildschirmaufnahmen,
6. die curriculare und didaktische Zuordnung der tatsächlich ergänzten Lernhandlungen,
7. dokumentierte Grenzen und offene Probleme,
8. ein kompaktes vollständiges Prüfpaket.

Vermeide große, redundante Prüfartefaktsammlungen im Git-Repository. Behalte wichtige Prüfskripte, lagere umfangreiche Screenshots und Laufprotokolle möglichst in das separate Abnahmepaket aus.

Verändere die drei Original-Lehrplandokumente nicht.

**Keine weiteren Episoden entwickeln. Kein Merge nach main, kein Push und keine Veröffentlichung über GitHub Pages ohne gesonderte ausdrückliche Freigabe.**

Beende Phase 5 nach der vollständigen Integration und den vorgesehenen Tests.

Die unabhängige Abnahme durch ChatGPT beziehungsweise Work erfolgt anschließend.