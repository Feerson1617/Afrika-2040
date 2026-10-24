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
