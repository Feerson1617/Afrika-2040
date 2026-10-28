# Vier Lernwege – Paket A

Basis a3be815e5557188d5769f3fc70f25a3bdf8de5d6. Nur Gate 0 und Gate 1. Gate 2–5 warten auf unabhängige Musterabnahme und ausdrückliche Freigabe. Keine automatische Einstufung von Kindern. Förder ist ein Unterstützungsprofil; AHR/ÜOS bezeichnet hier Anforderungen in Jahrgang 7, keinen erreichten Abschluss.

Alle sechs aktuellen Anhänge sind zugänglich. 02–05 und die verbindliche Ergänzung wurden direkt gelesen; 01 und 06 fehlen als Einzeldateien, ihre vollständigen Abschnitte sind in der Gesamtausarbeitung.html enthalten und wurden dort gelesen. Sie sind als HTML-Extrakte gekennzeichnet archiviert. Fremde Testberichte sind keine eigenen neuen Läufe. Original-Schul-PDFs bleiben außerhalb des Repositorys.

## Vor der Implementierung festgelegter Aufgabenvertrag für Gate 1

Die ausführbaren Verträge in `src/learning/tasks.ts` müssen jede unten genannte Teilaufgabe auflösen: sichtbarer Auftrag, Materialfassung, erwartete Handlung, Antwortfelder mit semantischen IDs, richtige/abweichende Antworten, Teilanerkennung, H1–H3, bewusst unterstützter Weiterweg, Transfer, Kriterien und Nachweisgrenze. Die Bereichskennungen `c.foerder.v1` usw. ersetzen keine Teilaufgaben-ID.

| Profil                          | Bevölkerung: verbindliche Teilaufgaben                                                                                                                                                                                                                                                       | Früher Kenia-Vergleich (begrenzter Prototyp)                                                                                                |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Schritt für Schritt (`foerder`) | Vier Richtungswahlen Geburt/Tod/Zu-/Fortzug; zwei Teilwirkungen M1; Gesamtwirkung mit erklärten Zahlen; historische Reihe mit 2000/2024 und Schätzungsstatus; getrennte Schulplatz-/Lehrkräftebedingung; drei Richtungen im neuen Fall M3. Keine Pflichtschrift, keine negativen Eingaben.   | Aminas Fußweg erkennen; Direkt/Nord vergleichen; Vorteil für Amina und Nachteil für David zeigen. Keine selbst gerechnete Bilanz behaupten. |
| Mit Rechenrahmen (`esa`)        | Vier Ereignisse zuordnen; +30/−10/1020 mit sichtbaren Operationsgerüsten; Erklärung auswählen; zwei historische Werte/Status; zwei bedingte Folgen zuordnen; +16/−12/804 im neuen Fall.                                                                                                      | Fußweg/Busfahrt mit Gerüst zu 22/10/12/18 verbinden; Beleg und Grenze der Nord-Empfehlung wählen.                                           |
| Selbst vergleichen (`msa`)      | Operationen aus vier Größen selbst wählen; Bilanz und Änderung/Bestand trennen; historische Werte, Status und Aussagegrenze; Bedingungen zuordnen; eine kurze eigene Erklärung oder ausdrücklich selbstgemeldete mündliche Form; M3 mit +16/−12/+4/804; Fahrgast-/Landesdaten unterscheiden. | Zeiten selbst rechnen; unterschiedliche Betroffenheiten passend zuordnen; Empfehlung und Nachteil strukturiert verbinden.                   |
| Zusammenhänge erklären (`ahr`)  | M1 selbst rechnen und kurz erklären; historische Werte mit eigener Quellenkritik; bedingte Chance/Herausforderung selbst formulieren; M3; Gegenfall mit Fortzug 70: +30/−40/−10/990; zusätzliche Frage. Keine Freitextbewertung.                                                             | Zeiten selbst rechnen, Ursache des Zeitvorteils selbst erklären, eigenen Vorschlag und Nachteil formulieren; Kriterien zur Selbstkontrolle. |

M1 und M3 gelten für denselben erfundenen Ort und ein Jahr. M4 ist eine **zusätzliche erfundene Annahme** über mehr Kinder/Jugendliche, nicht aus der Ghana-Reihe abgeleitet. Die reale Ghana-Reihe bleibt unverändert (historische Schätzungen zur Jahresmitte). Gegenfall: 1000+48−18+30−70=990. Kenia nutzt weiterhin `journey()`; kein neues Routenmodell.

## Gemeinsame Rückmelderegeln

Auswahl/Rechnung: ganze Antwort auswerten. Richtige Teile bleiben erhalten; leer/unklares Zahlenformat zählt keinen fachlichen Versuch. Vollständig bewertbar falsch: rot, bei passenden Teilen gelb, zweiter fachlicher Fehler gelbe Erklärung mit bewusst übernehmbarem Beispiel. Drei Hilfeebenen. Die Erklärung steht einmal im Hilfebereich, nicht nochmals als identischer Volltext im Feedback.

Freie Erklärungen: nur Vorliegen/Antwortform prüfen. Status immer fachlich ungeprüft. Erst nach eigener Bearbeitung oder bewusster Hilfe erscheinen konkrete Kriterien; Öffnen und Überarbeiten getrennt dokumentieren. Eine mündliche Selbstmeldung ist keine beobachtete Unterrichtsbesprechung. Hilfe ist in jedem Profil erreichbar, Standardhinweise sind keine Beispielübernahme.

## Identität und Katalog

Jeder tatsächliche Versuch trägt Bereich/Profil, conceptId, taskId, variantId, taskVersion, modelVersion, materialVersion und lokale attemptId. Antwortversuche, Hilfeherkunft, Prüfanteil und Prozessstatus werden getrennt gespeichert. Profilwechsel öffnet einen separaten Versuch; alter Entwurf bleibt unverändert. Kein Abschluss wird übertragen. Altstände bleiben „Bisheriger Lernweg, ohne Niveaueinstufung“.

52 Bereichs-/Profilkennungen sind als Plan katalogisiert. **Aktiv:** Bevölkerung vollständig in vier Profilen; Kenia E1 nur früher Vergleich in vier Profilen. Alle übrigen Varianten sind ausdrücklich geplant, ohne automatische Ersatzvariante. Die Hauptstruktur besitzt fünf Kapitel; bestehende direkte Einstiege bleiben erreichbar. Der breite Kapitel-/Journalumbau folgt in Paket B.
