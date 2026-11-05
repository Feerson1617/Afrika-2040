# Sprachrevision: Inventar und Prüfnachweise

- `text-inventory.json`: vollständige String-/Template-Erfassung aus dem Anwendungscode einschließlich kurzer Beschriftungen, HTML-Vorlagen, ARIA-Texte, dynamischer Rückmeldungen und technischer Konstanten. Ein Suchmerkmal `candidate` dient nur zum Filtern; es entfernt keinen Eintrag. Die Dateiliste benennt überarbeitete und beibehaltene Bereiche. Dazu kommen alle 66 Glossarbegriffe, der HTML-Einstieg und Prüfsummen geschützter JSON-Daten.
- `checks.json`: tatsächliche Testergebnisse einschließlich des dokumentierten Zeitabbruchs und der unveränderten Einzelwiederholung; Nachweis aller 208 vollständigen Lernweg-/Hilfe-/Browserkombinationen, geschützte Dateien und Build-Prüfsummen.
- `wording-changes.json`: konkrete, einzeln festgelegte Vorher-/Nachher-Formulierungen. Lokale Darstellungsänderungen und einige zusammengesetzte Statusanzeigen sind zusätzlich im Git-Diff erkennbar. Es wurde kein globaler automatischer Wortersatz im Anwendungscode ausgeführt.
- `../../learning-task-contracts.json`: alle 52 erzeugten Varianten mit 494 Lernschritten und 607 Feldern einschließlich Fragen, Antwortmöglichkeiten, Hilfen, Beispielen und Kriterien.
- `../../../tests/fixtures/language-e4b9100-contract.json`: aus dem Ausgangsstand erzeugte, von der Textfassung getrennte Schutzmerkmale. Die 52 Regressionen vergleichen IDs, Antwortwerte, Reihenfolge, Verknüpfungen und Differenzierungsmerkmale dagegen.

Beliebige selbst eingegebene Schülertexte werden nicht redigiert oder bewertet. Historische Abgaben behalten ihre gespeicherten Texte. Quellenbezeichnungen, Eigennamen, Zahlen und rechtliche Angaben werden nicht durch freie Übersetzungen ersetzt. Ein Textinventar oder ein bestandener Test ist kein Nachweis, dass jedes Kind einen Text versteht.

Reproduktion: `node scripts/audit-language.mjs /tmp/afrika-text-inventory.json`. Das Skript benötigt die im Lockfile festgelegten Entwicklungsabhängigkeiten. Die beiden ergänzend genannten Work-Dateien waren nicht verfügbar; das Inventar wurde deshalb direkt aus dem geprüften Repository erstellt.

## Ausgewählte tatsächliche Ansichten

Alle Aufnahmen verwenden 1024 × 768 im Querformat und zeigen die gesamte Seite. Sie enthalten nur synthetische Testantworten.

- WebKit: [ESA-Fotokontext](language-esa-photo-webkit.png), [AHR-Erklärung nach bewusster Übernahme](language-ahr-bus-webkit.png), [Förder-Verarbeitungskarten und passende Wörter](language-cocoa-webkit.png).
- Chromium, frühere weiterhin erreichbare Themenoberflächen: [Bilder](language-image-chromium-ipad.png), [Natur](language-nature-chromium-ipad.png), [Bevölkerung](language-population-chromium-ipad.png), [Wirtschaft](language-economy-chromium-ipad.png), [Zukunft](language-future-chromium-ipad.png).

Die Screenshots sind ergänzende Belege. Die vollständigen 52 Varianten werden durch die regulären und unterstützten Browserwege geprüft; es wird kein Screenshot für jede einzelne Textkombination behauptet.
