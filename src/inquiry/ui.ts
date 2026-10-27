import { outlines } from '../geography/map-data.ts';
import { project } from '../geography/state.ts';
import {
  topicIds,
  topics,
  plans,
  goals,
  populationData,
  economyData,
  rainRegions,
  seasons,
  type TopicId,
  type Field,
  type Plan,
} from './content.ts';
import {
  newInquiry,
  checkDefinition,
  checkComplete,
  inquiryExplanation,
  productExample,
  productReady,
  productStatus,
  selectedPlan,
  weightingText,
  type Inquiry,
  type InquiryRecord,
} from './state.ts';
import type { Feedback } from '../feedback.ts';
import './style.css';
const esc = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
const b = (label: string, op: string, value = '', extra = '') =>
  `<button type="button" class="button secondary" data-action="inquiry" data-op="${op}" data-value="${esc(value)}" ${value && ['topic', 'material'].includes(op) ? `id="inquiry-${op}-${esc(value)}"` : ''} ${extra}>${esc(label)}</button>`;
const fmt = (n: number, digits = 0) =>
  n.toLocaleString('de-DE', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
const photos = {
  market: {
    url: new URL('./assets/asafo.jpg', import.meta.url).href,
    title: 'Markteingang in Kumasi',
    alt: 'Durch das Tor mit der Aufschrift Asafo Market sind Verkaufsstände, Menschen und Waren zu sehen.',
    date: '7. September 2013',
    author: 'jbdodane',
    license: 'CC BY 2.0',
    link: 'https://commons.wikimedia.org/wiki/File:Asafo_Market_(Entrance).jpg',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
  },
  forest: {
    url: new URL('./assets/kakum.jpg', import.meta.url).href,
    title: 'Baumkronenweg im Kakum-Nationalpark',
    alt: 'Ein gebauter Hängeweg mit Seilgeländern führt zwischen Bäumen zu einer Plattform.',
    date: '23. November 2022',
    author: 'daSupremo',
    license: 'CC BY-SA 4.0',
    link: 'https://commons.wikimedia.org/wiki/File:Canopy_walkway_in_Kakum_National_Park_4.jpg',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
};
const sourceLink = (url: string, label: string) =>
  `<a href="${url}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
function sources(id: TopicId) {
  const worldbank = `<p>The World Bank: World Development Indicators. Datenstand 8.10.2026, abgerufen 26.10.2026. ${sourceLink('https://data.worldbank.org/summary-terms-of-use', 'CC BY 4.0 mit Zusatzbedingungen und Quellenpflicht')}.</p>`;
  const texts = {
    image:
      '<p>Urheber, Datum, Original und Lizenz stehen direkt bei jedem Foto. Die Originale sind unverändert. Auswahl: Projektredaktion Afrika 2040. Die Fotos sind keine repräsentative Auswahl deutscher Medien.</p>',
    nature: `<p>The World Bank Group: ${sourceLink('https://climateknowledgeportal.worldbank.org/sites/default/files/country-profiles/15857-WB_Ghana%20Country%20Profile-WEB.pdf', 'Climate Risk Profile: Ghana (2021)')}, S.4, 15–18; ${sourceLink('https://climateknowledgeportal.worldbank.org/sites/default/files/country-profiles/17189-WB_Morocco%20Country%20Profile-WEB.pdf', 'Climate Risk Profile: Morocco (2025)')}, S.3–4 und Tabelle A2 S.18. Eigene Kurzfassung für nichtkommerziellen Unterricht; beide Berichte erlauben auf S.ii Wiedergabe mit Namensnennung.</p><p>Der Saisonkalender ist eine qualitative Zusammenfassung, keine neu gemessene Monatsreihe. Die zwei jährlichen Niederschlagswerte sind CRU-Flächenmittel 1991–2020, keine Wetterstationswerte.</p><p>Begriffsüberblick nach ${sourceLink('https://www.fao.org/4/ad652e/ad652e19.htm', 'FAO, Global Ecological Zoning, Working Paper 56 (2001), Kap.4 Africa')}. Historische Klassifikation, keine aktuelle Karte der Landbedeckung. Lagekarte: Natural Earth, gemeinfrei, vereinfachte Ländergrenzen und lineare Längen-/Breitengradprojektion. Punkte dienen nur der groben Orientierung. Westsahara: ungeklärter Status.</p>`,
    population: `${worldbank}<p>${sourceLink('https://api.worldbank.org/v2/country/GHA/indicator/SP.POP.TOTL?format=json&date=2000:2024&per_page=100', 'Ghana: SP.POP.TOTL, Bevölkerung insgesamt')}. Jahresmitte, de-facto-Bevölkerung, historische Schätzungen. Metadaten nennen UN World Population Prospects und nationale/internationale Datenanbieter. Eine bestimmte Ausgabe je Zeile wird dort nicht ausgewiesen. Diagramm in Millionen, Tabelle mit Originalwerten. Keine Zukunftsprojektion enthalten.</p>`,
    economy: `${worldbank}<p>${sourceLink('https://api.worldbank.org/v2/country/GHA/indicator/EG.ELC.ACCS.ZS?format=json&date=2019:2023', 'EG.ELC.ACCS.ZS: Elektrizitätszugang')} – World Bank SDG 7.1.1 Electrification Dataset; Industrie, nationale Erhebungen und internationale Quellen. ${sourceLink('https://api.worldbank.org/v2/country/GHA/indicator/NY.GDP.MKTP.KD.ZG?format=json&date=2019:2023', 'NY.GDP.MKTP.KD.ZG: reales BIP-Wachstum')} – nationale Konten, OECD und Weltbank. Konstante Preise; Metadaten nennen Basis 2015 US-Dollar. Prozentänderung zum Vorjahr, hier auf eine Nachkommastelle gerundet.</p><p>${sourceLink('https://www.gepaghana.org/gepa-and-key-stakeholders-build-the-capacity-women-led-cocoa-processing-smes/', 'GEPA, Bericht vom 23.10.2024')}: bestehende von Frauen geführte Kakaoverarbeitungsbetriebe; Schulung in Preisgestaltung, Logistik und Standards. Eigene sachliche Zusammenfassung. Eigendarstellung der Exportförderung, kein unabhängiger Nachweis eines Gewinnzuwachses.</p>`,
    future:
      '<p>Kumasi liegt in Ghana (Natural Earth, geprüfter Ortsdatensatz). Der Asafo-Markt ist im Foto belegt. Die beiden Angebote hier sind keine realen Vorhaben: Zahlen, Zugangsregeln und Folgen sind Annahmen für diese Übung. Keine sichere Vorhersage über Einkommen oder Umweltwirkung.</p>',
  };
  return `<details id="inquiry-sources"><summary>Quellen, Daten und Grenzen</summary>${texts[id]}<p>Die Materialien sind lokal enthalten. Für die Bearbeitung brauchst du keine Internetverbindung und kein Konto.</p></details>`;
}
function map() {
  const points = [
    { n: 1, name: 'Nordghana', lon: -1, lat: 9.5 },
    { n: 2, name: 'Nordwestmarokko', lon: -6, lat: 34 },
  ];
  return `<figure class="inquiry-map"><svg viewBox="0 0 740 730" role="img" aria-labelledby="inquiry-map-title inquiry-map-desc"><title id="inquiry-map-title">Zwei Naturräume in Afrika verorten</title><desc id="inquiry-map-desc">Punkt 1: Nordghana in Westafrika. Punkt 2: Nordwestmarokko in Nordafrika, weiter nördlich. Beide liegen nördlich des Äquators. Die Punkte markieren große Räume, keine Stationen oder Naturraumgrenzen.</desc><rect width="740" height="730" fill="#eef3f5"/>${outlines.map((o) => `<path d="${o.path}" fill="${['GHA', 'MAR'].includes(o.code) ? '#e6cf8b' : '#f7f6ee'}" stroke="#68766b" stroke-width="1.4" ${o.code === 'SAH' ? 'stroke-dasharray="5 4"' : ''}/>`).join('')}<path d="M20 ${project(0, 0).y}H700" stroke="#465e54" stroke-width="2" stroke-dasharray="7 7"/><text x="490" y="${project(0, 0).y - 12}" font-size="26">Äquator</text>${points
    .map((p) => {
      const c = project(p.lon, p.lat);
      return `<circle cx="${c.x}" cy="${c.y}" r="21" fill="#244f40"/><text x="${c.x}" y="${c.y + 10}" text-anchor="middle" fill="white" font-size="30">${p.n}</text>`;
    })
    .join(
      '',
    )}<text x="40" y="700" font-size="27">Norden ↑ · Übersicht ohne Entfernungsmaßstab</text></svg><figcaption><strong>1 Nordghana · 2 Nordwestmarokko</strong><br>Grobe Lagepunkte; keine Klima- oder Vegetationsgrenzen.</figcaption></figure>`;
}
function climate() {
  const months = [
    'Jan',
    'Feb',
    'Mär',
    'Apr',
    'Mai',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Okt',
    'Nov',
    'Dez',
  ];
  return `<h3>Regenzeiten im Jahreslauf</h3><p>Der Kalender zeigt typische Regenzeiten. Er fasst die Berichte von 2021 und 2025 zusammen. <strong>R = regenreichere Zeit, – = trockenere Zeit.</strong> Er zeigt nicht das Wetter an einzelnen Tagen. Er zeigt auch nicht die genaue Regenmenge.</p>${seasons.map((s) => `<section class="season"><h4>${s.name}</h4><div class="month-grid" role="list" aria-label="Regenzeit ${s.name}">${months.map((m, i) => `<div role="listitem" class="${(s.wet as readonly number[]).includes(i + 1) ? 'wet' : 'dry'}"><span>${m}</span><strong aria-label="${(s.wet as readonly number[]).includes(i + 1) ? 'regenreichere Zeit' : 'trockenere Zeit'}">${(s.wet as readonly number[]).includes(i + 1) ? 'R' : '–'}</strong></div>`).join('')}</div><p>${s.detail}</p></section>`).join('')}<p>Die Regenzeit beginnt nicht jedes Jahr gleich. Sie kann kürzer oder länger sein. Auch die Regenmenge ist nicht überall und in jedem Jahr gleich.</p>`;
}
function rainChart() {
  return `<figure><svg class="data-chart" viewBox="0 0 600 180" role="img" aria-labelledby="rain-title"><title id="rain-title">Jahresniederschlag 1991 bis 2020: Tanger-Tétouan-Al Hoceima 634,10 Millimeter; Souss-Massa 205,15 Millimeter.</title>${[0, 200, 400, 600].map((n) => `<path d="M${60 + n * 0.65} 20V130" stroke="#c4cfc9"/><text x="${60 + n * 0.65}" y="155" text-anchor="middle">${n}</text>`).join('')}${rainRegions.map((r, i) => `<rect x="60" y="${25 + i * 55}" width="${r.mm * 0.65}" height="32" fill="#28778c"/><text x="${70 + r.mm * 0.65}" y="${48 + i * 55}">${fmt(r.mm, 2)}</text>`).join('')}<text x="290" y="178">Millimeter pro Jahr</text></svg><figcaption>Oben: Tanger-Tétouan-Al Hoceima. Unten: Souss-Massa.</figcaption></figure><table><caption>Zwei Regionen in Marokko · Durchschnitt 1991–2020 (CRU-Daten)</caption><thead><tr><th scope="col">Region</th><th scope="col">Niederschlag pro Jahr</th></tr></thead><tbody>${rainRegions.map((r) => `<tr><th scope="row">${r.name}</th><td>${fmt(r.mm, 2)} mm</td></tr>`).join('')}</tbody></table><p>Die Werte zeigen: In den Regionen fällt unterschiedlich viel Regen. Sie zeigen nicht, wie viel Wasser in einem Speicher ist. Ein Teil verdunstet, geht in den Boden oder fließt weg. Menschen brauchen sauberes Wasser. Sie müssen das Wasser erreichen und nutzen können. Dabei kann Technik helfen.</p>`;
}
function populationChart() {
  const x = (year: number) => 50 + (year - 2000) * 20,
    y = (people: number) => 235 - (people / 1e6) * 5;
  return `<figure><svg class="data-chart" viewBox="0 0 600 295" role="img" aria-labelledby="pop-title pop-desc"><title id="pop-title">Geschätzte Bevölkerung Ghanas 2000–2024</title><desc id="pop-desc">Werte in Millionen; genaue Werte in der Tabelle. Zeitachse mit echten Jahresabständen. Historische Schätzungen, keine Zukunftsprojektion.</desc>${[0, 10, 20, 30, 40].map((n) => `<path d="M50 ${235 - n * 5}H550" stroke="#cad3cc"/><text x="42" y="${241 - n * 5}" text-anchor="end">${n}</text>`).join('')}<text x="50" y="20">Millionen Personen</text><polyline fill="none" stroke="#244f40" stroke-width="3" points="${populationData.map(([year, p]) => `${x(year)},${y(p)}`).join(' ')}"/>${populationData.map(([year, p]) => `<circle cx="${x(year)}" cy="${y(p)}" r="5" fill="#244f40"/><text x="${x(year)}" y="263" text-anchor="middle">${year}</text>`).join('')}<text x="280" y="290">Jahr</text></svg><figcaption>Ghana · historische Jahresmitte-Schätzungen · WDI</figcaption></figure><table><caption>Genaue Werte der gezeigten Jahre</caption><thead><tr><th scope="col">Jahr</th><th scope="col">Personen</th></tr></thead><tbody>${populationData.map(([year, p]) => `<tr><th scope="row">${year}</th><td>${fmt(p)}</td></tr>`).join('')}</tbody></table><p>Bei einer <strong>Volkszählung</strong> werden Menschen für einen bestimmten Zeitpunkt gezählt. Für eine <strong>Schätzung</strong> nutzt man verschiedene Daten. Der Wert kann später geändert werden. Eine <strong>Projektion</strong> zeigt eine mögliche Zukunft. Dafür nimmt man an, wie sich wichtige Bedingungen entwickeln. Diese Grafik zeigt die Vergangenheit. Sie enthält keine Projektion.</p>`;
}
function economyTable() {
  return `<table><caption>Ghana · zwei verschiedene Merkmale in Zahlen · Weltbank (WDI)</caption><thead><tr><th scope="col">Jahr</th><th scope="col">Zugang zu Strom (% der Bevölkerung)</th><th scope="col">Reales BIP-Wachstum (% zum Vorjahr)</th></tr></thead><tbody>${economyData.map((r) => `<tr><th scope="row">${r.year}</th><td>${fmt(r.electricity, 1)}</td><td>${fmt(r.gdp, 1)}</td></tr>`).join('')}</tbody></table><p><strong>Zugang ist nicht Zuverlässigkeit.</strong> Die Zahl zeigt nicht, wie oft der Strom ausfällt. Sie zeigt auch nicht, ob Menschen ihn bezahlen können. Prozent bedeutet: von hundert. Steigt der Anteil von 85 auf 86 Prozent, steigt er um 1 Prozentpunkt. Das bedeutet nicht: Eine Person kommt dazu.</p><p><strong>Preisbereinigt</strong> bedeutet: Der Einfluss veränderter Preise wird herausgerechnet. Sonst könnte ein Geldwert nur steigen, weil Dinge teurer werden. BIP heißt Bruttoinlandsprodukt. Es ist ein Maß für den wirtschaftlichen Wert, der in einem Land in einem Jahr neu entsteht. Es zeigt nicht den Überschuss eines einzelnen Betriebs. Es zeigt auch nicht, wie viel Geld die einzelnen Haushalte haben.</p><p>Die Tabelle beweist nicht: Mehr Stromzugang verursacht mehr BIP. Strom, Wissen, Transport und Nachfrage können zusammen helfen. Nachfrage bedeutet hier: Menschen wollen und können etwas kaufen. Die Tabelle zeigt nicht, wie alle Menschen leben.</p>`;
}
export function material(id: TopicId, step: number, r: InquiryRecord) {
  if (id === 'image') {
    const key = r.material as keyof typeof photos,
      p = photos[key];
    return `<div class="material-tabs" role="group" aria-label="Fotos untersuchen">${b('Markt in Kumasi', 'material', 'market', `aria-pressed="${key === 'market'}"`)}${b('Baumkronenweg', 'material', 'forest', `aria-pressed="${key === 'forest'}"`)}</div>${p ? `<figure><img class="inquiry-photo" src="${p.url}" alt="${p.alt}" width="${key === 'market' ? 4928 : 1200}" height="${key === 'market' ? 3264 : 1600}"><figcaption><strong>${p.title} · Ghana</strong><br>${p.date} · Foto: ${p.author}. ${sourceLink(p.link, 'Original und Herkunft')} · ${sourceLink(p.licenseUrl, p.license)}. Unverändert.</figcaption></figure>` : '<p>Öffne ein Foto. Nenne etwas, das du wirklich siehst. Lies auch, woher das Foto kommt.</p>'}<p>Wir haben diese Fotos für die Übung ausgewählt. Sie zeigen zwei Orte zu zwei früheren Zeitpunkten. So leben nicht alle Menschen heute. Die Fotos zeigen auch nicht, welche Bilder in deutschen Medien besonders häufig sind.</p><p class="small-note">Bereits geöffnet: ${r.seen.length} von 2 Fotos.</p>`;
  }
  if (id === 'nature')
    return step === 0
      ? `${climate()}<details id="inquiry-lagekarte"><summary>Die beiden Räume auf der Karte suchen</summary>${map()}</details><details id="nature-overview"><summary>Regenwald, Savanne, Übergang und Wüste</summary><p><strong>Tropischer Regenwald:</strong> zum Beispiel in Teilen des Kongobeckens. Dort ist es sehr feucht. Der Wald ist dicht.</p><p><strong>Savanne:</strong> Graslandschaft mit mehr oder weniger Bäumen. Es gibt deutliche Regenzeiten und Trockenzeiten. Ein Beispiel ist Nordghana.</p><p><strong>Sahel:</strong> ein trockeneres Gebiet südlich der Sahara. Es ist ein Übergang zur Wüste. Die Pflanzen stehen weiter auseinander.</p><p><strong>Wüste:</strong> Dort fällt sehr wenig Regen. Ein Beispiel ist die Sahara. Nicht jede Wüste besteht aus Sand.</p><p>In Nordwestmarokko regnet es vor allem im Winter. Auch die Höhe, die Böden und die Nutzung durch Menschen beeinflussen die Bedingungen vor Ort.</p><p>Die Grenzen zwischen diesen Landschaften sind nicht überall scharf. Sie können sich verändern.</p><p><strong>Desertifikation:</strong> Land in trockenen Gebieten wird geschädigt. Zum Beispiel wachsen weniger Pflanzen. Klima und eine schädliche Nutzung können dabei zusammenwirken. Eine natürliche Wüste allein ist noch keine Desertifikation.</p></details>`
      : `${rainChart()}<p><strong>Regenfeldbau:</strong> Pflanzen auf Feldern bekommen ihr Wasser vom Regen. Man muss dann säen, wenn die Pflanzen gut wachsen können. Das nennt man Vegetationszeit. Regen sammeln und sparsam bewässern kann helfen. Aber man braucht Geld, Wartung und Zugang zum Wasser. Die Natur allein bestimmt nicht, wie Menschen leben.</p><p>Der Tank aus der Marokko-Episode ist erfunden. Er zeigt eine vereinfachte Wasserrechnung. Er zeigt nicht die Wassermenge einer ganzen Region.</p>`;
  if (id === 'population')
    return step === 0
      ? `<section class="model-card"><h3>Ein Ort – ein Jahr – erfundenes Modell</h3><p>Anfang: <strong>1.000 Personen</strong></p><dl><dt>Geburten</dt><dd>48</dd><dt>Sterbefälle</dt><dd>18</dd><dt>Zuzug</dt><dd>30</dd><dt>Fortzug</dt><dd>40</dd></dl><p>Änderung = Geburten − Sterbefälle + Zuzug − Fortzug.<br>Am Jahresende = am Jahresanfang + Änderung.</p></section><p>Die vier Zahlen gelten für denselben Ort und dasselbe Jahr. Sie sind erfunden. Sie zeigen nicht die Bevölkerung eines echten Landes. Auch die 16 und 24 Fahrgäste aus der Kenia-Episode sind erfundene Zahlen.</p>`
      : populationChart();
  if (id === 'economy')
    return step === 0
      ? `<h3>Ghana verarbeitet bereits Kakao</h3><p>GEPA ist eine Organisation zur Exportförderung in Ghana. Sie hilft Betrieben beim Verkauf ins Ausland. Am 23.10.2024 berichtete sie über eine Schulung. Die Teilnehmerinnen führten bereits eigene Betriebe. Sie verarbeiteten Kakao. In der Schulung ging es um Preise, Transport und Regeln für den Verkauf ins Ausland.</p><p>GEPA berichtet hier über die eigene Arbeit. Der Bericht beweist nicht, ob die Betriebe später mehr Geld verdient haben. Er beschreibt nicht den erfundenen Betrieb in Kumasi. Die Ghana-Episode bleibt ein Modell.</p><table><caption>Neue erfundene Betriebsrechnung · eine Runde · GE</caption><thead><tr><th>Verfahren</th><th>Einnahmen</th><th>Laufende Ausgaben</th><th>Einmalige Investition</th></tr></thead><tbody><tr><th scope="row">A</th><td>200</td><td>120</td><td>0</td></tr><tr><th scope="row">B</th><td>240</td><td>180</td><td>40</td></tr></tbody></table><p>Bei der Verarbeitung kann neuer wirtschaftlicher Wert entstehen. Das heißt Wertschöpfung. Die Verarbeitung kostet auch Geld.</p><p><strong>Überschuss = Einnahmen − laufende Ausgaben.</strong></p><p>Die einmalige Anschaffung (Investition) rechnen wir getrennt ab. GE bedeutet Geldeinheiten: erfundenes Geld für den Vergleich. Die Rechnung ist vereinfacht. Kredite und der Wertverlust von Maschinen (Abschreibung) fehlen.</p>`
      : economyTable();
  const key = r.material as Plan,
    p = plans[key];
  return `<p><strong>Erfundener Planungsfall in Kumasi, Ghana.</strong> Menschen mit Marktständen vergleichen zwei Angebote. Alle Zahlen und Folgen unten sind für die Übung erfunden. Es ist kein echtes Bauvorhaben.</p><div class="material-tabs" role="group" aria-label="Angebote untersuchen">${b(plans.cool.name, 'material', 'cool', `aria-pressed="${key === 'cool'}"`)}${b(plans.shade.name, 'material', 'shade', `aria-pressed="${key === 'shade'}"`)}</div>${p ? `<section class="model-card"><h3>${p.name}</h3><dl><dt>Sozial: Wer kann das Angebot nutzen?</dt><dd>${p.stands} Stände</dd><dt>Wirtschaftlich: Anschaffung (Investition)</dt><dd>einmalig ${p.investment} GE</dd><dt>Wirtschaftlich: Kosten, die sich wiederholen</dt><dd>${p.running} GE pro Monat</dd></dl><p>${p.benefit}</p><p><strong>Ökologisch:</strong> ${p.ecology}</p><p><strong>Welches Problem bleibt?</strong> ${p.limit}</p><p><strong>Unbekannt:</strong> ${p.unknown}</p></section>` : '<p>Öffne beide Angebote und vergleiche ihre Folgen.</p>'}<p class="small-note">Bereits geöffnet: ${r.seen.length} von 2 Angeboten. Kein Angebot ist bei allen Zielen besser.</p>`;
}
function fieldHtml(f: Field, answers: Record<string, string>) {
  if (!f.options)
    return `<label class="inquiry-field" for="inq-${f.id}">${esc(f.label)}<input id="inq-${f.id}" name="inquiry-answer" data-field="${f.id}" type="text" inputmode="text" maxlength="80" autocomplete="off" value="${esc(answers[f.id] ?? '')}" aria-describedby="number-entry"></label>`;
  return `<label class="inquiry-field" for="inq-${f.id}">${esc(f.label)}<select id="inq-${f.id}" name="inquiry-answer" data-field="${f.id}"><option value="">Bitte wählen</option>${f.options.map(([id, label]) => `<option value="${id}" ${answers[f.id] === id ? 'selected' : ''}>${esc(label)}</option>`).join('')}</select></label>${answers[f.id] ? `<p class="chosen-answer">Gewählt: ${esc(f.options.find(([id]) => id === answers[f.id])?.[1] ?? '')}</p>` : ''}`;
}
function feedback(f?: Feedback) {
  return f
    ? `<section class="feedback ${f.kind}" data-inquiry-feedback><h3 id="inquiry-feedback-title" tabindex="-1">${esc(f.title)}</h3><p>${esc(f.text)}</p></section>`
    : '';
}
function decision(r: InquiryRecord) {
  const p = r.checks[1],
    plan = selectedPlan(r);
  return (
    fieldHtml(
      {
        id: 'goal',
        label: 'Was ist dir besonders wichtig?',
        expected: '',
        explanation: '',
        options: goals,
      },
      p.answers,
    ) +
    fieldHtml(
      {
        id: 'plan',
        label: 'Dein Vorschlag',
        expected: '',
        explanation: '',
        options: [
          ['cool', plans.cool.name],
          ['shade', plans.shade.name],
        ],
      },
      p.answers,
    ) +
    (plan
      ? `<div class="decision-anchor"><strong>${plans[plan].name}</strong><p>${plans[plan].stands} Stände · einmalig ${plans[plan].investment} GE · monatlich ${plans[plan].running} GE.</p></div>`
      : '')
  );
}
function decisionConflict(r: InquiryRecord) {
  const p = r.checks[1],
    plan = selectedPlan(r);
  if (!plan || !p.answers.goal || p.answers.goal === plans[plan].goal)
    return '';
  return `<fieldset class="inquiry-conflict"><legend>Dein Ziel passt besser zum anderen Plan</legend><p>Du kannst oben dein Ziel ändern. Oder du behältst es. Dann erkläre: Welcher andere Vorteil ist dir wichtiger?</p>${fieldHtml(
    {
      id: 'weighting',
      label: 'Warum empfehle ich den Vorschlag trotzdem?',
      expected: '',
      explanation: '',
      options: [
        [plans[plan].goal, weightingText(plan)],
        [
          p.answers.goal,
          'Mein Ziel ist mir weiter wichtiger. Ich habe noch nicht erklärt, warum ich trotzdem diesen Plan wähle.',
        ],
      ],
    },
    p.answers,
  )}</fieldset>`;
}
function journal(s: Inquiry) {
  return `<h1>Lernjournal · Afrika</h1><p>Hier stehen deine Antworten. Das Spiel prüft die Auswahl und die Rechnungen. Deine eigenen Texte prüft es nicht. Es gibt keine Note.</p>${topicIds
    .map((id) => {
      const r = s.records[id];
      return `<section class="journal-record"><h2>${topics[id].title}</h2><p><strong>${productStatus(id, r)}</strong></p>${id === 'image' && r.initialSaved ? `<p>Erste Vorstellung (unbewertet): ${esc(r.initial)}</p>` : ''}${r.checks
        .map(
          (c, i) =>
            `<details><summary>Materialschritt ${i + 1}: ${checkComplete(id, i as 0 | 1, r) ? 'Zuordnung geprüft' : 'noch offen'}${c.exampleUsed ? ' · Beispiel genutzt' : c.help ? ' · Hilfe geöffnet' : ''}</summary>${checkDefinition(
              id,
              i as 0 | 1,
              r,
            )
              .fields.map(
                (f) =>
                  `<p>${esc(f.label)}: ${esc(f.options?.find(([v]) => v === c.answers[f.id])?.[1] ?? c.answers[f.id] ?? 'noch offen')}</p>`,
              )
              .join(
                '',
              )}${id === 'future' && i === 1 && selectedPlan(r) ? `<p>Vorschlag: ${plans[selectedPlan(r)!].name}. Ziel: ${goals.find(([g]) => g === c.answers.goal)?.[1] ?? 'noch offen'}. ${c.answers.weighting === plans[selectedPlan(r)!].goal ? weightingText(selectedPlan(r)!) : ''}</p>` : ''}</details>`,
        )
        .join(
          '',
        )}${r.product.map((t, i) => `<h3>${i + 1}. ${esc(topics[id].prompts[i])}</h3><p class="own-product">${t ? esc(t) : 'Noch kein Text.'}</p>`).join('')}${r.oral ? '<p>Du hast angegeben: Ich habe die Antworten mündlich erklärt. Das Spiel hat deine Erklärung nicht geprüft.</p>' : ''}${b('Weiter bearbeiten', 'topic', id)}</section>`;
    })
    .join('')}`;
}
function product(id: TopicId, r: InquiryRecord) {
  const p = topics[id],
    ready = productReady(id, r);
  const plan = selectedPlan(r);
  const anchor =
    id === 'image'
      ? `<aside class="decision-anchor" id="inquiry-product-anchor"><strong>Deine erste Vorstellung – unbewertet</strong><p>${esc(r.initial)}</p><p>Vergleiche sie jetzt mit den beiden Belegen.</p></aside>`
      : id === 'future' && plan
        ? `<aside class="decision-anchor" id="inquiry-product-anchor"><strong>Dein gewählter Vorschlag: ${plans[plan].name}</strong><p>Ziel: ${esc(goals.find(([g]) => g === r.checks[1].answers.goal)?.[1] ?? '')}.</p><p>${plans[plan].stands} Stände · einmalig ${plans[plan].investment} GE · monatlich ${plans[plan].running} GE.</p><p>${esc(plans[plan].limit)} ${esc(plans[plan].ecology)}</p>${r.checks[1].answers.weighting === plans[plan].goal ? `<p>${esc(weightingText(plan))}</p>` : ''}</aside>`
        : '';
  return `<h2 id="inquiry-title" tabindex="-1">Jetzt selbst erklären</h2>${anchor}<p>Schreibe kurze Sätze oder Stichwörter. Nutze deine eigenen Worte. Du kannst die drei Antworten auch im Unterricht mündlich erklären. Kreuze das dann unten an.</p>${!ready ? '<p class="feedback neutral">Du hast eine frühere Antwort geändert. Prüfe sie noch einmal. Dein Text bleibt erhalten.</p>' : ''}${p.prompts.map((prompt, i) => `<label class="inquiry-field" for="inq-product-${i}">${i + 1}. ${esc(prompt)}<textarea id="inq-product-${i}" name="inquiry-product" data-field="${i}" rows="3" maxlength="700">${esc(r.product[i])}</textarea></label>`).join('')}<label class="choice"><input type="checkbox" name="inquiry-oral" ${r.oral ? 'checked' : ''}><span>Ich habe die drei Antworten im Unterricht mündlich erklärt. Das Spiel hat sie nicht geprüft.</span></label><div class="inquiry-actions">${b('Meine Antworten sind fertig (ohne Bewertung)', 'submit', '', `id="inquiry-submit" ${!ready ? 'disabled' : ''}`)}${b('Hilfe zum eigenen Erklären', 'product-help')}</div><p id="inquiry-product-status" role="status" tabindex="-1">${productStatus(id, r)}</p><p id="inquiry-product-notice">${r.submitted ? 'Deine Antworten sind in diesem Browser-Tab gespeichert, wenn der Browser es erlaubt. Das Spiel hat deine eigenen Texte nicht geprüft.' : 'Fülle die drei Felder aus. Oder kreuze an: Ich habe die Antworten mündlich erklärt.'}</p>${
    r.productHelp
      ? `<aside class="help-panel"><h3 id="inquiry-help-title" tabindex="-1">Hilfe ${r.productHelp} von 3</h3><p>${r.productHelp === 1 ? 'Nenne zuerst den Ort und eine passende Angabe aus dem Material. Erkläre dann: Wie hängt etwas zusammen? Welches Problem bleibt?' : r.productHelp === 2 ? 'Du kannst so anfangen: „Im Material sehe ich …“, „Das kann helfen, wenn …“, „Ich weiß noch nicht …“. Passt die Angabe aus dem Material wirklich zu deiner Aussage?' : 'Hier ist eine mögliche Erklärung. Vergleiche sie mit deiner Antwort. Nur weil du das Beispiel gelesen hast, hast du es noch nicht selbst erklärt.'}</p>${
          r.productHelp === 3
            ? `${productExample(id, r)
                .map((t) => `<p>${esc(t)}</p>`)
                .join(
                  '',
                )}${b('Dieses Beispiel bewusst übernehmen', 'product-adopt', '', !ready ? 'disabled' : '')}`
            : b('Nächste Hilfestufe', 'product-help')
        }</aside>`
      : ''
  }<details id="inquiry-deeper"><summary>Weiterdenken</summary><p>${esc(p.deeper)}</p></details><details id="inquiry-material-again"><summary>Material noch einmal ansehen</summary>${material(id, 1, r)}${id === 'nature' ? climate() : ''}</details>`;
}
function words(id: TopicId) {
  return `<details id="inquiry-terms"><summary>Wörter und Aufgaben kurz erklärt</summary><p class="inquiry-terms-text">${esc(topics[id].terms)}</p><p><strong>Beschreibe:</strong> Sage, was du im Material siehst oder liest.</p><p><strong>Erkläre:</strong> Sage, wie oder warum etwas zusammenhängt.</p><p><strong>Begründe:</strong> Sage, warum du so denkst oder entscheidest. Nutze eine passende Angabe aus dem Material.</p></details>`;
}
export function renderInquiry(value: Inquiry | undefined, header: string) {
  const s = value ?? newInquiry();
  const nav = `<nav class="inquiry-nav" aria-label="Untersuchungsbereich">${b('Zur Startseite', 'home')}${b('Themenübersicht', 'menu')}${b('Lernjournal', 'journal')}</nav>`;
  const close = '</main>';
  const open =
    header + `<main id="main" class="inquiry-screen" tabindex="-1">${nav}`;
  if (s.journal) return open + journal(s) + close;
  if (!s.topic)
    return (
      open +
      `<h1>Afrika untersuchen</h1><p>Hier bearbeitest du fünf Themen. Du nutzt echte Informationen und erklärst selbst. Wähle ein Thema. Es gibt keine Noten. Für Hilfen gibt es keine Strafpunkte.</p><div class="inquiry-menu">${topicIds.map((id) => `<section><h2>${topics[id].title}</h2><p>${topics[id].question}</p>${b('Untersuchen', 'topic', id, `aria-label="${topics[id].title} untersuchen"`)}<p>${productStatus(id, s.records[id])}</p></section>`).join('')}</div><p>Auf der Startseite findest du auch die sechs Episoden. Dort sind Situationen und Zahlen erfunden. Hier erkennst du jeweils: Was ist echt? Was ist für die Übung erfunden?</p>` +
      close
    );
  const id = s.topic,
    r = s.records[id],
    t = topics[id];
  const top = `<p class="eyebrow">${t.title} · Schritt ${s.step + 1} von 3</p><h1>${t.question}</h1>`;
  if (id === 'image' && !r.initialSaved)
    return (
      open +
      top +
      `<h2 id="inquiry-title" tabindex="-1">Zuerst deine Vorstellung</h2><p>Welche Bilder oder Aussagen über Afrika kennst du aus Deutschland? Oder: Was fällt dir selbst zu Afrika ein? Ein Stichwort reicht. Es gibt dafür kein Richtig oder Falsch. Später kannst du deine Vorstellung ändern.</p><label class="inquiry-field" for="inq-initial">Meine erste Vorstellung<textarea id="inq-initial" name="inquiry-initial" rows="3" maxlength="450">${esc(r.initial)}</textarea></label><div class="inquiry-actions">${b('Vorstellung festhalten', 'initial-save')}${b('Noch keine Vorstellung', 'initial-save', 'none')}</div>` +
      close
    );
  if (s.step === 2)
    return (
      open +
      top +
      product(id, r) +
      `<div class="inquiry-actions">${b('Zurück zur Zuordnung', 'back')}${b('Lernjournal ansehen', 'journal')}</div>${words(id)}${sources(id)}` +
      close
    );
  const step = s.step,
    p = r.checks[step],
    def = checkDefinition(id, step, r);
  return (
    open +
    top +
    `<div class="inquiry-work"><section class="inquiry-material" aria-label="Material">${material(id, step, r)}</section><section class="inquiry-task"><h2 id="inquiry-title" tabindex="-1">${def.title}</h2><p>${def.instruction}</p>${id === 'future' && step === 1 ? decision(r) : ''}${def.fields.map((f) => fieldHtml(f, p.answers)).join('')}${def.fields.some((f) => !f.options) ? '<p id="number-entry" class="small-note">Schreibe ganze Zahlen. 1020 oder 1.020 ist beides möglich. Für negative Zahlen geht -10 oder −10.</p>' : ''}${id === 'future' && step === 1 ? decisionConflict(r) : ''}${feedback(p.feedback)}<div class="inquiry-actions">${b('Angaben prüfen', 'check', '', 'id="inquiry-check"')}${b('Ich brauche einen Hinweis', 'help')}${checkComplete(id, step, r) ? b('Weiter', 'next', '', 'id="inquiry-next"') : ''}</div><p class="small-note" data-inquiry-attempts>Fehlversuche bei vollständig ausgefüllten Antworten: ${p.failures} von 2. ${p.exampleUsed ? 'Beispiel genutzt; spätere Änderungen werden erneut geprüft.' : p.help ? 'Hilfe geöffnet; noch keine Beispielübernahme.' : ''}</p>${p.help ? `<aside class="help-panel"><h3 id="inquiry-help-title" tabindex="-1">Hilfe ${p.help} von 3</h3><p>${esc(p.help === 3 ? inquiryExplanation(id, step, r) : def.hints[p.help - 1])}</p>${p.help < 3 ? b('Nächste Hilfestufe', 'help') : b('Dieses Beispiel bewusst übernehmen', 'adopt', '', id === 'future' && !selectedPlan(r) && step === 1 ? 'disabled' : '')}</aside>` : ''}</section></div>${words(id)}${sources(id)}<div class="inquiry-actions">${b(step === 0 ? 'Zur Themenübersicht' : 'Zurück', 'back')}</div>` +
    close
  );
}
