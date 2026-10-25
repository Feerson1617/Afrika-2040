# Phase 5 – Übergabe zur unabhängigen Prüfung

Ausgangsstand exakt `9b1922627722bf919791901827959c41c8b433ee`, zuvor sauber auf `feat/ghana-marokko-episoden`. Neuer Branch: `feat/phase5-geographie-und-didaktik`. Der endgültige vollständige Commit und der saubere Arbeitsbaum stehen in der `Inventory.json` des Prüfpakets und in der Chat-Übergabe. Keine neue Episode, kein Push, Merge oder Pages-Deployment.

## Änderungen

- **A:** Lokale echte Afrikakarte aus überprüften Natural-Earth-Länderpolygonen und Stadtkoordinaten. Drei freiwillige Orientierungsaufgaben, getrennte Länderfortschritte, drei Hilfen, bedienbarer Weiterweg nach zwei Fehlversuchen. SVG, HTML-Alternative, Tastatur und Touch. Alle sechs Episoden unabhängig startbar.
- **B:** Wenige kurze reale Ortsinformationen, sichtbar getrennt von erfundenen Personen, Betrieben und Zahlen. Quellen und Aussagegrenzen aufklappbar und ohne Netz lesbar. Nur tatsächlich gelesene Ortsdaten; keine neu erfundenen sektoralen Realraumbehauptungen.
- **C:** Freiwilliger Rückblick mit Karte, drei ausdrücklich modellbezogenen Erkenntnissen, drei kurzen Modell-/Realitätsfragen und einem gemeinsamen Vergleich mit Teilanerkennung. Offene/nicht abgeschlossene Episoden heißen Vorschau. Keine Gesamtpunkte und kein bester Entwicklungsweg.
- **D:** Die fachlichen vollständigen Berichtstexte in Episode 2–6 stehen in kurzen Absätzen. Beleg, Grenze, eigene Gewichtung und alternatives Vergleichsszenario bleiben zugeordnet. Kenia 1 war bereits in Absätze gegliedert. Modellwerte, Bewertungen, Freitextbehandlung, Hilfen und Kennzeichnungen bleiben erhalten.
- **E:** Gezielte neue Tests, zusätzliche Absatzprüfungen in bestehenden Volltexttests, erneute breite Regression sowie ein reproduzierbarer Paketbau mit frischem Bundle-Clone und Bytevergleich sämtlicher versionierter Dateien.

Die Abschnittscommits A–D sind `a92edb84b39da5daad43519b67c8b5b0fa78ddca`, `16e9d58408e94503d97aa3a9983f88b2a85962e7`, `4f2923cc981e8bd83c486a6c785d37960cd87e66`, `a6f1fac604d15182bc091ab8ce141c88cba3c89c`; der abschließende E-Commit ergänzt Integration, Dokumentation und Prüfpaket-Skript. Vollständige Historie: `git log 9b19226..HEAD`.

## Ausgeführte Prüfungen

| Prüfung                                                                                          | Ergebnis                                                                                                           |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Sämtliche Logiktests einschließlich neuer Geometrie-/Transfer-/Wiederaufnahmefälle               | 159/159 bestanden                                                                                                  |
| Produktionsbuild (TypeScript/Vite, relative Assets)                                              | Bestanden                                                                                                          |
| Gezielte Gates A / B / C / D                                                                     | 6 / 1 / 11 / 29 Chromium-Fälle bestanden; C enthält die sechs Kartenregressionen                                   |
| Neue Integration einschließlich vorhandener vollständiger Episodenprodukte unter `/Afrika-2040/` | 11/11 bestanden                                                                                                    |
| Abschließender vollständiger Chromium-Lauf                                                       | 194/194 bestanden; keine übersprungenen Fälle, keine Wiederholungen. Protokolle: `e-browser.txt`, `e-results.json` |
| WebKit-Startprobe                                                                                | Nicht verfügbar: Engine `webkit-2370/pw_run.sh` fehlt. Kein WebKit-Lauf behauptet                                  |
| Formatierung eigener neuer/geänderter Dateien                                                    | Bestanden; wortgetreuer Auftrag und offizieller Lizenztext bleiben im Original                                     |
| Repositoryweite Formatprüfung                                                                    | 13 Hinweise: elf unveränderte Altdateien und zwei wortgetreue Originaltexte; kein vollständig grüner Formatlauf    |

Browserprüfungen benutzen reale Klicks, Touch-Koordinaten beziehungsweise sichtbare Kartenknöpfe und Tastaturaktionen. Berechnete zugängliche Namen und `aria-pressed` werden geprüft; SVG und HTML-Alternativen bleiben erreichbar. Axe prüft alle sechs vorhandenen WCAG-A-/AA-Tags, darunter `wcag21a` und `wcag22a`, in den tatsächlich durchlaufenen Zuständen. Das bescheinigt keine vollständige WCAG-Konformität.

Die neuen Modellfragen werden richtig, falsch, unvollständig, teilweise richtig und mit bewusst übernommenen Beispielen durchlaufen. Automatisch angezeigte Hilfe ist kein Abschluss. Änderungen heben Abschluss/aktuelle Übernahmekennzeichnung auf. Frühere Lernprodukte bleiben beim Länderwechsel und nach Wiederladen erhalten. Bei unzugänglichem Speicher bleibt die bisherige fehlertolerante Behandlung bestehen.

Der erste breite Lauf endete mit 193 bestandenen Fällen und einer veralteten Erwartung zum zweiten Tab-Stopp auf der Startseite. Der neue Episodensprung wird jetzt vollständig per Tastatur aktiviert und sein Ziel fokussiert. Danach bestanden der Tastaturfall und alle fünf gezielten Transferfälle (6/6). Der endgültige Gesamtlauf bestand anschließend auf dem frischen Build vollständig (194/194). Die ersten und abschließenden Protokolle sind getrennt enthalten.

## Quellen und Nutzungsrechte

Tatsächlich gelesen am **25.10.2026**: das offizielle Natural-Earth-Repository `nvkelso/natural-earth-vector`, insbesondere Länder 1:110m, Orte 1:10m, README und vollständige LICENSE. Gemeinfrei, einschließlich Bearbeitung und elektronischer Verwendung. Original-URLs und SHA-256: `src/geography/provenance.json`; kleiner überprüfbarer Ortsauszug: `real-place-evidence.json`. Vollständiger Lizenztext: `docs/sources/natural-earth-LICENSE.md`. Das Prüfpaket enthält zusätzlich die tatsächlich abgerufenen Original-GeoJSONs für die Offline-Reproduktion. Keine externen Kartenserver, Laufzeit-APIs, Fonts oder neuen Bibliotheken.

Alle drei curricularen Original-PDFs wurden erneut vollständig textuell gelesen: 60 + 92 + 7 Seiten; unveränderte Hashes im Zugriffsnachweis. Kein erneuter Vollrender behauptet. Fachanforderungen S. 20–22 und Schulcurriculum S. 4 wurden für die neue Zuordnung erneut ausgewertet. Konkrete Lernhandlungen, Seiten, Standards und Grenzen stehen in `docs/curriculum.md`, Abschnitt Phase 5.

Die vorgeschlagenen **ITDP-/GEPA-/FAO-Webseiten waren nicht lesbar**. Deshalb keine neu daraus übernommenen Verkehrs-, Wirtschafts- oder Wasserbehauptungen. Stattdessen reale, belegte Stadt-/Hauptstadt- und Lageinformationen gemäß Gate B. Das offizielle GitHub-Lizenzdokument war lesbar, die Natural-Earth-Webseite nicht. Ein erneuter Versuch derselben blockierten Webseite wurde von der automatischen Freigabeprüfung abgelehnt; keine Umgehung. Der additive Netzwerkentwurf ist kein aktiver Quellenzugang. Details: `docs/sources/phase5-real-context.md`.

## Grenzen und nächster Schritt

Die Kartendaten sind stark generalisiert; kleine Inseln und Grenzdetails werden nicht vollständig dargestellt. Westsahara erscheint mit Hinweis auf den ungeklärten Status. Kartographische Ortsdaten sind keine aktuellen Bevölkerungs-, Verkehrs-, Wirtschafts- oder Wasserstatistiken. Der Titel 2040 ist keine Prognose.

Desktop sowie simuliertes iPad hoch/quer wurden geprüft. Es gab keinen Test auf einem physischen iPad, in echtem Safari oder mit der Zielklasse. Die fehlende WebKit-Engine bleibt offen. Bausteinauswahl, Entwicklerprüfung und Testskript belegen weder selbstständige Urteilskompetenz noch tatsächliche Lernwirksamkeit. Die unabhängige Abnahme erfolgt anschließend.

Das kompakte ZIP enthält direkt lesbaren Anwendungscode, Lockfile, Tests und Textdokumentation sowie den vollständigen versionierten Stand als Git-Bundle. Historische Bildbelege sind im Bundle vollständig enthalten und werden im losen Quellordner nicht verdoppelt; die Ausnahmen stehen in der Bestandsdatei. Dazu kommen neue Laufprotokolle, sechs ausgewählte Bilder und die Ortsquellen. Der Paketbau prüft einen frischen Clone byteweise und führt darin die Logiktests aus. Keine Zugangsdaten, `.env`-Dateien, Abhängigkeitsordner oder Build-Verzeichnisse werden beigefügt. Die SHA-256 des fertigen ZIPs steht daneben. Die tatsächliche Downloadfunktion des Chat-Clients kann aus der Cloud nicht verifiziert werden; ein lokaler Dateilink ist kein unabhängig bestätigter externer Download.
