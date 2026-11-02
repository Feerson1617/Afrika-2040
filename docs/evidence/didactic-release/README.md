# D1/T1: begrenzte Vorher-/Nachher-Belege

Gleiche MSA-Erstansichten, Chromium, 1024×768, ohne Antwort und ohne geöffnete Hilfe. „Vorher“ stammt aus einem separat außerhalb des Repositorys gebauten Ausgangscommit `4863f64c460f66d00c7d29bdd3835d21cd9ecf19`. „Nachher“ stammt aus dem unveränderten Produktionsbuild des Korrekturstands. Die Screenshots sind vollständige Seitenaufnahmen; ihre Höhe ist deshalb größer als die Fensterhöhe. Alle Zustände sind synthetisch, keine Schülerdaten.

| Fall | Vorher | Nachher | Aktuelle WebKit-Erstansicht |
| --- | --- | --- | --- |
| Kenia 2 | [Vollständige Schlussfolgerung](comparison-before-s2.png) | [Ausgangsdaten](comparison-after-s2.png) | [WebKit](webkit-initial-s2.png) |
| Marokko 5 | [Rest 20 bereits sichtbar](comparison-before-s5.png) | [Anfang und Entnahme](comparison-after-s5.png) | [WebKit](webkit-initial-s5.png) |
| Marokko 6 | [Gesamt 55 bereits sichtbar](comparison-before-s6.png) | [Ausgangsgrößen](comparison-after-s6.png) | [WebKit](webkit-initial-s6.png) |

[before-after.json](before-after.json) enthält die tatsächlich erfassten Materialtexte, SVG-Beschriftungen und Auswahlfeldhöhen dieser sechs Chromium-Ansichten. In Chromium waren und sind die Felder 48 Pixel hoch. Die korrigierte WebKit-Höhe von exakt 48 Pixeln wurde im zusätzlichen nativen Tastaturtest gemessen; alle weiteren transferbezogenen Auswahlfelder erreichen mindestens 44 Pixel. Die historische WebKit-Höhe von 23 Pixeln stammt aus der unabhängigen Prüfung und wurde hier nicht erneut reproduziert. Ein ergänzender Aufnahmeversuch des historischen Builds über einen separaten Hilfsport lief in WebKit in ein Navigationstimeout; er zählt nicht als bestandener Test. Die eigentlichen 136 WebKit-Prüffälle des aktuellen Builds auf dem regulären Testserver bestehen.

[checks.json](checks.json) enthält Prüfzahlen, Build-Inventar, die 41 bytegleichen Schutzdateien, Formatgrenzen und einen reproduzierbaren Fingerabdruck des geprüften Quell-/Test-/Vertragsstands. Die 272 bestandenen Browserfälle bestehen aus dem vollständigen 270er-Lauf und zwei anschließend ergänzten nativen Tastaturtests; kein einzelner 272er-Lauf wird behauptet.
