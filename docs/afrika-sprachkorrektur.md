# Abschlusskorrektur: Sprache, Zahlen und interne Prüfungsplanung

27.10.2026. Ausgangspunkt war der vollständig vorhandene Commit `5785267e8eb1f2e05f687575e5db253274063b51` auf `feat/afrika-vollstaendig-klasse7` mit sauberem Arbeitsbaum. Die unabhängige Gegenprüfung und das gelieferte Sprachpaket wurden vollständig gelesen. Alle 48 Prüfsummen des Eingangspakets stimmen. Dieser Bericht beschreibt die eigene erneute Prüfung; er übernimmt fremde Testergebnisse nicht als eigene.

Der neue vollständige Korrekturcommit steht in `BESTAND.json` des Prüfpakets und in der Chat-Übergabe. Im vollständig wiederhergestellten Bundle liefert `git rev-parse HEAD` dieselbe SHA. Kein Push, Merge, Deployment oder neuer Spielbereich.

## Änderungen

- **Finale Sprachfassung übernommen:** `Sprachkorrektur.patch` ließ sich auf dem exakten Ausgangscommit unverändert anwenden. Alle sechs gepatchten Dateien entsprachen danach bytegenau den gelieferten finalen Dateien. Die Zwischenliste wurde nicht als alternative Textfassung verwendet. Patch-SHA-256: `d923ba8d15bb684c5f4861195804b61b5d7ccab5b422b7eb013b5f8ea93b7120`.
- **Wörterhilfe am Schreibort:** Begriffe stehen einzeln, die Operatoren Beschreibe/Erkläre/Begründe bleiben konkret erklärt. Die Hilfe lässt sich auch im dritten Schritt per Tastatur öffnen. Sie verändert weder Antworten noch deren Herkunftskennzeichnung.
- **Ganzzahlige Eingaben:** Ganze Zeichenfolge prüfen, Unicode-Minus normalisieren, nur vollständige Dreiergruppen zulassen und erst danach Punkte entfernen. Der Vergleich mit `BigInt` vermeidet Rundungsfehler auch bei sehr großen Eingaben; gespeicherte Antworten bleiben unveränderte Zeichenfolgen. Keine Schema- oder Modelländerung.
- **Formathinweis ohne Fehlversuch:** Uneindeutige Eingaben werden zuerst geklärt; passende andere Felder bleiben anerkannt. Tatsächlich falsche, eindeutig lesbare Zahlen behalten die bestehende differenzierte Bewertung. Nach zwei fachlichen Fehlern erscheint die Erklärung, ohne automatisch eine Antwort zu übernehmen.
- **Interne Prüfungsmatrix:** Alle fünf Themen besitzen die zehn verlangten Planungsfelder im [Blueprint](afrika-klassenarbeit-blueprint.md). Kein fertiger Leistungsnachweis. [Verbleibende Unterrichtsanforderungen](afrika-klassenarbeitsreife.md) sind ausdrücklich ausgewiesen.
- **Build-Schutz präzisiert:** Genau HTML, JS, CSS und je ein freigegebenes Asafo-/Kakum-JPEG; beide Bild-Hashes und ihre Einbindung werden geprüft. Fehlende/duplizierte/veränderte Bilder, zusätzliche Dateien und Symlinks werden abgelehnt. Im manuellen Pages-Workflow wurde ausschließlich die Testkonfiguration um die fünf Themen erweitert. Auslöser, Freigaben und ausschließlicher `dist`-Upload bleiben erhalten.

Die endgültigen Formulierungen stehen vollständig in `src/inquiry/content.ts`, `state.ts` und `ui.ts`; die Darstellung in `style.css`. Im Paket sind diese Dateien sowie der vollständige Korrekturdiff enthalten. `content.ts` und `style.css` entsprechen weiterhin exakt der gelieferten finalen Fassung. Zusätzliche Schülertexte betreffen ausschließlich die korrekten Zahlenformate und den neuen Formathinweis. Fachwerte, Antwort-IDs, Quellenlinks und die Modelle der sechs bisherigen Episoden sind unverändert.

## Tatsächlicher Vorher-/Nachher-Nachweis

Vor der Änderung wurde der ursprüngliche Produktionsbuild in Chromium geöffnet. Die drei Bevölkerungsfelder erhielten die unten genannten Eingaben; Feedback und Fehlerzähler wurden aus der wirklichen Browsersitzung gelesen. Danach wurden dieselben gültigen Schreibweisen in beiden Engines auf Desktop und simuliertem iPad geprüft. Die Formatfälle stehen zusätzlich in eigenen Browser- und Logiktests.

| Eingabe: natürliche Änderung / Wanderung / Endbestand | Vorher              | Nachher                                     |
| ----------------------------------------------------- | ------------------- | ------------------------------------------- |
| `30` / `-10` / `1020`                                 | richtig, 0 Fehler   | richtig, 0 Fehler                           |
| `30` / `−10` / `1020`                                 | teilweise, 1 Fehler | richtig, 0 Fehler                           |
| `30` / `-10` / `1.020`                                | teilweise, 1 Fehler | richtig, 0 Fehler                           |
| `30` / `-10` / `1.02`                                 | teilweise, 1 Fehler | Formathinweis mit Teilanerkennung, 0 Fehler |

Zusätzlich geprüft: äußere Leerzeichen; `1000`/`1.000`; falsche Werte; `30abc`, `1..020`, `1,020`, `10+20`, einzelne Vorzeichen, fehlerhafte Gruppen, Exponenten und weitere Mehrdeutigkeiten. Gemischte richtige/falsche/unklare Felder verbrauchen keinen fachlichen Versuch, solange das Format ungeklärt ist. Ein bereits vorhandener fachlicher Fehler bleibt dabei erhalten. Die Bevölkerungsmodelle ergeben unverändert **30, −10, 1020** und **16, −12, 804**.

## Ausgeführte Prüfungen

Umgebung: Node 24.19, Playwright 1.64.1, Chromium 154 und Playwright-WebKit 27.2 (Build 2370) unter Linux. WebKit verwendet die vorhandenen lokalen Bibliotheken über `WEBKIT_PATH=/workspace/.cache/afrika-webkit-deps/run-webkit`. Das ist ein Testumgebungsdetail, keine Anwendungsabhängigkeit.

| Prüfung                                                                                             | Tatsächliches Ergebnis                                 |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `npm test`                                                                                          | **203 bestanden**, 0 fehlgeschlagen, 0 übersprungen    |
| `npm run build`                                                                                     | TypeScript und Vite erfolgreich                        |
| `node scripts/check-dist.mjs`                                                                       | Genau 5 Dateien; beide konkreten Foto-Hashes bestätigt |
| Neue Themen und Zahlenkorrektur, `playwright.afrika.config.ts --grep 'Afrika curriculum'`           | **48 bestanden**, je 24 Chromium/WebKit                |
| Bestehende Episoden und Portabilität, gleiche Konfiguration mit `--grep-invert 'Afrika curriculum'` | **92 bestanden**, je 46 Chromium/WebKit                |

Die zusammen **140 Browserfälle** liefen ohne Wiederholungsversuch, Fehlschlag oder Überspringen. Geprüft wurden alle fünf neuen Themen, beide Nachhaltigkeitspläne mit Zielkonflikten, die sechs bisherigen Episoden, richtige/falsche/teilweise/unvollständige Antworten, drei Hilfestufen, bewusste Übernahme, Änderungen mit erneuter Prüfung, Journal, Rücksprung, Neuladen, Neustart, Speicherwarnung, Antwortpositionen und IDs. Maus, Touch-Eingaben und Tastatur wurden im Browser tatsächlich betätigt. Die neue Zahlenprüfung kontrolliert auch sichtbare Rückmeldungen/Farben und den gespeicherten Fehlerzähler.

Eine vor der Änderung im echten Ausgangsbuild erzeugte synthetische Sitzung liegt als `tests/fixtures/inquiry-5785267.json` vor. Ihre eigenen ungeprüften Texte und ein bewusst übernommenes altes Beispiel bleiben nach dem Laden erhalten. Weil sich die Formulierung der aktuellen Musterantwort geändert hat, wird das alte Muster als „Beispiel genutzt oder geändert“ ausgewiesen; es wird weder umgeschrieben noch als selbstständig oder fachlich bewertet ausgegeben.

Alle fünf Themen wurden bei **1024 × 768** mit simuliertem Touch und Desktopansicht durchlaufen. Wörterhilfe, Texte und Zahlenfeedback wurden zusätzlich anhand der Aufnahmen angesehen. Beide lokalen Fotos werden im Browser geladen und auf Bildmaße geprüft. Ein schmaler 720-Pixel-Durchlauf umfasst alle fünf Themen; der bestehende 640 × 650-Inhaltsframe-Test läuft in beiden Engines. Produktionspfade unter `/Afrika-2040/`, fehlende externe Laufzeitabhängigkeiten und relative Ressourcenpfade wurden erneut geprüft. Die [SCORM-Dokumentation](scorm-readiness.md) unterscheidet diesen lokalen Nachweis von einer noch ausstehenden LMS-Implementierung.

Die vollständige historische Browserbelegsammlung wurde nicht unnötig neu erzeugt; die konfigurierte gezielte Regression ist benannt und ihre Logs liegen bei. Die fremden Tests aus dem Eingangspaket sind zusätzliche Vorbefunde, keine eigenen aktuellen Läufe. Ein anfänglicher neuer Logiktest suchte „Schreibweise“ im Meldungstext statt in der Überschrift; die Assertion wurde präzisiert. Kein Test wurde gelöscht, übersprungen oder abgeschwächt.

## Grenzen und unabhängige Abnahme

- Die interne fachlich-didaktische Durchsicht bestätigt unveränderte Zahlen, fachliche Zuordnungen, Hilfewege und die Trennung von Modell und Wirklichkeit. Die Formulierungen sind kürzer; Verständlichkeit für eine konkrete Lerngruppe und Lernwirksamkeit wurden nicht mit Schülerinnen und Schülern gemessen.
- Eigene Texte, mündliche Selbstauskünfte und ein technischer Abschluss bleiben **ungeprüft**. Kein automatischer Kompetenz-, Noten- oder Klassenarbeitsnachweis. Unterstützte Antworten behalten ihre Kennzeichnung.
- Naturraum: Saisonkalender und regionale Jahresmittel sind keine vollständige Klimadiagrammauswertung. Diese Methode, weitere Raumbeispiele, Migration/Urbanisierung, Verteilung und eigenständiges begründetes Urteilen benötigen ergänzenden Unterricht; Einzelheiten in der Matrix.
- Keine erneute vollständige Onlineprüfung sämtlicher Originalquellen oder Rechtsgrundlagen. Deren dokumentierte Originalprüfung und die Gegenprüfung bleiben die Grundlage; keine neuen fachlichen Datensätze oder Rechtsbehauptungen wurden eingeführt. Der im Gegenbericht genannte zeitweise 403-Zugriff auf Klimaquellen wird durch lokale Werte nicht zu einer Verfügbarkeitsgarantie.
- Simulierte iPads sind keine physischen Geräte. Kein neuer macOS-Safari-Test; das bekannte plattformspezifische Problem nativer Tastaturauswahl auf einem Prüf-Mac bleibt unbestätigt. Unter Linux bestanden Chromium und WebKit.
- Die geänderten Dateien bestehen die Formatprüfung. Die globale Prüfung meldet 15 schon im Ausgangscommit unverändert vorhandene Formatabweichungen; sie wurden nicht durch sachfremde Umformatierung verdeckt.
- Pages-Workflows wurden statisch geprüft und ihre Build-/Testbefehle lokal ausgeführt, aber kein GitHub-Actions-Lauf und keine Veröffentlichung ausgelöst. SCORM, echter LMS-Import, Schuladministration und dauerhafte Wiederaufnahme sind nicht implementiert.

Der Korrekturstand ist damit für die unabhängige Nachprüfung bereitgestellt. Diese Abnahme und die Erprobung im Unterricht bleiben offen. Das Prüfpaket enthält vollständigen versionierten Quellstand im Git-Bundle, lesbaren aktuellen Quellcode, Lockfile, Tests, kompakte Protokolle und ausgewählte neue Belegbilder. Historische Belegbilder werden nur im vollständigen Bundle aufbewahrt, nicht lose nochmals kopiert. Keine Zugangsdaten, schulischen Original-PDFs, echten Schülerdaten, Abhängigkeitsordner oder Build-Zwischendateien werden beigepackt.
