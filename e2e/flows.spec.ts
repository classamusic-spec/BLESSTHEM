import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { finishOnboarding, onboard } from './helpers';

test('A · install → onboarding → add child → personalized blessing → mark as prayed', async ({ page }) => {
  await onboard(page, { name: 'Noah' });
  // The “aha”: a real blessing for Noah, before any account is requested.
  await expect(page.getByText('Speak this over Noah')).toBeVisible();
  await expect(page.locator('blockquote')).not.toBeEmpty();
  const verse = await page.locator('blockquote').innerText();
  await finishOnboarding(page);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Maya');
  // The same blessing carries into Today.
  await expect(page.locator('blockquote').first()).toHaveText(verse);
  await page.getByRole('button', { name: 'I prayed this' }).click();
  await expect(page.getByText('Covered in prayer today.').first()).toBeVisible();
  await expect(page.getByRole('radio', { name: /Noah, prayed for today/ })).toBeVisible();
});

test('B · open app tomorrow → receive a new blessing → add a reflection', async ({ page }) => {
  await onboard(page);
  await finishOnboarding(page);
  const first = await page.locator('blockquote').first().innerText();
  await page.getByRole('button', { name: 'I prayed this' }).click();

  // “Tomorrow”: everything recorded so far moves back one day, then the app reopens.
  await page.waitForFunction(() => (window as unknown as { __bt?: unknown }).__bt);
  await page.evaluate(() => {
    const { store } = (window as unknown as { __bt: { store: { getState(): { blessings: Array<{ date: string }> }; setState(s: object): void } } }).__bt;
    const shift = (key: string) => {
      const [y, m, d] = key.split('-').map(Number);
      const dt = new Date(y, m - 1, d - 1);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    };
    store.setState({ blessings: store.getState().blessings.map((b) => ({ ...b, date: shift(b.date) })) });
  });
  await page.reload();
  await expect(page.getByRole('button', { name: 'I prayed this' })).toBeVisible();
  const second = await page.locator('blockquote').first().innerText();
  expect(second).not.toBe(first);

  await page.getByRole('button', { name: 'I prayed this' }).click();
  await page.getByRole('button', { name: 'Add a reflection' }).click();
  await page.getByLabel('Your words').fill('He listened so closely tonight.');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.getByRole('link', { name: 'Journal' }).click();
  await expect(page.getByText('He listened so closely tonight.')).toBeVisible();
});

test('C · a hard day → search “friendship rejection” → choose a blessing → share it', async ({ page }) => {
  await onboard(page);
  await finishOnboarding(page);
  await page.goto('/library/search?q=friendship%20rejection');
  const passage = page.locator('a[href^="/library/entry/"]').first();
  await expect(passage).toBeVisible();
  await passage.click();
  await expect(page.getByText('Who is this blessing for?')).toBeVisible();
  await page.getByRole('button', { name: 'Share blessing' }).first().click();
  await expect(page.getByRole('dialog', { name: 'Share this blessing' })).toBeVisible();
  await expect(page.getByRole('img', { name: /Share card: .* over Noah\./ })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Only this line and the Scripture are shared.')).toBeVisible();
  // The parent decides whether a child’s name leaves the app.
  await page.getByRole('switch', { name: 'Show their name on the card' }).click();
  await expect(page.getByRole('img', { name: /Share card: .* over my son\./ })).toBeVisible({ timeout: 10_000 });
});

test('D · add a second child → choose their needs → switch between children', async ({ page }) => {
  await onboard(page);
  await finishOnboarding(page);
  await page.goto('/people/new');
  await page.getByLabel('First name').fill('Ella');
  await page.getByRole('button', { name: 'Daughter', exact: true }).click();
  await page.getByRole('button', { name: /Preschool/ }).click();
  await page.getByRole('button', { name: 'Faith', exact: true }).click();
  await page.getByRole('button', { name: 'Add to my people' }).click();
  await expect(page.getByRole('heading', { name: 'Ella' })).toBeVisible();
  await page.getByRole('link', { name: 'Today' }).click();
  await page.getByRole('radio', { name: 'Ella' }).click();
  await expect(page.getByText('For Ella', { exact: true })).toBeVisible();
  await page.getByRole('radio', { name: 'Noah' }).click();
  await expect(page.getByText('For Noah', { exact: true })).toBeVisible();
});

test('E · premium topic → elegant paywall → subscribe → content unlocks immediately', async ({ page }) => {
  await onboard(page);
  await finishOnboarding(page);
  await page.goto('/library/topic/anxiety');
  await expect(page.getByText('is part of Bless Them+')).toBeVisible();
  await page.getByRole('button', { name: 'Explore the full library' }).click();
  const paywall = page.getByRole('dialog', { name: 'Bless Them+' });
  await expect(paywall.getByText('Pray more intentionally for the people you love.')).toBeVisible();
  await expect(paywall.getByText(/\$34\.99/).first()).toBeVisible();
  await expect(paywall.getByText(/\$4\.99/).first()).toBeVisible();
  await expect(paywall.getByRole('button', { name: 'Continue free' })).toBeVisible();
  await paywall.getByRole('button', { name: 'Start my family plan' }).click();
  await expect(page.getByText('Welcome to Bless Them+')).toBeVisible();
  await expect(page.getByText('is part of Bless Them+')).toBeHidden({ timeout: 8_000 });
  await expect(page.locator('a[href^="/library/entry/anxiety-"]').first()).toBeVisible();
});

test('F · mark an old prayer as answered → a quiet moment of gratitude', async ({ page }) => {
  await onboard(page);
  await finishOnboarding(page);
  await page.getByRole('link', { name: 'Journal' }).click();
  await page.getByRole('button', { name: 'New' }).click();
  await page.getByLabel('Your words').fill('A kind friend at his new school.');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('link', { name: /A kind friend at his new school/ }).click();
  await page.getByRole('button', { name: 'Mark as answered' }).click();
  await expect(page.getByRole('dialog', { name: 'Remember this.' })).toBeVisible();
  await page.getByLabel(/How was it answered/).fill('He met Sam at lunch.');
  await page.getByRole('button', { name: 'Give thanks' }).click();
  await expect(page.getByRole('dialog', { name: 'Thank you, God.' })).toBeVisible();
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByText(/Answered ·/)).toBeVisible();
});

test('G · a reminder deep link lands directly on that person’s blessing', async ({ page }) => {
  await onboard(page, { name: 'Noah' });
  await finishOnboarding(page);
  await page.goto('/people/new');
  await page.getByLabel('First name').fill('Ella');
  await page.getByRole('button', { name: 'Daughter', exact: true }).click();
  await page.getByRole('button', { name: 'Add to my people' }).click();
  const ellaId = page.url().split('/people/')[1];
  await page.goto(`/today?person=${ellaId}&from=notification&kind=morning`);
  await expect(page.getByText('For Ella', { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/today$/);
});

test('accessibility · key screens have no serious axe violations', async ({ page }) => {
  const audit = async (label: string) => {
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${label}: ${v.id} — ${v.help} (${v.nodes.length})`)).toEqual([]);
  };
  await page.goto('/welcome');
  await page.waitForTimeout(1200);
  await audit('welcome');
  await onboard(page);
  await audit('preview');
  await finishOnboarding(page);
  await page.waitForTimeout(800);
  await audit('today');
  for (const path of ['/library', '/journal', '/people', '/settings', '/library/search?q=afraid']) {
    await page.goto(path);
    await page.waitForTimeout(900);
    await audit(path);
  }
});
