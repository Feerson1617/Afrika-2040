# Variantenidentität und Wiederaufnahme – Gate 1

Der bestehende tabgebundene Speicherschlüssel bleibt bestehen. `State.learning.version = 1` ist ein optionaler Umschlag. Alte `inquiry`, `studies`, `demand`, `road` und `geography` werden mit ihren bisherigen Validierungen gelesen. Ohne neue Lernwegdaten wird kein Profil vergeben. Der Einstieg in einen neuen Lernweg bleibt eine bewusste Wahl; URL-Parameter `lernweg=esa&bereich=c` sind eine explizite Empfehlung, keine Diagnose. Beide Parameter werden auf geschlossene Kennungen geprüft.

Ein Bereich (`c.foerder.v1`) enthält mehrere unterschiedliche Teilaufgaben. Jede trägt gemeinsame conceptId und fachliche taskId, eine profilgebundene variantId, getrennte Aufgaben-/Modell-/Materialversionen sowie eine lokale attemptId. Daten und Abschlüsse sind über diese volle Identität getrennt. Auch der frühe Kenia-Vergleich nutzt denselben Vertrag, aber das unveränderte Wegenetzmodell.

Pro Aufgabe werden Rohantworten, Prozessstatus, Fachprüfungsumfang, Antwortform, Herkunft und bis zu 40 jüngste tatsächliche Antwortabgaben gespeichert. Ältere Abgaben werden nur gezählt; die aktuellen Antworten und die historische Beispielnutzung bleiben erhalten. Das ist eine begrenzte lokale Verlaufshilfe, kein revisionssicheres Prüfungsarchiv. Eingaben werden nicht als externe Analysedaten versendet. Freitexte haben nur eine technische Höchstlänge, keine Mindestwortzahl und keine fachliche Musterwortprüfung.

Bei Profilwechsel bleibt der ursprüngliche Versuch unverändert. Der Zielweg erhält einen eigenen Versuch oder seinen schon vorhandenen Entwurf. Bestätigung und Abbruch sind ausdrücklich getrennt. Kein Übertragen eines Abschlussflags und kein automatisches Kopieren einer freien Erklärung. In dieser Version gibt es keine Notizübernahme zwischen Profilen.

Lesen prüft Identitäten, Felder und Werte. Abgegebene Sachantworten werden erneut fachlich ausgewertet; ein bloß ausgefüllter Entwurf bleibt ein Entwurf. Eigene Texte und mündliche Selbstmeldungen bleiben ungeprüft. Fehlerhafte optionale Aufgaben werden einzeln verworfen; gültige Geschwister und alte Spielstände bleiben erhalten. Ein unbekannter neuer Umschlag wird nicht als passendes Profil interpretiert. Der Lesevorgang schreibt niemals automatisch einen vermeintlich migrierten Stand zurück. Speicherung erfolgt erst bei einer Nutzerhandlung; bei Fehlschlag bleibt die bekannte Warnung sichtbar und die Sitzung im Arbeitsspeicher bedienbar.

Standardgerüst, freiwillige Hilfe, angezeigtes Muster, bewusste Nutzung und spätere Bearbeitung sind getrennt. Ein korrekt bestätigtes Ergebnis bleibt korrekt, wenn danach Hilfe gelesen wird. Nach Antwortänderung wird neu geprüft, die frühere Beispielnutzung bleibt sichtbar. Kriterienzugriff ist Selbstkontrolle und keine externe Freigabe. Globaler Neustart löscht alle Bereiche im aktuellen Tab; der gemeinsame Hinweis nennt Lernwege, Themen, Episoden und Journal.

Die tatsächlichen Zustandsgrößen stehen im Gate-1-Testbericht. Ein vollständiger Browserzustand ist kein fertiges `suspend_data`-Format. Der kompakte spätere Datensatz müsste Versions-/Variantenkennungen, aktuelle Positionen, tatsächlich nötige Antworten, Unterstützungsherkunft und offene Produkte bewahren; Feedbacktexte, Materialien, erwartete Lösungen und wiederholte Vertragsmetadaten sind ableitbar. Freitexte nicht stillschweigend an ein LMS übertragen. Werden sie weggelassen, ist ihre vollständige Wiederherstellung aus diesem Datensatz unmöglich. Vor einer echten SCORM-2004-Auslieferung sind Umfang, 64.000-Zeichen-Budget und Datenschutz am implementierten Codec erneut zu prüfen. Kein Adapter und keine LMS-Übertragung wurden ergänzt.

## Paket-A-Korrektur: Empfehlungen und begrenzte Abgaben

Der verbindliche URL-Vertrag steht in `afrika-paket-a-correction.md`. Neue Empfehlungen widersprechen einem gespeicherten aktiven Profil nur über eine sichtbare Abfrage. Eine flüchtige `pendingUnit` gehört ausschließlich zur noch offenen Empfehlung; sie ändert keine Aufgabenidentität. Bei Reload wird die Empfehlung aus der noch unentschiedenen URL neu angeboten. Nach Bestätigung oder Abbruch wird sie verbraucht. Keine Schema-/ID-Umstellung; Daten-/Modellversionen bleiben gleich, da die Quellen und Modelle unverändert sind.

Die gemeinsame Anhängefunktion behält die 40 jüngsten **gültigen** Abgaben und addiert jeden entfernten Eintrag zu `olderSubmissions`. Das gilt bei jeder Antwortform und beim Lesen überlanger Altlisten. Ungültige Listenelemente werden nicht als tatsächliche Schülerabgaben gezählt. Bereits verdichtete Zähler bleiben additiv erhalten. Aktuelle Entwürfe, fachlich ungeprüfte Texte, historische Beispielnutzung und bewusstes Übernehmen werden nicht aus älteren Einträgen abgeleitet oder gelöscht. Wiederholtes Lesen verdichtet denselben Stand nicht erneut.

## Spätere Portabilität in Paket B – nur Datenentwurf

Ein späterer Wiederaufnahmedatensatz müsste mindestens enthalten:

| Erhalten                                                                                   | Zweck                                                                                                                           |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Schema-/Inhaltsstand, Bereich/Profil, Aufgaben-/Modell-/Materialversion, lokale Versuch-ID | Eindeutige Zuordnung; keine Vermischung von Varianten oder alten Quellenfassungen                                               |
| Aktiver Bereich/Profil, Ansicht, Aufgabenposition je bearbeitetem Weg                      | Sichtbar dieselbe Stelle wieder öffnen                                                                                          |
| Aktuelle Rohantworten mit semantischen IDs, Zahlen und erforderlichen eigenen Texten       | Tatsächliche Bearbeitung wiederherstellen, freie Texte nicht durch Abschlussflags ersetzen                                      |
| Entwurf/Abgabe/erklärte Bearbeitung, Antwortform, sachliche Fehlversuche                   | Noch nicht abgegebene Texte nicht als bestätigt anzeigen; passenden Weiterweg erhalten                                          |
| Standardgerüst, höchste geöffnete Hilfe, Beispiel gezeigt/genutzt, bewusste Übernahme      | Eigenleistung und Unterstützung ehrlich unterscheiden                                                                           |
| Kriterien angesehen, danach überarbeitet, mündliche Selbstmeldung                          | Selbstkontrolle nicht als externe Fachbewertung darstellen                                                                      |
| Fachprüfungsumfang und gegebenenfalls ausdrücklich menschlich festgestellter Status        | Geprüfte Auswahl von ungeprüfter eigener Erklärung unterscheiden; hier existiert kein automatisch menschlich bestätigter Status |
| Für die Wiederaufnahme erforderliche Erkundungs-/Maßnahmenwahl und historische Zähler      | Aufgabenbedingungen und begrenzte Verlaufshilfe erhalten                                                                        |

Nicht übertragen werden müssten ausgeschriebene Aufgabentexte, Optionen, Hilfen, Kriterien, Quellenblöcke, Diagramm-HTML/SVG, berechnete Modellfolgen und ausgeschriebene Rückmeldungen. Sie sind anhand der Versionen/IDs aus dem unveränderten Inhalt rekonstruierbar. Automatische Sachbewertung kann aus den Rohantworten neu berechnet werden; Herkunft/Abgabestatus darf dabei nicht verloren gehen. Die bis zu 40 historischen Rohabgaben sind für eine reine Fortsetzung nicht zwingend, aber nicht ohne gesonderte Entscheidung als Prüfungsarchiv zu versprechen oder zu löschen. Ein künftiger Transport müsste den gewählten Umfang ausdrücklich dokumentieren und testen.

Keine solchen Felder an ein LMS übertragen, kein Codec/Adapter implementiert. Freie Texte benötigen vor späterem Transport eine eigene schulische Entscheidung. Das 64.000-Zeichen-Budget ist weiterhin keine zugesicherte Obergrenze für vollständige Altstände und zukünftige Varianten. Aktuelle konkrete Messszenarien stehen im Korrekturbericht; sie sind keine SCORM-Konformitätsprüfung.

## Paket B / Gate 2

Der optionale Umschlag bleibt Version 1. Neue Themen `a/n/d/e` haben eigene modell-/materialgebundene Identitäten; `c` und `s1` bleiben unverändert. Empfehlungslinks nutzen denselben geprüften Vertrag auch für die neuen Themen. Das Lesen prüft weiterhin jeden Aufgabenversuch einzeln.

Planbezogene Themenabgaben speichern zusätzlich den damaligen Plan und den sichtbaren Wortlaut der Antwortbausteine. Späteres Neubearbeiten verändert diese historische Zuordnung nicht. Aktuelle abhängige Belege werden bei Planänderung zum Entwurf; ihre Bestätigung wird nicht auf den neuen Plan übertragen. Die 40er-Historienbegrenzung und die Zählung älterer Abgaben gelten unverändert.

## Gezielte Gate-2-Korrektur auf Basis 3c8b51b

Eine gültige offene Wahl wird durch Beispielübernahme nicht mehr verändert. Tatsächliche Änderungen laufen unabhängig vom Bedienweg durch dieselbe Invalidierung: Planwechsel betreffen die verbundenen Belege, Grenzen und Urteile; Ziel- oder Gewichtungswechsel die zugehörigen Urteile. Texte und frühere Abgaben bleiben erhalten. „Weiter“ prüft aktuelle Bereitschaft und Kontext statt eines alleinigen Abschlussflags.

Neue planbezogene Abgaben speichern neben `contextPlan` auch `contextGoal`. Bei Gewichtung und Urteil muss die jüngste Abgabe zum aktuellen Ziel passen. Altstände ohne diesen Zielkontext behalten ihre Antworten und Geschichte; ihre aktuelle Gewichtung beziehungsweise ihr Urteil muss erneut abgegeben werden. Das ist keine nachträgliche falsche Bewertung einer legitimen Entscheidung. Die angezeigte Hilfe erklärt eine bestehende legitime Wahl. Erst eine tatsächliche Ergänzung oder Ersetzung wird als neue Beispielnutzung erfasst; bloßes Ansehen beziehungsweise erneutes Übernehmen identischer gültiger Auswahlen schreibt die alte Eigenleistung nicht um.

Die zusätzliche AHR-Wirtschaftsaufgabe `economy.source-claim.v1` hat `taskVersion: 1` und eine neue vollständige Identität. Die früheren fünf Aufgaben behalten ihre Kennungen. Ein vollständig bearbeiteter alter Fünferstand enthält die neue Aufgabe nicht; sie beginnt leer. Keine automatische Fachbewertung ihres freien Textes, auch nach Kriterienaufruf.

Die aktuellen Größen und Wiederherstellungsprüfungen stehen im Gate-2-Korrekturbericht. Ein späteres kompaktes Transportformat müsste Plan-/Zielkontext und Hilfeherkunft bewahren, muss aber die daraus rekonstruierbaren langen Bausteintexte nicht wiederholt übertragen. Keine SCORM-Anbindung, kein LMS-Tracking und keine Datenübermittlung wurden ergänzt.

## Paket B – alle 52 Varianten

Alle 13 Bereiche besitzen jetzt Aufgaben für alle vier Profile. Die vorhandenen Identitäten bleiben erhalten. Die frühen `s1`-Aufgaben werden durch neue Kennungen ergänzt; ihr alter Abschluss erledigt nicht die ganze neue Episode. Neue `s2`–`s6`, `o` und `r` sind eigenständige Bereiche. Frühere unprofilierte Episoden, Themen und geographische Ergebnisse werden weiterhin separat gelesen und erreichbar gehalten, niemals als neue Profilnachweise importiert.

Neue abhängige Episodenaufgaben tragen `dependsOn` und einen aus den tatsächlichen Rohantworten erzeugten `contextKey`. Die jüngste Abgabe muss zum aktuellen Kontext passen. Planänderungen invalidieren aktuelle abhängige Belege/Urteile, nicht historische Abgaben. Historische Bausteine behalten ihre damaligen ausgeschriebenen Beschriftungen und ihren Kontext. Zur Wiederherstellung ihrer Sachprüfung wird der damalige Kontext aufgelöst. Neue Erkundungen werden als `simulationSelection` und begrenzte `explored`-Liste im jeweiligen Aufgabenversuch gespeichert. Materialwahl ist keine Antwortübernahme und kein Kompetenznachweis.

Geldpläne verwenden semantische Betragskennungen Auszahlung–Rücklage–Fortbildung. Die vorhandene Budgetfunktion begrenzt +20/−20. Ein zweiter Vergleichsplan ist getrennt gespeichert. Freie eigene Erklärungen bleiben ungeprüft; Beispielanzeige und tatsächliche Nutzung bleiben unabhängig. Die bisherigen Regeln für 40 jüngste Abgaben, ältere Zähler, abgeschnittene überlange Texte, beschädigte optionale Daten und Speicherwarnungen bleiben bestehen.

Ein späteres kompaktes Wiederaufnahmeformat braucht außerdem diese Kontextabhängigkeiten, nötige Erkundungen, aktuelle Betragskennungen und getrennte Vergleichspläne. Aus Version/ID/Antwort rekonstruierbare Texte, Optionen, Grafiken, Quellen und Feedback müssen nicht wiederholt übertragen werden. Vollständige freie Texte und Historien dürfen nicht stillschweigend weggelassen und trotzdem vollständige Wiederherstellung versprochen werden. Die neuen Messungen übersteigen weiterhin 64.000 Zeichen. Kein SCORM-Codec, keine API oder LMS-Übertragung implementiert.
