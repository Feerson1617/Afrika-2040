import { test, expect, type Page, type Locator } from '@playwright/test';
import { auditAccessibility } from './accessibility.ts';
import { evidencePath } from './artifacts.ts';
import { writeFileSync } from 'node:fs';
const countries = [
  {
    id: 'KEN',
    order: ['all', 'model'],
    text: 'Im Modell hilft Nord Amina. David braucht länger.',
  },
  {
    id: 'GHA',
    order: ['model', 'all'],
    text: 'Im Modell bleibt bei Qualität mehr Überschuss als bei Verarbeitung.',
  },
  {
    id: 'MAR',
    order: ['all', 'model'],
    text: 'Im Modell spart das erste Feld. Mit Zusatzfläche steigt die gesamte Entnahme.',
  },
] as const;
const saved = (page: Page) =>
  page.evaluate(
    () =>
      JSON.parse(sessionStorage.getItem('afrika-2040:kenia-bus:v2a')!).geography
        .review,
  );
for (const mode of ['mouse', 'touch', 'keyboard'] as const)
  test(`RC1 stable positional choices and ID evaluation with ${mode}`, async ({
    browser,
  }) => {
    test.setTimeout(60000);
    const ctx = await browser.newContext({
      viewport:
        mode === 'mouse'
          ? { width: 1440, height: 1000 }
          : { width: 1024, height: 768 },
      hasTouch: mode === 'touch',
      isMobile: mode === 'touch',
      baseURL: 'http://127.0.0.1:4173',
    });
    const page = await ctx.newPage();
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    async function press(l: Locator) {
      if (mode === 'keyboard') {
        await l.focus();
        await page.keyboard.press('Space');
      } else if (mode === 'touch') await l.tap();
      else await l.click();
    }
    async function select(l: Locator) {
      if (mode === 'keyboard') {
        await l.focus();
        await page.keyboard.press('Space');
      } else {
        const id = await l.getAttribute('id');
        await press(page.locator(`label[for="${id}"]`));
      }
    }
    const radios = () =>
      page.locator('.review-task fieldset input[type=radio]');
    const order = () =>
      radios().evaluateAll((es) =>
        es.map((e) => (e as HTMLInputElement).value),
      );
    await page.goto('/');
    await press(page.locator('#review-open'));
    const observations = [];
    for (const c of countries) {
      await press(page.locator('#review-tab-' + c.id));
      expect(await order()).toEqual(c.order);
      const correct = c.order.indexOf('model'),
        wrong = 1 - correct;
      await expect(
        page.locator('#geo-transfer-claim-model'),
      ).toHaveAccessibleName(c.text);
      await select(radios().nth(wrong));
      await press(page.locator('#review-check'));
      await expect(page.locator('[data-feedback]')).toHaveClass(/incorrect/);
      expect((await saved(page)).records[c.id].answers.claim).toBe('all');
      expect((await saved(page)).records[c.id].progress.failures).toBe(1);
      await press(page.locator('#review-check'));
      await expect(page.locator('[data-feedback]')).toHaveClass(/hint/);
      await expect(page.locator('#help-title')).toContainText('3 von 3');
      expect(
        (await saved(page)).records[c.id].progress.supported,
      ).toBeUndefined();
      await press(page.locator('#review-adopt'));
      await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
      await expect(page.locator('#geo-transfer-claim-model')).toBeChecked();
      await expect(page.locator('[data-review-complete]')).toContainText(
        'bewusst übernommenem Beispiel',
      );
      await page.reload();
      expect(await order()).toEqual(c.order);
      await expect(radios().nth(correct)).toBeChecked();
      await select(radios().nth(wrong));
      await expect(page.locator('[data-review-complete]')).toHaveCount(0);
      await select(radios().nth(correct));
      await press(page.locator('#review-check'));
      await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
      expect(
        (await saved(page)).records[c.id].progress.supported,
      ).toBeUndefined();
      await press(
        page.getByRole('button', {
          name: 'Antwort neu bearbeiten',
          exact: true,
        }),
      );
      expect(await order()).toEqual(c.order);
      const hints = [];
      for (const name of [
        'Ich brauche einen Hinweis',
        'Genauer zeigen',
        'Erklärung ansehen',
      ]) {
        await press(page.getByRole('button', { name, exact: true }));
        hints.push(await page.locator('.help-panel p').innerText());
      }
      expect(new Set(hints).size).toBe(3);
      await select(radios().nth(correct));
      await press(page.locator('#review-check'));
      await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
      observations.push({
        country: c.id,
        order: await order(),
        correctPosition: correct + 1,
      });
    }
    if (mode === 'touch')
      await page.screenshot({
        path: evidencePath('rc1-country-landscape.png'),
        fullPage: false,
      });
    await press(page.locator('#review-tab-common'));
    expect(await order()).toEqual(['different', 'same', 'any', 'evidence']);
    const groups = page.locator('.review-task > fieldset');
    await select(groups.nth(0).locator('input').nth(0));
    await press(page.locator('#review-check'));
    await expect(page.locator('[data-feedback]')).toHaveClass(/partial/);
    expect((await saved(page)).records.common.progress.failures).toBe(0);
    await select(groups.nth(1).locator('input').nth(0));
    await press(page.locator('#review-check'));
    await expect(page.locator('[data-feedback]')).toHaveClass(/partial/);
    await expect(page.locator('[data-feedback]')).toContainText(
      'Das passt schon',
    );
    expect((await saved(page)).records.common.progress.failures).toBe(1);
    await select(groups.nth(1).locator('input').nth(1));
    await press(page.locator('#review-check'));
    await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
    await page.reload();
    expect(await order()).toEqual(['different', 'same', 'any', 'evidence']);
    await expect(page.locator('#geo-transfer-weigh-evidence')).toBeChecked();
    await press(
      page.getByRole('button', { name: 'Antwort neu bearbeiten', exact: true }),
    );
    await select(groups.nth(0).locator('input').nth(1));
    await select(groups.nth(1).locator('input').nth(0));
    await press(page.locator('#review-check'));
    await expect(page.locator('[data-feedback]')).toHaveClass(/incorrect/);
    await press(page.locator('#review-check'));
    await expect(page.locator('[data-feedback]')).toHaveClass(/hint/);
    await press(page.locator('#review-adopt'));
    await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
    await expect(
      page.locator('#geo-transfer-consequences-different'),
    ).toBeChecked();
    await expect(page.locator('#geo-transfer-weigh-evidence')).toBeChecked();
    await press(page.locator('#review-home'));
    await press(page.locator('#review-open'));
    expect(await order()).toEqual(['different', 'same', 'any', 'evidence']);
    await expect(page.locator('[data-review-complete]')).toContainText(
      'bewusst übernommenem Beispiel',
    );
    if (mode === 'touch')
      await page.screenshot({
        path: evidencePath('rc1-common-landscape.png'),
        fullPage: true,
      });
    expect((await auditAccessibility(page)).violations).toEqual([]);
    expect(errors).toEqual([]);
    writeFileSync(
      evidencePath(`rc1-order-${mode}.json`),
      JSON.stringify(observations, null, 2),
    );
    await ctx.close();
  });
