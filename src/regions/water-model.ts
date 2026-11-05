/** Deliberately closed, fictional one-round tank; no groundwater/return-flow model. */
export function waterBalance(withdrawal: number) {
  if (!Number.isInteger(withdrawal) || withdrawal < 0 || withdrawal > 80)
    throw new RangeError('Entnahme außerhalb des Modellvorrats');
  return { initial: 80, withdrawal, remaining: 80 - withdrawal };
}
export function tankGraphic(remaining: number) {
  return `<rect x="35" y="50" width="150" height="160" rx="8" fill="#fffef8" stroke="#253e34" stroke-width="3"/><rect x="39" y="${206 - remaining * 1.9}" width="142" height="${remaining * 1.9}" fill="#8eb5c1"/><text x="110" y="35" text-anchor="middle">Tank: Start 80 WE</text><text x="110" y="240" text-anchor="middle">Rest ${remaining} WE</text>`;
}
