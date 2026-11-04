# N1 · konkrete UI-Belege

[Bericht](../../afrika-n1-return.md). Ausgangscommit: `4bcee44415b670a27eec991dd047e9937c04eb1c`.

`ui-matrix.json` enthält genau die 20 geforderten Kombinationen: fünf Aufgaben-/Profilziele, zwei Fenstergrößen, zwei Engines. Jede Zeile nennt den tatsächlich normal bearbeiteten Aufgabenweg sowie die erwarteten und tatsächlichen offenen **und** geschlossenen Klappen nach Rückkehr und einem separat vorbereiteten Reload. Auch der andere Aufgabenstand und die Abgabehistorie werden konkret verglichen. Kein Zielzustand wird eingespritzt. Texte sind synthetische Eingaben, keine Musterlösungen oder echten Schülerdaten.

Zu jeder Kombination gehört ein PNG `N1-return-…-after-back.png` des tatsächlichen Schülerbildschirms. Zwei zusätzliche PNGs zeigen den separat wiederhergestellten Reloadzustand; weitere vier zeigen Neustart und gesperrten Speicher. Ein geschlossenes Elternmaterial kann bewusst eine noch geöffnete, dadurch zunächst unsichtbare Unterklappe enthalten; die vollständige Matrix prüft diese Eigenschaft zusätzlich zu den sichtbaren Bildbelegen.

`checks.json` enthält alle getesteten Anwendungshashes, 64 byteidentisch geschützte Dateien, unveränderten Antwort-/Bewertungsreducer und unveränderte T1-Korrektur sowie alle 210 abschließend erfolgreichen Browserfälle. Die drei zusätzlichen Logiktests prüfen die optionale UI-Speicherung, alte/beschädigte Zustände und Grenzen der gespeicherten UI-Daten.

`baseline.txt` dokumentiert die 20 ursprünglich fehlschlagenden normalen Wege. `final-pass.txt`, `logic-final.txt`, `build.txt`, `dist.json` und `reload.txt` dokumentieren den endgültigen Stand. Nur abschließende Leerzeichen der Reporterzeilen sind in den hier übernommenen TXT-Dateien entfernt. Die unveränderten Rohprotokolle, einschließlich des ersten Regressionslaufs vor Anpassung des Hilfetest-Setups, liegen im kompakten Prüfpaket.

Keine neue GitHub-CI für den lokalen Korrekturcommit behauptet. Kein Push, Merge, Release oder Deployment; unabhängige Nachprüfung ausstehend.
