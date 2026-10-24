# Ghana und Marokko – Entwicklung und Qualitäts-Gates

Auftrag: `ghana-marokko-request.md` (unverändert aus der bereitgestellten Datei). Ausgangspunkt: `088c5931df7434fc31d29dfd0cf35da5fd47c7d8`, sauberer Arbeitsbaum auf `feat/kenia-phase2b-fix-und-episode2`. Neuer Entwicklungsbranch: `feat/ghana-marokko-episoden`. Kein Push, Merge oder Deployment im Ausbauauftrag.

## Gate A1 – Kakaoverarbeitung

Bestanden: Produktionsbuild; 127/127 Logiktests (117 bisherige, 10 neue); 4/4 Chromium-Browserfälle: beide vollständigen selbst bearbeiteten Wege, vollständiger unterstützter Weg mit Zielkonflikt, A/AA-Prüfung der drei Arbeitsansichten. Ein repräsentatives Abschlussbild visuell kontrolliert. Browserprotokolle und Bilder liegen außerhalb Git in `ghana-marokko-evidence/`. Dies ist eine eigene technische Prüfung, keine unabhängige Abnahme oder Unterrichtserprobung. WebKit/iPad und Gesamtregression folgen verbindlich beim Ghana-Gate.

Zwei Maßnahmen begrenzen die gleichzeitige Leselast. Fiktive Modellrunde: Ausgang 180−100=80 GE; Lagerung/Qualität 200−110=90; zusätzliche Presse 260−185=75. Der separate Investitionstopf von 60 GE trägt einmalig 0/20/60 GE. Laufende Ausgaben werden davon getrennt gerechnet. Keine Bohnen-Produkt-Massenumrechnung und keine Behauptung, Verarbeitung garantiere Gewinn. Beide Vorschläge sind begründbar. Zielkonflikte bleiben sachlich offen, bis ein Ziel angepasst oder eine konkrete Folge höher gewichtet wird. Richtige Teilantworten bleiben anerkannt. Freitext wird nicht maschinell bewertet.

Die neue regionale Zustandsverwaltung delegiert Modelle an Episodenmodule. Gemeinsame Progress-, Feedback-, Hilfen-, Navigations- und Speicherlogik vermeidet weitere Episoden-Sonderfälle im Kenia-Reducer. Alte Zustände bleiben gültig; kaputte Teilzustände werden isoliert verworfen. Beispielübernahmen und spätere Änderungen werden getrennt gekennzeichnet bzw. erneut geprüft.

## Curriculare Grundlage und Quellenzugriff

Alle drei bereitgestellten curricularen PDFs wurden vollständig als Text geöffnet: Fachanforderungen (60 Seiten), Leitfaden (92), schulinternes Curriculum (7; als „in Arbeit“ gekennzeichnet). 155 Seiten mit Text, vier leere Rückseiten. Zugriffs- und SHA-Nachweis im externen Prüfprotokoll `source-access.json`. Bezug und Kompetenzgrenzen siehe auch `curriculum.md`: Fachanforderungen S. 9, 14–15, 19–22, 25; Leitfaden S. 13–15, 20, 38–39, 62, 86; Schulcurriculum S. 1, 4. Jahrgang 7, sprachliche Entlastung, gleiche fachliche Herausforderung mit freiwilligen Hilfen, F4 S18/S20, F5 S22, K1 S4 und B1 S2. Eine erfolgreiche Bausteinauswahl belegt keine vollständige selbstständige Urteilskompetenz.

Natural Earth, `ne_10m_populated_places_simple.geojson`, über das offizielle öffentliche GitHub-Repository tatsächlich abgerufen: Kumasi/Ghana und Agadir/Marokko mit Ortskoordinaten. Keine Bevölkerungszahlen oder veralteten administrativen Grenzen übernommen. URL: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places_simple.geojson ; SHA-256 `fd3fa867a320cbd5c5b6bb5bc550afeec2939fb2cef688e508007282a55ac42f`.

Ghanas bestehende Verarbeitung ist ausdrücklich vorgegebener Kontext, kein erfundener statistischer Befund. Die zusätzlich vorgesehenen Wikipedia-/ICCO-Seiten wurden von der Cloud-Netzwerkregel mit HTTP 403 blockiert. Es wird ausdrücklich kein gelesener Online-Beleg behauptet. Ein begrenzter Netzwerkentwurf wurde gespeichert; dessen Übernahme ist noch offen. Die Werkstatt und alle Geldwerte sind ausdrücklich erfunden. Eine fachliche Online-Gegenprüfung der Produktionskette bleibt im Quellenprotokoll kenntlich. Keine fremden Karten, Fotos, Zitate oder vermeintlich aktuellen Wirtschaftsstatistiken.

## Gate A2 / Ghana – Verteilung

Unabhängige Runde: 300−100−80=120 GE frei, nachdem Löhne und andere Kosten bezahlt sind. Sechs Teile zu je 20 GE lassen sich auf Auszahlung, Reparaturrücklage und Fortbildung verteilen. Alle 28 vollständigen Verteilungen einschließlich der drei Extreme sind rechnerisch gültig. Keine zufällige spätere Belohnung und keine Bewertung der Verteilung als moralisch richtig/falsch. Geld kann nicht doppelt oder negativ verteilt werden. Drei Wirkungen werden aktiv geöffnet; die Begründung verknüpft den eigenen Plan mit einer begünstigten Gruppe, einem Ziel und einer Grenze. Eigene Texte bleiben freiwillig und unbewertet.

Didaktische Annahmen: Drei Zwecke sind nach der Einführung beherrschbar; Auszahlung, Reparaturbedarf und unsicherer Nutzen von Bildung müssen im Unterricht besprochen werden. 40/40/40 ist ein erklärtes Beispiel, keine bevorzugte Verteilung. Die Schritte ersetzen weder eine echte Genossenschaftsversammlung noch eine umfassende Gewinnrechnung. Bildschirmmessungen beweisen keine Verständlichkeit für alle Lernenden.

Der erste Gesamtlauf umfasste 118 Chromium-Fälle: alle 105 bisherigen Kenia-Fälle bestanden, zwölf Ghana-Fälle bestanden; ein neuer Ghana-A/AA-Fall erkannte fehlende GE-Beträge in den SVG-Namen. Die Beträge wurden in die berechneten Namen aufgenommen; zusätzliche Rückwechselprüfungen sichern 0→20→0 GE. Der Fehlerlauf bleibt im externen Protokoll erhalten. Die Nachprüfung wird nach Abschluss unten ergänzt.

Zusätzlich tatsächlich gelesene Ortsquelle: Natural Earth, `ne_110m_admin_0_countries.geojson`, Ghana: Western Africa; Morocco: Northern Africa. URL: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson ; SHA-256 `6866c877d39cba9c357620878839b336d569f8c662d3cfab4cb1dbe2d39c977f`. Nur Raumbezeichnungen übernommen, keine politische Grenzdarstellung. Die Werkstatt/Geldtöpfe sind eigene SVG-Grafiken.

Ghana-Gate abgeschlossen: 131/131 Logiktests, Produktionsbuild und 13/13 gezielte Chromium-Ghana-Fälle nach Korrektur bestanden. Zusammen mit den 105 bestandenen unveränderten Kenia-Regressionen decken die Läufe alle 118 Fälle ab. Desktop sowie simulierte iPads hoch/quer mit tatsächlichen Touchereignissen, beide Ghana-Episoden normal und unterstützt, echte Tastaturaktivierung, berechnete SVG-Namen in beiden Richtungen, A/AA aller Arbeitsansichten und Wiederaufnahme geprüft. Das iPad-Abschluss- und Entscheidungsbild wurde visuell kontrolliert. Kein echter Hardware-/Unterrichtstest. Der A1-Commit ist `56b17ac5906c0e6e12e52b54ee0480aee10e852a`.

WebKit ist lokal nicht installiert/startbar (Startversuch protokolliert); dessen vorherige Downloads wurden von der Netzwerkregel blockiert. Es wird kein WebKit-Erfolg behauptet. Die zwei früheren macOS-Probleme nativer Select-Tastaturtests bleiben offen; diese Linux-Chromium-Prüfung ersetzt keinen macOS-Nachweis. Erst nach diesem Ghana-Gate beginnt Marokko.

## Gate B1 – Tank und Bewässerung

Bestanden: 134/134 Logiktests, Produktionsbuild, 4/4 gezielte Chromium-Fälle: beide normalen Wege, vollständiger unterstützter Weg, alle drei A/AA-Ansichten mit berechneten Namen und echten Tastaturereignissen auf SVG- und HTML-Alternativen. Repräsentatives unterstütztes Lernprodukt visuell kontrolliert. Breite iPad-/Regressionsprüfung folgt beim Marokko-Gate.

Zwei Maßnahmen begrenzen die Leselast. Ein ausdrücklich erfundener Tank enthält zu Beginn 80 WE, ohne modellierten Zufluss. Ausgang: 60 entnommen/40 am Feld/20 im Tank; Reparatur: 50/40/30; erneuerte Verteilung: 45/40/35. Alle drei Bilanzen werden gegen feste Sollwerte geprüft; Entnahme plus Rest ist immer 80. Die Differenz zur Feldankunft wird nicht pauschal Verbrauch genannt. Verdunstung, Versickerung und Rückflüsse sind nicht berechnet, ebenso wenig Grundwasser oder sichere Erträge. Kein echtes Einsparprozent und keine pauschale Klimaaussage. Die Ortsangabe Agadir/Nordafrika ist mit den tatsächlich gelesenen Natural-Earth-Daten belegt.

Die Reparatur erhält die vorhandene Leitung; die erneuerte Verteilung entnimmt im Modell am wenigsten, benötigt aber neue Teile, Filter und Wartung. Beide Vorschläge sind möglich. Alle vier Kombinationen aus Vorschlag/Ziel werden ohne Positionsbonus geprüft; eine abweichende konkrete Gewichtung ist zulässig. Entnahme und verbleibender Tankvorrat werden getrennt betrachtet. Technische Funktionsprüfung und eigene fachliche Modellprüfung ersetzen keine unabhängige Abnahme.
