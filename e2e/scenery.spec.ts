import { expect, test, type Page } from '@playwright/test';
import sharp from 'sharp';
import { finishOnboarding, onboard } from './helpers';

/**
 * Words set straight onto photographs, measured as rendered. Each element's text is hidden,
 * whatever lies behind it is captured, and the text colour is checked against the brightest
 * 2% of those pixels (or the darkest, for dark text). Text shadows are left out, so this is
 * the worst case. The pages are the hardest photographs from a sweep of every scene at
 * every hour, in both themes and at phone and desktop widths (docs/QA.md).
 */

const AA = 4.5; // small labels over photographs (eyebrows, the date) and large titles (AAA large)
const AAA = 7; // reading and supporting text

/** The time zone in which it is now about `hour` o’clock, so the app picks that hour’s scene. */
function zoneAt(hour: number) {
  const now = new Date();
  let offset = Math.round(hour - (now.getUTCHours() + now.getUTCMinutes() / 60));
  while (offset > 14) offset -= 24;
  while (offset < -12) offset += 24;
  return offset === 0 ? 'Etc/GMT' : `Etc/GMT${offset > 0 ? '-' : '+'}${Math.abs(offset)}`;
}

const channel = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (r: number, g: number, b: number) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const byClass = (name: string) => `[class*="_${name}_"]`;

async function contrastBehind(page: Page, selector: string) {
  const el = page.locator(selector).first();
  await expect(el).toBeVisible();
  const box = await el.boundingBox();
  if (!box) throw new Error(`No box for ${selector}`);
  const color = await el.evaluate((e) => getComputedStyle(e).color);
  const hide = (show: boolean) =>
    el.evaluate((e, show) => {
      for (const n of [e as HTMLElement, ...e.querySelectorAll<HTMLElement>('*')]) {
        if (show) {
          n.style.removeProperty('color');
          n.style.removeProperty('text-shadow');
        } else {
          n.style.setProperty('color', 'transparent', 'important');
          n.style.setProperty('text-shadow', 'none', 'important');
        }
      }
    }, show);
  await hide(false);
  const png = await page.screenshot({ clip: box });
  await hide(true);

  const { data } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const behind: number[] = [];
  for (let i = 0; i < data.length; i += 3) behind.push(luminance(data[i], data[i + 1], data[i + 2]));
  behind.sort((a, b) => a - b);
  const [r, g, b] = (color.match(/[\d.]+/g) ?? []).map(Number);
  const text = luminance(r, g, b);
  const lightText = text > behind[behind.length >> 1];
  const worst = lightText ? behind[Math.floor(behind.length * 0.98)] : behind[Math.floor(behind.length * 0.02)];
  return (Math.max(text, worst) + 0.05) / (Math.min(text, worst) + 0.05);
}

async function settle(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1400); // the photograph fades in over its placeholder
}

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`photographs · ${colorScheme}`, () => {
    // Midday's meadow is the brightest sky behind the greeting and the wordmark.
    test.use({ colorScheme, timezoneId: zoneAt(13) });

    test('words on photographs keep their contrast', async ({ page }) => {
      const checks: string[] = [];
      const check = async (label: string, selector: string, need: number) => {
        const ratio = await contrastBehind(page, selector);
        if (ratio < need) checks.push(`${label}: ${ratio.toFixed(2)} < ${need}`);
      };

      await settle(page, '/welcome');
      await check('welcome wordmark', byClass('welcomeWordmark'), AA);

      await onboard(page);
      await finishOnboarding(page);
      await settle(page, '/today');
      await check('today date', `header ${byClass('date')}`, AA);
      await check('today greeting', `header ${byClass('greeting')}`, AA);
      await check('today “Add”', `${byClass('tray')} button:not([role="radio"]) ${byClass('name')}`, AAA);

      await page.getByRole('button', { name: /Read it aloud/ }).first().click();
      await page.waitForTimeout(1400);
      await check('reading scripture', `[role="dialog"] ${byClass('scripture')}`, AAA);
      await check('reading eyebrow', `[role="dialog"] ${byClass('kicker')}`, AA);
      await page.keyboard.press('Escape');

      // Swans on bright water, and a snowy pine: the hardest headers in the sweep.
      for (const path of ['/library/journeys/marriage-14', '/library/collection/advent', '/journal']) {
        await settle(page, path);
        await check(`${path} title`, byClass('bandTitle'), AA);
        await check(`${path} subtitle`, byClass('bandSubtitle'), AAA);
        if (path !== '/journal') await check(`${path} eyebrow`, byClass('bandEyebrow'), AA);
      }

      expect(checks).toEqual([]);
    });
  });
}
