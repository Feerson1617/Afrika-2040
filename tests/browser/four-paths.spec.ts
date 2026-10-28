import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync, readFileSync } from 'node:fs';
import { profileIds, profiles } from '../../src/learning/profiles.ts';
import { tasksFor } from '../../src/learning/tasks.ts';
import { exampleValue } from '../../src/learning/progress.ts';
import { evidencePath } from './artifacts.ts';
const key = 'afrika-2040:kenia-bus:v2a';
const tags = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22a',
  'wcag22aa',
];
async function learning(page: Page) {
  return page.evaluate(
    (key) => JSON.parse(sessionStorage.getItem(key)!).learning,
    key,
  );
}
const op = (page: Page, name: string) =>
  page.locator(`[data-action="learning"][data-op="${name}"]`).first();
for (const profile of profileIds)
  for (const unit of ['c', 's1'] as const)
    for (const supported of [false, true])
      test(`Afrika curriculum four paths ${unit}/${profile} supported=${supported}: actual complete flow and honest journal`, async ({
        browser,
        browserName,
      }) => {
        const context = await browser.newContext({
          viewport: supported
            ? { width: 1024, height: 768 }
            : { width: 1440, height: 1000 },
          hasTouch: supported,
          isMobile: supported,
        });
        const page = await context.newPage();
        const errors: string[] = [],
          external: string[] = [];
        page.on('request', (r) => {
          if (!r.url().startsWith('http://127.0.0.1:4173/'))
            external.push(r.url());
        });
        page.on('pageerror', (e) => errors.push(e.message));
        await page.goto(
          `http://127.0.0.1:4173/?lernweg=${profile}&bereich=${unit}`,
        );
        const tasks = tasksFor(unit, profile);
        for (const [i, task] of tasks.entries()) {
          await expect(page.locator('h1')).toHaveText(task.title);
          await expect(page.locator('.header-caption')).toHaveText(
            unit === 'c' ? 'Bevölkerung untersuchen' : 'Kenia / Nairobi',
          );
          await expect(page.locator('aside.learning-scaffold')).toHaveCount(
            profiles[profile].standardHint ? 1 : 0,
          );
          if (profile === 'esa' && task.id.endsWith('.end'))
            await expect(page.locator('p.learning-scaffold')).toContainText(
              'Der Wanderungssaldo steht schon mit seinem Vorzeichen da.',
            );
          if (unit === 's1' && i === 0) {
            const svg = page.locator(
              'svg [role="button"][data-action="learning"]',
            );
            await svg.focus();
            await page.keyboard.press('Enter');
            await expect(svg).toHaveAttribute('aria-pressed', 'true');
            await expect(svg).toBeFocused();
            await expect(svg).toHaveAccessibleName(
              'Amina · Nord Zu Fuß: 2 Min. Benutzter Busabschnitt: 8 Min.',
            );
            await svg.press('Enter');
            await expect(svg).toHaveAttribute('aria-pressed', 'false');
            await expect(svg).toHaveAccessibleName(
              'Amina · Direkt Zu Fuß: 12 Min. Benutzter Busabschnitt: 10 Min.',
            );
            await page
              .getByRole('button', { name: 'David · Nord', exact: true })
              .click();
            await expect(
              page.getByRole('button', { name: 'David · Nord', exact: true }),
            ).toHaveAttribute('aria-pressed', 'true');
            await expect(page.locator('svg.study-scene')).toContainText(
              '16 Min.',
            );
          }
          if (supported) {
            for (let h = 0; h < 3; h++)
              await page.locator('#learning-help').tap();
            const before = await learning(page);
            expect(
              before.records[`${unit}.${profile}.v1`].attempts[task.id]
                .exampleUsed,
            ).toBe(false);
            await page.locator('#learning-adopt').tap();
          } else {
            for (const f of task.fields) {
              const el = page.locator('#learn-' + f.id);
              if (f.kind === 'choice') await el.selectOption(exampleValue(f));
              else
                await el.fill(
                  f.kind === 'text'
                    ? f.example!
                    : f.expected === '-10'
                      ? '−10'
                      : f.expected === '1020'
                        ? '1.020'
                        : exampleValue(f),
                );
            }
            await page.locator('#learning-check').press('Enter');
          }
          await expect(page.locator('#learning-next')).toBeVisible();
          const current = (await learning(page)).records[
            `${unit}.${profile}.v1`
          ].attempts[task.id];
          expect(current.exampleUsed).toBe(supported);
          expect(current.standardScaffold).toBe(profiles[profile].standardHint);
          if (task.fields.some((f) => f.kind === 'text')) {
            await expect(page.locator('[data-learning-feedback]')).toHaveClass(
              /neutral/,
            );
            expect(current.factual).toBe('ungraded');
            await page.locator('#learning-criteria').press('Enter');
            await expect(page.locator('.learning-criteria')).toContainText(
              task.criteria[0],
            );
            if (!supported) {
              const f = task.fields[0];
              await page
                .locator('#learn-' + f.id)
                .fill(f.example + ' Mein Zusatz.');
              await expect(page.locator('#learning-next')).toHaveCount(0);
              await page.locator('#learning-check').click();
              expect(
                (await learning(page)).records[`${unit}.${profile}.v1`]
                  .attempts[task.id].revised,
              ).toBe(true);
            }
          }
          if (i === 0) {
            const scan = await new AxeBuilder({ page })
              .withTags(tags)
              .analyze();
            expect(scan.violations).toEqual([]);
            await page.screenshot({
              path: evidencePath(
                `four-paths-${unit}-${profile}-${browserName}-${supported ? 'ipad-supported' : 'desktop'}-task.png`,
              ),
              fullPage: true,
            });
          }
          if (i === tasks.length - 1) {
            await page.reload();
            await expect(page.locator('h1')).toHaveText(task.title);
            await expect(page.locator('#learning-next')).toBeVisible();
          }
          await page.locator('#learning-next').click();
        }
        await expect(page.locator('h1')).toHaveText('Lernjournal · Lernwege');
        await expect(page.locator('.journal-record')).toHaveCount(1);
        const state = await learning(page);
        expect(
          Object.keys(state.records[`${unit}.${profile}.v1`].attempts),
        ).toHaveLength(tasks.length);
        if (profile === 'foerder')
          await expect(page.locator('.journal-record')).not.toContainText(
            'selbst gerechnet',
          );
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        expect(errors).toEqual([]);
        expect(external).toEqual([]);
        const scan = await new AxeBuilder({ page }).withTags(tags).analyze();
        expect(scan.violations).toEqual([]);
        await page.screenshot({
          path: evidencePath(
            `four-paths-${unit}-${profile}-${browserName}-${supported ? 'ipad-supported' : 'desktop'}-journal.png`,
          ),
          fullPage: true,
        });
        writeFileSync(
          evidencePath(
            `four-paths-${unit}-${profile}-${browserName}-${supported ? 'supported' : 'own'}-state.json`,
          ),
          JSON.stringify(
            {
              profile,
              unit,
              supported,
              tasks: tasks.length,
              characters: JSON.stringify(state).length,
              state,
            },
            null,
            2,
          ),
        );
        await context.close();
      });
test('Afrika curriculum four paths all twelve switches preserve drafts and restore the actual attempt', async ({
  page,
}) => {
  for (const from of profileIds)
    for (const to of profileIds.filter((p) => p !== from)) {
      await page.goto(`/?lernweg=${from}&bereich=c`);
      const task = tasksFor('c', from)[0],
        f = task.fields[0];
      if (f.kind === 'choice')
        await page.locator('#learn-' + f.id).selectOption(exampleValue(f));
      else await page.locator('#learn-' + f.id).fill('30');
      const before = (await learning(page)).records[`c.${from}.v1`];
      await op(page, 'profiles').click();
      await page
        .locator(`[data-op="request-profile"][data-value="${to}"]`)
        .click();
      await op(page, 'confirm-profile').click();
      const destination = (await learning(page)).records[`c.${to}.v1`];
      expect(
        destination.attempts[tasksFor('c', to)[0].id].identity.profileId,
      ).toBe(to);
      await op(page, 'profiles').click();
      await page
        .locator(`[data-op="request-profile"][data-value="${from}"]`)
        .click();
      await op(page, 'confirm-profile').click();
      expect((await learning(page)).records[`c.${from}.v1`]).toEqual(before);
      await page.reload();
      expect((await learning(page)).records[`c.${from}.v1`]).toEqual(before);
    }
});
test('Afrika curriculum four paths numeric feedback colors, format, explicit example and editing stay distinct', async ({
  page,
}) => {
  await page.goto('/?lernweg=ahr&bereich=c');
  for (const id of ['natural', 'migration', 'end'])
    await page.locator('#learn-' + id).fill('0');
  await page.locator('#learning-check').click();
  await expect(page.locator('[data-learning-feedback]')).toHaveClass(
    /incorrect/,
  );
  await expect(page.locator('[data-learning-feedback]')).toHaveCSS(
    'background-color',
    'rgb(255, 240, 236)',
  );
  await page.locator('#learn-natural').fill('30');
  await page.locator('#learn-end').fill('1.02');
  await page.locator('#learning-check').click();
  await expect(page.locator('[data-learning-feedback]')).toHaveClass(/partial/);
  await expect(page.locator('[data-learning-feedback]')).toContainText(
    'Diese Angabe passt.',
  );
  expect(
    (await learning(page)).records['c.ahr.v1'].attempts[
      'population.base.balance'
    ].failures,
  ).toBe(1);
  await page.locator('#learn-end').fill('999');
  await page.locator('#learning-check').click();
  await expect(page.locator('[data-learning-feedback]')).toHaveClass(/hint/);
  await expect(page.locator('[data-learning-feedback]')).toHaveCSS(
    'background-color',
    'rgb(255, 247, 218)',
  );
  await expect(page.locator('#learning-help-title')).toHaveText(
    'Hilfe 3 von 3',
  );
  expect(
    (await learning(page)).records['c.ahr.v1'].attempts[
      'population.base.balance'
    ].exampleUsed,
  ).toBe(false);
  await page.locator('#learning-adopt').click();
  await expect(page.locator('[data-learning-feedback]')).toHaveClass(/correct/);
  await page.locator('#learn-end').fill('1.020');
  await expect(page.locator('#learning-next')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('#learning-next')).toHaveCount(0);
  await expect(page.locator('[data-learning-feedback]')).toHaveCount(0);
  await page.locator('#learning-check').click();
  expect(
    (await learning(page)).records['c.ahr.v1'].attempts[
      'population.base.balance'
    ].exampleUsed,
  ).toBe(true);
});
test('Afrika curriculum four paths legacy, narrow Pages content, blocked storage and global restart', async ({
  browser,
  browserName,
}) => {
  const context = await browser.newContext({
    viewport: { width: 720, height: 900 },
    baseURL: 'http://127.0.0.1:4174',
  });
  const page = await context.newPage();
  const old = JSON.parse(
    readFileSync(
      new URL('../fixtures/inquiry-5785267.json', import.meta.url),
      'utf8',
    ),
  );
  await page.goto('/Afrika-2040/');
  await page.evaluate(
    ({ key, old }) => sessionStorage.setItem(key, JSON.stringify(old)),
    { key, old },
  );
  await page.goto('/Afrika-2040/?lernweg=foerder&bereich=c');
  await op(page, 'menu').click();
  await expect(
    page.getByRole('heading', {
      name: 'Bisheriger Lernweg, ohne Niveaueinstufung',
    }),
  ).toBeVisible();
  await page.locator('#learn-population').click();
  await page.locator('#learning-help').click();
  await page.locator('#learning-help').click();
  await page.locator('#learning-help').click();
  await page.locator('#learning-adopt').click();
  await op(page, 'ask-reset').click();
  await expect(page.locator('.restart-confirm')).toContainText(
    'alle Lernwege, Themen, Episoden und dein Lernjournal',
  );
  await page.locator('[data-action="cancel-restart"]').click();
  expect((await learning(page)).records['c.foerder.v1']).toBeTruthy();
  await page.screenshot({
    path: evidencePath(`four-paths-narrow-${browserName}.png`),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await op(page, 'ask-reset').click();
  await page.locator('[data-action="restart"]').click();
  await page.goto('/Afrika-2040/');
  expect(
    await page.evaluate((key) => sessionStorage.getItem(key), key),
  ).toBeNull();
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', {
      get() {
        throw new DOMException('Blocked', 'SecurityError');
      },
    });
  });
  await page.goto('/Afrika-2040/?lernweg=foerder&bereich=c');
  await page.locator('#learn-direction').selectOption('more');
  await page.locator('#learning-check').click();
  await expect(page.locator('#storage-warning')).toBeVisible();
  await expect(page.locator('#learning-next')).toBeVisible();
  await context.close();
});

test('Afrika curriculum four paths actual narrow content iframe supports material keyboard and arithmetic', async ({
  page,
  browserName,
}) => {
  await page.route('**/learning-frame', (r) =>
    r.fulfill({
      contentType: 'text/html',
      body: '<html lang="de"><title>Lokaler Frame-Test</title><iframe title="Lernweg" src="/Afrika-2040/?lernweg=msa&bereich=s1" style="width:640px;height:650px;border:0" sandbox="allow-scripts allow-same-origin"></iframe></html>',
    }),
  );
  await page.goto('http://127.0.0.1:4174/learning-frame');
  const f = page.frameLocator('iframe');
  await f.locator('#learning-route-switch').press('Enter');
  await expect(f.locator('#learning-route-switch')).toBeFocused();
  await f.locator('#learn-section').selectOption('used');
  await f.locator('#learning-check').press('Enter');
  await f.locator('#learning-next').click();
  for (const [key, value] of Object.entries({
    'amina-direct': '22',
    'amina-north': '10',
    'david-direct': '12',
    'david-north': '18',
  }))
    await f.locator('#learn-' + key).fill(value);
  await f.locator('#learning-check').click();
  await expect(f.locator('[data-learning-feedback]')).toHaveClass(/correct/);
  expect(
    await f
      .locator('body')
      .evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true);
  await page.screenshot({
    path: evidencePath(`four-paths-frame-${browserName}.png`),
    fullPage: true,
  });
});
