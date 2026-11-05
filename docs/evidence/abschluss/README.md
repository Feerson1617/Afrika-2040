# Nachweise des konsolidierten Abschlusses

- `checks.json`: ausgeführte Läufe, Reproduktion, Korrekturen, Quell- und Buildprüfsummen. Einzelne Wiederholungen werden nicht als zusätzliche verschiedene Fälle gezählt.
- `review-manifest.json`: explizit aufgezeichnete inhaltliche Prüfung. Der Quellstand, die konkrete Aufgabe, ihr Kontext und ihre dokumentierte Begründung müssen übereinstimmen. Ein normaler Auditlauf erzeugt keine neuen Freigaben. Auch vollständig bestandene Tests erzeugen ohne Inhaltsprüfung kein Manifest.
- `audit-guard.json`: praktische Invalidierungsprobe, anschließend byteidentische Wiederherstellung des getesteten Anwendungscodes.
- `F1/2/3-before/after.png`: tatsächliche Browserbilder des Ausgangscommits 4d6327a und der Korrektur bei 1024 × 768; synthetische Antworten. In F1 ist die Ansicht „Gleiches Feld“ gewählt.
- `N-before/after.png`: die zusätzliche Lösungsvorwegnahme im gemeinsamen Zahlenhinweis und seine zahlenfreie Fassung.
- `RC-weight-*.png`: gegliederte Gewichtungsoption, je Chromium/WebKit. Der Nachteil bleibt Teil derselben Antwort.

Die Matrix liegt weiterhin unter `docs/afrika-lernhindernisse-audit.json`, keine zweite Aufgabenmatrix. Fachliche Familienentscheidungen und gesonderte Profilentscheidungen: `scripts/learning-barrier-reviews.mjs`. Aktuelle synthetische Erstansichtsmessung: `../lernhindernisse/initial-view-measurements.json`; ihre Wortzahl ist keine didaktische Note.

Eine Neuerfassung mit `node scripts/audit-learning-barriers.mjs` überprüft die Bindung. Bei geänderter Quelle ist die Prüfung offen. `--record-reviewed-snapshot` ist ausschließlich nach erneuter tatsächlicher Inhaltsprüfung, dokumentierten Entscheidungen und bestandener technischer Nachprüfung zu verwenden. Die Option ersetzt diese Prüfung nicht.

Die technischen Prüfungen benutzen Linux-Chromium/WebKit und emulierten Touch. Keine physische Schul-iPad-/Safari-Erprobung, Unterrichtserprobung oder vollständige Screenreader-Abnahme behauptet. Die unabhängige Abnahme bleibt erforderlich. Rohprotokolle liegen zusätzlich im Prüfpaket.
