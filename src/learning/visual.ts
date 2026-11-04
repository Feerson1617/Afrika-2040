import { outlines } from '../geography/map-data.ts';
import { project, regions } from '../geography/state.ts';

// Local presentation only: the same Natural Earth outlines as the teaching map.
// No routes, simulated areas or invented geographic evidence are added here.
export function atlasPreview() {
  return `<figure class="atlas-preview"><svg viewBox="0 0 740 730" role="img" aria-label="Ghana mit Kumasi, Kenia mit Nairobi und Marokko mit Agadir in Afrika. Norden ist oben. Vereinfachte Übersicht."><circle cx="370" cy="350" r="325" fill="#244e43"/><g fill="none" stroke="#396254" stroke-width="1"><path d="M60 260H680M60 400H680M130 540H610M260 60V660M400 35V680M540 90V630"/></g>${outlines.map((f) => `<path d="${f.path}" fill="${Object.hasOwn(regions, f.code) ? '#e5b86e' : '#547566'}" stroke="#183e34" stroke-width="1.5" ${f.code === 'SAH' ? 'stroke-dasharray="5 4"' : ''}/>`).join('')}${(
    ['MAR', 'GHA', 'KEN'] as const
  )
    .map((id) => {
      const r = regions[id],
        point = project(r.lon, r.lat);
      const x = id === 'KEN' ? 500 : 22;
      const y = id === 'MAR' ? 80 : id === 'GHA' ? 335 : 455;
      return `<path d="M${point.x} ${point.y}L${x + (id === 'KEN' ? 0 : 205)} ${y + 24}" stroke="#f0d5a1" stroke-width="2" fill="none"/><circle cx="${point.x}" cy="${point.y}" r="8" fill="#fff2cb" stroke="#173e32" stroke-width="3"/><rect x="${x}" y="${y}" width="214" height="64" rx="10" fill="#fff9e9"/><text x="${x + 14}" y="${y + 25}" fill="#173e32" font-size="30" font-weight="700">${r.name}</text><text x="${x + 14}" y="${y + 49}" fill="#42584b" font-size="26">${r.city}</text>`;
    })
    .join(
      '',
    )}<text x="590" y="80" fill="#f4e4bd" font-size="25">N ↑</text></svg><figcaption>Reale Orte · vereinfachte Übersicht<br>Natural Earth · gemeinfrei</figcaption></figure>`;
}

const symbols: Record<string, string> = {
  pictures:
    '<path d="M14 19h36v32H14zM20 43l9-11 8 8 6-6 7 9"/><circle cx="42" cy="26" r="3"/><path d="M23 12h32v31"/>',
  nature:
    '<path d="M32 10c-5 9-16 19-16 29a16 16 0 0032 0C48 29 37 19 32 10zM23 41c0 5 4 8 8 8"/>',
  people:
    '<path d="M14 46c19 0 16-28 35-28M41 12l9 6-7 8"/><circle cx="14" cy="46" r="6"/><path d="M10 14h14v14H10z"/>',
  economy: '<path d="M12 50V27l13 8V23l13 8V15h12v35zM19 43h4m8 0h4m8 0h4"/>',
  future:
    '<path d="M32 49V30m0 8C17 38 14 29 15 18c11 0 17 7 17 16m0 1c0-14 8-20 18-20 1 12-4 21-18 22M19 51h27"/>',
  foerder:
    '<circle cx="15" cy="42" r="5"/><circle cx="32" cy="32" r="5"/><circle cx="49" cy="22" r="5"/><path d="M20 40l7-5m10-6l7-4"/>',
  esa: '<path d="M11 16h17c5 0 7 3 7 7v27c-3-4-6-5-11-5H11zM35 23c0-4 3-7 8-7h10v29H43c-4 0-6 1-8 5"/>',
  msa: '<path d="M12 17h16v30H12zM36 17h16v30H36zM19 24v16m24-16v16M27 32h10"/>',
  ahr: '<circle cx="16" cy="32" r="7"/><circle cx="46" cy="16" r="7"/><circle cx="46" cy="48" r="7"/><path d="M22 28l18-9M22 36l18 9"/>',
};
export function emblem(id: string) {
  return `<svg class="atlas-emblem" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${symbols[id] ?? symbols.pictures}</g></svg>`;
}

export function moneyLedger(
  m: { income: number; costs: number; surplus: number },
  simple: boolean,
) {
  const rows = [
    ['Einnahmen', m.income, 'income'],
    ['Laufende Ausgaben', m.costs, 'costs'],
    ...(simple ? [['Erklärter Überschuss', m.surplus, 'surplus']] : []),
  ] as const;
  return `<table class="visual-ledger"><caption>Laufende Runde · GE</caption><thead><tr><th scope="col">Laufende Runde</th><th scope="col">GE</th></tr></thead><tbody>${rows.map(([name, value, kind]) => `<tr><th scope="row">${name}</th><td data-ledger="${kind}" data-value="${value}"><strong>${value}</strong><span class="ledger-track" aria-hidden="true"><span style="width:${(Number(value) / 260) * 100}%"></span></span></td></tr>`).join('')}</tbody></table>`;
}

export function capacityPicture(people: number, capacity: number) {
  return `<figure class="capacity-picture" aria-label="${people} Menschen und ${capacity} Plätze in einer Stunde"><div><span>Menschen <strong>${people}</strong></span><div class="capacity-track" aria-hidden="true">${Array.from({ length: 30 }, (_, i) => `<i class="${i < people ? 'person-filled' : ''}"></i>`).join('')}</div></div><div><span>Plätze <strong>${capacity}</strong></span><div class="capacity-track" aria-hidden="true">${Array.from({ length: 30 }, (_, i) => `<i class="${i < capacity ? 'seat-filled' : ''}"></i>`).join('')}</div></div><figcaption>Je ein Zeichen: ein Mensch oder ein Platz · eine Stunde</figcaption></figure>`;
}

export function allocationPicture(
  values: Record<string, number>,
  remaining: number,
) {
  const rows = [
    ['payout', 'Auszahlung'],
    ['reserve', 'Rücklage'],
    ['training', 'Fortbildung'],
    ['left', 'Noch frei'],
  ] as const;
  const amount = (key: string) =>
    key === 'left' ? remaining : (values[key] ?? 0);
  return `<figure class="allocation-picture"><figcaption>Dein Plan · insgesamt 120 GE</figcaption><div class="allocation-track" aria-hidden="true">${rows.map(([key]) => `<span class="allocation-${key}" style="width:${(amount(key) / 120) * 100}%" data-amount="${amount(key)}"></span>`).join('')}</div><ul>${rows.map(([key, label]) => `<li><i class="allocation-${key}" aria-hidden="true"></i>${label}: <strong>${amount(key)} GE</strong></li>`).join('')}</ul></figure>`;
}
