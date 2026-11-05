# Belege zur gezielten didaktischen Verschlankung

Ausgangsstand: `3499de6cdc8e991ffc39d6945423ce6c9810137e`.

- `steps.json`: vor/nach je 13 Lernbereichen × vier Profilen, einschließlich Zahleneingaben.
- `dist.json`: strenge Positivliste und SHA-256 der tatsächlich gebauten fünf Dateien.
- Der vollständige Lernzielabgleich steht in `../../didaktik-lernzielabgleich.csv`.
- Die echten Altstände aus dem unveränderten Ausgangsreducer stehen in `../../../tests/fixtures/streamline-3499de6-saves.json` (synthetische Testantworten, keine Schülerdaten).

Reproduktion (Node 24, Lockfile): `npm ci`, `npm test`, `npx tsc --noEmit`, `npm run build`, `node scripts/check-dist.mjs`.

Browser: `npx playwright test -c playwright.editorial.config.ts 'packet-b.spec|topics-gate2.spec|four-paths.spec|language-revision.spec|n1-return.spec|streamline.spec' --workers=2`. Playwright Chromium/WebKit müssen installiert sein. In der Cloud wurde zusätzlich `WEBKIT_PATH=/workspace/.cache/afrika-webkit-deps/run-webkit` verwendet. Testausgaben werden über `--output`, `AFRIKA_EVIDENCE_DIR` und `PLAYWRIGHT_JSON_OUTPUT_FILE` in getrennte Verzeichnisse geschrieben. Die CI-Konfiguration nimmt die neuen Tests über `playwright.afrika.config.ts` auf.

Keine vollständigen historischen Bildpakete duplizieren. Die ausgewählten Bilder zeigen nur künstliche Testeingaben. Browserautomation ersetzt keine Beobachtung echter Schülerinnen und Schüler.

## Ausgeführte Prüfungen

511/511 Logiktests, TypeScript, Build und Artefaktprüfung bestanden. [checks.json](checks.json) enthält den Prüfstand mit 151 Quell-/Test-/Konfigurationshashes. [browser-cases.json](browser-cases.json) weist alle Fälle samt Browser, Testkontext, Laufzeit und anfänglichen 15 Zeitüberschreitungen aus: 435 direkte Erfolge, dieselben 15 Fälle mit unveränderten Assertions und Zeitlimit bei zwei Prozessen bestanden, zusätzliche 40/40 Erfolge. Kein Test ausgelassen.

- [streamline-chain-foerder-chromium](streamline-chain-foerder-chromium.png)
- [streamline-chain-foerder-webkit](streamline-chain-foerder-webkit.png)
- [streamline-future-esa-chromium](streamline-future-esa-chromium.png)
- [streamline-future-esa-webkit](streamline-future-esa-webkit.png)
- [streamline-photos-esa-chromium](streamline-photos-esa-chromium.png)
- [streamline-photos-esa-webkit](streamline-photos-esa-webkit.png)
- [streamline-s3-foerder-process-webkit](streamline-s3-foerder-process-webkit.png)
- [streamline-s5-esa-tech-webkit](streamline-s5-esa-tech-webkit.png)
