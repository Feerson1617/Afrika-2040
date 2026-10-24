# Afrika 2040 – unabhängige Gegenprüfung Phase 2B

23. Oktober 2026 · **Ergebnis: Phase 2B noch nicht freigeben. Eine begrenzte Korrektur der automatischen Unterstützung ist nötig (B1, P2).** Modellzeiten, Vorher-/Jetzt-Darstellung, Aufbewahrung der ersten Empfehlung sowie begründetes Beibehalten und Wechseln funktionieren in den geprüften Abläufen. Auch tatsächliche WebKit-Durchläufe konnten unabhängig nachgeholt werden. Der Befund verlangt keine neue Entwicklungsphase oder grundlegende Umgestaltung.

## 1. Tatsächlich geprüfter Stand

| Merkmal | Unabhängig festgestellt |
|---|---|
| Repository | [Feerson1617/Afrika-2040](https://github.com/Feerson1617/Afrika-2040) |
| Branch | `feat/phase2b-kenia-strassenereignis` |
| Commit | [`8eb0d8bcdaf45da27ca0a9cdab5de09a10238562`](https://github.com/Feerson1617/Afrika-2040/commit/8eb0d8bcdaf45da27ca0a9cdab5de09a10238562) |
| Git-Baum | `2156bc8b6e501e35db1f5c60004b13f40509051b` |
| Ausgangscommit | `518d2168813aa93c20dd674898e2b26aa644c87d` |
| Remote Phase 2A am Prüfende | unverändert `518d2168813aa93c20dd674898e2b26aa644c87d` |
| Remote `main` am Prüfende | unverändert `b07f8244ab64763aea9c3f96ce3358fab3c1cf78` |
| Arbeitskopie | frischer Clone, keine Änderungen an versionierten Anwendungsdateien am Prüfende |

Die Prüfung verwendet den tatsächlich von GitHub geladenen Code. Der neue Phase-2B-Auftrag wurde vollständig gelesen; die darin genannten Abnahmepunkte bilden das Prüfsoll. Codex' Übergabe, Entwickler-Screenshots und Selbsttests wurden als Behauptungen behandelt und eigenständig nachgeprüft. Der angebotene GitHub-ZIP-Download und dessen behauptete Prüfsumme wurden nicht zusätzlich kontrolliert, weil der vollständige Git-Stand unmittelbar geklont werden konnte.

Abhängigkeiten wurden lokal installiert, der Build neu erzeugt und der Prototyp gestartet. Die gelieferten Browsertests liefen in einer separaten Prüfkopie mit anderen lokalen Ports, einem Worker und 60 Sekunden Testlimit. Es wurde kein Testwert zur Erzwingung eines Erfolgs gesetzt. Die Anwendung wurde nicht korrigiert; kein eigener Push, Merge, Pages-Deployment oder Beginn einer weiteren Phase.

## 2. B1 – P2: Keine automatische Unterstützung bei zurückgewiesenem Vorher-/Jetzt-Beleg

**Selbst im Browser reproduziert, zusätzlich durch native Tastatureingaben und Codeprüfung bestätigt.**

Konkrete Reproduktion:

1. Die erste Empfehlung „Über Nord“ mit dem Ziel „Amina: kurzer Schulweg“ abschließen.
2. Das Ereignis öffnen; Leilas Fußweg zum Platz erkennen und die Folgen korrekt vergleichen und erklären.
3. In der erneuten Empfehlung bei Nord und dem Amina-Ziel bleiben. Die richtigen Belege Amina/Nord 10 statt Direkt 22 sowie David/Nord 18 statt Direkt 12 sind vorhanden.
4. Unter „Das hat sich für meinen Vorschlag verändert“ **„Leila · Über Süd: 10 → 10 Minuten (gleich)“** auswählen.
5. Die vollständige Begründung „Ich bleibe bei Über Nord. Amina braucht 10 Minuten. Dieser kurze Weg ist mir wichtig“ auswählen.
6. „Erneute Empfehlung prüfen“ viermal betätigen, ohne Eingaben zu ändern.

Das Spiel verlangt hier einen Vorher-/Jetzt-Beleg zur **jetzt empfohlenen** Linie. Es weist die andere Zuordnung zurück und blendet keinen Abschluss ein. Die Rückmeldung lautet unter anderem „Zeige Leilas Zeit für die Linie, die du jetzt empfiehlst.“ Sie bleibt nach allen vier Prüfungen gleich:

| Prüfung | interner Versuchszähler | Hilfestufe | Abschluss | Übernehmbares Beispiel |
|---|---:|---:|---|---|
| 1 | 0 | 0 | gesperrt | fehlt |
| 2 | 0 | 0 | gesperrt | fehlt |
| 3 | 0 | 0 | gesperrt | fehlt |
| 4 | 0 | 0 | gesperrt | fehlt |

Die ausgewählte Süd-Zeit ist **zahlenmäßig richtig**. Der Befund ist keine falsche Zeitberechnung oder unzulässige politische Entscheidung. Er betrifft eine vollständig ausgefüllte, aber vom Spiel als nicht passend bewertete Zuordnung. Dafür bleibt die zugesagte adaptive Unterstützung aus. Anders als eine leere Eingabe oder ein legitimer Zielkonflikt ist der Fall bereits konkret zurückgewiesen und kann unverändert endlos erneut geprüft werden.

Die Regel „nach spätestens zwei erfolglosen bewertbaren Versuchen erklären und einen tatsächlich bedienbaren unterstützten Weiterweg anbieten“ gilt auch für diese neue Pflichtauswahl (Auftrag Abschnitte 10 und 14C). Für Lernende, die die lange Rückmeldung nicht selbst auf die richtige Auswahl übertragen können, ist die fehlende automatische Hilfe wesentlich.

Der Befund wurde für **alle sechs Kombinationen aus empfohlener Linie und einer der beiden anderen Beleglinien** in **Chromium und WebKit** bestätigt. Zusätzlich wurde der Nord/Süd-Fall in der nativen Browseroberfläche viermal mit Tastatureingaben geprüft. Es handelt sich nicht um ein plattformspezifisches Testproblem.

**Vorhandener Ausweg:** Die freiwillige Hilfe kann selbst geöffnet und bis Stufe 3 bedient werden. Das Beispiel lässt sich dann übernehmen und der Abschnitt abschließen. Dieser Ausweg wurde für alle drei Linien getestet. Es liegt somit kein dauerhafter technischer Lock vor; P2 statt P1 ist angemessen. Die zugesagte automatische Unterstützung muss dennoch vor der Phase-2B-Abnahme ergänzt werden.

**Codeursache:** `src/event.ts:97–108` sperrt den Abschluss bei einer anderen `changeEvidence`-Linie. `src/state.ts:524–542` berücksichtigt für die Unterstützungsschwelle im erneuten Empfehlungsabschnitt dagegen nur `hasIncorrectDecisionEvidence(r.review, 'now')`, also die bisherigen Vor-/Nachteilsbelege. Die neue Pflichtzuordnung erreicht diese Schwelle nicht.

**Korrekturziel:** Spätestens nach zwei solchen vollständig bewertbaren, erfolglosen Zuordnungen eine auf diese Auswahl bezogene Erklärung und den bestehenden bedienbaren Hilfeweg anbieten. Richtige Einzelinformationen weiter anerkennen; die tatsächlich wahre Zeitangabe nicht als falsche Zahl bezeichnen. Empfehlungen neutral behandeln. Fehlende Eingaben, legitime Zielkonflikte und sprachlich unklare eigene Texte dürfen dadurch keine Fehlbestrafung erhalten.

Belege: [Browseransicht](evidence/mismatched-change-evidence.png), [native Vierfachprüfung](evidence/native-mismatch-four-checks.txt), `evidence/independent.json`, `evidence/independent-followup.json`. Die Beobachtungsszenarien protokollieren den bestehenden Mangel; ihr erfolgreiches Ausführen ist keine fachliche Abnahme.

## 3. Restpunkt B2 – P3: Native Auswahlfeldtests auf macOS weiterhin nicht zuverlässig

**Selbst ausgeführt; Teststeuerung und tatsächliche Bedienbarkeit getrennt beurteilt.**

Der gelieferte Chromium-Lauf erzielt auf diesem Mac **73/75**. Zwei Tests scheitern an `nativeFirstOption`: der ursprüngliche Phase-2A-Tastaturfall bei `cause` und der neue Phase-2B-Fall bei `event-connection`. Die erwarteten Werte `shorter` bzw. `sued` stehen nach der gesendeten Sequenz noch auf leer.

Positiv: Der Helfer prüft jetzt den tatsächlich ausgewählten Wert, bevor eine fachliche Rückmeldung beurteilt wird. Damit erfüllt die neue Steuerung die geforderte Transparenz, aber noch nicht die zuverlässige Mac-Automatisierung. Die Entwicklerangabe 75/75 unter Linux wurde nicht als 75/75 auf diesem Mac ausgegeben.

Die tatsächliche native Tastaturbedienung wurde zusätzlich von der Startseite bis zum neuen Abschluss durchgeführt: Tab/Shift-Tab, Pfeile, Leertaste, Enter und native Menübedienung. Einzelne Ziele wurden über die Accessibility-Oberfläche fokussiert; Werte wurden durch echte Tastatureingaben gewählt. Ein ursprünglicher Erklärungsfehler führte dabei auch tatsächlich zum bedienbaren unterstützten Weiterweg. Im neuen Abschnitt wurden der Kartenfußweg, Vorher-Ansicht, Vergleich, beide konkreten Ursache-Auswahlen, der B1-Grenzfall und seine Korrektur bedient. Das neue Lernprodukt war erreichbar. **Kein belegter genereller Tastaturfehler des Spiels.**

Empfehlung für die technische Pflege: Den plattformabhängigen Auswahlfeldtest mit verifiziertem Wert weiter korrigieren oder die verbleibende Automatisierungsgrenze ausdrücklich dokumentieren. Kein programmatisches `selectOption` als Tastaturbeweis ausgeben.

Belege: `evidence/provided-browser-tests.txt`, [nativer Abschluss](evidence/native-complete-end.png), `evidence/native-complete-end.txt`.

## 4. Was fachlich und funktional besteht

### Alle 18 Modellzeiten

| Person | Direkt vorher → jetzt | Über Nord vorher → jetzt | Über Süd vorher → jetzt |
|---|---:|---:|---:|
| David | **12 → 12** | **18 → 18** | **18 → 18** |
| Amina | **22 → 22** | **10 → 10** | **28 → 28** |
| Leila | **22 → 28** | **28 → 34** | **10 → 10** |

Alle neun Kombinationen wurden in beiden Situationsständen in der laufenden Oberfläche wiederholt geprüft: Fußzeit, Buszeit, Gesamtzeit, Einstiegshaltestelle und tatsächlich gefahrene Busabschnitte. Für Leila gilt jetzt Direkt 18 + 10 = 28, Nord 18 + 16 = 34, Süd 2 + 8 = 10. Alle Buszeiten bleiben gleich; Amina und David bleiben unverändert.

Die Baustelle und der Umweg liegen auf der **Fußverbindung Leila–Platz**. Die Darstellung suggeriert keine gesperrte Busstraße. Vorher/Jetzt aktualisiert dieselbe zentrale Karte; es wurde keine zweite große Karte parallel eingeführt. Die alte Fußzeit bleibt abrufbar. Der aktuelle Situationsstand ist sichtbar benannt.

### Lernfolge und Empfehlungen

- Die sechs bisherigen Lernschritte bleiben erhalten. Der Übergang zum neuen Abschnitt erfolgt erst nach dem ersten Lernprodukt und bezeichnet eine erfundene spätere Situation.
- Die Auswahl des Wohnbereichs wird als richtiger Teilgedanke gelb anerkannt, ohne Fehlversuch. Vollständig falsche Wege erhalten Rot, bei wiederholten Fehlern Erklärung und übernehmbares Beispiel.
- Der Vorher-/Jetzt-Vergleich steht kompakt zusammen. Die Erklärung, warum Süd unverändert bleibt, wird erst nach dem Vergleich eingeblendet; die vollständige Lösung wird im regulären Ablauf nicht bereits vorher als Erklärung geliefert.
- Richtige Bestandteile der Erklärungsaufgabe werden anerkannt. Fehlende Vergleichs- oder Erklärungsteile verbrauchen keine Fehlversuche. Die Hilfen zum Finden und Vergleichen funktionieren; B1 grenzt die Ausnahme beim neuen Beleg der erneuten Empfehlung ein.
- Die erste Empfehlung wird getrennt gespeichert. Ihre Vorher-Zahlen und ihr Ziel bleiben beim neuen Situationsstand erhalten. Änderungen der erneuten Empfehlung überschreiben sie in den geprüften Abläufen nicht.
- In der erneuten Empfehlung werden passende bisherige Belege als Entwurf weiterverwendet und mit Jetzt-Zahlen angezeigt. Beibehalten benötigt eine ausdrückliche neue Begründung; ein Wechsel allein schließt ebenso wenig ab. Beide Wege erhalten neutrale Rückmeldungen.
- Die korrigierte Behandlung von Zielkonflikten bleibt erhalten: richtige Einzelbelege anerkennen, Konflikt konkret nennen, Zieländerung oder konkrete abweichende Priorität ermöglichen. Süd/Leila wird nun korrekt mit 10 statt Direkt 28 Minuten belegt; die erste Empfehlung enthält weiterhin 10 statt 22.
- Hilfeübernahmen und bewusst unbewertete Texte werden sichtbar gekennzeichnet. HTML-Zeichen bleiben Text; kein Bild oder Skript aus der Testeingabe erschien. Unklare Texte werden nicht anhand von Schlüsselwörtern bewertet.
- Rücksprung, erneutes Bearbeiten, Neuladen, alter Phase-2A-Abschluss, beschädigter optionaler Ereignisstand, gesperrter Speicher sowie Neustart mit Bestätigung/Abbruch wurden geprüft. Ein beschädigter Ereignisstand kann verworfen werden, während die gültige erste Empfehlung erhalten bleibt.

### Frühere kleine Korrekturen

Die benannte Gruppe des Auswahlkontexts besitzt jetzt die passende `group`-Rolle. Die eigene axe-Prüfung zeigt dort keinen bisherigen ARIA-Restbefund mehr. Die schwer verständliche Aussage über „vollständig selbstständige Urteilskompetenz“ wurde aus der Schüleroberfläche entfernt und durch eine einfache Baustein-Kennzeichnung ersetzt. Die inhaltliche Aussagegrenze bleibt intern dokumentiert.

## 5. Tatsächlicher Prüfumfang und Geräte

| Prüfung | Unabhängiges Ergebnis |
|---|---|
| Logiktests | **89/89 bestanden** |
| Produktionsbuild | erfolgreich, TypeScript und Vite |
| Gelieferte Chromium-Browsertests | **73/75 bestanden**, zwei native Mac-Testtreiberfälle wie B2 |
| Eigene Browserprüfung | **37 verschiedene Szenarien**, einschließlich gezielter Beobachtungsfälle zu B1 |
| Vollständige systematische Matrix | 18 frische Gesamtverläufe, jeweils mit begründetem Beibehalten und anschließendem begründetem Wechsel; zusätzlich sechs frische Gesamtverläufe unter Pages-Unterpfad |
| Zusätzlicher WebKit-Kartentouch | zwei weitere Gesamtverläufe hoch/quer mit tatsächlichem Touch auf die SVG-Fußverbindung |
| Native Browseroberfläche | kompletter zusätzlicher Verlauf bis zum neuen Abschluss und manuelle Reproduktion von B1 |
| Fehlerbeobachtung | keine JavaScript-Ausnahmen, Konsolenfehler, HTTP-Fehler, fehlgeschlagenen oder externen Laufzeitanfragen in den eigenen automatisierten Abläufen |

Die 18 Matrixfälle kombinieren drei ursprüngliche Empfehlungen mit Desktop 1440×1000, iPad quer 1024×768, iPad hoch 768×1024 und zwei Engines: **Chromium 145.0.7632.6 und WebKit 26.0**. Formulare und Situationswechsel wurden in den iPad-Fällen mit Touch-Ereignissen bedient. Der zusätzliche WebKit-Kartentouch wurde anhand der tatsächlichen SVG-Geometrie ausgelöst, nicht durch bloßes Setzen eines Werts.

Damit wurde der in Codex' Cloud offen gebliebene **tatsächliche WebKit-Lauf unabhängig nachgeholt**. Verwendet wurde eine bereits lokal verfügbare WebKit-Version mit passendem lokalen Playwright-Laufzeitsystem, ohne die Cloud-Netzwerkfreigaben zu verändern. Dies ist kein Nachweis auf einem physischen iPad oder in iPadOS-Safari. Die 17 mitgelieferten WebKit-Projektfälle wurden nicht zusätzlich unter der aktuellen Repository-Playwright-Version als bestanden ausgegeben.

Die sechs Pages-Fälle spielen alle drei Empfehlungen in beiden Engines vom Start bis zum neuen Abschluss unter `/Afrika-2040/`, einschließlich Neuladen. JavaScript und CSS werden aus dem korrekten Unterverzeichnis geladen. Keine öffentliche Seite wurde für den Nachweis bereitgestellt.

Screenshots wurden aus beiden Engines und allen drei Bildschirmgrößen erzeugt; repräsentative Karten-, Vergleichs-, Überarbeitungs- und Abschlussansichten wurden visuell betrachtet. Die eigene Vergleichstabelle hat in den dokumentierten WebKit-Ansichten rund 304 Pixel Höhe und 52 Pixel hohe Auswahlzeilen. Sie passt einschließlich aller Vorher-/Jetzt-Werte in die jeweiligen sichtbaren Bereiche. Kein horizontaler Überlauf wurde festgestellt. Die erneute Empfehlung ist im Hochformat weiterhin länger und erfordert normales vertikales Scrollen; die erste Empfehlung und Belegänderung sind dafür einklappbar. Die tatsächliche Suchlast einer Schülerin oder eines Schülers ist durch Bildschirmmessungen nicht nachgewiesen.

Eigene axe-Prüfung mit ausgewählten WCAG-A/AA-Regeln bis 2.2: keine automatisch bestätigten Verstöße in sieben Zuständen (bisheriger Auswahlkontext, Finden, Vergleich, Erklärung, Zielkonflikt, unterstützte Empfehlung, Abschluss). SVG-Farbkontraste bleiben teilweise manuell zu prüfen. Kein vollständiger WCAG- oder Screenreader-Nachweis.

Im ersten eigenen Altspeicher-Test enthielt die Prüferwartung noch `undefined`-Eigenschaften, die JSON naturgemäß nicht speichert. Der Vergleich wurde entsprechend normalisiert und der ganze Migrationsfall separat erfolgreich wiederholt; der Anwendungscode wurde dafür nicht verändert. Rohprotokoll und Nachlauf bleiben erhalten. Erfolgreich ausgeführte B1-Beobachtungsfälle sind nicht als fachlich bestandene Hilfenregel zu lesen.

## 6. Die sieben didaktischen Abnahmepunkte – unabhängige Bewertung

| Frage | Befund am tatsächlichen Lernhandeln |
|---|---|
| 1. Wird eine räumliche Veränderung erkannt? | Aufgabengerecht angebahnt: konkrete Fußverbindung auf derselben Karte wählen und die Änderung lokalisieren. Der Schülertext benennt Leila/Platz bereits, sodass hier vor allem Lokalisieren und Verknüpfen von Text/Karte verlangt wird, keine völlig eigenständige Problemfindung. |
| 2. Müssen Ursache und Folge verknüpft werden? | Ja, nach dem Zahlenvergleich sind Einstieg in Süd und unveränderter Fußweg zu verbinden. Die bloße Auswahl „länger/gleich“ reicht nicht zum nächsten Abschnitt. Die Bausteinlösung ist angeleitet, Freitext bleibt ungeprüft. |
| 3. Können schwächere Lernende mit Hilfen abschließen? | Die freiwilligen Hilfen und Beispiele ermöglichen einen tatsächlichen Abschluss, auch ohne Sitzungsspeicher. Automatische Unterstützung ist bei Finden und Folgen wirksam. **B1 verhindert jedoch die vollständig zugesagte adaptive Unterstützung im neuen Belegfeld.** Deshalb noch keine Abnahme. |
| 4. Bleibt für stärkere Lernende Anspruch? | Gegenüber bloßem Rechnen entsteht eine sinnvolle Übertragung: selektive Änderung, unveränderte Wege, erneutes Kriterienurteil. Der reguläre Weg bleibt stark vorstrukturiert. Eigene Erklärung zu Amina/David und Modellgrenzen ist optional und muss im Gespräch oder eigenen Produkt geprüft werden. Nicht als nachgewiesene vertiefte Leistung ausgeben. |
| 5. Sind begründetes Beibehalten und Ändern gleichwertig? | Ja, in allen Matrixfällen beide Wege vollständig durchgespielt. Beide benötigen neue Belege/Begründung, beide sind neutral; kein Wechselbonus, keine Punktwertung und kein bloßer Wechsel als Lernzuwachs. |
| 6. Wird eine allgemeine Nairobi-/Kenia-Aussage vermieden? | Ja. Spätere Situation, Baustelle, Personen und Zeiten sind ausdrücklich erfunden. Die Reparatur wird als lokales Modellereignis gezeigt, nicht als typisches Defizit eines ganzen Kontinents oder als Prognose für 2040. Reale Nairobi-Verkehrskenntnis wird damit allerdings nicht erworben oder belegt. |
| 7. Wird Klickerfolg nicht mit eigenständigem Verstehen gleichgesetzt? | Die Schülerrückmeldung kennzeichnet Bausteine und Hilfen verständlich. Ein Lernprodukt und eine ausgewählte Gewichtung werden gespeichert. Eigenständiges Verstehen, tatsächliche Förderung und Lernzuwachs können daraus nicht geschlossen werden; dafür ist eine Erprobung mit Zeigen/Erklären nötig. |

## 7. Abgleich mit den drei Originaldokumenten

Die schreibgeschützten Originale wurden erneut geöffnet und ihre SHA-256-Werte mit der vorherigen unabhängigen Prüfung verglichen: identisch. Gezielt erneut textuell geprüft wurden 14 relevante Originalseiten, nicht alle 159 Seiten neu vollständig didaktisch ausgewertet. Zugriff und Auszüge liegen in `evidence/source-access.json` und `evidence/curriculum-excerpts.json`. Die interne Selbstevaluation ersetzt diese Quellen nicht.

| Originalbezug | Tatsächlich umgesetzter Beitrag | Grenze |
|---|---|---|
| Fachanforderungen Geographie SH 2015, S. 14: Struktur, Funktion, Prozess | Bekannte Lagebeziehungen bleiben Grundlage; eine räumlich begrenzte Veränderung wirkt selektiv auf Erreichbarkeit und führt zur erneuten Entscheidung. | Ein vereinfachter Prozessfall; keine allgemeine Stadtentwicklungs- oder Infrastrukturtheorie. |
| Fachanforderungen S. 20, O3 S6 / O4 S14 | Konkreten Fußweg in schematischer Karte erkennen, Einstieg und Busabschnitte unterscheiden; dieselbe Karte in zwei Zeitständen nutzen. | Modellkarte, kein Nachweis realer Orientierung in Nairobi. |
| Fachanforderungen S. 21, M2 S4 / M3 S7 | Vorher-/Jetzt-Informationen vergleichen, unveränderte Buszeiten von verändertem Fußweg trennen. | Auswahl und Zahlen sind vorgegeben; ein Häkchen allein beweist keine selbstständige Auswertung. |
| Fachanforderungen S. 22, B1 S1/S2 und K1 S4 | Frühere Empfehlung anhand der neuen Folgen erneut mit Ziel, Fakten und Gewichtung begründen, Beibehalten oder Ändern darstellen. | Passendes angeleitetes Argument möglich; tatsächliche Gewichtungsfähigkeit und freies Erklären erfordern Lernbeobachtung. |
| Fachanforderungen S. 9/15; Leitfaden SH 2016 S. 20/62 | Gleiche fachliche Frage, sprachliche Hilfen, richtige Teilgedanken anerkennen, freiwillige Vertiefung ohne sichtbare Leistungsgruppen. | Sinnvolle Differenzierung, aber adaptive Lücke B1; individuelle Förderung und Lesen der konkreten Klasse ungetestet. |
| Leitfaden S. 23 | Früheres Lernprodukt sichern, neue Bedingungen untersuchen, überarbeiten und Reflexion anregen. | Diskussion und Reflexion werden angeregt, aber nicht durch das Programm selbst vollzogen. Kein automatischer Lernzuwachsnachweis. |
| Fachanforderungen S. 25; Leitfaden S. 38; ETS Tönning Curriculum PDF-S. 4 | Begrenzter Stadt-/Erreichbarkeitsbaustein im schulischen Afrikaschwerpunkt Jahrgang 7. | Naturraum, Bevölkerungsentwicklung und wirtschaftliche Potenziale der ganzen Einheit bleiben unvollständig. Das ETS-Dokument trägt auf S. 1 weiterhin einen Entwurfsvermerk; aktuelle Beschlusslage nicht verifiziert. |
| Leitfaden S. 86 | Mehrere Interessen, Reflexion fehlender Wartezeit/Preise/Kapazitäten. | Reisezeiten allein ergeben keine umfassende Nachhaltigkeitsbewertung. Keine reale Partizipation oder umfassende Afrikakompetenz nachgewiesen. |

Didaktisch ist die Erweiterung grundsätzlich stimmig: Die Lernenden müssen erkennen, dass eine lokale Veränderung bestimmte Wege betrifft und andere nicht. Die erste Empfehlung bleibt als Vergleichsprodukt erhalten; deshalb entsteht mehr als eine zweite isolierte Quizrunde. Das Modell bleibt bewusst klein und enthält keine neue Episode oder zusätzliche Welt. Schwache Leser benötigen dennoch verlässliche Unterstützung genau an den Übergängen zwischen Fakt, gewählter Linie und Begründung; B1 betrifft einen solchen Übergang.

## 8. Evidenzgrenzen und Entscheidung

**Selbst getestet:** tatsächlicher Commit/Build, beschriebene Browserabläufe, alle 18 Zeiten und Teilwege, Vorher/Jetzt, alte/neue Empfehlungen, Beibehalten/Wechseln, richtige/falsche/teilweise/unvollständige Antworten, Hilfen, Speicherfälle, Neustart, Desktop/iPad-Simulation, tatsächliche Touch-Auswahl der Karte und native Tastatur, lokale Pages-Pfade und Fehlerbeobachtung.

**Nur Code geprüft bzw. daraus abgeleitet:** genaue Ursache des Hilfenzählers, zentrale Ereignis-/Berechnungs-/Speicherstruktur und die semantische Korrektur der Gruppe. Das ist kein vollständiges Sicherheits- oder Konformitätsaudit.

**Nicht verifiziert:** physisches iPad/iPadOS-Safari, VoiceOver/NVDA, vollständige Barrierefreiheit, Verständlichkeit oder Lernwirkung in der tatsächlichen Klasse, aktuelle schulische Beschlusslage, öffentlich ausgelieferte Pages-Version sowie das angebotene ZIP. Der WebKit-Motor wurde tatsächlich lokal ausgeführt; die offene Cloud-Installation bleibt ein anderer Umgebungszustand.

**Entscheidung:** Noch eine gezielte Korrekturrunde zu B1, anschließend diesen Grenzfall und die betroffenen Hilfen-/Empfehlungsregressionen erneut prüfen. Kein Anlass für eine neue inhaltliche Phase oder einen grundlegenden Umbau. B2 bleibt ein kleiner gesonderter Teststeuerungspunkt. Die bereits positiv geprüfte Phase 2A wird durch diesen neuen Phase-2B-Befund nicht nachträglich als ungeeignet bewertet.

Ein fertiger begrenzter Folgeauftrag steht in [Korrekturprompt-Phase2B.txt](Korrekturprompt-Phase2B.txt). Er wurde nicht an Codex gesendet und nicht ausgeführt. Spielcode, Branches und Veröffentlichung wurden durch die Prüfung nicht verändert.
