import { test, expect } from '@playwright/test';
import { auditAccessibility } from './accessibility.ts';
import { evidencePath } from './artifacts.ts';
for (const device of [
  { name: 'desktop', width: 1440, height: 1000, touch: false },
  { name: 'ipad-portrait', width: 768, height: 1024, touch: true },
  { name: 'ipad-landscape', width: 1024, height: 768, touch: true },
])
  test(`phase5 orientation via actual map coordinates on ${device.name}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: device,
      hasTouch: device.touch,
      isMobile: device.touch,
      baseURL: 'http://127.0.0.1:4173',
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('requestfailed', (r) => errors.push(r.url()));
    page.on('response', (r) => {
      if (r.status() >= 400) errors.push(r.status() + ':' + r.url());
    });
    await page.goto('/');
    for (const [id, name, city, lon, lat, region] of [
      ['KEN', 'Kenia', 'Nairobi', 36.814711, -1.281401, 'Ostafrika'],
      ['GHA', 'Ghana', 'Kumasi', -1.63196, 6.691937, 'Westafrika'],
      ['MAR', 'Marokko', 'Agadir', -9.620044, 30.439988, 'Nordafrika'],
    ] as const) {
      const target = page.locator('#geo-target-' + id);
      if (device.touch) await target.tap();
      else await target.click();
      await page.locator('.africa-overview').scrollIntoViewIfNeeded();
      const point = await page.locator('.africa-overview').evaluate(
        (e, p) => {
          const m = (e as SVGSVGElement).getScreenCTM()!;
          const v = new DOMPoint(
            24 + (p.lon + 20) * 9.2,
            24 + (38 - p.lat) * 9.2,
          ).matrixTransform(m);
          return { x: v.x, y: v.y };
        },
        { lon, lat },
      );
      if (device.touch) await page.touchscreen.tap(point.x, point.y);
      else await page.mouse.click(point.x, point.y);
      await expect(page.locator('#geo-country-' + id)).toHaveAccessibleName(
        name + ' ' + city,
      );
      await expect(page.locator('#geo-country-' + id)).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      if (device.touch) await page.locator('#geo-check').tap();
      else await page.locator('#geo-check').click();
      await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
      await expect(page.locator('[data-feedback]')).toContainText(region);
      await expect(page.locator('.geo-place')).toContainText(city);
    }
    expect((await auditAccessibility(page)).violations).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
    if (device.name !== 'ipad-landscape')
      await page.screenshot({
        path: evidencePath('phase5-map-' + device.name + '.png'),
        fullPage: true,
      });
    await context.close();
  });
test('phase5 orientation missing answer, two wrong attempts, truthful selected names, distinct hints and conscious example/reload', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#geo-check').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/hint/);
  await page.locator('#geo-pick-KEN').click();
  await page.locator('#geo-check').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/incorrect/);
  await page.locator('#geo-check').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/hint/);
  await expect(page.locator('#help-title')).toHaveText('→ Hilfe 3 von 3');
  await expect(page.locator('#geo-country-GHA')).toHaveAccessibleName(
    'Ghana Kumasi',
  );
  await expect(page.locator('#geo-country-GHA')).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(page.locator('#geo-country-KEN')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('.geo-place')).toHaveText(
    'Gezeigtes Beispiel: Kumasi in Ghana.',
  );
  expect((await auditAccessibility(page)).violations).toEqual([]);
  await page.locator('#geo-adopt').click();
  await expect(page.locator('.orientation')).toContainText(
    'Ghana: Lage mit Beispiel.',
  );
  await page.reload();
  await expect(page.locator('#geo-country-GHA')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.locator('#episode-4').click();
  await page
    .getByRole('button', { name: 'Episoden auswählen', exact: true })
    .click();
  await expect(page.locator('.orientation')).toContainText(
    'Ghana: Lage mit Beispiel.',
  );
  await page
    .getByRole('button', { name: 'Lage neu erkunden', exact: true })
    .click();
  const hints: string[] = [];
  for (const name of [
    'Ich brauche einen Hinweis',
    'Genauer zeigen',
    'Erklärung ansehen',
  ]) {
    await page.getByRole('button', { name, exact: true }).click();
    hints.push(await page.locator('.help-panel p').innerText());
  }
  expect(new Set(hints).size).toBe(3);
});
test('phase5 keyboard reaches SVG and HTML alternatives and updates computed names in both directions', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#geo-target-KEN').focus();
  await page.keyboard.press('Enter');
  await page.locator('#geo-country-KEN').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#geo-country-KEN')).toHaveAccessibleName(
    'Kenia Nairobi',
  );
  await page.locator('#geo-pick-GHA').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#geo-country-KEN')).toHaveAccessibleName('Kenia');
  await expect(page.locator('#geo-country-GHA')).toHaveAccessibleName(
    'Ghana Kumasi',
  );
  await page.locator('#geo-pick-KEN').focus();
  await page.keyboard.press('Space');
  await page.locator('#geo-check').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
  await page.locator('#geo-target-MAR').focus();
  const seen = new Set<string>();
  for (let i = 0; i < 18; i++) {
    await page.keyboard.press('Tab');
    const id = await page.evaluate(() => document.activeElement?.id ?? '');
    seen.add(id);
    if (
      [
        'geo-country-KEN',
        'geo-country-GHA',
        'geo-country-MAR',
        'geo-pick-KEN',
        'geo-pick-GHA',
        'geo-pick-MAR',
      ].every((v) => seen.has(v))
    )
      break;
  }
  for (const id of [
    'geo-country-KEN',
    'geo-country-GHA',
    'geo-country-MAR',
    'geo-pick-KEN',
    'geo-pick-GHA',
    'geo-pick-MAR',
  ])
    expect(seen.has(id)).toBe(true);
});
test('phase5 all six episodes start without completed map work', async ({
  page,
}) => {
  for (const n of [1, 2, 3, 4, 5, 6]) {
    await page.goto('/');
    if (n === 1)
      await page.getByRole('button', { name: 'Spiel starten' }).click();
    else if (n === 2)
      await page
        .getByRole('button', { name: 'Episode 2 starten', exact: true })
        .click();
    else await page.locator('#episode-' + n).click();
    await expect(page.locator('#task-title')).toBeVisible();
    await page
      .getByRole('button', { name: 'Episoden auswählen', exact: true })
      .click();
  }
});
