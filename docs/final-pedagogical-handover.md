# Letzte fachdidaktische Korrektur – Übergabe

Referenz exakt `bd1e0db099a4de5aad59215da392926ad6119910`, sauber auf `feat/release-candidate-1`; keine Abweichung. Korrekturbranch: `fix/final-pedagogical-corrections`. Der nach dem Commit erzeugte externe Bericht und `Commit.json` benennen die vollständige neue SHA. Kein Push, Merge oder Deployment.

## Vorher und nachher

**P2-01:** Bisher konnte Hilfe 3 „Weiter“ freigeben, während eine falsche Auswahl gesperrt und die rote Rückmeldung aktuell blieb. Nun lautet der gelbe Abschluss **„Mit Erklärung bearbeitet“**. Die richtige Erklärung steht in der vorhandenen Hilfe 3, unbestätigte Antwortfelder werden entfernt und deshalb nicht als gültige aktuelle Auswahl angezeigt. Vorher richtige Teilinformationen werden kurz anerkannt. Die Unterstützung bleibt gekennzeichnet; Weitergehen benötigt keine neue Bestätigung. Die freiwillige Transferaufgabe bleibt verfügbar.

Eine vor Hilfe 3 bereits passend ausgewählte und grün bestätigte Antwort bleibt dagegen grün, ausgewählt und bestätigt. Sie wird nicht als übernommenes Beispiel markiert. Am Schluss steht getrennt, dass nach der bestätigten Antwort zusätzlich eine Erklärung angesehen wurde. Das behauptet keine umfassende selbstständige Urteilskompetenz.

Die Normalisierung verwendet für aktuelle Aktionen und gültige gespeicherte RC1-Zustände dieselbe Funktion. Ein gespeichertes Grün mit passender Auswahl und bestätigtem Abschluss ist ein tatsächlicher Bestätigungsnachweis: Der alte automatische Hilfeabschluss erzeugte selbst kein grünes Feedback. Der dabei irrtümlich nachträglich gesetzte Unterstützungsmarker wird berichtigt, ohne die bestätigte Antwort zu ändern. Fehlt dieser Nachweis oder ist die gespeicherte Auswahl widersprüchlich, wird der Hilfeabschluss ausdrücklich unterstützt geöffnet. Es wird keine historische eigenständige Leistung erfunden. Die Normalisierung ist wiederholbar; andere Episoden, Empfehlungen und Transferstände bleiben erhalten. Speicherformat/-schlüssel und Architektur bleiben gleich.

**P2-02:** Alle regionalen dritten Lernschritte zeigen im bestehenden Wörterbereich vier eigene Erklärungen: Vorschlag, Beleg, Grenze und Gewichten. „Grenze“ meint ausdrücklich die Grenze des Vorschlags, keine Landesgrenze. Die erste Kakao-Wörterliste enthält zusätzlich Genossenschaft. Bestehende Erklärungen zu Überschuss, Entnahme, Verbrauch und den weiteren Untersuchungsschritten bleiben erhalten. Die vier allgemeinen Entscheidungsbegriffe enthalten keine veränderlichen Zahlen oder fremden Maßnahmenbeispiele. Wörterlesen verändert nur den aufgeklappten Wörterbereich, weder Fehlversuche noch Beispielherkunft.

**Fachsprache:** Die Kakao-Leitfrage lautet nun exakt: „Warum bleibt bei mehr Verarbeitung hier nicht automatisch mehr Überschuss übrig?“ Überschussdefinition, Einnahmen, laufende Ausgaben, Investitionen und Berechnungen sind unverändert.

## Geänderte Dateien

- `src/feedback.ts`: gemeinsame Konsistenzregel für die ersten drei Hilfeabschlüsse, ohne Änderung der bisherigen fachlichen Bewertungsfunktionen.
- `src/state.ts`, `src/storage.ts`: Regel bei Hilfe 3, automatischer Erklärung und Wiederherstellung anwenden.
- `src/main.ts`: keine scheinbar aktuelle unbestätigte Auswahl; getrennte Kennzeichnung zusätzlich gelesener Erklärungen im Abschlussbericht.
- `src/regions/ui.ts`, `src/regions/cocoa.ts`: passende Wortlisten und präzisierte Leitfrage.
- Neue gezielte Logik-/Browsertests; WebKit-Testregistrierung in `playwright.config.ts`; angepasster Arbeitsumfang in `AGENTS.md`. Auftrag wortgetreu in `final-pedagogical-request.md`.

32 andere Quelldateien sind bytegleich zum Referenzstand. Die Optionen, Untersuchungs-/Bewertungsfunktionen und Modellrechnung der Kakao-Episode wurden nicht verändert. Zahlenorakel und vollständige Berichtsprüfungen schützen außerdem alle übrigen Modelle, die 120-GE-Verteilung, Wasser-/Tankwerte, Straßenereignis, Nachfrage, Karte, RC1-Reihenfolge, Speicherwarnung und Navigation. Nachweis im separaten Belegpaket: `protected-source.json` und Testprotokolle.

## Tatsächliche Prüfung

**170/170 Logiktests bestanden:** sämtliche 159 bisherigen plus elf neue Fälle. Geprüft sind für jede frühe Aufgabe fehlende, falsche und noch nicht bestätigte richtige Auswahl, bereits bestätigte richtige Antwort, alte widersprüchliche Zustände und alte grüne Bestätigung mit falschem Unterstützungsmarker. Außerdem Teilanerkennung, maximal zwei Fehlversuche, Transfer, Rücksprung und Neuversuch. Produktionsbuild erfolgreich.

**80/80 Browserfälle bestanden**, aufgeteilt in zwei gezielte Läufe ohne gelöschte oder abgeschwächte Altprüfungen:

- 28 Fälle: 14 vorhandene vollständige Kenia-Prüfungen und 14 neue Fälle. Neue Fälle mit Maus/Desktop, Touch und Tastatur bei 1024 × 768 prüfen alle ersten drei Aufgaben, Hilfen 1–3, sichtbare gelbe/grüne Status, keine alte rote Aufforderung, tatsächliches Weitergehen, freiwilligen Transfer, Neuladen, Rücksprung, Neubearbeitung, Legacy-Wiederherstellung und abschließende Herkunftskennzeichnung. Vier regionale Direktstarts mit passender Wörterliste in jedem Schritt; fachlich zutreffende Begründung und legitimer Zielkonflikt; kein Fehlversuch oder Beispielmarker durch Wörterlesen. Netzwerkprüfung der neuen Kenia-Lernwege ohne externe Laufzeitrequests.
- 52 ergänzende bestehende Fälle: gesamte Berichte und ausgewählte Maßnahmen aller sechs Episoden, Karten, RC1-Antwortpositionen, Speicherwarnung/-wiederherstellung, Ereignisnavigation mit Viewport-Koordinaten, direkte Einstiege, lokaler Pages-Unterpfad und ein schmaler simulierter Inhaltsframe. Keine neue SCORM-Anbindung.

Screenshots der unterstützten Kenia-Aufgabe und der offenen Kakao-Entscheidungswörter wurden visuell kontrolliert. Axe mit den vorhandenen sechs WCAG-A-/AA-Tags zeigte in den neu geprüften Zuständen keine Verletzung. Das ist kein vollständiger Screenreader-Nachweis.

## Reichweite und nächste Prüfung

Selbst ausgeführt sind die oben genannten Chromium-Interaktionen und Logik-/Buildprüfungen. Die Aussage über unveränderte Fachmodelle stützt sich zusätzlich auf Quellvergleich und unveränderte Zahlenorakel. Didaktisch beseitigt die Korrektur widersprüchliche Status und macht benötigte Begriffe vor Ort verfügbar. Eine tatsächliche Verbesserung des Lernerfolgs oder selbstständige Urteilskompetenz wurde nicht empirisch nachgewiesen.

WebKit wurde erneut zu starten versucht; die Engine fehlt. Die neuen Fälle sind registriert, aber ein aktueller WebKit-/Safari-Nachweis und ein Test auf physischem Schul-iPad bleiben offen. Kein Unterrichtsversuch und keine neue Prüfung der realen itslearning-Installation. Die drei curricularen Original-PDFs bleiben unverändert; keine Arbeitsblätter oder Lehrkräftehandreichungen erstellt.

Die kompakte Prüfdatei enthält den aktuellen statischen Produktionsbuild, Patch zum bekannten Referenzcommit, vollständige neue Commit-ID, Berichte, aktuelle Protokolle und zwei repräsentative Bilder. Der Patch wird gegen den Referenzstand angewandt und der gesamte rekonstruierte versionierte Dateistand byteweise verglichen. Keine Wiederholung großer historischer Belegarchive, keine Zugangsdaten oder Abhängigkeitsordner. Der Download über den Cloud-Client ist hier nicht unabhängig bestätigbar. Nach Bereitstellung stoppen; unabhängige gezielte Nachprüfung entscheidet über eine spätere Freigabe.
