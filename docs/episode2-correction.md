# Kenia Episode 2 – SVG-Namen und dauerhafte Accessibility-Prüfung

24. Oktober 2026. Gezielte Korrektur für die unabhängige Nachprüfung; keine neue Episode oder Spielmechanik.

## Stand und Änderungsnachweis

Ausgangsbranch: `feat/kenia-phase2b-fix-und-episode2`. Der tatsächliche Ausgangscommit war exakt `d2a3c7aa6c075040e7831b76776ad8a3dd4e4331`, der Arbeitsbaum sauber. Die Korrektur wird als ein nachfolgender eigener Commit abgelegt. Seine vollständige SHA steht in der Übergabe und in `BESTAND.txt` des Prüfpakets.

Maßgeblich sind der [beigefügte Korrekturprompt](episode2-correction-request.md) und die ergänzenden Abnahmeanforderungen des Nutzers. Der Prompt ist als Arbeitsauftrag einbezogen; seine Aussagen über die frühere unabhängige Prüfung sind keine Ergebnisse unserer neuen Prüfung.

**Anwendung:** Nur `src/demand-ui.ts` wurde geändert. Sichtbarer Text und zugänglicher Name der beiden SVG-Tasten beziehen ihre Beschriftung jetzt aus denselben dynamischen Zeichenfolgen. Der Name beginnt mit dem sichtbaren Text und ergänzt die kurze Handlung:

| Zustand / sichtbarer Text | Berechneter zugänglicher Name                |
| ------------------------- | -------------------------------------------- |
| Neue Verbindung?          | Neue Verbindung? Kürzere Verbindung testen   |
| 4 Min. · neuer Weg        | 4 Min. · neuer Weg Kürzere Verbindung testen |
| 2 Fahrten / Std.          | 2 Fahrten / Std. Zusätzliche Fahrt testen    |
| 3 Fahrten / Std.          | 3 Fahrten / Std. Zusätzliche Fahrt testen    |

Kein Entfernen von Interaktivität, keine versteckte Ersatzbeschriftung, kein `aria-hidden` auf dem sichtbaren Text. `role`, `tabindex`, `aria-pressed`, Aktionen, Geometrie und sichtbare Texte bleiben erhalten. CSS, alle Rechen-/Inhaltsmodelle, Feedback, Zustandsverwaltung, Speicherung, übrige Anwendungsdateien und Abhängigkeiten sind gegenüber dem geprüften Ausgangsstand bytegleich. 17 geschützte Dateien mit Hashes: `evidence/episode2-correction/unchanged-learning-files.json`.

**Prüfkorrektur:** `tests/browser/accessibility.ts` bündelt alle relevanten A-/AA-Tags: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22a`, `wcag22aa`. Sämtliche bisherigen neun Axe-Aufrufstellen verwenden diesen gemeinsamen Filter. Es werden keine Regeln ausgeschlossen. Die bisherigen Testabläufe und Ergebnisprüfungen bleiben erhalten; unnötige Formatänderungen an alten Testdateien wurden vermieden.

Axe 4.14.0 liefert dafür 70 automatisierte Regeln, einschließlich `label-content-name-mismatch` (WCAG 2.5.3, A). Der Tag `wcag22a` ist ausdrücklich enthalten; die installierte Version ordnet ihm **keine automatisierte Regel** zu. Das ist kein vollständiger Nachweis dieser Erfolgskriterien. Vollständige WCAG-Konformität erfordert weitere manuelle Prüfungen. Inventar: `wcag-coverage.json`.

## Namens- und Bediennachweis

Die neuen Browserfälle prüfen den berechneten Namen mittels `toHaveAccessibleName`, rollenbasierter Namenssuche und ARIA-Snapshot. In Chromium werden außerdem die nativen Namen über `Accessibility.getPartialAXTree` aus dem tatsächlichen Browser-Accessibility-Baum gelesen. Es wird nicht nur das HTML-Attribut verglichen.

Für Desktop, simuliertes iPad quer und hoch werden je 13 Zustände dokumentiert. Die Folge ohne Maßnahme → Bus → Fußweg → Bus → ohne → Fußweg → ohne umfasst alle sechs gerichteten Wechsel zwischen den drei Modellständen. Bei jedem Stand werden beide sichtbaren Beschriftungen, beide berechneten Namen, `aria-pressed` der SVG-/HTML-Tasten und der vollständige gemeinsame Axe-Filter geprüft. Sichtbarkeit und fehlendes `aria-hidden` der SVG-Texte werden zusätzlich geprüft.

Space/Enter aktivieren die SVG-Tasten; Tab und Shift+Tab verbinden sie. Nach dem Neurendern bleibt die jeweils bediente Taste fokussiert. Der sichtbare Fokus wird mit `:focus-visible`, berechnetem 3-px-Umriss und Bildschirmaufnahme geprüft. Gleichwertige HTML-Tasten funktionieren per Touch sowie nativer Tastatur und behalten ihren Fokus. Neuladen stellt die zur gespeicherten Maßnahme passenden Namen wieder her. Die vorhandenen vollständigen Karten-Touch-Verläufe bleiben Teil der Gesamtprüfung.

**Negativprobe:** Im isolierten Test-DOM wird eine falsche `aria-labelledby`-Referenz gesetzt, während das `aria-label` weiterhin korrekt ist. Der tatsächlich berechnete Name weicht dann vom Attribut ab und die Namensprüfung erkennt das. Beim Bus wird zusätzlich der alte statische Name eingesetzt. Der vollständige Axe-Filter meldet genau die beiden betroffenen Tasten unter `label-content-name-mismatch`. Ein echter UI-Schritt stellt anschließend das normale Markup her und die Prüfung besteht wieder. Die Produktionsdateien werden durch diese Probe nicht verändert. Ihr JSON ist ausdrücklich als absichtliche DOM-Regression gekennzeichnet.

Vor der Anwendungskorrektur sind die beiden neu ausgeführten Prüfungen tatsächlich fehlgeschlagen: Namensvergleich und erweiterter Episode-2-Axe-Fall. `regression-before.txt` belegt dies. Die Negativprobe und dieser Vorlauf sichern gegen eine erneute Trennung von sichtbarem und zugänglichem Namen ab.

## Tatsächlich gelaufene Prüfungen

| Prüfung                                  | Ergebnis                                                                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Bestehende Logiktests                    | **117/117 bestanden**, einschließlich aller bekannten Rechenwerte, Zielkonflikte, Teilantworten, Hilfen, Herkunft und Speicherung          |
| Produktionsbuild                         | TypeScript und Vite erfolgreich                                                                                                            |
| Gezielter Browser-Vorlauf nach Korrektur | **4/4 Chromium-Fälle bestanden**                                                                                                           |
| Abschließende gesamte Browserregression  | **105/105 Chromium-Fälle bestanden**, zwei Worker, keine Retries                                                                           |
| Formatierung / Diff                      | Neue und gezielt geänderte Hauptdateien geprüft; Code-/Testdiff ohne Whitespacefehler                                                      |
| WebKit, neuer Namensfall                 | Tatsächlich gestartet, **vor erster Spielinteraktion gescheitert**: fehlende Browserdatei. Kein bestandener oder still übersprungener Fall |

Die 105 Fälle enthalten die bisherigen 100, vier neue Accessibility-Fälle und einen zusätzlichen vollständigen Tastaturabschluss: Beide Maßnahmen werden nun jeweils mit nativen Tastatureingaben bis zum sichtbaren Lernprodukt und nach Neuladen geprüft. Es werden keine Formularwerte programmatisch als Tastaturnachweis gesetzt.

Die Gesamtregression bestätigt ausdrücklich: beide Maßnahmen aktiv untersuchen; richtige Teilantworten anerkennen; zwei bewertbare Fehlversuche und tatsächlich bedienbare Hilfe; neutrale Zielkonflikte mit konkreter Gewichtung oder Zieländerung; beide unterschiedlich begründeten Empfehlungen; eigene unbewertete Texte; unveränderte alte erste/erneute Empfehlungen; vorhandene Spielstände, Migration, beschädigter/gesperrter Speicher, Zurück, Neubearbeitung und bestätigter Neustart. Die lokalen Pages-Pfade und Ressourcen-/Konsolenprüfungen bestehen weiter.

Alle bekannten Modellwerte bleiben erhalten: 16 → 24 Fahrgäste, zwei Fahrten zu zehn Plätzen = 20 Plätze, vier Personen später; zusätzliche Fahrt 30 Plätze / 12 Minuten Fußweg; kürzerer Weg 20 Plätze / 4 Minuten. Die ursprünglichen 18 Personen-/Linienzeiten bleiben ebenfalls unverändert. Die Kennzeichnung erfundener Modellwerte, die Annahmen der betrachteten Stunde und die Abgrenzung von realen Nairobi-/Kenia-Aussagen bleiben bestehen. Diese Aussagen werden durch unveränderte Quelldateien und die wiederholten Tests gestützt.

Protokolle, native Namen, ARIA-Snapshots, Negativprobe und Bildschirmaufnahmen: [evidence/episode2-correction/](evidence/episode2-correction/). `validation-inputs.json` enthält die genauen Code-/Test-/Buildhashes sowie Node-, npm- und Chromium-Version. Nach der abschließenden Browserprüfung wurden keine Anwendungs- oder Testdateien mehr geändert.

## Lesbarkeit, Touch und verbleibende Grenzen

Repräsentative aktuelle Fokus-, Maßnahmen- und Abschlussansichten wurden visuell geprüft. Die SVG-Schrift beträgt in der Simulation mindestens etwa 15,61 CSS-Pixel quer, 16,73 hoch und 20,18 am Desktop; die alternativen HTML-Auswahlflächen mindestens 44 Pixel. Kein horizontaler Überlauf. Es wurden weder sichtbare Beschriftungen verlängert noch Hitflächen verkleinert. Das neue Namensattribut verändert die sichtbare Darstellung nicht. Diese Messungen ersetzen keine Erprobung mit Kindern oder auf einem physischen iPad.

WebKit bleibt in dieser Cloud nicht installiert (`webkit-2370/pw_run.sh` fehlt). Die bisherige Netzwerkkonfiguration für den offiziellen Browserdownload ist unverändert; keine Sperre wurde umgangen. Der frühere unabhängige WebKit-Lauf auf dem Ausgangsstand ist kein Nachweis dieses neuen Commits. Das konfigurierte WebKit-Projekt umfasst auch die neuen Accessibility-Fälle.

Der Korrekturprompt nennt **98/100** alte Chromium-Fälle auf dem Prüf-Mac mit zwei offenen nativen Auswahlfeld-Testtreiberfällen. Hier ist kein Mac verfügbar. Die bestehende Hilfe `nativeFirstOption` bleibt unverändert, einschließlich ihrer tatsächlichen Wertprüfung; ihre Mac-Zuverlässigkeit wird nicht behauptet. Die entsprechenden Linux-Fälle bestehen. Keine Anwendungsänderung als spekulativer Mac-Workaround und keine entfernten Assertions.

Sprachsteuerung, physisches iPad/Safari, Screenreader und vollständige Barrierefreiheit sind nicht praktisch nachgewiesen. Eine passende Bausteinauswahl belegt weiterhin keine vollständig selbstständige Urteilskompetenz oder Unterrichtswirkung. Es wurden keine neuen pädagogischen Inhalte, Episoden oder Spielmechaniken ergänzt.

## Übergabe

Ein einzelner Korrekturcommit auf dem vorhandenen Entwicklungsbranch, danach Entwicklungsstopp. Der vollständige Stand wird außerhalb des Repositories mit Quellcode, Lockfile, Tests, Berichten, Rohprotokollen, relevanten Bildschirmaufnahmen, Git-Bundle und Bestandsdatei verpackt. Paket- und Dateihashes sowie die Wiederherstellung werden geprüft; keine Zugangsdaten, `.env`-Dateien, Abhängigkeits-/Build-/Trace-Verzeichnisse aufnehmen.

Kein Push, Merge oder Deployment ohne die im Auftrag ausdrücklich verlangte gesonderte Freigabe. Der bekannte Cloud-Downloadfehler gilt nicht als behoben. Ein später ausdrücklich genehmigter GitHub-Quellcode-Download muss separat geprüft werden. Die unabhängige aktuelle Nachprüfung steht aus.
