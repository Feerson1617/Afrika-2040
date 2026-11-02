# Belege der abschließenden Endredaktion

- `text-review.json`: Quellfragmente, erzeugte Aufgabenformulierungen und alle 66 Glossarbegriffe mit redaktioneller Zuordnung. Die Erfassung schließt technische Literale mit ein; diese sind keine eigenständigen Schülertexte. Quellenangaben und freiwillige Vertiefungen bleiben erreichbar.
- `wording-changes.json`: gezielte Vorher-/Nachher-Änderungen. Darstellungslogik, etwa die Fehleranzeige und aufgabenspezifische Untersuchungshinweise, ist zusätzlich im Git-Diff nachvollziehbar.
- `../../learning-task-contracts.json`: aktuelle vollständige 52 Varianten, 494 Schritte und 607 Felder einschließlich unveränderter Identitäten und aufgelöster Begründungen für unterschiedliche Entscheidungen.
- `checks.json`: tatsächliche Prüfungen, gegebenenfalls Wiederholungen, Grenzen und Prüfsummen.

Die Kategorien dokumentieren die Redaktion, keine nachgewiesene Lernwirksamkeit. Quelle und Zeitpunkt, natürliche Veränderung und Wanderung, Einnahmen und Überschuss sowie Tankrest und Grundwasser bleiben fachlich getrennt. Die Standards für Unterstützung und freie eigene Texte bleiben unverändert.

Die neue Textinventur lässt sich mit `node scripts/audit-language.mjs /tmp/endredaktion.json` wiederholen. Die bestehenden Strukturtests vergleichen zusätzlich mit dem früheren, festgehaltenen Quellstand. Die unabhängigen Antwortorakel wurden nicht geändert.

Alle Bildschirmbelege und gespeicherten Testtexte sind synthetisch. Der Browserlauf verwendet Chromium und Linux-WebKit. Die Hauptansichten werden bei 1024 × 768 mit Touch und Tastatur geprüft. Eine physische Schul-iPad- und Screenreader-Abnahme wird nicht behauptet.

Ausgewählte Bildschirmbelege: Förder-Kakaoschritt in WebKit, ESA-Kakaoschritt in Chromium, AHR-Journal mit fachlich ungeprüfter Beispielantwort, ESA-Fotoaufgabe und AHR-Bus-Erklärung. Die Aufnahmen stammen aus emuliertem Querformat; volle Seiten können länger als ein Bildschirm sein.

`baseline-webkit-reload.txt` belegt den zusätzlichen Sichtbarkeitsfehler am unveränderten Ausgangscommit (WebKit nach Reload, Chromium bestanden). Die achtzeilige Korrektur setzt nur Fokus und Scrollposition der gespeicherten Rückmeldung; die verschärften bestehenden Feedbacktests schützen die erhaltenen Angaben.
