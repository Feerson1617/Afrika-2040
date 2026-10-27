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
      'Nordghana liegt in der Savanne. Es ist das ganze Jahr warm. Auf die Regenzeit folgt eine längere trockene Zeit. Quelle: Bericht 2021, S. 4.',
  },
  {
    name: 'Nordwestmarokko',
    wet: [10, 11, 12, 1, 2, 3, 4],
    detail:
      'In Nordwestmarokko regnet es vor allem im Winter. Die Winter sind mild und feucht. Die Sommer sind heiß und trocken. Quelle: Bericht 2025, S. 3–4.',
  },
] as const;
export const plans = {
  cool: {
    name: 'Gemeinsamer Kühlraum',
    goal: 'loss',
    investment: 80,
    running: 12,
    stands: 30,
    benefit:
      'Kühlung kann helfen: Empfindliche Lebensmittel werden weniger schnell schlecht.',
    limit:
      'Nur 30 Stände können den Kühlraum nutzen. Er braucht Strom. Er muss regelmäßig geprüft und gepflegt werden (Wartung).',
    ecology:
      'Der Kühlraum braucht Energie. Später muss man Teile reparieren und Abfälle entsorgen.',
    unknown:
      'Wer kümmert sich um die Wartung? Wer zahlt die Stromkosten bei einem Ausfall?',
  },
  shade: {
    name: 'Schattendächer und Mehrwegkisten',
    goal: 'access',
    investment: 30,
    running: 3,
    stands: 60,
    benefit: '60 Stände können die Dächer und Kisten nutzen.',
    limit: 'Schatten allein kühlt empfindliche Lebensmittel nicht genug.',
    ecology:
      'Zum Kühlen ist kein Strom nötig. Aber man braucht Material. Kisten und Dächer müssen gereinigt und bei Schäden ersetzt werden.',
    unknown: 'Wie gut schützen die Dächer die Lebensmittel in heißen Wochen?',
  },
} as const;
export const goals = [
  ['loss', 'Weniger Lebensmittel sollen schlecht werden'],
  ['access', 'Möglichst viele Stände sollen das Angebot nutzen'],
] as const;
export const topics: Record<TopicId, Topic> = {
  image: {
    title: 'A · Unser Afrikabild',
    question: 'Was zeigen Bilder – und was fehlt?',
    terms:
      'Ausschnitt: Ein Foto zeigt nur einen kleinen Teil der Welt.\nPerspektive: Von wo aus schauen wir? Was ist für uns wichtig?\nBeleg: Eine passende Angabe aus dem Material. Sie hilft, eine Aussage zu prüfen.',
    checks: [
      {
        title: 'Zwei echte Fotos prüfen',
        instruction:
          'Sieh dir beide Fotos an. Was siehst du wirklich? Was vermutest du nur?',
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
            'Das Marktfoto ist von jbdodane aus dem Jahr 2013. Das steht beim Foto. Das Team von Afrika 2040 hat es für diese Aufgabe ausgewählt.',
            [
              ['project', 'Das Team von Afrika 2040'],
              ['jbdodane', 'jbdodane'],
              ['dasupremo', 'daSupremo'],
            ],
          ),
          choose(
            'scope',
            'Was zeigt das Foto vom Weg zwischen den Baumkronen?',
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
          'Achte auf Ort und Datum. Ein Foto zeigt nur diesen Ort zu dieser Zeit. Es zeigt nicht, wie viel Menschen verdienen. Es zeigt auch nicht ganz Afrika.',
        ],
      },
      {
        title: 'Stimmt diese Überschrift?',
        instruction:
          'Diese Überschrift ist für die Übung erfunden: „Afrika ist nur unberührte Natur.“ Das bedeutet: Menschen hätten dort nichts verändert. Prüfe die Überschrift. Nutze beide Fotos.',
        fields: [
          choose(
            'counter',
            'Was auf den Fotos passt nicht zu „nur unberührte Natur“?',
            'built',
            'Menschen haben die Verkaufsstände und den Weg zwischen den Bäumen gebaut. Sie nutzen diese Orte.',
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
            'Zwei Fotos zeigen nicht, wie alle Menschen leben. Das gilt auch für schöne und freundliche Fotos.',
            [
              ['life', 'Wie unterschiedliche Menschen heute leben.'],
              ['trees', 'Ob auf dem zweiten Foto Bäume stehen.'],
              ['gate', 'Ob das erste Foto ein Tor zeigt.'],
            ],
          ),
        ],
        hints: [
          'Achte auf das Wort „nur“. Passt es zu beiden Fotos?',
          '„Nur Natur“ würde bedeuten: Dort gibt es nichts, was Menschen gebaut haben. Suche etwas Gebautes. Überlege dann: Was zeigen die beiden Fotos nicht?',
        ],
      },
    ],
    prompts: [
      'Lies deine erste Vorstellung noch einmal. Was würdest du jetzt ändern? Nenne dazu etwas, das du auf einem Foto siehst.',
      'Nutze jetzt das andere Foto. Was zeigt es zusätzlich? Was erfährst du durch die zwei Fotos trotzdem nicht?',
      'Eine Schulzeitung in Deutschland zeigt nur das Waldfoto. Was sollte sie zusätzlich zeigen? Begründe deinen Vorschlag.',
    ],
    example: [
      'Auf dem Foto aus Kumasi sehe ich Verkaufsstände. Dieser Ort wird von Menschen genutzt.',
      'Auch der Weg im Kakum-Nationalpark ist gebaut. Zwei Orte stehen aber nicht für ganz Afrika.',
      'Ich würde ein weiteres Bild mit Ort und Datum ergänzen, etwa den Markt. Auch diese Auswahl zeigt nicht alle Lebensbedingungen.',
    ],
    deeper:
      'Schreibe zwei verschiedene Überschriften für dasselbe Foto. Beide sollen zum Foto passen. Worauf macht jede Überschrift aufmerksam? Erkläre deine Auswahl.',
  },
  nature: {
    title: 'B · Natur und Nutzung',
    question: 'Wann kommt Regen – und wofür reicht er?',
    terms:
      'Wetter: Wie ist es jetzt an einem Ort? Zum Beispiel warm, kalt oder regnerisch.\nKlima: Wie ist das Wetter an einem Ort meist? Dafür betrachtet man viele Jahre.\nVegetation: die Pflanzen in einem Gebiet.\nNiederschlag: Wasser aus Wolken. Zum Beispiel Regen oder Schnee.\n1 mm Niederschlag: 1 Liter Wasser auf 1 Quadratmeter Fläche.',
    checks: [
      {
        title: 'Lage und Regenzeiten lesen',
        instruction:
          'Nutze die Karte und den Kalender der Regenzeiten. Die Punkte auf der Karte zeigen ungefähr, wo die Gebiete liegen.',
        fields: [
          choose(
            'ghana-season',
            'In welchen Monaten ist in Nordghana Regenzeit? Nutze den Kalender.',
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
            'In welchen Monaten regnet es in Nordwestmarokko am meisten?',
            'oct-apr',
            'In Nordwestmarokko regnet es vor allem von Oktober bis April. Die Sommer sind trockener.',
            [
              ['all', 'Jeden Tag gleich viel Regen'],
              ['may-sep', 'Mai bis September'],
              ['oct-apr', 'Oktober bis April'],
            ],
          ),
          choose(
            'location',
            'Welches der beiden Gebiete liegt weiter nördlich?',
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
          'Eine Regenzeit kehrt meist in ähnlichen Monaten wieder. In Nordghana regnet es vor allem von Mai bis September. In Nordwestmarokko regnet es vor allem von Oktober bis April.',
        ],
      },
      {
        title: 'Regen ist noch kein Wasservorrat',
        instruction:
          'Vergleiche die Regenmengen in den zwei Regionen. Überlege dann: Wie kann ein Wasserspeicher helfen? Welches Problem bleibt?',
        fields: [
          choose(
            'rain',
            'In welcher Region fiel von 1991 bis 2020 im Durchschnitt mehr Regen pro Jahr?',
            'tanger',
            'Tanger-Tétouan-Al Hoceima: 634,10 mm. Souss-Massa: 205,15 mm. Der erste Wert ist höher. Beide Werte sind Durchschnitte für die Jahre 1991–2020.',
            [
              ['souss', 'Souss-Massa'],
              ['tanger', 'Tanger-Tétouan-Al Hoceima'],
            ],
          ),
          choose(
            'adapt',
            'Welche Erklärung zu einem Regenwasserspeicher passt?',
            'limited',
            'Ein Speicher sammelt Regen für die trockene Zeit. Aber er hat nur begrenzt Platz. Wasser kann verdunsten oder verschmutzt sein. Nicht alle Menschen können den Speicher nutzen.',
            [
              ['guarantee', 'Mit einem Speicher gibt es immer genug Wasser.'],
              [
                'poverty',
                'Wo wenig Regen fällt, sind alle Menschen immer arm.',
              ],
              [
                'limited',
                'Er speichert Wasser für trockene Zeiten. Aber das Wasser kann ausgehen.',
              ],
            ],
          ),
        ],
        hints: [
          'Prüfe zuerst: Welche Einheit und welche Jahre stehen bei den Werten? Überlege dann: Können Menschen den ganzen Regen nutzen?',
          'Ein Teil des Regens verdunstet, geht in den Boden oder fließt weg. Technik kann helfen. Aber das Wasser bleibt begrenzt. Menschen müssen es auch erreichen können.',
        ],
      },
    ],
    prompts: [
      'Wähle Nordghana oder Nordwestmarokko. Wann könnte man dort Regen sammeln? Nenne das Gebiet und die Monate. Erkläre deine Antwort mit dem Kalender.',
      'Wie könnte man den Regen nutzen oder Wasser sparen? Begründe deine Idee. Welches Problem bleibt trotzdem?',
      'Jetzt ist der Speicher kleiner als geplant. Was änderst du an deiner Idee? Begründe deine Änderung.',
    ],
    example: [
      'In Nordghana könnte Regen vor allem von Mai bis September gesammelt werden.',
      'Ein Speicher kann Wasser für Pflanzen in der trockenen Zeit liefern. Aber das Wasser kann ausgehen. Nicht alle Menschen können es nutzen. Regenwasser ist nicht immer sauberes Trinkwasser.',
      'Bei einem kleineren Speicher würde ich zuerst fragen: Wie viel Wasser brauchen wir? Dann würde ich die Nutzung begrenzen. Technik allein sorgt nicht dafür, dass alle genug Wasser haben.',
    ],
    deeper:
      'An zwei Orten fällt im ganzen Jahr gleich viel Regen. An einem Ort ist die Trockenzeit länger. Warum können Menschen das Wasser trotzdem unterschiedlich gut nutzen? Welche Angaben fehlen dir?',
  },
  population: {
    title: 'C · Bevölkerung verändert sich',
    question: 'Woher kommt Veränderung – und was folgt daraus?',
    terms:
      'Natürliche Veränderung: Geburten minus Sterbefälle.\nZuzug: Menschen ziehen in einen Ort.\nFortzug: Menschen ziehen aus einem Ort weg.\nWanderungssaldo: Zuzug minus Fortzug. Der Wert kann negativ sein.\nSchätzung: Ein Wert wird aus vorhandenen Daten berechnet. Er kann später geändert werden.\nProjektion: eine mögliche Zukunft. Dafür nimmt man an, wie sich wichtige Bedingungen entwickeln.\nUrbanisierung: Ein größerer Anteil der Bevölkerung lebt in Städten. Mehr Menschen in einer Stadt allein beweisen das noch nicht.',
    checks: [
      {
        title: 'So verändert sich die Zahl der Menschen',
        instruction:
          'Die Zahlen sind für die Übung erfunden. Alle Zahlen gelten für denselben Ort und dasselbe Jahr. Rechne mit Personen, nicht mit Prozent.',
        fields: [
          number(
            'natural',
            'Natürliche Veränderung (Personen)',
            '30',
            '48 Geburten minus 18 Sterbefälle ergeben +30 Personen.',
          ),
          number(
            'migration',
            'Zuzug minus Fortzug: Wanderungssaldo (Personen). Nutze ein Minus, wenn nötig.',
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
          'Rechne zuerst: Geburten minus Sterbefälle. Rechne dann: Zuzug minus Fortzug.',
          'Am Anfang sind es 1.000 Menschen. Addiere die Veränderung durch Geburten und Sterbefälle. Addiere dann den Wanderungssaldo. Ein negativer Wert verringert die Zahl.',
        ],
      },
      {
        title: 'Eine echte Entwicklung auswerten',
        instruction:
          'Lies die Daten zu Ghana. Achte auf die Quelle, die Jahre und die Einheit. Die erfundenen Zahlen von eben erklären nicht die echten Daten zu Ghana.',
        fields: [
          choose(
            'trend',
            'Welche Beschreibung passt zu den gezeigten Jahren?',
            'increase',
            'Die Zahl der Menschen steigt: von etwa 19,6 Millionen im Jahr 2000 auf etwa 34,4 Millionen im Jahr 2024. Das sind Schätzungen. Zwischen den gezeigten Jahren liegen unterschiedlich viele Jahre.',
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
            'Was für Daten sind das?',
            'estimate',
            'Die Werte sind Schätzungen für die Mitte der genannten Jahre. Eine Volkszählung liefert wichtige Daten dafür. Eine Projektion würde eine mögliche Zukunft zeigen. Diese Werte zeigen die Vergangenheit.',
            [
              ['census', 'In jedem Jahr wurden alle Personen direkt gezählt.'],
              ['forecast', 'Eine sichere Zukunftsvorhersage'],
              ['estimate', 'Schätzungen für vergangene Jahre'],
            ],
          ),
          choose(
            'condition',
            'Welche mögliche Folge ist sinnvoll erklärt?',
            'conditional',
            'Mehr Menschen können mehr Waren kaufen. Mehr Menschen können auch arbeiten. Daraus können Chancen entstehen. Dafür braucht es zum Beispiel Ausbildung, Arbeitsplätze, Schulen und Verkehrswege.',
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
          'Prüfe nacheinander: Wie verändert sich die Zahl? Was für Daten sind das? Welche Folge ist möglich?',
          'Die Kurve zeigt die Veränderung. Sie erklärt nicht allein, warum sich die Zahl verändert. Die Daten beweisen keine Folgen, die „immer“ oder „sicher“ eintreten.',
        ],
      },
    ],
    prompts: [
      'Neue erfundene Zahlen für ein Jahr: Am Anfang 800 Menschen. Geburten: 28. Sterbefälle: 12. Zuzug: 5. Fortzug: 17. Rechne zuerst Geburten minus Sterbefälle. Rechne dann Zuzug minus Fortzug. Wie viele Menschen sind es am Jahresende?',
      'Wie verändert sich Ghanas Bevölkerung? Nenne zwei Jahre und die passenden Werte. Sage auch: Sind es Zählungen, Schätzungen oder Projektionen?',
      'Die Zahl der Menschen wächst. Nenne eine Chance und ein mögliches Problem. Erkläre bei beiden: Wovon hängt es ab, ob das eintritt?',
    ],
    example: [
      'Natürliche Veränderung: 28 − 12 = +16. Wanderung: 5 − 17 = −12. Ende: 800 + 16 − 12 = 804 Personen.',
      'Die Bevölkerung von Ghana steigt laut den Schätzungen: 2000 waren es etwa 19,6 Millionen Menschen. 2024 waren es etwa 34,4 Millionen Menschen.',
      'Wenn es Ausbildung und Arbeitsplätze gibt, können mehr Menschen arbeiten. Wenn keine neuen Schulen entstehen, können Schulplätze fehlen.',
    ],
    deeper:
      'Kann die Zahl der Menschen sinken, obwohl mehr Menschen geboren werden als sterben? Erfinde passende Zahlen für ein Jahr. Begründe deine Antwort. Denke auch weiter: In einer Stadt leben mehr Menschen als früher. Muss deshalb auch ihr Anteil an der Bevölkerung des Landes steigen?',
  },
  economy: {
    title: 'D · Wirtschaft: Wer hat etwas davon?',
    question: 'Was wächst – und wer hat etwas davon?',
    terms:
      'Rohstoff: Material, aus dem etwas hergestellt wird. Zum Beispiel Kakaobohnen.\nVerarbeitung: Aus einem Rohstoff entstehen andere Produkte.\nWertschöpfung: Bei der Arbeit entsteht neuer wirtschaftlicher Wert.\nEinnahmen: Geld, das ein Betrieb bekommt.\nÜberschuss: Einnahmen minus laufende Ausgaben.\nInvestition: Geld für eine Anschaffung. Hier wird sie einmal bezahlt.\nBIP (Bruttoinlandsprodukt): Ein Maß für den wirtschaftlichen Wert, der in einem Land in einem Jahr neu entsteht. Es ist kein Kontostand.\nPreisbereinigt: Der Einfluss veränderter Preise wird herausgerechnet. So lässt sich das BIP verschiedener Jahre besser vergleichen.',
    checks: [
      {
        title: 'Ein Betrieb ist nicht das ganze Land',
        instruction:
          'Die Rechnung ist erfunden. GE bedeutet Geldeinheiten. A bekommt 200 GE und hat laufende Ausgaben von 120 GE. B bekommt 240 GE und hat laufende Ausgaben von 180 GE. B zahlt zusätzlich einmalig 40 GE für eine Anschaffung.',
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
            'Wie viel bleibt bei B nach der einmaligen Anschaffung übrig? (GE)',
            '20',
            '60 − 40 = 20 GE bleiben in der ersten Runde übrig. Die 40 GE werden hier nur einmal bezahlt.',
          ),
        ],
        hints: [
          'Ziehe zuerst nur die laufenden Ausgaben von den Einnahmen ab.',
          'Rechne zuerst die laufenden Ausgaben ab. Ziehe erst danach die einmalige Anschaffung ab. Diese Zahlen gelten nur für den erfundenen Betrieb. Sie zeigen nicht Ghanas BIP.',
        ],
      },
      {
        title: 'Echte Daten lesen: Was sagen sie aus?',
        instruction:
          'Lies die Tabelle zu Ghana. Überlege: Was kann bei der Kakaoverarbeitung helfen? Die Tabelle allein beweist nicht, warum die Wirtschaft wächst.',
        fields: [
          choose(
            'access',
            'Was bedeutet der Stromwert 89,5 im Jahr 2023?',
            'share',
            '89,5 Prozent der Bevölkerung haben Zugang zu Strom. Der Wert sagt nicht, ob der Strom immer da ist. Er sagt auch nicht, ob alle ihn bezahlen können.',
            [
              ['money', 'Jeder Betrieb verdient 89,5 GE.'],
              ['share', '89,5 Prozent der Bevölkerung haben Zugang zu Strom.'],
              ['reliable', 'Alle haben jederzeit kostenlosen Strom.'],
            ],
          ),
          choose(
            'growth',
            'Was bedeutet 3,1 Prozent BIP-Wachstum 2023?',
            'real',
            'Das BIP steigt von 2022 bis 2023 um etwa 3,1 Prozent. Preisänderungen sind dabei herausgerechnet. Daraus wissen wir nicht, wie viel die einzelnen Menschen haben oder wie sie leben.',
            [
              ['everyone', 'Jeder Haushalt wird um 3,1 Prozent reicher.'],
              ['real', 'Das preisbereinigte BIP steigt gegenüber dem Vorjahr.'],
              ['profit', 'Der Modellbetrieb macht 3,1 GE Überschuss.'],
            ],
          ),
          choose(
            'conditions',
            'Welche Erklärung ist möglich, ohne zu viel zu behaupten?',
            'together',
            'Mit zuverlässigem Strom können Maschinen arbeiten. Wissen hilft bei der Verarbeitung und beim Verkauf. Beides kann zusammen helfen. Die Tabelle beweist aber keinen sicheren Erfolg.',
            [
              ['only', 'Eine Maschine garantiert erfolgreichen Verkauf.'],
              ['cause', 'Die Tabelle beweist: Nur Strom verursacht Wachstum.'],
              [
                'together',
                'Strom und Wissen können zusammen bei der Verarbeitung helfen.',
              ],
            ],
          ),
        ],
        hints: [
          'Prüfe: Worum geht es bei der Zahl? Welche Einheit gehört dazu? Was kann helfen? Was ist wirklich bewiesen?',
          'Stromzugang: Wie viel Prozent der Menschen haben Zugang zu Strom? BIP: Es geht um die Wirtschaft des ganzen Landes. Ob alle etwas davon haben, zeigen diese Zahlen nicht. Dafür fehlen zum Beispiel Angaben zum Einkommen.',
        ],
      },
    ],
    prompts: [
      'Wie verändert sich der Zugang zu Strom in Ghana? Nenne zwei Jahre und die passenden Werte. Nenne die Einheit. Was sagen die Werte nicht aus?',
      'Was kann bei der Kakaoverarbeitung helfen? Erkläre, wie zwei Bedingungen zusammenwirken können. Nutze den Bericht von GEPA und die Angaben zum Strom.',
      'Neue Situation: Ein Betrieb bekommt mehr Geld. Seine laufenden Kosten steigen aber noch stärker. Was musst du prüfen, bevor du sagst: Der Betrieb ist erfolgreich? Was müsstest du zusätzlich wissen, um über alle Menschen im Land zu urteilen?',
    ],
    example: [
      'Von 2022 bis 2023 steigt der Zugang von 85,1 auf 89,5 Prozent der Bevölkerung. Das sind 4,4 Prozentpunkte. Über Stromausfälle sagt dieser Anteil nichts.',
      'Zuverlässiger Strom kann Maschinenbetrieb ermöglichen. Kenntnisse über Verarbeitung, Preisgestaltung und Transport können helfen, Produkte anzubieten. Keine dieser Bedingungen garantiert Verkaufserfolg.',
      'Ich vergleiche Einnahmen und laufende Ausgaben. Eine einmalige Anschaffung rechne ich getrennt ab. Für ein Urteil über das Land muss ich mehr wissen: Wie sind die Arbeitsbedingungen? Wer bekommt wie viel Geld?',
    ],
    deeper:
      'Ein Wirtschaftsbereich hat zuerst einen Anteil von 20 Prozent am BIP. Später sind es 15 Prozent. Kann der wirtschaftliche Wert dieses Bereichs trotzdem steigen? Welche Zahl zum gesamten BIP fehlt dir? Denke auch an die Preise: Höhere Geldwerte können auch durch höhere Preise entstehen.',
  },
  future: {
    title: 'E · Einen Plan für die Zukunft wählen',
    question: 'Was empfiehlst du für einen Markt in Kumasi?',
    terms:
      'Sozial: Was bedeutet der Plan für die Menschen? Wer kann das Angebot nutzen?\nWirtschaftlich: Was kostet der Plan? Welche Einnahmen und welche Arbeit gibt es?\nÖkologisch: Was bedeutet der Plan für die Umwelt? Welche Rohstoffe und wie viel Energie braucht er?\nZielkonflikt: Ein Plan hilft bei einem Ziel. Bei einem anderen Ziel hilft er weniger oder schafft Nachteile.\nUnsicherheit: Wir wissen etwas Wichtiges noch nicht.\nWartung: Etwas regelmäßig prüfen und pflegen. So sollen Schäden vermieden werden.\nGE: Geldeinheiten. Das ist hier erfundenes Geld für den Vergleich.',
    checks: [
      {
        title: 'Beide Angebote untersuchen',
        instruction:
          'Kumasi gibt es wirklich. Die zwei Angebote sind erfunden. Auch das Geld und die Zahl der Stände sind erfunden. So kannst du die Angebote vergleichen.',
        fields: [
          choose(
            'reach',
            'Welches Angebot erreicht im Modell mehr Stände?',
            'shade',
            '60 Stände können die Dächer und Kisten nutzen. 30 Stände können den Kühlraum nutzen. Das sind Folgen für die Menschen in diesem Modell. Die Zahlen gelten nicht für alle Märkte in Ghana.',
            [
              ['cool', 'Gemeinsamer Kühlraum'],
              ['shade', 'Schattendächer und Mehrwegkisten'],
            ],
          ),
          choose(
            'environment',
            'Welches Problem für die Umwelt bleibt beim Kühlraum?',
            'energy',
            'Auch der Kühlraum braucht Energie und Material. Man muss ihn reparieren und später Abfälle entsorgen. Auch eine nachhaltige Idee kann Nachteile haben.',
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
            'Der Kühlraum kostet jeden Monat 12 GE. Dächer und Kisten kosten jeden Monat 3 GE. Diese Kosten wiederholen sich. Die Anschaffung kostet nur einmal 80 GE oder 30 GE.',
            [
              ['investment', 'Die Anschaffung: immer wieder 80 GE oder 30 GE'],
              ['running', 'Die laufenden Kosten: jeden Monat 12 GE oder 3 GE'],
            ],
          ),
        ],
        hints: [
          'Vergleiche beide Angebote nach Zugang, Kosten und Umwelt.',
          'Die Anschaffung wird hier einmal bezahlt. Laufende Kosten kommen immer wieder. Ein Plan kann bei einem Ziel helfen. Andere Probleme bleiben trotzdem.',
        ],
      },
      {
        title: 'Deinen Vorschlag begründen',
        instruction:
          'Wähle zuerst dein Ziel. Wähle dann einen Plan. Suche eine passende Angabe aus dem Material. Welches Problem bleibt bei deinem Plan? Du kannst beide Pläne sinnvoll begründen.',
        fields: [],
        hints: [
          'Welche Angabe aus dem Material passt zu deinem Plan? Welches Problem bleibt bei diesem Plan?',
          'Dein Ziel passt besser zum anderen Plan? Du kannst dein Ziel ändern. Oder du erklärst: Warum ist dir ein anderer Vorteil wichtiger?',
        ],
      },
    ],
    prompts: [
      'Welchen Plan empfiehlst du? Nenne dein Ziel. Nutze eine passende Angabe aus dem Material als Beleg. Nenne auch ein Problem, das bei deinem Plan bleibt.',
      'Welche Folgen hat dein Plan für die Menschen, die Wirtschaft und die Umwelt? Erkläre, wie die Folgen zusammenhängen. Welche Folge ist dir wichtiger? Welchen Nachteil akzeptierst du dafür?',
      'Neue Situation: Bei beiden Angeboten ist unklar, wer sie später prüft und pflegt (Wartung). Was musst du noch wissen? Würdest du deinen Plan ändern oder behalten? Begründe deine Entscheidung.',
    ],
    example: ['', '', ''],
    deeper:
      'Stell dir vor: Du sprichst mit einer Person, die das Angebot nicht nutzen darf. Was könnte sie dir sagen? Würdest du dann anders entscheiden? Andere Ziele sind erlaubt. Die Angaben aus dem Material müssen trotzdem zu deinem Plan passen.',
  },
};
export function decisionFields(plan: Plan): Field[] {
  return [
    choose(
      'evidence',
      'Welche Angabe aus dem Material spricht für deinen Plan?',
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
      'Welches Problem bleibt bei deinem Plan?',
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
      'Was musst du für deinen Plan noch klären?',
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
