# Finaler Korrektur- und Releasekandidat · 52 Lernwegvarianten

Grundlage: `5b825b19a9ef45cbee7d704462535ae59d677e49`, Branch `feat/afrika-vier-lernwege`. Beim ursprünglichen Beginn: exakter HEAD, sauberer Arbeitsbaum und identischer Remote. Bei der Wiederaufnahme nach dem Cloud-Ausfall waren sämtliche Korrekturen erhalten; HEAD und Remote lagen weiter auf dieser Basis, ohne zusätzlichen lokalen Commit. Es wurde nichts erneut implementiert. Der eingefügte finale Korrekturauftrag ist vollständig verfügbar. Die darin genannten zusätzlichen Dateien `Gegenpruefung-Paket-B-5b825b1.html` und `Korrekturauftrag-Paket-B-5b825b1.txt` waren unter den verfügbaren Anhängen nicht vorhanden; deren Inhalte werden hier nicht behauptet.

Der Korrekturcommit enthält diesen Bericht. Seine vollständige SHA steht in der Übergabe und dem externen Bestandsbericht; im Checkout liefert `git rev-parse HEAD` dieselbe SHA. Die isolierte Korrekturdifferenz lässt sich mit `git diff 5b825b19a9ef45cbee7d704462535ae59d677e49..HEAD` prüfen. `main` steht vor der Übergabe weiterhin auf `b07f8244ab64763aea9c3f96ce3358fab3c1cf78`; ein Draft-PR gegen diesen alten Hauptbranch umfasst deshalb auch die vorherige Anwendungsentwicklung.

## Fachliche Korrektur

Die bisherigen Fragen nannten bereits den neuen Fall und akzeptierten dessen Antworten, während das Material den früheren Fall zeigte. Vor der Codeänderung wurden **24 Ansichten** tatsächlich in Chromium und WebKit reproduziert: drei Transferfamilien × vier Profile × zwei Engines. Bildschirmaufnahmen, Materialtexte und tatsächlich erzeugte synthetische Antwortstände wurden gesichert.

| Aufgabe   | Vorher im Material                       | Jetzt in Frage, Grafik und Tabelle                                                                   | Ausdrücklicher Vergleich                                               |
| --------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Kenia 2   | 24 Menschen / 20 Plätze; Frage zu 18     | 18 Menschen / 20 Plätze pro Stunde; betrachteter Fußweg 12 Minuten; freie Plätze verkürzen ihn nicht | Alter 24-Personen-Fall; dessen Fußweg gilt für die acht neuen Nachbarn |
| Marokko 5 | Tankanfang 80 WE; Frage zu 70            | 70 WE Anfang − 50 WE Entnahme = 20 WE Tankrest                                                       | Alte Reparaturrunde: 80 − 50 = 30 WE                                   |
| Marokko 6 | Zusatzfeld 20 WE, Gesamt 65; Frage zu 10 | Erstes Feld 45 + Zusatzfeld 10 = 55 WE; 5 weniger als früher 60; ausdrücklich Tank 80, Rest 25       | Altes Zusatzfeld: 45 + 20 = 65 WE; Tankrest 15                         |

`transfer-cases.ts` ist die gemeinsame aufgabengebundene Datenquelle. Aufgabenbedingungen, numerische Sollantworten, Tabellen, Grafiktexte und Tankfüllung benutzen diese Konfiguration. Die alten Nachfrage-, Wasser- und Flächenmodelle wurden nicht umgestellt. Der neue 70-WE-Fall erfindet keine Feldankunft, Verbrauchsmenge oder Grundwasserentwicklung. Der Blickwechsel ist als Vergleich gekennzeichnet; die Aufgabe gilt weiterhin dem neuen Fall.

Semantische Antwortkennungen und Erwartungswerte bleiben erhalten. Die beiden getrennten Förder-/ESA-Fragen bleiben getrennt; die kombinierte MSA-/AHR-Aufgabe bleibt kombiniert. Frühere Abgaben werden weder gelöscht noch erneut als selbstständige Leistung protokolliert. Die ursprünglichen Aufgabenbedingungen waren bereits richtig, daher ist keine neue automatische fachliche Abgabe nötig. Zwölf vor der Korrektur mit der Anwendung erzeugte synthetische Browserabgaben sind als kleine Regressionseinrichtung gespeichert; fachfremde vorherige Aufgaben wurden aus dieser Einrichtung entfernt.

Die Beschriftung des ursprünglichen 20-WE-Zusatzfelds steht nun mittig am Feldsymbol. Dasselbe gilt für den neuen 10-WE-Fall. Kurze Sätze ersetzen ausschließlich die beauftragten Reststellen: legitime Wahl, erfundene Modellstunde, einmalige Anschaffung aus einem eigenen Geldtopf und mündliche Selbstmeldung. Drei Hilfestufen, bewusste Beispielübernahme und fachlich ungeprüfte eigene Texte bleiben erhalten.

## Tatsächlich ausgeführte Prüfung

- **393/393 Logiktests bestanden**, darunter alle bisherigen 379 und 14 gezielte neue Regressionen; keine übersprungenen Tests.
- **656 verschiedene Browserfälle bestanden**: 328 Chromium und 328 WebKit. Darin **208 vollständige Lernwege** (52 Varianten × regulär/unterstützt × zwei Engines), einschließlich **48 vollständiger Wege** der betroffenen drei Episoden. Zusätzlich 48 gezielte aktuelle Transferfälle, 24 Altstandprüfungen und zwei Prüfungen der ursprünglichen SVG-Beschriftung; diese sind bereits Teil der 656.
- Der vollständige Chromium-Anteil wurde vor dem Cloud-Ausfall abgeschlossen und durch das erhaltene Playwright-Listenprotokoll bestätigt. Nach Wiederaufnahme wurden alle 328 WebKit-Fälle vollständig neu ausgeführt und die 37 Chromium-Transfer-/Altstand-/SVG-Fälle nochmals frisch bestanden. **Kein einzelner unterbrechungsfreier 656er-Lauf wird behauptet.** Der Produktionsbuild blieb nachweislich bytegleich. Die letzte Teständerung verschärft die SVG-Grenze auf die tatsächliche ViewBox-Höhe 280; beide Engines bestehen diese Prüfung.
- **TypeScript und Vite-Produktionsbuild erfolgreich**, anschließend strenger Artefaktprüfer erfolgreich: genau fünf Dateien. Node 24.19.0, Playwright 1.64.1, Chromium 154.0.8037.57 und Linux-WebKit über den vorhandenen lokalen Wrapper.
- Formatprüfung und `git diff --check` bestanden. Test-/Quellstand ist durch den SHA-256-Fingerabdruck in [checks.json](evidence/transfer-rc/checks.json) festgehalten. [Vorher-/Nachher-Belege](evidence/transfer-rc/README.md) enthalten sechs gezielte Aufnahmen und die tatsächlich erfassten 24 Ausgangsansichten.

Frühere abgebrochene Läufe zählen nicht als bestandene Gesamtläufe. Ein erster Testzugriff auf ein nicht vorhandenes Nachfrage-SVG sowie ein falscher RGB-Sollwert im neuen Test wurden im Test korrigiert; die Anwendungsfarbe blieb unverändert. Nach Wiederaufnahme traf ein Chromium-Altstandtest während des erneuten lokalen Builds auf HTTP 404. Dieser 36/37-Lauf wurde gesichert und nicht als Erfolg gezählt; der anschließende vollständige 37er-Lauf gegen den unveränderten fertigen Build bestand. Keine Testbedingung wurde entfernt, übersprungen oder zur Verschleierung eines fachlichen Fehlers abgeschwächt.

Die Primäransichten wurden in Desktopgröße 1366×900 und mit emuliertem iPad quer 1024×768 geprüft. Die unterstützten vollständigen Wege verwenden echten Playwright-Touchinput; die regulären Wege verwenden Tastatur/Enter. Hinzu kommen Mausauswahl, native Auswahlfelder, Fokus, Rücksprung, Nachprüfung und Reload. Bildschirmaufnahmen wurden visuell gesichtet; SVG-Textgrenzen werden zusätzlich über `getBBox()` geprüft. Frühere und neue Materialansicht ändern weder Antworten noch protokollierte Abgaben. Alte Abgaben bleiben nach Reload und im sichtbaren Journal korrekt gekennzeichnet.

Alle 52 Varianten bleiben implementiert; 15 vorhandene Transfer-Teilaufgaben erhalten lediglich den expliziten Materialbezug. Keine neue Aufgabe, kein Profil, keine Modellrechnung oder Spielmechanik. Dreißig geschützte Modell-, Karten-, Quellen-, Zustands-, Foto-, Lockfile- und Artefaktprüfdateien sind gegenüber `5b825b1…` bytegleich. Die vorhandenen Tests bleiben erhalten. Der bestehende Materialtest zum Fußweg der acht neuen Nachbarn gilt weiterhin für den ursprünglichen Fall; im neuen Transferfall prüfen konkrete Tabellenzeilen stattdessen 18 Menschen, 20 Plätze und den 12-Minuten-Fußweg.

## Build und Veröffentlichungsvoraussetzungen

Der Produktionsbuild enthält genau fünf Dateien: `index.html`, ein JavaScript-Bundle, ein CSS-Bundle und die zwei zugelassenen, per SHA-256 geprüften Asafo-/Kakum-Fotos. Der strenge Artefaktprüfer erlaubt ausschließlich diese Dateien und relative Ressourcenpfade. Keine schulischen Original-PDFs, `.env`-Dateien, Schülerdaten, Teststände, Berichte, Quellarchive, Abhängigkeitsordner oder Source Maps gehören in `dist`. Konkrete Dateigrößen und Prüfsummen stehen im kompakten Testnachweis.

Ein Branch-Push und Draft-PR sind ausdrücklich genehmigt. `.github/workflows/release-checks.yml` prüft Pull Requests gegen `main` ohne Deploymentrechte. `.github/workflows/pages-manual.yml` läuft ausschließlich manuell mit ausdrücklich genehmigter vollständiger `main`-SHA und gesetzter Veröffentlichungsfreigabe. Beide Workflows bleiben unverändert. Der Branch-Push löst keine Pages-Veröffentlichung aus.

Für einen späteren Release: unabhängige Schlussabnahme des exakten Commits, erfolgreicher PR-Check in beiden Engines, Prüfung des dann aktuellen Integrationsstands und ausdrückliche Mergefreigabe. Für Pages zusätzlich eine eigene Veröffentlichungsfreigabe, vorhandene Pages-Konfiguration mit Actions, passende Environment-/Branchregeln und erfolgreicher manueller Build-/Artefaktcheck. Anschließend die reale öffentliche URL prüfen. Diese Einstellungen werden nicht verändert; eine aktuelle administrative Prüfung ist wegen des nicht verfügbaren GitHub-API-Zugangs hier nicht bestätigt.

## Grenzen und Stopp

Aus den ausgeführten Prüfungen bleibt kein bekannter funktionaler Fehler im beauftragten Korrekturumfang offen. Die unabhängige Schlussabnahme steht weiterhin aus.

Kein physischer Schul-iPad-/Safari-Test, keine vollständige Screenreader-Abnahme und keine Unterrichtserprobung. Linux-WebKit bildet nicht jedes plattformspezifische Verhalten nativer Auswahlfelder unter Safari ab. Vorhandene vertikale Scrollstrecken bleiben; Hochformat ist kein eigener Pflichtmodus. Die lokal geprüften schmalen Frames sind kein Nachweis für beliebige LMS- oder CSP-Einstellungen. Hilfen und Bausteinauswahl sind keine Nachweise selbstständiger Urteilskompetenz. Eigene Texte und mündliche Selbstmeldungen bleiben fachlich ungeprüft. Keine empirische Lernwirksamkeit behauptet.

SCORM bleibt ausschließlich vorbereitet: kein Manifest, Laufzeitadapter, Export, Tracking oder dauerhafte Benutzerverwaltung. Der spätere Wiederaufnahmedatensatz müsste IDs, Rohantworten, Position, Kontexte und Hilfeherkunft bewahren; rekonstruierbare Materialtexte müssen nicht dupliziert werden. Keine Klassenarbeit, Begleitmaterialien, neue Module oder weitere Architekturarbeit.

Nach Bereitstellung des korrigierten Branchstands und des soweit technisch möglichen Draft-PRs endet die Entwicklungsarbeit. Kein Merge, Release, Pages-Deployment oder administrativer Eingriff.

## Tatsächlich geänderte Dateien

- `AGENTS.md`
- `docs/afrika-transfer-release-candidate.md`
- `docs/evidence/transfer-rc/README.md`
- `docs/evidence/transfer-rc/before-after.json`
- `docs/evidence/transfer-rc/checks.json`
- `docs/evidence/transfer-rc/s2-after.png`
- `docs/evidence/transfer-rc/s2-before.png`
- `docs/evidence/transfer-rc/s5-after.png`
- `docs/evidence/transfer-rc/s5-before.png`
- `docs/evidence/transfer-rc/s6-after.png`
- `docs/evidence/transfer-rc/s6-before.png`
- `docs/learning-task-contracts.json`
- `playwright.afrika.config.ts`
- `src/learning/chapter-ui.ts`
- `src/learning/progress.ts`
- `src/learning/simulation-material.ts`
- `src/learning/simulation-variants.ts`
- `src/learning/tasks.ts`
- `src/learning/transfer-cases.ts`
- `tests/browser/packet-b.spec.ts`
- `tests/browser/transfer-rc.spec.ts`
- `tests/fixtures/transfer-5b825b1.json`
- `tests/transfer-cases.test.ts`
