import { evidencePath } from './artifacts.ts';
import { chooseRoute, ownTextPanel, panel, selectEvidence, weightSelected } from './phase2a-helpers.ts';
import { finish2A } from './phase2a-helpers.ts';
import { test, expect, type Page } from '@playwright/test';
import { auditAccessibility } from './accessibility.ts';

async function start(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Spiel starten' }).click();
}
async function explainAndNext(page: Page) {
  await page.getByRole('button', { name: 'Ich brauche einen Hinweis' }).click();
  await page.getByRole('button', { name: 'Genauer zeigen' }).click();
  await page.getByRole('button', { name: 'Erklärung ansehen' }).click();
  await page.getByRole('button', { name: 'Weiter →', exact: true }).click();
}
async function toDecision(page: Page) {
  await start(page);
  for (let i = 0; i < 3; i++) await explainAndNext(page);
  await finish2A(page);
}
async function noHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}

test('complete mouse flow, route changes, all times, all three valid recommendations and restart', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await start(page);
  await page.getByRole('radio', { name: /Zum Platz/ }).check();
  await page.getByRole('radio', { name: /Platz → Zentrum/ }).check();
  await page.getByRole('button', { name: 'Weg prüfen', exact: true }).click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
  await expect(page.locator('[data-feedback]')).toContainText('22 Minuten');
  await page.getByRole('button', { name: 'Weiter →', exact: true }).click();
  await expect(page.locator('.comparison')).toContainText('22 Min.');
  for (const value of [10, 12, 18])
    await expect(page.locator('.comparison')).toContainText(`${value} Min.`);
  await page.getByRole('button', { name: 'Über Nord', exact: true }).click();
  await expect(page.locator('#map-bus-north')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('#map-bus-direct')).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await page.getByRole('button', { name: 'Direkt', exact: true }).click();
  await expect(page.locator('#map-bus-direct')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  const point = await page
    .locator('#map-bus-north .path-hit')
    .first()
    .evaluate((el) => {
      const path = el as SVGPathElement;
      const p = path.getPointAtLength(path.getTotalLength() * 0.65);
      const m = path.getScreenCTM()!;
      return { x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f };
    });
  await page.mouse.click(point.x, point.y);
  await expect(
    page.getByRole('button', { name: 'Über Nord', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('radio', { name: 'Amina', exact: true }).check();
  await page.getByRole('button', { name: 'Weg prüfen', exact: true }).click();
  await page.getByRole('button', { name: 'Weiter →', exact: true }).click();
  await page.getByRole('radio', { name: 'David', exact: true }).check();
  await page.getByRole('button', { name: 'Weg prüfen', exact: true }).click();
  await page.getByRole('button', { name: 'Weiter →', exact: true }).click();
  await finish2A(page);
  for (const [route, advantage, disadvantage] of [
    ['Direkt', 'david-direct-north', 'amina-direct-north'],
    ['Über Nord', 'amina-north-direct', 'david-north-direct'],
    ['Über Süd', 'leila-south-direct', 'david-south-direct'],
  ]) {
    await chooseRoute(page, route);
    await selectEvidence(page, 'advantage', advantage);
    await selectEvidence(page, 'disadvantage', disadvantage);
    await weightSelected(page);
    await page.getByRole('button', { name: 'Empfehlung prüfen' }).click();
    await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
    await expect(page.locator('[data-feedback]')).toContainText(
      'Du belegst den Vorteil',
    );
    await expect(
      page.getByRole('button', { name: 'Zum Abschluss' }),
    ).toBeVisible();
  }
  await page.getByRole('button', { name: 'Zum Abschluss' }).click();
  await expect(
    page.getByRole('heading', { name: 'Ein Busweg. Drei Perspektiven.' }),
  ).toBeVisible();
  await expect(page.locator('.recommendation')).toContainText('Über Süd');
  await page
    .getByRole('button', { name: 'Empfehlung noch einmal ansehen' })
    .click();
  await panel(page, 'plan');
  await expect(page.getByRole('radio', { name: 'Über Süd', exact: true })).toBeChecked();
  await panel(page, 'weigh');
  await page.getByRole('button', { name: 'Zum Abschluss' }).click();
  await page.getByRole('button', { name: 'Neu spielen', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Spiel starten' }),
  ).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
  expect(errors).toEqual([]);
});

test('partial and incorrect feedback, two-attempt explanation, three hints and transfer', async ({
  page,
}) => {
  await start(page);
  await page.getByRole('button', { name: 'Weg prüfen', exact: true }).click();
  await expect(page.locator('[data-feedback]')).toContainText(
    'Wähle einen Fußweg',
  );
  await page.getByRole('radio', { name: /Zum Platz/ }).check();
  await page.getByRole('radio', { name: /Nord → Zentrum/ }).check();
  await page.getByRole('button', { name: 'Weg prüfen', exact: true }).click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/partial/);
  await expect(page.locator('[data-feedback]')).toContainText(
    'Fußweg zum Platz passt',
  );
  await page.getByRole('button', { name: 'Weg prüfen', exact: true }).click();
  await expect(page.locator('.help-panel')).toContainText('22 Minuten');
  await expect(
    page.getByRole('button', { name: 'Weiter →', exact: true }),
  ).toBeVisible();
  await page.getByText('Probiere einen neuen Weg', { exact: false }).click();
  await page.getByRole('radio', { name: '10 Minuten', exact: true }).check();
  await page.getByRole('button', { name: 'Neuen Weg prüfen' }).click();
  await expect(page.locator('.transfer .feedback')).toHaveClass(/incorrect/);
  await page.getByRole('button', { name: 'Neuen Weg prüfen' }).click();
  await expect(page.locator('.transfer .feedback')).toContainText('13 Minuten');
  await page.getByRole('button', { name: 'Weiter →', exact: true }).click();
  await page.getByRole('radio', { name: 'David', exact: true }).check();
  await page.getByRole('button', { name: 'Weg prüfen', exact: true }).click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/incorrect/);
  await expect(page.locator('[data-feedback]')).not.toContainText('10 Minuten');
  await page.getByRole('button', { name: 'Ich brauche einen Hinweis' }).click();
  await expect(page.locator('.help-panel')).toContainText('Hilfe 1 von 3');
  await page.getByRole('button', { name: 'Genauer zeigen' }).click();
  await expect(page.locator('.help-panel')).toContainText('Hilfe 2 von 3');
  await expect(page.locator('.comparison .evidence-highlight')).toContainText(
    'Amina',
  );
  await page.getByRole('button', { name: 'Erklärung ansehen' }).click();
  await page.getByText('Probiere einen neuen Weg', { exact: false }).click();
  await page.getByRole('radio', { name: '13 Minuten', exact: true }).check();
  await page.getByRole('button', { name: 'Neuen Weg prüfen' }).click();
  await expect(page.locator('.transfer .feedback')).toHaveClass(/correct/);
  await page.getByRole('button', { name: 'Weiter →', exact: true }).click();
  await page.getByRole('button', { name: '← Zurück', exact: true }).click();
  await expect(page.locator('.help-panel')).toContainText('Hilfe 3 von 3');
  await page.getByRole('button', { name: 'Aufgabe neu bearbeiten' }).click();
  await expect(page.locator('.help-panel')).toHaveCount(0);
  await expect(
    page.getByRole('radio', { name: 'David', exact: true }),
  ).not.toBeChecked();
});

test('free text is stored locally, never keyword-graded, escaped and editable after reload', async ({
  page,
}) => {
  const outbound: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith('http://127.0.0.1:')) outbound.push(r.url());
  });
  await toDecision(page);
  await chooseRoute(page, 'Direkt');
  await ownTextPanel(page);
  await page.getByText('Mit eigenen Worten', { exact: false }).click();
  const text = '<img src=x onerror=alert(1)> amina gut bus???';
  await page.getByLabel('Ich schlage diesen Busweg vor, weil …').fill(text);
  await weightSelected(page);
  await page.getByRole('button', { name: 'Empfehlung prüfen' }).click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
  await expect(page.locator('[data-feedback]')).toContainText(
    'kann sie nicht sicher prüfen',
  );
  await expect(page.locator('[data-feedback]')).toContainText(
    'wurde gespeichert',
  );
  await page.getByRole('button', { name: 'Eigenen Text unbewertet abgeben' }).click();
  await page.reload();
  await expect(
    page.getByLabel('Ich schlage diesen Busweg vor, weil …'),
  ).toHaveValue(text);
  await page.getByRole('button', { name: 'Zum Abschluss' }).click();
  await expect(page.locator('.saved-text')).toHaveText(text);
  await expect(page.locator('.recommendation img')).toHaveCount(0);
  expect(outbound).toEqual([]);
  await page
    .getByRole('button', { name: 'Empfehlung noch einmal ansehen' })
    .click();
  await page
    .getByLabel('Ich schlage diesen Busweg vor, weil …')
    .fill('Neue Gedanken');
  await expect(page.getByRole('button', { name: 'Zum Abschluss' })).toHaveCount(
    0,
  );
});

test('open decision feedback recognizes a partial argument without rejecting the route', async ({
  page,
}) => {
  await toDecision(page);
  await chooseRoute(page, 'Über Nord');
  await selectEvidence(page, 'advantage', 'amina-north-direct');
  await weightSelected(page);
  await page.getByRole('button', { name: 'Empfehlung prüfen' }).click();
  await expect(page.locator('[data-feedback]')).toContainText(
    'Du belegst den Vorteil',
  );
  await expect(page.locator('[data-feedback]')).toContainText(
    'Ergänze auch einen Nachteil',
  );
  await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
  await selectEvidence(page, 'disadvantage', 'amina-north-direct');
  await weightSelected(page);
  await page.getByRole('button', { name: 'Empfehlung prüfen' }).click();
  await expect(page.locator('[data-feedback]')).toContainText(
    'Prüfe deinen Nachteil',
  );
  await expect(page.getByRole('button', { name: 'Zum Abschluss' })).toHaveCount(
    0,
  );
});

test('rapid clicks cannot skip tasks and restart requires a deliberate confirmation', async ({
  page,
}) => {
  await start(page);
  await page.getByRole('radio', { name: /Zum Platz/ }).check();
  await page.getByRole('radio', { name: /Platz → Zentrum/ }).check();
  await page
    .getByRole('button', { name: 'Weg prüfen', exact: true })
    .dblclick();
  await page.getByRole('button', { name: 'Weiter →', exact: true }).dblclick();
  await expect(
    page.getByRole('heading', {
      name: 'Für wen wird der Weg über Nord kürzer?',
    }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Neu starten', exact: true }).click();
  await page.getByRole('button', { name: 'Abbrechen', exact: true }).click();
  await expect(
    page.getByRole('heading', {
      name: 'Für wen wird der Weg über Nord kürzer?',
    }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Neu starten', exact: true }).click();
  await page
    .getByRole('button', { name: 'Ja, neu starten', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Spiel starten' }),
  ).toBeVisible();
});

test('keyboard can operate start, SVG paths, radio groups, checking and word help', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Zum Inhalt' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('button', { name: 'Spiel starten' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await page.locator('#walk-platz').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('radio', { name: /Zum Platz/ })).toBeChecked();
  await page.locator('#map-bus-direct').focus();
  await page.keyboard.press('Space');
  await expect(
    page.getByRole('radio', { name: /Platz → Zentrum/ }),
  ).toBeChecked();
  await page.getByRole('button', { name: 'Weg prüfen', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#feedback-title')).toBeFocused();
  await page.getByRole('button', { name: 'Weiter →', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('radio', { name: 'Amina', exact: true }).focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Weg prüfen', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
  await page.getByRole('button', { name: 'Wörter erklären' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#word-help')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#word-help')).toHaveCount(0);
});

test('blocked session storage does not prevent the full workflow', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'sessionStorage', {
      get() {
        throw new DOMException('Blocked', 'SecurityError');
      },
    }),
  );
  await toDecision(page);
  await chooseRoute(page, 'Direkt');
  await ownTextPanel(page);
  await page.getByText('Mit eigenen Worten', { exact: false }).click();
  await page
    .getByLabel('Ich schlage diesen Busweg vor, weil …')
    .fill('David ist schneller.');
  await weightSelected(page);
  await page.getByRole('button', { name: 'Empfehlung prüfen' }).click();
  await expect(page.locator('[data-feedback]')).toContainText('erlaubt kein Speichern');
  await page.getByRole('button', { name: 'Eigenen Text unbewertet abgeben' }).click();
  await page.getByRole('button', { name: 'Zum Abschluss' }).click();
  await expect(page.locator('.saved-text')).toHaveText('David ist schneller.');
});

test('production assets work under the GitHub Pages repository prefix', async ({
  page,
}) => {
  const failed: string[] = [];
  page.on('response', (r) => {
    if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
  });
  await page.goto('http://127.0.0.1:4174/Afrika-2040/');
  await page.getByRole('button', { name: 'Spiel starten' }).click();
  await expect(
    page.getByRole('heading', { name: 'Zeige Aminas Weg zur Schule.' }),
  ).toBeVisible();
  expect(
    await page.locator('body').evaluate((el) => getComputedStyle(el).marginTop),
  ).toBe('0px');
  expect(failed).toEqual([]);
});

test('axe finds no WCAG A/AA issues in start, task, expanded help, decision and ending', async ({
  page,
}) => {
  await page.goto('/');
  for (const stage of ['start', 'task', 'help', 'decision', 'end']) {
    if (stage === 'task')
      await page.getByRole('button', { name: 'Spiel starten' }).click();
    if (stage === 'help') {
      await page.getByRole('button', { name: 'Wörter erklären' }).click();
      await page
        .getByRole('button', { name: 'Ich brauche einen Hinweis' })
        .click();
    }
    if (stage === 'decision') {
      for (let i = 0; i < 3; i++) {
        if (i === 0) {
          await page.getByRole('button', { name: 'Genauer zeigen' }).click();
          await page.getByRole('button', { name: 'Erklärung ansehen' }).click();
          await page
            .getByRole('button', { name: 'Weiter →', exact: true })
            .click();
        } else await explainAndNext(page);
      }
      await finish2A(page);
    }
    if (stage === 'end') {
      await chooseRoute(page, 'Direkt');
      await selectEvidence(page, 'advantage', 'david-direct-north');
      await selectEvidence(page, 'disadvantage', 'amina-direct-north');
      await weightSelected(page);
      await page.getByRole('button', { name: 'Empfehlung prüfen' }).click();
      await page.getByRole('button', { name: 'Zum Abschluss' }).click();
    }
    const results = await auditAccessibility(page);
    expect(results.violations, stage).toEqual([]);
  }
});

test('all closed feedback colors and the neutral decision remain accessible', async ({
  page,
}) => {
  await start(page);
  const scan = async () => {
    const result = await auditAccessibility(page);
    expect(result.violations).toEqual([]);
  };
  await page.getByRole('radio', { name: /Nach Nord/ }).check();
  await page.getByRole('radio', { name: /Nord → Zentrum/ }).check();
  await page.getByRole('button', { name: 'Weg prüfen', exact: true }).click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/incorrect/);
  await scan();
  await page.getByRole('button', { name: 'Aufgabe neu bearbeiten' }).click();
  await page.getByRole('radio', { name: /Zum Platz/ }).check();
  await page.getByRole('radio', { name: /Nord → Zentrum/ }).check();
  await page.getByRole('button', { name: 'Weg prüfen', exact: true }).click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/partial/);
  await scan();
  await page.getByRole('radio', { name: /Platz → Zentrum/ }).check();
  await page.getByRole('button', { name: 'Weg prüfen', exact: true }).click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
  await scan();
  await page.getByRole('button', { name: 'Weiter →', exact: true }).click();
  for (let i = 0; i < 2; i++) await explainAndNext(page);
  await finish2A(page);
  await chooseRoute(page, 'Direkt');
  await selectEvidence(page, 'advantage', 'david-direct-north');
  await weightSelected(page);
  await page.getByRole('button', { name: 'Empfehlung prüfen' }).click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
  await scan();
});

for (const viewport of [
  { width: 1440, height: 1000, name: 'desktop' },
  { width: 1024, height: 768, name: 'ipad-landscape' },
  { width: 768, height: 1024, name: 'ipad-portrait' },
  { width: 390, height: 844, name: 'phone' },
]) {
  test(`touch layout and complete supported play at ${viewport.name}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      hasTouch: true,
      isMobile: viewport.name !== 'desktop',
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173');
    await noHorizontalOverflow(page);
    if (viewport.name === 'desktop') {
      await page.screenshot({
        path: evidencePath('start-desktop.png'),
        fullPage: true,
      });
    }
    await page.getByRole('button', { name: 'Spiel starten' }).tap();
    await noHorizontalOverflow(page);
    await page.getByRole('radio', { name: /Zum Platz/ }).tap();
    await page.getByRole('radio', { name: /Platz → Zentrum/ }).tap();
    await page.getByRole('button', { name: 'Weg prüfen', exact: true }).tap();
    await page.getByRole('button', { name: 'Weiter →', exact: true }).tap();
    await page.getByRole('button', { name: 'Über Nord', exact: true }).tap();
    await expect(page.locator('#map-bus-north')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    for (const selector of [
      '.route-button',
      '.primary',
      '.person-choices .choice',
    ]) {
      for (const el of await page.locator(selector).all()) {
        const box = await el.boundingBox();
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }
    }
    await page.getByRole('radio', { name: 'Amina', exact: true }).tap();
    await page.getByRole('button', { name: 'Weg prüfen', exact: true }).tap();
    await page.screenshot({
      path: evidencePath(`map-${viewport.name}.png`),
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Weiter →', exact: true }).tap();
    await page.getByRole('radio', { name: 'David', exact: true }).tap();
    await page.getByRole('button', { name: 'Weg prüfen', exact: true }).tap();
    await page.getByRole('button', { name: 'Weiter →', exact: true }).tap();
    await finish2A(page, true);
    await chooseRoute(page, 'Über Nord', true);
    await selectEvidence(page, 'advantage', 'amina-north-direct');
    await selectEvidence(page, 'disadvantage', 'david-north-direct');
    await noHorizontalOverflow(page);
    await weightSelected(page);
    await page.getByRole('button', { name: 'Empfehlung prüfen' }).tap();
    await page.getByRole('button', { name: 'Zum Abschluss' }).tap();
    await expect(page.locator('.recommendation')).toContainText('Über Nord');
    await noHorizontalOverflow(page);
    await context.close();
  });
}
