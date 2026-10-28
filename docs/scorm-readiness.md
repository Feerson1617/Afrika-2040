# SCORM-Bereitschaft – technische Prüfung, kein SCORM-Paket

Historische Referenz dieses Konzepts: 02aae52052736aff53cdf8b096f0a4bd2614f775; damalige Korrektur: `feat/phase5-final-scorm-readiness`. Der damalige Auftrag liegt wortgetreu in `phase5-final-request.md`.

## Aktualisierung vom 27.10.2026

Der aktuelle Branch `feat/afrika-vollstaendig-klasse7` enthält zusätzlich fünf Untersuchungsbereiche. Die [Sprach- und Zahlenkorrektur](afrika-sprachkorrektur.md) ändert keine Speicher- oder LMS-Schnittstelle. Der Produktionsbuild hat jetzt **genau fünf lokale Dateien: HTML, JavaScript, CSS und zwei JPEGs**. Die Allowlist prüft beide konkreten Bildnamen und ihre unveränderten SHA-256-Werte. `base: './'`, Navigation ohne Server-Routen und Betrieb ohne externe Laufzeitdienste bleiben erhalten.

Die Browserregression führt den vorhandenen Test im gleichursprünglichen 640 × 650-Inhaltsframe erneut in Chromium und WebKit aus. Zusätzlich durchlaufen alle fünf Themen den Repository-Prefix und ein 720 Pixel breites Fenster. Das belegt lokale Portabilität, keinen Import in ein echtes LMS. Es gibt weiterhin kein SCORM-Manifest, keinen Adapter und keine Abschluss-/Notenübertragung. Die unten stehende Zustandsgrößentabelle dokumentiert ausschließlich die damaligen sechs Episoden; sie ist **keine aktuelle Größenmessung aller elf Bereiche**. Vor einem Export müssen die neuen Untersuchungsdaten und freie Texte bei Schema, Umfang und Datenschutz neu berücksichtigt werden. Die Rückmeldungen „bearbeitet“ und „ohne Bewertung“ dürfen nicht in einen bestandenen Kompetenznachweis umgedeutet werden.

## Ergebnis und Nachweisgrenzen

**Grundsätzlich überführbar, noch nicht SCORM-fähig ausgeliefert.** Der Vite-Produktionsbuild besteht aus `index.html`, lokalen JS-/CSS-Dateien und inzwischen den zwei oben genannten Fotos. Seine Ressourcenpfade beginnen mit `./`; Karten und Illustrationen sind lokal im JavaScript enthalten. Das Favicon ist eine Data-URL. Es gibt keinen notwendigen externen Laufzeitdienst, Login, Pop-up oder GitHub-API-Aufruf. Externe Quellenlinks sind freiwillige Zusatzinformationen. Keine Lernnavigation hängt von diesen Links ab.

**Getestet:** Produktionsbuild; statische Auslieferung unter `/Afrika-2040/`; lokale **LMS-Simulation** mit einem 640 × 650 CSS-Pixel großen Inhaltsframe, Skripten und gleichem Ursprung. Orientierung, Rückblick und Episodeneinstieg funktionieren, ohne horizontales Überlaufen oder externe Laufzeitrequests. Blockierte Speicherung ist separat tatsächlich durch einen SecurityError getestet. Das ist kein itslearning-Import und kein Beweis für beliebige Frame-/CSP-/Cookie-Konfigurationen. Primäre Schulansicht bleibt iPad quer 1024 × 768; F1 im Hochformat ist laut Auftrag kein Blocker. Keine neue Hochformatoberfläche.

**Codeanalyse:** Keine Abhängigkeit von `window.parent`, Top-Navigation oder einer GitHub-Pages-Domain. `vite.config.ts` behält `base: './'`. Interne Navigation benutzt den zentralen Zustand statt Server-Routen. Die Quellenlinks öffnen optional einen neuen Tab; ein LMS darf dies blockieren, ohne den Lernweg zu sperren.

**Erst später prüfbar:** Manifestvalidierung, SCORM-Laufzeit, API-Suche über Eltern-/Openerfenster, Abschluss- und Wiederaufnahmemeldungen, Fehlercodes und Commit/Terminate-Verhalten. **Nur in der realen Schulinstallation prüfbar:** aktiviertes Add-on, freigegebene SCORM-Version, Player-/Browserregeln, Benutzerzuordnung, Reports, Datenaufbewahrung und Administration. Die Angaben des Auftrags zu itslearning (SCORM 1.2/2004 3rd Edition, Rustici-Player seit August 2026) sind Planungsannahmen aus dem Nutzerauftrag, hier nicht unabhängig online verifiziert.

## Spätere Ergänzungen und Anschlussstelle

GitHub Pages liefert heute statische Dateien. Ein späterer Export müsste dieselben Build-Dateien in ein SCORM-ZIP mit `imsmanifest.xml` **in der Paketwurzel**, Ressourcenliste, SCO-Einstieg und Metadaten legen. Ein vorgeschlagener separater Export-Schritt könnte `scripts/export-scorm.*` heißen. Hinzu käme eine optionale Laufzeitschicht, etwa `src/lms/adapter.ts` mit getrennten Implementierungen für 1.2 und 2004. **Diese Dateien/APIs wurden nicht implementiert.**

Konkrete spätere Ergänzungen wären neben `imsmanifest.xml` und dem Export-Skript etwa `src/lms/scorm12.ts`, `src/lms/scorm2004.ts`, ein versionierter Codec `src/lms/resume-v1.ts` und zugehörige Codec-/Player-Tests. Die vorhandene `index.html` kann SCO-Einstieg bleiben; eine optionale Startschicht müsste die Laufzeit initialisieren, bevor gespeicherte Zustände übernommen werden. Auch Suspend/Resume-Einstieg und Abbruch müssen editionsgerecht behandelt werden (`cmi.core.exit`/`cmi.core.entry` bei 1.2, `cmi.exit`/`cmi.entry` bei 2004). Das sind geplante Anschlussdateien, keine bereits vorhandenen APIs.

Die bestehenden Funktionen `readSession`, `saveSession` und `clearSession` in `src/storage.ts` sowie der zentrale Zustandswechsel in `src/main.ts` bilden eine ausreichende Anschlussstelle. Das neue UI-Hilfsmittel `persistState()` wertet nur den vorhandenen booleschen Speichererfolg aus; es erfindet keine Speichertechnik. Die Lernreducer, Modelle und fachlichen Bewertungsregeln benötigen dafür keinen Umbau. Ein zukünftiger Adapter würde optional Initialisierung, Laden, versionierte Migration, Schreiben/Commit und Beenden übernehmen. Ohne Adapter bleibt das heutige lokale Spiel erhalten.

Die Same-Origin-Regel kann einen späteren API-Zugriff auf Elternfenster blockieren. Der gleichursprüngliche lokale Test beweist keine funktionsfähige API-Verbindung über verschiedene Domains; hierfür wäre der freigegebene Anschluss des tatsächlichen Players zu prüfen.

Die Standards bleiben getrennt: 1.2 nutzt `LMSInitialize`, `LMSGetValue`, `LMSSetValue`, `LMSCommit`, `LMSFinish` und etwa `cmi.core.lesson_status`. 2004 nutzt `Initialize`, `GetValue`, `SetValue`, `Commit`, `Terminate`, insbesondere getrennte `cmi.completion_status` und `cmi.success_status`. Keine undokumentierte Mischung. Fehlerauswertung, API-Lebenszyklus und wiederholte Initialisierung müssten später explizit getestet werden.

**Vorläufig bevorzugt: SCORM 2004, 3rd Edition**, falls die Schule es tatsächlich freigibt: größeres Suspend-Datenfeld und getrennte Abschluss-/Erfolgsmeldung passen besser zu differenzierten Lernwegen. 1.2 wäre eine Kompatibilitätsalternative mit stärker reduziertem Wiederaufnahmedatensatz. Eine automatische Note oder Punkteskala ist bei keiner Version vorgesehen.

## Historisch gemessene Zustandsgrößen (sechs Episoden)

Die Browserprüfung spielt tatsächlich alle sechs Episoden durch, nutzt Beispiele/Hilfen, bearbeitet Orientierung und Rückblick und ergänzt freiwillige Testtexte. Sie liest die wirklich gespeicherte JSON-Zeichenkette; keine künstlich gesetzten Abschlussflags. Messwerte und Abschlusskennzeichen: `state-sizes.json` im Prüfpaket. UTF-8-Bytes sind zusätzlich angegeben; Zeichen- und Transportgrenzen dürfen nicht verwechselt werden.

| Musterfall                        | JSON-Zeichen | UTF-8-Bytes |
| --------------------------------- | -----------: | ----------: |
| one episode                       |         2577 |        2613 |
| two episodes with help            |         4014 |        4073 |
| through episode 3                 |         5580 |        5659 |
| through episode 4                 |         7167 |        7274 |
| through episode 5                 |         8738 |        8863 |
| through episode 6                 |        10270 |       10416 |
| all six plus geography and review |        12655 |       12829 |
| all six, text length 21           |        12645 |       12817 |
| all six, text length 1500         |        14124 |       15796 |

SCORM 1.2: 4.096 Zeichen; 2004 3rd Edition: 64.000 Zeichen, als im Auftrag vorgegebene Planungsgrenzen. Schon drei abgeschlossene Episoden überschreiten 1.2 im unveränderten JSON. Der Zwei-Episoden-Fall passt nur knapp. Die gemessenen Fälle liegen unter 64.000; das ist **keine Maximalgarantie** für beliebige Freitexte, Feedbacks, Straßenereignisse oder LMS-Serialisierung. Die Testtexte sind synthetisch, keine Schülerdaten. Ein eigener ausführlicher Straßenereigniszustand ist durch die Navigationsregression geprüft, aber kein behaupteter Bestandteil aller hier gemessenen Musterstände.

`sessionStorage` ist tab-/ursprungsgebunden und kann fehlen, blockiert oder beim Schließen verworfen werden. Es ist kein dauerhaftes SCORM-Wiederaufnahmesystem. Ein realer Export müsste über den Adapter `cmi.suspend_data` laden/schreiben, erfolgreiche Speicherung bestätigen und das Verhalten im tatsächlichen Player testen. Der vollständige aktuelle JSON-Zustand darf nicht ungeprüft dorthin kopiert werden.

## Konzept für kompakte, versionierte Wiederaufnahme

Nur **Dokumentationskonzept**, keine neue Speicherimplementierung:

- Schema-Version `v`, Modell-/Inhaltsversion und aktuelle Ansicht/Episode/Lernschritt. Unbekannte Versionen verständlich ablehnen oder migrieren, niemals ungeprüft übernehmen.
- Pro Episode Abschluss-/Unbewertet-Status, aktuelle Auswahl, Ziel, konkrete Belege/Grenze/Gewichtung; untersuchte und erfolgreich geprüfte Maßnahmen, notwendige Eingaben und bei Ghana die vollständige 120-GE-Verteilung.
- Kenia zusätzlich ursprüngliche und revidierte Empfehlung getrennt, Straßenereignis-/Vergleichsstatus, Nachfrage-Ausgangslinie und Maßnahmenuntersuchungen. Kein Vermischen der Vorher-/Jetzt-Kontexte.
- Hilfe gesehen und Beispiel bewusst übernommen getrennt; aktuelle Herkunftskennzeichnung und Hilfehistorie, begrenzte Fehlversuche. „Ohne Beispielübernahme“ ist kein Beweis selbstständiger Kompetenz.
- Orientierung und Rückblick: ausgewähltes Land, Antworten, Abschluss und Unterstützung getrennt je Aufgabe.
- Große Feedbacktexte, abgeleitete Reisezeiten, HTML, SVG, Quellen und Darstellungen weglassen und aus geprüften IDs/Modellversion neu berechnen. Schema mit verständlichen kurzen Schlüsseln oder dokumentierten Enum-IDs; Grenzen anhand der tatsächlichen serialisierten Nutzlast prüfen. Keine feste Größenbehauptung für einen noch nicht implementierten Encoder.
- Keine Namen, Schülerkennungen, freien Begründungen oder längeren Texte standardmäßig in Suspend-Daten vorsehen. Ohne Freitextübertragung kann ein unbewerteter Text später nicht vollständig wiederhergestellt werden. Das muss transparent erklärt werden; eine eventuelle gesonderte schulisch geprüfte Freitextregel wäre eine neue Entscheidung, keine implizite Einwilligung.

Wiederherstellung müsste Struktur und fachliche Zusammenhänge erneut validieren, so wie der bisherige `readSession` bereits Abschlüsse prüft. Der kompakte Datensatz ist erst nach Implementierung durch Roundtrip-, Versions-, Beschädigungs-, Größen- und Datenschutztests belegbar.

## Abschlussstatus und Unterrichtsvarianten

Sinnvoll wäre nur ein optionaler Bearbeitungs-/Abschlussstatus: angefangen, bearbeitet, abgeschlossen; intern zusätzlich mit Beispielübernahme, ohne Beispielübernahme oder bewusst unbewertet. Aus dem letzten Status folgt **kein nachgewiesenes Verständnis**. Ohne gesondertes Bewertungskonzept kein `passed`, keine Punktzahl und keine Note. Abschlusskriterien (ausgewählte Episode oder alle sechs? Orientierung/Rückblick freiwillig?) müssen vor einem Export schulisch vereinbart werden und dürfen die aktuell unabhängigen Einstiege nicht stillschweigend verändern.

| Variante                | Vorteile im Unterricht                                                                         | Grenzen                                                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ein Gesamt-SCO          | Gemeinsamer Rückblick, Empfehlungen und gespeicherte Kontexte bleiben zusammen; ein Startpunkt | Größerer Suspend-Zustand; Gesamtabschluss passt schlecht zu frei gewählten Einzelstunden; ein LMS-Fortschrittswert erklärt nicht die sechs Lernwege                     |
| Getrennte Episoden-SCOs | Gezielt zuweisbar, kleinere Wiederaufnahmedaten, Abschluss pro Ressource                       | Austausch ursprünglicher/revidierter Kenia-Empfehlungen und länderübergreifender Rückblick brauchen ein neues Konzept; SCOs teilen ihre Suspend-Daten nicht automatisch |

Beide Varianten sind möglich, keine ist bereits implementiert oder abschließend festgelegt. Fachliche Lernprodukte bleiben wichtiger als ein LMS-Häkchen.

## Datenschutz, Administration und notwendige spätere Tests

**Heute:** Verarbeitung im Browser-Tab, keine Übertragung von Antworten durch die Anwendung. **Spätere Abschlussmeldung:** itslearning kann Ressourcennutzung, Zeiten und Status angemeldeten Personen zuordnen. **Spätere Wiederaufnahme:** ausgewählte Lernwegdaten würden über den LMS-Adapter übertragen. Deshalb wäre „SCORM verarbeitet keine personenbezogenen Daten“ falsch. Keine zusätzlichen Analyse- oder Bewertungsdienste wurden ergänzt.

Vor Nutzung müssen Schule/zuständige Stellen Zulässigkeit, Zweck, Datenminimierung, Zugriffsrollen, Aufbewahrung und Löschung beurteilen. Keine Schülerantworten/Freitexte an externe Bewertungsdienste; keine automatische Übernahme von Namen oder Lernendenkennungen aus einer API.

Offene Administration/Lizenzen: Add-on auf der konkreten Schulinstanz vorhanden und freigegeben? Unterstützte Edition/Player-Version, Paketgrößen, Browser/CSP-/Frame-/Storage-/Pop-up-Regeln, Kursrechte und Berichte? Natural-Earth-Lizenz und lokale Quellenangaben auch im Export erhalten; Paketdateien und Abhängigkeiten vor Weitergabe auf ihre Nutzungsrechte prüfen. Der vorhandene gemeinfreie Kartendatensatz erfordert keinen neuen Kartendienst. Kein Produkt-/Player-Lizenzvertrag wurde hier überprüft oder aktiviert.

Vor echtem Einsatz unverzichtbar: Manifest-/ZIP-Validierung; korrekte Edition und API-Erkennung; Initialisierung/Fehlercodes; tatsächliches Laden/Commit/Beenden; Abbruch/Verbindungsverlust/Neustart; Suspend-Limit inklusive Encoding; Schemawechsel und beschädigte Daten; keine Freitexte/PII im Transport; ehrliche Abschlussmeldung ohne Note; getrennte Nutzer/Versuche; Löschen/Reset; reale Schulrollen/Reports; Desktop und physisches iPad quer mit echtem Safari/WebKit, Tastatur/Touch, schmalem Frame und eingeschränktem Speicher. Ein tatsächlicher Import und die schulische Abnahme bleiben offen.

## Vier Lernwege – Paket A

Der optionale versionierte Lernwegzweig bewahrt Antworten je Profil und Teilaufgabe. Profilwechsel vervielfacht möglicherweise Entwürfe und Verlauf; das ist kein fertiges Suspend-Format. Gemessene aktuelle Musterszenarien und ein kompakter Datenvorschlag werden im Paket-A-Bericht ausgewiesen. Das portable Planungsbudget für SCORM 2004 3rd Edition bleibt 64.000 Zeichen; die älteren Größenmessungen belegen dieses Budget für den erweiterten Zustand nicht. Freitextübertragung, Identitätsschema, Größenlimit und Wiederaufnahme sind vor einer späteren Implementierung erneut zu entscheiden und praktisch zu testen. Keine API, kein Manifest und keine Übermittlung an ein LMS.

Aktuelle Messung des tatsächlich durch Reducer bearbeiteten Gate-1-Musters (keine künstlichen Abschlussflags): nach Förder 12.589 Zeichen; nach zusätzlich ESA 24.985; nach zusätzlich MSA 33.384; mit allen acht Pilotwegen 43.016. Mit längeren synthetischen aktuellen Freitexten: 52.633. Ein reines Datenkonzept ohne abgeleitete Vertragsmetadaten und alte Antwortabgaben ergibt für den Musterfall 7.799 Zeichen einschließlich der aktuellen Texte; es ist kein implementierter Wiederaufnahme-Codec und keine Übertragungsfreigabe. Diese Werte enthalten die Basisstruktur mit den neuen Pilotdaten, nicht sämtliche alten Episoden-/Themenprodukte oder die späteren 52 Varianten. Zusätzliche Lernwege, Texte und Historie können das 64.000-Zeichen-Budget überschreiten. Vollständige Integration ist erst nach Paket B tatsächlich messbar; hier keine SCORM-Kompatibilitätsbehauptung.
