# Gate 2 – gezielte Korrektur und Übergabe

Basis: `3c8b51bb459f985922c4d3cfa26d63df6ad889be`, Branch `feat/afrika-vier-lernwege`. Zu Beginn entsprachen HEAD und sauberer Arbeitsbaum dieser Basis. Der Endcommit steht vollständig in der Übergabe und im `BESTAND.json` des Prüfpakets; `git rev-parse HEAD` im wiederhergestellten Bundle liefert dieselbe SHA. Dieser Bericht gehört zum Korrekturcommit. Keine Arbeit an Gates 3–5, kein Push, Merge oder Deployment.

## Tatsächliche Änderungen

- **P2-01:** Ein gemeinsamer Antwortpfad behandelt tatsächliche Änderungen aus eigenen Eingaben und Beispielübernahmen. Zulässige offene Entscheidungen (`either`) werden erhalten und passend zu ihrer eigenen Wahl erklärt. Eine noch fehlende Wahl wird als mögliches Beispiel ausdrücklich angekündigt. Angezeigtes Beispiel, tatsächliche Übernahme und frühere Eigenleistung bleiben getrennt. Das erneute Übernehmen einer schon gültigen Auswahl schreibt ihre alte Abgabe nicht um.
- **Abhängigkeiten:** Planwechsel setzen aktuelle Belege, Grenzen und verbundene Urteile auf Entwurf; Ziel-/Gewichtungswechsel die zugehörigen Urteile. Texte und historische Abgaben bleiben erhalten. Neue Abgaben tragen Plan- und Zielkontext. „Weiter“ und die Revisionsnavigation prüfen aktuelle Voraussetzungen; ein veraltetes Abschlussflag genügt nicht. Altstände ohne nötigen Zielbezug behalten ihre Geschichte und brauchen eine neue aktuelle Abgabe. Eigene Texte und mündliche Selbstmeldungen behalten ihren ausdrücklich ungeprüften Weiterweg.
- **P2-02:** MSA behält die fünf Wirtschaftsaufgaben. AHR erhält zusätzlich `economy.source-claim.v1`, Version 1, mit eigenständiger Prüfung einer konkreten Behauptung anhand von Stromstatistik und GEPA-Eigenbericht. Ort, Zeit, Einheit und tatsächliche Variablen bleiben sichtbar. Die Aufgabe verlangt einen kurzen eigenen Text; danach sind vier spezifische Kriterien zur Selbstkontrolle verfügbar. Keine automatische Fachbewertung. Alte Fünferstände erledigen die neue sechste Aufgabe nicht.
- **P2-03:** Förder/ESA sehen die vollständige Behauptung über Stromzugang und Einkommen. Primärmaterial: 85,1 % (2022) und 89,5 % (2023), ohne erforderliche BIP-Auswertung. ESA behält sichtbare Hilfe 1. Vollständiges Material bleibt freiwillig zugänglich. In den komplexeren Fassungen wird ausdrücklich unterschieden: Die positive BIP-Wachstumsrate fällt von 3,8 auf 3,1 %, das preisbereinigte BIP wächst weiter. Keine Reihe belegt höhere Einkommen für alle.
- **P3-01:** Vollständige Wörterhilfe aus vorhandenen und neuen Themenwörtern zusammengeführt und normalisiert entdoppelt. Kleine aktuelle Wortauswahl bleibt zuerst sichtbar; vollständige Liste wird freiwillig geöffnet.

Bestehende Antwort-IDs bleiben erhalten; nur die zusätzliche AHR-Anforderung hat eine neue ID. Der maschinenlesbare Aufgabenvertrag `learning-task-contracts.json` ist aus den tatsächlichen Aufgaben einschließlich beider Planbezüge neu erzeugt. Speicherkontext und Altstände sind in `afrika-progress-migration.md` beschrieben.

## Reproduzierte Vorher-Nachher-Fälle

Die exakte Basis wurde außerhalb des Arbeitsrepositorys gebaut. Mit den tatsächlichen alten und neuen Reducern und festen unabhängigen Antworten wurde in allen vier Profilen eine abgeschlossene Dächer/Kisten-Entscheidung aufgebaut. Drei Hilfestufen, Beispielübernahme und anschließender Weiterweg wurden zusätzlich in beiden Browsern am echten Produktionsbuild bei 1024 × 768 mit Touch bedient.

**Vorher:** Plan wird Kühlraum; gespeicherter Beleg bleibt Dächer/Kisten. Rote aktuelle Rückmeldung steht neben gespeichertem `submitted/correct`; „Weiter“ ist dennoch vorhanden und führt weiter.

**Nachher:** Plan bleibt Dächer/Kisten, Beleg und historische Abgaben passen weiterhin; keine neue Beispielnutzung oder neue Eigenleistungsabgabe. Bei einem echten Wechsel in beiden Richtungen sind die aktuellen abhängigen Antworten Entwürfe und „Weiter“ bleibt gesperrt, bis der aktuelle Zusammenhang bearbeitet wurde. Frühere Belege behalten ihre damaligen Beschriftungen, Unterstützung und Planbezüge, auch nach Reload und im Journal.

Das Paket enthält getrennte Reducer- und Browserprotokolle sowie Vorher-/Nachherbilder. Diese gezielten Startstände sind keine vollständigen Unterrichtsbeobachtungen; die vollständigen regulären und unterstützten Wege werden zusätzlich separat durchlaufen.

## Tatsächliche Prüfungen

| Prüfung                                                                                     | Tatsächliches Ergebnis                                                                |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `npm test`                                                                                  | **300/300 bestanden**, darunter unverändert alle 274 bisherigen Fälle; 0 übersprungen |
| Umfassender Lauf `playwright.afrika.config.ts` vor letzter Hilfetextpräzisierung            | **332/332 bestanden**, je 166 Chromium/WebKit, 0 Fehler/Flakes/übersprungen           |
| Abschließender Lauf nach letzter Änderung: `gate2-correction`, `topics-gate2`, `four-paths` | **160/160 bestanden**, je 80 Chromium/WebKit, 0 Fehler/Flakes/übersprungen            |
| `npm run build`                                                                             | TypeScript und Vite erfolgreich                                                       |
| `node scripts/check-dist.mjs`                                                               | Genau fünf erlaubte Produktionsdateien; Hashprüfung der beiden Fotos bestanden        |
| Prettier für alle geänderten Dateien / `git diff --check`                                   | Bestanden                                                                             |

Der Abschlusslauf enthält 52 gezielte Korrekturfälle, 68 neue Themenfälle und 40 bisherige Pilot-/Speicher-/Bedienfälle. Darin sind alle 20 Themen-/Profilkombinationen mindestens regulär und unterstützt in beiden Engines enthalten: **80 vollständige Themen-Durchläufe**, zusätzlich 16 frühe Kenia-Durchläufe. Zehn abschließende Revisions-/Übernahmefälle ergänzen den umfassenden Vorlauf; insgesamt wurden damit 342 verschiedene Browserfälle erfolgreich ausgeführt. Wiederholungen werden dabei nicht doppelt als verschiedene Fälle gezählt. Der umfassende Vorlauf lief vor der letzten Präzisierung des Hilfetexts für eine fehlende Wahl und der Kürzung des AHR-Primärmaterials; sämtliche betroffenen Wege wurden danach im Abschlusslauf erneut geprüft.

Vollständige Themenwege: regulär 1366 × 900 mit Tastatur/Enter, unterstützt mit Touch bei 1024 × 768. Zusätzliche Maus-, Fokus-, schmale Inhaltsfenster-/Frame-, Speicherwarnungs- und Profilwechselfälle sind im umfassenden Lauf enthalten. Ausgewählte Aufgaben-/Journalzustände werden mit Axe und den relevanten WCAG-A/AA-Tags einschließlich `wcag21a` und `wcag22a` geprüft. Keine gefundenen Verstöße in diesen Scans. System-Chromium 154.0.8037.57 und WebKit 27.2 unter Linux, Playwright 1.64.1, Node 24.19.0. WebKit wurde über `WEBKIT_PATH=/workspace/.cache/afrika-webkit-deps/run-webkit` gestartet. Die tatsächlich verwendeten Befehle, JSON-/Textprotokolle und Bildschirmaufnahmen liegen im Prüfpaket.

Die unveränderten bisherigen 274 Logikfälle bleiben enthalten. Kein bestehender Test wurde gelöscht, übersprungen oder in seinen Erwartungen abgeschwächt. `tests/topic-oracles.ts` ergänzt nur eine unabhängig formulierte Antwort für die neue Aufgabe. Reguläre Browserwege benutzen feste Sollantworten; unterstützte Wege prüfen ausdrücklich die Hilfeübernahme. Neue Matrixfälle prüfen sichtbare Rückmeldung, Farben, aktuellen Speicherstatus und historischen Kontext gemeinsam. Dazu gehören alle vier Profile, beide Pläne, beide Ziele, Plan-/Ziel-/Gewichtungswechsel, neutrale Erstwahl, Revision, Rücksprung, Neubearbeitung, Reload, Journal und unterstützter Weiterweg.

Die Browserkonfiguration schützt daneben die vorhandenen Kenia-, Ghana- und Marokko-Episoden mit ihren bestehenden Tests. Gemeinsame Rechenmodelle, reale Daten, Feedbackregeln, Karte, Lockfile, Artefaktprüfer und beide Fotos wurden gegen die Basis bytegenau verglichen. Schutzprotokoll und Produktionsartefaktliste sind im Paket enthalten. Der Build umfasst genau HTML, ein JS-/CSS-Bundle und zwei freigegebene Fotos; keine schulischen Original-PDFs, privaten Dateien oder Abhängigkeiten.

### Entwicklungskontrolle

Die frühen Entwicklungsprotokolle sind im Paket enthalten. Ein zunächst unvollständiger Zusatztestlauf zeigte, dass für die neue Weiter-Prüfung der aktuelle Plan-/Zielkontext auch am aufgelösten Aufgabenvertrag bereitstehen muss. Dies ist korrigiert; die danach vollständigen Logik- und Browserläufe sind die maßgeblichen Nachweise. Unvollständige Zwischenläufe werden nicht als bestanden gezählt.

### Gemessene Zustandsgrößen

Reale Reducer-Wege: je eine Abgabe pro Aufgabe, jede vierte Aufgabe unterstützt. 20 Themenwege plus vier frühe Kenia-Vergleiche; keine vollständigen sechs differenzierten Episodenprodukte. Lange Texte sind synthetische Entwürfe bis 2.000 Zeichen. Alle fünf Messstände lassen sich inhaltlich unverändert wiederherstellen.

| Bearbeitung                            | UTF-16-Einheiten | UTF-8-Bytes |
| -------------------------------------- | ---------------: | ----------: |
| Ein Profil, sechs vorhandene Bereiche  |           31.824 |      31.834 |
| Zwei Profile                           |           67.581 |      67.609 |
| Drei Profile                           |           95.370 |      95.446 |
| Alle 24 vorhandenen Wege               |          127.392 |     127.568 |
| Zusätzlich lange aktuelle Textentwürfe |          157.041 |     157.165 |

Bereits zwei Profile überschreiten das frühere 64.000-Zeichen-Budget. Kein fertiges SCORM-Wiederaufnahmeformat, keine garantierte Maximalgröße für längere Historien. Ein späterer Codec müsste Rohantworten, Identitäten, Positionen, Kontext und Hilfeherkunft erhalten; rekonstruierbare Vertrags- und Bausteintexte müssen nicht mehrfach transportiert werden. Keine SCORM-API, LMS-Datenübermittlung oder Benutzerverwaltung implementiert.

## Fachliche und didaktische Grenzen

Die Quellenkritik verlangt eine tatsächliche neue Schlussfolgerung: Eine landesweite Zugangsreihe und ein Schulungseigenbericht weisen keine Einkommenswirkung für konkrete Teilnehmerinnen nach. Die normale Aufgabe nennt die zu prüfende Behauptung und die Quellen; erst freiwillige Hilfe und spätere Kriterien erklären den fehlenden Nachweis. Freier Text bleibt fachlich ungeprüft, auch bei beliebigem oder unklarem Inhalt. Eine Lehrkraft- oder Partnerkontrolle ist eine eigenständige Handlung außerhalb der automatischen Bewertung.

Die vereinfachte Auswahlaufgabe fordert weiterhin die Unterscheidung einer gemessenen Größe von einer unbewiesenen Verallgemeinerung. Sie ist kein Nachweis selbstständiger Urteilskompetenz. Keine neue Datenerhebung, Quellenaktualisierung oder empirische Verständlichkeits-/Lernwirksamkeitsstudie. Historische Quellen bleiben datiert; erfundene Modellwerte und GE sind keine realen Einkommensdaten.

Browserprüfung auf Linux mit Chromium und WebKit, emuliertem Touch und Viewports; kein physisches iPad, kein Safari-/macOS-Hardwaretest oder vollständiger Screenreader-Test. Bekannte plattformspezifische native Tastaturauswahlfragen sind damit nicht allgemein widerlegt. Axe-Scans ausgewählter Zustände sind keine vollständige WCAG-Abnahme. Keine Hochformatoptimierung beauftragt. Bei 1024 × 768 brechen lange Angebotsnamen in der vorhandenen schmalen Vergleichstabelle teils innerhalb eines Wortes um; die vollständigen Namen stehen zusätzlich im Materialtext und in der Auswahl. Diese beobachtete Lesbarkeitsgrenze ist dokumentiert, keine neue Hochformat-/Tabellenüberarbeitung vorgenommen.

**Entwicklungsstopp:** 20 Themenvarianten, vier frühe Kenia-Teilwege und 28 geplante Varianten bleiben der tatsächliche Katalogstand. Paket B insgesamt und eine 52-Varianten-Gesamtabnahme sind nicht abgeschlossen. Die vier frühen Kenia-Vergleiche sind keine vollständig differenzierten Episoden. Gates 3–5, Unterrichtstest und unabhängige Abnahme bleiben ausstehend. Keine Klassenarbeit, Arbeitsblätter, Handreichung oder weitere Spielmechaniken entwickelt.
