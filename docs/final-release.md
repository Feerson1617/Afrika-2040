# Finaler Release – Vorbereitung und Freigabeweg

Stand: 26.10.2026. Freigegebene Anwendungsgrundlage: **`5034e28efd963987f710f81ff5ea5db6e4f2315c`**, Branch `fix/final-pedagogical-corrections`. Release-Branch: `release/afrika-2040-final`. Der vollständige neue Release-Commit wird nach dem Commit im externen Abschlussbericht und im vorbereiteten PR-Text angegeben; `git rev-parse release/afrika-2040-final` ermittelt ihn ebenfalls.

## Tatsächlicher Ausgangsstand und Umfang

Lokaler Ausgangsbranch und HEAD entsprachen der Freigabe, Arbeitsbaum sauber. Remote-Abfrage bestätigte denselben Commit. Remote-`main` war `b07f8244ab64763aea9c3f96ce3358fab3c1cf78` (Initial commit) und ein Vorfahr des Release-Stands. Daher enthält ein späterer PR gegen diesen `main` die bereits geprüfte gesamte Anwendungsentwicklung; die **neue Release-Differenz gegenüber `5034e28…`** betrifft nur neun Dateien:

- `AGENTS.md`: Release-Auftrag und ausdrücklich begrenzte Push-/Draft-PR-Freigabe.
- `.github/workflows/release-checks.yml`, `.github/workflows/pages-manual.yml`: getrennte Prüfung und manuelle Veröffentlichung.
- `playwright.release.config.ts`, `playwright.live.config.ts`: begrenzte Auswahl vorhandener Tests beziehungsweise späterer Live-Test.
- `scripts/check-dist.mjs`, `tests/release-dist.test.ts`: eng gefasste Artefaktkontrolle und negative Prüffälle.
- `tests/browser/release-live.spec.ts`: zwei kompakte, lokal erprobte und später an der Live-URL verwendbare Smoke-Fälle.
- Diese Dokumentation.

Alle 38 Dateien unter `src/` sowie `index.html`, Vite-Konfiguration, Paketdateien/Lockfile und `docs/scorm-readiness.md` sind bytegleich zum freigegebenen Commit: insgesamt **43 geschützte Dateien**. Bestehende Tests wurden nicht geändert, gelöscht, übersprungen oder abgeschwächt. Keine neuen Spielinhalte, Bewertungsfunktionen, Konten, Arbeitsblätter, Handreichungen oder SCORM-Implementierung.

Die GitHub-API ist aus dieser Cloud-Umgebung gesperrt: `Get "https://api.github.com/repos/Feerson1617/Afrika-2040": Forbidden`. Sichtbarkeit, Actions-/Pages-Einstellungen, Branchschutz und Environment-Regeln konnten deshalb **nicht administrativ ausgelesen oder bestätigt** werden. Keine Einstellungen geändert. Vor Merge/Veröffentlichung muss die verantwortliche Person die unten genannten Einstellungen prüfen.

## Prüfworkflow und Sicherheitsgrenzen

`Release checks` läuft bei Pull Requests gegen `main`, auch für einen Draft-PR. Ausgecheckt wird die unveränderliche tatsächliche PR-Head-SHA; sie wird protokolliert. Kein `pull_request_target`, keine Schreib-/Pages-/OIDC-Rechte, keine gespeicherten Checkout-Zugangsdaten, kein Deployment. Bei einem später abweichenden `main` ist zusätzlich der resultierende Integrationsstand zu prüfen.

Ubuntu 24.04, Node.js 24, `npm ci`, sämtliche Logiktests, `npm run build` (TypeScript + Vite), `node scripts/check-dist.mjs`, anschließend die begrenzte vorhandene Release-Auswahl. Zwei verpflichtende Matrix-Jobs: **Chromium und WebKit**. Jede Engine wird samt Systembibliotheken mit der gesperrten Playwright-Version installiert. Auf GitHub wird ausdrücklich diese Engine verwendet; die bestehende lokale System-Chromium-Unterstützung bleibt erhalten. Kein `continue-on-error`, keine automatischen Testwiederholungen. Ein Installations-/Browserfehler macht den jeweiligen Check rot und blockiert die Freigabe.

Pro Job werden Teststand, Installations-/Test-/Buildprotokolle, JSON-/HTML-Bericht, gezielte Bilder und Fehler-Traces als getrennte Prüfartefakte für 14 Tage aufbewahrt, auch bei Fehlern. Diese enthalten ausschließlich synthetische Testantworten und gelangen nicht in `dist`. Offizielle Actions wurden über ihre aktuellen Major-Tags und `action.yml` geprüft und auf vollständige SHAs fixiert: Checkout/Setup Node/Upload Artifact v7, Configure Pages v6, Upload Pages Artifact/Deploy Pages v5. Aktualisierungen sind später ausdrücklich zu prüfen.

## Tatsächlich lokal geprüfte Eigenschaften

Ausgeführt mit Node 24.19.0, npm 11.9.0 und System-Chromium 154.0.8037.57:

- `npm ci`: erfolgreich aus unverändertem Lockfile.
- `npm test`: **171 bestanden**, keine ausgelassenen Tests. Darunter alle bisherigen 170 und ein neuer Artefakt-Test mit mehreren negativen Fällen.
- `npm run build`: TypeScript und Vite erfolgreich, relative Pfade unverändert.
- `node scripts/check-dist.mjs`: erfolgreich; exakt `index.html`, ein lokales JS- und ein CSS-Bundle. Keine PDFs, `.env`, Quellarchive, Spielstände, Testprotokolle, Abhängigkeiten, Source Maps oder Symlinks. HTML lädt ausschließlich die beiden relativen Bundles, dazu bestehendes eingebettetes Icon und lokaler Sprunglink. Negative Tests lehnen zusätzliche Dateien, absolute/externe Ressourcenpfade, Symlinks und Source Maps ab. Häufige Schlüssel-/Private-Key-Muster werden ohne Ausgabe möglicher Werte geprüft; dies ersetzt keine allgemeine Geheimnisgarantie für beliebige künftige Codeänderungen.
- `npx playwright test --config=playwright.release.config.ts --project=chromium --reporter=list,html,json`: **44 vorhandene Regressionen bestanden**. Die beiden neuen Smoke-Fälle scheiterten zunächst an einem nicht vorhandenen Testselektor für „Aufgabe neu bearbeiten“. Ausschließlich der neue Test wurde auf den tatsächlichen zugänglichen Button korrigiert; beide Fälle bestanden anschließend mit derselben Konfiguration und `--grep 'release live smoke:'`. Damit **46 unterschiedliche Release-Fälle erfolgreich geprüft**, kein behaupteter vollständiger grüner Erstlauf. Es gab keinen dafür notwendigen Anwendungseingriff.
- Abgedeckt: sechs direkte Einstiege; Kenia 1 mit Straßenereignis und Zeiten; Kenia 2 mit beiden Maßnahmen und berechneten zugänglichen SVG-Namen; Ghana-Verarbeitung und vollständige Überschussverteilung; beide Marokko-Episoden; Geographie und feste Rückblickreihenfolgen; richtige/falsche/teilrichtige Rückmeldungen; Hilfestufen und bewusste Übernahme; bestätigte Antwortherkunft; Wörterhilfe; Speicherwarnung/-wiederherstellung, Neuladen, Wiederaufnahme und Neustart. Desktop, simuliertes iPad-Querformat 1024 × 768 mit echten Touch-Aktionen sowie tatsächlicher lokaler 640 × 650 Inhaltsframe. Auslieferung unter `/Afrika-2040/`, lokale Ressourcen, keine erforderlichen externen Laufzeitanfragen; vorhandene Scoped-Axe-Prüfungen in der Auswahl bestanden. Zwei aktuelle repräsentative Bildschirmaufnahmen wurden angesehen.
- `actionlint` 1.7.7: beide Workflows ohne Befund; zusätzliche Strukturprüfungen bestätigen ausschließlich manuellen Pages-Trigger, Main-Sperre, Berechtigungen, Engine-Matrix und `dist` als einziges Pages-Artefakt. Dies ist lokale Workflow-Validierung, kein behaupteter erfolgreicher GitHub-Lauf.

**WebKit lokal nicht ausgeführt:** tatsächlicher Startversuch meldet fehlendes `/home/agent/.cache/ms-playwright/webkit-2370/pw_run.sh`. Die vom gesperrten Playwright gemeldeten Download-Hosts `cdn.playwright.dev` und `playwright.download.prss.microsoft.com` fehlen in der aktuellen Cloud-Netzwerkliste. Keine Umgehung oder angeblich bestandene WebKit-/Safari-Prüfung. Die Auswahl enthält den bestehenden Test für den sichtbaren Kenia-Aufgabenbeginn (`F3 … north touch=true`) auch unter WebKit; sein CI-Erfolg steht aus. Bekannte plattformspezifische Tastatur-/Fokusfragen bleiben bis zum tatsächlichen Engine-Lauf offen, ohne Testausnahmen. Ebenso keine neuen Nachweise von Schulhardware, Schulnetz, Screenreader-Vollständigkeit oder Unterrichtswirksamkeit.

Aktuelle lokale Belege liegen außerhalb des Repositorys unter `/workspace/output/final-release/`: genaue Auswahl, beide Browserprotokolle/JSON-Dateien, Build-Inventar mit Hashes, Quellgleichheitsnachweis, Workflow-Prüfung und wenige aktuelle Bilder. Keine Wiederaufnahme großer historischer Belegpakete. Das vorliegende Prüfpaket ist kein Veröffentlichungsartefakt.

## Vor Merge: erforderliche Prüfung durch die verantwortliche Person

1. Draft-PR und vollständige Release-SHA unabhängig prüfen. In **Settings → Actions → General** Actions zulassen und die verwendeten offiziellen, SHA-fixierten Actions erlauben. Keine zusätzlichen Schreibrechte oder eigenen Secrets für die PR-Prüfung nötig. Erst nach Zugriff auf GitHub die tatsächlichen Einstellungen/Läufe bestätigen; lokale Logs ersetzen das nicht.
2. Beide PR-Checks `Release checks (chromium)` und `Release checks (webkit)` müssen am aktuellen PR-Head erfolgreich sein. Installations-/Plattformfehler untersuchen, nicht übergehen. Soweit gewünscht unter **Settings → Rules → Rulesets** (beziehungsweise **Branches → Branch protection**) Reviews und diese Statuschecks für `main` verbindlich machen; keine Änderung durch diesen Auftrag.
3. Unter **Settings → Environments → github-pages** die Umgebung anlegen/prüfen, verantwortliche Required Reviewers und nach Möglichkeit „Prevent self-review“ einrichten; Deployment branches auf den ausgewählten Branch `main` beschränken. Tatsächliche Verfügbarkeit dieser Schutzoptionen im Repository prüfen. Solange die beabsichtigte Freigabesperre nicht eingerichtet/bestätigt ist, nicht veröffentlichen.
4. Unter **Settings → Pages → Build and deployment → Source** **GitHub Actions** wählen. Keine Veröffentlichung aus Repository-Wurzel, `docs/` oder einem automatisch gebauten Branch. Keine Custom Domain vorausgesetzt. Vorhandene andere Deployments/Workflows auf mögliche automatische Veröffentlichung prüfen. `configure-pages` verwendet ausdrücklich `enablement: false` und ändert diese Einstellung nicht selbstständig.
5. Neue ausdrückliche Merge-Freigabe einholen. Den dann aktuellen `main` und den resultierenden Merge-/Squash-Stand prüfen; bei zwischenzeitlichen Änderungen erneut passend testen. Nur den geprüften PR zusammenführen. Kein Auto-Merge eingerichtet; dieser Auftrag führt keinen Merge aus. Ein Merge oder Push startet keinen Pages-Workflow.

## Spätere Veröffentlichung: getrennte ausdrückliche Freigabe

Erst nach Merge und ausdrücklicher Veröffentlichungsfreigabe für die **vollständige resultierende `main`-SHA**: **Actions → Publish approved main to Pages (manual only) → Run workflow → Branch `main`** auswählen, SHA in `approved_sha` eintragen, Freigabefeld bewusst aktivieren. Workflow-Trigger ausschließlich `workflow_dispatch`; beide Jobs sind auf dieses Repository und `refs/heads/main` beschränkt. Falsche SHA wird vor Installation/Build abgelehnt.

Der erfolgreiche Build prüft erneut Logik, TypeScript, Artefakt und beide Browser. Danach wird ausschließlich das überprüfte `dist` als `github-pages`-Artefakt hochgeladen. Der davon abhängige Deployment-Job wartet auf die eingerichtete Environment-Freigabe und erhält nur `pages: write` und `id-token: write`. Keine automatische Veröffentlichung bei Push, Merge oder PR-Erfolg. Bei Prüf- oder Freigabefehlern kein Deployment. Bei späterem Fehler in der Live-Abnahme zuerst Zugriff/Freigabe klären; Rücknahme oder erneute Veröffentlichung bleibt eine getrennte administrative Entscheidung.

## Plan für die spätere Live-Abnahme

Ziel erst nach Freigabe und tatsächlichem Deployment: `https://feerson1617.github.io/Afrika-2040/`. **Hier nicht als live geprüft oder erfolgreich veröffentlicht bezeichnet.** Vorbereiteter maschineller Aufruf in einer Browser-Testumgebung:

```sh
RELEASE_LIVE_URL=https://feerson1617.github.io/Afrika-2040/ \
  npx playwright test --config=playwright.live.config.ts --project=chromium
```

WebKit separat mit `--project=webkit`, sobald installiert. Diese Konfiguration startet keinen lokalen Server und verlangt eine ausdrücklich gesetzte Live-URL. Zwei frische isolierte Testkontexte prüfen HTTPS/Erreichbarkeit, lokale JS-/CSS-Requests, Afrikakarte, sechs Einstiege, Kenia-Interaktion mit rot/gelb/grün, drei Hilfen, bestätigte Antwort nach Neuladen, Wiederaufnahme im selben Tab, Desktop/iPad-Querformat und Konsolen-/Ladefehler. Es werden keine echten Schülerantworten verwendet oder übertragen.

Danach ergänzend an der tatsächlichen URL: Straßenereignis; beide Nachfrage-Maßnahmen; Ghana- und Marokko-Interaktionen; Rückblick samt bewusster Übernahme; Speicherwarnung und bewusster Neustart; sichtbarer Aufgabenbeginn und Tastatur unter WebKit/Safari. Erst nach erfolgreicher Live-Abnahme den Dienst als veröffentlicht und geprüft melden. Tatsächliches Schulnetz und verwaltete Schul-iPads gesondert prüfen. Automatisches Öffnen aller Episoden beweist allein keinen vollständigen Live-Durchlauf aller Lernhandlungen.

SCORM/itslearning bleibt ausschließlich die unveränderte spätere Option aus `scorm-readiness.md`: kein Paket, Manifest, LMS-Tracking oder Bewertungsdienst. Nach Release-Commit, erlaubtem Branch-Push und Draft-PR-Versuch endet dieser Auftrag; kein Merge und keine produktive Veröffentlichung.
