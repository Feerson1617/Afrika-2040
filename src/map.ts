import type { State } from './state.ts';
import {
  episode,
  lineSegments,
  lineStops,
  personNames,
  routeNames,
  stopNames,
  visiblePersons,
} from './content.ts';
import type { Person, Route, Segment } from './content.ts';
import { journey, journeyParts, lineDuration } from './model.ts';
import { selectedPerson } from './state.ts';

const t = episode.times;
const tree = (x: number, y: number, size = 1) =>
  `<g transform="translate(${x} ${y}) scale(${size})"><circle r="14" fill="#b7cbb0"/><circle cx="-5" cy="-4" r="9" fill="#c9d7bf"/></g>`;
const block = (x: number, y: number, w: number, h: number, angle = -8) =>
  `<g transform="translate(${x} ${y}) rotate(${angle})"><rect width="${w}" height="${h}" rx="5" fill="#c8cbbb"/><rect x="-3" y="-4" width="${w}" height="${h}" rx="5" fill="#dedfd0" stroke="#c3c7b5" stroke-width="1.5"/><path d="M4 ${h / 2}H${w - 8}" stroke="#c7cbb9" stroke-width="2"/></g>`;
const badge = (x: number, y: number, text: string, style = '') =>
  `<g class="map-badge ${style}" transform="translate(${x} ${y})"><rect x="-42" y="-18" width="84" height="36" rx="9"/><text text-anchor="middle" dy="7">${text}</text></g>`;

export function renderMap(s: State) {
  const p = s.progress[s.step];
  const choosing = s.step === 0;
  const expanded = s.step >= 4;
  const route: Route = choosing
    ? 'direct'
    : !expanded && s.route === 'south'
      ? 'north'
      : s.route;
  const person = visiblePersons(s.step).includes(selectedPerson(s))
    ? selectedPerson(s)
    : 'amina';
  const j = journey(person, route),
    parts = journeyParts(person, route);
  const geometry: Record<Segment, string> = {
    direct: 'M170 420 Q402 510 600 370',
    platzNord: 'M170 420 L330 190',
    nordZentrum: 'M330 190 L600 370',
    platzSued: 'M170 420 Q305 503 450 550',
    suedZentrum: 'M450 550 L600 370',
  };
  const positions: Record<Segment, [number, number]> = {
    direct: [402, 457],
    platzNord: [244, 303],
    nordZentrum: [474, 278],
    platzSued: [305, 503],
    suedZentrum: [557, 480],
  };
  const locked = s.step === 4 && !p.prediction && !p.supported;
  const renderRoute = (r: Route) =>
    `<g id="map-bus-${r}" role="button" tabindex="${locked ? -1 : 0}" aria-disabled="${locked}" aria-label="Busweg ${routeNames[r]}: ${lineStops[r].map((stop) => stopNames[stop]).join(' → ')}, ${lineDuration(r)} Minuten" aria-pressed="${r === route}" data-action="${choosing ? 'bus' : 'route'}" data-value="${r}" class="map-control bus ${r === route ? 'active' : 'inactive'} ${choosing && p.bus === r ? 'chosen' : ''}">${lineSegments[r].map((segment) => `<path d="${geometry[segment]}" class="path-hit"/><path d="${geometry[segment]}" class="path-line" data-segment="${segment}"/>`).join('')}</g>`;
  const spotlight = p.help >= 2;
  const amina = s.highlight === 'amina' || (spotlight && s.step !== 2);
  const david = s.highlight === 'david' || (spotlight && s.step === 2);
  const interactivePath = (
    id: string,
    label: string,
    action: string,
    value: string,
    d: string,
    cls: string,
    pressed: boolean,
  ) =>
    `<g id="${id}" role="button" tabindex="0" aria-label="${label}" aria-pressed="${pressed}" data-action="${action}" data-value="${value}" class="map-control ${cls}"><path d="${d}" class="path-hit"/><path d="${d}" class="path-line"/></g>`;
  const walkPlatz = 'M160 136 C87 192 107 321 170 420';
  const walkNord = 'M194 122 Q265 128 330 190';
  return `<section class="map-panel" aria-label="Interaktive Modellkarte">
    <div class="map-topline"><span><span class="tiny-dot"></span> Deine Karte</span><span>Modell · nicht maßstabsgetreu</span></div>
    <svg class="neighborhood ${expanded ? 'expanded' : ''}" viewBox="0 0 760 ${expanded ? 670 : 550}" role="group" aria-labelledby="map-title" aria-describedby="map-desc">
      <title id="map-title">Eine erfundene Nachbarschaft in Nairobi</title>
      <desc id="map-desc">Norden ist oben. Diese Nachbarschaft ist erfunden. ${expanded ? `Leila wohnt im Süden und lernt einen Beruf im Zentrum. Ausgewählt: ${routeNames[route]}. Buslinie ${lineStops[route].map((stop) => stopNames[stop]).join(' → ')}. ${personNames[person]} geht ${j.walk} Minuten bis ${stopNames[parts.board]} und fährt ${j.bus} Minuten im Bus. Insgesamt ${j.total} Minuten. Es erscheint nur die ausgewählte Buslinie.` : `Amina wohnt im Norden. Zum Platz geht sie ${t.walk.amina.platz} Minuten, nach Nord ${t.walk.amina.nord}. David geht ${t.walk.david.platz} Minuten zum Platz. Direkt fährt der Bus ${lineDuration('direct')} Minuten. Über Nord braucht die ganze Buslinie ${lineDuration('north')} Minuten. Amina steigt in Nord ein und fährt nur den letzten Abschnitt.`} Alle Wege sind auch über die Bedienelemente unter der Karte oder im Auftrag erreichbar.</desc>
      <defs><pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".7" fill="#d1d5c3"/></pattern></defs>
      <g aria-hidden="true">
        <rect width="760" height="${expanded ? 670 : 550}" fill="#eef0e3"/><rect width="760" height="${expanded ? 670 : 550}" fill="url(#dots)"/>
        <path d="M455 0 C395 110 516 165 432 280 S350 469 438 550" stroke="#d9e3cf" stroke-width="102" fill="none"/>
        <path d="M0 276 L760 244 M262 0 L209 550" stroke="#e3e5d7" stroke-width="29" fill="none"/>
        <path d="M0 276 L760 244 M262 0 L209 550" stroke="#f8f7ed" stroke-width="18" fill="none"/>
        ${[
          [47, 83, 44, 32],
          [92, 51, 38, 40],
          [64, 151, 36, 27],
          [247, 46, 42, 30],
          [299, 82, 35, 26],
          [423, 89, 40, 37],
          [473, 160, 36, 29],
          [594, 170, 47, 31],
          [661, 216, 37, 28],
          [45, 457, 41, 31],
          [91, 494, 34, 25],
          [272, 445, 40, 30],
          [324, 490, 48, 27],
          [677, 463, 38, 34],
          [556, 476, 46, 26],
        ]
          .map((a) => block(...(a as [number, number, number, number])))
          .join('')}
        ${[
          [365, 56],
          [390, 87],
          [532, 70],
          [557, 90],
          [566, 117],
          [405, 219],
          [435, 239],
          [410, 267],
          [357, 322],
          [380, 347],
          [336, 361],
          [476, 440],
          [498, 466],
          [691, 81],
          [713, 109],
          [672, 126],
          [46, 230],
          [57, 258],
          [657, 515],
        ]
          .map((a) => tree(a[0], a[1], 0.8))
          .join('')}
        <g transform="translate(709 35)"><path d="M0 38V8 M-6 17L0 8L6 17" fill="none" stroke="#36584b" stroke-width="2"/><text y="0" text-anchor="middle" font-size="14" fill="#36584b">N</text></g>
        <text x="408" y="42" class="area-label">WOHNEN IM NORDEN</text>
        <rect x="133" y="384" width="76" height="65" rx="15" fill="#e6dbc2" transform="rotate(-8 170 420)"/>
        <rect x="550" y="315" width="113" height="104" rx="17" fill="#d9e3cf"/>
      </g>
      ${expanded ? `<g aria-hidden="true"><text x="65" y="635" class="area-label">WOHNEN IM SÜDEN</text>${block(84, 584, 39, 29)}${block(591, 601, 46, 32)}${tree(540, 615)}${tree(576, 580)}</g>` : ''}
      ${!expanded ? `${choosing ? interactivePath('walk-platz', `Fußweg Amina → Platz, ${t.walk.amina.platz} Minuten`, 'foot', 'platz', walkPlatz, `walk ${p.foot === 'platz' || amina ? 'selected' : ''}`, p.foot === 'platz') : `<path class="walk path-line ${amina ? 'selected' : ''}" d="${walkPlatz}"/>`}${choosing ? interactivePath('walk-nord', `Fußweg Amina → Nord, ${t.walk.amina.nord} Minuten`, 'foot', 'nord', walkNord, `walk ${p.foot === 'nord' || amina ? 'selected' : ''}`, p.foot === 'nord') : `<path class="walk path-line ${amina ? 'selected' : ''}" d="${walkNord}"/>`}<path class="walk path-line ${david ? 'selected' : ''}" d="M79 357 Q101 402 170 420"/>` : `<path class="walk selected path-line" data-walk-person="${person}" data-walk-stop="${parts.board}" d="${person === 'amina' ? (parts.board === 'nord' ? walkNord : walkPlatz) : person === 'david' ? 'M79 357 Q101 402 170 420' : parts.board === 'sued' ? 'M321 592 Q390 595 450 550' : 'M321 592 C180 650 78 514 170 420'}"/>`}
      ${choosing ? renderRoute('direct') + interactivePath('bus-nord-choice', `Busfahrt Nord → Zentrum, ${t.bus.nordZentrum} Minuten`, 'bus', 'north', geometry.nordZentrum, `bus ${p.bus === 'north' ? 'chosen' : 'inactive'}`, p.bus === 'north') : expanded ? renderRoute(route) : renderRoute('direct') + renderRoute('north')}
      ${expanded ? `<g class="bus ride" aria-hidden="true">${parts.segments.map((segment) => `<path class="path-line" d="${geometry[segment]}" data-ride-segment="${segment}"/>`).join('')}</g>` : ''}
      <g class="map-labels" aria-hidden="true">
        ${!expanded ? `${badge(104, 266, `${t.walk.amina.platz} Min.`, 'walk-time')}${badge(257, 136, `${t.walk.amina.nord} Min.`, 'walk-time')}${badge(82, 405, `${t.walk.david.platz} Min.`, 'walk-time')}` : person === 'amina' ? badge(parts.board === 'nord' ? 257 : 104, parts.board === 'nord' ? 136 : 266, `${j.walk} Min.`, 'walk-time') : person === 'david' ? badge(82, 405, `${j.walk} Min.`, 'walk-time') : badge(parts.board === 'sued' ? 412 : 148, parts.board === 'sued' ? 600 : 551, `${j.walk} Min.`, 'walk-time')}
        ${choosing ? badge(402, 457, `${t.bus.direct} Min.`, 'bus-time') + badge(474, 278, `${t.bus.nordZentrum} Min.`) : lineSegments[route].map((segment) => badge(...positions[segment], `${t.bus[segment]} Min.`, !expanded || parts.segments.includes(segment) ? 'bus-time' : '')).join('')}
        <circle cx="170" cy="420" r="10" fill="#fffdf6" stroke="#345c4d" stroke-width="4"/><circle cx="330" cy="190" r="10" fill="#fffdf6" stroke="#345c4d" stroke-width="4"/><circle cx="600" cy="370" r="10" fill="#fffdf6" stroke="#345c4d" stroke-width="4"/>
        <text x="177" y="463" class="stop-label">Platz</text><text x="338" y="174" class="stop-label">Nord</text><text x="614" y="364" class="stop-label">Zentrum</text><text x="614" y="387" class="place-detail">${expanded ? 'Schule · Markt' : 'Schule &amp; Markt'}</text>${expanded ? '<text x="614" y="408" class="place-detail">Ausbildung</text><circle cx="450" cy="550" r="10" fill="#fffdf6" stroke="#345c4d" stroke-width="4"/><text x="464" y="580" class="stop-label">Süd</text>' : ''}
        <g transform="translate(158 76)"><rect width="55" height="43" rx="6" fill="#d6b995"/><path d="M-6 4L26-14L61 4Z" fill="#a88561"/><path d="M21 43V22H36V43" fill="#f8ecd7"/></g><g transform="translate(49 312)"><rect width="52" height="37" rx="5" fill="#d6b995"/><path d="M-5 4L26-13L58 4Z" fill="#a88561"/></g>${expanded ? '<g transform="translate(300 580)"><rect width="52" height="37" rx="5" fill="#d6b995"/><path d="M-5 4L26-13L58 4Z" fill="#a88561"/></g>' : ''}
      </g>
      ${visiblePersons(s.step)
        .map((who) => {
          const position: Record<Person, string> = {
            amina: '171 40',
            david: '71 352',
            leila: '260 637',
          };
          return `<g id="marker-${who}" role="button" tabindex="0" data-action="highlight" data-value="${who}" aria-label="${personNames[who]}: Fußweg auf der Karte zeigen" class="person-marker ${(expanded ? who === person : who === 'amina' ? amina : david) ? 'highlighted' : ''}" transform="translate(${position[who]})"><rect x="-25" y="-26" width="116" height="51" rx="25"/><circle cx="0" cy="-1" r="16"/><g aria-hidden="true"><circle cx="0" cy="-6" r="4" style="fill:#fffdf5"/><path d="M-7 9Q-7 0 0 0Q7 0 7 9Z" fill="#fffdf5"/></g><text x="27" y="5">${personNames[who]}</text></g>`;
        })
        .join('')}
    </svg>
    <div class="map-legend"><span><i class="legend-line walk-legend"></i> Fußweg</span><span><i class="legend-line bus-legend"></i> Busfahrt</span><span>${expanded ? 'Kräftig: ausgewählte Busfahrt' : 'Grau: anderer Busweg'}</span><span>Alle Zeiten in Minuten</span></div>
  </section>`;
}
