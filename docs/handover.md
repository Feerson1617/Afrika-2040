# Übergabe – Phase 1

**Aktueller Korrekturstand nach unabhängiger Prüfung:** [Gezielte Korrekturen R1–R4, neue Prüfergebnisse und Grenzen](phase1-corrections.md). Die nachstehenden Angaben dokumentieren die historische Erstübergabe von Commit `5e82afceeae39c0566797ab04cf2ee9ae4da1736`; sie sind keine Freigabe und keine aktuelle Testzusammenfassung.

Stand: 23. Oktober 2026. Repository `Feerson1617/Afrika-2040`, Entwicklungsbranch **`feat/phase1-kenia`**, Ausgangscommit `b07f8244ab64763aea9c3f96ce3358fab3c1cf78`. Den aktuellen überprüfbaren Commit zeigt `git rev-parse HEAD`. Kein Merge nach `main`, kein Push und keine Veröffentlichung auf GitHub Pages. Phase 2 wurde nicht begonnen.

## Implementierter Stand

- Startbildschirm mit dem vorgegebenen Einstiegstext; direkter Start der ersten Kenia-Lernhandlung.
- Eine interaktive SVG-Modellkarte mit Fußwegen, Busabschnitten, Haltestellen, Nordpfeil, Legende und sichtbarer Kennzeichnung erfundener Inhalte.
- Vier Lernschritte: Ausgangsweg zusammensetzen, Vorteil für Amina, Nachteil für David, offene Empfehlung mit Belegen oder eigenem Text. Abschluss mit Kernaussage und sichtbarem Lernprodukt.
- Beide Buswege auswählbar und vergleichbar. Gesamtzeiten Amina **22/10**, David **12/18** Minuten; Amina fährt ab Nord nur den zweiten Acht-Minuten-Abschnitt.
- Aufgabenspezifisches Feedback für richtig, falsch, teilweise richtig und offene Entscheidungen. Drei Hilfestufen, Auflösung nach zwei Fehlversuchen, freiwilliger kurzer Transfer. Kein Punktesystem und keine sichtbare Einteilung nach Leistungsniveau.
- Worterklärungen, freiwillige Begründungsbausteine und Freitext. Keine Schlüsselwortbewertung und keine Übertragung an Bewertungsdienste. Fehlertolerante Sicherung im Browser-Tab.
- Zurück, erneute Bearbeitung, Neuladen mit Erhalt der Arbeit und vollständiger Neustart. Tastaturfokus, große HTML-Bedienflächen und responsive Anordnung; bei schmalen Ansichten steht der Auftrag vor der Karte.
- Getrennte Inhalts-, Modell-, Feedback-, Zustands-, Speicher- und UI-Module. Projektregeln in `AGENTS.md`; interne didaktische und technische Dokumentation. Keine zusätzlichen Episoden oder Unterrichtsmaterialien.

## Ausgeführte Prüfungen

Geprüfte Umgebung: Linux x86_64, Node **24.19.0**, npm **11.9.0**, TypeScript **5.9.3**, Vite **8.3.5**, Playwright **1.64.1**, System-Chromium **154.0.8037.57**.

| Prüfung                                                               | Tatsächliches Ergebnis                                                                                                                                                                                                |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alle drei Original-PDFs öffnen, seitenweise Text auslesen und rendern | **159/159 Seiten zugänglich**: 60 + 92 + 7; keine fehlende Datei. Fachlich relevante Abschnitte und grafische Tabellen ausgewertet; siehe [curriculum.md](curriculum.md) und [source-access.json](source-access.json) |
| `npm --cache /workspace/.cache/npm ci --no-audit --no-fund`           | Erfolgreiche erneute Installation aus dem unveränderten Lockfile; 26 Pakete                                                                                                                                           |
| `npm test`                                                            | **19 bestanden**, 0 fehlgeschlagen, 0 übersprungen. Vier Reisezeiten, komplette Bausteinkombinationen für beide Vorschläge, Feedback, Navigation, Fehlversuchsgrenze, Hilfen, Transfer, Speicherfehler und Neustart   |
| `npm run build`                                                       | TypeScript-Prüfung und Produktionsbuild erfolgreich. Statische HTML-, CSS- und JS-Dateien in `dist/`                                                                                                                  |
| `npm run test:e2e`                                                    | **14 bestanden**, 0 fehlgeschlagen/übersprungen; letzter vollständiger Lauf 21,3 Sekunden                                                                                                                             |
| Accessibility mit axe in den Browsertests                             | Keine automatisiert erkannten Verstöße gegen die geprüften WCAG-2/2.1-A/AA-Regeln in Start, Aufgabe, erweiterter Hilfe, Entscheidung, Abschluss sowie falschem, teilrichtigem, richtigem und neutralem Feedback       |
| Produktionspfade                                                      | Erfolgreicher Browserstart unter einem statischen Mount `/Afrika-2040/`, keine fehlgeschlagenen Ressourcenanfragen                                                                                                    |
| Entwicklungsserver `npm run dev -- --port 5173 --strictPort`          | Tatsächlich gestartet; interner HTTP-Check und zusätzlicher Browserdurchlauf mit Hilfen bis zum Abschluss erfolgreich, beide Belege sichtbar, keine JavaScript-Fehler                                                 |
| `npm run format:check`, `git diff --check`                            | Erfolgreich                                                                                                                                                                                                           |

Die 14 Browserfälle prüfen konkret:

1. Vollständigen Mausdurchlauf, Wechsel beider Buswege einschließlich SVG-Pfad, alle Gesamtzeiten, beide begründeten Vorschläge, Abschluss, Rückkehr und Neustart.
2. Leere und teilweise richtige Eingabe, zwei Fehlversuche, Erklärung, alle Hilfestufen und richtige/falsche Transferantworten; Rückkehr und Neubearbeitung.
3. Ungewöhnlichen Freitext einschließlich HTML-Zeichen, tatsächliche lokale Speicherung, Neuladen, unveränderte Wiedergabe, fehlende externe Anfragen und erneute Bearbeitung.
4. Anerkennung des passenden Vorteils bei fehlendem/falschem Nachteil; neutrale Gestaltung.
5. Schnelle Doppelklicks ohne Überspringen unbearbeiteter Aufgaben; Abbruch und Bestätigung des Neustarts.
6. Tastatur für Einstieg, SVG-Wege, Radioauswahl, Prüfen und Worterklärungen einschließlich Fokus und Escape.
7. Vollständigen Abschluss trotz gesperrtem Browser-Speicher, ohne falsche Speicherbestätigung.
8. Tatsächlich ausgelieferte Produktionsressourcen unter dem GitHub-Pages-Repositorypfad.
9. Automatisierte Barrierefreiheitsprüfung von fünf repräsentativen Ansichten.
10. Automatisierte Barrierefreiheitsprüfung der unterschiedlichen Feedbackzustände.
11. Vollständigen unterstützten Touch-Durchlauf bei **1440 × 1000**.
12. Denselben Durchlauf bei **1024 × 768** (iPad quer simuliert).
13. Denselben Durchlauf bei **768 × 1024** (iPad hoch simuliert).
14. Denselben Durchlauf bei **390 × 844**; keine horizontale Überbreite. Die kleine Telefonkarte wird durch die lesbare HTML-Zeitentabelle und große Auswahlflächen ergänzt.

Laufprotokolle: [Logiktests](evidence/unit-tests.txt), [Browsertests](evidence/browser-tests.txt). Bildschirmaufnahmen wurden tatsächlich erstellt und visuell angesehen: [Start](evidence/start-desktop.png), [Karte Desktop](evidence/map-desktop.png), [iPad quer](evidence/map-ipad-landscape.png), [iPad hoch](evidence/map-ipad-portrait.png), [Telefon](evidence/map-phone.png), [Empfehlung](evidence/decision-desktop.png), [Abschluss](evidence/end-desktop.png). Die letzten beiden Aufnahmen stammen aus dem zusätzlichen Durchlauf am Entwicklungsserver; die übrigen aus dem Produktionsbuild.

## Starten und überprüfen

Im vorhandenen Checkout:

```sh
cd /workspace/Afrika-2040
npm --cache /workspace/.cache/npm ci
npm run dev
```

Die vom Server angegebene Adresse im Browser öffnen. „Spiel starten“ wählen. In Schritt 1 lautet der Ausgangsweg Amina → Platz → Zentrum. Danach beide Verbindungen vergleichen. In Schritt 4 darf jeder Busweg empfohlen werden; zu „Über Nord“ passen Amina 10 statt 22 Minuten als Vorteil und David 18 statt 12 Minuten als Nachteil. Zu „Direkt“ ist es umgekehrt. Ein eigener Text bleibt fachlich ungeprüft. Hilfen und Rückwege dürfen jederzeit genutzt werden. „Neu starten“ löscht die Antworten dieses Tabs.

Für die vollständige technische Prüfung:

```sh
npm test
npm run build
npm run test:e2e
```

Die Browsertests starten ihre Server selbst. `/usr/bin/chromium` ist in dieser Maschine vorhanden. Auf einer anderen Maschine kann mit `npx playwright install chromium` ein passender Testbrowser installiert oder `CHROMIUM_PATH` gesetzt werden. Keine Datenbank, Schlüssel oder Konten nötig.

Die Cloud-Konfiguration enthält einen erfolgreich gespeicherten Entwurf für **`install_script` und `start_skill`** mit den geprüften Installations-, Prüf- und Startschritten. Ein Entwurf veröffentlicht weder die Umgebung noch die Webanwendung. Für die Wiederverwendung als veröffentlichte Cloud-Umgebung sind die Änderungen in den Umgebungseinstellungen zu prüfen und zu speichern; anschließend kann die **Umgebung** veröffentlicht werden. Eine Veröffentlichung auf GitHub Pages ist damit nicht gemeint und wurde nicht durchgeführt. Die Wiederherstellung in einem neuen Task wurde noch nicht geprüft; ein lokaler Entwicklungsserver muss nach einem Neustart neu gestartet werden.

## Didaktische Selbstevaluation und Grenzen

Das Lernziel ist erkennbar: Nicht die Busfahrt allein, sondern Fußweg plus Busfahrt bestimmt im Modell die Gesamtzeit. Das scheinbare Paradox der längeren Linie mit kürzerem Weg für Amina verlangt Verknüpfen und Erklären. Die zweite Perspektive verhindert einen automatischen „besten“ Busweg. Die Empfehlung erzeugt ein sichtbares Lernprodukt. Hilfen, klare Sprache und Bausteine unterstützen den gleichen Denkweg ohne sichtbare Leistungsgruppen. Sprachliche Unsicherheit wird nicht mit fachlicher Falschheit gleichgesetzt.

Die fünf Themen des schulischen Afrikaschwerpunkts werden durch diesen Ausschnitt **nicht vollständig abgedeckt**. Naturraum, Bevölkerungsentwicklung und wirtschaftliche Potenziale sowie umfassende Mensch-Umwelt-Beziehungen bleiben offen. Zeitersparnis ist kein vollständiges Nachhaltigkeitsurteil. Die Zuordnung zum Jahrgang 7 und die Spannung zwischen vier schulisch genannten und sechs landesweit unterschiedenen Kompetenzbereichen sind mit Seitenbelegen begründet. Das Schulcurriculum ist in der hochgeladenen Fassung ausdrücklich ein Arbeitsstand.

Nicht geprüft: echtes iPad, Safari/WebKit, VoiceOver/NVDA, empirische Verständlichkeit/Lernwirksamkeit in der Zielgruppe, individuelle Förderplanpassung, GitHub-Pages-Veröffentlichung oder Wiederherstellung der Cloud-Umgebung in einem neuen Task. Die automatisierte Touch-Simulation und axe ersetzen diese Prüfungen nicht. Aktuell sind keine offenen technischen Fehler aus den ausgeführten Tests bekannt.

Diese Entwicklungsselbstprüfung ersetzt **keine unabhängige Prüfung durch ChatGPT/Work**. Vor Phase 2 sind die unabhängige fachliche/didaktische Prüfung und die ausdrückliche Freigabe abzuwarten.
