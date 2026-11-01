import { test, expect } from '@playwright/test';
import { profileIds } from '../../src/learning/profiles.ts';
import { tasksFor } from '../../src/learning/tasks.ts';
import { active } from '../../src/learning/storage.ts';
import { answers } from '../learning-oracles.ts';
import { evidencePath } from './artifacts.ts';
const key = 'afrika-2040:kenia-bus:v2a';
for (const unit of ['s1', 's2', 's3', 's4', 's5', 's6', 'o', 'r'] as const)
  for (const profile of profileIds)
    for (const supported of [false, true])
      test(`Afrika curriculum PaketB ${unit}/${profile} supported=${supported}`, async ({
        browser,
        browserName,
      }) => {
        test.setTimeout(120000);
        const context = await browser.newContext({
          viewport: supported
            ? { width: 1024, height: 768 }
            : { width: 1366, height: 900 },
          hasTouch: supported,
        });
        const page = await context.newPage();
        const errors: string[] = [],
          external: string[] = [];
        page.on('request', (r) => {
          if (!r.url().startsWith('http://127.0.0.1:4173/'))
            external.push(r.url());
        });
        page.on('pageerror', (e) => {
          errors.push(e.message);
          console.error('PAGEERROR', e.message);
        });
        const get = () =>
          page.evaluate(
            (key) => JSON.parse(sessionStorage.getItem(key)!).learning,
            key,
          );
        const press = async (sel: string) =>
          supported
            ? page.locator(sel).tap()
            : page.locator(sel).press('Enter');
        await page.goto(`/?lernweg=${profile}&bereich=${unit}`);
        for (const [index, raw] of tasksFor(unit, profile).entries()) {
          await expect(page.locator('h1')).toHaveText(raw.title);
          let s = await get();
          expect(s.profile).toBe(profile);
          const task = active(s)!.task;
          if (unit === 's2')
            await expect(page.locator('.inquiry-material')).toContainText(
              'acht neuen Nachbarn',
            );
          if (task.linked && task.linked.kind !== 'kenya') {
            const proposed =
              s.records[`${unit}.${profile}.v1`].attempts[task.linked.task]
                .answers.plan;
            await expect(
              page.locator(
                `button[data-op="simulate"][data-value="${proposed}"]`,
              ),
            ).toHaveAttribute('aria-pressed', 'true');
          }
          for (const id of task.simulation?.required ?? [])
            await press(`#sim-Liniewhlen-${id}, #sim-Modelluntersuchen-${id}`);
          if (supported) {
            for (let h = 0; h < 3; h++) await press('#learning-help');
            await press('#learning-adopt');
          } else {
            if (task.budget) {
              const amounts = answers(task).plan.split('-').map(Number);
              for (const [i, key] of [
                'payout',
                'reserve',
                'training',
              ].entries())
                for (let n = 0; n < amounts[i] / 20; n++)
                  await press('#allocate-' + key + '-plus');
            }
            for (const field of task.budget ? [] : task.fields) {
              const value = answers(task)[field.id],
                el = page.locator('#learn-' + field.id);
              if (field.kind === 'choice') {
                if (await el.evaluate((e) => e.tagName === 'FIELDSET'))
                  await page
                    .locator(
                      `input[data-field="${field.id}"][value="${value}"]`,
                    )
                    .check();
                else await el.selectOption(value);
              } else await el.fill(value);
            }
            await press('#learning-check');
          }
          if (
            task.fields.length === 1 &&
            ['water', 'cocoa'].includes(task.simulation?.kind ?? '') &&
            ['quality', 'process', 'repair', 'tech'].includes(task.fields[0].id)
          )
            expect(active(await get())!.attempt!.simulationSelection).toBe(
              task.fields[0].id,
            );
          await expect(page.locator('#learning-next')).toBeVisible();
          s = await get();
          const p = active(s)!.attempt!;
          expect(p.process).not.toBe('draft');
          expect(p.exampleUsed).toBe(
            supported &&
              !(
                task.simulation?.kind === 'orientation' &&
                task.fields.length === 1 &&
                task.fields[0].id === 'country'
              ),
          );
          if (task.fields.some((f) => f.kind === 'text')) {
            expect(p.factual).toBe('ungraded');
            await press('#learning-criteria');
            await expect(page.locator('.learning-criteria')).toBeVisible();
          }
          if (task.simulation?.required?.length)
            await page.screenshot({
              path: evidencePath(
                `packet-${unit}-${profile}-${browserName}-${supported}-${index}.png`,
              ),
              fullPage: true,
            });
          await page.reload();
          await expect(page.locator('#learning-next')).toBeVisible();
          expect(
            (await get()).records[`${unit}.${profile}.v1`].attempts[task.id]
              .answers,
          ).toEqual(p.answers);
          await press('#learning-next');
        }
        await expect(page.locator('h1')).toContainText('Lernjournal');
        expect(errors).toEqual([]);
        expect(external).toEqual([]);
        await context.close();
      });
