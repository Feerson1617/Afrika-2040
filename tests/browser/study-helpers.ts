import type { Page } from '@playwright/test';
/** Select a visible decision section before interacting; never inject answer values. */
export async function studyClick(
  page: Page,
  selector: string,
  mode: 'check' | 'click' | 'tap' = 'click',
) {
  const match = selector.match(
    /^#study-(proposal|goal|benefit|limit|weighted)-/,
  );
  if (match) {
    const part = ['proposal', 'goal'].includes(match[1])
      ? 'plan'
      : match[1] === 'benefit'
        ? 'benefit'
        : 'limit';
    const tab = page.locator('#study-panel-' + part);
    if (mode === 'tap') await tab.tap();
    else await tab.click();
  }
  if (mode === 'tap') await page.locator(selector).tap();
  else if (mode === 'check') await page.locator(selector).check();
  else await page.locator(selector).click();
}
