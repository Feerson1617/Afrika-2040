# Architektur und Prüfregeln – Phase 2A

## Umfang und Module

Die bestehende Architektur bleibt erhalten: Vite, TypeScript, semantisches HTML/CSS und eine lokale SVG-Modellkarte. Papierfarben, dunkles Grün und Terrakotta, Serifenschrift für Fragen und serifenlose Leseschrift für die Bedienung. Die südliche Erweiterung wird erst nach dem bisherigen Zweipersonenvergleich sichtbar. Keine neue Engine, Abhängigkeit, Laufzeit-API, Animation, Konten, externen Fonts oder Deployment-Pipeline.

- `src/content.ts`: zentrale Fuß- und Buszeiten, Linienabschnitte und Haltestellenfolgen, Einstieg je Person/Linie, Aufträge, Kriterien und Wörter.
- `src/model.ts`: summiert dieselben Abschnitte für vollständige Linien und tatsächlich gefahrene Teilstrecken. Liefert Reisezeiten, eindeutige Vergleichsbelege und Satzbausteine aus diesen Daten.
- `src/decision.ts`: leitet Zielpassung und konkrete Gewichtung aus denselben Modellzeiten ab; liefert kontextabhängige Beispiele für die bestehende Abschlussaufgabe.
- `src/feedback.ts`: explizite Kriterien für geschlossene Aufgaben, angeleitete Erklärungen und Belege. Die Empfehlung bleibt neutral, eigene Texte bleiben unbewertet.
- `src/state.ts`: reine Zustandsübergänge mit sechs Schritten, Navigation, Versuchsgrenzen, freiwilligen Hilfen, ausdrücklicher Beispielübernahme und Neustart.
- `src/storage.ts`: validierter, fehlertoleranter Tab-Speicher. Neues Schema ohne automatische Umdeutung alter Phase-1-Lernprodukte.
- `src/map.ts`: dieselbe SVG-Karte mit später eingeblendetem Süden. Bei drei Routen erscheinen nur die gewählte Linie, der aktuelle Fußweg und die tatsächlich gefahrenen Busabschnitte einer Person. Andere Personen und Haltestellen bleiben als räumliche Bezugspunkte sichtbar.
- `src/main.ts` und `src/style.css`: DOM-Bedienung, responsive Oberfläche, Fokus, Live-Rückmeldungen, Textescaping und optionale Vertiefung.

## Gemeinsames Modell

| Person             | Direkt: Fuß + Bus | Über Nord: Fuß + Bus | Über Süd: Fuß + Bus |
| ------------------ | ----------------- | -------------------- | ------------------- |
| Amina → Schule     | 12 + 10 = **22**  | 2 + 8 = **10**       | 12 + 16 = **28**    |
| David → Markt      | 2 + 10 = **12**   | 2 + 16 = **18**      | 2 + 16 = **18**     |
| Leila → Ausbildung | 12 + 10 = **22**  | 12 + 16 = **28**     | 2 + 8 = **10**      |

Alle Angaben in Minuten. Direkt: Platz → Zentrum, 10 Minuten. Nord: Platz → Nord → Zentrum, zweimal 8 Minuten. Süd: Platz → Süd → Zentrum, zweimal 8 Minuten. Amina steigt bei Nord erst in Nord ein, Leila bei Süd erst in Süd. Auf den anderen Linien gehen beide zum Platz. David steigt immer am Platz ein. Die Ziele liegen modellhaft an der Haltestelle Zentrum. Wartezeiten, Fahrpreise und Kapazitäten werden nicht berechnet. Das Modell ist keine wirkliche Stadtkarte Nairobis und keine Prognose.

Karte, sichtbare Summen, Erklärungen und Vergleichsbelege beziehen ihre Zeiten aus `content.ts` und `model.ts`. Ein Beleg benennt Person, gewählte Linie und Vergleichslinie, beispielsweise `leila-south-direct`: „Leila: Über Süd 10 statt Direkt 22 Minuten.“ Ein Gleichstand ist weder Zeitvorteil noch Zeitnachteil. Ein wahrer Vorteil und Nachteil derselben Person genügen nicht für die geforderte andere Perspektive. Mehrere zutreffende Belegpaare und alle drei Empfehlungen bleiben zulässig.

## Lernfolge

1. Ausgangsweg: Aminas Fußweg zum Platz und direkte Busfahrt zusammensetzen. Beim Rücksprung und Neuladen ist ausschließlich die direkte Ausgangsroute aktiv; die alternative Nord-Teilfahrt bleibt als Auswahl sichtbar.
2. Vorteil: Amina auf Direkt und Nord vergleichen.
3. Nachteil: Davids veränderte Zeit untersuchen.
4. Erklären: Fußweg-Verkürzung und Folge für die Gesamtzeit mit zusammenhängenden Satzbausteinen oder eigenem Text erklären. Die ganze Nordlinie ab Platz ist länger; Amina nutzt nur den letzten Busabschnitt. Danach kann eine erste Empfehlung freiwillig festgehalten werden.
5. Erweitern: Leila und Süd werden eingeführt. Eine erste Vermutung wird ohne Bewertung festgehalten. Anschließend Leilas drei Wege tatsächlich ansehen; erst dann folgt die Zuordnung des für Leila schnellsten Weges. Der Besuch anderer Personen täuscht keine Leila-Untersuchung vor. Hilfe erlaubt einen ausdrücklich unterstützten Abschluss ohne erfundene Vermutung oder erfundene Kartenbesuche.
6. Entscheiden in vier Abschnitten (Vorschlag, Vorteil, Nachteil, Gewichtung): gewählte Linie, ausdrücklich genanntes Ziel/Kriterium, zutreffender Vorteil und Nachteil einer anderen Person. Alternativ eigener Text bei benanntem Ziel und Linie; sein fachlicher Gehalt bleibt ausdrücklich ungeprüft. Der Wechsel der Linie allein ist kein Abschluss und keine Erfolgsmeldung. Erste Idee, endgültiger Vorschlag, Erklärung und Vermutung bleiben lokal einsehbar.

Die anfängliche 2×2-Übersicht bleibt erhalten. Nach der Erweiterung ersetzt ein Personeninspektor die große Zahlenmatrix: ein Fußweg, die gefahrene Teilstrecke und eine verständliche Summe. Die drei Linien wechseln über HTML-Schaltflächen. Im anfänglichen Zweilinienvergleich sind zusätzlich beide SVG-Pfade auswählbar. Personen wechseln über Marker und gleichwertige HTML-Schaltflächen. Keine Bedienhandlung verlangt Drag-and-drop.

## Feedback, Hilfen und Herkunft

Richtige geschlossene Antworten erscheinen grün mit Erklärung, falsche rot, richtige Teilgedanken gelb mit gezieltem nächsten Schritt. Eine unvollständige Antwort verbraucht keinen Fehlversuch. Eine passende Bausteinerklärung wird ausdrücklich als **angeleitet** bestätigt. Fachliche Selbstständigkeit wird daraus nicht abgeleitet.

Alle Versuche bleiben auf höchstens zwei begrenzt. Die drei ursprünglichen geschlossenen Aufgaben behalten den erklärten Weiterweg aus Phase 1. Bei den neuen Aufgaben und der Empfehlung wird Hilfe 3 nach zwei erfolglosen vollständigen Prüfungen sichtbar; „Dieses Beispiel übernehmen“ muss bewusst bedient werden. Freiwillige Hilfe 3 bietet denselben Weg. Die ursprünglichen Antworten werden nicht bereits beim Anzeigen der Hilfe ersetzt. Nach einer eigenen Änderung kann das Beispiel erneut übernommen werden.

Die Empfehlung bleibt auch bei zutreffenden Belegen neutral. Nur eine vollständig ausgewählte, objektiv unpassende Belegkombination ohne Freitext zählt als Fehlversuch. Kriterium, Linie oder Beleg fehlen: kein Fehlversuch. Freitext vorhanden: keine Schlüsselwortbewertung, keine Fehlversuche wegen der Formulierung. Widersprüchliche ausgewählte Belege bleiben als zu prüfen markiert. Eigene Texte ermöglichen eine unbewertete Abgabe, aber keinen automatisch bestätigten Kompetenznachweis.

`progress.supported` dokumentiert die genutzte Unterstützung pro Aufgabe bis zum ausdrücklichen Neubearbeiten dieser Aufgabe. `explanation.supported` und `decision.supported` beschreiben die aktuelle Beispielübernahme und werden bei eigener Änderung der Bausteine/Belege entfernt. So bleibt die Hilfe im Lernprodukt sichtbar, auch wenn das übernommene Beispiel anschließend bearbeitet wird. Unterstützung wird nicht als Misserfolg markiert.

Der freiwillige Transfer aus Phase 1 bleibt ein separat bezeichnetes Amina-Beispiel (3 Minuten Fußweg + 10 Minuten Bus = 13 Minuten). Er ändert keine Hauptdaten und implementiert nicht das spätere Ereignis zu Leilas verändertem Fußweg.

Ein personengebundenes Ziel wird gegen die kürzeste Modellverbindung dieser Person geprüft. Ein längerer Weg ist eine legitime Entscheidung, braucht für ein verbundenes Bausteinargument jedoch eine ausdrücklich gewählte andere Priorität: den ausgewählten zutreffenden Vorteil für eine andere Person. Die Rückmeldung erkennt richtige Belege unabhängig davon an, benennt den Konflikt mit konkreten Zeiten und bietet Zieländerung oder konkrete abweichende Gewichtung. Das allgemeine „Abwägen“ benötigt ebenfalls eine konkrete Gewichtung. Ein bloßes Tätigkeitsbekenntnis reicht nicht. Eine freie Erklärung wird nur nach ausdrücklicher unbewerteter Abgabe als solcher Abschluss behandelt; Eingabe allein genügt nicht.

Im letzten Lernschritt stehen Linie und Ziel direkt über den Belegen. Pro Beleg wählen Lernende erst eine von zwei Vergleichslinien, dann eine von drei Personen. Alle sechs ursprünglichen Vergleichsmöglichkeiten, einschließlich unzutreffender und gleicher Zeiten, bleiben erhalten. Es wird keine richtige Person vorgewählt. Die gemeinsame Karte bleibt aufklappbar; sie ist für den Zahlenvergleich nicht mehr räumlich getrennt erforderlich. Ein Abschnittswechsel richtet die Navigation und die aktuelle Auswahl im sichtbaren Bereich aus. Das ist eine Oberflächenkorrektur innerhalb von Aufgabe 6, kein neues Spielsystem.

## Speicher, Rückkehr und Sicherheit

`afrika-2040:kenia-bus:v2a` sichert sechs Fortschrittseinträge, beide Texte, Belegreferenzen, Kriterium, konkrete Gewichtung, bewusste Konfliktannahme/unbewertete Abgabe, aktuellen Abschnitt, Vergleichsentwürfe, Unterstützung und echte Erkundungen im `sessionStorage` des Tabs. Phase-1-Daten unter `v1` werden nicht als Phase-2A-Abschluss interpretiert. Neustart entfernt beide projektspezifischen Schlüssel. Bei blockiertem Speicher läuft das Spiel bis zum Neuladen im Arbeitsspeicher weiter und behauptet keine Speicherung. Texte werden auf 1500 Zeichen begrenzt und bei der HTML-Ausgabe escaped. Keine Kennungen, Fernbewertung, Fetch-/Beacon-Aufrufe oder Übertragung von Schülerantworten.

Gespeicherte Abschlussflags werden erneut nach den aktuellen Regeln geprüft. Alte widersprüchliche oder nur allgemein „abwägende“ Abschlüsse öffnen Aufgabe 6 zur Überarbeitung; Texte, Belege und frühere Fortschritte bleiben erhalten. Änderungen an Linie, Ziel, Beleg, Vergleich, Gewichtung oder Text erfordern erneute Prüfung.

Zurück erhält Bearbeitungen. Neubearbeitung setzt nur die aktuelle Aufgabe zurück. Rückkehr vor Leilas Einführung blendet sie und Süd wieder aus; der nächste Vergleich zeigt passende Strecken und Beschriftungen. Zurück zu Aufgabe 1 erzwingt zusätzlich die direkte Linie. Schnelle Mehrfachklicks überspringen keine unbearbeiteten Aufgaben. Nach der Vermutungswahl erhält der gespeicherte Hinweis den Fokus; die ersetzte Radioauswahl hinterlässt keinen verlorenen Tastaturfokus.

## Prüfverfahren

`npm test` führt die Fälle mit Nodes `--experimental-test-isolation=none` im selben Prozess aus. In dieser Cloud-Laufzeit lieferte der isolierte Runner zunächst nur Dateihüllen ohne einzelne Testfälle. Die konfigurierte Variante führt die einzelnen Fälle sichtbar aus. Das ist eine Anpassung des Prüfskripts, keine neue Abhängigkeit; das Lockfile bleibt unverändert.

Die Logikprüfung umfasst neun Zeiten, Einstieg und Teilabschnitte, 972 strukturierte Belegkombinationen, zulässige alternative Gewichtungen, Teilantworten, höchstens zwei Fehlversuche, unterstützte Abschlüsse, ungewöhnliche Freitexte und Speicher/Navigation. Die Browserprüfung spielt die komplette Episode auf dem Produktionsbuild durch: drei Empfehlungen auf Desktop und simulierten iPads quer/hoch, echte Touch-Ereignisse, Tastatur, Kartenwerte, Kennzeichnung, Neuladen, Wiederbearbeitung und Neustart. Historische R1–R3-Prüfungen bleiben mit den erweiterten Schritten und expliziten Vergleichsreferenzen erhalten. Die statischen Ressourcen werden zusätzlich unter `/Afrika-2040/` geprüft; dies veröffentlicht nichts.

Screenshots werden tatsächlich angesehen. Gemessene Zeit-Schriftgröße und Badge-Inhalt sind eine begrenzte Lesbarkeitsprüfung. axe ergänzt die DOM-Prüfung und beweist weder vollständige Barrierefreiheit noch SVG-Kontrast. Aktuelle Ergebnisse und Grenzen: [phase2a-corrections.md](phase2a-corrections.md).
