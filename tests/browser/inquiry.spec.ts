import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { evidencePath } from './artifacts.ts';
const answers = {
  image: [
    { detail: 'stalls', origin: 'jbdodane', scope: 'place' },
    { counter: 'built', missing: 'life' },
  ],
  nature: [
    {
      'ghana-season': 'may-sep',
      'morocco-season': 'oct-apr',
      location: 'morocco',
    },
    { rain: 'tanger', adapt: 'limited' },
  ],
  population: [
    { natural: '30', migration: '-10', end: '1020' },
    { trend: 'increase', status: 'estimate', condition: 'conditional' },
  ],
  economy: [
    { 'surplus-a': '80', 'surplus-b': '60', first: '20' },
    { access: 'share', growth: 'real', conditions: 'together' },
  ],
  future: [
    { reach: 'shade', environment: 'energy', cost: 'running' },
    {
      plan: 'cool',
      goal: 'loss',
      evidence: 'cool',
      limit: 'cool',
      unknown: 'cool',
    },
  ],
} as const;
type Topic = keyof typeof answers;
const own: Record<Topic, string[]> = {
  image: [
    'Im Foto aus Kumasi sehe ich Verkaufsstände; meine erste Vorstellung war zu eng.',
    'Der gebaute Weg im Kakum-Nationalpark zeigt ebenfalls Nutzung. Zwei Fotos stehen nicht für ganz Afrika.',
    'Ich ergänze in der Schulzeitung den Markt mit Ort und Datum. Auch das zeigt nur einen Ausschnitt.',
  ],
  nature: [
    'In Nordghana ist laut Bericht von Mai bis September Regenzeit. Dann könnte Regen gesammelt werden.',
    'Der Speicher kann trockene Zeiten überbrücken; Vorrat und Zugang bleiben begrenzt.',
    'Bei kleinerem Speicher prüfe ich zuerst den Bedarf und begrenze die Nutzung.',
  ],
  population: [
    'Natürlich: +16; Wanderung: -12; Ende: 804 Personen.',
    'Ghana: 2000 rund 19,6 Millionen, 2024 rund 34,4 Millionen. Es sind historische Schätzungen.',
    'Ausbildung und Arbeitsplätze können Chancen eröffnen. Ohne zusätzliche Infrastruktur können Schulplätze fehlen.',
  ],
  economy: [
    '2022: 85,1 Prozent; 2023: 89,5 Prozent Stromzugang. Das sagt nichts über Ausfälle.',
    'Zuverlässiger Strom ermöglicht Maschinenbetrieb; Kenntnisse zu Preisgestaltung und Transport können beim Verkauf helfen.',
    'Ich prüfe Einnahmen minus laufende Kosten und trenne die Investition. Für Lebensbedingungen fehlen Verteilungsdaten.',
  ],
  future: [
    'Ich empfehle den Kühlraum, um Verderb zu verringern. Er kühlt empfindliche Lebensmittel, aber nur 30 Stände erhalten Zugang.',
    'Sozial erreichen wir 30 Stände; wirtschaftlich kostet es einmalig 80 und monatlich 12 GE; ökologisch bleiben Energiebedarf und Entsorgung. Schutz der Ware ist mir trotz des begrenzten Zugangs wichtiger.',
    'Ich frage nach Zuständigkeit und Finanzierung der Wartung. Bis zur Klärung bleibt meine Empfehlung vorläufig.',
  ],
};
const click = async (page: Page, op: string, touch = false, value?: string) => {
  const l = page
    .locator(
      `[data-action="inquiry"][data-op="${op}"]${value !== undefined ? `[data-value="${value}"]` : ''}`,
    )
    .first();
  if (touch) await l.tap();
  else await l.click();
};
async function open(page: Page, id: Topic, touch = false) {
  await page.goto('/');
  if (touch) await page.locator('#inquiry-open').tap();
  else await page.locator('#inquiry-open').click();
  await click(page, 'topic', touch, id);
  if (id === 'image') {
    await expect(page.locator('.inquiry-photo')).toHaveCount(0);
    await page.locator('#inq-initial').fill('Zuerst denke ich nur an Natur.');
    await click(page, 'initial-save', touch);
    for (const key of ['market', 'forest']) {
      await click(page, 'material', touch, key);
      await expect(page.locator('.inquiry-photo')).toBeVisible();
      await expect
        .poll(() =>
          page
            .locator('.inquiry-photo')
            .evaluate(
              (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
            ),
        )
        .toBe(true);
    }
  }
  if (id === 'future')
    for (const key of ['cool', 'shade'])
      await click(page, 'material', touch, key);
}
async function fill(page: Page, values: Record<string, string>) {
  for (const [key, value] of Object.entries(values)) {
    const el = page.locator('#inq-' + key);
    if ((await el.evaluate((e) => e.tagName)) === 'SELECT')
      await el.selectOption(value);
    else await el.fill(value);
  }
}
async function solve(page: Page, id: Topic, touch = false) {
  for (const values of answers[id]) {
    await fill(page, values);
    await click(page, 'check', touch);
    await expect(page.locator('[data-inquiry-feedback]')).toHaveClass(
      id === 'future' && 'plan' in values ? /neutral/ : /correct/,
    );
    await click(page, 'next', touch);
  }
}
async function record(page: Page, id: Topic) {
  return page.evaluate(
    (id) =>
      JSON.parse(sessionStorage.getItem('afrika-2040:kenia-bus:v2a')!).inquiry
        .records[id],
    id,
  );
}
for (const device of [
  { name: 'desktop', width: 1440, height: 1000, touch: false },
  { name: 'ipad', width: 1024, height: 768, touch: true },
])
  for (const id of Object.keys(answers) as Topic[]) {
    test(`Afrika curriculum ${id} full independent ${device.name}: facts, product, reload and backward rework`, async ({
      browser,
      browserName,
    }) => {
      const context = await browser.newContext({
        viewport: device,
        hasTouch: device.touch,
        isMobile: device.touch,
        baseURL: 'http://127.0.0.1:4173',
      });
      const page = await context.newPage();
      const errors: string[] = [],
        external: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('request', (r) => {
        if (!r.url().startsWith('http://127.0.0.1:4173/'))
          external.push(r.url());
      });
      await open(page, id, device.touch);
      if (id === 'nature') {
        await page.locator('#inquiry-lagekarte summary').click();
        await expect(
          page.getByRole('img', { name: 'Zwei Naturräume in Afrika verorten' }),
        ).toBeVisible();
        await page.locator('#inquiry-lagekarte summary').click();
        await expect(page.locator('.season')).toHaveCount(2);
      }
      await page.screenshot({
        path: evidencePath(`afrika-${id}-${browserName}-${device.name}.png`),
        fullPage: true,
      });
      await solve(page, id, device.touch);
      if (id === 'image')
        await expect(page.locator('#inquiry-product-anchor')).toContainText(
          'Zuerst denke ich nur an Natur.',
        );
      if (id === 'future') {
        await expect(page.locator('#inquiry-product-anchor')).toContainText(
          'Dein gewählter Vorschlag: Gemeinsamer Kühlraum',
        );
        await expect(page.locator('#inquiry-product-anchor')).toContainText(
          '30 Stände · einmalig 80 GE · monatlich 12 GE.',
        );
      }

      for (let i = 0; i < 3; i++)
        await page.locator('#inq-product-' + i).fill(own[id][i]);
      await click(page, 'submit', device.touch);
      await expect(page.locator('#inquiry-product-status')).toHaveText(
        'Eigene Antwort – fachlich noch nicht geprüft',
      );
      const before = await record(page, id);
      await page.reload();
      expect((await record(page, id)).product).toEqual(before.product);
      await expect(page.locator('#inq-product-0')).toHaveValue(own[id][0]);
      await click(page, 'journal', device.touch);
      const section = page.locator('.journal-record').filter({
        has: page.locator('h2').filter({
          hasText: {
            image: 'A ·',
            nature: 'B ·',
            population: 'C ·',
            economy: 'D ·',
            future: 'E ·',
          }[id],
        }),
      });
      for (const line of own[id]) await expect(section).toContainText(line);
      await page.reload();
      for (const line of own[id]) await expect(section).toContainText(line);
      await click(page, 'topic', device.touch, id);
      expect((await record(page, id)).submitted).toBe(true);
      const field = Object.keys(answers[id][0])[0];
      const input = page.locator('#inq-' + field);
      if ((await input.evaluate((e) => e.tagName)) === 'SELECT')
        await input.selectOption('');
      else await input.fill('');
      await expect(page.locator('#inquiry-next')).toHaveCount(0);
      expect((await record(page, id)).submitted).toBe(false);
      expect((await record(page, id)).product).toEqual(before.product);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      expect(errors).toEqual([]);
      expect(external).toEqual([]);
      await context.close();
    });
  }
test('Afrika curriculum feedback visible colors, partial preservation, two failures, explicit adoption and changed examples', async ({
  page,
  browserName,
}) => {
  await open(page, 'population');
  await click(page, 'check');
  await expect(page.locator('[data-inquiry-feedback]')).toHaveClass(/neutral/);
  expect((await record(page, 'population')).checks[0].failures).toBe(0);
  await fill(page, { natural: '30', migration: '', end: '900' });
  await click(page, 'check');
  await expect(page.locator('[data-inquiry-feedback]')).toHaveClass(/partial/);
  await expect(page.locator('[data-inquiry-feedback]')).toContainText(
    'Schon passend: Natürliche Veränderung',
  );
  expect((await record(page, 'population')).checks[0].failures).toBe(0);
  await fill(page, { natural: '0', migration: '0', end: '0' });
  await click(page, 'check');
  await expect(page.locator('[data-inquiry-feedback]')).toHaveCSS(
    'background-color',
    'rgb(255, 240, 236)',
  );
  expect((await record(page, 'population')).checks[0].failures).toBe(1);
  await fill(page, { natural: '30', migration: '0', end: '0' });
  await click(page, 'check');
  await expect(page.locator('[data-inquiry-feedback]')).toHaveClass(/hint/);
  await expect(page.locator('[data-inquiry-feedback]')).toHaveCSS(
    'background-color',
    'rgb(255, 247, 218)',
  );
  await expect(page.locator('[data-inquiry-feedback]')).toContainText(
    'Schon passend: Natürliche Veränderung',
  );
  await expect(page.locator('[data-inquiry-feedback]')).toContainText(
    '30 Zuzüge minus 40 Fortzüge',
  );
  let r = await record(page, 'population');
  expect(r.checks[0].failures).toBe(2);
  expect(r.checks[0].exampleUsed).toBe(false);
  await expect(page.locator('#inquiry-next')).toHaveCount(0);
  await page.screenshot({
    path: evidencePath(`afrika-feedback-${browserName}.png`),
    fullPage: true,
  });
  await click(page, 'adopt');
  await expect(page.locator('[data-inquiry-feedback]')).toContainText(
    'Beispiel bewusst übernommen',
  );
  await expect(page.locator('#inq-natural')).toHaveValue('30');
  await expect(page.locator('#inq-migration')).toHaveValue('-10');
  await page.locator('#inq-natural').fill('31');
  await expect(page.locator('#inquiry-next')).toHaveCount(0);
  await page.reload();
  r = await record(page, 'population');
  expect(r.checks[0].exampleUsed).toBe(true);
  expect(r.checks[0].adopted).toBe(false);
  expect(r.checks[0].checked).toBe(false);
});
for (const plan of ['cool', 'shade'] as const)
  for (const goal of ['loss', 'access'])
    test(`Afrika curriculum proposal ${plan} goal ${goal}: factual feedback and concrete priority remain separate`, async ({
      page,
      browserName,
    }) => {
      await open(page, 'future');
      await fill(page, answers.future[0]);
      await click(page, 'check');
      await click(page, 'next');
      await fill(page, {
        plan,
        goal,
        evidence: plan,
        limit: plan,
        unknown: plan,
      });
      await click(page, 'check');
      await expect(page.locator('[data-inquiry-feedback]')).toHaveClass(
        /neutral/,
      );
      await expect(page.locator('[data-inquiry-feedback]')).toHaveCSS(
        'background-color',
        'rgb(238, 243, 245)',
      );
      const desired = plan === 'cool' ? 'loss' : 'access';
      if (goal !== desired) {
        await expect(page.locator('[data-inquiry-feedback]')).toContainText(
          'Beleg, Grenze und offene Frage passen',
        );
        await expect(page.locator('#inquiry-next')).toHaveCount(0);
        expect((await record(page, 'future')).checks[1].failures).toBe(0);
        await page.locator('#inq-weighting').selectOption(desired);
        await click(page, 'check');
        await expect(page.locator('[data-inquiry-feedback]')).toContainText(
          'nehme in Kauf',
        );
      }
      await click(page, 'next');
      for (let i = 0; i < 3; i++) await click(page, 'product-help');
      expect((await record(page, 'future')).productExampleUsed).toBe(false);
      await click(page, 'product-adopt');
      await expect(page.locator('#inquiry-product-status')).toContainText(
        'Beispiel bewusst übernommen',
      );
      await page.reload();
      await expect(page.locator('#inq-product-0')).toHaveValue(
        new RegExp(plan === 'cool' ? 'Kühlraum' : 'Schattendächer'),
      );
      await click(page, 'journal');
      const section = page
        .locator('.journal-record')
        .filter({ hasText: 'E · Eine Zukunft' });
      await expect(section).toContainText(
        plan === 'cool' ? '30 Stände' : '60 Stände',
      );
      await expect(section).toContainText(
        plan === 'cool'
          ? 'einmalig kostet die Anschaffung 80'
          : 'einmalig kostet die Anschaffung 30',
        { ignoreCase: true },
      );
      await page.screenshot({
        path: evidencePath(
          `afrika-conflict-${plan}-${goal}-${browserName}.png`,
        ),
        fullPage: true,
      });
    });
test('Afrika curriculum supported path for all five, keyboard progression, all relevant axe tags and narrow Pages embed', async ({
  browser,
  browserName,
}) => {
  const context = await browser.newContext({
    viewport: { width: 720, height: 900 },
    baseURL: 'http://127.0.0.1:4174',
  });
  const page = await context.newPage();
  await page.goto('/Afrika-2040/');
  await page.locator('#inquiry-open').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  for (const id of Object.keys(answers) as Topic[]) {
    await click(page, 'topic', false, id);
    if (id === 'image') {
      await click(page, 'initial-save', false, 'none');
      for (const key of ['market', 'forest'])
        await click(page, 'material', false, key);
    }
    if (id === 'future')
      for (const key of ['cool', 'shade'])
        await click(page, 'material', false, key);
    for (let step = 0; step < 2; step++) {
      if (id === 'future' && step === 1)
        await fill(page, { plan: 'shade', goal: 'loss' });
      for (let h = 1; h <= 3; h++) {
        await click(page, 'help');
        await expect(page.locator('#inquiry-help-title')).toHaveText(
          `Hilfe ${h} von 3`,
        );
      }
      expect((await record(page, id)).checks[step].exampleUsed).toBe(false);
      await click(page, 'adopt');
      await expect(page.locator('#inquiry-next')).toBeVisible();
      const accessibility = await new AxeBuilder({ page })
        .include('.inquiry-screen')
        .withTags([
          'wcag2a',
          'wcag2aa',
          'wcag21a',
          'wcag21aa',
          'wcag22a',
          'wcag22aa',
        ])
        .analyze();
      expect(accessibility.violations).toEqual([]);
      await page.locator('#inquiry-next').focus();
      await page.keyboard.press('Enter');
    }
    for (let h = 0; h < 3; h++) await click(page, 'product-help');
    await click(page, 'product-adopt');
    await page
      .locator('#inq-product-1')
      .fill('Meine eigene Ergänzung nach dem Beispiel.');
    await click(page, 'submit');
    await expect(page.locator('#inquiry-product-status')).toContainText(
      'Beispiel genutzt oder überarbeitet',
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.screenshot({
      path: evidencePath(`afrika-supported-${id}-${browserName}-narrow.png`),
      fullPage: true,
    });
    await click(page, 'menu');
  }
  await context.close();
});
test('Afrika curriculum own text stays escaped and ungraded; storage warning and old Kenya product survive navigation', async ({
  page,
}) => {
  await open(page, 'population');
  await solve(page, 'population');
  for (let i = 0; i < 3; i++)
    await page
      .locator('#inq-product-' + i)
      .fill('<img src=x onerror=alert(1)> freie Antwort');
  await click(page, 'submit');
  await click(page, 'journal');
  await expect(
    page.locator('.journal-record').filter({ hasText: 'C · Bevölkerung' }),
  ).toContainText('<img src=x onerror=alert(1)>');
  await expect(page.locator('img[src="x"]')).toHaveCount(0);
  await click(page, 'home');
  await page
    .getByRole('button', { name: 'Spiel starten', exact: true })
    .click();
  await page.locator('label[for="foot-platz"]').click();
  await page.locator('label[for="bus-direct"]').click();
  await page.locator('#check-answer').click();
  const before = await page.evaluate(
    () =>
      JSON.parse(sessionStorage.getItem('afrika-2040:kenia-bus:v2a')!).progress,
  );
  await page
    .getByRole('button', { name: 'Episoden auswählen', exact: true })
    .click();
  await page.locator('#inquiry-open').click();
  await click(page, 'journal');
  expect(
    await page.evaluate(
      () =>
        JSON.parse(sessionStorage.getItem('afrika-2040:kenia-bus:v2a')!)
          .progress,
    ),
  ).toEqual(before);
  await page.evaluate(() => {
    Storage.prototype.setItem = function () {
      throw new Error('test blocked');
    };
  });
  await click(page, 'topic', false, 'nature');
  await expect(page.locator('#storage-warning')).toBeVisible();
  await expect(page.locator('#storage-warning')).toContainText('Beim Neuladen');
});

test('Afrika curriculum all ten checks: actual wrong alternatives, yellow recognition, explanation and supported continuation', async ({
  page,
}) => {
  const wrong: Record<Topic, [Record<string, string>, Record<string, string>]> =
    {
      image: [
        { detail: 'wealth', origin: 'project', scope: 'all' },
        { counter: 'beautiful', missing: 'trees' },
      ],
      nature: [
        {
          'ghana-season': 'oct-apr',
          'morocco-season': 'may-sep',
          location: 'ghana',
        },
        { rain: 'souss', adapt: 'guarantee' },
      ],
      population: [
        { natural: '0', migration: '0', end: '0' },
        { trend: 'future', status: 'census', condition: 'poverty' },
      ],
      economy: [
        { 'surplus-a': '0', 'surplus-b': '0', first: '0' },
        { access: 'money', growth: 'profit', conditions: 'only' },
      ],
      future: [
        { reach: 'cool', environment: 'none', cost: 'investment' },
        {
          plan: 'cool',
          goal: 'access',
          evidence: 'guarantee',
          limit: 'none',
          unknown: 'irrelevant',
        },
      ],
    };
  for (const id of Object.keys(answers) as Topic[]) {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await open(page, id);
    for (let step = 0; step < 2; step++) {
      await fill(page, wrong[id][step]);
      // The first check has no valid part; the second starts with one valid fact.
      if (step === 1) {
        const key = id === 'future' ? 'limit' : Object.keys(answers[id][1])[0];
        await fill(page, {
          [key]: (answers[id][1] as Record<string, string>)[key],
        });
      }
      await click(page, 'check');
      await expect(page.locator('[data-inquiry-feedback]')).toHaveClass(
        step === 0 ? /incorrect/ : /partial/,
      );
      await expect(page.locator('[data-inquiry-feedback]')).toHaveCSS(
        'background-color',
        step === 0 ? 'rgb(255, 240, 236)' : 'rgb(255, 247, 218)',
      );
      if (step === 1)
        await expect(page.locator('[data-inquiry-feedback]')).toContainText(
          'Schon passend:',
        );
      expect((await record(page, id)).checks[step].failures).toBe(1);
      await click(page, 'check');
      await expect(page.locator('[data-inquiry-feedback]')).toHaveClass(/hint/);
      expect((await record(page, id)).checks[step].failures).toBe(2);
      expect((await record(page, id)).checks[step].exampleUsed).toBe(false);
      await click(page, 'adopt');
      await expect(page.locator('#inquiry-next')).toBeVisible();
      await click(page, 'next');
    }
    await expect(page.locator('#inquiry-title')).toHaveText(
      'Jetzt selbst erklären',
    );
  }
});

test('Afrika curriculum keyboard-only selects and numeric entry, reversible material controls, focus and touch target bounds', async ({
  browser,
  browserName,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    hasTouch: true,
    isMobile: true,
    baseURL: 'http://127.0.0.1:4173',
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.locator('#inquiry-open').focus();
  await page.keyboard.press('Enter');
  const go = async (selector: string) => {
    await page.locator(selector).focus();
    await page.keyboard.press('Enter');
  };
  await go('[data-op="topic"][data-value="population"]');
  for (const [key, value] of Object.entries(answers.population[0])) {
    await page.locator('#inq-' + key).focus();
    await page.keyboard.type(value);
  }
  await go('#inquiry-check');
  await expect(page.locator('#inquiry-feedback-title')).toBeFocused();
  await go('#inquiry-next');
  // Actual keyboard arrows, not selectOption. Re-rendering must preserve the select's focus.
  for (const [key, index] of [
    ['trend', 2],
    ['status', 3],
    ['condition', 2],
  ] as const) {
    const select = page.locator('#inq-' + key);
    await select.focus();
    await select.press('Home');
    for (let i = 0; i < index; i++) await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Tab');
  }
  await go('#inquiry-check');
  await expect(page.locator('[data-inquiry-feedback]')).toHaveClass(/correct/);
  await go('#inquiry-next');
  await page.locator('#inq-product-0').focus();
  await page.keyboard.type('Neue Rechnung: 804 Personen.');
  await go('[data-op="menu"]');
  await go('[data-op="topic"][data-value="image"]');
  await go('[data-op="initial-save"][data-value="none"]');
  for (const val of ['market', 'forest', 'market', 'forest']) {
    await go(`[data-op="material"][data-value="${val}"]`);
    await expect(
      page.locator(`[data-op="material"][data-value="${val}"]`),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.locator(`[data-op="material"][data-value="${val}"]`),
    ).toBeFocused();
    await expect
      .poll(() =>
        page
          .locator('.inquiry-photo')
          .evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0),
      )
      .toBe(true);
  }
  const targets = await page
    .locator(
      '.inquiry-screen button,.inquiry-screen input,.inquiry-screen select',
    )
    .evaluateAll((els) =>
      els.map((e) => ({
        tag: e.tagName,
        text: e.textContent,
        rect: e.getBoundingClientRect().toJSON(),
      })),
    );
  for (const t of targets) {
    expect(t.rect.height).toBeGreaterThanOrEqual(44);
    expect(t.rect.width).toBeGreaterThanOrEqual(44);
  }
  await page.screenshot({
    path: evidencePath(`afrika-keyboard-${browserName}-ipad.png`),
    fullPage: true,
  });
  await context.close();
});
