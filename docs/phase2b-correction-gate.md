# Abschnitt A – Phase-2B-Korrektur und internes Gate

24. Oktober 2026. Ausgangscommit: `8eb0d8bcdaf45da27ca0a9cdab5de09a10238562`; neuer Branch: `feat/kenia-phase2b-fix-und-episode2`.

Der kombinierte Nutzerauftrag in `combined-request.md` autorisiert Abschnitt A und nach bestandenem Gate eine zweite Kenia-Episode. Der ergänzende `phase2b-correction-request.md` präzisiert die Korrektur. Seine frühere Begrenzung auf ausschließlich Phase 2B wird für den Umfang vom neuen kombinierten Auftrag abgelöst. Die unabhängige Gegenprüfung ist ein Befund, keine Abnahme unseres neuen Stands.

## Behobener Fehler

Eine vollständige erneute Begründung mit einem zahlenmäßig zutreffenden, aber zu einer anderen Linie gehörenden Vorher-Jetzt-Beleg erreicht jetzt den vorhandenen begrenzten Versuchszähler. Ein Prüfklick zählt höchstens einmal, auch wenn alte Belege ebenfalls unpassend sind. Keine zusätzliche globale Fehlerverwaltung.

Die erste Rückmeldung erkennt passende Vor-/Nachteile und die zutreffende Zeitangabe ausdrücklich an. Sie nennt die Beleglinie und die empfohlene Linie. Nach der zweiten bewertbaren Fehlzuordnung zeigt sie Leilas konkrete Vorher-/Jetzt-Zeiten für den Vorschlag. Eine vorzeitige Gesamtaussage „Ziel und Belege sind verbunden“ wird dabei vermieden. Der bestehende Hilfeweg öffnet sich auf Stufe 3. Die Auswahl bleibt unverändert; erst der ausdrückliche Klick auf „Dieses Beispiel übernehmen“ setzt die Hilfeherkunft und übernimmt die zu dieser Route und diesem Ziel passende Begründung. Selbst korrigieren ist ebenfalls möglich.

Fehlende Pflichtangaben, noch offene legitime Gewichtungen und unklare eigene Texte zählen nicht als vollständig falsche Antworten. Offene Empfehlungen bleiben neutral. Erste Empfehlung, Modellzeiten, beide Überarbeitungswege und bisherige Hilfen bleiben erhalten.

## Tatsächlich ausgeführte Prüfungen

- Vor der Korrektur neue Gegenbeispiele reproduziert (`evidence/gate-a/regression-before.txt`).
- 96/96 Logiktests bestanden, darunter alle sechs neuen Fehlzuordnungen, Einmalzählung, unvollständige Antworten, Zielkonflikte, bewusste Übernahme, Änderungen, Neuladen und alle 18 Zeiten.
- Produktionsbuild und Formatprüfung der geänderten Code-/Testdateien bestanden.
- Gesamte Chromium-Regressionsrunde: 82/82 bestanden. Enthält die bisherigen 75 Fälle und sieben neue Browserfälle.
- Nach abschließender sprachlicher Entlastung des Feedbacks: sämtliche 24 betroffenen Phase-2B-/Korrekturfälle erneut bestanden. Dabei neue Bildschirmaufnahme der automatischen Hilfe visuell geprüft. Keine nachträgliche Anwendungsänderung nach diesem Nachlauf.
- Vollständige Abläufe auf Desktop und simuliertem iPad hoch/quer, Touch, native Linux-Tastatur mit Wertprüfung, Hilfen, Speicherfälle, Neustart, lokale Pages-Unterpfade und eingeschränkte axe-Prüfungen sind Bestandteil dieser Läufe.

Rohprotokolle und Bildschirmaufnahmen: `evidence/gate-a/`. Die alten Belege unter `evidence/phase2b/` sind historische Nachweise.

## Offene Umgebungs- und Aussagegrenzen

WebKit kann in dieser Cloud weiterhin nicht gestartet werden: Browserdatei fehlt (`evidence/gate-a/webkit-launch.txt`); die beiden offiziellen Download-Domains sind im aktiven Netzwerkstand nicht enthalten. Der früher gespeicherte Konfigurationsentwurf ist nicht aktiviert. Kein identischer gesperrter Download wurde erneut als Fortschritt ausgegeben und keine Sperre umgangen. Die unabhängige Gegenprüfung hatte WebKit auf dem alten Ausgangscommit tatsächlich geprüft; das beweist unseren korrigierten Stand nicht. Das WebKit-Projekt bleibt erhalten und enthält die neuen Gate-A-Fälle.

Die zwei macOS-Auswahlfeldfälle sind hier mangels macOS nicht erneut geprüft. Ihr Helfer und seine tatsächliche Wertprüfung bleiben erhalten; programmatische Auswahl wird nicht als Tastaturnachweis ausgegeben. Linux-Chromium-Tastaturfälle bestehen. Physisches iPad, Safari/iPadOS, Screenreader, vollständige Barrierefreiheit und Unterrichtswirkung sind nicht nachgewiesen.

Alle drei curricularen Originale sind unverändert zugänglich: 159 Seiten erneut textuell geöffnet, identische SHA-256-Werte. Kein neuer Vollrender behauptet. Zugriffsnachweis: `evidence/gate-a/source-access.json`.

**Internes Gate A bestanden im tatsächlich verfügbaren Chromium-/Logikumfang:** Der Ausgangsfehler ist behoben, alle gezielten Regressionen bestehen, die erste Episode einschließlich Ereignis und erneuter Empfehlung ist vollständig spielbar. Die neue Episode darf gemäß kombiniertem Auftrag beginnen. Dies ist keine unabhängige Freigabe und keine Behauptung eines neuen WebKit-Nachweises.
