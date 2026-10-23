# Phase 2B – neue Bedingungen, erneute Entscheidung

Stand: 23. Oktober 2026. Entwicklungsinterne Übergabe für eine unabhängige Gegenprüfung. **Keine didaktische Freigabe. Die vorgeschriebene WebKit-Prüfung ist durch die Umgebung blockiert; deshalb ist die Abnahme noch nicht vollständig.**

## Ausgangsstand und Umfang

Repository `Feerson1617/Afrika-2040`, tatsächlicher Ausgangsbranch `feat/phase2a-kenia-drei-wege`, vollständiger Ausgangscommit `518d2168813aa93c20dd674898e2b26aa644c87d`; Arbeitsbaum bei Beginn sauber, keine Abweichung. Neuer Branch: `feat/phase2b-kenia-strassenereignis`, direkt von diesem Commit im vorhandenen Checkout angelegt. Kein zusätzlicher Worktree. [Verbindlicher Auftrag](phase2b-request.md).

Die sechs bisherigen Lernschritte und ihre Korrekturen bleiben erhalten. Nach der ersten Empfehlung öffnet „Eine Woche später …“ genau zwei neue Lernschritte (Fußweg lokalisieren, Folgen vergleichen und erklären). Danach folgt die knappe Überprüfung der bisherigen Empfehlung und ein aktualisiertes Lernprodukt. Keine zweite Kenia-Episode und keine weiteren Länder, kein Punktesystem, keine Arbeitsblätter oder Handreichungen, keine Fernbewertung.

## Implementierte Änderungen

- Das Ereignis ist ein separater Situationsparameter. Nur Leila → Platz erhält sechs zusätzliche Fußminuten. Ausgangswerte, alle Buszeiten und Haltestellenfolgen werden nicht überschrieben. Karte, Zeitvergleich, Belege und Ziel-/Gewichtungsprüfung nutzen dasselbe Modell.
- Eine zentrale Karte zeigt zunächst die bekannte Situation. Die Auswahl erfolgt über Fußverbindung oder zugängliche Radiofelder; Leilas Wohnbereich wird als richtige, aber noch unvollständige Teilinformation gelb anerkannt und verbraucht keinen Fehlversuch. Der erklärte Weiterweg ist nach höchstens zwei vollständigen sachlich falschen Versuchen bedienbar. Nach Lokalisierung/Hilfe stehen Vorher/Jetzt auf derselben Karte zur Verfügung. Baustellenzeichen und Umweg liegen am Fußweg, nicht auf einer Buslinie.
- Der kompakte Leila-Vergleich stellt Vorher und Jetzt direkt neben „länger/gleich“. Erst nach einem zutreffenden Vergleich bzw. bewusster Beispielübernahme erscheint die Erklärung: Einstieg in Süd und unveränderter Fußweg. Die vollständige Mustererklärung steht nicht vor dieser Denkaufgabe in der normalen Oberfläche.
- Die erste Empfehlung bleibt als eigener Snapshot mit alten Zahlen, Ziel, Belegen, Gewichtung, Text und historischer Hilfennutzung erhalten. Die bisherigen Antworten bleiben im alten Verlauf erhalten. Die neue Empfehlung baut auf demselben Ziel und denselben Belegreferenzen auf; sie wiederholt nicht automatisch alle vier Entscheidungsansichten. Eigene alte Texte sind im Original weiter sichtbar und werden nicht still als neue Erklärung abgegeben.
- Die erneute Begründung benötigt eine konkrete Zeitangabe für die nun empfohlene Linie und eine ausdrücklich ausgewählte Folge für Beibehalten oder Wechseln. Zutreffende Belege werden anerkannt. Zielkonflikte verwenden die neutrale Phase-2A-Logik mit den Jetzt-Zeiten; eine andere Priorität muss konkret gewählt werden. Ein bloßer Wechsel oder „Ich habe abgewogen“ reicht nicht. Eine eigene Erklärung kann bewusst unbewertet abgegeben werden; dies wird im Produkt markiert.
- Hilfe, Beispielübernahme, erneute Prüfung nach Änderungen, Speicherbehandlung, Rücksprung und Neustart nutzen die bestehenden Muster und denselben Feedback-Vertrag. Beschädigte optionale Ereignisdaten verwerfen die neue Situation, erhalten aber einen gültigen ersten Stand. Vorhandene Phase-2A-Spielstände werden ohne erfundenen Ereignisfortschritt geladen.
- P3-A: Der Auswahlkontext der Phase 2A besitzt nun ausdrücklich `role="group"` zur vorhandenen Gruppenbezeichnung. Code und scoped axe-Prüfung prüfen dies.
- P3-B: Native Auswahlfeldtests arbeiten weiter mit echten Tastaturereignissen und prüfen den tatsächlich gewählten Wert **vor** der fachlichen Rückmeldung. Unter macOS entfällt die unzuverlässige Home-Taste; das native Menü wird mit Leertaste geöffnet. Eine macOS-Ausführung ist hier nicht erfolgt. Es gibt kein `selectOption` als verdeckten Ersatz für einen Tastaturnachweis.
- Die Schüleroberfläche sagt nun „Du hast deine Empfehlung mit Bausteinen begründet.“ Die Begrenzung des Kompetenznachweises steht in der internen Dokumentation. Übernommene Beispiele und bewusst ungeprüfte Texte bleiben sichtbar gekennzeichnet.

## Fachliche Sollwerte

| Person | Vorher Direkt / Nord / Süd | Jetzt Direkt / Nord / Süd |
| ------ | -------------------------- | ------------------------- |
| Amina  | 22 / 10 / 28               | 22 / 10 / 28              |
| David  | 12 / 18 / 18               | 12 / 18 / 18              |
| Leila  | 22 / 28 / 10               | 28 / 34 / 10              |

Alle Werte in Minuten. Leila → Platz: 12 → 18, Leila → Süd: 2 → 2. Leila im Bus: weiterhin Direkt 10, Nord 16 und Süd 8 Minuten. Die bisherige dreistufige Karte und die erste Situation bleiben bei jedem Rücksprung den ursprünglichen Werten zugeordnet. Die erste Empfehlung wird durch neue Eingaben nicht überschrieben.

## Tatsächliche Prüfung und offene Plattformen

Nach einer abschließenden reinen Formatierung von `src/main.ts` wurden die erzeugten Browserdateien erneut gebaut: alle Ausgabedateien sind bytegleich mit dem getesteten Build (Hashes im Prüfmanifest).

Die Rohprotokolle, Input-Hashes, konkrete Umgebung und zentralen Bildschirmaufnahmen liegen in [evidence/phase2b](evidence/phase2b). Die Bildnamen nennen Chromium und simuliertes Gerät; daraus wird kein physischer iPad- oder Safari-Test abgeleitet. Repräsentative Bildschirmaufnahmen aller zentralen Ansichten wurden visuell geprüft. Keine neue Anwendungsabhängigkeit; das Lockfile bleibt unverändert.

| Prüfung                                    | Ergebnis und Aussage                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                                 | 89/89 Logikfälle erfolgreich. Alle 18 Vorher/Jetzt-Zeiten, unveränderte Busabschnitte, alle ursprünglichen 972 Belegpaare, neue Lokalisierung, 27 vollständige/unvollständige Vergleichskombinationen, Erklärung/Teilfeedback/Versuchsgrenze, alle 3×3 alten/neuen Empfehlungen, alle 3×3 neuen Zielkombinationen, Unterstützung, unbewertete Texte, alte Spielstände, beschädigtes Ereignis, Rücksprung, Neustart und unveränderter erster Snapshot |
| `npm run build`                            | TypeScript und Vite-Produktionsbuild erfolgreich                                                                                                                                                                                                                                                                                                                                                                                                     |
| Chromium                                   | 75/75 Browserfälle erfolgreich, ohne automatische Wiederholungen: die bisherigen 58 Regressionen plus 17 neue Szenarien. Vollständige Phase-2B-Abläufe für drei erste Linien auf Desktop und simuliertem iPad hoch/quer; darin alle 18 Werte, Beibehalten und Wechseln, Maus/Touch, Neuladen, erste Empfehlung erhalten, Neustart                                                                                                                    |
| Neue Grenzfälle                            | Richtiger Wohnbereich ohne Fehlversuch, falsche Bus-/Fußwegwahl, unvollständige Antworten, richtige Teilinformation bei falscher Gesamtantwort, zwei Fehler und bewusster unterstützter Abschluss; Zielkonflikt, konkrete andere Priorität und Zieländerung; unklare Texte ungeprüft und escaped; Speicherung blockiert/beschädigt; Präfix `/Afrika-2040/`; native Tastatur samt tatsächlicher Werteprüfung                                          |
| Zugänglichkeit                             | Scoped axe A/AA-Prüfungen der bisherigen Ansichten, benannten Gruppe und neuen Karte, Vergleichs-, Erklärungs-, Konflikt- und Abschlussansichten ohne gemeldete Verstöße. Das beweist keine vollständige WCAG-/Screenreader-Konformität                                                                                                                                                                                                              |
| WebKit                                     | **Nicht ausgeführt.** Ein tatsächlicher Startversuch scheitert vor dem ersten Spielschritt am fehlenden WebKit-Browser. Der Installationsversuch wird vom Cloud-Proxy mit HTTP 403 „Domain forbidden“ für die offiziellen Download-Domains abgewiesen. Kein bestandener oder übersprungener WebKit-Test behauptet                                                                                                                                    |
| macOS / physisches iPad / reale Lerngruppe | Nicht geprüft. Die native macOS-Sequenz muss auf einem entsprechenden Rechner samt Wertprüfung bestätigt werden. Chromium-Geräteemulation ersetzt Safari, iPad-Hardware oder Unterrichtsbeobachtung nicht                                                                                                                                                                                                                                            |

Die Vergleichstabelle passt auf beiden simulierten iPad-Ausrichtungen mit allen drei Zeilen und Auswahlmöglichkeiten in den sichtbaren Bereich; die JSON-Messwerte dokumentieren Höhe/Position und fehlenden horizontalen Überlauf. Die zusätzliche Karte ist dafür nicht erforderlich. Ein normaler vertikaler Fortgang zwischen Lokalisierung, Erklärung und Begründung bleibt möglich. Ein vollkommen scrollfreies Spiel wird nicht behauptet.

In einem Entwicklungslauf führte ein von mir parallel gestarteter Browserlauf im selben Standard-Ausgabeordner zu zwei fehlenden Trace-Dateien. Dies betraf das Aufräumen, nicht eine fehlgeschlagene fachliche Assertion. Der aufgezeichnete Schlusslauf wurde allein, ohne weiteren Browserlauf im selben Ausgabeordner ausgeführt. Der separate WebKit-Startversuch hat einen eigenen Ausgabeordner.

### WebKit-Voraussetzung der Cloud

Ein unterstützter Konfigurationsentwurf wurde gespeichert; hinzugefügt wurden ausschließlich `cdn.playwright.dev` und `playwright.download.prss.microsoft.com`. Die bisherigen Paketmanager-Presets bleiben erhalten. Die Plattform meldet `status: saved` und `requires_publish: true`. Das speichert den Entwurf, aktiviert aber weder den Netzwerkzugriff noch den Browser.

Nach [Cloud-Einrichtung: setup](skill://plugin_connector_1p_ed5feb9070a08191b08c81c47947bc16/setup/SKILL.md) gilt: „Saving persists configuration; it does not execute scripts, apply runtime changes, or publish.“ Die Umgebungseinstellungen müssen geprüft und gespeichert und anschließend die **Cloud-Umgebungskonfiguration** veröffentlicht werden. Das ist keine Veröffentlichung des Spiels. Danach ist der fehlgeschlagene Download erneut zu prüfen, WebKit zu installieren und das Projekt tatsächlich auszuführen:

```sh
PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npx playwright install webkit
PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npm run test:e2e -- --project=webkit
```

Diese beiden Befehle sind noch kein Erfolgsnachweis; der erste scheitert derzeit an der dokumentierten Zugriffssperre. Falls danach Systembibliotheken fehlen, müssen diese gesondert eingerichtet und die Tests fortgesetzt werden. Kein TLS-Abschalten, kein Zugriff außerhalb des Proxys und kein alternativer Downloadweg zur Umgehung der Domainsperre.

## Didaktische Selbstevaluation zu den sieben Abnahmepunkten

1. **Räumliche Veränderung erkennen:** Die Aufgabe verlangt eine konkrete Fußverbindung. Der Wohnbereich allein ist ein anerkannter, aber noch unvollständiger Teilgedanke. Karte und Umweg verknüpfen Ort und Änderung. Eine passende Auswahl nach Hilfe beweist dennoch kein selbstständiges Erkennen.
2. **Ursache und Folge verknüpfen:** Der Zeitvergleich genügt nicht zum Abschluss. Der Einstieg in Süd und der unveränderte Fußweg müssen als Zusammenhang gewählt bzw. bewusst unbewertet selbst erklärt werden. Die Wirkung der anderen Fußverbindung auf Direkt/Nord bleibt davon unterschieden. Eine korrekte Bausteinverbindung ist angeleitet.
3. **Unterstützter Abschluss:** Hinweise lenken den Blick, markieren den Weg und erklären anschließend konkret. Nach höchstens zwei bewerteten erfolglosen Versuchen steht eine bedienbare Beispielübernahme bereit. Fehlende Eingaben und richtige unvollständige Informationen verbrauchen keine Versuche. Dieser Ablauf wurde tatsächlich im Browser gespielt; tatsächliche Lesbarkeit für einzelne Lernende bleibt zu erproben.
4. **Anspruch für stärkere Lernende:** Sie können erklären, warum Amina/David nicht betroffen sind, Fuß- und Busfahrt unterscheiden, andere Interessen priorisieren und Modellgrenzen benennen. Sprachliche Hilfen schließen diese fachliche Vertiefung nicht aus. Das Spiel beurteilt solche eigenen Ausführungen nicht automatisch.
5. **Beibehalten und Ändern gleichwertig:** Beide Wege benutzen dieselben Prüfbedingungen und dieselbe neutrale Rückmeldung. Erst konkrete Jetzt-Belege plus Ziel-/Gewichtungsverbindung oder eine ausdrücklich ungeprüfte eigene Erklärung erlauben den Abschluss. Weder ein Linienwechsel noch das Festhalten allein erzeugen einen Erfolgsnachweis.
6. **Keine erfundene Nairobi-Prognose:** Modellcharakter und erfundene spätere Bedingung bleiben sichtbar. Die vorgegebenen Minuten beschreiben nur dieses reduzierte Modell; keine allgemeine Aussage über Nairobi, Kenia oder das Jahr 2040. Nachhaltigkeit, Fahrpreise, Wartezeiten und Kapazität werden nicht aus Reisezeit allein bewertet.
7. **Klickerfolg ist kein Verstehensnachweis:** Das Produkt dokumentiert ausgewählte Informationen und eine angeleitete Gewichtung. Hilfen und unbewertete Texte sind gekennzeichnet. Selbstständiges geographisches Verstehen, Förderwirkung und Unterrichtswirksamkeit müssen unabhängig und mit der Lerngruppe beobachtet werden. Die fachliche Einschränkung bleibt intern; Schülertexte bleiben verständlich.

Curriculare Herleitung mit Seitenangaben: [curriculum.md](curriculum.md), besonders die neue Ergänzung zu Prozess, Erreichbarkeit und erneuter Kriterienanwendung. Alle drei Original-PDFs sind auf 159/159 Seiten weiterhin textuell zugänglich; identische Hashes und kein fehlender Dateizugriff. Das frühere Renderaudit wird nicht als neuer Vollrender ausgegeben.

## Abgabe und Grenzen

Die vollständige neue Commit-ID und der saubere Arbeitsbaumstatus stehen im äußeren `BESTAND.txt` des ZIP-Prüfpakets. Die Prüfeingaben sind vor der Abgabe gehasht. Das ZIP außerhalb des Repositorys enthält vollständigen Quellstand mit Lockfile, Tests, Protokollen, relevanten Bildern und ein eigenständiges Git-Bundle; Wiederherstellung und Dateiprüfsummen werden geprüft. Keine Zugangsdaten, `.env`-Dateien, `node_modules`, Builds oder große Trace-/HTML-Berichtsordner.

Kein Push, Merge oder Deployment; keine weitere Entwicklungsphase. Der aktuelle Auftrag verlangt eine gesonderte Freigabe für eine spätere Übertragung. Der bekannte Cloud-Dateiexport ist weiterhin kein bestätigter Downloadkanal; ein lokal geprüftes ZIP behebt diese Plattformgrenze nicht. Eine Übertragung nach GitHub wird nicht zur Umgehung der neuen Push-Grenze vorgenommen. Unabhängige Gegenprüfung, tatsächlicher WebKit-Lauf und Unterrichtserprobung bleiben offen.
