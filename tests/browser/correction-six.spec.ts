import { test, expect, type Page } from '@playwright/test';
import { studyClick } from './study-helpers.ts';
import { evidencePath } from './artifacts.ts';
async function help(page: Page) {
  for (const name of [
    'Ich brauche einen Hinweis',
    'Genauer zeigen',
    'Erklärung ansehen',
  ])
    await page.getByRole('button', { name, exact: true }).click();
}
async function supportedToDecision(page: Page, n: number) {
  await help(page);
  await page.locator('#study-adopt').click();
  await page.locator('#next-step').click();
  await help(page);
  if (n === 4) await page.locator('#study-adopt').click();
  else {
    for (const k of n === 3
      ? ['quality', 'process']
      : n === 5
        ? ['repair', 'tech']
        : ['same', 'extra']) {
      await page.locator('#try-' + k).click();
      await page.locator('#study-adopt').click();
    }
    await page.locator('#study-adopt').click();
  }
  await page.locator('#next-step').click();
}
const choices = [
  { n: 3, first: 'quality', other: 'process', goal: 'surplus' },
  { n: 4, first: 'payout', other: 'reserve', goal: 'payout' },
  { n: 5, first: 'repair', other: 'tech', goal: 'repair' },
  { n: 6, first: 'same', other: 'extra', goal: 'save' },
];
for (const device of [
  { name: 'desktop', width: 1440, height: 1000, touch: false },
  { name: 'ipad-portrait', width: 768, height: 1024, touch: true },
  { name: 'ipad-landscape', width: 1024, height: 768, touch: true },
])
  test.describe(device.name, () => {
    test.use({
      viewport: { width: device.width, height: device.height },
      hasTouch: device.touch,
      isMobile: device.touch,
    });
    for (const c of choices)
      test(`correction episode ${c.n}: automatic association support, distinct hints, provenance, full product/reload and own text`, async ({
        page,
      }) => {
        await page.goto('/');
        await page.locator('#episode-' + c.n).click();
        await supportedToDecision(page, c.n);
        for (const [f, v] of [
          ['proposal', c.first],
          ['goal', c.goal],
          ['benefit', c.other],
          ['limit', c.other],
        ])
          await studyClick(
            page,
            `#study-${f}-${v}`,
            device.touch ? 'tap' : 'check',
          );
        await page.locator('#check-answer').click();
        await expect(page.locator('#help-title')).toHaveCount(0);
        await page.locator('#check-answer').click();
        await expect(page.locator('#help-title')).toHaveText('→ Hilfe 3 von 3');
        await expect(page.locator('#next-step')).toHaveCount(0);
        await expect(page.locator('#study-adopt')).toBeVisible();
        await page.reload();
        await expect(page.locator('#study-adopt')).toBeVisible();
        await page.locator('#study-adopt').click();
        await page.locator('#next-step').click();
        await expect(page.locator('[data-supported]')).toBeVisible();
        const entire = await page.locator('.recommendation').innerText();
        await page.reload();

        expect(await page.locator('.recommendation').innerText()).toBe(entire);
        if (c.n === 4)
          await expect(page.locator('.study-allocation-summary')).toHaveText(
            'Mein vollständiger Plan: Auszahlung 40 GE · Rücklage 40 GE · Fortbildung 40 GE. Zusammen 120 GE.',
          );
        if (c.n === 6) {
          await expect(page.locator('.study-product')).toContainText(
            'Mein Plan bewässert nur das gleiche Feld: insgesamt 45 WE. Zum Vergleich: Mit dem kleineren Zusatzfeld wären es 45 + 20 = 65 WE statt früher 60 WE.',
          );
          await page.screenshot({
            path: evidencePath('correction-area-same.png'),
            fullPage: true,
          });
        }
        await page
          .getByRole('button', { name: 'Empfehlung bearbeiten', exact: true })
          .click();
        await studyClick(
          page,
          `#study-benefit-${c.other}`,
          device.touch ? 'tap' : 'check',
        );
        await studyClick(
          page,
          `#study-benefit-${c.first}`,
          device.touch ? 'tap' : 'check',
        );
        await page.locator('#check-answer').click();
        await page.locator('#next-step').click();
        await expect(page.locator('[data-supported]')).toHaveCount(0);
        await expect(page.locator('[data-help-history]')).toBeVisible();
        // A reset enables three genuinely different hints with the current plan selected.
        await page
          .getByRole('button', { name: 'Empfehlung bearbeiten', exact: true })
          .click();
        await page
          .getByRole('button', { name: 'Schritt neu bearbeiten', exact: true })
          .click();
        await studyClick(page, `#study-proposal-${c.other}`, 'check');
        await studyClick(page, `#study-goal-${c.goal}`, 'check');
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
        expect(hints[1]).toContain('Dein Vorschlag:');
        await page.locator('#study-adopt').click();
        await expect(page.locator('#study-weighted-yes')).toBeChecked();
        await page.locator('#next-step').click();
        await expect(page.locator('.study-product')).toContainText(
          'Mir ist wichtiger:',
        );
        await page
          .getByRole('button', { name: 'Empfehlung bearbeiten', exact: true })
          .click();
        await page.locator('#study-adjust-goal').click();
        await page.locator('#check-answer').click();
        await page.locator('#study-own-words summary').click();
        await page.locator('#study-text').fill('??? eigener Gedanke');
        await page.locator('#check-answer').click();
        await expect(page.locator('[data-feedback]')).toHaveClass(/neutral/);
        await page.locator('#study-submit').click();
        await expect(page.locator('[data-feedback]')).not.toContainText(
          'Karte',
        );
        await page.locator('#next-step').click();
        await expect(page.locator('[data-ungraded]')).toBeVisible();
        await expect(page.locator('.study-product')).toHaveCount(0);
      });
  });
const reports: [number, string, string, string, string, string][] = [
  [
    3,
    'quality',
    'surplus',
    'Lagerung und Qualität verbessern',
    'Qualität: 200 − 110 = 90 GE Überschuss.',
    'Die eigene Verarbeitung wird damit nicht ausgebaut.',
  ],
  [
    3,
    'process',
    'processing',
    'Eine zusätzliche Presse nutzen',
    'Verarbeitung: 260 − 185 = 75 GE Überschuss.',
    'Die laufenden Ausgaben steigen. Es bleiben weniger GE als bei der Qualitätsmaßnahme.',
  ],
  [
    4,
    'payout',
    'payout',
    'Meinen Plan mit Auszahlung begründen',
    '40 GE für Auszahlung: Mitglieder erhalten jetzt zusätzliches Geld.',
    'Ausgezahltes Geld steht später nicht mehr für den Betrieb bereit.',
  ],
  [
    4,
    'reserve',
    'reserve',
    'Meinen Plan mit Rücklage begründen',
    '40 GE für Rücklage: Die Genossenschaft behält Geld für Reparaturen.',
    'Zurückgelegtes Geld bringt den Mitgliedern jetzt keine zusätzliche Auszahlung.',
  ],
  [
    4,
    'training',
    'training',
    'Meinen Plan mit Fortbildung begründen',
    '40 GE für Fortbildung: Mitglieder können dazulernen.',
    'Der spätere Nutzen ist offen. Geld für Fortbildung wird jetzt ausgegeben.',
  ],
  [
    5,
    'repair',
    'repair',
    'Die Leitung reparieren',
    'Reparatur: 50 WE entnommen, 30 WE bleiben im Tank.',
    'Die Leitung bleibt wartungsbedürftig. Nicht alles entnommene Wasser erreicht das Feld.',
  ],
  [
    5,
    'tech',
    'less',
    'Die Wasserverteilung erneuern',
    'Neue Verteilung: 45 WE entnommen, 35 WE bleiben im Tank.',
    'Neue Teile, Filter und Wartung sind nötig. Eine sichere Ernte folgt daraus nicht.',
  ],
  [
    6,
    'same',
    'save',
    'Nur das gleiche Feld bewässern',
    '45 statt 60 WE: insgesamt 15 WE weniger Entnahme.',
    'Das Zusatzfeld wird nicht bewässert. Eine sichere Ernte ist trotzdem nicht garantiert.',
  ],
  [
    6,
    'extra',
    'area',
    'Auch das kleinere Zusatzfeld bewässern',
    'Zwei Felder bewässern: 45 + 20 = 65 WE insgesamt.',
    'Insgesamt 5 WE mehr als früher. Nur 15 WE bleiben im Tank; zusätzliche Einnahmen sind unsicher.',
  ],
];
for (const [n, id, goal, label, benefit, limit] of reports)
  test(`entire report assigned to chosen proposal ${n}/${id}, persisted and edited`, async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('#episode-' + n).click();
    await supportedToDecision(page, n);
    for (const [f, v] of [
      ['proposal', id],
      ['goal', goal],
      ['benefit', id],
      ['limit', id],
    ])
      await studyClick(page, `#study-${f}-${v}`, 'check');
    await page.locator('#check-answer').click();
    await page.locator('#next-step').click();
    let expected = `Ich empfehle: ${label}. Mein Beleg: ${benefit} Aber: ${limit}`;
    if (n === 6)
      expected +=
        ' ' +
        (id === 'same'
          ? 'Mein Plan bewässert nur das gleiche Feld: insgesamt 45 WE. Zum Vergleich: Mit dem kleineren Zusatzfeld wären es 45 + 20 = 65 WE statt früher 60 WE. Mehr Flächen können die Einsparung am ersten Feld also aufheben.'
          : 'Mein Plan bewässert auch das kleinere Zusatzfeld: 45 + 20 = 65 WE statt früher 60 WE. Das erste Feld braucht weniger, beide Felder zusammen aber mehr. Zum Vergleich: Ohne Zusatzfeld wären es insgesamt 45 WE.');
    await expect(page.locator('.study-product')).toHaveText(expected);
    const report = await page.locator('.recommendation').innerText();
    await page.reload();
    expect(await page.locator('.recommendation').innerText()).toBe(report);
    await page
      .getByRole('button', { name: 'Empfehlung bearbeiten', exact: true })
      .click();
    await page.locator('#check-answer').click();
    await page.locator('#next-step').click();
    await expect(page.locator('.study-product')).toHaveText(expected);
  });
for (const priority of ['payout', 'reserve', 'training'])
  test(`entire one-sided Ghana plan ${priority}: 120 GE, not the mixed example`, async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('#episode-4').click();
    await help(page);
    await page.locator('#study-adopt').click();
    await page.locator('#next-step').click();
    for (const k of ['payout', 'reserve', 'training'])
      await page.locator('#try-' + k).click();
    for (let i = 0; i < 6; i++) await page.locator('#add-' + priority).click();
    await page.locator('#study-why-tradeoff').check();
    await page.locator('#check-answer').click();
    await page.locator('#next-step').click();
    for (const field of ['proposal', 'goal', 'benefit', 'limit'])
      await studyClick(page, `#study-${field}-${priority}`, 'check');
    await page.locator('#check-answer').click();
    await page.locator('#next-step').click();
    const text = `Mein vollständiger Plan: Auszahlung ${priority === 'payout' ? 120 : 0} GE · Rücklage ${priority === 'reserve' ? 120 : 0} GE · Fortbildung ${priority === 'training' ? 120 : 0} GE. Zusammen 120 GE.`;
    await expect(page.locator('.study-allocation-summary')).toHaveText(text);
    await expect(page.locator('.study-product')).toContainText('120 GE für');
    await page.reload();
    await expect(page.locator('.study-allocation-summary')).toHaveText(text);
  });
