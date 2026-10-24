Prüfe und korrigiere ausschließlich den folgenden Befund im Repository Feerson1617/Afrika-2040.

Ausgangsbranch: feat/kenia-phase2b-fix-und-episode2
Unabhängig geprüfter Ausgangscommit: d2a3c7aa6c075040e7831b76776ad8a3dd4e4331
Prüfe zuerst den tatsächlichen Stand. Erhalte vorhandene Änderungen und alle bereits bestandenen Funktionen. Kein Merge, kein Push und keine Veröffentlichung ohne gesonderte Freigabe. Keine weitere Episode, keine neue Spielmechanik, keine Unterrichtsbegleitmaterialien.

Die Phase-2B-Feedbackkorrektur ist unabhängig bestätigt. Auch Episode 2 besteht die fachlichen, funktionalen und vollständigen Browsergegenproben. Benötigt wird eine kleine Korrektur der Kartenbeschriftung und des Zugänglichkeitstests.

B1, P2 – sichtbarer Text fehlt im zugänglichen Namen:
In src/demand-ui.ts:72–83 tragen die interaktiven SVG-Gruppen #demand-map-path und #demand-map-bus feste aria-label-Texte. Sichtbar stehen dagegen „Neue Verbindung?“, später „4 Min. · neuer Weg“ sowie „2 Fahrten / Std.“ oder „3 Fahrten / Std.“. Diese Texte kommen im berechneten zugänglichen Namen nicht vor. Im unabhängigen Chromium- und WebKit-Lauf meldet axe label-content-name-mismatch. W3C SC 2.5.3, Stufe A, verlangt sichtbaren Beschriftungstext im zugänglichen Namen. Sprachsteuerung wurde nicht praktisch getestet; die Namensabweichung ist im Browser nachgewiesen.

Reproduktion: Episode 2 direkt starten → Ausgangslinie wählen → Jetzt → Nein → 4 Personen → prüfen → weiter → Busfahrt und Fußweg auf der Karte testen. Vergleiche sichtbare Texte und Namen vor/nach beiden Maßnahmen.

Korrektur:
1. Gestalte sichtbare und zugängliche Namen konsistent, auch nach Zustandswechseln. Behalte kurze verständliche Handlungsbezeichnungen. Möglich sind konsistente sichtbare Beschriftungen oder ein Name, der den tatsächlich sichtbaren Text enthält und die Funktion ergänzt. Die konkrete Lösung darf keine dynamischen Zahlen verfälschen und kein neues Textproblem erzeugen.
2. Erhalte tatsächliche Karteninteraktion per Touch und Tastatur, aria-pressed, sichtbaren Fokus sowie die gleichwertigen HTML-Tasten. Keine Lösung durch Entfernen der Interaktivität oder bloßes Ausblenden sichtbarer Beschriftung vor Hilfstechnik.
3. Ergänze den Test in tests/browser/episode2.spec.ts:549. Der derzeitige Filter wcag2a/wcag2aa/wcag21aa/wcag22aa lässt wcag21a aus und übersieht deshalb diese Regel. Prüfe die relevanten A-/AA-Kategorien einschließlich wcag21a und/oder label-content-name-mismatch ausdrücklich. Nicht die Regel ausschließen oder nur einen Screenshot als Nachweis verwenden.
4. Prüfe ohne Maßnahme, mit zusätzlicher Fahrt und mit kurzem Weg; danach erneut zurückschalten. Die Namen müssen zu jeder sichtbaren Beschriftung passen. Untersuche die tatsächlichen berechneten Namen im Browser und beide Kartensteuerelemente.
5. Spiele je Maßnahme einen vollständigen Verlauf, inklusive Touch und Tastatur, Neuladen und sichtbarem Abschluss. Bestätige unveränderte Sollwerte: 16→24 Menschen, 20 Plätze; Busmaßnahme 30 Plätze/12 Minuten; Wegmaßnahme 20 Plätze/4 Minuten. Kein Punktabzug und keine Änderung an Hilfen, neutralen Entscheidungen oder früheren Lernprodukten.
6. Führe die bisherigen Logiktests, Build und passenden Browserregressionen aus. Chromium und WebKit tatsächlich testen, soweit die Umgebung dies zulässt; fehlende Browser getrennt ausweisen. Keine veraltete WebKit-Prüfung als aktuellen Nachweis ausgeben.

B2, P3 – Testtreiber, bei Gelegenheit innerhalb dieses kleinen Umfangs:
Auf dem Prüf-Mac bestanden 98/100 mitgelieferte Chromium-Fälle. phase2a.spec.ts:337 und phase2b.spec.ts:384 scheiterten an leeren nativen Auswahlwerten. Im sichtbaren Browser funktionierte Öffnen → Home → Abwärtspfeil → Enter mit tatsächlicher Auswahlkontrolle; der alte Ablauf wurde anschließend vollständig abgeschlossen. Falls sicher begrenzt möglich, verbessere die plattformgerechte native Testhilfe. Niemals programmatisch Werte zuweisen und das als Tastaturbeleg ausgeben, Assertions entfernen oder rot als grün dokumentieren. Falls deine Umgebung den Fall nicht nachstellen kann, offen dokumentieren; kein Umbau der Anwendung dafür.

Abschluss: kleiner eigener Korrekturcommit; genaue SHA, knapper Änderungsnachweis, tatsächlich gelaufene Tests und verbleibende Grenzen. Anwendungs- und Prüfkorrekturen klar nennen. Keine behauptete vollständige Barrierefreiheit oder Unterrichtswirkung. Danach stoppen und unabhängige Nachprüfung ermöglichen; keine weitere Episode.
