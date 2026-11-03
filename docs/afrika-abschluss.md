# Konsolidierter Abschluss · Abnahmevorbereitung

Ausgangscommit: `4d6327a75fbd91030b9292ee0cca20bfd6953b4b`, Entwicklungsbranch `feat/afrika-vier-lernwege`. HEAD, sauberer Arbeitsbaum und identischer Remote wurden vor Beginn bestätigt. Der Abschlusscommit steht vollständig in der Übergabe und im Prüfpaket.

## Inhaltliche Prüfung und ihre Grenzen

Die vorhandene [Matrix](afrika-lernhindernisse-audit.json) erfasst **494 abgeschlossene inhaltliche Einzelprüfungen in 52 Varianten**. Grundlage sind **113 ausdrücklich begründete Aufgabenbausteine** und **52 gesonderte Bereich-Profil-Entscheidungen**, dokumentiert in `scripts/learning-barrier-reviews.mjs`. Gemeinsame Erzeuger wurden gemeinsam geprüft; konkrete Fragen, Felder, Materialien, Auswahlmöglichkeiten und Profilunterschiede bleiben je Datensatz erhalten. Jeder Schritt enthält 20 beantwortete Prüffragen, die aktuelle Beispiel-Kontextauflösung und bei abhängigen Aufgaben die weiteren Auswahlkontexte. Die Kontexte verwenden bewusst übernommene synthetische Beispiele, keine selbstständigen Schülerleistungen.

Das ist eine inhaltliche Quell- und Aufgabenentwurfsprüfung mit zusätzlicher technischer Browserprüfung. Es wird **nicht** behauptet, 494 empirische Unterrichtsbeobachtungen durchgeführt zu haben. Der Test-Erfolg erzeugt keine Inhaltsfreigabe. `reviewComplete` gilt nur bei Übereinstimmung mit dem ausdrücklich aufgezeichneten Prüfmanifest. Änderungen an `src`, Aufgabe, Kontext oder begründeter Entscheidung machen die Kennzeichnung ungültig. Die Invalidierung wurde praktisch geprüft: temporäre Quelländerung → null gültige Prüfungen; byteidentische Wiederherstellung → 494. Die Probe änderte den endgültigen Anwendungscode nicht.

Die 66 vorhandenen Glossarbegriffe und zusätzliche verwendete Begriffe/Einheiten sind klassifiziert. Notwendige Begriffe werden konkret eingeführt; Vertiefung bleibt freiwillig. Unnötiges „schematisch/Hektarmaßstab“ wurde aus den betroffenen Grafikbeschreibungen entfernt. Quellenwerte, Datenzeiträume und fachliche Sollwerte bleiben erhalten.

## F1–F3: Fehler und Korrektur

| Befund am Ausgangsstand                                            | Verhalten nach Korrektur                                                                                                                                                         | Schutz                                                                                                                                                              |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1: Beide Flächentasten zeigten 45 + 20                            | Gleiches Feld: 45 WE ohne Zusatzfeld. Zusatzfeld: 45 und 20 WE. Aktuelle Ansicht ausdrücklich benannt; Rechenfrage weiterhin zum Zusatzfeldplan.                                 | Drei Profile, beide Engines; Tabellen tatsächlich verschieden, weder 65 noch 15 vor eigener Rechnung/Hilfe 3.                                                       |
| F2: Gemeinsame Hilfe 2 nannte schon 120 GE                         | Löhne und andere Kosten nacheinander abziehen. Ergebnis erst in bestätigter Rechnung oder Hilfe 3.                                                                               | Hilfezustand statt Klickzahl prüfen; Beispiel nicht allein durch Anzeige als übernommen kennzeichnen.                                                               |
| F3: Geänderte Eingabe ließ Status und aufgedecktes Material zurück | Nach tatsächlicher Änderung: ungeprüfter Versuch, angepasster sichtbarer Status und Material, keine alte Rückmeldung/Weiter-Schaltfläche. Nativer Eingabeknoten bleibt bestehen. | Alle neun Rechenansichten in Chromium/WebKit; Fokus, Cursor, Schreibfluss, Reload und unveränderte frühere Abgaben. Hilfe 3 bleibt bewusst geöffnet und bezeichnet. |

Zusätzlich wurde der vorhergehende ESA-Lohnschritt geprüft: Er zeigt nicht mehr ungefragt den freien Betrag der folgenden Rechenaufgabe. Seine Hilfe bezieht sich auf bereits bezahlte Löhne statt auf eine spätere Verteilung.

## Weitere konkrete Änderungen

- Prozentwerte zeigen **wie viele von 100**, nicht **wer** persönlich Stromzugang hat. Stromzugang, Zuverlässigkeit, Einkommen und BIP bleiben getrennt.
- Die ESA-Wasserfrage heißt „Wie viel Wasser wird für beide Felder aus dem Tank genommen?“ Entnahme ist nicht Bedarf oder tatsächlicher Verbrauch.
- Kakaokarten: „Schau dir die Karten an. Wähle den passenden Schritt.“ Keine nicht vorhandene Verschiebefunktion. Vier unterschiedliche zweite Hilfen für Bohnen, Rösten/Mahlen, Masse und Pressen.
- Einfache Wirtschaftshilfe: „Was könnte dem Betrieb helfen?“ Die nächste Hilfe fragt nach dem tatsächlich belegten Erfolg. Quellenkritik wird nicht durch schwerere Sprache erzeugt.
- Wasserzeichnungen zeigen keine echten Feldgrößen. WE wird einmal verständlich eingeführt; Grundwasser wird von Wasser im Tank abgegrenzt und erklärt.
- Die sechs Gewichtungsfamilien zeigen innerhalb derselben Option getrennt **Mir ist wichtig** und **Dafür nehme ich in Kauf**. Vollständiger Vorteil und Nachteil, unveränderte Kennungen und persönliche Gewichtung bleiben erhalten.
- Die allgemeinen Selbstkontrollsätze wurden im tatsächlich angezeigten Renderer geprüft. In den betroffenen reinen Sach-/Rechenaufgaben werden sie nicht als Selbstkontrolle geöffnet; kein nutzloses Umschreiben hunderter interner Kriterien.
- Millimeter, Prozent, BIP und negative Ergebnisse sind beim Bedarf erklärt. Natürliche Veränderung und Wanderungssaldo werden vor verknüpften Rechnungen konkret benannt. Zusätzlich wurden die ergebnisgleichen Formatbeispiele −10 und 1.020 aus dem gemeinsamen Zahlenhinweis entfernt. Er enthält jetzt keine Zahlen und verrät daher keine Rechenergebnisse. Acht tatsächliche Browserregressionen und ein dauerhafter Logikschutz prüfen dies. Die administrative Formulierung „historischer Projektstand“ wurde im sichtbaren Wirtschaftsquellentext durch einen einfachen Hinweis auf frühere Jahre ersetzt.

## Die 13 Lernbereiche

| Bereich          | Fachliche Prüfung / bewusste Differenzierung                                                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orientierung     | Echte Länderflächen, Stadtpunkte und Äquator; keine Buszeiten aus der Übersicht. AHR beschreibt zwei Städte und eine Kartengrenze selbst.                                                      |
| Bilder und Orte  | Beobachtung und Vermutung getrennt; zwei Fotos repräsentieren nicht Afrika. ESA behält die Zeitungsbehauptung in beiden Schritten; MSA/AHR formulieren eigene begrenzte Aussagen/Perspektiven. |
| Natur und Wasser | Kalender statt Monatsmessung; Regionalmittel statt Stationswert; Wasserweg statt falscher Tankhinweise. AHR empfiehlt mit Bedingung und fehlender Angabe.                                      |
| Bevölkerung      | Vier Ereignisse, beide Salden und Bestand getrennt. Förder ohne negative Pflichtrechnung; ESA einzeln; MSA verknüpft; AHR zusätzlich Gegenfall und Quellenkritik.                              |
| Wirtschaft       | Laufender Überschuss und Anschaffung getrennt; Anteil/BIP-Wachstum nicht individueller Gewinn. AHR prüft die konkrete Einkommensbehauptung anhand beider Quellen.                              |
| Zukunft          | Einmalige/monatliche Kosten getrennt; eigene Priorität und passende Folgen. MSA/AHR erklären, AHR verknüpft Bedingungen.                                                                       |
| Kenia 1          | Persönlicher Einstieg und benutzte Abschnitte; Baustelle nur am betroffenen Fußweg. Keine Verwechslung mit ganzer Linienzeit.                                                                  |
| Kenia 2          | Fahrgäste, Fahrten, Plätze und Gehzeit getrennt; zusätzliche Fahrt und Zugang nicht austauschbar. AHR erklärt den Zusammenhang selbst.                                                         |
| Ghana 3          | Verarbeitungsfolge und Betriebskosten getrennt; größere Einnahmen garantieren keinen größeren Überschuss. Keine sicheren späteren Verkäufe behauptet.                                          |
| Ghana 4          | Bezahlte Löhne, freies Geld und neue Verteilung getrennt. Alle 28 Verteilungen zulässig; MSA zweiter Plan, AHR eigener Perspektivenvergleich.                                                  |
| Marokko 5        | Tankentnahme, Feldankunft, Rest und Verbrauch getrennt; kein Grundwasserbeleg. Neuer 70/50-Fall bleibt eigenständig.                                                                           |
| Marokko 6        | Erstes Feld versus Gesamtentnahme; tatsächlicher Vergleich der Ansichten. Neuer 45+10-Fall und AHR-Grenze genau 15 bleiben korrekt.                                                            |
| Rückblick        | Fallbezogene Modellaussage und räumliche Reichweite; Einheiten bei Direkteinstieg verfügbar. AHR verbindet zwei Fälle und nennt reale Zusatzinformationen.                                     |

Förder und ESA erhalten keine neuen Pflichtfreitexte. Alle vier Wege sind für Jahrgang 7. Unterschiede liegen in Verknüpfung, Selbstständigkeit, Hilfen und Erklärungstiefe. Eine gespeicherte Auswahl, ein übernommenes Beispiel oder eine mündliche Selbstmeldung wird nicht als beobachtete selbstständige Urteilskompetenz ausgegeben.

## Tatsächliche technische Prüfung

- **491/491 Logiktests**, TypeScript, Produktionsbuild und strenger Artefaktprüfer bestanden.
- F1–F3 vor Korrektur: 30 Browserfälle, 28 reproduzierten den Fehler; die zwei ESA-Hilfe-2-Fälle bestanden bereits. Nach Korrektur alle 30 bestanden.
- Integrierter/Legacy-Lauf: **498/498** bestanden, einschließlich alter Kenia-, Ghana-/Marokko-Ansichten und der mehrteiligen Feedback-/Reload-Matrix.
- Folgelauf: 218/222 bestanden; vier Tests erwarteten noch den alten identischen zweiten Kakaohinweis. Die Erwartungen wurden durch vier konkrete Hinweise ersetzt und für höhere Profile um die zweite Stufe ergänzt. Kein Test gelöscht oder übersprungen.
- Danach **192/192** gezielte Fälle bestanden, einschließlich Hilfe 3 nach Eingabeänderung, Wasser-/Transferansichten und der verschärften Kakaoprüfung.
- Abschließender vollständiger Durchlauf: **208/208 Kombinationen**, 13 Bereiche × vier Profile × regulär/unterstützt × Chromium/WebKit. Desktop sowie emuliertes iPad 1024 × 768, Tastatur und Touch.
- Nach einer reinen Formulierungsänderung im Wirtschaftsquellentext zusätzlich **16/16** betroffene Durchläufe am endgültigen Build bestanden. Diese Wiederholungen werden nicht als neue verschiedene Fälle addiert.

Zusammen sind **562 verschiedene Browserfälle** über die Läufe erfolgreich geprüft. Tatsächliche Ergebnisse, fehlgeschlagene Vorläufe und Quell-/Buildprüfsummen: [checks.json](evidence/abschluss/checks.json). Alle Aufgaben-/Feldidentitäten, akzeptierten Antwort-IDs, Bewertungs-Sollwerte, Abhängigkeiten und Modellverknüpfungen wurden zusätzlich gegen den Ausgangsvertrag verglichen. Die unabhängigen Antwortorakel blieben unverändert. Der erste Logiklauf bestand mit 487/488 Fällen; der verbleibende Test erwartete noch 120 GE in einer frühen Hilfe. Angepasste alte Tests erwarteten irrtümlich 120 GE in einer Hilfe beziehungsweise denselben Kapitelhinweis für jeden Verarbeitungsschritt; ihre fachliche Sollrichtung ist jetzt strenger.

Der Build enthält ausschließlich HTML, JavaScript, CSS und die zwei lizenzierten Fotos. Keine Original-Schul-PDFs, Berichte, Schülerdaten, `.env` oder Abhängigkeitsordner werden veröffentlicht. Die aufgezeichneten Beispieldaten sind synthetisch.

## Vorher-/Nachher und verbleibende Grenzen

Je ein Bildpaar zeigt F1, F2 und F3 im exakten Ausgangscommit und im korrigierten Stand. Zwei weitere Bilder zeigen die gegliederte Gewichtung in Chromium/WebKit. Das aktuelle Erstansicht-Inventar mit Projekt-CSS enthält alle 494 Schritte; Wortzahl und fehlender horizontaler Überlauf sind keine didaktische Note.

**P3 / Grenzen:** Amtliche lange Regionsnamen dürfen umbrechen; die vollständige Identität bleibt absichtlich erhalten. Ein früher sporadischer Kakao-Reload-Scrollbefund wurde im aktuellen mehrteiligen Feedbacklauf nicht reproduziert. Eine vollständige plattformunabhängige Fehlerfreiheit wird daraus nicht abgeleitet; keine unbegründete neue Navigation implementiert. Physische Schul-iPads/Safari, vollständige Screenreader-Abnahme, DaZ-/Leseverständnis, benötigte Unterrichtszeit und selbstständige Urteilsbildung müssen mit echten Lernenden geprüft werden.

Keine neuen Kapitel, Modelle, Unterrichtsunterlagen, Klassenarbeit oder SCORM-Implementierung. Nach bestandener Prüfung sind nur Entwicklungsbranch-Push und Draft-PR genehmigt. Kein Merge, Release, Force-Push, Pages-Deployment oder administrativer Eingriff. Die unabhängige Abnahme bleibt gesondert erforderlich; GitHub- und CI-Ergebnis stehen in der Übergabe.

## Geänderte Quelldateien

- `src/main.ts`: sofortige Aktualisierung von Status und abgeleitetem Material nach echter Eingabeänderung, ohne den Eingabeknoten zu ersetzen.
- `src/learning/simulation-material.ts`: tatsächlicher Flächenvergleich, feste Zuordnung der Frage und verständliche Material-/Einheitentexte.
- `src/learning/simulation-variants.ts`: passende Hilfen und präzise Entnahmefrage.
- `src/learning/topic-variants.ts`: Prozent-, Quellen-, Regionen- und Wirtschaftsformulierungen.
- `src/learning/material-view.ts`: notwendige Begriffe/Zeichen beim Rechnen und Direkteinstieg.
- `src/learning/language.ts`: gemeinsamer, ergebnisfreier Hinweis zur Zahlenschreibweise.
- `src/learning/chapter-ui.ts`: gegliederte Gewichtungsoptionen mit denselben IDs und vollständigen Folgen.

Bewertungsfunktionen, Zustandsreduktion, Quellenwerte, Rechenmodelle und Antwortorakel wurden nicht verändert.

Die normale CI-Testkonfiguration `playwright.afrika.config.ts` nimmt die neuen `RC-final`-Regressionen ausdrücklich auf. Die Testauflistung ohne manuelle Filter zeigte alle 132 Sprach-/Korrekturfälle, darunter sämtliche 104 neuen F1/F2/F3-, Gewichtungs- und Hilfe-3-Fälle beider Engines. Das ist eine geprüfte Testentdeckung, kein behaupteter GitHub-CI-Erfolg.

Nach der zusätzlichen Korrektur des Zahlenhinweises wurden alle 208 Kombinationen nochmals am aktuellen Build ausgeführt; die letzte vollständige Prüfung steht gesondert im Protokoll. Die ersten acht Negativfälle am Ausgangscommit belegen die ursprüngliche Vorwegnahme. Die bewusste Inhaltsprüfung des gemeinsamen Hinweises ergänzt die Baustein-/Profilentscheidungen.
