# Letzte didaktische Releasekorrektur · D1 und T1

Ausgangscommit: `4863f64c460f66d00c7d29bdd3835d21cd9ecf19`, Branch `feat/afrika-vier-lernwege`. HEAD, sauberer Arbeitsbaum und identischer Remote wurden vor der Umsetzung geprüft. Dieser Bericht gehört zum Korrekturcommit; dessen vollständige SHA wird nach der Erstellung in der Übergabe genannt. Die isolierte Änderung zeigt `git diff 4863f64c460f66d00c7d29bdd3835d21cd9ecf19..HEAD`.

## Didaktische Darstellung

Die drei Transferfamilien verwenden weiterhin dieselben fachlich richtigen Ausgangsdaten. Verändert wird, wann die Lösung sichtbar ist. Der Förderweg behält die vollständige Erklärung. ESA erhält Ausgangsdaten und ein unvollständiges Rechengerüst. MSA und AHR erhalten Ausgangsdaten und den Arbeitsauftrag.

| Fall      | Ausgangsdaten der neuen Erstansicht                                                       | Zurückgehaltene Lösung                                         |
| --------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Kenia 2   | 18 Menschen, 20 Plätze pro Stunde, betrachteter Fußweg 12 Minuten                         | Der Schluss, dass freie Plätze keinen kürzeren Fußweg beweisen |
| Marokko 5 | 70 WE im Tank, Entnahme 50 WE; ESA: `70 − 50 = ___`                                       | Tankrest 20 WE; auch keine verräterische Restfüllung im SVG    |
| Marokko 6 | Tank 80 WE, erstes Feld 45 WE, neues Zusatzfeld 10 WE, früher 60 WE; ESA: `45 + 10 = ___` | Gesamtentnahme 55 WE, Tankrest 25 WE, Vergleich „5 WE weniger“ |

Die Wasser-/Flächengrafik zeigt zunächst den Tank **vor** der Entnahme. Tabellen, sichtbare SVG-Texte, Füllungsgeometrie und zugängliche Bildbeschreibung enthalten ausschließlich Ausgangsgrößen. Die Ergebnisse werden tatsächlich nicht in das aktuelle Material-HTML geschrieben. Es gibt keine versteckten Lösungsreste per CSS. Der bewusst wählbare frühere Vergleich bleibt vollständig und eindeutig gekennzeichnet; die Frage bezieht sich weiterhin auf den neuen Fall.

Die Offenlegung gilt für die gerade aktive Einzel- oder Kombinationsaufgabe: vollständiges Material bei Hilfe 3 (freiwillig oder nach dem zweiten bewertbaren Fehlversuch) oder nach fachlich korrekter, bestätigter Bearbeitung dieser Aufgabe. Hilfe 1 und 2 geben keine Ergebniszahl hinzu. Eine angezeigte Erklärung erzeugt weder eine Antwortabgabe noch eine Beispielübernahme. Die bewusste Übernahme bleibt eine eigene Handlung. Änderungen an einer vorher bestätigten Antwort setzen den aktuellen Prüfstatus wie bisher zurück. Zusätzlich wird jetzt das Transfermaterial sofort aktualisiert, auch bei Zahleneingaben ohne vollständigen Seitenaufbau; Eingabefokus und historische Abgaben bleiben erhalten. Wurde Hilfe 3 bereits geöffnet, bleibt die Erklärung nachvollziehbar zugänglich.

Fachliche Gegenrechnung unabhängig von den App-Musterlösungen: `70 − 50 = 20`; `45 + 10 = 55`, `60 − 55 = 5`, `80 − 55 = 25`. `18 ≤ 20` belegt ausreichende Kapazität für die Modellstunde, verändert aber keine Fußwegstrecke. Keine Aussage über tatsächlichen Grundwasserzustand, Ernte oder reale Verkehrsverhältnisse wird daraus abgeleitet. Die unabhängigen Testorakel enthalten die Sollantworten, ohne sie aus `expected` oder der Transferkonfiguration auszulesen.

Native Antwort-Auswahlfelder erhalten lokal `height` und `min-height: 48px`. Es bleibt beim nativen Element mit Beschriftung, Antwort-ID, Tastatursteuerung und sichtbarer Fokusmarkierung.

## Tatsächlich ausgeführte Prüfungen

- **408/408 Logiktests bestanden**, keine übersprungenen Tests; darin 15 neue aufgabenbezogene Offenlegungsregressionen.
- **272 Browserfälle bestanden**, jeweils 136 in Chromium und WebKit: 270 im abschließenden Transfer-/Episodenlauf plus zwei anschließend ergänzte native Tastaturtests. Keine Ausfälle, Wiederholungsversuche oder übersprungenen Fälle in diesen erfolgreichen Läufen.
- Darin 60 gezielte D1-Fälle: alle 15 Transferaufgaben × regulärer/unterstützter Verlauf × beide Engines. Erstansicht und Reload, Hilfe 1/2/3, korrekte Antwort, Antwortänderung, erster/zweiter Fehler, Teil-/Leerantwort, bewusste Übernahme, Vergleich, Rücksprung, Neubearbeitung und historische Abgaben geprüft.
- Zusätzlich 74 bestehende Transfer-/Altstand-/SVG-Prüfungen, 128 vollständige Wege durch die sechs Episoden sowie Orientierung und Rückblick und acht Integrationsprüfungen einschließlich schmalem Inhaltsfenster.
- Touch und Tastatur bei **1024×768**; weitere vollständige reguläre Wege bei 1366×900. Native Tab-Navigation, Pfeiltaste/Enter, berechneter zugänglicher Name, sichtbarer Fokus, semantische gespeicherte Antwort und Wiederaufnahme bestehen in beiden Engines. Im gezielten T1-Test beträgt die Auswahlfeldhöhe exakt **48 CSS-Pixel**; alle in den D1-Aufgaben geprüften Auswahlfelder sind mindestens 44 Pixel hoch.
- **TypeScript, Vite-Produktionsbuild und strenge Artefaktprüfung erfolgreich**: genau fünf zugelassene Build-Dateien. Node 24.19.0, Playwright 1.64.1, Chromium 154 und vorhandener Linux-WebKit-Wrapper.
- Geänderte Dateien bestehen die Formatprüfung und `git diff --check`. Die repositoryweite Formatprüfung meldet 16 bereits im Ausgangscommit identische Altdateien; diese werden nicht außerhalb des Auftrags umformatiert.

[Vorher-/Nachher-Belege](evidence/didactic-release/README.md) enthalten sechs vergleichbare Chromium-Erstansichten, drei aktuelle WebKit-Ansichten sowie erfasste Material-/ARIA-Texte. Relevante Aufnahmen wurden visuell gesichtet. [checks.json](evidence/didactic-release/checks.json) hält Prüfzahlen, Build-Prüfsummen und Schutzdateien fest.

Die erste Browserprüfung deckte eine echte veraltete Darstellung auf: Nach dem Ändern einer richtigen Zahlenantwort war der gespeicherte Zustand bereits offen, das Material zeigte jedoch weiterhin die vollständige Lösung. Vier Chromium-Prüffälle schlugen deshalb fehl. Der Lauf wurde abgebrochen und nicht als Erfolg gezählt. Der lokale DOM-Abgleich in `src/main.ts` behebt dies; die prüfende Bedingung blieb erhalten. Weitere Testanpassungen ändern ausschließlich die alten Erwartungen an die nun absichtlich unvollständige Erstansicht. Die vollständigen Ergebnisse werden nach Offenlegung weiterhin geprüft. Kein Test wurde gelöscht, übersprungen oder zur Verschleierung eines Fehlers abgeschwächt.

Keine gemeinsame Bewertungs-, Aufgaben- oder Zustandslogik wurde geändert. Daher ist nach dem Auftrag keine Wiederholung sämtlicher 208 vollständiger Wege erforderlich. Stattdessen werden alle 15 Transferaufgaben vollständig in beiden Engines geprüft, zusätzlich die sechs vollständigen Episoden, Orientierung, Rückblick und Kapitelintegration. Alle 52 Varianten bleiben im Aufgabenkatalog und in den vollständigen Logiktests erhalten.

## Schutz und Veröffentlichung

41 geschützte Dateien sind bytegleich mit dem Ausgangscommit: Fachmodelle, Karten, Quellen, Fotos, Aufgaben-/Profildefinitionen, Speicher- und Bewertungslogik, Hilfeprovenienz, Lockfile, Artefaktprüfer und beide GitHub-Workflows. Der Produktionsbuild wird ausschließlich über den vorhandenen strengen Artefaktprüfer geprüft. Er enthält keine Original-PDFs, Schülerantworten, `.env`-Dateien, Teststände, Berichte, Abhängigkeitsordner oder Source Maps.

Der Branch-Push und gegebenenfalls ein Draft-PR sind ausdrücklich beauftragt. Der Pages-Workflow startet ausschließlich manuell auf einer gesondert freigegebenen `main`-SHA; ein Branch-Push oder PR löst keine Veröffentlichung aus. Für einen Release bleiben unabhängige Abnahme des exakten neuen Commits, erfolgreiche Integrationsprüfung, eigene Mergefreigabe und anschließend gesonderte Pages-Freigabe erforderlich. Keine administrativen Einstellungen werden geändert.

## Geänderte Dateien

- Anwendung: `src/learning/simulation-material.ts`, `src/learning/style.css`, `src/main.ts`.
- Regressionen: `tests/transfer-disclosure.test.ts`, `tests/transfer-cases.test.ts`, `tests/browser/transfer-disclosure.spec.ts`, `tests/browser/transfer-rc.spec.ts`, `tests/browser/packet-b.spec.ts`, `playwright.afrika.config.ts`.
- Vertrag und Übergabe: `AGENTS.md`, `docs/learning-task-contracts.json`, dieser Bericht sowie `docs/evidence/didactic-release/` mit neun Bildern, zwei JSON-Nachweisen und README.

## Grenzen

Kein bekannter funktionaler Fehler im beauftragten D1/T1-Umfang bleibt nach den ausgeführten Tests offen. Die unabhängige finale Release-Abnahme steht aus. Emulierte 1024×768-Ansichten und Linux-WebKit ersetzen keinen Test auf einem physischen Schul-iPad. Keine vollständige Screenreader-Abnahme oder Unterrichtserprobung; zugängliche Beschriftungen werden automatisiert im erzeugten Markup geprüft. Native plattformspezifische Auswahlmenüs müssen auf der Zielhardware abgenommen werden. Vorhandene Scrollstrecken bleiben. Keine empirische Lernwirksamkeit oder selbstständige Urteilskompetenz aus erfolgreicher Bausteinauswahl abgeleitet.

SCORM bleibt vorbereitet, nicht implementiert. Kein Inhaltsausbau, keine weitere Sprachrevision, keine Klassenarbeit oder Begleitmaterialien. Nach Commit, Branchbereitstellung und dem technisch möglichen PR-Schritt endet dieser Auftrag. Kein Merge, Release oder Deployment.
