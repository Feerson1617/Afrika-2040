import { studyClick } from './study-helpers.ts';
import { test, expect, type Page, type Locator } from '@playwright/test';
import { key } from './phase2a-helpers.ts';
import { auditAccessibility } from './accessibility.ts';
import { evidencePath } from './artifacts.ts';
const saved = (page: Page) =>
  page.evaluate((k) => JSON.parse(sessionStorage.getItem(k)!), key);
for (const mode of ['mouse', 'touch', 'keyboard'] as const)
  for (const answer of ['missing', 'wrong', 'confirmed'] as const)
    test(`P2-01 ${mode} ${answer}: three early tasks, reload, transfer, back, rework and legacy`, async ({
      browser,
    }) => {
      test.setTimeout(90000);
      const ctx = await browser.newContext({
        baseURL: 'http://127.0.0.1:4173',
        viewport:
          mode === 'mouse'
            ? { width: 1440, height: 1000 }
            : { width: 1024, height: 768 },
        hasTouch: mode === 'touch',
        isMobile: mode === 'touch',
      });
      const page = await ctx.newPage();
      const requests: string[] = [];
      page.on('request', (r) => requests.push(r.url()));
      async function press(l: Locator) {
        if (mode === 'keyboard') {
          await l.focus();
          await page.keyboard.press('Space');
        } else if (mode === 'touch') await l.tap();
        else await l.click();
      }
      async function choose(selector: string) {
        const input = page.locator(selector);
        if (mode === 'keyboard') await press(input);
        else
          await press(
            page.locator(`label[for="${await input.getAttribute('id')}"]`),
          );
      }
      await page.goto('/');
      await press(page.getByRole('button', { name: 'Spiel starten' }));
      for (const step of [0, 1, 2]) {
        async function select(correct: boolean) {
          if (step === 0) {
            await choose('#foot-' + (correct ? 'platz' : 'nord'));
            await choose('#bus-' + (correct ? 'direct' : 'north'));
          } else
            await choose(
              '#person-' +
                (correct
                  ? step === 1
                    ? 'amina'
                    : 'david'
                  : step === 1
                    ? 'david'
                    : 'amina'),
            );
        }
        if (answer !== 'missing') await select(answer === 'confirmed');
        await press(page.locator('#check-answer'));
        await expect(page.locator('[data-feedback]')).toHaveClass(
          answer === 'confirmed'
            ? /correct/
            : answer === 'wrong'
              ? /incorrect/
              : /hint/,
        );
        for (const name of ['Ich brauche einen Hinweis', 'Genauer zeigen'])
          await press(page.getByRole('button', { name, exact: true }));
        await expect(page.locator('#help-title')).toContainText('2 von 3');
        await press(
          page.getByRole('button', { name: 'Erklärung ansehen', exact: true }),
        );
        if (answer === 'confirmed') {
          await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
          expect((await saved(page)).progress[step].supported).toBeUndefined();
          await expect(page.locator('.task-work input:checked')).toHaveCount(
            step === 0 ? 2 : 1,
          );
        } else {
          await expect(page.locator('[data-feedback]')).toHaveClass(/hint/);
          await expect(page.locator('[data-feedback]')).toContainText(
            'Mit Erklärung bearbeitet',
          );
          await expect(
            page.locator(
              '.task-work input[name=person], .task-work input[name=foot], .task-work input[name=bus]',
            ),
          ).toHaveCount(0);
          expect((await saved(page)).progress[step].supported).toBe(true);
        }
        const explanation = await page.locator('.help-panel > p').innerText();
        expect(explanation).toContain(step === 2 ? 'David' : 'Amina');
        await expect(page.locator('.feedback.incorrect')).toHaveCount(0);
        await expect(page.locator('#next-step')).toBeVisible();
        const snapshot = (await saved(page)).progress[step];
        await page.reload();
        expect((await saved(page)).progress[step]).toEqual(snapshot);
        await press(page.locator('#transfer > summary'));
        await choose('#transfer-yes');
        await press(
          page.getByRole('button', { name: 'Neuen Weg prüfen', exact: true }),
        );
        await expect(page.locator('#transfer .feedback')).toHaveClass(
          /correct/,
        );
        await press(page.locator('#next-step'));
        await press(
          page.getByRole('button', { name: '← Zurück', exact: true }),
        );
        expect((await saved(page)).step).toBe(step);
        await expect(page.locator('[data-feedback]')).toHaveClass(
          answer === 'confirmed' ? /correct/ : /hint/,
        );
        await press(
          page.getByRole('button', {
            name: 'Aufgabe neu bearbeiten',
            exact: true,
          }),
        );
        expect((await saved(page)).progress[step].complete).toBe(false);
        await select(false);
        await press(page.locator('#check-answer'));
        // Construct the exact old-format contradiction; the public storage reader migrates it.
        await page.evaluate(
          ({ k, step }) => {
            const s = JSON.parse(sessionStorage.getItem(k)!);
            s.progress[step].help = 3;
            s.progress[step].complete = true;
            s.progress[step].supported = true;
            sessionStorage.setItem(k, JSON.stringify(s));
          },
          { k: key, step },
        );
        await page.reload();
        await expect(page.locator('[data-feedback]')).toHaveClass(/hint/);
        await expect(page.locator('[data-feedback]')).toContainText(
          'Mit Erklärung bearbeitet',
        );
        await expect(page.locator('.task-work input:checked')).toHaveCount(0);
        if (mode === 'touch' && answer === 'wrong' && step === 1) {
          expect((await auditAccessibility(page)).violations).toEqual([]);
          await page.screenshot({
            path: evidencePath('kenya-explained-landscape.png'),
            fullPage: true,
          });
        }
        await press(page.locator('#next-step'));
      }
      expect(
        requests.every((u) => u.startsWith('http://127.0.0.1:4173/')),
      ).toBe(true);
      await ctx.close();
    });
for (const n of [3, 4, 5, 6])
  test(`P2-02 episode ${n}: glossary belongs to each step, no attempts or example adoption`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await page.locator('#episode-' + n).click();
    async function words() {
      const before = (await saved(page)).studies;
      await page
        .getByRole('button', { name: 'Wörter erklären', exact: true })
        .click();
      await expect(page.locator('#word-help')).toBeVisible();
      expect((await saved(page)).studies).toEqual(before);
    }
    await words();
    if (n === 3) {
      await expect(page.locator('#word-help')).toContainText(
        'Ein Betrieb, der seinen Mitgliedern gemeinsam gehört.',
      );
      await expect(page.locator('.study-question')).toHaveText(
        'Warum bleibt bei mehr Verarbeitung hier nicht automatisch mehr Überschuss übrig?',
      );
    }
    if (n === 5)
      await expect(page.locator('#word-help')).toContainText('Entnahme');
    const first = await page.locator('#word-help dl').innerText();
    await page
      .getByRole('button', { name: 'Wörter schließen', exact: true })
      .click();
    async function help() {
      for (const name of [
        'Ich brauche einen Hinweis',
        'Genauer zeigen',
        'Erklärung ansehen',
      ])
        await page.getByRole('button', { name, exact: true }).click();
    }
    await help();
    await page.locator('#study-adopt').click();
    await page.locator('#next-step').click();
    await words();
    const second = await page.locator('#word-help dl').innerText();
    expect(second).not.toBe(first);
    if (n === 3)
      await expect(page.locator('#word-help')).toContainText('Überschuss');
    if (n === 5)
      await expect(page.locator('#word-help')).toContainText('Verbrauch');
    await page
      .getByRole('button', { name: 'Wörter schließen', exact: true })
      .click();
    await help();
    if (n !== 4) {
      for (const id of n === 3
        ? ['quality', 'process']
        : n === 5
          ? ['repair', 'tech']
          : ['same', 'extra']) {
        await page.locator('#try-' + id).click();
        await page.locator('#study-adopt').click();
      }
    }
    await page.locator('#study-adopt').click();
    await page.locator('#next-step').click();
    await words();
    await expect(page.locator('#word-help dt')).toHaveText([
      'Vorschlag',
      'Beleg',
      'Grenze',
      'Gewichten',
    ]);
    await expect(page.locator('#word-help')).toContainText(
      'keine Landesgrenze',
    );
    expect(await page.locator('#word-help dl').innerText()).not.toBe(second);
    const c =
      n === 3
        ? ['quality', 'surplus', 'process']
        : n === 4
          ? ['payout', 'payout', 'reserve']
          : n === 5
            ? ['repair', 'repair', 'tech']
            : ['same', 'save', 'extra'];
    await page
      .getByRole('button', { name: 'Wörter schließen', exact: true })
      .click();
    for (const [f, v] of [
      ['proposal', c[0]],
      ['goal', c[1]],
      ['benefit', c[0]],
      ['limit', c[0]],
    ])
      await studyClick(page, `#study-${f}-${v}`, 'check');
    await page.locator('#check-answer').click();
    await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
    expect(
      (await saved(page)).studies[
        n === 3 ? 'cocoa' : n === 4 ? 'share' : n === 5 ? 'water' : 'area'
      ].decision.supported,
    ).toBeUndefined();
    await studyClick(page, '#study-proposal-' + c[2], 'check');
    await studyClick(page, '#study-benefit-' + c[2], 'check');
    await studyClick(page, '#study-limit-' + c[2], 'check');
    await page.locator('#check-answer').click();
    await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
    await expect(page.locator('[data-feedback]')).toContainText(
      'noch nicht verbunden',
    );
    await words();
    await page.reload();
    await expect(page.locator('#word-help dt')).toHaveText([
      'Vorschlag',
      'Beleg',
      'Grenze',
      'Gewichten',
    ]);
    if (n === 3) {
      expect((await auditAccessibility(page)).violations).toEqual([]);
      await page.screenshot({
        path: evidencePath('cocoa-decision-words.png'),
        fullPage: true,
      });
    }
  });
test('P2-01 confirmed early answers keep their provenance in the full learning product', async ({
  page,
}) => {
  const { finish2A, chooseRoute, setGoal, selectEvidence } =
    await import('./phase2a-helpers.ts');
  await page.goto('/');
  await page.getByRole('button', { name: 'Spiel starten' }).click();
  for (const step of [0, 1, 2]) {
    if (step === 0) {
      await page.locator('#foot-platz').check();
      await page.locator('#bus-direct').check();
    } else
      await page.locator('#person-' + (step === 1 ? 'amina' : 'david')).check();
    await page.locator('#check-answer').click();
    for (const name of [
      'Ich brauche einen Hinweis',
      'Genauer zeigen',
      'Erklärung ansehen',
    ])
      await page.getByRole('button', { name, exact: true }).click();
    await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
    await page.locator('#next-step').click();
  }
  await finish2A(page);
  await chooseRoute(page, 'Über Nord');
  await setGoal(page, 'school');
  await selectEvidence(page, 'advantage', 'amina-north-direct');
  await selectEvidence(page, 'disadvantage', 'david-north-direct');
  await page.locator('#check-answer').click();
  await page.locator('#next-step').click();
  await expect(
    page.locator('[data-explanation-after-confirmation]'),
  ).toHaveCount(3);
  await expect(page.locator('[data-supported]')).toHaveCount(0);
  await page.reload();
  await expect(
    page.locator('[data-explanation-after-confirmation]'),
  ).toHaveCount(3);
});
