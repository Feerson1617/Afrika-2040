import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

// Include both A and AA for every WCAG version supported by the project.
// A tag with no automated rule (currently wcag22a) is still intentional;
// an axe pass never certifies all success criteria or manual checks.
export const wcagAAndAA = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22a',
  'wcag22aa',
] as const;

export function auditAccessibility(page: Page) {
  return new AxeBuilder({ page }).withTags([...wcagAAndAA]).analyze();
}
