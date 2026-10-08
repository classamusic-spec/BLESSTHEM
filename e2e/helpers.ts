import { expect, type Page } from '@playwright/test';

/** Flow A’s first half: meaning first, account last. */
export async function onboard(page: Page, opts: { name?: string; topics?: string[] } = {}) {
  await page.goto('/welcome');
  await page.getByRole('button', { name: 'Begin' }).click();
  await page.getByRole('radio', { name: /My child\b/ }).click();
  await page.getByLabel('First name').fill(opts.name ?? 'Gabriel');
  await page.getByRole('button', { name: 'Son', exact: true }).click();
  await page.getByRole('button', { name: /Elementary/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  for (const t of opts.topics ?? ['Courage', 'Kindness']) await page.getByRole('button', { name: t, exact: true }).click();
  await page.getByRole('button', { name: 'Show me a blessing' }).click();
  await expect(page.getByRole('button', { name: 'I want this each day' })).toBeVisible({ timeout: 10_000 });
}

export async function finishOnboarding(page: Page, name = 'Maya') {
  await page.getByRole('button', { name: 'I want this each day' }).click();
  await page.getByLabel(/What should we call you/).fill(name);
  await page.getByRole('button', { name: 'Not now' }).click();
  await page.waitForURL('**/today**');
}
