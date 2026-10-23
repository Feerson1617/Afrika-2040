import { expect, type Page, type Locator } from '@playwright/test';
export const key = 'afrika-2040:kenia-bus:v2a';
export const routeChoices = {
  direct: {
    name: 'Direkt',
    advantage: 'david-direct-north',
    disadvantage: 'amina-direct-north',
    wrong: 'david-direct-north',
    benefit: 'Direkt 12 statt Über Nord 18',
    cost: 'Direkt 22 statt Über Nord 10',
  },
  north: {
    name: 'Über Nord',
    advantage: 'amina-north-direct',
    disadvantage: 'david-north-direct',
    wrong: 'amina-north-direct',
    benefit: 'Über Nord 10 statt Direkt 22',
    cost: 'Über Nord 18 statt Direkt 12',
  },
  south: {
    name: 'Über Süd',
    advantage: 'leila-south-direct',
    disadvantage: 'david-south-direct',
    wrong: 'leila-south-direct',
    benefit: 'Über Süd 10 statt Direkt 22',
    cost: 'Über Süd 18 statt Direkt 12',
  },
} as const;
export const actOn = (touch: boolean) => (l: Locator) =>
  touch ? l.tap() : l.click();
export async function finish2A(page: Page, touch = false) {
  const act = actOn(touch);
  await page.getByLabel('Was ändert sich am Fußweg?').selectOption('shorter');
  await page.getByLabel('Was folgt für den ganzen Weg?').selectOption('total');
  await act(
    page.getByRole('button', { name: 'Erklärung prüfen', exact: true }),
  );
  const ownExplanation = await page.locator('#explanation-text').inputValue();
  await expect(page.locator('[data-feedback]')).toHaveClass(
    ownExplanation.trim() ? /neutral/ : /correct/,
  );
  await act(page.getByRole('radio', { name: 'Direkt', exact: true }));
  await act(page.getByRole('button', { name: 'Weiter →', exact: true }));
  await act(page.getByRole('radio', { name: 'Über Nord', exact: true }));
  for (const name of ['Direkt', 'Über Nord', 'Über Süd'])
    await act(page.getByRole('button', { name, exact: true }));
  await act(page.getByRole('radio', { name: 'Über Süd', exact: true }));
  await act(page.getByRole('button', { name: 'Weg prüfen', exact: true }));
  await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
  await act(page.getByRole('button', { name: 'Weiter →', exact: true }));
  await page.getByLabel('Mein Ziel oder Kriterium').selectOption('tradeoff');
}
export async function fullToDecision(page: Page, touch = false) {
  const act = actOn(touch);
  await page.goto('/');
  await act(page.getByRole('button', { name: 'Spiel starten' }));
  await act(page.getByRole('radio', { name: /Zum Platz/ }));
  await act(page.getByRole('radio', { name: /Platz → Zentrum/ }));
  await act(page.getByRole('button', { name: 'Weg prüfen', exact: true }));
  await act(page.getByRole('button', { name: 'Weiter →', exact: true }));
  for (const name of ['Amina', 'David']) {
    await act(page.getByRole('radio', { name, exact: true }));
    await act(page.getByRole('button', { name: 'Weg prüfen', exact: true }));
    await act(page.getByRole('button', { name: 'Weiter →', exact: true }));
  }
  await finish2A(page, touch);
}
