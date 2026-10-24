# Kombinierte Übergabe – Phase 2B korrigiert und zweite Kenia-Episode

24. Oktober 2026. Interne Entwicklungsdokumentation für die anschließende unabhängige Gegenprüfung. Keine Unterrichtswirkung, vollständige Barrierefreiheit oder unabhängige Freigabe behauptet.

## Stand und Auftragsgrenze

Repository `Feerson1617/Afrika-2040`, Entwicklungsbranch `feat/kenia-phase2b-fix-und-episode2`. Verifizierter sauberer Ausgangsstand: `8eb0d8bcdaf45da27ca0a9cdab5de09a10238562` auf `feat/phase2b-kenia-strassenereignis`.

1. **Abschnitt A:** separater Commit `8c127cb2eccd0db731c16ec8831779518590df1d`. Gate A wurde vor Beginn von Abschnitt B abgeschlossen: [Korrektur und Gate](phase2b-correction-gate.md).
2. **Abschnitt B:** separater nachfolgender Commit mit dieser zweiten Episode. Seine vollständige SHA wird bei der Übergabe und in `BESTAND.txt` des außerhalb des Repositories erzeugten Prüfpakets genannt; das Dokument enthält naturgemäß nicht seine eigene Commit-ID.

Der [kombinierte Nutzerauftrag](combined-request.md) ist maßgeblich; der [Korrekturprompt](phase2b-correction-request.md) ergänzt Abschnitt A. Die [unabhängige Gegenprüfung des alten Stands](phase2b-independent-review.md) wurde als Befund gelesen. Ihr früheres „keine neue Episode“ begrenzt den Korrekturteil, nicht den ausdrücklich neu freigegebenen Abschnitt B. Keine weitere Episode, kein Arbeitsblatt, keine Lehrkräftehandreichung, kein Push/Merge/Deployment innerhalb dieses Auftrags.

## Technisch implementierte Funktionen

- Die Phase-2B-Revision erkennt vollständig bewertbare unpassende Vorher-Jetzt-Belege und bietet nach zwei Prüfungen den vorhandenen unterstützten Weiterweg. Richtige Zahlen und passende bisherige Belege werden anerkannt; Übernahme bleibt bewusst und gekennzeichnet.
- Die zweite Episode **„Mehr Menschen – reicht der Bus noch?“** kann direkt auf der Startseite oder nach einem früheren Abschluss gestartet werden. Drei Lernschritte: Nachfrage und Plätze vergleichen, zwei Maßnahmen auf derselben Karte ausprobieren, eine Empfehlung begründen.
- Sichtbare Personen-/Platzsymbole verändern sich mit dem Modell. Die Karte verknüpft den neuen Wohnbereich, den Fußweg, den Platz und das Zentrum. Karte und HTML-Tasten sind gleichwertig bedienbar. Es kann nur eine Maßnahme zugleich wirken.
- Vorschlag, Ziel, Vorteil und verbleibender Nachteil bilden ein zusammenhängendes Bausteinprodukt. Bei Zielkonflikten stehen Zielanpassung und eine konkrete abweichende Gewichtung zur Auswahl. Beide Maßnahmen können abgeschlossen werden; keine Position erhält einen Richtigkeitsbonus.
- Freiwillige dreistufige Hilfen, automatische Erklärung nach zwei bewertbaren Fehlern und bewusste Beispielübernahme. Unvollständige Eingaben und offene legitime Zielkonflikte verbrauchen keine Fehlversuche. Eigene Texte bleiben ungeprüft und können ausdrücklich unbewertet abgegeben werden.
- Vorhandene erste und erneute Empfehlungen bleiben erhalten. Eine gültige alte Linie kann als Ausgangslinie übernommen werden. Sonst wird selbst gewählt; das Spiel erfindet keine frühere Entscheidung. „Bisherige Empfehlungen ansehen“ öffnet den gespeicherten alten Bericht. Globaler Neustart verlangt Bestätigung und löscht beide Episoden.
- Die frühere Baustelle wird für die spätere Episode ausdrücklich als beendet bezeichnet. Historische Berichte behalten ihre ursprünglichen Vorher-/Jetzt-Zeiten. Kein verändertes globales Zeitmodell.

Die Trennung von Inhalt, Modell, Feedback, Zustandsübergängen, Oberfläche und Speicherung bleibt erhalten. Neue Module: `demand-content.ts`, `demand.ts`, `demand-ui.ts`; gemeinsame `feedback.ts`, `state.ts` und `storage.ts`. Keine neue Abhängigkeit, keine Laufzeit-API oder externe Schrift. Das Lockfile bleibt unverändert. [Architektur](development.md).

## Fachliches Modell

Alle folgenden Zahlen sind erfunden. Die 24 Personen sind **Busnachfrage, keine Einwohnerzahl** des Viertels. Im Modell möchten nach Zuzug acht zusätzliche Personen mitfahren; daraus folgt keine allgemeine Regel für jede Bevölkerungsänderung.

| Situation            | Personen in einer Stunde | Fahrten | Plätze je Fahrt | Plätze insgesamt | Später fahren | Fußweg neuer Wohnbereich → Platz |
| -------------------- | -----------------------: | ------: | --------------: | ---------------: | ------------: | -------------------------------: |
| Vorher               |                       16 |       2 |              10 |               20 |             0 |                          12 Min. |
| Jetzt, ohne Maßnahme |                       24 |       2 |              10 |               20 |             4 |                          12 Min. |
| Zusätzliche Fahrt    |                       24 |       3 |              10 |               30 |             0 |                          12 Min. |
| Kürzerer Fußweg      |                       24 |       2 |              10 |               20 |             4 |                           4 Min. |

Jede Person möchte einmal fahren. Betrachtet wird dieselbe vorgegebene Stunde am Platz. Andere Fahrgäste und Haltestellen werden nicht mitgerechnet. Mittel reichen laut Modell für genau eine Maßnahme; reale Bau-/Betriebskosten sind unbekannt. „Später fahren“ enthält keine Minutenangabe: Fahrplan und Wartezeiten fehlen. Keine unbelegten Effekte auf Einkommen, Sicherheit, Lebensqualität oder Umwelt. Die Karte ist ein Ausschnitt im erfundenen Viertel, keine tatsächliche Stadtkarte oder repräsentative Statistik Nairobis/Kenias.

Die alten 18 Reisezeiten, Einstiege und Busabschnitte bleiben unverändert: Amina 22/10/28 und David 12/18/18 in beiden Zeitständen; Leila vorher 22/28/10, im historischen Ereignis 28/34/10. Die Fußzeit der neuen Nachbarn ist ein eigener Modellwert und überschreibt keine alte Personenzeit.

## Tatsächlich selbst getestete Lernhandlungen

| Prüfung                                 | Tatsächliches Ergebnis und Beleg                                                                                                                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Gate A                                  | 96/96 Logiktests; 82/82 Chromium-Fälle, danach alle 24 betroffenen Fälle mit abschließendem kurzen Feedback erneut bestanden. [Protokolle](evidence/gate-a/)                                                       |
| Bisherige Regressionen nach Erweiterung | 96/96 bisherige Logiktests und 82/82 bisherige Chromium-Fälle erneut bestanden. `previous-unit-tests.txt`, `previous-browser-chromium.txt`                                                                         |
| Abschließende Logik                     | **117/117 bestanden**: bisherige 96 plus 21 neue Fälle. Zahlen werden gegen feste unabhängige Sollwerte geprüft; keine Erwartungswerte aus der zu prüfenden Berechnung abgeleitet. `unit-tests.txt`                |
| Abschließende Browserrunde              | **100/100 Chromium-Fälle bestanden**, zwei Worker, keine Wiederholungsversuche: bisherige 82 plus 18 Episode-2-Fälle. `browser-final-all.txt`                                                                      |
| Produktionsbuild                        | TypeScript und Vite erfolgreich; Code-/Testformatprüfung bestanden. `build.txt`, `format-check.txt`                                                                                                                |
| WebKit                                  | Ein konfigurierter Episode-2-Tastaturfall tatsächlich gestartet, **Start vor erster Spielinteraktion gescheitert**: Browserdatei fehlt. Nicht bestanden und nicht still übersprungen. `browser-webkit-blocked.txt` |

Aktuelle Protokolle: [evidence/episode2/](evidence/episode2/). Geprüft mit Linux, Node 24.19.0, npm 11.9.0 und System-Chromium; die genaue Browserfassung und Hashes sämtlicher verwendeter Code-/Test-/Builddateien stehen in `validation-inputs.json`.

Die 18 neuen Browserfälle enthalten vollständige Verläufe mit beiden Maßnahmen auf Desktop 1440×1000 und simuliertem iPad 1024×768/768×1024. Die iPad-Fälle benutzen tatsächliche Touch-Ereignisse, auch auf den SVG-Verbindungen. Ein kompletter neuer Verlauf wird ausschließlich mit nativen Tastaturereignissen bedient; tatsächliche Auswahlzustände werden geprüft. Dazu kommen falsche/teilweise/leere Antworten, zwei Fehler und Übernahme, Zielkonflikte mit beiden Überarbeitungswegen, aktuelle und historische Hilfeherkunft, eigene unbewertete Texte/HTML-Escaping, Neuladen, Rücksprung, Neubearbeitung, beschädigter/gesperrter Speicher, globaler Neustart sowie beide Maßnahmen unter `/Afrika-2040/` auf einem lokalen Server.

Zwei zusätzliche Übergänge bewahren im echten Browser die erste bzw. beide früheren Empfehlungen. Der zweite Fall spielt die ursprüngliche Nordempfehlung, das Ereignis, den Wechsel zu Süd und danach Episode 2 vollständig durch. Beide alten Lernprodukte sind nach Neuladen unverändert und wieder aufrufbar. Die beobachteten vollständigen neuen Abläufe zeigen keine fehlgeschlagenen Ressourcen, JavaScript-/Konsolenfehler oder externen Laufzeitanfragen. Ausgewählte axe-A/AA-Regeln werden in Start, Vergleich, Maßnahme, Zielkonflikt und unterstütztem Abschluss geprüft; keine vollständige WCAG-/Screenreader-Prüfung.

### Praxisprüfung der Darstellung

27 zentrale neue PNG-Aufnahmen aus dem abschließenden Lauf liegen im Belegordner. Repräsentative Vergleichs-, Karten-, Entscheidungs- und Abschlussansichten wurden visuell betrachtet. Die iPad-Hochformatprüfung hat eine unnötige Suchstrecke erkannt; der Zahlen-/Symbolvergleich wurde deshalb direkt zu den Antwortfeldern verschoben. Bei der tatsächlichen Antwortauswahl liegen die relevanten Bereiche nun zusammen:

| Simulation | Personen-/Platzvergleich (Ober-/Unterkante) | Letzte Antwort, Unterkante | Sichtbereich |
| ---------- | ------------------------------------------- | -------------------------- | ------------ |
| iPad hoch  | 218,84–428,81 px                            | 601,81 px                  | 1024 px      |
| iPad quer  | 59,48–315,86 px                             | 497,45 px                  | 768 px       |

Kein horizontaler Überlauf in diesen Prüfungen; Auswahlflächen mindestens 44 px. Beim Maßnahmenvergleich stehen aktuelle Personen, Plätze und Fußwegzeit zusätzlich unmittelbar bei den Antworten. Beim Begründen sind die Wirkungszahlen direkt neben dem Vorschlag verfügbar; ein Rücksprung zur Karte ist dafür nicht nötig. Vertikales Scrollen bleibt bei längeren Hilfen und Zielkonflikten möglich. Gemessene Sichtbarkeit beweist keine geringe Suchlast oder Verständlichkeit für ein bestimmtes Kind.

Relevante Ansichten: `*-current-comparison.png`, `*-bus.png`, `*-path.png`, `*-decision-*.png`, `*-end-*.png`, `*-conflict-*.png`, `*-automatic-help.png`. Die gleichnamigen JSON-Dateien enthalten Messwerte.

### Entwicklungsbefunde transparent gehalten

Der erste Episode-2-Entwicklungslauf ergab 6/17 bestanden. Drei Anwendungsbefunde wurden behoben: fehlendes Favicon, eine atomare Bildrolle mit fokussierbaren Kartenkindern und ein durch Textfeld-Blur verschluckter Hilfeklick. Außerdem wurde eine falsche Testannahme korrigiert: `readSession` bereinigt im Arbeitsspeicher; erst eine folgende normale Interaktion schreibt den bereinigten Stand. Dieser Anfangslauf ist `browser-development-before.txt`, kein Abnahmenachweis.

Nach den Korrekturen bestanden die damaligen 17 Fälle. Anschließend zeigte die zusätzliche Sichtbereichsprüfung zwei Hochformatprobleme (16/18 bestanden, `browser-layout-before.txt`); beide gezielten Nachläufe bestanden nach der Umstellung. Der abschließende vollständige Stand besteht mit 100/100. Frühere fehlgeschlagene Läufe werden nicht als fachlich bestandene Tests ausgegeben. Temporäre Trace-/Buildordner sind nicht Teil des Prüfpakets; die Rohprotokolle nennen teils ihre damaligen Pfade.

## Didaktische Entscheidungen und Annahmen – sieben Abnahmefragen

1. **Muss der Zusammenhang zwischen Zuzug, Nachfrage und Angebot verstanden werden?** Die Veränderung 16 + 8 → 24 wird als konkrete Busnachfrage sichtbar, anschließend mit 20 Plätzen verknüpft. Die acht kommen aus dem neuen Wohnbereich, nicht aus einer ungenannten allgemeinen Wachstumsrate. Der Abschluss prüft einen angeleiteten Vergleich; eine freie Erklärung des Zusammenhangs oder tatsächliches Verständnis wird damit nicht nachgewiesen.
2. **Wird Kapazität von Erreichbarkeit unterschieden?** Zwei getrennte Größen ändern sich sichtbar und müssen für beide Maßnahmen getrennt verglichen werden. Mehr Fahrten erzeugen Plätze; der Fußweg bleibt lang. Ein kurzer Weg erzeugt keine Plätze. Die Karte und die unveränderte Größe schaffen einen fachlichen Gegensatz. Die Begriffe werden am konkreten Fall erklärt.
3. **Können Lernende mit hohem Unterstützungsbedarf abschließen?** Die vorhandenen dreistufigen Hilfen und ausdrückliche Übernahme wurden bis zum Abschluss bedient, auch bei blockiertem Speicher. Kurze Auswahlbausteine ersetzen verpflichtende längere Texte. Dass dies in der tatsächlichen Lerngruppe genügt, bleibt eine zu prüfende Annahme.
4. **Sinnvolle Entscheidung oder nur formale Kombination?** Das Produkt enthält eine Maßnahme, ein Ziel, einen passenden Vorteil und einen verbleibenden Nachteil; Zielkonflikte benötigen konkrete Gewichtung oder Zieländerung. Das ist logisch nachvollziehbar. Dennoch kann eine passende Zuordnung ohne selbstständiges Urteil entstehen. Das Spiel behauptet keine vollständige eigenständige Urteilskompetenz und keinen Lernzuwachs aus Klickerfolg.
5. **Sprache für die heterogene Klasse 7 plausibel verständlich?** Kurze Aufträge, getrennte Mengen-/Wirkungsvergleiche, konkrete Zahlen am Auswahlort und höchstens zwei neu erklärte Begriffe pro Schritt entlasten. Zuzug/Nachfrage und Infrastruktur/Erreichbarkeit werden nicht ersatzlos vermieden. Diese Gestaltung ist fachlich begründet (FA S. 9/15; Leitfaden S. 20/62), aber ohne Beobachtung sehr schwacher Leser kein empirischer Verständlichkeitsnachweis.
6. **Bleiben beide Maßnahmen begründbar?** Beide sind im Modell legitim und in vollständigen Durchläufen abgeschlossen. Wer einen Zielkonflikt bewusst anders gewichtet, benennt die bevorzugte Folge und den akzeptierten Nachteil. Die Kapazitätslösung wird nicht moralisch höher bewertet. Es gibt keine Punkte.
7. **Sind die Modellgrenzen transparent?** Die Oberfläche nennt erfundene Modellwerte und die begrenzte Stunde. Weitere Annahmen sind aufklappbar. Zuzug ist nicht Geburtenüberschuss und Bevölkerungsentwicklung nicht pauschal negativ; mögliche neue Ideen/Begegnungen/Geschäfte werden ebenfalls angesprochen. Fehlende Fahrplan-, Kosten- und Umweltdaten werden nicht erfunden. Der Fall deckt keine vollständige Afrika-Einheit ab.

Curriculare Zuordnung, verbindlicher Afrikaschwerpunkt versus ergänzend angebahnte Kompetenzen, schulinternes Jahrgang-7-Thema und Entwurfsstatus: [curriculum.md](curriculum.md). Tatsächlich verfügbare Originale und Textauszüge sind nachgewiesen. Kein schulischer Referenztext wurde verändert. Diese Dokumentation ist ein Entwicklungsbericht, keine Unterrichtsbegleitmaterialsammlung.

## Verbleibende Grenzen und Übergabe

- **WebKit in dieser Cloud offen.** Playwright erwartet `webkit-2370/pw_run.sh`, die Datei fehlt. Die aktive Cloud-Konfiguration enthält die benötigten offiziellen Download-Domains weiterhin nicht; der früher gespeicherte Entwurf wurde nicht aktiviert. Die frühere Download-Sperre wurde nicht umgangen. Der alte unabhängige WebKit-Lauf auf `8eb0d8b…` bestätigt diesen neuen Stand nicht. Das WebKit-Projekt bleibt für Phase 2B, Gate A und Episode 2 konfiguriert.
- **macOS offen.** Der native Auswahlfeldhelfer der alten Episode bleibt unverändert mit echter Wertprüfung. Die zwei früher auf dem Prüf-Mac leeren Auswahlwerte sind hier nicht behoben oder verifiziert. Programmatische Auswahl zählt nicht als Tastaturnachweis. Die neuen nativen Tastaturfälle sind unter Linux-Chromium geprüft.
- **Keine Prüfung auf physischem iPad/Safari, mit Screenreader oder in der tatsächlichen Klasse.** Automatische axe-Prüfung und Bildschirmmessungen ersetzen das nicht. Keine unabhängige aktuelle Abnahme, keine behauptete Lernwirksamkeit.

**Internes Gate B im verfügbaren Logik-/Chromiumumfang bestanden.** Abschnitt A blieb wirksam; die zweite Episode ist vollständig spielbar und separat erreichbar. Danach endet die Entwicklung. Die genannten Umgebungsgrenzen bleiben für die unabhängige Gegenprüfung offen.

Das außerhalb des Repositories erstellte vollständige ZIP-Prüfpaket enthält den versionierten Quellstand einschließlich Lockfile, Tests, Dokumentation, Testprotokollen und relevanten Aufnahmen, außerdem Git-Bundle, Bestandsdatei und Dateihashes. Es enthält keine Zugangsdaten, `.env`-Dateien, Abhängigkeitsordner oder Build-/Trace-Zwischenverzeichnisse. Paketprüfsumme, Commit-ID und verifizierte Wiederherstellung werden bei der Übergabe genannt. Der Branch wird nicht ohne die im Nutzerauftrag ausdrücklich verlangte gesonderte Freigabe übertragen. Der bekannte Cloud-Downloadfehler wird nicht als behoben ausgegeben; ein später ausdrücklich genehmigter GitHub-Download ist ein separat zu prüfendes Quellcode-ZIP.
