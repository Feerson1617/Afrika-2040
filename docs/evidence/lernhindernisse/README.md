# Belegter Zwischenstand der Lernhinderniskorrekturen

`checks.json` enthält die tatsächlich ausgeführten Läufe und Quellprüfsummen. Der Gesamtauftrag ist nicht abgeschlossen (`didacticAuditComplete: false`). Erfolgreiche Browserwege ersetzen keine didaktische Einzelprüfung.

`initial-view-measurements.json` erfasst alle 494 synthetischen Erstansichten mit Projekt-CSS bei 1024 × 768. Vorangegangene Aufgaben sind mit bewusst übernommenen Beispielen bearbeitet. Diese Messung beweist weder Lesekompetenz noch reale Bild-, Touch- oder Fokusbedienung. Die regulären und unterstützten Browserwege werden gesondert protokolliert.

`word-counts.json` und die sechs PNGs vergleichen drei echte Aufgabenansichten im Ausgangscommit und im korrigierten Stand. Es sind synthetische Antworten. Die Fotos im Projekt behalten ihre bisherigen Lizenzen; keine Schülerdaten enthalten.

Die Matrix lässt sich mit `node scripts/audit-learning-barriers.mjs` und anschließend `npx prettier --write docs/afrika-lernhindernisse-audit.json` neu erfassen. Ihre offenen Einzelprüfungen bleiben dabei ausdrücklich offen. Eine Neuerfassung ist keine automatische Freigabe.
