# Übergabe: Afrika Jahrgang 7 vervollständigt

Stand 26.10.2026. Entwicklungsbranch `feat/afrika-vollstaendig-klasse7`; geprüfte Vergleichsbasis `e6edaaf946081dd2b78163600fae7c7eff56ca26` auf `release/afrika-2040-final`. Der Release-Ref bleibt unverändert. Die vollständige neue Commit-ID steht nach dem lokalen Commit in der äußeren `BESTAND.json` des Prüfpakets; sie kann mit `git rev-parse HEAD` geprüft werden. Keine Veröffentlichung oder unabhängige Freigabe wird behauptet.

## Änderung und Zweck

Der neue Einstieg **„Afrika untersuchen · fünf Themen“** ergänzt die sechs vorhandenen Modell-Episoden um echte Materialauswertung, eigene Rechnungen und kurze selbst formulierte Erklärungen. Ein gemeinsamer Untersuchungsbereich und ein Lernjournal decken die fünf vereinbarten Felder ab. Jedes Feld besitzt zwei aktive Materialschritte und einen produktiven Schritt. Das Angebot beschränkt sich auf Afrika; keine anderen Jahrgangsthemen, fertige Klassenarbeit, Arbeitsblätter oder Lehrkräftehandreichungen wurden erstellt.

- A: Erstvorstellung, zwei authentische Fotos mit Herkunft, sachlicher Gegenbeleg und eigene Überarbeitung für einen deutschen Schulzeitungskontext.
- B: Lagekarte, qualitativer Saisonkalender zweier realer Räume, gesonderter Regionalvergleich in mm und begründete Anpassung bei begrenztem Wasser.
- C: Absolute natürliche Veränderung und Wanderung, reale historische Ghana-Schätzungen, neues eigenes Rechenbeispiel und bedingte Chancen/Risiken.
- D: Betrieb versus Raum, Überschuss versus Investition, reale bestehende Kakaoverarbeitung und Elektrizitätsversorgung, reale WDI-Tabelle und Grenzen von Wohlstandsaussagen.
- E: Zwei erfundene Marktangebote in Kumasi, drei Nachhaltigkeitsdimensionen, passende Belege/Grenzen, bewusste Gewichtung und entscheidungsrelevante Unsicherheit.

Erste Vorstellung beziehungsweise ausgewählter Marktplan werden beim eigenen Schreiben erneut angezeigt. Die optionalen neuen Daten liegen in einem getrennten Speicherbereich; Altstände bleiben ohne Migration gültig. Geschlossene Zuordnungen/Rechnungen sind überprüfbar. Eigene Texte oder mündliche Vermerke bleiben ausdrücklich fachlich ungeprüft. Bewusst übernommene und später bearbeitete Beispiele behalten ihre Herkunft. Es gibt keine externe Bewertung, Konten oder Laufzeit-API.

## Curriculare und fachliche Prüfung

Die vor Programmierung angelegten [Lernzielmatrix](afrika-lernziele-und-pruefbarkeit.md), der [interne Prüfungs-Blueprint](afrika-klassenarbeit-blueprint.md) und der [Quellenplan](afrika-quellenplan.md) bilden den Maßstab. Die drei Nutzeroriginale sind vollständig zugänglich. Allgemeiner Teil 2024 und Erlass vom 4.6.2025 wurden nach Behebung der anfänglichen Zugriffssperre im amtlichen Original geprüft. Die schulische Arbeitsfassung wird nicht als späterer Beschluss ausgegeben; mehrere AFB bedeuten keine erfundene feste Punktequote.

Neue reale Daten wurden tatsächlich abgerufen und mit Metadaten kontrolliert. Die WDI-JSON-Dateien bleiben als kleine Prüfgrundlage versioniert. Klimazeiten, regionale mm-Werte und Fotoherkunft sind mit Fundstellen im [Originalprotokoll](sources/afrika-originalpruefung.json) dokumentiert. Dessen Hashes bezeichnen die abgerufenen Originalbytes; die zur Lesbarkeit formatierten JSON-Kopien können andere Byte-Hashes besitzen. Original-PDFs wurden nicht versioniert.

Kontrollierte Fehlvorstellungen: Foto gleich ganzer Kontinent; Fotograf gleich Projektredaktion; Regen gleich Tankvorrat; Klima gleich Wetter; natürliche Wüste gleich Desertifikation; Geburtenüberschuss gleich Gesamtzunahme; Migration gleich Urbanisierung; Schätzung gleich sichere Zukunft; Einnahmen gleich Überschuss; Investition gleich laufende Kosten; Betriebsgewinn gleich BIP; Stromzugang gleich zuverlässige Versorgung; Wachstum gleich Wohlstand für alle; legitime Priorität gleich falsche Sachzuordnung. Auch falsche Optionen und sämtliche Erklärungen wurden gelesen; alle angebotenen geschlossenen Alternativen werden zusätzlich gegen unabhängige Sollantworten getestet.

## Tatsächlich ausgeführte Prüfungen

| Prüfung                                                                           | Tatsächliches Ergebnis                                                                                                                                                                                |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gesamte Berechnungs-/Logiksuite                                                   | **197 bestanden**, 0 fehlgeschlagen, 0 übersprungen; einschließlich aller bisherigen Tests und neuer Quellen-/Feedback-/Speicherprüfungen                                                             |
| Kombinierter Browserlauf                                                          | **130 bestanden** in Chromium/WebKit, 65 je Engine; 92 bestehende und 38 neue Prüfungen                                                                                                               |
| Abschließender neuer Browserlauf nach Vergleichshinweisen und Lade-Wartekorrektur | **38 bestanden**, 19 je Engine; keine automatischen Wiederholungen/Überspringungen                                                                                                                    |
| TypeScript / Produktionsbuild                                                     | Erfolgreich; 40 Module, fünf freigegebene Ausgabedateien                                                                                                                                              |
| Produktionsartefakt-Wächter                                                       | Erfolgreich; zwei identische zugelassene Fotos, HTML/JS/CSS; Größen und SHA-256 in `dist-final.json`                                                                                                  |
| Formatprüfung der neuen/geänderten Dateien                                        | Bestanden                                                                                                                                                                                             |
| Globale historische Formatprüfung                                                 | **Nicht bestanden**: 15 bereits an der Release-Basis bytegleich vorhandene Formatabweichungen; Datei-/Hashvergleich in `format-baseline.json`, kein Funktionsfehler und keine Abschwächung des Checks |

Ein Zwischenlauf der neuen Browserfälle hatte 37/38 bestanden: Der Test fragte die Bilddekodierung unmittelbar nach Sichtbarkeit des Elements ab. Die Ladeprüfung wartet jetzt mit `expect.poll` auf vollständiges Laden und positive Originalbreite, weiterhin mit Fehler bei ausbleibendem Bild. Anschließend bestehen alle 38 Fälle. Ein unabhängiger zusätzlicher Sichtdurchlauf kontrolliert Lagekarte, Bevölkerungsdiagramm, regionale Niederschlagsgrafik und Wirtschaftstabelle im WebKit-iPad-Format. Quellen, Einheiten, Skalen, Zeilen und Beschriftungen sind sichtbar zugeordnet. Es wurden keine alten Belegbilder als aktuelle Aufnahmen ausgegeben.

Reproduzierbare Befehle:

```sh
npm ci
npm test
npm run build
node scripts/check-dist.mjs
npx playwright install --with-deps chromium webkit
AFRIKA_EVIDENCE_DIR=test-results/evidence npx playwright test --config playwright.afrika.config.ts
npm run format:check
```

Die lokale Cloudprüfung verwendet Node 24, System-Chromium 154 und Playwright WebKit 27.2 (Build 2370). WebKit wurde tatsächlich gestartet: fehlende Systembibliotheken wurden aus signierten Debian-Paketen ausschließlich in einen lokalen Prüfpfad extrahiert. `WEBKIT_PATH` im neuen Prüfconfig erlaubt diesen lokalen Startwrapper. Der übliche CI-Weg bleibt Playwrights `install --with-deps`; keine Hostprüfung wurde durch einen Skip-Schalter als bestanden ausgegeben. Dieser lokale Linux-WebKit-Lauf ist kein Test auf einem physischen iPad.

Der neue Browserpfad prüft alle fünf Themen auf Desktop und simuliertem iPad 1024 × 768, beide Engines, Maus/Touch, tatsächliche Tastatureingabe und Auswahl mit Pfeiltasten, Fokus nach Neuzeichnen, große Bedienelemente, Neuladen/Rücksprung und vollständige eigene Texte im Journal. Alle zehn Materialschritte haben echte falsche Optionen, Teilanerkennung und Erklärung nach zwei Versuchen. Beide Marktangebote werden mit beiden Zielen geprüft, einschließlich konkreter abweichender Gewichtung. Ein 720 Pixel breites Fenster unter `/Afrika-2040/` prüft Hilfen und bewusst übernommene Produkte. Axe prüft `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22a`, `wcag22aa`; ein grüner Axe-Lauf ist kein vollständiger WCAG-Konformitätsnachweis.

Die bestehende begrenzte Release-Regressionsauswahl prüft alle sechs Episoden einschließlich vollständiger Lernprodukte, Kenia-Zeiten/Buskapazität, Ghana-Verarbeitung/Verteilung, Marokko-Bilanz/Entnahme/Verbrauch, frühem Feedback, Hilfestufen, Auswahlpositionen, Speicherwarnung, Navigation, Modell-/Realitätsunterscheidung und Pages-Unterpfad. Keine alten Tests wurden entfernt, übersprungen oder fachlich abgeschwächt. Die PR-Prüfkonfiguration nimmt die neuen Tests zusätzlich auf; Deployment-Trigger bleiben unverändert.

## Build, Speicherung und Rechte

Der Produktionswächter lässt HTML, genau ein JS-/CSS-Bundle und ausschließlich die zwei anhand ihres SHA-256 zugelassenen Originalfotos zu. Er lehnt fremde Bilder, PDFs, Archive, Source-Maps, `.env`, Symlinks und bekannte Geheimnismuster ab. Die vorhandenen verbotenen-Datei-Tests bleiben erhalten; zusätzliche Tests prüfen Bildidentität und notwendige Referenzierung. Fotos: jbdodane/CC BY 2.0 und daSupremo/CC BY-SA 4.0, unverändert mit Namensnennung, Original- und Lizenzlinks. Klima: eigene Faktenzusammenfassungen mit Quellenangabe für nichtkommerziellen Unterricht. GEPA/FAO: keine Artikel-/Abbildungskopie.

Das Prüfpaket enthält Quellstand, Lockfile, Tests, Dokumentation und kompakte aktuelle Protokolle/Bildbelege. Es enthält keine Abhängigkeitsordner, Browserbinaries, Build-Zwischendateien, schulischen Original-PDFs oder echten Schülerantworten. Die Browserbeispiele sind synthetische Testeingaben. Die Anwendung speichert Eingaben weiterhin nur im aktuellen Browser-Tab; bei blockiertem Speicher bleibt die vorhandene Warnung sichtbar.

## Offene Grenzen und Abnahme

- Die unabhängige Fach-/Didaktikprüfung bleibt erforderlich. Selbstständige Urteilskompetenz und tatsächliche Lernwirksamkeit sind nicht durch Klicks, eigene Testtexte oder Testzahlen bewiesen.
- Lesekompetenz, Unterrichtsablauf und Dauer müssen mit der konkreten Lerngruppe erprobt werden. Material und Schreiben benötigen vertikales Scrollen; auf dem iPad stehen Material und Zuordnung nebeneinander, im schmalen Fenster untereinander. Keine pauschale Behauptung „ohne Scrollen“.
- Keine repräsentative Analyse deutscher Medien; untersucht werden eigene Vorstellungen und explizit ausgewählte Materialien. B ersetzt keinen vollständigen Klimadiagrammkurs. Reale Ursachen-/Verteilungsfragen benötigen ergänzenden Unterricht.
- Kein physisches iPad, kein Screenreader-Praxistest und keine LMS-/SCORM-Implementierung geprüft. SCORM bleibt lediglich vorbereiteter Anschlussweg.
- Zusammenführung, Push und Pages-Veröffentlichung bleiben einer späteren ausdrücklichen Freigabe vorbehalten. Für eine Veröffentlichung sind zusätzlich unabhängige Abnahme und die vorhandenen Release-/Pages-Prüfschritte erforderlich.

Die differenzierte Einschätzung für jedes Thema steht in [afrika-klassenarbeitsreife.md](afrika-klassenarbeitsreife.md). Die interne Entwicklungsarbeit endet mit diesem geprüften Stand.
