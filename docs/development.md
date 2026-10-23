# Architektur und Prüfregeln – Phase 1

## Umfang

Vite, TypeScript, semantisches HTML/CSS und eine lokale SVG-Karte. Keine Spiele-Engine, Konten, Laufzeitdienste, externen Fonts, Analytics oder KI-Bewertung. GitHub Pages wird durch relative Buildpfade vorbereitet, nicht veröffentlicht. Die Oberfläche verwendet eine ruhige, atlasartige Gestaltung: Papierfarben, dunkles Grün, zurückhaltendes Terrakotta, Serifenschrift für Fragen, klare serifenlose Leseschrift für Bedienung. Bewegung ist auf unmittelbare Zustandswechsel begrenzt.

## Module

- `src/content.ts`: Episode, Aufträge, Hilfen, Wörter und zentrale Minutenwerte. Spätere Inhalte können dieses Muster aufnehmen; Ghana/Marokko sind noch nicht implementiert.
- `src/model.ts`: reine Wegberechnung und belegbare Aussagen. Keine UI-Abhängigkeit.
- `src/feedback.ts`: explizite Kriterien je Aufgabe; neutrale Empfehlungsauswertung; Freitext bleibt unbewertet.
- `src/state.ts`: reine Zustandsübergänge, Versuche, Hilfen, Navigation, erneute Bearbeitung, Transfer und Neustart.
- `src/storage.ts`: fehlertoleranter Tab-Speicher; beschädigte/unerwartete Daten starten einen neuen Zustand. Keine serverseitige Speicherung.
- `src/map.ts`: eine SVG-Modellkarte mit identischen Zahlen zum Rechenmodell. Auswählbare Wege und Personen sind per Tastatur erreichbar; HTML-Bedienelemente bieten eine größere Alternative.
- `src/main.ts`: DOM-Oberfläche, Ereignisse, Fokus, Textescaping, lokale Speicherung.
- `src/style.css`: responsive Oberfläche, Touchflächen, Kontraste und reduzierte Bewegung.

## Modellannahmen und verbindliche Werte

| Person                    | Direkt: Fuß + Bus        | Über Nord: Fuß + Bus       |
| ------------------------- | ------------------------ | -------------------------- |
| Amina → Schule im Zentrum | 12 + 10 = **22** Minuten | 2 + 8 = **10** Minuten     |
| David → Markt im Zentrum  | 2 + 10 = **12** Minuten  | 2 + 8 + 8 = **18** Minuten |

Amina steigt bei „Über Nord“ erst in Nord ein. Die gesamte Linie benötigt 16 Minuten, Aminas Busfahrt nur 8. Beide Ziele liegen modellhaft unmittelbar an der Haltestelle Zentrum; eine zusätzliche letzte Gehstrecke wird nicht berechnet. Wartezeiten, Fahrpreise und Kapazität werden nicht verglichen/berechnet. Es gibt keine Zuverlässigkeits-, Sicherheits-, CO₂- oder Nachhaltigkeitskennzahl. Die Karte ist schematisch, nicht maßstabsgetreu, und zeigt keine wirkliche Nachbarschaft Nairobis. Die Hilfs-Transferaufgabe verändert nicht die Hauptdaten: neues Beispiel mit 3 Minuten Fußweg + 10 Minuten Bus = 13 Minuten.

## Feedback-Vertrag

| Fall                           | Technisch überprüfbares Kriterium                                | Rückmeldung                                                                                               |
| ------------------------------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| A: richtig                     | Passende Teilstrecken bzw. richtige betroffene Person            | Grün, Text und Zeichen, Zusammenhang erklären                                                             |
| B: falsch                      | Vollständige Auswahl verfehlt das Kriterium                      | Rot, konkreter Hinweis; beim ersten Versuch keine vollständige Auflösung                                  |
| C: teilweise                   | Genau ein passender Teil in Aufgabe 1                            | Gelb, richtigen Teil nennen, fehlenden Teil benennen                                                      |
| D: offene Entscheidung         | Vorteil mit Zahlenbeleg und Nachteil passen zum gewählten Busweg | Neutral, beide Wege zulässig; fehlende/falsche Belege sachlich ansprechen                                 |
| E: unklarer Freitext           | Nur Vorhandensein eines nicht leeren Textes ist feststellbar     | Neutral, Speicherung bestätigen, wenn sie tatsächlich gelang; fachliche Prüfung ausdrücklich offen lassen |
| F: wiederholte Schwierigkeiten | Zwei erfolglose bewertete Versuche                               | Gelbe Erklärung, Hilfe 3, freiwilliger kurzer Transfer, Weiterweg ohne Sperre                             |

Fehlende Pflichtauswahl ist kein bewerteter Versuch. Freiwillige Hilfe verbraucht keinen Versuch. Die Bausteine prüfen nur die gewählten Belege; sie belegen keine tatsächlich selbstständig erreichte Kompetenz und ersetzen keine Prüfung der eigenen Gewichtung. Ein Abschluss mit Freitext ist möglich, ohne ihn als richtig auszugeben. Bei widersprüchlichen Bausteinen plus Freitext bleiben die fraglichen Belege auch im Abschluss als zu prüfen markiert.

## Daten und Zustände

Antworten werden unter `afrika-2040:kenia-bus:v1` ausschließlich im `sessionStorage` desselben Browser-Tabs gesichert. Browser können Tab-Sitzungen wiederherstellen; Neustart entfernt den gespeicherten Spielzustand ausdrücklich. Bei gesperrtem Speicher funktioniert das Spiel bis zum Neuladen im Arbeitsspeicher weiter und behauptet keine dauerhafte Speicherung. Eigene Texte werden vor HTML-Ausgabe escaped und auf 1500 Zeichen begrenzt. Es gibt keinen Fetch/Beacon, keine Fernbewertung und keine Schülerkennungen. Der Entwicklungsserver ist nur ein Entwicklungswerkzeug; die gebaute Anwendung benötigt keinen Anwendungsserver.

Ein Schritt wird erst nach korrekter geschlossener Lösung, vollständiger Erklärung oder bearbeiteter offener Empfehlung fortgesetzt. Zurück erhält die Arbeit; „Aufgabe neu bearbeiten“ setzt nur den aktuellen Schritt zurück. Neustart während des Spiels fragt zur Vermeidung versehentlicher Löschung lokal nach. Schnell wiederholte Klicks dürfen keine unbearbeiteten Schritte überspringen.

## Prüfregeln

1. Alle vier Reisezeiten sowie der Unterschied zwischen Linienlänge und Aminas Teilfahrt müssen stimmen.
2. Richtige/falsche/teilrichtige/leere Antworten, zwei Fehlversuche, alle Hilfen, Transfer, Neustart, Rückkehr und erneute Bearbeitung prüfen.
3. Für beide Empfehlungen sämtliche Bausteinkombinationen prüfen. Freitext auch mit ungewöhnlicher Formulierung, falschen Zahlen und HTML-Zeichen testen. Keine Schlüsselwortbenotung.
4. Tatsächlich gestarteten Produktionsbuild im Browser bis zum Abschluss durchlaufen. Pfade zusätzlich unter `/Afrika-2040/` durch einen statischen Mount prüfen.
5. Maus, Tastatur, Touch-Simulation; Desktop, iPad quer/hoch und schmale Ansicht prüfen. Screenshots ansehen. Kontrast-/ARIA-Prüfung mit axe ist eine Ergänzung, kein vollständiger Barrierefreiheitsnachweis.
6. Sprache, Informationsmenge, Kartenlegende, offene Entscheidung, Modellkennzeichnung und Grenzen der curricularen Abdeckung intern prüfen.
7. Tests mit nachvollziehbaren Anzahlen und ausgeführten Befehlen berichten. Ungeprüfte Safari-/Hardware- und Unterrichtserfahrungen ausdrücklich offen lassen. Eigene Tests ersetzen die unabhängige Prüfung durch ChatGPT/Work nicht.
