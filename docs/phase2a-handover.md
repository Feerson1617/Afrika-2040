> Historischer Ausgangsstand `f6d922407bacf0af7e592520b7f502ac61501a9e` vor der unabhängigen Gegenprüfung. Aktuelle Korrektur und Ergebnisse: [phase2a-corrections.md](phase2a-corrections.md).

# Übergabe Phase 2A – drei Personen, drei Buswege

Stand: 23. Oktober 2026. Interner Entwicklungs- und Prüfbericht für die anschließende unabhängige Prüfung durch ChatGPT Work. **Keine eigenständige didaktische Freigabe.**

## Ausgangsstand und Umfang

Repository `Feerson1617/Afrika-2040`, Ausgangsbranch `feat/phase1-kenia`, vollständiger Ausgangscommit `0fadfeb47eab729db99322e6ae5a281fb8f86188`. Vor Änderungen tatsächlich geprüft: identischer Commit und sauberer Arbeitsbaum, keine Abweichung. Der separate Branch **`feat/phase2a-kenia-drei-wege`** wurde genau daraus erstellt. Der [erteilte Auftrag](phase2a-request.md) begrenzt die Umsetzung auf Phase 2A.

Die Implementierung, Tests, Dokumentation und Belege werden in einem vollständigen lokalen Commit gemeinsam übergeben. Seine volle SHA und der Arbeitsbaumstatus stehen in der Bestandsdatei des Prüfpakets und in der Abschlussnachricht. Reproduzierbar über `git rev-parse HEAD` und `git status --porcelain=v1 --untracked-files=all`. Keine zusätzlichen Worktrees, kein eigenständiger Push, Merge oder GitHub-Pages-Deployment. Die frühere Push-Freigabe betraf ausschließlich den genannten Phase-1-Commit und wird nicht auf diesen Branch übertragen. Phase 2B wurde nicht begonnen.

## Tatsächlich umgesetzt

- Die bestehenden Lagebeziehungen von Amina und David sowie Direkt/Nord bleiben erhalten. Leila wohnt im Süden und fährt zur Ausbildung ins Zentrum. Süd führt Platz → Süd → Zentrum; beide Abschnitte dauern acht Minuten. Leila kann an Süd nach zwei Minuten Fußweg einsteigen.
- Alle neun Gesamtzeiten entstehen aus demselben Modell mit Einstiegshaltestelle und tatsächlich gefahrenen Busabschnitten. Amina fährt bei Nord nur den letzten Abschnitt, Leila bei Süd nur den letzten Abschnitt. Kartenwerte, Summen, Belege und Erklärungen stammen daraus.
- Sechs begrenzte Lernschritte: Ausgangsweg, ursprünglicher Vorteil/Nachteil, Ursache-Wirkungs-Erklärung, Leilas Erkundung, Empfehlung. Leila und Süd bleiben während des bisherigen Zweipersonenvergleichs und der Erklärung verborgen.
- Eine eigene Erklärung ist ausdrücklich möglich und bleibt unbewertet. Als sprachliche Unterstützung stehen zusammenhängende Sätze zum kürzeren Fußweg und zur Wirkung auf die Gesamtzeit bereit. Eine passende Auswahl wird als **angeleitete Erklärung** bestätigt. Die Erklärung unterscheidet die ganze Buslinie von Aminas persönlich gefahrenem Teilstück.
- Vor Leilas Erkundung wird eine erste, unbewertete Vermutung festgehalten. Die drei Leila-Wege werden nacheinander tatsächlich angesehen, bevor die schnellste Verbindung zugeordnet wird. Die Karte zeigt jeweils nur eine Buslinie und einen aktuellen Gesamtweg. Die ausgewählte Person kann per Marker oder gleichwertigen HTML-Schaltflächen gewechselt werden. Eine zusätzliche 3×3-Zahlenmatrix wird nicht als Ersatz für die Erkundung gezeigt.
- Nach der Erklärung kann freiwillig eine erste Empfehlung festgehalten werden. Am Schluss sind alle drei Linien offen. Die erste Idee darf beibehalten oder geändert werden; der Wechsel allein bringt keine Erfolgsmeldung.
- Die strukturierte Empfehlung enthält Linie, benanntes Ziel/Kriterium, zutreffenden Vorteil und Nachteil einer anderen Person. Jeder Beleg nennt seine Vergleichslinie. Unterschiedliche zutreffende Belegpaare sind möglich; ein Zeitgleichstand zählt weder als Vorteil noch als Nachteil. Auch ein Vergleich mit der dritten Linie ist zulässig.
- Eigene Begründungen werden gespeichert und neutral behandelt. Das Spiel prüft keine Schlüsselwörter, Sprache oder Orthographie. Linie und benanntes Ziel bleiben nötig; fachlich unklare Texte können unbewertet abgegeben werden. Daraus wird kein fachlich bestätigtes Lernprodukt behauptet. Fragliche ausgewählte Belege bleiben im Abschluss als zu prüfen markiert.
- Rückmeldungen erkennen richtige Teilgedanken an. Unvollständiges verbraucht keinen Fehlversuch. Nach höchstens zwei erfolglosen vollständigen Prüfungen wird erklärt und bei den neuen Aufgaben ein tatsächlich bedienbares, bewusst übernehmbares Beispiel angeboten. Die Empfehlung bleibt neutral. Genutzte Unterstützung erscheint im Lernprodukt; nach eigener Bearbeitung kann ein Beispiel erneut übernommen werden.
- Die bisherigen R1–R3-Sicherungen bleiben wirksam: direkte Ausgangskarte nach Zurück/Neuladen/Neubearbeitung, begrenzte Fehlversuche und unterstützte Empfehlung, Anerkennung korrekter unvollständiger Teilstrecken. Die Prüfung umfasst erneut gespeicherte Zustände und unabhängige Absicherung des Kartenrenderers.
- Das neue sechsphasige Speicherschema hat einen eigenen Tab-Schlüssel. Alte Phase-1-Abschlüsse werden nicht als bearbeitete Phase-2A-Erklärungen interpretiert. Neustart entfernt beide projektspezifischen Schlüssel; gesperrter Speicher verhindert das Spiel nicht.
- Auf Desktop und iPad werden große HTML-Bedienflächen und sichtbarer Tastaturfokus verwendet. Nach der Vermutungswahl erhält die gespeicherte Vermutung den Fokus. Ausgewählte lange Satz-/Belegtexte werden zusätzlich vollständig unter dem Auswahlfeld angezeigt.

| Person | Direkt | Über Nord | Über Süd |
| ------ | ------ | --------- | -------- |
| David  | 12     | 18        | 18       |
| Amina  | 22     | 10        | 28       |
| Leila  | 22     | 28        | 10       |

Alle Werte in Minuten: Fußweg plus Busfahrt. Wartezeiten, Fahrpreise und Kapazitäten sind ausdrücklich nicht berechnet. Erfundene Karte, Verbindungen und Personen; kein Schluss auf den Verkehr in Nairobi oder Kenia, keine Vorhersage für 2040 und keine umfassende Nachhaltigkeitsbewertung.

## Tatsächlich ausgeführte Prüfungen

Umgebung: Linux, Node **24.19.0**, npm **11.9.0**, TypeScript **5.9.3**, Vite **8.3.5**, Playwright **1.64.1**, System-Chromium **154.0.8037.57**. Bestehende Abhängigkeiten wurden verwendet; keine neue Abhängigkeit und keine Änderung des Lockfiles. `npm test` nutzt einen Prozess, damit diese Cloud-Laufzeit die einzelnen Fälle statt lediglich Dateihüllen ausführt.

| Prüfung                                  | Ergebnis und Nachweis                                                                                                                                                                                                                                                                  |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                               | **44 bestanden**, 0 fehlgeschlagen, 0 übersprungen. [Vollständiges Protokoll](evidence/phase2a/unit-tests.txt)                                                                                                                                                                         |
| Modell und Belegauswertung               | Alle neun vorgegebenen Fuß-/Bus-/Gesamtzeiten, volle Linien und Teilstrecken; **972** Kombinationen aus Linie und zwei Belegen innerhalb eines Testfalls. Auch alternative zutreffende Gewichtungen, Gleichstand und dieselbe Person als Vorteil/Nachteil geprüft                      |
| `npm run build`                          | TypeScript-Prüfung und Produktionsbuild erfolgreich. [Protokoll](evidence/phase2a/build.txt)                                                                                                                                                                                           |
| `npx playwright test --reporter=list`    | **45 bestanden**, 0 fehlgeschlagen, 0 übersprungen; letzter vollständiger Lauf **1,4 Minuten**. [Vollständiges Protokoll](evidence/phase2a/browser-tests.txt)                                                                                                                          |
| Vollständige Geräte-/Entscheidungsmatrix | **9 vollständige Durchläufe**: alle drei Empfehlungen auf Desktop 1440×1000, simuliertem iPad quer 1024×768 und hoch 768×1024. Auf iPads echte Touch-Ereignisse. Jeder Durchlauf prüft im Browser sämtliche neun Person-/Linienwege und danach regulären sowie unterstützten Abschluss |
| Routen und Aktualisierung                | Sichtbare Abschnitte, tatsächlich gefahrene Teilabschnitte, sämtliche relevanten Badge-Werte und lesbare Summen; Wechsel aller drei Linien und aller Personen. Passende Beschriftung nach Rückkehr, Neubearbeiten und Neuladen                                                         |
| Interaktion und Zustände                 | Maus, Touch, Tastatur einschließlich neuer Satzbausteine und Südweg; eigene Erklärung, Teilantworten, zwei Fehler, ausdrückliche Übernahme, Wiederübernahme, ehrliche Vermutung/Erkundung, Neustart und blockierter Speicher                                                           |
| Ungewöhnliche Texte                      | Unklare Formulierung, widersprüchliche Zahlen, Großschreibung und HTML-Zeichen: keine automatische fachliche Bewertung, keine Fehlversuche aufgrund des Textes, unveränderte lokale Wiedergabe und Textescaping                                                                        |
| Empfehlung                               | Alle drei Linien, passende und unpassende Belege, benanntes/fehlendes Kriterium, andere zulässige Gewichtung und geänderte Linie ohne automatischen Erfolg geprüft                                                                                                                     |
| axe                                      | Keine automatisiert gefundenen Verstöße gegen die geprüften WCAG-2/2.1-A/AA-Regeln in Start, Aufgaben, erweitertem Wort-/Hilfebereich, Feedbackzuständen, Entscheidung, unterstützter Erklärung und Abschluss. Kein vollständiger Barrierefreiheitsnachweis                            |
| Statischer Unterpfad                     | Produktionsressourcen unter `/Afrika-2040/` erfolgreich im Browser geöffnet; keine Veröffentlichung                                                                                                                                                                                    |
| Originalquellen                          | Alle drei Original-PDFs erneut vollständig textuell geöffnet: **159/159 Seiten**, Original-Hashes unverändert. Ausgangsaudit und curriculare Seitenbelege siehe [curriculum.md](curriculum.md)                                                                                         |

Der abschließende grüne Gesamtlauf verwendet den endgültigen Anwendungscode; seine [Build-Eingaben und Werkzeugversionen](evidence/phase2a/validation-inputs.json) sind per SHA-256 festgehalten. Zuvor wurde bei der Browserprüfung die Kartenhöhe korrigiert: Die übernommene 440-Pixel-Begrenzung verkleinerte die südlich erweiterte Karte zu stark. Die erweiterte Karte darf nun bis 520 Pixel hoch sein. Eine enge Beschriftungsstelle an Leilas Haus wurde versetzt. Beim Übergang nach der Vermutung wurde zusätzlich der Fokus explizit gesichert. Nach visueller Prüfung wurde der doppelte lange Erklärungstext bei den neuen Aufgaben auf einen kurzen Verweis im Feedback und eine vollständige Erklärung im Hilfefeld reduziert. Die alten Browsertests wurden auf sechs Schritte, eigene Teilabschnitte und explizite Vergleichsreferenzen übertragen; ihre bisherigen fachlichen und funktionalen Prüfziele bleiben erhalten.

## Lesbarkeit und visuelle Prüfung

Die neun neuen Kartenscreenshots sowie Nord-/Südansichten, Erklärungshilfe und Abschlussansicht wurden visuell betrachtet. Die Karte bleibt bei drei Routen ruhig: ausgewählte Linie, eine Person, zugehöriger Fußweg und Teilfahrt. Leilas Haus, Zeitangabe und Personenmarkierung überdecken sich nach der Korrektur nicht. Für Amina/Nord wird der nicht gefahrene erste Busabschnitt mit heller Zeitmarke, der gefahrene letzte Abschnitt mit dunkler Marke und kräftiger Linie gezeigt.

| Neue Dreipersonenkarte | Kleinste gemessene Zeit-Schriftgröße | Badge-Inhalt      |
| ---------------------- | ------------------------------------ | ----------------- |
| Desktop                | 15,52 CSS-Pixel                      | passt vollständig |
| iPad quer              | 14,47 CSS-Pixel                      | passt vollständig |
| iPad hoch              | 15,52 CSS-Pixel                      | passt vollständig |

Die zuvor korrigierte Zweipersonenkarte besteht ihre eigenen Lesbarkeitsregressionen ebenfalls: 16,00 / 14,47 / 17,82 CSS-Pixel. Dies ist eine Messung der Zeitangaben, keine Aussage zu jeder SVG-Beschriftung. Eine zusätzliche 390×844-Touchprüfung erreicht den Abschluss ohne Seitenüberlauf; eine gleichwertige Kartenlesbarkeit für kleine Smartphones wird nicht behauptet.

Belege: [Süd auf iPad quer](evidence/phase2a/map-ipad-landscape-south.png), [Nord auf Desktop](evidence/phase2a/map-desktop-north.png), [Süd auf iPad hoch](evidence/phase2a/map-ipad-portrait-south.png), [Erklärung mit Unterstützung](evidence/phase2a/explanation-support.png), [unterstützte Empfehlung](evidence/phase2a/ipad-supported-south.png), [Lernprodukt Süd](evidence/phase2a/end-south.png). Weitere direkte/Nord-/Südansichten sind im selben Ordner enthalten. Rohmessungen: [readability.json](evidence/phase2a/readability.json).

## Kurze didaktische Selbstevaluation

Die Erweiterung verbindet räumliche Lage, relevante Informationen, Ursache/Wirkung und Interessengegensätze. Die lernwirksame Irritation bleibt bestehen: Eine längere Buslinie kann durch einen kürzeren Fußweg und einen späteren Einstieg eine Person schneller ans Ziel bringen. Leila macht sichtbar, warum eine weitere Haltestelle nicht allen hilft. Die erste Vermutung und die spätere Empfehlung werden nicht benotet. Damit steht die Untersuchung eines gemeinsamen Falls im Mittelpunkt; zusätzliche Rechenquizreihen, Punkte und sichtbare Leistungsgruppen wurden vermieden.

Die kurze Erklärungsaufgabe verringert die Lücke zwischen Zahlenablesen und geographischem Erklären. Sie schließt sie nicht vollständig: Zwei passende Sätze sind eine korrekte **angeleitete** Erklärung. Ein ausgewähltes Ziel plus Belege kann ohne eigenständige Gewichtung entstehen. Eigene Texte und die optionale Weiterdenkfrage erlauben mehr Tiefe, werden aber nicht automatisch als Fachkompetenz bestätigt. Die Prüfung von Selbstständigkeit, Verständlichkeit und wirklicher Lernwirkung bleibt der unabhängigen Begutachtung und einer späteren Erprobung mit der Lerngruppe vorbehalten.

Die Sprache bleibt kurz, Fachbegriffe werden auf Wunsch erklärt, die dritte Perspektive kommt erst nach dem vertrauten Zweipersonenfall hinzu. Aufwendige Animationen und große Zahlenmatrizen wurden für die Übersicht nicht benötigt. Die gemeinsamen Aufgaben sind durch Hilfe abschließbar. Ob die sechs Schritte für sehr geringe Lese-/Sprachkompetenz die richtige Länge haben, muss mit der Zielgruppe geprüft werden.

Curriculare Reichweite: O3 (S6), M2 (S4), B1 (S2), K1 (S4) werden gezielt angebahnt; genaue Seitenbelege und Begrenzungen in der [curricularen Ergänzung](curriculum.md#ergänzung-phase-2a). Kein vollständiger Nachweis zur gesamten Afrika-Einheit, zu realer Orientierung oder zu nachhaltigem Handeln.

## Offene Punkte und Grenzen

- Die unabhängige Prüfung durch **ChatGPT Work steht für Phase 2A noch aus**. Dieser Bericht ist keine Freigabe.
- Keine realen iPads, Safari/WebKit, VoiceOver-/Screenreader-Bedienung oder Unterrichtserprobung durchgeführt. Chromium-Touchsimulation ersetzt diese Prüfungen nicht.
- Die Kartenlesbarkeit wurde anhand ausgewählter Screenshots und Zeitangaben geprüft, nicht als vollständige SVG-Kontrast-/Barrierefreiheitsprüfung. Kleine Smartphones sind kein gleichwertig belegtes Kartenziel.
- Freie Aussagen bleiben fachlich ungeprüft. Eine unbewertete Abgabe kann unvollständige oder falsche Gedanken enthalten und muss im unabhängigen Gespräch geprüft werden.
- Im abschließenden Testsatz bestehen keine bekannten reproduzierten Funktionsblockaden. Das ist auf den beschriebenen Modell- und Prüfrahmen begrenzt.
- Der Datei-Download aus dieser Cloud-Oberfläche ist zuvor wiederholt gescheitert. Das neue ZIP wird außerhalb des Repositorys erstellt und durch Wiederherstellung geprüft. Eine erfolgreiche Übertragung an den Nutzer kann damit allein nicht bestätigt werden. Für einen anderen Übertragungsweg oder den Push dieses neuen Branches ist eine gesonderte Freigabe nötig.

## Prüfpaket und Wiederherstellung

Das vollständige ZIP enthält eine Quellkopie aller versionierten Dateien einschließlich Lockfile, Tests, Dokumentation und Belegen sowie ein eigenständig wiederherstellbares Git-Bundle von `refs/heads/feat/phase2a-kenia-drei-wege`. Die Bestandsdatei nennt die vollständige Abgabe-SHA, Ausgangs-SHA, Branch, sauberen Arbeitsbaumstatus und Wiederherstellungsbefehle. Eine SHA-256-Liste beschreibt die enthaltenen Dateien. Das Paket liegt außerhalb des Repositorys; ein archivierter Abschlussbericht wird nicht mit einem tatsächlich funktionierenden Cloud-Download gleichgesetzt.

Es werden keine Zugangsdaten, `.env`-Dateien, Git-Konfigurationsdateien oder `node_modules` aufgenommen. Der gesamte versionierte Quellstand wird erhalten. Die Original-PDFs bleiben separat bereitgestellte curriculare Quellen und werden nicht als Anwendungsressourcen veröffentlicht. Das Bundle wird aus dem endgültigen ZIP in einem neuen leeren Repository wiederhergestellt und mit dem Abgabe-Commit sowie allen versionierten Dateien verglichen. Die ZIP-Prüfsumme steht außerhalb des Archivs, damit keine zirkuläre Selbstprüfung entsteht.

Nach Phase 2A endet die Entwicklung. Kein Leila-Fußweg-Ereignis, keine zweite Kenia-Episode, keine Ghana-/Marokko-Episode, keine Materialien oder Arbeitsblätter, keine komplexe Bewertung und kein Punktesystem wurden begonnen.
