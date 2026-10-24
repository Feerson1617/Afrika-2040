import {
  test,
  expect,
  type Page,
  type Locator,
  type CDPSession,
} from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { auditAccessibility } from './accessibility.ts';
import { evidencePath } from './artifacts.ts';
const ids = ['path', 'bus'] as const;
type Measure = 'base' | 'bus' | 'path';
const visible = {
  base: { path: 'Neue Verbindung?', bus: '2 Fahrten / Std.' },
  bus: { path: 'Neue Verbindung?', bus: '3 Fahrten / Std.' },
  path: { path: '4 Min. · neuer Weg', bus: '2 Fahrten / Std.' },
} as const;
const contains = (text: string) =>
  new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const act = (touch: boolean) => (el: Locator) =>
  touch ? el.tap() : el.click();
async function explore(page: Page, touch = false) {
  const click = act(touch);
  await page.goto('/');
  await click(
    page.getByRole('button', { name: 'Episode 2 starten', exact: true }),
  );
  await click(page.locator('#demand-route-north'));
  await click(page.locator('#demand-view-now'));
  await click(page.locator('#demand-enough-no'));
  await click(page.locator('#demand-later-4'));
  await click(page.locator('#check-answer'));
  await click(page.locator('#next-step'));
}
async function nativeNames(cdp: CDPSession) {
  const { root } = await cdp.send('DOM.getDocument');
  const names: Record<string, string> = {};
  for (const id of ids) {
    const { nodeId } = await cdp.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: '#demand-map-' + id,
    });
    const { nodes } = await cdp.send('Accessibility.getPartialAXTree', {
      nodeId,
      fetchRelatives: false,
    });
    const control = nodes.find(
      (node) => !node.ignored && node.role?.value === 'button',
    );
    expect(control, 'Native Chromium AX button ' + id).toBeDefined();
    names[id] = control!.name!.value;
  }
  return names;
}
async function verify(page: Page, measure: Measure, cdp?: CDPSession) {
  const snapshot: Record<string, unknown> = { measure };
  for (const id of ids) {
    const control = page.locator('#demand-map-' + id),
      label = visible[measure][id];
    await expect(control.locator('text')).toHaveText(label);
    await expect(control.locator('text')).toBeVisible();
    await expect(control.locator('text')).not.toHaveAttribute(
      'aria-hidden',
      'true',
    );
    // This computes the accessible name, following aria-labelledby precedence;
    // it does not merely compare the literal aria-label attribute.
    await expect(control).toHaveAccessibleName(contains(label));
    await expect(
      page.getByRole('button', { name: contains(label) }),
    ).toHaveCount(1);
    await expect(control).toHaveAttribute(
      'aria-pressed',
      String(measure === id),
    );
    await expect(page.locator('#demand-try-' + id)).toHaveAttribute(
      'aria-pressed',
      String(measure === id),
    );
    snapshot[id] = await control.ariaSnapshot();
  }
  if (cdp) {
    const names = await nativeNames(cdp);
    for (const id of ids) expect(names[id]).toContain(visible[measure][id]);
    snapshot.nativeChromiumAXNames = names;
  }
  const audit = await auditAccessibility(page);
  expect(audit.violations).toEqual([]);
  snapshot.axe = { violations: audit.violations.length };
  return snapshot;
}
for (const device of [
  { name: 'desktop', width: 1440, height: 1000, touch: false },
  { name: 'ipad-landscape', width: 1024, height: 768, touch: true },
  { name: 'ipad-portrait', width: 768, height: 1024, touch: true },
])
  test(`Episode 2 accessible SVG names and all bidirectional state changes on ${device.name}`, async ({
    browser,
    browserName,
  }) => {
    test.setTimeout(60000);
    const context = await browser.newContext({
      viewport: device,
      hasTouch: device.touch,
      isMobile: device.touch,
    });
    const page = await context.newPage(),
      click = act(device.touch);
    await explore(page, device.touch);
    const cdp =
      browserName === 'chromium'
        ? await context.newCDPSession(page)
        : undefined;
    if (cdp) {
      await cdp.send('DOM.enable');
      await cdp.send('Accessibility.enable');
    }
    const snapshots: unknown[] = [];
    snapshots.push(await verify(page, 'base', cdp));
    // Covers each directed edge between none, extra trip and short walk.
    for (const measure of [
      'bus',
      'path',
      'bus',
      'base',
      'path',
      'base',
    ] as const) {
      await click(page.locator('#demand-try-' + measure));
      snapshots.push(await verify(page, measure, cdp));
    }
    // Real keyboard input must keep focus and its visible indicator after redraw.
    await page.locator('#demand-map-path').focus();
    await page.keyboard.press('Space');
    await expect(page.locator('#demand-map-path')).toBeFocused();
    expect(
      await page
        .locator('#demand-map-path')
        .evaluate((el) => el.matches(':focus-visible')),
    ).toBe(true);
    const outline = await page.locator('#demand-map-path').evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        style: s.outlineStyle,
        width: parseFloat(s.outlineWidth),
        color: s.outlineColor,
      };
    });
    expect(outline.style).toBe('solid');
    expect(outline.width).toBeGreaterThanOrEqual(3);
    snapshots.push(await verify(page, 'path', cdp));
    await page.keyboard.press('Tab');
    await expect(page.locator('#demand-map-bus')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#demand-map-bus')).toBeFocused();
    snapshots.push(await verify(page, 'bus', cdp));
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#demand-map-path')).toBeFocused();
    await page.keyboard.press('Space');
    snapshots.push(await verify(page, 'path', cdp));
    await expect(page.locator('#demand-map-path')).toBeFocused();
    await page.screenshot({
      path: evidencePath(
        `episode2-a11y-${browserName}-${device.name}-focus.png`,
      ),
      fullPage: true,
    });
    await page.reload();
    snapshots.push(await verify(page, 'path', cdp));
    // Native keyboard activation of the equivalent HTML control preserves its focus.
    await page.locator('#demand-try-bus').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#demand-try-bus')).toBeFocused();
    snapshots.push(await verify(page, 'bus', cdp));
    await page.locator('#demand-try-base').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#demand-try-base')).toBeFocused();
    snapshots.push(await verify(page, 'base', cdp));
    const geometry = await page.locator('svg.demand-map').evaluate((svg) => {
      const s = svg as SVGSVGElement,
        m = s.getScreenCTM()!;
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        texts: [...s.querySelectorAll('text')].map((el) => ({
          text: el.textContent,
          cssPixels:
            parseFloat(getComputedStyle(el).fontSize) * Math.hypot(m.a, m.b),
        })),
      };
    });
    expect(geometry.overflow).toBe(false);
    expect(
      Math.min(...geometry.texts.map((t) => t.cssPixels)),
    ).toBeGreaterThanOrEqual(14);
    for (const id of ids) {
      const b = await page.locator('#demand-try-' + id).boundingBox();
      expect(b!.height).toBeGreaterThanOrEqual(44);
    }
    writeFileSync(
      evidencePath(`episode2-a11y-${browserName}-${device.name}-names.json`),
      JSON.stringify(
        { device, browserName, outline, geometry, snapshots },
        null,
        2,
      ) + '\n',
    );
    await cdp?.detach();
    await context.close();
  });
test('Episode 2 regression guard detects a wrong computed name even with a correct aria-label', async ({
  page,
}) => {
  await explore(page);
  await verify(page, 'base');
  // Simulate a future regression only in this page: aria-labelledby wins over
  // an otherwise correct aria-label. The bus reproduces the old static label.
  await page
    .locator('#demand-map-path')
    .evaluate((el) => el.setAttribute('aria-labelledby', 'task-title'));
  await page
    .locator('#demand-map-bus')
    .evaluate((el) =>
      el.setAttribute('aria-label', 'Bus: zusätzliche Fahrt testen'),
    );
  await expect(page.locator('#demand-map-path')).toHaveAttribute(
    'aria-label',
    /Neue Verbindung\?/,
  );
  await expect(page.locator('#demand-map-path')).toHaveAccessibleName(
    'Was verändert deine Maßnahme?',
  );
  await expect(page.locator('#demand-map-path')).not.toHaveAccessibleName(
    contains('Neue Verbindung?'),
  );
  await expect(page.locator('#demand-map-bus')).not.toHaveAccessibleName(
    contains('2 Fahrten / Std.'),
  );
  const broken = await auditAccessibility(page);
  const mismatch = broken.violations.find(
    (v) => v.id === 'label-content-name-mismatch',
  );
  expect(mismatch).toBeDefined();
  expect(mismatch!.nodes).toHaveLength(2);
  for (const id of ids)
    expect(
      mismatch!.nodes.some((n) => n.target.includes('#demand-map-' + id)),
    ).toBe(true);
  writeFileSync(
    evidencePath(
      `episode2-a11y-${test.info().project.name}-negative-probe.json`,
    ),
    JSON.stringify(
      {
        purpose: 'Temporary DOM regression; source code unmodified',
        violations: broken.violations,
      },
      null,
      2,
    ) + '\n',
  );
  // A genuine UI action redraws the normal production markup and clears the fixture.
  await page.locator('#demand-try-base').click();
  await verify(page, 'base');
});
