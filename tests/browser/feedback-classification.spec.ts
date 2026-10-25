import { test, expect, type Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { studyClick } from './study-helpers.ts';
import { evidencePath } from './artifacts.ts';
import { auditAccessibility } from './accessibility.ts';
const key = 'afrika-2040:kenia-bus:v2a';
const choices = [
  {
    n: 3,
    id: 'cocoa',
    chosen: 'quality',
    other: 'process',
    goal: 'surplus',
    otherGoal: 'processing',
    fact: 'Qualität: 200 − 110 = 90 GE Überschuss.',
  },
  {
    n: 4,
    id: 'share',
    chosen: 'payout',
    other: 'reserve',
    goal: 'payout',
    otherGoal: 'reserve',
    fact: '40 GE für Auszahlung: Mitglieder erhalten jetzt zusätzliches Geld.',
  },
  {
    n: 5,
    id: 'water',
    chosen: 'repair',
    other: 'tech',
    goal: 'repair',
    otherGoal: 'less',
    fact: 'Reparatur: 50 WE entnommen, 30 WE bleiben im Tank.',
  },
  {
    n: 6,
    id: 'area',
    chosen: 'same',
    other: 'extra',
    goal: 'save',
    otherGoal: 'area',
    fact: '45 statt 60 WE: insgesamt 15 WE weniger Entnahme.',
  },
];
const palette = {
  incorrect: {
    backgroundColor: 'rgb(255, 240, 236)',
    color: 'rgb(139, 48, 40)',
    borderColor: 'rgb(212, 155, 144)',
  },
  partial: {
    backgroundColor: 'rgb(255, 247, 218)',
    color: 'rgb(104, 80, 25)',
    borderColor: 'rgb(217, 189, 104)',
  },
  hint: {
    backgroundColor: 'rgb(255, 247, 218)',
    color: 'rgb(104, 80, 25)',
    borderColor: 'rgb(217, 189, 104)',
  },
  neutral: {
    backgroundColor: 'rgb(238, 243, 245)',
    color: 'rgb(50, 76, 91)',
    borderColor: 'rgb(183, 198, 205)',
  },
};
async function feedback(page: Page, kind: keyof typeof palette) {
  const f = page.locator('[data-feedback]');
  await expect(f).toBeInViewport();
  await expect(f).toHaveClass('feedback ' + kind);
  for (const [name, value] of Object.entries(palette[kind]))
    await expect(f).toHaveCSS(
      name.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()),
      value,
    );
  return {
    kind,
    text: await f.innerText(),
    computed: await f.evaluate((e) => {
      const s = getComputedStyle(e);
      return {
        backgroundColor: s.backgroundColor,
        color: s.color,
        borderColor: s.borderColor,
      };
    }),
  };
}
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
      test(`feedback matrix episode ${c.n}: visible colors, counters and conscious continuation`, async ({
        page,
      }) => {
        test.setTimeout(90000);
        const errors: string[] = [];
        page.on('pageerror', (e) => errors.push('JS ' + e.message));
        page.on('console', (m) => {
          if (m.type() === 'error') errors.push(m.text());
        });
        page.on('requestfailed', (r) => errors.push(r.url()));
        page.on('response', (r) => {
          if (r.status() >= 400) errors.push(r.status() + ': ' + r.url());
        });
        const click = async (selector: string) => {
          if (device.touch) await page.locator(selector).tap();
          else await page.locator(selector).click();
        };
        const choose = async (field: string, value: string) =>
          studyClick(
            page,
            `#study-${field}-${value}`,
            device.touch ? 'tap' : 'check',
          );
        const help = async () => {
          for (const name of [
            'Ich brauche einen Hinweis',
            'Genauer zeigen',
            'Erklärung ansehen',
          ]) {
            const b = page.getByRole('button', { name, exact: true });
            if (device.touch) await b.tap();
            else await b.click();
          }
        };
        const saved = () =>
          page.evaluate(
            ({ key, id }) => {
              const s = JSON.parse(sessionStorage.getItem(key)!);
              return s.studies[id];
            },
            { key, id: c.id },
          );
        await page.goto('/');
        await click('#episode-' + c.n);
        await help();
        await click('#study-adopt');
        await click('#next-step');
        await help();
        if (c.n === 4) await click('#study-adopt');
        else {
          for (const id of c.n === 3
            ? ['quality', 'process']
            : c.n === 5
              ? ['repair', 'tech']
              : ['same', 'extra']) {
            await click('#try-' + id);
            await click('#study-adopt');
          }
          await click('#study-adopt');
        }
        await click('#next-step');
        const reset = async () => {
          const b = page.getByRole('button', {
            name: 'Schritt neu bearbeiten',
            exact: true,
          });
          if (device.touch) await b.tap();
          else await b.click();
          await choose('proposal', c.chosen);
          await choose('goal', c.goal);
        };
        const observations: unknown[] = [];
        for (const v of [
          {
            name: 'both false',
            benefit: 'all',
            limit: 'none',
            kind: 'incorrect',
            ack: '',
          },
          {
            name: 'correct benefit',
            benefit: c.chosen,
            limit: 'none',
            kind: 'partial',
            ack: 'Dein Beleg passt:',
          },
          {
            name: 'correct limit',
            benefit: 'all',
            limit: c.chosen,
            kind: 'partial',
            ack: 'Du beachtest die Grenze:',
          },
          {
            name: 'both belong to other measure',
            benefit: c.other,
            limit: c.other,
            kind: 'incorrect',
            ack: 'gehört zu:',
          },
          {
            name: 'other fact and correct limit',
            benefit: c.other,
            limit: c.chosen,
            kind: 'partial',
            ack: 'Du beachtest die Grenze:',
          },
          {
            name: 'correct fact and other limit',
            benefit: c.chosen,
            limit: c.other,
            kind: 'partial',
            ack: 'Dein Beleg passt:',
          },
        ] as const) {
          await reset();
          await choose('benefit', v.benefit);
          await choose('limit', v.limit);
          if (!device.touch) {
            await page.locator('#check-answer').focus();
            await page.keyboard.press('Enter');
          } else await click('#check-answer');
          const first = await feedback(page, v.kind);
          if (
            c.n === 3 &&
            device.name === 'desktop' &&
            ['both false', 'correct benefit'].includes(v.name)
          )
            await page.screenshot({
              path: evidencePath('feedback-first-' + v.kind + '.png'),
              fullPage: true,
            });
          if (v.ack) expect(first.text).toContain(v.ack);
          if (v.benefit === 'all')
            expect(first.text).toContain(
              'Dein Vorschlag löst nicht alle Probleme.',
            );
          if (v.limit === 'none')
            expect(first.text).toContain(
              'Bei deinem Vorschlag bleibt eine Grenze.',
            );
          let s = await saved();
          expect(s.progress[2]).toMatchObject({
            failures: 1,
            help: 0,
            complete: false,
          });
          expect(s.decision.benefit).toBe(v.benefit);
          expect(s.decision.limit).toBe(v.limit);
          await page.reload();
          await feedback(page, v.kind);
          expect((await saved()).progress[2].failures).toBe(1);
          await click('#check-answer');
          const second = await feedback(page, 'hint');
          expect(second.text).toContain('Unten steht ein passendes Beispiel.');
          s = await saved();
          expect(s.progress[2]).toMatchObject({
            failures: 2,
            help: 3,
            complete: false,
          });
          expect(s.progress[2].supported).toBeUndefined();
          expect(s.decision.supported).toBeUndefined();
          expect(s.decision.benefit).toBe(v.benefit);
          expect(s.decision.limit).toBe(v.limit);
          await expect(page.locator('.help-panel p')).toContainText(c.fact);
          await expect(page.locator('#next-step')).toHaveCount(0);
          expect((await auditAccessibility(page)).violations).toEqual([]);
          if (c.n === 3 && device.name === 'desktop' && v.name === 'both false')
            await page.screenshot({
              path: evidencePath('feedback-hint-after-two.png'),
              fullPage: true,
            });
          await click('#check-answer');
          expect((await saved()).progress[2].failures).toBe(2);
          await feedback(page, 'hint');
          await click('#study-adopt');
          await feedback(page, 'neutral');
          s = await saved();
          expect(s.decision).toMatchObject({
            benefit: c.chosen,
            limit: c.chosen,
            supported: true,
          });
          expect(s.progress[2].complete).toBe(true);
          await choose('benefit', c.other);
          s = await saved();
          expect(s.decision.supported).toBeUndefined();
          expect(s.progress[2].complete).toBe(false);
          observations.push({ variant: v.name, first, second });
        }
        await reset();
        await click('#check-answer');
        await feedback(page, 'hint');
        expect((await saved()).progress[2].failures).toBe(0);
        await choose('benefit', c.chosen);
        await click('#check-answer');
        const incomplete = await feedback(page, 'partial');
        expect(incomplete.text).toContain('Dein Beleg passt:');
        expect((await saved()).progress[2].failures).toBe(0);
        await reset();
        await choose('goal', c.otherGoal);
        await choose('benefit', c.chosen);
        await choose('limit', c.chosen);
        for (let i = 0; i < 3; i++) await click('#check-answer');
        await feedback(page, 'neutral');
        let s = await saved();
        expect(s.progress[2]).toMatchObject({
          failures: 0,
          help: 0,
          complete: false,
        });
        await choose('weighted', 'yes');
        await click('#check-answer');
        await feedback(page, 'neutral');
        s = await saved();
        expect(s.progress[2]).toMatchObject({
          failures: 0,
          help: 0,
          complete: true,
        });
        await click('#study-adjust-goal');
        await click('#check-answer');
        await feedback(page, 'neutral');
        expect((await saved()).progress[2].failures).toBe(0);
        await reset();
        await choose('benefit', 'all');
        await choose('limit', 'none');
        const summary = page.locator('#study-own-words summary');
        if (device.touch) await summary.tap();
        else await summary.click();
        await page.locator('#study-text').fill('??? eigener Gedanke');
        for (let i = 0; i < 3; i++) await click('#check-answer');
        const own = await feedback(page, 'neutral');
        expect(own.text).toContain('nicht sicher prüfen');
        expect((await saved()).progress[2]).toMatchObject({
          failures: 0,
          help: 0,
          complete: false,
        });
        await click('#study-submit');
        await feedback(page, 'neutral');
        expect((await saved()).decision.ungraded).toBe(true);
        await click('#next-step');
        await expect(page.locator('[data-ungraded]')).toBeVisible();
        await expect(page.locator('.study-product')).toHaveCount(0);
        await page.reload();
        await expect(page.locator('[data-ungraded]')).toBeVisible();
        expect(errors).toEqual([]);
        writeFileSync(
          evidencePath(`feedback-matrix-${c.id}-${device.name}.json`),
          JSON.stringify({ observations, incomplete, own, errors }, null, 2),
        );
      });
  });
