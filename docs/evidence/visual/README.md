# Vorher–Nachher: tatsächlich gerenderte Oberfläche

Vorher: bestätigter Rückfallpunkt `e9664a2cf7f689657508c693521ff83b327f10bf` (gleiche Anwendung wie `dd962339`). Nachher: Produktionsbuild dieses Grafikcommits. Chromium, 1024 × 768, Touch-Kontext, gleiche synthetische Spielstände, reduzierte Bewegung. Nach der CI-Nachkorrektur erneut gerendert: alle zehn Nachher-Bilder und die Layoutmesswerte sind bytegleich. Die langen Aufgabenbilder zeigen die ganze Seite; die Screenshotbreite bleibt 1024 Pixel.

| Ansicht | Vorher | Nachher |
|---|---|---|
| Startbildschirm | [Bild](before/start.png) | [Bild](after/start.png) |
| Kapitelauswahl | [Bild](before/kapitel.png) | [Bild](after/kapitel.png) |
| Förder: eigene Kakaokette | [Bild](before/foerder.png) | [Bild](after/foerder.png) |
| ESA: Kenia-Rechnung | [Bild](before/esa.png) | [Bild](after/esa.png) |
| Kenia 2: zusätzliche Fahrt | [Bild](before/kenia.png) | [Bild](after/kenia.png) |
| Ghana 3: Presse | [Bild](before/ghana.png) | [Bild](after/ghana.png) |
| Ghana 4: Verteilung | [Bild](before/verteilung.png) | [Bild](after/verteilung.png) |
| Marokko 5: neue Verteilung | [Bild](before/marokko.png) | [Bild](after/marokko.png) |
| Marokko 6: Zusatzfeld | [Bild](before/zusatzfeld.png) | [Bild](after/zusatzfeld.png) |
| Beantwortete Entscheidung: zusätzliche Presse | [Bild](before/entscheidung.png) | [Bild](after/entscheidung.png) |

## Gemessene Bedienwege

Dokumentkoordinaten der Prüftaste in den identischen Aufnahmeständen. Kleinere y-Werte bedeuten: früher sichtbar. Keine zusätzliche Eingabe oder Navigation wird benötigt.

| Ansicht | Prüfen vorher (y) | Prüfen nachher (y) | Seitenhöhe vorher → nachher |
|---|---:|---:|---:|
| foerder | 529 | 484 | 1074 → 1063 |
| esa | 691 | 680 | 1409 → 1372 |
| kenia | 591 | 546 | 1366 → 1449 |
| ghana | 616 | 594 | 1314 → 1283 |
| verteilung | 492 | 449 | 1235 → 1332 |
| marokko | 616 | 596 | 1498 → 1456 |
| zusatzfeld | 529 | 484 | 1554 → 1512 |
| entscheidung | 641 | 590 | 1314 → 1283 |

Die Prüftaste liegt in allen acht Aufnahmen früher auf der Seite. Kenia 2 und Ghana 4 haben wegen des zusätzlichen visuellen Vergleichs insgesamt etwas mehr Materialhöhe. Die entscheidenden vorhandenen Zahlen und die Antwortfläche werden nicht hinter Klappen verschoben. Auf schmalen Bildschirmen bleiben lange Materialien vertikal scrollbar. Dies wird nicht als vollständig scrollfreie Bedienung ausgegeben.

## Sichtprüfung

Die Startansicht vermittelt reale Orte und erfundene Entscheidungssituationen. Die stärker hervorgehobenen Aufgaben- und Prüfflächen sind leichter von Navigation und Verwaltung zu unterscheiden. Aktuelle Variante, Geldanteile, Plätze und Wasserwege sind unmittelbar sichtbar. Jede Grafik bleibt mit Text und Zahlen verständlich. Der Befund ist eine gestalterische Einschätzung am gerenderten Bild, keine Messung von Motivation oder Lernwirksamkeit.

Die Fotos bleiben reale, unveränderte und lizenzierte Materialien. Neue Symbole sind selbst gezeichnete lokale SVGs; die Startkarte verwendet die bereits enthaltenen gemeinfreien Natural-Earth-Daten.

Weitere tatsächliche Touch-/Tastatur-, Zustandswechsel-, Format- und Accessibility-Tests: `tests/browser/visual-polish.spec.ts`. Vollständige Ergebnisse: [Prüfbericht](../../visual-polish.md).
