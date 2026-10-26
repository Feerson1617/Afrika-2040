export const topicIds = [
  'image',
  'nature',
  'population',
  'economy',
  'future',
] as const;
export type TopicId = (typeof topicIds)[number];
export type Plan = 'cool' | 'shade';
export interface Field {
  id: string;
  label: string;
  options?: readonly (readonly [string, string])[];
  expected: string;
  explanation: string;
}
export interface Check {
  title: string;
  instruction: string;
  fields: Field[];
  hints: [string, string];
}
export interface Topic {
  title: string;
  question: string;
  terms: string;
  checks: [Check, Check];
  prompts: [string, string, string];
  example: [string, string, string];
  deeper: string;
}
const choose = (
  id: string,
  label: string,
  expected: string,
  explanation: string,
  options: Field['options'],
): Field => ({ id, label, expected, explanation, options });
const number = (
  id: string,
  label: string,
  expected: string,
  explanation: string,
): Field => ({ id, label, expected, explanation });
export const populationModel = {
  start: 1000,
  births: 48,
  deaths: 18,
  arrivals: 30,
  departures: 40,
};
export function populationBalance(m: typeof populationModel) {
  const natural = m.births - m.deaths,
    migration = m.arrivals - m.departures;
  return {
    natural,
    migration,
    change: natural + migration,
    end: m.start + natural + migration,
  };
}
export const populationData = [
  [2000, 19637087],
  [2010, 25474995],
  [2020, 31887809],
  [2024, 34427414],
] as const;
export const economyData = [
  { year: 2019, electricity: 83.5, gdp: 6.5077747939152 },
  { year: 2020, electricity: 85.4, gdp: 0.513941670628171 },
  { year: 2021, electricity: 86.3, gdp: 5.07646643533542 },
  { year: 2022, electricity: 85.1, gdp: 3.80484978178042 },
  { year: 2023, electricity: 89.5, gdp: 3.14009100080186 },
] as const;
export const rainRegions = [
  { name: 'Tanger-Tétouan-Al Hoceima', mm: 634.1 },
  { name: 'Souss-Massa', mm: 205.15 },
] as const;
export const seasons = [
  {
    name: 'Nordghana',
    wet: [5, 6, 7, 8, 9],
    detail:
      'Savannenraum: ganzjährig warm. Eine Regenzeit, dazwischen eine längere trockenere Zeit. Bericht 2021, S. 4.',
  },
  {
    name: 'Nordwestmarokko',
    wet: [10, 11, 12, 1, 2, 3, 4],
    detail:
      'Winterregenraum: milde, feuchte Winter; heiße, trockene Sommer. Bericht 2025, S. 3–4.',
  },
] as const;
export const plans = {
  cool: {
    name: 'Gemeinsamer Kühlraum',
    goal: 'loss',
    investment: 80,
    running: 12,
    stands: 30,
    benefit: 'Kühlung kann Verderb empfindlicher Lebensmittel verringern.',
    limit: 'Nur 30 Stände haben Zugang; Strom und Wartung sind nötig.',
    ecology: 'Energiebedarf sowie spätere Reparatur und Entsorgung bleiben.',
    unknown: 'Wer übernimmt Wartung und Stromkosten bei einem Ausfall?',
  },
  shade: {
    name: 'Schattendächer und Mehrwegkisten',
    goal: 'access',
    investment: 30,
    running: 3,
    stands: 60,
    benefit: '60 Stände können die Dächer und Kisten nutzen.',
    limit: 'Schatten ersetzt keine Kühlung empfindlicher Lebensmittel.',
    ecology:
      'Kein Strom zum Kühlen; Material, Reinigung und Ersatz bleiben nötig.',
    unknown: 'Wie gut schützen die Dächer die Lebensmittel in heißen Wochen?',
  },
} as const;
export const goals = [
  ['loss', 'Verderb empfindlicher Lebensmittel verringern'],
  ['access', 'Möglichst viele Stände erreichen'],
] as const;
export const topics: Record<TopicId, Topic> = {
  image: {
    title: 'A · Unser Afrikabild',
    question: 'Was zeigen Bilder – und was fehlt?',
    terms:
      'Ausschnitt: Ein Bild zeigt nur einen Teil. Perspektive: Von wo und mit welchem Blick etwas gezeigt wird. Beleg: Eine Information, die eine bestimmte Aussage stützt.',
    checks: [
      {
        title: 'Zwei echte Ausschnitte prüfen',
        instruction:
          'Betrachte beide Fotos. Trenne sichtbare Details von Vermutungen.',
        fields: [
          choose(
            'detail',
            'Was ist auf dem Marktfoto tatsächlich zu sehen?',
            'stalls',
            'Das Tor und die Verkaufsstände sind im Foto zu sehen. Die Einkommen der Menschen sieht man nicht.',
            [
              ['wealth', 'Alle Menschen in Ghana sind wohlhabend.'],
              ['stalls', 'Hinter einem Tor liegen Verkaufsstände.'],
              ['empty', 'Der ganze Kontinent ist unbewohnt.'],
            ],
          ),
          choose(
            'origin',
            'Wer hat das Marktfoto aufgenommen?',
            'jbdodane',
            'Die Quellenangabe nennt jbdodane als Fotografen des Marktbildes von 2013. Die Projektredaktion hat das Foto für diese Aufgabe ausgewählt.',
            [
              ['project', 'Die Projektredaktion Afrika 2040'],
              ['jbdodane', 'jbdodane'],
              ['dasupremo', 'daSupremo'],
            ],
          ),
          choose(
            'scope',
            'Was belegt der Baumkronenweg?',
            'place',
            'Das Foto zeigt einen Weg zwischen Bäumen im Kakum-Nationalpark. Es zeigt nicht alle Landschaften Afrikas.',
            [
              ['all', 'Afrika besteht überall aus demselben Wald.'],
              ['place', 'An diesem Ort verläuft ein Weg zwischen Bäumen.'],
              ['income', 'Alle Menschen dort verdienen am Tourismus.'],
            ],
          ),
        ],
        hints: [
          'Suche ein Detail, das du im Foto zeigen kannst.',
          'Ort und Datum begrenzen die Aussage. Einkommen und ganz Afrika sind auf keinem der Fotos zu sehen.',
        ],
      },
      {
        title: 'Eine Überschrift hinterfragen',
        instruction:
          'Für diese Übung erfundene Überschrift: „Afrika ist nur unberührte Natur.“ Prüfe sie mit beiden Fotos.',
        fields: [
          choose(
            'counter',
            'Welcher Beleg widerspricht „nur unberührte Natur“?',
            'built',
            'Verkaufsstände und der gebaute Baumkronenweg zeigen menschliche Nutzung an diesen Orten.',
            [
              ['beautiful', 'Die Bilder sehen schön aus.'],
              ['built', 'Marktstände und ein gebauter Weg sind sichtbar.'],
              ['date', 'Beide Fotos sind aus demselben Jahr.'],
            ],
          ),
          choose(
            'missing',
            'Was bleibt mit diesen Fotos offen?',
            'life',
            'Zwei ausgewählte Fotos zeigen nicht die Lebensbedingungen aller Menschen. Auch ein freundliches Bild ist nur ein Ausschnitt.',
            [
              ['life', 'Wie unterschiedliche Menschen heute leben.'],
              ['trees', 'Ob auf dem zweiten Foto Bäume stehen.'],
              ['gate', 'Ob das erste Foto ein Tor zeigt.'],
            ],
          ),
        ],
        hints: [
          'Welches Wort der Überschrift macht aus einem Ausschnitt eine pauschale Behauptung?',
          '„Nur“ schließt andere Nutzungen aus. Suche etwas Gebautes. Frage danach, was die Auswahl nicht zeigt.',
        ],
      },
    ],
    prompts: [
      'Überarbeite deine erste Vorstellung: Nenne ein konkretes Detail aus einem der Fotos.',
      'Erkläre kurz, wie der zweite Beleg deine Aussage ergänzt oder begrenzt.',
      'Eine Schulzeitung in Deutschland zeigt nur das Waldfoto. Welche Ergänzung würdest du empfehlen – und warum?',
    ],
    example: [
      'Auf dem Foto aus Kumasi sehe ich Verkaufsstände. Dieser Ort wird von Menschen genutzt.',
      'Auch der Weg im Kakum-Nationalpark ist gebaut. Zwei Orte stehen aber nicht für ganz Afrika.',
      'Ich würde ein weiteres Bild mit Ort und Datum ergänzen, etwa den Markt. Auch diese Auswahl zeigt nicht alle Lebensbedingungen.',
    ],
    deeper:
      'Formuliere zwei unterschiedliche, aber sachlich haltbare Überschriften zum selben Foto. Welche Information lenkt jeweils den Blick? Begründe deine Auswahl.',
  },
  nature: {
    title: 'B · Natur und Nutzung',
    question: 'Wann kommt Regen – und wofür reicht er?',
    terms:
      'Wetter: Zustand der Luft an einem Ort zu einer bestimmten Zeit. Klima: typische Verhältnisse über viele Jahre. Vegetation: Pflanzen eines Raumes. Niederschlag: Wasser aus Wolken, etwa Regen. 1 mm entspricht 1 Liter je Quadratmeter.',
    checks: [
      {
        title: 'Lage und Regenzeiten lesen',
        instruction:
          'Nutze Karte und Saisonkalender. Die Markierungen zeigen große Räume, keine Wetterstationen.',
        fields: [
          choose(
            'ghana-season',
            'In welcher Zeit liegt Nordghanas Regenzeit laut Material?',
            'may-sep',
            'Für Nordghana nennt der Bericht Mai bis September. Das ist keine Garantie für Regen an jedem Tag.',
            [
              ['oct-apr', 'Oktober bis April'],
              ['may-sep', 'Mai bis September'],
              ['all', 'Jeden Tag gleich viel Regen'],
            ],
          ),
          choose(
            'morocco-season',
            'Wann regnet es im nordwestlichen Marokko überwiegend?',
            'oct-apr',
            'Der nordwestliche Winterregenraum erhält überwiegend zwischen Oktober und April Regen. Die Sommer sind trockener.',
            [
              ['all', 'Jeden Tag gleich viel Regen'],
              ['may-sep', 'Mai bis September'],
              ['oct-apr', 'Oktober bis April'],
            ],
          ),
          choose(
            'location',
            'Welcher untersuchte Raum liegt weiter nördlich?',
            'morocco',
            'Nordwestmarokko liegt weiter nördlich als Nordghana. Beide liegen nördlich des Äquators.',
            [
              ['ghana', 'Nordghana'],
              ['morocco', 'Nordwestmarokko'],
            ],
          ),
        ],
        hints: [
          'Lies die Monatsnamen und die Lage zum Äquator.',
          'Regenzeit ist ein jahreszeitliches Muster. In Nordghana liegt sie im nördlichen Sommer, in Nordwestmarokko vor allem im Winterhalbjahr.',
        ],
      },
      {
        title: 'Regen ist noch kein Wasservorrat',
        instruction:
          'Vergleiche die beiden regionalen Jahresmittel. Überlege danach, welche Grenze eine Anpassung hat.',
        fields: [
          choose(
            'rain',
            'Welche Region hat 1991–2020 das höhere Jahresmittel?',
            'tanger',
            '634,10 mm in Tanger-Tétouan-Al Hoceima sind mehr als 205,15 mm in Souss-Massa. Das sind regionale Mittel für denselben Zeitraum.',
            [
              ['souss', 'Souss-Massa'],
              ['tanger', 'Tanger-Tétouan-Al Hoceima'],
            ],
          ),
          choose(
            'adapt',
            'Welche Erklärung zu einem Regenwasserspeicher ist schlüssig?',
            'limited',
            'Ein Speicher kann Regen für trockenere Zeiten zurückhalten. Größe, Wasserqualität, Zugang und Verdunstung begrenzen die Nutzung.',
            [
              ['guarantee', 'Ein Speicher garantiert unbegrenzt Wasser.'],
              ['poverty', 'Wenig Regen führt überall zwangsläufig zu Armut.'],
              [
                'limited',
                'Er überbrückt trockene Zeiten, aber sein Vorrat ist begrenzt.',
              ],
            ],
          ),
        ],
        hints: [
          'Vergleiche erst Einheit und Zeitraum. Trenne danach Regenmenge und nutzbares Wasser.',
          'Ein Teil verdunstet, versickert oder fließt ab. Technik kann helfen, ersetzt aber weder Zugang noch endlichen Vorrat.',
        ],
      },
    ],
    prompts: [
      'Erkläre an Nordghana oder Nordwestmarokko, wann Regen gesammelt werden könnte. Nenne Monate und Raum.',
      'Begründe eine passende Nutzung oder Anpassung. Nenne eine Grenze, die trotz der Maßnahme bleibt.',
      'Neue Bedingung: Der Speicher ist kleiner als geplant. Was änderst du an deinem Vorschlag – und warum?',
    ],
    example: [
      'In Nordghana könnte Regen vor allem von Mai bis September gesammelt werden.',
      'Ein Speicher kann Pflanzen in trockeneren Zeiten versorgen. Sein Vorrat und der Zugang bleiben begrenzt; Niederschlag ist nicht gleich Trinkwasser.',
      'Bei einem kleineren Speicher würde ich die Nutzung begrenzen und zuerst den Bedarf klären. Technik allein garantiert keine sichere Versorgung.',
    ],
    deeper:
      'Zwei Orte haben dieselbe Jahresregenmenge, aber verschieden lange Trockenzeiten. Warum kann die Nutzbarkeit trotzdem unterschiedlich sein? Welche weiteren Angaben brauchst du?',
  },
  population: {
    title: 'C · Bevölkerung verändert sich',
    question: 'Woher kommt Veränderung – und was folgt daraus?',
    terms:
      'Natürliche Veränderung: Geburten minus Sterbefälle. Wanderungssaldo: Zuzug minus Fortzug. Schätzung: statistisch ermittelter Wert. Projektion: mögliche Zukunft unter Annahmen. Urbanisierung: wachsender Anteil der Bevölkerung in Städten; nicht gleich jeder Bevölkerungszunahme.',
    checks: [
      {
        title: 'Vier Größen selbst verrechnen',
        instruction:
          'Erfundenes Rechenmodell: ein Ort, ein Jahr. Alle Zahlen sind Personen, keine Prozentwerte.',
        fields: [
          number(
            'natural',
            'Natürliche Veränderung (Personen)',
            '30',
            '48 Geburten minus 18 Sterbefälle ergeben +30 Personen.',
          ),
          number(
            'migration',
            'Wanderungssaldo (Personen, mit Minus falls nötig)',
            '-10',
            '30 Zuzüge minus 40 Fortzüge ergeben −10 Personen.',
          ),
          number(
            'end',
            'Bevölkerung am Jahresende (Personen)',
            '1020',
            '1.000 + 30 − 10 = 1.020 Personen. Die Zunahme ist 20, nicht 1.020.',
          ),
        ],
        hints: [
          'Berechne natürliche Veränderung und Wanderung getrennt.',
          'Zuzug kommt hinzu, Fortzug geht ab. Addiere beide Teiländerungen zum Anfangsbestand von 1.000.',
        ],
      },
      {
        title: 'Eine echte Entwicklung auswerten',
        instruction:
          'Lies die Ghana-Reihe mit Quelle, Jahren und Einheit. Die Modellrechnung erklärt diese Landesreihe nicht.',
        fields: [
          choose(
            'trend',
            'Welche Beschreibung passt zu den gezeigten Jahren?',
            'increase',
            'Die geschätzte Bevölkerung steigt zwischen 2000 und 2024 von rund 19,6 auf rund 34,4 Millionen. Dazwischen liegen unterschiedlich lange Zeitabstände.',
            [
              ['decrease', '2024 leben dort weniger Menschen als 2000.'],
              [
                'increase',
                'Von 2000 bis 2024 steigt die geschätzte Bevölkerung.',
              ],
              ['future', '2040 leben dort sicher genau 34,4 Millionen.'],
            ],
          ),
          choose(
            'status',
            'Welche Datenart zeigt diese Reihe?',
            'estimate',
            'Die WDI-Reihe enthält historische Schätzungen zur Jahresmitte. Eine Volkszählung ist eine Beobachtungsgrundlage; eine Projektion betrifft eine mögliche Zukunft.',
            [
              ['census', 'In jedem Jahr wurden alle Personen direkt gezählt.'],
              ['forecast', 'Eine sichere Zukunftsvorhersage'],
              ['estimate', 'Historische statistische Schätzungen'],
            ],
          ),
          choose(
            'condition',
            'Welche Folge ist fachlich begründet?',
            'conditional',
            'Mehr Menschen können mehr Nachfrage und Arbeitskräftepotenzial bedeuten. Ausbildung, Arbeitsplätze und Infrastruktur beeinflussen, ob daraus Chancen entstehen.',
            [
              ['poverty', 'Mehr Menschen verursachen immer Armut.'],
              [
                'conditional',
                'Mit Ausbildung und Arbeitsplätzen können neue Chancen entstehen.',
              ],
              ['migration', 'Jede Zunahme beweist Zuwanderung.'],
            ],
          ),
        ],
        hints: [
          'Unterscheide Beschreibung, Datenart und mögliche Folge.',
          'Eine Kurve zeigt die Veränderung, aber nicht allein ihre Ursachen. „Immer“ und „sicher“ sind hier nicht durch die Daten belegt.',
        ],
      },
    ],
    prompts: [
      'Neue Modellzahlen, ein Jahr: Anfang 800, Geburten 28, Sterbefälle 12, Zuzug 5, Fortzug 17. Berechne die beiden Teiländerungen und den Endbestand.',
      'Beschreibe Ghanas Entwicklung mit zwei Jahren und Werten. Sage dazu, um welche Datenart es sich handelt.',
      'Nenne eine Chance und eine Herausforderung bei wachsender Bevölkerung. Erkläre jeweils eine Bedingung, von der sie abhängen.',
    ],
    example: [
      'Natürliche Veränderung: 28 − 12 = +16. Wanderung: 5 − 17 = −12. Ende: 800 + 16 − 12 = 804 Personen.',
      'Die historischen Schätzungen für Ghana steigen von rund 19,6 Millionen im Jahr 2000 auf rund 34,4 Millionen im Jahr 2024.',
      'Wenn Ausbildung und Arbeitsplätze vorhanden sind, können mehr Menschen wirtschaftlich tätig werden. Wenn die Infrastruktur nicht mitwächst, können etwa Schulplätze knapp werden.',
    ],
    deeper:
      'Kann eine Bevölkerung trotz mehr Geburten als Sterbefällen sinken? Erfinde passende absolute Zahlen für dasselbe Jahr und begründe. Die Zahl der Stadtbewohner allein beweist noch keinen wachsenden Stadtbevölkerungsanteil.',
  },
  economy: {
    title: 'D · Wirtschaft und Teilhabe',
    question: 'Was wächst – und wer profitiert?',
    terms:
      'Rohstoff: Ausgangsmaterial, etwa Kakaobohnen. Verarbeitung: daraus entstehen andere Produkte. Wertschöpfung: neu geschaffener wirtschaftlicher Wert. Einnahmen sind nicht Überschuss. BIP: gesamtwirtschaftliche Wertschöpfung; hier preisbereinigte Veränderung zum Vorjahr. Investition: gesonderte einmalige Anschaffung.',
    checks: [
      {
        title: 'Betrieb und Land auseinanderhalten',
        instruction:
          'Neue erfundene Betriebsrechnung: A nimmt 200 GE ein und zahlt laufend 120 GE. B nimmt 240 GE ein und zahlt laufend 180 GE. B investiert außerdem einmalig 40 GE.',
        fields: [
          number(
            'surplus-a',
            'Laufender Überschuss A (GE)',
            '80',
            '200 − 120 = 80 GE laufender Überschuss bei A.',
          ),
          number(
            'surplus-b',
            'Laufender Überschuss B (GE)',
            '60',
            '240 − 180 = 60 GE laufender Überschuss bei B. Höhere Einnahmen bedeuten hier keinen höheren Überschuss.',
          ),
          number(
            'first',
            'Bei B nach einmaliger Investition verbleibend (GE)',
            '20',
            '60 − 40 = 20 GE verbleiben in der ersten Runde dieses vereinfachten Modells. Die Investition fällt nicht automatisch jede Runde an.',
          ),
        ],
        hints: [
          'Ziehe zuerst nur die laufenden Ausgaben von den Einnahmen ab.',
          'Trenne den laufenden Überschuss von der einmaligen Anschaffung. Keine dieser Betriebszahlen ist Ghanas BIP.',
        ],
      },
      {
        title: 'Reale Daten mit Grenzen lesen',
        instruction:
          'Untersuche die Ghana-Tabelle. Verbinde zwei Bedingungen, ohne aus dem gemeinsamen Auftreten eine bewiesene Ursache zu machen.',
        fields: [
          choose(
            'access',
            'Was sagt der Stromwert 89,5 für 2023?',
            'share',
            '89,5 Prozent der Bevölkerung haben Zugang zu Elektrizität. Der Wert misst weder ständige Verfügbarkeit noch Bezahlbarkeit.',
            [
              ['money', 'Jeder Betrieb verdient 89,5 GE.'],
              [
                'share',
                '89,5 Prozent der Bevölkerung haben Zugang zu Elektrizität.',
              ],
              ['reliable', 'Alle haben jederzeit kostenlosen Strom.'],
            ],
          ),
          choose(
            'growth',
            'Was bedeutet 3,1 Prozent BIP-Wachstum 2023?',
            'real',
            'Das preisbereinigte BIP wächst gegenüber 2022 um rund 3,1 Prozent. Verteilung und individuelle Lebensbedingungen sind damit nicht beschrieben.',
            [
              ['everyone', 'Jeder Haushalt wird um 3,1 Prozent reicher.'],
              ['real', 'Das preisbereinigte BIP steigt gegenüber dem Vorjahr.'],
              ['profit', 'Der Modellbetrieb macht 3,1 GE Überschuss.'],
            ],
          ),
          choose(
            'conditions',
            'Welche Verbindung ist plausibel und vorsichtig?',
            'together',
            'Zuverlässiger Strom ermöglicht Maschinenbetrieb; passende Kenntnisse helfen bei Verarbeitung und Absatz. Das ist eine begründete Bedingungskette, kein aus dieser Tabelle bewiesener Erfolg.',
            [
              ['only', 'Eine Maschine garantiert erfolgreichen Verkauf.'],
              ['cause', 'Die Tabelle beweist: Nur Strom verursacht Wachstum.'],
              [
                'together',
                'Stromversorgung und Kenntnisse können gemeinsam die Verarbeitung unterstützen.',
              ],
            ],
          ),
        ],
        hints: [
          'Lies jeweils Bezugsgröße und Einheit. Unterscheide Voraussetzungen und nachgewiesene Wirkungen.',
          'Stromzugang ist ein Bevölkerungsanteil. Das BIP betrifft ein Land. Ob alle profitieren, braucht zusätzliche Angaben, etwa Einkommen und Zugang.',
        ],
      },
    ],
    prompts: [
      'Beschreibe eine Veränderung des Elektrizitätszugangs in Ghana mit zwei Jahren und Werten. Benenne die Einheit und eine Aussagegrenze.',
      'Erkläre, wie zwei Bedingungen bei der Kakaoverarbeitung zusammenwirken können. Nutze den GEPA-Bericht und die Information zur Energieversorgung.',
      'Neue Situation: Ein Betrieb erhält höhere Einnahmen, aber seine laufenden Kosten steigen noch stärker. Was prüfst du, bevor du von Erfolg sprichst? Was fehlt für ein Urteil über alle Menschen im Land?',
    ],
    example: [
      'Von 2022 bis 2023 steigt der Zugang von 85,1 auf 89,5 Prozent der Bevölkerung. Das sind 4,4 Prozentpunkte. Über Stromausfälle sagt dieser Anteil nichts.',
      'Zuverlässiger Strom kann Maschinenbetrieb ermöglichen. Kenntnisse über Verarbeitung, Preisgestaltung und Transport können helfen, Produkte anzubieten. Keine dieser Bedingungen garantiert Verkaufserfolg.',
      'Ich vergleiche Einnahmen und laufende Ausgaben und trenne eine einmalige Investition. Für das Land fehlen mir Angaben zu Arbeitsbedingungen und zur Verteilung der Einkommen.',
    ],
    deeper:
      'Ein Sektoranteil sinkt von 20 auf 15 Prozent. Kann seine absolute Wertschöpfung trotzdem steigen? Überlege, welche Gesamtgröße fehlt. Höhere Geldwerte allein können auch durch höhere Preise entstehen.',
  },
  future: {
    title: 'E · Eine Zukunft abwägen',
    question: 'Was empfiehlst du für einen Markt in Kumasi?',
    terms:
      'Sozial: Folgen für Menschen und ihren Zugang. Wirtschaftlich: Kosten, Einnahmen und Arbeit. Ökologisch: Folgen für Umwelt und Ressourcen. Zielkonflikt: Nicht alle Ziele werden gleich gut erfüllt. Unsicherheit: Eine wichtige Information fehlt oder ist noch nicht gesichert.',
    checks: [
      {
        title: 'Beide Angebote untersuchen',
        instruction:
          'Der Ort ist real. Beide Angebote, alle GE-Werte und Standzahlen sind erfunden. Sie dienen nur dem Vergleich.',
        fields: [
          choose(
            'reach',
            'Welches Angebot erreicht im Modell mehr Stände?',
            'shade',
            'Dächer und Kisten erreichen 60 Stände, der Kühlraum 30. Das ist eine soziale Zugangsfolge, keine Aussage über alle Märkte Ghanas.',
            [
              ['cool', 'Gemeinsamer Kühlraum'],
              ['shade', 'Schattendächer und Mehrwegkisten'],
            ],
          ),
          choose(
            'environment',
            'Welche ökologische Grenze bleibt beim Kühlraum?',
            'energy',
            'Auch Kühlung benötigt Energie und Material. Reparatur und Entsorgung bleiben Aufgaben. Nachhaltig heißt nicht in allem folgenlos.',
            [
              ['none', 'Kühlung hat überhaupt keine Umweltfolgen.'],
              ['energy', 'Energiebedarf, Reparatur und Entsorgung bleiben.'],
              ['access', 'Alle 60 Stände nutzen den Kühlraum.'],
            ],
          ),
          choose(
            'cost',
            'Welche Kosten treten wiederholt auf?',
            'running',
            '12 GE beim Kühlraum und 3 GE bei Dächern/Kisten sind laufende Modellkosten pro Monat. 80 bzw. 30 GE sind einmalige Investitionen.',
            [
              ['investment', 'Immer wieder 80 bzw. 30 GE Anschaffung'],
              ['running', 'Monatlich 12 bzw. 3 GE laufende Kosten'],
            ],
          ),
        ],
        hints: [
          'Vergleiche beide Angebote nach Zugang, Kosten und Umwelt.',
          'Eine Anschaffung wird einmal bezahlt. Laufende Kosten wiederholen sich. Ein Vorteil in einer Dimension löst nicht alle anderen Probleme.',
        ],
      },
      {
        title: 'Deinen Vorschlag begründen',
        instruction:
          'Wähle dein Ziel und deinen Vorschlag. Suche danach einen passenden Beleg und eine Grenze. Beide Vorschläge sind begründbar.',
        fields: [],
        hints: [
          'Welcher Beleg gehört zu deinem Vorschlag? Welche Grenze bleibt genau dabei?',
          'Wenn dein Ziel eher zur anderen Maßnahme passt, passe das Ziel bewusst an oder nenne die Folge, die du höher gewichtest.',
        ],
      },
    ],
    prompts: [
      'Formuliere deine Empfehlung in eigenen Worten. Nenne Ziel, passenden Beleg und eine Grenze deines Vorschlags.',
      'Verbinde eine soziale, wirtschaftliche und ökologische Folge. Welche Folge wiegt für dich stärker – und welchen Nachteil nimmst du in Kauf?',
      'Neue Bedingung: Für beide Angebote ist die langfristige Wartung ungeklärt. Welche Information brauchst du? Würdest du deine Entscheidung ändern oder beibehalten – und warum?',
    ],
    example: ['', '', ''],
    deeper:
      'Erkundige dich gedanklich bei einer Person, die keinen Zugang erhält. Welche zusätzliche Folge könnte deine Gewichtung verändern? Eine andere Priorität ist legitim; ein falscher Beleg wird dadurch nicht richtig.',
  },
};
export function decisionFields(plan: Plan): Field[] {
  return [
    choose(
      'evidence',
      'Welcher Beleg stützt deinen Vorschlag?',
      plan,
      plans[plan].benefit,
      [
        ['shade', plans.shade.benefit],
        ['cool', plans.cool.benefit],
        ['guarantee', 'Der Vorschlag garantiert hohen Gewinn für alle.'],
      ],
    ),
    choose(
      'limit',
      'Welche Grenze betrifft deinen Vorschlag?',
      plan,
      plans[plan].limit,
      [
        ['cool', plans.cool.limit],
        ['none', 'Es bleibt kein Nachteil.'],
        ['shade', plans.shade.limit],
      ],
    ),
    choose(
      'unknown',
      'Welche offene Frage prüfst du zu deinem Vorschlag?',
      plan,
      plans[plan].unknown,
      [
        ['shade', plans.shade.unknown],
        ['cool', plans.cool.unknown],
        ['irrelevant', 'Welche Lieblingsfarbe haben alle Beschäftigten?'],
      ],
    ),
  ];
}
