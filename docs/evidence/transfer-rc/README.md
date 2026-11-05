# Begrenzte Transferbelege

Die 24 tatsächlich vor der Korrektur aufgenommenen Materialtexte stehen in [before-after.json](before-after.json). Die richtigen Antworten wurden dabei bereits akzeptiert, obwohl das Material den alten Fall zeigte. Die kleine Altstand-Einrichtung unter `tests/fixtures/transfer-5b825b1.json` stammt aus diesen Browserabgaben. Sie enthält synthetische Antworten, keine Schülerdaten.

| Fall | Vorher, WebKit / Desktop 1366×900 | Nachher, WebKit / iPad quer 1024×768, unterstützt |
| --- | --- | --- |
| Kenia 2 | [24 Menschen im Material](s2-before.png) | [18 Menschen, 20 Plätze, Fußweg 12 Minuten](s2-after.png) |
| Marokko 5 | [Alter Tank 80 WE](s5-before.png) | [70 Anfang, 50 Entnahme, 20 Rest](s5-after.png) |
| Marokko 6 | [Altes Zusatzfeld 20 WE](s6-before.png) | [Zusatzfeld 10, Gesamt 55, Rest 25 WE](s6-after.png) |

Es handelt sich um vollständige Seitenaufnahmen unterschiedlicher deklarierter Fenstergrößen, nicht um einen Pixelvergleich. In den Nachher-Bildern ist das bewusst genutzte Beispiel ausdrücklich gekennzeichnet. Die Zahlen- und Vergleichsprüfungen erfassen alle vier Profile in beiden Engines. `checks.json` enthält die endgültigen tatsächlichen Testzahlen und das Build-Inventar. Umfangreiche historische Belegarchive werden nicht dupliziert.
