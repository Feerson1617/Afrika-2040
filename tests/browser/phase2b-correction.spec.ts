import { test, expect } from '@playwright/test';
import {
  fullToDecision,
  chooseRoute,
  setGoal,
  selectEvidence,
  routeChoices,
  key,
} from './phase2a-helpers.ts';
import { evidencePath } from './artifacts.ts';
const routes = ['direct', 'north', 'south'] as const;
const matching = {
  direct: 'market',
  north: 'school',
  south: 'training',
} as const;
const times = { direct: '22 → 28', north: '28 → 34', south: '10 → 10' };
async function review(
  page: import('@playwright/test').Page,
  route: (typeof routes)[number],
) {
  await fullToDecision(page);
  await chooseRoute(page, routeChoices[route].name);
  await setGoal(page, matching[route]);
  await selectEvidence(page, 'advantage', routeChoices[route].advantage);
  await selectEvidence(page, 'disadvantage', routeChoices[route].disadvantage);
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await page.getByRole('button', { name: 'Was hat sich verändert?' }).click();
  await page.locator('#event-path-leila-platz').check();
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  for (const r of routes)
    await page
      .locator(`#event-answer-${r}-${r === 'south' ? 'same' : 'longer'}`)
      .check();
  await page.locator('#check-answer').click();
  await page.locator('#event-connection').selectOption('sued');
  await page.locator('#event-cause').selectOption('unchanged');
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
}
const saved = (page: import('@playwright/test').Page) =>
  page.evaluate((k) => JSON.parse(sessionStorage.getItem(k)!), key);
for (const route of routes)
  for (const other of routes.filter((r) => r !== route)) {
    test(`Gate A: ${route}/${other} uses bounded automatic help and conscious adoption`, async ({
      page,
      browserName,
    }) => {
      await review(page, route);
      const original = (await saved(page)).road.original;
      await page.locator('#event-change-evidence-' + other).check();
      await page.locator('#event-reason-goal').check();
      await page.locator('#check-answer').click();
      expect((await saved(page)).road.revision.failures).toBe(1);
      await expect(page.locator('[data-feedback]')).toContainText(
        'Du belegst den Vorteil',
      );
      await expect(page.locator('[data-feedback]')).toContainText(
        'Du beachtest auch den Nachteil',
      );
      await expect(page.locator('[data-feedback]')).toContainText(
        'Deine Zeitangabe stimmt: Leila',
      );
      await expect(page.locator('[data-feedback]')).toContainText(times[other]);
      await page.reload();
      await page.locator('#check-answer').click();
      const s = await saved(page);
      expect(s.road.revision.failures).toBe(2);
      expect(s.road.revision.help).toBe(3);
      expect(s.road.review.supported).toBeUndefined();
      expect(s.road.original).toEqual(original);
      await expect(page.locator('[data-feedback]')).toContainText(times[route]);
      await expect(page.locator('#next-step')).toHaveCount(0);
      await expect(
        page.getByRole('button', { name: 'Dieses Beispiel übernehmen' }),
      ).toBeVisible();
      if (route === 'north' && other === 'south')
        await page.screenshot({
          path: evidencePath(`gate-a-${browserName}-automatic-help.png`),
          fullPage: true,
        });
      await page
        .getByRole('button', { name: 'Dieses Beispiel übernehmen' })
        .click();
      await page.locator('#next-step').click();
      await expect(page.locator('[data-supported]')).toBeVisible();
      expect((await saved(page)).road.original).toEqual(original);
      await page.reload();
      await expect(page.locator('.event-end')).toBeVisible();
      await page
        .getByRole('button', { name: 'Erneute Empfehlung ansehen' })
        .click();
      await page.locator('#event-change-evidence-' + other).check();
      await expect(page.locator('#next-step')).toHaveCount(0);
      expect((await saved(page)).road.review.supported).toBeUndefined();
      await page.locator('#event-change-evidence-' + route).check();
      await page.locator('#event-reason-goal').check();
      await page.locator('#check-answer').click();
      expect((await saved(page)).road.review.supported).toBeUndefined();
      await page.locator('#next-step').click();
      await expect(page.locator('.event-end')).toBeVisible();
    });
  }
test('Gate A: incomplete revision has no failed attempts and the correct South unchanged evidence completes normally', async ({
  page,
}) => {
  await review(page, 'south');
  for (let i = 0; i < 3; i++) await page.locator('#check-answer').click();
  await page.locator('#event-change-evidence-north').check();
  for (let i = 0; i < 3; i++) await page.locator('#check-answer').click();
  expect((await saved(page)).road.revision.failures).toBe(0);
  await page.locator('#event-change-evidence-south').check();
  await page.locator('#event-reason-goal').check();
  await page.locator('#check-answer').click();
  expect((await saved(page)).road.revision.failures).toBe(0);
  await page.locator('#next-step').click();
  await expect(page.locator('.recommendation')).toContainText('10 → 10');
});
