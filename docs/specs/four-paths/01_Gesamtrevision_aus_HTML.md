# Aus der mitgelieferten Gesamtausarbeitung.html extrahierter Abschnitt

Keine separat gelieferte Original-Markdowndatei.

Afrika 2040 – Gesamtrevision und Strukturentscheidung
Stand: 28.10.2026. Referenz: a3be815e5557188d5769f3fc70f25a3bdf8de5d6, Feerson1617/Afrika-2040, Branch feat/afrika-vollstaendig-klasse7.
Status: abgeschlossene konzeptionelle Zweiphasenbearbeitung. Keine Implementierung, keine Änderung am Repository, kein Push, Merge oder Deployment. Die hier beschriebenen neuen Lernwege sind Entwürfe, keine schon vorhandenen Funktionen. Dieses Dokument ist eine interne Entwicklungsgrundlage, keine fertige Lehrkräftehandreichung.
1. Entscheidung
Die fachlichen Modelle behalten; die Lernorganisation neu strukturieren; vier tatsächliche Aufgabenprofile statt vier Programmkopien entwickeln. Der bestehende Bestand trägt die Weiterentwicklung. Ein Neubau von Technik, Karten, Quellenbestand oder Simulationslogik ist nicht begründet.
Die fünf curricularen Themen werden künftig die oberste Navigation bilden. Die sechs regionalen Simulationen werden darin als konkrete Untersuchungen eingebettet. Sie bleiben einzeln erreichbar. Die Orientierung ist ein kurzer Einstieg mit wiederkehrenden Ortsbezügen, der Rückblick bündelt Ergebnisse. Das Journal ist eine gemeinsame Ablage, keine zweite parallele Lernstrecke.
Die entscheidende Änderung ist nicht eine zusätzliche Schwierigkeitsauswahl über derselben Oberfläche. Der gegenwärtig einheitliche Übergang von Auswahl/Rechnung zu drei umfangreichen eigenen Erklärungen wird durch niveauabhängige Aufgaben ersetzt. Förder und ESA bekommen echte strukturierte Erklärungs- und Entscheidungswege ohne Pflichtfreitext. MSA erhält überwiegend Zuordnung und Vergleich sowie nur punktuell kurze eigene Erklärungen. AHR/ÜOS erhält mehr eigene kurze Begründungen, aber dieselbe einfache Sprache und erreichbare Hilfe.
Keine Freigabe als bereits implementiertes vierfach differenziertes Angebot. Der Bestand bleibt für begleitete Erprobung eines gemeinsamen Lernangebots nutzbar; die neue Zielarchitektur muss erst entwickelt und unabhängig geprüft werden.
2. Basis, Vorgehen und Nachweisgrenzen
Selbst kontrolliert
Den aktuellen GitHub-Branch über den Connector mit der Referenz-SHA verglichen: identisch, kein neuerer Branchstand in diesem Abgleich.
Das hochgeladene Prüfarchiv sicher entpackt. Alle 43 im Manifest erfassten Dateien stimmen mit ihren SHA-256-Werten überein. Das bestätigt Integrität, nicht automatisch die Richtigkeit aller Prüfbehauptungen.
Work-Bericht, Korrekturauftrag, Quellen-/Dateiinventar und ausgewählte maschinenlesbare Belege gelesen.
Ausgewählte tatsächliche Work-Screenshots visuell geprüft, insbesondere den langen Bevölkerungs-Fehlerzustand und den dreiteiligen Zukunfts-Schreibauftrag.
Aktuellen GitHub-Code in src/inquiry/content.ts, src/inquiry/ui.ts, src/inquiry/state.ts, src/state.ts, src/main.ts und den Klassenarbeits-Blueprint gelesen. Referenz und Grenzen dieser Auswahl sind im Quellenregister dokumentiert.
Relevante Passagen der drei curricularen Originale erneut gelesen; die ETS-Tabelle und die Anforderungsebenen/-bereiche sowie die Zuordnungstabelle zusätzlich visuell geprüft. Die aktuelle Geltung des Allgemeinen Teils 2024 und der Erlass von 2025 wurden an amtlichen Quellen gegengeprüft.
Nicht neu ausgeführt
Kein vollständiger neuer Build und keine erneute vollständige Browserprüfung in dieser Runde. Der lokale Git-Klon scheiterte am DNS-Zugriff auf GitHub; der Quellcodezugriff über den GitHub-Connector funktionierte. Der beigefügte a3be815-Belegsatz enthält keinen kompletten installierbaren Quellstand. Die von Work ausgewiesenen 203 Logiktests, 70 Chromium-Fälle und 30 zusätzlichen Themendurchläufe sind Work-Ergebnisse, nicht eigene neue Testzahlen dieser Revision. Einzelne Screenshots ersetzen keinen selbst durchgespielten Lernweg.
Keine echten Lernenden, keine physischen Schul-iPads, kein realer SCORM-Import und keine empirische Lernzeit-/Wirksamkeitsmessung. Die nachfolgenden Struktur- und Gestaltungsentscheidungen sind begründete didaktische Vorschläge. Quellenkenntnis, Laufzeitprüfung und Wirkungsnachweis werden nicht gleichgesetzt.
3. Curricularer Rahmen
Q1, ETS S. 4, nennt die fünf vereinbarten Afrika-Themen: Afrikabild in Deutschland, naturräumliche Abhängigkeiten, Bevölkerungswachstum als Chance und Risiko, wirtschaftlicher Aufschwung und nachhaltige Entwicklungschancen. Die Fassung ist als „In Arbeit, Veränderungen möglich“ bezeichnet. Die Spalte heißt „Mögliche Inhalte“. Für dieses Projekt bilden die fünf Felder die vom Nutzer gewählte Zielbreite, nicht eine Liste amtlich vorgeschriebener App-Funktionen.
Q2, Geographie-Fachteil 2015 S. 13–15, verlangt sowohl raumspezifische Betrachtung als auch modellhafte Zusammenhänge und berücksichtigt auf ESA, MSA und ÜOS alle drei Anforderungsbereiche. Q3, Leitfaden S. 62, differenziert nicht nur Selbstständigkeit, sondern auch Komplexität, Abstraktion und Fachsprache. Vier Stufen ausschließlich über mehr/weniger Hilfe würden dieser Breite nicht gerecht.
Fassungsgenaue Bezeichnung: Der Geographie-Fachteil 2015 nennt ESA, MSA und ÜOS. Der aktuell geltende Allgemeine Teil 2024 nennt für die Sekundarstufe I bereits ESA, MSA und AHR (gedruckte S. 7). AHR ist daher nicht bloß eine informelle Nutzerbezeichnung. Unsere Variante heißt AHR; bei der Zuordnung zu den Standards des Fachtextes 2015 wird dessen ÜOS-Bezeichnung nachvollziehbar mitgeführt. Das verlangt in Klasse 7 keine Aufgaben auf Abiturniveau. „Förder“ ist ein zusätzliches Unterstützungsprofil. Es ersetzt weder individuelle Förderplanung noch die Klärung zielgleicher/zieldifferenter Lernziele. Es ist keine Aussage, ein Kind habe einen bestimmten Abschluss erreicht oder werde ihn erreichen. Alle Profile bieten zugängliche Vergleichs-, Erklärungs- und Urteilsmöglichkeiten; identische Abschlusserwartungen dürfen insbesondere für zieldifferent Lernende nicht unterstellt werden.
Q4, Allgemeiner Teil 2024, ersetzt den alten Allgemeinen Teil. Der Fachteil 2015 und der Leitfaden 2016 bleiben die hier einschlägigen Geographiegrundlagen. Q5 verlangt mehrere Anforderungsbereiche in Klassenarbeiten. Daraus wird hier weder eine starre Prozentquote noch eine feste Notenregel abgeleitet.
Fünf Themenfelder vertreten ≠ jede Methode vollständig gelernt ≠ individueller Lernerfolg nachgewiesen. Die spätere Arbeit darf nur Verfahren und Fachinhalte voraussetzen, die tatsächlich eingeführt und an neuen Fällen geübt wurden. Die App selbst wird keine benotete Klassenarbeit.
4. Kritische Bestandsbewertung
4.1 Was fachlich und didaktisch trägt
Die Modelle enthalten lohnende Kontraste: Eine längere Gesamtbuslinie kann für eine Person schneller sein; mehr Fahrten und kürzere Fußwege lösen verschiedene Probleme; höhere Einnahmen können mit geringerem Überschuss einhergehen; ein fester Geldbetrag kann nicht für alle Zwecke zugleich ausgegeben werden; gleiche Wassermenge am Feld kann unterschiedliche Entnahme verlangen; Einzelersparnis und Gesamtmehrentnahme können nebeneinander bestehen.
Diese Widersprüche sind geeignete Denkgelegenheiten. Sie werden nicht dadurch wertlos, dass manche Antworten auswählbar sind. Auch eine Zuordnung kann fachliche Verknüpfung verlangen. Umgekehrt beweist ein langer Freitext keinen hohen Denkanspruch. Die Bewertung orientiert sich an der notwendigen Beziehung, nicht am Eingabeformat.
Erhalten werden sollen: lokale handelnde Akteure, offene legitime Prioritäten, transparente Modellgrenzen, überprüfbare Zahlen, drei erreichbare Hilfen, Anerkennung von Teilantworten, fairer Zahlenparser und die Unterscheidung von Beispielübernahme und eigener Antwort.
4.2 Was grundlegend anders organisiert werden muss
Der aktuelle Quellcode trennt Episoden, Untersuchungsbereich, Rückblick und deren Produkte in verschiedenen Zustandszweigen. Das ist technisch nicht falsch. Didaktisch muss aber die Verbindung für Lernende sichtbar werden. Ein gemeinsames Lernziel sollte nicht mehrfach als voneinander unabhängiger „Abschluss“ auftreten.
Topic besitzt derzeit zwei Materialprüfungen und drei eigene Schreibimpulse. Das ist eine einheitliche Aufgabenhülle für sehr verschiedene Inhalte. Für eine schwache siebte Klasse ist besonders der Sprung von gestützter Auswahl zu gleichzeitig drei komplexen freien Erklärungen problematisch. Die Nachhaltigkeitsfrage bündelt drei Dimensionen, deren Beziehung, Priorität und Nachteil. Eine Aufteilung in einzelne Sinnschritte ist nötig, nicht eine neue Wortzählgrenze.
Die neue Architektur trennt Inhalt, Aufgabenvariante, Sprach-/Bedienhilfe und Nachweisstatus. Ein sprachlich schwaches Kind kann fachlich anspruchsvoll denken. Deshalb bleiben Wörterhilfe, größere Darstellung und kleinschrittige Materialansicht auch im AHR-Profil verfügbar.
4.3 Wo Unterrichtswirkung offen bleibt
Musterübernahme darf den Zugang sichern. Sie darf aber keinen scheinbar eigenständigen Kompetenznachweis erzeugen. Eine eigene AHR-Antwort ist ebenfalls erst eine selbst erzeugte Antwort, nicht automatisch fachlich geprüft. Der Rückblick kann sichern; die geschlossene Modellaussage bleibt Wiedererkennen, solange kein neuer Fall erläutert wird.
Es werden keine Aussagen wie „AHR lernt mehr“, „Förder braucht immer weniger Inhalte“ oder „dieser Weg dauert zehn Minuten“ als Tatsachen gemacht. Die Profile sind Unterrichtsvorschläge, deren Verständlichkeit und Arbeitslast mit Lernenden erprobt werden müssen.
5. Entscheidung über alle vorhandenen Bereiche
Bereich
Entscheidung
Konkrete Änderung und Nutzen
Aufwand/Risiko
Orientierung
Beibehalten, verteilen
Kurzer gemeinsamer Einstieg; Ortsbezug vor jeder Untersuchung. Keine wiederholte komplette Länderabfrage vor beiden Episoden eines Landes.
klein / gering
Afrikabild – Thema A
Neu strukturieren
Bildbeobachtung, Folgerung und Urteil nacheinander; Ausgangsvorstellung optional unbewertet, Schlussrevision mit Beleg. Autorenname als Quelleninformation, nicht Hauptlernziel.
mittel / gering bis mittel
Natur – Thema B
Gezielt ergänzen und verbinden
Saisonvergleich, quantitative Regionalwerte und Naturraumbegriffe getrennt erarbeiten; bestehende Begriffe in einer kleinen Zuordnungs-/Wirkungsaufgabe anwenden, statt nur im Klapptext erwähnen.
mittel / mittel
Kenia E1
Beibehalten, kürzen im Kapitelpfad
Zwei Personen zuerst; dritte Person und Ereignis danach. Einzelschritte bleiben, aber ein gemeinsames Kapitelprodukt statt mehrfacher fast gleicher Schlussformulare.
mittel / mittel
Kenia E2
Beibehalten, anschließen
Nach Bevölkerungsentwicklung als ein möglicher Versorgungsfall: Nachfrage, Angebot und Zugang getrennt. Die 24 Fahrgäste bleiben keine Landesbevölkerung.
mittel / mittel
Bevölkerung – Thema C
Neu strukturieren
Natürliche Veränderung und Wanderung einzeln; danach Gesamtbestand; reale Reihe getrennt; Chancen mit Bedingungen. Vier echte Aufgabenprofile.
mittel / mittel
Ghana E3
Beibehalten, Doppelung reduzieren
Kette und Einnahmen-Paradox als Untersuchung. Die neue Betriebsrechnung aus Thema D wird Anwendung/Transfer, nicht zweite identische Einführung.
mittel / mittel
Ghana E4
Beibehalten
Eigener Verteilungsplan bleibt ein starker Handlungskern. Auszahlung/Rücklage/Fortbildung nacheinander prüfen; keine lange Seite mit sämtlichen Erklärungen zugleich.
mittel / mittel
Wirtschaft – Thema D
Neu strukturieren
Betrieb → reale Bedingungen → Land/Teilhabe. GEPA und Stromdaten beim Schreiben nebeneinander abrufbar. Zugang ist nicht Zuverlässigkeit; zwei Reihen beweisen keine Kausalität.
mittel / mittel
Marokko E5
Beibehalten, verknüpfen
Nach Naturraumuntersuchung: Entnahme, Ankunft und Rest. Tatsächlichen regionalen Wasserhaushalt nicht aus dem Tank ableiten.
mittel / mittel
Marokko E6
Beibehalten
Erst dieselbe Fläche, dann Gesamtentnahme. Zusatzfeld nicht mit Verdoppelung verwechseln; Gegenfall mit kleinerer Erweiterung als Übung.
mittel / mittel
Zukunft – Thema E
Neu strukturieren
Eine Folge/ein Kriterium je Schritt, dann Empfehlung und veränderte Bedingung. Keine drei langen Schreibfelder gleichzeitig.
mittel / mittel
Rückblick und Journal
Zusammenführen, nicht wegwerfen
Fünf Kapitelprodukte plus ausklappbare Teilprodukte; vorhandene Antworten und Herkunft erhalten. „Bearbeitet“ nicht „beherrscht“.
mittel / erhöht wegen Migration
Keine fachlich eigenständige Simulation wird ersatzlos gelöscht. Kürzung bedeutet zunächst weniger Wiederholung im empfohlenen Pfad. Direkteinstiege und bestehende geprüfte Werkzeuge bleiben erreichbar. Aufgaben dürfen nur übersprungen werden, wenn das zugrunde liegende Ziel bereits sinnvoll bearbeitet wurde; eine fremde oder unterstützte Antwort darf dabei nicht zu einem neuen selbstständigen Abschluss umetikettiert werden.
6. Verbindliche neue Gesamtstruktur
Die Startseite zeigt fünf Kapitel und „Weiterarbeiten“. Ein diskreter Eintrag „Lernweg ändern“ führt zur bewussten Profilwahl. Es gibt keine Rangliste und keine öffentliche Einteilung von Kindern.
Kapitel
Leitfrage
Material- und Untersuchungsfolge
Kapitelprodukt
1. Bilder und Orte
Was zeigen Bilder von Afrika – und was nicht?
Orientierung → eigene Vorstellung → zwei echte Fotos → Auswahl/Behauptung prüfen
begrenzte Aussage mit Bilddetail; Anfangsvorstellung bleibt unverändert als früherer Stand
2. Natur und Wasser
Wann gibt es Wasser, und wie nutzen Menschen es?
Lage/Saison → Naturraumzusammenhang → regionale Jahreswerte → E5 → E6
Wirkungskette plus begründete Anpassung und Grenze
3. Menschen und Wege
Wie verändert sich Bevölkerung, und was muss Versorgung leisten?
natürliche Veränderung/Wanderung → Ghana-Reihe → E1 → E2
Bilanz, zeitliche Aussage und bedingte Versorgungsentscheidung
4. Arbeit und Wirtschaft
Was wächst – und wer profitiert?
reale bestehende Verarbeitung → E3 → E4 → Strom/BIP → neue Betriebsrechnung
Betrieb/Land/Teilhabe unterscheiden; Beleg und offene Information
5. Zukunft entscheiden
Welcher Plan passt unter welchen Bedingungen?
Marktangebote → drei Folgenbereiche → Priorität → Wartungsfrage → Afrikabild/Rückblick
begründete Empfehlung, akzeptierter Nachteil und Aussagegrenze
Die Reihenfolge ist eine didaktische Empfehlung, keine technische Sperre. Lehrkräfte können einzelne Kapitel oder Simulationen direkt starten. Bei Direkteinstieg gibt es eine kurze Einführung in die wirklich benötigten Begriffe und Daten. Ein vorheriger Durchlauf darf nicht stillschweigend als Voraussetzung unterstellt werden.
Spielschleife
Vermutung → am Modell etwas verändern → Folgen am selben Material beobachten → einen Zusammenhang erklären → begründet entscheiden → unter neuer Bedingung prüfen. Bei Fotos und realen Datensätzen wird nichts „simuliert“, was die Quelle nicht hergibt: Hier lautet die Interaktion Detail finden → Aussage prüfen → zusätzliche Information auswählen.
Der Titel bleibt erhalten. Untertitel: „Orte verstehen. Entscheidungen prüfen.“ In der Einführung: „2040 ist unser Zukunftsblick. Unsere Beispiele sagen die Zukunft nicht voraus.“ Keine neue Erzählwelt, Sammelobjekte, Zeitlimits oder Punktesysteme.
Planungsbudget, keine gemessenen Lernzeiten
Für ungefähr 20 Unterrichtsstunden ist ein vorläufiger Rahmen von 2 Stunden Einstieg/Bilder, je 4 für Natur, Bevölkerung und Wirtschaft, 3 für Zukunft und 3 für neue Anwendung/Sicherung denkbar. Das umfasst gemeinsame Einführung, Gespräch, analoge Methoden und Diagnose – nicht 20 Stunden Bildschirmzeit. Dieser Rahmen ist eine Planungshypothese. Die konkrete Lerngruppe kann eine Auswahl der Vertiefungen, mehr Sicherung oder andere Verteilung erfordern. Die Software darf keine pauschalen Bearbeitungszeitversprechen anzeigen.
7. Vier Profile – verbindliche Regeln
Merkmal
Förder
ESA
MSA
AHR/ÜOS
Einstieg
Bild/Ort und eine Frage
kurze Frage plus sichtbarer Suchhinweis
kurze Frage; Hilfe zugeklappt
kurze offene Frage; Hilfe zugeklappt
Material
relevante Teilmenge, einzeln
vereinfachte Teilansichten, danach zusammen
übersichtlicher Vergleich
mehrere passende Angaben selbst verbinden
Antwort
tippen, ordnen, wählen; keine Pflichtschrift
auswählen/zuordnen, Rechengerüst; keine lange Pflichtschrift
überwiegend strukturierte Antworten, höchstens punktuell 1–2 eigene Sätze
mehrere kurze eigene Erklärungen; keine Pflichtaufsätze
Rechnung
Richtung verstehen; Ergebnis darf erklärt vorliegen
vorgegebene Operation, kleine Schritte
Operation/Bezugsgröße wählen und rechnen
rechnen plus begründen/prüfen; nicht bloß größere Zahlen
Hilfe
erster Denkhinweis standardmäßig sichtbar
erster Denkhinweis standardmäßig sichtbar
Hilfe jederzeit per Taste
Hilfe jederzeit per Taste
Urteil
Vorteil wählen, Nachteil zeigen
Beleg und Grenze verbinden
Kriterien abgleichen, kurze Begründung
Priorität mit mindestens zwei Folgen und Unsicherheit begründen
Quellen
echt/erfunden und Ort
Ort, Datum, Aussagegrenze gestützt
Angaben passend zuordnen
Perspektive und Beleggrenze selbst erläutern
Keine Profilzuordnung anhand von Fehlern. Eine allgemeine Spracheinstellung darf auch anspruchsvolle Aufgaben entlasten. Förder ist nicht gleich DaZ; DaZ ist nicht gleich geringe Sachkompetenz. Die Profilwahl kann von der Lehrkraft empfohlen werden; ohne Konten ist sie keine sichere Zugangs- oder Prüfungssperre.
Als redaktionelle Zielwerte, nicht als wissenschaftliche Grenzwerte: Förder möglichst 1–2 kurze Auftragssätze, ESA 2–3; MSA 1 kurze eigene Erklärung pro Kapitelkern; AHR 2–3 kurze Erklärungsanlässe pro Kapitel, meist je 1–3 Sätze. Diese Werte nicht als harte Zeichen-/Satzvalidierung programmieren. Notwendige Quellenangaben und Begriffsdefinitionen bleiben erreichbar.
8. Curriculare Tiefe und Grenzen der Klassenarbeitsvorbereitung
Was in jedem Profil vorkommen muss
Alle fünf Themen erhalten einen fachlichen Kern: eine Beobachtung/Angabe, eine Beziehung und eine begrenzte Bewertung. Förder kann die Beziehung zeigen oder passend legen; ESA strukturiert verbinden; MSA zunehmend selbst auswählen; AHR selbst formulieren und prüfen. Das sind nicht automatisch dieselben Nachweise oder dieselben Anforderungen.
Kleine notwendige Integrationen statt neuer Großmodule
Naturraumbegriffe dürfen nicht nur im Klapptext stehen. Aus dem vorhandenen Material folgt eine kurze Anwendung: Regen-/Trockenzeit → Pflanzenwachstum → Nutzung; natürliche Faktoren und menschliche Entscheidungen getrennt. Für F2(S8) ist zusätzlich ein einfacher fachlich geprüfter Kreislauf sinnvoll. Er muss als schematisches Unterrichtsmodell mit Rückführung über Verdunstung/Kondensation/Niederschlag gekennzeichnet sein und darf keine örtliche vollständige Wasserbilanz vortäuschen. Ein vierfach differenzierter Lege-/Pfeilschritt reicht; kein neues Hydrologiespiel.
Pro Kapitel ein veränderter, vergleichbarer Fall. Keine zweite vollständige Fragensammlung. Zahlen und Material unterscheiden sich, aber die geübte Beziehung bleibt gleich.
Eine einfache eigene Frage an Material ist anzubahnen. Vorgegebene Fragebausteine gelten als unterstützte Fragenbildung, nicht als selbstständige Hypothesenentwicklung. Eine Frage wird nicht automatisch als sachlich gut geprüft, nur weil sie gespeichert wurde.
Nicht automatisch in die Klassenarbeit übernehmen
Vollständige Klimadiagramme, flächendeckende Vegetationszonen, Passatzirkulation, demographische Raten und umfassende Wirtschaftsindikatoranalyse sind durch den heutigen Bestand nicht vollständig geübt. Die ETS-Fassung nennt Klimadiagramme bereits für Jahrgang 6; das belegt eine curriculare Vorplanung, nicht das tatsächliche Können dieser Klasse. Bei Prüfungsrelevanz ist eine Wiederaufnahme/Einführung mit geeignetem Material nötig. Kein unvollständiges Monatsdiagramm aus einem Regenzeitkalender konstruieren.
Die Naturraum- und Bildaufgaben dürfen auf bekannte Materialien zugreifen. Neues Prüfmaterial soll in Datenart, Darstellung und Sprache vergleichbar sein. Eine Prüfung darf ein neues Problem verlangen, nicht ein heimlich neues Leseverfahren. Förderziele und erlaubte Hilfen bestimmt die Lehrkraft auf individueller Grundlage. AHR-Aufgaben bleiben Klasse 7, nicht Abituraufgaben.
9. Work-Korrekturen: übernehmen, bündeln, präzisieren
Befund
Entscheidung
Einordnung
Globales Löschen zu eng angekündigt
Sofort zentral korrigieren; künftig auch alle vier Lernwege nennen. Ein universeller Text plus Detailumfang, keine unterschiedlichen Zusagen je Bildschirm.
P2, unabhängig von Differenzierung
GEPA beim Schreiben fehlt
Beide Materialquellen an allen relevanten Aufgaben abrufbar. Materialöffnung verändert keine Antworten oder Nachweise.
P2, unabhängig
16 richtige Erstpositionen
Feste abwechslungsreiche Ordnung nach Aufgabenvariante. Keine zufällige Umordnung bei Render/Reload. Nicht reine Positionsraten als Hauptproblem überbewerten.
P2 für Übungsqualität; im gemeinsamen Renderer lösen
Lange zusammengeklebte Rückmeldungen
Fachliche Teilbewertungen strukturiert ausgeben; nur betroffene Teile erklären; nicht denselben Volltext noch einmal als Hilfe 3.
P2, mit Profilrenderer
Drei überladene Schreibfragen
Durch profilabhängige Sinnschritte ersetzen. AHR nicht bloß länger, Förder nicht bloß weniger Wörter.
P2, mit Varianten
Vegetationszeit/Aussaat
Den vorgeschlagenen Unterschied präzisieren; keine neuen Klimawerte.
P3, kleine sichere Korrektur in Gate 0
Freie Texte und mündliche Selbstauskunft
Ungeprüft erhalten; kein automatisches Beherrschungskennzeichen.
Dauerregel, kein neuer Fehler
Hochformat
Keine Pflichtoptimierung; Querformat und schmaler Frame bleiben Abnahmerahmen.
Umfangskorrektur am Work-Auftrag
Keine vorhandene Testanforderung pauschal streichen. Geänderte UI-Texte oder Reihenfolgen verlangen neue sachliche Sollwerte, nicht das Löschen der negativen Tests.
10. Prioritäten, Rollout und Nachweise
P1: Beim aktuellen geprüften Bereich kein neuer kritischer Fachfehler nachgewiesen. In der Umsetzung wären Verlust/Umdeutung von Antworten, falsche Modellwerte oder ungeprüftes Gesamtgrün Sperrgründe.
P2: vollständiger Materialzugriff, Löschwarnung, gegliedertes Feedback, echte vier Profile, Varianten-/Nachweis-Trennung, fünf Kapitel statt zweier paralleler Hauptmenüs, mindestens eine neue Anwendung pro Kapitel.
P3: weitere Länder, neue Fotoarchive, ausführliche Klima-/Wirtschaftssimulationen, zufällig erzeugte Aufgaben, Vorlesedienst, adaptive Einstufung, Notenautomatik. Nicht beauftragt.
Gate 0 korrigiert gemeinsame Befunde. Gate 1 entwickelt Architektur, Bevölkerung und einen kleinen bestehenden Kenia-Anschluss in allen vier Profilen. Das Muster wird unabhängig geprüft, bevor es überall ausgerollt wird. Die fünf Themen, die sechs Simulationen und die Querschnittsbereiche folgen in weiteren getrennten Commits. Die aktuelle Planungsbearbeitung wurde ohne Zwischenstopp abgeschlossen; daraus folgt ausdrücklich keine Abschaffung unabhängiger Implementierungsprüfungen.
Ein Entwicklungsstopp ist nach erfüllter Variantenmatrix, fachlich korrekten Sollantworten, stabiler Wiederaufnahme/Profilwechsel, gezielter Browserabnahme und dokumentierter curricularer Reichweite sinnvoll. Tatsächliche Verständlichkeit und Lernerfolg folgen aus einer Erprobung, nicht aus der Anzahl grüner Tests.
11. Unterrichtspilot als nachgelagerte Prüfung
Zunächst unterschiedliche Lernvoraussetzungen berücksichtigen, ohne vier Profile als Diagnosen der Kinder zu behandeln. Beobachten: Finden sie Hilfe? Verstehen sie, was eine Quelle sagt? Können sie nach der Hilfe einen veränderten Fall erklären? Welche Fehler sind sprachlich, rechnerisch oder fachlich?
Vor-/Nachaufgaben brauchen dieselbe zulässige Ausdrucksform und vergleichbare Schwierigkeit. Lehrer-/Partnerhilfe gesondert notieren. Eine eigene Erklärung nach einem Beispiel ist aussagekräftiger als eine weitere identische Zuordnung. Bei AHR den Beitrag von Schreibflüssigkeit gegenüber Sachbeziehung unterscheiden. Für Förderschüler kann Zeigen/Ordnen die fachliche Beziehung sichtbar machen, ohne den individuellen Förderplan zu ersetzen.
Kein Kausalnachweis allein aus Vorher/Nachher; keine Aussage über dauerhaften Transfer ohne späteren Nachtest. Schul-iPads/Safari, Schulnetz und eventuell itslearning bleiben gesonderte technische Prüfungen. SCORM bleibt eine spätere Option; dieses Konzept führt weder LMS-Tracking noch neue dauerhafte Speicherung ein.
12. Lesereihenfolge und Quellen
Die vollständigen 52 Varianten stehen in 02_Vier_Niveaus_Matrix.md, die acht ausgearbeiteten Musterwege in 03_Mustersequenzen.md, Prüfplanung und Architektur in 04_Pruefmatrix_und_Architektur.md. 05_Codex_Entwicklungsauftrag.txt ist der konsolidierte Umsetzungsauftrag. Alle gehören zu derselben Spezifikation.
Quellenbelege, genaue Prüfgrenzen und das Integritätsprotokoll stehen in 06_Quellen_und_Nachweise.md. Referenzen Q1–Q5 sind dort aufgelöst. Work-Befunde beschreiben den Ist-Stand; alle neuen Kapitel-, Profil- und Aufgabenentwürfe dieses Pakets sind eigene Gestaltungsvorschläge.
