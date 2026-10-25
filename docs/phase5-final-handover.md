# Phase 5 – Korrektur und SCORM-Vorbereitung

Ausgangsstand exakt `02aae52052736aff53cdf8b096f0a4bd2614f775`, sauber auf `feat/phase5-geographie-und-didaktik`; keine Abweichung. Neuer lokaler Branch: `feat/phase5-final-scorm-readiness`. Vollständiger Korrekturcommit im Chat und in der Bestandsdatei des Prüfpakets. Kein Push, Merge oder Pages-Deployment.

## Zwei gezielte Korrekturen

**F2:** `persistState()` in `src/main.ts` verwendet weiterhin ausschließlich `saveSession()` aus der vorhandenen Speicherverwaltung. Ein Speicherfehler zeigt eine kurze, neutrale, im Viewport verbleibende Statusmeldung. Sie steht außerhalb des bei Antworten neu gerenderten Bereichs, wird nicht als Toast vervielfacht und erhält denselben Text nur einmal. `role=status`, `aria-live=polite` und `aria-atomic=true` kennzeichnen sie technisch für assistive Ausgabe. Fachliche Rückmeldung, Fehlerzähler und Unterstützung bleiben unverändert. Eine wieder erfolgreiche Speicherung entfernt die Warnung, auch beim Tippen. Gültige alte Speicherinhalte werden nicht gelöscht; bei Ausfall bleibt der aktuelle Zustand im Arbeitsspeicher bedienbar.

**F3:** Fokus bleibt erhalten; bei tatsächlichen Aufgabenwechseln wird das Ziel nach dem Rendern ausdrücklich per `requestAnimationFrame`/`scrollIntoView` sichtbar gemacht. Bei Wiederaufnahme einer Straßenereignis-Aufgabe geschieht dasselbe. Andere Episoden behalten beim Neuladen ihre bisherige Scroll-Wiederherstellung, insbesondere die Sicht auf eine bereits angezeigte Rückmeldung. Auswahlhandlungen und Neustartbestätigung lösen diesen zusätzlichen Sprung nicht aus. Titel und Vergleichstabelle werden anhand ihrer Bounding-Boxes im Viewport geprüft; ein vorhandenes DOM-Element oder Fokus allein genügt dem Test nicht.

**F1:** Laut neuer Gerätevorgabe kein Blocker. Keine gesonderte Hochformatoptimierung. Primär Desktop und 1024 × 768 quer. Ein lokaler 640 × 650 Inhaltsframe dient ausschließlich als kompakter responsiver Test, nicht als neue Hochformatoberfläche.

## Tatsächliche Prüfungen und Grenzen

- Alle vorhandenen Logiktests erneut ausgeführt: **159/159 bestanden**. Produktionsbuild erfolgreich.
- Gezielt: blockiertes und funktionierendes `setItem`, grüne Rückmeldungen, echte sichtbare Warnung, Hilfe/Übernahme, Wiederladen, alte Episodendaten und später wieder erfolgreicher Speicherzugriff. Keine Fehlversuche durch Speicherausfall. Axe in den getesteten Speicherzuständen ohne gefundene Verletzung der sechs vorhandenen A-/AA-Tags. Kein vollständiger Screenreader-Nachweis behauptet.
- Navigation: Direkt/Nord/Süd, normale Chromium-Darstellung und Touch mit tatsächlichen Taps, Vorher/Jetzt, Folgenvergleich samt Erklärung, Zurück und Reload. Titel, gesamte Tabelle und erster Bearbeitungsschritt liegen im sichtbaren Bereich. Bei Auswahl bleibt die Scrollposition erhalten. Koordinatenprotokolle und ein Viewport-Screenshot liegen bei.
- Statischer Produktionsbuild lokal unter `/Afrika-2040/`; zusätzliche **LMS-Simulation** im schmalen Frame, ohne notwendige externe Requests. Keine echte itslearning-Integration.
- Aus tatsächlich durchgespielten Musterfällen gemessene Zustandsgrößen, kurze und 1.500 Zeichen lange synthetische Freitexte: siehe `scorm-readiness.md` und `state-sizes.json`.
- Vollständiger abschließender Chromium-Lauf: **205/205 bestanden**, vier Worker, keine übersprungenen Fälle oder automatischen Wiederholungen. Details in `browser.txt` und `results.json` des Prüfpakets. WebKit-Startprobe scheitert an fehlender Engine; `webkit.txt` dokumentiert dies. WebKit-Fälle sind registriert, aber **F3 ist hier nicht unter WebKit oder echtem iPad/Safari verifiziert**. Diese Gegenprüfung bleibt offen, auch wenn der konkrete Scroll-Ansatz browserübergreifend begründet ist.

Der erste vollständige Lauf bestand 204 von 205 Fällen. Er zeigte eine echte Regression bei der Wiederaufnahme der Ghana-Rückmeldung im Querformat: der neue Startscroll war zu weit gefasst. Die Wiederaufnahme wurde deshalb auf die Straßenereignis-Ansichten begrenzt; die unveränderte Sichtbarkeitsprüfung bestand danach in allen drei Bildschirmformaten. Der gezielte Endlauf bestand 14/14 Fälle (Ghana-Matrix und elf neue Akzeptanzfälle). Die ersten und abschließenden Gesamtläufe bleiben getrennt dokumentiert.

Die ersten gezielten Testentwürfe enthielten einen unvollständig gewichteten Kenia-Vorschlag und erwarteten nach abgeschlossenem Vergleich noch Eingaberadios. Die Tests wurden auf passende Ziele und die tatsächlich gespeicherte Tabellenansicht präzisiert, ohne fachliche Sollwerte abzusenken. Die komplette alte Regression bleibt erhalten; kein Test wurde gelöscht oder übersprungen.

## Unveränderte Fachlichkeit und didaktische Reichweite

`src/model.ts`, `src/content.ts`, sämtliche regionalen Modell- und Bewertungsfunktionen, Straßenereignis, Nachfrage/Kapazität, Cocoa-/Investitionsrechnung, 120-GE-Verteilung, Tank-/Flächenwerte und geographische Daten sind unverändert. Auch `src/state.ts`, `src/storage.ts`, die Produkttexte und die gemeinsame Feedbacklogik bleiben unverändert. Die Prüfungen behalten die vorhandenen festen Zahlen-/Volltextorakel bei.

Die curricularen Bezüge und Reduktionen aus `curriculum.md` gelten weiter. Die drei Original-PDFs wurden nicht verändert; Original-Hashes sind erneut verglichen. Die neuen Änderungen unterstützen Wahrnehmung und Orientierung im Lernprozess; sie fügen keine fachliche Scheinbewertung hinzu. Bausteinabschluss und Beispielübernahme beweisen weiterhin keine selbstständige Urteilskompetenz oder Lernwirksamkeit. Kein Unterrichtsversuch durchgeführt.

## SCORM und Übergabe

`docs/scorm-readiness.md` beantwortet die zwölf Bereitschaftsfragen, trennt Nachweise von Konzepten und benennt die noch fehlenden Manifest-/API-/Resume-Bausteine. Kein `imsmanifest.xml`, produktiver Export, LMS-Adapter, Tracking oder Datenversand wurde eingebaut. GitHub Pages bleibt das bisherige Zielmodell. Datenflüsse und schulische Lizenz-/Administrations-/Datenschutzfragen bleiben vor echter LMS-Nutzung zu klären.

Das externe ZIP enthält lesbaren Quellcode, Lockfile, Tests und Textdokumentation, den vollständigen Git-Bundle einschließlich historischer Belege, aktuelle Protokolle, Zustandsgrößen und vier relevante Bilder. Alte Bilder werden im losen Quellordner nicht verdoppelt. Ein frischer Bundle-Clone, Bytevergleich aller versionierten Dateien und Logiktest sichern die Wiederherstellung. Keine `.env`-Dateien, Zugangsdaten, Abhängigkeitsordner oder Build-Zwischendateien werden beigefügt. Der tatsächliche Cloud-Download im Client ist hier nicht unabhängig bestätigbar; kein weiterer öffentlicher Transfer ist freigegeben.

Nach Korrekturcommit und Prüfpaket endet die Entwicklung. Unabhängige Abnahme durch ChatGPT/Work bleibt erforderlich.
