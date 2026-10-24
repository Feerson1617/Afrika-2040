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

## Gate B2 / Marokko – Einzelne Fläche und Gesamtentnahme

Bestanden: 139/139 Logiktests, Produktionsbuild, vollständiger Chromium-Lauf mit 130/130 Fällen aller sechs Episoden. Zwölf Marokko-Fälle umfassen beide Maßnahmen/Flächenpläne, komplette normale und unterstützte Wege, unvollständige und richtige Teilantworten, bewusste Zielkonflikte, Wiederaufnahme, alle Arbeitsansichten mit A/AA, Tastatur und echte Touchereignisse auf simulierten iPads hoch/quer. Ein repräsentativer iPad-Flächenzustand wurde visuell kontrolliert. WebKit bleibt nicht startbar; kein Hardware-/Unterrichtsnachweis.

Genau das vorgeschlagene Modell: Tankstart 80 WE, kein Zufluss; erstes Feld ursprünglich 60 WE, dasselbe Feld mit neuer Technik 45 WE, kleineres Zusatzfeld weitere 20 WE. Gesamt 65, Rest 15. Ohne Zusatzfeld: Gesamt 45, Rest 35. Der scheinbare Widerspruch wird als Ursache-Wirkungs-Erklärung in das Bausteinprodukt aufgenommen. 15 WE Einsparung am ersten Feld sind kein Beleg für geringere Gesamtentnahme bei mehr Flächen. Keine Ertrags-, Einkommens- oder Arbeitsplatzgarantie, keine realen Flächenquoten und keine Grundwasserprognose. Die Startbedingungen sind unabhängig von einer früheren Entscheidung.

Die neue B2-Speicherprüfung deckte zusätzlich ab, dass ein Experiment-Reset in Episode 5 die richtigen Ausgangsantworten bewahren muss; er löscht nun nur die Experimentantworten. Der frühere Stand und alle Kenia-Modellwerte bleiben erhalten. Die Episodenregistrierung wurde im Vorab-Build korrigiert, bevor der erfolgreiche Gesamtlauf startete. Marokko-Gate bestanden; erst jetzt beginnt die abschließende Integration. B1-Commit: `45f87b64855540638a9d90443b5b7c40c98d7357`.

## Abschlussintegration

Die gemeinsame Auswahl bietet sechs direkt startbare Episoden in drei Ländergruppen. Auch die erste Kenia-Episode und das spätere Ereignis haben jetzt einen Rückweg zur Auswahl, der ihre Lernprodukte erhält. Die bisherigen Rechenwerte, Phase-1-Korrekturen und Spielmechaniken wurden nicht geändert. Der Löschdialog von Episode 2 nennt ausdrücklich alle sechs Episoden.

Die Begründung der neuen Episoden erscheint in drei kurzen Abschnitten: Vorschlag/Ziel, Beleg, Grenze/Gewichtung. Auswahl, Ziel und benötigte Zahlen stehen am Ort der Begründung; keine Karte muss dafür wieder gesucht werden. Es bleibt eine inhaltliche Entscheidung über einen passenden Beleg und eine Grenze. Die Oberfläche ordnet diese nicht automatisch zu. Eine wahre Angabe über eine andere Maßnahme wird sachlich als noch unverbunden behandelt; eine passende Teilbegründung bleibt ausdrücklich anerkannt. Bewusst abweichende Gewichtung nennt eine konkrete Folge und die in Kauf genommene Grenze. Das Lernprodukt wiederholt dieselbe Grenze nicht nochmals als vermeintlich neues Argument.

Gespeicherte Experiment-Prüfmarken werden zusätzlich gegen die tatsächlichen Antworten geprüft. Doppelte oder widersprüchliche regionale Speichereinträge werden isoliert verworfen. Ein Abschnittswechsel ist kein Fehlversuch und verändert kein bereits geprüftes Produkt. Nach einer inhaltlichen Änderung ist die Empfehlung erneut zu prüfen. SVG-Touchflächen in den neuen Szenen sind auf beiden simulierten iPad-Formaten mindestens 44 CSS-Pixel groß; die Szene-Schrift mindestens 15 CSS-Pixel. HTML-Alternativen und sichtbarer Tastaturfokus bleiben verfügbar.

Die zusätzliche Integrationsprüfung erkannte zunächst zwei Testtreiberfehler (Buttonname mit Pfeil; erneutes Lesen eines bereits entfernten Startbuttons). Nach deren Korrektur zeigte sie den fehlenden Auswahl-Rückweg im alten Kenia-Abschluss; dieser wurde ergänzt. Der reale Kenia-Lernstand bleibt beim Wechsel und Wiederladen unverändert. Abbrechen eines Neustarts erhält alle Daten; bestätigter Neustart löscht alle Episoden. Der unveränderte bisherige Kenia-Button „Neu spielen“ bleibt ein unmittelbarer vollständiger Neustart, wie im README beschrieben.

Neue große Bilder/Protokolle werden nicht in Git aufgenommen. Historische Belege und schulische Originale bleiben erhalten. Der Abnahmeexport enthält einen vollständigen Git-Bundle des Entwicklungsbranches, Wiederherstellungsanleitung, Bestands-/Hashnachweise, tatsächliche Laufprotokolle und wenige repräsentative aktuelle Bildschirmbilder. Abhängigkeiten, Build-Zwischendateien, Zugangsdaten und `.env` gehören nicht hinein.

Offen bleiben: unabhängige fachlich-didaktische Schlussprüfung; reale Unterrichtsbeobachtung einschließlich geringer Lesekompetenz; echte iPads/Safari; WebKit mangels installierter Engine; die bekannten zwei macOS-Select-Testprobleme. Wikipedia/ICCO waren durch die Netzwerkregel nicht lesbar; dieser Zugriff wird nicht erfunden. Die curricularen Originale und beide genannten Natural-Earth-Quellen waren tatsächlich vollständig zugänglich. Alle Betriebs-/Wasserwerte sind eigenständig geprüfte fiktive Modelle.

Der vollständige `format:check` meldet elf unveränderte historische Dateien und die bytegetreu erhaltene neue Auftragskopie. Es wurden keine fremden Originaltexte oder alten Tests nur für Formatierung umgeschrieben. Der gezielte Formatcheck sämtlicher neuer/geänderter Programm- und Testdateien sowie der bearbeiteten Dokumentation besteht. Die abschließenden Zahlen werden nach dem Gesamtlauf ergänzt.

### Abschlussergebnis

142/142 Logiktests und 140/140 Chromium-Browserfälle bestanden, Produktionsbuild erfolgreich. Die vollständige Schlussprüfung umfasst die 105 bisherigen Kenia-Fälle, 13 Ghana-, 12 Marokko- und 10 Integrationsfälle. Sie prüft auch die echten Tastaturwege aller vier neuen Episoden, tatsächliche Tab-Erreichbarkeit der SVG-/HTML-Alternativen, beide iPad-Formate mit Touch, die gemeinsame Auswahl, alle vier vollständigen unabhängigen neuen Episoden unter `/Afrika-2040/`, wiederholtes Aufrufen/Re-Load, einen tatsächlich erspielten Kenia-Lernstand, blockierten Speicher, ungeprüften eigenen Text mit HTML-Escaping sowie Abbrechen/Bestätigen des globalen Neustarts. Die vorhandenen korrigierten SVG-Namen werden weiterhin in beiden Richtungen geprüft.

Axe 4.14.0: 70 unterschiedliche automatisierte Regeln über `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22a`, `wcag22aa`; `wcag22a` enthält aktuell keine eigene automatisierte Regel. Dies ist keine vollständige WCAG-Konformitätszertifizierung. Aktuelle iPad-Begründung und Episodenauswahl wurden visuell geprüft. Die unabhängige Schlussprüfung und Unterrichtserprobung sind weiterhin erforderlich.

| Abschnitt                | Lokaler Commit                             |
| ------------------------ | ------------------------------------------ |
| Episode 3 / A1           | `56b17ac5906c0e6e12e52b54ee0480aee10e852a` |
| Episode 4 / Ghana-Gate   | `c20157532b6f486b39661d6ddbb1881ee4d921bc` |
| Episode 5 / B1           | `45f87b64855540638a9d90443b5b7c40c98d7357` |
| Episode 6 / Marokko-Gate | `56f9a1b23ac0b74901d2c0a7d7b9d22e4e6a960e` |

Der nachfolgende Integrationscommit steht mit vollständiger SHA und sauberem Arbeitsbaum in der Bestandsdatei des Exports. Ein kompakter zusätzlicher Quellcode-Export lässt ausschließlich die umfangreichen historischen Bild-/Laufbelege unter `docs/evidence/` aus; die vollständige versionierte Historie einschließlich dieser unveränderten Belege bleibt im Git-Bundle des Gesamtpakets erhalten. Quellcode, Lockfile, Tests und relevante Dokumentation sind auch im kompakten Export enthalten. Beide Pakete enthalten die neuen ausgewählten Prüfnachweise. Nach diesem Ausbau wird gestoppt; kein Push, Merge oder Deployment durchgeführt.
