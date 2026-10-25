import { test, expect } from '@playwright/test';
import { auditAccessibility } from './accessibility.ts';
test('phase5 short real/model information and offline source detail remain separate in all six direct episodes', async ({
  page,
}) => {
  await page.goto('/');
  for (const [id, fact] of [
    ['KEN', 'Hauptstadt von Kenia'],
    ['GHA', 'Accra liegt weiter südlich'],
    ['MAR', 'Rabat liegt weiter nördlich'],
  ] as const) {
    await page.locator('#geo-target-' + id).click();
    const card = page.locator('#real-context-' + id);
    await expect(card).not.toHaveAttribute('open', '');
    await card.locator(':scope > summary').click();
    await expect(card).toContainText(fact);
    await expect(card).toContainText('erfunden');
    await card.locator('.context-source summary').click();
    await expect(card).toContainText('25.10.2026');
    await expect(card).toContainText('keine aktuellen');
    expect((await auditAccessibility(page)).violations).toEqual([]);
  }
  for (const n of [1, 2, 3, 4, 5, 6]) {
    if (n === 1)
      await page.getByRole('button', { name: 'Spiel starten' }).click();
    else if (n === 2)
      await page
        .getByRole('button', { name: 'Episode 2 starten', exact: true })
        .click();
    else await page.locator('#episode-' + n).click();
    const card = page.locator('.real-context');
    await card.locator(':scope > summary').click();
    await expect(card).toContainText(
      n < 3
        ? 'Amina, David und Leila'
        : n < 5
          ? 'Kakaobetrieb'
          : 'Landwirtschaftsbetrieb',
    );
    await page
      .getByRole('button', { name: 'Episoden auswählen', exact: true })
      .click();
  }
});
