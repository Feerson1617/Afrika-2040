# N1 · Quellenzustände bei Rückkehr und Reload

Ausgangsstand: `4bcee44415b670a27eec991dd047e9937c04eb1c`, Branch `feat/afrika-vier-lernwege`. HEAD, sauberer Arbeitsbaum und identischer Remote wurden vor Beginn geprüft. Die GitHub-CI dieses **Ausgangsstands** ist in Chromium und WebKit erfolgreich abgeschlossen. Für die neue lokale Korrektur wird kein GitHub-CI-Erfolg behauptet und kein Push durchgeführt. Die vollständige neue Commit-SHA steht in der Chat-Übergabe und im Prüfpaket.

## Eng begrenzte Korrektur

Gewählte offene **und** geschlossene Materialklappen werden als optionale UI-Angaben im bestehenden Aufgabenversuch des jeweiligen Lernwegs gespeichert. Dieselben stabilen Schlüssel gelten für die laufende Materialaktualisierung und die Wiederherstellung: eigene ID oder verschachtelter Zusammenfassungspfad mit Unterscheidung gleichnamiger Bereiche. Beim Zurückkehren und Neuladen werden auch geschlossene Eltern mit noch geöffnetem, zunächst unsichtbarem Unterbereich exakt wiederhergestellt.

Es werden nur tatsächlich geänderte Klappenzustände gespeichert. Unberührte alte Spielstände behalten die bisherigen Standardzustände. Speichern verwendet ausschließlich den vorhandenen Sitzungsspeicher; bei gesperrtem Speicher bleiben die Zustände im Arbeitsspeicher des geöffneten Tabs nutzbar und die bestehende Speicherwarnung sichtbar. Neustart löscht die UI-Daten zusammen mit den Aufgabenversuchen. Ungültige Zusatzdaten beschädigen keine gültigen Antworten; die Wiederherstellung akzeptiert nur begrenzte boolesche UI-Einträge.

Der Eingabehandler ersetzt unverändertes Material weiterhin nicht. Fokus, Cursor, Text und Leseposition bleiben beim Schreiben erhalten. Bei einer echten Rechenänderung wird die frühere Bestätigung weiterhin sofort zurückgenommen; alte Abgaben und bewusst geöffnete Hilfe 3 bleiben korrekt gekennzeichnet. Es gibt keine neue Lernhandlung, keine neue Sprache oder Layoutänderung und keine Änderung fachlicher Werte oder Antwort-IDs.

Anwendungscode: `src/main.ts`, `src/learning/update-material.ts`, `src/learning/storage.ts`. Alle **64 übrigen Anwendungsdateien** sind byteidentisch zum Ausgangsstand. Der vollständige Antwort-/Bewertungsreducer und die einmalige T1-Rückmeldungswiederherstellung wurden zusätzlich als unveränderte Quellabschnitte verglichen. Die bisherige Sprach- und Lernhindernisredaktion wird nicht erneut begonnen; ihre alten Prüfmanifeste bleiben historische Belege.

## Tatsächliche Prüfung

| Prüfung                                                    | Ergebnis                                                                                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Ursprünglicher N1-Fehler                                   | **20/20** Kombinationen reproduziert; jeweils Verlust bei Rückkehr, eigenständig vorbereitetem Reload und anderer Aufgabe |
| Logiktests                                                 | **494/494 bestanden**: alle vorhandenen 491 plus drei neue Speicherprüfungen; nichts übersprungen                         |
| Endgültiger begrenzter Browserlauf                         | **210/210 bestanden**, keine übersprungenen oder wiederholten Fälle                                                       |
| Davon normale N1-Rückkehr-/Reloadkombinationen             | **20/20 bestanden**                                                                                                       |
| Davon neue Klappen-/Profil-/Neustart-/Speicherfälle        | weitere **6/6 bestanden**                                                                                                 |
| Übrige Sprach-/F1–F3-/T1- und Profil-/Speicherregressionen | **184/184 bestanden**                                                                                                     |
| Gesonderte T1-Wiederholung                                 | **6/6 Abläufe mit 30 Reloads bestanden**                                                                                  |
| TypeScript und Produktionsbuild                            | erfolgreich                                                                                                               |
| Strenge Build-Artefaktprüfung                              | exakt **5** zugelassene Dateien, keine privaten Dateien/PDFs/Abhängigkeiten                                               |
| Formatierung und Patchprüfung                              | erfolgreich                                                                                                               |

Die 210 Browserfälle sind gezielte N1- und bestehende Regressionstests; sie werden **nicht** als neuer Durchlauf der bereits unabhängig bestätigten 208 vollständigen Varianten ausgegeben. Der erste erweiterte Regressionslauf bestand 200/210 Fälle; zehn alte Hilfetest-Interaktionen schlossen durch blindes Umschalten die nun korrekt wiederhergestellte Quelle. Nach der unten beschriebenen Anpassung und Verschärfung dieses Testsetups wurde der gesamte begrenzte Satz erneut erfolgreich ausgeführt. Beide Protokolle bleiben im Prüfpaket erhalten.

[Prüfmetadaten](evidence/n1-return/checks.json), [vollständige UI-Matrix](evidence/n1-return/ui-matrix.json) und [Belegübersicht](evidence/n1-return/README.md) binden die Ergebnisse an den tatsächlich geprüften Quellstand. Die ursprünglichen 20 Fehler und die Hilfetest-Setupfehler werden nicht als erfolgreiche Läufe umgedeutet.

Die folgenden fünf Ziele werden jeweils in Chromium und WebKit sowie bei **1024 × 768** und **768 × 1024** geprüft: insgesamt **20 normale Bedienwege** unter dem Produktionspräfix `/Afrika-2040/`.

| Aufgabe                   | Lernweg |
| ------------------------- | ------- |
| `future.judgment`         | MSA     |
| `future.judgment`         | AHR     |
| `image.perspective`       | AHR     |
| `economy.source-claim.v1` | AHR     |
| `nature.recommend`        | AHR     |

Alle vorherigen Aufgaben werden mit den sichtbaren Bedienelementen und festen, von der Bewertung unabhängigen Testantworten bearbeitet. Kein fertiger Zielzustand wird in den Speicher eingespritzt. Jede Kombination prüft:

1. Gemischten verschachtelten Zustand wählen, eigenen Text abgeben, Cursor in die Textmitte setzen und mehrere Wörter schreiben. Klappen, Text, Cursor, Fokus und Leseposition bleiben erhalten.
2. Zurückgehen, in der anderen Aufgabe einen **anderen** Zustand wählen und wiederkehren. Der ursprüngliche Aufgabenzustand, Text und Abgabehistorie müssen exakt passen.
3. Vor dem Reload **unabhängig davon neu** einen umgekehrten gemischten Zustand wählen: Elternklappe geschlossen, Unterklappen geöffnet. Danach neu laden und genau diese Werte vergleichen. Anschließend auch die zuvor besuchte andere Aufgabe erneut prüfen.

Die 20 JSON-Belege enthalten besuchte Aufgaben, erwartete und tatsächlich sichtbare Klappenzustände vor/nach Rückkehr und Reload sowie synthetischen Text und Abgaben. Pro Kombination wird ein eigener Schülerbildschirm nach der Rückkehr mitgeliefert. Zusätzliche Bilder zeigen Reload, Profiltrennung, Neustart und die vorhandene Speicherwarnung.

Zusatzprüfungen: Klappen ohne ID im echten Orientierungsbereich (offen → Reload sowie geschlossen → unabhängiger Reload); verschachtelte anonyme Klappen im Browser-DOM einschließlich JSON-Rundlauf; getrennte MSA-/AHR-Zustände; Abbrechen und Bestätigen des Neustarts; bedienbare Rückkehr bei gesperrtem Schreiben in den Sitzungsspeicher; alte Spielstände ohne UI-Daten und beschädigte optionale UI-Daten. Die bestehenden zwölf gerichteten Lernwegwechsel und ihre übrigen Speicherregressionen werden ebenfalls ausgeführt.

Der alte Hilfetest öffnete Quellen nach Reload durch blindes Umschalten und setzte damit den früheren Fehler voraus. Er öffnet sie nun nur, wenn sie tatsächlich geschlossen sind. Die bisherigen Erwartungen bleiben bestehen; zusätzliche Prüfungen verlangen identische Klappenzustände nach Rücksprung und Reload. Der verschachtelte DOM-Test prüft weiterhin die notwendige Ergebnisaktualisierung und zusätzlich die Wiederherstellung nach Serialisierung. Keine Tests gelöscht, übersprungen oder abgeschwächt.

Reproduktion und endgültige Befehle:

```sh
npm test
npx tsc --noEmit
npm run build
node scripts/check-dist.mjs
npx playwright test -c playwright.editorial.config.ts \
  'n1-return.spec|language-revision.spec|four-paths-correction.spec' \
  --workers=4 --reporter=list,json
```

Die Umgebung verwendet Chromium sowie den tatsächlich verfügbaren WebKit-Browser. Ein abweichender WebKit-Pfad kann mit `WEBKIT_PATH` angegeben werden. Die neuen 26 Browserfälle werden auch vom bestehenden CI-Profil entdeckt; eine Entdeckung wird nicht als ausgeführter CI-Lauf gewertet.

## Übergabe und Grenzen

Die eng begrenzte Quellprüfung und die tatsächlichen Browserprüfungen ersetzen keine unabhängige Nachprüfung. Kein physisches iPad und kein Unterrichtsversuch durchgeführt. Die bekannten nicht blockierenden P3-Punkte („in Kauf nehmen“ im Marktvergleich und Scrollbedarf im Hochformat) bleiben unverändert; sie wurden nicht zum neuen Arbeitsumfang gemacht.

Keine Übertragung dieses neuen Commits an GitHub, kein Merge, Release oder Deployment. Der bestehende Draft-PR und der öffentliche Branch bleiben auf dem Ausgangsstand. Das kompakte lokale Prüfpaket enthält Quellcode, Lockfile, Tests, aktuelle UI-Belege, Rohprotokolle und einen Git-Bundle mit dem öffentlichen Ausgangscommit als ausdrücklich genannter Voraussetzung. Keine Zugangsdaten, Original-PDFs, Abhängigkeiten oder Build-Zwischendateien. Nach dieser Übergabe endet die Entwicklung.
