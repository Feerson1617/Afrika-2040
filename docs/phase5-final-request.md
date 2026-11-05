# AFRIKA 2040 – KONSOLIDIERTER CODEX-KORREKTURAUFTRAG

## Phase 5 abschließen und spätere SCORM-Umwandlung vorbereiten

### 1. Projekt und Ausgangsstand

Repository: `Feerson1617/Afrika-2040`

Ausgangsbranch: `feat/phase5-geographie-und-didaktik`

Verbindlicher Referenzcommit:

`02aae52052736aff53cdf8b096f0a4bd2614f775`

Prüfe vor Beginn den tatsächlichen Branch, Commit und Arbeitsstand.

Falls inzwischen weitere Commits existieren, dokumentiere die Abweichungen und prüfe, ob die genannten Fehler weiterhin bestehen. Überschreibe keine neueren Änderungen.

Erstelle für diese Korrekturrunde einen separaten Entwicklungsbranch:

`feat/phase5-final-scorm-readiness`

Das Projekt umfasst sechs entwickelte Episoden in Kenia, Ghana und Marokko sowie eine geographische Orientierungskarte und einen gemeinsamen Rückblick.

Die unabhängige Work-Prüfung hat die fachlichen Modelle, die grundlegende Bedienung und die neu ergänzten geographischen Lernhandlungen weitgehend bestätigt.

Es wurden drei Probleme dokumentiert. Davon sind aufgrund der tatsächlichen schulischen Nutzung zwei verpflichtend zu korrigieren.

Zusätzlich soll die spätere technische Umwandlung in ein SCORM-Paket vorbereitet werden.

**Wichtig: Es wird noch kein vollständiger SCORM-Export implementiert. GitHub Pages bleibt vorerst das primäre Veröffentlichungsmodell.**

### 2. Verbindliche pädagogisch-didaktische Vorgaben

Das Spiel richtet sich an eine stark leistungsheterogene 7. Klasse einer Gemeinschaftsschule in Schleswig-Holstein.

Ein Teil der Lernenden verfügt über geringe Lese- und Sprachkompetenz beziehungsweise einen hohen sonderpädagogischen Unterstützungsbedarf.

Deshalb gelten weiterhin:

- Pädagogische und didaktische Qualität haben Vorrang vor technischem Funktionsumfang und grafischer Gestaltung.
- Fachliche Richtigkeit ist unverzichtbar.
- Die Sprache muss einfach, aber fachlich präzise sein.
- Fachbegriffe werden verständlich eingeführt und erklärt.
- Die Lernenden bearbeiten gemeinsame Problemstellungen mit unterschiedlich starken Hilfen.
- Richtige Teilantworten werden anerkannt.
- Falsche fachliche Aussagen erhalten rote Rückmeldungen.
- Richtige Aussagen erhalten grüne Rückmeldungen.
- Teilweise richtige Antworten und Hilfen werden gelb dargestellt.
- Legitime unterschiedliche Entscheidungen werden neutral bewertet.
- Nach höchstens zwei vollständig bewertbaren Fehlversuchen folgt eine konkrete Erklärung mit bedienbarem Weiterweg.
- Übernommene Beispiele werden als Unterstützung gekennzeichnet.
- Freitexte werden nicht durch unzuverlässige Schlüsselworterkennung benotet.
- Es gibt keine Punktabzüge für Fehler und Hilfen.
- Das Modell wird nicht als reale Statistik oder sichere Zukunftsprognose ausgegeben.
- Ein erfolgreich abgeschlossenes Spiel beweist keine eigenständig entwickelte Urteilskompetenz.

Sämtliche bisher behobenen Fehler und die geprüften Modellberechnungen müssen erhalten bleiben.

### 3. Neue verbindliche Gerätevorgabe

**Die Schul-iPads werden ausschließlich im Querformat genutzt.**

Daraus folgt:

Primär zu optimieren und zu prüfen sind:

- iPad im Querformat, insbesondere 1024 × 768 CSS-Pixel,
- gegebenenfalls weitere realistische iPad-Querformatgrößen,
- Desktop-Browser.

Das iPad-Hochformat ist kein verpflichtender Einsatzmodus und darf bei dieser Korrektur vernachlässigt werden.

Der Work-Befund F1 zu den kleinen Beschriftungen der Rückblickkarte bei 768 × 1024 ist deshalb **kein Freigabeblocker mehr**.

Es ist keine gesonderte Hochformatoptimierung durchzuführen.

Eine begrenzte Ausnahme gilt für die technische SCORM-Vorbereitung: Ein Lernmanagementsystem kann auf einem quer gehaltenen iPad innerhalb eines Inhaltsfensters weniger Breite bereitstellen als der gesamte Bildschirm.

Die Anwendung soll deshalb auch bei einem schmaleren eingebetteten Inhaltsbereich grundsätzlich bedienbar bleiben.

Hierfür reicht eine kompakte Prüfung der responsiven Darstellung. Eine vollständige neue Hochformatoberfläche ist ausdrücklich nicht beauftragt.

---

# ABSCHNITT A – SPEICHERFEHLER KORRIGIEREN

## A1. Ausgangsbefund F2

In den neuen Lernbereichen zur geographischen Orientierung und zum gemeinsamen Rückblick fehlt eine Warnung, wenn der Browser die Speicherung blockiert.

Die Lernenden können Aufgaben richtig bearbeiten. Nach dem Neuladen sind die Antworten jedoch verloren, ohne dass sie vorher darüber informiert wurden.

Der bisherige Code verwendet `saveSession()` in `src/storage.ts`.

Diese Funktion gibt bereits zurück, ob die Speicherung erfolgreich war.

Der neue Geographie-Aktionsweg in `src/main.ts` berücksichtigt diesen Status bisher nicht ausreichend.

## A2. Korrektur

Verbessere die Speicherung so, dass der tatsächliche Erfolg auch in den Geographie-Lernhandlungen berücksichtigt wird.

Bei fehlgeschlagener Speicherung erscheint eine kurze, verständliche Rückmeldung, beispielsweise:

„Deine Antwort stimmt. Sie konnte aber nicht gespeichert werden. Beim Neuladen kann sie verloren gehen.“

Anforderungen:

1. Fachlich richtige Antworten bleiben richtig.
2. Kein Punktabzug und keine fachliche Fehlerzählung aufgrund eines Speicherproblems.
3. Das Spiel bleibt im aktuellen Browserzustand weiter bedienbar.
4. Bereits vorhandene Hilfen und Unterstützungskennzeichnungen bleiben erhalten.
5. Bei erfolgreicher Speicherung darf keine falsche Warnung erscheinen.
6. Bereits gespeicherte gültige Daten dürfen nicht unnötig verloren gehen.
7. Wiederholte Speicherfehler dürfen nicht zu einer Flut identischer Meldungen führen.
8. Tastatur- und Screenreader-Nutzer müssen die Warnung wahrnehmen können.

Nutze möglichst die vorhandene Speicherverwaltung.

Entwickle keine zweite parallele Speicherlogik.

Keine neue Datenbank, kein Server, keine externen Konten und keine Datenübertragung ergänzen.

## A3. Verbindliche Tests

Simuliere ausdrücklich eine blockierte Speicherung, beispielsweise durch einen kontrollierten `SecurityError` bei `sessionStorage.setItem`.

Prüfe:

- Geographische Orientierung richtig beantworten.
- Rückblickaufgabe richtig beantworten.
- Warnmeldung tatsächlich sichtbar.
- Fachlich richtiges Feedback weiterhin grün.
- Keine zusätzlichen Fehlversuche.
- Hilfe und bewusste Beispielübernahme weiterhin möglich.
- Neuladen mit blockierter Speicherung.
- Neuladen mit funktionierender Speicherung.
- Keine Warnung bei funktionierender Speicherung.
- Keine Beschädigung anderer vorhandener Episodenstände.

Prüfe die sichtbaren Rückmeldungen und nicht nur den Rückgabewert der Speicherfunktion.

---

# ABSCHNITT B – KENIA-NAVIGATION IM QUERFORMAT KORRIGIEREN

## B1. Ausgangsbefund F3

Im WebKit-Browser mit simulierter Touch-Bedienung bei 1024 × 768 wird beim Übergang zur Untersuchung der Folgen des Straßenereignisses der Aufgabenanfang nicht zuverlässig sichtbar.

Der bisher reproduzierte Ablauf:

1. Kenia-Episode 1 vollständig bearbeiten.
2. Eine der drei Buslinien empfehlen.
3. Das Straßenereignis beginnen.
4. Leilas betroffenen Fußweg erkennen.
5. Die Kartenansichten „Vorher“ und „Jetzt“ untersuchen.
6. „Folgen untersuchen“ öffnen.

Das Ergebnis der unabhängigen Prüfung:

Aufgabentitel und Vergleichstabelle liegen teilweise oberhalb des sichtbaren Bereichs.

Die fachlichen Inhalte bleiben erreichbar, allerdings erst durch manuelles Hochscrollen.

Für unsere Lerngruppe ist das eine unnötige Orientierungshürde.

## B2. Korrektur

Stelle sicher, dass der Übergang zur neuen Aufgabe den Anfang der Aufgabe zuverlässig sichtbar macht.

Dabei müssen:

- Aufgabentitel,
- notwendige Vergleichstabelle,
- und der erste Bearbeitungsschritt

ohne zusätzliche Suche erkennbar beziehungsweise unmittelbar zugänglich sein.

Die Korrektur muss unter WebKit zuverlässig funktionieren.

Eine reine Fokussetzung reicht nicht, wenn der Browser damit keine passende Scrollposition herstellt.

Verwende eine gezielte Lösung für tatsächliche Aufgaben- und Bildschirmwechsel.

**Wichtig:** Nicht bei jeder Eingabe automatisch an den Seitenanfang springen.

Die bestehende Scrollposition soll bei bloßen Auswahlhandlungen möglichst erhalten bleiben.

Erhalte:

- Tastaturfokus,
- sichtbare Fokusgestaltung,
- Touch-Bedienung,
- die drei Buslinien,
- sämtliche Wegzeiten,
- Vorher-/Jetzt-Vergleich,
- ursprüngliche und spätere Empfehlungen,
- Navigation und Speicherung.

## B3. Verbindliche Regression

Teste den vollständigen Übergang mit jeder ursprünglichen Buslinie:

- Direkt,
- Über Nord,
- Über Süd.

Jeweils:

- Straßenereignis korrekt bearbeiten,
- Vorher und Jetzt wechseln,
- Folgen öffnen,
- Aufgabentitel und Vergleichstabelle unmittelbar auf Sichtbarkeit prüfen,
- fachliche Aufgabe fortsetzen und abschließen,
- zurückgehen,
- erneut öffnen,
- Zustand neu laden.

Prüfe nach tatsächlicher Darstellung über die sichtbaren Elementpositionen, nicht allein über erfolgreichen Fokus oder das Vorhandensein eines DOM-Elements.

Berücksichtige normale WebKit-Darstellung und Touch-Simulation.

Vermeide Regressionen in Chromium.

---

# ABSCHNITT C – SCORM-EIGNUNG VORBEREITEN

## C1. Ziel und klare Abgrenzung

Das Spiel soll möglicherweise später statt über GitHub Pages als **SCORM-Inhalt über itslearning** bereitgestellt werden.

Diese Option ist derzeit ein technischer Ausweichweg, nicht der verbindliche Veröffentlichungsplan.

Die aktuelle itslearning-Dokumentation bestätigt grundsätzlich Unterstützung für:

- SCORM 1.2
- SCORM 2004, 3rd Edition

Seit August 2026 wird ein aktualisierter SCORM-Player auf Basis von Rustici Engine eingesetzt.

SCORM ist jedoch ein optionales itslearning-Add-on und möglicherweise auf unserer Schulinstallation nicht aktiviert.

Du sollst das Spiel jetzt so vorbereiten, dass eine spätere Umwandlung ohne grundlegende Neuprogrammierung möglich bleibt.

**Nicht beauftragt sind:** Erstellung eines produktiven SCORM-Pakets, tatsächlicher itslearning-Import, Übertragung von Schülerdaten oder Aktivierung von LMS-Tracking.

## C2. Technische Eignung untersuchen

Prüfe den aktuellen Produktionsbuild insbesondere auf:

- vollständige statische Auslieferbarkeit,
- eine zuverlässig startbare HTML-Einstiegsdatei,
- relative statt hostinggebundene Ressourcenpfade,
- lokal enthaltene JavaScript-, CSS- und Kartendateien,
- fehlende verpflichtende externe Laufzeitdienste,
- funktionierende Navigation innerhalb einer eingebetteten Browseransicht,
- mögliche Einschränkungen durch Frames und Browser-Speicher,
- Abhängigkeiten von Fenstergröße oder übergeordnetem Browserfenster,
- notwendige Pop-ups oder externe Weiterleitungen,
- Abhängigkeiten von GitHub Pages.

Der bestehende Vite-Build verwendet bereits `base: './'`. Erhalte diese Portabilität.

Prüfe insbesondere das tatsächlich erzeugte `dist/`-Verzeichnis. Der Quellcode allein ist kein ausreichender Nachweis.

Teste einen lokal statisch bereitgestellten Build auch in einer einfachen eingebetteten Browseransicht.

Eine Mock-Umgebung darf benutzt werden, muss aber ausdrücklich als Simulation bezeichnet werden.

Gib keine erfolgreiche itslearning-Integration vor, solange diese nicht tatsächlich geprüft wurde.

## C3. Vorbereitung einer späteren SCORM-Laufzeit

Für einen späteren Export benötigt das Spiel unter anderem:

- ein SCORM-konformes ZIP mit `imsmanifest.xml` im Paketwurzelverzeichnis,
- eine geeignete SCO-Einstiegsdatei,
- eine SCORM-Laufzeitverbindung,
- definierte Abschlusskriterien,
- gegebenenfalls eine Wiederherstellung von Lernständen.

Prüfe die bestehende Architektur auf diese Anforderungen.

Insbesondere:

SCORM 1.2 verwendet unter anderem `LMSInitialize`, `LMSGetValue`, `LMSSetValue`, `LMSCommit` und `LMSFinish`.

SCORM 2004 verwendet die entsprechende `Initialize`-/`Terminate`-Laufzeit und andere Datenfelder.

Die Standards dürfen nicht durch ein undokumentiertes Mischsystem kombiniert werden.

Implementiere diese APIs jetzt noch nicht produktiv.

Stelle stattdessen sicher, dass der spätere Anschluss als klar abgegrenzte optionale Schicht möglich wäre, ohne die eigentlichen Lern- und Bewertungsregeln umzubauen.

Vermeide einen großen Architekturumbau allein zur Vorbereitung dieser theoretischen Möglichkeit.

Wenn die bestehende zentrale Speicherverwaltung dafür bereits ausreicht, dokumentiere diese Anschlussstelle und erhalte den Code unverändert.

## C4. Spielstand und Wiederaufnahme

Untersuche ausdrücklich die bisherige Speicherung des vollständigen Spielzustands.

Die derzeitige Browser-Speicherung verwendet `sessionStorage`.

Diese Speicherung darf bei einer späteren SCORM-Auslieferung nicht als garantiert dauerhaftes Wiederaufnahmesystem vorausgesetzt werden.

SCORM stellt dafür unter anderem `cmi.suspend_data` bereit.

Die vorgesehenen Datenlimits unterscheiden sich:

- SCORM 1.2: 4.096 Zeichen.
- SCORM 2004, 3rd Edition: 64.000 Zeichen.

Miss die tatsächlich serialisierte Zustandsgröße anhand sinnvoller, vollständig durchgespielter Musterfälle.

Prüfe insbesondere:

- ein abgeschlossenes Spielmodul,
- mehrere abgeschlossene Episoden,
- alle sechs abgeschlossenen Episoden,
- Nutzung mehrerer Hilfen,
- kurze und längere freiwillige Texte,
- Geographie-Orientierung und Rückblick.

Dokumentiere, welche Teile des Zustands für die Wiederaufnahme wirklich erforderlich wären.

Entwickle ein Konzept für einen **versionierten und möglichst kompakten Wiederaufnahmedatensatz**.

Unterscheide beispielsweise:

- abgeschlossene Episoden,
- aktuelle Episode und Lernschritt,
- relevante Entscheidungen,
- unterstützte und eigenständige Bearbeitung,
- notwendige Mindestdaten zur Wiederaufnahme.

Große Feedbacktexte und jederzeit neu berechenbare Darstellungen sollten nicht unnötig gespeichert werden.

Sensible Schülerangaben, längere Freitexte und sonstige personenbezogene Daten dürfen nicht automatisch zur zukünftigen Übertragung an ein LMS vorgesehen werden.

Noch keine tatsächliche SCORM-Speicherung implementieren.

## C5. Abschlussstatus statt Scheinbenotung

Prüfe, wie der bestehende Lernfortschritt später optional als SCORM-Abschlussstatus bereitgestellt werden könnte.

Unterscheide strikt:

- Eine Episode wurde bearbeitet.
- Eine Episode wurde mit Unterstützung abgeschlossen.
- Eine Episode wurde ohne Beispielübernahme abgeschlossen.
- Fachliches Verständnis wurde tatsächlich nachgewiesen.

Diese Aussagen sind nicht gleichbedeutend.

Ein im Spiel erreichter Abschluss darf nicht automatisch als bestandene fachliche Leistungsbewertung oder Note ausgegeben werden.

SCORM-Berichte können den Abschluss einer Ressource darstellen, belegen aber nicht automatisch die Lernleistungen innerhalb unserer differenzierten Entscheidungsaufgaben.

Lege noch keinen verbindlichen SCORM-Punkteschlüssel fest.

Prüfe außerdem, ob langfristig zwei Varianten sinnvoll wären:

1. Das gesamte Spiel als ein zusammenhängendes SCO.
2. Einzelne Episoden als getrennt aufrufbare SCOs beziehungsweise SCORM-Ressourcen.

Dokumentiere die Vor- und Nachteile beider Varianten für die tatsächliche Unterrichtsnutzung.

Eine sofortige Entscheidung oder Implementierung ist nicht erforderlich.

## C6. Datenschutz und itslearning

Behalte den bisherigen Grundsatz bei:

**Keine zusätzliche Übertragung von Schülerantworten, Freitexten oder persönlichen Daten an externe Bewertungsdienste.**

Beachte aber:

Eine spätere SCORM-Integration kann grundsätzlich dazu führen, dass itslearning Bearbeitungsstatus, Öffnungen, Zeiten und gegebenenfalls Ergebnisse den angemeldeten Nutzern zuordnet.

Behaupte deshalb nicht, dass bei einem zukünftigen SCORM-Betrieb grundsätzlich keinerlei personenbezogene Daten verarbeitet werden.

Dokumentiere die möglichen Datenflüsse getrennt:

- derzeitige lokale Browser-Verarbeitung,
- mögliche spätere SCORM-Abschlussmeldung,
- mögliche spätere SCORM-Wiederaufnahmedaten.

Die endgültige datenschutzrechtliche Zulässigkeit muss vor der Nutzung durch die Schule beziehungsweise die zuständigen Stellen beurteilt werden.

Es dürfen keine neuen Analyse-, Tracking- oder Drittanbieterdienste eingeführt werden.

## C7. Dokumentation der SCORM-Bereitschaft

Erstelle:

`docs/scorm-readiness.md`

Das Dokument soll knapp, aber fachlich-technisch vollständig beantworten:

1. Ist die aktuelle Anwendung grundsätzlich in ein SCORM-Paket überführbar?
2. Welche vorhandenen Bestandteile sind bereits geeignet?
3. Welche konkreten Dateien und Funktionen müssten später ergänzt werden?
4. Welche Unterschiede bestehen zwischen einem GitHub-Pages-Build und einem SCORM-Paket?
5. Welcher SCORM-Standard wäre aus heutiger Sicht für das Spiel vorzuziehen und warum?
6. Wie groß sind die aktuellen Spielstände?
7. Welche Speicherung wäre für eine echte Wiederaufnahme erforderlich?
8. Welche Abschlussinformationen könnten sinnvoll übermittelt werden?
9. Welche personenbezogenen Informationen sollen ausdrücklich nicht übertragen werden?
10. Welche Tests sind vor einer echten itslearning-Nutzung unverzichtbar?
11. Welche offenen Lizenz- und Administrationsfragen bestehen auf Seiten der Schule?
12. Welche Unterschiede bestehen zwischen einem einzigen Gesamtpaket und getrennten Episodenressourcen?

Kennzeichne eindeutig:

- bereits getestet,
- technisch begründet möglich,
- erst nach späterer Implementierung prüfbar,
- nur mit Zugriff auf die reale Schulinstallation überprüfbar.

Das Dokument darf nicht behaupten, Afrika 2040 sei bereits ein funktionierendes SCORM-Paket.

---

# ABSCHNITT D – ABSCHLIESSENDE QUALITÄTSSICHERUNG

## D1. Regressionsschutz der sechs Episoden

Erhalte alle bisherigen fachlichen Modellwerte.

Prüfe insbesondere:

- Kenia: Wegezeiten, Ein- und Ausstiegshaltestellen, Straßenereignis, Nachfrage und Kapazität.
- Ghana: Verarbeitungskette, Einnahmen, laufende Ausgaben, Investitionen und vollständige Verteilung der 120 Geldeinheiten.
- Marokko: Wasserentnahme, Tankrest, zusätzlich bewässerte Flächen und Trennung eigener Pläne von Vergleichsfällen.
- Geographie: Lage der Länder und Städte, Kartenbeschriftungen und Modell-/Realitätsunterscheidung.

Die bestehenden curricularem und didaktischen Anforderungen bleiben unverändert.

## D2. Feedbackregeln

Prüfe erneut:

- fachlich richtige Antworten: grün,
- fachlich falsche Antworten: rot,
- teilweise richtige Antworten: gelb,
- unvollständige Eingaben: Ergänzungshinweis ohne Fehlversuch,
- offene legitime Entscheidungen: neutral,
- automatische Hilfe nach zwei vollständig prüfbaren Fehlversuchen,
- freiwillige Hilfe 1 bis 3,
- bewusste Beispielübernahme,
- korrekte Herkunftskennzeichnung,
- freier Text ohne automatische Benotung.

Die neuen Speicherwarnungen dürfen diese Rückmeldungen weder überschreiben noch verfälschen.

## D3. Browser- und Gerätetests

Pflichttests:

- Desktop-Browser,
- simuliertes iPad-Querformat,
- Chromium,
- WebKit, sofern tatsächlich verfügbar,
- Touch,
- Maus,
- Tastatur,
- eingeschränkte Browser-Speicherung,
- normales Neuladen und Wiederherstellen.

iPad-Hochformat ist kein Pflichtmodus.

Prüfe die Korrekturen vollständig in der tatsächlich laufenden Anwendung.

Eine erfolgreiche Logikfunktion ersetzt keinen sichtbaren Browsertest.

## D4. Barrierearmut

Die bisherigen Korrekturen der zugänglichen Namen müssen erhalten bleiben.

Prüfe insbesondere:

- sichtbare und berechnete zugängliche Beschriftungen,
- Fokusreihenfolge,
- erkennbare Rückmeldungen,
- Kontrast,
- korrekte Zustandswechsel,
- alternative HTML-Bedienelemente zu SVG-Interaktionen.

Ein automatisierter Accessibility-Test ist kein vollständiger Screenreader-Nachweis.

## D5. Veröffentlichungsfähigkeit

Prüfe erneut einen normalen statischen Produktionsbuild mit relativen Pfaden.

Teste das Spiel unter einem lokalen Pfad, der GitHub Pages entspricht, beispielsweise `/Afrika-2040/`.

Prüfe zusätzlich die grundsätzlich geeignete Darstellung in einem eingebetteten Inhaltsfenster.

Kein tatsächlicher SCORM-Import, kein neues öffentliches Deployment und keine Registrierung bei externen Diensten.

## D6. Abschlussbericht und Übergabe

Liefere:

1. Einen überprüfbaren lokalen Korrekturcommit.
2. Eine kurze Beschreibung der beiden verpflichtenden Korrekturen F2 und F3.
3. Den dokumentierten Umgang mit F1.
4. Den technischen SCORM-Bereitschaftsbericht.
5. Ergebnisse der tatsächlich ausgeführten Logiktests.
6. Ergebnisse der Browserprüfungen.
7. Konkrete Nachweise zu Speicherwarnung und Aufgabenwechsel.
8. Eine Übersicht unveränderter fachlicher Funktionen.
9. Verbleibende technische und didaktische Grenzen.
10. Ein kompaktes Prüfpaket für die nächste unabhängige Abnahme.

Wiederhole nicht unnötig sämtliche alten Prüfartefakte.

Wichtige Testskripte sollen erhalten bleiben. Neue Bildschirmaufnahmen auf relevante Prüfzustände begrenzen.

Die drei Original-Lehrplandokumente dürfen nicht verändert werden.

### Verbindlicher Entwicklungsstopp

**Keine zusätzlichen Episoden, keine neuen Spielmodelle, keine vollständige SCORM-Implementierung, keine Arbeitsblätter und keine Lehrkräftehandreichungen.**

Kein Merge nach `main`, kein Push und keine GitHub-Pages-Veröffentlichung ohne gesonderte Freigabe.

Beende den Auftrag nach den beiden Korrekturen, der SCORM-Eignungsprüfung und der unabhängigen Prüfbarkeit des neuen Stands.

Die abschließende Abnahme erfolgt durch ChatGPT beziehungsweise Work.