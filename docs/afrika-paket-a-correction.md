# Paket A – gezielte Nachbesserung nach unabhängiger Prüfung

Basis: `be814ec49263446c142953622789bf2570641c87`, Branch `feat/afrika-vier-lernwege`. Vor Beginn exakt geprüft, Arbeitsbaum sauber. Der Commit dieses Berichts ist mit `git rev-parse HEAD` prüfbar; das Prüfpaket nennt die vollständige SHA in `BESTAND.json`. Der verbindlich einbezogene Korrekturauftrag und die Ergänzung des Nutzers sind umgesetzt. Der Satz „noch nicht erteilt“ im vorbereiteten Anhang ist durch diesen ausdrücklichen Auftrag überholt.

## Befunde und Änderungen

| Befund                   | Gezielte Änderung                                                                                                                                                                                                                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P2-01 / Einstiegslinks   | Einmaliger URL-Vertrag mit Konfliktabfrage. Bestätigter Profilwechsel überlebt Reload; neue Empfehlung bleibt ausdrücklich möglich.                                                                                                                                                                                               |
| P2-02 / Förderweg        | Erst zwei gerundete Ghana-Werte, einfache Einführung der Schätzung, genaue Werte und vollständige Quelle freiwillig aufklappbar. Ortsgrenze und Ereignisskizzen mit Textalternativen. Wörter zum aktuellen Schritt zuerst; gesamter Wortschatz freiwillig. Einfache Status- und Journaltexte, Herkunftsdetails weiter erreichbar. |
| P2-03 / Positionen       | Feste Reihenfolge pro semantischer Situation. Richtige Antworten wieder an allen drei Positionen. IDs, Aussagen und Bewertung unverändert.                                                                                                                                                                                        |
| P3-01 / Historie         | Gemeinsame Begrenzung für berechnete, geschriebene und mündlich selbstgemeldete Abgaben. 40 jüngste gültige Einträge; jeder weitere erhöht den älteren Zähler. Überlange Altlisten werden beim Lesen entsprechend verdichtet, nicht still abgeschnitten.                                                                          |
| P3-02 / AHR              | Neue Behauptung zum Zuzug anhand der Gesamtbevölkerung prüfen. Datenart, Ort, Zeitraum, Einheit und Quelle bleiben sichtbar. Die fertig formulierte Ursachengrenze steht in Hilfe/Kriterien, nicht im normalen Materialtext vor der Aufgabe.                                                                                      |
| P3-03 / Sprache und Raum | Eindeutiger Vergleich „Mehr Menschen ziehen weg als zu …“ und „Wer braucht über Nord mehr Zeit?“. Nairobi als echter Ort, Wege erfunden. Benannte Haltestellen, ganze Linie und tatsächlich mitgefahrener Abschnitt aus dem vorhandenen Netz.                                                                                     |

Der Förderweg zeigt Richtung und Mengen, verrät aber nicht vorab die zu wählende Gesamtwirkung. Teilrechnungen sind dort ausdrücklich vorgegeben, keine selbst gerechnete Leistung. Die zusätzlichen M4-Annahmen bleiben erfunden; bei Förder stehen Schulplätze/Lehrkräfte nicht schon als fertige Lösung im Material. Die Ereignisskizzen sind schematische Hilfen, keine neuen Bevölkerungsdaten oder dokumentarischen Bilder.

### URL-Vertrag

Nur genau ein `lernweg` (`foerder`, `esa`, `msa`, `ahr`) und genau ein `bereich` (`c`, `s1`) ergeben eine Empfehlung. Unvollständige, doppelte oder unbekannte Werte bewirken keinen Wechsel. Ohne Empfehlung wird der gespeicherte Stand angezeigt.

- Frischer Stand ohne Profil: empfohlenen Weg und Bereich öffnen und speichern.
- Gleiches gespeichertes Profil: gewünschten Bereich mit dessen bisheriger Aufgabe öffnen.
- Abweichendes gespeichertes Profil: bisherigen aktiven Weg, Bereich, Antworten und Aufgabe beibehalten; vorgeschlagenen Weg/Bereich in einer sichtbaren Abfrage nennen. Bestätigung öffnet dessen eigenen gespeicherten Stand oder einen neuen eigenen Entwurf. Abbruch kehrt zur bisherigen Aufgabe zurück.
- Nach direkter Übernahme, Bestätigung oder Abbruch beide konsumierten Parameter per `replaceState` entfernen. Pfad einschließlich Pages-Unterpfad, andere Parameter samt Mehrfachwerten und Hash bleiben erhalten; URL-Encoding darf normalisiert werden. Ein später neu aufgerufener Rohlink ist eine neue Empfehlung.
- Zurück/Vorwärts wendet nur eine tatsächlich vorhandene neue Empfehlung an; verbrauchte History-Einträge setzen kein Profil zurück. Wiederkehr aus dem Browser-Seitencache liest den aktuellen Tabstand. Bei gesperrtem Speicher bleibt die aktuelle Bearbeitung im Arbeitsspeicher erhalten.

Kein automatischer Profilwechsel aufgrund von Fehlern, kein Kopieren fremder Antworten, keine Umdeutung alter Abschlüsse. Versuchkennungen bleiben getrennt.

## Fachlich-didaktische Einordnung

Die Prüfung unterscheidet gezählte Änderung, Bestand und die Beiträge natürlicher Veränderung/Wanderung. M1 bleibt +30/−10/+20/1020, M3 +16/−12/+4/804 und der Gegenfall +30/−40/−10/990. Ghana bleibt eine historische Schätzung, keine Prognose oder Ursachenzerlegung. Aus dem Wachstum allein folgt kein Nachweis zunehmenden Zuzugs. Kenia bleibt Amina 22/10, David 12/18; Amina steigt bei Nord ein und fährt nur Nord → Zentrum, David ab Platz beide Nordabschnitte. Die neue Haltestelleninformation kommt aus `boarding`/`lineStops`, nicht aus einem zweiten Routenmodell.

Die neue AHR-Behauptung verlangt die Anwendung einer Materialgrenze. Die korrekte Einsicht kann freiwillig erschlossen, mit Hilfe erarbeitet oder am Beispiel übernommen werden; diese Wege bleiben gekennzeichnet. Eigene Texte und mündliche Selbstmeldungen bleiben auch nach Kriterienaufruf und Überarbeitung fachlich ungeprüft. Tatsächlicher Selbstvergleich und Rückmeldung durch Partner/Lehrkraft sind Unterrichtshandlungen, die das Programm nicht beobachtet oder automatisch bestätigt.

Paket A bleibt ein Muster mit acht Bereich-/Profilkombinationen und 61 Teilaufgaben: Bevölkerung 14/13/8/8, früher Kenia-Vergleich 4/6/4/4. Die anderen 44 Varianten werden nicht entwickelt. Fachlicher Anspruch und Deutschkenntnisse werden nicht gleichgesetzt; Hilfe ist in allen Profilen zugänglich. Einfache Formulierungen, gestaffelte Quellen und die Ortsgrenze senken vermeidbare Leseanforderungen. Keine zertifizierte Leichte Sprache und kein empirisch nachgewiesener Verständlichkeitsgewinn.

## Verifikation

Tatsächliche Umgebung: Node 24.19, Playwright 1.64.1, Chromium 154.0.8037.57 und WebKit 27.2 unter Linux. WebKit startet über die bereits eingerichtete lokale Bibliotheksumgebung `WEBKIT_PATH=/workspace/.cache/afrika-webkit-deps/run-webkit`; keine zusätzliche Anwendungsabhängigkeit. Produktionsbuild und Prüfserver verwenden ausschließlich den lokalen Stand.

| Prüfung                      | Konkretes Ergebnis                                                                                                                                                                                                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gesamte Logiksuite           | **239 bestanden**, 0 Fehler/übersprungen: vorhandene 230 Fälle plus neun neue.                                                                                                                                                                                             |
| Acht Pilotwege               | **32 vollständige Browserdurchläufe**: 8 Kombinationen × regulär/unterstützt × Chromium/WebKit. 244 Teilaufgabenbearbeitungen.                                                                                                                                             |
| Neue/geänderte Browserfälle  | 76 verschiedene Fälle; zusätzlich zwei geschützte Tastaturkontrollen. Der 78er-Lauf bestand zunächst 76 Fälle; die zwei Historienfälle wurden nach Präzisierung der Speichererwartung gezielt erneut geprüft. Protokolle weisen beide Läufe aus.                           |
| Geschützte/Gate-0-Regression | 145/146 im kombinierten Lauf erfolgreich; der dort erkannte WebKit-Sprunglinkfehler wurde korrigiert und in der abschließenden Tastaturkontrolle erneut geprüft. Zusammen **222 verschiedene gezielte Browserfälle erfolgreich**; keine gesamte historische Belegsammlung. |
| Produktionsbuild             | TypeScript und Vite erfolgreich; genau HTML, JS, CSS und zwei bytegleiche freigegebene JPEGs. Enger Build-Prüfer erfolgreich.                                                                                                                                              |
| Positionsprüfung             | 16 Situationen, richtige Antwort 5 × Position 1, 7 × Position 2, 4 × Position 3; eigene positive und negative Kontrollen, stabile IDs/Reihenfolge.                                                                                                                         |
| Schutzprüfung                | Unveränderte gemeinsame Modelle, Daten, Karte, Fotos, Bewertungsfunktionen und Lockfile per Bytevergleich; Aufgaben-/Antwort-IDs, Sollwerte und Auswahltexte aller 61 Pilotaufgaben gleich.                                                                                |
| Format                       | Geänderte Projektdateien bestehen die Formatprüfung; keine globale historische Formatbereinigung.                                                                                                                                                                          |

Reguläre Browserwege nutzen feste, aus Spezifikation und eigener Rechnung festgelegte Sollantworten (`tests/learning-oracles.ts`), nicht `exampleValue`. Unterstützte Wege prüfen bewusst die Beispielübernahme. Die ursprünglichen 230 Logikfälle bleiben erhalten. Der alte Positionsmaßstab wurde sachlich ersetzt: alle drei Antwortpositionen müssen über die 16 Situationen jeweils mindestens viermal richtig sein. Kein Fall wurde gelöscht oder übersprungen.

Die zwölf gerichteten Profilwechsel prüfen sichtbare Profilbezeichnung, konkrete Aufgabenüberschrift/Position und gespeicherte Profil-ID gemeinsam, einschließlich Abbruch, Bestätigung, Zielwiederaufnahme, Reload und Rückwechsel. In vier Herkunftsszenarien bleiben Entwürfe, abgegebene Angaben, Beispiele und ein tatsächlich per Reducer abgegebener ungeprüfter AHR-Text getrennt erhalten. Förder/ESA erhalten dabei keine fremden Texte als eigene Leistungen. Ein neuer frischer Tab, bewusst neu aufgerufene widersprechende Links, Reload während der Wechselabfrage, echter Dokumentverlauf und History-API-Zurück/Vorwärts sind geprüft.

Weitere Fälle prüfen sichtbare Feedbackfarben/-texte, richtige Teile, leere/unklare Zahlen ohne neuen Fachfehler, zweiten echten Fehler, Beispielanzeige ohne Übernahme, bewusste Übernahme, spätere Änderungen, beide legitimen Prioritäten und fachlich ungeprüfte eigene Texte. Überlange Historie: erst sichtbare 40 + 22 ältere aus 55 gespeicherten Einträgen mit bereits 7 älteren; anschließend normale Navigation und Reload mit unverändertem aktuellen Text. Lesen allein schreibt absichtlich nicht zurück. Mündliche 45 Abgaben ergeben bereits vor Reload 40 + 5 ältere.

Geräte: reguläre neue Wege bei **1366 × 900**, unterstützte Wege mit Touch bei **1024 × 768**; zusätzlich 720 × 900 und der bestehende tatsächliche 640 × 650-Inhaltsframe. Bedienung mit Maus, Touchereignissen, Tastaturfokus/Enter und HTML-Alternativen; SVG-Namen und beide Zustandsrichtungen bleiben geprüft. Axe-A/AA-Tags einschließlich WCAG 2.1 A und 2.2 A in ausgewählten Aufgaben-/Journalzuständen ohne erkannte Verstöße. Das ist keine vollständige manuelle WCAG-Abnahme. In den vollständigen Pilotwegen keine erfassten Seitenfehler oder externen Laufzeitrequests. Die bekannten macOS-Probleme der nativen Pfeiltastenauswahl bleiben ausdrücklich außerhalb dieses Linux-Nachweises.

Die ersten Fehlläufe liegen offen im Paket: veralteter Positionsmaßstab, Standard-WebKit ohne nötige lokale Bibliotheken, fehlende ausführliche Quelle in der bisherigen Materialaufklappung und unzureichende Studien-Testvorbedingungen. Der kombinierte Lauf hatte 219 bestandene und drei fehlgeschlagene Fälle: ein zu breiter neuer Aufklappselektor in beiden Engines sowie eine eigene History-Regression, die beim Sprunglink den WebKit-Fokus zerstörte. Die History-Behandlung ist jetzt auf Empfehlungen begrenzt; normale Hash-Sprünge bleiben dem Browser überlassen. Die spätere Ergänzung des Überlängenfalls hatte zunächst eine falsche Erwartung unmittelbarer Speicherung beim Lesen; der Test prüft jetzt ausdrücklich die sichtbare Verdichtung **vor** und den gespeicherten Zustand **nach** einer normalen Navigation. Diese Befunde wurden behoben/präzisiert, nicht durch Überspringen verdeckt.

### Zustandsgrößen und Wiederaufnahme

Gemessen mit echten Reducer-Handlungen, unabhängigen Sollantworten und einem ersten Abgabeversuch je Aufgabe; jede vierte Aufgabe mit Beispielunterstützung. Ältere Episoden-/Themenzweige sind im Messmuster leer. Lange Texte sind ausdrücklich synthetische aktuelle Entwürfe mit jeweils 2.000 Zeichen. Der Größenvergleich und die Wiederaufnahme der Inhalte sind getrennt geprüft.

| Musterszenario                  | UTF-16-Einheiten | UTF-8-Bytes |
| ------------------------------- | ---------------: | ----------: |
| Ein Profil, beide Pilotbereiche |           12.589 |      12.589 |
| Zwei Profile                    |           24.987 |      24.995 |
| Drei Profile                    |           33.472 |      33.498 |
| Alle acht Pilotwege             |           42.956 |      43.026 |
| Alle acht, lange Textentwürfe   |           56.076 |      56.123 |

Alle gemessenen Aufgabenstände lassen sich inhaltlich unverändert wiederherstellen. Dies sind konkrete Beispiele, keine garantierte Obergrenze: häufige Abgaben, volle alte Spielstände und zukünftige Varianten können größer sein. Ein JSON-Schlüsselreihenfolgevergleich wäre dafür ungeeignet; verwendet wurde ein tiefer Inhaltsvergleich. Der spätere Mindestdatensatz und vermeidbare abgeleitete Texte stehen in `afrika-progress-migration.md`. Keine SCORM-API, kein Codec oder Datenversand implementiert.

Protokolle, Quell-Diff und repräsentative Bildschirmaufnahmen liegen im Prüfpaket außerhalb des Repositorys. Der vollständige versionierte Stand wird über Git-Bundle und Quellmanifest gesichert; der frische Offline-Clone wird byteweise geprüft und führt die Logiksuite erneut aus.

## Grenzen und Stopp

Technische Tests, Codeprüfung und didaktische Einschätzung sind getrennte Nachweise. Es gibt keine neue Schülerbeobachtung, Zeitmessung im Unterricht, Hardware-Safari-/Schul-iPad- oder vollständige Screenreader-Abnahme. Die in der unabhängigen macOS-Prüfung offene native Pfeiltastenbedienung wird durch Linux-Tests nicht widerlegt; Anfangsbuchstabenauswahl, Tab/Fokus und Enter sind separat prüfbar. Ein Kapitelabschluss ist kein Beleg selbstständiger Urteilskompetenz oder Klassenarbeitsreife.

Ein kleiner begleiteter Pilot und erneute unabhängige Prüfung bleiben nötig. Speicherung bleibt nur im aktuellen Browser-Tab. Kein SCORM, LMS-Versand, Konto, neues Spielsystem, Arbeitsblatt oder Lehrkräftehandreichung. Kein Paket B, Push, Merge, Release, Deployment oder administrative Änderung. Nach Korrekturcommit und Prüfpaket endet die Arbeit.
