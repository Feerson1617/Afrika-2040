import { regions, type RegionId } from './state.ts';
export const placeContexts: Record<
  RegionId,
  { real: string; model: string; scope: string }
> = {
  KEN: {
    real: 'Nairobi ist die Hauptstadt von Kenia. Die Stadt liegt südlich des Äquators.',
    model:
      'Amina, David und Leila sind erfunden. Auch ihr Viertel, die Buswege und alle Zahlen sind Spielmodelle.',
    scope:
      'Das Viertel zeigt einen Ausschnitt im Spiel. Es steht nicht für das Leben aller Menschen in Nairobi oder Kenia.',
  },
  GHA: {
    real: 'Kumasi ist eine Stadt in Ghana. Ghanas Hauptstadt Accra liegt weiter südlich.',
    model:
      'Unser Kakaobetrieb bei Kumasi und seine Beschäftigten sind erfunden. Auch Geldbeträge und Vorschläge gehören zum Modell.',
    scope: 'Dieser Betrieb steht nicht für alle Berufe und Betriebe in Ghana.',
  },
  MAR: {
    real: 'Agadir ist eine Stadt in Marokko. Die Hauptstadt Rabat liegt weiter nördlich.',
    model:
      'Unser Landwirtschaftsbetrieb bei Agadir und sein Tank sind erfunden. Wasser-Einheiten und Flächen sind Modellwerte.',
    scope:
      'Der Tank zeigt keine Messung für Agadir oder ganz Marokko. Er sagt nichts über das Grundwasser aus.',
  },
};
export function renderContext(id: RegionId) {
  const c = placeContexts[id],
    r = regions[id];
  return `<details id="real-context-${id}" class="real-context"><summary>${r.city}: wirklicher Ort oder Spielmodell?</summary><p><strong>Wirklicher Ort:</strong> ${c.real}</p><p><strong>Für das Spiel erfunden:</strong> ${c.model}</p><p>${c.scope}</p><details class="context-source"><summary>Quelle zur Ortsinformation</summary><p>Natural Earth, Ortsdatensatz 1:10 Millionen: ${r.city}${id === 'GHA' ? ', Accra' : id === 'MAR' ? ', Rabat' : ''}. Geprüft wurden Stadt, Land, Hauptstadt-Kennzeichnung und Lage. Abruf: 25.10.2026. Kartographischer Datenstand; keine aktuellen Bevölkerungs-, Verkehrs- oder Wirtschaftszahlen.</p><p><a href="https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_populated_places_simple.geojson" target="_blank" rel="noopener noreferrer">Verwendete Ortsdaten</a> · <a href="https://github.com/nvkelso/natural-earth-vector/blob/master/LICENSE.md" target="_blank" rel="noopener noreferrer">Gemeinfrei: Nutzungsrechte</a>. Die Information bleibt ohne Internet lesbar.</p></details></details>`;
}
