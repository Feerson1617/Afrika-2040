# Sprachliche und aufgabendidaktische Endredaktion · Jahrgang 7

Ausgangsstand: `e4b9100a436fb9bce96fda29a64724d7502438cc`, Branch `feat/afrika-vier-lernwege`. HEAD und sauberer Arbeitsbaum wurden vor der Bearbeitung bestätigt. Der Korrekturcommit enthält diesen Bericht; seine vollständige SHA steht nach Erstellung in der Übergabe und im Paketmanifest.

Alle vier Lernwege richten sich an dieselbe Altersgruppe und behalten dieselben grundlegenden fachlichen Lernziele. Unterschiede betreffen Aufgabenkomplexität, Verarbeitungstiefe, Selbstständigkeit, Hilfen und Antwortform. AHR erhält weiterhin anspruchsvolle Fragen zu Zusammenhängen, Quellen und Übertragung auf neue Fälle. Dafür sind keine längeren Sätze oder schwereren Wörter nötig. Die Auswahlseite nennt diesen gemeinsamen Rahmen ausdrücklich. Die interne Kennung `esa` bleibt unverändert; sichtbar heißt der Weg jetzt **„Mit Hilfe“**.

Die Dateien `Unabhaengige-Sprach-und-Aufgabenpruefung-e4b9100.html` und `Enger-Codex-Prompt-e4b9100.txt` waren weder unter den verfügbaren Anhängen noch im Repository vorhanden. Ihre Inhalte werden nicht behauptet. Der vollständige neue Auftrag war lesbar. Die Prüfung erfolgte deshalb direkt am tatsächlichen Code und in den Browsern.

## Vollständigkeit der Texterfassung

Das [Textinventar](evidence/sprachrevision/text-inventory.json) erfasst alle String- und Template-Knoten aus 55 Quelldateien: **11.056 Knoten**, einschließlich technischer Konstanten. Dadurch bleiben auch kurze Beschriftungen und zusammengesetzte Rückmeldungen erfasst. Das Merkmal `candidate` ist nur eine Suchhilfe und schließt keinen Knoten aus. Zusätzlich sind HTML-Einstieg, alle **66 Glossarbegriffe** und die geschützten JSON-Daten benannt. Die [Aufgabenverträge](learning-task-contracts.json) enthalten sämtliche **52 Varianten, 494 Lernschritte und 607 Antwortfelder**, außerdem Identitäten und die aufgelösten Antworten für 85 Aufgaben mit unterschiedlichen Vorschlägen.

| Überprüfter Bereich     | Enthaltene Texte                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Einstieg und Navigation | Startseite, Lernwegauswahl, Kapitel, Wechselbestätigung, Zurück/Weiter und frühere Werkzeuge                                          |
| Alle fünf Themen        | Fragen, Materialien, Tabellen, Fotos, Bildbeschreibungen, Auswahlantworten einschließlich falscher Antworten, Quellen und Datenstatus |
| Alle sechs Episoden     | Modellhinweise, Karten-/SVG-Texte, Bedienelemente, Rechnungen, Entscheidungen und Transfer                                            |
| Unterstützung           | Drei Hilfestufen, vollständig erklärte Beispiele, bewusste Übernahme, Kriterien und offene eigene Texte                               |
| Rückmeldungen           | Richtig, falsch, teilweise passend, fehlend/unklar, legitime Entscheidungen und Zielkonflikte                                         |
| Wiederaufnahme          | Lernjournal, frühere Antworten, Speicherwarnung, Neustart, Profilwechsel und Prüfstatus                                               |
| Sprache und Zugang      | Aktuelle Wörterhilfe, vollständiges Glossar, zugängliche Namen, Alternativtexte und Bedienhinweise                                    |
| Frühere Oberflächen     | Weiterhin erreichbare Kenia-, Themen-, Länder- und Rückblickseiten mit ihren eigenen Rückmeldungen                                    |

Dynamische Texte sind als Vorlagen sowie als erzeugte Aufgaben erfasst. Beliebige eigene Eingaben sind keine vorgegebenen Apptexte und werden nicht redigiert. Historisch gespeicherte Antworten bleiben erhalten. Die Vollständigkeit des Inventars ist von der pädagogischen Beurteilung zu unterscheiden: Ein erfasster Text ist dadurch noch nicht für jedes Kind verständlich.

## Sprachliche Änderungen und bewusst erhaltene Fachlichkeit

Die erzeugten Texte von 258 der 494 Lernschritte wurden überarbeitet (Förder 65, ESA 73, MSA 54, AHR 66). Bereits klare Texte bleiben erhalten. 163 gezielt festgelegte Vorher-/Nachher-Änderungen sind in [wording-changes.json](evidence/sprachrevision/wording-changes.json) dokumentiert. Dazu kommen lokale Anpassungen zusammengesetzter Statusmeldungen und der Materialreihenfolge. Die Änderungen wurden nach Datei und Bedeutung festgelegt. Es gab keinen globalen mechanischen Wortersatz im Anwendungscode.

Gefunden wurden vor allem abstrakte Arbeitsaufträge, unnötige Verwaltungswörter, gedrängte Begründungen, uneindeutige Verweise sowie schwierigere Formulierungen gerade in den höheren Lernwegen. Fragen nennen jetzt häufiger die konkrete Handlung. Komplexe Erklärungen werden in kurze Sätze geteilt. „Gewichten“ wird an den betroffenen Stellen als Entscheidung darüber erklärt, welche Folge wichtiger ist und welcher Nachteil dafür akzeptiert wird. Die Leistung bleibt das Begründen einer Entscheidung.

| Thema / Lernweg           | Vorher                                                                                        | Nachher / Wirkung                                                                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bilder und Orte · ESA     | „Welcher Beleg widerspricht der Überschrift?“ – die Behauptung fehlte im aufgeteilten Schritt | Die Behauptung steht über beiden Fragen. „Was siehst du auf den Fotos? Was zeigt, dass die Behauptung nicht stimmt?“                                 |
| Bilder und Orte · MSA     | „Welche begrenzte Aussage würdest du zu beiden Bildern schreiben?“                            | „Was kannst du über die beiden gezeigten Orte sagen? Schreibe nur, was die Fotos zeigen.“                                                            |
| Natur und Wasser · Förder | Falsche Antwort: „Nur einen Kalender, Wasser ist egal“                                        | „Nur Wärme, auch ohne Wasser“: weiterhin falsch, aber auf Wachstumsbedingungen bezogen statt offensichtlich unsinnig                                 |
| Natur und Wasser · alle   | „Jahresmittel … Flächenmittel“                                                                | Durchschnittlicher Niederschlag pro Jahr; Jahre, Millimeter und Bezug auf die ganze Region bleiben sichtbar                                          |
| Bevölkerung · ESA         | „Der Wanderungssaldo steht schon mit seinem Vorzeichen da.“                                   | „Die Zahl zu den Umzügen hat schon ein Plus oder Minus. Übernimm das Zeichen.“                                                                       |
| Bevölkerung · AHR         | „Erwerbsmöglichkeiten eröffnen“                                                               | „… können Menschen später Arbeit finden.“ Die Bedingungen Ausbildung und passende Arbeitsplätze bleiben nötig.                                       |
| Wirtschaft · Förder / ESA | „Überschuss: Einnahmen minus laufende Ausgaben“                                               | Erst Geld bekommen und laufende Kosten bezahlen erklären, dann das übrige Geld als Überschuss benennen                                               |
| Wirtschaft · AHR          | „Vergleiche Personenbezug, Jahre und gemessene Größen.“                                       | „Wessen Einkommen wird behauptet? Für welche Jahre gelten die Quellen? Was wurde gemessen? Welche Angabe zum Einkommen fehlt?“                       |
| Zukunft · MSA / AHR       | „Wartungszuständigkeit“, „Gesamtökobilanz“, „Verknüpfe Folgen und Unsicherheit“               | „Wer prüft, pflegt und repariert die Anlage?“, „alle Folgen für die Umwelt“, „Wie hängen die Folgen zusammen? Welche wichtigen Angaben fehlen noch?“ |

**Kategorie A – notwendige Fachbegriffe:** unter anderem Äquator, Niederschlag, Savanne, natürliche Veränderung, Zuzug/Fortzug, Verdunstung, Entnahme, Einnahmen, Ausgaben und Überschuss bleiben erhalten. Die Erklärungen beginnen möglichst mit einer Handlung oder einem konkreten Beispiel. Regenzeiten, Landschaften und Naturraumnamen werden nicht durch ungenaue Alltagswörter ersetzt.

**Kategorie B – Begriffe für die jeweilige Denkaufgabe:** Wanderungssaldo, Investition, BIP, Beleg und Zielkonflikt bleiben zugänglich. Investition wird anhand einer Anschaffung erklärt, BIP anhand von Waren und Leistungen eines Landes. Bei den bearbeiteten Fragen steht häufig die einfache Bedeutung statt des Fachworts. Anspruchsvolle Quellenkritik bleibt erhalten: Ein Einkommensanstieg nach einer Schulung beweist allein noch keine Ursache.

**Kategorie C – unnötige abstrakte Sprache:** Zukunftsrendite, Wartungszuständigkeit, Bezugsebenen, Gesamtökobilanz und abstrakte Aufträge zu Ausgangsgrößen sind aus den betreffenden Schülertexten entfernt. Technische Statuswörter im normalen Lernjournal werden durch verständliche Angaben ersetzt. Auch gespeicherte englische Statuskennungen werden dort verständlich angezeigt; die Kennungen selbst bleiben unverändert.

Bewusst beibehalten wurden kurze klare Texte, genaue Zahlen, Einheiten, Zeiträume, Ortsnamen, Quellenbezeichnungen und rechtliche Angaben. Präzise Metadaten wie Datenbasis, Preisbereinigung oder Flächenbezug bleiben in den Quellenangaben erhalten und werden im Lerntext erklärt. Die falschen pauschalen Aussagen in den Aufgaben zum Modell-/Realitätsunterschied bleiben dort erhalten, wo gerade das unzulässige Verallgemeinern Gegenstand der Aufgabe ist.

## Didaktische Präzisierungen

**ESA-Bilderweg:** `image.headline.evidence` und `image.headline.revision` zeigen beide den Kontext der erfundenen Schulzeitung. Die lokale Ergänzung bleibt nach Reload und Rücksprung sichtbar. Der allgemeine Aufteilungsmechanismus wurde nicht geändert. Aufgaben- und Antwortkennungen bleiben gleich.

**AHR-Busbeispiel:** `demand.cause` erklärt eine zusätzliche Fahrt als insgesamt drei Fahrten mit je 10 Plätzen, also zusammen 30 Plätzen pro Stunde. Der Fußweg bleibt dabei 12 Minuten. Der neue Weg verkürzt ihn auf 4 Minuten, lässt aber 20 Plätze. Kosten, genaue Fahrzeiten und Wartezeit bleiben als fehlende Angaben benannt. Hilfe 3 zeigt die richtige Erklärung; erst die bewusste Übernahme speichert sie als genutztes Beispiel. Der eigene Text bleibt fachlich ungeprüft.

**Ghana-Verarbeitung:** Zuerst stehen die ungeordneten Verarbeitungskarten und die Begriffe Rohstoff/Verarbeitung im Mittelpunkt. Finanzdaten sind in diesen Schritten aufklappbar. In den späteren Rechen- und Entscheidungsaufgaben stehen sie wieder unmittelbar bereit. Alle Zahlen, Modellgrenzen und die Trennung von laufenden Kosten und einmaliger Anschaffung bleiben erhalten. Es entsteht weder ein neuer Schritt noch ein zusätzliches Pflichtfeld.

**Lernjournal und Rückmeldungen:** Kürzere Statusmeldungen unterscheiden weiterhin offene, geprüfte und ungeprüfte Antworten, Hilfeansicht und Beispielübernahme. Historische Antworten behalten ihre damaligen Inhalte und ihre Hilfeherkunft. Fehlende oder unklare Eingaben werden nicht zu fachlichen Fehlern umgedeutet. Eigene Texte erhalten keine automatische Bewertung.

## Schutz und tatsächliche Prüfungen

28 zentrale Modell-, Quellen-, Zustands-, Bewertungs-, Lockfile- und Workflowdateien sind bytegleich mit dem Ausgangscommit. In zehn Dateien, die Programmcode und Texte mischen, sind Programmstruktur und numerische Konstanten nachweislich unverändert; Textliterale werden für diesen Vergleich ausgeblendet. Die 52 Strukturregressionen und der zusätzliche Vergleich aller dokumentierten aufgelösten Vorschläge schützen auch die IDs und Sollantworten. Die bisherigen Modell- und Verhaltenstests bleiben vollständig erhalten.

**730 unterschiedliche Browserfälle bestanden in Chromium und WebKit**: Im vollständigen Lauf bestanden 729; ein Chromium-Fall mit fünf Themen, Tastatur, Accessibility-Prüfungen und schmaler Einbettung überschritt bei vier parallelen Prozessen die Grenze von 30 Sekunden. Derselbe Test bestand unverändert allein in 13,5 Sekunden. Beim Abbruch war zusätzlich die Trace-Datei unvollständig. Es wird kein fehlerfreier einzelner Gesamtlauf behauptet.

Alle **52 Varianten wurden regulär und unterstützt in beiden Browsern vollständig durchlaufen** (208 eindeutige Kombinationen). Hinzu kommen Prüfungen von Fehlerfarben, Hilfen 1–3, bewusster Beispielübernahme, offenen Entscheidungen, Reload/Rücksprung, Profilwechseln, Journal und alten Spielständen. Die neuen Fälle prüfen ausdrücklich die sichtbaren ESA-Behauptungen, die AHR-Erklärung und die Materialreihenfolge aller vier Ghana-Wege. Tastatur, Touch, 1024 × 768 sowie schmale Einbettung sind im Lauf enthalten. Acht ausgewählte [Bildbelege](evidence/sprachrevision/README.md) ergänzen die [maschinenlesbaren Ergebnisse](evidence/sprachrevision/checks.json).

Die native Abschlussprüfung besteht mit **465 Tests**, ohne übersprungene Tests. TypeScript, Produktionsbuild und der strenge Artefaktprüfer bestehen. Der Build enthält weiterhin genau fünf zugelassene Dateien: HTML, JavaScript, CSS und zwei lizenzierte Fotos. Keine Original-PDFs, Schülerdaten, Berichte, Teststände, Abhängigkeitsordner oder Zugangsdaten gelangen in den Build.

Erwartungen an bewusst geänderte Formulierungen und zugängliche Beschriftungen wurden in vorhandenen Tests aktualisiert. Keine Tests wurden gelöscht, übersprungen oder durch schwächere Verhaltensprüfungen ersetzt. Der ursprüngliche Test zum Hilfe-Begriff „Beleg“ führte dazu, den Begriff im neuen konkreten Hinweis ausdrücklich einzuführen. Erste Läufe mit alten Textselektoren sowie abgebrochene Zwischenläufe zählen nicht als bestandene Gesamtläufe.

## Grenzen und Übergabe

Die unabhängige Schlussabnahme bleibt erforderlich. Kurze Sätze und bestandene Tests belegen keine tatsächliche Lernwirksamkeit. Lesetempo, Verständnis bei DaZ, Nutzung der Hilfen und selbstständige Begründungen müssen mit Lernenden erprobt werden. Auch die physische Schul-iPad-/Safari- und vollständige Screenreader-Abnahme bleiben offen. Linux-WebKit und 1024×768-Emulation decken diese Hardwareprüfung nicht vollständig ab.

Nach dem überprüfbaren lokalen Commit wird ein kompaktes Prüfpaket mit Quellstand, Tests, Textinventar, Protokollen und ausgewählten Aufnahmen bereitgestellt. Keine weitere allgemeine Textentwicklung, keine neuen Inhalte, keine Klassenarbeit, keine neue Speicherung und keine SCORM-Implementierung. **Kein Push, PR, Merge oder Deployment im Rahmen dieses Auftrags.**
